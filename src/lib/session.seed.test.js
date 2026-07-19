// Seeded-session determinism (§2.2) + per-word ordering invariant (§2.3).
import { buildSession } from "./session";
import { getLesson, LESSONS } from "../data/curriculum";

// a vocab lesson (has words + phrases, not the alphabet mode) for realistic shape
const vocab = LESSONS.find((l) => !l.mode && (l.words || []).length >= 4 && (l.phrases || []).length);
const lesson = vocab && getLesson(vocab.id);

describe("seeded sessions", () => {
  test("same seed → identical session (reproducible)", () => {
    const a = JSON.stringify(buildSession(lesson, { seed: "abc" }));
    const b = JSON.stringify(buildSession(lesson, { seed: "abc" }));
    expect(a).toBe(b);
  });

  test("different seeds → different sessions (still varies for real users)", () => {
    const a = JSON.stringify(buildSession(lesson, { seed: "abc" }));
    const c = JSON.stringify(buildSession(lesson, { seed: "xyz" }));
    expect(a).not.toBe(c);
  });

  test("§2.3: every word-level production item had a recognition exposure earlier", () => {
    const RECOGNITION = new Set(["choose", "listen", "match", "picture"]);
    const PRODUCTION = new Set(["type", "build", "speak"]);
    // The invariant is about WORDS. speak/build operate on phrases (a different
    // unit), so scope the check to items keyed to an actual lesson word.
    const wordKas = new Set((lesson.words || []).map((w) => w.ka));
    const session = buildSession(lesson, { seed: "ordering" });
    const seenRecognition = new Set();
    for (const item of session) {
      if (RECOGNITION.has(item.type) && item.wordKa) seenRecognition.add(item.wordKa);
      if (PRODUCTION.has(item.type) && item.wordKa && wordKas.has(item.wordKa)) {
        expect(seenRecognition.has(item.wordKa)).toBe(true); // recognition came first
      }
    }
  });

  test("dialogue, when present, is the last item", () => {
    const session = buildSession(lesson, { seed: "dlg" });
    const dlg = session.findIndex((i) => i.type === "dialogue");
    if (dlg !== -1) expect(dlg).toBe(session.length - 1);
  });
});
