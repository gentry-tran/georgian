// Shuffle/sample helpers. All accept an optional `rng` (a () => [0,1) function)
// so sessions can be made deterministic/reproducible in tests and replays (§2.2).
// Default stays Math.random, so real users keep full variety.

// mulberry32 — a tiny seedable PRNG. Same seed → same stream.
export function makeRng(seed) {
  let s = seed >>> 0;
  return function () {
    s = (s + 0x6d2b79f5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// FNV-1a: hash a string to a 32-bit seed (so a lesson id can seed a session).
export function seedFrom(str) {
  let h = 2166136261 >>> 0;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

// Fisher–Yates shuffle that returns a new array (never mutates the input).
export function shuffle(array, rng = Math.random) {
  const copy = [...array];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

// Pick `count` random items from `array` (without replacement).
export function sample(array, count, rng = Math.random) {
  return shuffle(array, rng).slice(0, count);
}

// Pick one random item.
export function pick(array, rng = Math.random) {
  return array[Math.floor(rng() * array.length)];
}
