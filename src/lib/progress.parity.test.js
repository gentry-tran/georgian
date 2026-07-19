// Parity guard: the client merge (progress.js, ESM) and the server merge
// (mergeCore.js, CJS — used by server.js) MUST be byte-for-byte equivalent, since
// the toolchain won't let us share one file. If they ever diverge, this fails.
import { merge as clientMerge } from "./progress";
// eslint-disable-next-line @typescript-eslint/no-var-requires
const { merge: serverMerge } = require("./mergeCore");

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
  for (let i = 0; i < Math.floor(r() * 4); i++) {
    const plays = {};
    for (let d = 0; d < Math.floor(r() * 3); d++) plays[`dev${Math.floor(r() * 3)}`] = Math.floor(r() * 9);
    lessons[`L${Math.floor(r() * 5)}`] = { stars: Math.floor(r() * 4), bestAccuracy: Math.round(r() * 100) / 100, plays };
  }
  const days = {};
  for (let i = 0; i < Math.floor(r() * 4); i++) {
    const b = {};
    for (let d = 0; d < 1 + Math.floor(r() * 2); d++) b[`dev${Math.floor(r() * 3)}`] = Math.floor(r() * 50);
    days[`2026-07-${10 + Math.floor(r() * 6)}`] = b;
  }
  const words = {};
  for (let i = 0; i < Math.floor(r() * 3); i++) {
    words[`W${Math.floor(r() * 4)}`] = {
      box: Math.floor(r() * 5), lastReview: `2026-07-${10 + Math.floor(r() * 6)}`,
      lapses: Math.floor(r() * 3), due: `2026-08-${1 + Math.floor(r() * 9)}`,
    };
  }
  return { schemaVersion: 4, lessons, days, words, onboarded: r() > 0.5 };
}

test("client and server merges produce identical results", () => {
  const r = rng(24601);
  for (let i = 0; i < 100; i++) {
    const a = randState(r), b = randState(r);
    expect(JSON.stringify(serverMerge(a, b))).toBe(JSON.stringify(clientMerge(a, b)));
  }
});
