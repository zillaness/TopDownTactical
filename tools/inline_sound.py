#!/usr/bin/env python3
"""
file: inline_sound.py (top-down-tactical/tools)
version: 1.0
author: Sam Cao
created: 2026-08-18
description: Inline a folder of audio files into the game's SOUND_ART table, so
             a recorded sound replaces the synthesised one for that key.
ai_update: Update last_updated and version. Append changelog at bottom.

WHY THIS EXISTS

The wiring has been done since v0.62 and the table has been empty ever since,
because the files live on a Windows drive that no sandbox can see. That made
"sound effects" look like a coding task when it is a copy-and-run task. This is
the run half. When the files are in the repo, one command does it.

    python3 tools/inline_sound.py assets/incoming/sound top_down_tactical_vX.Y.html
    python3 tools/inline_sound.py assets/incoming/sound top_down_tactical_vX.Y.html --write

HOW FILES MAP TO SOUNDS

The stem of the filename is the key, and the key must be one the synth already
answers to — sfxAt() looks in SOUND_ART first and falls through to the
oscillators when it finds nothing, so an unknown name would be a file that is
never played and nobody would ever notice.

    shot.ogg            -> SOUND_ART.shot
    glass.1.ogg
    glass.2.ogg
    glass.3.ogg         -> SOUND_ART.glass with three variants, picked at random
    shot.ogg + shot.gain=0.8   (a plain text file next to it) -> per-key gain

Anything the table does not get keeps its synthesised sound. Dropping one file
is a legal, useful drop.

THE CEILING IS ENFORCED HERE

The deliverable is one file under 2MB (CLAUDE.md), the suite asserts it, and
audio is the one thing that can blow through it in a single drop. This refuses
to write a set that would put the build over, and tells you by how much. Base64
costs a third on top of the file size, and that is counted.

Prefer Opus-in-OGG or AAC-in-MP4. A gunshot at 48kbps mono is indistinguishable
from 700kbps of PCM and costs a fifteenth as much. WAV is accepted and warned
about, because it will eat the whole budget on its own.
"""
import argparse
import base64
import os
import re
import sys
from collections import defaultdict

# Exactly the names S11b's synth answers to. A file named anything else is a
# file that would never be played.
KEYS = ["shot", "kick", "breach", "bang", "shout", "hit", "thud",
        "door", "glass", "click", "surrender", "plate"]

CEILING = 2 * 1024 * 1024
BEGIN = "const SOUND_ART = {"
END = "};\n// --- END SOUND ART ---"

MIME = {b"OggS": "audio/ogg", b"RIFF": "audio/wav", b"fLaC": "audio/flac"}


def sniff(raw, name):
    """Container from the magic bytes, not from the extension someone typed."""
    if raw[:4] in MIME:
        return MIME[raw[:4]]
    if raw[4:8] == b"ftyp":
        return "audio/mp4"
    if raw[:3] == b"ID3" or (len(raw) > 1 and raw[0] == 0xFF and (raw[1] & 0xE0) == 0xE0):
        return "audio/mpeg"
    print(f"  ! {name}: cannot tell what this is from its first bytes; skipping")
    return None


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("sound_dir")
    ap.add_argument("html")
    ap.add_argument("--write", action="store_true", help="write the file; otherwise dry run")
    a = ap.parse_args()

    if not os.path.isdir(a.sound_dir):
        sys.exit(f"no such directory: {a.sound_dir}\n"
                 f"Drop the files there — see {a.sound_dir}/README.md for the naming.")

    gains, buckets = {}, defaultdict(list)
    for fn in sorted(os.listdir(a.sound_dir)):
        full = os.path.join(a.sound_dir, fn)
        if not os.path.isfile(full):
            continue
        # gain sidecars first: they are plain text and would otherwise fall
        # through to the container sniffer and be reported as an unreadable file
        m = re.match(r"([a-z]+)\.gain$", fn)
        if m:
            if m.group(1) in KEYS:
                gains[m.group(1)] = float(open(full).read().strip())
            else:
                print(f"  ! {fn}: '{m.group(1)}' is not a sound this game makes")
            continue
        if fn.lower().endswith((".md", ".txt", ".json")):
            continue
        stem = fn.split(".")[0]
        if stem not in KEYS:
            print(f"  ! {fn}: '{stem}' is not a sound this game makes. "
                  f"Names it answers to: {', '.join(KEYS)}")
            continue
        raw = open(full, "rb").read()
        mime = sniff(raw, fn)
        if not mime:
            continue
        if mime == "audio/wav":
            print(f"  ! {fn}: WAV. It will work, and it costs about fifteen times "
                  f"what Opus would for the same sound.")
        buckets[stem].append((fn, mime, raw))

    if not buckets:
        sys.exit("nothing to inline — no files matched a sound name.")

    src = open(a.html, encoding="utf-8").read()
    i, j = src.index(BEGIN), src.index(END)
    current = len(src.encode())
    existing = len(src[i + len(BEGIN):j].encode())

    lines, total_b64 = [], 0
    print(f"{'key':12s} {'files':>5s} {'raw':>10s} {'base64':>10s}")
    for key in KEYS:
        if key not in buckets:
            continue
        entries = buckets[key]
        uris, raw_n = [], 0
        for fn, mime, raw in entries:
            uris.append("data:" + mime + ";base64," + base64.b64encode(raw).decode())
            raw_n += len(raw)
        b64_n = sum(len(u) for u in uris)
        total_b64 += b64_n
        print(f"  {key:10s} {len(entries):>5d} {raw_n:>10,} {b64_n:>10,}")
        g = gains.get(key)
        head = f"  {key}: {{ " + (f"gain: {g}, " if g is not None else "")
        if len(uris) == 1:
            lines.append(head + "src: `" + uris[0] + "` },")
        else:
            lines.append(head + "variants: [")
            for u in uris:
                lines.append("    `" + u + "`,")
            lines.append("  ] },")

    block = BEGIN + "\n" + "\n".join(lines) + "\n"
    projected = current - existing + len(("\n".join(lines) + "\n").encode())
    print(f"\n  file {current:,} -> {projected:,} bytes, ceiling {CEILING:,}")
    if projected > CEILING:
        sys.exit(f"\nREFUSING: that is {projected - CEILING:,} bytes over the ceiling.\n"
                 f"Re-encode the sounds smaller (Opus 48kbps mono) or drop fewer keys.")
    print(f"  {CEILING - projected:,} bytes of headroom left")

    if a.write:
        open(a.html, "w", encoding="utf-8").write(src[:i] + block + src[j:])
        print(f"\nwrote {a.html} — bump the version, run ./tests/run.sh, then ship")
    else:
        print("\ndry run — pass --write to apply")


if __name__ == "__main__":
    main()

# CHANGELOG
# v1.0 (2026-08-18): Written so the sound drop stops being blocked on anything
#   but the files. Refuses to break the byte ceiling, sniffs containers from
#   magic bytes rather than extensions, and rejects names the synth does not
#   answer to — a misnamed file would be silently never played.
