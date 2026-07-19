import React from "react";
import { Link } from "react-router-dom";
import { totalXp, streakCount } from "../lib/progress";
import { overallProgress } from "../data/curriculum";

// Sticky top bar: brand, XP, streak, and an overall completion bar.
function Header() {
  const xp = totalXp();
  const streak = streakCount();
  const { done, total } = overallProgress();
  const pct = total ? Math.round((done / total) * 100) : 0;

  return (
    <header className="app-header">
      <div className="brand">
        <span className="brand-mark">🇬🇪</span>
        <span className="brand-name">ისწავლე ქართული</span>
      </div>
      <Link to="/progress" className="header-stats" title="View your progress">
        <span className="stat streak">🔥 {streak}</span>
        <span className="stat xp">⭐ {xp} XP</span>
        <span className="stat chevron">›</span>
      </Link>
      <div className="header-progress" title={`${done} of ${total} lessons`}>
        <div className="header-progress-fill" style={{ width: `${pct}%` }} />
      </div>
    </header>
  );
}

export default Header;
