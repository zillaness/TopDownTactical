---
file: ART_PROMPT_FORTIFICATIONS_v1.0.md (top-down-tactical)
version: 1.0
author: Sam Cao
created: 2026-08-18
last_updated: 2026-08-18
description: Ready-to-paste Codex/GPT prompts for a MODULAR fortification tile set — sandbag wall pieces with 90 and 45 degree corner connectors, concertina wire, and HESCO barriers — plus the raster-vs-vector call for this specific set, the exact tile manifest the engine expects, and the integration contract.
ai_update: Update last_updated and bump version in frontmatter. Rename file to match. Append changelog at bottom.
---

# Modular fortification art — Top-Down Tactical

## Why this document exists

Sam, playing v0.73: *"the circle of sandbags doesn't look right. it looks like
a circle of sandbags you'd put a mounted gun in, not a modular sandbag wall."*

Correct, and the diagnosis is in the existing asset. The inlined `sandbags`
sprite is a **horseshoe gun pit seen from above** — one object, closed on three
sides. It is a good emplacement and a bad wall, and laid in a run of tiles it
reads as a line of doughnuts. What the maps need is a **modular set**: pieces
that connect, so a wall can be drawn as a wall, turn a corner, cap an end, and
branch.

**All three materials are already live in the engine and already drawn in code**
(v0.79), so this art is a *swap*, not a dependency. Nothing here blocks map
authoring — author the maps now, drop the art in later, change one field.

---

## 0. Raster or vector — do BOTH, and here is which goes where

The existing environment doc says raster for everything, and for *organic* art
(tree canopies, foliage, weathered vehicles) that is still right: a canopy reads
as a canopy because of ragged alpha at its perimeter, which is exactly what
vector fights.

**Fortifications are the exception, and they are the one asset class in this
game where vector genuinely wins.** Three reasons specific to this set:

1. **They are modular, so they must align to the pixel.** Fourteen pieces have
   to meet at tile edges with no seam and no overlap. Raster pieces generated
   independently will not line up — each one is a separate sample of the
   model's idea of "sandbag beige," and the join shows. Vector paths share
   exact coordinates and exact fills by construction.
2. **They are man-made and geometric.** A HESCO unit is a wire cage: straight
   lines, a regular mesh, hard corners. That is what vector is for. There is no
   organic edge quality to lose.
3. **The engine already generates vector in code.** `buildHumans` emits SVG for
   the operators because they need runtime recolor. The same path exists and is
   proven; a fortification set can use it and inherit the same rasterize-once,
   cache-forever treatment.

**So: ask for BOTH, in this order.**

- **SVG first** — this is the deliverable that ships. Request it as source, not
  as a traced export.
- **PNG second, as reference** — a raster render of the same piece at 2× is the
  fastest way to eyeball whether the thing looks right before anyone wires it
  up, and it is the fallback if the SVG comes back as garbage paths.

**Byte budget, and it is tight.** The build fought its way to 1,979,537 bytes
against a hard 2MB ceiling in v0.76, and the suite now FAILS if you break it.
As of v0.79 there is roughly 9KB of headroom, not 115KB.

- A clean SVG for one of these pieces is **300–900 bytes** minified. Fourteen
  pieces is **4–12KB**, and SVG inlines as text with no base64 penalty.
- The equivalent PNGs at 2× would be **6–14KB each, ~37% more once base64'd**,
  so **110–260KB for the set**. That does not fit. It is not close to fitting.

**This is the actual reason to go vector here, stated plainly: the raster
version of this set cannot ship.** Generate the PNGs as reference and throwaway.

---

## 1. The scale anchor — state it in every single prompt

**One floor tile = 32 world pixels. Author at 2×, so one tile = 64 × 64 in the
delivered asset. A human body is 20 world pixels across — a man is not quite
two-thirds of a tile.** One tile is about one metre. A sandbag wall one tile
deep is a real sandbag wall, not a decorative kerb.

For SVG: `viewBox="0 0 64 64"` per single tile. No exceptions, no padding, no
margins — the engine draws tile-to-tile and any built-in margin becomes a gap.

---

## 2. The master style block (paste at the top of every prompt)

> Strict top-down orthographic view, camera pointing straight down at 90
> degrees, like a satellite photo or a floor plan. NOT isometric, NOT angled,
> no horizon, no perspective, no vanishing point, and no visible side or face
> of any object — if I can see the side of it, the camera is wrong. Grounded
> semi-realistic military-sim style: muted desaturated palette, painterly but
> clean-edged, no black outlines, no cartoon or cel shading, no text, no
> watermark, no labels, no logos. Lighting is neutral and directly overhead:
> a short contact shadow tight under the object only, never a long directional
> shadow. The asset must read clearly at 10% size against a dark floor.
> Palette anchors: floors #303b46 / #111a17, walls #46545f, brick #845345,
> wood #80623a, metal #788792, foliage #3b5238, sandbag beige #7a6f4e,
> HESCO earth #9a8f6b, galvanised steel #8d959b, accent #e8b53a.

**For the SVG deliverable, add this block too:**

> Output a single self-contained SVG, `viewBox="0 0 64 64"`, no `width` or
> `height` attributes, no `<style>` block, no CSS classes, no external
> references, no embedded raster images, no filters, no gradients with more
> than three stops. Use plain `<path>`, `<rect>`, `<circle>` and `<g>` with
> presentation attributes (`fill`, `stroke`, `stroke-width`) written inline.
> Round all coordinates to one decimal place. The artwork must reach the exact
> edges of the viewBox on any side that is meant to connect to a neighbouring
> tile, with no margin and no padding, so that two tiles placed side by side
> form one continuous object with no seam. Transparent background — no
> background rect. Give me the raw SVG source in a code block, nothing else.

**For the PNG reference renders, add instead:**

> Background is FLAT SOLID MAGENTA #FF00FF with no texture, no gradient, and
> no shadow falling on it — I will key this colour out, so no part of the asset
> itself may be magenta or pink. Generate at 1024×1024; I will downscale.

**Reject on sight, regenerate:**
- **Isometric drift.** Any visible side face. The single most common failure.
- **Baked long shadows.** Our lighting is flat; a shadow with a direction will
  fight every other asset on screen.
- **Margins on connecting edges.** A modular piece with a 2px inset is broken —
  it will show a hairline gap in every wall built from it.
- **Inconsistent bag size between pieces.** The straight and the corner must be
  built from bags of the SAME size, or the corner reads as a different wall.
- Magenta bleed on the PNGs — pink fringing means the key leaves a halo.

---

## 3. THE MANIFEST — fourteen pieces, and what each one is for

The engine picks a piece per tile by looking at that tile's four neighbours, so
the set has to cover every connection case. **Generate every piece from the same
bag/cage size and the same lighting**, or they will not read as one system.

### 3a. Sandbags — seven pieces

Courses of bags laid long-ways along the run and **staggered course to course
like brickwork**, because that is how one is actually built and it is also the
only thing that makes a row of tiles read as one wall rather than as repeated
stamps. Three courses across a one-tile depth.

| key | piece | connects |
|---|---|---|
| `sandbag_straight` | a straight run | west + east |
| `sandbag_end` | an end cap — the wall stops, bags rounded off | east only |
| `sandbag_corner90` | a right-angle turn | east + south |
| `sandbag_corner45` | a 45° dogleg | east + south-east |
| `sandbag_tee` | a T junction | west + east + south |
| `sandbag_cross` | a four-way | all four |
| `sandbag_single` | one isolated pile, no neighbours | none |

Prompt lines — append one to the master block per generation:

- **straight**: "A modular top-down sandbag wall tile, exactly one tile square.
  Three courses of filled hessian sandbags laid long-ways left-to-right,
  staggered like brickwork course to course, filling the full width of the tile
  and reaching the left and right edges exactly so it tiles seamlessly with a
  copy of itself. Bags are plump, dusty beige-khaki, individually readable with
  soft seams between them. The top and bottom edges of the tile are the open
  sides of the wall."
- **end cap**: "The same modular sandbag wall, one tile square, but this is the
  END of the wall: bags reach the RIGHT edge exactly and stop cleanly short of
  the left edge, with the leftmost bags rounded off as a finished end. Same bag
  size, same three courses, same palette as the straight piece."
- **corner 90**: "The same modular sandbag wall, one tile square, turning a
  ninety degree corner: one arm reaches the RIGHT edge and one arm reaches the
  BOTTOM edge, meeting in the middle of the tile with the bags properly
  interlocked at the turn the way real sandbag corners are bonded. No gap and
  no notch at the inside of the corner. Same bag size and palette as the
  straight piece."
- **corner 45**: "The same modular sandbag wall, one tile square, making a
  forty-five degree dogleg: the wall enters at the middle of the RIGHT edge and
  leaves at the BOTTOM-RIGHT corner, the courses fanning slightly through the
  bend so the bags stay long-ways to the run. Same bag size and palette."
- **tee**: "The same modular sandbag wall, one tile square, as a T junction:
  a straight run reaching both the LEFT and RIGHT edges, with a third arm
  branching down to the BOTTOM edge, bonded into the run. Same bag size and
  palette."
- **cross**: "The same modular sandbag wall, one tile square, as a four-way
  crossing reaching all four edges, bags interlocked at the centre. Same bag
  size and palette."
- **single**: "A small isolated heap of filled hessian sandbags from directly
  above, roughly circular, about two-thirds of a tile across, centred with
  clear transparent space at all four edges. Same bag size and palette as the
  wall pieces."

**Keep the existing gun pit.** The horseshoe emplacement already in the game is
the right asset for the thing it is — it stays on its own glyph (`N`). If you
want a matched replacement, ask for: "A sandbag gun emplacement from directly
above: a low C-shaped ring of stacked sandbags two tiles across, open side
facing the bottom of the frame, built from the same bags as the wall pieces."

### 3b. Concertina / barbed wire — three pieces

Currently drawn in code and it looks decent, so this is the lowest-priority
third of the set — but a real asset would beat it.

| key | piece | connects |
|---|---|---|
| `wire_straight` | a coil run | west + east |
| `wire_end` | the coil terminates, anchored to a picket | east only |
| `wire_corner` | the run turns 90° | east + south |

- **straight**: "A modular top-down concertina razor wire tile, exactly one tile
  square. A single continuous coil of galvanised razor wire running left to
  right, drawn as a series of overlapping ellipses about two-thirds of a tile
  across, with short angular barbs and razor tape flats catching the light. The
  coil reaches the left and right edges exactly so it tiles seamlessly with a
  copy of itself. Bright cold steel grey against transparency, with a soft dark
  contact shadow directly beneath the coil. Open, airy, mostly see-through — I
  must be able to see the ground through the gaps in the coil."
- **end**: "The same concertina coil, one tile square, terminating: the coil
  reaches the RIGHT edge and ends at a short steel angle-iron picket driven into
  the ground at the left, with the wire lashed to it. Same coil diameter and
  palette."
- **corner**: "The same concertina coil, one tile square, turning ninety
  degrees: entering at the middle of the RIGHT edge and leaving at the middle of
  the BOTTOM edge, the coils compressing slightly through the bend, with a
  steel picket at the apex of the turn. Same coil diameter and palette."

### 3c. HESCO — four pieces

A HESCO unit is a **collapsible wire-mesh cage lined with geotextile and filled
with whatever the ground is made of.** From above you see the square cell, the
coarse mesh grid, and the earth fill. A run shares its cell walls, which is why
the corner and end pieces matter — a row of separate boxes is wrong.

| key | piece | connects |
|---|---|---|
| `hesco_straight` | a run of cells | west + east |
| `hesco_end` | the run terminates with a closed end wall | east only |
| `hesco_corner` | the bastion turns 90° | east + south |
| `hesco_single` | one isolated unit, all four walls closed | none |

- **straight**: "A modular top-down HESCO bastion tile, exactly one tile square:
  one square gabion cell, a galvanised welded wire-mesh cage lined with pale
  geotextile fabric, filled flush to the top with compacted sandy earth and
  gravel. Seen from directly above I see the coarse square mesh grid over the
  fill. The LEFT and RIGHT walls are shared with the next cell, so the cage
  frame runs along the TOP and BOTTOM edges only and the left and right edges
  are open fill that continues into the neighbouring tile with no seam. Muted
  sand and olive, dusty, faintly weathered."
- **end**: "The same HESCO cell, one tile square, as the END of a run: cage
  frame closed along the TOP, BOTTOM and LEFT edges, with only the RIGHT edge
  open to continue into the next cell. Visible corner posts at the two left
  corners. Same cell size, mesh gauge and palette as the straight piece."
- **corner**: "The same HESCO cell, one tile square, as the CORNER of a bastion:
  the run continues out of the RIGHT edge and out of the BOTTOM edge, so the
  cage frame is closed along the TOP and LEFT edges only, with corner posts at
  the top-left. Same cell size, mesh gauge and palette."
- **single**: "The same HESCO cell, one tile square, standing alone: cage frame
  closed on all four edges with a corner post at each of the four corners, fill
  flush to the top. Same cell size, mesh gauge and palette."

---

## 4. Integration contract — what has to be true for this to drop in

The engine side is already built and shipping. The art swaps into it.

1. **`PROPS[key].drawn` becomes `PROPS[key].art`.** Today `sandbags` and `hesco`
   carry `drawn: "sandbags"` / `drawn: "hesco"`, which routes them to the
   in-code renderer. Point them at art keys instead and the code path is dead
   without touching a map. `wire` is the same.
2. **The neighbour lookup already exists.** `fortiNeighbours(tx, ty, kind)`
   returns `{n, s, w, e}` booleans for same-material neighbours. The piece
   selection table below is what the swap wires up.
3. **Pieces are 64×64 and edge-exact.** The engine draws each tile at
   `TILE × TILE` with no inset. A margin becomes a visible gap in every wall.
4. **Rotation is free, so generate the minimum set.** The engine can rotate a
   piece by 90° at draw time. You only need ONE of each topology:
   `straight` covers vertical by rotating 90°; `end` covers all four
   orientations; `corner90` covers all four; `tee` covers all four. **Do not
   generate pre-rotated variants — that is 4× the bytes for nothing.**
5. **Alpha-first, magenta as the named fallback key** (house rule, CLAUDE.md).
6. **Measure, do not estimate** (house rule). Every drop gets weighed against
   the 2MB ceiling before it is committed, and the suite fails if it breaks.

Piece selection from neighbours, which is what the code will do:

| n | s | w | e | piece | rotation |
|---|---|---|---|---|---|
| – | – | – | – | `single` | 0° |
| – | – | ✓ | ✓ | `straight` | 0° |
| ✓ | ✓ | – | – | `straight` | 90° |
| – | – | – | ✓ | `end` | 0° |
| – | – | ✓ | – | `end` | 180° |
| – | ✓ | – | ✓ | `corner90` | 0° |
| – | ✓ | ✓ | – | `corner90` | 90° |
| ✓ | – | ✓ | – | `corner90` | 180° |
| ✓ | – | – | ✓ | `corner90` | 270° |
| – | ✓ | ✓ | ✓ | `tee` | 0° |
| ✓ | ✓ | ✓ | ✓ | `cross` | 0° |

`corner45` has no neighbour case — it is placed deliberately by a map glyph,
not inferred, because a dogleg is an authoring choice and not a topology.

---

## 5. Priority order if Codex can only do some of it

1. **`sandbag_straight`, `sandbag_end`, `sandbag_corner90`** — three pieces and
   the wall is buildable. This is the thing Sam actually complained about.
2. **`hesco_straight`, `hesco_end`, `hesco_corner`** — the heavier cover, and
   the one whose in-code version is furthest from what a real HESCO looks like.
3. **`sandbag_tee`, `sandbag_cross`, `sandbag_single`, `hesco_single`** —
   completeness; the engine falls back to `straight` for these until they exist.
4. **`sandbag_corner45`** — the dogleg. Nice, not needed.
5. **The wire set** — the in-code version is already the best of the three.

## 6. Where to put the delivered files

`assets/incoming/fortifications/` — one file per piece, named exactly as the
manifest keys (`sandbag_corner90.svg`, `hesco_end.svg`, …), SVG and PNG side by
side. The drop contract in `assets/README.md` applies. Do not inline anything
by hand; the tooling measures and inlines, and it refuses to write anything
that breaks the byte ceiling.

## CHANGELOG
- v1.0 (2026-08-18): Written after Sam's note that the sandbag ring reads as a
  gun pit and not a wall. Fourteen-piece modular manifest, the vector-over-
  raster call made on measured bytes rather than taste (the raster set cannot
  fit under the 2MB ceiling at all), and the neighbour-to-piece table the
  engine already computes.
