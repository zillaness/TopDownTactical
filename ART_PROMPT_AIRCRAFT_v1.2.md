---
file: ART_PROMPT_AIRCRAFT_v1.2.md (top-down-tactical)
version: 1.2
author: Sam Cao
created: 2026-08-18
last_updated: 2026-08-18
description: Codex/GPT prompts for the FLIGHT 214 aircraft — geometry LOCKED at 72x10 tiles — exterior airframe, cabin interior fittings, and ground support — derived from real airframe dimensions at the game's one-tile-one-metre scale, plus the narrow-body vs wide-body decision that sets both the art and the level geometry.
ai_update: Update last_updated and bump version in frontmatter. Rename file to match. Append changelog at bottom.
---

# Aircraft art — FLIGHT 214

## Answering the question first: no, the level does not have to come first

Sam: *"can i get a prompt for the plane artwork. or do you need to figure out
the level first?"*

Neither leads. **They both fall out of one number — the real airframe's
dimensions — and once that is picked, the level and the art are two views of
the same object.** So the prompts are below and can go to Codex now. The only
thing that has to be decided before generating is **§1**, and it is one choice.

## SCOPE, as of v1.2 — THE EXTERIOR ONLY

Sam, after seeing the cabin running in v0.83: *"i think we can stick with the
svg seats interior"* … *"but have the exterior art?"*

**So the cabin interior is DONE and is not part of this brief.** The seats,
galleys and fittings are drawn in code, they ship, and they are staying. Do not
generate seat art — §4b is struck through below and kept only so nobody
re-derives it.

**What is wanted is the airframe you see from outside**, which is the one part
still standing in as a placeholder: v0.83 draws the closed fuselage as flat
skin with panel lines and a row of window dots. It works — it reads as an
aeroplane and the roof-lift mechanic is built and tested around it — but it is
the plainest thing on the map and it is the first thing you see.

Generate **§4a (four pieces)** and, if there is appetite, **§4c (ground
support)**. Nothing else.

## 0. What is wrong today, measured

`TILE = 32` and **one tile is one metre** (CLAUDE.md, and it is the rule that
caught twelve undersized vehicles). Against that:

| | FLIGHT 214 now | Boeing 737-800 | verdict |
|---|---|---|---|
| overall length | 37 tiles | 39.5 m | about right |
| **cabin width** | **11 tiles** | **3.54 m** | **2.9× too wide** |
| interior | rectangular rooms with doors | one tube, one aisle | not an aircraft |
| wings, tail, nose | none | 35.8 m span | absent |

So Sam's *"the scale makes no sense"* is exactly right, and the length is the
part that is fine. What is on the map is a **building 37 m long and 11 m wide,
partitioned into six rooms**, with the word "flight" on it. There is no nose, no
tail, no wings, no taper, no aisle, and no seat rows — nothing that makes a
cabin read as a cabin or fight like one.

(The five desks, two bookshelves and two fridges are gone as of v0.79. Those
were v0.78's automated prop pass classifying the cabin as an interior and
furnishing it as an office. Sam: *"why is there an office desk in an airplane"*.)

---

## 1. THE GEOMETRY — DECIDED, and these numbers are now fixed

Sam: *"lets do wide body, and we can make it a little wider than a real plane
for the sake of fun. but it should still read as a narrow plane body."*

**Wide-body it is, widened about a third, and the length holds the ratio that
makes it read as an aircraft.** Everything below is locked — generate against
these numbers, not against a real 777.

### The cross-section, which is the number that matters

Integer tiles, because tiles are how people move.

| across the tube | tiles |
|---|---|
| fuselage structure | 1 |
| seat block (3 abreast) | 2 |
| **aisle** | **1** |
| seat block (3 abreast) | 2 |
| **aisle** | **1** |
| seat block (3 abreast) | 2 |
| fuselage structure | 1 |
| **fuselage outer width** | **10** |
| **cabin interior** | **8** |

A real 777 cabin is 5.87 m, so this is **36% wider** — Sam's "a little wider for
the sake of fun", spent entirely on the seat blocks. **The aisles stay at one
tile and that is deliberate.** A man is `r=9`, which is 0.56 tiles, so a
one-tile aisle is single file: you cannot pass your own point man, the stack is
a real stack, and every seat back is cover at arm's length. That is the thing
that makes it feel like an aircraft, and widening it is what would kill it.

### The length, which is what keeps it looking like a plane

| | tiles |
|---|---|
| nose section | 9 |
| cabin | 54 |
| tail section | 9 |
| **overall** | **72** |

**72 × 10 is 7.2 : 1.** For comparison: a C-17 is 7.7 : 1, a 737 is 10.5 : 1, a
777 is 10.3 : 1. So it sits just the wide side of a military transport and well
clear of anything that would read as a bus. Widening the tube without lengthening
it is exactly how this stops looking like an aircraft, which is why the two
numbers are quoted together and neither moves on its own.

Wingspan **48 tiles** (a real 777 is 61). Wings are scenery, not floor — they
are pulled in to keep the whole airframe on a sane map.

### What this makes the level

About **80 × 34**, aircraft laid along the long axis with apron around it. The
biggest map in the game today is 74 × 42, so this is in range and not a new
problem. Fuselage centred with the cabin floor as real tiles and real collision;
nose, tail and wings drawn over the apron as scenery.

## 2. Raster or vector — vector, and this time it is not close

Same call as the fortifications, for a stronger reason: **size**.

The airframe is 64 × 6 tiles for the fuselage and 61 tiles of wingspan. At the
house 2× authoring standard that is a **4096 × 3900 px** raster. Even
aggressively compressed that is hundreds of kilobytes, and base64 adds ~37%.
The build has **83,110 bytes of headroom** as of v0.79, and the suite fails if
that is broken.

An aircraft is also the single best-suited object in this game for vector: it
is a manufactured shape made of long smooth curves, straight panel lines and
repeated regular features. There is no organic edge quality to lose — that
argument protects tree canopies, not fuselages.

**Vector for everything here. Generate PNG only as throwaway reference.**

Seats are the exception that proves it: one `seat_triple` at ~400 bytes of SVG,
drawn 30 times by the engine, versus 30 raster blits of the same picture.

---

## 3. The master style block (paste at the top of every prompt)

> Strict top-down orthographic view, camera pointing straight down at 90
> degrees, like a satellite photo or a floor plan. NOT isometric, NOT angled,
> no horizon, no perspective, no vanishing point, no visible side or face of
> any object. Grounded semi-realistic military-sim style: muted desaturated
> palette, painterly but clean-edged, no black outlines, no cartoon or cel
> shading, no text, no watermark, no labels, no airline livery, no logos.
> Lighting is neutral and directly overhead: a short contact shadow tight under
> the object only, never a long directional shadow. The asset must read clearly
> at 10% size against a dark floor. Palette anchors: floors #303b46 / #111a17,
> walls #46545f, metal #788792, aircraft skin #b9bfc4, cabin carpet #3d4550,
> seat fabric #4a5560, apron concrete #6b7075, accent #e8b53a.

**Plus the vector block:**

> Output a single self-contained SVG with an explicit `viewBox` and no `width`
> or `height` attributes, no `<style>` block, no CSS classes, no external
> references, no embedded raster images, no filters. Plain `<path>`, `<rect>`,
> `<circle>`, `<ellipse>` and `<g>` with presentation attributes written inline.
> Round coordinates to one decimal place. Transparent background, no background
> rect. Give me the raw SVG source in a code block and nothing else.

**Reject on sight:** isometric drift (any visible side face); long directional
shadows; airline branding; a cabin drawn wider than it is specified.

---

## 4. THE MANIFEST

### 4a. Exterior airframe — four pieces

Authored at **2×, so one tile = 64 px.** The fuselage is **10 tiles = 640 px**
across in every one of these. **Nose points RIGHT**, which is the house rule for
every vehicle in this game. State the viewBox in the prompt every time.

| key | viewBox | tiles | prompt line |
|---|---|---|---|
| `air_nose` | `0 0 576 640` | 9 × 10 | "The NOSE section of a wide-body airliner from directly above: the radome tapering to a rounded point at the RIGHT edge of the frame, the cockpit glazing as a swept dark wraparound windscreen just behind it, one passenger door on each flank near the left, smooth pale grey-white skin with faint panel lines and rivet seams. The LEFT edge is a clean vertical cut at the full 10-tile fuselage width so it butts against the cabin section with no seam. The fuselage occupies the full height of the frame at that left edge and tapers only toward the nose." |
| `air_cabin` | `0 0 640 640` | 10 × 10 | "A ten-metre section of wide-body airliner fuselage EXTERIOR from directly above: smooth pale grey-white skin filling the full height of the frame, faint longitudinal panel lines running left to right, a row of small evenly spaced cabin windows along each flank, one overwing emergency exit hatch on each flank. BOTH the left and right edges are clean vertical cuts at full fuselage width so the section tiles seamlessly end to end with copies of itself. No taper anywhere — this is the parallel middle of the tube." |
| `air_tail` | `0 0 576 896` | 9 × 14 | "The TAIL section of a wide-body airliner from directly above: the fuselage entering at full width on the RIGHT edge and tapering up and aft to a tailcone at the LEFT edge, with the vertical stabiliser seen from above as a narrow blade running along the centreline, and two horizontal stabilisers swept back from the fuselage sides — these are why the frame is taller than the fuselage. One passenger door on each flank near the right. Pale grey-white." |
| `air_wing_port` | `0 0 1536 1024` | 24 × 16 | "The PORT WING of a wide-body airliner from directly above, alone with no fuselage: swept back and tapering outboard, one large turbofan engine nacelle slung under the leading edge about a third of the way out, flap and aileron panel lines across the trailing edge, a small winglet at the tip. The root is at the BOTTOM-RIGHT of the frame and the tip at the upper left. Pale grey-white upper surface." |

`air_wing_stbd` — **do not generate.** The engine mirrors `air_wing_port`.

### 4b. Cabin interior — ~~six pieces~~ **CUT. Already built, in code.**

Struck as of v1.2. The cabin is drawn by `drawSeatTile()` and the prop sprites
already in the file, and Sam has called it: it stays.

For the record, what is in there and why it does not need replacing:

- **Seat banks** are drawn per tile, nose-right, headrest forward, two units to
  a tile, courses reading as a continuous bank down the cabin. They also carry
  a **damage state** the art would have had to reproduce anyway — every seat
  tile holds two rounds of cover, and as it is shot out it draws holes and then
  exposed stuffing. A static sprite could not do that without three variants
  per piece, so the code version is not a placeholder here, it is the better
  answer.
- **Galleys** use the existing `kitchen_counter` sprite on the `u` glyph.
- **Lavatory, cockpit seats and service carts** were never placed. If the
  flight deck ever wants to read as a flight deck, `cockpit_seats` is the one
  piece worth revisiting — the cockpit is a locked room with one man in it and
  currently draws as bare floor. It is not blocking anything.

### 4c. Ground support — four pieces. This is how you get in, so it is not scenery.

| key | viewBox | tiles | prompt line |
|---|---|---|---|
| `airstair` | `0 0 256 128` | 4 × 2 | "A mobile aircraft boarding staircase from directly above: a wheeled chassis at the BOTTOM of the frame and a flight of steps rising toward the TOP, individual treads clearly readable as parallel bars, handrails down both sides, a small platform at the top edge. Weathered white and grey." |
| `jet_bridge` | `0 0 512 192` | 8 × 3 | "An airport jet bridge from directly above: a straight enclosed telescoping tunnel running left to right with a ribbed roof, a support column and wheel bogie underneath at the midpoint, and a rotunda at the LEFT end. Grey and off-white." |
| `pushback_tug` | `0 0 192 128` | 3 × 2 | "A low flat airport pushback tug from directly above: a squat wide vehicle with a flat deck, a small offset cab at one end, nose pointing RIGHT. Bright safety yellow, weathered." |
| `ground_apron` | `0 0 256 256` | 4 × 4 | "A seamlessly tileable top-down texture of airport apron concrete: large poured slabs with expansion joints, faint tyre scuffing, oil staining, subtle aggregate. Must tile seamlessly on all four edges. Muted grey." |

---

## 5. Integration contract

1. **The fuselage art replaces a ROOF, and the roof already exists.** v0.83
   added a per-room roof: the aircraft draws closed from outside and the lid
   comes off the cabin the moment one of your people is inside it, leaving the
   flight deck shut behind its own bulkhead. `drawRoofs()` is the single
   function the art drops into — it already knows which tiles are hull, which
   room owns each one, and whether that room has been opened. Nothing about the
   map, the collision or the mechanic changes when the art lands.
2. **So the pieces must tile to the ROOF FOOTPRINT, not to a free-standing
   picture of an aeroplane.** The footprint is the fuselage: 72 tiles long,
   10 wide through the parallel section, tapering over the 9-tile tailcone and
   the 9-tile radome. Wings are the exception — they are pure scenery over the
   apron and belong to no room.
2. **Multi-tile props already work.** `PROPS[key]` takes `tw` / `th`, and the
   pillbox is already a 3 × 3. The wing is a 28 × 16, which is bigger than
   anything so far — check it against the draw path before committing to it.
3. **Author the wing once and mirror it.** The engine can flip; two wings is
   twice the bytes for nothing.
4. **The seat row is the asset that matters.** Everything else is set dressing;
   the seats are what make the cabin read and what the player takes cover
   behind. Generate that one first and look at it before doing any of the rest.
5. **Seats should probably be low cover** (`crest`, added in v0.79) — you can
   shoot over a seat back and it stops some of what comes at you. A seat block
   with `crest: 0.55` and a low resist is the honest model, and it is the thing
   that makes a two-aisle cabin a fight rather than a shooting gallery. That is
   a gameplay decision to make when the art lands, not before.
6. **Measure, do not estimate.** 83,110 bytes of headroom at v0.79.

## 6. Priority order

1. **`air_cabin`** — the parallel section, and 54 of the 72 tiles. Generate this
   one first and look at it before anything else: everything butts against it.
2. **`air_nose`** and **`air_tail`** — the two ends, which are what make the
   silhouette an aeroplane rather than a shipping container.
3. **`air_wing_port`** — the establishing shot. Pure scenery, mirrored for
   starboard, and the single biggest thing on the map.
4. **`airstair`** — the way in, and the mission currently has no visible one.
5. **`ground_apron`** — the concrete under all of it.
6. **`jet_bridge`, `pushback_tug`** — set dressing, only if it is free.

**Byte headroom is 54,258 as of v0.83**, against a hard 2MB ceiling the suite
fails on. Four exterior SVGs should land in single-digit KB; measure, do not
estimate, and weigh before committing.

## 7. Where to put them

`assets/incoming/aircraft/` — one file per manifest key
(`seat_triple.svg`, `air_nose.svg`, …), SVG plus throwaway PNG reference. The
drop contract in `assets/README.md` applies; the tooling measures and inlines
and refuses to write anything that breaks the ceiling.

## CHANGELOG
- v1.2 (2026-08-18): Scope cut to the EXTERIOR, on Sam's call after playing the
  v0.83 cabin: "i think we can stick with the svg seats interior … but have the
  exterior art?" §4b struck — the seats are drawn in code, they ship, and they
  carry a shot-out damage state a static sprite could not have done without
  three variants a piece. The airframe is the remaining placeholder and the
  first thing you see, so it is the whole ask now. Integration section rewritten
  against the roof mechanic that v0.83 actually built, so the art drops into
  `drawRoofs()` with no map or collision change.
- v1.1 (2026-08-18): Geometry LOCKED after Sam chose wide-body "a little wider
  than a real plane for the sake of fun, but it should still read as a narrow
  plane body". 8-tile interior (36% over a real 777, all of it in the seat
  blocks), 10-tile fuselage, 72 tiles long for a 7.2:1 silhouette — the wide
  side of a C-17 and nowhere near a bus. The aisles stay at one tile on purpose:
  a man is 0.56 tiles, so single file is what makes it feel like an aircraft,
  and that is the one dimension widening would ruin. Every asset resized to
  those numbers and reoriented nose-RIGHT per the house rule.
- v1.0 (2026-08-18): Written after Sam's "the scale makes no sense". Measured
  the existing cabin at 2.9x too wide against a 737, put the narrow-body vs
  wide-body decision in front of him with a recommendation, and derived both
  the art manifest and the required level geometry from the same airframe
  numbers so neither has to wait on the other.
