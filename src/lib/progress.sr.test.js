// Spaced-repetition integration in the progress store (§2.1): recording results
// advances Leitner state, due-ordering surfaces the right words, and word records
// merge last-writer-wins on lastReview (so multi-device sync stays sane).
import { recordWordResult, wordState, dueReviewWords, merge, resetProgress } from "./progress";

beforeEach(() => {
  localStorage.clear();
  resetProgress();
});

test("recordWordResult advances and persists a word's Leitner box", () => {
  recordWordResult("წიგნი", true, new Date(2026, 6, 16));
  expect(wordState("წიგნი").box).toBe(1);
  recordWordResult("წიგნი", true, new Date(2026, 6, 17));
  expect(wordState("წიგნი").box).toBe(2);
  recordWordResult("წიგნი", false, new Date(2026, 6, 18));
  expect(wordState("წიგნი").box).toBe(0);
  expect(wordState("წიგნი").lapses).toBe(1);
});

test("dueReviewWords puts never-studied and overdue words first", () => {
  const cands = [{ ka: "ა" }, { ka: "ბ" }, { ka: "გ" }];
  recordWordResult("ბ", true, new Date(2026, 6, 16)); // ბ now due 2026-07-17 (not due on the 16th)
  const ordered = dueReviewWords(cands, new Date(2026, 6, 16), 12).map((w) => w.ka);
  // ა and გ (never studied) come before ბ (scheduled into the future)
  expect(ordered.indexOf("ბ")).toBe(ordered.length - 1);
  expect(ordered.slice(0, 2).sort()).toEqual(["ა", "გ"]);
});

test("word records merge last-writer-wins on lastReview", () => {
  const older = { schemaVersion: 3, lessons: {}, days: {}, words: { ა: { box: 3, due: "2026-07-30", lastReview: "2026-07-10", lapses: 0 } }, onboarded: false };
  const newer = { schemaVersion: 3, lessons: {}, days: {}, words: { ა: { box: 0, due: "2026-07-16", lastReview: "2026-07-16", lapses: 2 } }, onboarded: false };
  const m = merge(older, newer);
  expect(m.words["ა"].lastReview).toBe("2026-07-16"); // newer wins even though box is lower
  expect(m.words["ა"].box).toBe(0);
  // commutative
  expect(merge(newer, older).words["ა"].lastReview).toBe("2026-07-16");
});
