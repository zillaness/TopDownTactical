---
file: ART_PROMPT_environment_v1.1.md (top-down-tactical)
version: 1.1
author: Sam Cao
created: 2026-08-14
last_updated: 2026-08-14
description: Ready-to-paste prompts for generating top-down environment art (trees, bushes, cars, buildings, furniture, ground textures) with an image model, plus the raster-vs-vector decision, GPT-specific output mechanics, and the integration contract that makes the output usable in the engine.
ai_update: Update last_updated and bump version in frontmatter. Rename file to match. Append changelog at bottom.
---

# Environment art prompts — Top-Down Tactical

## 0. Raster or vector? Raster, with one exception

**Raster (PNG) for everything in this document.** Three reasons, in order of
how much they matter:

1. **The engine already blits.** Sprites are drawn to a canvas every frame.
   A PNG costs one `drawImage`; an SVG costs a parse, a rasterize, and a
   cache you have to manage yourself. At 60fps with 40 props on screen the
   raster path is simply the cheaper one.
2. **Image models emit raster natively.** GPT does not produce clean vector.
   Anything "vector" you get back is either a traced approximation (which
   loses exactly the organic edge quality you want on foliage) or hand-drawn
   paths that defeat the point of generating them.
3. **Organic edges are the whole job.** A tree canopy reads as a tree because
   of ragged alpha at its perimeter. Vector wants clean closed paths; that
   fights the asset.

**The exception: the human sprites stay vector.** They already are —
`buildHumans` generates SVG in-code, because they need the `#TEAMCOLOR`
swap, the handedness Y-flip, and per-frame recolor. Do not replace those.
This document is strictly about the world *around* the operators.

**Payload budget, measured honestly.** Assets author at 2× game size
(1 tile = 64px in the PNG, so a sedan ships as 128×64). At that size, muted
flat-lit art compresses to roughly 6–14KB per prop; base64 inlining adds
~37%. Twenty-five props lands around 250–400KB, against a current file of
493KB. So the finished build roughly doubles, to under a megabyte. That is
fine for a local single-file game. It would not be fine at 4× — don't.

---

## 1. GPT output mechanics (read before generating anything)

**Transparency is the thing that goes wrong.** Two paths:

- **Via the API** (`gpt-image-1`): pass `background: "transparent"` with
  `output_format: "png"`. This works properly and is the preferred route.
- **Via the ChatGPT UI**: transparency is unreliable — you often get a white
  background, or worse, a *painted* checkerboard pattern that looks like
  transparency but is opaque pixels. **Workaround: ask for the asset on a
  flat solid magenta `#FF00FF` background**, then key the magenta out. No
  natural asset in this palette contains magenta, so the key is clean. The
  prompt block below includes this instruction.

**Sizes.** Generate at GPT's native `1024x1024` for most props; use
`1536x1024` (landscape) for vehicles and anything wider than it is tall.
Downscale to final size yourself — do not ask the model for 128×64, it
will produce a blurry mess.

**One asset per image, always.** Do not ask for a "sheet of five trees."
You will get five trees at inconsistent scales, lighting, and angles, and
you cannot fix that after the fact. One object, centered, per generation.

---

## 2. The master style block (paste this at the top of every prompt)

> Strict top-down orthographic view, camera pointing straight down at 90
> degrees, like a satellite photo or a floor plan. NOT isometric, NOT
> angled, no horizon, no perspective, no vanishing point. A single game
> asset, centered, filling most of the frame. Background is FLAT SOLID
> MAGENTA #FF00FF with no texture, no gradient, and no shadow falling on
> it — I will key this color out, so no part of the asset itself may be
> magenta or pink. Grounded semi-realistic military-sim style: muted
> desaturated palette, painterly but clean-edged, no black outlines, no
> cartoon shading, no cel shading, no text, no watermark, no labels.
> Lighting is neutral and directly overhead — a soft contact shadow
> directly beneath the object only, no long directional shadows. The asset
> must read clearly at 10% size against a dark floor. Palette anchors:
> floors #303b46 / #111a17, walls #46545f, brick #845345, wood #80623a,
> metal #788792, foliage #3b5238, accent #e8b53a.

**Reject on sight, regenerate:**
- **Isometric drift** — if you can see any *side* or *face* of the object,
  the camera is angled. This is the single most common failure.
- **Baked long shadows** — our lighting is flat. A shadow pointing a
  direction will fight every other asset on screen.
- **Magenta bleed** — pink fringing on the asset edge means the key will
  leave a halo. Ask for "harder edge against the background."

---

## 3. Props — append one line to the master block per image

Scale anchor stated every time, because scale is what image models drift on
first: **one floor tile = 32 world pixels; author at 2×, so one tile = 64px
in the delivered PNG. A human body is 20 world pixels across.**

### Vegetation
- "A single large oak tree seen from directly above: a roughly circular
  leafy canopy 2 tiles across with natural edge irregularity, a small
  glimpse of trunk shadow at the center, two or three subtle branch gaps."
- "A single pine tree from directly above: tighter, darker, more pointed
  radial ring structure than an oak, 1.5 tiles across."
- "A dead bare tree from directly above: grey-brown branching skeleton, no
  leaves, 1.5 tiles across."
- "A palm tree from directly above: 6–8 long radiating fronds from a
  central crown, 1.5 tiles across." *(for the desert/Iraq maps)*
- "A low bush from directly above, roughly oval, 1 tile across, slightly
  lighter and yellower green than the foliage anchor."
- "A cluster of three small shrubs from directly above, together under 1.5
  tiles across."
- "A hedge segment from directly above: a straight dense green rectangle
  2 tiles long by half a tile deep, with irregular leafy edges."

### Street furniture
- "A public park bench from directly above: wooden slats, two metal end
  frames, 1 tile long by half a tile deep."
- "A concrete jersey barrier from directly above, 1.5 tiles long."
- "A dumpster from directly above, closed lid, 1.5 × 1 tiles, weathered."
- "A sandbag emplacement from directly above: a low C-shaped ring of
  stacked sandbags, 2 tiles across, open side facing down-screen."
- "A stack of wooden shipping pallets from directly above, 1 × 1 tile."
- "Three steel oil drums clustered from directly above, together 1.5 tiles
  across, rust-streaked."
- "A street light from directly above: a small round base with a thin arm
  extending 1 tile to the right ending in a rectangular lamp head."

### Vehicles
All exactly **nose pointing RIGHT** — the engine rotates them, and
consistency matters more than variety of pose. Use `1536x1024`.

- "A civilian sedan from directly above: roof, hood and trunk clearly
  readable, muted grey-blue paint, slightly weathered." *(2 × 1 tiles)*
- "A second civilian sedan from directly above, faded red paint, older
  boxier body shape than a modern car." *(2 × 1)*
- "A compact hatchback from directly above, dull white, small." *(1.5 × 1)*
- "A civilian pickup truck from directly above: cab roof plus an open
  cargo bed with a visible bed floor." *(2.25 × 1)*
- "A white panel van from directly above: one long flat unbroken roof,
  blank sides, no windows behind the cab." *(2.5 × 1.25)*
- "An SUV from directly above: longer roof, roof rails, dark green."
  *(2.25 × 1.15)*
- "A yellow taxi from directly above with a small roof sign." *(2 × 1)*
- "A police cruiser from directly above: black-and-white livery, lightbar
  across the roof midline." *(2 × 1)*
- "A burned-out car wreck from directly above: scorched black-brown shell,
  no glass, rust edges, one door missing." *(2 × 1)*
- "An overturned car from directly above showing its undercarriage: axles,
  exhaust line, and fuel tank readable." *(2 × 1)*
- "A flatbed box truck from directly above: cab plus a long rectangular
  cargo box roof." *(3.5 × 1.5)*
- "An up-armored military truck, Humvee-like, from directly above: flat
  sand-tan roof, turret ring at the center rear of the roof." *(2.5 × 1.25)*

### Buildings
The engine draws enterable buildings as **tiles** — you see the interior
floor and wall tops, never a roof. So a "building asset" only makes sense
for two cases:

**(a) Roof scatter props** — for the non-enterable background structures on
urban maps, whose roofs you *do* see from above. Generate these as props and
scatter them over a tileable roof texture (§4). This is the flexible
approach and the one to do first.
- "A rooftop HVAC air-conditioning unit from directly above: a grey ribbed
  rectangular box with a circular fan grille on top, 1.5 × 1 tiles."
- "A rooftop water tank from directly above: a circular tank 1.5 tiles
  across on a square frame base."
- "A rooftop stairwell bulkhead from directly above: a small windowless
  boxy structure with a single door on one side, 2 × 1.5 tiles."
- "A roof vent pipe cluster from directly above: three short metal pipes of
  different heights, together under 1 tile."
- "A satellite dish on a roof mount from directly above, 1 tile across,
  dish face angled slightly so its oval is readable."
- "A rooftop parapet corner section from directly above: a low wall running
  2 tiles along one edge and 2 tiles along the other, forming an L."

**(b) Complete small structures** — outbuildings with fixed small footprints,
where one baked asset is simpler than tiling.
- "A small garden shed from directly above: a simple pitched roof reading as
  two sloped rectangles meeting at a center ridge line, 2 × 1.5 tiles."
- "A detached one-car garage from directly above: flat gravel roof, 3 × 2.5
  tiles, one visible roll-up door edge on the short side."
- "A market stall from directly above: a striped fabric awning, 2 × 2 tiles,
  the stripes running across the short axis."
- "A guard shack from directly above: tiny flat-roofed square booth, 1.5 ×
  1.5 tiles, corrugated metal roof."
- "A concrete pillbox from directly above: thick square walls with a narrow
  firing slit visible on one face, 2 × 2 tiles."

### Furniture (interior props)
- "A rectangular wooden dining table from directly above, 1.5 × 1 tiles."
- "Four wooden dining chairs from directly above, one per image, each half
  a tile square, seat and back rail readable."
- "An office desk from directly above with a monitor and keyboard,
  1.5 × 0.75 tiles."
- "A sofa from directly above: seat cushions and back cushions clearly
  separated, 1.5 × 0.75 tiles."
- "An armchair from directly above, 0.75 × 0.75 tiles."
- "A double bed from directly above: pillows at the up-screen end,
  1 × 1.5 tiles."
- "A single bed from directly above, 0.75 × 1.5 tiles."
- "A bookshelf from directly above: narrow, 1 × 0.4 tiles — mostly its top
  face with a hint of shelved spines along the edges."
- "A kitchen counter run from directly above: 2 × 0.75 tiles, with a sink
  basin and a faucet at one end."
- "A refrigerator from directly above: plain rounded-rectangle white top,
  0.75 × 0.75 tiles."
- "A wooden wardrobe from directly above, 1.25 × 0.6 tiles."
- "A television on a low stand from directly above, 1 × 0.4 tiles."
- "A floor rug from directly above: a worn patterned rectangle, 2 × 1.5
  tiles, low contrast so it never reads as an obstacle."
- "An overturned wooden table from directly above: the tabletop standing on
  its edge, reading as a barricade line, legs toward down-screen, 1.5 tiles
  long."
- "A toppled bookshelf from directly above with books scattered around it,
  1.5 × 1 tiles."

---

## 4. Seamless ground textures (different contract — no transparency)

> Seamless tileable texture, strict top-down, 1024×1024 representing an 8×8
> block of 32px floor tiles. Must tile perfectly on all four edges with no
> visible seam. Muted, low-contrast, no text, no obvious repeating landmark
> feature that would give away the tiling. Neutral overhead light, no
> shadows, no vignette. Fills the entire frame edge to edge — no border, no
> background, no transparency.

- "Cracked asphalt with faint faded lane paint." (streets)
- "Packed dirt with sparse dry grass." (courtyards, fields)
- "Poured concrete floor, lightly stained." (interiors)
- "Worn hardwood floorboards running horizontally." (house interiors)
- "Flat tar-and-gravel roof, plain field only, no equipment." (roofs — the
  scatter props from §3 go on top of this)
- "Sand with light wind ripples." (desert maps)
- "Forest floor: dark soil with scattered leaf litter and pine needles."

---

## 5. Integration contract (why the constraints above exist)

- The engine is a single self-contained HTML file. Art ships as data-URI
  PNGs inlined next to the SVG sprite block and blitted like sprites. Every
  image is payload — see the budget math in §0.
- Props get one raster at rotation 0 and the engine rotates at draw time.
  That is why every vehicle must be authored nose-RIGHT (+X): it is the same
  contract the character sprites already follow.
- The readability rim (dilate + flood filter, added v0.17) can wrap props
  too, so art does not need its own outline. That is why "no black outlines"
  is in the master block.
- Trees replace the flat green squares of the `t` tile: the engine keeps the
  trunk tile as collision and draws the canopy PNG on top at 2×2, so canopy
  edge transparency is what makes a forest read as a forest.
- Ground textures need engine work first (it currently fills flat-color
  tiles). Generate them last — or first, if the look is the whole point.
- Interior furniture is currently decoration, not collision. If a piece
  should block movement or bullets it needs a tile glyph too; the overturned
  table and the pillbox are the obvious candidates.

---

## 6. Batch order (if generating with limited credits)

1. **Oak, pine, bush, hedge** — THE TREELINE stops being green squares.
2. **Sedan ×2, pickup, wreck** — streets stop being `@%` pairs. Biggest
   visual return per asset on the urban maps.
3. **Table, overturned table, sofa, bed, counter** — THE STANDOFF and the
   house-layout variants get interiors.
4. **Bench, jersey barrier, sandbags, drums, dumpster** — map dressing.
5. **Roof scatter props** — only matters once background buildings read as
   buildings.
6. **Ground textures** — engine work needed first, see §5.

---

## CHANGELOG
- v1.0 (2026-08-14): Written against build v0.29 for Sam's Codex image-generation pass.
- v1.1 (2026-08-14): Answered raster-vs-vector explicitly with payload math (§0); added GPT-specific output mechanics including the magenta-key workaround for unreliable UI transparency (§1); added the buildings section Sam asked for, split into roof scatter props and complete small structures (§3); expanded vehicles from 6 to 12 and furniture from 6 to 15; added palm, hedge, and forest-floor entries; native GPT generation sizes replace the 512px guidance; authoring scale set to 2× game size.
