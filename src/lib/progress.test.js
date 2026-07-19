import {
  recordLesson,
  totalXp,
  lessonStars,
  isLessonComplete,
  streakCount,
  resetProgress,
} from "./progress";

beforeEach(() => {
  localStorage.clear();
  resetProgress();
});

describe("progress", () => {
  test("a perfect lesson earns 3 stars and XP", () => {
    const r = recordLesson("a1-alphabet-1", { correct: 10, total: 10 });
    expect(r.stars).toBe(3);
    expect(r.gainedXp).toBe(10 * 10 + 3 * 5);
    expect(totalXp()).toBe(r.gainedXp);
    expect(lessonStars("a1-alphabet-1")).toBe(3);
    expect(isLessonComplete("a1-alphabet-1")).toBe(true);
  });

  test("finishing always earns at least one star (unlocks next)", () => {
    const r = recordLesson("x", { correct: 0, total: 10 });
    expect(r.stars).toBe(1);
    expect(isLessonComplete("x")).toBe(true);
  });

  test("stars never regress on a worse replay", () => {
    recordLesson("y", { correct: 10, total: 10 }); // 3 stars
    recordLesson("y", { correct: 5, total: 10 }); // 1 star
    expect(lessonStars("y")).toBe(3);
  });

  test("first practice starts a 1-day streak", () => {
    recordLesson("z", { correct: 8, total: 10 });
    expect(streakCount()).toBe(1);
  });
});
