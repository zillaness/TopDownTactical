---
file: ART_PROMPTS_ANIMATION_v1.1.md (top-down-tactical)
version: 1.1
author: Sam Cao
created: 2026-08-15
last_updated: 2026-08-15
description: Sprite-sheet animation prompts (explosions, looping fire and smoke, flashbang, smoke and gas pops, breach debris, shattering glass) and the full car battle-damage ladder, all self-contained for parallel generation. Companion to ART_PROMPTS_ALL_BATCHES_v1.0.md.
ai_update: Update last_updated and bump version in frontmatter. Rename file to match. Append changelog at bottom.
---

# BATCH 8 — ANIMATION and car battle damage

## Why this batch exists

Every explosion in the game today is **one orange circle**. `#ffae42`, scaling
1.4x down to 1.0x, fading over half a second. Six systems push that same circle:
a hand frag, a 40mm, a mortar round, a breaching charge, a wall charge and the
FPV drone. An artillery sheaf and a hand grenade look identical. The flashbang
is the same circle in white. These are the weakest visuals in the build, and
they are the moments the game is loudest.

## The one rule that makes animation work with an image model

**Never generate frames one at a time.** Ask for frame 1, then frame 2, and you
get two unrelated explosions — the model has no memory of the last image's
shape, colour temperature or centre point. Every prompt below asks for **one
image containing a grid of frames**, so the model composes the whole sequence in
a single pass and keeps it internally coherent. That is the difference between a
usable sheet and eight strangers.

Send sheets at whatever size the model returns. I slice, key the magenta, and
wire the timing in the engine. **If a sheet comes back with frames that clearly
do not belong together, regenerate rather than salvage** — a sequence is only as
good as its worst frame, and a bad one reads as a flicker.

## What NOT to generate

**The smoke and CS clouds stay procedural.** They are the best effect in the
game precisely because they are not sprites: they are a real volume whose radius
grows over time, and that same radius is what blocks vision and drives the AI. A
sheet cannot track an arbitrary changing radius, and swapping one in would make
the picture disagree with the mechanic. What IS worth having, and is below, is
the *pop* of the can (a fixed short event) and a slow drifting **texture loop**
that can ride on top of the procedural volume to stop it looking like a flat
gradient.

---

## Part 1 — animation sheets

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

Frame 8 must flow back into frame 1 with no visible jump. Soft billowing grey-white smoke that rolls and folds slowly in place rather than expanding — the engine handles the spreading. Keep the density even and the edges soft and irregular, with no single feature the eye can lock onto and watch repeat. About 2 tiles across.

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

## Part 2 — the car battle-damage ladder

### Read this first: a car is TWO materials, and the art must show it

This is the most important note in the document, because it is a mechanic the
art can teach and currently doesn't.

In the engine a car is not one object. It is authored as adjacent tiles of two
different materials:

| Tile | Material | Resist | What it does |
|---|---|---:|---|
| `@` | engine block | **999** | Stops everything. Absolute hard cover. |
| `%` | sheet metal | **11** | Concealment. Spalls, and most damage carries through. |

So hiding behind the **hood** of a car saves your life and hiding behind the
**door** gets you shot through it. The game already models this — the briefing
even warns "a vehicle is on site, only the engine block is cover" — but nothing
on screen tells the player which end is which, because a car is currently drawn
as `@` and `%` character pairs.

**Therefore, in every vehicle prompt: the engine bay must read as visibly
denser, darker and heavier than the doors and roof.** A player should be able to
learn where the real cover is by looking at the car. Since all vehicles are
authored nose-RIGHT, the engine end is always the RIGHT end of the image.

### The ladder

Five states. `intact` and `wreck` are already in batch 2; the three below are
new. Generate a ladder **in one session per vehicle** so the body, paint and
proportions match down the whole chain — this is the same rule as the door sets.

`intact` → `glass_out` → `shot_up` → `burning` → `wreck` (burned-out shell)

Generate the full ladder for the **three core vehicles** below. The other nine
vehicles in batch 2 ship `intact` + `wreck` only; that is enough variety in a
street, and the damage states are what get used up close.

## `sedan_grey` — damage ladder (one session, three images)

**GLASS OUT — the first thing that happens to a car in a firefight** — save as `sedan_grey_glass_out.png`, generate at 1536x1024

```
Strict 90-degree top-down orthographic view, camera pointing straight down at the ground — NOT isometric, NOT angled, no perspective, no horizon, no visible side faces. Grounded semi-realistic military-sim style: muted desaturated palette, painterly but clean-edged, no black outline, no cartoon or cel shading, no text, no labels, no frame numbers, no watermark, no grid lines drawn between cells.

The entire background is FLAT SOLID MAGENTA #FF00FF with no texture, gradient or shadow, and no magenta or pink anywhere in the object itself — I will key this colour out. Neutral overhead lighting with a soft contact shadow directly beneath the object only, never a long directional shadow.

One single object, centered, filling most of the frame. Seen from directly above: a civilian four-door sedan, muted grey-blue paint, nose pointing RIGHT, every window blown out: windscreen, rear window and all side glass are dark empty openings with pale glass fragments scattered across the roof and on the ground around the car. A light scatter of bullet holes in the roof and doors with bright bare-metal rims. Bodywork, tyres and paint otherwise intact and undamaged. NOT burning, NOT scorched, sitting normally on its tyres.

The engine bay at the RIGHT end must read as visibly denser, darker and heavier than the doors and roof — it is the only part of this car that stops a bullet, and the player needs to be able to see that.

Footprint: 2 tiles wide by 1 tile deep, where one tile is 32 world pixels and a human body is 20 world pixels across.
```

**SHOT UP — the car has been used as cover and hammered** — save as `sedan_grey_shot_up.png`, generate at 1536x1024

```
Strict 90-degree top-down orthographic view, camera pointing straight down at the ground — NOT isometric, NOT angled, no perspective, no horizon, no visible side faces. Grounded semi-realistic military-sim style: muted desaturated palette, painterly but clean-edged, no black outline, no cartoon or cel shading, no text, no labels, no frame numbers, no watermark, no grid lines drawn between cells.

The entire background is FLAT SOLID MAGENTA #FF00FF with no texture, gradient or shadow, and no magenta or pink anywhere in the object itself — I will key this colour out. Neutral overhead lighting with a soft contact shadow directly beneath the object only, never a long directional shadow.

One single object, centered, filling most of the frame. Seen from directly above: a civilian four-door sedan, muted grey-blue paint, nose pointing RIGHT, all glass gone, and now heavily damaged: dense clusters of bullet holes punched through the doors, hood and roof with bright torn bare-metal rims, panels dented and buckled, one door hanging open. ALL FOUR TYRES ARE FLAT — the car has visibly settled down onto its wheel rims, the tyre rubber slumped and spread out around each rim. The hood is sprung part-open showing a dark, heavy, battered engine block underneath. Thin wisps of white steam or smoke escaping the engine bay. NOT on fire yet.

The engine bay at the RIGHT end must read as visibly denser, darker and heavier than the doors and roof — it is the only part of this car that stops a bullet, and the player needs to be able to see that.

Footprint: 2 tiles wide by 1 tile deep, where one tile is 32 world pixels and a human body is 20 world pixels across.
```

**BURNING — but with NO flames drawn** — save as `sedan_grey_burning.png`, generate at 1536x1024

```
Strict 90-degree top-down orthographic view, camera pointing straight down at the ground — NOT isometric, NOT angled, no perspective, no horizon, no visible side faces. Grounded semi-realistic military-sim style: muted desaturated palette, painterly but clean-edged, no black outline, no cartoon or cel shading, no text, no labels, no frame numbers, no watermark, no grid lines drawn between cells.

The entire background is FLAT SOLID MAGENTA #FF00FF with no texture, gradient or shadow, and no magenta or pink anywhere in the object itself — I will key this colour out. Neutral overhead lighting with a soft contact shadow directly beneath the object only, never a long directional shadow.

One single object, centered, filling most of the frame. Seen from directly above: a civilian four-door sedan, muted grey-blue paint, nose pointing RIGHT, the same car after it has caught: paint blistered and blackening from the engine bay backward, all glass gone, all four tyres flat and starting to melt, hood sprung open over a scorched engine block. Render the SCORCHED BODY ONLY with no flames and no fire whatsoever — the engine composites the flames on top from a separate looping fire sheet, and drawn flames here would double up.

The engine bay at the RIGHT end must read as visibly denser, darker and heavier than the doors and roof — it is the only part of this car that stops a bullet, and the player needs to be able to see that.

Footprint: 2 tiles wide by 1 tile deep, where one tile is 32 world pixels and a human body is 20 world pixels across.
```

## `pickup` — damage ladder (one session, three images)

**GLASS OUT — the first thing that happens to a car in a firefight** — save as `pickup_glass_out.png`, generate at 1536x1024

```
Strict 90-degree top-down orthographic view, camera pointing straight down at the ground — NOT isometric, NOT angled, no perspective, no horizon, no visible side faces. Grounded semi-realistic military-sim style: muted desaturated palette, painterly but clean-edged, no black outline, no cartoon or cel shading, no text, no labels, no frame numbers, no watermark, no grid lines drawn between cells.

The entire background is FLAT SOLID MAGENTA #FF00FF with no texture, gradient or shadow, and no magenta or pink anywhere in the object itself — I will key this colour out. Neutral overhead lighting with a soft contact shadow directly beneath the object only, never a long directional shadow.

One single object, centered, filling most of the frame. Seen from directly above: a civilian pickup truck with a cab and an open cargo bed, nose pointing RIGHT, every window blown out: windscreen, rear window and all side glass are dark empty openings with pale glass fragments scattered across the roof and on the ground around the car. A light scatter of bullet holes in the roof and doors with bright bare-metal rims. Bodywork, tyres and paint otherwise intact and undamaged. NOT burning, NOT scorched, sitting normally on its tyres.

The engine bay at the RIGHT end must read as visibly denser, darker and heavier than the doors and roof — it is the only part of this car that stops a bullet, and the player needs to be able to see that.

Footprint: 2 tiles wide by 1 tile deep, where one tile is 32 world pixels and a human body is 20 world pixels across.
```

**SHOT UP — the car has been used as cover and hammered** — save as `pickup_shot_up.png`, generate at 1536x1024

```
Strict 90-degree top-down orthographic view, camera pointing straight down at the ground — NOT isometric, NOT angled, no perspective, no horizon, no visible side faces. Grounded semi-realistic military-sim style: muted desaturated palette, painterly but clean-edged, no black outline, no cartoon or cel shading, no text, no labels, no frame numbers, no watermark, no grid lines drawn between cells.

The entire background is FLAT SOLID MAGENTA #FF00FF with no texture, gradient or shadow, and no magenta or pink anywhere in the object itself — I will key this colour out. Neutral overhead lighting with a soft contact shadow directly beneath the object only, never a long directional shadow.

One single object, centered, filling most of the frame. Seen from directly above: a civilian pickup truck with a cab and an open cargo bed, nose pointing RIGHT, all glass gone, and now heavily damaged: dense clusters of bullet holes punched through the doors, hood and roof with bright torn bare-metal rims, panels dented and buckled, one door hanging open. ALL FOUR TYRES ARE FLAT — the car has visibly settled down onto its wheel rims, the tyre rubber slumped and spread out around each rim. The hood is sprung part-open showing a dark, heavy, battered engine block underneath. Thin wisps of white steam or smoke escaping the engine bay. NOT on fire yet.

The engine bay at the RIGHT end must read as visibly denser, darker and heavier than the doors and roof — it is the only part of this car that stops a bullet, and the player needs to be able to see that.

Footprint: 2 tiles wide by 1 tile deep, where one tile is 32 world pixels and a human body is 20 world pixels across.
```

**BURNING — but with NO flames drawn** — save as `pickup_burning.png`, generate at 1536x1024

```
Strict 90-degree top-down orthographic view, camera pointing straight down at the ground — NOT isometric, NOT angled, no perspective, no horizon, no visible side faces. Grounded semi-realistic military-sim style: muted desaturated palette, painterly but clean-edged, no black outline, no cartoon or cel shading, no text, no labels, no frame numbers, no watermark, no grid lines drawn between cells.

The entire background is FLAT SOLID MAGENTA #FF00FF with no texture, gradient or shadow, and no magenta or pink anywhere in the object itself — I will key this colour out. Neutral overhead lighting with a soft contact shadow directly beneath the object only, never a long directional shadow.

One single object, centered, filling most of the frame. Seen from directly above: a civilian pickup truck with a cab and an open cargo bed, nose pointing RIGHT, the same car after it has caught: paint blistered and blackening from the engine bay backward, all glass gone, all four tyres flat and starting to melt, hood sprung open over a scorched engine block. Render the SCORCHED BODY ONLY with no flames and no fire whatsoever — the engine composites the flames on top from a separate looping fire sheet, and drawn flames here would double up.

The engine bay at the RIGHT end must read as visibly denser, darker and heavier than the doors and roof — it is the only part of this car that stops a bullet, and the player needs to be able to see that.

Footprint: 2 tiles wide by 1 tile deep, where one tile is 32 world pixels and a human body is 20 world pixels across.
```

## `panel_van` — damage ladder (one session, three images)

**GLASS OUT — the first thing that happens to a car in a firefight** — save as `panel_van_glass_out.png`, generate at 1536x1024

```
Strict 90-degree top-down orthographic view, camera pointing straight down at the ground — NOT isometric, NOT angled, no perspective, no horizon, no visible side faces. Grounded semi-realistic military-sim style: muted desaturated palette, painterly but clean-edged, no black outline, no cartoon or cel shading, no text, no labels, no frame numbers, no watermark, no grid lines drawn between cells.

The entire background is FLAT SOLID MAGENTA #FF00FF with no texture, gradient or shadow, and no magenta or pink anywhere in the object itself — I will key this colour out. Neutral overhead lighting with a soft contact shadow directly beneath the object only, never a long directional shadow.

One single object, centered, filling most of the frame. Seen from directly above: a white panel van with one long unbroken cargo roof, nose pointing RIGHT, every window blown out: windscreen, rear window and all side glass are dark empty openings with pale glass fragments scattered across the roof and on the ground around the car. A light scatter of bullet holes in the roof and doors with bright bare-metal rims. Bodywork, tyres and paint otherwise intact and undamaged. NOT burning, NOT scorched, sitting normally on its tyres.

The engine bay at the RIGHT end must read as visibly denser, darker and heavier than the doors and roof — it is the only part of this car that stops a bullet, and the player needs to be able to see that.

Footprint: 2 tiles wide by 1 tile deep, where one tile is 32 world pixels and a human body is 20 world pixels across.
```

**SHOT UP — the car has been used as cover and hammered** — save as `panel_van_shot_up.png`, generate at 1536x1024

```
Strict 90-degree top-down orthographic view, camera pointing straight down at the ground — NOT isometric, NOT angled, no perspective, no horizon, no visible side faces. Grounded semi-realistic military-sim style: muted desaturated palette, painterly but clean-edged, no black outline, no cartoon or cel shading, no text, no labels, no frame numbers, no watermark, no grid lines drawn between cells.

The entire background is FLAT SOLID MAGENTA #FF00FF with no texture, gradient or shadow, and no magenta or pink anywhere in the object itself — I will key this colour out. Neutral overhead lighting with a soft contact shadow directly beneath the object only, never a long directional shadow.

One single object, centered, filling most of the frame. Seen from directly above: a white panel van with one long unbroken cargo roof, nose pointing RIGHT, all glass gone, and now heavily damaged: dense clusters of bullet holes punched through the doors, hood and roof with bright torn bare-metal rims, panels dented and buckled, one door hanging open. ALL FOUR TYRES ARE FLAT — the car has visibly settled down onto its wheel rims, the tyre rubber slumped and spread out around each rim. The hood is sprung part-open showing a dark, heavy, battered engine block underneath. Thin wisps of white steam or smoke escaping the engine bay. NOT on fire yet.

The engine bay at the RIGHT end must read as visibly denser, darker and heavier than the doors and roof — it is the only part of this car that stops a bullet, and the player needs to be able to see that.

Footprint: 2 tiles wide by 1 tile deep, where one tile is 32 world pixels and a human body is 20 world pixels across.
```

**BURNING — but with NO flames drawn** — save as `panel_van_burning.png`, generate at 1536x1024

```
Strict 90-degree top-down orthographic view, camera pointing straight down at the ground — NOT isometric, NOT angled, no perspective, no horizon, no visible side faces. Grounded semi-realistic military-sim style: muted desaturated palette, painterly but clean-edged, no black outline, no cartoon or cel shading, no text, no labels, no frame numbers, no watermark, no grid lines drawn between cells.

The entire background is FLAT SOLID MAGENTA #FF00FF with no texture, gradient or shadow, and no magenta or pink anywhere in the object itself — I will key this colour out. Neutral overhead lighting with a soft contact shadow directly beneath the object only, never a long directional shadow.

One single object, centered, filling most of the frame. Seen from directly above: a white panel van with one long unbroken cargo roof, nose pointing RIGHT, the same car after it has caught: paint blistered and blackening from the engine bay backward, all glass gone, all four tyres flat and starting to melt, hood sprung open over a scorched engine block. Render the SCORCHED BODY ONLY with no flames and no fire whatsoever — the engine composites the flames on top from a separate looping fire sheet, and drawn flames here would double up.

The engine bay at the RIGHT end must read as visibly denser, darker and heavier than the doors and roof — it is the only part of this car that stops a bullet, and the player needs to be able to see that.

Footprint: 2 tiles wide by 1 tile deep, where one tile is 32 world pixels and a human body is 20 world pixels across.
```

## Generic damage overlays

These stamp on top of ANY vehicle, so four small assets cover all twelve cars
without generating a ladder for each. Keep them body-colour-neutral.

### `bulletholes_light` &nbsp;·&nbsp; save as `bulletholes_light.png` &nbsp;·&nbsp; generate at 1024x1024

```
Strict 90-degree top-down orthographic view, camera pointing straight down at the ground — NOT isometric, NOT angled, no perspective, no horizon, no visible side faces. Grounded semi-realistic military-sim style: muted desaturated palette, painterly but clean-edged, no black outline, no cartoon or cel shading, no text, no labels, no frame numbers, no watermark, no grid lines drawn between cells.

The entire background is FLAT SOLID MAGENTA #FF00FF with no texture, gradient or shadow, and no magenta or pink anywhere in the object itself — I will key this colour out. Neutral overhead lighting with a soft contact shadow directly beneath the object only, never a long directional shadow.

An overlay decal sheet seen from directly above: a loose scatter of about eight bullet holes punched through painted sheet metal, each a small dark puncture with a bright torn bare-metal rim and a faint dent ring around it. The holes are spread irregularly across the frame with plenty of empty magenta between them — this is a transparent overlay stamped onto vehicle panels, so there must be NO background panel, NO car, and NO surface behind the holes, only the holes themselves floating on the magenta field.

Covers about 1 tile square, where one tile is 32 world pixels.
```

### `bulletholes_heavy` &nbsp;·&nbsp; save as `bulletholes_heavy.png` &nbsp;·&nbsp; generate at 1024x1024

```
Strict 90-degree top-down orthographic view, camera pointing straight down at the ground — NOT isometric, NOT angled, no perspective, no horizon, no visible side faces. Grounded semi-realistic military-sim style: muted desaturated palette, painterly but clean-edged, no black outline, no cartoon or cel shading, no text, no labels, no frame numbers, no watermark, no grid lines drawn between cells.

The entire background is FLAT SOLID MAGENTA #FF00FF with no texture, gradient or shadow, and no magenta or pink anywhere in the object itself — I will key this colour out. Neutral overhead lighting with a soft contact shadow directly beneath the object only, never a long directional shadow.

An overlay decal sheet seen from directly above: a dense cluster of about twenty-five bullet holes through painted sheet metal, tightly grouped as if from a burst, each a dark puncture with a bright torn bare-metal rim, some overlapping into ragged tears, with buckling and dishing of the metal around the densest part. NO background panel, NO car and NO surface behind them — only the holes on the magenta field, so this can be stamped as a transparent overlay.

Covers about 1 tile square, where one tile is 32 world pixels.
```

### `tyre_flat` &nbsp;·&nbsp; save as `tyre_flat.png` &nbsp;·&nbsp; generate at 1024x1024

```
Strict 90-degree top-down orthographic view, camera pointing straight down at the ground — NOT isometric, NOT angled, no perspective, no horizon, no visible side faces. Grounded semi-realistic military-sim style: muted desaturated palette, painterly but clean-edged, no black outline, no cartoon or cel shading, no text, no labels, no frame numbers, no watermark, no grid lines drawn between cells.

The entire background is FLAT SOLID MAGENTA #FF00FF with no texture, gradient or shadow, and no magenta or pink anywhere in the object itself — I will key this colour out. Neutral overhead lighting with a soft contact shadow directly beneath the object only, never a long directional shadow.

A single blown-out car tyre seen from directly above, isolated: the rubber shredded and slumped outward around a bare steel wheel rim that has settled down onto the ground, with a few strips of torn tread lying beside it. About 0.4 tiles across, where one tile is 32 world pixels.
```

### `glass_scatter` &nbsp;·&nbsp; save as `glass_scatter.png` &nbsp;·&nbsp; generate at 1024x1024

```
Strict 90-degree top-down orthographic view, camera pointing straight down at the ground — NOT isometric, NOT angled, no perspective, no horizon, no visible side faces. Grounded semi-realistic military-sim style: muted desaturated palette, painterly but clean-edged, no black outline, no cartoon or cel shading, no text, no labels, no frame numbers, no watermark, no grid lines drawn between cells.

The entire background is FLAT SOLID MAGENTA #FF00FF with no texture, gradient or shadow, and no magenta or pink anywhere in the object itself — I will key this colour out. Neutral overhead lighting with a soft contact shadow directly beneath the object only, never a long directional shadow.

An overlay decal seen from directly above: a spray of shattered safety-glass fragments lying on the ground, small pale blue-white cubes and chips catching the light, densest at one edge and thinning outward. NO ground surface and NO background behind them — only the fragments on the magenta field, so this can be stamped as a transparent overlay wherever glass has come out. About 1.5 tiles across.
```

---

## Tally

| Asset | Frames | Serves |
|---|---:|---|
| `explosion_frag` | 8 | hand frags |
| `explosion_he` | 8 | 40mm, mortar sheaf, breach, FPV |
| `fire_loop` | 8 loop | burning vehicles, post-blast fires |
| `smoke_drift_loop` | 8 loop | texture riding on the procedural smoke volume |
| `flash_burst` | 4 | flashbangs |
| `smoke_pop` | 4 | smoke grenade ignition |
| `gas_pop` | 4 | CS canister ignition |
| `debris_burst` | 4 | breaching and wall charges |
| `glass_shatter` | 4 | building windows and car glass |
| `sedan_grey` ladder | 3 stills | glass_out, shot_up, burning |
| `pickup` ladder | 3 stills | glass_out, shot_up, burning |
| `panel_van` ladder | 3 stills | glass_out, shot_up, burning |
| `bulletholes_light` / `_heavy` | 2 stills | stamped on any vehicle or panel |
| `tyre_flat` | 1 still | stamped per wheel |
| `glass_scatter` | 1 still | ground decal where glass came out |

Nine sheets and thirteen stills. Sheets cost more than props — budget roughly
25-50KB each after slicing and quantisation, so about 350KB for the batch. This
is the batch that makes the loud moments look loud, and the one that finally
shows the player which end of a car will save them.

## CHANGELOG
- v1.0 (2026-08-15): Written after Sam asked whether the prompt set covered explosions, shot-out car windows, burning cars, and flashbang/grenade/smoke animation. It covered none of them.
- v1.1 (2026-08-15): Sam expanded the car ask to a full damage ladder — flat tyres, broken windows, shot-up doors, an exposed engine block, burning and burned-out. Rewritten around the fact that a car in this engine is TWO materials (`@` engine block, resist 999, versus `%` sheet metal, resist 11), so the art must make the engine end read as the heavy end and teach the player where the real cover is. Adds the three-state ladder for three core vehicles, four generic damage overlays that stamp on any body, and a looping smoke texture that rides on the procedural volume instead of replacing it.
