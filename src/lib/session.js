// Turns a lesson's raw data into an ordered list of exercise "items" of mixed
// types. Recognition first, then listening, speaking, building sentences,
// matching, and finally a dialogue reply — a speaking-forward progression.
import { shuffle, sample, makeRng, seedFrom } from "./shuffle";
import { speechSupported } from "./speech";
import { distractorPool } from "../data/curriculum";
import { emojiFor } from "./emoji";

const CHOICES = 4;

// Resolve an optional {seed} into an rng; falls back to Math.random for real play.
function rngFrom(opts) {
  const seed = opts && opts.seed;
  if (seed == null) return Math.random;
  return makeRng(typeof seed === "string" ? seedFrom(seed) : seed >>> 0);
}

// Build MC choices for a given answer, reading `field` off word objects.
function choicesFor(answerWord, pool, field, rng = Math.random) {
  const answer = answerWord[field];
  const seen = new Set([answer]);
  const candidates = pool.filter((w) => {
    if (seen.has(w[field])) return false;
    seen.add(w[field]);
    return true;
  });
  const distractors = sample(candidates, CHOICES - 1, rng).map((w) => w[field]);
  return shuffle([answer, ...distractors], rng);
}

function tokenize(phraseKa) {
  return phraseKa.split(/\s+/).filter(Boolean);
}

// Single-modality lessons (e.g. the alphabet) drill EVERY word with one exercise
// type instead of mixing. Order is shuffled; all letters are always included.
function buildModeSession(lesson, rng = Math.random) {
  const words = lesson.words || [];
  const pool = distractorPool(lesson);
  return shuffle(words, rng).map((w) => {
    const voice = w.say || w.ka; // letters are spoken by their NAME (natural voice)
    if (lesson.mode === "choose-ka") {
      return {
        type: "choose",
        prompt: w.tr,
        promptSub: w.en,
        answer: w.ka,
        choices: choicesFor(w, pool, "ka", rng),
        georgianChoices: true,
        speakOnCorrect: voice,
      };
    }
    if (lesson.mode === "listen-ka") {
      return {
        type: "listen",
        audio: voice,
        tr: w.tr,
        answer: w.ka,
        choices: choicesFor(w, pool, "ka", rng),
        georgianChoices: true,
      };
    }
    // choose-tr: see the Georgian letter, recall its sound
    return {
      type: "choose",
      prompt: w.ka,
      promptIsGeorgian: true,
      promptSpeak: voice, // 🔊 on the letter speaks its NAME
      answer: w.tr,
      choices: choicesFor(w, pool, "tr", rng),
      georgianChoices: false,
      speakOnShow: voice,
    };
  });
}

// Spaced-repetition review: quiz a sample of already-learned words with a mix of
// recognition, listening, and reverse-recognition. Distractors come from the
// whole review pool.
export function buildReviewSession(words, count = 12, opts = {}) {
  // Distractors come from the FULL learned-word pool (opts.pool), not just the
  // handful being quizzed — otherwise a small due-list with a shared English
  // gloss can't produce 4 distinct choices. Falls back to `words`.
  const pool = opts.pool && opts.pool.length >= words.length ? opts.pool : words;
  const rng = rngFrom(opts);
  const canListen = speechSupported();
  // words are pre-ordered by the SR scheduler; keep that order, just cap.
  return words.slice(0, Math.min(count, words.length)).map((w, i) => {
    const mode = i % 3;
    if (mode === 0) {
      return {
        type: "choose",
        srcKa: w.ka, // for spaced-repetition result recording
        prompt: w.en,
        promptSub: w.tr,
        answer: w.ka,
        choices: choicesFor(w, pool, "ka", rng),
        georgianChoices: true,
        speakOnCorrect: w.ka,
      };
    }
    if (mode === 1 && canListen) {
      return {
        type: "listen",
        srcKa: w.ka,
        audio: w.ka,
        tr: w.tr,
        answer: w.en,
        choices: choicesFor(w, pool, "en", rng),
      };
    }
    return {
      type: "choose",
      srcKa: w.ka,
      prompt: w.ka,
      promptIsGeorgian: true,
      answer: w.en,
      choices: choicesFor(w, pool, "en", rng),
      georgianChoices: false,
      speakOnShow: w.ka,
    };
  });
}

export function buildSession(lesson, opts = {}) {
  const rng = rngFrom(opts);
  if (lesson.mode) return buildModeSession(lesson, rng);

  const words = lesson.words || [];
  const phrases = lesson.phrases || [];
  const pool = distractorPool(lesson);
  const canListen = speechSupported();
  const items = [];

  // 1) Recognition — rotate through choose-ka / listen / choose-en.
  //    Each item is tagged with `wordKa` so ordering (§2.3) is assertable.
  words.forEach((w, i) => {
    const mode = i % 3;
    if (mode === 0) {
      items.push({
        type: "choose",
        wordKa: w.ka,
        prompt: w.en,
        promptSub: w.tr,
        promptEmoji: emojiFor(w.en), // visual grounding
        answer: w.ka,
        choices: choicesFor(w, pool, "ka", rng),
        georgianChoices: true,
        speakOnCorrect: w.ka,
      });
    } else if (mode === 1 && canListen) {
      items.push({
        type: "listen",
        wordKa: w.ka,
        audio: w.ka,
        tr: w.tr,
        answer: w.en,
        choices: choicesFor(w, pool, "en", rng),
      });
    } else {
      items.push({
        type: "choose",
        wordKa: w.ka,
        prompt: w.ka,
        promptIsGeorgian: true,
        answer: w.en,
        choices: choicesFor(w, pool, "en", rng),
        georgianChoices: false,
        speakOnShow: w.ka,
      });
    }
  });

  // 1b) Picture-match (visual grounding) for words that have an emoji.
  const picWords = words.filter((w) => emojiFor(w.en));
  sample(picWords, Math.min(2, picWords.length), rng).forEach((w) => {
    items.push({
      type: "picture",
      wordKa: w.ka,
      emoji: emojiFor(w.en),
      answer: w.ka,
      choices: choicesFor(w, pool, "ka", rng),
      speakOnCorrect: w.ka,
    });
  });

  // 2) Match round (pull up to 5 words so pairs stay readable). Pairs MUST have
  // unique en AND unique ka — a duplicate gloss makes matching ambiguous and
  // collides React keys (MatchPairs matches by en).
  const seenEn = new Set(), seenKa = new Set();
  const matchable = words.filter((w) => {
    if (seenEn.has(w.en) || seenKa.has(w.ka)) return false;
    seenEn.add(w.en);
    seenKa.add(w.ka);
    return true;
  });
  if (matchable.length >= 4) {
    items.splice(
      Math.min(3, items.length),
      0,
      {
        type: "match",
        pairs: sample(matchable, Math.min(5, matchable.length), rng).map((w) => ({
          en: w.en,
          ka: w.ka,
          tr: w.tr,
        })),
      }
    );
  }

  // 3) Speaking cards for the lesson's key phrases (fallback: words).
  const speakSource = phrases.length ? phrases : words;
  sample(speakSource, Math.min(3, speakSource.length), rng).forEach((p) => {
    items.push({ type: "speak", wordKa: p.ka, en: p.en, ka: p.ka, tr: p.tr });
  });

  // 3b) Typing (dictation): hear a word, type its transliteration. Standard
  // format; uses Latin so no Georgian keyboard is needed.
  if (canListen && words.length) {
    sample(words, Math.min(2, words.length), rng).forEach((w) => {
      items.push({
        type: "type",
        wordKa: w.ka,
        audio: w.ka,
        answer: w.tr,
        reveal: `${w.ka} (${w.en})`,
      });
    });
  }

  // 4) Build-the-sentence for short phrases.
  phrases
    .filter((p) => {
      const n = tokenize(p.ka).length;
      return n >= 2 && n <= 5;
    })
    .slice(0, 2)
    .forEach((p) => {
      const answer = tokenize(p.ka);
      items.push({
        type: "build",
        wordKa: p.ka,
        en: p.en,
        tr: p.tr,
        answer,
        tokens: shuffle(answer, rng),
      });
    });

  // 5) Dialogue reply — the payoff: pick your line in a real conversation.
  if (lesson.dialogue && lesson.dialogue.length >= 2) {
    const d = lesson.dialogue;
    const askIndex = d.length - 1;
    const answerLine = d[askIndex];
    const otherLines = [
      ...phrases.map((p) => p.ka),
      ...d.map((l) => l.ka),
    ].filter((ka) => ka !== answerLine.ka);
    const distractors = sample([...new Set(otherLines)], CHOICES - 1, rng);
    items.push({
      type: "dialogue",
      lines: d.slice(0, askIndex),
      speaker: answerLine.who,
      en: answerLine.en,
      answer: answerLine.ka,
      choices: shuffle([answerLine.ka, ...distractors], rng),
    });
  }

  // Tiered difficulty: recognition (tap buttons, both directions, match) first —
  // easiest — then production (typing, building), then application (speaking,
  // dialogue). A stable sort keeps within-tier order.
  const TIER = { picture: 0, choose: 0, listen: 0, match: 0, type: 1, build: 2, speak: 3, dialogue: 3 };
  const sorted = items
    .map((it, i) => [it, i])
    .sort((a, b) => (TIER[a[0].type] ?? 5) - (TIER[b[0].type] ?? 5) || a[1] - b[1])
    .map(([it]) => it);

  // Comprehensible-input guard (graded difficulty): keep recognition — the
  // tap-to-answer, understandable items — at >= 50% of the session, so the
  // learner always comprehends most of it. The dialogue payoff is always kept;
  // extra speak/build/type items are trimmed to stay within budget.
  const recognition = sorted.filter((it) => TIER[it.type] === 0);
  const dialogue = sorted.filter((it) => it.type === "dialogue");
  const otherProd = sorted.filter((it) => TIER[it.type] !== 0 && it.type !== "dialogue");
  const budget = Math.max(0, recognition.length - dialogue.length);
  return [...recognition, ...otherProd.slice(0, budget), ...dialogue];
}
