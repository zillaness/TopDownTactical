# Raycaster drywall aperture prompts v1.0

All four assets use a perfectly straight-on orthographic elevation, a square
canvas filled edge-to-edge by cool slate blue-gray institutional drywall, flat
diffuse lighting, no floor, ceiling, side faces, perspective, text, fixtures,
shadows, or scenery. The wall geometry, seams, scale, crop, lighting, and all
unchanged pixels remain fixed through the edit chain.

## `drywall__intact.png`

Create an undamaged master with restrained panel seams, faint roller variation,
subtle base grime, and a few tiny scuffs. It is fully opaque and contains no
holes, cracks, exposed studs, borders, or transparency.

## `drywall__punctured.png`

Edit only the intact master. Add five clustered small-arms punctures between
38–48% of the canvas width and 42–58% of its height. Each hole is at most 2% of
the canvas width, with chipped gypsum, torn paper, and short cracks. Keep the
damage away from seams and edges. The hole interiors are true alpha; the image
generator used flat `#FF00FF` cores as the project fallback before deterministic
keying. This stage passes player sight and bullets but never AI detection.

## `drywall__opened.png`

Edit only the approved punctured stage. Preserve every earlier aperture and
connect the main cluster into one irregular shoulder-width opening near 43% of
canvas width and 52% of canvas height, roughly 18% wide by 22% high. Show broken
board layers and one narrow exposed metal stud. Keep the opening off all canvas
edges. This stage passes player sight and bullets; its principal opening permits
AI detection at a reduced acquisition multiplier of `0.45`; movement remains
blocked.

## `drywall__breached.png`

Edit only the approved opened stage. Preserve all earlier damage and extend the
main opening downward into an irregular person-width gap reaching the bottom
edge. Keep at least 24% of the canvas width clear at floor level. Retain solid
wall at the left, right, and top, with bent studs displaced to the edge of the
walkable opening. This stage passes sight, bullets, and normal AI detection and
is the only movement-enabled stage.

## Processing contract

- Masters: 1254 × 1254 RGBA PNG.
- Runtime color textures: 256 × 256 RGBA PNG.
- Logical masks: 64 × 64 binary PNG, white means open and black means solid.
- Player and bullet masks contain every authored aperture.
- AI mask is empty for intact and punctured, contains only the principal opening
  for opened, and contains the full aperture for breached.
- Movement mask is empty until breached and then contains only the principal
  floor-connected opening.
- Each later opening mask is the union of the approved earlier mask and the new
  stage, so damage cannot visually or logically heal.
