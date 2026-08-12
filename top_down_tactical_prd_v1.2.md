---
file: top_down_tactical_prd_v1.2.md
version: 1.2
author: Sam Cao
created: 2026-08-07
last_updated: 2026-08-11
description: Product requirements for a top-down Door Kickers 2-style tactical game where the player directly controls the point man (WASD + mouse aim/shoot) while commanding an AI squad through stacks, breaches, and hostage rescue.
ai_update: Update last_updated and version. Rename file to match. Append changelog at bottom.
---

# Top-Down Tactical (working title — game name TBD)

**Status:** PRD v1.2, synced to build v0.12 after the first human playtest. Research base: `tactical_research_v1.0.md`.

---

## 1. Problem / Premise

Door Kickers 2 is a puppeteer game: you plan, press play, and watch your troopers execute. SWAT 4 and Ready or Not put you in the stack, but in first person, with teammates you steer through menus. Police Stories gives you top-down direct control but caps the squad at one partner.

Nobody has shipped the middle: **a top-down tactical game where you ARE the point man — WASD to move, mouse to aim and shoot — while the rest of the squad stacks, breaches, and clears on your orders.** The research chapter on hybrids confirms the gap is real and the demand exists (DK's own forums ask for direct unit control).

The fantasy in one line: *stack your guys on the back door, breach the front yourself, and hit GO as you throw the bang.*

## 2. Core Design Thesis

**Every fight is decided before the trigger — by angles, doors, information, and where you put your people.**

- Lethality is high on both sides (1–3 rounds). Reflexes lose to preparation.
- Doors are decisions, not geometry: open / kick / charge / bang-first, each trading speed against noise against risk.
- Information is the scarcest resource: you see only what you see (LOS fog); the squad reports contacts; noise tells enemies about you.
- The squad multiplies you; it does not replace you. Orders are fast, few, and issued with the same cursor you aim with.
- Restraint is scored: arrests beat kills, civilians and hostages matter, surrendered suspects are protected by the score.

If a feature doesn't sharpen one of these, cut it.

## 3. Player Controls

Rewritten at v0.9-v0.12 after the first human playtest. Sam's note was "too many
controls all across the keyboard" and "controlling your squad is the hard part",
so the squad moved wholesale onto the right mouse button and eight bindings were
deleted (P, 1-7 as play calls, B, T, X, Z, and the hold-Tab command time).

| Input | Action |
|---|---|
| WASD | Move — the honest middle gait |
| Shift (hold) | Sprint — fast and loud, an 11° cone so you cannot shoot from it, and armour limits how long |
| Space (hold) | Steady — slow, silent, tightest cone |
| Mouse | Aim; operator faces cursor; camera leads toward cursor |
| LMB | Fire (spread blooms with movement, recoil, suppression and how hard you just turned) |
| Scroll | Swap primary ↔ sidearm — faster than a reload |
| R | Reload |
| E | Context: open/close door, cuff surrendered suspect, secure hostage |
| F | Kick door |
| C | Shout "hands up!" — compliance check on enemies with LOS |
| Q | Snake cam — under a closed door or over a window sill |
| H | Wall charge: plant on the wall you face, H again to detonate |
| N | Swap shoulder — peek the other side of a corner |
| Tab | Tactical pause — world freezes, orders still issuable |
| Esc | Menu |
| [ ] | Zoom |

**The grenade bag** — hold MMB, flick a direction, release to throw. Releasing
without a flick throws whatever is already selected.

| Flick | Throwable |
|---|---|
| ↑ | Frag — kills the room |
| ↓ | Concussion — overpressure; reaches around a corner a flashbang cannot see past |
| ← | Flashbang — blinds, no damage |
| → | Smoke — takes sight away, including yours |

**The squad** — one button. Right-click an operator to select or deselect him;
no selection means the whole team. Right-click anywhere else holds the wheel
open and drops the world to command speed.

| Input | Action |
|---|---|
| RMB on an operator | Select / deselect |
| RMB elsewhere, release with no flick | Go there — and breach the first closed door on the path |
| flick ↑ | **TAKE IT** — bang it and flood the room, to points of domination |
| flick → | **BOUND** — leapfrog, one element always still and watching |
| flick ↓ | **HOLD** — stop and cover; on a door, slice the pie; on a known contact, **SUPPRESS** |
| flick ← | **ON ME** — form the travel wedge and follow |
| V | Cycle ROE: hold / return fire / weapons free |
| 1 2 3 / 4 | Select by number, for anyone who prefers keys |

Design rules from research, all still holding: the cursor carries aim, camera and
command with no mode switch; every wheel slot names what it will do to the thing
actually under the cursor before you commit; a stack executes itself when it is
set, and multiple stacks wait for each other, so there is no GO key to press at
the one moment it could ever be correct to press it.

## 4. Success Criteria

The game works if a playtester says:
- "I stacked them on the office door, took the hallway myself, and both rooms broke at once when I hit X."
- "I died because I rushed the door instead of pieing it."
- "He surrendered because the bang went off and three guns were on him."
- "I heard the execution countdown and had to decide: charge now or lose the hostage."

It fails if the optimal play is soloing the map with the squad parked, or puppeteering the squad while the player character hides. Both halves must earn their keep.

## 5. Systems (v0.1 scope — all implemented)

### 5.1 Lethality & shooting
- Player 100 hp, squad 100, enemies 65; carbine ~34 dmg/round, AK ~26. No regen.
- Spread model: base + movement bloom (walking halves the penalty) + per-shot recoil with decay. Crosshair gap visualizes real spread at cursor distance.
- Bullets are fast projectiles with tracers; walls and closed doors stop them (doors chip). Anyone in the line can be hit — including hostages. Friendly-fire discipline: squad refuses shots that cross a teammate, civilian, or surrendered suspect.

### 5.2 Vision & information
- Player gets a raycast visibility polygon; outside it the world dims, never-seen space is black. Explored layout persists (memory).
- Squadmates spot independently and report: enemies they see render as ghost diamonds, not full contacts.
- Enemies have vision cones (110° idle, 150° alerted) and ranges that grow when alerted.

### 5.3 Noise
- Every action emits a radius: shots 560, breach charge 760, bang 700, kick 330, shout 260, running steps 100, quiet door 60 (px).
- Loud events alert; soft events make enemies investigate the sound's origin. Walking is silent.

### 5.4 Doors & breaching
- States: closed / open / breached; locked doors resist E (kick or charge only).
- Open (quiet), kick (instant, loud, staggers defenders behind), charge (squad breach: door ceases to exist, stuns through the doorway with LOS check — DK2's breach-kill zone, tuned to stun for arrest play). A slow animated door swing is future polish, not current behavior.
- Squad breach timeline on GO: door action → bang through the gap (if toggled) → staggered entry to interior clear points → shout for compliance → hold. Multiple stacks execute on the same GO.

### 5.5 Enemy AI
- States: idle/patrol → suspicious (investigate) → combat (reaction delay 0.42–0.85s, faster when alerted; burst fire with range-scaled error) → hunt last-known-position. Blind/staggered states from bangs, kicks, charges.
- Surrender: shout-driven compliance roll — base 10%, 55% if flashed, 28% if outgunned (2+ guns, not mid-attack), +18% for the last threat standing. Surrendered suspects are cuffable (E); killing them wrecks the score.
- **Feint surrender:** ~20% of surrenders are fake — the suspect re-arms after 2.5–5s unless cuffed first. Cuffing is urgent, not bookkeeping.
- **Hostage-taker:** once the map alerts, he moves to the hostages and a visible execution countdown (22s) runs — paused while he's blind, staggered, or fighting. Timer at zero with a hostage in reach = hostage dies = mission failed. The counter-play is pressure, not speed alone.

### 5.6 Squad AI
- Orders: follow / move-and-hold / stack / breach-on-GO. Stacks form on wall-hugging slots beside the frame; plan shows method + READY state above the door.
- Combat overlay: engage visible threats with 0.18–0.3s reaction — gated by ROE (under default return-fire, squadmates engage once the enemy attacks, the team is fired on, or the map alarm is up; pre-alarm they hold for the shout) — and never through friendlies; entries keep flowing while engaging (points-of-domination flood).
- Pathing opens unlocked doors quietly, kicks locked ones only when directly ordered through them.
- **Fire discipline (ROE):** hold / return fire (default) / weapons free, cycled with V per selection; breach entries are always weapons free; enemy gunfire opens a 4s return-fire window.

### 5.7 Missions & scoring (v0.1: four hostage-rescue maps, mission select + difficulty on menu)
- THE COMPOUND (one building, two entries) and SAFEHOUSE ROW (two buildings across an alley, hostages far east, locked back door).
- Win: all hostages secured (E in a cleared room) AND all threats dead or cuffed. Lose: player down, or any hostage dies.
- Debrief: time, arrests vs kills, surrendered-suspect kills, civilian deaths by your team, squad losses, shots, bangs, breaches. Grade S/A/B/C/D — arrests add, kills subtract, ROE violations subtract hard. Score-as-difficulty is the future difficulty knob (SWAT 4's 95/100 Elite model).

### 5.8 Shipped from the deferred list during burndown night 2026-08-07
- Slow-mo command time (hold Tab, 15% timescale; Space full pause kept).
- Squad ROE toggle (hold / return / free).
- Mirror-under-door peek (Q).
- Wall charges (player-carried, 2 per mission).
- Feint surrender.
- Synthesized WebAudio SFX (shots, breaches, bangs, shouts, hits — distance-attenuated, stereo-panned, zero assets).
- Second mission + mission select.

## 6. Deferred (future builds, ranked)

1. Go Silent mode for synced stealth takedowns; accessibility slider upgrading slow-mo to full pause.
2. More intel gear: drone, lockpicks, breaching shotgun; squad-carried wall charges and breach-method depth (charge kills vs stuns tuning).
3. Non-lethal arsenal (taser/beanbag/pepperball) with the no-universal-hard-stop balance rule.
4. Wandering civilians; destructible wall material tiers.
5. **Operator kits (R6-style, one verb + one constraint each) — explicitly out of the first build per Sam, 2026-08-07.** Enemy-side Siege concepts (traps, jammers, anchors/roamers) come first.
6. Ballistic penetration through doors/thin walls (DK2's declined #2 request — differentiation lever).
7. More maps; multi-floor with cutaway UI; pre-mission waypoint plans with go-codes you join as point man; campaign with named squadmates, persistent injuries, stress.

## 7. Anti-goals

- No Superhot time mechanics; no character-switching as a core verb; no full-map omniscient camera; no generic HUD mission timers (the executioner countdown is the only clock, because it drives a real decision); no player one-tap deaths (2–4 rounds, no regen).
- No multiplayer. No 3D. Title/theme decided later — mechanics first.

## 8. Tech

- Single self-contained HTML file per house style (`top_down_tactical_v0.x.html`), canvas 2D, no dependencies. Tile-grid world (32px), DDA raycasts for LOS and bullets, A* pathfinding, map validated at parse time. Headless smoke tests drive the sim in Node (map integrity, reachability, breach pipeline, combat sanity).

## CHANGELOG
- v1.0 (2026-08-07): Initial PRD, written from tactical_research_v1.0.md alongside prototype v0.1.
- v1.1 (2026-08-07, burndown night): Synced to shipped state — slow-mo command time, ROE, mirror peek, wall charges, feint surrender, audio, second mission + mission select moved from deferred to §5; deferred list renumbered; control table expanded (Q/H/Tab/V).
- v1.1.1 (2026-08-07, review pass): ROE engagement rule documented precisely; door-open honesty (no slow swing yet); Esc resume path; friendly fire now applies to teammates and cuffed suspects per 5.1.
- v1.2 (2026-08-11): Controls section rewritten around the command wheel, the grenade bag and the three gaits, after the first human playtest collapsed the squad layer onto the right mouse button and deleted eight bindings. Everything below §3 still describes the v0.1 scope and is next to sync.
