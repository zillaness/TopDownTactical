---
file: RAYCASTER_DOOR_PROMPTS_v1.0.md
version: 1.0
author: OpenAI Codex for Sam Cao
created: 2026-09-03
last_updated: 2026-09-03
description: Authored first-person raycaster damage ladder for a closed modern wood door, with gameplay masks for player sight, bullets, enemy detection, and movement.
---

# Raycaster wood door — authored aperture ladder

## Files

Full-resolution art is 1254×1254. Runtime textures are 256×256. Logic masks are
64×64, with white meaning open and black meaning solid.

```text
door_wood__intact.png
door_wood__punctured.png
door_wood__opened.png
door_wood__breached.png
runtime/door_wood__<stage>.png
runtime/door_wood__<stage>__player_open.png
runtime/door_wood__<stage>__bullet_open.png
runtime/door_wood__<stage>__ai_open.png
runtime/door_wood__<stage>__move_open.png
runtime/door_wood_manifest.json
```

The `*_key.png` files are reproducible source edits. Flat magenta is a processing
key only; the final PNGs replace it with real transparency.

## Gameplay contract

| Stage | Player sight | Bullets | Enemy acquisition | Movement |
|---|---:|---:|---:|---:|
| intact | blocked | blocked | blocked | blocked |
| punctured | exact holes | exact holes | blocked | blocked |
| opened | main opening | main opening | delayed, 0.45× | blocked |
| breached | full breach | full breach | normal, 1.0× | passable gap |

Door pose is independent from damage. These frames depict the closed pose; the
same damage state can be transformed with the runtime door plane when it swings.

## Intact master prompt

> Create one production-ready square first-person raycaster wall texture: a
> CLOSED, INTACT, modern tactical interior wooden door viewed perfectly
> straight-on at eye level, orthographic/flat elevation with no perspective
> convergence. The whole image is one seamless architectural tile: narrow slate
> blue-gray painted wall strips at left and right, dark cool-gray steel door
> frame, and a full-height muted brown hardwood/laminate door centered in the
> frame. Include a compact charcoal lever handle and steel lock plate on the
> right side. Serious grounded SWAT operations visual style: crisp flat
> vector-like shapes, near-black structural outlines, restrained wear, subtle
> pale gray edge rims, subdued military-industrial colors, distinguishable
> wood/paint/metal brightness. Tense dim neutral lighting baked very lightly, no
> cast shadows obscuring geometry. The door must be completely intact with NO
> holes, cracks, blood, signage, enemies, UI, text, props, floor, ceiling, or view
> beyond. Preserve generous margin around the door frame but fill the square
> edge-to-edge as a tile. Precisely frontal, symmetric verticals, readable after
> reduction to 256x256. Opaque image.

## Punctured edit prompt

> Edit this exact closed-door texture into damage stage PUNCTURED. Preserve the
> exact canvas, camera, wall, steel frame, door position, proportions, handle,
> lock, lighting, palette, and crop pixel-for-pixel wherever undamaged. Add a
> sparse irregular cluster of 7 to 10 small firearm punctures through the wooden
> door slab, mostly around chest height but not forming a regular pattern. Each
> puncture must be a genuinely tiny readable opening: a very small center filled
> with one perfectly flat solid chroma-key color #FF00FF, surrounded by
> restrained splintered brown wood and a near-black inner rim. The #FF00FF must
> appear ONLY inside the actual see-through hole centers, never as decoration,
> glow, checkerboard, or background. Keep every hole too small for a person or
> enemy AI to reliably detect through at gameplay scale. Add subtle radial
> cracks and a few wood chips, but no large missing chunk, no broken frame, no
> blood, no text, no enemy, no view painted behind the holes. Door remains closed
> and movement-blocking. Keep exact full resolution; opaque image with flat
> magenta key centers.

## Opened edit prompt

> Edit this exact PUNCTURED closed-door texture into damage stage OPENED.
> Preserve the exact canvas, frontal camera, slate wall, steel frame, door
> position and outer silhouette, handle, lock, lighting, palette, crop, and every
> existing small puncture. Enlarge damage by tearing out ONE irregular
> shoulder-width horizontal viewing/fire opening through the upper-middle wooden
> slab, centered slightly left of the handle and spanning about 28% of the door
> width and 12% of its height. Fill the entire genuinely see-through interior of
> that opening with one perfectly flat solid chroma-key color #FF00FF. The
> #FF00FF must appear ONLY in the open void, with no checkerboard and no scene
> painted behind it. Surround it with believable jagged splintered wood, thin
> delaminated laminate layers, near-black inner edges, and a few restrained
> cracks. It must be large enough for delayed enemy AI visual detection and
> aimed gunfire, but it does NOT reach the floor and is NOT traversable. Door
> remains closed in its frame; frame, handle, and lock remain attached and
> readable. No blood, text, enemies, loose props, or giant explosion. Exact same
> size and alignment; opaque image with flat magenta key in all openings.

## Breached edit prompt

> Edit this exact OPENED closed-door texture into damage stage BREACHED.
> Preserve the exact canvas, frontal camera, wall strips, steel frame, door
> alignment, lighting, palette, crop, all existing bullet damage, and the upper
> horizontal opening. Tear away much of the LOWER-CENTER and lower-left wooden
> door slab to create ONE irregular person-width passage connected continuously
> to the bottom threshold. The passage should rise to around 70% of door height
> and be about 42% of door width at its narrowest useful point, clearly large
> enough for an armed adult to crouch/step through. Connect it naturally into the
> existing upper opening or leave a narrow jagged wood bridge only if the
> floor-connected opening is independently traversable. Fill EVERY genuinely
> open void—including all old puncture centers, the upper opening, and the new
> floor-connected breach—with one perfectly flat solid chroma-key color
> #FF00FF, nowhere else. No checkerboard, no environment or enemy painted behind
> it. Leave battered remnants of the door hanging along the hinge side and
> around the right-side handle/lock area so it still reads unmistakably as this
> same destroyed door. Add believable layered splinters, torn laminate, bent
> latch-side fragments, near-black interior edges, and restrained debris
> embedded at the threshold, but do not obstruct the passable gap. Steel frame
> remains fixed and recognizable. No blood, text, characters, smoke, fire, or
> explosion. Exact same resolution and registration; opaque image with magenta
> key openings.

## Validation

- Same dimensions and registration across every stage.
- Openings are cumulative and monotonic.
- Punctures produce player/bullet mask cells but zero enemy-detection cells.
- Opened produces enemy-detection cells but zero movement cells.
- Breached produces a floor-connected movement component.
- Runtime textures were inspected at native 256×256 after chroma despill.

## CHANGELOG

- v1.0 (2026-09-03): Generated and validated the first closed wood-door ladder.
