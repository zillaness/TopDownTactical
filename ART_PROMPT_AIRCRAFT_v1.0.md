---
file: ART_PROMPT_AIRCRAFT_v1.0.md (top-down-tactical)
version: 1.0
author: Sam Cao
created: 2026-08-18
last_updated: 2026-08-18
description: Codex/GPT prompts for the FLIGHT 214 aircraft — exterior airframe, cabin interior fittings, and ground support — derived from real airframe dimensions at the game's one-tile-one-metre scale, plus the narrow-body vs wide-body decision that sets both the art and the level geometry.
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

## 1. THE ONE DECISION — narrow-body or wide-body

This sets the cabin width, which sets the seat art, which sets the level. It is
a **gameplay** call, not an art one, which is why it is Sam's.

### Option A — narrow-body (737 / A320). True scale, brutal.

Cabin interior **3.54 m = 3.5 tiles.** Seats 3+3, **one aisle 0.5 m wide.**
A man is `r=9`, so 18 px, so **0.56 tiles.**

- The aisle is barely wider than a man. There is no flanking, no bounding, no
  wedge — the squad formation system is meaningless in a tube.
- It is a pure straight-line fight down a corridor with hostages seated on both
  sides of every firing lane. The corner game at each seat row is the whole
  mission.
- This is **authentic** and it is also **one mission that plays like nothing
  else in the game**, which is either the point or a problem.

### Option B — wide-body (777 / A330). Recommended.

Cabin interior **5.87 m = 5.9 tiles.** Seats 3+3+3, **two aisles.**

- Two aisles means **two approaches**, which is an actual tactical decision
  rather than a queue. You can split the element, take one aisle each, and the
  centre seat block becomes cover that works both ways.
- Still unmistakably a tube. Still no flanking in the open sense. The claustro-
  phobia survives; the tactics come back.
- The existing playbook plays: DYNAMIC ENTRY through a door onto two aisles is
  a real call, and BOUND down parallel aisles is a real call.

**Recommendation: B.** The reason is not authenticity — both are authentic —
it is that A deletes every squad mechanic the game has and B keeps them while
still being a tube. It also matches the mission's own fiction better: four
hostages in a cabin and a locked cockpit is a wide-body job.

**Everything below is written for B, with the narrow-body number in brackets.**

### The geometry that follows

| part | metres | tiles | note |
|---|---|---|---|
| overall length | 63.7 | **64** | 777-200; use 40 for a 737 |
| fuselage outer width | 6.20 | **6** | [3.8] |
| cabin interior width | 5.87 | **6** | [3.5] |
| cabin length | 50 | **50** | [30] |
| wingspan | 60.9 | **61** | wings are scenery, not floor |
| aisle | 0.51 | **1** | two of them [one] |
| seat unit (3 abreast) | 1.4 × 0.8 | **1.5 × 1** | the workhorse asset |

A 64 × 6 cabin does not fit a 46-wide map. **The level has to grow to about
72 × 40**, with the aircraft laid along the long axis and apron around it. That
is the level work, and it is a consequence of the art decision, not a blocker
on it.

---

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

### 4a. Exterior airframe — five pieces

Authored at **2×, so one tile = 64 px.** State the viewBox in every prompt.

| key | viewBox | tiles | prompt line |
|---|---|---|---|
| `air_nose` | `0 0 640 384` | 10 × 6 | "The NOSE section of a wide-body airliner from directly above: the radome tapering to a rounded point at the LEFT edge, the cockpit glazing as a swept dark wraparound windscreen, two forward passenger doors on the left and right flanks, smooth pale grey-white skin with faint panel lines and rivet seams. The RIGHT edge is a clean vertical cut at full fuselage width so it butts against the cabin section with no seam." |
| `air_cabin` | `0 0 640 384` | 10 × 6 | "A 10-metre section of wide-body airliner fuselage EXTERIOR from directly above: smooth pale grey-white skin, faint longitudinal panel lines running left to right, a row of small cabin windows along each flank, one overwing emergency exit. Both the LEFT and RIGHT edges are clean vertical cuts at full fuselage width so the section tiles seamlessly end to end with copies of itself." |
| `air_tail` | `0 0 640 512` | 10 × 8 | "The TAIL section of a wide-body airliner from directly above: the fuselage tapering up and aft to the tailcone at the RIGHT edge, with the vertical stabiliser seen from above as a narrow blade running fore-and-aft along the centreline, and the two horizontal stabilisers swept back from the fuselage sides. Two aft passenger doors. The LEFT edge is a clean vertical cut at full fuselage width." |
| `air_wing_port` | `0 0 1792 1024` | 28 × 16 | "The PORT (left) WING of a wide-body airliner from directly above, seen alone with no fuselage: swept back and tapering outboard, with one large turbofan engine nacelle slung under the leading edge about a third of the way out, flap and aileron panel lines across the trailing edge, a winglet at the tip. Root at the BOTTOM-RIGHT of the frame, tip at the upper left. Pale grey-white upper surface." |
| `air_wing_stbd` | — | — | Do not generate. The engine mirrors `air_wing_port`. |

### 4b. Cabin interior — six pieces, and the seats are the job

The cabin floor is drawn as tiles by the engine; these are the fittings on it.

| key | viewBox | tiles | prompt line |
|---|---|---|---|
| `seat_triple` | `0 0 96 64` | 1.5 × 1 | "Three economy airliner passenger seats side by side in one row unit, seen from DIRECTLY ABOVE: three headrests along the top edge, three seat backs, three seat pans, thin armrests between them and at each end. Dark blue-grey fabric with a slightly lighter headrest cover. The unit is 1.5 tiles wide and 1 tile deep and reaches the left and right edges exactly so a row of them tiles seamlessly across a cabin. Readable as three distinct seats at 10% size." |
| `seat_double` | `0 0 64 64` | 1 × 1 | "The same airliner seat unit but TWO seats abreast instead of three, same fabric, same headrests, same depth, tiling seamlessly left and right." |
| `galley` | `0 0 128 64` | 2 × 1 | "An aircraft galley unit from directly above: a bank of brushed stainless steel trolley stowages and counter surfaces, 2 tiles by 1, with the counter edge along the front. Clean, cold, industrial." |
| `lavatory` | `0 0 64 64` | 1 × 1 | "An aircraft lavatory module from directly above with the roof removed: a cramped moulded plastic cubicle, a small basin at one side and the toilet at the other, off-white and grey, one tile square." |
| `cockpit_seats` | `0 0 128 128` | 2 × 2 | "An airliner flight deck from directly above with the roof removed: two pilot seats side by side facing the top of the frame, a centre pedestal with throttle levers between them, the glareshield and instrument panel as a dark band across the top edge, an overhead panel omitted. Two tiles square." |
| `service_cart` | `0 0 32 64` | 0.5 × 1 | "A single aircraft galley service trolley from directly above: a narrow brushed-steel box on castors, half a tile wide and one tile deep." |

### 4c. Ground support — four pieces. This is how you get in, so it is not scenery.

| key | viewBox | tiles | prompt line |
|---|---|---|---|
| `airstair` | `0 0 256 128` | 4 × 2 | "A mobile aircraft boarding staircase from directly above: a wheeled chassis at the BOTTOM of the frame and a flight of steps rising toward the TOP, individual treads clearly readable as parallel bars, handrails down both sides, a small platform at the top edge. Weathered white and grey." |
| `jet_bridge` | `0 0 512 192` | 8 × 3 | "An airport jet bridge from directly above: a straight enclosed telescoping tunnel running left to right with a ribbed roof, a support column and wheel bogie underneath at the midpoint, and a rotunda at the LEFT end. Grey and off-white." |
| `pushback_tug` | `0 0 192 128` | 3 × 2 | "A low flat airport pushback tug from directly above: a squat wide vehicle with a flat deck, a small offset cab at one end, nose pointing RIGHT. Bright safety yellow, weathered." |
| `ground_apron` | `0 0 256 256` | 4 × 4 | "A seamlessly tileable top-down texture of airport apron concrete: large poured slabs with expansion joints, faint tyre scuffing, oil staining, subtle aggregate. Must tile seamlessly on all four edges. Muted grey." |

---

## 5. Integration contract

1. **The fuselage is a PROP, the cabin floor is TILES.** You fight inside the
   cabin, so its floor and its walls have to be real level geometry with real
   collision. The exterior skin, the wings and the tail are drawn over the
   apron and are scenery — no collision beyond what the map declares.
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

1. `seat_triple` — generate it, look at it, decide the cabin on it.
2. `air_cabin`, `air_nose`, `air_tail` — the fuselage, in that order.
3. `airstair` — the way in, and currently the mission has no visible one.
4. `galley`, `lavatory`, `cockpit_seats` — what makes it a real cabin.
5. `air_wing_port`, `ground_apron` — the establishing shot.
6. `jet_bridge`, `pushback_tug`, `service_cart` — set dressing.

## 7. Where to put them

`assets/incoming/aircraft/` — one file per manifest key
(`seat_triple.svg`, `air_nose.svg`, …), SVG plus throwaway PNG reference. The
drop contract in `assets/README.md` applies; the tooling measures and inlines
and refuses to write anything that breaks the ceiling.

## CHANGELOG
- v1.0 (2026-08-18): Written after Sam's "the scale makes no sense". Measured
  the existing cabin at 2.9x too wide against a 737, put the narrow-body vs
  wide-body decision in front of him with a recommendation, and derived both
  the art manifest and the required level geometry from the same airframe
  numbers so neither has to wait on the other.
