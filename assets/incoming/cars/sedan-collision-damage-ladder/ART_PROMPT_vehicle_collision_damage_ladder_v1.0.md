---
file: ART_PROMPT_vehicle_collision_damage_ladder_v1.0.md
version: 1.0
created: 2026-08-15
description: Ready-to-paste workflow for generating matched top-down frontal-collision-and-fire vehicle damage ladders one car at a time.
---

# Vehicle collision damage ladder — Top-Down Tactical

## Purpose

Generate a cumulative **frontal collision followed by fire** damage ladder in which every image is unmistakably the same vehicle being progressively destroyed. This is collision damage, not gunfire damage. Complete one vehicle's entire ladder before starting another vehicle. Do not generate multiple stages independently, in parallel, as a grid, or as a sprite sheet.

## Non-negotiable sequential workflow

1. Generate Stage 0 as the canonical intact vehicle.
2. Inspect and approve Stage 0 before continuing.
3. Generate Stage 1 by editing only Stage 0.
4. Generate Stage 2 by editing only the approved Stage 1 image.
5. Generate Stage 3 by editing only the approved Stage 2 image.
6. Generate Stage 4 by editing only the approved Stage 3 image.
7. Finish, export, and verify the entire ladder before starting a different vehicle.

Every edit must retain all earlier damage. Never repair or replace damaged parts between stages.

## Master style and camera block

> Strict true top-down orthographic view, camera pointing straight down at exactly 90 degrees, like a satellite photo or floor plan. NOT isometric, NOT angled, NOT three-quarter view, no horizon, no perspective, no vanishing point. One vehicle only, centered on a fixed landscape canvas, with the nose pointing RIGHT (+X). Grounded semi-realistic military-sim game art: muted desaturated palette, painterly but clean-edged, no black outlines, no cartoon or cel shading, no text, no watermark, no labels. Neutral light directly overhead with only a compact contact shadow directly beneath the vehicle. The background must be genuinely transparent.

## Identity-lock block for every edit

> Image 1 is the immediately preceding approved damage stage and the sole edit target. Keep the exact same vehicle identity, body design, proportions, paint, roof, hood, trunk, doors, windows, wheels, mirrors, panel seams, camera, orientation, canvas dimensions, scale, centering, rotation, lighting, and transparent padding. Change only the requested new damage. Retain every earlier dent, scrape, crack, broken part, deformation, and burn mark. Do not redesign, replace, recolor, rotate, rescale, crop, move, or independently regenerate the vehicle.

## Five-stage ladder

| Stage | State | Damage progression |
|---:|---|---|
| 0 | Intact | Slight normal weathering only; fully drivable. |
| 1 | Light | Paint scrapes, one shallow dent, slightly bent bumper corner, small glass crack. |
| 2 | Moderate | Deeper crumple in the same impact zone, partly detached bumper, broken lamp, larger glass crack; barely drivable. |
| 3 | Severe | Crushed and torn front structure, exposed engine bay, bent wheel, extensive glass damage, localized scorching; no active fire. |
| 4 | Burned wreck | Preserve Stage 3 geometry; charred shell, blistered paint, burned interior, missing glass, rusted edges; fire is out. |

## Ready-to-paste prompts

### Stage 0 — canonical intact sedan

```text
Use case: stylized-concept
Asset type: top-down tactical game vehicle sprite; grey-blue civilian sedan damage ladder, Stage 0 (INTACT BASE)
Primary request: Generate exactly one unbranded civilian four-door sedan in intact drivable condition. This image establishes the canonical car identity for all later damage stages.
Scene/backdrop: genuinely transparent background with a real alpha channel; no checkerboard, solid color, road, or scenery.
Subject: muted grey-blue older civilian sedan, slightly weathered but undamaged; roof, windshield, rear window, hood, trunk, four wheels, mirrors, and panel seams clearly readable from above.
Style/medium: grounded semi-realistic military-sim game art; painterly but clean-edged; muted desaturated palette; no black outlines; readable when downscaled.
Composition/framing: STRICT TRUE TOP-DOWN ORTHOGRAPHIC view, camera pointing straight down at exactly 90 degrees. The car's nose points RIGHT (+X). Center the complete car on a fixed landscape canvas with even transparent padding. Vehicle footprint is exactly twice as long as it is wide. No cropping.
Lighting/mood: neutral light directly overhead; only a compact soft contact shadow directly beneath the vehicle; no directional shadow.
Constraints: one car only; no visible front, rear, or side vertical faces; no perspective foreshortening; no isometric or three-quarter angle; no ground plane; no text, logos, labels, people, debris, smoke, fire, or watermark. Output a transparent PNG suitable as the canonical edit target.
```

### Stage 1 — light cosmetic damage

```text
Use case: precise-object-edit
Input images: Image 1 is the approved Stage 0 vehicle and the sole edit target.
Primary request: Add only light early collision damage, concentrated at the front-right/nose area: a few paint scrapes, one shallow dent in the hood edge, a slightly bent front bumper corner, and one small windshield crack. The car must still look fully drivable.
Constraints: apply the master camera block and identity-lock block. Change only the listed light damage. Preserve genuine transparent alpha. No debris, smoke, fire, scenery, text, logos, people, or watermark.
```

### Stage 2 — moderate collision damage

```text
Use case: precise-object-edit
Input images: Image 1 is the approved Stage 1 vehicle and the sole edit target.
Primary request: Preserve every existing Stage 1 scrape, dent, and crack, then deepen the same front-right/nose collision: crumple the front-right hood edge farther inward, bend and partly detach that bumper corner, break the right headlight lens, add sharper metal creases around the same impact zone, and enlarge the existing windshield crack. The car should look damaged and barely drivable, not destroyed.
Constraints: apply the master camera block and identity-lock block. Cumulative edit only; do not remove or repair earlier damage. Preserve genuine transparent alpha. No detached debris outside the silhouette, smoke, fire, scenery, text, logos, people, or watermark.
```

### Stage 3 — severe structural and fire damage

```text
Use case: precise-object-edit
Input images: Image 1 is the approved Stage 2 vehicle and the sole edit target.
Primary request: Preserve all existing Stage 2 damage, then progress the same collision into severe near-total damage: crush and tear the already crumpled hood farther back, leave most of the front bumper hanging or missing within the existing silhouette, expose a small portion of the dark engine bay, break both front lamps, spread the windshield cracking, bend the front-right wheel inward, and add localized black-brown scorching and blistered paint around the front impact and hood. The passenger compartment and rear half must remain recognizably the same car. No active flames.
Constraints: apply the master camera block and identity-lock block. Cumulative edit only; never undo or rearrange prior damage. Preserve genuine transparent alpha. No loose debris outside the silhouette, smoke plume, scenery, text, logos, people, or watermark.
```

### Stage 4 — burned-out wreck

```text
Use case: precise-object-edit
Input images: Image 1 is the approved Stage 3 vehicle and the sole edit target.
Primary request: Turn this exact severely damaged car into its final burned-out wreck while preserving all existing crushed geometry. The fire has ended: char the remaining paint into mottled black, charcoal, dark brown, and rust-edged metal; blister and peel the roof paint; leave the windows shattered or burned away as dark openings; blacken the passenger compartment; expose and char the already-open engine bay; melt the lamps and weather the panel edges. It must unmistakably be the same sedan after the next cumulative damage step, not a new wreck design.
Constraints: apply the master camera block and identity-lock block. Cumulative edit only; never undo, rearrange, or repair prior damage. Preserve genuine transparent alpha. Do not overturn it. No active flames, glowing embers, smoke plume, loose debris outside the silhouette, scenery, text, logos, people, or watermark.
```

## Reject and regenerate when

- Any stage becomes isometric, angled, or three-quarter view.
- The vehicle changes model, wheelbase, roofline, windows, wheels, paint, orientation, scale, or canvas position without damage requiring it.
- Earlier damage disappears or moves to a new location.
- A stage looks like a separately designed wreck instead of the preceding image with additional damage.
- The nose does not point right.
- The output includes a road, environment, text, logo, watermark, separate debris, long shadow, painted checkerboard, or opaque background.

## Transparency and engine delivery

- Prefer a real transparent PNG from the image model.
- If an edit returns a painted checkerboard, remove only the connected neutral backdrop into alpha; do not redraw the car merely to repair transparency.
- If direct alpha is unavailable, generate against flat solid magenta `#FF00FF`, with no magenta in the vehicle, then key the connected magenta background into transparency.
- Keep every master on the exact Stage 0 canvas.
- For a 2 × 1 tile sedan where one tile authors at 64 px, export each engine sprite at 128 × 64 px with alpha preserved.

## Starting the next vehicle

Only after all five states of the current car pass review, replace the Stage 0 subject description with the next vehicle. Then repeat the complete serial chain from that new Stage 0. Never interleave stages from different vehicles.

An overturned vehicle is a separate pose/state, not a normal step in this damage ladder, because overturning changes the vehicle's orientation and visible geometry.
