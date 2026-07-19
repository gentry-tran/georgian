// Optional durable server: serves the built static app AND persists progress to
// SQLite (Node's built-in node:sqlite) in a mounted volume, so progress survives
// browser-cache clears, new devices, and image restarts. Falls back to a JSON
// file if node:sqlite isn't available. The static app also runs fine WITHOUT
// this server (nginx image / any static host) — progress just stays in
// localStorage then.
const http = require("http");
const fs = require("fs");
const path = require("path");
// Same CRDT merge the browser client uses — so a POST MERGES with what's stored
// instead of clobbering it (two devices writing between loads can't lose data).
const { merge } = require("./src/lib/mergeCore");

const PORT = process.env.PORT || 8080;
const BUILD = path.join(__dirname, "build");
const DATA_DIR = process.env.DATA_DIR || path.join(__dirname, "data");
fs.mkdirSync(DATA_DIR, { recursive: true });

// --- storage: SQLite if available, else a JSON file (both live in the volume) ---
let store;
try {
  const { DatabaseSync } = require("node:sqlite");
  const db = new DatabaseSync(path.join(DATA_DIR, "progress.db"));
  // Wait (don't throw SQLITE_BUSY → 500) if a concurrent BEGIN IMMEDIATE writer
  // holds the lock; the loser blocks up to 5s then proceeds.
  db.exec("PRAGMA busy_timeout = 5000");
  db.exec("CREATE TABLE IF NOT EXISTS progress (id INTEGER PRIMARY KEY, json TEXT)");
  const get = db.prepare("SELECT json FROM progress WHERE id = 1");
  const put = db.prepare(
    "INSERT INTO progress (id, json) VALUES (1, ?) ON CONFLICT(id) DO UPDATE SET json = excluded.json"
  );
  const load = () => (get.get() || {}).json || null;
  store = {
    kind: "sqlite",
    load,
    save: (json) => put.run(json),
    // Atomic read-modify-write: BEGIN IMMEDIATE serializes concurrent writers
    // (across connections/processes), so two overlapping POSTs can't lose an
    // update. mutate(currentJson) -> newJson.
    tx: (mutate) => {
      db.exec("BEGIN IMMEDIATE");
      try {
        const next = mutate(load());
        put.run(next);
        db.exec("COMMIT");
        return next;
      } catch (err) {
        db.exec("ROLLBACK");
        throw err;
      }
    },
  };
  console.log("Progress store: SQLite at", path.join(DATA_DIR, "progress.db"));
} catch (e) {
  const FILE = path.join(DATA_DIR, "progress.json");
  const load = () => (fs.existsSync(FILE) ? fs.readFileSync(FILE, "utf8") : null);
  store = {
    kind: "file",
    load,
    save: (json) => fs.writeFileSync(FILE, json),
    // Single-process: the whole request 'end' callback runs synchronously (sync
    // fs), so read-modify-write is atomic on one node process.
    tx: (mutate) => {
      const next = mutate(load());
      fs.writeFileSync(FILE, next);
      return next;
    },
  };
  // NOTE: sync fs makes read-modify-write atomic within ONE node process, but the
  // JSON fallback has no cross-process lock — it is single-writer only. The durable
  // image uses node:sqlite (Node 22+); this path is a dev/older-runtime fallback.
  console.log("Progress store: JSON file at", FILE, "(node:sqlite unavailable — single-writer)");
}

const MIME = {
  ".html": "text/html", ".js": "application/javascript", ".css": "text/css",
  ".json": "application/json", ".mp3": "audio/mpeg", ".png": "image/png",
  ".jpg": "image/jpeg", ".jpeg": "image/jpeg", ".gif": "image/gif",
  ".webp": "image/webp", ".woff2": "font/woff2", ".ico": "image/x-icon",
  ".svg": "image/svg+xml", ".map": "application/json",
};

function serveStatic(req, res) {
  // Prevent path traversal; default to index.html (SPA).
  const urlPath = decodeURIComponent((req.url || "/").split("?")[0]);
  let rel = path.normalize(urlPath).replace(/^(\.\.[/\\])+/, "");
  let file = path.join(BUILD, rel);
  if (!file.startsWith(BUILD)) file = path.join(BUILD, "index.html");
  fs.stat(file, (err, st) => {
    if (err || st.isDirectory()) file = path.join(BUILD, "index.html");
    fs.readFile(file, (e2, data) => {
      if (e2) {
        res.writeHead(404);
        return res.end("Not found");
      }
      res.writeHead(200, { "Content-Type": MIME[path.extname(file)] || "application/octet-stream" });
      res.end(data);
    });
  });
}

const server = http.createServer((req, res) => {
  if (req.url === "/api/progress" && req.method === "GET") {
    const json = store.load();
    res.writeHead(200, { "Content-Type": "application/json" });
    return res.end(json || JSON.stringify({ state: null }));
  }
  if (req.url === "/api/progress" && req.method === "POST") {
    let body = "";
    req.on("data", (c) => {
      body += c;
      if (body.length > 1_000_000) req.destroy(); // cap payload
    });
    req.on("end", () => {
      try {
        const incoming = JSON.parse(body); // validate + parse
        // Atomic read-merge-write so overlapping POSTs can't lose an update.
        const out = store.tx((existingStr) => {
          const existing = existingStr ? JSON.parse(existingStr) : null;
          return JSON.stringify({ state: merge(existing && existing.state, incoming && incoming.state) });
        });
        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(out); // return merged so the client can adopt the authoritative copy
      } catch (e) {
        res.writeHead(400);
        res.end('{"ok":false}');
      }
    });
    return;
  }
  serveStatic(req, res);
});

server.listen(PORT, () => console.log(`Georgian app on http://localhost:${PORT} (${store.kind} store)`));
