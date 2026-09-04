---
file: 2026-09-03-raycaster-authored-apertures-design.md
version: 1.0
author: Sam Cao
created: 2026-09-03
last_updated: 2026-09-03
description: Design for authored damage stages whose apertures agree across raycaster rendering, ballistics, player sight, AI detection, and movement.
ai_update: Update last_updated and bump version in frontmatter. Append changelog at bottom.
---

# Raycaster authored apertures

## Purpose

Make damaged cover tactically legible in first person. A player who can see an
enemy through a car window, a hole in drywall, or a damaged door must be able to
shoot through that same opening. Remaining solid material must still conceal,
stop or deflect rounds, and block movement. Enemy perception must not become
perfect merely because a few bullet punctures exist.

The feature extends the isolated `raycaster-poc` experiment. It does not merge
the POC into the top-down game or change `GOAL.md`.

## Design principles

1. **One source of spatial truth.** Rendering, player sight, AI sight,
   ballistics, and movement query the same authored aperture profile.
2. **Authored stages, not per-shot carving.** Damage advances through a small,
   cumulative ladder. Individual impacts do not mutate texture pixels.
3. **What is visible is hittable.** A rendered opening and its logical opening
   share coordinates and alignment.
4. **Small holes do not grant AI omniscience.** Punctures may pass a player's
   view ray or bullet without becoming an AI detection portal.
5. **Materials remain meaningful.** A round that hits surviving material still
   pays the material's resistance, damage loss, and deflection.
6. **The first implementation stays 2.5D.** It extends the existing DDA and
   billboard renderer instead of becoming a polygonal 3D engine.

## Scope

The first complete slice covers:

- drywall and wood partitions;
- closed wooden and steel doors;
- architectural glass;
- one representative sedan with transparent windows;
- player visibility through authored openings;
- bullets through authored openings;
- delayed AI detection through large damaged openings;
- normal AI detection through full breaches and clear glass;
- movement through explicitly traversable final breaches;
- aligned visual and logical asset validation.

The architecture supports brick, sheet metal, additional vehicles, and other
props later, but those are not required for the first slice.

## Non-goals

- Arbitrary per-pixel holes at exact impact positions.
- Runtime texture painting or boolean geometry.
- Freeform collapsing walls.
- True polygonal car interiors.
- AI firing through tiny punctures it cannot use for detection.
- Converting the top-down production game to first person in this change.

## Alternatives considered

### Whole-cell state changes

A damaged tile becomes wholly transparent or disappears. This is inexpensive,
but it makes intact-looking pixels non-solid and causes enemies to appear behind
surfaces that still look closed. Rejected because appearance and simulation
would disagree.

### Shared authored aperture profiles — selected

Every damage stage carries an aligned visual image and hard logical masks.
Every ray-based system samples those masks. This preserves authored silhouettes,
supports partial cover, and fits the current column renderer.

### Subdivided map geometry

Replace each tile with a fine collision grid or portal mesh. This offers more
physical precision but expands map parsing, collision, AI, and rendering at
once. Deferred unless authored masks prove too limiting.

## Surface model

Each destructible instance has a stable identity and two independent state
axes:

- `pose`: structural position such as `closed` or `open`;
- `damageStage`: `intact`, `punctured`, `opened`, or `breached`.

Opening a door does not repair it. Damaging a closed door does not implicitly
open it. Reaching `breached` always makes the door effectively open because no
blocking leaf remains, but the recorded pose is retained for diagnostics.

### Stage semantics

| Stage | Visual state | Player view | Bullets | AI detection | Movement |
|---|---|---|---|---|---|
| `intact` | Undamaged material | Material rule | Material penetration | Material rule | Blocked |
| `punctured` | Small holes and cracks | Through exact holes | Through holes; otherwise material | Never through damage holes | Blocked |
| `opened` | One or more large irregular gaps | Through exact gaps | Through gaps; otherwise material | Delayed through qualifying gaps | Blocked |
| `breached` | Major structural opening | Clear through gap | Clear through gap | Normal through gap | Passable only where profile permits |

Damage stages are monotonic. Advancing a stage must retain or expand previous
openings; an approved later mask may never close a previously open sample.

### Surface profile

Each stage references one profile:

```js
{
  id: "drywall__opened",
  texture: "drywall__opened",
  width: 64,
  height: 64,
  visualAlpha: Uint8Array,
  bulletOpen: BitSet,
  playerOpen: BitSet,
  aiOpen: BitSet,
  moveOpen: BitSet,
  aiAcquireMul: 0.45,
  remainingMaterial: "drywall"
}
```

The arrays occupy identical normalized surface coordinates `(u, v)`. Logical
masks are hard binary values. Antialiased edge pixels belong only to the visual
texture and never decide gameplay.

Most profiles derive `bulletOpen` and `playerOpen` from one cleaned aperture
mask. Separate fields remain explicit because later materials may differ—for
example, a dusty mesh can pass sight but catch fragments.

## Shared surface query

All systems call one query rather than reproducing aperture rules:

```js
sampleSurface(instance, hit) -> {
  u, v,
  visualAlpha,
  playerOpen,
  bulletOpen,
  aiOpen,
  moveOpen,
  material,
  aiAcquireMul
}
```

`hit` contains the intersected instance, world-space hit point, wall side, and
height. The instance transforms this into normalized surface coordinates.

For grid walls and doors, `u` comes from the DDA wall coordinate and `v` comes
from eye or projectile height. For vehicles, an oriented rectangle intersection
produces local longitudinal and vertical coordinates for the selected view and
mask.

## Layered column rendering

The current POC stops each column at the first opaque material. The new caster
returns a short ordered hit list per column:

```js
[
  { kind: "glass", distance, u, instance },
  { kind: "vehicle", distance, u, instance },
  { kind: "enemy", distance, spriteU, entity },
  { kind: "wall", distance, u, instance }
]
```

The renderer continues a ray through samples where `playerOpen` is true and
through translucent intact glass. It stops at the first solid sample or the
view-distance limit. Hits are composited back-to-front.

The depth buffer becomes an opaque-depth buffer: only solid samples write it.
Glass tint, cracks, damaged edges, and smoke overlay the scene without hiding
valid geometry behind them. Enemy billboards remain clipped per column, but
vehicle and wall aperture samples can expose only part of a figure.

To keep work bounded, each screen column stores at most four translucent or
aperture-bearing layers before the terminal opaque hit. Overflow stops at the
last retained surface and increments a debug counter. Ordinary maps should not
approach the cap.

## Architectural glass

Intact glass is visible but not opaque. It:

- blocks movement because the frame and pane occupy the opening;
- permits player and AI sight;
- applies glass resistance, damage loss, and deflection to bullets;
- renders tint, reflection, grime, and cracks as a translucent layer;
- advances to cracked and then broken stages under damage.

Broken glass retains the frame and jagged edge pixels as solid samples while the
center aperture passes sight and bullets. Movement remains blocked until the
instance explicitly becomes traversable.

## Doors

Doors keep pose and damage independent:

```js
door.pose        // closed, opening, open
door.damageStage // intact, punctured, opened, breached
```

A closed door samples its damage-stage profile. An opening door translates its
plane using the POC's existing sliding-door motion while preserving the same
mask. An open door contributes no central blocking plane in the first slice.
Rendering a displaced leaf is outside this slice. A breached door exposes a
large authored gap and becomes traversable when the profile's movement mask
permits it.

Steel and wooden doors use different stage art and material resistance. The
same hole in steel and wood therefore has the same geometric truth but different
remaining-material behavior.

## Vehicles and windows

Vehicles are oriented world objects, not wall tiles. Each vehicle owns:

- an oriented movement and ballistic footprint;
- a body type and world heading;
- a monotonic authored condition;
- eight directional visual views;
- aligned per-view opacity and aperture masks;
- tagged regions for glass, pillars, sheet metal, wheels, cabin, and engine.

Recommended files:

```text
<body>__<angle>__intact.png
<body>__<angle>__glass_cracked.png
<body>__<angle>__glass_out.png
<body>__<angle>__wreck.png
```

Angles use stable names: `front`, `front_right`, `right`, `rear_right`, `rear`,
`rear_left`, `left`, `front_left`.

Transparent window pixels do not write opaque depth. Pillars, door frames,
roof, seats, and engine components do. An enemy behind a car can therefore be
visible through one window and concealed when a pillar crosses the same screen
column.

Gameplay does not use the selected camera-facing sprite as physical truth.
An oriented vehicle volume is intersected in world space, then its tagged
surface profile determines whether the ray crossed glass, cabin space, sheet
metal, or engine. This prevents turning the camera from changing cover strength.

For the first slice, the sedan has `intact`, `glass_cracked`, `glass_out`, and
`wreck` conditions. Exact four-face damage accumulation from the top-down game
is deferred; the POC first proves transparent-window alignment and stable cover.

## AI perception

AI perception uses `aiOpen`, never `playerOpen` directly.

- Punctured damage masks contain no AI-open samples.
- Opened masks mark only deliberately large apertures as AI-open and apply an
  acquisition multiplier below `1.0`.
- Breached masks use normal acquisition through their gaps.
- Clear architectural and vehicle glass permits detection, optionally with a
  material-specific acquisition penalty for tint, dirt, or cracks.

An enemy must accumulate detection continuously while the target remains inside
qualifying aperture samples. Losing the aperture drains progress rather than
granting permanent knowledge. The first slice does not let AI intentionally fire
through punctures it cannot use to acquire a target.

Suggested multipliers:

| Medium | Acquisition multiplier |
|---|---:|
| Clear glass | 0.80 |
| Cracked or dirty glass | 0.55 |
| `opened` damage gap | 0.45 |
| Full breach or open air | 1.00 |
| `punctured` damage hole | 0.00 |

These are starting values for playtesting, not immutable balance constants.

## Ballistics

A projectile intersects surfaces in distance order. At each sample:

1. If `bulletOpen` is true, continue without paying material resistance.
2. Otherwise resolve the existing penetration rule against the remaining
   material.
3. On penetration, reduce damage and penetration budget, apply deflection, and
   continue just beyond the surface.
4. On failure, stop and emit the material-appropriate effect.

The projectile's height is carried explicitly so a bullet through a high hole
cannot hit a crouched target unless their volumes actually overlap.

Damage stage progression is driven by accumulated structural damage, not by
modifying the masks. Stage transitions swap to the next approved cumulative
profile and emit debris appropriate to the material.

## Movement

Movement remains coarse and predictable:

- punctured and opened surfaces block bodies;
- a final wall or door breach is traversable only through authored movement
  openings wide enough for the player radius;
- intact and damaged glass block movement unless the pane has reached a stage
  explicitly marked traversable;
- vehicles always use their oriented footprint for movement, regardless of
  visible window apertures.

The first implementation treats a breached grid tile as wholly traversable
after asset validation confirms that its movement opening is at least two
player radii wide at floor level. Fine per-pixel collision through jagged gaps
is not part of this slice.

## Asset contract

### Walls and doors

- Author one asset per generation, not a multi-object sheet.
- Use a straight-on orthographic elevation with no visible side face, floor,
  ceiling, horizon, or vanishing point.
- Fill the complete square texture bounds; do not isolate wall textures on a
  transparent canvas.
- Keep stage alignment, lighting, material scale, framing, and damage location
  fixed.
- Supply genuine alpha only inside apertures. Do not paint holes black.
- Keep a solid perimeter until the final breach unless the design intentionally
  joins a neighboring damaged tile.
- Author at 1024 square, then process to a 256 by 256 visual texture and a
  64 by 64 binary logical mask.

Recommended names:

```text
drywall__intact.png
drywall__punctured.png
drywall__opened.png
drywall__breached.png

door_wood__closed_intact.png
door_wood__closed_punctured.png
door_wood__closed_opened.png
door_wood__breached.png
```

### Vehicle views

- Start every view and condition from an approved canonical identity.
- Use eye-level orthographic or very long-lens elevation, not top-down or
  dramatic perspective.
- Keep ground contact, camera height, vehicle scale, heading, crop, and padding
  fixed within each angle.
- Use genuine alpha outside the silhouette and through empty windows.
- Do not make glass openings opaque black.
- Preserve pillars, frames, mirrors, seats, engine mass, and other occluders.
- Damage conditions are cumulative and may not restore glass or bodywork.

### Mask processing

The processing tool creates a mask candidate from image alpha, thresholds it,
removes disconnected edge noise, and exports a small binary mask. A human must
approve the result overlaid on the color image before integration. The tool also
checks that later stages contain every earlier opening.

## Validation and tests

### Pure geometry tests

- Surface-coordinate transforms return stable `(u, v)` values from all four
  grid directions.
- Vehicle intersections are invariant under camera heading.
- Mask sampling never reads outside its bounds.
- Later stage openings are supersets of earlier ones.

### Rendering contracts

- A background wall appears through intact glass.
- An enemy appears through the open portion of a damaged wall but is clipped by
  remaining material in adjacent columns.
- A car pillar hides an enemy while the neighboring window reveals them.
- Translucent layers do not replace nearer opaque depth.
- The layer cap records overflow without producing an exception.

### Ballistic contracts

- A zero-spread round through an authored aperture reaches a target aligned with
  that aperture.
- Moving the same shot one mask pixel onto material resolves penetration.
- Glass reduces and deflects a round while an empty window does not.
- Engine material remains stronger than vehicle glass and sheet metal.

### AI contracts

- AI cannot acquire through `punctured` damage openings.
- AI acquisition is slower through an `opened` gap.
- AI acquisition is normal through a full breach.
- Losing the aperture drains acquisition progress.
- AI cannot see through a car pillar merely because the adjacent window is open.

### State contracts

- Door pose and damage remain independent.
- Damage stages never regress.
- Opening a damaged door retains its damage.
- Reloading or restarting reconstructs the correct profile references.

## Performance budget

At the POC's half-horizontal-resolution casting, layered hits and mask samples
must remain allocation-free inside the frame loop after initialization. Reuse
typed arrays for hit distance, instance id, surface coordinates, and flags.

Target the existing responsive frame rate at 1080p with:

- no more than four stored translucent/aperture layers per column;
- binary masks no larger than 64 by 64 for logical sampling;
- textures cached once;
- vehicle candidates culled by distance before oriented intersections;
- AI sight sampled at simulation frequency rather than once per render column.

The standalone build must continue to make no external requests. Final art is
inlined as measured WebP or PNG data, subject to the repository's compressed
delivery budget.

## Failure handling and diagnostics

- Missing visual asset: render a high-contrast diagnostic material while
  retaining the logical mask.
- Missing logical mask: fail validation and refuse to package the asset; never
  infer gameplay openness at runtime from soft image alpha.
- Mismatched dimensions: fail asset validation.
- Excess layered hits: stop at the cap and increment a visible debug counter.
- Invalid stage transition: keep the current valid stage and report the rejected
  transition in debug output.

Debug mode should display the sampled `(u, v)`, instance id, surface stage,
channel results, and ray layers under the reticle.

## Delivery sequence

1. Add pure aperture profiles, mask sampling, and monotonic-stage tests.
2. Extend DDA columns to collect layered wall, door, and glass hits.
3. Make rendering and player sight share the same aperture samples.
4. Make ballistics use the same surface query.
5. Add AI acquisition thresholds and delayed detection.
6. Add independent door pose and damage state.
7. Add one sedan as an oriented masked vehicle with transparent windows.
8. Add asset validation and visual regression fixtures.
9. Replace procedural placeholder art with approved authored assets.
10. Playtest acquisition multipliers and breach readability.

Each step should leave the POC runnable and keep all earlier assertions green.

## Acceptance criteria

The feature is complete when all of the following are simultaneously true:

- The player can see and shoot an enemy through the same authored wall or door
  aperture.
- Remaining wall or door pixels still occlude and resolve penetration.
- Tiny punctures never allow AI acquisition.
- Larger openings slow AI acquisition; full breaches restore normal acquisition.
- An enemy is visible through sedan windows but hidden by its pillars, body,
  seats, and engine where appropriate.
- Turning the camera does not change a vehicle's physical protection.
- Door pose and damage state compose without visual or logical repair.
- Mask validation rejects misalignment and non-monotonic damage stages.
- Headless tests report zero failures and visual fixtures show correct layered
  depth and transparency.

## Changelog

- v1.0 (2026-09-03): Initial design for authored aperture stages shared by
  rendering, player sight, AI detection, ballistics, movement, doors, glass,
  and vehicle windows.
