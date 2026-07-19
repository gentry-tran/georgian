import React from "react";
import ChoiceGrid from "./ChoiceGrid";
import { speak } from "../../lib/speech";

// The conversational payoff: read a short exchange, then choose your line.
function DialogueReply({ item, onResult }) {
  return (
    <div className="exercise">
      <p className="exercise-instruction">Choose your reply</p>
      <div className="dialogue">
        {item.lines.map((line, i) => (
          <div key={i} className={`bubble bubble-${line.who === "You" ? "you" : "them"}`}>
            <div className="bubble-who">{line.who}</div>
            <div className="bubble-ka" onClick={() => speak(line.ka)} title="Hear it">
              {line.ka} 🔊
            </div>
            <div className="bubble-tr">[{line.tr}] — {line.en}</div>
          </div>
        ))}
        <div className="bubble bubble-you bubble-prompt">
          <div className="bubble-who">{item.speaker}</div>
          <div className="bubble-hint">“{item.en}”</div>
        </div>
      </div>
      <ChoiceGrid
        choices={item.choices}
        answer={item.answer}
        georgian={true}
        onPick={(v) => v === item.answer && speak(item.answer)}
        onResolve={onResult}
      />
    </div>
  );
}

export default DialogueReply;
