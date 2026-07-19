import React, { useState } from "react";

// Reusable multiple-choice grid. Correct pick resolves immediately (snappy);
// a wrong pick reveals the right answer and waits for "Continue" so the learner
// can study before moving on.
function ChoiceGrid({ choices, answer, georgian, onResolve, onPick }) {
  const [picked, setPicked] = useState(null);
  const locked = picked !== null;

  function handle(value) {
    if (locked) return;
    setPicked(value);
    if (onPick) onPick(value);
    if (value === answer) onResolve(true);
  }

  function stateFor(value) {
    if (!locked) return "idle";
    if (value === answer) return picked === answer ? "correct" : "reveal";
    if (value === picked) return "wrong";
    return "dim";
  }

  return (
    <div>
      <div className={`choice-grid ${georgian ? "georgian" : ""}`}>
        {choices.map((value, i) => (
          <button
            key={i}
            className={`choice choice-${stateFor(value)}`}
            onClick={() => handle(value)}
            disabled={locked}
            data-testid="choice"
          >
            {value}
          </button>
        ))}
      </div>
      {locked && picked !== answer && (
        <div className="reveal-row">
          <span className="reveal-answer">
            Answer: <strong>{answer}</strong>
          </span>
          <button
            className="btn-continue"
            onClick={() => onResolve(false)}
            data-testid="continue"
          >
            Continue
          </button>
        </div>
      )}
    </div>
  );
}

export default ChoiceGrid;
