// Leitner spaced repetition (§2.1). Five boxes with growing intervals; a correct
// answer promotes a word one box, an incorrect answer sends it back to box 0.
// Pure and date-injectable so the scheduler is fully testable with a fake clock.
//
// A word's review record: { box, due, lastReview, lapses } (all merge-safe; the
// progress store merges records last-writer-wins on `lastReview`, day-granular).

export const INTERVALS = [0, 1, 3, 7, 21]; // days per box
export const MAX_BOX = INTERVALS.length - 1;

// "YYYY-MM-DD" (local) for a Date.
export function dayKey(date) {
  const y = date.getFullYear();
  const m = `${date.getMonth() + 1}`.padStart(2, "0");
  const d = `${date.getDate()}`.padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function addDays(isoDay, n) {
  const d = new Date(`${isoDay}T00:00:00`);
  d.setDate(d.getDate() + n);
  return dayKey(d);
}

// Advance a word's schedule given a correct/incorrect answer on `today` (ISO day).
export function schedule(prev, correct, today) {
  const hadRecord = !!prev;
  const prevBox = prev?.box ?? 0;
  const box = correct ? Math.min(prevBox + 1, MAX_BOX) : 0;
  const lapses = (prev?.lapses ?? 0) + (!correct && hadRecord ? 1 : 0);
  return { box, due: addDays(today, INTERVALS[box]), lastReview: today, lapses };
}

// A word is due if it has no record yet (never studied) or its due day has arrived.
export function isDue(rec, today) {
  return !rec || rec.due <= today;
}

// Overdue-ness in "sort earlier" order: unstudied first (-Infinity-ish), then by due day.
export function dueRank(rec) {
  return rec ? rec.due : ""; // "" sorts before any real date → unstudied words first
}
