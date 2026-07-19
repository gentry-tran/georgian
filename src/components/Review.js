import React, { useMemo, useState, useCallback, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { reviewWords } from "../data/curriculum";
import { buildReviewSession } from "../lib/session";
import { recordReview, dueReviewWords, recordWordResult } from "../lib/progress";
import { warmupSpeech } from "../lib/speech";
import { happyMeme, grumpyMeme, cheer, nudge, COMBO_CHEERS } from "../lib/memes";
import { pick } from "../lib/shuffle";

import MultipleChoice from "./exercises/MultipleChoice";
import ListenChoice from "./exercises/ListenChoice";
import MemeBurst from "./MemeBurst";
import Confetti from "./Confetti";
import "./LessonSession.css";

const EXERCISES = { choose: MultipleChoice, listen: ListenChoice };

// Spaced-repetition review over words from completed lessons. Reuses the
// exercise components but runs its own light loop (kept separate from
// LessonSession so it can't affect lesson play).
function Review() {
  const navigate = useNavigate();
  const words = useMemo(() => reviewWords(), []);
  const items = useMemo(() => {
    if (words.length < 4) return [];
    // SR scheduler picks what's due (oldest/never-studied first); seed by day so
    // a given day's review is stable if the screen re-mounts.
    const ordered = dueReviewWords(words, new Date(), 12);
    const seed = new Date().toISOString().slice(0, 10);
    // distractors drawn from ALL learned words, not just the due handful
    return buildReviewSession(ordered, 12, { seed, pool: words });
  }, [words]);

  const [index, setIndex] = useState(0);
  const [correct, setCorrect] = useState(0);
  const [streak, setStreak] = useState(0);
  const [feedback, setFeedback] = useState(null);
  const [confetti, setConfetti] = useState(false);
  const [phase, setPhase] = useState("answering");
  const [summary, setSummary] = useState(null);

  const total = items.length;

  useEffect(() => {
    warmupSpeech();
  }, []);

  const finish = useCallback(
    (finalCorrect) => {
      setSummary(recordReview({ correct: finalCorrect }));
      setPhase("done");
      setConfetti(true);
    },
    []
  );

  const onResult = useCallback(
    (isCorrect) => {
      if (phase !== "answering") return;
      const cur = items[index];
      if (cur && cur.srcKa) recordWordResult(cur.srcKa, isCorrect); // advance SR schedule
      const nextCorrect = correct + (isCorrect ? 1 : 0);
      const nextStreak = isCorrect ? streak + 1 : 0;
      setCorrect(nextCorrect);
      setStreak(nextStreak);
      const combo = isCorrect && nextStreak > 0 && nextStreak % 3 === 0;
      setFeedback(
        isCorrect
          ? { variant: "happy", gif: happyMeme(), caption: combo ? pick(COMBO_CHEERS) : cheer() }
          : { variant: "grumpy", gif: grumpyMeme(), caption: nudge() }
      );
      if (combo) setConfetti(true);
      setPhase("feedback");
      setTimeout(
        () => {
          setFeedback(null);
          setConfetti(false);
          if (index + 1 >= total) finish(nextCorrect);
          else {
            setIndex(index + 1);
            setPhase("answering");
          }
        },
        isCorrect ? 900 : 700
      );
    },
    [phase, correct, streak, index, total, finish, items]
  );

  if (words.length < 4) {
    return (
      <div className="session">
        <div className="celebration">
          <div className="celebration-emoji">🧠</div>
          <h1>Nothing to review yet</h1>
          <p className="celebration-line">
            Finish a vocabulary lesson first, then come back to review what you've
            learned.
          </p>
          <div className="celebration-actions">
            <button className="btn-primary" onClick={() => navigate("/")}>
              Back to roadmap
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (phase === "done" && summary) {
    return (
      <div className="session">
        {confetti && <Confetti pieces={80} />}
        <div className="celebration">
          <div className="celebration-emoji">🧠</div>
          <h1>Review complete!</h1>
          <p className="celebration-line">
            {correct}/{total} correct · +{summary.gainedXp} XP
          </p>
          <p className="celebration-streak">🔥 {summary.streak}-day streak</p>
          <div className="celebration-actions">
            <button className="btn-primary" onClick={() => navigate("/")}>
              Back to roadmap
            </button>
          </div>
        </div>
      </div>
    );
  }

  const item = items[index];
  const Exercise = EXERCISES[item.type] || MultipleChoice;
  const progressPct = Math.round((index / total) * 100);

  return (
    <div className="session">
      {confetti && <Confetti />}
      <MemeBurst {...(feedback || {})} />
      <div className="session-topbar">
        <button className="close-btn" onClick={() => navigate("/")} aria-label="Close">
          ✕
        </button>
        <div className="progress-track">
          <div className="progress-fill" style={{ width: `${progressPct}%` }} />
        </div>
        <div className="session-streak">{streak > 0 ? `🔥${streak}` : ""}</div>
      </div>
      <div className="session-body">
        <Exercise key={index} item={item} onResult={onResult} />
      </div>
    </div>
  );
}

export default Review;
