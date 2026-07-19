// Pure, dependency-free CRDT merge for the progress blob. Written as a CommonJS
// module so BOTH the browser client (src/lib/progress.js) and the Node sync server
// (server.js) use the EXACT same merge — the client and server can never disagree.
//
// Blob shape (schema v4):
//   { schemaVersion, lessons:{id:{stars,bestAccuracy,plays:{device:n}}},
//     days:{'YYYY-MM-DD':{device:pts}}, words:{key:{box,due,lastReview,lapses}},
//     onboarded }
// Every field is a join that is commutative, idempotent, and associative.

const SCHEMA_VERSION = 4;

function emptyState() {
  return { schemaVersion: SCHEMA_VERSION, lessons: {}, days: {}, words: {}, onboarded: false };
}

// Coerce any partially-shaped / older-shaped object into a valid v4 state.
function normalize(s) {
  const out = emptyState();
  if (s && typeof s === "object") {
    if (s.lessons && typeof s.lessons === "object") {
      for (const [id, l] of Object.entries(s.lessons)) {
        if (!l || typeof l !== "object") continue;
        out.lessons[id] = {
          stars: Number(l.stars) || 0,
          bestAccuracy: Number(l.bestAccuracy) || 0,
          plays: l.plays && typeof l.plays === "object" ? { ...l.plays } : {},
        };
      }
    }
    if (s.days && typeof s.days === "object") {
      for (const [d, v] of Object.entries(s.days)) {
        const bucket = {};
        if (typeof v === "number") bucket._v3 = Number(v) || 0; // tolerate pre-v4
        else if (v && typeof v === "object") {
          for (const [dev, pts] of Object.entries(v)) bucket[dev] = Number(pts) || 0;
        }
        out.days[d] = bucket;
      }
    }
    if (s.words && typeof s.words === "object") {
      for (const [ka, r] of Object.entries(s.words)) {
        if (!r || typeof r !== "object") continue;
        out.words[ka] = {
          box: Number(r.box) || 0,
          due: String(r.due || ""),
          lastReview: String(r.lastReview || ""),
          lapses: Number(r.lapses) || 0,
        };
      }
    }
    out.onboarded = !!s.onboarded;
  }
  return out;
}

function merge(a, b) {
  const A = normalize(a);
  const B = normalize(b);
  const out = emptyState();

  // lessons: per-id max stars / max bestAccuracy / per-device max plays
  for (const id of new Set([...Object.keys(A.lessons), ...Object.keys(B.lessons)])) {
    const la = A.lessons[id] || { stars: 0, bestAccuracy: 0, plays: {} };
    const lb = B.lessons[id] || { stars: 0, bestAccuracy: 0, plays: {} };
    const plays = {};
    for (const dev of new Set([...Object.keys(la.plays), ...Object.keys(lb.plays)])) {
      plays[dev] = Math.max(la.plays[dev] || 0, lb.plays[dev] || 0);
    }
    out.lessons[id] = {
      stars: Math.max(la.stars, lb.stars),
      bestAccuracy: Math.max(la.bestAccuracy, lb.bestAccuracy),
      plays,
    };
  }

  // days: per-day, per-device max (grow-only; summed across devices for xp)
  for (const d of new Set([...Object.keys(A.days), ...Object.keys(B.days)])) {
    const da = A.days[d] || {}, dbb = B.days[d] || {};
    const bucket = {};
    for (const dev of new Set([...Object.keys(da), ...Object.keys(dbb)])) {
      bucket[dev] = Math.max(da[dev] || 0, dbb[dev] || 0);
    }
    out.days[d] = bucket;
  }

  // words (Leitner): last-writer-wins on a TOTAL order (lastReview, box, lapses,
  // due). INVARIANT: `key` MUST list EVERY word field — the tuple covering all
  // fields is what makes a full-tuple tie mean "identical record." The final
  // stringify compare resolves any residual tie DETERMINISTICALLY and
  // independently of argument order (the client merges local-first, the server
  // existing-first), so if a field is ever added and omitted from `key`, the two
  // sides still pick the same winner instead of oscillating across devices.
  const key = (r) => [r.lastReview, r.box, r.lapses, r.due];
  const gte = (x, y) => {
    const kx = key(x), ky = key(y);
    for (let i = 0; i < kx.length; i++) {
      if (kx[i] === ky[i]) continue;
      return kx[i] > ky[i];
    }
    return JSON.stringify(x) >= JSON.stringify(y);
  };
  for (const ka of new Set([...Object.keys(A.words), ...Object.keys(B.words)])) {
    const ra = A.words[ka], rb = B.words[ka];
    if (!ra) out.words[ka] = rb;
    else if (!rb) out.words[ka] = ra;
    else out.words[ka] = gte(ra, rb) ? ra : rb;
  }

  out.onboarded = A.onboarded || B.onboarded;
  return out;
}

module.exports = { SCHEMA_VERSION, emptyState, normalize, merge };
