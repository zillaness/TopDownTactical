---
file: ART_PROMPT_environment_v1.0.md (top-down-tactical)
version: 1.0
author: Sam Cao
created: 2026-08-14
last_updated: 2026-08-14
description: Ready-to-paste prompts for generating top-down environment art (trees, bushes, cars, furniture, ground textures) with an image model, plus the integration contract that makes the output usable in the engine.
ai_update: Update last_updated and bump version in frontmatter. Rename file to match. Append changelog at bottom.
---

# Environment art prompts — Top-Down Tactical

Two kinds of asset, two different prompts. **Props** are single objects on a
transparent background (trees, cars, furniture) that the engine will blit like
sprites. **Ground textures** are seamless tiles (asphalt, dirt, roof) that the
engine would repeat. Don't mix them in one image — one asset per image, always.

Generate at 512×512, we downscale. Scale anchor: **one floor tile = 32 world
pixels**, and a human body is 20px across — so a sedan is ~2×1 tiles, a big
tree canopy ~2×2, a bench ~1×½. Tell the model the tile math every time; it's
the thing image models drift on first.

---

## 1. The master style block (paste this at the top of every prompt)

> Strict top-down orthographic view, camera pointing straight down at 90
> degrees, like a satellite photo or a floor plan. NOT isometric, NOT angled,
> no horizon, no perspective, no vanishing point. Single game asset centered
> on a fully transparent background (PNG). Grounded semi-realistic military
> style: muted desaturated palette, painterly but clean-edged, no black
> outlines, no cartoon shading, no text, no watermark. Lighting is neutral
> and directly overhead — a soft ambient-occlusion shadow directly beneath
> the object only, no long directional shadows. The asset must read clearly
> at 10% size against a dark floor (#303b46). Palette anchors: floors
> #303b46 / #111a17, walls #46545f, brick #845345, wood #80623a, metal
> #788792, foliage #3b5238, accent #e8b53a.

The two failure modes to reject on sight: **isometric drift** (you see any
side/face of the object = it's at an angle, regenerate) and **baked long
shadows** (our lighting is flat; a shadow pointing a direction will fight
every other asset on screen).

## 2. Prop prompts (append one line to the master block per image)

**Vegetation**
- "A single large oak tree seen from directly above: a roughly circular
  leafy canopy 2 tiles (64px) across with natural edge irregularity, small
  glimpse of trunk shadow at the center, two or three subtle branch gaps."
- "A single pine tree from directly above: tighter, darker, more pointed
  ring structure than an oak, 1.5 tiles across."
- "A dead bare tree from directly above: grey-brown branching skeleton, no
  leaves, 1.5 tiles across."
- "A low bush from directly above, roughly oval, 1 tile across, slightly
  lighter green than the tree canopy anchor."
- "A cluster of three small shrubs from directly above, together under 1.5
  tiles across."

**Street furniture**
- "A public park bench from directly above: wooden slats, two metal end
  frames, 1 tile long by half a tile deep."
- "A concrete jersey barrier from directly above, 1.5 tiles long."
- "A dumpster from directly above, closed lid, 1.5 × 1 tiles, weathered."
- "A sandbag emplacement from directly above: a low C-shaped ring of stacked
  sandbags, 2 tiles across, open side facing down-screen."

**Vehicles** (all exactly 2 tiles long × 1 tile wide, nose pointing RIGHT —
the engine rotates them; consistency matters more than variety of pose)
- "A civilian sedan from directly above: roof, hood and trunk clearly
  readable, muted grey-blue paint, slightly weathered."
- "A civilian pickup truck from directly above: cab roof plus open cargo bed."
- "An SUV from directly above: longer roof, roof rails."
- "A police cruiser from directly above: black-and-white livery, lightbar
  across the roof midline."
- "A burned-out car wreck from directly above: scorched black-brown shell,
  no glass, rust edges."
- "An up-armored military truck (Humvee-like) from directly above: flat
  sand-tan roof, turret ring at center rear of the roof." *(2.5 × 1.25 tiles)*

**Furniture (interior props)**
- "A rectangular wooden dining table from directly above, 1.5 × 1 tiles."
- "An office desk from directly above with a monitor and keyboard, 1.5 × 0.75."
- "A sofa from directly above: seat cushions and back cushions readable,
  1.5 × 0.75 tiles."
- "A double bed from directly above: pillows at the up-screen end, 1 × 1.5."
- "A bookshelf from directly above: narrow, 1 × 0.4 tiles — mostly its top
  face with a hint of shelved spines at the edges."
- "An overturned wooden table from directly above: tabletop standing on its
  edge reading as a barricade line, legs toward down-screen, 1.5 tiles long."

## 3. Seamless ground textures (different contract — no transparency)

> Seamless tileable texture, strict top-down, 512×512 representing a 4×4
> block of 32px floor tiles. Must tile perfectly on all four edges. Muted,
> low-contrast, no text, no obvious repeating landmark features. Neutral
> overhead light, no shadows.

- "Cracked asphalt with faint faded lane paint." (streets)
- "Packed dirt with sparse dry grass." (courtyards, fields)
- "Poured concrete floor, lightly stained." (interiors)
- "Flat tar-and-gravel roof with an AC unit conspicuously ABSENT — plain
  field only." (future multi-story roofs)
- "Sand with light wind ripples." (the beach maps)

## 4. Integration contract (why the constraints above exist)

- The engine is a single self-contained HTML file: art ships as data-URI PNGs
  inlined next to the SVG sprite block, blitted like sprites. Every image is
  payload — keep props under ~30KB after downscale, which muted flat-lit art
  compresses to easily.
- Props get one raster per (image, rotation-0) and the engine rotates at
  draw time — which is why every vehicle must be authored nose-RIGHT (+X),
  the same contract as the character sprites.
- The readability rim from v0.17 can wrap props too; art does not need its
  own outline. That's why "no black outlines" is in the master block.
- Trees generated here would REPLACE the flat green squares of the `t` tile:
  the engine draws the trunk tile as collision, the canopy PNG on top at 2×2.
  Canopy transparency at the edges is what makes the forest read as forest.
- Ground textures are future work (the engine currently draws flat-color
  tiles) — generate them last, or first if the look is the point.

## 5. Batch order (if generating with limited credits)

1. Oak + pine + bush (THE TREELINE stops being green squares)
2. Sedan + pickup + wreck (streets stop being @% pairs)
3. Table + overturned table + sofa + bed (THE STANDOFF interiors)
4. Bench, barriers, sandbags (map dressing)
5. Ground textures (engine work needed first — see §4)

## CHANGELOG
- v1.0 (2026-08-14): Written against build v0.29 for Sam's Codex image-generation pass.
