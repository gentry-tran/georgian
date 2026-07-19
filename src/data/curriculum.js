// Assembles the CEFR roadmap (A1 → A2 → B1, geofl.ge-aligned) and exposes
// helpers for ordering, unlocking, and distractor pools.
import a1 from "./a1";
import a2 from "./a2";
import a2plus from "./a2plus";
import b1 from "./b1";
import b2 from "./b2";
import b2plus from "./b2plus";
import c1 from "./c1";
import { isLessonComplete } from "../lib/progress";

export const LEVELS = [a1, a2, a2plus, b1, b2, b2plus, c1];

// Flattened, ordered list of every lesson with back-references to its unit and
// level, plus the unit's full word pool (used for exercise distractors).
export const LESSONS = [];
for (const level of LEVELS) {
  for (const unit of level.units) {
    const unitWords = unit.lessons.flatMap((l) => l.words || []);
    for (const lesson of unit.lessons) {
      const enriched = {
        ...lesson,
        levelId: level.id,
        cefr: level.cefr,
        unitId: unit.id,
        unitTitle: unit.title,
        unitWords,
      };
      lesson._ref = enriched; // let the roadmap reuse the enriched object
      LESSONS.push(enriched);
    }
  }
}

const LESSON_INDEX = new Map(LESSONS.map((l, i) => [l.id, i]));

export function getLesson(id) {
  const i = LESSON_INDEX.get(id);
  return i === undefined ? null : LESSONS[i];
}

export function nextLessonId(id) {
  const i = LESSON_INDEX.get(id);
  if (i === undefined || i + 1 >= LESSONS.length) return null;
  return LESSONS[i + 1].id;
}

// A lesson is unlocked if it's the very first one, or the previous lesson in
// the roadmap has been completed at least once. Simple, linear, always-clear.
export function isLessonUnlocked(id) {
  const i = LESSON_INDEX.get(id);
  if (i === undefined) return false;
  if (i === 0) return true;
  return isLessonComplete(LESSONS[i - 1].id);
}

// Total lessons + how many are complete (for the header progress bar).
export function overallProgress() {
  const done = LESSONS.filter((l) => isLessonComplete(l.id)).length;
  return { done, total: LESSONS.length };
}

// Unique vocabulary from completed lessons (excluding the alphabet, whose lone
// letters have no standalone audio) — the pool for spaced-repetition review.
export function reviewWords() {
  const seen = new Set();
  const out = [];
  for (const l of LESSONS) {
    if (l.kind === "alphabet") continue;
    if (!isLessonComplete(l.id)) continue;
    for (const w of l.words || []) {
      if (!seen.has(w.ka)) {
        seen.add(w.ka);
        out.push(w);
      }
    }
  }
  return out;
}

// Lesson ids that come before `id` in the roadmap (used by the level-select
// onboarding to mark earlier lessons as already-known).
export function lessonsBefore(id) {
  const i = LESSON_INDEX.get(id);
  if (i === undefined) return [];
  return LESSONS.slice(0, i).map((l) => l.id);
}

// Distractor pool for a lesson: prefer siblings in the same unit so options are
// the same "shape" (letters with letters, words with words).
export function distractorPool(lesson) {
  const pool = lesson.unitWords && lesson.unitWords.length >= 6
    ? lesson.unitWords
    : lesson.words;
  return pool;
}
