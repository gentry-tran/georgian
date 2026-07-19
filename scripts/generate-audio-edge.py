#!/usr/bin/env python3
"""Render every curriculum Georgian phrase to a NATURAL neural clip using
Microsoft Edge's online neural voice (ka-GE-EkaNeural) via edge-tts, then bundle
the MP3s. Files are named by a hash of their AUDIO BYTES so a re-render always
gets a new URL (permanent cache-busting). Writes src/data/audioManifest.js.

Run with the venv (needs internet at generation time only):
  .piper/venv/bin/python scripts/generate-audio-edge.py

Runtime stays fully offline — only the small MP3s ship.
"""
import asyncio
import hashlib
import json
import re
import subprocess
import tempfile
from pathlib import Path

import edge_tts

ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / "public" / "audio"
DATA = ROOT / "src" / "data"
VOICE = "ka-GE-EkaNeural"
# The male voice renders Georgian ejectives (k', t', p', q') harsher/clearer, so
# the alphabet letters use it; words stay on the female voice.
LETTER_VOICE = "ka-GE-GiorgiNeural"
CONCURRENCY = 6

OUT.mkdir(parents=True, exist_ok=True)

# Collect unique Georgian strings (ka: "...") across the curriculum.
texts, seen = [], set()
letter_texts = set()  # the `say` clips (alphabet) — spoken slower + tightly trimmed
for f in ("a1.js", "a2.js", "a2plus.js", "b1.js", "b2.js", "b2plus.js", "c1.js"):
    src = (DATA / f).read_text(encoding="utf-8")
    # `say` is always spoken (letter sounds, incl. single-char vowels) — keep all.
    for m in re.finditer(r'say:\s*"([^"]+)"', src):
        t = m.group(1)
        letter_texts.add(t)
        if t not in seen:
            seen.add(t)
            texts.append(t)
    # `ka` words/phrases are spoken; skip lone letters (voiced via `say`).
    for m in re.finditer(r'ka:\s*"([^"]+)"', src):
        t = m.group(1)
        if len(t) == 1:
            continue
        if t not in seen:
            seen.add(t)
            texts.append(t)
print(f"Found {len(texts)} unique Georgian strings. Voice: {VOICE}")


async def synth(text: str, rate: str = "+0%", voice: str = VOICE) -> bytes:
    comm = edge_tts.Communicate(text, voice, rate=rate)
    buf = bytearray()
    async for chunk in comm.stream():
        if chunk["type"] == "audio":
            buf += chunk["data"]
    return bytes(buf)


VOWELS = {"ა", "ე", "ი", "ო", "უ"}


def lengthen(raw: bytes, tempo: float = 0.5) -> bytes:
    """Time-stretch (pitch-preserved) — lone vowels are spoken too briefly, so
    stretch them ~2x into a clear, sustained sound."""
    with tempfile.NamedTemporaryFile(suffix=".mp3", delete=False) as src:
        src.write(raw)
        src_path = src.name
    try:
        with tempfile.NamedTemporaryFile(suffix=".mp3") as dst:
            subprocess.run(
                ["ffmpeg", "-y", "-loglevel", "error", "-i", src_path,
                 "-af", f"atempo={tempo}", "-b:a", "48k", dst.name],
                check=True,
            )
            return Path(dst.name).read_bytes()
    finally:
        Path(src_path).unlink(missing_ok=True)


def trim_silence(raw: bytes) -> bytes:
    """Strip leading/trailing dead air so clips are tight and snappy (edge-tts
    adds ~1s of silence). Keeps a tiny 60ms tail so it doesn't sound clipped."""
    with tempfile.NamedTemporaryFile(suffix=".mp3", delete=False) as src:
        src.write(raw)
        src_path = src.name
    try:
        with tempfile.NamedTemporaryFile(suffix=".mp3") as dst:
            subprocess.run(
                ["ffmpeg", "-y", "-loglevel", "error", "-i", src_path,
                 "-af",
                 "silenceremove=start_periods=1:start_threshold=-40dB:"
                 "stop_periods=-1:stop_threshold=-40dB,"
                 "apad=pad_dur=0.06",
                 "-b:a", "48k", dst.name],
                check=True,
            )
            return Path(dst.name).read_bytes()
    finally:
        Path(src_path).unlink(missing_ok=True)


def _peak_db(path: str) -> float:
    out = subprocess.run(
        ["ffmpeg", "-hide_banner", "-i", path, "-af", "volumedetect", "-f", "null", "-"],
        capture_output=True, text=True,
    ).stderr
    m = re.search(r"max_volume:\s*(-?[\d.]+)", out)
    return float(m.group(1)) if m else 0.0


def boost_if_quiet(raw: bytes) -> bytes:
    """Keep the pristine neural audio for normal clips (no re-encode, no quality
    loss). Only the intrinsically-quiet isolated letters get a PLAIN gain boost
    (no compression), which raises volume without touching the natural timbre."""
    with tempfile.NamedTemporaryFile(suffix=".mp3", delete=False) as src:
        src.write(raw)
        src_path = src.name
    try:
        peak = _peak_db(src_path)
        if peak > -10:
            return raw  # already loud enough — ship untouched
        gain = min(40.0, -3.0 - peak)  # peak-normalize quiet letters to ~-3 dB
        with tempfile.NamedTemporaryFile(suffix=".mp3") as dst:
            subprocess.run(
                ["ffmpeg", "-y", "-loglevel", "error", "-i", src_path,
                 "-af", f"volume={gain:.1f}dB", "-b:a", "48k", dst.name],
                check=True,
            )
            return Path(dst.name).read_bytes()
    finally:
        Path(src_path).unlink(missing_ok=True)


async def main():
    manifest = {}
    sem = asyncio.Semaphore(CONCURRENCY)
    done = 0

    async def one(text):
        nonlocal done
        async with sem:
            for attempt in range(3):
                try:
                    is_letter = text in letter_texts
                    # Alphabet clips: male voice (harsher ejectives), slower so
                    # short vowels are clear and the ejective release is audible.
                    audio = await synth(
                        text,
                        rate="-22%" if is_letter else "+0%",
                        voice=LETTER_VOICE if is_letter else VOICE,
                    )
                    if not audio:
                        raise RuntimeError("empty audio")
                    if is_letter:
                        audio = await asyncio.to_thread(trim_silence, audio)
                        if text in VOWELS:  # lone vowels are too brief — stretch
                            audio = await asyncio.to_thread(lengthen, audio, 0.5)
                    # A few short syllables/vowels are mildly quiet but have real
                    # signal, so a gentle gain is clean (no distortion).
                    audio = await asyncio.to_thread(boost_if_quiet, audio)
                    name = hashlib.sha1(audio).hexdigest()[:16] + ".mp3"
                    (OUT / name).write_bytes(audio)
                    manifest[text] = name
                    done += 1
                    if done % 40 == 0:
                        print(f"  {done}/{len(texts)}…", flush=True)
                    return
                except Exception as e:  # noqa: BLE001
                    if attempt == 2:
                        print("FAILED:", text, e)
                    await asyncio.sleep(1 + attempt)

    await asyncio.gather(*(one(t) for t in texts))

    manifest_js = (
        "// AUTO-GENERATED by scripts/generate-audio-edge.py — do not edit by hand.\n"
        "// Maps each Georgian string to its bundled neural clip (Microsoft ka-GE-EkaNeural).\n"
        f"export const AUDIO_CLIPS = {json.dumps(manifest, ensure_ascii=True)};\n"
    )
    (DATA / "audioManifest.js").write_text(manifest_js, encoding="utf-8")
    print(f"Generated {len(manifest)} neural clips.")


asyncio.run(main())
