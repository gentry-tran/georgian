import React, { useState, useRef, useEffect } from "react";
import { shuffle } from "../../lib/shuffle";
import { speak } from "../../lib/speech";

// Matching: tap an English word, then its Georgian match. Matched pairs lock in
// green. Forgiving by design — it's practice, not a trap.
function MatchPairs({ item, onResult }) {
  const [left] = useState(() => item.pairs);
  const [right] = useState(() => shuffle(item.pairs));
  const [selEn, setSelEn] = useState(null);
  const [selKa, setSelKa] = useState(null);
  const [matched, setMatched] = useState(() => new Set());
  const [wrong, setWrong] = useState(false);

  // Track pending timers so we don't setState / advance after unmount.
  const timers = useRef([]);
  useEffect(() => () => timers.current.forEach(clearTimeout), []);
  const later = (fn, ms) => timers.current.push(setTimeout(fn, ms));

  function resolve(en, ka) {
    const pair = left.find((p) => p.en === en);
    if (pair && pair.ka === ka) {
      const next = new Set(matched);
      next.add(en);
      setMatched(next);
      speak(ka);
      if (next.size === left.length) {
        later(() => onResult(true), 350);
      }
    } else {
      setWrong(true);
      later(() => setWrong(false), 400);
    }
    setSelEn(null);
    setSelKa(null);
  }

  function clickEn(en) {
    if (matched.has(en)) return;
    setSelEn(en);
    if (selKa) resolve(en, selKa);
  }
  function clickKa(ka) {
    const owner = left.find((p) => p.ka === ka);
    if (owner && matched.has(owner.en)) return;
    setSelKa(ka);
    if (selEn) resolve(selEn, ka);
  }

  const enState = (en) =>
    matched.has(en) ? "matched" : selEn === en ? (wrong ? "wrong" : "sel") : "idle";
  const kaState = (ka) => {
    const owner = left.find((p) => p.ka === ka);
    if (owner && matched.has(owner.en)) return "matched";
    return selKa === ka ? (wrong ? "wrong" : "sel") : "idle";
  };

  return (
    <div className="exercise">
      <p className="exercise-instruction">Match the pairs</p>
      <div className="match-grid">
        <div className="match-col">
          {left.map((p) => (
            <button
              key={p.en}
              className={`match-cell match-${enState(p.en)}`}
              onClick={() => clickEn(p.en)}
              disabled={matched.has(p.en)}
            >
              {p.en}
            </button>
          ))}
        </div>
        <div className="match-col">
          {right.map((p) => (
            <button
              key={p.ka}
              className={`match-cell match-georgian match-${kaState(p.ka)}`}
              onClick={() => clickKa(p.ka)}
            >
              {p.ka}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

export default MatchPairs;
