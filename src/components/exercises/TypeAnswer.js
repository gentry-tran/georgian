import React, { useEffect, useState } from "react";
import { speak } from "../../lib/speech";

// Typing exercise (generic format): either "type what you hear" (audio prompt) or
// "type the translation" (text prompt). The learner types the Latin
// transliteration, so no Georgian keyboard is needed. Matching is lenient —
// case, spaces, apostrophes, and punctuation are ignored.
function norm(s) {
  return (s || "").toLowerCase().replace(/[^a-z0-9]/g, "");
}

function TypeAnswer({ item, onResult }) {
  const [value, setValue] = useState("");
  const [checked, setChecked] = useState(null); // null | "correct" | "wrong"

  useEffect(() => {
    if (item.audio) speak(item.audio);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [item]);

  function check() {
    if (!value.trim()) return;
    const ok = norm(value) === norm(item.answer);
    setChecked(ok ? "correct" : "wrong");
    if (item.audio) speak(item.audio);
  }

  function onKeyDown(e) {
    if (e.key === "Enter") {
      if (!checked) check();
      else onResult(checked === "correct");
    }
  }

  return (
    <div className="exercise">
      <p className="exercise-instruction">
        {item.audio ? "Type what you hear (in Latin letters)" : "Type it in Latin letters"}
      </p>

      {item.audio ? (
        <button className="speaker-big" onClick={() => speak(item.audio)}>
          🔊
        </button>
      ) : (
        <div className={`prompt ${item.promptIsGeorgian ? "prompt-georgian" : ""}`}>
          {item.prompt}
        </div>
      )}

      <input
        className={`type-input type-${checked || "idle"}`}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={onKeyDown}
        disabled={!!checked}
        autoFocus
        autoCapitalize="none"
        autoCorrect="off"
        spellCheck="false"
        placeholder="type here…"
        data-testid="type-input"
        aria-label="Your answer"
      />

      {checked === "wrong" && (
        <div className="reveal-row">
          <span className="reveal-answer">
            Answer: <strong>{item.answer}</strong>
            {item.reveal ? ` — ${item.reveal}` : ""}
          </span>
        </div>
      )}

      <div className="build-actions">
        {!checked ? (
          <button
            className="btn-continue"
            disabled={!value.trim()}
            onClick={check}
            data-testid="type-check"
          >
            Check
          </button>
        ) : (
          <button
            className="btn-continue"
            onClick={() => onResult(checked === "correct")}
            data-testid="type-continue"
          >
            Continue
          </button>
        )}
      </div>
    </div>
  );
}

export default TypeAnswer;
