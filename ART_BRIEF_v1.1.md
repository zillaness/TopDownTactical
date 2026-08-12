---
file: ART_BRIEF_v1.1.md (top-down-tactical)
version: 1.1
author: Sam Cao
created: 2026-08-12
last_updated: 2026-08-12
description: Self-contained art direction brief for an external model with no repo access. Everything needed to do a graphical pass on the sprite set and the render palette, including the game mechanics the art has to serve.
ai_update: Update last_updated and bump version in frontmatter. Rename file to match. Append changelog at bottom.
---

# Art brief — Top-Down Tactical

**Read this as the whole spec.** It is written to be pasted into a model that
cannot see the repository. Nothing here depends on a file you do not have. Two
images ship alongside it and are the other half of the brief:

- `art/sprite_contact_sheet_v2.0.png` — all 27 current sprites, each shown at a
  120px study next to the actual 40px in-game blit, on the real floor colour.
- `art/gameplay_frame_v0.15.png` — an honest gameplay frame, fog and all.

You do not need any other document. §1.1 carries the game mechanics that bear on
art decisions; nothing else in the project would change what you draw.

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

### 1.1 The eight game facts that should change your decisions

You do not need the design docs. You do need these, because each one is a
constraint the art has to satisfy and none of them is guessable from the
screenshots.

1. **Reading the screen fast is the core skill.** A door opens, three bodies are
   revealed, and the player has under a second to decide shoot / arrest /
   protect / do-not-touch. Every legibility argument in this brief comes back to
   that one second.

2. **There are five body categories with different consequences, not two.**
   Shoot a suspect. **Arrest** one who has surrendered — worth more than killing
   him, and killing him after he surrenders is scored as an atrocity. **Protect**
   hostages and civilians. **Do not touch** the HVT; he is the objective. And
   already-neutralized bodies (cuffed, dead) are clutter that must not read as
   threats. Confusing any two of these is how a mission is failed, so they must
   be distinguishable in the same glance.

3. **The corner game is the signature mechanic, and it depends on the sprite.**
   A shooter's eye and muzzle sit off to his shooting shoulder, not on his
   centreline. Roll out around a corner on that side and your eye clears the
   wall while your body is still masked — you see them first. Roll out the wrong
   way and your body clears before your eye does. Enemies always test line of
   sight against the body centre, so that asymmetry *is* the mechanic. The
   player has to be able to see which shoulder his weapon is on at a glance, and
   handedness is randomised per operator. **This is why the Y-flip rule in §2
   matters and why a vertically symmetric sprite silently breaks the game.**

4. **There are three visibility states, not two.** Currently visible (full
   colour). **Remembered** — you walked through it, so you know where the doors
   and windows are, drawn as a faint schematic, but you do not know what is in
   there now. Never seen (solid black). On top of that sit last-known-position
   ghosts for contacts that moved out of view, and shared squad vision, so
   leaving a man covering a corner keeps that ground live. A palette proposal
   has to keep those three states clearly apart.

5. **Wall colour is load-bearing information.** Each material in §4 has a
   ballistic value: concrete stops everything, drywall stops almost nothing,
   glass lets you see and shoot through it. Players learn to read a wall and
   decide whether to shoot through it. If a repaint makes two materials look
   alike, it breaks a mechanic, not just a mood.

6. **Body count varies 0.65x to 2.3x by an enemy-density option.** The largest
   map is 74x42 tiles with thirty-six armed defenders at the top setting.
   Legibility has to survive a screen that crowded, at 60fps.

7. **Several important states currently have no visual at all.** Alerted,
   suppressed (taking incoming fire), reloading, blinded by a flashbang, and
   rules-of-engagement setting all live in HUD text today. So does **rank** —
   squadmates now carry persistent experience across missions and climb five
   tiers from BOOT to MASTER, and if one dies he loses all of it and is replaced
   by a boot. A veteran and a rookie currently look identical. There is an
   opening for a visual language there and it is wide open.

8. **Performance model, so you do not design something that cannot ship.** Each
   (sprite key, tint colour) pair is rasterised to an offscreen canvas **once at
   load** and blitted thereafter. Adding a new *tint* is nearly free. Adding a
   new *key* costs one raster. Per-frame SVG, per-frame filters, and per-entity
   unique colours are all off the table. State changes are better expressed as
   something the engine draws on top of the sprite than as thirty new keys — if
   you want a state variant, say so and say why it earns its raster.

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
4. **A door treatment that reads at 40px.** Doors are the most tactically loaded
   object in the game and currently look like wall segments. Closed / open /
   breached must be distinguishable instantly, and a locked door needs to read as
   locked before the player walks into it.
5. **Optional, if you want to go further:** a visual language for state — alerted,
   suppressed, and squad rank (see §1.1 item 7; a veteran and a boot look
   identical today, which is a gap worth filling). Bear the raster cost in mind
   and prefer something the engine can overlay. Also welcome: what smoke, blood
   and muzzle flash should look like against a revised palette.

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
- v1.1 (2026-08-12): Added §1.1, the eight game facts that change art decisions, so no second design document is needed. Doors promoted to a required deliverable; rank added as an open visual gap. Synced to v0.16.
