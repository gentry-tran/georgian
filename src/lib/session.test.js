import { buildSession } from "./session";
import { getLesson } from "../data/curriculum";

describe("buildSession", () => {
  test("produces a mix of exercises for a vocabulary lesson", () => {
    const items = buildSession(getLesson("a1-greetings-1"));
    expect(items.length).toBeGreaterThan(3);
    const types = new Set(items.map((i) => i.type));
    expect(types.has("choose")).toBe(true);
    expect(types.has("match")).toBe(true);
    expect(types.has("speak")).toBe(true);
  });

  test("every multiple-choice item includes its own answer and 4 options", () => {
    buildSession(getLesson("a1-numbers-1"))
      .filter((i) => i.type === "choose")
      .forEach((i) => {
        expect(i.choices).toContain(i.answer);
        expect(i.choices.length).toBe(4);
        expect(new Set(i.choices).size).toBe(4); // no duplicate options
      });
  });

  test("alphabet lessons drill all 33 letters in a single modality", () => {
    const see = buildSession(getLesson("a1-alphabet-see"));
    expect(see).toHaveLength(33);
    expect(see.every((i) => i.type === "choose" && i.georgianChoices)).toBe(true);

    const listen = buildSession(getLesson("a1-alphabet-listen"));
    expect(listen).toHaveLength(33);
    listen.forEach((i) => {
      expect(i.type).toBe("listen");
      expect(i.georgianChoices).toBe(true);
      expect(i.choices).toContain(i.answer); // answer is the Georgian letter
    });

    const read = buildSession(getLesson("a1-alphabet-read"));
    expect(read).toHaveLength(33);
    expect(read.every((i) => i.type === "choose" && i.promptIsGeorgian)).toBe(true);
  });

  test("dialogue lessons end with a reply exercise", () => {
    const items = buildSession(getLesson("a1-acquainted-1"));
    const dialogue = items.find((i) => i.type === "dialogue");
    expect(dialogue).toBeTruthy();
    expect(dialogue.choices).toContain(dialogue.answer);
  });
});
