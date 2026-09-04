---
file: README.md (raycaster/assets/incoming)
version: 1.0
author: Sam Cao
created: 2026-09-04
last_updated: 2026-09-04
description: Drop point and specification for raycaster art, mirroring the sound drop convention the game already uses.
ai_update: Update last_updated and version. Append changelog at bottom. Do NOT inline anything from here without measuring the wire cost first.
---

# Raycaster art drop

Put source art in this directory and push. Nothing here is loaded at runtime:
the POC is one self-contained HTML file with no external requests, ever, so
anything used gets inlined as a data URI by a tool run, and anything unused
costs nothing.

This mirrors `assets/incoming/sound/` in the game: a defined landing spot with
a written budget, so a drop can be checked before it is spent.

## How to get files here

Either drag them into the Claude conversation directly, or copy them into this
directory in your local clone and push the branch. Both work. The second is
better for anything you want kept, because it is versioned.

## What the renderer can currently use

The POC is a column raycaster. It does not have a general sprite system yet, so
art lands in one of four slots:

| slot | what it is | needed size | notes |
|---|---|---|---|
| wall textures | one square image per material | 64x64 (2x of a 32px tile) | concrete, brick, wood, drywall, sheet metal, glass, door. Currently procedural. |
| figure sheet | a man, seen from 8 facings | 64 wide x 96 tall per frame | this is the big one. See below. |
| weapon viewmodel | the gun in your hands | 512 wide x 420 tall | one per primary: carbine, smg, shotgun, saw, dmr, pistol. Plus a shouldered pose if you have one. |
| effects | muzzle flash, impact spark, blood, frag burst | 96x96 | alpha, additive-friendly |

### The figure sheet matters most

Enemies are drawn from where they are looking relative to you, because that is
what tells you whether you have been spotted. Eight facings is what makes that
work: **front, front-quarter left and right, profile left and right,
rear-quarter left and right, rear.** If the art only has one facing, it will
look worse than what is in the build now, which is drawn in code and turns.

## Conventions, taken from the game's art brief

- Authored at **2x**: one 32px tile is 64px of art.
- **Alpha first**, with **magenta** (`#FF00FF`) as the named fallback key.
- **WebP over indexed PNG** for anything photographic, but measure rather than
  assume: it was 3x on the game's car frames and only 7% on its doors, where
  container overhead dominates.

## The budget, and it is real

The game enforces **1.25MiB over the wire (gzip -9)** and its suite fails if you
break it. The raycaster is currently **about 28KB over the wire**, so there is
room, but "there is room" is not a licence to skip measuring. Every drop gets
weighed before and after:

```
gzip -9 -c raycaster/raycaster_poc_v*.html | wc -c
```

## What I need from you alongside the files

Say what they depict and at what size. A folder of images with no note costs a
round trip to work out whether they are walls, men, guns, or concept art.

## CHANGELOG
- v1.0 (2026-09-04): Created, because "give me a space to upload" had no answer
  and the art at `C:\Users\Sam\Documents\Codex\2026-09-03\can-x20\outputs` is
  not reachable from any sandbox.
