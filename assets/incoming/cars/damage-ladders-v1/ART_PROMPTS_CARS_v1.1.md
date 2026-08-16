---
file: ART_PROMPTS_CARS_v1.1.md (top-down-tactical)
version: 1.1
author: Sam Cao
created: 2026-08-15
last_updated: 2026-08-15
description: Sequential, identity-locked damage ladders for the six intended vehicle targets. Each vehicle is completed one stage at a time so it reads as the same car being progressively destroyed.
ai_update: Update last_updated and bump version in frontmatter. Rename file to match. Append changelog at bottom. Strike assets through as they are generated and integrated.
---

# CARS — sequential damage ladders

This document covers the original six vehicle targets only:

1. grey-blue sedan
2. faded-red sedan
3. pickup truck
4. panel van
5. burned-out wreck
6. overturned car

These are **six target roles, not six unrelated one-shot generations**. The
grey-blue sedan, faded-red sedan, pickup and panel van are the four vehicle
identities. Each identity is generated as a progressive damage ladder. The
burned-out wreck and overturned car are terminal branches of the grey-blue
sedan, not unrelated generic cars.

The central requirement is continuity: every stage must look like the exact
same vehicle from the previous stage, only more damaged.

---

## Why the ladder matters

In the engine a car is authored as adjacent tiles of two materials:

| Area | Material | Resist | Gameplay meaning |
|---|---|---:|---|
| engine block | hard cover | **999** | Stops everything |
| doors, roof and body | sheet metal | **11** | Concealment; most damage carries through |

The engine bay must therefore read as visibly denser, darker and heavier than
the doors and roof at every damage stage. Every vehicle points **nose-right**,
so the hard-cover engine end is always the right end of the source image.

Damage must accumulate monotonically:

`intact → glass out → shot up → scorched wreck`

Nothing repairs itself between stages. Broken glass stays broken, bullet holes
stay present, flat tyres stay flat, and buckled panels stay buckled.

The grey-blue sedan also has an alternate terminal branch:

`sedan_grey_shot_up → car_overturned`

---

## Mandatory generation workflow

### Work on one complete vehicle at a time

Do **not** generate vehicles or damage stages in parallel.

Complete the ladders in this order:

1. grey-blue sedan, including wreck and overturned branches
2. faded-red sedan
3. pickup truck
4. panel van

Do not start the next identity until every stage of the current identity has
been generated, checked and accepted.

### The intact image establishes identity

Generate the intact stage from text. Once accepted, it becomes the permanent
identity reference for that ladder. Lock these invariants:

- exact body shape, wheelbase and proportions
- paint colour, wear pattern and trim
- wheel design and tyre size
- mirrors, lights, windows, roof seams and panel lines
- camera angle, nose-right orientation and canvas placement
- object scale, lighting direction and rendering style
- transparent background and alpha silhouette

### Every later stage is an edit, not a fresh generation

For each new damage stage:

1. Use the immediately preceding stage as the **edit target**.
2. Keep the intact stage available as the **identity reference**.
3. Add only the newly requested damage.
4. Preserve all earlier damage and every locked invariant.
5. Reject any result that changes the model, paint, dimensions, wheelbase,
   camera, orientation or placement.

Never paste a later-stage prompt into a blank generation. Text alone will
produce a similar vehicle, not the same vehicle.

### Review gate after every image

Before continuing, compare the new stage against both the intact reference and
the previous stage. Confirm:

- it is unmistakably the same vehicle
- the camera is still exactly 90-degree top-down
- the nose still points right
- old damage remains and only new damage was added
- the engine bay still reads as the heavy hard-cover end
- there is no background, text, watermark or long shadow

If any check fails, correct that stage before moving forward. Do not continue a
ladder from a drifted image.

---

## Shared visual contract

Use this block for every intact generation and repeat its invariants in every
edit request:

```text
Create one transparent raster vehicle sprite for a top-down tactical game.

STRICT 90-degree top-down orthographic view, camera pointing straight down at
the ground. NOT isometric, NOT angled, no perspective, no horizon, no vanishing
point, and no visible vertical side faces. Center one vehicle on the canvas with
its longitudinal axis horizontal and its nose pointing RIGHT.

Grounded semi-realistic military-sim style: muted desaturated palette,
painterly but clean-edged, no black outline, no cartoon or cel shading. Neutral
directly overhead lighting with only a tight soft contact shadow beneath the
vehicle; no long directional shadow.

Use a genuinely transparent background with clean alpha edges: no floor plane,
no scenery, no border, no checkerboard and no painted background. No people,
text, labels, logos or watermark.

The engine bay at the RIGHT end must read as visibly denser, darker and heavier
than the doors and roof. It is the only part of the vehicle that stops a bullet,
and the player must be able to identify it visually.

Keep the asset readable at 10% size against a dark floor. Palette anchors:
floor #303b46, wall #46545f, brick #845345, wood #80623a, metal #788792,
foliage #3b5238, accent #e8b53a.
```

Generate at full model resolution. Do not downscale or quantise during the
generation pass.

---

## Ladder 1 — grey-blue sedan

Finish this entire ladder before beginning the red sedan.

### Stage 1: intact

Save as `sedan_grey.png`.

```text
[Apply the shared visual contract.]

Generate the identity reference: a contemporary civilian four-door sedan with
muted grey-blue paint and light ordinary weathering. The roof, hood, windshield,
rear window and trunk must be clearly readable from directly above. All glass,
bodywork, tyres and lights are intact. The vehicle sits normally on its tyres.

This image establishes the permanent body shape, paint, trim, wheel design,
proportions, scale and placement for every grey-sedan damage stage.
```

### Stage 2: glass out

Edit `sedan_grey.png`. Save as `sedan_grey_glass_out.png`.

```text
Edit the supplied grey-blue sedan; do not generate a replacement vehicle.
Preserve its exact body shape, grey-blue paint, trim, wheels, wheelbase,
proportions, camera, scale, placement, lighting and transparent background.

Change only the damage: blow out the windshield, rear window and side glass.
Make the openings dark and empty, with a restrained scatter of pale safety-glass
fragments. Add a few light bullet strikes to the doors and roof. Keep the body,
paint and all four tyres otherwise intact. Not scorched, not burning.
```

### Stage 3: shot up

Edit `sedan_grey_glass_out.png`, using `sedan_grey.png` as the identity
reference. Save as `sedan_grey_shot_up.png`.

```text
This must remain the exact same grey-blue sedan. Preserve every identity detail
and all existing glass damage.

Add the next damage only: dense bullet-hole clusters through the doors, roof
and hood; dented and buckled sheet metal; one door hanging partly open; all four
tyres flat with the body settled onto the rims; hood sprung partly open over a
dark battered engine block; a very thin wisp of pale steam. Not on fire and not
yet fully scorched.
```

### Stage 4A: burned-out wreck

Edit `sedan_grey_shot_up.png`, using `sedan_grey.png` as the identity reference.
Save as `car_wreck.png`.

```text
Advance the exact same grey-blue sedan to its terminal burned-out state.
Preserve its wheelbase, body silhouette, doors, trim positions, panel geometry,
camera, scale, placement and all accumulated damage.

Add severe fire damage: blistered and burned-away grey-blue paint, blackening
spreading from the engine bay backward, all glass absent, tyres collapsed and
partly melted, roof and panels heat-warped, engine bay open and deeply scorched.
Keep enough surviving grey-blue paint and matching body details to prove this is
the same sedan. Render the scorched body only—NO flames, fire or smoke, because
the engine composites those effects separately.
```

### Stage 4B: overturned alternate branch

Return to `sedan_grey_shot_up.png`; do not derive this branch from the burned
wreck. Use `sedan_grey.png` as the identity reference. Save as
`car_overturned.png`.

```text
Turn the exact same shot-up grey-blue sedan onto its roof as an alternate
terminal state. Show the undercarriage from directly above: matching wheelbase
and wheels, axles, suspension, exhaust line, fuel tank and engine underside.
Retain recognizable grey-blue paint on the exposed body edges, the same lights,
bumpers and proportions, and the existing flat-tyre and impact damage.

Keep the vehicle horizontal with its nose pointing RIGHT. Do not redesign the
car, change its scale or introduce fire.
```

---

## Ladder 2 — faded-red sedan

Finish this ladder before beginning the pickup.

### Stage 1: intact

Save as `sedan_red.png`.

```text
[Apply the shared visual contract.]

Generate the identity reference: an older civilian four-door sedan with a
distinctly boxier body than the grey sedan, faded red paint, restrained rust
speckling and period-appropriate rectangular proportions. All glass, bodywork,
tyres and lights are intact. The vehicle sits normally on its tyres.

This image establishes the permanent identity for the red-sedan ladder.
```

### Stages 2–4

Follow the grey-sedan edit workflow exactly, substituting the faded-red sedan as
both edit target and identity reference:

| Stage | Edit target | Save as | Add only |
|---|---|---|---|
| glass out | `sedan_red.png` | `sedan_red_glass_out.png` | blown glass and light bullet strikes |
| shot up | `sedan_red_glass_out.png` | `sedan_red_shot_up.png` | heavy bullet damage, buckled panels, flat tyres, sprung hood and steam |
| scorched wreck | `sedan_red_shot_up.png` | `sedan_red_wreck.png` | progressive burn damage with no flames or smoke |

At every stage preserve the exact boxy body, faded-red paint, rust pattern,
trim, wheels, scale and placement. Retain enough red paint in the terminal state
to keep the identity unmistakable.

---

## Ladder 3 — pickup truck

Finish this ladder before beginning the panel van.

### Stage 1: intact

Save as `pickup.png`.

```text
[Apply the shared visual contract.]

Generate the identity reference: a civilian pickup truck with muted weathered
steel-grey paint, a clearly separated cab roof and open cargo bed, visible
ribbed bed floor and tailgate. All glass, bodywork, tyres and lights are intact.
The vehicle sits normally on its tyres.

This image establishes the permanent pickup identity. The open bed geometry,
cab-to-bed spacing, wheelbase and paint wear must never change later.
```

### Stages 2–4

| Stage | Edit target | Save as | Add only |
|---|---|---|---|
| glass out | `pickup.png` | `pickup_glass_out.png` | blown cab glass and light bullet strikes |
| shot up | `pickup_glass_out.png` | `pickup_shot_up.png` | heavy bullet damage, dented cab and bed, flat tyres, sprung hood and steam |
| scorched wreck | `pickup_shot_up.png` | `pickup_wreck.png` | progressive burn damage with no flames or smoke |

Use `pickup.png` as the identity reference at every edit. Preserve the exact cab,
open bed, bed ribs, tailgate, wheelbase, wheels, steel-grey paint, scale and
placement. Damage may deform the panels but may not redesign the truck.

---

## Ladder 4 — panel van

Complete this ladder last.

### Stage 1: intact

Save as `panel_van.png`.

```text
[Apply the shared visual contract.]

Generate the identity reference: a dull-white civilian panel van with one long,
flat, unbroken cargo roof, cab glazing only, and no windows behind the cab. All
glass, bodywork, tyres and lights are intact. The vehicle sits normally on its
tyres.

This image establishes the permanent van identity. The cargo-roof seams,
cab-to-body transition, wheelbase and white paint wear must never change later.
```

### Stages 2–4

| Stage | Edit target | Save as | Add only |
|---|---|---|---|
| glass out | `panel_van.png` | `panel_van_glass_out.png` | blown cab glass and light bullet strikes |
| shot up | `panel_van_glass_out.png` | `panel_van_shot_up.png` | heavy bullet damage, buckled panels, flat tyres, sprung hood and steam |
| scorched wreck | `panel_van_shot_up.png` | `panel_van_wreck.png` | progressive burn damage with no flames or smoke |

Use `panel_van.png` as the identity reference at every edit. Preserve the exact
cargo roof, panel seams, cab geometry, wheelbase, wheels, dull-white paint,
scale and placement. Damage may distort panels but may not introduce cargo-side
windows or turn the van into a different model.

---

## Output tally

| Identity | Intact | Glass out | Shot up | Wreck | Alternate | Total |
|---|---:|---:|---:|---:|---:|---:|
| grey-blue sedan | 1 | 1 | 1 | 1 | 1 overturned | 5 |
| faded-red sedan | 1 | 1 | 1 | 1 | — | 4 |
| pickup truck | 1 | 1 | 1 | 1 | — | 4 |
| panel van | 1 | 1 | 1 | 1 | — | 4 |
| **Total** | **4** | **4** | **4** | **4** | **1** | **17** |

The scope is still the original six vehicle targets. The additional files are
the sequential damage states required to make those targets read as the same
vehicles being slowly destroyed.

---

## Rejection criteria

Reject and redo the current stage if any of these occur:

- the vehicle model, paint, trim, wheels or proportions change
- a later stage repairs or loses earlier damage
- the camera drifts away from strict top-down
- the vehicle flips direction or the nose no longer points right
- canvas placement or scale jumps between stages
- a side face, horizon, ground plane or long shadow appears
- the engine bay becomes visually lighter than the sheet-metal body
- flames or smoke are baked into a terminal wreck
- transparency is replaced by white, checkerboard or another painted background

Do not advance from a rejected stage. Fix it, compare again, then continue.

---

## CHANGELOG

- v1.1 (2026-08-15): Reduced the expanded 25-asset program back to the original six vehicle targets. Reframed the document around four identity-locked progressive damage ladders. Prohibited all parallel generation, required each later state to edit the previous accepted state while retaining the intact image as an identity reference, made the burned-out wreck and overturned car terminal branches of the grey-blue sedan, removed the six extra intact vehicle types and generic overlay program, and switched the prompt contract to native transparent output.
- v1.0 (2026-08-15): Split out of ART_PROMPTS_ALL_BATCHES and ART_PROMPTS_ANIMATION so the whole cars thread lives in one file. Built around the finding that a car is two materials in the engine (`@` engine block resist 999 versus `%` sheet metal resist 11), so every prompt requires the engine end to read as the heavy end.
