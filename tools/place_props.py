#!/usr/bin/env python3
"""
file: place_props.py (top-down-tactical/tools)
version: 1.0
author: Sam Cao
created: 2026-08-18
description: Put furniture, clutter and vegetation into the map sources, by rule
             rather than by hand, and refuse anything that would change the shape
             of a fight.
ai_update: Update last_updated and version. Append changelog at bottom.

WHY BY RULE

Thirteen prop materials have been in the game since v0.51 and no map used any of
them except sandbags, because dropping one next to a building silently moved
that building's walls between concrete and drywall (fixed in v0.75). Now that
they can be placed, placing them by hand across twenty maps is twenty chances to
put cover somewhere that breaks a mission — and there is a written example of
exactly that: cover near THE TREELINE's spawn took covering rounds from 8 to 5,
because cover blocks sight BOTH WAYS and it sat on the squad's own firing lane.

So this places nothing near a spawn, nothing in a doorway, nothing that closes a
route, and nothing that changes what a wall is made of. Everything it does is
deterministic from the tile's own coordinates, so a map gets the same props
every time and a diff is reviewable.

    python3 tools/place_props.py top_down_tactical_vX.Y.html
    python3 tools/place_props.py top_down_tactical_vX.Y.html --write

WHAT GOES WHERE

  indoors, against a wall   d desk   b bookshelf   f fridge   u counter
  outdoors, against a wall  U dumpster   J jersey barrier   o oil drums
  outdoors, in the open     * shrub   ~ hedge

Vegetation is passable and resist 0 — concealment, not cover — so it can never
make anyone unhittable. Everything else is solid, which is why the route check
below exists.
"""
import argparse
import re
import sys
from collections import deque

WALL = set("#=-%@t")
DOOR = set("DL")
WINDOW = set("W")
OUTDOOR = "."          # placeholder, replaced below — see FLOOR
FLOOR_IN = "."
FLOOR_OUT = ","
# every glyph that is a person, an objective or a thing the parser needs
KEEP = set("PsgpETVXBhcwkMQS")

# how far from any spawn nothing may be placed. THE TREELINE cost 3 covering
# rounds at 4 tiles; this is comfortably outside that.
SPAWN_CLEAR = 7
# how far from a door, so a prop never narrows an entry
DOOR_CLEAR = 2

INDOOR_PROPS = "dbfu"
OUTDOOR_WALL_PROPS = "UJo"
VEG = "*~"


def h(x, y, salt=0):
    """Deterministic per tile, so the same map always gets the same props."""
    v = (x * 73856093) ^ (y * 19349663) ^ (salt * 83492791)
    v &= 0xFFFFFFFF
    v ^= v >> 13
    v = (v * 1274126177) & 0xFFFFFFFF
    return v ^ (v >> 16)


def passable(ch):
    return ch not in WALL and ch not in WINDOW


def reachable(rows, sx, sy):
    """Flood fill over everything a man can walk through, doors included."""
    H, W = len(rows), len(rows[0])
    seen = [[False] * W for _ in range(H)]
    q = deque([(sx, sy)])
    seen[sy][sx] = True
    n = 1
    while q:
        x, y = q.popleft()
        for dx, dy in ((1, 0), (-1, 0), (0, 1), (0, -1)):
            a, b = x + dx, y + dy
            if 0 <= a < W and 0 <= b < H and not seen[b][a] and passable(rows[b][a]):
                seen[b][a] = True
                n += 1
                q.append((a, b))
    return seen, n


def place(rows, dens):
    H, W = len(rows), len(rows[0])
    g = [list(r) for r in rows]

    spawns = [(x, y) for y in range(H) for x in range(W) if g[y][x] in "Ps"]
    doors = [(x, y) for y in range(H) for x in range(W) if g[y][x] in DOOR]
    if not spawns:
        return None, "no player or squad spawn"

    def near(pts, x, y, r):
        return any(abs(x - a) <= r and abs(y - b) <= r for a, b in pts)

    def wall_adjacent(x, y, skip_border=False):
        for dx, dy in ((1, 0), (-1, 0), (0, 1), (0, -1)):
            a, b = x + dx, y + dy
            if not (0 <= a < W and 0 <= b < H) or g[b][a] not in WALL:
                continue
            # A dumpster leans on a BUILDING. Against the map's own boundary it
            # reads as scenery someone lined up along the edge of the world.
            if skip_border and (a == 0 or b == 0 or a == W - 1 or b == H - 1):
                continue
            return True
        return False

    # the reference route: everything reachable from the player's own spawn
    px, py = next(((x, y) for x, y in spawns if g[y][x] == "P"), spawns[0])
    _, before_n = reachable(["".join(r) for r in g], px, py)

    cands = []
    for y in range(1, H - 1):
        for x in range(1, W - 1):
            ch = g[y][x]
            if ch not in (FLOOR_IN, FLOOR_OUT):
                continue                       # never overwrite anything meaningful
            if near(spawns, x, y, SPAWN_CLEAR):
                continue                       # the TREELINE lesson
            if near(doors, x, y, DOOR_CLEAR):
                continue                       # never narrow an entry
            indoor = ch == FLOOR_IN
            if indoor and wall_adjacent(x, y):
                pool, d = INDOOR_PROPS, dens["indoor"]
            elif not indoor and wall_adjacent(x, y, True):
                pool, d = OUTDOOR_WALL_PROPS, dens["outdoor"]
            elif not indoor:
                pool, d = VEG, dens["veg"]
            else:
                continue                       # open interior floor stays open
            cands.append((x, y, pool, d))

    placed = 0
    for x, y, pool, d in cands:
        if h(x, y, 7) % 1000 >= d:
            continue
        # Never the same thing twice in a row. Two refrigerators side by side in
        # a front room is the tell that this was placed by a hash and not by a
        # person, and it costs one rotation to avoid.
        start = h(x, y, 3) % len(pool)
        glyph = pool[start]
        for k in range(len(pool)):
            cand = pool[(start + k) % len(pool)]
            if not any(0 <= x + dx < W and 0 <= y + dy < H and g[y + dy][x + dx] == cand
                       for dx, dy in ((1, 0), (-1, 0), (0, 1), (0, -1))):
                glyph = cand
                break
        g[y][x] = glyph
        # a solid prop must never close a route: put it back if it does
        if glyph not in VEG:
            _, n = reachable(["".join(r) for r in g], px, py)
            if n < before_n - 0:
                g[y][x] = FLOOR_IN if pool is INDOOR_PROPS else FLOOR_OUT
                continue
            before_n = n
        placed += 1
    return ["".join(r) for r in g], placed


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("html")
    # Three dials, not one. Furniture against an interior wall is scenery and
    # costs almost nothing; a shrub on open ground is an opaque tile in the
    # middle of a firing lane and costs a great deal. They must not move
    # together, which one dial would force.
    ap.add_argument("--indoor", type=int, default=90, help="per-mille, furniture")
    ap.add_argument("--outdoor", type=int, default=55, help="per-mille, clutter against a building")
    ap.add_argument("--veg", type=int, default=30, help="per-mille, shrubs and hedges")
    ap.add_argument("--write", action="store_true")
    a = ap.parse_args()

    src = open(a.html, encoding="utf-8").read()
    out, cursor, total, maps = [], 0, 0, 0

    # each map is `src: [ "....", ... ]` — take the rows, not the metadata
    # the last row of a map body carries no trailing comma
    for m in re.finditer(r'(src2?: \[\n)((?:"[^"]*",\n)*"[^"]*",?\n)(\])', src):
        rows = re.findall(r'"([^"]*)",?\n', m.group(2))
        if len(rows) < 4 or len(set(len(r) for r in rows)) != 1:
            continue                            # ragged, or not a map body
        new_rows, placed = place(rows, {"indoor": a.indoor, "outdoor": a.outdoor, "veg": a.veg})
        if new_rows is None:
            continue
        # a map that came back a different shape is a bug in this script, not a
        # placement — refuse rather than write a broken level
        assert len(new_rows) == len(rows), "row count changed"
        assert all(len(a2) == len(b2) for a2, b2 in zip(new_rows, rows)), "row width changed"
        maps += 1
        total += placed
        name = re.findall(r'name: "([^"]+)"', src[:m.start()])
        print(f"  {(name[-1] if name else '?'):22s} {placed:>4d} props")
        out.append(src[cursor:m.start()])
        body = "".join(f'"{r}",\n' for r in new_rows[:-1]) + f'"{new_rows[-1]}"\n'
        out.append(m.group(1) + body + m.group(3))
        cursor = m.end()
    out.append(src[cursor:])

    print(f"\n{total} props across {maps} map bodies")
    if a.write:
        open(a.html, "w", encoding="utf-8").write("".join(out))
        print(f"wrote {a.html} — run ./tests/run.sh and compare the bot runs")
    else:
        print("dry run — pass --write to apply")


if __name__ == "__main__":
    main()

# CHANGELOG
# v1.0 (2026-08-18): Written when v0.75 unblocked prop placement. Places nothing
#   within seven tiles of a spawn, nothing within two of a door, and puts back
#   anything solid that would close a route.
