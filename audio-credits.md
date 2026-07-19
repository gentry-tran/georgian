# Audio credits

## Alphabet letter sounds — neural Georgian voice

The 33 Georgian **alphabet letter sounds** are rendered with Microsoft's neural
Georgian voice **ka-GE-GiorgiNeural** (via `edge-tts`) saying each letter's
syllable, then trimmed and normalized. See `scripts/regen-letters.py`.

**Why not "real" recordings?** We tried real human IPA phoneme recordings from
Wikimedia Commons and removed them on purpose: those are linguists demonstrating
isolated, sustained IPA phonemes (e.g. a 1.5-second drone for the voiced velar
fricative that sounds like "vuh"), not a Georgian pronouncing the letter. They
are academically correct but sound wrong for learning the alphabet. There is no
freely-licensed set of native per-letter Georgian recordings; a modern neural
Georgian voice is the accurate option for an isolated letter sound.

Native human recordings ARE used where they exist as free assets — for whole
words (see below).

## Word & phrase audio

Vocabulary and phrase audio is generated with Microsoft neural TTS
(ka-GE-EkaNeural / ka-GE-GiorgiNeural) at build time — see
`scripts/generate-audio-edge.py`. Runtime is fully offline; only the small MP3s
ship.
