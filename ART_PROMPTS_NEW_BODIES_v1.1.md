---
file: ART_PROMPTS_NEW_BODIES_v1.0.md (top-down-tactical)
version: 1.1
author: Sam Cao
created: 2026-08-16
last_updated: 2026-08-16
description: Damage ladders for the six vehicle bodies that shipped intact-only — hatchback, SUV, taxi, humvee, box truck, police cruiser. Edit-from-master workflow, three damage states each, matching the four bodies already in the build. Self-contained; this is the whole thread.
ai_update: Update last_updated and bump version in frontmatter. Rename file to match. Append changelog at bottom. Strike assets through as they are generated and integrated.
---

# Damage ladders — the six new bodies

Six vehicles are in the build with an intact frame and four directional frames
each, but no damage LADDER — so they show a pristine car at every rung until the
directional art takes over. This thread closes that gap.

**18 images: 6 bodies × 3 damage states.** The intact frame already exists and
is not regenerated.

## Why this is an EDIT thread, not a generation thread

The sedan ladders worked because every stage was an *edit of the previous
image*, not a fresh render of the same description. That is what keeps it the
same car — same panel gaps, same mirrors, same paint, same wheel positions —
so the four states read as one vehicle taking damage instead of four different
vehicles. A from-scratch prompt cannot do this; the model has no memory of what
it drew last time.

**Start from the supplied master. Never re-describe the vehicle.** The prompts
below say only what CHANGES. If a prompt tempts you to restate the car, delete
that sentence — restating it is how the identity drifts.

## Your starting images

Keyed, cropped and alpha-checked, one per body:

```
assets/incoming/cars/new-bodies-v1/hatchback/hatchback_00_intact.png
assets/incoming/cars/new-bodies-v1/suv/suv_00_intact.png
assets/incoming/cars/new-bodies-v1/taxi/taxi_00_intact.png
assets/incoming/cars/new-bodies-v1/humvee/humvee_00_intact.png
assets/incoming/cars/new-bodies-v1/box_truck/box_truck_00_intact.png
assets/incoming/cars/new-bodies-v1/police_cruiser/police_cruiser_00_intact.png
```

These are the magenta-keyed originals with the background already removed and
the alpha ceiling squared up. Feed the PNG in as the image to edit.

## Save as

Chain each stage off the one before it, and save into the body's folder:

```
new-bodies-v1/<body>/<body>_01_glass_out.png     <- edit of _00_intact
new-bodies-v1/<body>/<body>_02_shot_up.png       <- edit of _01_glass_out
new-bodies-v1/<body>/<body>_03_wreck.png         <- edit of _02_shot_up
```

Exact filenames. They map to the keys the engine looks up.

## The rules that do not change

1. **Transparent background.** A real alpha channel — never a drawn
   checkerboard, never a scene. If transparency is unavailable, fall back to a
   FLAT SOLID MAGENTA #FF00FF field. Either way keep magenta and pink out of
   the vehicle itself. *A drawn grey checkerboard is an opaque picture of
   transparency; reject it in the chat rather than uploading it.*
2. **Do not move the vehicle.** Same position, same scale, same rotation, same
   crop as the image you were given. The engine transplants the alpha mask
   across states and will reject a stage that has drifted.
3. **Do not change the silhouette.** Damage is paint, glass, holes and soot —
   not a new body shape. Torn metal may lift slightly; the outline stays.
4. **Strict 90-degree top-down.** No side faces, no perspective, no long
   directional shadow. Same flat overhead lighting as the master.
5. **Nose stays right.** Do not mirror or rotate.
6. **Do not downscale.** Upload whatever the model returns at full size.
7. **The engine end must stay the heavy end.** In this game a car is two
   materials — the engine block stops everything and the doors do not — so the
   bonnet must keep reading as the dense, solid end at every stage. **Never
   punch holes through the bonnet.** It gets soot and scratches; it never gets
   perforated.

---

## Stage 01 — GLASS OUT

> Edit this image: blow out every window on the vehicle. The windscreen, rear
> screen and all side glass are gone — replace each one with the dark interior
> that would be visible through an empty frame: seats, dashboard, headrests,
> steering wheel, floor, all in deep shadow. Leave a thin rim of jagged residual
> glass in each frame and a light scatter of small pale glass fragments on the
> roof, bonnet and the ground line immediately around the vehicle. The bodywork,
> paint, panels, wheels and mirrors are otherwise completely untouched — no
> dents, no bullet holes, no soot. Keep the exact same position, scale, rotation
> and crop. Transparent background.

**Why this rung is cosmetic:** in the engine this state changes nothing
mechanically. It exists so the first few rounds into a car visibly *do
something*. Make it read instantly at a glance and resist the urge to add
damage that belongs to stage 02.

## Stage 02 — SHOT UP

> Edit this image: the vehicle has now taken sustained small-arms fire. Punch
> irregular clusters of bullet holes through the doors, wings, roof and boot —
> each a small dark puncture with a bright torn bare-metal rim — densest across
> the doors and the flanks. Add dents and buckling around the heaviest clusters,
> deep scratches through the paint, and one or two panels sprung slightly at
> their seams. Deflate at least one tyre so it sits flat on its rim. Darken and
> dull the paint overall. **The bonnet and the engine end take scratches, dents
> and scorching but NO holes — the block behind it is solid and must keep
> reading as the heavy end.** Windows stay as they were in the previous image.
> Keep the exact same position, scale, rotation and crop. Transparent background.

## Stage 03 — BURNED WRECK

> Edit this image: the vehicle has burned out and is now a shell. Strip the paint
> to scorched bare metal and rust, blacken and blister the roof, bonnet and
> panels, and leave heavy soot plumes fanning back from the window openings and
> the engine bay. All tyres are burned away to bare rims sitting on the ground.
> The interior visible through the empty windows is a gutted black cavity with
> the seat frames just readable. Panels sag and warp; the bodywork sits lower.
> Colour is almost entirely charcoal, rust-brown and ash-grey — no original
> paint colour survives except perhaps a trace in one sheltered panel. **The
> engine end still reads as the densest, most solid part of the wreck.** Keep
> the exact same position, scale, rotation and crop. Transparent background.

---

## Per-body notes

Read the note for the body you are working on. Everything else is the stage
prompt above, unchanged.

### `hatchback`
Small and light. Damage should read as *disproportionate* — a hatchback takes
a magazine badly. At stage 03 let it sit visibly lower on its rims than the
larger bodies do.

### `suv`
Tall and heavy. Sustained fire should mark the long flanks and the big glasshouse
most. The bulk means stage 02 can carry more holes than the hatchback without
looking absurd.

### `taxi`
The livery is the identity — keep the yellow readable through stage 02 even as
it dulls and scorches, and let it survive only as a scorched trace at stage 03.
The roof sign is a distinctive silhouette detail: dent and crack it at stage 02,
leave it as a blackened stub at stage 03. **Do not remove it.**

### `humvee`
Military and armoured, so it must resist visibly harder than the civilian cars.
At stage 02 use *fewer, shallower* marks — pockmarks, spalling and gouges in the
armour rather than clean punctures, with real perforations only on the softest
panels. At stage 03 it is scorched and gutted but still structurally square: it
does not sag the way a unibody car does. This vehicle should look like the worst
thing on the map to shoot at, because in the engine it will be.

### `police_cruiser`
Livery and light bar are the identity. Keep the door markings readable through
stage 02 even as they scorch, and let the light bar survive as a cracked, dark
stub at stage 03 rather than disappearing — a burned-out cruiser is still
obviously a cruiser. **This body is IIIA-armoured in the engine**: its doors
stop 9mm and buckshot and only rifle gets through, so at stage 02 the door
panels should show pockmarks, craters and spalling rather than clean
punctures, with real perforation on the wings and roof instead.

### `box_truck`
Two materials in one silhouette: a cab and a large thin-walled cargo box. The
box is sheet aluminium over an empty volume — it should perforate *freely* and
tear in long ragged rips, while the cab area holds up better. At stage 03 the
box is a blackened skeleton with the frame ribs showing through burned-out
panels. This contrast is the whole point of the body; make it obvious.

---

## Phase 2 (optional) — directional ladders

Only start this once the 15 above are done and integrated.

The grey sedan carries a full **four-bearing** set — the same car shot from
four sides, four stages deep — and the engine already draws whichever face you
actually shot. Every other body falls back to a single directional frame. To
extend a body to the full set, repeat the sedan gunfight workflow: four
directions × four stages, cumulative edits, named for the direction of TRAVEL
with the damage on the face the fire came FROM.

**Budget note before you start:** the build is at 1.11MB of a ~1.5–2MB ceiling.
The 15 images above cost roughly 140KB. A full directional set for all five new
bodies would cost roughly 1.1MB and does not fit. One body might. Pick the one
players shoot at most — probably the box truck, since its two-material contrast
is the most legible — rather than doing them all.

---

## Checklist before uploading

- [ ] Vehicle has not moved, scaled or rotated between stages
- [ ] Silhouette unchanged
- [ ] Nose still right
- [ ] Bonnet has no holes punched through it at any stage
- [ ] Background is real transparency, or flat magenta — never a checkerboard
- [ ] Full size, not downscaled
- [ ] Filenames exactly as specified

## CHANGELOG
- v1.0 (2026-08-16): Written for the five bodies that arrived intact-only in the second drop. Edit-from-master rather than generate-from-description, because that is what kept the sedan ladders reading as one car. Includes keyed starting masters, per-body notes, and the budget arithmetic for the optional directional phase.
- v1.1 (2026-08-16): Added the police cruiser, which did not exist when this was written. Notes its IIIA armour so the art shows spalling rather than clean punctures on the doors.
