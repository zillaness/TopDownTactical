---
file: assets/README.md (TopDownTactical)
version: 1.1
author: Sam Cao
created: 2026-08-15
last_updated: 2026-08-15
description: Where generated art lands and what happens to it. Drop raw generations in incoming/; processed masters live in source/; the shipped copies are inlined in the game file.
ai_update: Update last_updated and bump version. Keep the folder contract below in step with how the build actually loads art.
---

# assets/

## Where to put things

```
assets/
  incoming/          <- DROP RAW GENERATIONS HERE. One folder per prompt thread.
    cars/              ART_PROMPTS_CARS_v1.1.md
    effects/           ART_PROMPTS_EFFECTS_v1.1.md
    main/              ART_PROMPTS_MAIN_v2.1.md
  source/            <- processed masters: alpha resolved, resized, quantised
```

**Upload straight into `assets/incoming/<thread>/`.** Drag-and-drop on
github.com works, or push them — either is fine.

## The drop contract

1. **Do not downscale.** Upload whatever the model returned, at full size.
   Alpha, resizing and palette quantisation happen on the processing side; a
   pre-shrunk image throws away detail that cannot be recovered.
2. **Use the filename from the prompt.** Every prompt names its file, and those
   names map to the keys the engine looks up. `sedan_grey.png`, not
   `ChatGPT Image Aug 15.png`.
3. **Keepers only.** Git stores a whole new copy of a binary on every change,
   so ten rejected takes of one car sit in history forever. Reject in the chat;
   upload the winner.
4. **Sprite sheets stay whole.** Upload the single gridded image, unsliced.
   Slicing happens here so the frame boundaries stay exact.

## What happens after you drop them

Each asset gets checked before it goes anywhere near the build:

- alpha source (native transparency vs magenta key) and corner transparency
- footprint against the tile contract — one tile is 32 world pixels, and
  assets are authored at 2x, so one tile is 64 pixels in the delivered PNG
- palette average against the game's anchors, so nothing arrives brighter or
  more saturated than the world it sits in
- payload after quantisation

Batch 1's numbers are in `assets/source/environment_sprites_batch1.qa.json` as
the worked example. That batch is also the reason step 1 of the checks exists:
the oak arrived with native alpha but the pine, bush and hedge silently fell
back to the magenta key, and only the QA pass caught the difference.

As of the v1.1 prompts the ask is **alpha first, magenta as the named
fallback** — the model does real transparency now and mostly gets it right.
"Mostly" is the whole reason the check stays: a mixed drop is the expected
case, not the alarming one, and nothing downstream cares which path a file
took as long as the QA pass says which it was. Two failures do get rejected
rather than processed — a drawn grey checkerboard, which is an opaque picture
of transparency, and pink fringing on a transparent file, which means the
model painted magenta and then cut it out badly.

Assets that pass get keyed, downscaled, quantised, written to `source/`, and
inlined into the game file as data URIs. **The game is one self-contained HTML
file with no external requests** — `source/` holds the masters so the inlined
copies can be re-derived at a different size later, not so the game can load
them at runtime.
