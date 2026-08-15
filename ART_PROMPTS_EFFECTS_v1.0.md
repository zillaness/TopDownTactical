---
file: ART_PROMPTS_EFFECTS_v1.0.md (top-down-tactical)
version: 1.0
author: Sam Cao
created: 2026-08-15
last_updated: 2026-08-15
description: Sprite-sheet animation prompts — explosions, looping fire, looping smoke texture, flashbang, smoke and gas pops, breach debris, shattering glass. Self-contained; this is the whole effects thread.
ai_update: Update last_updated and bump version in frontmatter. Rename file to match. Append changelog at bottom.
---

# EFFECTS AND ANIMATION — the whole effects thread

Nine sprite sheets. Nothing here needs anything pasted before it.

## Why this thread exists

Every explosion in the game today is **one orange circle**. `#ffae42`, scaling
from 1.4x down to 1.0x and fading over half a second. Six different systems push
that same circle: a hand frag, a 40mm, a mortar round, a breaching charge, a
wall charge and the FPV drone. An artillery sheaf and a hand grenade render
identically. The flashbang is the same circle in white.

These are the weakest visuals in the build, and they are the moments the game is
loudest.

## The one rule that makes animation work with an image model

**Never generate frames one at a time.** Ask for frame 1, then frame 2, and you
get two unrelated explosions — the model has no memory of the previous image's
shape, colour temperature or centre point. Every prompt below asks for **one
image containing a grid of frames**, so the model composes the whole sequence in
a single pass and keeps it internally coherent. That is the difference between a
usable sheet and eight strangers.

**If a sheet comes back with frames that clearly do not belong together,
regenerate rather than trying to salvage it.** A sequence is only as good as its
worst frame, and a bad one reads as a flicker.

Send sheets at whatever size the model returns — I slice them, key the magenta,
and wire the timing in the engine. Use exactly the filenames given.

## What NOT to generate

**The smoke and CS clouds stay procedural.** They are the best effect in the
game precisely because they are not sprites: they are a real volume whose radius
grows over time, and that same radius is what blocks vision and drives the AI. A
sheet cannot track an arbitrary changing radius, and swapping one in would make
the picture disagree with the mechanic.

What IS worth having, and is below, is the *pop* of the can — a fixed short
event — and `smoke_drift_loop`, a slow texture that rides on top of the
procedural volume so it stops looking like a flat gradient.

---

### `explosion_frag` &nbsp;·&nbsp; save as `explosion_frag.png` &nbsp;·&nbsp; 4x2 grid, 8 frames &nbsp;·&nbsp; generate at 1024x1024

```
Strict 90-degree top-down orthographic view, camera pointing straight down at the ground — NOT isometric, NOT angled, no perspective, no horizon, no visible side faces. Grounded semi-realistic military-sim style: muted desaturated palette, painterly but clean-edged, no black outline, no cartoon or cel shading, no text, no labels, no frame numbers, no watermark, no grid lines drawn between cells.

This is a SPRITE SHEET in a single image: a 4x2 grid of 8 frames of ONE continuous a hand-fragmentation-grenade detonation seen from directly above, evolving in order left to right then top to bottom. Every cell is exactly the same size, the cells touch with no gutters, borders or separating lines, and the effect in each cell is centered in its own cell and never crosses into a neighbouring cell. It must read as 8 moments of the SAME event, not 8 different events — same colour temperature, same style, same centre point throughout. The entire background, everywhere, including inside and between cells, is FLAT SOLID MAGENTA #FF00FF with no texture, gradient or shadow, and no magenta or pink anywhere in the effect itself — I will key this colour out.

Frame 1 is a small hot white-yellow core just born. Frames 2 to 3 expand into a ragged orange fireball with dark smoke curling at its edge and fine fragment streaks flying outward. Frames 4 to 6 the fire dies back and grey-brown smoke takes over. Frames 7 to 8 are thinning smoke and settling dust, nearly transparent by the last frame. At full spread the fireball is about 2 tiles across.

Scale: one tile is 32 world pixels and a human body is 20 world pixels across.
```

### `explosion_he` &nbsp;·&nbsp; save as `explosion_he.png` &nbsp;·&nbsp; 4x2 grid, 8 frames &nbsp;·&nbsp; generate at 1024x1024

```
Strict 90-degree top-down orthographic view, camera pointing straight down at the ground — NOT isometric, NOT angled, no perspective, no horizon, no visible side faces. Grounded semi-realistic military-sim style: muted desaturated palette, painterly but clean-edged, no black outline, no cartoon or cel shading, no text, no labels, no frame numbers, no watermark, no grid lines drawn between cells.

This is a SPRITE SHEET in a single image: a 4x2 grid of 8 frames of ONE continuous a large high-explosive detonation seen from directly above — a 40mm grenade, a mortar round or a breaching charge, evolving in order left to right then top to bottom. Every cell is exactly the same size, the cells touch with no gutters, borders or separating lines, and the effect in each cell is centered in its own cell and never crosses into a neighbouring cell. It must read as 8 moments of the SAME event, not 8 different events — same colour temperature, same style, same centre point throughout. The entire background, everywhere, including inside and between cells, is FLAT SOLID MAGENTA #FF00FF with no texture, gradient or shadow, and no magenta or pink anywhere in the effect itself — I will key this colour out.

Noticeably bigger, dirtier and slower than a hand grenade. Frame 1 a blinding white-hot core. Frames 2 to 3 a violent orange fireball throwing a ring of dust and debris outward along the ground. Frames 4 to 6 the fire is swallowed by a thick churning brown-grey dust column. Frames 7 to 8 the dust hangs and begins to settle. At full spread about 3 tiles across.

Scale: one tile is 32 world pixels and a human body is 20 world pixels across.
```

### `fire_loop` &nbsp;·&nbsp; save as `fire_loop.png` &nbsp;·&nbsp; 4x2 grid, 8 frames &nbsp;·&nbsp; generate at 1024x1024

```
Strict 90-degree top-down orthographic view, camera pointing straight down at the ground — NOT isometric, NOT angled, no perspective, no horizon, no visible side faces. Grounded semi-realistic military-sim style: muted desaturated palette, painterly but clean-edged, no black outline, no cartoon or cel shading, no text, no labels, no frame numbers, no watermark, no grid lines drawn between cells.

This is a SPRITE SHEET in a single image: a 4x2 grid of 8 frames of ONE continuous a patch of burning fuel and wreckage seen from directly above, as a SEAMLESS LOOP, evolving in order left to right then top to bottom. Every cell is exactly the same size, the cells touch with no gutters, borders or separating lines, and the effect in each cell is centered in its own cell and never crosses into a neighbouring cell. It must read as 8 moments of the SAME event, not 8 different events — same colour temperature, same style, same centre point throughout. The entire background, everywhere, including inside and between cells, is FLAT SOLID MAGENTA #FF00FF with no texture, gradient or shadow, and no magenta or pink anywhere in the effect itself — I will key this colour out.

The eight frames must loop perfectly — frame 8 flows back into frame 1 with no visible jump. Flame tongues seen from above as bright yellow-white centres fading through orange to dark smoke at the edges, licking and shifting between frames while keeping the same overall footprint and brightness. This burns on top of a destroyed vehicle, so about 2 tiles across.

Scale: one tile is 32 world pixels and a human body is 20 world pixels across.
```

### `smoke_drift_loop` &nbsp;·&nbsp; save as `smoke_drift_loop.png` &nbsp;·&nbsp; 4x2 grid, 8 frames &nbsp;·&nbsp; generate at 1024x1024

```
Strict 90-degree top-down orthographic view, camera pointing straight down at the ground — NOT isometric, NOT angled, no perspective, no horizon, no visible side faces. Grounded semi-realistic military-sim style: muted desaturated palette, painterly but clean-edged, no black outline, no cartoon or cel shading, no text, no labels, no frame numbers, no watermark, no grid lines drawn between cells.

This is a SPRITE SHEET in a single image: a 4x2 grid of 8 frames of ONE continuous a slow churning patch of grey smoke seen from directly above, as a SEAMLESS LOOP, evolving in order left to right then top to bottom. Every cell is exactly the same size, the cells touch with no gutters, borders or separating lines, and the effect in each cell is centered in its own cell and never crosses into a neighbouring cell. It must read as 8 moments of the SAME event, not 8 different events — same colour temperature, same style, same centre point throughout. The entire background, everywhere, including inside and between cells, is FLAT SOLID MAGENTA #FF00FF with no texture, gradient or shadow, and no magenta or pink anywhere in the effect itself — I will key this colour out.

Frame 8 must flow back into frame 1 with no visible jump. Soft billowing grey-white smoke that rolls and folds slowly IN PLACE rather than expanding — the engine handles the spreading. Keep the density even and the edges soft and irregular, with no single distinctive feature the eye can lock onto and watch repeat. About 2 tiles across.

Scale: one tile is 32 world pixels and a human body is 20 world pixels across.
```

### `flash_burst` &nbsp;·&nbsp; save as `flash_burst.png` &nbsp;·&nbsp; 4x1 grid, 4 frames &nbsp;·&nbsp; generate at 1536x1024

```
Strict 90-degree top-down orthographic view, camera pointing straight down at the ground — NOT isometric, NOT angled, no perspective, no horizon, no visible side faces. Grounded semi-realistic military-sim style: muted desaturated palette, painterly but clean-edged, no black outline, no cartoon or cel shading, no text, no labels, no frame numbers, no watermark, no grid lines drawn between cells.

This is a SPRITE SHEET in a single image: a 4x1 grid of 4 frames of ONE continuous a flashbang detonation seen from directly above, evolving in order left to right then top to bottom. Every cell is exactly the same size, the cells touch with no gutters, borders or separating lines, and the effect in each cell is centered in its own cell and never crosses into a neighbouring cell. It must read as 4 moments of the SAME event, not 4 different events — same colour temperature, same style, same centre point throughout. The entire background, everywhere, including inside and between cells, is FLAT SOLID MAGENTA #FF00FF with no texture, gradient or shadow, and no magenta or pink anywhere in the effect itself — I will key this colour out.

Not a plain disc — a hard white starburst with radiating spikes of light. Frame 1 a small intensely white core. Frame 2 the full burst at maximum size and brightness, pure white with a faint blue-white fringe and long thin light spikes. Frames 3 to 4 collapse quickly to a small grey-white smoke puff, because a flashbang leaves smoke and no fire. About 3 tiles across at peak.

Scale: one tile is 32 world pixels and a human body is 20 world pixels across.
```

### `smoke_pop` &nbsp;·&nbsp; save as `smoke_pop.png` &nbsp;·&nbsp; 4x1 grid, 4 frames &nbsp;·&nbsp; generate at 1536x1024

```
Strict 90-degree top-down orthographic view, camera pointing straight down at the ground — NOT isometric, NOT angled, no perspective, no horizon, no visible side faces. Grounded semi-realistic military-sim style: muted desaturated palette, painterly but clean-edged, no black outline, no cartoon or cel shading, no text, no labels, no frame numbers, no watermark, no grid lines drawn between cells.

This is a SPRITE SHEET in a single image: a 4x1 grid of 4 frames of ONE continuous the first moment a smoke grenade pops, seen from directly above, evolving in order left to right then top to bottom. Every cell is exactly the same size, the cells touch with no gutters, borders or separating lines, and the effect in each cell is centered in its own cell and never crosses into a neighbouring cell. It must read as 4 moments of the SAME event, not 4 different events — same colour temperature, same style, same centre point throughout. The entire background, everywhere, including inside and between cells, is FLAT SOLID MAGENTA #FF00FF with no texture, gradient or shadow, and no magenta or pink anywhere in the effect itself — I will key this colour out.

This is only the initial BURST from the can, not the cloud that follows — the cloud is drawn by the engine. Frame 1 the can venting a small dense white-grey jet. Frames 2 to 4 the jet blooms into a fast low puff spreading outward and thinning. About 1.5 tiles across by the last frame.

Scale: one tile is 32 world pixels and a human body is 20 world pixels across.
```

### `gas_pop` &nbsp;·&nbsp; save as `gas_pop.png` &nbsp;·&nbsp; 4x1 grid, 4 frames &nbsp;·&nbsp; generate at 1536x1024

```
Strict 90-degree top-down orthographic view, camera pointing straight down at the ground — NOT isometric, NOT angled, no perspective, no horizon, no visible side faces. Grounded semi-realistic military-sim style: muted desaturated palette, painterly but clean-edged, no black outline, no cartoon or cel shading, no text, no labels, no frame numbers, no watermark, no grid lines drawn between cells.

This is a SPRITE SHEET in a single image: a 4x1 grid of 4 frames of ONE continuous the first moment a CS gas canister pops, seen from directly above, evolving in order left to right then top to bottom. Every cell is exactly the same size, the cells touch with no gutters, borders or separating lines, and the effect in each cell is centered in its own cell and never crosses into a neighbouring cell. It must read as 4 moments of the SAME event, not 4 different events — same colour temperature, same style, same centre point throughout. The entire background, everywhere, including inside and between cells, is FLAT SOLID MAGENTA #FF00FF with no texture, gradient or shadow, and no magenta or pink anywhere in the effect itself — I will key this colour out.

Same shape of event as a smoke pop but thinner and sickly yellow-green rather than white-grey, and visibly wispier — CS hangs rather than billows. About 1.5 tiles across by the last frame.

Scale: one tile is 32 world pixels and a human body is 20 world pixels across.
```

### `debris_burst` &nbsp;·&nbsp; save as `debris_burst.png` &nbsp;·&nbsp; 4x1 grid, 4 frames &nbsp;·&nbsp; generate at 1536x1024

```
Strict 90-degree top-down orthographic view, camera pointing straight down at the ground — NOT isometric, NOT angled, no perspective, no horizon, no visible side faces. Grounded semi-realistic military-sim style: muted desaturated palette, painterly but clean-edged, no black outline, no cartoon or cel shading, no text, no labels, no frame numbers, no watermark, no grid lines drawn between cells.

This is a SPRITE SHEET in a single image: a 4x1 grid of 4 frames of ONE continuous a breaching charge blowing a hole in masonry, seen from directly above, evolving in order left to right then top to bottom. Every cell is exactly the same size, the cells touch with no gutters, borders or separating lines, and the effect in each cell is centered in its own cell and never crosses into a neighbouring cell. It must read as 4 moments of the SAME event, not 4 different events — same colour temperature, same style, same centre point throughout. The entire background, everywhere, including inside and between cells, is FLAT SOLID MAGENTA #FF00FF with no texture, gradient or shadow, and no magenta or pink anywhere in the effect itself — I will key this colour out.

Concrete and plaster rather than fire. Frame 1 a sharp grey-white dust flash. Frames 2 to 3 chunks of masonry and splinters thrown outward through a dense pale dust cloud. Frame 4 settling dust with rubble fragments lying on the ground. About 2 tiles across.

Scale: one tile is 32 world pixels and a human body is 20 world pixels across.
```

### `glass_shatter` &nbsp;·&nbsp; save as `glass_shatter.png` &nbsp;·&nbsp; 4x1 grid, 4 frames &nbsp;·&nbsp; generate at 1536x1024

```
Strict 90-degree top-down orthographic view, camera pointing straight down at the ground — NOT isometric, NOT angled, no perspective, no horizon, no visible side faces. Grounded semi-realistic military-sim style: muted desaturated palette, painterly but clean-edged, no black outline, no cartoon or cel shading, no text, no labels, no frame numbers, no watermark, no grid lines drawn between cells.

This is a SPRITE SHEET in a single image: a 4x1 grid of 4 frames of ONE continuous a pane of glass shattering, seen from directly above, evolving in order left to right then top to bottom. Every cell is exactly the same size, the cells touch with no gutters, borders or separating lines, and the effect in each cell is centered in its own cell and never crosses into a neighbouring cell. It must read as 4 moments of the SAME event, not 4 different events — same colour temperature, same style, same centre point throughout. The entire background, everywhere, including inside and between cells, is FLAT SOLID MAGENTA #FF00FF with no texture, gradient or shadow, and no magenta or pink anywhere in the effect itself — I will key this colour out.

Frame 1 the impact point with radiating cracks. Frame 2 the pane breaking into angular shards. Frames 3 to 4 the shards spraying outward and falling, catching light as pale blue-white glints, ending as scattered fragments on the ground. About 1 tile across. Used for building windows AND for car glass.

Scale: one tile is 32 world pixels and a human body is 20 world pixels across.
```

---

## Tally

| Sheet | Frames | Serves |
|---|---:|---|
| `explosion_frag` | 8 | hand frags |
| `explosion_he` | 8 | 40mm, mortar sheaf, breach charge, FPV drone |
| `fire_loop` | 8 loop | burning vehicles, post-blast fires |
| `smoke_drift_loop` | 8 loop | texture riding on the procedural smoke volume |
| `flash_burst` | 4 | flashbangs |
| `smoke_pop` | 4 | smoke grenade ignition |
| `gas_pop` | 4 | CS canister ignition |
| `debris_burst` | 4 | breaching and wall charges |
| `glass_shatter` | 4 | building windows and car glass |

Nine sheets. Budget roughly 25-50KB each after slicing and quantisation, so
about 300KB for the thread. This is the batch that makes the loud moments look
loud.

## CHANGELOG
- v1.0 (2026-08-15): Split out of ART_PROMPTS_ANIMATION so the effects thread stands alone. Records the single-image sprite-sheet contract and why the smoke and CS volumes must stay procedural.
