// Full audit: every lesson in every level must build a valid, playable session,
// and every exercise type must render without crashing.
import { render } from "@testing-library/react";
import { LESSONS, LEVELS } from "./data/curriculum";
import { buildSession } from "./lib/session";

import MultipleChoice from "./components/exercises/MultipleChoice";
import ListenChoice from "./components/exercises/ListenChoice";
import SpeakCard from "./components/exercises/SpeakCard";
import BuildSentence from "./components/exercises/BuildSentence";
import MatchPairs from "./components/exercises/MatchPairs";
import DialogueReply from "./components/exercises/DialogueReply";
import TypeAnswer from "./components/exercises/TypeAnswer";
import PictureChoice from "./components/exercises/PictureChoice";

const EXERCISES = {
  choose: MultipleChoice,
  listen: ListenChoice,
  speak: SpeakCard,
  build: BuildSentence,
  match: MatchPairs,
  dialogue: DialogueReply,
  type: TypeAnswer,
  picture: PictureChoice,
};

describe("curriculum audit", () => {
  test("the full geofl CEFR ladder is present, in order", () => {
    expect(LEVELS.map((l) => l.cefr)).toEqual(["A1", "A2", "A2+", "B1", "B2", "B2+", "C1"]);
  });

  test("every lesson builds a non-empty session with valid items", () => {
    const problems = [];
    for (const lesson of LESSONS) {
      for (let run = 0; run < 8; run++) {
        const items = buildSession(lesson);
        if (items.length === 0) {
          problems.push(`${lesson.id}: empty session`);
          continue;
        }
        for (const it of items) {
          if (!EXERCISES[it.type]) problems.push(`${lesson.id}: unknown type ${it.type}`);
          if ((it.type === "choose" || it.type === "listen") &&
              (!it.choices.includes(it.answer) || new Set(it.choices).size !== it.choices.length)) {
            problems.push(`${lesson.id}: bad choices for ${it.answer}`);
          }
          if (it.type === "type" && !it.answer) problems.push(`${lesson.id}: type item missing answer`);
        }
      }
    }
    expect(problems.slice(0, 20)).toEqual([]);
  });

  test("every session keeps recognition (comprehension) at >= 50%", () => {
    const RECOGNITION = new Set(["picture", "choose", "listen", "match"]);
    const problems = [];
    for (const lesson of LESSONS) {
      for (let run = 0; run < 6; run++) {
        const items = buildSession(lesson);
        if (!items.length) continue;
        const rec = items.filter((i) => RECOGNITION.has(i.type)).length;
        if (rec < items.length / 2) {
          problems.push(`${lesson.id}: only ${rec}/${items.length} recognition`);
        }
      }
    }
    expect(problems.slice(0, 10)).toEqual([]);
  });

  test("every exercise type renders without crashing", () => {
    const samples = {
      choose: { type: "choose", prompt: "hello", answer: "გამარჯობა", choices: ["გამარჯობა", "არა", "დიახ", "კი"], georgianChoices: true },
      listen: { type: "listen", audio: "წყალი", answer: "water", choices: ["water", "bread", "dog", "cat"], georgianChoices: false },
      speak: { type: "speak", en: "hello", ka: "გამარჯობა", tr: "gamarjoba" },
      build: { type: "build", en: "how are you?", tr: "rogor khar?", answer: ["როგორ", "ხარ?"], tokens: ["ხარ?", "როგორ"] },
      match: { type: "match", pairs: [{ en: "yes", ka: "კი", tr: "ki" }, { en: "no", ka: "არა", tr: "ara" }] },
      dialogue: { type: "dialogue", lines: [{ who: "A", ka: "გამარჯობა", tr: "gamarjoba", en: "hello" }], speaker: "You", en: "hi", answer: "გამარჯობა", choices: ["გამარჯობა", "არა", "კი", "დიახ"] },
      type: { type: "type", audio: "მადლობა", answer: "madloba", reveal: "მადლობა (thanks)" },
      picture: { type: "picture", emoji: "🐈", answer: "კატა", choices: ["კატა", "ძაღლი", "სახლი", "წყალი"], speakOnCorrect: "კატა" },
    };
    for (const [t, item] of Object.entries(samples)) {
      const Cmp = EXERCISES[t];
      expect(() => render(<Cmp item={item} onResult={() => {}} />)).not.toThrow();
    }
  });
});
