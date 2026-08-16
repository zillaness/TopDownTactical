#!/usr/bin/env python3
# file: process_vehicles.py (top-down-tactical/tools)
# version: 1.0
# author: Sam Cao
# created: 2026-08-16
# last_updated: 2026-08-16
# description: Turn the raw vehicle damage-ladder drops into game-ready sprites and a QA record. Crops to the alpha bounding box, fits the tile contract preserving aspect, normalises the alpha ceiling, encodes WebP, and writes assets/source/vehicles/ plus a qa json in the batch-1 format.
# ai_update: Update last_updated and bump version. Append changelog at bottom. Keep FOOTPRINT and QUALITY in step with what the engine actually draws.
"""
Why WebP and not PNG
--------------------
The vehicle art is photographic, so it quantises far worse than the vegetation
did — an indexed 256x128 car is ~32KB against the oak's 8KB, and sixteen of them
is 705KB of base64 on a 530KB file. Dropping to 1x would fix the payload and
ruin the picture: the camera sits at 1.6x zoom by default and goes to 3.0x, so
1x art is upscaled on almost every frame the player sees.

WebP at quality 85 holds full 2x resolution for the payload of 1x PNG — 241KB
of base64 rather than 705KB — with alpha intact. The build constraint is one
self-contained file with no external requests, which a data: URI satisfies in
any format; nothing in it requires PNG.

The tile contract
-----------------
One world tile is 32px and art is authored at 2x, so a 4x2-tile car is 128x64
in the world and 256x128 in the delivered sprite. The maps also carry 2x1-tile
cars; both footprints are 2:1, so ONE sprite serves both and the engine scales
it to whatever tile extent the vehicle occupies. Aspect is preserved on fit —
the art is ~2.16:1 against a 2:1 box, so a car keeps a little margin across its
width, which is correct: a car is narrower than two full tiles.
"""
import argparse
import io
import json
import os

import numpy as np
from PIL import Image, ImageFilter

FOOTPRINT = (256, 128)      # 4x2 tiles at 2x; the 2x1 cars scale down from this
QUALITY = 85
LADDERS = {
    "sedan_grey": ["sedan_grey", "sedan_grey_glass_out", "sedan_grey_shot_up", "car_wreck"],
    "panel_van":  ["panel_van", "panel_van_glass_out", "panel_van_shot_up", "panel_van_wreck"],
    "pickup":     ["pickup", "pickup_glass_out", "pickup_shot_up", "pickup_wreck"],
    "sedan_red":  ["sedan_red", "sedan_red_glass_out", "sedan_red_shot_up", "sedan_red_wreck"],
}
STATES = ["intact", "glass_out", "shot_up", "wreck"]
DIRS = {"sedan_grey": "grey-sedan", "panel_van": "panel-van",
        "pickup": "pickup", "sedan_red": "red-sedan"}


def prepare(path, box):
    """Crop to the art, fit the tile box preserving aspect, square up the alpha."""
    im = Image.open(path).convert("RGBA")
    a = np.asarray(im)
    ys, xs = np.nonzero(a[:, :, 3] > 20)
    im = im.crop((int(xs.min()), int(ys.min()), int(xs.max()) + 1, int(ys.max()) + 1))
    src_wh = im.size
    scale = min(box[0] / im.width, box[1] / im.height)
    nw, nh = max(1, round(im.width * scale)), max(1, round(im.height * scale))
    im = im.resize((nw, nh), Image.LANCZOS)
    out = Image.new("RGBA", box, (0, 0, 0, 0))
    out.paste(im, ((box[0] - nw) // 2, (box[1] - nh) // 2))

    # The drops top out at alpha 252-253 rather than 255, so nothing in them is
    # ever fully opaque. Invisible in isolation, but it means every car draws
    # through a needless blend. Rescale so the body is genuinely solid.
    arr = np.asarray(out).copy()
    ceiling = int(arr[:, :, 3].max())
    if 0 < ceiling < 255:
        arr[:, :, 3] = np.clip(arr[:, :, 3].astype(np.uint16) * 255 // ceiling, 0, 255).astype(np.uint8)
    return Image.fromarray(arr, "RGBA"), src_wh, ceiling, (nw, nh)


def encode(im, quality):
    buf = io.BytesIO()
    im.save(buf, "WEBP", quality=quality, method=6)
    return buf.getvalue()


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--incoming", default="assets/incoming/cars/damage-ladders-v1")
    ap.add_argument("--out", default="assets/source/vehicles")
    ap.add_argument("--quality", type=int, default=QUALITY)
    a = ap.parse_args()
    os.makedirs(a.out, exist_ok=True)

    qa, total = {}, 0
    for vehicle, files in LADDERS.items():
        for state, stem in zip(STATES, files):
            src = os.path.join(a.incoming, DIRS[vehicle], stem + ".png")
            im, src_wh, ceiling, fitted = prepare(src, FOOTPRINT)
            blob = encode(im, a.quality)
            name = f"{vehicle}__{state}.webp"
            with open(os.path.join(a.out, name), "wb") as fh:
                fh.write(blob)
            total += len(blob)

            arr = np.asarray(im)
            al = arr[:, :, 3]
            vis = al > 127
            qa[f"{vehicle}/{state}"] = {
                "source": os.path.relpath(src),
                "source_size": list(src_wh),
                "output_size": list(FOOTPRINT),
                "world_size": [FOOTPRINT[0] // 2, FOOTPRINT[1] // 2],
                "tiles": [FOOTPRINT[0] / 64, FOOTPRINT[1] / 64],
                "fitted_size": list(fitted),
                "alpha_source": "native-alpha",
                "alpha_ceiling_in_source": ceiling,
                "transparent_corners": bool(al[0, 0] == 0 and al[0, -1] == 0
                                            and al[-1, 0] == 0 and al[-1, -1] == 0),
                "visible_fraction": round(float(np.mean(al > 0)), 4),
                "partial_alpha_fraction": round(float(np.mean((al > 0) & (al < 255))), 4),
                "opaque_rgb_average": [int(v) for v in arr[:, :, :3][vis].mean(axis=0)],
                "encoding": f"webp q{a.quality}",
                "file_bytes": len(blob),
            }

    with open(os.path.join(a.out, "vehicles_batch2.qa.json"), "w") as fh:
        json.dump(qa, fh, indent=2)

    print(f"{len(qa)} sprites -> {a.out}")
    print(f"  raw {total / 1024:.0f}K   base64 {total * 1.37 / 1024:.0f}K")
    anchors = {"metal": (120, 135, 146), "floor": (48, 59, 70)}
    print(f"  palette anchors: metal {anchors['metal']}, floor {anchors['floor']}")
    for k, v in qa.items():
        avg = v["opaque_rgb_average"]
        flag = "  <-- BRIGHT vs anchors" if sum(avg) / 3 > 150 else ""
        print(f"    {k:28} {str(avg):>18} {v['file_bytes'] / 1024:6.1f}K{flag}")


if __name__ == "__main__":
    main()

# CHANGELOG
# v1.0 (2026-08-16): Written for the four car damage ladders. WebP over indexed
#   PNG because the art is photographic and the camera sits at 1.6x zoom, so 1x
#   art would be upscaled on almost every frame while 2x PNG tripled the file.
