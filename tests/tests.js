
// ===== headless smoke tests =====
parseLevel();
console.log('map', level.w + 'x' + level.h, 'doors:', level.doors.length,
  'enemies:', level.spawns.enemies.length, 'hostages:', level.spawns.hostages.length,
  'civs:', level.spawns.civilians.length, 'squad:', level.spawns.squad.length,
  'player:', !!level.spawns.player);
console.log('enemy kinds:', level.spawns.enemies.map(e => e.kind).join(','));
console.log('doors:', level.doors.map(d => `${d.tx},${d.ty}${d.orient}${d.locked?'L':''}`).join(' '));

const ps = level.spawns.player, hs = level.spawns.hostages[0];
const st = tileAt(ps.x, ps.y), gt = tileAt(hs.x, hs.y);
const path = astar(st.tx, st.ty, gt.tx, gt.ty, passForPath, pathCostSquad);
console.log('path player->hostage:', path ? path.length + ' tiles' : 'NULL — UNREACHABLE!');
for (const es of level.spawns.enemies) {
  const et = tileAt(es.x, es.y);
  if (!astar(st.tx, st.ty, et.tx, et.ty, passForPath, pathCostEnemy)) console.log('UNREACHABLE enemy', et.tx, et.ty, es.kind);
}
console.log('reachability check done');

seen.init();
const vis = computeVisPolygon(ps.x, ps.y, 620);
console.log('vis polygon points:', vis.length);
console.log('hostage visible from spawn (want false):', lineOfSight(ps.x, ps.y, hs.x, hs.y, opaque));

initGame(); game.state = 'play';
let alarmAt = null;
for (let i = 0; i < 600; i++) { update(1/60); if (game.alarm && alarmAt === null) alarmAt = i/60; }
console.log('after 10s idle: alarm =', game.alarm, alarmAt !== null ? '(at '+alarmAt.toFixed(2)+'s!)' : '',
  '| enemies alive:', game.enemies.filter(e => e.alive).length,
  '| squad alive:', game.squad.filter(s => s.alive).length,
  '| player hp:', game.player.hp, '| state:', game.state);

const front = level.doors.find(d => d.tx === 10);
kickDoor(front, game.player);
game.player.x = 14 * TILE; game.player.y = 15 * TILE + TILE / 2;
for (let i = 0; i < 900; i++) { if (game.state === 'play') update(1/60); }
console.log('after entry 15s: alarm =', game.alarm,
  '| threats:', game.enemies.filter(e => e.alive && e.state !== 'cuffed').length,
  '| player hp:', Math.round(game.player.hp), 'alive:', game.player.alive,
  '| squad alive:', game.squad.filter(s => s.alive).length,
  '| state:', game.state, '| execT:', game.execT.toFixed(1));

// order pipeline: stack squad on office door and GO
initGame(); game.state = 'play';
game.selected = new Set([0,1,2]);
const offDoor = level.doors.find(d => d.tx === 22 && d.ty === 13);
orderStack(selectedSquaddies(), offDoor);
// teleport squad near the door so they stack fast
game.squad.forEach((s, i) => { s.x = (20 + i) * TILE; s.y = 15 * TILE; });
let goFired = false, planStates = new Set();
for (let i = 0; i < 1800; i++) {
  if (game.state !== 'play') break;
  update(1/60);
  const p = game.plans[0];
  if (p) { planStates.add(p.state); if (p.state === 'ready' && !goFired) { p.state = 'executing'; p.t = 0; goFired = true; } }
}
console.log('breach test: GO fired =', goFired, '| plan states seen:', [...planStates].join(','),
  '| office door state:', offDoor.state, '| bangs used:', game.stats.bangsUsed,
  '| squad orders:', game.squad.map(s => s.order.type).join(','));
console.log('SMOKE TEST DONE');

// extended breach outcome check
const officeGuard = game.enemies.find(e => e.kind === 'guard' && Math.floor(e.y / TILE) < 13 && Math.floor(e.x / TILE) < 29);
console.log('office guard after breach: alive =', officeGuard ? officeGuard.alive : '?', '| state:', officeGuard ? officeGuard.state : '?');

// ===== map 2 integrity =====
game.mapIndex = 1; initGame();
console.log('map2', level.w + 'x' + level.h, 'doors:', level.doors.length,
  'enemies:', level.spawns.enemies.length, 'hostages:', level.spawns.hostages.length,
  'civs:', level.spawns.civilians.length, 'squad:', level.spawns.squad.length, 'player:', !!level.spawns.player);
const ps2 = level.spawns.player;
const st2 = tileAt(ps2.x, ps2.y);
for (const hsp of level.spawns.hostages) {
  const ht = tileAt(hsp.x, hsp.y);
  const pp = astar(st2.tx, st2.ty, ht.tx, ht.ty, passForPath, pathCostSquad);
  console.log('map2 path player->hostage@' + ht.tx + ',' + ht.ty + ':', pp ? pp.length + ' tiles' : 'UNREACHABLE!');
}
for (const es of level.spawns.enemies) {
  const et = tileAt(es.x, es.y);
  if (!astar(st2.tx, st2.ty, et.tx, et.ty, passForPath, pathCostEnemy)) console.log('map2 UNREACHABLE enemy', et.tx, et.ty, es.kind);
}
// 10s idle: no false alarm on map 2 either
game.state = 'play';
for (let i = 0; i < 600; i++) update(1/60);
console.log('map2 after 10s idle: alarm =', game.alarm, '| enemies alive:', game.enemies.filter(e => e.alive).length);
console.log('MAP2 TEST DONE');

// ===== wall charge =====
game.mapIndex = 0; initGame(); game.state = 'play';
const p3 = game.player;
// face east toward building west wall x=10: stand just west of it at tile (9,10)
p3.x = 9 * TILE + 8; p3.y = 10 * TILE + TILE / 2; p3.face = 0;
plantWallCharge(p3);
console.log('charge planted:', !!game.wallCharge, game.wallCharge, '| charges left:', p3.charges);
detonateWallCharge();
console.log('wall after blow (want false):', isWall(10, 10), '| stats.breaches:', game.stats.breaches);
const holePath = astar(9, 10, 12, 10, passForPath, pathCostSquad);
console.log('path through new hole:', holePath ? holePath.length + ' tiles' : 'NULL');
console.log('WALLCHARGE TEST DONE');

// ===== feint surrender =====
initGame(); game.state = 'play';
const fe = game.enemies[0];
fe.state = 'surrender'; fe.feint = true; fe.feintT = 0.5;
for (let i = 0; i < 120; i++) update(1/60);
console.log('feinter after 2s (want not surrender):', fe.state, '| cuff blocks feint:');
const fe2 = game.enemies[1];
fe2.state = 'surrender'; fe2.feint = true; fe2.feintT = 5;
cuffEnemy(fe2);
for (let i = 0; i < 120; i++) update(1/60);
console.log('cuffed feinter stays cuffed:', fe2.state === 'cuffed');
console.log('FEINT TEST DONE');

// ===== map 3 integrity =====
game.mapIndex = 2; initGame();
console.log('map3', level.w + 'x' + level.h, 'doors:', level.doors.length,
  'enemies:', level.spawns.enemies.length, 'hostages:', level.spawns.hostages.length, 'player:', !!level.spawns.player);
const ps3 = level.spawns.player, st3 = tileAt(ps3.x, ps3.y);
for (const hsp of level.spawns.hostages) {
  const ht = tileAt(hsp.x, hsp.y);
  const pp = astar(st3.tx, st3.ty, ht.tx, ht.ty, passForPath, pathCostSquad);
  console.log('map3 path player->hostage@' + ht.tx + ',' + ht.ty + ':', pp ? pp.length + ' tiles' : 'UNREACHABLE!');
}
for (const es of level.spawns.enemies) {
  const et = tileAt(es.x, es.y);
  if (!astar(st3.tx, st3.ty, et.tx, et.ty, passForPath, pathCostEnemy)) console.log('map3 UNREACHABLE enemy', et.tx, et.ty, es.kind);
}
game.state = 'play';
for (let i = 0; i < 600; i++) update(1/60);
console.log('map3 after 10s idle: alarm =', game.alarm, '| enemies alive:', game.enemies.filter(e => e.alive).length);
console.log('MAP3 TEST DONE');

// ===== compliance statistics (arrest path regression) =====
game.mapIndex = 0; game.diffIndex = 1;
let surr = 0, feints = 0, N = 300;
for (let i = 0; i < N; i++) {
  initGame(); game.state = 'play';
  const e = game.enemies[0];
  e.flashedRecently = 3; e.blind = 3;           // flashed
  if (trySurrender(e, game.player)) { surr++; if (e.feint) feints++; }
}
const rate = surr / N, feintRate = feints / Math.max(1, surr);
console.log('flashed surrender rate:', rate.toFixed(2), '(expect ~0.55±0.08)',
  '| feint share:', feintRate.toFixed(2), '(expect ~0.20±0.08)');
if (Math.abs(rate - 0.55) > 0.08) console.log('COMPLIANCE RATE OUT OF BAND!');
if (Math.abs(feintRate - 0.20) > 0.09) console.log('FEINT RATE OUT OF BAND!');

// outgunned: player + 2 squad with LOS, enemy idle
let surr2 = 0;
for (let i = 0; i < N; i++) {
  initGame(); game.state = 'play';
  const e = game.enemies[0];                    // hall guard at (15,13)
  game.player.x = e.x - 100; game.player.y = e.y;
  game.squad.forEach((s, j) => { s.x = e.x - 90; s.y = e.y + (j - 1) * 24; });
  if (trySurrender(e, game.player)) surr2++;
}
console.log('outgunned surrender rate:', (surr2 / N).toFixed(2), '(expect ~0.28±0.08)');
console.log('COMPLIANCE TEST DONE');

// ===== map 4 integrity =====
game.mapIndex = 3; initGame();
console.log('map4', level.w + 'x' + level.h, 'doors:', level.doors.length,
  'enemies:', level.spawns.enemies.length, 'hostages:', level.spawns.hostages.length, 'player:', !!level.spawns.player);
const ps4 = level.spawns.player, st4 = tileAt(ps4.x, ps4.y);
for (const hsp of level.spawns.hostages) {
  const ht = tileAt(hsp.x, hsp.y);
  const pp = astar(st4.tx, st4.ty, ht.tx, ht.ty, passForPath, pathCostSquad);
  console.log('map4 path player->hostage@' + ht.tx + ',' + ht.ty + ':', pp ? pp.length + ' tiles' : 'UNREACHABLE!');
}
for (const es of level.spawns.enemies) {
  const et = tileAt(es.x, es.y);
  if (!astar(st4.tx, st4.ty, et.tx, et.ty, passForPath, pathCostEnemy)) console.log('map4 UNREACHABLE enemy', et.tx, et.ty, es.kind);
}
game.state = 'play';
for (let i = 0; i < 600; i++) update(1/60);
console.log('map4 after 10s idle: alarm =', game.alarm, '| enemies alive:', game.enemies.filter(e => e.alive).length);
console.log('MAP4 TEST DONE');

(function cornerTests(){
// ===== corner advantage =====
game.mapIndex = 0; game.diffIndex = 1; initGame(); game.state = 'play';

// eye must actually sit off-centre, on the correct side
const p = game.player;
p.x = 500; p.y = 500; p.face = 0;              // facing east; unit's right is +Y
p.handed = 'right'; p.shoulder = 'strong'; p.swapT = 0;
const eR = eyePoint(p);
p.shoulder = 'support';
const eS = eyePoint(p);
p.shoulder = 'strong'; p.handed = 'left';
const eL = eyePoint(p);
p.handed = 'right';
console.log('facing east @ (500,500):');
console.log('  right/strong  eye y=', eR.y.toFixed(1), eR.y > 500 ? '(+Y = unit right) OK' : 'WRONG SIDE');
console.log('  right/support eye y=', eS.y.toFixed(1), eS.y < 500 ? '(-Y = unit left) OK' : 'WRONG SIDE');
console.log('  left/strong   eye y=', eL.y.toFixed(1), Math.abs(eL.y - eS.y) < 0.01 ? '(mirrors support) OK' : 'MISMATCH');

// concrete LOS asymmetry: open the office door, then edge east along the hall.
// The strong-side eye should clear the doorway at a different x than the weak side.
const door = doorAt(22, 13); openDoor(door, true);
function firstSight(handed, shoulder) {
  p.handed = handed; p.shoulder = shoulder; p.swapT = 0;
  p.y = 15 * TILE + TILE / 2; p.face = -Math.PI / 2;   // facing NORTH up the wall
  for (let x = 18 * TILE; x < 26 * TILE; x += 0.5) {
    p.x = x;
    const eye = eyePoint(p);
    if (lineOfSight(eye.x, eye.y, 22 * TILE + 16, 10 * TILE, opaque)) return x;
  }
  return null;
}
const a = firstSight('right', 'strong');
const b = firstSight('right', 'support');
console.log('facing north, first x that sees into the north room:');
console.log('  strong shoulder :', a === null ? 'never' : a.toFixed(1));
console.log('  support shoulder:', b === null ? 'never' : b.toFixed(1));
console.log('  asymmetric?', (a !== null && b !== null && a !== b) ? 'YES — corner advantage is live'
            : 'NO — mechanic is not producing a difference');
p.shoulder = 'strong'; p.handed = 'right';

let lefties = 0; const NH = 4000;
for (let i = 0; i < NH; i++) if (rollHandedness() === 'left') lefties++;
const lr = lefties / NH;
console.log('left-handed rate:', lr.toFixed(3), '(target 0.10)', Math.abs(lr - 0.10) < 0.02 ? 'OK' : 'OUT OF BAND');

p.moving = false; p.recoil = 0; p.shoulder = 'strong';
const sStrong = currentSpread(p);
p.shoulder = 'support';
const sSupport = currentSpread(p);
p.shoulder = 'strong';
console.log('spread penalty ratio:', (sSupport / sStrong).toFixed(2), '(target 2.30)');
console.log('CORNER TEST DONE');
})();

(function windowAndBlastTests(){
// ===== windows =====
game.mapIndex = 0; game.diffIndex = 1; initGame(); game.state = 'play';
const wins = [...level.windowAt.values()];
console.log('windows parsed:', wins.length, wins.map(w=>`${w.tx},${w.ty}${w.orient}`).join(' '));
const w0 = wins[0];
console.log('window blocks movement:', solidForMove(w0.tx, w0.ty), '(want true)');
console.log('window blocks sight   :', opaque(w0.tx, w0.ty), '(want false)');
console.log('window blocks pathing :', !passForPath(w0.tx, w0.ty), '(want true)');

// throw a bang at a window from the open side; it should break and pass through
const cx = w0.tx*TILE + TILE/2, cy = w0.ty*TILE + TILE/2;
const p = game.player;
p.x = cx; p.y = cy + TILE*3;            // stand south of it
game.noises = [];
throwBang(p, cx, cy - TILE*3);          // aim north, through the glass
for (let i = 0; i < 40 && game.bangs.length; i++) updateBangs(1/60);
console.log('window broken by grenade:', w0.broken, '(want true)');
const glassNoise = game.noises.some(n => n.type === 'glass');
console.log('breaking emitted noise  :', glassNoise, '(want true)');

// a bullet through a second window should shatter it too
const w1 = wins[1];
if (w1) {
  const bx = w1.tx*TILE + TILE/2, by = w1.ty*TILE + TILE/2;
  p.x = bx; p.y = by + TILE*2; p.face = -Math.PI/2; p.cooldown = 0; p.reloading = 0; p.ammo = 30;
  tryFire(p, -Math.PI/2);
  for (let i = 0; i < 20; i++) updateBullets(1/60);
  console.log('window broken by bullet :', w1.broken, '(want true)');
}

// ===== breach blast harms bystanders =====
initGame(); game.state = 'play';
const h = game.hostages[0];
const bx2 = h.x + 30, by2 = h.y;        // charge goes off a stride away
const hpBefore = h.hp;
applyBlast(bx2, by2, 'player');
console.log('hostage hp', hpBefore, '->', Math.round(h.hp), '| alive:', h.alive,
            '| counted against us:', game.stats.hostagesDead);
initGame(); game.state = 'play';
const h2 = game.hostages[0];
applyBlast(h2.x + 200, h2.y, 'player');  // well outside the wound radius
console.log('hostage far from blast unhurt:', h2.hp === 40, '(want true)');
console.log('WINDOW+BLAST TEST DONE');
})();

(function missionTests(){
console.log('--- mission framework ---');
for (let m = 0; m < MAPS.length; m++) {
  game.mapIndex = m; game.diffIndex = 1; initGame(); game.state = 'play';
  const ps = level.spawns.player, st = tileAt(ps.x, ps.y);
  let unreachable = 0;
  for (const h of level.spawns.hostages) {
    const t = tileAt(h.x, h.y);
    if (!astar(st.tx, st.ty, t.tx, t.ty, passForPath, pathCostSquad)) unreachable++;
  }
  for (const e of level.spawns.enemies) {
    const t = tileAt(e.x, e.y);
    if (!astar(st.tx, st.ty, t.tx, t.ty, passForPath, pathCostEnemy)) unreachable++;
  }
  let exfilOk = 'n/a';
  if (level.extraction.length) {
    const z = level.extraction[0];
    exfilOk = astar(st.tx, st.ty, z.tx, z.ty, passForPath, pathCostSquad) ? 'reachable' : 'UNREACHABLE';
  }
  // 10s idle must not self-alarm
  for (let i = 0; i < 600; i++) update(1/60);
  console.log(`${MAPS[m].name.padEnd(14)} ${MAPS[m].type.padEnd(18)} [${MAPS[m].objectives.join(', ')}]`);
  console.log(`   hostages=${game.hostages.length} enemies=${game.enemies.length} hvt=${hvtUnit()?'yes':'no'} ` +
              `exfil=${exfilOk} unreachable=${unreachable} idleAlarm=${game.alarm}`);
  if (unreachable) console.log('   !! UNREACHABLE SPAWNS');
}

// capture semantics: killing the HVT fails, cuffing him wins with exfil
game.mapIndex = MAPS.findIndex(m => m.objectives.includes('capture'));
initGame(); game.state = 'play';
let h = hvtUnit();
h.hp = 0; killEntity(h, 'player');
console.log('capture: HVT killed ->', JSON.stringify(missionFailure()));
initGame(); game.state = 'play';
h = hvtUnit(); h.state = 'surrender'; h.feint = false; cuffEnemy(h);
console.log('capture: HVT cuffed -> capture done =', OBJECTIVES.capture.done(),
            '| extract done (not at point) =', OBJECTIVES.extract.done());
const z = level.extraction[0];
game.player.x = z.tx*TILE + 16; game.player.y = z.ty*TILE + 16;
console.log('capture: player at exfil -> extract done =', OBJECTIVES.extract.done());
checkMissionEnd(1/60);
console.log('capture: mission state after both ->', game.state, '(want debrief)');
console.log('MISSION TEST DONE');
})();

(function ballisticsTests(){
console.log('--- ballistics ---');
game.mapIndex = 0; game.diffIndex = 1; initGame(); game.state = 'play';

// material classification: exterior shell should be concrete, interior dividers drywall
let conc = 0, dry = 0;
for (let y = 0; y < level.h; y++) for (let x = 0; x < level.w; x++) {
  if (level.mat[y][x] === 'concrete') conc++;
  if (level.mat[y][x] === 'drywall') dry++;
}
console.log('materials: concrete=' + conc + ' drywall(partition)=' + dry,
            dry > 0 ? 'OK' : 'NO PARTITIONS CLASSIFIED');

// find an interior partition and fire FMJ then HP at it point blank
let part = null;
for (let y = 1; y < level.h-1 && !part; y++) for (let x = 1; x < level.w-1; x++)
  if (level.mat[y][x] === 'drywall') { part = {x, y}; break; }
console.log('test partition at', part.x + ',' + part.y, '| opaque(blocks sight):', opaque(part.x, part.y),
            '| resist:', materialAt(part.x, part.y).resist);

function fireAt(ammoKey, fromDX) {
  game.bullets = [];
  const b = {
    x: (part.x + fromDX) * TILE + 16, y: part.y * TILE + 16,
    ang: fromDX < 0 ? 0 : Math.PI, speed: 1500,
    dmg: 34 * AMMO[ammoKey].dmgMul, pen: AMMO[ammoKey].pen,
    side: 'player', traveled: 0, range: 900, alive: true, owner: null,
  };
  game.bullets.push(b);
  for (let i = 0; i < 8 && game.bullets.length; i++) updateBullets(1/240);
  // did it end up on the far side of the partition?
  const past = fromDX < 0 ? b.x > (part.x + 1) * TILE : b.x < part.x * TILE;
  return { alive: b.alive, past, dmg: b.dmg.toFixed(1) };
}
const fmj = fireAt('fmj', -1);
const hp  = fireAt('hp',  -1);
const ap  = fireAt('ap',  -1);
console.log('FMJ through drywall:', fmj.past ? 'PENETRATED' : 'stopped', '| dmg left', fmj.dmg);
console.log('HP  through drywall:', hp.past ? 'PENETRATED' : 'stopped', '| dmg left', hp.dmg);
console.log('AP  through drywall:', ap.past ? 'PENETRATED' : 'stopped', '| dmg left', ap.dmg);
console.log('  expected: FMJ and AP penetrate, HP stops ->',
            (fmj.past && ap.past && !hp.past) ? 'CORRECT' : 'WRONG');

// concrete must stop everything
let conctile = null;
for (let x = 1; x < level.w-1 && !conctile; x++) if (level.mat[0][x] === 'concrete') conctile = {x, y:0};
game.bullets = [];
const cb = { x: conctile.x*TILE+16, y: 2*TILE, ang: -Math.PI/2, speed: 1500, dmg: 34,
             pen: AMMO.ap.pen, side:'player', traveled:0, range:900, alive:true, owner:null };
game.bullets.push(cb);
for (let i = 0; i < 8 && game.bullets.length; i++) updateBullets(1/240);
console.log('AP vs concrete:', cb.alive ? 'PENETRATED (WRONG)' : 'stopped (correct)');

// spall: fragments off a struck barrier wound whoever is hugging it
initGame(); game.state='play';
const vic = game.enemies[0];
const impact = { x: vic.x + 18, y: vic.y };      // a round strikes 18px away
const before = vic.hp;
applySpall(impact.x, impact.y, MATERIALS.brick, 'player');
console.log('spall at 18px: hp', before, '->', vic.hp.toFixed(1),
            vic.hp < before ? 'CORRECT (wall-hugging hurts)' : 'WRONG (no spall)');
const far = game.enemies[1]; const fb = far.hp;
applySpall(far.x + 60, far.y, MATERIALS.brick, 'player');
console.log('spall at 60px: hp', fb, '->', far.hp.toFixed(1),
            far.hp === fb ? 'CORRECT (out of fragment range)' : 'WRONG');

// grazing ricochet: nearly parallel to the top wall, drifting into it.
// The skip is probabilistic (75%), so fire a volley and assert most skip.
initGame(); game.state='play';
let skipped = 0, trials = 20;
for (let k = 0; k < trials; k++) {
  game.bullets = [];
  const rb = { x: 20*TILE, y: 1*TILE + 6, ang: -deg(4), speed: 1500, dmg: 34,
               pen: AMMO.fmj.pen, side:'player', traveled:0, range:900, alive:true, owner:null };
  game.bullets.push(rb);
  for (let i = 0; i < 40 && game.bullets.length; i++) updateBullets(1/240);
  if (rb.ricochets > 0) skipped++;
}
console.log('grazing volley: ' + skipped + '/' + trials + ' skipped along the wall',
            skipped >= trials * 0.5 ? 'CORRECT' : 'WRONG (rounds burying in the wall)');
console.log('BALLISTICS TEST DONE');
})();

(function aimSolutionTest(){
console.log('--- firing solution ---');
// Regression: rounds leave the offset muzzle, so the aim angle must be computed
// FROM the muzzle. Using the body->target angle displaces every shot laterally.
const saved = TUNE.eyeLateral;
function hitRate(lateral, shots) {
  TUNE.eyeLateral = lateral;
  let hits = 0;
  for (let i = 0; i < shots; i++) {
    game.mapIndex = 0; initGame(); game.state = 'play';
    const P = game.player;
    P.x = 400; P.y = 400; P.handed = 'right'; P.shoulder = 'strong';
    P.weapon = { ...TUNE.rifle, spreadBase: 0, spreadMove: 0, spreadWalkMove: 0, recoil: 0 };
    P.recoil = 0; P.moving = false; P.cooldown = 0; P.reloading = 0; P.ammo = 30;
    const tgt = game.enemies[0];
    tgt.x = 650; tgt.y = 400; tgt.alive = true; tgt.hp = 1000; tgt.state = 'idle';
    game.enemies.slice(1).forEach(e => e.alive = false);
    game.hostages.forEach(h => h.alive = false);
    game.civilians.forEach(c => c.alive = false);
    game.squad.forEach(s => s.alive = false);
    P.face = angleTo(P.x, P.y, tgt.x, tgt.y);
    game.bullets = [];
    const hp0 = tgt.hp;
    tryFire(P, aimAngle(P, tgt.x, tgt.y));
    for (let f = 0; f < 40 && game.bullets.length; f++) updateBullets(1/240);
    if (tgt.hp < hp0) hits++;
  }
  return hits / shots;
}
let worst = 1;
for (const lat of [0, 6, 14]) {
  const r = hitRate(lat, 40);
  worst = Math.min(worst, r);
  console.log(`  eyeLateral=${String(lat).padStart(2)} -> hit rate ${(r*100).toFixed(0)}% (zero spread, target dead ahead)`);
}
console.log('  aim is independent of muzzle offset:', worst >= 0.95 ? 'CORRECT' : 'WRONG — shots are being displaced');
TUNE.eyeLateral = saved;
console.log('AIM TEST DONE');
})();

(function crashAndRoomTests(){
console.log('--- regressions: door close + room integrity ---');
game.mapIndex = 0; initGame(); game.state = 'play';
const d = level.doors[0];
openDoor(d, true);
[game.player, ...game.squad, ...game.enemies, ...game.hostages, ...game.civilians]
  .forEach(e => { if (e && e !== game.player) e.alive = false; });
game.player.x = -999; game.player.y = -999;
let threw = null;
try { closeDoor(d); } catch (e) { threw = e.message; }
console.log('  closeDoor on an open door:', threw ? 'THROWS — ' + threw : 'OK', threw ? 'WRONG' : 'CORRECT');
console.log('  door actually closed:', d.state === 'closed' ? 'CORRECT' : 'WRONG (' + d.state + ')');

// rooms must not leak through windows
let worst = null;
for (let m = 0; m < MAPS.length; m++) {
  game.mapIndex = m; initGame();
  const sizes = {};
  for (let y = 0; y < level.h; y++) for (let x = 0; x < level.w; x++) {
    const r = level.room[y][x]; if (r) sizes[r] = (sizes[r] || 0) + 1;
  }
  const biggest = Math.max(...Object.values(sizes));
  const hostRooms = game.hostages.map(h => roomAt(h.x, h.y));
  const blockers = hostRooms.map(r => game.enemies.filter(e => e.alive && roomAt(e.x, e.y) === r).length);
  console.log(`  ${MAPS[m].name.padEnd(15)} rooms ${Object.keys(sizes).length}  largest ${biggest}t  ` +
              `hostage rooms ${JSON.stringify(hostRooms)}  blockers ${JSON.stringify(blockers)}`);
  if (worst === null || biggest > worst) worst = biggest;
}
// the real test is not room size (the exterior is legitimately huge) but whether a
// hostage's room has leaked into the exterior where the team spawns
let leaked = 0;
for (let m = 0; m < MAPS.length; m++) {
  game.mapIndex = m; initGame();
  const spawnRoom = roomAt(level.spawns.player.x, level.spawns.player.y);
  for (const h of game.hostages) if (roomAt(h.x, h.y) === spawnRoom) leaked++;
}
console.log('  hostages sharing a room with the spawn point:', leaked,
            leaked === 0 ? 'CORRECT (interiors sealed from exterior)' : 'WRONG — rooms leaking outdoors');
console.log('CRASH+ROOM TEST DONE');
})();

(function feedbackTests(){
console.log('--- feedback: damage direction, spall, corpse identity ---');
game.mapIndex = 0; initGame(); game.state = 'play';
const P = game.player;

// a round that lands tells you which way it came from
game.hurt.length = 0;
const inbound = deg(30);
applyHit(P, { dmg: 10, ang: inbound, side: 'enemy' }, P.x + 8, P.y + 4);
const arc = game.hurt[0];
console.log('  round inbound on bearing ' + (inbound * 180 / Math.PI).toFixed(0) +
            '° -> arc points at ' + (arc ? (arc.ang * 180 / Math.PI).toFixed(0) + '°' : 'NOTHING'),
            arc && Math.abs(Math.abs(angDiff(arc.ang, inbound)) - Math.PI) < 0.01 ? 'CORRECT (back down the line)' : 'WRONG');

// spall reports itself the way a hit does, instead of subtracting hp in silence
game.hurt.length = 0; game.camKick = 0; game.fx.length = 0;
const hpBefore = P.hp;
applySpall(P.x + 14, P.y, MATERIALS.concrete, 'enemy');
console.log('  spall at 14px: hp ' + hpBefore.toFixed(1) + ' -> ' + P.hp.toFixed(1) +
            ', arcs ' + game.hurt.length + ', camKick ' + game.camKick.toFixed(1) +
            ', fx ' + game.fx.length,
            (P.hp < hpBefore && game.hurt.length === 1 && game.camKick > 0 && game.fx.length >= 2)
              ? 'CORRECT' : 'WRONG (damage without feedback)');

// only the player gets arcs — they are a HUD channel, not a world event
game.hurt.length = 0;
applySpall(game.squad[0].x + 10, game.squad[0].y, MATERIALS.concrete, 'enemy');
console.log('  spall on a squaddie pushes ' + game.hurt.length + ' player arcs',
            game.hurt.length === 0 ? 'CORRECT' : 'WRONG');

// four categories the grade scores separately must not share one corpse colour
const mk = (side, extra) => Object.assign({ side, r: 9 }, extra || {});
const kinds = { operator: mk('squad'), player: mk('player'), hostage: mk('hostage'),
                civilian: mk('civ'), suspect: mk('enemy'), executed: mk('enemy', { wasSurrendered: true }) };
const cols = {}; for (const k in kinds) cols[k] = corpseTint(kinds[k]);
const distinct = new Set(Object.values(cols)).size;
console.log('  corpse tints ' + JSON.stringify(cols));
console.log('  distinct colours: ' + distinct + '/6', distinct === 6 ? 'CORRECT' : 'WRONG');

// the muzzle flash belongs on the muzzle, which is the whole premise
P.face = 0; P.cooldown = 0; P.reloading = 0; P.ammo = 30; P.shoulder = 'strong'; P.handed = 'right';
game.fx.length = 0;
const eye = eyePoint(P);
tryFire(P, aimAngle(P, P.x + 300, P.y));
const flash = game.fx.find(f => f.kind === 'muzzle');
console.log('  muzzle flash offset from the centreline: ' +
            (flash ? Math.abs(flash.y - P.y).toFixed(1) + 'px (eye is ' + Math.abs(eye.y - P.y).toFixed(1) + 'px off)' : 'NO FLASH'),
            flash && Math.abs(flash.y - eye.y) < 0.5 ? 'CORRECT (on the muzzle)' : 'WRONG (on the body)');
console.log('FEEDBACK TEST DONE');
})();

(function playbookTests(){
console.log('--- playbook: formation geometry and points of domination ---');

// the wedge must never put a man on the point man's firing line
game.mapIndex = 0; initGame(); game.state = 'play';
let worstBore = 180, minPair = 999;
for (let f = 0; f < 12; f++) {
  game.player.face = (f / 12) * TAU;
  const st = game.squad.map(s => { s._wedgeAng = undefined; return wedgeStation(s, 1); });
  st.forEach(p => {
    const off = Math.abs(angDiff(game.player.face, angleTo(game.player.x, game.player.y, p.x, p.y))) * 180 / Math.PI;
    if (off < worstBore) worstBore = off;
  });
  for (let i = 0; i < st.length; i++) for (let j = i + 1; j < st.length; j++) {
    const sep = Math.abs(angDiff(angleTo(game.player.x, game.player.y, st[i].x, st[i].y),
                                 angleTo(game.player.x, game.player.y, st[j].x, st[j].y))) * 180 / Math.PI;
    if (sep < minPair) minPair = sep;
  }
}
console.log('  closest wedge station to your bore, over 12 headings: ' + worstBore.toFixed(0) + '°',
            worstBore > 35 ? 'CORRECT (nobody downrange of you)' : 'WRONG');
console.log('  smallest bearing gap between two teammates: ' + minPair.toFixed(0) + '°',
            minPair > 25 ? 'CORRECT (no two share a bearing)' : 'WRONG');

// points of domination: opposite sides, out of the funnel, inside the room
let tested = 0, bad = [], sameRoom = 0;
for (let m = 0; m < MAPS.length; m++) {
  game.mapIndex = m; initGame();
  for (const d of level.doors) {
    const c = doorCenter(d);
    const n = doorNormal(d, c.x + TILE * 2, c.y + TILE * 2);
    const pts = dominationPoints(d, n);
    if (pts.length !== 3) { bad.push(MAPS[m].name + ' wrong count'); continue; }
    tested++;
    const inward = { x: -n.x, y: -n.y }, lat = { x: n.y === 0 ? 0 : 1, y: n.x === 0 ? 0 : 1 };
    const side = p => (p.x - c.x) * lat.x + (p.y - c.y) * lat.y;
    const depth = p => (p.x - c.x) * inward.x + (p.y - c.y) * inward.y;
    if (side(pts[0]) * side(pts[1]) > 0) bad.push(MAPS[m].name + ' corners on the same side');
    if (depth(pts[0]) < TILE * 0.8 || depth(pts[1]) < TILE * 0.8) bad.push(MAPS[m].name + ' corner still in the funnel');
    for (const p of pts) if (isWall(tileAt(p.x, p.y).tx, tileAt(p.x, p.y).ty)) bad.push(MAPS[m].name + ' point inside a wall');
    const seed = tileAt(c.x + inward.x * TILE * 1.2, c.y + inward.y * TILE * 1.2);
    const rid = inBounds(seed.tx, seed.ty) ? level.room[seed.ty][seed.tx] : 0;
    if (rid && [pts[0], pts[1]].every(p => level.room[tileAt(p.x, p.y).ty][tileAt(p.x, p.y).tx] === rid)) sameRoom++;
  }
}
console.log('  ' + tested + ' doors across ' + MAPS.length + ' maps: ' +
            (bad.length ? bad.length + ' BAD -> ' + [...new Set(bad)].join('; ') : 'all valid CORRECT'));
console.log('  both corners inside the room behind the door: ' + sameRoom + '/' + tested,
            sameRoom / tested > 0.9 ? 'CORRECT' : 'WRONG (flood fill not resolving rooms)');

// pie slots: nobody standing in the fatal funnel, all on the approach side
game.mapIndex = 0; initGame();
let funnel = 0, wrongSide = 0, pies = 0;
for (const d of level.doors) {
  const c = doorCenter(d);
  const n = doorNormal(d, c.x + TILE * 2, c.y + TILE * 2);
  const lat = { x: n.y === 0 ? 0 : 1, y: n.x === 0 ? 0 : 1 };
  for (const p of pieSlots(d, n)) {
    pies++;
    if (Math.abs((p.x - c.x) * lat.x + (p.y - c.y) * lat.y) < TILE * 0.6) funnel++;
    if ((p.x - c.x) * n.x + (p.y - c.y) * n.y < 0) wrongSide++;
  }
}
console.log('  pie slots: ' + pies + ' total, ' + funnel + ' in the funnel, ' + wrongSide + ' on the wrong side of the door',
            funnel === 0 && wrongSide === 0 ? 'CORRECT' : 'WRONG');

// every play must run without throwing, on a door and with no door in reach
game.mapIndex = 0; initGame(); game.state = 'play';
const doorFor = level.doors.find(d => d.state === 'closed');
let ran = 0, threw = [];
for (const play of PLAYS) {
  const c = doorCenter(doorFor);
  game.player.x = c.x + 50; game.player.y = c.y + 50;
  input.mouse.wx = c.x; input.mouse.wy = c.y;
  try { if (callPlay(play)) ran++; } catch (e) { threw.push(play.name + ': ' + e.message); }
  // and again with the cursor and the player nowhere near a door
  game.player.x = level.spawns.player.x; game.player.y = level.spawns.player.y;
  input.mouse.wx = -9999; input.mouse.wy = -9999;
  try { callPlay(play); } catch (e) { threw.push(play.name + ' (no door): ' + e.message); }
}
console.log('  ' + PLAYS.length + ' plays called with a door and without: ' +
            (threw.length ? 'THREW -> ' + threw.join(' | ') : ran + ' executed, none threw CORRECT'));
console.log('PLAYBOOK TEST DONE');
})();

(function armorTests(){
console.log('--- body armor: rating vs penetration, wear, and coverage ---');
game.mapIndex = 0; initGame(); game.state = 'play';

// the protection ladder must match the ammunition table, not vibes
const expect = {
  soft:  { stop: ['hp', 'pistol', 'hp9', 'bird', 'buck'],       through: ['fmj', 'ap', 'x39', 'slug'] },
  plate: { stop: ['hp', 'pistol', 'hp9', 'bird', 'buck', 'fmj', 'x39'], through: ['ap', 'slug'] },
  heavy: { stop: Object.keys(AMMO),                              through: [] },
};
let ladder = [];
for (const [ak, exp] of Object.entries(expect)) {
  const A = ARMOR[ak];
  exp.stop.forEach(r => { if (AMMO[r].pen >= A.rating) ladder.push(A.name + ' should stop ' + AMMO[r].name); });
  exp.through.forEach(r => { if (AMMO[r].pen < A.rating) ladder.push(A.name + ' should NOT stop ' + AMMO[r].name); });
}
console.log('  protection ladder vs the AMMO table:', ladder.length ? 'WRONG -> ' + ladder.join('; ') : 'CORRECT');

// a defeated plate still costs the round something; a plate that holds costs it nearly everything
const sample = (ak, pen, n) => {
  let tot = 0;
  for (let i = 0; i < n; i++) {
    const e = wearArmor(makeShooter(0, 0, 'enemy', 1e6, TUNE.akm), ak);
    tot += throughArmor(e, 100, pen).dmg;
  }
  return tot / n;
};
const held = sample('plate', 26, 4000), beat = sample('plate', 46, 4000), bare = sample('none', 26, 200);
console.log('  100 damage into III PLATE: held ' + held.toFixed(1) + ', defeated ' + beat.toFixed(1) +
            ', no armor ' + bare.toFixed(1),
            (held < beat && beat < bare && held < 40 && beat > 70) ? 'CORRECT' : 'WRONG');

// coverage: some hits must miss the plate entirely, or armor is a flat multiplier
let onPlate = 0, N = 4000;
for (let i = 0; i < N; i++) {
  const e = wearArmor(makeShooter(0, 0, 'enemy', 1e6, TUNE.akm), 'plate');
  if (throughArmor(e, 10, 26).hitArmor) onPlate++;
}
const cov = onPlate / N;
console.log('  hits that actually struck the plate: ' + (cov * 100).toFixed(0) + '% (spec ' +
            (ARMOR.plate.cover * 100).toFixed(0) + '%)',
            Math.abs(cov - ARMOR.plate.cover) < 0.04 ? 'CORRECT' : 'WRONG');

// armor is a buffer that runs out, not immunity
const P = wearArmor(makeShooter(0, 0, 'player', 100, TUNE.akm), 'plate');
let rounds = 0;
while (P.armor > 0 && rounds < 60) { rounds++; throughArmor(P, 30, 32); }
console.log('  III PLATE absorbs ' + rounds + ' rifle rounds before it is spent',
            rounds >= 2 && rounds <= 10 ? 'CORRECT (a buffer, not immunity)' : 'WRONG');
const spent = throughArmor(P, 30, 32);
console.log('  once spent it stops working: ' + spent.dmg.toFixed(1) + ' of 30 gets through',
            spent.dmg === 30 && !spent.hitArmor ? 'CORRECT' : 'WRONG');

// every tier must cost speed, or it is a free upgrade
const speeds = Object.entries(ARMOR).map(([k, v]) => v.speed);
console.log('  speed multipliers ' + JSON.stringify(speeds),
            speeds.every((v, i) => i === 0 || v < speeds[i - 1]) ? 'CORRECT (monotonic cost)' : 'WRONG');

// enemies are bare below ELITE
const worn = {};
for (let di = 0; di < DIFFICULTIES.length; di++) {
  game.diffIndex = di; game.mapIndex = 1; initGame();
  worn[DIFFICULTIES[di].name] = game.enemies.filter(e => e.armorMax > 0).length + '/' + game.enemies.length;
}
game.diffIndex = 1;
console.log('  suspects wearing armor by tier: ' + JSON.stringify(worn),
            worn.ROOKIE.startsWith('0/') && worn.REGULAR.startsWith('0/') && !worn.ELITE.startsWith('0/')
              ? 'CORRECT (a difficulty axis, not a baseline)' : 'WRONG');
console.log('ARMOR TEST DONE');
})();
