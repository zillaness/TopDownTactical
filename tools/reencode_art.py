#!/usr/bin/env python3
"""
file: reencode_art.py (top-down-tactical/tools)
version: 1.0
author: Sam Cao
created: 2026-08-18
description: Re-encode every WebP inlined in the game file at a chosen quality,
             and report what it cost — bytes back, and channel error measured
             only where the sprite is actually opaque.
ai_update: Update last_updated and version. Append changelog at bottom.

WHY THIS EXISTS, AND WHY IT IS SAFE TO RUN

The deliverable is one self-contained HTML file with a ceiling of about 1.5-2MB
(CLAUDE.md), and 68% of it is art. There is no free saving left: the four PNGs
are already lossless WebP, no two assets are byte-identical, and the vehicle
frames are authored at the 2x standard the art brief requires, which is already
under-resolved at maximum zoom.

So the only lever is encoder quality, and this makes that lever measurable and
repeatable instead of a one-off edit nobody can reproduce.

IT IS REVERSIBLE. 104 of the embedded assets are byte-identical to files under
assets/source/, and those in turn come from the raw PNGs in assets/incoming/.
Nothing here touches either. To undo a re-encode, re-inline from assets/source/.

WHAT THE ERROR NUMBERS MEAN

Error is measured against the image currently embedded, per channel, and ONLY
where alpha > 8 — error underneath transparent pixels is invisible and would
flatter the number. Alpha itself is coded losslessly by libwebp, and the script
asserts that: any run that moves an alpha value by even 1 is a bug, not a
tradeoff, and it refuses to write.

    python3 tools/reencode_art.py top_down_tactical_v0.75.html --quality 75
    python3 tools/reencode_art.py top_down_tactical_v0.75.html --quality 75 --write
"""
import argparse
import base64
import io
import re
import sys

try:
    import numpy as np
    from PIL import Image
except ImportError:
    sys.exit("needs pillow and numpy: pip install pillow numpy")

URI = re.compile(r"data:image/webp;base64,([A-Za-z0-9+/=]+)")


def key_before(src, pos):
    """The table key this data URI belongs to, for the report."""
    seg = src[max(0, pos - 320):pos]
    keys = re.findall(r"\n  ([A-Za-z_][A-Za-z0-9_]*)\s*:", seg)
    return keys[-1] if keys else "?"


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("html")
    ap.add_argument("--quality", type=int, default=75)
    ap.add_argument("--method", type=int, default=6, help="libwebp effort, 0-6")
    ap.add_argument("--write", action="store_true", help="write the file; otherwise dry run")
    ap.add_argument("--top", type=int, default=12, help="how many assets to itemise")
    a = ap.parse_args()

    src = open(a.html, encoding="utf-8").read()
    before_file = len(src.encode())
    rows, out, cursor = [], [], 0
    all_err, alpha_moved = [], 0

    for m in URI.finditer(src):
        raw = base64.b64decode(m.group(1))
        im = Image.open(io.BytesIO(raw))
        im.load()
        was = np.asarray(im.convert("RGBA")).astype(np.int16)

        buf = io.BytesIO()
        im.save(buf, "WEBP", quality=a.quality, method=a.method, exact=True)
        now_raw = buf.getvalue()
        now = np.asarray(Image.open(io.BytesIO(now_raw)).convert("RGBA")).astype(np.int16)

        # alpha is coded losslessly; if it moved, something is wrong
        amax = int(np.abs(was[:, :, 3] - now[:, :, 3]).max())
        alpha_moved += 1 if amax else 0

        opaque = was[:, :, 3] > 8
        if opaque.any():
            all_err.append(np.abs(was[:, :, :3] - now[:, :, :3])[opaque].ravel())

        new_uri = "data:image/webp;base64," + base64.b64encode(now_raw).decode()
        # never grow an asset: an already-tight encode can come back bigger
        keep_old = len(new_uri) >= len(m.group(0))
        rows.append((key_before(src, m.start()), len(m.group(0)),
                     len(m.group(0)) if keep_old else len(new_uri), keep_old))
        out.append(src[cursor:m.start()])
        out.append(m.group(0) if keep_old else new_uri)
        cursor = m.end()

    out.append(src[cursor:])
    new_src = "".join(out)

    e = np.concatenate(all_err) if all_err else np.zeros(1)
    was_b = sum(r[1] for r in rows)
    now_b = sum(r[2] for r in rows)
    kept = sum(1 for r in rows if r[3])

    print(f"{len(rows)} inlined webp at quality={a.quality} method={a.method}")
    print(f"  base64 bytes   {was_b:,} -> {now_b:,}   ({was_b - now_b:,} back, "
          f"{(was_b - now_b) * 100 // max(1, was_b)}%)")
    print(f"  file bytes     {before_file:,} -> {len(new_src.encode()):,}")
    print(f"  left alone     {kept} (the re-encode came back bigger)")
    print(f"  channel error where the sprite is opaque: mean {e.mean():.2f}  "
          f"p99 {np.percentile(e, 99):.0f}  max {e.max():.0f}")
    print(f"  alpha moved on {alpha_moved} assets (must be 0)")
    print(f"\n  biggest {a.top} savings:")
    for k, was_n, now_n, keep in sorted(rows, key=lambda r: r[2] - r[1])[:a.top]:
        print(f"    {k:26s} {was_n:>8,} -> {now_n:>8,}  {(was_n - now_n) * 100 // max(1, was_n):>3}%")

    if alpha_moved:
        sys.exit("\nREFUSING TO WRITE: alpha is supposed to be lossless and it moved.")
    if a.write:
        open(a.html, "w", encoding="utf-8").write(new_src)
        print(f"\nwrote {a.html}")
    else:
        print("\ndry run — pass --write to apply")


if __name__ == "__main__":
    main()

# CHANGELOG
# v1.0 (2026-08-18): Written when the byte ceiling came down to encoder quality
#   and nothing else. Measures before it writes, refuses if alpha moves, and
#   never lets an asset grow.
