// Content + audio-reference linter (§4.2 / §3.3), run as a test. Converts an
// entire class of authoring + regeneration mistakes from runtime surprises into
// build failures: missing fields, duplicate ids, and — most importantly — any
// spoken text whose content-hashed audio clip no longer exists (a stale hash
// after audio regeneration is otherwise invisible until a learner hits it).
import fs from "fs";
import path from "path";
import { LEVELS, LESSONS } from "./curriculum";
import { AUDIO_CLIPS } from "./audioManifest";

const AUDIO_DIR = path.join(__dirname, "..", "..", "public", "audio");

describe("content integrity", () => {
  test("level / unit / lesson ids are all unique", () => {
    const ids = new Set();
    for (const lv of LEVELS) {
      expect(ids.has(lv.id)).toBe(false);
      ids.add(lv.id);
      for (const u of lv.units) {
        expect(ids.has(u.id)).toBe(false);
        ids.add(u.id);
        for (const l of u.lessons) {
          expect(ids.has(l.id)).toBe(false);
          ids.add(l.id);
        }
      }
    }
  });

  test("every word has non-empty ka / tr / en", () => {
    for (const lesson of LESSONS) {
      for (const w of lesson.words || []) {
        expect(typeof w.ka === "string" && w.ka.length).toBeTruthy();
        expect(typeof w.tr === "string" && w.tr.length).toBeTruthy();
        expect(typeof w.en === "string" && w.en.length).toBeTruthy();
      }
    }
  });

  test("no duplicate word identity within a single lesson", () => {
    for (const lesson of LESSONS) {
      const seen = new Set();
      for (const w of lesson.words || []) {
        expect(seen.has(w.ka)).toBe(false);
        seen.add(w.ka);
      }
    }
  });

  test("dialogue lines are well-formed", () => {
    for (const lesson of LESSONS) {
      for (const line of lesson.dialogue || []) {
        expect(typeof line.ka).toBe("string");
        expect(typeof line.en).toBe("string");
      }
    }
  });

  // The important one: every clip the app would actually play must exist on disk.
  test("every spoken audio reference resolves to a real file", () => {
    const missing = [];
    const check = (text) => {
      if (!text) return;
      const file = AUDIO_CLIPS[text];
      if (!file) missing.push(`no manifest entry: "${text}"`);
      else if (!fs.existsSync(path.join(AUDIO_DIR, file)))
        missing.push(`stale hash: "${text}" -> ${file}`);
    };
    for (const lesson of LESSONS) {
      for (const w of lesson.words || []) check(w.say || w.ka);
      for (const p of lesson.phrases || []) check(p.ka);
    }
    expect(missing).toEqual([]);
  });
});
