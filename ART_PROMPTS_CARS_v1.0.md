---
file: ART_PROMPTS_CARS_v1.0.md (top-down-tactical)
version: 1.0
author: Sam Cao
created: 2026-08-15
last_updated: 2026-08-15
description: Every vehicle prompt in one place — twelve intact vehicles, a three-state battle-damage ladder for the three core bodies, and four generic damage overlays. Self-contained; this is the whole cars thread.
ai_update: Update last_updated and bump version in frontmatter. Rename file to match. Append changelog at bottom. Strike assets through as they are generated and integrated.
---

# CARS — the whole vehicle thread

Everything with wheels lives in this one file. Nothing here needs anything
pasted before it.

**Why cars first:** three maps are built around them and all three currently
draw cars as `@` and `%` character pairs. DOWNTOWN EXCHANGE is a lane of cars,
RAMADI ROW has you crossing at the cars, BROKEN ARROW is an ambushed convoy.
This is the highest return per asset in the game.

## Read this first: a car is TWO materials, and the art must show it

This is the most important note in the document, because it is a mechanic the
art can teach and currently doesn't.

In the engine a car is not one object. It is authored as adjacent tiles of two
different materials:

| Tile | Material | Resist | What it does |
|---|---|---:|---|
| `@` | engine block | **999** | Stops everything. Absolute hard cover. |
| `%` | sheet metal | **11** | Concealment. Spalls, and most damage carries through. |

Hiding behind the **hood** of a car saves your life. Hiding behind the **door**
gets you shot through it. The game already models this exactly, and the briefing
even warns "a vehicle is on site, only the engine block is cover" — but nothing
on screen tells the player which end is which.

**So in every prompt below the engine bay must read as visibly denser, darker
and heavier than the doors and roof.** A player should learn where the real
cover is by looking. Every vehicle is authored **nose-RIGHT** — the engine
rotates them at draw time — so the engine end is always the RIGHT end of the
image. Consistency here matters far more than variety of pose.

## Rules for every prompt in this file

1. **One asset per generation.** Never ask for a sheet of several — you get
   inconsistent scale, lighting and camera angle, and none of it is fixable
   afterwards.
2. **Reject and regenerate on two failures:** any visible *side face* of the
   object, which means the camera drifted off vertical and is by far the most
   common failure; and any long directional shadow, since our lighting is flat
   and a shadow pointing somewhere will fight every other asset on screen.
3. **Transparency.** Via the API, `gpt-image-1` with `background: "transparent"`
   works properly. Via the ChatGPT UI it is unreliable, which is why every
   prompt asks for a flat magenta #FF00FF field to key out instead. If you get
   pink fringing on the edges, add "harder edge against the background".
4. **Do not downscale.** Send whatever the model returns at full size — keying,
   resize and palette quantisation happen on my end, the same way batch 1 was.
5. **Filenames matter.** They map to the keys the engine looks up. Use exactly
   the name given with each prompt.

---

## Part 1 — the twelve intact vehicles

All independent. Generate them in parallel.

### `sedan_grey` &nbsp;·&nbsp; save as `sedan_grey.png` &nbsp;·&nbsp; generate at 1536x1024

```
Strict 90-degree top-down orthographic game asset, camera pointing straight down at the ground — NOT isometric, NOT angled, no perspective, no horizon, no vanishing point, no visible side faces of the object. Grounded semi-realistic military-sim style: muted desaturated palette, painterly but clean-edged, no black outline, no cartoon or cel shading, no text, no labels, no watermark.

One single object, centered, filling most of the frame, isolated on a FLAT SOLID MAGENTA #FF00FF field with no texture, gradient or shadow, and no magenta or pink anywhere in the object itself — I will key this colour out. Neutral overhead lighting with a soft contact shadow directly beneath the object only, never a long directional shadow. The asset must still read clearly at 10% size against a dark floor. Palette anchors: floor #303b46, wall #46545f, brick #845345, wood #80623a, metal #788792, foliage #3b5238, accent #e8b53a.

Seen from directly above: A civilian four-door sedan, nose pointing RIGHT: roof, hood and trunk clearly distinguishable, windscreen and rear window readable as darker glass, muted grey-blue paint, slightly weathered.

The engine bay at the RIGHT end must read as visibly denser, darker and heavier than the doors and roof — it is the only part of this car that stops a bullet, and the player needs to be able to see that.

Footprint: 2 tiles wide by 1 tiles deep, where one tile is 32 world pixels and a human body is 20 world pixels across.
```

### `sedan_red` &nbsp;·&nbsp; save as `sedan_red.png` &nbsp;·&nbsp; generate at 1536x1024

```
Strict 90-degree top-down orthographic game asset, camera pointing straight down at the ground — NOT isometric, NOT angled, no perspective, no horizon, no vanishing point, no visible side faces of the object. Grounded semi-realistic military-sim style: muted desaturated palette, painterly but clean-edged, no black outline, no cartoon or cel shading, no text, no labels, no watermark.

One single object, centered, filling most of the frame, isolated on a FLAT SOLID MAGENTA #FF00FF field with no texture, gradient or shadow, and no magenta or pink anywhere in the object itself — I will key this colour out. Neutral overhead lighting with a soft contact shadow directly beneath the object only, never a long directional shadow. The asset must still read clearly at 10% size against a dark floor. Palette anchors: floor #303b46, wall #46545f, brick #845345, wood #80623a, metal #788792, foliage #3b5238, accent #e8b53a.

Seen from directly above: A civilian four-door sedan, nose pointing RIGHT: an older boxier body than a modern car, faded red paint, dull chrome trim, some rust at the edges.

The engine bay at the RIGHT end must read as visibly denser, darker and heavier than the doors and roof — it is the only part of this car that stops a bullet, and the player needs to be able to see that.

Footprint: 2 tiles wide by 1 tiles deep, where one tile is 32 world pixels and a human body is 20 world pixels across.
```

### `hatchback` &nbsp;·&nbsp; save as `hatchback.png` &nbsp;·&nbsp; generate at 1536x1024

```
Strict 90-degree top-down orthographic game asset, camera pointing straight down at the ground — NOT isometric, NOT angled, no perspective, no horizon, no vanishing point, no visible side faces of the object. Grounded semi-realistic military-sim style: muted desaturated palette, painterly but clean-edged, no black outline, no cartoon or cel shading, no text, no labels, no watermark.

One single object, centered, filling most of the frame, isolated on a FLAT SOLID MAGENTA #FF00FF field with no texture, gradient or shadow, and no magenta or pink anywhere in the object itself — I will key this colour out. Neutral overhead lighting with a soft contact shadow directly beneath the object only, never a long directional shadow. The asset must still read clearly at 10% size against a dark floor. Palette anchors: floor #303b46, wall #46545f, brick #845345, wood #80623a, metal #788792, foliage #3b5238, accent #e8b53a.

Seen from directly above: A small civilian hatchback, nose pointing RIGHT: short body, steeply raked rear, dull white paint.

The engine bay at the RIGHT end must read as visibly denser, darker and heavier than the doors and roof — it is the only part of this car that stops a bullet, and the player needs to be able to see that.

Footprint: 1.5 tiles wide by 1 tiles deep, where one tile is 32 world pixels and a human body is 20 world pixels across.
```

### `pickup` &nbsp;·&nbsp; save as `pickup.png` &nbsp;·&nbsp; generate at 1536x1024

```
Strict 90-degree top-down orthographic game asset, camera pointing straight down at the ground — NOT isometric, NOT angled, no perspective, no horizon, no vanishing point, no visible side faces of the object. Grounded semi-realistic military-sim style: muted desaturated palette, painterly but clean-edged, no black outline, no cartoon or cel shading, no text, no labels, no watermark.

One single object, centered, filling most of the frame, isolated on a FLAT SOLID MAGENTA #FF00FF field with no texture, gradient or shadow, and no magenta or pink anywhere in the object itself — I will key this colour out. Neutral overhead lighting with a soft contact shadow directly beneath the object only, never a long directional shadow. The asset must still read clearly at 10% size against a dark floor. Palette anchors: floor #303b46, wall #46545f, brick #845345, wood #80623a, metal #788792, foliage #3b5238, accent #e8b53a.

Seen from directly above: A civilian pickup truck, nose pointing RIGHT: cab roof at the front, then an open cargo bed with a visible ribbed bed floor and side walls.

The engine bay at the RIGHT end must read as visibly denser, darker and heavier than the doors and roof — it is the only part of this car that stops a bullet, and the player needs to be able to see that.

Footprint: 2.25 tiles wide by 1 tiles deep, where one tile is 32 world pixels and a human body is 20 world pixels across.
```

### `panel_van` &nbsp;·&nbsp; save as `panel_van.png` &nbsp;·&nbsp; generate at 1536x1024

```
Strict 90-degree top-down orthographic game asset, camera pointing straight down at the ground — NOT isometric, NOT angled, no perspective, no horizon, no vanishing point, no visible side faces of the object. Grounded semi-realistic military-sim style: muted desaturated palette, painterly but clean-edged, no black outline, no cartoon or cel shading, no text, no labels, no watermark.

One single object, centered, filling most of the frame, isolated on a FLAT SOLID MAGENTA #FF00FF field with no texture, gradient or shadow, and no magenta or pink anywhere in the object itself — I will key this colour out. Neutral overhead lighting with a soft contact shadow directly beneath the object only, never a long directional shadow. The asset must still read clearly at 10% size against a dark floor. Palette anchors: floor #303b46, wall #46545f, brick #845345, wood #80623a, metal #788792, foliage #3b5238, accent #e8b53a.

Seen from directly above: A white panel van, nose pointing RIGHT: a short cab roof and then one long flat unbroken cargo roof, blank sides, no windows behind the cab.

The engine bay at the RIGHT end must read as visibly denser, darker and heavier than the doors and roof — it is the only part of this car that stops a bullet, and the player needs to be able to see that.

Footprint: 2.5 tiles wide by 1.25 tiles deep, where one tile is 32 world pixels and a human body is 20 world pixels across.
```

### `suv` &nbsp;·&nbsp; save as `suv.png` &nbsp;·&nbsp; generate at 1536x1024

```
Strict 90-degree top-down orthographic game asset, camera pointing straight down at the ground — NOT isometric, NOT angled, no perspective, no horizon, no vanishing point, no visible side faces of the object. Grounded semi-realistic military-sim style: muted desaturated palette, painterly but clean-edged, no black outline, no cartoon or cel shading, no text, no labels, no watermark.

One single object, centered, filling most of the frame, isolated on a FLAT SOLID MAGENTA #FF00FF field with no texture, gradient or shadow, and no magenta or pink anywhere in the object itself — I will key this colour out. Neutral overhead lighting with a soft contact shadow directly beneath the object only, never a long directional shadow. The asset must still read clearly at 10% size against a dark floor. Palette anchors: floor #303b46, wall #46545f, brick #845345, wood #80623a, metal #788792, foliage #3b5238, accent #e8b53a.

Seen from directly above: A civilian SUV, nose pointing RIGHT: long roof with roof rails running front to back, dark green paint.

The engine bay at the RIGHT end must read as visibly denser, darker and heavier than the doors and roof — it is the only part of this car that stops a bullet, and the player needs to be able to see that.

Footprint: 2.25 tiles wide by 1.15 tiles deep, where one tile is 32 world pixels and a human body is 20 world pixels across.
```

### `taxi` &nbsp;·&nbsp; save as `taxi.png` &nbsp;·&nbsp; generate at 1536x1024

```
Strict 90-degree top-down orthographic game asset, camera pointing straight down at the ground — NOT isometric, NOT angled, no perspective, no horizon, no vanishing point, no visible side faces of the object. Grounded semi-realistic military-sim style: muted desaturated palette, painterly but clean-edged, no black outline, no cartoon or cel shading, no text, no labels, no watermark.

One single object, centered, filling most of the frame, isolated on a FLAT SOLID MAGENTA #FF00FF field with no texture, gradient or shadow, and no magenta or pink anywhere in the object itself — I will key this colour out. Neutral overhead lighting with a soft contact shadow directly beneath the object only, never a long directional shadow. The asset must still read clearly at 10% size against a dark floor. Palette anchors: floor #303b46, wall #46545f, brick #845345, wood #80623a, metal #788792, foliage #3b5238, accent #e8b53a.

Seen from directly above: A yellow city taxi, nose pointing RIGHT: a small rectangular roof sign near the front of the roof, slightly scuffed paint.

The engine bay at the RIGHT end must read as visibly denser, darker and heavier than the doors and roof — it is the only part of this car that stops a bullet, and the player needs to be able to see that.

Footprint: 2 tiles wide by 1 tiles deep, where one tile is 32 world pixels and a human body is 20 world pixels across.
```

### `police_cruiser` &nbsp;·&nbsp; save as `police_cruiser.png` &nbsp;·&nbsp; generate at 1536x1024

```
Strict 90-degree top-down orthographic game asset, camera pointing straight down at the ground — NOT isometric, NOT angled, no perspective, no horizon, no vanishing point, no visible side faces of the object. Grounded semi-realistic military-sim style: muted desaturated palette, painterly but clean-edged, no black outline, no cartoon or cel shading, no text, no labels, no watermark.

One single object, centered, filling most of the frame, isolated on a FLAT SOLID MAGENTA #FF00FF field with no texture, gradient or shadow, and no magenta or pink anywhere in the object itself — I will key this colour out. Neutral overhead lighting with a soft contact shadow directly beneath the object only, never a long directional shadow. The asset must still read clearly at 10% size against a dark floor. Palette anchors: floor #303b46, wall #46545f, brick #845345, wood #80623a, metal #788792, foliage #3b5238, accent #e8b53a.

Seen from directly above: A police cruiser, nose pointing RIGHT: black-and-white livery, a lightbar mounted across the roof at the midline.

The engine bay at the RIGHT end must read as visibly denser, darker and heavier than the doors and roof — it is the only part of this car that stops a bullet, and the player needs to be able to see that.

Footprint: 2 tiles wide by 1 tiles deep, where one tile is 32 world pixels and a human body is 20 world pixels across.
```

### `box_truck` &nbsp;·&nbsp; save as `box_truck.png` &nbsp;·&nbsp; generate at 1536x1024

```
Strict 90-degree top-down orthographic game asset, camera pointing straight down at the ground — NOT isometric, NOT angled, no perspective, no horizon, no vanishing point, no visible side faces of the object. Grounded semi-realistic military-sim style: muted desaturated palette, painterly but clean-edged, no black outline, no cartoon or cel shading, no text, no labels, no watermark.

One single object, centered, filling most of the frame, isolated on a FLAT SOLID MAGENTA #FF00FF field with no texture, gradient or shadow, and no magenta or pink anywhere in the object itself — I will key this colour out. Neutral overhead lighting with a soft contact shadow directly beneath the object only, never a long directional shadow. The asset must still read clearly at 10% size against a dark floor. Palette anchors: floor #303b46, wall #46545f, brick #845345, wood #80623a, metal #788792, foliage #3b5238, accent #e8b53a.

Seen from directly above: A flatbed box truck, nose pointing RIGHT: a cab roof at the front and a long plain rectangular cargo box roof behind it.

The engine bay at the RIGHT end must read as visibly denser, darker and heavier than the doors and roof — it is the only part of this car that stops a bullet, and the player needs to be able to see that.

Footprint: 3.5 tiles wide by 1.5 tiles deep, where one tile is 32 world pixels and a human body is 20 world pixels across.
```

### `humvee` &nbsp;·&nbsp; save as `humvee.png` &nbsp;·&nbsp; generate at 1536x1024

```
Strict 90-degree top-down orthographic game asset, camera pointing straight down at the ground — NOT isometric, NOT angled, no perspective, no horizon, no vanishing point, no visible side faces of the object. Grounded semi-realistic military-sim style: muted desaturated palette, painterly but clean-edged, no black outline, no cartoon or cel shading, no text, no labels, no watermark.

One single object, centered, filling most of the frame, isolated on a FLAT SOLID MAGENTA #FF00FF field with no texture, gradient or shadow, and no magenta or pink anywhere in the object itself — I will key this colour out. Neutral overhead lighting with a soft contact shadow directly beneath the object only, never a long directional shadow. The asset must still read clearly at 10% size against a dark floor. Palette anchors: floor #303b46, wall #46545f, brick #845345, wood #80623a, metal #788792, foliage #3b5238, accent #e8b53a.

Seen from directly above: An up-armored military truck, Humvee-like, nose pointing RIGHT: flat sand-tan roof, a circular turret ring at the centre rear of the roof, stowage racks at the back.

The engine bay at the RIGHT end must read as visibly denser, darker and heavier than the doors and roof — it is the only part of this car that stops a bullet, and the player needs to be able to see that.

Footprint: 2.5 tiles wide by 1.25 tiles deep, where one tile is 32 world pixels and a human body is 20 world pixels across.
```

### `car_overturned` &nbsp;·&nbsp; save as `car_overturned.png` &nbsp;·&nbsp; generate at 1536x1024

```
Strict 90-degree top-down orthographic game asset, camera pointing straight down at the ground — NOT isometric, NOT angled, no perspective, no horizon, no vanishing point, no visible side faces of the object. Grounded semi-realistic military-sim style: muted desaturated palette, painterly but clean-edged, no black outline, no cartoon or cel shading, no text, no labels, no watermark.

One single object, centered, filling most of the frame, isolated on a FLAT SOLID MAGENTA #FF00FF field with no texture, gradient or shadow, and no magenta or pink anywhere in the object itself — I will key this colour out. Neutral overhead lighting with a soft contact shadow directly beneath the object only, never a long directional shadow. The asset must still read clearly at 10% size against a dark floor. Palette anchors: floor #303b46, wall #46545f, brick #845345, wood #80623a, metal #788792, foliage #3b5238, accent #e8b53a.

Seen from directly above: An overturned car showing its UNDERCARRIAGE: axles, differential, exhaust line and fuel tank readable, wheels pointing up at the camera, dirt and rust. Nose still pointing RIGHT.

The engine bay at the RIGHT end must read as visibly denser, darker and heavier than the doors and roof — it is the only part of this car that stops a bullet, and the player needs to be able to see that.

Footprint: 2 tiles wide by 1 tiles deep, where one tile is 32 world pixels and a human body is 20 world pixels across.
```

### `car_wreck` &nbsp;·&nbsp; save as `car_wreck.png` &nbsp;·&nbsp; generate at 1536x1024

```
Strict 90-degree top-down orthographic game asset, camera pointing straight down at the ground — NOT isometric, NOT angled, no perspective, no horizon, no vanishing point, no visible side faces of the object. Grounded semi-realistic military-sim style: muted desaturated palette, painterly but clean-edged, no black outline, no cartoon or cel shading, no text, no labels, no watermark.

One single object, centered, filling most of the frame, isolated on a FLAT SOLID MAGENTA #FF00FF field with no texture, gradient or shadow, and no magenta or pink anywhere in the object itself — I will key this colour out. Neutral overhead lighting with a soft contact shadow directly beneath the object only, never a long directional shadow. The asset must still read clearly at 10% size against a dark floor. Palette anchors: floor #303b46, wall #46545f, brick #845345, wood #80623a, metal #788792, foliage #3b5238, accent #e8b53a.

Seen from directly above: A long-dead burned-out car wreck, nose pointing RIGHT: scorched black-brown shell, no glass left in any opening, rusted and buckled panels, one door missing, all four tyres burned away leaving it sitting on bare rims. Cold and long finished burning — no fire, no smoke.

The engine bay at the RIGHT end must read as visibly denser, darker and heavier than the doors and roof — it is the only part of this car that stops a bullet, and the player needs to be able to see that.

Footprint: 2 tiles wide by 1 tiles deep, where one tile is 32 world pixels and a human body is 20 world pixels across.
```

---

## Part 2 — the battle-damage ladder

Five states per car. `intact` (part 1) and `car_wreck` (part 1) are the ends of
the chain; the three below are the middle.

`intact` → `glass_out` → `shot_up` → `burning` → `wreck`

**Generate a ladder in ONE session per vehicle** so the body, paint and
proportions match all the way down. This is the one place in the cars thread
where parallelising *within* a set will hurt you — the three states have to look
like the same car. The three vehicles can still run in parallel with each other.

Full ladder for the three core bodies below. The other nine vehicles ship
`intact` + `wreck` only — that is enough variety in a street, and the damage
states are what get seen up close.

## `sedan_grey` — damage ladder (one session, three images)

**GLASS OUT — the first thing that happens to a car in a firefight** — save as `sedan_grey_glass_out.png`, generate at 1536x1024

```
Strict 90-degree top-down orthographic game asset, camera pointing straight down at the ground — NOT isometric, NOT angled, no perspective, no horizon, no vanishing point, no visible side faces of the object. Grounded semi-realistic military-sim style: muted desaturated palette, painterly but clean-edged, no black outline, no cartoon or cel shading, no text, no labels, no watermark.

One single object, centered, filling most of the frame, isolated on a FLAT SOLID MAGENTA #FF00FF field with no texture, gradient or shadow, and no magenta or pink anywhere in the object itself — I will key this colour out. Neutral overhead lighting with a soft contact shadow directly beneath the object only, never a long directional shadow. The asset must still read clearly at 10% size against a dark floor. Palette anchors: floor #303b46, wall #46545f, brick #845345, wood #80623a, metal #788792, foliage #3b5238, accent #e8b53a.

Seen from directly above: a civilian four-door sedan, muted grey-blue paint, nose pointing RIGHT, every window blown out: windscreen, rear window and all side glass are dark empty openings with pale glass fragments scattered across the roof and on the ground around the car. A light scatter of bullet holes in the roof and doors with bright bare-metal rims. Bodywork, tyres and paint otherwise intact. NOT burning, NOT scorched, sitting normally on its tyres.

The engine bay at the RIGHT end must read as visibly denser, darker and heavier than the doors and roof — it is the only part of this car that stops a bullet, and the player needs to be able to see that.

Footprint: 2 tiles wide by 1 tiles deep, where one tile is 32 world pixels and a human body is 20 world pixels across.
```

**SHOT UP — the car has been used as cover and hammered** — save as `sedan_grey_shot_up.png`, generate at 1536x1024

```
Strict 90-degree top-down orthographic game asset, camera pointing straight down at the ground — NOT isometric, NOT angled, no perspective, no horizon, no vanishing point, no visible side faces of the object. Grounded semi-realistic military-sim style: muted desaturated palette, painterly but clean-edged, no black outline, no cartoon or cel shading, no text, no labels, no watermark.

One single object, centered, filling most of the frame, isolated on a FLAT SOLID MAGENTA #FF00FF field with no texture, gradient or shadow, and no magenta or pink anywhere in the object itself — I will key this colour out. Neutral overhead lighting with a soft contact shadow directly beneath the object only, never a long directional shadow. The asset must still read clearly at 10% size against a dark floor. Palette anchors: floor #303b46, wall #46545f, brick #845345, wood #80623a, metal #788792, foliage #3b5238, accent #e8b53a.

Seen from directly above: a civilian four-door sedan, muted grey-blue paint, nose pointing RIGHT, all glass gone, and now heavily damaged: dense clusters of bullet holes punched through the doors, hood and roof with bright torn bare-metal rims, panels dented and buckled, one door hanging open. ALL FOUR TYRES ARE FLAT — the car has visibly settled down onto its wheel rims, the tyre rubber slumped and spread around each rim. The hood is sprung part-open showing a dark, heavy, battered engine block underneath. Thin wisps of white steam escaping the engine bay. NOT on fire yet.

The engine bay at the RIGHT end must read as visibly denser, darker and heavier than the doors and roof — it is the only part of this car that stops a bullet, and the player needs to be able to see that.

Footprint: 2 tiles wide by 1 tiles deep, where one tile is 32 world pixels and a human body is 20 world pixels across.
```

**BURNING — but with NO flames drawn** — save as `sedan_grey_burning.png`, generate at 1536x1024

```
Strict 90-degree top-down orthographic game asset, camera pointing straight down at the ground — NOT isometric, NOT angled, no perspective, no horizon, no vanishing point, no visible side faces of the object. Grounded semi-realistic military-sim style: muted desaturated palette, painterly but clean-edged, no black outline, no cartoon or cel shading, no text, no labels, no watermark.

One single object, centered, filling most of the frame, isolated on a FLAT SOLID MAGENTA #FF00FF field with no texture, gradient or shadow, and no magenta or pink anywhere in the object itself — I will key this colour out. Neutral overhead lighting with a soft contact shadow directly beneath the object only, never a long directional shadow. The asset must still read clearly at 10% size against a dark floor. Palette anchors: floor #303b46, wall #46545f, brick #845345, wood #80623a, metal #788792, foliage #3b5238, accent #e8b53a.

Seen from directly above: a civilian four-door sedan, muted grey-blue paint, nose pointing RIGHT, the same car after it has caught: paint blistered and blackening from the engine bay backward, all glass gone, all four tyres flat and starting to melt, hood sprung open over a scorched engine block. Render the SCORCHED BODY ONLY with no flames and no fire whatsoever — the engine composites flames on top from a separate looping fire sheet, and drawn flames here would double up.

The engine bay at the RIGHT end must read as visibly denser, darker and heavier than the doors and roof — it is the only part of this car that stops a bullet, and the player needs to be able to see that.

Footprint: 2 tiles wide by 1 tiles deep, where one tile is 32 world pixels and a human body is 20 world pixels across.
```

## `pickup` — damage ladder (one session, three images)

**GLASS OUT — the first thing that happens to a car in a firefight** — save as `pickup_glass_out.png`, generate at 1536x1024

```
Strict 90-degree top-down orthographic game asset, camera pointing straight down at the ground — NOT isometric, NOT angled, no perspective, no horizon, no vanishing point, no visible side faces of the object. Grounded semi-realistic military-sim style: muted desaturated palette, painterly but clean-edged, no black outline, no cartoon or cel shading, no text, no labels, no watermark.

One single object, centered, filling most of the frame, isolated on a FLAT SOLID MAGENTA #FF00FF field with no texture, gradient or shadow, and no magenta or pink anywhere in the object itself — I will key this colour out. Neutral overhead lighting with a soft contact shadow directly beneath the object only, never a long directional shadow. The asset must still read clearly at 10% size against a dark floor. Palette anchors: floor #303b46, wall #46545f, brick #845345, wood #80623a, metal #788792, foliage #3b5238, accent #e8b53a.

Seen from directly above: a civilian pickup truck with a cab and an open cargo bed, nose pointing RIGHT, every window blown out: windscreen, rear window and all side glass are dark empty openings with pale glass fragments scattered across the roof and on the ground around the car. A light scatter of bullet holes in the roof and doors with bright bare-metal rims. Bodywork, tyres and paint otherwise intact. NOT burning, NOT scorched, sitting normally on its tyres.

The engine bay at the RIGHT end must read as visibly denser, darker and heavier than the doors and roof — it is the only part of this car that stops a bullet, and the player needs to be able to see that.

Footprint: 2 tiles wide by 1 tiles deep, where one tile is 32 world pixels and a human body is 20 world pixels across.
```

**SHOT UP — the car has been used as cover and hammered** — save as `pickup_shot_up.png`, generate at 1536x1024

```
Strict 90-degree top-down orthographic game asset, camera pointing straight down at the ground — NOT isometric, NOT angled, no perspective, no horizon, no vanishing point, no visible side faces of the object. Grounded semi-realistic military-sim style: muted desaturated palette, painterly but clean-edged, no black outline, no cartoon or cel shading, no text, no labels, no watermark.

One single object, centered, filling most of the frame, isolated on a FLAT SOLID MAGENTA #FF00FF field with no texture, gradient or shadow, and no magenta or pink anywhere in the object itself — I will key this colour out. Neutral overhead lighting with a soft contact shadow directly beneath the object only, never a long directional shadow. The asset must still read clearly at 10% size against a dark floor. Palette anchors: floor #303b46, wall #46545f, brick #845345, wood #80623a, metal #788792, foliage #3b5238, accent #e8b53a.

Seen from directly above: a civilian pickup truck with a cab and an open cargo bed, nose pointing RIGHT, all glass gone, and now heavily damaged: dense clusters of bullet holes punched through the doors, hood and roof with bright torn bare-metal rims, panels dented and buckled, one door hanging open. ALL FOUR TYRES ARE FLAT — the car has visibly settled down onto its wheel rims, the tyre rubber slumped and spread around each rim. The hood is sprung part-open showing a dark, heavy, battered engine block underneath. Thin wisps of white steam escaping the engine bay. NOT on fire yet.

The engine bay at the RIGHT end must read as visibly denser, darker and heavier than the doors and roof — it is the only part of this car that stops a bullet, and the player needs to be able to see that.

Footprint: 2 tiles wide by 1 tiles deep, where one tile is 32 world pixels and a human body is 20 world pixels across.
```

**BURNING — but with NO flames drawn** — save as `pickup_burning.png`, generate at 1536x1024

```
Strict 90-degree top-down orthographic game asset, camera pointing straight down at the ground — NOT isometric, NOT angled, no perspective, no horizon, no vanishing point, no visible side faces of the object. Grounded semi-realistic military-sim style: muted desaturated palette, painterly but clean-edged, no black outline, no cartoon or cel shading, no text, no labels, no watermark.

One single object, centered, filling most of the frame, isolated on a FLAT SOLID MAGENTA #FF00FF field with no texture, gradient or shadow, and no magenta or pink anywhere in the object itself — I will key this colour out. Neutral overhead lighting with a soft contact shadow directly beneath the object only, never a long directional shadow. The asset must still read clearly at 10% size against a dark floor. Palette anchors: floor #303b46, wall #46545f, brick #845345, wood #80623a, metal #788792, foliage #3b5238, accent #e8b53a.

Seen from directly above: a civilian pickup truck with a cab and an open cargo bed, nose pointing RIGHT, the same car after it has caught: paint blistered and blackening from the engine bay backward, all glass gone, all four tyres flat and starting to melt, hood sprung open over a scorched engine block. Render the SCORCHED BODY ONLY with no flames and no fire whatsoever — the engine composites flames on top from a separate looping fire sheet, and drawn flames here would double up.

The engine bay at the RIGHT end must read as visibly denser, darker and heavier than the doors and roof — it is the only part of this car that stops a bullet, and the player needs to be able to see that.

Footprint: 2 tiles wide by 1 tiles deep, where one tile is 32 world pixels and a human body is 20 world pixels across.
```

## `panel_van` — damage ladder (one session, three images)

**GLASS OUT — the first thing that happens to a car in a firefight** — save as `panel_van_glass_out.png`, generate at 1536x1024

```
Strict 90-degree top-down orthographic game asset, camera pointing straight down at the ground — NOT isometric, NOT angled, no perspective, no horizon, no vanishing point, no visible side faces of the object. Grounded semi-realistic military-sim style: muted desaturated palette, painterly but clean-edged, no black outline, no cartoon or cel shading, no text, no labels, no watermark.

One single object, centered, filling most of the frame, isolated on a FLAT SOLID MAGENTA #FF00FF field with no texture, gradient or shadow, and no magenta or pink anywhere in the object itself — I will key this colour out. Neutral overhead lighting with a soft contact shadow directly beneath the object only, never a long directional shadow. The asset must still read clearly at 10% size against a dark floor. Palette anchors: floor #303b46, wall #46545f, brick #845345, wood #80623a, metal #788792, foliage #3b5238, accent #e8b53a.

Seen from directly above: a white panel van with one long unbroken cargo roof, nose pointing RIGHT, every window blown out: windscreen, rear window and all side glass are dark empty openings with pale glass fragments scattered across the roof and on the ground around the car. A light scatter of bullet holes in the roof and doors with bright bare-metal rims. Bodywork, tyres and paint otherwise intact. NOT burning, NOT scorched, sitting normally on its tyres.

The engine bay at the RIGHT end must read as visibly denser, darker and heavier than the doors and roof — it is the only part of this car that stops a bullet, and the player needs to be able to see that.

Footprint: 2 tiles wide by 1 tiles deep, where one tile is 32 world pixels and a human body is 20 world pixels across.
```

**SHOT UP — the car has been used as cover and hammered** — save as `panel_van_shot_up.png`, generate at 1536x1024

```
Strict 90-degree top-down orthographic game asset, camera pointing straight down at the ground — NOT isometric, NOT angled, no perspective, no horizon, no vanishing point, no visible side faces of the object. Grounded semi-realistic military-sim style: muted desaturated palette, painterly but clean-edged, no black outline, no cartoon or cel shading, no text, no labels, no watermark.

One single object, centered, filling most of the frame, isolated on a FLAT SOLID MAGENTA #FF00FF field with no texture, gradient or shadow, and no magenta or pink anywhere in the object itself — I will key this colour out. Neutral overhead lighting with a soft contact shadow directly beneath the object only, never a long directional shadow. The asset must still read clearly at 10% size against a dark floor. Palette anchors: floor #303b46, wall #46545f, brick #845345, wood #80623a, metal #788792, foliage #3b5238, accent #e8b53a.

Seen from directly above: a white panel van with one long unbroken cargo roof, nose pointing RIGHT, all glass gone, and now heavily damaged: dense clusters of bullet holes punched through the doors, hood and roof with bright torn bare-metal rims, panels dented and buckled, one door hanging open. ALL FOUR TYRES ARE FLAT — the car has visibly settled down onto its wheel rims, the tyre rubber slumped and spread around each rim. The hood is sprung part-open showing a dark, heavy, battered engine block underneath. Thin wisps of white steam escaping the engine bay. NOT on fire yet.

The engine bay at the RIGHT end must read as visibly denser, darker and heavier than the doors and roof — it is the only part of this car that stops a bullet, and the player needs to be able to see that.

Footprint: 2 tiles wide by 1 tiles deep, where one tile is 32 world pixels and a human body is 20 world pixels across.
```

**BURNING — but with NO flames drawn** — save as `panel_van_burning.png`, generate at 1536x1024

```
Strict 90-degree top-down orthographic game asset, camera pointing straight down at the ground — NOT isometric, NOT angled, no perspective, no horizon, no vanishing point, no visible side faces of the object. Grounded semi-realistic military-sim style: muted desaturated palette, painterly but clean-edged, no black outline, no cartoon or cel shading, no text, no labels, no watermark.

One single object, centered, filling most of the frame, isolated on a FLAT SOLID MAGENTA #FF00FF field with no texture, gradient or shadow, and no magenta or pink anywhere in the object itself — I will key this colour out. Neutral overhead lighting with a soft contact shadow directly beneath the object only, never a long directional shadow. The asset must still read clearly at 10% size against a dark floor. Palette anchors: floor #303b46, wall #46545f, brick #845345, wood #80623a, metal #788792, foliage #3b5238, accent #e8b53a.

Seen from directly above: a white panel van with one long unbroken cargo roof, nose pointing RIGHT, the same car after it has caught: paint blistered and blackening from the engine bay backward, all glass gone, all four tyres flat and starting to melt, hood sprung open over a scorched engine block. Render the SCORCHED BODY ONLY with no flames and no fire whatsoever — the engine composites flames on top from a separate looping fire sheet, and drawn flames here would double up.

The engine bay at the RIGHT end must read as visibly denser, darker and heavier than the doors and roof — it is the only part of this car that stops a bullet, and the player needs to be able to see that.

Footprint: 2 tiles wide by 1 tiles deep, where one tile is 32 world pixels and a human body is 20 world pixels across.
```

---

## Part 3 — generic damage overlays

Four small assets that stamp on top of ANY vehicle, so twelve cars do not need
twelve ladders. Keep them body-colour-neutral and free of any surface behind
them — they are transparent decals, not pictures of damaged panels.

### `bulletholes_light` &nbsp;·&nbsp; save as `bulletholes_light.png` &nbsp;·&nbsp; generate at 1024x1024

```
Strict 90-degree top-down orthographic game asset, camera pointing straight down at the ground — NOT isometric, NOT angled, no perspective, no horizon, no vanishing point, no visible side faces of the object. Grounded semi-realistic military-sim style: muted desaturated palette, painterly but clean-edged, no black outline, no cartoon or cel shading, no text, no labels, no watermark.

One single object, centered, filling most of the frame, isolated on a FLAT SOLID MAGENTA #FF00FF field with no texture, gradient or shadow, and no magenta or pink anywhere in the object itself — I will key this colour out. Neutral overhead lighting with a soft contact shadow directly beneath the object only, never a long directional shadow. The asset must still read clearly at 10% size against a dark floor. Palette anchors: floor #303b46, wall #46545f, brick #845345, wood #80623a, metal #788792, foliage #3b5238, accent #e8b53a.

An overlay decal seen from directly above: a loose scatter of about eight bullet holes punched through painted sheet metal, each a small dark puncture with a bright torn bare-metal rim and a faint dent ring. Spread irregularly with plenty of empty magenta between them. There must be NO background panel, NO car and NO surface behind the holes — only the holes themselves floating on the magenta field, because this is stamped as a transparent overlay onto vehicle panels.

Footprint: 1 tiles wide by 1 tiles deep, where one tile is 32 world pixels and a human body is 20 world pixels across.
```

### `bulletholes_heavy` &nbsp;·&nbsp; save as `bulletholes_heavy.png` &nbsp;·&nbsp; generate at 1024x1024

```
Strict 90-degree top-down orthographic game asset, camera pointing straight down at the ground — NOT isometric, NOT angled, no perspective, no horizon, no vanishing point, no visible side faces of the object. Grounded semi-realistic military-sim style: muted desaturated palette, painterly but clean-edged, no black outline, no cartoon or cel shading, no text, no labels, no watermark.

One single object, centered, filling most of the frame, isolated on a FLAT SOLID MAGENTA #FF00FF field with no texture, gradient or shadow, and no magenta or pink anywhere in the object itself — I will key this colour out. Neutral overhead lighting with a soft contact shadow directly beneath the object only, never a long directional shadow. The asset must still read clearly at 10% size against a dark floor. Palette anchors: floor #303b46, wall #46545f, brick #845345, wood #80623a, metal #788792, foliage #3b5238, accent #e8b53a.

An overlay decal seen from directly above: a dense cluster of about twenty-five bullet holes through painted sheet metal, tightly grouped as if from a burst, each a dark puncture with a bright torn bare-metal rim, some overlapping into ragged tears, with buckling and dishing of the metal around the densest part. NO background panel, NO car and NO surface behind them — only the holes on the magenta field.

Footprint: 1 tiles wide by 1 tiles deep, where one tile is 32 world pixels and a human body is 20 world pixels across.
```

### `tyre_flat` &nbsp;·&nbsp; save as `tyre_flat.png` &nbsp;·&nbsp; generate at 1024x1024

```
Strict 90-degree top-down orthographic game asset, camera pointing straight down at the ground — NOT isometric, NOT angled, no perspective, no horizon, no vanishing point, no visible side faces of the object. Grounded semi-realistic military-sim style: muted desaturated palette, painterly but clean-edged, no black outline, no cartoon or cel shading, no text, no labels, no watermark.

One single object, centered, filling most of the frame, isolated on a FLAT SOLID MAGENTA #FF00FF field with no texture, gradient or shadow, and no magenta or pink anywhere in the object itself — I will key this colour out. Neutral overhead lighting with a soft contact shadow directly beneath the object only, never a long directional shadow. The asset must still read clearly at 10% size against a dark floor. Palette anchors: floor #303b46, wall #46545f, brick #845345, wood #80623a, metal #788792, foliage #3b5238, accent #e8b53a.

A single blown-out car tyre seen from directly above, isolated: the rubber shredded and slumped outward around a bare steel wheel rim that has settled onto the ground, with a few strips of torn tread lying beside it.

Footprint: 0.4 tiles wide by 0.4 tiles deep, where one tile is 32 world pixels and a human body is 20 world pixels across.
```

### `glass_scatter` &nbsp;·&nbsp; save as `glass_scatter.png` &nbsp;·&nbsp; generate at 1024x1024

```
Strict 90-degree top-down orthographic game asset, camera pointing straight down at the ground — NOT isometric, NOT angled, no perspective, no horizon, no vanishing point, no visible side faces of the object. Grounded semi-realistic military-sim style: muted desaturated palette, painterly but clean-edged, no black outline, no cartoon or cel shading, no text, no labels, no watermark.

One single object, centered, filling most of the frame, isolated on a FLAT SOLID MAGENTA #FF00FF field with no texture, gradient or shadow, and no magenta or pink anywhere in the object itself — I will key this colour out. Neutral overhead lighting with a soft contact shadow directly beneath the object only, never a long directional shadow. The asset must still read clearly at 10% size against a dark floor. Palette anchors: floor #303b46, wall #46545f, brick #845345, wood #80623a, metal #788792, foliage #3b5238, accent #e8b53a.

An overlay decal seen from directly above: a spray of shattered safety-glass fragments lying on the ground, small pale blue-white cubes and chips catching the light, densest at one edge and thinning outward. NO ground surface and NO background behind them — only the fragments on the magenta field.

Footprint: 1.5 tiles wide by 1.5 tiles deep, where one tile is 32 world pixels and a human body is 20 world pixels across.
```

---

## Tally

| Part | Assets |
|---|---:|
| 1 intact vehicles | 12 |
| 2 damage ladder (3 cars x 3 states) | 9 |
| 3 generic overlays | 4 |
| **Total** | **25** |

## CHANGELOG
- v1.0 (2026-08-15): Split out of ART_PROMPTS_ALL_BATCHES and ART_PROMPTS_ANIMATION so the whole cars thread lives in one file. Built around the finding that a car is two materials in the engine (`@` engine block resist 999 versus `%` sheet metal resist 11), so every prompt now requires the engine end to read as the heavy end.
