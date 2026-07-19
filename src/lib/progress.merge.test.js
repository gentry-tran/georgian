// Property-based tests for the progress merge (§1.4): merge is a CRDT-ish join,
// so we assert its algebra — commutativity, idempotence, associativity — plus the
// safety invariant that a merge never lowers a star count or loses a day. A seeded
// PRNG generates hundreds of random states; these catch reconciliation bugs no
// hand-picked example would.
import { merge } from "./progress";

// tiny seedable PRNG (mulberry32) so failures are reproducible
function rng(seed) {
  return function () {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function randState(r) {
  const lessons = {};
  const nLessons = Math.floor(r() * 5);
  for (let i = 0; i < nLessons; i++) {
    const id = `L${Math.floor(r() * 6)}`;
    const plays = {};
    const nDev = Math.floor(r() * 3);
    for (let d = 0; d < nDev; d++) plays[`dev${Math.floor(r() * 3)}`] = Math.floor(r() * 10);
    lessons[id] = {
      stars: Math.floor(r() * 4),
      bestAccuracy: Math.round(r() * 100) / 100,
      plays,
    };
  }
  const days = {}; // device-keyed buckets (v4)
  const nDays = Math.floor(r() * 5);
  for (let i = 0; i < nDays; i++) {
    const bucket = {};
    const nDev = 1 + Math.floor(r() * 2);
    for (let d = 0; d < nDev; d++) bucket[`dev${Math.floor(r() * 3)}`] = Math.floor(r() * 60);
    days[`2026-07-${10 + Math.floor(r() * 6)}`] = bucket;
  }
  const words = {}; // Leitner records (LWW on lastReview, total-order tie-break)
  const nWords = Math.floor(r() * 4);
  for (let i = 0; i < nWords; i++) {
    words[`W${Math.floor(r() * 5)}`] = {
      box: Math.floor(r() * 5),
      lastReview: `2026-07-${10 + Math.floor(r() * 6)}`,
      lapses: Math.floor(r() * 3),
      due: `2026-08-${1 + Math.floor(r() * 9)}`,
    };
  }
  return { schemaVersion: 4, lessons, days, words, onboarded: r() > 0.5 };
}

// canonical stringify (sorted keys) for structural equality
function canon(s) {
  const m = merge(s, s); // normalize + sort via merge’s Set iteration is not sorted; sort here
  const sortObj = (o) =>
    Object.keys(o)
      .sort()
      .reduce((acc, k) => {
        acc[k] = o[k] && typeof o[k] === "object" && !Array.isArray(o[k]) ? sortObj(o[k]) : o[k];
        return acc;
      }, {});
  return JSON.stringify(sortObj(m));
}

const R = rng(1337);
const states = Array.from({ length: 60 }, () => randState(R));

describe("merge algebra (property-based)", () => {
  test("commutative: merge(a,b) == merge(b,a)", () => {
    for (const a of states) {
      for (const b of states.slice(0, 15)) {
        expect(canon(merge(a, b))).toBe(canon(merge(b, a)));
      }
    }
  });

  test("idempotent: merge(a,a) == a", () => {
    for (const a of states) {
      expect(canon(merge(a, a))).toBe(canon(a));
    }
  });

  test("associative: merge(merge(a,b),c) == merge(a,merge(b,c))", () => {
    for (let i = 0; i < 20; i++) {
      const a = states[i], b = states[(i + 7) % states.length], c = states[(i + 13) % states.length];
      expect(canon(merge(merge(a, b), c))).toBe(canon(merge(a, merge(b, c))));
    }
  });

  test("safety: merge never lowers a star or a day's total", () => {
    const daySum = (bucket) => Object.values(bucket || {}).reduce((x, y) => x + y, 0);
    for (const a of states) {
      for (const b of states.slice(0, 15)) {
        const m = merge(a, b);
        for (const [id, l] of Object.entries(a.lessons)) {
          expect(m.lessons[id].stars).toBeGreaterThanOrEqual(l.stars);
        }
        for (const d of Object.keys(a.days)) {
          expect(daySum(m.days[d])).toBeGreaterThanOrEqual(daySum(a.days[d]));
        }
      }
    }
  });

  // Fable's edge cases: the property generator overlaps key spaces, so it never
  // hits disjoint keys / missing fields / ties. These target those directly.
  test("disjoint keys + missing fields never produce NaN or lower a value", () => {
    const A = { schemaVersion: 4, lessons: { A1: { stars: 3, bestAccuracy: 0.9, plays: { d: 2 } } }, days: { "2026-07-17": { d: 30 } }, words: {}, onboarded: false };
    const B = { schemaVersion: 4, lessons: { B1: { stars: 2 } }, days: { "2026-07-18": { e: 10 } }, words: {}, onboarded: false }; // B1 missing bestAccuracy/plays
    const m = merge(A, B);
    expect(m.lessons.A1.stars).toBe(3);
    expect(m.lessons.B1.stars).toBe(2);
    expect(Number.isNaN(m.lessons.B1.bestAccuracy)).toBe(false); // coerced, not NaN
    expect(m.lessons.A1.stars).toBeGreaterThanOrEqual(A.lessons.A1.stars); // never lowered
    // days from both, no NaN
    expect(Object.values(m.days).every((b) => Object.values(b).every((v) => !Number.isNaN(v)))).toBe(true);
  });

  // Fable #3: freeze the comparator invariant structurally. The words LWW tie-break
  // reads exactly {lastReview, box, lapses, due}. If a future field (ease/leech) is
  // added to a word record but NOT to the comparator, order stops being total and
  // merge silently loses commutativity — this test fails first.
  test("word record field-set === merge comparator field-set (guards future drift)", () => {
    const COMPARATOR_FIELDS = ["box", "due", "lapses", "lastReview"].sort();
    const st = { schemaVersion: 4, lessons: {}, days: {}, words: { w: { box: 1, due: "2026-07-20", lastReview: "2026-07-17", lapses: 0 } }, onboarded: false };
    const rec = merge(st, {}).words.w; // normalized record
    expect(Object.keys(rec).sort()).toEqual(COMPARATOR_FIELDS);
  });

  test("word records that tie on all compared fields merge deterministically both ways", () => {
    const rec = { box: 2, due: "2026-07-20", lastReview: "2026-07-17", lapses: 1 };
    const A = { schemaVersion: 4, lessons: {}, days: {}, words: { w: { ...rec } }, onboarded: false };
    const B = { schemaVersion: 4, lessons: {}, days: {}, words: { w: { ...rec } }, onboarded: false };
    expect(JSON.stringify(merge(A, B).words.w)).toBe(JSON.stringify(merge(B, A).words.w));
    expect(merge(A, B).words.w).toEqual(rec);
  });

  test("garbage / null inputs normalize instead of throwing", () => {
    expect(() => merge(null, undefined)).not.toThrow();
    expect(merge(null, undefined)).toEqual({ schemaVersion: 4, lessons: {}, days: {}, words: {}, onboarded: false });
    expect(() => merge({ lessons: "nope", days: 5, words: [] }, {})).not.toThrow();
  });

  test("bug1: cross-device same-day practice SUMS; same-device re-sync is idempotent", () => {
    const day = "2026-07-16";
    const A = { schemaVersion: 4, lessons: {}, days: { [day]: { dA: 30 } }, words: {}, onboarded: false };
    const B = { schemaVersion: 4, lessons: {}, days: { [day]: { dB: 20 } }, words: {}, onboarded: false };
    expect(merge(A, B).days[day]).toEqual({ dA: 30, dB: 20 }); // 50 total, not 30
    // re-syncing the same device's day keeps max (no double-count)
    const A2 = { schemaVersion: 4, lessons: {}, days: { [day]: { dA: 30 } }, words: {}, onboarded: false };
    expect(merge(A, A2).days[day]).toEqual({ dA: 30 });
  });

  test("plays are grow-only per device (re-sync can't double-count)", () => {
    const a = { schemaVersion: 2, lessons: { L1: { stars: 1, bestAccuracy: 1, plays: { d1: 3 } } }, days: {}, onboarded: false };
    // merging the same state repeatedly keeps plays stable (idempotent), not summed
    const once = merge(a, a);
    const twice = merge(once, a);
    expect(twice.lessons.L1.plays.d1).toBe(3);
    // different devices union
    const b = { schemaVersion: 2, lessons: { L1: { stars: 1, bestAccuracy: 1, plays: { d2: 5 } } }, days: {}, onboarded: false };
    expect(merge(a, b).lessons.L1.plays).toEqual({ d1: 3, d2: 5 });
  });
});
