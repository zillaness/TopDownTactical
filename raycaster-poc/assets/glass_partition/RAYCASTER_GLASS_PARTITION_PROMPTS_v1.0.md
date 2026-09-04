---
file: RAYCASTER_GLASS_PARTITION_PROMPTS_v1.0.md
version: 1.0
author: OpenAI Codex for Sam Cao
created: 2026-09-03
last_updated: 2026-09-03
description: Two-material first-person glass-partition ladder separating translucent glass from true open air.
---

# Raycaster glass partition — authored material ladder

## Two-key contract

- Cyan `#00FFFF` in source edits means surviving glass.
- Magenta `#FF00FF` means true open air.
- Final art converts glass to RGBA `[128, 204, 216, 82]` and open air to
  `[0, 0, 0, 0]`.
- Steel, bolts, mullions, rails, impact rims, and crack lines remain opaque.

This distinction allows an enemy to remain visible through an intact pane while
the projectile system still applies glass deflection and energy loss.

## Runtime channels

```text
glass_partition__<stage>.png                 256×256 visual texture
glass_partition__<stage>__player_open.png    sight-transmitting pane area
glass_partition__<stage>__ai_open.png        AI sight-transmitting pane area
glass_partition__<stage>__bullet_open.png    true air only
glass_partition__<stage>__move_open.png      traversable air only
glass_partition__<stage>__glass_coverage.png surviving glass material
glass_partition_manifest.json
```

All logic masks are 64×64. White selects the named channel.

## Intact prompt

> Create one production-ready square first-person raycaster architectural
> texture: an INTACT floor-to-ceiling interior tactical glass partition viewed
> perfectly straight-on at eye level, flat orthographic elevation, no
> perspective convergence. Fill the square edge-to-edge as a wall tile. Use a
> narrow dark cool-gray steel perimeter frame with one slim horizontal safety
> rail at about waist height and one narrow central vertical mullion, forming
> four large rectangular glass panes. Every glass-pane interior must be filled
> with the exact same perfectly flat solid chroma cyan #00FFFF, with NO
> gradients, scenery, reflections, checkerboard, text, silhouettes, or view
> painted behind it. The cyan must appear only inside the glass panes. Steel
> should use crisp flat vector-like shapes, near-black internal outlines, subtle
> pale gray edge rims, restrained bolts, and cool-gray highlights. Serious
> grounded SWAT operations display style, subdued military-industrial palette,
> clean and utilitarian, readable after reduction to 256x256. No damage, cracks,
> bullet holes, blood, signage, enemies, props, floor, ceiling, UI, or decorative
> clutter. Symmetric verticals and exact frontal registration. Opaque image; the
> cyan is a processing key for translucent glass.

## Punctured/cracked edit prompt

> Edit this exact intact glass-partition texture into damage stage
> PUNCTURED/CRACKED. Preserve the exact canvas, perfectly frontal camera,
> perimeter frame, central mullion, horizontal rail, bolts, scale, lighting, and
> crop. Keep all undamaged glass-pane interiors the same flat chroma cyan
> #00FFFF processing color. Add 8 to 12 irregular bullet impacts distributed
> across the four panes, with restrained pale gray-white spiderweb cracks and a
> few tiny glass chips. At only 4 to 7 impact centers, create very small true
> perforations filled with perfectly flat solid chroma magenta #FF00FF. Magenta
> must appear ONLY in the genuinely open pinholes; cyan must remain everywhere
> glass still exists. Do not use magenta or cyan as glow, reflections,
> decoration, checkerboard, or background. Do not remove any large glass area.
> The steel frame and rails remain intact. Keep the result readable at 256x256
> in a grounded serious tactical raycaster style. No blood, characters,
> environment behind the panes, text, UI, smoke, floor, or perspective. Exact
> same full resolution and registration; opaque key image.

## Opened/shattered edit prompt

> Edit this exact PUNCTURED/CRACKED glass-partition key texture into damage
> stage OPENED/SHATTERED. Preserve the exact canvas, frontal camera, steel
> perimeter frame, central mullion, waist-height rail, bolts, scale, lighting,
> crop, and all existing impact locations. Keep surviving glass interiors the
> same chroma cyan #00FFFF. Knock out one large irregular shoulder-width area
> from the UPPER-RIGHT pane and one smaller hand-sized area from the LOWER-LEFT
> pane. Fill every genuinely empty opening, including the prior magenta
> perforations, with perfectly flat solid chroma magenta #FF00FF. Magenta means
> open air only; cyan means surviving glass only. Around each opening add crisp
> jagged residual glass teeth, pale fragments, and branching cracks, but do not
> paint scenery, darkness, checkerboard, or characters behind the holes. Leave
> enough cyan glass that the partition still reads as damaged glazing rather
> than an empty frame. Steel remains undamaged and movement remains blocked
> because no floor-connected passage exists. Serious grounded tactical
> raycaster style, restrained detail, readable at 256x256. No blood, text, UI,
> smoke, floor, ceiling, or perspective drift. Exact same full resolution and
> registration; opaque two-key image.

## Breached edit prompt

> Edit this exact OPENED/SHATTERED glass-partition key texture into damage stage
> BREACHED. Preserve the exact canvas, frontal camera, steel perimeter frame,
> central mullion, horizontal rail, bolts, scale, lighting, crop, every earlier
> impact, the upper-right opening, the lower-left opening, and surviving cyan
> glass. Create one large floor-connected person-width passage by removing most
> of the LOWER-RIGHT glass pane from the bottom inner frame up to just below the
> horizontal safety rail. Fill that entire new empty lower-right passage, plus
> every previously open hole, with perfectly flat solid chroma magenta #FF00FF.
> Keep surviving glass regions filled with chroma cyan #00FFFF. Magenta means
> open air only; cyan means glass only. Leave jagged residual glass teeth around
> the right, left, and upper edge of the new passage, with restrained pale
> fragments at the bottom, but keep the central usable gap unobstructed and at
> least 70% of the lower-right pane width. The steel outer frame, center mullion,
> and horizontal rail remain fixed and fully solid, so only that lower-right
> pane is traversable. No scenery, darkness, checkerboard, characters, blood,
> text, UI, smoke, or perspective change. Serious grounded tactical raycaster
> style, readable at 256x256. Exact same full resolution and registration;
> opaque two-key image.

## Suggested simulation values

| Stage | AI acquisition | Bullet energy retained through glass | Maximum deflection | Movement |
|---|---:|---:|---:|---:|
| intact | 0.72× | 0.62 | 3.0° | blocked |
| punctured | 0.64× | 0.68 | 2.5° | blocked |
| opened | 0.86× | 0.82 | 1.5° | blocked |
| breached | 1.00× | 0.92 | 0.5° | lower-right breach only |

The projectile values apply only where `glass_coverage` is white. Rays crossing
`bullet_open` encounter air and receive no glass penalty.

## Validation

- All masters are 1254×1254 with identical frame registration.
- Final masters contain only three alpha values: 0 open, 82 glass, 255 opaque.
- Open-air masks are cumulative and monotonic.
- Intact glass contains zero open-air pixels but remains sight-transmitting.
- Movement stays empty until the floor-connected breached component.
- Runtime textures were inspected at native 256×256 after key-fringe cleanup.

## CHANGELOG

- v1.0 (2026-09-03): Generated and validated the first architectural-glass ladder.
