import React, { useEffect } from "react";
import ChoiceGrid from "./ChoiceGrid";
import { speak } from "../../lib/speech";

// Recognition: read a prompt (English or Georgian) and pick the match.
function MultipleChoice({ item, onResult }) {
  // When the prompt itself is Georgian, offer to hear it.
  useEffect(() => {
    if (item.speakOnShow) speak(item.speakOnShow);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [item]);

  return (
    <div className="exercise">
      <p className="exercise-instruction">
        {item.georgianChoices ? "Which is the Georgian?" : "What does this mean?"}
      </p>
      {item.promptEmoji && <div className="prompt-emoji">{item.promptEmoji}</div>}
      <div className={`prompt ${item.promptIsGeorgian ? "prompt-georgian" : ""}`}>
        {item.prompt}
        {item.promptIsGeorgian && (
          <button
            className="hear-btn"
            onClick={() => speak(item.promptSpeak || item.prompt)}
            aria-label="Hear it"
            title="Hear it"
          >
            🔊
          </button>
        )}
      </div>
      {item.promptSub && <div className="prompt-sub">[{item.promptSub}]</div>}
      <ChoiceGrid
        choices={item.choices}
        answer={item.answer}
        georgian={item.georgianChoices}
        onPick={(v) => {
          if (item.speakOnCorrect && v === item.answer) speak(item.speakOnCorrect);
        }}
        onResolve={onResult}
      />
    </div>
  );
}

export default MultipleChoice;
