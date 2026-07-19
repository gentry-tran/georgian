// Georgian audio playback.
//
// We ALWAYS play the pre-rendered, verified clips bundled in public/audio:
// words/phrases use Microsoft ka-GE-EkaNeural (scripts/generate-audio-edge.py) and
// the 33 alphabet letters use ka-GE-GiorgiNeural (scripts/regen-letters.py).
// We deliberately do NOT use the browser's own Web Speech voice: its quality
// varies wildly per browser/OS and was the source of the "robotic/unnatural"
// playback. One consistent, natural voice everywhere.
import { AUDIO_CLIPS } from "../data/audioManifest";

function clipUrl(text) {
  const pub =
    (typeof process !== "undefined" && process.env && process.env.PUBLIC_URL) || "";
  return `${pub}/audio/${AUDIO_CLIPS[text]}`;
}

export function hasClip(text) {
  return Object.prototype.hasOwnProperty.call(AUDIO_CLIPS, text);
}

export function speechSupported() {
  return typeof window !== "undefined";
}

// Audio is expected to work (used so listening exercises stay pure-audio instead
// of revealing the answer). True wherever the Audio element exists.
export function audioExpected() {
  return typeof Audio !== "undefined";
}

export function hasGeorgianVoice() {
  return Object.keys(AUDIO_CLIPS).length > 0;
}

// No-op kept for callers that pre-warmed the old WASM engine.
export function warmupSpeech() {}

// ONE shared audio element, unlocked on the first user gesture so the listening
// exercise's auto-play works and playback is reliable across browsers.
let sharedEl = null;

function el() {
  if (!sharedEl && typeof Audio !== "undefined") {
    sharedEl = new Audio();
    sharedEl.preload = "auto";
  }
  return sharedEl;
}

if (typeof window !== "undefined") {
  const prime = () => {
    const a = el();
    if (!a) return;
    try {
      a.muted = true;
      const p = a.play && a.play();
      if (p && p.then) p.then(() => a.pause()).catch(() => {});
      a.muted = false;
    } catch (e) {
      /* play() can throw synchronously (jsdom / some browsers) — ignore */
    }
  };
  // once only — priming on every click would interrupt an in-progress clip
  ["pointerdown", "keydown", "touchstart"].forEach((ev) =>
    window.addEventListener(ev, prime, { passive: true, once: true })
  );
}

export function speak(text) {
  if (!text) return;
  const a = el();
  if (!a || !hasClip(text)) return;
  try {
    a.pause();
    a.src = clipUrl(text);
    a.currentTime = 0;
    const p = a.play();
    if (p && p.catch) p.catch(() => {});
  } catch (e) {}
}
