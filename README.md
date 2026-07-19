# 🇬🇪 Learn Georgian · ისწავლე ქართული

A playful, **fully offline** app for learning **conversational Georgian**. No
account, no backend, no internet required once it's running — everything (the
curriculum, audio via your browser's speech engine, progress, and the cat memes)
lives on your machine.

The roadmap is modeled on [**geofl.ge**](https://www.geofl.ge/) — the Georgian
Ministry of Education's "Georgian as a Foreign Language" program — which follows
the European **CEFR** framework (A1 → A2 → B1 → …). The focus here is **speaking
and everyday conversation**: greeting people, getting acquainted, ordering in a
café, shopping, making plans, and getting around.

---

## ✨ What's inside

- **Step-by-step roadmap** grouped by CEFR level → thematic unit → lesson.
  Finish a lesson to **unlock** the next. Always clear where you are and what's
  next.
- **Six exercise types**, weighted toward speaking:
  - **Multiple choice** (English → Georgian and back)
  - **Listen & choose** — hear the word (browser text-to-speech, `ka-GE`)
  - **Speak it** — say the phrase aloud, tap to hear it
  - **Build the sentence** — arrange Georgian word tiles
  - **Match pairs**
  - **Dialogue reply** — pick your line in a real conversation
- **Playful UX** — cat-meme reactions on correct answers, combo streaks,
  confetti, stars, XP, and a daily streak counter.
- **Progress saved locally** (localStorage). Come back tomorrow and pick up where
  you left off.

## 🗺️ Roadmap

| Level | Band | Theme | Units |
|-------|------|-------|-------|
| **A1 — Foundation** | Basic | First words & survival | Alphabet (See & Choose · Listen & Choose · Read & Recall — all 33 letters each) · Greetings · Getting Acquainted · Numbers · Family · Everyday Words · Café · Around Town |
| **A2 — Elementary** | Basic | Everyday life | Time & Routine · Food & Market · Making Plans · Restaurant |
| **B1 — Independent** | Independent | Real conversations | Work & Study · Travel & Reservations · Health · Opinions & Stories |

Higher levels (A2+, B2, B2+, C1 on the geofl.ge scale) are easy to add — see
[Extending the curriculum](#-extending-the-curriculum).

---

## 🚀 Run it

You need **one** of: Node.js 18+ **or** Docker.

### Option A — Node (development)

```bash
npm install
npm start          # opens http://localhost:3000
```

### Option B — Docker (one machine, one command)

```bash
docker compose up --build georgian-language-app   # static, progress in browser
# open http://localhost:8080
```

### Option B2 — Docker with durable saved progress (SQLite)

A self-contained image (`Dockerfile.server`) serves the app **and** runs a tiny
Node server that persists progress to **SQLite** in a mounted volume — so it
survives browser-cache clears, new devices, and restarts:

```bash
docker compose up --build durable
# open http://localhost:8080  (progress saved to the georgian_data volume)
```

The static app still works everywhere without this; when the server is present
it syncs progress to `/api/progress` automatically, otherwise it uses
localStorage. You can also always **Download/Restore a backup** from the
in-app progress screen.

### Option C — Prebuilt image from GitHub

Once this repo is pushed to GitHub, the `docker-publish` workflow publishes an
image to the GitHub Container Registry on every push to `main`:

```bash
docker pull ghcr.io/<owner>/georgian-language-app:latest
docker run -p 8080:80 ghcr.io/<owner>/georgian-language-app:latest
# open http://localhost:8080
```

### Build a static bundle

```bash
npm run build      # outputs ./build — serve it with any static file server
```

---

## 🧪 Tests

```bash
CI=true npm test
```

Covers curriculum integrity (every lesson can build a valid quiz), the session
builder, the local progress/XP/streak store, the roadmap unlock logic, and the
multiple-choice interaction.

---

## 🔊 Audio note

Audio works **everywhere, offline**. The app plays **pre-rendered clips bundled in
`public/audio`** — it does **not** use the browser's Web Speech voice (whose quality
varies wildly per browser/OS and sounded robotic). One consistent voice everywhere.

- **Words & phrases** — Microsoft neural Georgian voice `ka-GE-EkaNeural`
  (generated at build time by `scripts/generate-audio-edge.py`).
- **The 33 alphabet letters** — neural `ka-GE-GiorgiNeural` syllables
  (`scripts/regen-letters.py`). See `audio-credits.md` for why native per-letter
  recordings aren't used.

Clips are named by a hash of their audio bytes (permanent cache-busting) and mapped
in `src/data/audioManifest.js`. Nothing is ever sent to a server at runtime; only
the small MP3s ship. A test (`src/data/content.lint.test.js`) fails the build if any
spoken word points at a missing clip.

## 🧩 Extending the curriculum

All content is plain data in [`src/data/`](src/data/) — `a1.js`, `a2.js`,
`b1.js`. A lesson is just words + optional phrases + an optional dialogue:

```js
{
  id: "a1-greetings-1",
  title: "Hello & Goodbye",
  icon: "👋",
  goal: "Greet people and say goodbye at any time of day.",
  words: [{ ka: "გამარჯობა", tr: "gamarjoba", en: "hello" }],
  phrases: [{ ka: "როგორ ხარ?", tr: "rogor khar?", en: "how are you?" }],
  dialogue: [{ who: "A", ka: "...", tr: "...", en: "..." }],
}
```

The exercise engine (`src/lib/session.js`) automatically turns that into a mixed,
speaking-forward practice session. Add a lesson to a unit and it appears on the
roadmap, correctly gated behind the previous one.

> **Content accuracy:** translations target common, everyday usage and are meant
> for practice. Corrections and additions are welcome — edit the data files.

## 🏗️ Project structure

```
src/
  data/          CEFR levels + lessons (a1/a2/b1) and curriculum helpers
  lib/           session builder, progress store, speech (TTS), memes, shuffle
  components/    Roadmap, LessonSession engine, Header, MemeBurst, Confetti
    exercises/   MultipleChoice, ListenChoice, SpeakCard, BuildSentence,
                 MatchPairs, DialogueReply
  assets/memes/  local cat gifs (no external CDN)
```
