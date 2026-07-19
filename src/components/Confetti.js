import React, { useMemo } from "react";
import "./Confetti.css";

// Pure-CSS confetti — no dependencies. Rendered on streaks and lesson wins.
function Confetti({ pieces = 40 }) {
  const bits = useMemo(
    () =>
      Array.from({ length: pieces }, () => ({
        left: Math.random() * 100,
        delay: Math.random() * 0.6,
        duration: 1.6 + Math.random() * 1.4,
        hue: Math.floor(Math.random() * 360),
        rotate: Math.random() * 360,
        size: 6 + Math.random() * 8,
      })),
    [pieces]
  );
  return (
    <div className="confetti" aria-hidden="true">
      {bits.map((b, i) => (
        <span
          key={i}
          className="confetti-bit"
          style={{
            left: `${b.left}%`,
            width: `${b.size}px`,
            height: `${b.size}px`,
            background: `hsl(${b.hue}, 90%, 55%)`,
            animationDelay: `${b.delay}s`,
            animationDuration: `${b.duration}s`,
            transform: `rotate(${b.rotate}deg)`,
          }}
        />
      ))}
    </div>
  );
}

export default Confetti;
