# Levels & curriculum provenance

This app's level structure follows the **CEFR** (Common European Framework of
Reference for Languages) as applied to Georgian by **geofl.ge** — the Georgian
Ministry of Education & Science's "Georgian as a Foreign Language" program.

## Sources

- **geofl.ge** — Georgian as a Foreign Language (Ministry program portal):
  https://www.geofl.ge/
- **Ministry of Education & Science of Georgia**, "Program for Teaching Georgian
  as a Foreign Language": https://mes.gov.ge/content.php?id=4547&lang=eng
- **Tbilisi State University** Georgian courses (uses the same standard):
  https://old.tsu.ge/en/liqr3q5iv7yb9aynv/georgian_courses/
- **CEFR** global scale (Council of Europe) — the underlying framework.

### Ministry of Education & Science (MES) program

The MES "Teaching Georgian as a Foreign Language" program
([mes.gov.ge id=4547](https://mes.gov.ge/content.php?id=4547&lang=eng)) is built
on the **European CEFR communicative model**, spanning **A1–A2 and B1–B2**. It
ships a standardized textbook set (a theoretical course + a practical-tasks
collection) and publishes **e-versions of the books** through the geofl.ge
portal. This app mirrors that CEFR level *structure* and communicative,
can-do orientation; it does **not** reproduce any text, tasks, or content from
those books — all vocabulary and phrases here are written for this app.

geofl.ge divides proficiency into **A1, A2, A2+, B1, B2, B2+, C1**, grouped as:

- **A (A1–A2)** — *Basic user*: everyday survival language.
- **B (B1–B2)** — *Independent user*: handle most situations, express opinions.
- **C (C1–C2)** — *Proficient user*: fluent, nuanced, near-native.

> Content note: the level *structure* and CEFR *descriptors* below are factual /
> framework knowledge. The vocabulary and phrases in `src/data/*.js` are written
> for this app; no copyrighted lesson material from geofl.ge or any course was
> copied.

## What each level means (can-do, in this app)

| Level | Band | CEFR "can-do" (summary) | This app's focus |
|-------|------|--------------------------|------------------|
| **A1** Foundation | A / Basic | Understand & use familiar everyday expressions; introduce yourself; ask/answer simple personal questions. | Alphabet, greetings, getting acquainted, numbers, family, café, directions. |
| **A2** Elementary | A / Basic | Communicate in simple routine tasks; describe your background and immediate environment. | Time & routine, market & food, making plans, restaurant. |
| **B1** Independent | B / Independent | Deal with most travel situations; describe experiences, opinions, and plans. | Work & study, travel & reservations, health, opinions & stories. |
| **B2** Upper-intermediate | B / Independent | Interact with fluency and spontaneity; give clear, detailed views on a range of topics. | News & media, feelings & relationships, city & environment, culture. |
| **C1** Advanced *(planned)* | C / Proficient | Express ideas fluently and precisely; understand demanding, longer texts. | — |

## How progression works in the app

- Levels are ordered **A1 → A2 → B1 → B2**; each level is a set of thematic
  **units**, each unit a set of **lessons**.
- A lesson unlocks when the previous one is completed (linear path).
- Every lesson is a mixed, speaking-forward session (multiple choice, listening,
  typing/dictation, speaking, sentence-building, matching, dialogue).
- **Daily vocabulary practice:** the **Review** mode (spaced repetition) quizzes
  words drawn from *all* completed lessons across every level — the recommended
  daily habit to retain vocabulary.

## Adding levels / content

Each level is one file in `src/data/` (`a1.js`, `a2.js`, `b1.js`, `b2.js`) and is
registered in `src/data/curriculum.js` (`LEVELS`). Add a lesson to a unit and it
appears on the roadmap automatically, gated behind the previous lesson.
