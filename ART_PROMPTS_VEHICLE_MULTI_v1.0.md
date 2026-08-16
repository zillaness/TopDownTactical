---
file: ART_PROMPTS_VEHICLE_MULTI_v1.0.md (top-down-tactical)
version: 1.0
author: Sam Cao
created: 2026-08-16
last_updated: 2026-08-16
description: One all-round shot-up frame per vehicle body — the picture a car needs once it has been hit from more than one direction. Ten images, edit-from-master, self-contained.
ai_update: Update last_updated and bump version in frontmatter. Rename file to match. Append changelog at bottom. Strike bodies through as they are generated and integrated.
---

# All-round shot-up — one frame per body

**10 images: one per vehicle body.** Filenames are `<body>_multi.png`.

## Why this exists, and why it is only ten images

Directional damage draws the face the fire came from. That works beautifully
until a car is hit from a *second* direction — and then no single bearing is the
truth any more. Drawing the newest side means the first side's holes vanish;
drawing the first means the newest ones never appear.

A full directional ladder solves it at four bearings × four stages = **sixteen
images per body**, and only the grey sedan has one. This slot solves the same
problem at **one image per body**: a car holed from everywhere, no side
favoured, used the moment two faces have been marked.

The engine already looks for it. `<body>__multi` is live and empty; the moment
a file lands the car starts using it.

## Which bodies

All ten. The first four already have full four-rung ladders and still want this,
because the rungs are about how far gone a car is and this is about *where from*:

```
sedan_grey   panel_van   pickup   sedan_red
hatchback    suv         taxi     box_truck
humvee       police_cruiser
```

## Start from the master

Edit the intact frame, exactly as the damage ladders do — never re-describe the
vehicle, or the identity drifts:

```
assets/incoming/cars/new-bodies-v1/<body>/<body>_00_intact.png
```

The first four bodies do not have a file there; use their intact renders from
`assets/incoming/main/` (`sedan_grey.png`, `panel_van.png`, `pickup.png`,
`sedan_red.png`).

## Save as

```
assets/incoming/cars/multi-v1/<body>/<body>_multi.png
```

## The prompt

Same background, silhouette and camera rules as every other vehicle thread:
real alpha (magenta as the named fallback, never a drawn checkerboard), same
position and scale and rotation as the master, nose stays right, strict
90-degree top-down, no downscaling.

> Edit this image: the vehicle has been shot from every direction at once. Punch
> bullet holes through the bonnet-adjacent wings, both flanks, the roof, the
> boot and the doors — clustered, irregular, and roughly **even all the way
> round**, with no side obviously worse than another. Every window is out,
> replaced by the dark interior visible through an empty frame, with jagged
> residual glass in the frames and pale fragments scattered on the roof and
> ground. Deflate at least two tyres onto their rims, on opposite corners. Dent
> and buckle the panels around the heaviest clusters, spring one or two panels
> at their seams, and dull and scratch the paint all over. **The bonnet and the
> engine end take scratches, dents and scorching but NO holes** — the block
> behind it is solid and must keep reading as the heavy end no matter how many
> directions the fire came from. Keep the exact same position, scale, rotation
> and crop. Transparent background.

## Per-body notes

Only where the body changes the answer.

**`humvee`** — up-armoured, and in the engine literally nothing in the
ammunition table crosses it. It should read as *pockmarked and gouged from every
angle but not perforated*: craters, spalling and paint stripped to bare metal,
with real holes only on the softest panels. A Humvee that looks like a colander
tells the player a lie about what it will do for them.

**`police_cruiser`** — IIIA doors, so the same rule at lower intensity: the door
panels take craters and spalling rather than clean punctures, while the wings,
roof and glass are freely holed. Keep the livery and light bar readable; a shot-
up cruiser is still obviously a cruiser.

**`box_truck`** — the cargo box is thin sheet over an empty volume and should
tear in long ragged rips right through, while the cab holds up better. The
contrast is the whole reason to have the body.

**`taxi`** — keep the yellow readable through the damage, and dent the roof sign
rather than removing it.

## Checklist

- [ ] Damage is even all the way round — no side obviously worst
- [ ] Bonnet has no holes punched through it
- [ ] Vehicle has not moved, scaled or rotated; nose still right
- [ ] Real transparency, or flat magenta — never a checkerboard
- [ ] Full size, filename exactly `<body>_multi.png`

## CHANGELOG
- v1.0 (2026-08-16): Written after directional damage shipped and a car hit from a second side visibly healed the first. Ten images against the one hundred and sixty a full directional ladder for every body would cost.
