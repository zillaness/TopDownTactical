#!/usr/bin/env python3
# file: process_props.py (top-down-tactical/tools)
# version: 1.1
# author: Sam Cao
# created: 2026-08-16
# last_updated: 2026-08-16
# description: Turn the main-thread prop drop into game-ready sprites. Keys magenta where the model fell back to it, crops to the art, fits the tile footprint, and writes WebP into assets/source/props/ with a QA record.
# ai_update: Update last_updated and bump version. Append changelog at bottom. Keep FOOTPRINTS in step with the glyph table in the build.
"""
Footprints are the whole difficulty
-----------------------------------
One map glyph is one 32px tile, roughly a metre and a half. A dining chair is
not a metre and a half, so a chair drawn to fill its tile reads as furniture for
giants. Two ways out, and this script supports both:

  - `fit`   the art fills its tile box. Right for things that genuinely occupy
            a tile: sandbags, a wardrobe, an HVAC unit, a pillbox.
  - `inset` the art is drawn smaller than its tile and centred, so a chair looks
            like a chair standing on a floor rather than a chair-shaped tile.
            The scale is per-prop because the honest size is per-prop.

Ground textures are the exception to both: they are not objects, they tile, and
they are resized WITHOUT cropping to alpha because their edges must meet.
"""
import argparse
import io
import json
import os

import numpy as np
from PIL import Image

TILE_2X = 64          # one 32px world tile, authored at 2x

# name: (tiles_w, tiles_h, mode, inset)  — inset is the fraction of the box the art fills
PROPS = {
    # --- things that really do own their tile
    "sandbags":          (1, 1, "fit",   1.00),
    "oil_drums":         (1, 1, "fit",   0.95),
    "jersey_barrier":    (1, 1, "fit",   1.00),
    "dumpster":          (1, 1, "fit",   0.95),
    "pallets":           (1, 1, "fit",   0.95),
    "bookshelf":         (1, 1, "fit",   0.95),
    "bookshelf_toppled": (1, 1, "fit",   0.95),
    "wardrobe":          (1, 1, "fit",   0.92),
    "refrigerator":      (1, 1, "fit",   0.88),
    "kitchen_counter":   (1, 1, "fit",   1.00),
    "desk_office":       (1, 1, "fit",   0.95),
    "market_stall":      (2, 1, "fit",   1.00),
    "roof_hvac":         (1, 1, "fit",   0.95),
    "roof_vents":        (1, 1, "fit",   0.90),
    "roof_dish":         (1, 1, "fit",   0.85),
    "roof_bulkhead":     (1, 1, "fit",   1.00),
    "roof_water_tank":   (2, 2, "fit",   0.90),
    "roof_parapet":      (2, 1, "fit",   1.00),
    "guard_shack":       (2, 2, "fit",   1.00),
    "pillbox":           (3, 3, "fit",   1.00),
    "shed":              (3, 3, "fit",   1.00),
    "garage":            (3, 3, "fit",   1.00),
    # --- things that are smaller than a tile and must be drawn that way
    "chair_dining":      (1, 1, "inset", 0.52),
    "armchair":          (1, 1, "inset", 0.66),
    "sofa":              (2, 1, "inset", 0.88),
    "table_dining":      (2, 1, "inset", 0.85),
    "table_overturned":  (2, 1, "inset", 0.85),
    "bed_single":        (1, 2, "inset", 0.90),
    "bed_double":        (2, 2, "inset", 0.90),
    "tv_stand":          (1, 1, "inset", 0.72),
    "bench":             (2, 1, "inset", 0.85),
    "street_light":      (1, 1, "inset", 0.55),
    "dead_tree":         (2, 2, "inset", 0.95),
    "palm_tree":         (2, 2, "inset", 0.95),
    "shrub_cluster":     (1, 1, "inset", 0.92),
    "rug":               (2, 2, "inset", 0.95),
}
GROUND = ["ground_asphalt", "ground_concrete", "ground_dirt", "ground_forest",
          "ground_roof", "ground_sand", "ground_wood"]
GROUND_TILES = 4      # one texture covers 4x4 tiles, so the repeat is not a 32px grid


def key_magenta(im, tol=90):
    """The named fallback, undone. Despills so edges do not keep a pink rim."""
    a = np.asarray(im.convert("RGBA")).astype(np.int32)
    r, g, b = a[:, :, 0], a[:, :, 1], a[:, :, 2]
    d = np.sqrt((r - 255) ** 2 + g ** 2 + (b - 255) ** 2)
    bg = d < tol
    out = a.copy()
    out[:, :, 3] = np.where(bg, 0, a[:, :, 3])
    spill = (~bg) & (r > g + 40) & (b > g + 40)
    out[:, :, 1] = np.where(spill, np.minimum(255, (r + b) // 2), g)
    return Image.fromarray(np.clip(out, 0, 255).astype(np.uint8), "RGBA")


def load(path):
    im = Image.open(path).convert("RGBA")
    a = np.asarray(im)
    keyed = np.mean(a[:, :, 3] == 0) < 0.02
    if keyed:
        im = key_magenta(im)
    return im, ("magenta-key" if keyed else "native-alpha")


def prop_sprite(path, tw, th, inset):
    im, src = load(path)
    a = np.asarray(im)
    ys, xs = np.nonzero(a[:, :, 3] > 20)
    if not len(ys):
        return None, src
    im = im.crop((int(xs.min()), int(ys.min()), int(xs.max()) + 1, int(ys.max()) + 1))
    box = (tw * TILE_2X, th * TILE_2X)
    inner = (max(1, int(box[0] * inset)), max(1, int(box[1] * inset)))
    sc = min(inner[0] / im.width, inner[1] / im.height)
    im = im.resize((max(1, round(im.width * sc)), max(1, round(im.height * sc))), Image.LANCZOS)
    out = Image.new("RGBA", box, (0, 0, 0, 0))
    out.paste(im, ((box[0] - im.width) // 2, (box[1] - im.height) // 2))
    arr = np.asarray(out).copy()
    ceiling = int(arr[:, :, 3].max())
    if 0 < ceiling < 255:
        arr[:, :, 3] = np.clip(arr[:, :, 3].astype(np.uint16) * 255 // ceiling, 0, 255).astype(np.uint8)
    return Image.fromarray(arr, "RGBA"), src


# Where each ground has to sit in the palette. The game is dark — flat outdoor
# floor is #111a17 and interior is #303b46 — and the raw textures come back four
# to seven times brighter than that. Dropped in untoned they wash the map out and
# every unit on it loses contrast against its own ground.
GROUND_TARGET = {
    "ground_asphalt":  (42, 46, 44), "ground_dirt":   (46, 44, 38),
    "ground_forest":   (34, 42, 34), "ground_sand":   (52, 48, 40),
    "ground_roof":     (40, 44, 46),
    "ground_concrete": (54, 60, 66), "ground_wood":   (52, 46, 38),   # interior, near floorIn
}


def tone(im, target):
    """Scale to the target mean, keeping relative contrast.

    A straight multiply rather than a curve: the textures already carry the right
    internal contrast, they are simply exposed for a bright game and this is a
    dark one. Every target is well below the source mean so the multiplier is
    always < 1 and nothing can clip — the clamp below is a guard, not a step.
    """
    a = np.asarray(im.convert("RGB")).astype(np.float64)
    mean = a.reshape(-1, 3).mean(axis=0)
    a = a * (np.array(target, dtype=np.float64) / np.maximum(mean, 1e-6))
    return Image.fromarray(np.clip(a, 0, 255).astype(np.uint8), "RGB").convert("RGBA")


def ground_sprite(path, name):
    """Tiling ground. No alpha crop — the edges have to meet."""
    im, src = load(path)
    n = GROUND_TILES * TILE_2X
    im = im.convert("RGBA").resize((n, n), Image.LANCZOS)
    t = GROUND_TARGET.get(name)
    return (tone(im, t) if t else im), src


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--incoming", default="assets/incoming/main")
    ap.add_argument("--out", default="assets/source/props")
    ap.add_argument("--quality", type=int, default=85)
    a = ap.parse_args()
    os.makedirs(a.out, exist_ok=True)

    qa, total, missing = {}, 0, []
    for name, (tw, th, mode, inset) in PROPS.items():
        p = os.path.join(a.incoming, name + ".png")
        if not os.path.exists(p):
            missing.append(name); continue
        im, src = prop_sprite(p, tw, th, inset)
        if im is None:
            missing.append(name); continue
        buf = io.BytesIO(); im.save(buf, "WEBP", quality=a.quality, method=6)
        open(os.path.join(a.out, name + ".webp"), "wb").write(buf.getvalue())
        total += len(buf.getvalue())
        al = np.asarray(im)[:, :, 3]
        qa[name] = {"tiles": [tw, th], "output_size": list(im.size), "mode": mode,
                    "inset": inset, "alpha_source": src,
                    "visible_fraction": round(float(np.mean(al > 0)), 4),
                    "file_bytes": len(buf.getvalue())}

    for name in GROUND:
        p = os.path.join(a.incoming, name + ".png")
        if not os.path.exists(p):
            missing.append(name); continue
        im, src = ground_sprite(p, name)
        buf = io.BytesIO(); im.save(buf, "WEBP", quality=a.quality, method=6)
        open(os.path.join(a.out, name + ".webp"), "wb").write(buf.getvalue())
        total += len(buf.getvalue())
        qa[name] = {"tiles": [GROUND_TILES, GROUND_TILES], "output_size": list(im.size),
                    "mode": "tile", "alpha_source": src, "file_bytes": len(buf.getvalue())}

    with open(os.path.join(a.out, "props.qa.json"), "w") as fh:
        json.dump(qa, fh, indent=2)
    print(f"{len(qa)} sprites -> {a.out}")
    print(f"  raw {total / 1024:.0f}K   base64 {total * 1.37 / 1024:.0f}K")
    if missing:
        print(f"  missing from the drop: {', '.join(sorted(missing))}")


if __name__ == "__main__":
    main()

# CHANGELOG
# v1.1 (2026-08-16): Ground textures are toned to the palette. They came back four
#   to seven times brighter than the game's own floor anchors and washed the map
#   out; sand alone was 7x #111a17.
# v1.0 (2026-08-16): Written for the second art drop. Carries the per-prop inset
#   because a dining chair drawn to fill a 1.5m tile reads as furniture for
#   giants, and ground textures cover 4x4 tiles so the repeat is not a 32px grid.
