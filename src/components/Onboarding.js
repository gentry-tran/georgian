import React from "react";
import { useNavigate } from "react-router-dom";
import { completeOnboarding } from "../lib/progress";
import { lessonsBefore, getLesson } from "../data/curriculum";
import "./Onboarding.css";

// First-run level select. Sets where the learner starts on the roadmap by
// marking everything before that point as already-known. Original design.
const CHOICES = [
  {
    key: "new",
    emoji: "🌱",
    title: "Brand new",
    blurb: "I've never studied Georgian.",
    start: "a1-alphabet-see",
  },
  {
    key: "alphabet",
    emoji: "🔤",
    title: "I know the alphabet",
    blurb: "I can read the letters, but not much else.",
    start: "a1-greetings-1",
  },
  {
    key: "basics",
    emoji: "💬",
    title: "I know some basics",
    blurb: "A handful of words and phrases.",
    start: "a1-numbers-1",
  },
  {
    key: "chat",
    emoji: "🗣️",
    title: "I can hold a simple chat",
    blurb: "Ready for everyday conversation.",
    start: "a2-time-1",
  },
];

function Onboarding() {
  const navigate = useNavigate();

  function choose(c) {
    // guard against a bad id — fall back to the very first lesson
    const startId = getLesson(c.start) ? c.start : "a1-alphabet-see";
    completeOnboarding(lessonsBefore(startId));
    navigate("/");
  }

  return (
    <div className="onb">
      <div className="onb-card">
        <div className="onb-flag">🇬🇪</div>
        <h1>Where should we start?</h1>
        <p className="onb-sub">
          Pick your starting point — you can replay earlier lessons any time.
        </p>
        <div className="onb-options">
          {CHOICES.map((c) => (
            <button
              key={c.key}
              className="onb-option"
              onClick={() => choose(c)}
              data-testid={`onb-${c.key}`}
            >
              <span className="onb-emoji">{c.emoji}</span>
              <span className="onb-text">
                <span className="onb-title">{c.title}</span>
                <span className="onb-blurb">{c.blurb}</span>
              </span>
              <span className="onb-arrow">›</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Onboarding;
