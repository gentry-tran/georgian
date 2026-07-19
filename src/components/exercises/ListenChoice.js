import React, { useEffect } from "react";
import ChoiceGrid from "./ChoiceGrid";
import { speak, audioExpected } from "../../lib/speech";

// Listening: hear the Georgian audio, then choose. Choices are Georgian letters
// ("which letter did you hear?") or English meanings, depending on the item.
// Auto-plays on show. Only if the platform truly can't produce audio do we
// reveal the text so the exercise stays answerable.
function ListenChoice({ item, onResult }) {
  const noAudio = !audioExpected();

  useEffect(() => {
    speak(item.audio);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [item]);

  return (
    <div className="exercise">
      <p className="exercise-instruction">
        {item.georgianChoices
          ? "Which letter did you hear?"
          : "Listen and choose the meaning"}
      </p>
      <button className="speaker-big" onClick={() => speak(item.audio)}>
        🔊
      </button>
      {noAudio ? (
        <div className="prompt prompt-georgian">{item.audio}</div>
      ) : (
        <div className="prompt-sub">Tap to replay</div>
      )}
      <ChoiceGrid
        choices={item.choices}
        answer={item.answer}
        georgian={item.georgianChoices}
        onResolve={onResult}
      />
    </div>
  );
}

export default ListenChoice;
