import React from "react";
import { useNavigate } from "react-router-dom";
import { useRef, useState } from "react";
import {
  levelInfo,
  totalXp,
  streakCount,
  isLessonComplete,
  todayXp,
  lastNDays,
  DAILY_GOAL,
  exportProgress,
  importProgress,
} from "../lib/progress";
import { LESSONS, overallProgress } from "../data/curriculum";
import "./Dashboard.css";

// Daily goal ring + a 28-day practice calendar so progress is visible over time
// and the habit compounds — practice a little every day.
function DailyHabit() {
  const today = todayXp();
  const pct = Math.min(100, Math.round((today / DAILY_GOAL) * 100));
  const days = lastNDays(28);
  const metCount = days.filter((d) => d.met).length;
  return (
    <div className="dash-habit">
      <div className="dash-daily">
        <div className="dash-daily-text">
          <span className="dash-daily-title">Today's goal</span>
          <span className="dash-daily-sub">
            {today} / {DAILY_GOAL} XP {pct >= 100 ? "· done! 🎉" : "· practice daily 🌱"}
          </span>
        </div>
        <div className="dash-daily-track">
          <div className="dash-daily-fill" style={{ width: `${pct}%` }} />
        </div>
      </div>
      <div className="dash-cal-head">
        <span>Last 4 weeks</span>
        <span className="dash-cal-sub">{metCount} day{metCount === 1 ? "" : "s"} hit the goal</span>
      </div>
      <div className="dash-cal">
        {days.map((d) => (
          <span
            key={d.day}
            className={`dash-cell ${d.met ? "hit" : d.xp > 0 ? "some" : "none"}`}
            title={`${d.day}: ${d.xp} XP`}
          />
        ))}
      </div>
    </div>
  );
}

// Backup / restore so progress (stored in this browser) is never trapped or lost.
function ManageProgress() {
  const fileRef = useRef();
  const [msg, setMsg] = useState("");

  function download() {
    try {
      const blob = new Blob([exportProgress()], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "georgian-progress.json";
      a.click();
      URL.revokeObjectURL(url);
      setMsg("Backup downloaded.");
    } catch (e) {
      setMsg("Couldn't create the backup.");
    }
  }

  function onFile(e) {
    const f = e.target.files && e.target.files[0];
    if (!f) return;
    const r = new FileReader();
    r.onload = () => {
      const ok = importProgress(r.result);
      setMsg(ok ? "Progress restored ✓ — reload to see it." : "That file wasn't a valid backup.");
    };
    r.readAsText(f);
  }

  return (
    <div className="dash-manage">
      <h2>Back up your progress</h2>
      <p className="dash-manage-note">
        Your progress is saved in this browser. Download a backup so you never
        lose it — and restore it here on any device.
      </p>
      <div className="dash-manage-btns">
        <button className="btn-secondary" onClick={download}>
          ⬇︎ Download backup
        </button>
        <button className="btn-ghost" onClick={() => fileRef.current && fileRef.current.click()}>
          ⬆︎ Restore backup
        </button>
        <input
          ref={fileRef}
          type="file"
          accept="application/json,.json"
          style={{ display: "none" }}
          onChange={onFile}
          data-testid="import-file"
        />
      </div>
      {msg && <div className="dash-manage-msg">{msg}</div>}
    </div>
  );
}

function Stat({ big, label, sub }) {
  return (
    <div className="dash-stat">
      <div className="dash-stat-big">{big}</div>
      <div className="dash-stat-label">{label}</div>
      {sub && <div className="dash-stat-sub">{sub}</div>}
    </div>
  );
}

function Dashboard() {
  const navigate = useNavigate();
  const { level, into, per, pct } = levelInfo();
  const xp = totalXp();
  const streak = streakCount();
  const { done, total } = overallProgress();

  // Count vocabulary + letters actually practiced (in completed lessons).
  let words = 0;
  const cefr = { A1: 0, A2: 0, B1: 0 };
  let cefrTotal = { A1: 0, A2: 0, B1: 0 };
  for (const l of LESSONS) {
    cefrTotal[l.cefr] = (cefrTotal[l.cefr] || 0) + 1;
    if (isLessonComplete(l.id)) {
      words += (l.words || []).length;
      cefr[l.cefr] = (cefr[l.cefr] || 0) + 1;
    }
  }

  return (
    <div className="dash">
      <div className="dash-top">
        <button className="dash-back" onClick={() => navigate("/")}>
          ‹ Back
        </button>
        <h1>Your progress</h1>
        <span />
      </div>

      <div className="dash-level">
        <div className="dash-level-head">
          <span className="dash-level-badge">Lv {level}</span>
          <span className="dash-level-xp">
            {into} / {per} XP to level {level + 1}
          </span>
        </div>
        <div className="dash-level-track">
          <div className="dash-level-fill" style={{ width: `${pct}%` }} />
        </div>
      </div>

      <div className="dash-grid">
        <Stat big={`🔥 ${streak}`} label="Day streak" sub={streak ? "Keep it going!" : "Start today"} />
        <Stat big={`⭐ ${xp}`} label="Total XP" />
        <Stat big={`${done}/${total}`} label="Lessons done" />
        <Stat big={words} label="Words practiced" />
      </div>

      <DailyHabit />

      <div className="dash-levels">
        <h2>Course progress</h2>
        {["A1", "A2", "B1", "B2"].map((lvl) => {
          const d = cefr[lvl] || 0;
          const t = cefrTotal[lvl] || 0;
          const p = t ? Math.round((d / t) * 100) : 0;
          return (
            <div key={lvl} className="dash-cefr">
              <div className="dash-cefr-row">
                <span className="dash-cefr-name">{lvl}</span>
                <span className="dash-cefr-count">
                  {d}/{t} lessons
                </span>
              </div>
              <div className="dash-cefr-track">
                <div className="dash-cefr-fill" style={{ width: `${p}%` }} />
              </div>
            </div>
          );
        })}
      </div>

      <ManageProgress />

      <button className="btn-primary dash-cta" onClick={() => navigate("/")}>
        Continue learning →
      </button>
    </div>
  );
}

export default Dashboard;
