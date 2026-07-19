#!/usr/bin/env python3
"""Regenerate ONLY the 33 alphabet letter clips with the neural Georgian voice.

Why: the alphabet was briefly repointed at Wikimedia IPA *phoneme* recordings.
Those are real humans, but they are linguists demonstrating isolated, sustained
IPA sounds (e.g. a 1.5s drone for the voiced velar fricative that sounds like
"vuh") — not a Georgian saying the letter. That is objectively the wrong source
for learning the alphabet. There is no free native per-letter Georgian recording
anywhere, so the accurate option is a modern neural Georgian voice saying the
syllable clearly.

This renders each letter's `say` syllable with ka-GE, trims dead air, gives lone
vowels a gentle stretch so they're audible, peak-normalizes quiet clips, names
each file by a hash of its AUDIO BYTES (permanent cache-busting), and merges the
33 results into the existing manifest (word/phrase clips untouched).

Run (needs internet at generation time only):
  .piper/venv/bin/python scripts/regen-letters.py
"""
import asyncio
import hashlib
import json
import re
import shutil
import subprocess
import tempfile
from pathlib import Path

import edge_tts

ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / "public" / "audio"
DATA = ROOT / "src" / "data"
MANIFEST = DATA / "audioManifest.js"

_cands = [Path.home() / "homebrew/bin/ffmpeg",
          Path("/opt/homebrew/bin/ffmpeg"),
          Path("/usr/local/bin/ffmpeg")]
FF = shutil.which("ffmpeg") or next((str(p) for p in _cands if p.exists()), None)
assert FF, "ffmpeg not found on PATH or common homebrew locations"

# Male voice — renders Georgian ejectives (k', p', t', q') harsher and clearer.
LETTER_VOICE = "ka-GE-GiorgiNeural"
VOWELS = {"ა", "ე", "ი", "ო", "უ"}  # ა ე ი ო უ

# Pull the 33 letter `say` strings straight from a1.js (source of truth).
a1 = (DATA / "a1.js").read_text(encoding="utf-8")
block = re.search(r"const LETTERS = \[(.*?)\];", a1, re.S).group(1)
SAYS = re.findall(r'say:\s*"([^"]+)"', block)
assert len(SAYS) == 33, f"expected 33 letters, got {len(SAYS)}"


async def synth(text: str, voice: str, rate: str) -> bytes:
    comm = edge_tts.Communicate(text, voice, rate=rate)
    buf = bytearray()
    async for chunk in comm.stream():
        if chunk["type"] == "audio":
            buf += chunk["data"]
    return bytes(buf)


def _ff(raw: bytes, af: str) -> bytes:
    with tempfile.NamedTemporaryFile(suffix=".mp3", delete=False) as s:
        s.write(raw)
        sp = s.name
    try:
        with tempfile.NamedTemporaryFile(suffix=".mp3") as d:
            subprocess.run([FF, "-y", "-loglevel", "error", "-i", sp,
                            "-af", af, "-b:a", "64k", d.name], check=True)
            return Path(d.name).read_bytes()
    finally:
        Path(sp).unlink(missing_ok=True)


def trim(raw: bytes) -> bytes:
    return _ff(raw,
               "silenceremove=start_periods=1:start_threshold=-40dB:"
               "stop_periods=-1:stop_threshold=-40dB,apad=pad_dur=0.06")


def stretch(raw: bytes, tempo: float) -> bytes:
    return _ff(raw, f"atempo={tempo}")


def peak_db(raw: bytes) -> float:
    with tempfile.NamedTemporaryFile(suffix=".mp3") as t:
        t.write(raw)
        t.flush()
        out = subprocess.run([FF, "-hide_banner", "-i", t.name, "-af",
                              "volumedetect", "-f", "null", "-"],
                             capture_output=True, text=True).stderr
    m = re.search(r"max_volume:\s*(-?[\d.]+)", out)
    return float(m.group(1)) if m else 0.0


def norm(raw: bytes) -> bytes:
    # EBU R128 loudness normalization → consistent perceived volume across all 33
    # letters (peak-only left some clips quiet/loud relative to each other).
    return _ff(raw, "loudnorm=I=-16:TP=-1.5:LRA=11")


def duration(path: Path) -> float:
    out = subprocess.run([FF, "-i", str(path)], capture_output=True, text=True).stderr
    m = re.search(r"Duration: 00:00:([\d.]+)", out)
    return float(m.group(1)) if m else 0.0


async def main():
    # start from existing manifest so word clips are preserved
    txt = MANIFEST.read_text(encoding="utf-8")
    manifest = json.loads(re.search(r"AUDIO_CLIPS = (\{.*\});", txt, re.S).group(1))

    # Georgian's hard consonants — the alveolar trill, the ejectives, and the
    # postalveolar fricative — need MORE time to articulate clearly, so they render
    # slower. These are exactly the letters neural TTS tends to mangle.
    HARD = {"რა", "ჭა", "ჟა", "ყა", "წა", "კა", "პა", "ტა", "ღა", "ხა", "ცა", "ძა", "ჩა"}
    report = []
    for say in SAYS:
        rate = "-28%" if say in HARD else "-10%"
        raw = await synth(say, LETTER_VOICE, rate=rate)
        audio = trim(raw)
        if say in VOWELS:            # lone vowels are too brief — gentle 1.4x
            audio = stretch(audio, 1 / 1.4)
        audio = norm(audio)
        name = hashlib.sha1(audio).hexdigest()[:16] + ".mp3"
        (OUT / name).write_bytes(audio)
        manifest[say] = name
        dur = duration(OUT / name)
        report.append((say, name, len(audio), dur))
        print(f"  {say:<3} -> {name}  {len(audio):>6}b  {dur:.2f}s")

    js = ("// AUTO-GENERATED by scripts/generate-audio-edge.py — do not edit by hand.\n"
          "// Maps each Georgian string to its bundled neural clip (Microsoft ka-GE).\n"
          f"export const AUDIO_CLIPS = {json.dumps(manifest, ensure_ascii=True)};\n")
    MANIFEST.write_text(js, encoding="utf-8")

    bad = [r for r in report if r[3] < 0.25 or r[3] > 1.6 or r[2] < 1500]
    print(f"\nRegenerated {len(report)}/33 letters (neural ka-GE-GiorgiNeural).")
    print("Suspicious (too short/long/tiny):", [b[0] for b in bad] or "none")


asyncio.run(main())
