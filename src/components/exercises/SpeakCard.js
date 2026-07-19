import React from "react";
import { speak, speechSupported } from "../../lib/speech";

// Speaking practice: hear it, say it out loud, self-confirm. This is where the
// conversational focus lives — the app trusts the learner to practice aloud.
function SpeakCard({ item, onResult }) {
  return (
    <div className="exercise">
      <p className="exercise-instruction">Say it out loud 🎤</p>
      <div className="speak-en">{item.en}</div>
      <div className="speak-ka">{item.ka}</div>
      <div className="speak-tr">[{item.tr}]</div>
      {speechSupported() && (
        <button className="btn-hear" onClick={() => speak(item.ka)}>
          🔊 Hear it
        </button>
      )}
      <div className="speak-actions">
        <button className="btn-continue" onClick={() => onResult(true)}>
          ✓ I said it
        </button>
      </div>
    </div>
  );
}

export default SpeakCard;
