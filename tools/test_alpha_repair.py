#!/usr/bin/env python3
# file: test_alpha_repair.py (top-down-tactical/tools)
# version: 1.0
# author: Sam Cao
# created: 2026-08-15
# last_updated: 2026-08-15
# description: Fixtures for alpha_repair.py. Builds a synthetic intact render and three edited stages — clean, drifted, and punched through to the backdrop — and asserts the repair accepts the first two and rejects the third. Same house style as tests/run.sh: prints CORRECT or WRONG per line.
# ai_update: Update last_updated and bump version. Append changelog at bottom. Add a fixture for every new failure mode the repair learns to catch.
"""Run: python3 tools/test_alpha_repair.py"""
import os
import sys
import tempfile

import numpy as np
from PIL import Image, ImageDraw

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from alpha_repair import repair  # noqa: E402

W = H = 128
SS = 4                                        # supersample, so edges are really anti-aliased
BODY = (108, 122, 138)
GLASS_INTACT = (60, 92, 116)
GLASS_OUT = (34, 30, 28)                      # blown out: you see the dark interior, not the floor
CHECK_A, CHECK_B = (255, 255, 255), (204, 204, 204)
FAILS = []


def check(msg, ok, why=""):
    print(("  " + msg + " ").ljust(74, " ") + ("CORRECT" if ok else "WRONG") + (" " + why if why else ""))
    if not ok:
        FAILS.append(msg)


def car(glass_rgb, offset=(0, 0)):
    """A nose-right blob with a windscreen. Anti-aliased, on real transparency."""
    im = Image.new("RGBA", (W * SS, H * SS), (0, 0, 0, 0))
    d = ImageDraw.Draw(im)
    ox, oy = offset[0] * SS, offset[1] * SS
    d.rounded_rectangle([20 * SS + ox, 44 * SS + oy, 110 * SS + ox, 84 * SS + oy],
                        radius=10 * SS, fill=BODY + (255,))
    d.rounded_rectangle([54 * SS + ox, 52 * SS + oy, 78 * SS + ox, 76 * SS + oy],
                        radius=3 * SS, fill=glass_rgb + (255,))
    return im.resize((W, H), Image.LANCZOS)


def checkerboard():
    a = np.zeros((H, W, 3), dtype=np.uint8)
    for y in range(H):
        for x in range(W):
            a[y, x] = CHECK_A if ((x // 8) + (y // 8)) % 2 == 0 else CHECK_B
    return Image.fromarray(a, mode="RGB").convert("RGBA")


def bake(fg, punch_through=False):
    """What the edit model actually returns: opaque, checkerboard baked in."""
    if punch_through:
        # the failure: it read "glass out" as a HOLE and let the backdrop through
        px = fg.load()
        for y in range(52, 76):
            for x in range(54, 78):
                px[x, y] = (0, 0, 0, 0)
    out = Image.alpha_composite(checkerboard(), fg)
    out.putalpha(255)
    return out


def main():
    print("--- alpha_repair: the checkerboard edit, and the three ways repairing it goes wrong ---")
    tmp = tempfile.mkdtemp()
    p = lambda n: os.path.join(tmp, n)

    intact = car(GLASS_INTACT)
    intact.save(p("intact.png"))

    # 1. the ordinary case: silhouette unchanged, interior repainted
    bake(car(GLASS_OUT)).save(p("clean.png"))
    r = repair(p("clean.png"), p("intact.png"), p("out_clean.png"))
    check("clean edit repairs: ok=%s, agreement=%.4f" % (r.get("ok"), r["alignment"]["agreement"]),
          r.get("ok") and r["alignment"]["offset"] == [0, 0])

    out = np.asarray(Image.open(p("out_clean.png")).convert("RGBA"))
    check("corners transparent, body opaque: %s / %.2f" %
          (r["output"]["transparent_corners"], r["output"]["opaque_fraction"]),
          r["output"]["transparent_corners"] and r["output"]["opaque_fraction"] > 0.15)
    check("the edit's new interior survived: windscreen=%s" % (tuple(out[64, 66, :3]),),
          abs(int(out[64, 66, 0]) - GLASS_OUT[0]) < 8, "(glass-out colour, not the intact blue)")

    # RIM: the contaminated edge must not reach the output. Sample the partial-alpha
    # band and confirm nothing in it is checkerboard-bright.
    alpha = out[:, :, 3]
    band = (alpha > 0) & (alpha < 255)
    worst = int(out[:, :, :3][band].max()) if band.any() else 0
    check("no checkerboard in the anti-aliased rim: brightest edge channel %d" % worst,
          worst < 190, "(a halo would show as ~204-255)")

    # 2. the edit drifted a few pixels
    bake(car(GLASS_OUT, offset=(3, -2))).save(p("drift.png"))
    r2 = repair(p("drift.png"), p("intact.png"), p("out_drift.png"))
    check("a 3,-2px drift is found and matched, not clipped: offset=%s" % (r2["alignment"]["offset"],),
          r2.get("ok") and r2["alignment"]["offset"] == [3, -2])

    # 3. the edit punched through to the backdrop
    bake(car(GLASS_OUT), punch_through=True).save(p("punched.png"))
    r3 = repair(p("punched.png"), p("intact.png"), p("out_punched.png"))
    frac = r3["residual_background_inside_mask"]["fraction_of_body"]
    check("a checkerboard windscreen is rejected, not shipped: %.1f%% of the body" % (frac * 100,),
          not r3.get("ok") and frac > 0.05, "(this is the one that looks fine in a thumbnail)")
    check("and it says where: bbox=%s" % (r3["residual_background_inside_mask"].get("bbox"),),
          r3["residual_background_inside_mask"].get("bbox") is not None)

    # 2b. a drift too large to correct, and a body that is simply not this body,
    # are both refused — and the score has to separate them from a good fit
    bake(car(GLASS_OUT, offset=(2, 0))).save(p("drift2.png"))
    rn = repair(p("drift2.png"), p("intact.png"), p("out_x.png"), max_shift=0)
    check("an uncorrectable 2px drift is refused: %.4f vs %.4f threshold" %
          (rn["alignment"]["agreement"], rn["alignment"]["threshold"]), not rn.get("ok"))

    tall = Image.new("RGBA", (W * SS, H * SS), (0, 0, 0, 0))
    ImageDraw.Draw(tall).rounded_rectangle([20 * SS, 36 * SS, 110 * SS, 92 * SS],
                                           radius=10 * SS, fill=BODY + (255,))
    bake(tall.resize((W, H), Image.LANCZOS)).save(p("tall.png"))
    rt = repair(p("tall.png"), p("intact.png"), p("out_y.png"))
    check("a different silhouette is refused: %.4f, peak margin %s" %
          (rt["alignment"]["agreement"], rt["alignment"]["peak_margin"]), not rt.get("ok"))
    check("a good fit peaks sharply and a bad one does not: %.4f vs %.4f" %
          (r["alignment"]["peak_margin"], rt["alignment"]["peak_margin"]),
          r["alignment"]["peak_margin"] > rt["alignment"]["peak_margin"])

    # 4. a mismatched size is refused rather than guessed at
    car(GLASS_OUT).resize((64, 64)).save(p("small.png"))
    r4 = repair(p("small.png"), p("intact.png"), p("out_small.png"))
    check("a size mismatch is refused: %s" % (not r4.get("ok"),), not r4.get("ok"))

    print("ALPHA REPAIR TEST DONE" if not FAILS else "FAILURES: " + "; ".join(FAILS))
    return 1 if FAILS else 0


if __name__ == "__main__":
    sys.exit(main())

# CHANGELOG
# v1.0 (2026-08-15): Fixtures for the three quiet failures — rim fringe from the
#   checkerboard-contaminated edge, a drifted edit, and a windscreen punched
#   through to the backdrop.
