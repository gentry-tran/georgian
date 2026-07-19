import { buildSession } from "./session";
import { LESSONS } from "../data/curriculum";

// Build every lesson many times (choices are randomized) and assert invariants.
describe("session invariants across all lessons", () => {
  test("every choose/listen item contains its answer with unique options", () => {
    const problems = [];
    for (const lesson of LESSONS) {
      for (let run = 0; run < 25; run++) {
        for (const item of buildSession(lesson)) {
          if (item.type === "choose" || item.type === "listen") {
            if (!item.choices.includes(item.answer)) {
              problems.push(`${lesson.id}: answer "${item.answer}" missing from [${item.choices}]`);
            }
            if (new Set(item.choices).size !== item.choices.length) {
              problems.push(`${lesson.id}: duplicate options [${item.choices}] (answer ${item.answer})`);
            }
          }
          if (item.type === "match") {
            const ens = item.pairs.map((p) => p.en);
            const kas = item.pairs.map((p) => p.ka);
            if (new Set(ens).size !== ens.length) problems.push(`${lesson.id}: match dup en`);
            if (new Set(kas).size !== kas.length) problems.push(`${lesson.id}: match dup ka`);
          }
          if (item.type === "dialogue") {
            if (!item.choices.includes(item.answer)) {
              problems.push(`${lesson.id}: dialogue answer missing`);
            }
            if (new Set(item.choices).size !== item.choices.length) {
              problems.push(`${lesson.id}: dialogue duplicate options`);
            }
          }
        }
      }
    }
    expect(problems.slice(0, 20)).toEqual([]);
  });
});
