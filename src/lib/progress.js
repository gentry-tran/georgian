// Local, offline progress store (localStorage) — designed so multi-device sync
// can NEVER silently destroy progress. Every field is defined so that merging two
// states is a per-field join that is commutative, idempotent, and order-independent
// (a CRDT-ish blob). xp and streak are DERIVED from the merged data, never stored,
// so they cannot conflict. See merge() below and progress.merge.test.js.

import { schedule, isDue, dueRank } from "./leitner";

const KEY = "georgian-language-app:v1";
const DEVICE_KEY = "georgian-language-app:deviceId";
export const SCHEMA_VERSION = 4;

// Daily XP target — the "practice a little every day" habit goal.
export const DAILY_GOAL = 30;

const listeners = new Set();

// NOTE: the merge/normalize/emptyState below are kept BYTE-FOR-BYTE identical to
// scripts/../src/lib/mergeCore.js (the CommonJS copy the Node sync server uses).
// CRA's webpack can't import named bindings from a CJS module and its Jest can't
// resolve .mjs, so we can't share one file across client+server — instead a parity
// test (progress.parity.test.js) fails if the two merges ever diverge.
function emptyState() {
  return { schemaVersion: SCHEMA_VERSION, lessons: {}, days: {}, words: {}, onboarded: false };
}

function normalize(s) {
  const out = emptyState();
  if (s && typeof s === "object") {
    if (s.lessons && typeof s.lessons === "object") {
      for (const [id, l] of Object.entries(s.lessons)) {
        if (!l || typeof l !== "object") continue;
        out.lessons[id] = {
          stars: Number(l.stars) || 0,
          bestAccuracy: Number(l.bestAccuracy) || 0,
          plays: l.plays && typeof l.plays === "object" ? { ...l.plays } : {},
        };
      }
    }
    if (s.days && typeof s.days === "object") {
      for (const [d, v] of Object.entries(s.days)) {
        const bucket = {};
        if (typeof v === "number") bucket._v3 = Number(v) || 0;
        else if (v && typeof v === "object") {
          for (const [dev, pts] of Object.entries(v)) bucket[dev] = Number(pts) || 0;
        }
        out.days[d] = bucket;
      }
    }
    if (s.words && typeof s.words === "object") {
      for (const [ka, r] of Object.entries(s.words)) {
        if (!r || typeof r !== "object") continue;
        out.words[ka] = {
          box: Number(r.box) || 0,
          due: String(r.due || ""),
          lastReview: String(r.lastReview || ""),
          lapses: Number(r.lapses) || 0,
        };
      }
    }
    out.onboarded = !!s.onboarded;
  }
  return out;
}

// The CRDT merge: commutative, idempotent, associative. Never loses a star/day/play.
export function merge(a, b) {
  const A = normalize(a);
  const B = normalize(b);
  const out = emptyState();
  for (const id of new Set([...Object.keys(A.lessons), ...Object.keys(B.lessons)])) {
    const la = A.lessons[id] || { stars: 0, bestAccuracy: 0, plays: {} };
    const lb = B.lessons[id] || { stars: 0, bestAccuracy: 0, plays: {} };
    const plays = {};
    for (const dev of new Set([...Object.keys(la.plays), ...Object.keys(lb.plays)])) {
      plays[dev] = Math.max(la.plays[dev] || 0, lb.plays[dev] || 0);
    }
    out.lessons[id] = {
      stars: Math.max(la.stars, lb.stars),
      bestAccuracy: Math.max(la.bestAccuracy, lb.bestAccuracy),
      plays,
    };
  }
  for (const d of new Set([...Object.keys(A.days), ...Object.keys(B.days)])) {
    const da = A.days[d] || {}, dbb = B.days[d] || {};
    const bucket = {};
    for (const dev of new Set([...Object.keys(da), ...Object.keys(dbb)])) {
      bucket[dev] = Math.max(da[dev] || 0, dbb[dev] || 0);
    }
    out.days[d] = bucket;
  }
  // words (Leitner): last-writer-wins on a TOTAL order (lastReview, box, lapses,
  // due). INVARIANT: `key` MUST list EVERY word field — the tuple covering all
  // fields is what makes a full-tuple tie mean "identical record." The final
  // stringify compare resolves any residual tie DETERMINISTICALLY and
  // independently of argument order (the client merges local-first, the server
  // existing-first), so if a field is ever added and omitted from `key`, the two
  // sides still pick the same winner instead of oscillating across devices.
  const key = (r) => [r.lastReview, r.box, r.lapses, r.due];
  const gte = (x, y) => {
    const kx = key(x), ky = key(y);
    for (let i = 0; i < kx.length; i++) {
      if (kx[i] === ky[i]) continue;
      return kx[i] > ky[i];
    }
    return JSON.stringify(x) >= JSON.stringify(y);
  };
  for (const ka of new Set([...Object.keys(A.words), ...Object.keys(B.words)])) {
    const ra = A.words[ka], rb = B.words[ka];
    if (!ra) out.words[ka] = rb;
    else if (!rb) out.words[ka] = ra;
    else out.words[ka] = gte(ra, rb) ? ra : rb;
  }
  out.onboarded = A.onboarded || B.onboarded;
  return out;
}

// ---- device identity (per-browser, never merged/synced) ----
function deviceId() {
  try {
    let id = localStorage.getItem(DEVICE_KEY);
    if (!id) {
      id =
        (typeof crypto !== "undefined" && crypto.randomUUID && crypto.randomUUID()) ||
        `d-${Date.now().toString(36)}-${Math.floor(Math.random() * 1e9).toString(36)}`;
      localStorage.setItem(DEVICE_KEY, id);
    }
    return id;
  } catch (e) {
    return "d-local";
  }
}

// ---- migrations (run at load; ordered, idempotent) ----
function migrate(raw) {
  if (!raw || typeof raw !== "object") return emptyState();
  let s = raw;
  const v = s.schemaVersion || 1;
  if (v < 2) {
    // v1 → v2: drop stored xp/streak (now derived); convert plays:number → {_v1:n}
    const lessons = {};
    for (const [id, l] of Object.entries(s.lessons || {})) {
      const plays =
        typeof l.plays === "number" ? { _v1: l.plays } : l.plays && typeof l.plays === "object" ? l.plays : {};
      lessons[id] = { stars: l.stars || 0, bestAccuracy: l.bestAccuracy || 0, plays };
    }
    s = { schemaVersion: 2, lessons, days: s.days || {}, onboarded: !!s.onboarded };
  }
  if ((s.schemaVersion || 2) < 3) {
    s = { ...s, schemaVersion: 3, words: s.words || {} }; // v2 → v3: add Leitner map
  }
  if ((s.schemaVersion || 3) < 4) {
    // v3 → v4: days become device-keyed grow-only counters so cross-device
    // same-day practice SUMS instead of being clobbered by per-day max.
    const days = {};
    for (const [d, v] of Object.entries(s.days || {})) {
      days[d] = typeof v === "number" ? { _v3: v } : v && typeof v === "object" ? v : {};
    }
    s = { ...s, schemaVersion: 4, days };
  }
  return s;
}

// ---- defensive load: never throw during boot; preserve corrupt value ----
function read() {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return emptyState();
    return normalize(migrate(JSON.parse(raw)));
  } catch (e) {
    try {
      const bad = localStorage.getItem(KEY);
      if (bad) localStorage.setItem(KEY + ":_recovered", bad); // keep for recovery, don't crash
    } catch (_) {
      /* ignore */
    }
    return emptyState();
  }
}

function write(state) {
  const s = normalize(state);
  s.schemaVersion = SCHEMA_VERSION;
  try {
    localStorage.setItem(KEY, JSON.stringify(s));
  } catch (e) {
    /* storage may be full or blocked; progress just won't persist */
  }
  listeners.forEach((fn) => fn(s));
  pushToServer();
}

// Subscribe to progress changes (React components use this to re-render).
export function subscribe(fn) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

export function getState() {
  return read();
}

// ---- derived currencies (never stored → never conflict) ----
// points on a given day = sum across all devices (device-keyed grow-only bucket).
function daySum(bucket) {
  return bucket ? Object.values(bucket).reduce((a, b) => a + (Number(b) || 0), 0) : 0;
}

export function totalXp() {
  return xpOf(read());
}
function xpOf(state) {
  return Object.values(state.days || {}).reduce((a, b) => a + daySum(b), 0);
}

export function streakCount() {
  return streakOf(read());
}
// Consecutive practice days ending today (or yesterday), computed from `days`.
function streakOf(state, now = new Date()) {
  const days = state.days || {};
  const has = (d) => daySum(days[dayKey(d)]) > 0;
  const cur = new Date(now);
  if (!has(cur)) {
    cur.setDate(cur.getDate() - 1);
    if (!has(cur)) return 0;
  }
  let count = 0;
  while (has(cur)) {
    count += 1;
    cur.setDate(cur.getDate() - 1);
  }
  return count;
}

// Total plays across all devices for a lesson (grow-only per device).
export function lessonPlays(lessonId) {
  const l = read().lessons[lessonId];
  return l ? Object.values(l.plays || {}).reduce((a, b) => a + (Number(b) || 0), 0) : 0;
}

// Stars earned for a lesson (0 if never completed).
export function lessonStars(lessonId) {
  return read().lessons[lessonId]?.stars || 0;
}

export function isLessonComplete(lessonId) {
  return lessonStars(lessonId) > 0;
}

// day key like "2026-07-10" in local time.
function dayKey(date) {
  const y = date.getFullYear();
  const m = `${date.getMonth() + 1}`.padStart(2, "0");
  const d = `${date.getDate()}`.padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function starsFor(accuracy) {
  if (accuracy >= 0.95) return 3;
  if (accuracy >= 0.8) return 2;
  if (accuracy >= 0.5) return 1;
  return 0;
}

// Record a finished lesson. Returns a summary for the celebration screen.
export function recordLesson(lessonId, { correct, total, now = new Date() }) {
  const state = read();
  const accuracy = total > 0 ? correct / total : 0;
  const stars = Math.max(starsFor(accuracy), 1); // finishing earns at least 1
  const gainedXp = correct * 10 + stars * 5;

  const prev = state.lessons[lessonId] || { stars: 0, bestAccuracy: 0, plays: {} };
  const dev = deviceId();
  state.lessons[lessonId] = {
    stars: Math.max(prev.stars, stars),
    bestAccuracy: Math.max(prev.bestAccuracy || 0, accuracy),
    plays: { ...prev.plays, [dev]: (prev.plays?.[dev] || 0) + 1 },
  };
  const today = dayKey(now);
  const bucket = state.days[today] || {};
  state.days[today] = { ...bucket, [dev]: (bucket[dev] || 0) + gainedXp };

  write(state);
  return { stars, gainedXp, accuracy, streak: streakOf(state, now) };
}

export function isOnboarded() {
  return read().onboarded;
}

// First-run level select: mark the given lessons as already-known (1 star, so
// they unlock and the learner starts at the right place) and flag onboarding done.
export function completeOnboarding(knownLessonIds = []) {
  const state = read();
  for (const id of knownLessonIds) {
    const prev = state.lessons[id] || { stars: 0, bestAccuracy: 0, plays: {} };
    state.lessons[id] = { ...prev, stars: Math.max(prev.stars, 1) };
  }
  state.onboarded = true;
  write(state);
}

// Derived level from XP: every 100 XP is a level. Returns bar info for the UI.
export function levelInfo() {
  const xp = totalXp();
  const per = 100;
  const level = Math.floor(xp / per) + 1;
  const into = xp % per;
  return { level, into, per, pct: Math.round((into / per) * 100) };
}

// A spaced-repetition review round (not a lesson): award XP + keep the streak,
// but no lesson stars.
export function recordReview({ correct, now = new Date() }) {
  const state = read();
  const gainedXp = correct * 5;
  const today = dayKey(now);
  const dev = deviceId();
  const bucket = state.days[today] || {};
  state.days[today] = { ...bucket, [dev]: (bucket[dev] || 0) + gainedXp };
  write(state);
  return { gainedXp, streak: streakOf(state, now) };
}

// ---- spaced repetition (Leitner) --------------------------------------------
// Record a review answer for one word and advance its Leitner schedule.
export function recordWordResult(ka, correct, now = new Date()) {
  const state = read();
  state.words[ka] = schedule(state.words[ka], correct, dayKey(now));
  write(state);
  return state.words[ka];
}

export function wordState(ka) {
  return read().words[ka] || null;
}

// Order candidate word objects for a review round: due words first (oldest overdue
// and never-studied first), then the soonest-upcoming to fill, capped at `cap`.
export function dueReviewWords(candidates, now = new Date(), cap = 12) {
  const words = read().words;
  const today = dayKey(now);
  const tagged = candidates.map((w) => ({ w, rec: words[w.ka] || null }));
  const due = tagged.filter((x) => isDue(x.rec, today));
  const upcoming = tagged.filter((x) => !isDue(x.rec, today));
  due.sort((a, b) => dueRank(a.rec).localeCompare(dueRank(b.rec)));
  upcoming.sort((a, b) => a.rec.due.localeCompare(b.rec.due));
  return [...due, ...upcoming].slice(0, cap).map((x) => x.w);
}

// XP earned today (for the daily-goal ring).
export function todayXp(now = new Date()) {
  return daySum(read().days[dayKey(now)]);
}

// Last `n` days (oldest→newest) with { day, xp, met } — powers the habit
// calendar so the learner can see their streak build over time.
export function lastNDays(n = 28, now = new Date()) {
  const days = read().days;
  const out = [];
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    const key = dayKey(d);
    const xp = daySum(days[key]);
    out.push({ day: key, xp, met: xp >= DAILY_GOAL });
  }
  return out;
}

// Manually mark a lesson complete (1 star) — a safety valve if a lesson ever
// fails to record. Keeps a higher existing star count.
export function markLessonComplete(lessonId) {
  const state = read();
  const prev = state.lessons[lessonId] || { stars: 0, bestAccuracy: 0, plays: {} };
  state.lessons[lessonId] = { ...prev, stars: Math.max(prev.stars, 1) };
  write(state);
}

// ---- Durability: export/import a JSON backup. Import MERGES (never replaces),
// so restoring an old backup can never regress newer progress (§1.5). ----
export function exportProgress() {
  return JSON.stringify({ app: "georgian-language-app", v: SCHEMA_VERSION, state: read() });
}

export function importProgress(json) {
  try {
    const parsed = typeof json === "string" ? JSON.parse(json) : json;
    const incoming = parsed && parsed.state ? parsed.state : parsed;
    if (!incoming || typeof incoming !== "object" || typeof incoming.lessons !== "object") return false;
    write(merge(read(), migrate(incoming)));
    return true;
  } catch (e) {
    return false;
  }
}

export function resetProgress() {
  write(emptyState());
}

// ---- Optional server durability ----
// When the app is served by server.js (the durable Docker image), progress syncs
// to a SQLite-backed /api/progress endpoint. Sync is pull → MERGE → push, which is
// safe under retries, races, and partial failures (no more xp-wins clobbering).
const SERVER_URL = "/api/progress";
let serverOn = false;

function pushToServer() {
  if (!serverOn || typeof fetch !== "function") return;
  try {
    fetch(SERVER_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ state: read() }),
    }).catch(() => {});
  } catch (e) {
    /* ignore */
  }
}

async function pullFromServer() {
  if (typeof fetch !== "function") return;
  try {
    const r = await fetch(SERVER_URL);
    if (!r.ok) return;
    const data = await r.json();
    serverOn = true;
    const remote = data && data.state ? migrate(data.state) : null;
    if (remote) {
      const merged = merge(read(), remote); // conflict-free union, either direction
      write(merged); // persists locally AND pushes the merged result back
    } else {
      pushToServer();
    }
  } catch (e) {
    /* no server reachable → localStorage only */
  }
}

// Sync on load in a real browser (skipped in tests).
if (
  typeof window !== "undefined" &&
  !(typeof process !== "undefined" && process.env && process.env.NODE_ENV === "test")
) {
  pullFromServer();
}
