// Meme reactions. Auto-loads every image in assets/memes (local cat gifs +
// CC-licensed cat photos from Wikimedia — see memes-credits.md). Happy cats
// celebrate correct answers; grumpy cats react to misses. Captions are original.
import { pick } from "./shuffle";

function loadAll() {
  try {
    // webpack: pull in every image in the memes folder automatically.
    const ctx = require.context("../assets/memes", false, /\.(gif|jpe?g|png|webp)$/);
    return ctx.keys().map((k) => ({ key: k.toLowerCase(), src: ctx(k) }));
  } catch (e) {
    return []; // non-webpack (e.g. Jest) — memes just don't render in tests
  }
}

const ALL = loadAll();
const isGrumpy = (k) => /(grumpy|mad|no-cat|nope|avoidance|angry|hiss|sad)/.test(k);

export const GRUMPY_MEMES = ALL.filter((m) => isGrumpy(m.key)).map((m) => m.src);
export const HAPPY_MEMES = ALL.filter((m) => !isGrumpy(m.key)).map((m) => m.src);

// Short bursts of encouragement, English with a splash of Georgian.
export const CHEERS = [
  "ყოჩაღ! (Well done!)",
  "Perfect! სრულყოფილი!",
  "You're on fire! 🔥",
  "დიდებულია! (Excellent!)",
  "Nailed it!",
  "ბრავო! (Bravo!)",
  "Keep it up!",
  "მაგარი ხარ! (You're great!)",
  "The cat approves. 🐈",
  "Georgian wizard! 🧙",
  "Chef's kiss. 😽",
  "Unstoppable!",
  "Tbilisi would be proud. 🇬🇪",
  "Big brain energy!",
  "სუპერ! (Super!)",
  "You ate that. No crumbs. 🍽️",
  "Absolute legend!",
  "That was purr-fect. 🐾",
  "ჭკვიანი ხარ! (You're clever!)",
  "10/10 cats agree.",
];

export const NUDGES = [
  "Almost! Try again.",
  "Not quite — you've got this.",
  "Close one!",
  "Shake it off, next try.",
  "The cat believes in you.",
  "Even the cat blinked. Retry. 😼",
  "Plot twist! Not that one.",
  "Nope-cat says try again.",
];

export const COMBO_CHEERS = [
  "🔥 3 in a row!",
  "⚡ 5 streak! Unstoppable!",
  "🌟 On a roll!",
  "🏆 Combo master!",
  "🚀 To the moon!",
  "😻 The cats are cheering!",
  "🎉 Streak fever!",
];

export const happyMeme = () => pick(HAPPY_MEMES);
export const grumpyMeme = () => pick(GRUMPY_MEMES);
export const cheer = () => pick(CHEERS);
export const nudge = () => pick(NUDGES);
