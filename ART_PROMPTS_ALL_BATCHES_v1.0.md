---
file: ART_PROMPTS_ALL_BATCHES_v1.0.md (top-down-tactical)
version: 1.0
author: Sam Cao
created: 2026-08-15
last_updated: 2026-08-15
description: Every remaining environment-art prompt, each one fully self-contained so batches can be generated in parallel sessions that share no context. Companion to ART_PROMPT_environment_v1.2.md, which holds the reasoning; this file holds only the paste-ready text.
ai_update: Update last_updated and bump version in frontmatter. Rename file to match. Append changelog at bottom. Strike through assets as they are generated and integrated.
---

# Every prompt, ready to paste — Top-Down Tactical

**Why these look repetitive:** each prompt below is COMPLETE on its own. The
style contract is repeated in every single one, because a parallel session
shares no context with any other. Open a tab, paste one block, save the result
under the filename given. Nothing needs to be pasted first.

## Rules that apply to all of them

1. **One asset per generation.** Never ask for a sheet of several. You will get
   inconsistent scale, lighting and camera angle, and none of it is fixable
   afterwards.
2. **Reject and regenerate on two failures:** any visible *side face* of the
   object (the camera drifted off vertical — the most common failure by far),
   and any long directional shadow (our lighting is flat; a shadow pointing
   somewhere will fight every other asset on screen).
3. **Transparency.** Via the API, `gpt-image-1` with `background: "transparent"`
   works properly. Via the ChatGPT UI it is unreliable, which is why every
   prompt asks for a flat magenta #FF00FF field to key out instead. If you get
   pink fringing on the edges, add "harder edge against the background".
4. **Do not downscale.** Send me whatever the model returns at full size. I do
   the keying, the resize and the palette quantisation, the same way batch 1
   was processed.
5. **Filenames matter** — they map to the keys the engine uses. Use exactly the
   name given with each prompt.

**Scale contract, already baked into every prompt below:** one floor tile = 32
world pixels, a human body is 20 world pixels across, and assets are authored
at 2x, so one tile = 64 pixels in the delivered PNG.

---

# BATCH 2 — VEHICLES

Highest return per asset in the game. DOWNTOWN EXCHANGE is a lane of cars, RAMADI ROW has you crossing at the cars, BROKEN ARROW is an ambushed convoy — all three are `@` and `%` character pairs today. EVERY vehicle must point NOSE RIGHT; the engine rotates them at draw time and consistency matters far more than pose variety.

**12 assets.** All independent — generate them in parallel.

### `sedan_grey` &nbsp;·&nbsp; save as `sedan_grey.png` &nbsp;·&nbsp; generate at 1536x1024

```
Strict 90-degree top-down orthographic game asset, camera pointing straight down at the ground — NOT isometric, NOT angled, no perspective, no horizon, no vanishing point, no visible side faces of the object. One single object, centered, filling most of the frame, isolated on a FLAT SOLID MAGENTA #FF00FF field with no texture, no gradient and no shadow falling on the field, and no magenta or pink anywhere in the object itself — I will key this colour out. Grounded semi-realistic military-sim style: muted desaturated palette, painterly but clean-edged, no black outline, no cartoon or cel shading, no text, no labels, no watermark. Neutral overhead lighting with a soft contact shadow directly beneath the object only, never a long directional shadow. The asset must still read clearly at 10% size against a dark floor. Palette anchors: floor #303b46, wall #46545f, brick #845345, wood #80623a, metal #788792, foliage #3b5238, accent #e8b53a.

A civilian four-door sedan seen from directly above, nose pointing RIGHT: roof, hood and trunk clearly distinguishable, windscreen and rear window readable as darker glass, muted grey-blue paint, slightly weathered.

Footprint: 2 tiles wide by 1 tiles deep, where one tile is 32 world pixels and a human body is 20 world pixels across.
```

### `sedan_red` &nbsp;·&nbsp; save as `sedan_red.png` &nbsp;·&nbsp; generate at 1536x1024

```
Strict 90-degree top-down orthographic game asset, camera pointing straight down at the ground — NOT isometric, NOT angled, no perspective, no horizon, no vanishing point, no visible side faces of the object. One single object, centered, filling most of the frame, isolated on a FLAT SOLID MAGENTA #FF00FF field with no texture, no gradient and no shadow falling on the field, and no magenta or pink anywhere in the object itself — I will key this colour out. Grounded semi-realistic military-sim style: muted desaturated palette, painterly but clean-edged, no black outline, no cartoon or cel shading, no text, no labels, no watermark. Neutral overhead lighting with a soft contact shadow directly beneath the object only, never a long directional shadow. The asset must still read clearly at 10% size against a dark floor. Palette anchors: floor #303b46, wall #46545f, brick #845345, wood #80623a, metal #788792, foliage #3b5238, accent #e8b53a.

A civilian four-door sedan seen from directly above, nose pointing RIGHT: an older boxier body than a modern car, faded red paint, dull chrome trim, some rust at the edges.

Footprint: 2 tiles wide by 1 tiles deep, where one tile is 32 world pixels and a human body is 20 world pixels across.
```

### `hatchback` &nbsp;·&nbsp; save as `hatchback.png` &nbsp;·&nbsp; generate at 1536x1024

```
Strict 90-degree top-down orthographic game asset, camera pointing straight down at the ground — NOT isometric, NOT angled, no perspective, no horizon, no vanishing point, no visible side faces of the object. One single object, centered, filling most of the frame, isolated on a FLAT SOLID MAGENTA #FF00FF field with no texture, no gradient and no shadow falling on the field, and no magenta or pink anywhere in the object itself — I will key this colour out. Grounded semi-realistic military-sim style: muted desaturated palette, painterly but clean-edged, no black outline, no cartoon or cel shading, no text, no labels, no watermark. Neutral overhead lighting with a soft contact shadow directly beneath the object only, never a long directional shadow. The asset must still read clearly at 10% size against a dark floor. Palette anchors: floor #303b46, wall #46545f, brick #845345, wood #80623a, metal #788792, foliage #3b5238, accent #e8b53a.

A small civilian hatchback seen from directly above, nose pointing RIGHT: short body, steeply raked rear, dull white paint.

Footprint: 1.5 tiles wide by 1 tiles deep, where one tile is 32 world pixels and a human body is 20 world pixels across.
```

### `pickup` &nbsp;·&nbsp; save as `pickup.png` &nbsp;·&nbsp; generate at 1536x1024

```
Strict 90-degree top-down orthographic game asset, camera pointing straight down at the ground — NOT isometric, NOT angled, no perspective, no horizon, no vanishing point, no visible side faces of the object. One single object, centered, filling most of the frame, isolated on a FLAT SOLID MAGENTA #FF00FF field with no texture, no gradient and no shadow falling on the field, and no magenta or pink anywhere in the object itself — I will key this colour out. Grounded semi-realistic military-sim style: muted desaturated palette, painterly but clean-edged, no black outline, no cartoon or cel shading, no text, no labels, no watermark. Neutral overhead lighting with a soft contact shadow directly beneath the object only, never a long directional shadow. The asset must still read clearly at 10% size against a dark floor. Palette anchors: floor #303b46, wall #46545f, brick #845345, wood #80623a, metal #788792, foliage #3b5238, accent #e8b53a.

A civilian pickup truck seen from directly above, nose pointing RIGHT: cab roof at the front, then an open cargo bed with a visible ribbed bed floor and side walls.

Footprint: 2.25 tiles wide by 1 tiles deep, where one tile is 32 world pixels and a human body is 20 world pixels across.
```

### `panel_van` &nbsp;·&nbsp; save as `panel_van.png` &nbsp;·&nbsp; generate at 1536x1024

```
Strict 90-degree top-down orthographic game asset, camera pointing straight down at the ground — NOT isometric, NOT angled, no perspective, no horizon, no vanishing point, no visible side faces of the object. One single object, centered, filling most of the frame, isolated on a FLAT SOLID MAGENTA #FF00FF field with no texture, no gradient and no shadow falling on the field, and no magenta or pink anywhere in the object itself — I will key this colour out. Grounded semi-realistic military-sim style: muted desaturated palette, painterly but clean-edged, no black outline, no cartoon or cel shading, no text, no labels, no watermark. Neutral overhead lighting with a soft contact shadow directly beneath the object only, never a long directional shadow. The asset must still read clearly at 10% size against a dark floor. Palette anchors: floor #303b46, wall #46545f, brick #845345, wood #80623a, metal #788792, foliage #3b5238, accent #e8b53a.

A white panel van seen from directly above, nose pointing RIGHT: a short cab roof and then one long flat unbroken cargo roof, blank sides, no windows behind the cab.

Footprint: 2.5 tiles wide by 1.25 tiles deep, where one tile is 32 world pixels and a human body is 20 world pixels across.
```

### `suv` &nbsp;·&nbsp; save as `suv.png` &nbsp;·&nbsp; generate at 1536x1024

```
Strict 90-degree top-down orthographic game asset, camera pointing straight down at the ground — NOT isometric, NOT angled, no perspective, no horizon, no vanishing point, no visible side faces of the object. One single object, centered, filling most of the frame, isolated on a FLAT SOLID MAGENTA #FF00FF field with no texture, no gradient and no shadow falling on the field, and no magenta or pink anywhere in the object itself — I will key this colour out. Grounded semi-realistic military-sim style: muted desaturated palette, painterly but clean-edged, no black outline, no cartoon or cel shading, no text, no labels, no watermark. Neutral overhead lighting with a soft contact shadow directly beneath the object only, never a long directional shadow. The asset must still read clearly at 10% size against a dark floor. Palette anchors: floor #303b46, wall #46545f, brick #845345, wood #80623a, metal #788792, foliage #3b5238, accent #e8b53a.

A civilian SUV seen from directly above, nose pointing RIGHT: long roof with roof rails running front to back, dark green paint.

Footprint: 2.25 tiles wide by 1.15 tiles deep, where one tile is 32 world pixels and a human body is 20 world pixels across.
```

### `taxi` &nbsp;·&nbsp; save as `taxi.png` &nbsp;·&nbsp; generate at 1536x1024

```
Strict 90-degree top-down orthographic game asset, camera pointing straight down at the ground — NOT isometric, NOT angled, no perspective, no horizon, no vanishing point, no visible side faces of the object. One single object, centered, filling most of the frame, isolated on a FLAT SOLID MAGENTA #FF00FF field with no texture, no gradient and no shadow falling on the field, and no magenta or pink anywhere in the object itself — I will key this colour out. Grounded semi-realistic military-sim style: muted desaturated palette, painterly but clean-edged, no black outline, no cartoon or cel shading, no text, no labels, no watermark. Neutral overhead lighting with a soft contact shadow directly beneath the object only, never a long directional shadow. The asset must still read clearly at 10% size against a dark floor. Palette anchors: floor #303b46, wall #46545f, brick #845345, wood #80623a, metal #788792, foliage #3b5238, accent #e8b53a.

A yellow city taxi seen from directly above, nose pointing RIGHT: a small rectangular roof sign near the front of the roof, slightly scuffed paint.

Footprint: 2 tiles wide by 1 tiles deep, where one tile is 32 world pixels and a human body is 20 world pixels across.
```

### `police_cruiser` &nbsp;·&nbsp; save as `police_cruiser.png` &nbsp;·&nbsp; generate at 1536x1024

```
Strict 90-degree top-down orthographic game asset, camera pointing straight down at the ground — NOT isometric, NOT angled, no perspective, no horizon, no vanishing point, no visible side faces of the object. One single object, centered, filling most of the frame, isolated on a FLAT SOLID MAGENTA #FF00FF field with no texture, no gradient and no shadow falling on the field, and no magenta or pink anywhere in the object itself — I will key this colour out. Grounded semi-realistic military-sim style: muted desaturated palette, painterly but clean-edged, no black outline, no cartoon or cel shading, no text, no labels, no watermark. Neutral overhead lighting with a soft contact shadow directly beneath the object only, never a long directional shadow. The asset must still read clearly at 10% size against a dark floor. Palette anchors: floor #303b46, wall #46545f, brick #845345, wood #80623a, metal #788792, foliage #3b5238, accent #e8b53a.

A police cruiser seen from directly above, nose pointing RIGHT: black-and-white livery, a lightbar mounted across the roof at the midline.

Footprint: 2 tiles wide by 1 tiles deep, where one tile is 32 world pixels and a human body is 20 world pixels across.
```

### `car_wreck` &nbsp;·&nbsp; save as `car_wreck.png` &nbsp;·&nbsp; generate at 1536x1024

```
Strict 90-degree top-down orthographic game asset, camera pointing straight down at the ground — NOT isometric, NOT angled, no perspective, no horizon, no vanishing point, no visible side faces of the object. One single object, centered, filling most of the frame, isolated on a FLAT SOLID MAGENTA #FF00FF field with no texture, no gradient and no shadow falling on the field, and no magenta or pink anywhere in the object itself — I will key this colour out. Grounded semi-realistic military-sim style: muted desaturated palette, painterly but clean-edged, no black outline, no cartoon or cel shading, no text, no labels, no watermark. Neutral overhead lighting with a soft contact shadow directly beneath the object only, never a long directional shadow. The asset must still read clearly at 10% size against a dark floor. Palette anchors: floor #303b46, wall #46545f, brick #845345, wood #80623a, metal #788792, foliage #3b5238, accent #e8b53a.

A burned-out car wreck seen from directly above, nose pointing RIGHT: scorched black-brown shell, no glass left in any opening, rusted and buckled panels, one door missing.

Footprint: 2 tiles wide by 1 tiles deep, where one tile is 32 world pixels and a human body is 20 world pixels across.
```

### `car_overturned` &nbsp;·&nbsp; save as `car_overturned.png` &nbsp;·&nbsp; generate at 1536x1024

```
Strict 90-degree top-down orthographic game asset, camera pointing straight down at the ground — NOT isometric, NOT angled, no perspective, no horizon, no vanishing point, no visible side faces of the object. One single object, centered, filling most of the frame, isolated on a FLAT SOLID MAGENTA #FF00FF field with no texture, no gradient and no shadow falling on the field, and no magenta or pink anywhere in the object itself — I will key this colour out. Grounded semi-realistic military-sim style: muted desaturated palette, painterly but clean-edged, no black outline, no cartoon or cel shading, no text, no labels, no watermark. Neutral overhead lighting with a soft contact shadow directly beneath the object only, never a long directional shadow. The asset must still read clearly at 10% size against a dark floor. Palette anchors: floor #303b46, wall #46545f, brick #845345, wood #80623a, metal #788792, foliage #3b5238, accent #e8b53a.

An overturned car seen from directly above showing its UNDERCARRIAGE: axles, differential, exhaust line and fuel tank readable, wheels pointing up at the camera, dirt and rust.

Footprint: 2 tiles wide by 1 tiles deep, where one tile is 32 world pixels and a human body is 20 world pixels across.
```

### `box_truck` &nbsp;·&nbsp; save as `box_truck.png` &nbsp;·&nbsp; generate at 1536x1024

```
Strict 90-degree top-down orthographic game asset, camera pointing straight down at the ground — NOT isometric, NOT angled, no perspective, no horizon, no vanishing point, no visible side faces of the object. One single object, centered, filling most of the frame, isolated on a FLAT SOLID MAGENTA #FF00FF field with no texture, no gradient and no shadow falling on the field, and no magenta or pink anywhere in the object itself — I will key this colour out. Grounded semi-realistic military-sim style: muted desaturated palette, painterly but clean-edged, no black outline, no cartoon or cel shading, no text, no labels, no watermark. Neutral overhead lighting with a soft contact shadow directly beneath the object only, never a long directional shadow. The asset must still read clearly at 10% size against a dark floor. Palette anchors: floor #303b46, wall #46545f, brick #845345, wood #80623a, metal #788792, foliage #3b5238, accent #e8b53a.

A flatbed box truck seen from directly above, nose pointing RIGHT: a cab roof at the front and a long plain rectangular cargo box roof behind it.

Footprint: 3.5 tiles wide by 1.5 tiles deep, where one tile is 32 world pixels and a human body is 20 world pixels across.
```

### `humvee` &nbsp;·&nbsp; save as `humvee.png` &nbsp;·&nbsp; generate at 1536x1024

```
Strict 90-degree top-down orthographic game asset, camera pointing straight down at the ground — NOT isometric, NOT angled, no perspective, no horizon, no vanishing point, no visible side faces of the object. One single object, centered, filling most of the frame, isolated on a FLAT SOLID MAGENTA #FF00FF field with no texture, no gradient and no shadow falling on the field, and no magenta or pink anywhere in the object itself — I will key this colour out. Grounded semi-realistic military-sim style: muted desaturated palette, painterly but clean-edged, no black outline, no cartoon or cel shading, no text, no labels, no watermark. Neutral overhead lighting with a soft contact shadow directly beneath the object only, never a long directional shadow. The asset must still read clearly at 10% size against a dark floor. Palette anchors: floor #303b46, wall #46545f, brick #845345, wood #80623a, metal #788792, foliage #3b5238, accent #e8b53a.

An up-armored military truck, Humvee-like, seen from directly above, nose pointing RIGHT: flat sand-tan roof, a circular turret ring at the centre rear of the roof, stowage racks at the back.

Footprint: 2.5 tiles wide by 1.25 tiles deep, where one tile is 32 world pixels and a human body is 20 world pixels across.
```

# BATCH 3 — INTERIOR FURNITURE

THE STANDOFF, THE SPLIT, THE RANCH and every house-layout variant are bare rooms right now. Furniture is decoration, not collision — except the overturned table and toppled bookshelf, which are barricades and will get tile glyphs.

**15 assets.** All independent — generate them in parallel.

### `table_dining` &nbsp;·&nbsp; save as `table_dining.png` &nbsp;·&nbsp; generate at 1024x1024

```
Strict 90-degree top-down orthographic game asset, camera pointing straight down at the ground — NOT isometric, NOT angled, no perspective, no horizon, no vanishing point, no visible side faces of the object. One single object, centered, filling most of the frame, isolated on a FLAT SOLID MAGENTA #FF00FF field with no texture, no gradient and no shadow falling on the field, and no magenta or pink anywhere in the object itself — I will key this colour out. Grounded semi-realistic military-sim style: muted desaturated palette, painterly but clean-edged, no black outline, no cartoon or cel shading, no text, no labels, no watermark. Neutral overhead lighting with a soft contact shadow directly beneath the object only, never a long directional shadow. The asset must still read clearly at 10% size against a dark floor. Palette anchors: floor #303b46, wall #46545f, brick #845345, wood #80623a, metal #788792, foliage #3b5238, accent #e8b53a.

A rectangular wooden dining table seen from directly above: plain timber top with visible grain, legs just peeking out at the four corners.

Footprint: 1.5 tiles wide by 1 tiles deep, where one tile is 32 world pixels and a human body is 20 world pixels across.
```

### `chair_dining` &nbsp;·&nbsp; save as `chair_dining.png` &nbsp;·&nbsp; generate at 1024x1024

```
Strict 90-degree top-down orthographic game asset, camera pointing straight down at the ground — NOT isometric, NOT angled, no perspective, no horizon, no vanishing point, no visible side faces of the object. One single object, centered, filling most of the frame, isolated on a FLAT SOLID MAGENTA #FF00FF field with no texture, no gradient and no shadow falling on the field, and no magenta or pink anywhere in the object itself — I will key this colour out. Grounded semi-realistic military-sim style: muted desaturated palette, painterly but clean-edged, no black outline, no cartoon or cel shading, no text, no labels, no watermark. Neutral overhead lighting with a soft contact shadow directly beneath the object only, never a long directional shadow. The asset must still read clearly at 10% size against a dark floor. Palette anchors: floor #303b46, wall #46545f, brick #845345, wood #80623a, metal #788792, foliage #3b5238, accent #e8b53a.

A single wooden dining chair seen from directly above: square seat with the back rail visible as a bar along one edge.

Footprint: 0.5 tiles wide by 0.5 tiles deep, where one tile is 32 world pixels and a human body is 20 world pixels across.
```

### `desk_office` &nbsp;·&nbsp; save as `desk_office.png` &nbsp;·&nbsp; generate at 1024x1024

```
Strict 90-degree top-down orthographic game asset, camera pointing straight down at the ground — NOT isometric, NOT angled, no perspective, no horizon, no vanishing point, no visible side faces of the object. One single object, centered, filling most of the frame, isolated on a FLAT SOLID MAGENTA #FF00FF field with no texture, no gradient and no shadow falling on the field, and no magenta or pink anywhere in the object itself — I will key this colour out. Grounded semi-realistic military-sim style: muted desaturated palette, painterly but clean-edged, no black outline, no cartoon or cel shading, no text, no labels, no watermark. Neutral overhead lighting with a soft contact shadow directly beneath the object only, never a long directional shadow. The asset must still read clearly at 10% size against a dark floor. Palette anchors: floor #303b46, wall #46545f, brick #845345, wood #80623a, metal #788792, foliage #3b5238, accent #e8b53a.

An office desk seen from directly above: dark laminate top with a flat monitor seen from above at the back edge, a keyboard in front of it, a scatter of papers.

Footprint: 1.5 tiles wide by 0.75 tiles deep, where one tile is 32 world pixels and a human body is 20 world pixels across.
```

### `sofa` &nbsp;·&nbsp; save as `sofa.png` &nbsp;·&nbsp; generate at 1024x1024

```
Strict 90-degree top-down orthographic game asset, camera pointing straight down at the ground — NOT isometric, NOT angled, no perspective, no horizon, no vanishing point, no visible side faces of the object. One single object, centered, filling most of the frame, isolated on a FLAT SOLID MAGENTA #FF00FF field with no texture, no gradient and no shadow falling on the field, and no magenta or pink anywhere in the object itself — I will key this colour out. Grounded semi-realistic military-sim style: muted desaturated palette, painterly but clean-edged, no black outline, no cartoon or cel shading, no text, no labels, no watermark. Neutral overhead lighting with a soft contact shadow directly beneath the object only, never a long directional shadow. The asset must still read clearly at 10% size against a dark floor. Palette anchors: floor #303b46, wall #46545f, brick #845345, wood #80623a, metal #788792, foliage #3b5238, accent #e8b53a.

A three-seat sofa seen from directly above: seat cushions and back cushions clearly separated, arms readable down each short end, muted fabric.

Footprint: 1.5 tiles wide by 0.75 tiles deep, where one tile is 32 world pixels and a human body is 20 world pixels across.
```

### `armchair` &nbsp;·&nbsp; save as `armchair.png` &nbsp;·&nbsp; generate at 1024x1024

```
Strict 90-degree top-down orthographic game asset, camera pointing straight down at the ground — NOT isometric, NOT angled, no perspective, no horizon, no vanishing point, no visible side faces of the object. One single object, centered, filling most of the frame, isolated on a FLAT SOLID MAGENTA #FF00FF field with no texture, no gradient and no shadow falling on the field, and no magenta or pink anywhere in the object itself — I will key this colour out. Grounded semi-realistic military-sim style: muted desaturated palette, painterly but clean-edged, no black outline, no cartoon or cel shading, no text, no labels, no watermark. Neutral overhead lighting with a soft contact shadow directly beneath the object only, never a long directional shadow. The asset must still read clearly at 10% size against a dark floor. Palette anchors: floor #303b46, wall #46545f, brick #845345, wood #80623a, metal #788792, foliage #3b5238, accent #e8b53a.

A single armchair seen from directly above: one seat cushion, a back cushion, two arms, matching the sofa's fabric.

Footprint: 0.75 tiles wide by 0.75 tiles deep, where one tile is 32 world pixels and a human body is 20 world pixels across.
```

### `bed_double` &nbsp;·&nbsp; save as `bed_double.png` &nbsp;·&nbsp; generate at 1024x1024

```
Strict 90-degree top-down orthographic game asset, camera pointing straight down at the ground — NOT isometric, NOT angled, no perspective, no horizon, no vanishing point, no visible side faces of the object. One single object, centered, filling most of the frame, isolated on a FLAT SOLID MAGENTA #FF00FF field with no texture, no gradient and no shadow falling on the field, and no magenta or pink anywhere in the object itself — I will key this colour out. Grounded semi-realistic military-sim style: muted desaturated palette, painterly but clean-edged, no black outline, no cartoon or cel shading, no text, no labels, no watermark. Neutral overhead lighting with a soft contact shadow directly beneath the object only, never a long directional shadow. The asset must still read clearly at 10% size against a dark floor. Palette anchors: floor #303b46, wall #46545f, brick #845345, wood #80623a, metal #788792, foliage #3b5238, accent #e8b53a.

A double bed seen from directly above: two pillows at the UP-SCREEN end, a duvet covering the rest, muted bedding.

Footprint: 1 tiles wide by 1.5 tiles deep, where one tile is 32 world pixels and a human body is 20 world pixels across.
```

### `bed_single` &nbsp;·&nbsp; save as `bed_single.png` &nbsp;·&nbsp; generate at 1024x1024

```
Strict 90-degree top-down orthographic game asset, camera pointing straight down at the ground — NOT isometric, NOT angled, no perspective, no horizon, no vanishing point, no visible side faces of the object. One single object, centered, filling most of the frame, isolated on a FLAT SOLID MAGENTA #FF00FF field with no texture, no gradient and no shadow falling on the field, and no magenta or pink anywhere in the object itself — I will key this colour out. Grounded semi-realistic military-sim style: muted desaturated palette, painterly but clean-edged, no black outline, no cartoon or cel shading, no text, no labels, no watermark. Neutral overhead lighting with a soft contact shadow directly beneath the object only, never a long directional shadow. The asset must still read clearly at 10% size against a dark floor. Palette anchors: floor #303b46, wall #46545f, brick #845345, wood #80623a, metal #788792, foliage #3b5238, accent #e8b53a.

A single bed seen from directly above: one pillow at the UP-SCREEN end, plain blanket.

Footprint: 0.75 tiles wide by 1.5 tiles deep, where one tile is 32 world pixels and a human body is 20 world pixels across.
```

### `bookshelf` &nbsp;·&nbsp; save as `bookshelf.png` &nbsp;·&nbsp; generate at 1024x1024

```
Strict 90-degree top-down orthographic game asset, camera pointing straight down at the ground — NOT isometric, NOT angled, no perspective, no horizon, no vanishing point, no visible side faces of the object. One single object, centered, filling most of the frame, isolated on a FLAT SOLID MAGENTA #FF00FF field with no texture, no gradient and no shadow falling on the field, and no magenta or pink anywhere in the object itself — I will key this colour out. Grounded semi-realistic military-sim style: muted desaturated palette, painterly but clean-edged, no black outline, no cartoon or cel shading, no text, no labels, no watermark. Neutral overhead lighting with a soft contact shadow directly beneath the object only, never a long directional shadow. The asset must still read clearly at 10% size against a dark floor. Palette anchors: floor #303b46, wall #46545f, brick #845345, wood #80623a, metal #788792, foliage #3b5238, accent #e8b53a.

A tall narrow bookshelf seen from directly above: mostly its dusty top surface, with a hint of shelved book spines visible along both long edges.

Footprint: 1 tiles wide by 0.4 tiles deep, where one tile is 32 world pixels and a human body is 20 world pixels across.
```

### `kitchen_counter` &nbsp;·&nbsp; save as `kitchen_counter.png` &nbsp;·&nbsp; generate at 1024x1024

```
Strict 90-degree top-down orthographic game asset, camera pointing straight down at the ground — NOT isometric, NOT angled, no perspective, no horizon, no vanishing point, no visible side faces of the object. One single object, centered, filling most of the frame, isolated on a FLAT SOLID MAGENTA #FF00FF field with no texture, no gradient and no shadow falling on the field, and no magenta or pink anywhere in the object itself — I will key this colour out. Grounded semi-realistic military-sim style: muted desaturated palette, painterly but clean-edged, no black outline, no cartoon or cel shading, no text, no labels, no watermark. Neutral overhead lighting with a soft contact shadow directly beneath the object only, never a long directional shadow. The asset must still read clearly at 10% size against a dark floor. Palette anchors: floor #303b46, wall #46545f, brick #845345, wood #80623a, metal #788792, foliage #3b5238, accent #e8b53a.

A kitchen counter run seen from directly above: worktop surface with an inset stainless sink basin and a faucet at one end, a cooker hob at the other.

Footprint: 2 tiles wide by 0.75 tiles deep, where one tile is 32 world pixels and a human body is 20 world pixels across.
```

### `refrigerator` &nbsp;·&nbsp; save as `refrigerator.png` &nbsp;·&nbsp; generate at 1024x1024

```
Strict 90-degree top-down orthographic game asset, camera pointing straight down at the ground — NOT isometric, NOT angled, no perspective, no horizon, no vanishing point, no visible side faces of the object. One single object, centered, filling most of the frame, isolated on a FLAT SOLID MAGENTA #FF00FF field with no texture, no gradient and no shadow falling on the field, and no magenta or pink anywhere in the object itself — I will key this colour out. Grounded semi-realistic military-sim style: muted desaturated palette, painterly but clean-edged, no black outline, no cartoon or cel shading, no text, no labels, no watermark. Neutral overhead lighting with a soft contact shadow directly beneath the object only, never a long directional shadow. The asset must still read clearly at 10% size against a dark floor. Palette anchors: floor #303b46, wall #46545f, brick #845345, wood #80623a, metal #788792, foliage #3b5238, accent #e8b53a.

A domestic refrigerator seen from directly above: a plain rounded-rectangle white top surface with a slight dust film.

Footprint: 0.75 tiles wide by 0.75 tiles deep, where one tile is 32 world pixels and a human body is 20 world pixels across.
```

### `wardrobe` &nbsp;·&nbsp; save as `wardrobe.png` &nbsp;·&nbsp; generate at 1024x1024

```
Strict 90-degree top-down orthographic game asset, camera pointing straight down at the ground — NOT isometric, NOT angled, no perspective, no horizon, no vanishing point, no visible side faces of the object. One single object, centered, filling most of the frame, isolated on a FLAT SOLID MAGENTA #FF00FF field with no texture, no gradient and no shadow falling on the field, and no magenta or pink anywhere in the object itself — I will key this colour out. Grounded semi-realistic military-sim style: muted desaturated palette, painterly but clean-edged, no black outline, no cartoon or cel shading, no text, no labels, no watermark. Neutral overhead lighting with a soft contact shadow directly beneath the object only, never a long directional shadow. The asset must still read clearly at 10% size against a dark floor. Palette anchors: floor #303b46, wall #46545f, brick #845345, wood #80623a, metal #788792, foliage #3b5238, accent #e8b53a.

A wooden wardrobe seen from directly above: plain rectangular timber top with a visible seam where the two doors meet along one long edge.

Footprint: 1.25 tiles wide by 0.6 tiles deep, where one tile is 32 world pixels and a human body is 20 world pixels across.
```

### `tv_stand` &nbsp;·&nbsp; save as `tv_stand.png` &nbsp;·&nbsp; generate at 1024x1024

```
Strict 90-degree top-down orthographic game asset, camera pointing straight down at the ground — NOT isometric, NOT angled, no perspective, no horizon, no vanishing point, no visible side faces of the object. One single object, centered, filling most of the frame, isolated on a FLAT SOLID MAGENTA #FF00FF field with no texture, no gradient and no shadow falling on the field, and no magenta or pink anywhere in the object itself — I will key this colour out. Grounded semi-realistic military-sim style: muted desaturated palette, painterly but clean-edged, no black outline, no cartoon or cel shading, no text, no labels, no watermark. Neutral overhead lighting with a soft contact shadow directly beneath the object only, never a long directional shadow. The asset must still read clearly at 10% size against a dark floor. Palette anchors: floor #303b46, wall #46545f, brick #845345, wood #80623a, metal #788792, foliage #3b5238, accent #e8b53a.

A flatscreen television on a low stand seen from directly above: the thin dark top edge of the screen and the wider stand behind it.

Footprint: 1 tiles wide by 0.4 tiles deep, where one tile is 32 world pixels and a human body is 20 world pixels across.
```

### `rug` &nbsp;·&nbsp; save as `rug.png` &nbsp;·&nbsp; generate at 1024x1024

```
Strict 90-degree top-down orthographic game asset, camera pointing straight down at the ground — NOT isometric, NOT angled, no perspective, no horizon, no vanishing point, no visible side faces of the object. One single object, centered, filling most of the frame, isolated on a FLAT SOLID MAGENTA #FF00FF field with no texture, no gradient and no shadow falling on the field, and no magenta or pink anywhere in the object itself — I will key this colour out. Grounded semi-realistic military-sim style: muted desaturated palette, painterly but clean-edged, no black outline, no cartoon or cel shading, no text, no labels, no watermark. Neutral overhead lighting with a soft contact shadow directly beneath the object only, never a long directional shadow. The asset must still read clearly at 10% size against a dark floor. Palette anchors: floor #303b46, wall #46545f, brick #845345, wood #80623a, metal #788792, foliage #3b5238, accent #e8b53a.

A worn patterned floor rug seen from directly above: faded geometric pattern, frayed edges, LOW contrast so it never reads as an obstacle.

Footprint: 2 tiles wide by 1.5 tiles deep, where one tile is 32 world pixels and a human body is 20 world pixels across.
```

### `table_overturned` &nbsp;·&nbsp; save as `table_overturned.png` &nbsp;·&nbsp; generate at 1024x1024

```
Strict 90-degree top-down orthographic game asset, camera pointing straight down at the ground — NOT isometric, NOT angled, no perspective, no horizon, no vanishing point, no visible side faces of the object. One single object, centered, filling most of the frame, isolated on a FLAT SOLID MAGENTA #FF00FF field with no texture, no gradient and no shadow falling on the field, and no magenta or pink anywhere in the object itself — I will key this colour out. Grounded semi-realistic military-sim style: muted desaturated palette, painterly but clean-edged, no black outline, no cartoon or cel shading, no text, no labels, no watermark. Neutral overhead lighting with a soft contact shadow directly beneath the object only, never a long directional shadow. The asset must still read clearly at 10% size against a dark floor. Palette anchors: floor #303b46, wall #46545f, brick #845345, wood #80623a, metal #788792, foliage #3b5238, accent #e8b53a.

An overturned wooden table seen from directly above, being used as a barricade: the tabletop is standing on its edge and reads as a solid line, with the legs sticking out toward the bottom of the frame.

Footprint: 1.5 tiles wide by 0.5 tiles deep, where one tile is 32 world pixels and a human body is 20 world pixels across.
```

### `bookshelf_toppled` &nbsp;·&nbsp; save as `bookshelf_toppled.png` &nbsp;·&nbsp; generate at 1024x1024

```
Strict 90-degree top-down orthographic game asset, camera pointing straight down at the ground — NOT isometric, NOT angled, no perspective, no horizon, no vanishing point, no visible side faces of the object. One single object, centered, filling most of the frame, isolated on a FLAT SOLID MAGENTA #FF00FF field with no texture, no gradient and no shadow falling on the field, and no magenta or pink anywhere in the object itself — I will key this colour out. Grounded semi-realistic military-sim style: muted desaturated palette, painterly but clean-edged, no black outline, no cartoon or cel shading, no text, no labels, no watermark. Neutral overhead lighting with a soft contact shadow directly beneath the object only, never a long directional shadow. The asset must still read clearly at 10% size against a dark floor. Palette anchors: floor #303b46, wall #46545f, brick #845345, wood #80623a, metal #788792, foliage #3b5238, accent #e8b53a.

A toppled bookshelf seen from directly above, lying face-down on the floor with books spilled out around it.

Footprint: 1.5 tiles wide by 1 tiles deep, where one tile is 32 world pixels and a human body is 20 world pixels across.
```

# BATCH 4 — STREET FURNITURE

Map dressing. Nice, not load-bearing — do this batch after vehicles and interiors.

**7 assets.** All independent — generate them in parallel.

### `bench` &nbsp;·&nbsp; save as `bench.png` &nbsp;·&nbsp; generate at 1024x1024

```
Strict 90-degree top-down orthographic game asset, camera pointing straight down at the ground — NOT isometric, NOT angled, no perspective, no horizon, no vanishing point, no visible side faces of the object. One single object, centered, filling most of the frame, isolated on a FLAT SOLID MAGENTA #FF00FF field with no texture, no gradient and no shadow falling on the field, and no magenta or pink anywhere in the object itself — I will key this colour out. Grounded semi-realistic military-sim style: muted desaturated palette, painterly but clean-edged, no black outline, no cartoon or cel shading, no text, no labels, no watermark. Neutral overhead lighting with a soft contact shadow directly beneath the object only, never a long directional shadow. The asset must still read clearly at 10% size against a dark floor. Palette anchors: floor #303b46, wall #46545f, brick #845345, wood #80623a, metal #788792, foliage #3b5238, accent #e8b53a.

A public park bench seen from directly above: weathered wooden slats running lengthways, two dark metal end frames.

Footprint: 1 tiles wide by 0.5 tiles deep, where one tile is 32 world pixels and a human body is 20 world pixels across.
```

### `jersey_barrier` &nbsp;·&nbsp; save as `jersey_barrier.png` &nbsp;·&nbsp; generate at 1536x1024

```
Strict 90-degree top-down orthographic game asset, camera pointing straight down at the ground — NOT isometric, NOT angled, no perspective, no horizon, no vanishing point, no visible side faces of the object. One single object, centered, filling most of the frame, isolated on a FLAT SOLID MAGENTA #FF00FF field with no texture, no gradient and no shadow falling on the field, and no magenta or pink anywhere in the object itself — I will key this colour out. Grounded semi-realistic military-sim style: muted desaturated palette, painterly but clean-edged, no black outline, no cartoon or cel shading, no text, no labels, no watermark. Neutral overhead lighting with a soft contact shadow directly beneath the object only, never a long directional shadow. The asset must still read clearly at 10% size against a dark floor. Palette anchors: floor #303b46, wall #46545f, brick #845345, wood #80623a, metal #788792, foliage #3b5238, accent #e8b53a.

A concrete jersey barrier seen from directly above: the narrow flat top face running the length of it, scuffed and stained concrete.

Footprint: 1.5 tiles wide by 0.5 tiles deep, where one tile is 32 world pixels and a human body is 20 world pixels across.
```

### `dumpster` &nbsp;·&nbsp; save as `dumpster.png` &nbsp;·&nbsp; generate at 1024x1024

```
Strict 90-degree top-down orthographic game asset, camera pointing straight down at the ground — NOT isometric, NOT angled, no perspective, no horizon, no vanishing point, no visible side faces of the object. One single object, centered, filling most of the frame, isolated on a FLAT SOLID MAGENTA #FF00FF field with no texture, no gradient and no shadow falling on the field, and no magenta or pink anywhere in the object itself — I will key this colour out. Grounded semi-realistic military-sim style: muted desaturated palette, painterly but clean-edged, no black outline, no cartoon or cel shading, no text, no labels, no watermark. Neutral overhead lighting with a soft contact shadow directly beneath the object only, never a long directional shadow. The asset must still read clearly at 10% size against a dark floor. Palette anchors: floor #303b46, wall #46545f, brick #845345, wood #80623a, metal #788792, foliage #3b5238, accent #e8b53a.

A commercial dumpster seen from directly above with its lid CLOSED: dented painted steel, weathered, a little rust at the corners.

Footprint: 1.5 tiles wide by 1 tiles deep, where one tile is 32 world pixels and a human body is 20 world pixels across.
```

### `sandbags` &nbsp;·&nbsp; save as `sandbags.png` &nbsp;·&nbsp; generate at 1024x1024

```
Strict 90-degree top-down orthographic game asset, camera pointing straight down at the ground — NOT isometric, NOT angled, no perspective, no horizon, no vanishing point, no visible side faces of the object. One single object, centered, filling most of the frame, isolated on a FLAT SOLID MAGENTA #FF00FF field with no texture, no gradient and no shadow falling on the field, and no magenta or pink anywhere in the object itself — I will key this colour out. Grounded semi-realistic military-sim style: muted desaturated palette, painterly but clean-edged, no black outline, no cartoon or cel shading, no text, no labels, no watermark. Neutral overhead lighting with a soft contact shadow directly beneath the object only, never a long directional shadow. The asset must still read clearly at 10% size against a dark floor. Palette anchors: floor #303b46, wall #46545f, brick #845345, wood #80623a, metal #788792, foliage #3b5238, accent #e8b53a.

A sandbag emplacement seen from directly above: a low C-shaped ring of stacked hessian sandbags, the open side facing the BOTTOM of the frame.

Footprint: 2 tiles wide by 2 tiles deep, where one tile is 32 world pixels and a human body is 20 world pixels across.
```

### `pallets` &nbsp;·&nbsp; save as `pallets.png` &nbsp;·&nbsp; generate at 1024x1024

```
Strict 90-degree top-down orthographic game asset, camera pointing straight down at the ground — NOT isometric, NOT angled, no perspective, no horizon, no vanishing point, no visible side faces of the object. One single object, centered, filling most of the frame, isolated on a FLAT SOLID MAGENTA #FF00FF field with no texture, no gradient and no shadow falling on the field, and no magenta or pink anywhere in the object itself — I will key this colour out. Grounded semi-realistic military-sim style: muted desaturated palette, painterly but clean-edged, no black outline, no cartoon or cel shading, no text, no labels, no watermark. Neutral overhead lighting with a soft contact shadow directly beneath the object only, never a long directional shadow. The asset must still read clearly at 10% size against a dark floor. Palette anchors: floor #303b46, wall #46545f, brick #845345, wood #80623a, metal #788792, foliage #3b5238, accent #e8b53a.

A stack of wooden shipping pallets seen from directly above: slatted top pallet with the stack edges visible beneath it.

Footprint: 1 tiles wide by 1 tiles deep, where one tile is 32 world pixels and a human body is 20 world pixels across.
```

### `oil_drums` &nbsp;·&nbsp; save as `oil_drums.png` &nbsp;·&nbsp; generate at 1024x1024

```
Strict 90-degree top-down orthographic game asset, camera pointing straight down at the ground — NOT isometric, NOT angled, no perspective, no horizon, no vanishing point, no visible side faces of the object. One single object, centered, filling most of the frame, isolated on a FLAT SOLID MAGENTA #FF00FF field with no texture, no gradient and no shadow falling on the field, and no magenta or pink anywhere in the object itself — I will key this colour out. Grounded semi-realistic military-sim style: muted desaturated palette, painterly but clean-edged, no black outline, no cartoon or cel shading, no text, no labels, no watermark. Neutral overhead lighting with a soft contact shadow directly beneath the object only, never a long directional shadow. The asset must still read clearly at 10% size against a dark floor. Palette anchors: floor #303b46, wall #46545f, brick #845345, wood #80623a, metal #788792, foliage #3b5238, accent #e8b53a.

Three steel oil drums clustered together seen from directly above: three circular lids with bung caps, rust-streaked, one lid dented.

Footprint: 1.5 tiles wide by 1.5 tiles deep, where one tile is 32 world pixels and a human body is 20 world pixels across.
```

### `street_light` &nbsp;·&nbsp; save as `street_light.png` &nbsp;·&nbsp; generate at 1536x1024

```
Strict 90-degree top-down orthographic game asset, camera pointing straight down at the ground — NOT isometric, NOT angled, no perspective, no horizon, no vanishing point, no visible side faces of the object. One single object, centered, filling most of the frame, isolated on a FLAT SOLID MAGENTA #FF00FF field with no texture, no gradient and no shadow falling on the field, and no magenta or pink anywhere in the object itself — I will key this colour out. Grounded semi-realistic military-sim style: muted desaturated palette, painterly but clean-edged, no black outline, no cartoon or cel shading, no text, no labels, no watermark. Neutral overhead lighting with a soft contact shadow directly beneath the object only, never a long directional shadow. The asset must still read clearly at 10% size against a dark floor. Palette anchors: floor #303b46, wall #46545f, brick #845345, wood #80623a, metal #788792, foliage #3b5238, accent #e8b53a.

A street light seen from directly above: a small round concrete base at the LEFT, a thin arm extending to the RIGHT, ending in a rectangular lamp head.

Footprint: 1.5 tiles wide by 0.5 tiles deep, where one tile is 32 world pixels and a human body is 20 world pixels across.
```

# BATCH 5 — ROOFS AND SMALL STRUCTURES

Two kinds here. ROOF PROPS scatter over a tileable roof texture for the non-enterable background buildings whose roofs you actually see. SMALL STRUCTURES are complete outbuildings with fixed footprints, where one baked asset beats tiling. Enterable buildings are drawn as tiles and have no roof at all — that is why there is no 'house' asset.

**11 assets.** All independent — generate them in parallel.

### `roof_hvac` &nbsp;·&nbsp; save as `roof_hvac.png` &nbsp;·&nbsp; generate at 1024x1024

```
Strict 90-degree top-down orthographic game asset, camera pointing straight down at the ground — NOT isometric, NOT angled, no perspective, no horizon, no vanishing point, no visible side faces of the object. One single object, centered, filling most of the frame, isolated on a FLAT SOLID MAGENTA #FF00FF field with no texture, no gradient and no shadow falling on the field, and no magenta or pink anywhere in the object itself — I will key this colour out. Grounded semi-realistic military-sim style: muted desaturated palette, painterly but clean-edged, no black outline, no cartoon or cel shading, no text, no labels, no watermark. Neutral overhead lighting with a soft contact shadow directly beneath the object only, never a long directional shadow. The asset must still read clearly at 10% size against a dark floor. Palette anchors: floor #303b46, wall #46545f, brick #845345, wood #80623a, metal #788792, foliage #3b5238, accent #e8b53a.

A rooftop HVAC air-conditioning unit seen from directly above: grey ribbed rectangular housing with a large circular fan grille set into the top.

Footprint: 1.5 tiles wide by 1 tiles deep, where one tile is 32 world pixels and a human body is 20 world pixels across.
```

### `roof_water_tank` &nbsp;·&nbsp; save as `roof_water_tank.png` &nbsp;·&nbsp; generate at 1024x1024

```
Strict 90-degree top-down orthographic game asset, camera pointing straight down at the ground — NOT isometric, NOT angled, no perspective, no horizon, no vanishing point, no visible side faces of the object. One single object, centered, filling most of the frame, isolated on a FLAT SOLID MAGENTA #FF00FF field with no texture, no gradient and no shadow falling on the field, and no magenta or pink anywhere in the object itself — I will key this colour out. Grounded semi-realistic military-sim style: muted desaturated palette, painterly but clean-edged, no black outline, no cartoon or cel shading, no text, no labels, no watermark. Neutral overhead lighting with a soft contact shadow directly beneath the object only, never a long directional shadow. The asset must still read clearly at 10% size against a dark floor. Palette anchors: floor #303b46, wall #46545f, brick #845345, wood #80623a, metal #788792, foliage #3b5238, accent #e8b53a.

A rooftop water tank seen from directly above: a circular tank lid on a square steel frame base, weathered.

Footprint: 1.5 tiles wide by 1.5 tiles deep, where one tile is 32 world pixels and a human body is 20 world pixels across.
```

### `roof_bulkhead` &nbsp;·&nbsp; save as `roof_bulkhead.png` &nbsp;·&nbsp; generate at 1024x1024

```
Strict 90-degree top-down orthographic game asset, camera pointing straight down at the ground — NOT isometric, NOT angled, no perspective, no horizon, no vanishing point, no visible side faces of the object. One single object, centered, filling most of the frame, isolated on a FLAT SOLID MAGENTA #FF00FF field with no texture, no gradient and no shadow falling on the field, and no magenta or pink anywhere in the object itself — I will key this colour out. Grounded semi-realistic military-sim style: muted desaturated palette, painterly but clean-edged, no black outline, no cartoon or cel shading, no text, no labels, no watermark. Neutral overhead lighting with a soft contact shadow directly beneath the object only, never a long directional shadow. The asset must still read clearly at 10% size against a dark floor. Palette anchors: floor #303b46, wall #46545f, brick #845345, wood #80623a, metal #788792, foliage #3b5238, accent #e8b53a.

A rooftop stairwell bulkhead seen from directly above: a small windowless boxy structure with a flat roof and a single door visible on one side.

Footprint: 2 tiles wide by 1.5 tiles deep, where one tile is 32 world pixels and a human body is 20 world pixels across.
```

### `roof_vents` &nbsp;·&nbsp; save as `roof_vents.png` &nbsp;·&nbsp; generate at 1024x1024

```
Strict 90-degree top-down orthographic game asset, camera pointing straight down at the ground — NOT isometric, NOT angled, no perspective, no horizon, no vanishing point, no visible side faces of the object. One single object, centered, filling most of the frame, isolated on a FLAT SOLID MAGENTA #FF00FF field with no texture, no gradient and no shadow falling on the field, and no magenta or pink anywhere in the object itself — I will key this colour out. Grounded semi-realistic military-sim style: muted desaturated palette, painterly but clean-edged, no black outline, no cartoon or cel shading, no text, no labels, no watermark. Neutral overhead lighting with a soft contact shadow directly beneath the object only, never a long directional shadow. The asset must still read clearly at 10% size against a dark floor. Palette anchors: floor #303b46, wall #46545f, brick #845345, wood #80623a, metal #788792, foliage #3b5238, accent #e8b53a.

A cluster of three rooftop vent pipes seen from directly above: three metal pipe openings of different diameters, sooty.

Footprint: 1 tiles wide by 1 tiles deep, where one tile is 32 world pixels and a human body is 20 world pixels across.
```

### `roof_dish` &nbsp;·&nbsp; save as `roof_dish.png` &nbsp;·&nbsp; generate at 1024x1024

```
Strict 90-degree top-down orthographic game asset, camera pointing straight down at the ground — NOT isometric, NOT angled, no perspective, no horizon, no vanishing point, no visible side faces of the object. One single object, centered, filling most of the frame, isolated on a FLAT SOLID MAGENTA #FF00FF field with no texture, no gradient and no shadow falling on the field, and no magenta or pink anywhere in the object itself — I will key this colour out. Grounded semi-realistic military-sim style: muted desaturated palette, painterly but clean-edged, no black outline, no cartoon or cel shading, no text, no labels, no watermark. Neutral overhead lighting with a soft contact shadow directly beneath the object only, never a long directional shadow. The asset must still read clearly at 10% size against a dark floor. Palette anchors: floor #303b46, wall #46545f, brick #845345, wood #80623a, metal #788792, foliage #3b5238, accent #e8b53a.

A satellite dish on a roof mount seen from directly above: the dish face angled just enough that its oval shape is readable, with the mounting frame beneath.

Footprint: 1 tiles wide by 1 tiles deep, where one tile is 32 world pixels and a human body is 20 world pixels across.
```

### `roof_parapet` &nbsp;·&nbsp; save as `roof_parapet.png` &nbsp;·&nbsp; generate at 1024x1024

```
Strict 90-degree top-down orthographic game asset, camera pointing straight down at the ground — NOT isometric, NOT angled, no perspective, no horizon, no vanishing point, no visible side faces of the object. One single object, centered, filling most of the frame, isolated on a FLAT SOLID MAGENTA #FF00FF field with no texture, no gradient and no shadow falling on the field, and no magenta or pink anywhere in the object itself — I will key this colour out. Grounded semi-realistic military-sim style: muted desaturated palette, painterly but clean-edged, no black outline, no cartoon or cel shading, no text, no labels, no watermark. Neutral overhead lighting with a soft contact shadow directly beneath the object only, never a long directional shadow. The asset must still read clearly at 10% size against a dark floor. Palette anchors: floor #303b46, wall #46545f, brick #845345, wood #80623a, metal #788792, foliage #3b5238, accent #e8b53a.

A rooftop parapet corner seen from directly above: a low wall running two tiles along one edge and two tiles along the adjoining edge, forming an L, with the roof surface transparent inside the L.

Footprint: 2 tiles wide by 2 tiles deep, where one tile is 32 world pixels and a human body is 20 world pixels across.
```

### `shed` &nbsp;·&nbsp; save as `shed.png` &nbsp;·&nbsp; generate at 1024x1024

```
Strict 90-degree top-down orthographic game asset, camera pointing straight down at the ground — NOT isometric, NOT angled, no perspective, no horizon, no vanishing point, no visible side faces of the object. One single object, centered, filling most of the frame, isolated on a FLAT SOLID MAGENTA #FF00FF field with no texture, no gradient and no shadow falling on the field, and no magenta or pink anywhere in the object itself — I will key this colour out. Grounded semi-realistic military-sim style: muted desaturated palette, painterly but clean-edged, no black outline, no cartoon or cel shading, no text, no labels, no watermark. Neutral overhead lighting with a soft contact shadow directly beneath the object only, never a long directional shadow. The asset must still read clearly at 10% size against a dark floor. Palette anchors: floor #303b46, wall #46545f, brick #845345, wood #80623a, metal #788792, foliage #3b5238, accent #e8b53a.

A small garden shed seen from directly above: a pitched roof reading as two sloped rectangles meeting at a central ridge line, weathered board.

Footprint: 2 tiles wide by 1.5 tiles deep, where one tile is 32 world pixels and a human body is 20 world pixels across.
```

### `garage` &nbsp;·&nbsp; save as `garage.png` &nbsp;·&nbsp; generate at 1536x1024

```
Strict 90-degree top-down orthographic game asset, camera pointing straight down at the ground — NOT isometric, NOT angled, no perspective, no horizon, no vanishing point, no visible side faces of the object. One single object, centered, filling most of the frame, isolated on a FLAT SOLID MAGENTA #FF00FF field with no texture, no gradient and no shadow falling on the field, and no magenta or pink anywhere in the object itself — I will key this colour out. Grounded semi-realistic military-sim style: muted desaturated palette, painterly but clean-edged, no black outline, no cartoon or cel shading, no text, no labels, no watermark. Neutral overhead lighting with a soft contact shadow directly beneath the object only, never a long directional shadow. The asset must still read clearly at 10% size against a dark floor. Palette anchors: floor #303b46, wall #46545f, brick #845345, wood #80623a, metal #788792, foliage #3b5238, accent #e8b53a.

A detached one-car garage seen from directly above: flat gravel-and-tar roof, with the top edge of a roll-up door visible on one short side.

Footprint: 3 tiles wide by 2.5 tiles deep, where one tile is 32 world pixels and a human body is 20 world pixels across.
```

### `market_stall` &nbsp;·&nbsp; save as `market_stall.png` &nbsp;·&nbsp; generate at 1024x1024

```
Strict 90-degree top-down orthographic game asset, camera pointing straight down at the ground — NOT isometric, NOT angled, no perspective, no horizon, no vanishing point, no visible side faces of the object. One single object, centered, filling most of the frame, isolated on a FLAT SOLID MAGENTA #FF00FF field with no texture, no gradient and no shadow falling on the field, and no magenta or pink anywhere in the object itself — I will key this colour out. Grounded semi-realistic military-sim style: muted desaturated palette, painterly but clean-edged, no black outline, no cartoon or cel shading, no text, no labels, no watermark. Neutral overhead lighting with a soft contact shadow directly beneath the object only, never a long directional shadow. The asset must still read clearly at 10% size against a dark floor. Palette anchors: floor #303b46, wall #46545f, brick #845345, wood #80623a, metal #788792, foliage #3b5238, accent #e8b53a.

A market stall seen from directly above: a striped fabric awning with the stripes running across the short axis, slightly sagging.

Footprint: 2 tiles wide by 2 tiles deep, where one tile is 32 world pixels and a human body is 20 world pixels across.
```

### `guard_shack` &nbsp;·&nbsp; save as `guard_shack.png` &nbsp;·&nbsp; generate at 1024x1024

```
Strict 90-degree top-down orthographic game asset, camera pointing straight down at the ground — NOT isometric, NOT angled, no perspective, no horizon, no vanishing point, no visible side faces of the object. One single object, centered, filling most of the frame, isolated on a FLAT SOLID MAGENTA #FF00FF field with no texture, no gradient and no shadow falling on the field, and no magenta or pink anywhere in the object itself — I will key this colour out. Grounded semi-realistic military-sim style: muted desaturated palette, painterly but clean-edged, no black outline, no cartoon or cel shading, no text, no labels, no watermark. Neutral overhead lighting with a soft contact shadow directly beneath the object only, never a long directional shadow. The asset must still read clearly at 10% size against a dark floor. Palette anchors: floor #303b46, wall #46545f, brick #845345, wood #80623a, metal #788792, foliage #3b5238, accent #e8b53a.

A guard shack seen from directly above: a tiny square booth with a flat corrugated metal roof, rust streaks.

Footprint: 1.5 tiles wide by 1.5 tiles deep, where one tile is 32 world pixels and a human body is 20 world pixels across.
```

### `pillbox` &nbsp;·&nbsp; save as `pillbox.png` &nbsp;·&nbsp; generate at 1024x1024

```
Strict 90-degree top-down orthographic game asset, camera pointing straight down at the ground — NOT isometric, NOT angled, no perspective, no horizon, no vanishing point, no visible side faces of the object. One single object, centered, filling most of the frame, isolated on a FLAT SOLID MAGENTA #FF00FF field with no texture, no gradient and no shadow falling on the field, and no magenta or pink anywhere in the object itself — I will key this colour out. Grounded semi-realistic military-sim style: muted desaturated palette, painterly but clean-edged, no black outline, no cartoon or cel shading, no text, no labels, no watermark. Neutral overhead lighting with a soft contact shadow directly beneath the object only, never a long directional shadow. The asset must still read clearly at 10% size against a dark floor. Palette anchors: floor #303b46, wall #46545f, brick #845345, wood #80623a, metal #788792, foliage #3b5238, accent #e8b53a.

A concrete pillbox seen from directly above: thick square walls around a small dark interior, with a narrow horizontal firing slit visible on one face.

Footprint: 2 tiles wide by 2 tiles deep, where one tile is 32 world pixels and a human body is 20 world pixels across.
```

# BATCH 1b — VEGETATION — THE REMAINDER

Oak, pine, bush and hedge are done and already in the game. These three finish the set.

**3 assets.** All independent — generate them in parallel.

### `dead_tree` &nbsp;·&nbsp; save as `dead_tree.png` &nbsp;·&nbsp; generate at 1024x1024

```
Strict 90-degree top-down orthographic game asset, camera pointing straight down at the ground — NOT isometric, NOT angled, no perspective, no horizon, no vanishing point, no visible side faces of the object. One single object, centered, filling most of the frame, isolated on a FLAT SOLID MAGENTA #FF00FF field with no texture, no gradient and no shadow falling on the field, and no magenta or pink anywhere in the object itself — I will key this colour out. Grounded semi-realistic military-sim style: muted desaturated palette, painterly but clean-edged, no black outline, no cartoon or cel shading, no text, no labels, no watermark. Neutral overhead lighting with a soft contact shadow directly beneath the object only, never a long directional shadow. The asset must still read clearly at 10% size against a dark floor. Palette anchors: floor #303b46, wall #46545f, brick #845345, wood #80623a, metal #788792, foliage #3b5238, accent #e8b53a.

A dead bare tree seen from directly above: a grey-brown branching skeleton with no leaves at all, the branch structure radiating from a central trunk, gaps showing through everywhere.

Footprint: 1.5 tiles wide by 1.5 tiles deep, where one tile is 32 world pixels and a human body is 20 world pixels across.
```

### `palm_tree` &nbsp;·&nbsp; save as `palm_tree.png` &nbsp;·&nbsp; generate at 1024x1024

```
Strict 90-degree top-down orthographic game asset, camera pointing straight down at the ground — NOT isometric, NOT angled, no perspective, no horizon, no vanishing point, no visible side faces of the object. One single object, centered, filling most of the frame, isolated on a FLAT SOLID MAGENTA #FF00FF field with no texture, no gradient and no shadow falling on the field, and no magenta or pink anywhere in the object itself — I will key this colour out. Grounded semi-realistic military-sim style: muted desaturated palette, painterly but clean-edged, no black outline, no cartoon or cel shading, no text, no labels, no watermark. Neutral overhead lighting with a soft contact shadow directly beneath the object only, never a long directional shadow. The asset must still read clearly at 10% size against a dark floor. Palette anchors: floor #303b46, wall #46545f, brick #845345, wood #80623a, metal #788792, foliage #3b5238, accent #e8b53a.

A palm tree seen from directly above: six to eight long fronds radiating from a central crown, dusty green, for a desert or Middle-Eastern street.

Footprint: 1.5 tiles wide by 1.5 tiles deep, where one tile is 32 world pixels and a human body is 20 world pixels across.
```

### `shrub_cluster` &nbsp;·&nbsp; save as `shrub_cluster.png` &nbsp;·&nbsp; generate at 1024x1024

```
Strict 90-degree top-down orthographic game asset, camera pointing straight down at the ground — NOT isometric, NOT angled, no perspective, no horizon, no vanishing point, no visible side faces of the object. One single object, centered, filling most of the frame, isolated on a FLAT SOLID MAGENTA #FF00FF field with no texture, no gradient and no shadow falling on the field, and no magenta or pink anywhere in the object itself — I will key this colour out. Grounded semi-realistic military-sim style: muted desaturated palette, painterly but clean-edged, no black outline, no cartoon or cel shading, no text, no labels, no watermark. Neutral overhead lighting with a soft contact shadow directly beneath the object only, never a long directional shadow. The asset must still read clearly at 10% size against a dark floor. Palette anchors: floor #303b46, wall #46545f, brick #845345, wood #80623a, metal #788792, foliage #3b5238, accent #e8b53a.

A cluster of three small shrubs seen from directly above, touching each other, slightly different greens, together under 1.5 tiles across.

Footprint: 1.5 tiles wide by 1.5 tiles deep, where one tile is 32 world pixels and a human body is 20 world pixels across.
```

---

# BATCH 6 — GROUND TEXTURES

**A different contract: no transparency, and they must tile.** These are the
one batch that needs engine work before they can be used — the engine currently
fills flat colour per tile and does not sample a texture. Generate them last
unless the look is the whole point.

**7 assets.** All independent.

### `ground_asphalt` &nbsp;·&nbsp; save as `ground_asphalt.png` &nbsp;·&nbsp; generate at 1024x1024

```
Seamless tileable texture, strict 90-degree top-down view, filling the entire frame edge to edge with NO border, no background, no transparency and no vignette. The image represents an 8x8 block of 32-pixel floor tiles. It must tile perfectly on all four edges with no visible seam. Muted, low-contrast, desaturated. No text, no labels, no watermark. No obvious repeating landmark feature that would give away the tiling when repeated. Neutral overhead light, no shadows, no directional lighting.

Cracked asphalt with faint faded lane paint markings.
```

### `ground_dirt` &nbsp;·&nbsp; save as `ground_dirt.png` &nbsp;·&nbsp; generate at 1024x1024

```
Seamless tileable texture, strict 90-degree top-down view, filling the entire frame edge to edge with NO border, no background, no transparency and no vignette. The image represents an 8x8 block of 32-pixel floor tiles. It must tile perfectly on all four edges with no visible seam. Muted, low-contrast, desaturated. No text, no labels, no watermark. No obvious repeating landmark feature that would give away the tiling when repeated. Neutral overhead light, no shadows, no directional lighting.

Packed dirt with sparse dry grass tufts and small stones.
```

### `ground_concrete` &nbsp;·&nbsp; save as `ground_concrete.png` &nbsp;·&nbsp; generate at 1024x1024

```
Seamless tileable texture, strict 90-degree top-down view, filling the entire frame edge to edge with NO border, no background, no transparency and no vignette. The image represents an 8x8 block of 32-pixel floor tiles. It must tile perfectly on all four edges with no visible seam. Muted, low-contrast, desaturated. No text, no labels, no watermark. No obvious repeating landmark feature that would give away the tiling when repeated. Neutral overhead light, no shadows, no directional lighting.

Poured concrete floor, lightly stained, with faint expansion joints.
```

### `ground_wood` &nbsp;·&nbsp; save as `ground_wood.png` &nbsp;·&nbsp; generate at 1024x1024

```
Seamless tileable texture, strict 90-degree top-down view, filling the entire frame edge to edge with NO border, no background, no transparency and no vignette. The image represents an 8x8 block of 32-pixel floor tiles. It must tile perfectly on all four edges with no visible seam. Muted, low-contrast, desaturated. No text, no labels, no watermark. No obvious repeating landmark feature that would give away the tiling when repeated. Neutral overhead light, no shadows, no directional lighting.

Worn hardwood floorboards running horizontally, scuffed.
```

### `ground_roof` &nbsp;·&nbsp; save as `ground_roof.png` &nbsp;·&nbsp; generate at 1024x1024

```
Seamless tileable texture, strict 90-degree top-down view, filling the entire frame edge to edge with NO border, no background, no transparency and no vignette. The image represents an 8x8 block of 32-pixel floor tiles. It must tile perfectly on all four edges with no visible seam. Muted, low-contrast, desaturated. No text, no labels, no watermark. No obvious repeating landmark feature that would give away the tiling when repeated. Neutral overhead light, no shadows, no directional lighting.

Flat tar-and-gravel roof surface, plain field only, no equipment or vents.
```

### `ground_sand` &nbsp;·&nbsp; save as `ground_sand.png` &nbsp;·&nbsp; generate at 1024x1024

```
Seamless tileable texture, strict 90-degree top-down view, filling the entire frame edge to edge with NO border, no background, no transparency and no vignette. The image represents an 8x8 block of 32-pixel floor tiles. It must tile perfectly on all four edges with no visible seam. Muted, low-contrast, desaturated. No text, no labels, no watermark. No obvious repeating landmark feature that would give away the tiling when repeated. Neutral overhead light, no shadows, no directional lighting.

Desert sand with light wind ripples.
```

### `ground_forest` &nbsp;·&nbsp; save as `ground_forest.png` &nbsp;·&nbsp; generate at 1024x1024

```
Seamless tileable texture, strict 90-degree top-down view, filling the entire frame edge to edge with NO border, no background, no transparency and no vignette. The image represents an 8x8 block of 32-pixel floor tiles. It must tile perfectly on all four edges with no visible seam. Muted, low-contrast, desaturated. No text, no labels, no watermark. No obvious repeating landmark feature that would give away the tiling when repeated. Neutral overhead light, no shadows, no directional lighting.

Forest floor: dark soil with scattered leaf litter and pine needles.
```

---

# BATCH 7 — DOORS AND WINDOWS (the exception: do NOT parallelise a set)

A door is not a prop, it is a state machine. The engine already draws doors in
three states — closed, open, breached — and the state drives sound loss,
sightline blocking, and whether a round passes through. A single door image
cannot replace that.

**The one rule that breaks the parallel workflow:** all three states of a door
must come from the SAME session, one after another, so the leaf, the frame and
the hinge position match across them. Generate a set in one conversation; you
can still run the three different door MATERIALS in parallel with each other.

A door fills a doorway 1 tile wide by a quarter tile deep — 64 x 16 world
pixels, so 128 x 32 in the delivered PNG.

## `door_wood` — the wood set (three images, one session)

**1. Closed** — save as `door_wood_closed.png`, generate at 1536x1024

```
Strict 90-degree top-down orthographic game asset, camera pointing straight down at the ground — NOT isometric, NOT angled, no perspective, no horizon, no vanishing point, no visible side faces of the object. One single object, centered, filling most of the frame, isolated on a FLAT SOLID MAGENTA #FF00FF field with no texture, no gradient and no shadow falling on the field, and no magenta or pink anywhere in the object itself — I will key this colour out. Grounded semi-realistic military-sim style: muted desaturated palette, painterly but clean-edged, no black outline, no cartoon or cel shading, no text, no labels, no watermark. Neutral overhead lighting with a soft contact shadow directly beneath the object only, never a long directional shadow. The asset must still read clearly at 10% size against a dark floor. Palette anchors: floor #303b46, wall #46545f, brick #845345, wood #80623a, metal #788792, foliage #3b5238, accent #e8b53a.

Seen from directly above: a plain painted timber interior door, CLOSED and filling its door frame completely. The leaf runs left to right across the frame, hinges visible at the LEFT end, handle at the RIGHT end. Footprint: 1 tile wide by 0.25 tiles deep, where one tile is 32 world pixels.
```

**2. Open** — save as `door_wood_open.png`, generate at 1536x1024

```
Strict 90-degree top-down orthographic game asset, camera pointing straight down at the ground — NOT isometric, NOT angled, no perspective, no horizon, no vanishing point, no visible side faces of the object. One single object, centered, filling most of the frame, isolated on a FLAT SOLID MAGENTA #FF00FF field with no texture, no gradient and no shadow falling on the field, and no magenta or pink anywhere in the object itself — I will key this colour out. Grounded semi-realistic military-sim style: muted desaturated palette, painterly but clean-edged, no black outline, no cartoon or cel shading, no text, no labels, no watermark. Neutral overhead lighting with a soft contact shadow directly beneath the object only, never a long directional shadow. The asset must still read clearly at 10% size against a dark floor. Palette anchors: floor #303b46, wall #46545f, brick #845345, wood #80623a, metal #788792, foliage #3b5238, accent #e8b53a.

Seen from directly above: a plain painted timber interior door, OPEN. The door frame is now EMPTY, and the leaf has swung ninety degrees so it stands perpendicular to the frame, still hinged at the same LEFT end. It must read as the exact same door as the closed version, in a different position — same timber, same handle, same thickness. Footprint: the swung leaf occupies roughly 1 tile by 1 tile.
```

**3. Breached** — save as `door_wood_breached.png`, generate at 1536x1024

```
Strict 90-degree top-down orthographic game asset, camera pointing straight down at the ground — NOT isometric, NOT angled, no perspective, no horizon, no vanishing point, no visible side faces of the object. One single object, centered, filling most of the frame, isolated on a FLAT SOLID MAGENTA #FF00FF field with no texture, no gradient and no shadow falling on the field, and no magenta or pink anywhere in the object itself — I will key this colour out. Grounded semi-realistic military-sim style: muted desaturated palette, painterly but clean-edged, no black outline, no cartoon or cel shading, no text, no labels, no watermark. Neutral overhead lighting with a soft contact shadow directly beneath the object only, never a long directional shadow. The asset must still read clearly at 10% size against a dark floor. Palette anchors: floor #303b46, wall #46545f, brick #845345, wood #80623a, metal #788792, foliage #3b5238, accent #e8b53a.

Seen from directly above: a plain painted timber interior door after being BLOWN OFF ITS HINGES. The frame is intact but the leaf is destroyed — splintered and torn fragments still hanging from the hinge at the LEFT end, debris scattered across the threshold, scorching at the edges. Same material and colour as the intact version. Footprint: 1 tile wide by 0.5 tiles deep.
```

## `door_steel` — the steel set (three images, one session)

**1. Closed** — save as `door_steel_closed.png`, generate at 1536x1024

```
Strict 90-degree top-down orthographic game asset, camera pointing straight down at the ground — NOT isometric, NOT angled, no perspective, no horizon, no vanishing point, no visible side faces of the object. One single object, centered, filling most of the frame, isolated on a FLAT SOLID MAGENTA #FF00FF field with no texture, no gradient and no shadow falling on the field, and no magenta or pink anywhere in the object itself — I will key this colour out. Grounded semi-realistic military-sim style: muted desaturated palette, painterly but clean-edged, no black outline, no cartoon or cel shading, no text, no labels, no watermark. Neutral overhead lighting with a soft contact shadow directly beneath the object only, never a long directional shadow. The asset must still read clearly at 10% size against a dark floor. Palette anchors: floor #303b46, wall #46545f, brick #845345, wood #80623a, metal #788792, foliage #3b5238, accent #e8b53a.

Seen from directly above: a flat grey riveted steel security door with no panels, CLOSED and filling its door frame completely. The leaf runs left to right across the frame, hinges visible at the LEFT end, handle at the RIGHT end. Footprint: 1 tile wide by 0.25 tiles deep, where one tile is 32 world pixels.
```

**2. Open** — save as `door_steel_open.png`, generate at 1536x1024

```
Strict 90-degree top-down orthographic game asset, camera pointing straight down at the ground — NOT isometric, NOT angled, no perspective, no horizon, no vanishing point, no visible side faces of the object. One single object, centered, filling most of the frame, isolated on a FLAT SOLID MAGENTA #FF00FF field with no texture, no gradient and no shadow falling on the field, and no magenta or pink anywhere in the object itself — I will key this colour out. Grounded semi-realistic military-sim style: muted desaturated palette, painterly but clean-edged, no black outline, no cartoon or cel shading, no text, no labels, no watermark. Neutral overhead lighting with a soft contact shadow directly beneath the object only, never a long directional shadow. The asset must still read clearly at 10% size against a dark floor. Palette anchors: floor #303b46, wall #46545f, brick #845345, wood #80623a, metal #788792, foliage #3b5238, accent #e8b53a.

Seen from directly above: a flat grey riveted steel security door with no panels, OPEN. The door frame is now EMPTY, and the leaf has swung ninety degrees so it stands perpendicular to the frame, still hinged at the same LEFT end. It must read as the exact same door as the closed version, in a different position — same timber, same handle, same thickness. Footprint: the swung leaf occupies roughly 1 tile by 1 tile.
```

**3. Breached** — save as `door_steel_breached.png`, generate at 1536x1024

```
Strict 90-degree top-down orthographic game asset, camera pointing straight down at the ground — NOT isometric, NOT angled, no perspective, no horizon, no vanishing point, no visible side faces of the object. One single object, centered, filling most of the frame, isolated on a FLAT SOLID MAGENTA #FF00FF field with no texture, no gradient and no shadow falling on the field, and no magenta or pink anywhere in the object itself — I will key this colour out. Grounded semi-realistic military-sim style: muted desaturated palette, painterly but clean-edged, no black outline, no cartoon or cel shading, no text, no labels, no watermark. Neutral overhead lighting with a soft contact shadow directly beneath the object only, never a long directional shadow. The asset must still read clearly at 10% size against a dark floor. Palette anchors: floor #303b46, wall #46545f, brick #845345, wood #80623a, metal #788792, foliage #3b5238, accent #e8b53a.

Seen from directly above: a flat grey riveted steel security door with no panels after being BLOWN OFF ITS HINGES. The frame is intact but the leaf is destroyed — splintered and torn fragments still hanging from the hinge at the LEFT end, debris scattered across the threshold, scorching at the edges. Same material and colour as the intact version. Footprint: 1 tile wide by 0.5 tiles deep.
```

## `door_reinforced` — the reinforced set (three images, one session)

**1. Closed** — save as `door_reinforced_closed.png`, generate at 1536x1024

```
Strict 90-degree top-down orthographic game asset, camera pointing straight down at the ground — NOT isometric, NOT angled, no perspective, no horizon, no vanishing point, no visible side faces of the object. One single object, centered, filling most of the frame, isolated on a FLAT SOLID MAGENTA #FF00FF field with no texture, no gradient and no shadow falling on the field, and no magenta or pink anywhere in the object itself — I will key this colour out. Grounded semi-realistic military-sim style: muted desaturated palette, painterly but clean-edged, no black outline, no cartoon or cel shading, no text, no labels, no watermark. Neutral overhead lighting with a soft contact shadow directly beneath the object only, never a long directional shadow. The asset must still read clearly at 10% size against a dark floor. Palette anchors: floor #303b46, wall #46545f, brick #845345, wood #80623a, metal #788792, foliage #3b5238, accent #e8b53a.

Seen from directly above: a timber door with heavy planks nailed in an X across it, barricaded, CLOSED and filling its door frame completely. The leaf runs left to right across the frame, hinges visible at the LEFT end, handle at the RIGHT end. Footprint: 1 tile wide by 0.25 tiles deep, where one tile is 32 world pixels.
```

**2. Open** — save as `door_reinforced_open.png`, generate at 1536x1024

```
Strict 90-degree top-down orthographic game asset, camera pointing straight down at the ground — NOT isometric, NOT angled, no perspective, no horizon, no vanishing point, no visible side faces of the object. One single object, centered, filling most of the frame, isolated on a FLAT SOLID MAGENTA #FF00FF field with no texture, no gradient and no shadow falling on the field, and no magenta or pink anywhere in the object itself — I will key this colour out. Grounded semi-realistic military-sim style: muted desaturated palette, painterly but clean-edged, no black outline, no cartoon or cel shading, no text, no labels, no watermark. Neutral overhead lighting with a soft contact shadow directly beneath the object only, never a long directional shadow. The asset must still read clearly at 10% size against a dark floor. Palette anchors: floor #303b46, wall #46545f, brick #845345, wood #80623a, metal #788792, foliage #3b5238, accent #e8b53a.

Seen from directly above: a timber door with heavy planks nailed in an X across it, barricaded, OPEN. The door frame is now EMPTY, and the leaf has swung ninety degrees so it stands perpendicular to the frame, still hinged at the same LEFT end. It must read as the exact same door as the closed version, in a different position — same timber, same handle, same thickness. Footprint: the swung leaf occupies roughly 1 tile by 1 tile.
```

**3. Breached** — save as `door_reinforced_breached.png`, generate at 1536x1024

```
Strict 90-degree top-down orthographic game asset, camera pointing straight down at the ground — NOT isometric, NOT angled, no perspective, no horizon, no vanishing point, no visible side faces of the object. One single object, centered, filling most of the frame, isolated on a FLAT SOLID MAGENTA #FF00FF field with no texture, no gradient and no shadow falling on the field, and no magenta or pink anywhere in the object itself — I will key this colour out. Grounded semi-realistic military-sim style: muted desaturated palette, painterly but clean-edged, no black outline, no cartoon or cel shading, no text, no labels, no watermark. Neutral overhead lighting with a soft contact shadow directly beneath the object only, never a long directional shadow. The asset must still read clearly at 10% size against a dark floor. Palette anchors: floor #303b46, wall #46545f, brick #845345, wood #80623a, metal #788792, foliage #3b5238, accent #e8b53a.

Seen from directly above: a timber door with heavy planks nailed in an X across it, barricaded after being BLOWN OFF ITS HINGES. The frame is intact but the leaf is destroyed — splintered and torn fragments still hanging from the hinge at the LEFT end, debris scattered across the threshold, scorching at the edges. Same material and colour as the intact version. Footprint: 1 tile wide by 0.5 tiles deep.
```

## Windows — two states, same session

The engine tracks broken versus unbroken per pane, and an unbroken pane HALVES
an outsider's vision into the room behind it. Both states are needed.

**1. Intact** — save as `window_intact.png`, generate at 1536x1024

```
Strict 90-degree top-down orthographic game asset, camera pointing straight down at the ground — NOT isometric, NOT angled, no perspective, no horizon, no vanishing point, no visible side faces of the object. One single object, centered, filling most of the frame, isolated on a FLAT SOLID MAGENTA #FF00FF field with no texture, no gradient and no shadow falling on the field, and no magenta or pink anywhere in the object itself — I will key this colour out. Grounded semi-realistic military-sim style: muted desaturated palette, painterly but clean-edged, no black outline, no cartoon or cel shading, no text, no labels, no watermark. Neutral overhead lighting with a soft contact shadow directly beneath the object only, never a long directional shadow. The asset must still read clearly at 10% size against a dark floor. Palette anchors: floor #303b46, wall #46545f, brick #845345, wood #80623a, metal #788792, foliage #3b5238, accent #e8b53a.

Seen from directly above: a window set in a wall, INTACT — a glazed pane in a painted timber frame, the glass reading as a slightly reflective translucent surface. Footprint: 1 tile wide by 0.25 tiles deep, where one tile is 32 world pixels.
```

**2. Broken** — save as `window_broken.png`, generate at 1536x1024

```
Strict 90-degree top-down orthographic game asset, camera pointing straight down at the ground — NOT isometric, NOT angled, no perspective, no horizon, no vanishing point, no visible side faces of the object. One single object, centered, filling most of the frame, isolated on a FLAT SOLID MAGENTA #FF00FF field with no texture, no gradient and no shadow falling on the field, and no magenta or pink anywhere in the object itself — I will key this colour out. Grounded semi-realistic military-sim style: muted desaturated palette, painterly but clean-edged, no black outline, no cartoon or cel shading, no text, no labels, no watermark. Neutral overhead lighting with a soft contact shadow directly beneath the object only, never a long directional shadow. The asset must still read clearly at 10% size against a dark floor. Palette anchors: floor #303b46, wall #46545f, brick #845345, wood #80623a, metal #788792, foliage #3b5238, accent #e8b53a.

Seen from directly above: the SAME window in the same frame, BROKEN — jagged glass shards still stuck around the inside of the frame, the centre completely open, broken glass scattered on both sides of the sill. Footprint: 1 tile wide by 0.5 tiles deep.
```

---

## Tally

| Batch | Assets |
|---|---:|
| 1 vegetation (done — oak, pine, bush, hedge) | 4 ✅ |
| 2 VEHICLES | 12 |
| 3 INTERIOR FURNITURE | 15 |
| 4 STREET FURNITURE | 7 |
| 5 ROOFS AND SMALL STRUCTURES | 11 |
| 1b VEGETATION — THE REMAINDER | 3 |
| 6 GROUND TEXTURES | 7 |
| 7 DOORS AND WINDOWS | 11 |
| **Remaining total** | **66** |

At batch 1's measured rate (~4KB per asset after processing, ~37% more once
base64-inlined), the whole remaining programme is roughly 350-400KB added to a
500KB build. Comfortably inside budget.

## CHANGELOG
- v1.0 (2026-08-15): Split out of ART_PROMPT_environment_v1.2.md so every prompt could be made fully self-contained for parallel generation. Adds the vegetation remainder, all four prop batches, ground textures, and the door/window state sets.
