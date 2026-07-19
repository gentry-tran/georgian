import React from "react";
import { useNavigate } from "react-router-dom";
import Header from "./Header";
import { LEVELS, isLessonUnlocked } from "../data/curriculum";
import { lessonStars } from "../lib/progress";
import "./Roadmap.css";

function LessonNode({ lesson, offset, onOpen }) {
  const stars = lessonStars(lesson.id);
  const unlocked = isLessonUnlocked(lesson.id);
  const complete = stars > 0;
  const status = !unlocked ? "locked" : complete ? "done" : "start";

  return (
    <div className={`node-row offset-${offset}`}>
      <button
        className={`node node-${status}`}
        onClick={() => unlocked && onOpen(lesson.id)}
        disabled={!unlocked}
        title={lesson.goal}
        data-testid={`lesson-${lesson.id}`}
      >
        <span className="node-icon">{status === "locked" ? "🔒" : lesson.icon}</span>
        {status === "start" && <span className="node-badge">START</span>}
        {status === "done" && <span className="node-check">✓</span>}
      </button>
      <div className="node-label">
        <div className="node-title">{lesson.title}</div>
        {complete ? (
          <div className="node-stars">
            {[1, 2, 3].map((n) => (
              <span key={n} className={n <= stars ? "s on" : "s"}>
                ★
              </span>
            ))}
          </div>
        ) : (
          <div className="node-goal">{lesson.goal}</div>
        )}
      </div>
    </div>
  );
}

function Roadmap() {
  const navigate = useNavigate();
  const open = (id) => navigate(`/learn/${id}`);

  let nodeIndex = 0;

  return (
    <div className="roadmap">
      <Header />
      <div className="roadmap-intro">
        <h1>Your Georgian journey</h1>
        <p>
          Follow the path from your first letters to real conversations. Finish a
          lesson to unlock the next one. Practice a little every day. 🐈
        </p>
        <button
          className="btn-secondary review-btn"
          onClick={() => navigate("/review")}
        >
          🧠 Review learned words
        </button>
      </div>

      {LEVELS.map((level) => (
        <section key={level.id} className="level" style={{ "--level-color": level.color }}>
          <div className="level-band">
            <span className="cefr-badge">{level.cefr}</span>
            <div className="level-head">
              <h2>
                {level.name} <span className="level-ka">{level.georgian}</span>
              </h2>
              <p>{level.tagline}</p>
            </div>
          </div>

          {level.units.map((unit) => (
            <div key={unit.id} className="unit">
              <div className="unit-title">
                <span className="unit-icon">{unit.icon}</span>
                {unit.title}
              </div>
              <div className="unit-path">
                {unit.lessons.map((lessonRaw) => {
                  const lesson = lessonRaw._ref || lessonRaw;
                  const offset = nodeIndex++ % 3; // gentle zig-zag
                  return (
                    <LessonNode
                      key={lesson.id}
                      lesson={lesson}
                      offset={offset}
                      onOpen={open}
                    />
                  );
                })}
              </div>
            </div>
          ))}
        </section>
      ))}

      <footer className="roadmap-footer">
        Built for practice, not perfection. თავს ნუ დაზოგავ — practice daily! 💪
      </footer>
    </div>
  );
}

export default Roadmap;
