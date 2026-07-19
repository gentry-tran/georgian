// Leitner scheduler tests (§2.1) — fast-forward a fake clock through intervals.
import { schedule, isDue, INTERVALS, MAX_BOX, dayKey } from "./leitner";

test("first correct answer schedules box 1 (1 day out)", () => {
  const r = schedule(null, true, "2026-07-16");
  expect(r.box).toBe(1);
  expect(r.due).toBe("2026-07-17"); // INTERVALS[1] = 1
  expect(r.lastReview).toBe("2026-07-16");
  expect(r.lapses).toBe(0);
});

test("correct answers promote through the boxes with growing intervals", () => {
  let r = null;
  let day = "2026-07-16";
  const seen = [];
  for (let i = 0; i < 6; i++) {
    r = schedule(r, true, day);
    seen.push(r.box);
    day = r.due; // study exactly when due
  }
  expect(seen).toEqual([1, 2, 3, 4, MAX_BOX, MAX_BOX]); // caps at MAX_BOX
});

test("an incorrect answer resets to box 0 and counts a lapse", () => {
  const promoted = schedule(schedule(null, true, "2026-07-16"), true, "2026-07-17");
  expect(promoted.box).toBe(2);
  const lapsed = schedule(promoted, false, "2026-07-20");
  expect(lapsed.box).toBe(0);
  expect(lapsed.due).toBe("2026-07-20"); // INTERVALS[0] = 0 → due same day
  expect(lapsed.lapses).toBe(1);
});

test("isDue: never-studied is due; future due-day is not", () => {
  expect(isDue(null, "2026-07-16")).toBe(true);
  expect(isDue({ due: "2026-07-20" }, "2026-07-16")).toBe(false);
  expect(isDue({ due: "2026-07-16" }, "2026-07-16")).toBe(true);
});

test("dayKey formats local date", () => {
  expect(dayKey(new Date(2026, 6, 5))).toBe("2026-07-05");
});

test("intervals are strictly increasing", () => {
  for (let i = 1; i < INTERVALS.length; i++) expect(INTERVALS[i]).toBeGreaterThan(INTERVALS[i - 1]);
});

// Fable (e)(1): a never-studied prev must not produce NaN box / Invalid Date due.
test("undefined/null prev yields a valid non-NaN schedule", () => {
  for (const prev of [undefined, null, {}]) {
    const r = schedule(prev, true, "2026-07-17");
    expect(Number.isNaN(r.box)).toBe(false);
    expect(r.box).toBe(1);
    expect(r.due).toBe("2026-07-18");
  }
});

// Fable (c)/(e)(2): addDays must be calendar-local (no UTC off-by-one) and cross
// month boundaries. box3→4 uses interval 21; 2026-07-25 + 21 = 2026-08-15.
test("addDays is local + crosses month boundaries (no UTC drift)", () => {
  const r = schedule({ box: 3, due: "", lastReview: "", lapses: 0 }, true, "2026-07-25");
  expect(r.box).toBe(4);
  expect(r.due).toBe("2026-08-15");
});
