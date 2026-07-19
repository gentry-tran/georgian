// Exercise-integrity audit over EVERY lesson's generated session (seeded so it's
// deterministic). Catches malformed exercises: wrong choice count, duplicate
// choices, answer missing from choices, degenerate match/build items.
import { LESSONS, getLesson } from "../data/curriculum";
import { buildSession, buildReviewSession } from "./session";

function audit(session, id) {
  const problems = [];
  session.forEach((it, i) => {
    if (["choose", "listen", "picture"].includes(it.type)) {
      const ch = it.choices || [];
      if (ch.length !== 4) problems.push(`${id}#${i} ${it.type}: ${ch.length} choices (want 4)`);
      if (new Set(ch).size !== ch.length) problems.push(`${id}#${i} ${it.type}: duplicate choices`);
      if (!ch.includes(it.answer)) problems.push(`${id}#${i} ${it.type}: answer not in choices`);
    }
    if (it.type === "dialogue") {
      const ch = it.choices || [];
      if (!ch.includes(it.answer)) problems.push(`${id}#${i} dialogue: answer not in choices`);
      if (new Set(ch).size !== ch.length) problems.push(`${id}#${i} dialogue: duplicate choices`);
    }
    if (it.type === "match") {
      const pairs = it.pairs || [];
      if (pairs.length < 2) problems.push(`${id}#${i} match: <2 pairs`);
      if (new Set(pairs.map((p) => p.en)).size !== pairs.length) problems.push(`${id}#${i} match: duplicate en`);
      if (new Set(pairs.map((p) => p.ka)).size !== pairs.length) problems.push(`${id}#${i} match: duplicate ka`);
    }
    if (it.type === "build") {
      const key = (a) => [...a].sort().join("|");
      if (key(it.tokens) !== key(it.answer)) problems.push(`${id}#${i} build: tokens != answer multiset`);
    }
  });
  return problems;
}

test("every lesson builds a well-formed session (seeded)", () => {
  const all = [];
  for (const L of LESSONS) {
    const session = buildSession(getLesson(L.id), { seed: L.id });
    all.push(...audit(session, L.id));
  }
  expect(all).toEqual([]);
});

test("review sessions are well-formed even when English glosses collide", () => {
  // pull the whole vocabulary (skip the alphabet, whose lone letters aren't reviewed)
  const seen = new Set();
  const words = [];
  for (const L of LESSONS) {
    if (L.kind === "alphabet") continue;
    for (const w of getLesson(L.id).words || []) {
      if (!seen.has(w.ka)) { seen.add(w.ka); words.push(w); }
    }
  }
  const bad = [];
  for (const seed of ["r1", "r2", "r3"]) {
    for (const it of buildReviewSession(words, 12, { seed })) {
      const ch = it.choices || [];
      if (ch.length !== 4 || new Set(ch).size !== 4 || !ch.includes(it.answer)) {
        bad.push(`${seed} ${it.type}: ${JSON.stringify(ch)} ans=${it.answer}`);
      }
    }
  }
  expect(bad).toEqual([]);
});

test("small due-list with a shared English gloss still gets 4 choices from the full pool", () => {
  // regression: choose-ka→en / listen items draw distractors from the ENGLISH
  // field; a tiny quiz list with a duplicate gloss (yes/yes) can't self-supply 4
  // distinct options, so distractors must come from the full learned-word pool.
  const dueList = [
    { ka: "დიახ", tr: "diakh", en: "yes" },
    { ka: "კი", tr: "ki", en: "yes" }, // duplicate gloss on purpose
    { ka: "არა", tr: "ara", en: "no" },
    { ka: "იქნებ", tr: "ikneb", en: "maybe" },
  ];
  // full learned vocabulary (the real distractor pool)
  const pool = [];
  for (const L of LESSONS) {
    if (L.kind === "alphabet") continue;
    for (const w of getLesson(L.id).words || []) pool.push(w);
  }
  const bad = [];
  for (const seed of ["p1", "p2", "p3"]) {
    for (const it of buildReviewSession(dueList, 12, { seed, pool })) {
      const ch = it.choices || [];
      if (ch.length !== 4 || new Set(ch).size !== 4 || !ch.includes(it.answer)) {
        bad.push(`${seed} ${it.type}: ${JSON.stringify(ch)} ans=${it.answer}`);
      }
    }
  }
  expect(bad).toEqual([]);
});

test("every multiple-choice item has exactly 4 distinct choices incl. the answer", () => {
  // stronger: run each lesson under several seeds to shake out pool-size edge cases
  const bad = [];
  for (const L of LESSONS) {
    for (const seed of ["a", "b", "c", "d", "e"]) {
      for (const it of buildSession(getLesson(L.id), { seed: `${L.id}-${seed}` })) {
        if (["choose", "listen", "picture"].includes(it.type)) {
          const ch = it.choices || [];
          if (ch.length !== 4 || new Set(ch).size !== 4 || !ch.includes(it.answer)) {
            bad.push(`${L.id}/${seed} ${it.type}: ${JSON.stringify(ch)} ans=${it.answer}`);
          }
        }
      }
    }
  }
  expect(bad).toEqual([]);
});
