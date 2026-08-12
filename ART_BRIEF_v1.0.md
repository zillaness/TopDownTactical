---
file: ART_BRIEF_v1.0.md (top-down-tactical)
version: 1.0
author: Sam Cao
created: 2026-08-12
last_updated: 2026-08-12
description: Self-contained art direction brief for an external model with no repo access. Everything needed to do a graphical pass on the sprite set and the render palette.
ai_update: Update last_updated and bump version in frontmatter. Rename file to match. Append changelog at bottom.
---

# Art brief — Top-Down Tactical

**Read this as the whole spec.** It is written to be pasted into a model that
cannot see the repository. Nothing here depends on a file you do not have. Two
images ship alongside it and are the other half of the brief:

- `art/sprite_contact_sheet_v2.0.png` — all 27 current sprites, each shown at a
  120px study next to the actual 40px in-game blit, on the real floor colour.
- `art/gameplay_frame_v0.15.png` — an honest gameplay frame, fog and all.

Look at both before proposing anything. The contact sheet is what the art *is*;
the gameplay frame is what the art *reads as*, and the gap between them is the
job.

---

## 1. What the game is, in art terms only

A top-down 2D tactical shooter. You directly control one operator with WASD and
mouse aim while three AI teammates work the same building. Fixed overhead
camera, no rotation — north is always up. Canvas 2D, no engine, no shaders, no
sprite atlas: every sprite is an inline SVG string rasterised to an offscreen
canvas once at load, then blitted.

Reference points for tone: Door Kickers 2, Ready or Not's top-down planning
view, SWAT 4's blueprint aesthetic. Reads as an operations screen, not a
cartoon. Grounded, legible, no outlines-as-style, no chunky pixel art.

## 2. The hard contract — break any of these and the art will not load

Every sprite is a **single self-contained SVG string** with:

1. `viewBox="0 0 64 64"`, and `width="64" height="64"`.
2. **Pivot at (32,32).** The engine translates to the entity's world position and
   rotates about the sprite centre. Anything drawn off-centre orbits wrong.
3. **Authored facing EAST (+X).** A rotation of 0 radians means the operator
   faces screen-right. Muzzle points to the right edge.
4. **The faction colour is the literal token `#TEAMCOLOR`.** At rasterisation the
   engine does `SPRITES[key].split("#TEAMCOLOR").join(tint)` — a plain string
   replace, on a single token, with no fallback. Use it for the parts that must
   change per faction, and fixed hex for everything else (helmet, weapon,
   webbing, shadow).
5. **No external references.** No `<image href>`, no web fonts, no CSS files, no
   filters that need a defs block from elsewhere. Gradients and `<defs>` inside
   the same string are fine. It is serialised through `encodeURIComponent` into a
   `data:image/svg+xml` URI, so it must stand alone.
6. **No `<script>`, no animation.** Frames come from the engine, not the SVG.
7. Keep each string on one line if you can — it lives inside a JS template
   literal in a single-file HTML build.

### Handedness is a Y-flip, never an X-flip

Left-handed operators are drawn with `ctx.scale(1, -1)` *after* the rotation.
Because sprites face +X, a unit's left and right lie on the **Y axis**. If you
author anything that assumes an X mirror, left-handers will point their weapons
backwards. Practical consequence: **do not make the sprite vertically
symmetric.** The whole corner-peeking mechanic depends on the player seeing
which shoulder the weapon is on, and a Y-flip has to visibly change the sprite.

### How it is drawn

```
SPRITE_PX = 40    // on-screen size in world px
SPRITE_SS = 3     // supersample: rasterised at 120px, downscaled to 40
TILE      = 32    // one floor tile
body radius = 10  // the collision circle, centred on the pivot
```

So a 64-unit viewBox maps to 40 screen px at zoom 1. **A 64x64 authoring unit is
0.625 screen px.** Anything thinner than ~2 viewBox units disappears. The
supersample means you get clean edges, not more detail.

The camera zoom ranges roughly 0.75–1.4. Assume **40px is the size that matters**
and check every design at that size — the contact sheet puts the 40px blit right
next to the study for exactly this reason.

## 3. The full asset list — 27 sprites

Names are the exact object keys. Do not rename, add, or drop keys without saying
so explicitly; the engine looks them up by string.

**Player and squad** (tinted `#4da3ff` player, `#3fc27e` squad)
| key | must read as |
|---|---|
| `player` | you — carbine in a two-handed grip, helmet, plate carrier |
| `squad_rifleman` | teammate with a carbine |
| `squad_breacher` | teammate with a shotgun — silhouette must differ from rifleman at 40px |
| `squad_support` | teammate with a belt-fed — bulkier, box magazine |
| `squad_shield` | ballistic shield, body mostly hidden behind it (**not currently spawned**) |

**Suspects** (tinted `#e05252`, except where noted)
| key | must read as |
|---|---|
| `enemy_guard` | standing guard, rifle |
| `enemy_patrol` | moving patrol, rifle |
| `enemy_elite` | hardened shooter — tinted `#b03a8c`, armoured |
| `enemy_taker` | hostage-taker — the one with the execution clock |
| `enemy_hvt` | the principal — tinted `#e8eef4`, unarmed, an objective not a target |
| `surrendered` | hands up, weapon dropped — tinted `#e0a852` |
| `cuffed` | face down, zip-cuffed — tinted `#8a8a8a` |

**Non-combatants**
| key | must read as |
|---|---|
| `hostage` | bound, seated or kneeling — tinted `#e8d44d` |
| `hostage_secured` | down flat and small, safe — tinted `#3fc27e`, collision radius drops 10→5 |
| `civilian` | cowering, no restraints — tinted `#c9a3e0` |
| `corpse` | any dead body, shown at 45% brightness of its faction colour |

**Night variants** (goggles down; **authored but never spawned yet**)
`player_nvg`, `squad_rifleman_nvg`, `squad_breacher_nvg`, `squad_support_nvg`,
`enemy_elite_nvg`

**Doors and props**
| key | must read as |
|---|---|
| `door_closed` | a door in its frame, shut |
| `door_open` | swung open |
| `door_breached` | blown off — frame and debris |
| `prop_flashbang` | a bang in flight |
| `prop_wallcharge` | a breaching charge on a wall |
| `prop_mirror` | the snake cam under a door |

## 4. Palette — these are the live values

**World**
```
floor, interior   #1d232a      floor, exterior   #151a16
wall              #39434d      wall edge         #4d5964
door closed       #8a6a3b      door open         #5c4a2e
door breached     #3a2f22      door locked       #8a3b3b
fog               rgba(5,7,9,0.80)     remembered layout  rgba(10,14,18,0.55)
```

**Factions** (these are what `#TEAMCOLOR` becomes)
```
player #4da3ff   squad #3fc27e   suspect #e05252   elite #b03a8c
HVT #e8eef4      surrendered #e0a852   cuffed #8a8a8a
hostage #e8d44d  hostage secured #3fc27e   civilian #c9a3e0
corpse = its faction colour at 45% brightness
```

**Materials** — walls are drawn in these, and each also has ballistic meaning
(what a round will and will not cross), so the colour has to carry that:
```
concrete   #39434d   stops everything
brick      #6b4a3f   stops most rifle ball
sheet metal#5a6570   rifle crosses it
wood       #6b5535   rifle crosses it
drywall    #4a5058   almost anything crosses it
glass      #7fc8e8   see through, shoot through, loud when broken
engine blk #2f3841   stops everything (car engines)
```

**Effects and HUD**
```
tracer #ffd27a   muzzle flash #fff2c0   blood #7a1f1f
HUD #cfd6dd   HUD dim #7f8b96   accent #e8b53a   danger #ff5555   ok #3fc27e
```

## 5. Render order — where art lands in the stack

1. Floor and wall tiles (only tiles that have *ever* been seen are drawn at all)
2. Decals, doors, props
3. Bodies (`drawBody`), grenades in flight
4. `drawFx("pre")` — blood and anything the fog should dim
5. **Fog**, punched through by the player's and every living squadmate's
   visibility polygon on an offscreen layer
6. Never-seen tiles: solid `#000` on top
7. Smoke, then the remembered-layout schematic
8. `drawFx("post")` — muzzle flashes, noise rings, light. Above the fog, because
   a muzzle flash dimmed 80% is not a muzzle flash
9. Shoulder pip, alert markers, HUD

**The consequence for art:** a sprite spends most of its life under an 80%-opacity
near-black wash, or fully hidden. Contrast that looks fine in a contact sheet
disappears in play. Look at `gameplay_frame_v0.15.png`.

## 6. What is actually wrong right now

This is the honest read on the current set, not a wish list.

1. **Value, not hue, is the problem.** Body outlines are `#14181c` against a
   `#1d232a` floor — roughly 3% apart in luminance. The silhouette has almost no
   edge. Everything solves through the tint, and the tint is the only thing
   carrying it.
2. **40px is where it falls apart.** The studies read well; the blits are dark
   smudges. Helmet shrouds, NVG mounts and rail detail are all under 2 screen px.
3. **Role does not read.** `squad_rifleman`, `squad_breacher` and `squad_support`
   share a silhouette and a tint, and differ only in a small weapon shape. At
   40px they are the same man three times. The player commands by role; the
   roles should be identifiable at a glance without reading the HUD panel.
4. **Suspect variants do not read either.** `enemy_guard`, `enemy_patrol` and
   `enemy_taker` are the same red silhouette. The taker is the one running an
   execution clock — he is the most important body on the screen and looks like
   the least important.
5. **Doors do not read as doors.** `door_closed` is a grey bar; at 40px on a dark
   floor it is indistinguishable from a wall segment. Doors are the single most
   tactically loaded object in the game.
6. **Nothing communicates state.** Alert, suppressed, reloading, blinded, and
   surrendering all currently ride on HUD overlays rather than the body.
7. **The overall frame is too dark and too uniform.** Interior and exterior floor
   are 4% apart. There is no read of "inside this building" versus "the street."

## 7. What a graphical pass should deliver

In priority order:

1. **A silhouette pass.** Make each of the 27 legible at 40px *in value alone* —
   convert to greyscale and it should still be identifiable. Rim light or a
   lighter edge against the dark floor is the obvious lever; a hard outline in a
   value clearly above the floor works too. Colour then reinforces identity
   rather than carrying it.
2. **Role differentiation by shape.** Breacher, support and rifleman should differ
   in overall outline, not in a 3px weapon detail. Same for guard / patrol /
   taker / elite.
3. **A revised world palette** that separates interior floor, exterior floor, and
   the seven materials by value as well as hue, and still survives the 80% fog
   wash. Propose values; do not assume the current ones are load-bearing. The
   material colours have to keep signalling what a round will cross.
4. **Optional, if you want to go further:** state variants (alert / suppressed),
   a door treatment that reads at 40px, and a proposal for what the smoke, blood
   and muzzle flash effects should look like against a revised palette.

## 8. How to hand work back

The sprite set lives in one block of the single-file HTML build, between these
exact markers:

```js
// Replace this whole block to swap art wholesale. --- BEGIN SPRITES ---
const SPRITES = {
  player: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64">...</svg>`,
  squad_rifleman: `<svg ...>`,
  // ... all 27 keys
};
// --- END SPRITES ---
```

**Deliver exactly that:** one `const SPRITES = { ... };` object literal with all
27 keys, drop-in replaceable. Keep the keys and the order. If you change the
palette too, deliver it separately as a `COLORS` object and a `MATERIALS` colour
list using the names in §4, so the two can be applied independently.

Do not deliver PNGs, an atlas, or a build step. Do not add dependencies. One
file, no network, still true.

## CHANGELOG
- v1.0 (2026-08-12): Written for a hand-off to a model with no repo access, against build v0.15.
