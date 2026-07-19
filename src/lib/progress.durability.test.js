import {
  resetProgress,
  recordLesson,
  markLessonComplete,
  isLessonComplete,
  exportProgress,
  importProgress,
  todayXp,
  lastNDays,
  DAILY_GOAL,
} from "./progress";

beforeEach(() => {
  localStorage.clear();
  resetProgress();
});

describe("durability + manual complete", () => {
  test("markLessonComplete unlocks a lesson", () => {
    expect(isLessonComplete("a1-greetings-1")).toBe(false);
    markLessonComplete("a1-greetings-1");
    expect(isLessonComplete("a1-greetings-1")).toBe(true);
  });

  test("export → reset → import restores progress", () => {
    recordLesson("a1-greetings-1", { correct: 10, total: 10 });
    const backup = exportProgress();
    resetProgress();
    expect(isLessonComplete("a1-greetings-1")).toBe(false);
    expect(importProgress(backup)).toBe(true);
    expect(isLessonComplete("a1-greetings-1")).toBe(true);
  });

  test("import rejects garbage without wiping state", () => {
    markLessonComplete("a1-greetings-1");
    expect(importProgress("not json")).toBe(false);
    expect(importProgress("{}")).toBe(false);
    expect(isLessonComplete("a1-greetings-1")).toBe(true); // untouched
  });

  test("daily xp + calendar track today's practice", () => {
    recordLesson("a1-greetings-1", { correct: 10, total: 10 });
    expect(todayXp()).toBeGreaterThan(0);
    const days = lastNDays(7);
    expect(days).toHaveLength(7);
    expect(days[days.length - 1].xp).toBe(todayXp());
    expect(days[days.length - 1].met).toBe(todayXp() >= DAILY_GOAL);
  });
});
