---
file: RAYCASTER_SEDAN_GREY_PROMPTS_v1.0.md
version: 1.0
author: OpenAI Codex for Sam Cao
created: 2026-09-03
last_updated: 2026-09-03
description: Eight-bearing first-person raycaster sprite set for the repository's grey sedan, with translucent windows and oriented physical cover data.
---

# Grey sedan — eight raycaster bearings

## Deliverables

- Eight 1254×1254 keyed source renders in `source_keys/`.
- Eight full-resolution RGBA masters in `masters/`.
- Eight normalized 256×256 runtime sprites in `runtime/`.
- Four 64×64 masks per bearing: silhouette, opaque body, glass, and
  sight-through glass.
- `runtime/sedan_grey_manifest.json` with view selection, anchors, world
  dimensions, glass behavior, and oriented cover volumes.

Bearings run clockwise around the vehicle: `000` front, `090` passenger/right,
`180` rear, and `270` driver/left.

## Key colors

- `#FF00FF`: background, converted to zero alpha.
- `#00FFFF`: automotive glass, converted to RGBA `[104, 184, 198, 82]`.
- Everything else: opaque vehicle structure.

## Front-left identity master prompt

> Using the supplied top-down grey sedan only as an identity/color reference,
> create a production-ready FIRST-PERSON RAYCASTER billboard sprite of the same
> generic late-2000s four-door midsize sedan from the FRONT-LEFT three-quarter
> bearing (camera sees the nose and driver side, approximately 45 degrees off
> the nose). Fixed camera height 1.55 meters, level lens, consistent neutral
> 50 mm/orthographic-like game view with minimal perspective distortion. Show
> the complete car from tire contact patches to roof and bumper to bumper,
> centered, occupying about 82% of canvas width and 58% of canvas height, all
> four wheels placed believably. Keep the slate blue-gray weathered metallic
> paint, compact grille, pale headlights, black trim, body-color mirrors, dark
> charcoal wheels, and believable proportions from the reference. Grounded
> serious tactical visual style: crisp flat vector-like shapes, near-black
> structural outlines, subtle pale gray edge rims, restrained wear, readable at
> 256 pixels; no photorealistic scenery and no exaggerated cartoon proportions.
> CRITICAL TWO-KEY ART: fill every background pixel outside the vehicle
> silhouette with perfectly flat solid chroma magenta #FF00FF. Fill every
> visible glass pane interior—windshield and side windows—with perfectly flat
> solid chroma cyan #00FFFF, bounded by opaque black window seals/pillars. Cyan
> means translucent glass and must contain no painted cabin, occupants,
> reflections, gradients, or scenery. Magenta appears only outside the car;
> cyan appears only inside window glass. The body, tires, pillars, mirrors,
> lights, grille, and bumpers are opaque. No cast shadow, ground plane, text,
> UI, weapon, characters, damage, open doors, checkerboard, or cropping. Square
> 1:1 opaque key image.

## Shared bearing-edit constraint

Each remaining render was edited from the front-left identity master with this
common constraint:

> Preserve the exact same late-2000s four-door midsize sedan identity as the
> reference: slate blue-gray weathered metallic paint, compact grille and lamp
> language, charcoal five-spoke wheels, wheelbase, mirrors, black trim, body
> proportions, crisp grounded tactical style, neutral lighting, and fixed
> 1.55 m level camera. Maintain the same roof height and tire-contact groundline
> as the reference, show the complete vehicle with no cropping, and let projected
> width change naturally for the bearing. CRITICAL TWO-KEY ART: every pixel
> outside the vehicle silhouette is perfectly flat #FF00FF; every visible
> windshield/side/rear glass interior is perfectly flat #00FFFF bounded by
> opaque seals and pillars. Cyan has no cabin, occupants, reflections,
> gradients, or scenery. Body, tires, pillars, mirrors, lamps and bumpers
> opaque. No shadow, ground, text, UI, damage, checkerboard, or extra objects.
> Square opaque key image.

## Bearing-specific edit directives

- `000_front`: dead-on front; bilateral; about 44% canvas width; both
  headlights, grille, windshield, mirrors, and front tires.
- `045_front_right`: nose and passenger side at 45°; about 82% canvas width.
- `090_right`: strict passenger-side elevation, nose right; both visible wheels
  aligned; about 84% canvas width.
- `135_rear_right`: tail and passenger side at 45°; tail lamps, trunk seam,
  right-side doors, wheels, and antenna.
- `180_rear`: dead-on rear; bilateral; about 44% canvas width; trunk, rear
  glass, lamps, plate recess without readable text, mirrors, and rear tires.
- `225_rear_left`: tail and driver side at 45°; tail lamps, trunk seam,
  left-side doors, wheels, and antenna.
- `270_left`: strict driver-side elevation, nose left; both visible wheels
  aligned; about 84% canvas width.
- `315_front_left`: identity master described above.

## Runtime normalization

The generator's canvas fill is not used as physical scale. Each opaque/glass
silhouette is cropped and normalized to a common 78-pixel vehicle height with a
bottom-center anchor at `(128, 222)`. This preserves the true projected aspect:
side views are about 223–230 pixels wide, quarter views 160–168 pixels, and
front/rear views 92–96 pixels.

## Visibility and cover contract

- Enemy sprites render behind the vehicle, then this vehicle sprite composites
  over them. Window alpha exposes the enemy; opaque doors and pillars conceal it.
- AI acquisition multiplier: `0.76` through one pane and `0.56` through two.
- Bullet energy retained: `0.60` per pane, with up to `3.5°` deflection per pane.
- Ballistics and AI do not infer cover from the chosen 2D bearing. They intersect
  the oriented engine, body, lower-cabin, glass, trunk, and roof volumes in the
  manifest.

## Validation

- All eight bearings exist and share 1254×1254 source dimensions.
- Every runtime sprite shares the same physical-height normalization and anchor.
- All views contain non-empty glass and opaque coverage masks.
- Isolated chroma-key components are removed after resampling.
- Native-size contact sheet and an enemy-through-window composite were visually
  inspected.

## CHANGELOG

- v1.0 (2026-09-03): Generated and validated the intact eight-bearing grey sedan.
