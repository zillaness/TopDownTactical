#!/usr/bin/env python3
# file: alpha_repair.py (top-down-tactical/tools)
# version: 1.0
# author: Sam Cao
# created: 2026-08-15
# last_updated: 2026-08-15
# description: Repair a damage-ladder stage whose edit baked an opaque checkerboard background into the PNG, by transplanting the verified alpha mask from the intact reference. Verifies alignment first, keeps the rim from the reference so the edit's checkerboard-contaminated edge pixels never reach the output, and reports any background pattern surviving INSIDE the mask.
# ai_update: Update last_updated and bump version. Append changelog at bottom. Keep the failure modes in the docstring in step with what the checks actually test.
"""
Why this exists
---------------
The image model does real transparency on a fresh generation and mostly gets it
right. It does NOT do it reliably on an EDIT of an existing image: asked to take
the intact sedan and blow the glass out, it returns an opaque PNG with a drawn
grey checkerboard where the transparency should be. That is a picture of
transparency, not transparency.

A damage ladder is an edit chain by construction — the whole point is that the
three states are the same vehicle — so this is not a one-off. The repair is
sound because a ladder deliberately does not change the exterior silhouette:
the intact render's alpha is the correct mask for every stage below it.

Three ways the repair goes wrong quietly, all of which are checked here:

1. MISALIGNMENT. Edit models nudge the subject a few pixels. A 3px shift clips
   one side of the silhouette and leaves a rim of background on the other. We
   search a small window of integer offsets and report the agreement score at
   the best one; a low score means regenerate, not repair.

2. RIM FRINGE. The reference's edge pixels are anti-aliased against real
   transparency and are clean. The edited image's edge pixels at the same
   coordinates are anti-aliased against the checkerboard and carry its grey.
   Give those partial alpha and the asset gets a pale halo that reads as a glow
   at world size. So the edited RGB is only used inside an eroded mask; the rim
   band comes from the reference, which is identical there by definition.

3. CHECKERBOARD INSIDE THE MASK. If the edit read "glass out" as a hole through
   to the background, it painted checkerboard in the window openings — and the
   transplanted mask makes those pixels opaque. The result is a car with a
   checkerboard windscreen: fine in a thumbnail, obviously broken in game. For
   this project the correct glass-out art is an opaque interior, because you
   must not see floor tile through a windscreen. We cannot fix that here, so we
   measure it and say where it is.

Usage
-----
    python3 tools/alpha_repair.py --edited glass_out_raw.png \
                                  --reference sedan_grey.png \
                                  --out sedan_grey_glass.png

Exits non-zero if a check fails hard (bad alignment, or surviving background
inside the mask above the tolerance), so it can gate a batch.

On the thresholds
-----------------
`min_agreement` is calibrated against the synthetic fixtures in
test_alpha_repair.py, where a correct fit scores ~0.93 and a one-pixel drift
~0.89. That is a real but narrow gap, and a painted vehicle with texture and
specular highlights will not score identically to a flat blob — so treat the
absolute number as provisional until it has been run on a real intact/edited
pair, and read `peak_margin` alongside it. The margin is the sturdier signal:
it asks whether the fit peaks at one offset and falls away, which on the
fixtures separates a good fit from a wrong silhouette by 0.067 versus 0.003.
A high agreement with a flat margin means the mask does not really belong to
that image.
"""
import argparse
import json
import sys

import numpy as np
from PIL import Image, ImageFilter


def load_rgba(path):
    return np.asarray(Image.open(path).convert("RGBA"), dtype=np.float64)


def background_tones(img):
    """The checkerboard's two greys, read off the corners rather than assumed.

    Self-calibrating beats hardcoding #FFFFFF/#CCCCCC: the model draws its own
    approximation of a transparency backdrop and the exact tones vary. The four
    corners are background in every failure we have seen.
    """
    h, w = img.shape[:2]
    corners = np.array([img[0, 0, :3], img[0, w - 1, :3],
                        img[h - 1, 0, :3], img[h - 1, w - 1, :3]])
    # collapse near-duplicates so a uniform background yields one tone, not four
    tones = []
    for c in corners:
        if not any(np.linalg.norm(c - t) < 12 for t in tones):
            tones.append(c)
    return np.array(tones)


def background_likeness(img, tones, tol):
    """Per-pixel: is this one of the background tones?

    Distance to the nearest sampled tone, not a colour-family test. A grey-blue
    car is also desaturated; what separates it from the backdrop is that the
    backdrop is exactly two specific values and the car is not.
    """
    rgb = img[:, :, :3]
    d = np.min([np.linalg.norm(rgb - t, axis=2) for t in tones], axis=0)
    return d < tol


def shift(mask, dx, dy):
    out = np.zeros_like(mask)
    h, w = mask.shape
    xs, xd = (slice(0, w - dx), slice(dx, w)) if dx >= 0 else (slice(-dx, w), slice(0, w + dx))
    ys, yd = (slice(0, h - dy), slice(dy, h)) if dy >= 0 else (slice(-dy, h), slice(0, h + dy))
    out[yd, xd] = mask[ys, xs]
    return out


def erode(alpha_u8, px):
    """Shrink the mask by px. MinFilter is a greyscale erosion for our purposes."""
    if px <= 0:
        return alpha_u8
    img = Image.fromarray(alpha_u8, mode="L")
    for _ in range(px):
        img = img.filter(ImageFilter.MinFilter(3))
    return np.asarray(img)


def dilate(alpha_u8, px):
    if px <= 0:
        return alpha_u8
    img = Image.fromarray(alpha_u8, mode="L")
    for _ in range(px):
        img = img.filter(ImageFilter.MaxFilter(3))
    return np.asarray(img)


def boundary_band(mask_bool, px):
    """Pixels within px of the silhouette edge.

    Alignment is a question about the OUTLINE, so it has to be scored on the
    outline. Scored over the whole frame instead, a hole punched in the middle
    of the body (a windscreen opened to the backdrop) drags the score down and
    gets misreported as the vehicle having moved — which sends you off
    regenerating for the wrong reason.
    """
    m = (mask_bool * 255).astype(np.uint8)
    return (dilate(m, px) > 127) & ~(erode(m, px) > 127)


SCORE_BAND_PX = 3          # fixed, so the score means the same thing at any --max-shift


def repair(edited_path, reference_path, out_path, rim=2, max_shift=4,
           tone_tol=26.0, min_agreement=0.90, max_residual=0.002, alpha_floor=8):
    edited = load_rgba(edited_path)
    reference = load_rgba(reference_path)
    if edited.shape != reference.shape:
        return {"ok": False, "error":
                f"size mismatch: edited {edited.shape[1]}x{edited.shape[0]} vs "
                f"reference {reference.shape[1]}x{reference.shape[0]} — "
                "resize is not this tool's job, regenerate at the reference size"}

    tones = background_tones(edited)
    bg_like = background_likeness(edited, tones, tone_tol)
    ref_solid = reference[:, :, 3] > 127

    # 1. ALIGNMENT — how well does the reference silhouette explain where the
    # edited image stops being backdrop? Searched over small integer offsets and
    # scored only near the outline, so an interior hole cannot masquerade as a
    # shifted vehicle.
    scores = {}
    for dy in range(-max_shift, max_shift + 1):
        for dx in range(-max_shift, max_shift + 1):
            m = shift(ref_solid, dx, dy)
            band = boundary_band(m, SCORE_BAND_PX)
            if not band.any():
                continue
            scores[(dx, dy)] = float(np.mean((m != bg_like)[band]))
    (dx, dy), agreement = max(scores.items(), key=lambda kv: kv[1])
    # How sharply does the fit peak? A mask that genuinely belongs to this
    # silhouette fits at exactly one offset and degrades away from it. A flat
    # landscape means the mask does not fit anywhere in particular and the
    # winning offset is noise — which an absolute score alone cannot tell you.
    away = [s for (ox, oy), s in scores.items() if max(abs(ox - dx), abs(oy - dy)) >= 2]
    margin = round(agreement - max(away), 5) if away else None

    report = {
        "edited": edited_path, "reference": reference_path, "out": out_path,
        "size": [int(edited.shape[1]), int(edited.shape[0])],
        "background_tones": [[int(v) for v in t] for t in tones],
        "alignment": {"agreement": round(agreement, 5), "offset": [dx, dy],
                      "threshold": min_agreement, "peak_margin": margin},
    }
    if agreement < min_agreement:
        report["ok"] = False
        report["error"] = (f"silhouette agreement {agreement:.4f} below {min_agreement} at the best "
                           f"offset ({dx},{dy}) — the edit moved or reshaped the vehicle, so the "
                           "reference mask is not its mask. Regenerate this stage.")
        return report
    if (dx, dy) != (0, 0):
        report["alignment"]["note"] = (f"edit drifted {dx},{dy}px; mask shifted to match rather than "
                                       "clipping one side and leaving background on the other")

    alpha = shift(reference[:, :, 3].astype(np.uint8), dx, dy)
    # A pixel at 3/255 opacity is invisible, and its RGB is almost always junk —
    # resamplers ring badly where alpha goes to zero, so those pixels carry
    # colours that appear nowhere in the asset. Left in, they survive into the
    # indexed palette and spend entries on nothing. Snap them off.
    floored = int(np.sum((alpha > 0) & (alpha < alpha_floor)))
    alpha = np.where(alpha < alpha_floor, 0, alpha).astype(np.uint8)
    solid = shift(ref_solid, dx, dy)

    # 3. RESIDUAL BACKGROUND INSIDE THE MASK — the checkerboard windscreen.
    # Checked before compositing so the number describes the edit, not the fix.
    residual = bg_like & solid
    residual_frac = float(np.sum(residual) / max(1, np.sum(solid)))
    report["residual_background_inside_mask"] = {
        "fraction_of_body": round(residual_frac, 5), "pixels": int(np.sum(residual)),
        "threshold": max_residual,
    }
    if np.any(residual):
        ys, xs = np.nonzero(residual)
        report["residual_background_inside_mask"]["bbox"] = [int(xs.min()), int(ys.min()),
                                                             int(xs.max()), int(ys.max())]
    if residual_frac > max_residual:
        report["ok"] = False
        report["error"] = (f"{residual_frac * 100:.2f}% of the body is still backdrop after masking — "
                           "the edit punched through to the background instead of painting what is "
                           "behind it. Regenerate with the opening filled (an interior, not a hole).")
        return report

    # 2. RIM — edited RGB only where it is clean, reference RGB in the band the
    # checkerboard bled into. Identical there anyway: the silhouette is fixed.
    core = erode(alpha, rim) > 127
    rgb = np.where(core[:, :, None], edited[:, :, :3], shift_rgb(reference, dx, dy))
    report["rim"] = {"px": rim, "pixels_taken_from_reference": int(np.sum(solid & ~core)),
                     "alpha_floor": alpha_floor, "near_transparent_pixels_snapped_off": floored}

    out = np.zeros_like(edited)
    out[:, :, :3] = rgb
    out[:, :, 3] = alpha
    out[alpha == 0] = 0                      # fully transparent pixels carry no colour to bleed
    Image.fromarray(out.astype(np.uint8), mode="RGBA").save(out_path)

    report["ok"] = True
    report["output"] = {
        "opaque_fraction": round(float(np.mean(alpha == 255)), 4),
        "partial_alpha_fraction": round(float(np.mean((alpha > 0) & (alpha < 255))), 4),
        "transparent_corners": bool(alpha[0, 0] == 0 and alpha[0, -1] == 0
                                    and alpha[-1, 0] == 0 and alpha[-1, -1] == 0),
    }
    return report


def shift_rgb(img, dx, dy):
    out = np.zeros_like(img[:, :, :3])
    h, w = img.shape[:2]
    xs, xd = (slice(0, w - dx), slice(dx, w)) if dx >= 0 else (slice(-dx, w), slice(0, w + dx))
    ys, yd = (slice(0, h - dy), slice(dy, h)) if dy >= 0 else (slice(-dy, h), slice(0, h + dy))
    out[yd, xd] = img[ys, xs, :3]
    return out


def main():
    ap = argparse.ArgumentParser(description=__doc__.split("Usage")[0].strip())
    ap.add_argument("--edited", required=True, help="the damaged stage, with the checkerboard baked in")
    ap.add_argument("--reference", required=True, help="the intact render, whose alpha is trusted")
    ap.add_argument("--out", required=True)
    ap.add_argument("--rim", type=int, default=2, help="px of edge taken from the reference (default 2)")
    ap.add_argument("--max-shift", type=int, default=4)
    ap.add_argument("--json", action="store_true", help="report only, no prose")
    a = ap.parse_args()

    r = repair(a.edited, a.reference, a.out, rim=a.rim, max_shift=a.max_shift)
    if a.json:
        print(json.dumps(r, indent=2))
    elif r.get("ok"):
        al = r["alignment"]
        print(f"REPAIRED {r['out']}")
        print(f"  silhouette agreement {al['agreement']:.4f} at offset {al['offset']}")
        print(f"  rim: {r['rim']['pixels_taken_from_reference']}px taken from the reference")
        print(f"  residual backdrop inside the body: "
              f"{r['residual_background_inside_mask']['fraction_of_body'] * 100:.3f}%")
        print(f"  transparent corners: {r['output']['transparent_corners']}")
    else:
        print(f"REJECTED {r.get('edited')}\n  {r.get('error')}", file=sys.stderr)
    return 0 if r.get("ok") else 1


if __name__ == "__main__":
    sys.exit(main())

# CHANGELOG
# v1.0 (2026-08-15): Written after the grey sedan's glass-out stage came back
#   with an opaque checkerboard twice in a row. Transplants the intact render's
#   alpha, but gates on silhouette agreement first, keeps the rim from the
#   reference so the checkerboard-contaminated edge never reaches the output,
#   and fails the stage if backdrop survives inside the body.
