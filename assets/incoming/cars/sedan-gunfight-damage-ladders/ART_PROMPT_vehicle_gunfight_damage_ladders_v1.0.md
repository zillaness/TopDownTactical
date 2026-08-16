---
file: ART_PROMPT_vehicle_gunfight_damage_ladders_v1.0.md
version: 1.0
created: 2026-08-15
description: Ready-to-paste serial workflow for matched top-down directional gunfight damage ladders using one fixed sedan identity.
---

# Vehicle gunfight damage ladders — Top-Down Tactical

## Purpose

Generate four cumulative **small-arms gunfire damage ladders** showing one exact grey-blue sedan being progressively shot from different screen directions. This is ballistic damage, not a car crash. The car must never gain crumpled panels, collision dents, fire, or explosion damage.

Use the same approved pristine Stage 0 for every direction. Complete one direction's entire ladder before beginning the next. Do not generate stages independently, in parallel, as a grid, or as a sprite sheet.

## Non-negotiable serial workflow

1. Approve one canonical Stage 0 intact sedan.
2. Copy that exact Stage 0 as the base of the first direction.
3. Edit Stage 0 into Stage 1.
4. Edit the approved Stage 1 into Stage 2.
5. Edit the approved Stage 2 into Stage 3.
6. Edit the approved Stage 3 into Stage 4.
7. Verify the complete 0 → 1 → 2 → 3 → 4 chain.
8. Only then copy the same canonical Stage 0 and begin the next direction.

Every later rung retains the earlier impacts. Never repair, move, or replace previous marks. Outside the new impact areas, preserve the input image as fixed pixels.

## Camera, identity, and canvas lock

> Strict true top-down orthographic view, camera pointing straight down at exactly 90 degrees. NOT isometric, NOT angled, NOT three-quarter view, no horizon, no perspective, no vanishing point. One muted grey-blue unbranded four-door sedan only, with its nose pointing RIGHT (+X). Preserve the exact body, wheelbase, roofline, windows, lights, trim, wheels, mirrors, paint, weathering, lighting, contact shadow, scale, center, rotation, and transparent padding. Master canvas is exactly 1774 × 887 RGBA PNG. Background is genuine alpha transparency—no road, scenery, solid fill, or painted checkerboard.

## Ballistic-only damage language

- Painted metal: small chipped pits, compact dark punctures, and very short directional scuffs.
- Glass: restrained star cracks and, only at the final rung, a few compact punched-through holes while the glass remains in its frame.
- Direction: clusters start at the struck screen edge and advance inward; short chip/scuff tails follow the declared screen-space travel vector.
- Body geometry: panels remain straight, closed, aligned, and unchanged in silhouette.

Never add collision dents, crumpling, buckling, folded metal, bent bumpers, displaced panels, torn bodywork, detached parts, fire, smoke, scorch, explosion damage, blast holes, people, blood, weapons, projectiles, tracers, muzzle flashes, loose debris, text, logos, labels, or watermark.

## Four direction ladders

| ID | Incoming fire | Entry region | Travel cue |
|---|---|---|---|
| east_to_west | screen RIGHT → LEFT | nose, hood, windshield | short tails point left |
| west_to_east | screen LEFT → RIGHT | trunk, rear glass, rear roof | short tails point right |
| north_to_south | screen TOP → BOTTOM | upper-side glass and upper roof band | short tails point down |
| south_to_north | screen BOTTOM → TOP | lower-side glass and lower roof band | short tails point up |

These labels describe screen-space attack direction, not geographic compass bearings.

## Five rungs per direction

| Stage | State | Additive progression |
|---:|---|---|
| 0 | Intact | Canonical shared sedan; no combat damage. |
| 1 | Light | About three restrained entry-side impacts. |
| 2 | Sustained | Several additional pits and one or two local glass stars, still concentrated near the entry side. |
| 3 | Heavy | More cumulative penetrations advancing inward; localized overlapping glass cracks; no deformation. |
| 4 | Critical | A final concentrated burst, a few compact glass perforations, and dense entry-side ballistic damage; still no crash or fire. |

Counts are visual targets, not permission to redesign the vehicle. A gradual readable step is more important than an exact count.

## Ready-to-paste edit template

~~~text
Use case: precise-object-edit.
Input image: the immediately preceding approved rung and the sole edit target.

Create Stage [N] of the [DIRECTION ID] small-arms gunfire ladder.

Treat the input as fixed pixels. Preserve the exact sedan identity, true 90-degree top-down camera, nose-right orientation, 1774 × 887 canvas, pixel placement, scale, bounding box, silhouette, wheels, mirrors, paint, lighting, contact shadow, and genuine transparent alpha. Preserve every earlier impact exactly where it is. Add only the next compact ballistic marks described for this rung.

Incoming fire travels [SCREEN DIRECTION]. Begin at [ENTRY REGION] and advance inward. Use small chipped metal pits, restrained star cracks, and very short [TAIL DIRECTION]-pointing scuffs. Keep the opposite side substantially cleaner so the attack direction reads at sprite scale.

Body panels remain straight, closed, aligned, and unchanged in contour. No crash dents, crumpling, buckling, bent or displaced panels, torn or missing parts, fire, smoke, explosion, scorch, people, blood, weapons, bullets in flight, tracers, muzzle flashes, debris, road, scenery, text, logos, labels, watermark, checkerboard, or opaque background. Do not zoom, shift, rotate, crop, rescale, or restyle.

Output one isolated RGBA PNG on the same canvas.
~~~

For Stage 1, use the canonical Stage 0. For every later stage, use only the immediately preceding approved rung. Replace the bracketed direction fields from the direction table above.

## Reject and regenerate when

- The camera becomes angled, isometric, perspective, or three-quarter.
- The nose stops pointing right, or the car changes model, proportions, paint, placement, scale, or silhouette.
- Earlier impacts disappear, move, heal, or change direction.
- Damage appears on the wrong entry side or mixes conflicting travel directions.
- Any collision dent, crumpled hood/trunk, bent bumper, displaced panel, fire, scorch, smoke, explosion, or detached debris appears.
- The output contains people, weapons, blood, tracers, scenery, road, text, logo, watermark, opaque fill, or painted transparency.

## Transparency and engine delivery

- Prefer a real transparent PNG from the image model.
- If the model paints a neutral checkerboard, remove only the connected backdrop into alpha without redrawing the car.
- If direct alpha is unavailable, use flat solid magenta #FF00FF as a temporary key background, then remove only the connected magenta backdrop.
- Keep every master at 1774 × 887.
- Export each game sprite at 128 × 64 with alpha preserved; do not ask the image model to author at sprite resolution.
