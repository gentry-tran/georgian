// Integration test for the durable sync server (server.js): SQLite persistence +
// server-side CRDT merge across two devices + survival across a restart.
// Run: node scripts/test-server.mjs
import { spawn } from "node:child_process";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

const PORT = 8199;
const BASE = `http://localhost:${PORT}`;
const DATA_DIR = mkdtempSync(join(tmpdir(), "cheet-srv-"));
let failures = 0;
const ok = (cond, msg) => { console.log(`${cond ? "  PASS" : "  FAIL"} ${msg}`); if (!cond) failures++; };

function start() {
  const p = spawn("node", ["server.js"], { env: { ...process.env, PORT: String(PORT), DATA_DIR }, stdio: "pipe" });
  return new Promise((res) => {
    p.stdout.on("data", (d) => { if (String(d).includes("Georgian app on")) res(p); });
    p.stderr.on("data", (d) => process.stderr.write(d));
  });
}
const post = (state) => fetch(`${BASE}/api/progress`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ state }) }).then((r) => r.json());
const get = () => fetch(`${BASE}/api/progress`).then((r) => r.json());
const kill = (p) => new Promise((res) => { p.on("exit", res); p.kill(); });
const sum = (bucket) => Object.values(bucket || {}).reduce((a, b) => a + b, 0);

try {
  let srv = await start();
  console.log("server up (store logged above)");

  // device A
  await post({ schemaVersion: 4, lessons: { L1: { stars: 2, bestAccuracy: 0.9, plays: { dA: 1 } } },
    days: { "2026-07-17": { dA: 30 } }, words: { ა: { box: 2, due: "2026-07-19", lastReview: "2026-07-17", lapses: 0 } }, onboarded: true });
  // device B — overlaps L1 (lower stars), adds L2, same-day different device, older word record
  await post({ schemaVersion: 4, lessons: { L1: { stars: 1, bestAccuracy: 0.5, plays: { dB: 3 } }, L2: { stars: 3, bestAccuracy: 1, plays: { dB: 1 } } },
    days: { "2026-07-17": { dB: 20 } }, words: { ა: { box: 5, due: "2026-08-01", lastReview: "2026-07-10", lapses: 0 } }, onboarded: false });

  const merged = (await get()).state;
  ok(merged.lessons.L1.stars === 2, "L1 stars = max(2,1) = 2");
  ok(merged.lessons.L1.bestAccuracy === 0.9, "L1 bestAccuracy = max(.9,.5)");
  ok(merged.lessons.L1.plays.dA === 1 && merged.lessons.L1.plays.dB === 3, "L1 plays union across devices");
  ok(merged.lessons.L2.stars === 3, "L2 (only on B) present");
  ok(sum(merged.days["2026-07-17"]) === 50, "same-day cross-device sums to 50 (no clobber)");
  ok(merged.words["ა"].lastReview === "2026-07-17", "word LWW keeps newer lastReview (A), not B");
  ok(merged.onboarded === true, "onboarded OR = true");

  // restart with the SAME data dir → must persist
  await kill(srv);
  srv = await start();
  const after = (await get()).state;
  ok(after && after.lessons.L1.stars === 2 && sum(after.days["2026-07-17"]) === 50, "state survived a restart (SQLite persistence)");

  // concurrency (Fable (d)): N overlapping POSTs, each a distinct device on a fresh
  // day. Without the BEGIN IMMEDIATE transaction these would lost-update each other.
  const N = 12;
  await Promise.all(
    Array.from({ length: N }, (_, i) =>
      post({ schemaVersion: 4, lessons: {}, days: { "2026-07-18": { ["c" + i]: i + 1 } }, words: {}, onboarded: false })
    )
  );
  const conc = (await get()).state;
  ok(sum(conc.days["2026-07-18"]) === (N * (N + 1)) / 2, `${N} concurrent POSTs: every delta survives (no lost update)`);
  ok(Object.keys(conc.days["2026-07-18"]).length === N, `${N} concurrent POSTs: all device keys present`);
  await kill(srv);
} finally {
  rmSync(DATA_DIR, { recursive: true, force: true });
}
console.log(`\n${failures ? "FAILURES: " + failures : "ALL SERVER TESTS PASSED"}`);
process.exit(failures ? 1 : 0);
