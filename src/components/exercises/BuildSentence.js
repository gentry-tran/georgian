import React, { useState } from "react";
import { speak } from "../../lib/speech";

// Production: tap the word tiles in the right order to build a Georgian phrase.
function BuildSentence({ item, onResult }) {
  const [built, setBuilt] = useState([]); // array of token indices used
  const [checked, setChecked] = useState(null); // null | "correct" | "wrong"

  const used = new Set(built);

  function addToken(i) {
    if (checked) return;
    setBuilt([...built, i]);
  }
  function removeAt(pos) {
    if (checked) return;
    setBuilt(built.filter((_, idx) => idx !== pos));
  }
  function check() {
    const attempt = built.map((i) => item.tokens[i]);
    const ok = attempt.join(" ") === item.answer.join(" ");
    setChecked(ok ? "correct" : "wrong");
    if (ok) speak(item.answer.join(" "));
  }

  return (
    <div className="exercise">
      <p className="exercise-instruction">Build the sentence</p>
      <div className="build-en">{item.en}</div>

      <div className={`build-answer build-${checked || "idle"}`}>
        {built.length === 0 && <span className="build-placeholder">tap words below…</span>}
        {built.map((tokenIdx, pos) => (
          <button key={pos} className="token token-used" onClick={() => removeAt(pos)}>
            {item.tokens[tokenIdx]}
          </button>
        ))}
      </div>

      <div className="build-bank">
        {item.tokens.map((tok, i) => (
          <button
            key={i}
            className="token"
            disabled={used.has(i) || checked}
            onClick={() => addToken(i)}
          >
            {tok}
          </button>
        ))}
      </div>

      {checked === "wrong" && (
        <div className="reveal-row">
          <span className="reveal-answer">
            Answer: <strong>{item.answer.join(" ")}</strong>
          </span>
        </div>
      )}

      <div className="build-actions">
        {!checked ? (
          <button
            className="btn-continue"
            disabled={built.length === 0}
            onClick={check}
          >
            Check
          </button>
        ) : (
          <button className="btn-continue" onClick={() => onResult(checked === "correct")}>
            Continue
          </button>
        )}
      </div>
    </div>
  );
}

export default BuildSentence;
