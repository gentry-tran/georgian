import { LESSONS, distractorPool, getLesson, nextLessonId } from "./curriculum";

describe("curriculum integrity", () => {
  test("lesson ids are unique", () => {
    const ids = LESSONS.map((l) => l.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  test("every lesson has enough words to build 4-way multiple choice", () => {
    LESSONS.forEach((l) => {
      expect((l.words || []).length).toBeGreaterThan(0);
      expect(distractorPool(l).length).toBeGreaterThanOrEqual(4);
    });
  });

  test("every word has Georgian, transliteration, and English", () => {
    LESSONS.forEach((l) => {
      (l.words || []).forEach((w) => {
        expect(w.ka).toBeTruthy();
        expect(w.tr).toBeTruthy();
        expect(w.en).toBeTruthy();
      });
    });
  });

  test("lessons are linearly ordered and chainable", () => {
    const first = LESSONS[0];
    expect(getLesson(first.id)).toBe(first);
    expect(nextLessonId(first.id)).toBe(LESSONS[1].id);
    expect(nextLessonId(LESSONS[LESSONS.length - 1].id)).toBeNull();
  });
});
