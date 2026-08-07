"use strict";
// =====================================================================
// TOP-DOWN TACTICAL v0.1 — single-file prototype
// Section index (fill order):
//   S1  constants & tuning
//   S2  math & geometry helpers
//   S3  level data (tile map, doors, spawns)
//   S4  grid raycasting & visibility
//   S5  input state
//   S6  entity base + player operator
//   S7  weapons, projectiles, grenades
//   S8  doors & breaching
//   S9  enemy & civilian AI
//   S10 squad AI & orders
//   S11 rendering
//   S12 game state, mission logic, loop, HUD
// =====================================================================

// ---------------------------------------------------------------- S1 constants
const TILE = 32;                 // px per tile
const TAU = Math.PI * 2;

const TUNE = {
  // movement (px/s)
  playerRun: 148, playerWalk: 76,
  squadRun: 140, squadWalk: 80,
  enemyWalk: 70, enemyRun: 132,
  civilianRun: 96,
  bodyRadius: 10,

  // camera
  camLead: 0.32, camLeadMax: 110, camLerp: 8,

  // vision
  playerViewDist: 620,
  aiViewDist: 400, aiFov: deg(110),
  aiViewDistAlert: 520, aiFovAlert: deg(150),
  losRays: 280,

  // player weapon (carbine)
  rifle: { dmg: 34, rpm: 640, mag: 30, reload: 1.9, speed: 1500,
           spreadBase: deg(1.2), spreadMove: deg(5.5), spreadWalkMove: deg(2.4),
           recoil: deg(1.1), recoilMax: deg(7), recoilDecay: deg(14), range: 900 },
  // enemy weapon
  akm:   { dmg: 26, rpm: 420, mag: 30, reload: 2.6, speed: 1300,
           spreadBase: deg(3.2), spreadMove: deg(8), burst: [2, 5], burstPause: [0.5, 1.1], range: 800 },

  // lethality
  playerHp: 100, squadHp: 100, enemyHp: 65,

  // enemy reaction: seconds from first LOS acquisition to first shot
  enemyReact: [0.42, 0.85], enemyReactAlert: [0.25, 0.5],
  squadReact: [0.18, 0.3],

  // noise radii (px)
  noiseShot: 560, noiseKick: 330, noiseBreach: 760, noiseShout: 260,
  noiseRunStep: 100, noiseDoor: 60, noiseBangBlast: 700,

  // flashbang
  bangFuse: 1.0, bangRadius: 230, bangThrowSpeed: 420,
  bangBlindEnemy: 3.6, bangBlindFriendly: 1.1, bangSurrenderBonus: 0.45,

  // doors
  doorHp: 60, doorOpenTime: 0.45, doorKickStun: 0.5, chargeStunRadius: 190, chargeStun: 2.2,

  // surrender / compliance
  surrenderBase: 0.10,          // per shout, unmodified
  surrenderFlashed: 0.55,       // shouted at while flashed
  surrenderOutgunned: 0.28,     // shouted at with 2+ guns on target & target not aiming
  surrenderLastMan: 0.18,       // bonus when last threat alive
  executionTimer: 22,           // s after hostage-taker alerted until execution

  // squad
  stackSlotGap: 26, goBangDelay: 0.55, squadShootHoldover: 0.35,
};

function deg(d) { return d * Math.PI / 180; }

const COLORS = {
  floorIn: "#1d232a", floorOut: "#151a16", wall: "#39434d", wallEdge: "#4d5964",
  doorClosed: "#8a6a3b", doorOpen: "#5c4a2e", doorBreached: "#3a2f22", doorLocked: "#8a3b3b",
  player: "#4da3ff", squad: "#3fc27e", enemy: "#e05252", surrendered: "#e0a852", cuffed: "#8a8a8a",
  hostage: "#e8d44d", civilian: "#c9a3e0", corpse: "#5a3030",
  tracer: "#ffd27a", muzzle: "#fff2c0", blood: "#7a1f1f",
  fog: "rgba(5,7,9,0.86)", memory: "rgba(10,14,18,0.55)",
  hud: "#cfd6dd", hudDim: "#7f8b96", accent: "#e8b53a", danger: "#ff5555", ok: "#3fc27e",
};

// ---------------------------------------------------------------- S2 math
function clamp(v, a, b) { return v < a ? a : v > b ? b : v; }
function lerp(a, b, t) { return a + (b - a) * t; }
function dist(ax, ay, bx, by) { const dx = bx - ax, dy = by - ay; return Math.hypot(dx, dy); }
function angleTo(ax, ay, bx, by) { return Math.atan2(by - ay, bx - ax); }
function angDiff(a, b) { let d = (b - a) % TAU; if (d > Math.PI) d -= TAU; if (d < -Math.PI) d += TAU; return d; }
function angLerp(a, b, t) { return a + angDiff(a, b) * clamp(t, 0, 1); }
function rand(a, b) { return a + Math.random() * (b - a); }
function randIn(pair) { return rand(pair[0], pair[1]); }
function pick(arr) { return arr[(Math.random() * arr.length) | 0]; }
function tileAt(x, y) { return { tx: Math.floor(x / TILE), ty: Math.floor(y / TILE) }; }

// Circle vs tile-grid collision: move (x,y,r) by (dx,dy), sliding along walls.
// solidFn(tx,ty) -> true if tile blocks movement.
function moveCircle(x, y, r, dx, dy, solidFn) {
  // axis-separated so we slide instead of sticking
  x = sweepAxis(x, y, r, dx, 0, solidFn).x;
  const res = sweepAxis(x, y, r, 0, dy, solidFn);
  return { x: res.x, y: res.y };
}
function sweepAxis(x, y, r, dx, dy, solidFn) {
  let nx = x + dx, ny = y + dy;
  const minTx = Math.floor((Math.min(x, nx) - r) / TILE), maxTx = Math.floor((Math.max(x, nx) + r) / TILE);
  const minTy = Math.floor((Math.min(y, ny) - r) / TILE), maxTy = Math.floor((Math.max(y, ny) + r) / TILE);
  for (let ty = minTy; ty <= maxTy; ty++) for (let tx = minTx; tx <= maxTx; tx++) {
    if (!solidFn(tx, ty)) continue;
    const cx = clamp(nx, tx * TILE, tx * TILE + TILE), cy = clamp(ny, ty * TILE, ty * TILE + TILE);
    const ddx = nx - cx, ddy = ny - cy, d2 = ddx * ddx + ddy * ddy;
    if (d2 < r * r) {
      if (dx !== 0) nx = dx > 0 ? tx * TILE - r - 0.01 : tx * TILE + TILE + r + 0.01;
      if (dy !== 0) ny = dy > 0 ? ty * TILE - r - 0.01 : ty * TILE + TILE + r + 0.01;
    }
  }
  return { x: nx, y: ny };
}

// DDA raycast against the tile grid. blockFn(tx,ty) -> true if tile blocks the ray.
// Returns { x, y, d, hit } — first blocked-tile boundary hit, or endpoint at maxDist.
function raycast(x0, y0, ang, maxDist, blockFn) {
  const dx = Math.cos(ang), dy = Math.sin(ang);
  let tx = Math.floor(x0 / TILE), ty = Math.floor(y0 / TILE);
  const stepX = dx > 0 ? 1 : -1, stepY = dy > 0 ? 1 : -1;
  const tDeltaX = dx !== 0 ? Math.abs(TILE / dx) : Infinity;
  const tDeltaY = dy !== 0 ? Math.abs(TILE / dy) : Infinity;
  let tMaxX = dx !== 0 ? ((dx > 0 ? (tx + 1) * TILE - x0 : x0 - tx * TILE) / Math.abs(dx)) : Infinity;
  let tMaxY = dy !== 0 ? ((dy > 0 ? (ty + 1) * TILE - y0 : y0 - ty * TILE) / Math.abs(dy)) : Infinity;
  let t = 0;
  if (blockFn(tx, ty)) return { x: x0, y: y0, d: 0, hit: true };
  while (t < maxDist) {
    if (tMaxX < tMaxY) { t = tMaxX; tMaxX += tDeltaX; tx += stepX; }
    else               { t = tMaxY; tMaxY += tDeltaY; ty += stepY; }
    if (t > maxDist) break;
    if (blockFn(tx, ty)) return { x: x0 + dx * t, y: y0 + dy * t, d: t, hit: true };
  }
  return { x: x0 + dx * maxDist, y: y0 + dy * maxDist, d: maxDist, hit: false };
}

// Straight-line LOS between two points against blockFn. True if unobstructed.
function lineOfSight(ax, ay, bx, by, blockFn) {
  const d = dist(ax, ay, bx, by);
  if (d < 1) return true;
  return !raycast(ax, ay, angleTo(ax, ay, bx, by), d - 1, blockFn).hit;
}

// A* over the tile grid. passFn(tx,ty) -> traversable. costFn optional extra cost.
// Returns array of {tx,ty} from start to goal (inclusive), or null.
function astar(sx, sy, gx, gy, passFn, costFn) {
  if (!passFn(gx, gy)) return null;
  const key = (x, y) => x + "," + y;
  const open = new MinHeap();
  const gScore = new Map(), came = new Map();
  const h = (x, y) => (Math.abs(x - gx) + Math.abs(y - gy)) * 1.001;
  gScore.set(key(sx, sy), 0);
  open.push({ x: sx, y: sy, f: h(sx, sy) });
  const DIRS = [[1,0],[-1,0],[0,1],[0,-1],[1,1],[1,-1],[-1,1],[-1,-1]];
  let iter = 0;
  while (open.size() && iter++ < 20000) {
    const cur = open.pop();
    if (cur.x === gx && cur.y === gy) {
      const path = [{ tx: gx, ty: gy }];
      let k = key(gx, gy);
      while (came.has(k)) { const p = came.get(k); path.push({ tx: p.x, ty: p.y }); k = key(p.x, p.y); }
      return path.reverse();
    }
    const cg = gScore.get(key(cur.x, cur.y));
    for (const [ox, oy] of DIRS) {
      const nx = cur.x + ox, ny = cur.y + oy;
      if (!passFn(nx, ny)) continue;
      if (ox !== 0 && oy !== 0 && (!passFn(cur.x + ox, cur.y) || !passFn(cur.x, cur.y + oy))) continue; // no corner cutting
      const step = (ox !== 0 && oy !== 0 ? 1.4142 : 1) + (costFn ? costFn(nx, ny) : 0);
      const ng = cg + step, nk = key(nx, ny);
      if (gScore.has(nk) && gScore.get(nk) <= ng) continue;
      gScore.set(nk, ng); came.set(nk, cur);
      open.push({ x: nx, y: ny, f: ng + h(nx, ny) });
    }
  }
  return null;
}

class MinHeap {
  constructor() { this.a = []; }
  size() { return this.a.length; }
  push(n) { const a = this.a; a.push(n); let i = a.length - 1;
    while (i > 0) { const p = (i - 1) >> 1; if (a[p].f <= a[i].f) break; [a[p], a[i]] = [a[i], a[p]]; i = p; } }
  pop() { const a = this.a, top = a[0], last = a.pop();
    if (a.length) { a[0] = last; let i = 0;
      for (;;) { const l = i * 2 + 1, r = l + 1; let m = i;
        if (l < a.length && a[l].f < a[m].f) m = l;
        if (r < a.length && a[r].f < a[m].f) m = r;
        if (m === i) break; [a[m], a[i]] = [a[i], a[m]]; i = m; } }
    return top; }
}

// ---------------------------------------------------------------- S3 level
// Legend: # wall  , exterior  . interior  D door  L locked door
//         P player  s squad  g guard  p patroller  T hostage-taker  h hostage  c civilian
const MAPS = [
{ name: "THE COMPOUND", brief: "One building, two entries, executioner deep", src: [
"##############################################",
"#,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,#",
"#,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,#",
"#,,,,,,,,,##############################D###,#",
"#,,,,,,,,,#.......#..........#.......#.....#,#",
"#,,,,,,,,,#.......#..........#.......#.....#,#",
"#,,,,,,,,,#.......#.......c..#.......#.....#,#",
"#,,,,,,,,,#.......#..........#.......#.....#,#",
"#,,,,,,,,,#.......#....g.....#...g...#..g..#,#",
"#,,,,,,,,,#.......#..........#.......#.....#,#",
"#,,,,,,,,,#.......#..........#.......#.....#,#",
"#,,,,,,,,,####D####..........#.......#.....#,#",
"#,,,,,,,,,#.......#..........#.......#.....#,#",
"#,,,,,,,,,#....g..####D########D######L#####,#",
"#,,s,,,,,,#................................#,#",
"#,,,P,,,,,D..............p.................#,#",
"#,,s,s,,,,#................................#,#",
"#,,,,,,,,,#.......######D###########D#######,#",
"#,,,,,,,,,#.......#............#...........#,#",
"#,,,,,,,,,####D####............#...........#,#",
"#,,,,,,,,,#.......#............#........h..#,#",
"#,,,,,,,,,#.......#......p.....#.....T.....#,#",
"#,,,,,,,,,#..c....#............#.......h...#,#",
"#,,,,,,,,,#.......#............#...........#,#",
"#,,,,,,,,,#.......#............#...........#,#",
"#,,,,,,,,,#.......#............#...........#,#",
"#,,,,,,,,,##################################,#",
"#,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,#",
"#,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,#",
"##############################################",
] },
{ name: "SAFEHOUSE ROW", brief: "Two buildings, an alley crossing, hostages far east", src: [
"##############################################",
"#,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,#",
"#,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,#",
"#,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,#",
"#,,,,,,,,,,,,,,,,,,,,,,,,,####L############,,#",
"#,,,,,,,,,,,,,,,,,,,,,,,,,#.......#.......#,,#",
"#,,,,,###############,,,,,#.......#.....h.#,,#",
"#,,,,,#.............#,,,,,#...g...#.......#,,#",
"#,,,,,#.............#,,,,,#.......#...T...#,,#",
"#,,,,,#...g.........#,,,,,#.......D.......#,,#",
"#,,,,,D.............#,,,,,#.......#.....h.#,,#",
"#,,,,,#.............#,,,,,#.......#.......#,,#",
"#,,,,,#.............#,,,,,#.......#.......#,,#",
"#,s,,,#.............#,,,,,#.......#.......#,,#",
"#,,,,,#######D#######,,,,,#.......####D####,,#",
"#,,P,,#.............#,,,,,#.......#.......#,,#",
"#,,,,,#.............#,,,,,#...p...#.......#,,#",
"#,s,s,#.............#,,,,,#.......#.......#,,#",
"#,,,,,#.....p.......#,,,,,#.......#.......#,,#",
"#,,,,,#.............#,,,,,#.......D.......#,,#",
"#,,,,,#.........c...#,,,,,D.......#...g...#,,#",
"#,,,,,#.............#,,,,,#.......#.......#,,#",
"#,,,,,#.............#,,,,,#.c.....#.......#,,#",
"#,,,,,####D##########,,,,,#.......#.......#,,#",
"#,,,,,,,,,,,,,,,,,,,,,,,,,#.......#.......#,,#",
"#,,,,,,,,,,,,,,,,,,,,,,,,,#################,,#",
"#,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,#",
"#,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,#",
"#,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,#",
"##############################################",
] },
];
let MAP_SRC = MAPS[0].src;
// hard-fail on malformed map data rather than rendering garbage
(function validateMap() {
  for (const m of MAPS) {
    const w = m.src[0].length;
    m.src.forEach((row, y) => {
      if (row.length !== w) throw new Error(`${m.name} row ${y} length ${row.length} != ${w}`);
      if (!/^[#,.DLPsgphcT]+$/.test(row)) throw new Error(`${m.name} row ${y} has an unknown tile char`);
    });
  }
})();

const ROOM_NAMES = { }; // filled after flood fill; index -> label

const level = {
  w: 0, h: 0,
  wall: [],      // 1 = structural wall
  interior: [],  // 1 = interior floor (for render + room logic)
  room: [],      // room id per tile (0 = exterior/none)
  doors: [],     // Door objects
  doorAt: new Map(), // "tx,ty" -> Door
  spawns: { player: null, squad: [], enemies: [], hostages: [], civilians: [] },
};

function parseLevel() {
  const rows = MAP_SRC;
  level.h = rows.length; level.w = rows[0].length;
  level.doors = []; level.doorAt = new Map();
  level.spawns = { player: null, squad: [], enemies: [], hostages: [], civilians: [] };
  level.wall = Array.from({ length: level.h }, () => new Array(level.w).fill(0));
  level.interior = Array.from({ length: level.h }, () => new Array(level.w).fill(0));
  level.room = Array.from({ length: level.h }, () => new Array(level.w).fill(0));
  for (let y = 0; y < level.h; y++) for (let x = 0; x < level.w; x++) {
    const ch = rows[y][x];
    const cx = x * TILE + TILE / 2, cy = y * TILE + TILE / 2;
    if (ch === "#") { level.wall[y][x] = 1; continue; }
    if (ch === "D" || ch === "L") {
      const horiz = (rows[y][x - 1] === "#" || rows[y][x + 1] === "#");
      const door = { tx: x, ty: y, orient: horiz ? "h" : "v", state: "closed",
                     locked: ch === "L", hp: TUNE.doorHp, open: 0 };
      level.doors.push(door); level.doorAt.set(x + "," + y, door);
      continue;
    }
    if (ch !== ",") level.interior[y][x] = 1;
    if (ch === "P") level.spawns.player = { x: cx, y: cy };
    else if (ch === "s") level.spawns.squad.push({ x: cx, y: cy });
    else if (ch === "g") level.spawns.enemies.push({ x: cx, y: cy, kind: "guard" });
    else if (ch === "p") level.spawns.enemies.push({ x: cx, y: cy, kind: "patrol" });
    else if (ch === "T") level.spawns.enemies.push({ x: cx, y: cy, kind: "taker" });
    else if (ch === "h") level.spawns.hostages.push({ x: cx, y: cy });
    else if (ch === "c") level.spawns.civilians.push({ x: cx, y: cy });
  }
  // flood-fill room ids over walkable tiles; doors are boundaries between rooms
  let nextRoom = 1;
  for (let y = 0; y < level.h; y++) for (let x = 0; x < level.w; x++) {
    if (level.wall[y][x] || level.room[y][x] || level.doorAt.has(x + "," + y)) continue;
    const id = nextRoom++;
    const q = [[x, y]];
    level.room[y][x] = id;
    while (q.length) {
      const [qx, qy] = q.pop();
      for (const [ox, oy] of [[1,0],[-1,0],[0,1],[0,-1]]) {
        const nx = qx + ox, ny = qy + oy;
        if (nx < 0 || ny < 0 || nx >= level.w || ny >= level.h) continue;
        if (level.wall[ny][nx] || level.room[ny][nx] || level.doorAt.has(nx + "," + ny)) continue;
        level.room[ny][nx] = id; q.push([nx, ny]);
      }
    }
  }
  // door tiles get a room id too (either side is fine for lookups)
  for (const d of level.doors) {
    for (const [ox, oy] of [[1,0],[-1,0],[0,1],[0,-1]]) {
      const r = level.room[d.ty + oy] && level.room[d.ty + oy][d.tx + ox];
      if (r) { level.room[d.ty][d.tx] = r; break; }
    }
  }
}

function inBounds(tx, ty) { return tx >= 0 && ty >= 0 && tx < level.w && ty < level.h; }
function isWall(tx, ty) { return !inBounds(tx, ty) || level.wall[ty][tx] === 1; }
function doorAt(tx, ty) { return level.doorAt.get(tx + "," + ty); }

// blocks movement: walls + closed/locked doors (open or breached doors pass)
function solidForMove(tx, ty) {
  if (isWall(tx, ty)) return true;
  const d = doorAt(tx, ty);
  return !!(d && d.state === "closed");
}
// blocks sight: walls + closed doors
function opaque(tx, ty) {
  if (isWall(tx, ty)) return true;
  const d = doorAt(tx, ty);
  return !!(d && d.state === "closed");
}
// pathfinding traversability: doors are traversable (AI opens them); walls not
function passForPath(tx, ty) { return !isWall(tx, ty); }
// extra path cost: closed doors cost time; locked doors are near-forbidden for squad
function pathCostSquad(tx, ty) {
  const d = doorAt(tx, ty); if (!d) return 0;
  if (d.state !== "closed") return 0.2;
  return d.locked ? 60 : 4;
}
function pathCostEnemy(tx, ty) {
  const d = doorAt(tx, ty); if (!d) return 0;
  return d.state === "closed" ? 3 : 0.2;
}
function roomAt(x, y) { const t = tileAt(x, y); return inBounds(t.tx, t.ty) ? level.room[t.ty][t.tx] : 0; }

// ---------------------------------------------------------------- S4 visibility
// Player gets a full lit visibility polygon. Squadmates contribute entity-level
// spotting only ("contact pings") — you see what YOU see; the squad reports.
const seen = { grid: null, init() { this.grid = Array.from({ length: level.h }, () => new Array(level.w).fill(0)); } };

function computeVisPolygon(x, y, maxDist) {
  const pts = [];
  const n = TUNE.losRays;
  for (let i = 0; i < n; i++) {
    const ang = (i / n) * TAU;
    const hit = raycast(x, y, ang, maxDist, opaque);
    pts.push(hit);
    // mark seen tiles along the ray (memory / explored map); fine step so no tile is skipped
    const stepLen = TILE * 0.35;
    const steps = Math.ceil(hit.d / stepLen);
    for (let s = 0; s <= steps; s++) {
      const sx = x + Math.cos(ang) * Math.min(hit.d, s * stepLen);
      const sy = y + Math.sin(ang) * Math.min(hit.d, s * stepLen);
      const tx = Math.floor(sx / TILE), ty = Math.floor(sy / TILE);
      if (inBounds(tx, ty)) seen.grid[ty][tx] = 1;
    }
    const hx = Math.floor(hit.x / TILE), hy = Math.floor(hit.y / TILE);
    if (inBounds(hx, hy)) seen.grid[hy][hx] = 1; // the wall face itself
  }
  return pts;
}

// Entity-to-entity sight: range + (optional) FOV cone + wall/door occlusion.
function canSee(ax, ay, bx, by, maxDist, faceAng, fovArc) {
  const d = dist(ax, ay, bx, by);
  if (d > maxDist) return false;
  if (faceAng !== undefined) {
    const da = Math.abs(angDiff(faceAng, angleTo(ax, ay, bx, by)));
    if (da > fovArc / 2) return false;
  }
  return lineOfSight(ax, ay, bx, by, opaque);
}

// Is this entity visible to the player side? Returns "direct" | "squad" | null.
function visibleToPlayerSide(ent) {
  if (game.player.alive && canSee(game.player.x, game.player.y, ent.x, ent.y, TUNE.playerViewDist)) return "direct";
  for (const s of game.squad) {
    if (s.alive && canSee(s.x, s.y, ent.x, ent.y, TUNE.aiViewDistAlert, s.face, deg(160))) return "squad";
  }
  return null;
}

// ---------------------------------------------------------------- S5 input
const input = {
  keys: new Set(), mouse: { x: 0, y: 0, wx: 0, wy: 0, down: false, rdown: false },
  justPressed: new Set(),
};
window.addEventListener("keydown", e => {
  if (e.repeat) return;
  const k = e.key.toLowerCase();
  input.keys.add(k); input.justPressed.add(k);
  if (["tab", " "].includes(k)) e.preventDefault();
});
window.addEventListener("keyup", e => input.keys.delete(e.key.toLowerCase()));
window.addEventListener("blur", () => input.keys.clear());
const canvas = document.getElementById("game");
canvas.addEventListener("mousemove", e => { input.mouse.x = e.clientX; input.mouse.y = e.clientY; });
canvas.addEventListener("mousedown", e => {
  if (e.button === 0) { input.mouse.down = true; input.justPressed.add("lmb"); }
  if (e.button === 2) { input.mouse.rdown = true; input.justPressed.add("rmb"); }
});
window.addEventListener("mouseup", e => {
  if (e.button === 0) input.mouse.down = false;
  if (e.button === 2) input.mouse.rdown = false;
});
canvas.addEventListener("contextmenu", e => e.preventDefault());
function pressed(k) { return input.justPressed.has(k); }
function held(k) { return input.keys.has(k); }

// ---------------------------------------------------------------- S6 player
function makeShooter(x, y, side, hp, weapon) {
  return {
    x, y, r: TUNE.bodyRadius, face: 0, hp, maxHp: hp, alive: true, side,
    weapon, ammo: weapon.mag, reloading: 0, cooldown: 0, recoil: 0,
    blind: 0, stagger: 0, moving: false, walking: false,
  };
}

function makePlayer(sp) {
  const p = makeShooter(sp.x, sp.y, "player", TUNE.playerHp, TUNE.rifle);
  p.bangs = 3; p.charges = 2; p.shoutCd = 0;
  return p;
}

function currentSpread(s) {
  const t = s.weapon;
  let sp = t.spreadBase + s.recoil;
  if (s.moving) sp += s.walking ? (t.spreadWalkMove ?? t.spreadMove * 0.45) : t.spreadMove;
  return sp;
}

function updatePlayer(p, dt) {
  if (!p.alive) return;
  p.blind = Math.max(0, p.blind - dt);
  p.stagger = Math.max(0, p.stagger - dt);
  p.shoutCd = Math.max(0, p.shoutCd - dt);

  // movement
  let dx = (held("d") ? 1 : 0) - (held("a") ? 1 : 0);
  let dy = (held("s") ? 1 : 0) - (held("w") ? 1 : 0);
  p.walking = held("shift");
  p.moving = dx !== 0 || dy !== 0;
  if (p.moving && p.stagger <= 0) {
    const len = Math.hypot(dx, dy); dx /= len; dy /= len;
    const spd = p.walking ? TUNE.playerWalk : TUNE.playerRun;
    const res = moveCircle(p.x, p.y, p.r, dx * spd * dt, dy * spd * dt, solidForMove);
    p.x = res.x; p.y = res.y;
    if (!p.walking) emitFootstepNoise(p, dt);
  }

  // aim
  p.face = angleTo(p.x, p.y, input.mouse.wx, input.mouse.wy);

  // weapon
  updateShooterWeapon(p, dt);
  if (input.mouse.down && p.blind <= 0 && p.stagger <= 0) tryFire(p, p.face);
  if (pressed("r")) tryReload(p);

  // interactions
  if (pressed("e")) playerInteract(p);
  if (pressed("f")) {
    const d = nearestDoor(p.x, p.y, 56);
    if (d && d.state === "closed") kickDoor(d, p);
  }
  if (pressed("g") && p.bangs > 0) { throwBang(p, input.mouse.wx, input.mouse.wy); p.bangs--; }
  if (pressed("c") && p.shoutCd <= 0) shoutCompliance(p);
  if (pressed("h")) {
    if (game.wallCharge) detonateWallCharge();
    else if (p.charges > 0) plantWallCharge(p);
    else game.hint = "No wall charges left";
  }
  if (pressed("q")) {
    const d = nearestDoor(p.x, p.y, 52);
    if (d && d.state === "closed") {
      const n = doorNormal(d, p.x, p.y);
      const c = doorCenter(d);
      const behind = roomAt(c.x - n.x * TILE, c.y - n.y * TILE);
      if (behind) {
        game.mirror = { room: behind, t: 4 };
        addNoise(c.x, c.y, TUNE.noiseDoor, "door", "player");
        game.hint = "Mirror under the door — contacts marked";
      }
    }
  }
}

function playerInteract(p) {
  // priority: cuff surrendered > secure hostage > door
  const arr = nearestEntity(game.enemies, p.x, p.y, 46, e => e.alive && e.state === "surrender");
  if (arr) { cuffEnemy(arr); return; }
  const hos = nearestEntity(game.hostages, p.x, p.y, 46, h => h.alive && !h.secured);
  if (hos) { trySecureHostage(hos); return; }
  const d = nearestDoor(p.x, p.y, 50);
  if (d) {
    if (d.state === "closed") { if (!d.locked) openDoor(d, true); else game.hint = "Locked — kick [F] or order a charge"; }
    else if (d.state === "open") closeDoor(d);
  }
}

function nearestEntity(list, x, y, maxD, filter) {
  let best = null, bd = maxD;
  for (const e of list) { if (filter && !filter(e)) continue;
    const d = dist(x, y, e.x, e.y); if (d < bd) { bd = d; best = e; } }
  return best;
}

function emitFootstepNoise(ent, dt) {
  ent._stepAcc = (ent._stepAcc || 0) + dt;
  if (ent._stepAcc > 0.38) { ent._stepAcc = 0; addNoise(ent.x, ent.y, TUNE.noiseRunStep, "steps", ent.side); }
}

function shoutCompliance(p) {
  p.shoutCd = 1.4;
  addNoise(p.x, p.y, TUNE.noiseShout, "shout", "player");
  sfxAt("shout", p.x, p.y);
  game.fx.push({ kind: "shout", x: p.x, y: p.y, t: 0.5, max: 0.5 });
  for (const e of game.enemies) {
    if (!e.alive || e.state === "surrender" || e.state === "cuffed") continue;
    if (dist(p.x, p.y, e.x, e.y) > 320) continue;
    if (!lineOfSight(p.x, p.y, e.x, e.y, opaque)) continue;
    trySurrender(e);
  }
}

// ---------------------------------------------------------------- S7 weapons
function updateShooterWeapon(s, dt) {
  s.cooldown = Math.max(0, s.cooldown - dt);
  s.recoil = Math.max(0, s.recoil - (s.weapon.recoilDecay ?? deg(10)) * dt);
  if (s.reloading > 0) {
    s.reloading -= dt;
    if (s.reloading <= 0) { s.ammo = s.weapon.mag; s.reloading = 0; }
  }
}

function tryReload(s) {
  if (s.reloading <= 0 && s.ammo < s.weapon.mag) { s.reloading = s.weapon.reload; sfxAt("click", s.x, s.y); }
}

function tryFire(s, ang) {
  if (s.cooldown > 0 || s.reloading > 0 || !s.alive) return false;
  if (s.ammo <= 0) { tryReload(s); return false; }
  s.ammo--; s.cooldown = 60 / s.weapon.rpm;
  s.recoil = Math.min(s.weapon.recoilMax ?? deg(6), s.recoil + (s.weapon.recoil ?? deg(1.4)));
  const spread = currentSpread(s);
  const a = ang + rand(-spread / 2, spread / 2);
  game.bullets.push({
    x: s.x + Math.cos(a) * (s.r + 4), y: s.y + Math.sin(a) * (s.r + 4),
    ang: a, speed: s.weapon.speed, dmg: s.weapon.dmg, side: s.side,
    traveled: 0, range: s.weapon.range, alive: true, owner: s,
  });
  game.fx.push({ kind: "muzzle", x: s.x + Math.cos(ang) * (s.r + 6), y: s.y + Math.sin(ang) * (s.r + 6), ang, t: 0.05, max: 0.05 });
  addNoise(s.x, s.y, TUNE.noiseShot, "shot", s.side);
  sfxAt("shot", s.x, s.y);
  if (s.side === "player") { game.stats.shotsFired++; game.camKick = Math.min(6, game.camKick + 1.6); }
  if (s.side === "enemy") game.underFireT = 4;   // squad "return fire" window
  return true;
}

function updateBullets(dt) {
  for (const b of game.bullets) {
    if (!b.alive) continue;
    let step = b.speed * dt;
    if (b.traveled + step > b.range) step = b.range - b.traveled;
    const nx = b.x + Math.cos(b.ang) * step, ny = b.y + Math.sin(b.ang) * step;
    // wall / closed-door hit
    const hit = raycast(b.x, b.y, b.ang, step, opaque);
    let ex = nx, ey = ny, stopped = false;
    if (hit.hit) { ex = hit.x; ey = hit.y; stopped = true;
      const t = tileAt(ex + Math.cos(b.ang), ey + Math.sin(b.ang));
      const d = doorAt(t.tx, t.ty);
      if (d && d.state === "closed") damageDoor(d, b.dmg * 0.5);
      game.fx.push({ kind: "spark", x: ex, y: ey, t: 0.12, max: 0.12 });
    }
    // entity hit along segment
    const victim = firstEntityOnSegment(b, ex, ey);
    if (victim) { applyHit(victim.ent, b, victim.x, victim.y); stopped = true; ex = victim.x; ey = victim.y; }
    game.fx.push({ kind: "tracer", x: b.x, y: b.y, x2: ex, y2: ey, t: 0.06, max: 0.06 });
    b.x = ex; b.y = ey; b.traveled += step;
    if (stopped || b.traveled >= b.range) b.alive = false;
  }
  game.bullets = game.bullets.filter(b => b.alive);
}

function firstEntityOnSegment(b, ex, ey) {
  let best = null, bestD = Infinity;
  const candidates = [];
  if (b.side !== "player" && b.side !== "squad") { candidates.push(game.player, ...game.squad); }
  if (b.side !== "enemy") candidates.push(...game.enemies.filter(e => e.state !== "cuffed"));
  candidates.push(...game.hostages, ...game.civilians); // everyone can hit a bystander
  for (const ent of candidates) {
    if (!ent || !ent.alive || ent === b.owner) continue;
    const hit = segCircle(b.x, b.y, ex, ey, ent.x, ent.y, ent.r);
    if (hit && hit.d < bestD) { bestD = hit.d; best = { ent, x: hit.x, y: hit.y }; }
  }
  return best;
}

function segCircle(x1, y1, x2, y2, cx, cy, r) {
  const dx = x2 - x1, dy = y2 - y1, len2 = dx * dx + dy * dy;
  if (len2 === 0) return null;
  const t = clamp(((cx - x1) * dx + (cy - y1) * dy) / len2, 0, 1);
  const px = x1 + dx * t, py = y1 + dy * t;
  if (dist(px, py, cx, cy) > r) return null;
  return { x: px, y: py, d: t * Math.sqrt(len2) };
}

function applyHit(ent, b, hx, hy) {
  ent.hp -= b.dmg * rand(0.85, 1.15);
  game.fx.push({ kind: "blood", x: hx, y: hy, ang: b.ang, t: 0.4, max: 0.4 });
  sfxAt("hit", hx, hy);
  game.decals.push({ x: hx + Math.cos(b.ang) * rand(2, 14), y: hy + Math.sin(b.ang) * rand(2, 14), r: rand(3, 7) });
  if (ent.side === "enemy" && ent.state !== "combat" && ent.state !== "surrender" && ent.state !== "cuffed") alertEnemy(ent, hx, hy);
  if (ent.hp <= 0) killEntity(ent, b.side);
  else if (ent.side === "player") game.camKick = Math.min(10, game.camKick + 5);
}

function killEntity(ent, bySide) {
  if (!ent.alive) return;
  ent.alive = false;
  if (ent.side === "enemy") {
    if (ent.state === "surrender" || ent.state === "cuffed") game.stats.surrenderedKilled++;
    game.stats.kills++;
  }
  if (ent.side === "squad") game.stats.squadLost++;
  if (ent.side === "civ") { game.stats.civsKilled++; if (bySide === "player" || bySide === "squad") game.stats.civsKilledByUs++; }
  if (ent.side === "hostage") game.stats.hostagesDead++;
  if (ent.side === "player") { /* handled in mission fail check */ }
  addNoise(ent.x, ent.y, 120, "bodyfall", ent.side);
  sfxAt("thud", ent.x, ent.y);
}

// ---- flashbangs
function throwBang(thrower, txw, tyw) {
  const ang = angleTo(thrower.x, thrower.y, txw, tyw);
  const d = Math.min(dist(thrower.x, thrower.y, txw, tyw), 420);
  game.bangs.push({
    x: thrower.x + Math.cos(ang) * (thrower.r + 6), y: thrower.y + Math.sin(ang) * (thrower.r + 6),
    vx: Math.cos(ang) * TUNE.bangThrowSpeed, vy: Math.sin(ang) * TUNE.bangThrowSpeed,
    fuse: TUNE.bangFuse, travelLeft: d, side: thrower.side,
  });
  addNoise(thrower.x, thrower.y, 80, "throw", thrower.side);
}

function updateBangs(dt) {
  for (const g of game.bangs) {
    g.fuse -= dt;
    if (g.travelLeft > 0) {
      let step = Math.min(g.travelLeft, Math.hypot(g.vx, g.vy) * dt);
      const ang = Math.atan2(g.vy, g.vx);
      const hit = raycast(g.x, g.y, ang, step, solidForMove);
      if (hit.hit) { // bounce: reflect off the wall face, damp
        const wallNormalIsX = Math.abs(hit.x - g.x) > Math.abs(hit.y - g.y);
        if (wallNormalIsX) g.vx *= -0.4; else g.vy *= -0.4;
        g.x = hit.x - Math.cos(ang) * 2; g.y = hit.y - Math.sin(ang) * 2;
        g.travelLeft *= 0.4;
      } else { g.x = hit.x; g.y = hit.y; g.travelLeft -= step; }
    }
    if (g.fuse <= 0) detonateBang(g);
  }
  game.bangs = game.bangs.filter(g => g.fuse > 0);
}

function detonateBang(g) {
  game.fx.push({ kind: "flash", x: g.x, y: g.y, t: 0.5, max: 0.5 });
  addNoise(g.x, g.y, TUNE.noiseBangBlast, "bang", g.side);
  sfxAt("bang", g.x, g.y);
  game.camKick = Math.min(12, game.camKick + 6);
  const affect = (ent, dur) => {
    if (!ent.alive) return;
    if (dist(g.x, g.y, ent.x, ent.y) > TUNE.bangRadius) return;
    if (!lineOfSight(g.x, g.y, ent.x, ent.y, opaque)) return;
    ent.blind = Math.max(ent.blind, dur);
    ent.stagger = Math.max(ent.stagger, dur * 0.6);
    if (ent.side === "enemy") { ent.flashedRecently = TUNE.bangBlindEnemy; alertEnemy(ent, g.x, g.y); }
  };
  for (const e of game.enemies) affect(e, TUNE.bangBlindEnemy);
  affect(game.player, TUNE.bangBlindFriendly);
  for (const s of game.squad) affect(s, TUNE.bangBlindFriendly);
  for (const c of game.civilians) affect(c, TUNE.bangBlindEnemy * 0.7);
  game.stats.bangsUsed++;
}

// ---------------------------------------------------------------- S8 doors
function doorCenter(d) { return { x: d.tx * TILE + TILE / 2, y: d.ty * TILE + TILE / 2 }; }

function nearestDoor(x, y, maxD) {
  let best = null, bd = maxD;
  for (const d of level.doors) {
    const c = doorCenter(d);
    const dd = dist(x, y, c.x, c.y);
    if (dd < bd) { bd = dd; best = d; }
  }
  return best;
}

function openDoor(d, quiet) {
  if (d.state !== "closed") return;
  d.state = "open"; d.locked = false;
  const c = doorCenter(d);
  addNoise(c.x, c.y, quiet ? TUNE.noiseDoor : TUNE.noiseKick * 0.6, "door", "neutral");
  sfxAt("door", c.x, c.y);
}

function closeDoor(d) {
  if (d.state !== "open") return;
  // don't close a door on top of someone
  const c = doorCenter(d);
  const everyone = [game.player, ...game.squad, ...game.enemies, ...game.hostages, ...game.civilians];
  for (const e of everyone) if (e && e.alive && dist(c.x, c.y, e.x, e.y) < TILE * 0.8) return;
  d.state = "closed";
  addNoise(c.x, c.y, TUNE.noiseDoor, "door", "neutral");
}

function kickDoor(d, by) {
  if (d.state !== "closed") return;
  d.state = "open"; d.locked = false;
  const c = doorCenter(d);
  addNoise(c.x, c.y, TUNE.noiseKick, "kick", by ? by.side : "neutral");
  game.fx.push({ kind: "slam", x: c.x, y: c.y, t: 0.25, max: 0.25 });
  sfxAt("kick", c.x, c.y);
  // brief stagger for anyone right behind the door
  for (const e of game.enemies) {
    if (e.alive && dist(c.x, c.y, e.x, e.y) < 70) e.stagger = Math.max(e.stagger, TUNE.doorKickStun);
  }
  game.camKick = Math.min(8, game.camKick + 2.5);
}

function damageDoor(d, dmg) {
  if (d.state !== "closed") return;
  d.hp -= dmg;
  if (d.hp <= 0) { d.state = "breached"; d.locked = false;
    const c = doorCenter(d);
    addNoise(c.x, c.y, TUNE.noiseKick, "doorbreak", "neutral"); }
}

function chargeDoor(d, by) {
  // explosive breach: door gone, loud, stuns through the doorway
  if (d.state === "breached") return;
  d.state = "breached"; d.locked = false;
  const c = doorCenter(d);
  addNoise(c.x, c.y, TUNE.noiseBreach, "breach", by ? by.side : "squad");
  game.fx.push({ kind: "explosion", x: c.x, y: c.y, t: 0.5, max: 0.5 });
  sfxAt("breach", c.x, c.y);
  game.camKick = Math.min(14, game.camKick + 9);
  for (const e of [...game.enemies, ...game.civilians]) {
    if (!e.alive) continue;
    if (dist(c.x, c.y, e.x, e.y) > TUNE.chargeStunRadius) continue;
    if (!lineOfSight(c.x, c.y, e.x, e.y, opaque)) continue;
    e.stagger = Math.max(e.stagger, TUNE.chargeStun);
    e.blind = Math.max(e.blind, TUNE.chargeStun * 0.8);
    if (e.side === "enemy") { e.flashedRecently = TUNE.chargeStun; alertEnemy(e, c.x, c.y); }
  }
}

// ---- wall charges (make your own door)
function plantWallCharge(p) {
  const tx = Math.floor((p.x + Math.cos(p.face) * 38) / TILE);
  const ty = Math.floor((p.y + Math.sin(p.face) * 38) / TILE);
  if (!isWall(tx, ty)) { game.hint = "Face a wall to plant a charge"; return; }
  if (tx <= 0 || ty <= 0 || tx >= level.w - 1 || ty >= level.h - 1) { game.hint = "That wall is structural"; return; }
  if (doorAt(tx, ty)) return;
  p.charges--;
  game.wallCharge = { tx, ty };
  game.hint = "Charge set — [H] to blow it";
  sfxAt("click", p.x, p.y);
}

function detonateWallCharge() {
  const wc = game.wallCharge; if (!wc) return;
  game.wallCharge = null;
  level.wall[wc.ty][wc.tx] = 0;   // the wall ceases to exist; LOS, bullets, and pathing all update via the live grid
  const cx = wc.tx * TILE + TILE / 2, cy = wc.ty * TILE + TILE / 2;
  game.fx.push({ kind: "explosion", x: cx, y: cy, t: 0.5, max: 0.5 });
  game.decals.push({ x: cx + rand(-8, 8), y: cy + rand(-8, 8), r: rand(6, 10) });
  addNoise(cx, cy, TUNE.noiseBreach, "breach", "player");
  sfxAt("breach", cx, cy);
  game.camKick = Math.min(14, game.camKick + 9);
  for (const e of [...game.enemies, ...game.civilians]) {
    if (!e.alive) continue;
    if (dist(cx, cy, e.x, e.y) > TUNE.chargeStunRadius) continue;
    if (!lineOfSight(cx, cy, e.x, e.y, opaque)) continue;
    e.stagger = Math.max(e.stagger, TUNE.chargeStun);
    e.blind = Math.max(e.blind, TUNE.chargeStun * 0.8);
    if (e.side === "enemy") { e.flashedRecently = TUNE.chargeStun; alertEnemy(e, cx, cy); }
  }
  game.stats.breaches++;
}

// ---- noise
function addNoise(x, y, radius, type, side) {
  game.noises.push({ x, y, radius, type, side });
}

// ---------------------------------------------------------------- S9 enemy & civilian AI
function makeEnemy(sp) {
  const e = makeShooter(sp.x, sp.y, "enemy", TUNE.enemyHp, TUNE.akm);
  e.kind = sp.kind;                  // guard | patrol | taker
  e.state = "idle";                  // idle | suspicious | hunt | combat | surrender | cuffed
  e.alerted = false;
  e.target = null; e.reactT = 0; e.lastKnown = null;
  e.burstLeft = 0; e.burstPauseT = 0;
  e.investigate = null; e.investigateWait = 0;
  e.path = null; e.pathI = 0; e.repathT = 0;
  e.homeFace = rand(0, TAU); e.face = e.homeFace;
  e.wanderT = rand(2, 6);
  e.flashedRecently = 0;
  return e;
}

function alertEnemy(e, x, y) {
  if (!e.alive || e.state === "surrender" || e.state === "cuffed") return;
  e.alerted = true;
  game.alarm = true;
  if (e.state !== "combat") { e.state = "suspicious"; e.investigate = { x, y }; e.investigateWait = 0; e.path = null; }
}

function updateEnemy(e, dt) {
  if (!e.alive) return;
  e.blind = Math.max(0, e.blind - dt);
  e.stagger = Math.max(0, e.stagger - dt);
  e.flashedRecently = Math.max(0, e.flashedRecently - dt);
  if (e.state === "surrender" && e.feint && e.blind <= 0 && e.stagger <= 0) {
    e.feintT -= dt;
    if (e.feintT <= 0) {   // the surrender was fake — back up with the weapon
      e.feint = false; e.state = "suspicious"; e.alerted = true;
      e.investigate = { x: game.player.x, y: game.player.y }; e.investigateWait = 1;
      game.fx.push({ kind: "shout", x: e.x, y: e.y, t: 0.5, max: 0.5 });
      sfxAt("shout", e.x, e.y);
    }
  }
  if (e.state === "surrender" || e.state === "cuffed") return;
  updateShooterWeapon(e, dt);

  // --- target acquisition (blind enemies can't acquire)
  let vis = null, visD = Infinity;
  if (e.blind <= 0) {
    const threats = [game.player, ...game.squad];
    for (const t of threats) {
      if (!t || !t.alive) continue;
      const fov = e.alerted ? TUNE.aiFovAlert : TUNE.aiFov;
      const vd = e.alerted ? TUNE.aiViewDistAlert : TUNE.aiViewDist;
      if (canSee(e.x, e.y, t.x, t.y, vd, e.face, fov)) {
        const d = dist(e.x, e.y, t.x, t.y);
        if (d < visD) { visD = d; vis = t; }
      }
    }
  }

  if (vis) {
    if (e.state !== "combat") {
      e.state = "combat"; e.reactT = randIn(e.alerted ? TUNE.enemyReactAlert : TUNE.enemyReact);
      e.alerted = true; game.alarm = true;
    }
    e.target = vis; e.lastKnown = { x: vis.x, y: vis.y };
  } else if (e.state === "combat") {
    e.state = "hunt"; e.path = null; e.repathT = 0;
  }

  switch (e.state) {
    case "combat": {
      const t = e.target;
      e.face = angLerp(e.face, angleTo(e.x, e.y, t.x, t.y), dt * 10);
      e.reactT -= dt;
      if (e.reactT <= 0 && e.stagger <= 0) {
        if (e.burstLeft <= 0 && e.burstPauseT <= 0) {
          e.burstLeft = Math.round(randIn(e.weapon.burst));
          e.burstPauseT = 0;
        }
        if (e.burstLeft > 0) {
          const aimErr = deg(2.5) * (visD / 300);
          if (tryFire(e, angleTo(e.x, e.y, t.x, t.y) + rand(-aimErr, aimErr))) {
            e.burstLeft--;
            if (e.burstLeft <= 0) e.burstPauseT = randIn(e.weapon.burstPause);
          }
        }
      }
      e.burstPauseT = Math.max(0, e.burstPauseT - dt);
      if (e.ammo <= 0 && e.reloading <= 0) tryReload(e);
      break;
    }
    case "hunt": {
      if (!e.lastKnown) { e.state = e.alerted ? "suspicious" : "idle"; break; }
      const arrived = moveAlongPath(e, e.lastKnown.x, e.lastKnown.y, TUNE.enemyRun, dt, pathCostEnemy);
      if (arrived) { e.lastKnown = null; e.state = "suspicious"; e.investigate = null; e.investigateWait = 1.2; }
      break;
    }
    case "suspicious": {
      if (e.investigate) {
        e.face = angLerp(e.face, angleTo(e.x, e.y, e.investigate.x, e.investigate.y), dt * 6);
        e.investigateWait += dt;
        if (e.investigateWait > 0.7) {
          const arrived = moveAlongPath(e, e.investigate.x, e.investigate.y, TUNE.enemyWalk * 1.4, dt, pathCostEnemy);
          if (arrived) { e.investigate = null; e.investigateWait = 1.6; }
        }
      } else {
        e.investigateWait -= dt;
        e.face += dt * 1.1; // scan around
        if (e.investigateWait <= 0) e.state = "idle";
      }
      break;
    }
    case "idle": {
      if (e.kind === "patrol") {
        e.wanderT -= dt;
        if (e.wanderT <= 0 && !e.path) {
          const spot = randomInteriorSpot();
          if (spot) { e._wanderGoal = spot; }
          e.wanderT = rand(5, 10);
        }
        if (e._wanderGoal) {
          const arrived = moveAlongPath(e, e._wanderGoal.x, e._wanderGoal.y, TUNE.enemyWalk, dt, pathCostEnemy);
          if (arrived) e._wanderGoal = null;
        }
      } else {
        e.face = angLerp(e.face, e.homeFace, dt * 2);
      }
      break;
    }
  }

  // hostage-taker: run to a hostage once the alarm is up
  if (e.kind === "taker" && game.alarm && e.state !== "combat" && e.state !== "hunt") {
    const h = nearestEntity(game.hostages, e.x, e.y, 1e9, h => h.alive && !h.secured);
    if (h && dist(e.x, e.y, h.x, h.y) > 40) {
      moveAlongPath(e, h.x, h.y, TUNE.enemyRun, dt, pathCostEnemy);
      e.state = e.state === "suspicious" ? "suspicious" : e.state;
    }
  }
}

// shared path-walking for AI; returns true when arrived
function moveAlongPath(e, gx, gy, speed, dt, costFn) {
  if (e.stagger > 0) return false;
  e.repathT -= dt;
  const gt = tileAt(gx, gy);
  if (!e.path || e.repathT <= 0) {
    const st = tileAt(e.x, e.y);
    e.path = astar(st.tx, st.ty, gt.tx, gt.ty, passForPath, costFn);
    e.pathI = 0; e.repathT = 1.2;
    if (!e.path) return dist(e.x, e.y, gx, gy) < TILE;
  }
  // advance along path
  while (e.pathI < e.path.length) {
    const node = e.path[e.pathI];
    const nx = node.tx * TILE + TILE / 2, ny = node.ty * TILE + TILE / 2;
    if (dist(e.x, e.y, nx, ny) < TILE * 0.4) { e.pathI++; continue; }
    // open closed doors in the way
    const d = doorAt(node.tx, node.ty);
    if (d && d.state === "closed" && dist(e.x, e.y, nx, ny) < TILE * 1.3) {
      if (e.side === "enemy" || !d.locked) openDoor(d, true);
      else if (d.locked) { kickDoor(d, e); }
    }
    const ang = angleTo(e.x, e.y, nx, ny);
    if (e.state !== "combat") e.face = angLerp(e.face, ang, dt * 8);
    const res = moveCircle(e.x, e.y, e.r, Math.cos(ang) * speed * dt, Math.sin(ang) * speed * dt, solidForMove);
    e.x = res.x; e.y = res.y;
    if (speed > 100 && e.side !== "enemy") emitFootstepNoise(e, dt);
    return false;
  }
  // tile path exhausted — close the last stretch to the exact goal point
  const gd = dist(e.x, e.y, gx, gy);
  if (gd > 6) {
    const ang = angleTo(e.x, e.y, gx, gy);
    if (e.state !== "combat") e.face = angLerp(e.face, ang, dt * 8);
    const res = moveCircle(e.x, e.y, e.r, Math.cos(ang) * Math.min(speed * dt, gd), Math.sin(ang) * Math.min(speed * dt, gd), solidForMove);
    e.x = res.x; e.y = res.y;
    return dist(e.x, e.y, gx, gy) < 8;
  }
  return true;
}

function randomInteriorSpot() {
  for (let i = 0; i < 40; i++) {
    const tx = (Math.random() * level.w) | 0, ty = (Math.random() * level.h) | 0;
    if (level.interior[ty] && level.interior[ty][tx] && !level.wall[ty][tx] && !doorAt(tx, ty))
      return { x: tx * TILE + TILE / 2, y: ty * TILE + TILE / 2 };
  }
  return null;
}

function trySurrender(e) {
  if (!e.alive || e.state === "surrender" || e.state === "cuffed") return false;
  let p = TUNE.surrenderBase;
  if (e.blind > 0 || e.flashedRecently > 0) p = TUNE.surrenderFlashed;
  else {
    let guns = 0;
    for (const t of [game.player, ...game.squad]) {
      if (t && t.alive && canSee(t.x, t.y, e.x, e.y, 500)) guns++;
    }
    if (guns >= 2 && (e.state !== "combat" || e.reactT > 0)) p = Math.max(p, TUNE.surrenderOutgunned);
  }
  const threatsLeft = game.enemies.filter(x => x.alive && x.state !== "surrender" && x.state !== "cuffed").length;
  if (threatsLeft <= 1) p += TUNE.surrenderLastMan;
  if (Math.random() < p) {
    e.state = "surrender"; e.path = null; e.burstLeft = 0;
    e.feint = Math.random() < 0.2;          // some surrenders are fake — cuff them before they re-arm
    e.feintT = rand(2.5, 5);
    game.fx.push({ kind: "surrender", x: e.x, y: e.y, t: 0.8, max: 0.8 });
    sfxAt("surrender", e.x, e.y);
    return true;
  }
  alertEnemy(e, game.player.x, game.player.y);
  return false;
}

function cuffEnemy(e) {
  if (e.state !== "surrender") return;
  e.state = "cuffed"; e.feint = false;
  game.stats.arrests++;
  game.hint = "Suspect cuffed";
}

function trySecureHostage(h) {
  const room = roomAt(h.x, h.y);
  const danger = game.enemies.some(e => e.alive && e.state !== "surrender" && e.state !== "cuffed" && roomAt(e.x, e.y) === room);
  if (danger) { game.hint = "Clear the room before securing"; return; }
  h.secured = true;
  game.stats.hostagesSecured++;
  game.hint = "Hostage secured";
}

// civilians & hostages just cower; they die if hit
function makeCivilian(sp, isHostage) {
  return { x: sp.x, y: sp.y, r: 9, face: rand(0, TAU), hp: 40, alive: true,
           side: isHostage ? "hostage" : "civ", secured: false, blind: 0, stagger: 0, cower: 0 };
}
function updateCivilian(c, dt) {
  if (!c.alive) return;
  c.blind = Math.max(0, c.blind - dt);
  c.stagger = Math.max(0, c.stagger - dt);
  if (game.alarm) c.cower = Math.min(1, c.cower + dt * 2);
}

// noise propagation → enemy hearing (called once per frame, then cleared)
function processNoises() {
  for (const n of game.noises) {
    if (n.side === "enemy") continue; // enemies don't spook themselves
    const loud = n.type === "shot" || n.type === "bang" || n.type === "breach" || n.type === "doorbreak";
    for (const e of game.enemies) {
      if (!e.alive || e.state === "combat" || e.state === "surrender" || e.state === "cuffed") continue;
      if (dist(n.x, n.y, e.x, e.y) > n.radius) continue;
      if (loud) alertEnemy(e, n.x, n.y);
      else if (e.state === "idle") { e.state = "suspicious"; e.investigate = { x: n.x, y: n.y }; e.investigateWait = 0; }
    }
  }
  game.noises = [];
}

// ---------------------------------------------------------------- S10 squad
const SQUAD_NAMES = ["REYES", "OKAFOR", "DANE"];

function makeSquaddie(sp, i) {
  const w = { ...TUNE.rifle, spreadBase: deg(2.0), rpm: 480 };
  const s = makeShooter(sp.x, sp.y, "squad", TUNE.squadHp, w);
  s.name = SQUAD_NAMES[i] || "OP" + i;
  s.order = { type: "follow" };
  s.path = null; s.pathI = 0; s.repathT = 0;
  s.reactT = 0; s.engaged = null; s.shoutedAt = 0; s.state = "idle";
  s.roe = "return"; // hold | return | free
  return s;
}

function doorNormal(d, fromX, fromY) {
  const c = doorCenter(d);
  if (d.orient === "h") return { x: 0, y: Math.sign(fromY - c.y) || 1 };
  return { x: Math.sign(fromX - c.x) || 1, y: 0 };
}

function stackSlots(d, fromX, fromY) {
  const c = doorCenter(d);
  const n = doorNormal(d, fromX, fromY);
  const lat = { x: n.y === 0 ? 0 : 1, y: n.x === 0 ? 0 : 1 }; // perpendicular (along the wall)
  const base = { x: c.x + n.x * TILE * 0.95, y: c.y + n.y * TILE * 0.95 };
  const mk = (lx) => ({ x: base.x + lat.x * lx, y: base.y + lat.y * lx });
  return { normal: n, slots: [mk(TILE * 0.85), mk(-TILE * 0.85), mk(TILE * 1.65)] };
}

function entryPoints(d, normal) {
  const c = doorCenter(d);
  const lat = { x: normal.y === 0 ? 0 : 1, y: normal.x === 0 ? 0 : 1 };
  const inward = { x: -normal.x, y: -normal.y };
  const p = (fwd, lx) => ({ x: c.x + inward.x * fwd + lat.x * lx, y: c.y + inward.y * fwd + lat.y * lx });
  return [p(TILE * 1.6, TILE * 0.9), p(TILE * 1.6, -TILE * 0.9), p(TILE * 2.6, 0)];
}

// ---- order issuing (works while paused)
function issueOrders() {
  // selection
  for (let i = 0; i < 3; i++) {
    if (pressed(String(i + 1))) {
      if (game.selected.size === 1 && game.selected.has(i)) game.selected.clear();
      else { game.selected.clear(); game.selected.add(i); }
    }
  }
  if (pressed("4") || pressed("`")) { game.selected.clear(); game.squad.forEach((s, i) => s.alive && game.selected.add(i)); }
  if (pressed("z")) selectedSquaddies().forEach(s => { s.order = { type: "follow" }; s.path = null; });
  if (pressed("v")) {
    const targets = game.selected.size ? selectedSquaddies() : game.squad.filter(s => s.alive);
    const order = ["hold", "return", "free"];
    const next = order[(order.indexOf((targets[0] || {}).roe || "return") + 1) % order.length];
    targets.forEach(s => s.roe = next);
    game.hint = "ROE: " + (next === "hold" ? "HOLD FIRE" : next === "return" ? "RETURN FIRE" : "WEAPONS FREE");
  }

  // RMB: stack on door, or move+hold on ground
  if (pressed("rmb")) {
    const sel = selectedSquaddies();
    if (sel.length) {
      const d = nearestDoor(input.mouse.wx, input.mouse.wy, 42);
      if (d && d.state !== "breached") orderStack(sel, d);
      else orderMove(sel, input.mouse.wx, input.mouse.wy);
    }
  }
  // B: cycle breach method, T: toggle bang — on hovered stacked door, else latest plan
  if (pressed("b") || pressed("t")) {
    const d = nearestDoor(input.mouse.wx, input.mouse.wy, 60);
    let plan = d && game.plans.find(p => p.door === d);
    if (!plan) plan = game.plans[game.plans.length - 1];
    if (plan) {
      if (pressed("b")) {
        const order = ["open", "kick", "charge"];
        plan.method = order[(order.indexOf(plan.method) + 1) % order.length];
        if (plan.door.locked && plan.method === "open") plan.method = "kick";
      }
      if (pressed("t")) plan.useBang = !plan.useBang;
    }
  }
  // X: GO — execute every ready plan simultaneously
  if (pressed("x")) {
    const ready = game.plans.filter(p => p.state === "ready");
    if (ready.length) { ready.forEach(p => { p.state = "executing"; p.t = 0; }); game.stats.breaches += ready.length; }
    else if (game.plans.length) game.hint = "Stack not set — wait for READY";
  }
}

function selectedSquaddies() {
  return [...game.selected].map(i => game.squad[i]).filter(s => s && s.alive);
}

function orderMove(sel, x, y) {
  // spread arrival points slightly so they don't pile up
  sel.forEach((s, i) => {
    const off = i === 0 ? { x: 0, y: 0 } : { x: Math.cos(i * 2.4) * 26, y: Math.sin(i * 2.4) * 26 };
    s.order = { type: "move", x: x + off.x, y: y + off.y, face: angleTo(game.player.x, game.player.y, x, y) };
    s.path = null; removeFromPlans(s);
  });
}

function orderStack(sel, d) {
  sel.forEach(removeFromPlans); // before plan creation, so the empty-plan filter can't drop the new plan
  let plan = game.plans.find(p => p.door === d);
  if (!plan) {
    const { normal, slots } = stackSlots(d, game.player.x, game.player.y);
    plan = { door: d, normal, slots, members: [], method: d.locked ? "kick" : "open", useBang: true, state: "forming", t: 0 };
    game.plans.push(plan);
  }
  for (const s of sel) {
    if (plan.members.length >= 3) break;
    plan.members.push(s);
    s.order = { type: "stack", plan, slot: plan.members.length - 1 };
    s.path = null;
  }
}

function removeFromPlans(s) {
  for (const p of game.plans) {
    const i = p.members.indexOf(s);
    if (i >= 0) p.members.splice(i, 1);
  }
  game.plans = game.plans.filter(p => p.members.length > 0 || p.state === "executing");
}

// ---- per-frame squaddie behavior
function updateSquaddie(s, dt) {
  if (!s.alive) return;
  s.blind = Math.max(0, s.blind - dt);
  s.stagger = Math.max(0, s.stagger - dt);
  updateShooterWeapon(s, dt);

  // combat overlay: engage nearest visible threat unless blind/staggered
  let threat = null, td = Infinity;
  if (s.blind <= 0) {
    for (const e of game.enemies) {
      if (!e.alive || e.state === "surrender" || e.state === "cuffed") continue;
      if (canSee(s.x, s.y, e.x, e.y, TUNE.aiViewDistAlert)) {
        const d = dist(s.x, s.y, e.x, e.y);
        if (d < td) { td = d; threat = e; }
      }
    }
  }
  if (threat && !s.engaged) s.reactT = randIn(TUNE.squadReact);
  s.engaged = threat;

  const executingEntry = s.order.type === "entry";
  if (threat) {
    s.face = angLerp(s.face, angleTo(s.x, s.y, threat.x, threat.y), dt * 12);
    s.reactT -= dt;
    // fire discipline: entry = weapons free; otherwise per ROE
    const mayFire = executingEntry || s.roe === "free"
      || (s.roe === "return" && (threat.state === "combat" || game.underFireT > 0));
    if (mayFire && s.reactT <= 0 && s.stagger <= 0 && clearShot(s, threat)) {
      tryFire(s, angleTo(s.x, s.y, threat.x, threat.y));
    }
    if (s.ammo <= 0 && s.reloading <= 0) tryReload(s);
    // engaged squaddies stop advancing unless mid-entry (entry keeps flowing)
    if (!executingEntry && s.order.type !== "stack") return;
  }

  switch (s.order.type) {
    case "follow": {
      const d = dist(s.x, s.y, game.player.x, game.player.y);
      if (d > 80) squadMove(s, game.player.x, game.player.y, d > 200 ? TUNE.squadRun : TUNE.squadRun * 0.8, dt);
      else if (!threat) s.face = angLerp(s.face, game.player.face, dt * 4);
      break;
    }
    case "move": {
      const arrived = squadMove(s, s.order.x, s.order.y, TUNE.squadRun, dt);
      if (arrived) { s.order = { type: "hold", face: s.order.face }; }
      break;
    }
    case "hold": {
      if (!threat && s.order.face !== undefined) s.face = angLerp(s.face, s.order.face, dt * 5);
      break;
    }
    case "stack": {
      const slot = s.order.plan.slots[s.order.slot];
      const arrived = dist(s.x, s.y, slot.x, slot.y) < 12;
      if (!arrived) squadMove(s, slot.x, slot.y, TUNE.squadRun, dt);
      else {
        const c = doorCenter(s.order.plan.door);
        if (!threat) s.face = angLerp(s.face, angleTo(s.x, s.y, c.x, c.y), dt * 8);
      }
      break;
    }
    case "entry": {
      const arrived = squadMove(s, s.order.x, s.order.y, TUNE.squadRun, dt, true);
      if (arrived) {
        if (s.shoutedAt <= 0) { squadShout(s); s.shoutedAt = 1; }
        s.order = { type: "hold", face: s.order.face };
      }
      break;
    }
  }
}

function squadMove(s, gx, gy, speed, dt, noisy) {
  const done = moveAlongPath(s, gx, gy, speed, dt, pathCostSquad);
  return done;
}

function squadShout(s) {
  addNoise(s.x, s.y, TUNE.noiseShout, "shout", "squad");
  sfxAt("shout", s.x, s.y);
  game.fx.push({ kind: "shout", x: s.x, y: s.y, t: 0.5, max: 0.5 });
  for (const e of game.enemies) {
    if (!e.alive || e.state === "surrender" || e.state === "cuffed") continue;
    if (dist(s.x, s.y, e.x, e.y) > 260) continue;
    if (!lineOfSight(s.x, s.y, e.x, e.y, opaque)) continue;
    trySurrender(e);
  }
}

// friendly-fire discipline: never shoot through a teammate, hostage, or civilian
function clearShot(s, target) {
  const friendlies = [game.player, ...game.squad, ...game.hostages, ...game.civilians];
  for (const f of friendlies) {
    if (!f || !f.alive || f === s) continue;
    if (segCircle(s.x, s.y, target.x, target.y, f.x, f.y, f.r + 7)) return false;
  }
  // also never shoot a surrendered suspect standing in the line
  for (const e of game.enemies) {
    if (e.alive && (e.state === "surrender" || e.state === "cuffed") && e !== target) {
      if (segCircle(s.x, s.y, target.x, target.y, e.x, e.y, e.r + 7)) return false;
    }
  }
  return true;
}

// ---- breach plan timeline
function updatePlans(dt) {
  for (const p of game.plans) {
    if (p.state === "forming") {
      const allAt = p.members.length > 0 && p.members.every(s => !s.alive || dist(s.x, s.y, p.slots[p.members.indexOf(s)].x, p.slots[p.members.indexOf(s)].y) < 14);
      if (allAt) p.state = "ready";
    } else if (p.state === "ready") {
      const stillAt = p.members.some(s => s.alive && dist(s.x, s.y, doorCenter(p.door).x, doorCenter(p.door).y) < TILE * 3.2);
      if (!stillAt) p.state = "forming";
    } else if (p.state === "executing") {
      const breacher = p.members.find(s => s.alive);
      if (!breacher) { p.state = "done"; continue; }
      const wasT = p.t; p.t += dt;
      const c = doorCenter(p.door);
      // t=0: the door
      if (wasT === 0) {
        if (p.method === "charge") chargeDoor(p.door, breacher);
        else if (p.method === "kick") kickDoor(p.door, breacher);
        else openDoor(p.door, true);
      }
      // bang goes in just after the door opens
      const bangAt = 0.1;
      if (p.useBang && wasT < bangAt && p.t >= bangAt && p.door.state !== "closed") {
        const inPt = { x: c.x - p.normal.x * 85, y: c.y - p.normal.y * 85 };
        throwBang(breacher, inPt.x, inPt.y);
      }
      // entry: staggered flow through the door
      const entryAt = p.useBang ? bangAt + TUNE.bangFuse + 0.15 : 0.25;
      p.members.forEach((s, i) => {
        const goAt = entryAt + i * 0.28;
        if (s.alive && wasT < goAt && p.t >= goAt) {
          const pts = entryPoints(p.door, p.normal);
          const pt = pts[i % pts.length];
          s.order = { type: "entry", x: pt.x, y: pt.y, face: angleTo(c.x, c.y, pt.x, pt.y) };
          s.shoutedAt = 0; s.path = null;
        }
      });
      if (p.t > entryAt + 3) p.state = "done";
    }
  }
  game.plans = game.plans.filter(p => p.state !== "done");
}

// ---------------------------------------------------------------- S11 render
const ctx = canvas.getContext("2d");
let viewW = 0, viewH = 0, dpr = 1;
function resize() {
  dpr = window.devicePixelRatio || 1;
  viewW = window.innerWidth; viewH = window.innerHeight;
  canvas.width = viewW * dpr; canvas.height = viewH * dpr;
}
window.addEventListener("resize", resize); resize();

function render() {
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.fillStyle = "#000"; ctx.fillRect(0, 0, viewW, viewH);
  const cam = game.cam;
  ctx.save();
  ctx.translate(viewW / 2 - cam.x + cam.shakeX, viewH / 2 - cam.y + cam.shakeY);

  // world tiles (only ever-seen ones are drawn at all)
  const x0 = Math.floor((cam.x - viewW / 2) / TILE) - 1, x1 = Math.ceil((cam.x + viewW / 2) / TILE) + 1;
  const y0 = Math.floor((cam.y - viewH / 2) / TILE) - 1, y1 = Math.ceil((cam.y + viewH / 2) / TILE) + 1;
  for (let ty = y0; ty <= y1; ty++) for (let tx = x0; tx <= x1; tx++) {
    if (!inBounds(tx, ty) || !seen.grid[ty][tx]) continue;
    const px = tx * TILE, py = ty * TILE;
    if (level.wall[ty][tx]) {
      ctx.fillStyle = COLORS.wall; ctx.fillRect(px, py, TILE, TILE);
      ctx.fillStyle = COLORS.wallEdge; ctx.fillRect(px, py, TILE, 3);
    } else {
      ctx.fillStyle = level.interior[ty][tx] ? COLORS.floorIn : COLORS.floorOut;
      ctx.fillRect(px, py, TILE, TILE);
    }
  }
  // blood decals
  ctx.fillStyle = COLORS.blood;
  for (const d of game.decals) { ctx.beginPath(); ctx.arc(d.x, d.y, d.r, 0, TAU); ctx.fill(); }

  // doors
  for (const d of level.doors) {
    const t = tileAt(d.tx * TILE, d.ty * TILE);
    if (!seen.grid[d.ty][d.tx]) continue;
    drawDoor(d);
  }

  // corpses (visible under normal rules, but keep once seen — they don't move)
  for (const e of [...game.enemies, ...game.civilians, ...game.hostages]) {
    if (!e.alive) drawBody(e, true);
  }
  for (const s of game.squad) if (!s.alive) drawBody(s, true);

  // squad + player (always visible to you)
  for (const s of game.squad) if (s.alive) drawBody(s);
  if (game.player.alive) drawBody(game.player);

  // hostiles & bystanders: only when your side sees them
  for (const e of [...game.enemies, ...game.hostages, ...game.civilians]) {
    if (!e.alive) continue;
    const vis = visibleToPlayerSide(e);
    if (vis === "direct") drawBody(e);
    else if (vis === "squad") drawGhost(e);
    else if (game.mirror && game.mirror.t > 0 && roomAt(e.x, e.y) === game.mirror.room) drawGhost(e);
  }

  // flashbangs in flight
  ctx.fillStyle = "#aab2ba";
  for (const g of game.bangs) { ctx.beginPath(); ctx.arc(g.x, g.y, 4, 0, TAU); ctx.fill(); }
  // planted wall charge
  if (game.wallCharge) {
    const wc = game.wallCharge;
    ctx.fillStyle = "#ff8c42";
    ctx.fillRect(wc.tx * TILE + TILE / 2 - 5, wc.ty * TILE + TILE / 2 - 5, 10, 10);
    ctx.strokeStyle = "#ff8c42"; ctx.setLineDash([3, 3]);
    ctx.strokeRect(wc.tx * TILE + 2.5, wc.ty * TILE + 2.5, TILE - 5, TILE - 5);
    ctx.setLineDash([]);
  }

  // fx
  drawFx();

  // stack plan markers
  for (const p of game.plans) drawPlan(p);

  // fog: dim everything outside the player's current view
  if (game.player.alive) {
    const poly = game.visPoly;
    ctx.save();
    // build a path = big rect minus vis polygon (evenodd)
    ctx.beginPath();
    ctx.rect(cam.x - viewW, cam.y - viewH, viewW * 2, viewH * 2);
    if (poly && poly.length) {
      ctx.moveTo(poly[0].x, poly[0].y);
      for (let i = 1; i < poly.length; i++) ctx.lineTo(poly[i].x, poly[i].y);
      ctx.closePath();
    }
    ctx.fillStyle = COLORS.fog;
    ctx.fill("evenodd");
    ctx.restore();
  }
  // never-seen tiles: solid black on top
  ctx.fillStyle = "#000";
  for (let ty = y0; ty <= y1; ty++) for (let tx = x0; tx <= x1; tx++) {
    if (inBounds(tx, ty) && !seen.grid[ty][tx]) ctx.fillRect(tx * TILE - 0.5, ty * TILE - 0.5, TILE + 1, TILE + 1);
  }

  ctx.restore();
  drawHud();
}

function drawDoor(d) {
  const c = doorCenter(d);
  const col = d.state === "breached" ? COLORS.doorBreached : d.locked ? COLORS.doorLocked : d.state === "open" ? COLORS.doorOpen : COLORS.doorClosed;
  ctx.fillStyle = col;
  ctx.save(); ctx.translate(c.x, c.y);
  if (d.orient === "v") ctx.rotate(Math.PI / 2);
  if (d.state === "closed") ctx.fillRect(-TILE / 2, -4, TILE, 8);
  else if (d.state === "open") { ctx.save(); ctx.translate(-TILE / 2, 0); ctx.rotate(-1.25); ctx.fillRect(0, -3, TILE * 0.95, 6); ctx.restore(); }
  else { // breached: splinters
    ctx.fillRect(-TILE / 2, -3, TILE * 0.22, 6); ctx.fillRect(TILE * 0.28, -3, TILE * 0.22, 6);
  }
  ctx.restore();
}

function drawBody(e, dead) {
  ctx.save(); ctx.translate(e.x, e.y);
  let col = COLORS.enemy;
  if (e.side === "player") col = COLORS.player;
  else if (e.side === "squad") col = COLORS.squad;
  else if (e.side === "hostage") col = e.secured ? COLORS.ok : COLORS.hostage;
  else if (e.side === "civ") col = COLORS.civilian;
  else if (e.side === "enemy") col = e.state === "cuffed" ? COLORS.cuffed : e.state === "surrender" ? COLORS.surrendered : COLORS.enemy;
  if (dead) {
    ctx.fillStyle = COLORS.corpse; ctx.beginPath(); ctx.arc(0, 0, e.r, 0, TAU); ctx.fill();
    ctx.strokeStyle = "#2a1515"; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(-e.r * 0.7, -e.r * 0.7); ctx.lineTo(e.r * 0.7, e.r * 0.7);
    ctx.moveTo(e.r * 0.7, -e.r * 0.7); ctx.lineTo(-e.r * 0.7, e.r * 0.7); ctx.stroke();
    ctx.restore(); return;
  }
  ctx.rotate(e.face);
  ctx.fillStyle = col;
  ctx.beginPath(); ctx.arc(0, 0, e.r, 0, TAU); ctx.fill();
  // weapon / hands
  if (e.side === "enemy" && (e.state === "surrender" || e.state === "cuffed")) {
    ctx.fillStyle = "#fff"; ctx.fillRect(-3, -e.r - 5, 6, 5); // hands up marker
  } else if (e.side === "player" || e.side === "squad" || e.side === "enemy") {
    ctx.strokeStyle = "#0d1114"; ctx.lineWidth = 4;
    ctx.beginPath(); ctx.moveTo(2, 0); ctx.lineTo(e.r + 8, 0); ctx.stroke();
  }
  // blind marker
  if (e.blind > 0) { ctx.fillStyle = "rgba(255,255,200,0.85)"; ctx.beginPath(); ctx.arc(0, 0, e.r + 3, 0, TAU); ctx.fill(); }
  ctx.restore();
  // hp pip for squad/player
  if (e.side === "player" || e.side === "squad") {
    ctx.fillStyle = "#000a"; ctx.fillRect(e.x - 12, e.y - e.r - 9, 24, 4);
    ctx.fillStyle = e.hp > 40 ? COLORS.ok : COLORS.danger;
    ctx.fillRect(e.x - 12, e.y - e.r - 9, 24 * clamp(e.hp / e.maxHp, 0, 1), 4);
  }
}

function drawGhost(e) {
  ctx.save(); ctx.translate(e.x, e.y); ctx.globalAlpha = 0.5;
  ctx.strokeStyle = e.side === "enemy" ? COLORS.enemy : COLORS.civilian; ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(0, -10); ctx.lineTo(10, 0); ctx.lineTo(0, 10); ctx.lineTo(-10, 0); ctx.closePath();
  ctx.stroke();
  ctx.restore();
}

function drawPlan(p) {
  const c = doorCenter(p.door);
  const ready = p.state === "ready";
  ctx.strokeStyle = ready ? COLORS.ok : COLORS.accent;
  ctx.lineWidth = 1.5; ctx.setLineDash([4, 3]);
  for (const s of p.slots.slice(0, p.members.length)) {
    ctx.beginPath(); ctx.arc(s.x, s.y, 8, 0, TAU); ctx.stroke();
  }
  ctx.setLineDash([]);
  ctx.font = "10px Consolas, monospace"; ctx.textAlign = "center";
  ctx.fillStyle = ready ? COLORS.ok : COLORS.accent;
  const label = p.method.toUpperCase() + (p.useBang ? "+BANG" : "") + (ready ? " · READY [X]" : "");
  ctx.fillText(label, c.x, c.y - 14);
}

function drawFx() {
  for (const f of game.fx) {
    const k = f.t / f.max;
    if (f.kind === "tracer") {
      ctx.strokeStyle = COLORS.tracer; ctx.globalAlpha = k; ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.moveTo(f.x, f.y); ctx.lineTo(f.x2, f.y2); ctx.stroke(); ctx.globalAlpha = 1;
    } else if (f.kind === "muzzle") {
      ctx.fillStyle = COLORS.muzzle; ctx.globalAlpha = k;
      ctx.beginPath(); ctx.arc(f.x, f.y, 7, 0, TAU); ctx.fill(); ctx.globalAlpha = 1;
    } else if (f.kind === "flash") {
      ctx.fillStyle = "#fff"; ctx.globalAlpha = k * 0.95;
      ctx.beginPath(); ctx.arc(f.x, f.y, TUNE.bangRadius * (1.2 - k * 0.3), 0, TAU); ctx.fill(); ctx.globalAlpha = 1;
    } else if (f.kind === "explosion") {
      ctx.fillStyle = "#ffae42"; ctx.globalAlpha = k * 0.9;
      ctx.beginPath(); ctx.arc(f.x, f.y, 60 * (1.4 - k * 0.4), 0, TAU); ctx.fill(); ctx.globalAlpha = 1;
    } else if (f.kind === "spark") {
      ctx.fillStyle = "#ffd27a"; ctx.globalAlpha = k;
      ctx.beginPath(); ctx.arc(f.x, f.y, 3, 0, TAU); ctx.fill(); ctx.globalAlpha = 1;
    } else if (f.kind === "blood") {
      ctx.fillStyle = COLORS.blood; ctx.globalAlpha = k;
      ctx.beginPath(); ctx.arc(f.x + Math.cos(f.ang) * (1 - k) * 10, f.y + Math.sin(f.ang) * (1 - k) * 10, 5, 0, TAU); ctx.fill(); ctx.globalAlpha = 1;
    } else if (f.kind === "shout" || f.kind === "slam") {
      ctx.strokeStyle = f.kind === "shout" ? "#fff" : COLORS.accent; ctx.globalAlpha = k;
      ctx.beginPath(); ctx.arc(f.x, f.y, (1 - k) * 40 + 8, 0, TAU); ctx.stroke(); ctx.globalAlpha = 1;
    } else if (f.kind === "surrender") {
      ctx.fillStyle = "#fff"; ctx.globalAlpha = k; ctx.font = "11px sans-serif"; ctx.textAlign = "center";
      ctx.fillText("HANDS UP!", f.x, f.y - 16); ctx.globalAlpha = 1;
    }
  }
}

function drawHud() {
  const p = game.player;
  ctx.textAlign = "left"; ctx.font = "13px Consolas, monospace";
  // player status (bottom left)
  const bx = 18, by = viewH - 64;
  ctx.fillStyle = "#000a"; ctx.fillRect(bx - 8, by - 20, 240, 62);
  ctx.fillStyle = COLORS.hud; ctx.fillText("POINT MAN (YOU)", bx, by - 4);
  ctx.fillStyle = "#333"; ctx.fillRect(bx, by + 2, 150, 8);
  ctx.fillStyle = p.hp > 40 ? COLORS.ok : COLORS.danger; ctx.fillRect(bx, by + 2, 150 * clamp(p.hp / p.maxHp, 0, 1), 8);
  ctx.fillStyle = COLORS.hud;
  ctx.fillText((p.reloading > 0 ? "RELOADING" : p.ammo + " / " + p.weapon.mag) + "   BANGS " + p.bangs + "   CHARGES " + p.charges, bx, by + 26);
  // squad panel (top left)
  game.squad.forEach((s, i) => {
    const sy = 18 + i * 44;
    const sel = game.selected.has(i);
    ctx.fillStyle = sel ? "#1d4ed855" : "#0009"; ctx.fillRect(14, sy, 190, 38);
    if (sel) { ctx.strokeStyle = COLORS.player; ctx.strokeRect(14.5, sy + 0.5, 189, 37); }
    ctx.fillStyle = s.alive ? COLORS.squad : COLORS.danger;
    ctx.fillText("[" + (i + 1) + "] " + s.name + (s.alive ? "" : " ✝"), 22, sy + 15);
    if (s.alive) {
      ctx.fillStyle = "#333"; ctx.fillRect(22, sy + 22, 110, 6);
      ctx.fillStyle = s.hp > 40 ? COLORS.ok : COLORS.danger; ctx.fillRect(22, sy + 22, 110 * clamp(s.hp / s.maxHp, 0, 1), 6);
      ctx.fillStyle = COLORS.hudDim;
      ctx.fillText(orderLabel(s), 140, sy + 15);
      ctx.fillStyle = s.roe === "free" ? COLORS.danger : s.roe === "hold" ? COLORS.hud : COLORS.accent;
      ctx.fillText(s.roe === "free" ? "FREE" : s.roe === "hold" ? "HOLD-F" : "RTN", 140, sy + 30);
    }
  });
  // objectives (top center)
  ctx.textAlign = "center";
  const hostTotal = game.hostages.length;
  const hostSec = game.hostages.filter(h => h.secured && h.alive).length;
  const threats = game.enemies.filter(e => e.alive && e.state !== "cuffed").length;
  ctx.fillStyle = "#0009"; ctx.fillRect(viewW / 2 - 160, 10, 320, game.alarmTimerVisible() ? 52 : 34);
  ctx.fillStyle = COLORS.hud;
  ctx.fillText("HOSTAGES " + hostSec + "/" + hostTotal + "   THREATS LEFT " + threats, viewW / 2, 32);
  if (game.alarmTimerVisible()) {
    ctx.fillStyle = game.execT < 8 ? COLORS.danger : COLORS.accent;
    ctx.fillText("HOSTAGE-TAKER ALERTED — EXECUTION IN " + Math.ceil(game.execT) + "s", viewW / 2, 52);
  }
  // hint (bottom center)
  if (game.hint) {
    ctx.fillStyle = COLORS.accent; ctx.fillText(game.hint, viewW / 2, viewH - 40);
  }
  // context prompt
  const prompt = contextPrompt();
  if (prompt) { ctx.fillStyle = COLORS.hud; ctx.fillText(prompt, viewW / 2, viewH - 62); }
  // paused / slow-mo banner
  if (game.paused) {
    ctx.fillStyle = "#000b"; ctx.fillRect(viewW / 2 - 220, viewH / 2 - 130, 440, 40);
    ctx.fillStyle = COLORS.accent; ctx.font = "16px Consolas, monospace";
    ctx.fillText("TACTICAL PAUSE — orders active, [SPACE] to resume", viewW / 2, viewH / 2 - 104);
    ctx.font = "13px Consolas, monospace";
  } else if (game.slowmo) {
    ctx.fillStyle = "rgba(40,80,160,0.10)"; ctx.fillRect(0, 0, viewW, viewH);
    ctx.fillStyle = "#7fb0ff"; ctx.font = "14px Consolas, monospace"; ctx.textAlign = "center";
    ctx.fillText("COMMAND — release [TAB] to resume", viewW / 2, viewH / 2 - 110);
    ctx.font = "13px Consolas, monospace";
  }
  // crosshair with spread gap
  const m = input.mouse;
  const spreadPx = Math.tan(currentSpread(p) / 2) * dist(p.x, p.y, m.wx, m.wy);
  const gap = clamp(4 + spreadPx, 4, 60);
  ctx.strokeStyle = p.blind > 0 ? COLORS.danger : "#ffffffcc"; ctx.lineWidth = 1.5;
  for (const [ox, oy] of [[1,0],[-1,0],[0,1],[0,-1]]) {
    ctx.beginPath(); ctx.moveTo(m.x + ox * gap, m.y + oy * gap); ctx.lineTo(m.x + ox * (gap + 7), m.y + oy * (gap + 7)); ctx.stroke();
  }
}

function orderLabel(s) {
  const o = s.order;
  if (s.engaged) return "ENGAGING";
  if (o.type === "follow") return "FOLLOW";
  if (o.type === "hold") return "HOLD";
  if (o.type === "move") return "MOVING";
  if (o.type === "stack") return o.plan.state === "ready" ? "READY" : "STACKING";
  if (o.type === "entry") return "BREACHING";
  return "";
}

function contextPrompt() {
  const p = game.player;
  if (!p.alive) return null;
  const arr = nearestEntity(game.enemies, p.x, p.y, 46, e => e.alive && e.state === "surrender");
  if (arr) return "[E] cuff suspect";
  const hos = nearestEntity(game.hostages, p.x, p.y, 46, h => h.alive && !h.secured);
  if (hos) return "[E] secure hostage";
  const d = nearestDoor(p.x, p.y, 50);
  if (d && d.state === "closed") return d.locked ? "Locked — [F] kick, or order a charge" : "[E] open · [F] kick";
  if (d && d.state === "open") return "[E] close door";
  return null;
}

// ---------------------------------------------------------------- S11b audio (synthesized, no assets)
let AC = null, masterGain = null, noiseBuf = null;
function initAudio() {
  if (AC) return;
  try {
    AC = new (window.AudioContext || window.webkitAudioContext)();
    masterGain = AC.createGain(); masterGain.gain.value = 0.4; masterGain.connect(AC.destination);
    noiseBuf = AC.createBuffer(1, AC.sampleRate * 0.5, AC.sampleRate);
    const data = noiseBuf.getChannelData(0);
    for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
  } catch (e) { AC = null; }
}
function envGain(vol, t0, dur) {
  const g = AC.createGain();
  g.gain.setValueAtTime(vol, t0);
  g.gain.exponentialRampToValueAtTime(0.001, t0 + dur);
  return g;
}
function playNoise(vol, dur, filterType, freq, pan) {
  const t0 = AC.currentTime;
  const src = AC.createBufferSource(); src.buffer = noiseBuf;
  const f = AC.createBiquadFilter(); f.type = filterType; f.frequency.value = freq;
  const g = envGain(vol, t0, dur);
  const p = AC.createStereoPanner ? AC.createStereoPanner() : null; if (p) p.pan.value = pan;
  src.connect(f); f.connect(g); g.connect(p || masterGain); if (p) p.connect(masterGain);
  src.start(t0); src.stop(t0 + dur + 0.02);
}
function playTone(vol, dur, type, f0, f1, pan) {
  const t0 = AC.currentTime;
  const o = AC.createOscillator(); o.type = type;
  o.frequency.setValueAtTime(f0, t0);
  if (f1 && f1 !== f0) o.frequency.exponentialRampToValueAtTime(Math.max(1, f1), t0 + dur);
  const g = envGain(vol, t0, dur);
  const p = AC.createStereoPanner ? AC.createStereoPanner() : null; if (p) p.pan.value = pan;
  o.connect(g); g.connect(p || masterGain); if (p) p.connect(masterGain);
  o.start(t0); o.stop(t0 + dur + 0.02);
}
const SFX = {
  shot(v, p)    { playNoise(v * 0.9, 0.09, "highpass", 700, p); playTone(v * 0.5, 0.06, "square", 160 + rand(-20, 20), 90, p); },
  kick(v, p)    { playTone(v * 0.9, 0.16, "sine", 75, 45, p); playNoise(v * 0.5, 0.1, "lowpass", 320, p); },
  breach(v, p)  { playTone(v, 0.45, "sine", 55, 30, p); playNoise(v * 0.9, 0.4, "lowpass", 220, p); },
  bang(v, p)    { playNoise(v, 0.28, "highpass", 1400, p); playTone(v * 0.7, 0.35, "triangle", 2800, 220, p); playTone(v * 0.25, 0.7, "sine", 3800, 3600, p); },
  shout(v, p)   { playTone(v * 0.6, 0.16, "sawtooth", 210, 150, p); },
  hit(v, p)     { playNoise(v * 0.7, 0.07, "lowpass", 520, p); playTone(v * 0.5, 0.07, "sine", 110, 70, p); },
  thud(v, p)    { playTone(v * 0.8, 0.22, "sine", 90, 40, p); playNoise(v * 0.4, 0.15, "lowpass", 260, p); },
  door(v, p)    { playNoise(v * 0.35, 0.12, "bandpass", 420, p); },
  click(v, p)   { playTone(v * 0.5, 0.035, "square", 1150, 900, p); },
  surrender(v, p) { playTone(v * 0.5, 0.09, "sine", 520, 620, p); playTone(v * 0.4, 0.1, "sine", 660, 700, p); },
};
function sfxAt(name, x, y) {
  if (!AC || !game.player || !SFX[name]) return;
  const d = dist(game.player.x, game.player.y, x, y);
  const vol = clamp(1 - d / 950, 0, 1);
  if (vol <= 0.02) return;
  const pan = clamp((x - game.player.x) / 520, -0.9, 0.9);
  try { SFX[name](vol, pan); } catch (e) {}
}

// ---------------------------------------------------------------- S12 game
const game = {
  state: "menu", paused: false, slowmo: false, mapIndex: 0,
  player: null, squad: [], enemies: [], hostages: [], civilians: [],
  bullets: [], bangs: [], noises: [], fx: [], decals: [], plans: [],
  selected: new Set(),
  alarm: false, execT: TUNE.executionTimer, underFireT: 0, mirror: null, wallCharge: null,
  hint: "", _hintPrev: "", _hintT: 0,
  cam: { x: 0, y: 0, shakeX: 0, shakeY: 0 }, camKick: 0,
  visPoly: null,
  stats: null,
  playerDeadT: 0, endReason: "",
  alarmTimerVisible() {
    const taker = this.enemies.find(e => e.kind === "taker");
    return this.alarm && taker && taker.alive && taker.state !== "surrender" && taker.state !== "cuffed"
      && this.hostages.some(h => h.alive && !h.secured);
  },
};

function initGame() {
  MAP_SRC = MAPS[game.mapIndex] ? MAPS[game.mapIndex].src : MAPS[0].src;
  parseLevel(); seen.init();
  game.player = makePlayer(level.spawns.player);
  game.squad = level.spawns.squad.slice(0, 3).map((sp, i) => makeSquaddie(sp, i));
  game.enemies = level.spawns.enemies.map(makeEnemy);
  game.hostages = level.spawns.hostages.map(sp => makeCivilian(sp, true));
  game.civilians = level.spawns.civilians.map(sp => makeCivilian(sp, false));
  game.bullets = []; game.bangs = []; game.noises = []; game.fx = []; game.decals = []; game.plans = [];
  game.selected = new Set();
  game.alarm = false; game.execT = TUNE.executionTimer; game.underFireT = 0; game.mirror = null; game.wallCharge = null;
  game.hint = ""; game._hintPrev = ""; game._hintT = 0;
  game.cam.x = game.player.x; game.cam.y = game.player.y; game.camKick = 0;
  game.playerDeadT = 0; game.endReason = "";
  game.paused = false; game.slowmo = false;
  game.stats = { time: 0, shotsFired: 0, kills: 0, arrests: 0, hostagesSecured: 0, hostagesDead: 0,
    civsKilled: 0, civsKilledByUs: 0, squadLost: 0, surrenderedKilled: 0, bangsUsed: 0, breaches: 0 };
}

function update(dt) {
  game.stats.time += dt;
  game.underFireT = Math.max(0, game.underFireT - dt);
  if (game.mirror) { game.mirror.t -= dt; if (game.mirror.t <= 0) game.mirror = null; }
  updatePlayer(game.player, dt);
  for (const s of game.squad) updateSquaddie(s, dt);
  updatePlans(dt);
  for (const e of game.enemies) updateEnemy(e, dt);
  for (const c of game.civilians) updateCivilian(c, dt);
  for (const h of game.hostages) updateCivilian(h, dt);
  updateBullets(dt);
  updateBangs(dt);
  updateFx(dt);
  processNoises();
  updateExecutionTimer(dt);
  checkMissionEnd(dt);
}

function updateFx(dt) {
  for (const f of game.fx) f.t -= dt;
  game.fx = game.fx.filter(f => f.t > 0);
  if (game.decals.length > 400) game.decals.splice(0, game.decals.length - 400);
}

function updateExecutionTimer(dt) {
  if (!game.alarmTimerVisible()) return;
  const taker = game.enemies.find(e => e.kind === "taker");
  // fighting for his life, blind, or staggered = not executing anyone
  if (taker.state === "combat" || taker.blind > 0 || taker.stagger > 0) return;
  game.execT -= dt;
  if (game.execT <= 0) {
    const victim = nearestEntity(game.hostages, taker.x, taker.y, 1e9, h => h.alive && !h.secured);
    if (victim && dist(taker.x, taker.y, victim.x, victim.y) < 70) {
      victim.hp = 0; killEntity(victim, "enemy");
      game.fx.push({ kind: "blood", x: victim.x, y: victim.y, ang: rand(0, TAU), t: 0.4, max: 0.4 });
    } else {
      game.execT = 6; // still stalking toward them — short grace
    }
  }
}

function checkMissionEnd(dt) {
  if (game.state !== "play") return;
  if (!game.player.alive) {
    game.playerDeadT += dt;
    if (game.playerDeadT > 1.2) endMission(false, "You went down. The stack has no point man.");
    return;
  }
  if (game.stats.hostagesDead > 0) { endMission(false, "A hostage was killed."); return; }
  const hostOk = game.hostages.length > 0 && game.hostages.every(h => h.alive && h.secured);
  const threats = game.enemies.filter(e => e.alive && e.state !== "cuffed").length;
  if (hostOk && threats === 0) endMission(true, "");
}

function computeGrade() {
  const st = game.stats;
  let score = 100 + st.arrests * 5 - st.kills * 2 - st.civsKilledByUs * 20 - st.squadLost * 12 - st.surrenderedKilled * 15;
  if (score >= 105) return "S";
  if (score >= 90) return "A";
  if (score >= 75) return "B";
  if (score >= 55) return "C";
  return "D";
}

function endMission(won, reason) {
  game.state = "debrief";
  const st = game.stats;
  document.getElementById("debriefTitle").textContent = won ? "Mission Complete" : "Mission Failed";
  document.getElementById("debriefGrade").textContent = won ? computeGrade() : "F";
  document.getElementById("debriefGrade").style.color = won ? "#3fc27e" : "#ff5555";
  const rows = [];
  if (!won) rows.push(`<div class="stat" style="color:#ff5555">${reason}</div><br>`);
  rows.push(`<div class="stat">Time: ${st.time.toFixed(1)}s</div>`);
  rows.push(`<div class="stat">Hostages secured: ${st.hostagesSecured}/${game.hostages.length}</div>`);
  rows.push(`<div class="stat">Suspects arrested: ${st.arrests} &nbsp;·&nbsp; killed: ${st.kills}</div>`);
  if (st.surrenderedKilled) rows.push(`<div class="stat" style="color:#ff5555">Surrendered suspects killed: ${st.surrenderedKilled}</div>`);
  if (st.civsKilledByUs) rows.push(`<div class="stat" style="color:#ff5555">Civilians killed by your team: ${st.civsKilledByUs}</div>`);
  rows.push(`<div class="stat">Squad lost: ${st.squadLost}/3</div>`);
  rows.push(`<div class="stat">Shots fired: ${st.shotsFired} · Flashbangs: ${st.bangsUsed} · Breaches: ${st.breaches}</div>`);
  document.getElementById("debriefStats").innerHTML = rows.join("");
  document.getElementById("debrief").classList.remove("hidden");
}

function updateCamera(dt) {
  const p = game.player;
  const toCursor = { x: input.mouse.wx - p.x, y: input.mouse.wy - p.y };
  const lead = Math.min(TUNE.camLeadMax, Math.hypot(toCursor.x, toCursor.y) * TUNE.camLead);
  const ang = Math.atan2(toCursor.y, toCursor.x);
  const tx = p.x + Math.cos(ang) * lead, ty = p.y + Math.sin(ang) * lead;
  game.cam.x = lerp(game.cam.x, tx, clamp(dt * TUNE.camLerp, 0, 1));
  game.cam.y = lerp(game.cam.y, ty, clamp(dt * TUNE.camLerp, 0, 1));
  // keep the view inside the world where the world is bigger than the screen
  const worldW = level.w * TILE, worldH = level.h * TILE;
  if (worldW > viewW) game.cam.x = clamp(game.cam.x, viewW / 2, worldW - viewW / 2);
  else game.cam.x = worldW / 2;
  if (worldH > viewH) game.cam.y = clamp(game.cam.y, viewH / 2, worldH - viewH / 2);
  else game.cam.y = worldH / 2;
  game.camKick = Math.max(0, game.camKick - dt * 30);
  game.cam.shakeX = rand(-1, 1) * game.camKick; game.cam.shakeY = rand(-1, 1) * game.camKick;
}

function updateHint(dt) {
  if (game.hint !== game._hintPrev) { game._hintPrev = game.hint; game._hintT = 2.5; }
  if (game._hintT > 0) { game._hintT -= dt; if (game._hintT <= 0) { game.hint = ""; game._hintPrev = ""; } }
}

// ---- main loop
let lastT = performance.now();
function frame(now) {
  const dt = Math.min(0.05, (now - lastT) / 1000);
  lastT = now;
  // mouse world coords (needs current camera)
  input.mouse.wx = input.mouse.x - viewW / 2 + game.cam.x;
  input.mouse.wy = input.mouse.y - viewH / 2 + game.cam.y;

  if (game.state === "play") {
    if (pressed(" ")) game.paused = !game.paused;
    if (pressed("escape")) { game.state = "menu"; document.getElementById("menu").classList.remove("hidden"); }
    game.slowmo = held("tab") && !game.paused;   // hold Tab: command time
    issueOrders();                    // orders work while paused/slowed — that's the point
    if (!game.paused) {
      update(game.slowmo ? dt * 0.15 : dt);
      updateCamera(dt);               // camera stays smooth in real time
    }
    updateHint(dt);
    if (game.player) game.visPoly = computeVisPolygon(game.player.x, game.player.y, TUNE.playerViewDist);
    render();
  }
  input.justPressed.clear();
  requestAnimationFrame(frame);
}

const mapPickEl = document.getElementById("mapPick");
MAPS.forEach((m, i) => {
  const b = document.createElement("button");
  b.className = "mapbtn" + (i === 0 ? " sel" : "");
  b.innerHTML = "<b>" + m.name + "</b><br><span>" + m.brief + "</span>";
  b.addEventListener("click", () => {
    game.mapIndex = i;
    mapPickEl.querySelectorAll(".mapbtn").forEach((x, j) => x.classList.toggle("sel", j === i));
  });
  mapPickEl.appendChild(b);
});

document.getElementById("btnStart").addEventListener("click", () => {
  initAudio();
  initGame();
  document.getElementById("menu").classList.add("hidden");
  document.getElementById("debrief").classList.add("hidden");
  game.state = "play";
});
document.getElementById("btnRestart").addEventListener("click", () => {
  initAudio();
  initGame();
  document.getElementById("debrief").classList.add("hidden");
  game.state = "play";
});

requestAnimationFrame(frame);
