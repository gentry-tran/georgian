import React, { useMemo, useState, useCallback, useEffect } from "react";
import { useParams, useNavigate, Navigate } from "react-router-dom";
import { getLesson, nextLessonId } from "../data/curriculum";
import { buildSession } from "../lib/session";
import { warmupSpeech } from "../lib/speech";
import { recordLesson } from "../lib/progress";
import { happyMeme, grumpyMeme, cheer, nudge, COMBO_CHEERS } from "../lib/memes";
import { pick } from "../lib/shuffle";

import MultipleChoice from "./exercises/MultipleChoice";
import ListenChoice from "./exercises/ListenChoice";
import SpeakCard from "./exercises/SpeakCard";
import BuildSentence from "./exercises/BuildSentence";
import MatchPairs from "./exercises/MatchPairs";
import DialogueReply from "./exercises/DialogueReply";
import TypeAnswer from "./exercises/TypeAnswer";
import PictureChoice from "./exercises/PictureChoice";
import MemeBurst from "./MemeBurst";
import Confetti from "./Confetti";
import "./LessonSession.css";

const EXERCISES = {
  choose: MultipleChoice,
  listen: ListenChoice,
  speak: SpeakCard,
  build: BuildSentence,
  match: MatchPairs,
  dialogue: DialogueReply,
  type: TypeAnswer,
  picture: PictureChoice,
};

function Stars({ count }) {
  return (
    <div className="stars" data-testid="stars">
      {[1, 2, 3].map((n) => (
        <span key={n} className={n <= count ? "star on" : "star"}>
          ★
        </span>
      ))}
    </div>
  );
}

function LessonSession() {
  const { lessonId } = useParams();
  const navigate = useNavigate();
  const lesson = getLesson(lessonId);

  const items = useMemo(() => (lesson ? buildSession(lesson) : []), [lesson]);

  // Warm up the offline speech engine so the first "hear it" is instant.
  useEffect(() => {
    warmupSpeech();
  }, []);

  const [index, setIndex] = useState(0);
  const [correct, setCorrect] = useState(0);
  const [streak, setStreak] = useState(0);
  const [feedback, setFeedback] = useState(null); // {variant, gif, caption}
  const [confetti, setConfetti] = useState(false);
  const [phase, setPhase] = useState("answering"); // answering | feedback | done
  const [summary, setSummary] = useState(null);

  const total = items.length;

  const finish = useCallback(
    (finalCorrect) => {
      const result = recordLesson(lessonId, { correct: finalCorrect, total });
      setSummary(result);
      setPhase("done");
      setConfetti(true);
    },
    [lessonId, total]
  );

  const onResult = useCallback(
    (isCorrect) => {
      if (phase !== "answering") return;

      const nextCorrect = correct + (isCorrect ? 1 : 0);
      const nextStreak = isCorrect ? streak + 1 : 0;
      setCorrect(nextCorrect);
      setStreak(nextStreak);

      const comboHit = isCorrect && nextStreak > 0 && nextStreak % 3 === 0;
      setFeedback(
        isCorrect
          ? {
              variant: "happy",
              gif: happyMeme(),
              caption: comboHit ? pick(COMBO_CHEERS) : cheer(),
            }
          : { variant: "grumpy", gif: grumpyMeme(), caption: nudge() }
      );
      if (comboHit) setConfetti(true);
      setPhase("feedback");

      setTimeout(
        () => {
          setFeedback(null);
          setConfetti(false);
          if (index + 1 >= total) {
            finish(nextCorrect);
          } else {
            setIndex(index + 1);
            setPhase("answering");
          }
        },
        isCorrect ? 950 : 750
      );
    },
    [phase, correct, streak, index, total, finish]
  );

  function restart() {
    setIndex(0);
    setCorrect(0);
    setStreak(0);
    setFeedback(null);
    setConfetti(false);
    setSummary(null);
    setPhase("answering");
  }

  if (!lesson) return <Navigate to="/" replace />;
  if (total === 0) return <Navigate to="/" replace />;

  if (phase === "done" && summary) {
    const nextId = nextLessonId(lessonId);
    return (
      <div className="session">
        {confetti && <Confetti pieces={80} />}
        <div className="celebration">
          <div className="celebration-emoji">🎉</div>
          <h1>{lesson.title} complete!</h1>
          <Stars count={summary.stars} />
          <p className="celebration-line">
            {correct}/{total} correct · +{summary.gainedXp} XP
          </p>
          <p className="celebration-streak">🔥 {summary.streak}-day streak</p>
          <div className="celebration-actions">
            {nextId && (
              <button className="btn-primary" onClick={() => navigate(`/learn/${nextId}`)}>
                Next lesson →
              </button>
            )}
            <button className="btn-secondary" onClick={restart}>
              Practice again
            </button>
            <button className="btn-ghost" onClick={() => navigate("/")}>
              Back to roadmap
            </button>
          </div>
        </div>
      </div>
    );
  }

  const item = items[index];
  const Exercise = EXERCISES[item.type];
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

export default LessonSession;
