import React from "react";
import "./MemeBurst.css";

// A quick full-screen cat reaction with a caption. `variant` picks the vibe.
function MemeBurst({ gif, caption, variant }) {
  if (!gif) return null;
  return (
    <div className={`meme-burst meme-${variant}`} data-testid="meme-burst">
      <img className="meme-img" src={gif} alt="" />
      <div className="meme-caption">{caption}</div>
    </div>
  );
}

export default MemeBurst;
