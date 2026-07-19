import React from "react";
import ChoiceGrid from "./ChoiceGrid";
import { speak } from "../../lib/speech";

// Visual grounding (comprehensible input): see a picture, pick the Georgian word.
// Meaning is tied to an image, not an English translation.
function PictureChoice({ item, onResult }) {
  return (
    <div className="exercise">
      <p className="exercise-instruction">Which word matches the picture?</p>
      <div className="picture-emoji">{item.emoji}</div>
      <ChoiceGrid
        choices={item.choices}
        answer={item.answer}
        georgian
        onPick={(v) => {
          if (v === item.answer && item.speakOnCorrect) speak(item.speakOnCorrect);
        }}
        onResolve={onResult}
      />
    </div>
  );
}

export default PictureChoice;
