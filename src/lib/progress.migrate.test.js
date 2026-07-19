// Migration + defensive-load tests (§1.3): a v1 blob (stored xp, numeric plays,
// no schemaVersion) must upgrade cleanly; a corrupt value must not crash boot.
import { getState, isLessonComplete, totalXp, lessonStars, lessonPlays, SCHEMA_VERSION } from "./progress";

beforeEach(() => localStorage.clear());

test("v1 blob upgrades to v2 without losing progress", () => {
  localStorage.setItem(
    "georgian-language-app:v1",
    JSON.stringify({
      xp: 999, // stored xp is dropped (now derived)
      streak: { count: 4, lastDay: "2026-07-10" },
      lessons: { "a1-x": { stars: 3, bestAccuracy: 0.9, plays: 7 } }, // plays as number
      days: { "2026-07-15": 40 },
      onboarded: true,
    })
  );
  const s = getState();
  expect(s.schemaVersion).toBe(SCHEMA_VERSION);
  expect(isLessonComplete("a1-x")).toBe(true);
  expect(lessonStars("a1-x")).toBe(3);
  expect(lessonPlays("a1-x")).toBe(7); // numeric plays preserved as a device bucket
  expect(totalXp()).toBe(40); // xp derived from days, not the stale stored 999
  expect(s.onboarded).toBe(true);
});

test("corrupt localStorage does not crash boot and is preserved for recovery", () => {
  localStorage.setItem("georgian-language-app:v1", "{not valid json");
  const s = getState(); // must not throw
  expect(s.lessons).toEqual({});
  expect(localStorage.getItem("georgian-language-app:v1:_recovered")).toBe("{not valid json");
});
