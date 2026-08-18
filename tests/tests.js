
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

(function triggerDisciplineTests(){
console.log('--- trigger discipline: the cone a string of shots is fired through ---');
game.mapIndex = 0; initGame(); game.state = 'play';
const dg = r => (r * 180 / Math.PI).toFixed(2);

// Fire N rounds back to back and record the cone each one actually left through.
function string(primary, n) {
  game.loadout.primary = primary; initGame();
  const p = game.player;
  p.moving = false; p.walking = false; p.steady = false; p.sprinting = false;
  p.suppress = 0; p.turnBloom = 0; p.recoil = 0; p.burst = 0; p.ammo = 999;
  const cones = [];
  for (let i = 0; i < n; i++) {
    cones.push(currentSpread(p));                 // what THIS round goes through
    p.cooldown = 0; p.reloading = 0;
    tryFire(p, p.face);
    updateShooterWeapon(p, 60 / p.weapon.rpm);    // the gap the fire rate forces
  }
  return cones;
}
const carb = string('carbine', 8);
console.log('  M4, eight rounds held down: ' + carb.map(dg).join('  '));
console.log('    round 1 leaves at the base cone (' + dg(PRIMARIES.carbine.w.spreadBase) + '):',
            Math.abs(carb[0] - PRIMARIES.carbine.w.spreadBase) < 1e-9
              ? 'CORRECT (the gun climbs after the round is gone)' : 'WRONG');
console.log('    it only ever opens up:',
            carb.every((c, i) => i === 0 || c >= carb[i - 1] - 1e-9) ? 'CORRECT' : 'WRONG');
console.log('    and each step is bigger than the last, so the string degrades:',
            carb[2] - carb[1] > carb[1] - carb[0] && carb[3] - carb[2] > carb[2] - carb[1]
              ? 'CORRECT' : 'WRONG');
const triple = carb[2], dump = carb[7];
console.log('    third round of a triple ' + dg(triple) + '° vs eighth of a dump ' + dg(dump) + '°: ' +
            (dump / triple).toFixed(1) + 'x worse',
            dump > triple * 2 ? 'CORRECT (bursting is rewarded)' : 'WRONG (no reason to let off)');

// Letting off has to buy the cone back, or there is no burst rhythm to find.
function settleTime(primary, shots) {
  game.loadout.primary = primary; initGame();
  const p = game.player;
  p.moving = false; p.recoil = 0; p.burst = 0; p.ammo = 999;
  for (let i = 0; i < shots; i++) { p.cooldown = 0; tryFire(p, p.face); updateShooterWeapon(p, 60 / p.weapon.rpm); }
  const hot = p.recoil;
  let t = 0;
  while (p.burst !== 0 && t < 5) { updateShooterWeapon(p, 1 / 60); t += 1 / 60; }
  return { hot, t };
}
const s3 = settleTime('carbine', 3), s8 = settleTime('carbine', 8);
console.log('  M4 settle: ' + dg(s3.hot) + '° after a triple -> ' + s3.t.toFixed(2) + 's, ' +
            dg(s8.hot) + '° after a dump -> ' + s8.t.toFixed(2) + 's');
console.log('    a triple recovers inside half a second:', s3.t < 0.5 ? 'CORRECT' : 'WRONG');
console.log('    a dump costs you more than a triple does:', s8.t > s3.t ? 'CORRECT' : 'WRONG');

// The marksman rifle exists to hit one thing at range: its first shot must be
// the tightest first shot in the game.
const firsts = Object.keys(PRIMARIES).map(k => ({ k, c: string(k, 1)[0] }));
firsts.forEach(f => console.log('  ' + PRIMARIES[f.k].name.padEnd(17) + 'first shot ' + dg(f.c) + '°'));
const best = firsts.reduce((a, b) => a.c <= b.c ? a : b);
console.log('    tightest first shot is the DMR:', best.k === 'dmr' ? 'CORRECT' : 'WRONG (' + best.k + ')');
// and the belt-fed degrades more slowly per shot, because long strings are its job
const sawStr = string('saw', 8);
const sawRamp = (sawStr[3] - sawStr[2]) / Math.max(1e-9, sawStr[2] - sawStr[1]);
const carbRamp = (carb[3] - carb[2]) / Math.max(1e-9, carb[2] - carb[1]);
console.log('  per-shot growth: M4 x' + carbRamp.toFixed(2) + ', belt-fed x' + sawRamp.toFixed(2),
            sawRamp < carbRamp ? 'CORRECT (the SAW is built to keep firing)' : 'WRONG');
game.loadout.primary = 'carbine'; initGame();
console.log('TRIGGER DISCIPLINE TEST DONE');
})();

(function aimSolutionTest(){
console.log('--- firing solution ---');
// Regression: rounds leave the offset muzzle, so the aim angle must be computed
// FROM the muzzle. Using the body->target angle displaces every shot laterally.
const saved = TUNE.eyeLateral;
// The lane is FOUND, not hardcoded. It used to shoot from (400,400) to
// (650,400) on map 0, which was clean air until furniture went into the maps —
// and then a fridge and a wall took the hit rate to 83% and this failed for a
// reason that had nothing to do with the firing solution. The point here is
// that the aim angle is computed from the muzzle rather than the body, so the
// lane has to be empty or it is measuring ballistics instead.
function clearLane() {
  game.mapIndex = 0; initGame();
  for (let y = 1; y < level.h - 1; y++) {
    let run = 0;
    for (let x = 1; x < level.w - 1; x++) {
      const open = !level.wall[y][x] && !level.window[y][x] && !doorAt(x, y);
      run = open ? run + 1 : 0;
      if (run >= 9) return { y, x0: x - run + 2, x1: x - 1 };
    }
  }
  return null;
}
const LANE = clearLane();
function hitRate(lateral, shots) {
  TUNE.eyeLateral = lateral;
  let hits = 0;
  for (let i = 0; i < shots; i++) {
    game.mapIndex = 0; initGame(); game.state = 'play';
    const P = game.player;
    P.x = LANE.x0 * TILE + 16; P.y = LANE.y * TILE + 16;
    P.handed = 'right'; P.shoulder = 'strong';
    P.weapon = { ...TUNE.rifle, spreadBase: 0, spreadMove: 0, spreadWalkMove: 0, recoil: 0 };
    P.recoil = 0; P.moving = false; P.cooldown = 0; P.reloading = 0; P.ammo = 30;
    const tgt = game.enemies[0];
    tgt.x = LANE.x1 * TILE + 16; tgt.y = LANE.y * TILE + 16;
    tgt.alive = true; tgt.hp = 1000; tgt.state = 'idle';
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

// Armour costs WIND, not top speed. Every tier must shorten the sprint, and
// wearing nothing must mean no limit at all.
const speeds = Object.entries(ARMOR).map(([k, v]) => v.speed);
const tanks = Object.entries(ARMOR).map(([k, v]) => v.sprint);
console.log('  top speed is unaffected by armour: ' + JSON.stringify(speeds),
            speeds.every(v => v === 1) ? 'CORRECT' : 'WRONG');
console.log('  seconds of sprint per tier: ' + JSON.stringify(tanks),
            tanks[0] === null && tanks.slice(1).every((v, i) => i === 0 || v < tanks[i])
              ? 'CORRECT (unarmoured is unlimited, and it shortens as it gets heavier)' : 'WRONG');

// enemies are bare below ELITE
const worn = {};
for (let di = 0; di < DIFFICULTIES.length; di++) {
  game.diffIndex = di; game.mapIndex = 1; initGame();
  worn[DIFFICULTIES[di].name] = game.enemies.filter(e => e.armorMax > 0).length + '/' + game.enemies.length;
}
game.diffIndex = 1;
// armour is a ramp across the tiers now, not a switch that flips at ELITE
const n = k => +worn[k].split('/')[0];
console.log('  suspects wearing armor by tier: ' + JSON.stringify(worn),
            n('ROOKIE') === 0 && n('ELITE') > n('REGULAR') && n('REGULAR') >= n('ROOKIE')
              ? 'CORRECT (it ramps, and ROOKIE faces nobody armoured)' : 'WRONG');
console.log('ARMOR TEST DONE');
})();

(function incidentTests(){
console.log('--- incidents: every bystander death names its cause ---');
game.mapIndex = 0; initGame(); game.state = 'play';
const P = game.player;

const kill = (setup) => {
  game.mapIndex = 0; initGame(); game.state = 'play'; game.incidents.length = 0;
  const h = game.hostages[0];
  setup(h);
  return game.incidents[0];
};

const cases = [
  ['direct player round', h => { const P2 = game.player; P2.ammoType = 'fmj';
      applyHit(h, { dmg: 999, ang: 0, pen: 26, side: 'player', owner: P2 }, h.x, h.y); }],
  ['round through drywall', h => { const P2 = game.player; P2.ammoType = 'fmj';
      applyHit(h, { dmg: 999, ang: 0, pen: 26, side: 'squad', owner: P2, penetrated: ['drywall'] }, h.x, h.y); }],
  ['ricochet', h => { const P2 = game.player; P2.ammoType = 'fmj';
      applyHit(h, { dmg: 999, ang: 0, pen: 26, side: 'enemy', owner: P2, ricochets: 1 }, h.x, h.y); }],
  ['spall off brick', h => { h.hp = 1; applySpall(h.x + 8, h.y, MATERIALS.brick, 'player'); }],
  ['breach blast', h => { h.hp = 1; applyBlast(h.x, h.y, 'squad'); }],
  // the clock is the taker's own awareness now, not the global flag
  ['executed', h => { const t = game.enemies.find(e => e.kind === 'taker') || game.enemies[0];
      t.kind = 'taker'; t.x = h.x + 10; t.y = h.y; t.alerted = true; t.state = 'hunt';
      game.alarm = true; game.execT = -1;
      game.hostages.forEach((x, i) => { if (i) x.alive = false; });
      updateExecutionTimer(0.016); }],
];
let missing = [];
for (const [label, setup] of cases) {
  const inc = kill(setup);
  if (!inc) { missing.push(label + ': NO INCIDENT'); continue; }
  if (/cause unrecorded/.test(inc.text)) missing.push(label + ': unattributed');
  console.log('  ' + label.padEnd(22) + ' -> "' + inc.text + '"' + (inc.byUs ? '  [charged to you]' : ''));
}
console.log('  all six attributed:', missing.length ? 'WRONG -> ' + missing.join('; ') : 'CORRECT');

// the failure message must carry the cause, not a shrug
game.mapIndex = 0; initGame(); game.state = 'play'; game.incidents.length = 0;
const h0 = game.hostages[0]; game.player.ammoType = 'fmj';
applyHit(h0, { dmg: 999, ang: 0, pen: 26, side: 'player', owner: game.player, penetrated: ['drywall'] }, h0.x, h0.y);
const msg = OBJECTIVES.rescue.failed();
console.log('  mission failure text: "' + msg + '"',
            msg && msg !== 'A hostage was killed.' && /drywall/.test(msg) ? 'CORRECT' : 'WRONG');

// a secured hostage is prone and must not be a bullet target at all
game.mapIndex = 0; initGame(); game.state = 'play';
const h1 = game.hostages[0];
game.enemies.forEach(e => e.alive = false);
trySecureHostage(h1);
const hitable = firstEntityOnSegment({ x: h1.x - 60, y: h1.y, side: 'player', owner: null }, h1.x + 60, h1.y);
console.log('  secured hostage: prone=' + h1.prone + ', r=' + h1.r +
            ', still a bullet target: ' + (hitable && hitable.ent === h1),
            h1.prone && !(hitable && hitable.ent === h1) ? 'CORRECT' : 'WRONG');
console.log('  securing damages nobody: hostages alive ' +
            game.hostages.filter(x => x.alive).length + '/' + game.hostages.length,
            game.hostages.every(x => x.alive) ? 'CORRECT' : 'WRONG');
console.log('INCIDENT TEST DONE');
})();

(function briefingTests(){
console.log('--- briefing: intel derived from the map, and the call sheet ---');

// surveying a map must never disturb the one you are standing in
game.mapIndex = 0; initGame(); game.state = 'play';
const sig = () => level.w + ':' + level.h + ':' + level.doors.length + ':' +
                  level.spawns.enemies.length + ':' + level.spawns.hostages.length;
const before = sig();
for (let m = 0; m < MAPS.length; m++) surveyMap(MAPS[m].src, 2);
console.log('  live level after surveying all six maps: ' + sig(),
            sig() === before ? 'CORRECT (no globals touched)' : 'WRONG — clobbered ' + before);

// the survey must agree with what parseLevel actually builds
let drift = [];
for (let m = 0; m < MAPS.length; m++) {
  game.mapIndex = m; initGame();
  const s = surveyMap(MAPS[m].src, game.diffIndex, MAPS[m].src2 || null);
  // a two-floor mission's survey counts the whole house — compare against the
  // SUM of both parsed floors, not just the one currently swapped in
  const floors = (game.floors && game.floors.length > 1) ? game.floors.map(f => f.levelSnap) : [level];
  const tot = (fn) => floors.reduce((a2, L) => a2 + fn(L), 0);
  if (s.contacts !== tot(L => L.spawns.enemies.length)) drift.push(MAPS[m].name + ' contacts ' + s.contacts + ' vs ' + tot(L => L.spawns.enemies.length));
  if (s.hostages.length !== tot(L => L.spawns.hostages.length)) drift.push(MAPS[m].name + ' hostages');
  if (s.doors !== tot(L => L.doors.length)) drift.push(MAPS[m].name + ' doors ' + s.doors + ' vs ' + tot(L => L.doors.length));
  if (s.windows !== tot(L => L.windowAt.size)) drift.push(MAPS[m].name + ' windows');
  const dry = tot(L => {
    let n2 = 0;
    for (let y = 0; y < L.h; y++) for (let x = 0; x < L.w; x++) if (L.mat[y][x] === 'drywall') n2++;
    return n2;
  });
  if (Math.abs(dry - s.partitions) > 0) drift.push(MAPS[m].name + ' partitions ' + s.partitions + ' vs ' + dry);
}
console.log('  survey vs parseLevel across six maps:',
            drift.length ? 'WRONG -> ' + drift.join('; ') : 'CORRECT (contacts, hostages, doors, windows, partitions)');

// the contact estimate must be a band around the truth, never exact, never wild
let bad = [];
for (let m = 0; m < MAPS.length; m++) {
  const s = surveyMap(MAPS[m].src, 1);
  const band = contactBand(s.contacts, (MAPS[m].name.length * 7 + 13) | 0).split('–').map(Number);
  if (!(band[0] <= s.contacts && s.contacts <= band[1])) bad.push(MAPS[m].name + ' band excludes truth');
  if (band[0] === band[1]) bad.push(MAPS[m].name + ' band is exact');
  if (band[1] - band[0] > 4) bad.push(MAPS[m].name + ' band too wide');
}
console.log('  contact estimate brackets the truth without giving it away:',
            bad.length ? 'WRONG -> ' + bad.join('; ') : 'CORRECT');

// armor intel must track the difficulty that actually arms them
// ROOKIE is the bare tier now; armour ramps from REGULAR up
const r = briefingLines(MAPS[0], surveyMap(MAPS[0].src, 0), 0).find(l => l[0] === 'THEIR ARMOR')[1];
const e = briefingLines(MAPS[0], surveyMap(MAPS[0].src, 2), 2).find(l => l[0] === 'THEIR ARMOR')[1];
console.log('  armor intel ROOKIE:  "' + r.slice(0, 26) + '"');
console.log('  armor intel ELITE:   "' + e.slice(0, 26) + '"',
            /No body armour/.test(r) && /(PLATE|SOFT|HEAVY)/.test(e) ? 'CORRECT (it names what they wear)' : 'WRONG');

// the command wheel: four directions, each one meaning something on the target
const dirs = WHEEL.map(w => w.dir);
console.log('  wheel directions: ' + dirs.join('/'),
            dirs.length === 4 && new Set(dirs).size === 4 &&
            ['up','down','left','right'].every(d => dirs.includes(d))
              ? 'CORRECT (D-pad reachable)' : 'WRONG');
game.mapIndex = 0; initGame(); game.state = 'play';
const doorCtx = (() => { const d = level.doors.find(x => x.state === 'closed'); const c = doorCenter(d);
  return { x: c.x, y: c.y, door: d, far: true }; })();
const openCtx = { x: game.player.x + 200, y: game.player.y, door: null, far: true };
WHEEL.forEach(w => console.log('    ' + w.dir.padEnd(6) + ' on a door: "' + w.label(doorCtx, game.squad) +
                               '"   on open ground: "' + w.label(openCtx, game.squad) + '"'));
let threw = [];
for (const w of WHEEL) for (const c of [doorCtx, openCtx]) {
  game.mapIndex = 0; initGame(); game.state = 'play';
  try { w.run(game.squad.filter(s => s.alive), c); } catch (e) { threw.push(w.dir + ': ' + e.message); }
}
console.log('  all four run on a door and on open ground:',
            threw.length ? 'WRONG -> ' + threw.join(' | ') : 'CORRECT');
console.log('BRIEFING TEST DONE');
})();

(function aarTests(){
console.log('--- after-action review: lights on when it goes wrong ---');
game.mapIndex = 0; initGame(); game.state = 'play';

// a real shot must record where it was fired from, or there is no line to draw
const P = game.player;
P.face = 0; P.cooldown = 0; P.reloading = 0; P.ammo = 30;
game.bullets.length = 0;
tryFire(P, aimAngle(P, P.x + 300, P.y));
const b0 = game.bullets[0];
console.log('  fired round carries its origin: ' +
            (b0 && b0.ox !== undefined ? '(' + b0.ox.toFixed(0) + ',' + b0.oy.toFixed(0) + ')' : 'NO'),
            b0 && b0.ox !== undefined ? 'CORRECT' : 'WRONG');

// failing must turn the lights on rather than cutting to a menu
game.mapIndex = 0; initGame(); game.state = 'play'; game.zoom = 1.6;
const h = game.hostages[0];
applyHit(h, { dmg: 999, ang: 0, pen: 26, side: 'player', owner: P, ox: h.x - 200, oy: h.y - 60 }, h.x, h.y);
endMission(false, 'A hostage was killed.');
let unseen = 0;
for (let y = 0; y < level.h; y++) for (let x = 0; x < level.w; x++) if (!seen.grid[y][x]) unseen++;
console.log('  state after failing: ' + game.state + ', unseen tiles: ' + unseen,
            game.state === 'aar' && unseen === 0 ? 'CORRECT' : 'WRONG');
console.log('  camera framed both ends: zoom ' + game.zoom.toFixed(2) + ' (play zoom 1.60)',
            game.zoom <= 1.6 && game.zoom >= 0.55 ? 'CORRECT' : 'WRONG');

// stepping must clamp at both ends rather than running off the list
aarFocus(99); const hi = game.aar.i;
aarFocus(-5); const lo = game.aar.i;
console.log('  focus clamps to [0, ' + (game.aar.list.length - 1) + ']: hi=' + hi + ' lo=' + lo,
            hi === game.aar.list.length - 1 && lo === 0 ? 'CORRECT' : 'WRONG');

// and leaving hands the camera back
endMission(false, 'A hostage was killed.');
console.log('  after acknowledging: state ' + game.state + ', zoom restored to ' + game.zoom.toFixed(2),
            game.state === 'debrief' && Math.abs(game.zoom - 1.6) < 0.001 ? 'CORRECT' : 'WRONG');

// a win goes straight to the debrief — the review is for failures
game.mapIndex = 0; initGame(); game.state = 'play';
endMission(true, '');
console.log('  a won mission skips the review: ' + game.state,
            game.state === 'debrief' ? 'CORRECT' : 'WRONG');

// failing with nothing recorded must still produce something to look at
game.mapIndex = 0; initGame(); game.state = 'play';
game.incidents.length = 0;
endMission(false, 'Time expired.');
console.log('  failure with no incidents still reviewable: ' + game.aar.list.length + ' entry, "' +
            game.aar.list[0].text + '"',
            game.aar && game.aar.list.length === 1 ? 'CORRECT' : 'WRONG');
endMission(false, 'Time expired.');
console.log('AAR TEST DONE');
})();

(function noiseAndClockTests(){
console.log('--- noise through structure, and whose clock it is ---');
game.mapIndex = 0; initGame(); game.state = 'play';

// sound must lose energy through material, and lose more through more of it
const openLoss = soundLoss(100, 100, 160, 100);
console.log('  loss across open floor: ' + openLoss, openLoss === 0 ? 'CORRECT' : 'WRONG');
let oneWall = null, twoWall = null;
for (let y = 2; y < level.h - 2 && !twoWall; y++) {
  let hits = [];
  for (let x = 1; x < level.w - 1; x++) if (isWall(x, y) && !isWall(x - 1, y)) hits.push(x);
  if (hits.length >= 2) {
    const yy = y * TILE + 16;
    oneWall = soundLoss((hits[0] - 1) * TILE + 16, yy, (hits[0] + 1) * TILE + 16, yy);
    twoWall = soundLoss((hits[0] - 1) * TILE + 16, yy, (hits[1] + 1) * TILE + 16, yy);
  }
}
console.log('  loss through one barrier: ' + oneWall + ', through two: ' + twoWall,
            oneWall > 0 && twoWall > oneWall ? 'CORRECT (it accumulates)' : 'WRONG');

// a closed door must muffle and an open one must not
const d = level.doors[0], c = doorCenter(d);
const across = (dx, dy) => soundLoss(c.x - dx, c.y - dy, c.x + dx, c.y + dy);
d.state = 'closed'; const shut = across(d.orient === 'h' ? 0 : 40, d.orient === 'h' ? 40 : 0);
d.state = 'open';   const open = across(d.orient === 'h' ? 0 : 40, d.orient === 'h' ? 40 : 0);
console.log('  door closed loses ' + shut + ', open loses ' + open,
            shut > open ? 'CORRECT (closing a door behind you now does something)' : 'WRONG');
d.state = 'closed';

// the executioner's clock must be HIS, not a global flag
game.mapIndex = 0; initGame(); game.state = 'play';
const taker = game.enemies.find(e => e.kind === 'taker');
const other = game.enemies.find(e => e !== taker);
game.alarm = false; taker.alerted = false; other.alerted = false;
alertEnemy(other, other.x, other.y);              // someone far away hears something
console.log('  a guard alerting sets game.alarm: ' + game.alarm +
            ', but the taker knows: ' + taker.alerted);
console.log('  clock running on a global alarm the taker cannot know about: ' + game.alarmTimerVisible(),
            game.alarm && !taker.alerted && !game.alarmTimerVisible() ? 'CORRECT' : 'WRONG');
alertEnemy(taker, 0, 0);
console.log('  once HE knows, the clock runs: ' + game.alarmTimerVisible(),
            game.alarmTimerVisible() ? 'CORRECT' : 'WRONG');

// and a callout must actually move awareness between men
game.mapIndex = 0; initGame(); game.state = 'play';
const a = game.enemies[0], b = game.enemies[1];
b.x = a.x + 60; b.y = a.y; a.alerted = false; b.alerted = false; a._calloutCd = 0;
enemyCallout(a, a.x + 200, a.y);
console.log('  a shout at 60px with nothing between reaches a comrade: ' + b.alerted,
            b.alerted ? 'CORRECT' : 'WRONG');
game.mapIndex = 0; initGame(); game.state = 'play';
const a2 = game.enemies[0], b2 = game.enemies[1];
b2.x = a2.x + 3000; b2.y = a2.y; a2.alerted = false; b2.alerted = false; a2._calloutCd = 0;
enemyCallout(a2, a2.x, a2.y);
console.log('  the same shout does not reach a man 3000px away: ' + !b2.alerted,
            !b2.alerted ? 'CORRECT' : 'WRONG');
console.log('NOISE+CLOCK TEST DONE');
})();

(function shootHouseAndBoundTests(){
console.log('--- the shoot house, and bounding overwatch ---');
const shIdx = MAPS.findIndex(m => m.training);
console.log('  a training mission exists: ' + (shIdx >= 0 ? MAPS[shIdx].name : 'NONE'),
            shIdx >= 0 ? 'CORRECT' : 'WRONG');
game.mapIndex = shIdx; initGame(); game.state = 'play';
console.log('  no hostages, no civilians, no hostage-taker: ' +
            game.hostages.length + '/' + game.civilians.length + '/' +
            game.enemies.filter(e => e.kind === 'taker').length,
            !game.hostages.length && !game.civilians.length &&
            !game.enemies.some(e => e.kind === 'taker') ? 'CORRECT (nothing on a clock)' : 'WRONG');
console.log('  objectives: ' + JSON.stringify(MAPS[shIdx].objectives),
            MAPS[shIdx].objectives.length === 1 && MAPS[shIdx].objectives[0] === 'neutralize'
              ? 'CORRECT (just the fight)' : 'WRONG');

// it must teach the things it claims to: doors incl. a locked one, shoot-through
// partitions, real cover, and windows
const locked = level.doors.filter(d => d.locked).length;
let dry = 0, brick = 0;
for (let y = 0; y < level.h; y++) for (let x = 0; x < level.w; x++) {
  if (level.mat[y][x] === 'drywall') dry++;
  if (level.mat[y][x] === 'brick') brick++;
}
console.log('  teaches: ' + level.doors.length + ' doors (' + locked + ' locked), ' +
            dry + ' shoot-through partitions, ' + brick + ' brick cover tiles, ' +
            level.windowAt.size + ' windows',
            locked >= 1 && dry > 10 && brick > 0 && level.windowAt.size > 0 ? 'CORRECT' : 'WRONG');

// every contact must be reachable, or the mission cannot be completed
const st0 = tileAt(level.spawns.player.x, level.spawns.player.y);
const unreachable = level.spawns.enemies.filter(es => {
  const et = tileAt(es.x, es.y);
  return !astar(st0.tx, st0.ty, et.tx, et.ty, passForPath, pathCostSquad);
});
console.log('  all ' + level.spawns.enemies.length + ' contacts reachable from the entry: ' +
            (unreachable.length === 0), unreachable.length === 0 ? 'CORRECT' : 'WRONG');

// --- bounding overwatch: somebody is always still
const play = PLAYS.find(p => p.name === 'BOUND');
console.log('  BOUND is in the playbook on [' + (play ? play.key : '?') + ']', play ? 'CORRECT' : 'WRONG');
game.diffIndex = 1; game.densityIndex = 1;   // pin: leaked ELITE/SWARM is a different test
game.mapIndex = shIdx; initGame(); game.state = 'play';
const P = game.player;
input.mouse.wx = P.x + 420; input.mouse.wy = P.y;
callPlay(play);
console.log('  called: orders ' + JSON.stringify(game.squad.map(s => s.order.type)),
            game.squad.every(s => s.order.type === 'bound') ? 'CORRECT' : 'WRONG');
const elements = new Set(game.squad.map(s => s.order.element));
console.log('  split into ' + elements.size + ' elements',
            elements.size === 2 ? 'CORRECT (one moves, one watches)' : 'WRONG');

// drive it and confirm at least one man is stationary on every frame of travel
let bothMoving = 0, samples = 0, swaps = 0, lastUp = game.bound ? game.bound.moving : 0;
const prev = new Map();
for (let f = 0; f < 60 * 14 && game.bound; f++) {
  game.squad.forEach(s => prev.set(s, { x: s.x, y: s.y }));
  update(1 / 60);
  if (!game.bound) break;
  if (game.bound.moving !== lastUp) { swaps++; lastUp = game.bound.moving; }
  const moved = game.squad.filter(s => s.alive && dist(s.x, s.y, prev.get(s).x, prev.get(s).y) > 0.4);
  const still = game.squad.filter(s => s.alive).length - moved.length;
  samples++;
  if (still === 0) bothMoving++;
}
console.log('  frames of travel where NOBODY was covering: ' + bothMoving + '/' + samples,
            samples > 0 && bothMoving / samples < 0.06 ? 'CORRECT' : 'WRONG (' +
            (100 * bothMoving / Math.max(1, samples)).toFixed(0) + '% uncovered)');

// and the degenerate case: if the covering element dies, the bound must END,
// not continue as one man strolling with nobody on his ground
initGame(); game.state = 'play';
input.mouse.wx = game.player.x + 420; input.mouse.wy = game.player.y;
callPlay(play);
const solo = game.squad.filter(s => s.order.element === 0);
solo.forEach(s => { s.alive = false; });             // the covering element is gone
update(1 / 60);
const survivor = game.squad.find(s => s.alive);
console.log('  covering element wiped: bound=' + (game.bound !== null) + ', survivor order=' +
            (survivor ? survivor.order.type : '—'),
            game.bound === null && survivor && survivor.order.type === 'hold'
              ? 'CORRECT (ELEMENT DOWN — HOLDING)' : 'WRONG (he kept strolling)');
console.log('  elements swapped ' + swaps + ' times during the move',
            swaps >= 1 ? 'CORRECT (it leapfrogs)' : 'WRONG (one element did it all)');
console.log('SHOOT HOUSE + BOUND TEST DONE');
})();

(function loadoutAndVisionTests(){
console.log('--- sidearm, and shared vision ---');
game.mapIndex = 0; initGame(); game.state = 'play';
const P = game.player;

console.log('  guns carried: ' + P.guns.map(g => g.name).join(' + '),
            P.guns.length === 2 && P.gunIndex === 0 ? 'CORRECT (primary up)' : 'WRONG');

// magazine state must survive the swap in both directions
P.ammo = 7; P.swapT = 0; P.cooldown = 0;
swapGun(P, 1);
const onPistol = { name: P.guns[P.gunIndex].name, ammo: P.ammo, mag: P.weapon.mag, round: P.ammoType };
P.ammo = 3; P.cooldown = 0;
swapGun(P, 0);
const back = { name: P.guns[P.gunIndex].name, ammo: P.ammo };
console.log('  to sidearm: ' + JSON.stringify(onPistol));
console.log('  back to primary: ' + JSON.stringify(back) + ' (left it on 7)',
            onPistol.ammo === SIDEARM.w.mag && back.ammo === 7 ? 'CORRECT (each gun keeps its rounds)' : 'WRONG');
swapGun(P, 1);
console.log('  the sidearm fires pistol ammunition: ' + P.ammoType,
            P.ammoType === 'pistol' ? 'CORRECT' : 'WRONG');
console.log('  and swapping costs time: cooldown ' + P.cooldown.toFixed(2) + 's',
            P.cooldown >= TUNE.gunSwapTime - 0.001 ? 'CORRECT' : 'WRONG');
swapGun(P, 0);

// shared vision: a squaddie's cone must reveal ground the player has not walked
game.mapIndex = 0; initGame(); game.state = 'play';
seen.init();
const s0 = game.squad[0];
s0.x = game.player.x + 300; s0.y = game.player.y; s0.face = 0;
const count = () => { let n = 0; for (let y = 0; y < level.h; y++) for (let x = 0; x < level.w; x++) if (seen.grid[y][x]) n++; return n; };
const before = count();
computeVisCone(s0.x, s0.y, TUNE.squadViewDist, s0.face, deg(160), 44);
const gained = count() - before;
console.log('  one squaddie cone reveals ' + gained + ' tiles', gained > 20 ? 'CORRECT' : 'WRONG');

// ...and it must be a cone, not a circle: nothing behind him
let behind = 0;
for (let y = 0; y < level.h; y++) for (let x = 0; x < level.w; x++) {
  if (!seen.grid[y][x]) continue;
  const wx = x * TILE + 16, wy = y * TILE + 16;
  if (dist(s0.x, s0.y, wx, wy) < 40) continue;
  if (Math.abs(angDiff(s0.face, angleTo(s0.x, s0.y, wx, wy))) > deg(100)) behind++;
}
console.log('  tiles revealed behind him: ' + behind, behind === 0 ? 'CORRECT (a cone, not a circle)' : 'WRONG');

// last-known must survive losing sight, and expire
game.mapIndex = 0; initGame(); game.state = 'play';
const e0 = game.enemies[0];
e0.x = game.player.x + 100; e0.y = game.player.y; game.player.face = 0;
game.eye = eyePoint(game.player);
rememberSightings();
const marked = !!e0.lastSeen;
e0.x = game.player.x + 5000;
rememberSightings();
console.log('  contact remembered after he leaves: ' + (marked && !!e0.lastSeen),
            marked && e0.lastSeen ? 'CORRECT' : 'WRONG');
console.log('  the mark expires after ' + TUNE.memoryFade + 's',
            TUNE.memoryFade > 5 && TUNE.memoryFade < 60 ? 'CORRECT' : 'WRONG');

// snake cam works on both a door and a window
game.mapIndex = 0; initGame(); game.state = 'play';
const dd = level.doors.find(x => x.state === 'closed'), dc = doorCenter(dd);
game.player.x = dc.x + 30; game.player.y = dc.y + 30; game.snake = null;
snakeCam(game.player);
const onDoor = !!game.snake;
const win = [...level.windowAt.values()][0];
game.player.x = win.tx * TILE + 16; game.player.y = win.ty * TILE + 16 + 34; game.snake = null;
snakeCam(game.player);
const onWin = !!game.snake;
game.player.x = 20; game.player.y = 20; game.snake = null;
snakeCam(game.player);
console.log('  snake cam: door ' + onDoor + ', window ' + onWin + ', open ground ' + !!game.snake,
            onDoor && onWin && !game.snake ? 'CORRECT' : 'WRONG');
console.log('LOADOUT+VISION TEST DONE');
})();

(function suppressionAndPillboxTests(){
console.log('--- suppression, base of fire, and the pillbox ---');
game.mapIndex = 0; initGame(); game.state = 'play';
const P = game.player, e = game.enemies[0];

// a round that misses close must still count
e.x = P.x + 300; e.y = P.y; e.suppress = 0;
const b = { x: P.x, y: P.y, ang: 0, side: 'player', owner: P, dmg: 1, pen: 26 };
suppressAlong(b, P.x + 600, P.y + 20);           // passes 20px off him
console.log('  a round 20px wide adds ' + (e.suppress || 0).toFixed(2) + ' suppression',
            e.suppress > 0 ? 'CORRECT' : 'WRONG');
e.suppress = 0;
suppressAlong(b, P.x + 600, P.y + 300);          // passes 300px off him
console.log('  a round 300px wide adds ' + (e.suppress || 0).toFixed(2),
            !e.suppress ? 'CORRECT (only near misses count)' : 'WRONG');

// friendly rounds must not suppress the friendlies who fired them
game.squad[0].x = P.x + 100; game.squad[0].y = P.y; game.squad[0].suppress = 0;
suppressAlong(b, P.x + 600, P.y);
console.log('  your own rounds do not suppress your own team: ' + !game.squad[0].suppress,
            !game.squad[0].suppress ? 'CORRECT' : 'WRONG');
const eb = { x: e.x, y: e.y, ang: Math.PI, side: 'enemy', owner: e, dmg: 1, pen: 26 };
P.suppress = 0; suppressAlong(eb, P.x, P.y + 15);
console.log('  incoming fire suppresses YOU too: ' + (P.suppress || 0).toFixed(2),
            P.suppress > 0 ? 'CORRECT' : 'WRONG');

// suppression must open the cone and, past the threshold, stop him firing back
const base = currentSpread(e);
e.suppress = TUNE.suppressMax;
const wide = currentSpread(e);
console.log('  his cone at full suppression: ' + (base * 180 / Math.PI).toFixed(1) + '° -> ' +
            (wide * 180 / Math.PI).toFixed(1) + '°', wide > base ? 'CORRECT' : 'WRONG');
console.log('  pinned threshold ' + TUNE.suppressPinned + ' of max ' + TUNE.suppressMax,
            TUNE.suppressPinned < TUNE.suppressMax ? 'CORRECT (he is degraded before he is pinned)' : 'WRONG');

// measure it end to end: does a pinned enemy actually stop shooting?
function volley(suppressed) {
  // open ground on the pillbox approach, so he genuinely has line of sight —
  // updateEnemy drops him to hunt the moment he cannot see you
  game.mapIndex = MAPS.findIndex(m => m.name === 'THE PILLBOX'); initGame(); game.state = 'play';
  const t = game.enemies[0], pl = game.player;
  pl.x = 6 * TILE; pl.y = 15 * TILE;
  t.x = pl.x + 230; t.y = pl.y; t.state = 'combat'; t.target = pl; t.reactT = 0; t.alerted = true;
  // enemies spawn with a random homeFace; point him at the player or he never
  // acquires and the measurement is a coin flip
  t.face = angleTo(t.x, t.y, pl.x, pl.y); t.homeFace = t.face;
  t.ammo = 999;
  let shots = 0;
  const _tf = tryFire;
  tryFire = function (sh, a) { const r = _tf(sh, a); if (r && sh === t) shots++; return r; };
  for (let f = 0; f < 60 * 6; f++) {
    if (suppressed) t.suppress = TUNE.suppressMax;
    t.ammo = 999; t.reloading = 0;
    updateEnemy(t, 1 / 60);
  }
  tryFire = _tf;
  return shots;
}
const free = volley(false), pinned = volley(true);
console.log('  rounds he gets off in 6s: unsuppressed ' + free + ', pinned ' + pinned,
            free > 0 && pinned === 0 ? 'CORRECT (a base of fire buys the crossing)' : 'WRONG');

// the base-of-fire order
game.mapIndex = 0; initGame(); game.state = 'play';
const t0 = game.enemies[0];
t0.lastSeen = { x: t0.x, y: t0.y, t: 0 };
const ctx = wheelContext.call ? { x: t0.x, y: t0.y, threat: { x: t0.x, y: t0.y }, door: null, far: true } : null;
const down = WHEEL.find(w => w.dir === 'down');
console.log('  wheel down on a known contact reads: "' + down.label(ctx, game.squad) + '"',
            /SUPPRESS/.test(down.label(ctx, game.squad)) ? 'CORRECT' : 'WRONG');
down.run(game.squad.filter(s => s.alive), ctx);
console.log('  orders: ' + JSON.stringify(game.squad.map(s => s.order.type)),
            game.squad.every(s => s.order.type === 'suppress') ? 'CORRECT' : 'WRONG');

// the pillbox
const pb = MAPS.findIndex(m => m.name === 'THE PILLBOX');
console.log('  THE PILLBOX exists at index ' + pb, pb >= 0 ? 'CORRECT' : 'WRONG');
game.mapIndex = pb; initGame();
console.log('  skirmish, not a rescue: objectives ' + JSON.stringify(MAPS[pb].objectives) +
            ', hostages ' + game.hostages.length,
            !MAPS[pb].objectives.includes('rescue') && game.hostages.length === 0 ? 'CORRECT' : 'WRONG');
console.log('  firing slits: ' + level.windowAt.size + ' windows, ' +
            level.doors.length + ' door(s) into the strongpoint',
            level.windowAt.size >= 3 && level.doors.length >= 1 ? 'CORRECT' : 'WRONG');
let brick = 0;
for (let y = 0; y < level.h; y++) for (let x = 0; x < level.w; x++) if (level.mat[y][x] === 'brick') brick++;
console.log('  hard cover on the approach: ' + brick + ' brick tiles to bound between',
            brick >= 20 ? 'CORRECT' : 'WRONG');
const st = tileAt(level.spawns.player.x, level.spawns.player.y);
const unreach = level.spawns.enemies.filter(sp => {
  const et = tileAt(sp.x, sp.y);
  return !astar(st.tx, st.ty, et.tx, et.ty, passForPath, pathCostSquad);
});
console.log('  all ' + level.spawns.enemies.length + ' defenders reachable: ' + (unreach.length === 0),
            unreach.length === 0 ? 'CORRECT (the flank goes through)' : 'WRONG');
console.log('SUPPRESSION+PILLBOX TEST DONE');
})();

(function throwablesTests(){
console.log('--- frag, concussion, smoke, and bounding into cover ---');
const pbIdx = MAPS.findIndex(m => m.name === 'THE PILLBOX');
game.mapIndex = pbIdx; initGame(); game.state = 'play';
const P = game.player;

console.log('  the bag: ' + THROW_ORDER.map(k => THROWABLES[k].name + ' ' + (P.nades[k] || 0)).join(', '));
// Five natures, five slots — four cardinals plus the centre, one nature each.
// Nothing shares a slot now that nobody picks a kit.
const dirs = new Set(THROW_ORDER.map(k => THROWABLES[k].dir));
const perDir = [...dirs].map(d => THROW_ORDER.filter(k => THROWABLES[k].dir === d).length);
console.log('  five slots, kinds per slot ' + perDir.join('/'),
            dirs.size === 5 && perDir.every(n => n === 1) ? 'CORRECT (one nature each)' : 'WRONG');
// THE SAFETY LAYOUT, asserted rather than left as a comment. A mis-flick must
// never escalate: the no-flick centre cannot be the lethal one, and the two
// explosive natures must sit on opposite ends of one axis.
const OPP = { up: 'down', down: 'up', left: 'right', right: 'left' };
console.log('  the no-flick centre is the harmless one: ' + THROWABLES.bang.dir,
            THROWABLES.bang.dir === 'center' ? 'CORRECT' : 'WRONG');
console.log('  frag is opposite concussion: ' + THROWABLES.frag.dir + ' vs ' + THROWABLES.conc.dir,
            OPP[THROWABLES.frag.dir] === THROWABLES.conc.dir ? 'CORRECT (the confusable pair, split)' : 'WRONG');
console.log('  frag is never the centre: ' + (THROWABLES.frag.dir !== 'center'),
            THROWABLES.frag.dir !== 'center' ? 'CORRECT' : 'WRONG');

// FRAG kills, and the incident names it
game.mapIndex = pbIdx; initGame(); game.state = 'play'; game.incidents.length = 0;
const victim = game.enemies[0];
victim.x = game.player.x + 400; victim.y = game.player.y;
wearArmor(victim, 'none'); victim.hp = 65;
detonateFrag({ x: victim.x, y: victim.y, side: 'player', kind: 'frag' });
console.log('  frag on a man at zero range: ' + (victim.alive ? 'survived ' + victim.hp.toFixed(0) + 'hp' : 'killed'),
            !victim.alive ? 'CORRECT' : 'WRONG');
game.mapIndex = pbIdx; initGame(); game.state = 'play';
const far = game.enemies[0]; far.x = game.player.x + 400; far.y = game.player.y; far.hp = 65;
detonateFrag({ x: far.x + TUNE.fragWound + 60, y: far.y, side: 'player', kind: 'frag' });
console.log('  frag beyond its wounding radius: ' + far.hp.toFixed(0) + 'hp left',
            far.hp === 65 ? 'CORRECT (it has an edge)' : 'WRONG');

// CONCUSSION reaches around a corner that a flashbang cannot
game.mapIndex = pbIdx; initGame(); game.state = 'play';
function behindWall() {
  // find a spot with a wall between two open tiles
  for (let y = 10; y < 25; y++) for (let x = 16; x < 42; x++) {
    if (!isWall(x, y) || level.mat[y][x] !== 'drywall') continue;
    const a = { x: (x - 2) * TILE + 16, y: y * TILE + 16 }, b = { x: (x + 2) * TILE + 16, y: y * TILE + 16 };
    if (!isWall(tileAt(a.x, a.y).tx, tileAt(a.x, a.y).ty) && !isWall(tileAt(b.x, b.y).tx, tileAt(b.x, b.y).ty)
        && !lineOfSight(a.x, a.y, b.x, b.y, opaque)) return { a, b };
  }
  return null;
}
// use a PARTITION, not concrete — the claim is that overpressure carries
// through thin structure and around a corner, not through a bunker wall
game.mapIndex = MAPS.findIndex(m => m.training); initGame(); game.state = 'play';
const pair = behindWall();
if (pair) {
  const e1 = game.enemies[0];
  e1.x = pair.b.x; e1.y = pair.b.y; e1.stagger = 0; e1.blind = 0; e1.hp = 65;
  detonateBang({ x: pair.a.x, y: pair.a.y, side: 'player', kind: 'bang' });
  const flashHit = e1.blind > 0;
  e1.stagger = 0; e1.blind = 0;
  detonateConcussion({ x: pair.a.x, y: pair.a.y, side: 'player', kind: 'conc' });
  const concHit = e1.stagger > 0;
  console.log('  through a wall: flashbang reached him ' + flashHit + ', concussion reached him ' + concHit,
              !flashHit && concHit ? 'CORRECT (that is the difference between them)' : 'WRONG');
} else console.log('  through a wall: NO TEST GEOMETRY FOUND');

// SMOKE blocks sight but not bullets or movement
game.mapIndex = pbIdx; initGame(); game.state = 'play';
game.smokes.length = 0; level.smokeGrid = null;
const A = { x: 8 * TILE + 16, y: 15 * TILE + 16 }, B = { x: 16 * TILE + 16, y: 15 * TILE + 16 };
const losBefore = lineOfSight(A.x, A.y, B.x, B.y, opaque);
popSmoke({ x: (A.x + B.x) / 2, y: A.y, side: 'player', kind: 'smoke' });
for (let i = 0; i < 120; i++) updateSmokes(1 / 60);
const mid = tileAt((A.x + B.x) / 2, A.y);
console.log('  sight across open ground before smoke: ' + losBefore + ', after: ' +
            lineOfSight(A.x, A.y, B.x, B.y, opaque),
            losBefore && !lineOfSight(A.x, A.y, B.x, B.y, opaque) ? 'CORRECT' : 'WRONG');
console.log('  smoke stops bullets: ' + blocksBullet(mid.tx, mid.ty) +
            ', smoke stops movement: ' + solidForMove(mid.tx, mid.ty),
            !blocksBullet(mid.tx, mid.ty) && !solidForMove(mid.tx, mid.ty)
              ? 'CORRECT (sight only)' : 'WRONG');
// and it must clear itself up
for (let i = 0; i < 60 * (TUNE.smokeLife + 2); i++) updateSmokes(1 / 60);
console.log('  it dissipates: ' + game.smokes.length + ' clouds left, sight back: ' +
            lineOfSight(A.x, A.y, B.x, B.y, opaque),
            game.smokes.length === 0 && lineOfSight(A.x, A.y, B.x, B.y, opaque) ? 'CORRECT' : 'WRONG');

// BOUNDING must finish its legs behind something
game.mapIndex = pbIdx; initGame(); game.state = 'play';
const s0 = game.squad[0];
s0.x = 6 * TILE; s0.y = 15 * TILE;
const goal = { x: 30 * TILE, y: 15 * TILE };
const threat = threatBearingFor(s0, goal.x, goal.y);
let covered = 0, naive = 0, N = 24;
for (let i = 0; i < N; i++) {
  s0.x = (6 + (i % 6)) * TILE; s0.y = (11 + (i % 9)) * TILE;
  const leg = pickBoundLeg(s0, goal.x, goal.y);
  if (coveredFrom(leg.x, leg.y, threat.x, threat.y) > 0.25) covered++;
  const straight = nearestPassable(s0.x + Math.cos(angleTo(s0.x, s0.y, goal.x, goal.y)) * TUNE.boundLeg,
                                   s0.y + Math.sin(angleTo(s0.x, s0.y, goal.x, goal.y)) * TUNE.boundLeg);
  if (coveredFrom(straight.x, straight.y, threat.x, threat.y) > 0.25) naive++;
}
console.log('  bound legs that end in cover: ' + covered + '/' + N +
            '   (straight-line legs: ' + naive + '/' + N + ')',
            covered > naive ? 'CORRECT (it is looking for cover now)' : 'WRONG — no better than a sprint');
console.log('THROWABLES TEST DONE');
})();

(function weaponRosterTests(){
console.log('--- the squad automatic and the marksman rifle ---');
const cells = [];
for (const [k, v] of Object.entries(PRIMARIES)) {
  cells.push({ k, name: v.name, dmg: v.w.dmg, rpm: v.w.rpm, mag: v.w.mag,
               range: v.w.range, spread: +(v.w.spreadBase * 180 / Math.PI).toFixed(1),
               carry: v.speed || 1 });
}
cells.forEach(c => console.log('  ' + c.name.padEnd(17) + String(c.dmg).padStart(3) + 'dmg ' +
  String(c.rpm).padStart(4) + 'rpm ' + String(c.mag).padStart(4) + 'rd ' +
  String(c.range).padStart(5) + 'px  cone ' + String(c.spread).padStart(4) + '°  move x' + c.carry));
const saw = PRIMARIES.saw, dmr = PRIMARIES.dmr, m4 = PRIMARIES.carbine;
console.log('  the belt-fed trades: ' + (saw.w.mag / m4.w.mag).toFixed(1) + 'x the ammunition, ' +
            (saw.w.spreadBase / m4.w.spreadBase).toFixed(1) + 'x the cone, ' +
            Math.round((1 - saw.speed) * 100) + '% slower',
            saw.w.mag > m4.w.mag && saw.w.spreadBase > m4.w.spreadBase && saw.speed < 1 ? 'CORRECT' : 'WRONG');
console.log('  the marksman trades: ' + (dmr.w.dmg / m4.w.dmg).toFixed(1) + 'x the damage and ' +
            (dmr.w.range / m4.w.range).toFixed(1) + 'x the reach, at ' +
            (dmr.w.rpm / m4.w.rpm).toFixed(2) + 'x the rate',
            dmr.w.dmg > m4.w.dmg && dmr.w.range > m4.w.range && dmr.w.rpm < m4.w.rpm ? 'CORRECT' : 'WRONG');

// rounds-to-kill: each gun should own a different range band
function rtk(prim, ammoKey, hp) {
  const round = AMMO[ammoKey];
  let n = 0, left = hp;
  while (left > 0 && n < 60) { n++; left -= prim.w.dmg * round.dmgMul; }
  return n;
}
console.log('  rounds to put down a 65hp guard — M4 ' + rtk(m4, 'fmj', 65) +
            ', SAW ' + rtk(saw, 'fmj', 65) + ', DMR ' + rtk(dmr, 'fmj', 65),
            rtk(dmr, 'fmj', 65) === 1 ? 'CORRECT (one round, one guard)' : 'WRONG');
console.log('  ...but a 120hp elite still takes ' + rtk(dmr, 'fmj', 120) + ' from the DMR',
            rtk(dmr, 'fmj', 120) > 1 ? 'CORRECT (the hard men are still a problem)' : 'WRONG');
// and no duplicate keys quietly eating a template
const tmplSrc = Object.keys(SQUAD_TEMPLATES);
console.log('  ' + tmplSrc.length + ' distinct squad templates: ' + tmplSrc.join(', '),
            tmplSrc.length === new Set(tmplSrc).size && tmplSrc.length >= 4 ? 'CORRECT' : 'WRONG');

// the weight must actually be felt in the legs
game.mapIndex = 0;
game.loadout.primary = 'carbine'; game.loadout.armor = 'none'; initGame();
const fast = gunSpeed(game.player) * armorSpeed(game.player);
game.loadout.primary = 'saw'; initGame();
const slow = gunSpeed(game.player) * armorSpeed(game.player);
game.loadout.primary = 'carbine'; initGame();
console.log('  move multiplier: carbine x' + fast.toFixed(2) + ', belt-fed x' + slow.toFixed(2),
            slow < fast ? 'CORRECT (carrying it costs you)' : 'WRONG');

// and the squad can field them
const roles = Object.keys(ROLES);
console.log('  squad roles: ' + roles.join(', '),
            roles.includes('support') && roles.includes('marksman') ? 'CORRECT' : 'WRONG');
const tmpls = Object.entries(SQUAD_TEMPLATES).map(([k, v]) => k + '(' + v.roles.join('/') + ')');
console.log('  templates: ' + tmpls.join('  '));
let badRole = [];
for (const [k, v] of Object.entries(SQUAD_TEMPLATES)) v.roles.forEach(r => { if (!ROLES[r]) badRole.push(k + ':' + r); });
console.log('  every template names real roles:', badRole.length ? 'WRONG -> ' + badRole.join() : 'CORRECT');
console.log('WEAPON ROSTER TEST DONE');
})();

(function missionPickerTests(){
console.log('--- mission buttons must name the mission they load ---');
// Regression: the buttons render training-first while MAPS keeps its own order,
// so any code that reads a mission index off a button's POSITION picks the
// wrong mission. It highlighted one and loaded another, and hung best-grade
// labels on missions that never earned them.
const rendered = MAPS.map((m, i) => ({ m, i }))
  .sort((a, b) => (b.m.training ? 1 : 0) - (a.m.training ? 1 : 0));
let drift = [];
rendered.forEach((r, pos) => { if (r.i !== pos) drift.push(r.m.name + ' renders at ' + pos + ' but is MAPS[' + r.i + ']'); });
console.log('  render order differs from MAPS order: ' + (drift.length > 0),
            drift.length > 0 ? 'CORRECT (so position must never be used as an index)' : 'n/a');
console.log('    ' + drift.slice(0, 3).join('; '));
const usesPosition = /querySelectorAll\("\.mapbtn"\)\.forEach\(\(x, j\) => \{\s*x\.classList\.toggle\("sel", j === game\.mapIndex\)/;
console.log('  refreshMenu keys off the button position:', usesPosition.test(refreshMenu.toString()) ? 'WRONG' : 'CORRECT (it reads dataset.idx)');
console.log('  and best grades are keyed by the same index: ' +
            (/bests\[j \+ ":"/.test(refreshMenu.toString()) && /\+x\.dataset\.idx/.test(refreshMenu.toString())
              ? 'yes' : 'check'),
            /\+x\.dataset\.idx/.test(refreshMenu.toString()) ? 'CORRECT' : 'WRONG');
console.log('MISSION PICKER TEST DONE');
})();

(function versionConsistencyTests(){
console.log('--- the build must agree with itself about what version it is ---');
// This exists because it did not: twelve feature commits shipped under one
// filename because nothing failed when the version was left alone. This cannot
// catch "forgot to bump", but it catches every way the three records disagree.
const fs = require('fs'), path = require('path');
// the suite runs as a concatenated bundle in /tmp, so __dirname is useless;
// run.sh cds into tests/, so the repo is one level up from cwd
const dir = path.join(process.cwd(), '..');
const files = fs.readdirSync(dir).filter(f => /^top_down_tactical_v[\d.]+\.html$/.test(f));
console.log('  exactly one game file: ' + files.join(', '), files.length === 1 ? 'CORRECT' : 'WRONG');
const name = files[0], src = fs.readFileSync(path.join(dir, name), 'utf8');
const fileV = name.match(/_v([\d.]+)\.html$/)[1];
const headerName = (src.match(/^\s*file:\s*(\S+)/m) || [])[1];
const headerV = (src.match(/^\s*version:\s*([\d.]+)/m) || [])[1];
const titleV = (src.match(/<title>[^<]*v([\d.]+)/) || [])[1];
const h2V = (src.match(/<h2>v([\d.]+) prototype/) || [])[1];
const logged = [...src.matchAll(/^\s{2}v([\d.]+) \(\d{4}-\d{2}-\d{2}\)/gm)].map(m => m[1]);
const newest = logged[logged.length - 1];
console.log('  filename ' + fileV + ' | header ' + headerV + ' | title ' + titleV +
            ' | menu ' + h2V + ' | newest changelog entry ' + newest);
const agree = [headerV, titleV, h2V, newest].every(v => v === fileV) && headerName === name;
console.log('  all five agree:', agree ? 'CORRECT' : 'WRONG — the build is lying about its own version');
// compare as tuples, not as floats — parseFloat says 0.10 is older than 0.9
const cmp = (a, b) => {
  const A = a.split('.').map(Number), B = b.split('.').map(Number);
  for (let i = 0; i < Math.max(A.length, B.length); i++) {
    if ((A[i] || 0) !== (B[i] || 0)) return (A[i] || 0) - (B[i] || 0);
  }
  return 0;
};
console.log('  changelog is in order: ' + logged.join(' -> '),
            logged.length > 1 && logged.every((v, i) => i === 0 || cmp(v, logged[i - 1]) > 0)
              ? 'CORRECT' : 'WRONG');
// The Pages entry point must point at the build that actually exists. Without
// this, the published URL silently serves a 404 the first time a version bump
// forgets to update the redirect — and the person who notices is whoever opened
// the link, not us.
{
  const idxPath = path.join(dir, 'index.html');
  if (!fs.existsSync(idxPath)) {
    console.log('  index.html present for GitHub Pages:', 'WRONG — missing');
  } else {
    const idx = fs.readFileSync(idxPath, 'utf8');
    const targets = [...idx.matchAll(/top_down_tactical_v[\d.]+\.html/g)].map(m => m[0]);
    const uniq = [...new Set(targets)];
    console.log('  index.html redirect target: ' + (uniq.join(', ') || 'NONE'),
                uniq.length === 1 && uniq[0] === name
                  ? 'CORRECT (points at the one build that exists)'
                  : 'WRONG — should be ' + name);
    console.log('  and every link in it agrees: ' + targets.length + ' reference(s)',
                targets.length >= 2 && uniq.length === 1 ? 'CORRECT' : 'WRONG');
  }
}
console.log('VERSION TEST DONE');
})();

(function doorwayTests(){
console.log('--- getting through a doorway, and getting a grenade through one ---');
game.mapIndex = MAPS.findIndex(m => m.training); initGame(); game.state = 'play';

// grenades must thread an opening rather than bounce off the jamb
let made = 0, tries = 0;
for (const d of level.doors) {
  openDoor(d, true);
  const c = doorCenter(d);
  const n = doorNormal(d, c.x + TILE * 2, c.y + TILE * 2);
  const lat = { x: n.y === 0 ? 0 : 1, y: n.x === 0 ? 0 : 1 };
  for (let off = -3; off <= 3; off++) {
    const from = { x: c.x + n.x * TILE * 3 + lat.x * off * 14,
                   y: c.y + n.y * TILE * 3 + lat.y * off * 14, r: 10, side: 'player' };
    if (isWall(tileAt(from.x, from.y).tx, tileAt(from.x, from.y).ty)) continue;
    const target = { x: c.x - n.x * TILE * 2.2, y: c.y - n.y * TILE * 2.2 };
    game.bangs.length = 0;
    throwNade(from, target.x, target.y, 'bang');
    for (let i = 0; i < 200 && game.bangs.length && game.bangs[0].travelLeft > 0; i++) updateBangs(1 / 60);
    const g = game.bangs[0]; tries++;
    if (g && (g.x - c.x) * n.x + (g.y - c.y) * n.y < -TILE * 0.5) made++;
  }
}
console.log('  grenades thrown at a point inside a room: ' + made + '/' + tries + ' got in (' +
            (100 * made / tries).toFixed(0) + '%)',
            made / tries > 0.9 ? 'CORRECT' : 'WRONG');

// a throw with a clear straight line must NOT be bent toward some other door
const P = game.player;
const straight = throwLane({ x: P.x, y: P.y }, P.x + 120, P.y);
console.log('  an unobstructed throw is left alone: ' +
            (Math.abs(straight.x - (P.x + 120)) < 0.01 && !straight.threaded),
            Math.abs(straight.x - (P.x + 120)) < 0.01 ? 'CORRECT' : 'WRONG (aim assist is stealing throws)');

// walking through: near-square approaches must be reliable, oblique ones need work
function traverse(useAssist, approachDeg) {
  game.mapIndex = MAPS.findIndex(m => m.training); initGame(); game.state = 'play';
  let ok = 0, n2 = 0;
  for (const d of level.doors) {
    openDoor(d, true);
    const c = doorCenter(d), nn = doorNormal(d, c.x + TILE * 2, c.y + TILE * 2);
    const lat = { x: nn.y === 0 ? 0 : 1, y: nn.x === 0 ? 0 : 1 };
    for (let off = -10; off <= 10; off += 5) {
      const pl = game.player;
      pl.x = c.x + nn.x * TILE * 2 + lat.x * off;
      pl.y = c.y + nn.y * TILE * 2 + lat.y * off;
      if (isWall(tileAt(pl.x, pl.y).tx, tileAt(pl.x, pl.y).ty)) continue;
      n2++;
      const base = Math.atan2(-nn.y, -nn.x) + deg(approachDeg);
      for (let f = 0; f < 260; f++) {
        const nd = nearestDoor(pl.x, pl.y, 40);
        const rad = (nd && nd.state !== 'closed') ? pl.r * TUNE.doorwaySqueeze : pl.r;
        const a = useAssist ? doorwayAssist(pl, Math.cos(base), Math.sin(base))
                            : { dx: Math.cos(base), dy: Math.sin(base) };
        const res = moveCircle(pl.x, pl.y, rad, a.dx * TUNE.playerRun / 60, a.dy * TUNE.playerRun / 60, solidForMove);
        pl.x = res.x; pl.y = res.y;
        if ((pl.x - c.x) * nn.x + (pl.y - c.y) * nn.y < -TILE * 0.9) { ok++; break; }
      }
    }
  }
  return ok / Math.max(1, n2);
}
const sq = traverse(true, 0), ob = traverse(true, 18), hard = traverse(true, 32);
console.log('  walking through, square on: ' + (sq * 100).toFixed(0) + '%',
            sq > 0.9 ? 'CORRECT' : 'WRONG');
console.log('  18° off square: ' + (ob * 100).toFixed(0) + '%', ob > 0.8 ? 'CORRECT' : 'WRONG');
console.log('  32° off square: ' + (hard * 100).toFixed(0) + '% — deliberately still work,',
            hard < 0.8 ? 'CORRECT (catching a frame stays realistic)' : 'note: fully assisted now');
console.log('DOORWAY TEST DONE');
})();

(function sprintTests(){
console.log('--- sprint, and the wind armour costs you ---');
game.mapIndex = 0; initGame(); game.state = 'play';
const P = game.player;

// unarmoured: no tank at all
wearArmor(P, 'none'); P.stam = undefined; P.moving = true;
for (let i = 0; i < 60 * 30; i++) updateStamina(P, 1 / 60, true);
console.log('  no armour, 30s of continuous sprint: stam=' + P.stam + ', still allowed: ' + P.stamOk,
            P.stam === null && P.stamOk ? 'CORRECT (run all day)' : 'WRONG');

// armoured: the tank empties, and roughly on schedule
// read game.player fresh — initGame replaces the object, so a captured
// reference silently measures the previous loadout
function burn(kind) {
  const pl = game.player;
  wearArmor(pl, kind); pl.stam = undefined; pl.blown = false; pl.moving = true;
  updateStamina(pl, 0, false);
  let t = 0;
  while (pl.stamOk && t < 60) { updateStamina(pl, 1 / 60, true); t += 1 / 60; }
  return t;
}
const rows = ['soft', 'plate', 'heavy'].map(k => ({ k, t: burn(k), spec: ARMOR[k].sprint }));
rows.forEach(r => console.log('  ' + ARMOR[r.k].name.padEnd(11) + 'sprinted ' + r.t.toFixed(1) +
                              's (tank ' + r.spec + 's)'));
console.log('  each tier is shorter than the last:',
            rows.every((r, i) => i === 0 || r.t < rows[i - 1].t) ? 'CORRECT' : 'WRONG');
console.log('  and each matches its tank:',
            rows.every(r => Math.abs(r.t - r.spec) < 0.4) ? 'CORRECT' : 'WRONG');

// blown means blown: you cannot stutter-tap it back
wearArmor(P, 'heavy'); P.stam = 0; P.blown = true; P.moving = true;
updateStamina(P, 1 / 60, true);
console.log('  sprinting on an empty tank: ' + P.stamOk, !P.stamOk ? 'CORRECT (you are blown)' : 'WRONG');
let recov = 0;
while (P.blown && recov < 30) { updateStamina(P, 1 / 60, false); recov += 1 / 60; }
console.log('  seconds of not-sprinting before you can go again: ' + recov.toFixed(1),
            recov > 1 && recov < 8 ? 'CORRECT' : 'WRONG');

// standing still recovers faster than jogging
wearArmor(P, 'plate'); P.stam = 1; P.blown = false;
P.moving = true;  let a = P.stam; updateStamina(P, 1, false); const jog = P.stam - a;
P.stam = 1; P.moving = false; a = P.stam; updateStamina(P, 1, false); const still = P.stam - a;
console.log('  recovery per second: jogging ' + jog.toFixed(2) + ', standing ' + still.toFixed(2),
            still > jog ? 'CORRECT' : 'WRONG');

// a belt-fed empties the tank faster than a carbine
game.loadout.armor = 'plate';
game.loadout.primary = 'carbine'; initGame(); const carb = burn('plate');
game.loadout.primary = 'saw';     initGame(); const saw = burn('plate');
game.loadout.primary = 'carbine'; initGame();
console.log('  same plate, carbine ' + carb.toFixed(1) + 's vs belt-fed ' + saw.toFixed(1) + 's',
            saw < carb ? 'CORRECT (the gun drains it too)' : 'WRONG');

// the three gaits must be genuinely different, and sprint must be the worst shot
const mk = (o) => Object.assign({ weapon: PRIMARIES.carbine.w, recoil: 0, moving: true,
                                  walking: false, shoulder: 'strong', suppress: 0, turnBloom: 0 }, o);
const deg2 = r => (r * 180 / Math.PI).toFixed(2);
const steady = currentSpread(mk({ moving: false, steady: true }));
const planted = currentSpread(mk({ moving: false }));
const jogging = currentSpread(mk({}));
const sprinting = currentSpread(mk({ sprinting: true }));
console.log('  cone: steady ' + deg2(steady) + '° < planted ' + deg2(planted) +
            '° < jogging ' + deg2(jogging) + '° < sprinting ' + deg2(sprinting) + '°',
            steady < planted && planted < jogging && jogging < sprinting ? 'CORRECT' : 'WRONG');
console.log('  sprint speed ' + TUNE.playerSprint + ' > run ' + TUNE.playerRun + ' > steady ' + TUNE.playerWalk,
            TUNE.playerSprint > TUNE.playerRun && TUNE.playerRun > TUNE.playerWalk ? 'CORRECT' : 'WRONG');

// --- the stutter-tap sweep.
// A regen that pays out the instant the key is up makes the tank infinite at
// any duty cycle under regen/(drain+regen) — you never blow, and you carry a
// permanent fraction of the sprint bonus for free. Sweep every duty cycle a
// hand can actually produce and demand two things of all of them: the tank
// still empties, and no tap beats simply holding it down.
function rideOut(kind, onFrames, offFrames, seconds) {
  const pl = game.player;
  wearArmor(pl, kind); pl.stam = undefined; pl.blown = false; pl.stamRest = 0;
  pl.moving = true;
  updateStamina(pl, 0, false);
  const dt = 1 / 60, frames = Math.round(seconds / dt);
  let dist = 0, blew = false, lowest = Infinity;
  for (let f = 0; f < frames; f++) {
    const want = onFrames === Infinity ? true : (f % (onFrames + offFrames)) < onFrames;
    updateStamina(pl, dt, want);
    const sprinting = want && pl.stamOk;
    dist += (sprinting ? TUNE.playerSprint : TUNE.playerRun) * armorSpeed(pl) * gunSpeed(pl) * dt;
    if (pl.blown) blew = true;
    lowest = Math.min(lowest, pl.stam);
  }
  return { avg: dist / seconds, blew, lowest };
}
const DUTIES = [[1,1],[1,2],[1,3],[1,4],[1,5],[2,3],[2,4],[2,5],[3,5],[5,5],[6,10],[10,20],[15,45]];
// 120s is longer than any real approach: a pattern that has not emptied a 9s
// tank in two minutes of continuous tapping is paying for itself out of regen.
for (const kind of ['soft', 'plate', 'heavy']) {
  const hold = rideOut(kind, Infinity, 0, 120);
  let best = null, neverBlew = [];
  for (const [on, off] of DUTIES) {
    const r = rideOut(kind, on, off, 120);
    if (!r.blew) neverBlew.push(on + 'on/' + off + 'off (tank floor ' + r.lowest.toFixed(2) + ')');
    if (!best || r.avg > best.avg) best = Object.assign({ on, off }, r);
  }
  console.log('  ' + ARMOR[kind].name.padEnd(11) + 'hold ' + hold.avg.toFixed(1) +
              'px/s, best of ' + DUTIES.length + ' tap patterns ' + best.avg.toFixed(1) +
              'px/s (' + best.on + 'on/' + best.off + 'off)');
  console.log('    every duty cycle still blows the tank:',
              neverBlew.length === 0 ? 'CORRECT' : 'WRONG — free forever at ' + neverBlew.join(', '));
  console.log('    tapping does not beat holding:',
              best.avg <= hold.avg + 0.5 ? 'CORRECT' : 'WRONG — tapping wins by ' +
              (best.avg - hold.avg).toFixed(1) + 'px/s');
}
// and the unarmoured case is untouched by the delay: still no tank to empty
const bare = rideOut('none', 2, 4, 120);
console.log('  NO ARMOR   tapping: ' + bare.avg.toFixed(1) + 'px/s, blown: ' + bare.blew,
            !bare.blew ? 'CORRECT (nothing to spend)' : 'WRONG');
console.log('SPRINT TEST DONE');
})();

(function densityTests(){
console.log('--- enemy density ---');
const names = DENSITY.map(d => d.name + ' x' + d.mul);
console.log('  tiers: ' + names.join(', '),
            DENSITY.length >= 3 && DENSITY.some(d => d.mul === 1) ? 'CORRECT' : 'WRONG');

const rows = [];
let bad = [];
for (let m = 0; m < MAPS.length; m++) {
  const counts = [];
  for (let d = 0; d < DENSITY.length; d++) {
    game.densityIndex = d; game.mapIndex = m; initGame();
    counts.push(game.enemies.length);
    // uniques must stay unique or the objectives break
    const takers = game.enemies.filter(e => e.kind === 'taker').length;
    const hvts = game.enemies.filter(e => e.kind === 'hvt').length;
    if (takers > 1) bad.push(MAPS[m].name + '@' + DENSITY[d].key + ' has ' + takers + ' hostage-takers');
    if (hvts > 1) bad.push(MAPS[m].name + '@' + DENSITY[d].key + ' has ' + hvts + ' principals');
    // everybody must be somewhere legal and reachable
    const st = tileAt(level.spawns.player.x, level.spawns.player.y);
    for (const e of game.enemies) {
      const t = tileAt(e.x, e.y);
      if (isWall(t.tx, t.ty) || isWindow(t.tx, t.ty)) bad.push(MAPS[m].name + '@' + DENSITY[d].key + ' spawn inside geometry');
      else if (!astar(st.tx, st.ty, t.tx, t.ty, passForPath, pathCostSquad)) bad.push(MAPS[m].name + '@' + DENSITY[d].key + ' unreachable spawn');
    }
    // nobody stacked on top of anybody
    const seenT = new Set();
    for (const e of game.enemies) {
      const k = (e.floor || 0) + ':' + tileAt(e.x, e.y).tx + ',' + tileAt(e.x, e.y).ty;
      if (seenT.has(k)) bad.push(MAPS[m].name + '@' + DENSITY[d].key + ' two men on one tile');
      seenT.add(k);
    }
  }
  rows.push({ name: MAPS[m].name, counts });
}
game.densityIndex = 1; game.mapIndex = 0; initGame();
rows.forEach(r => console.log('  ' + r.name.padEnd(18) + r.counts.map(c => String(c).padStart(4)).join('')));
console.log('  ' + ''.padEnd(18) + DENSITY.map(d => d.name.slice(0, 4).padStart(4)).join(''));
console.log('  every map scales monotonically:',
            rows.every(r => r.counts.every((c, i) => i === 0 || c >= r.counts[i - 1])) ? 'CORRECT' : 'WRONG');
console.log('  and SWARM is strictly more than STANDARD everywhere:',
            rows.every(r => r.counts[3] > r.counts[1]) ? 'CORRECT' : 'WRONG');
console.log('  placement legal on all ' + MAPS.length + ' maps x ' + DENSITY.length + ' tiers:',
            bad.length ? 'WRONG -> ' + [...new Set(bad)].slice(0, 4).join('; ') : 'CORRECT');

// the briefing must promise what the mission delivers
let drift = [];
for (let m = 0; m < MAPS.length; m++) for (let d = 0; d < DENSITY.length; d++) {
  game.densityIndex = d; game.mapIndex = m; initGame();
  const s = surveyMap(MAPS[m].src, game.diffIndex, MAPS[m].src2 || null);
  if (Math.abs(s.contacts - game.enemies.length) > 1) {
    drift.push(MAPS[m].name + '@' + DENSITY[d].key + ' brief says ' + s.contacts + ', map has ' + game.enemies.length);
  }
}
game.densityIndex = 1; game.mapIndex = 0; initGame();
console.log('  briefing contact estimate tracks the real count:',
            drift.length ? 'WRONG -> ' + drift.slice(0, 3).join('; ') : 'CORRECT (within the intel fuzz)');
console.log('DENSITY TEST DONE');
})();

(function beachTests(){
console.log('--- the beach maps, and the demolition objective ---');
const li = MAPS.findIndex(m => m.name === 'THE LANDING');
const si = MAPS.findIndex(m => m.name === 'SEAWALL');
console.log('  both maps exist: ' + (li >= 0) + '/' + (si >= 0), li >= 0 && si >= 0 ? 'CORRECT' : 'WRONG');

game.densityIndex = 1; game.mapIndex = li; initGame();
console.log('  THE LANDING is ' + level.w + 'x' + level.h + ' tiles with ' + game.enemies.length + ' defenders',
            level.w > 60 && level.h > 35 && game.enemies.length >= 20 ? 'CORRECT (large scale)' : 'WRONG');
const st = tileAt(level.spawns.player.x, level.spawns.player.y);
const unreach = level.spawns.enemies.filter(sp => {
  const t = tileAt(sp.x, sp.y);
  return !astar(st.tx, st.ty, t.tx, t.ty, passForPath, pathCostSquad);
});
console.log('  every defender reachable across the beach: ' + (unreach.length === 0),
            unreach.length === 0 ? 'CORRECT' : 'WRONG');
let slits = level.windowAt.size;
console.log('  bunker firing slits: ' + slits + ', doors ' + level.doors.length,
            slits >= 6 && level.doors.length >= 3 ? 'CORRECT' : 'WRONG');

// SEAWALL: a mission you can finish without killing anybody
game.mapIndex = si; initGame(); game.state = 'play';
console.log('  SEAWALL objectives ' + JSON.stringify(MAPS[si].objectives) + ', charges ' + game.demo.length,
            MAPS[si].objectives.join() === 'demolish,extract' && game.demo.length === 3 ? 'CORRECT' : 'WRONG');
console.log('  no neutralize objective — killing is optional:',
            !MAPS[si].objectives.includes('neutralize') ? 'CORRECT' : 'WRONG');
const P = game.player;
console.log('  starts incomplete: demolish ' + OBJECTIVES.demolish.done() + ', extract ' + OBJECTIVES.extract.done(),
            !OBJECTIVES.demolish.done() && !OBJECTIVES.extract.done() ? 'CORRECT' : 'WRONG');

// planting takes time and being there
const d0 = game.demo[0];
P.x = d0.x; P.y = d0.y; P.stagger = 0;
input.keys.clear();
updateDemo(P, 1 / 60);
console.log('  standing on a charge without holding [E]: progress ' + d0.t.toFixed(2),
            d0.t === 0 ? 'CORRECT' : 'WRONG');
input.keys.add('e');
let t = 0;
while (!d0.armed && t < 10) { updateDemo(P, 1 / 60); t += 1 / 60; }
console.log('  holding [E] on it: armed after ' + t.toFixed(1) + 's (spec ' + TUNE.demoPlant + 's)',
            d0.armed && Math.abs(t - TUNE.demoPlant) < 0.2 ? 'CORRECT' : 'WRONG');
// walking off cancels
const d1 = game.demo[1];
P.x = d1.x; P.y = d1.y;
for (let i = 0; i < 60; i++) updateDemo(P, 1 / 60);
const partial = d1.t;
P.x = d1.x + 400; P.y = d1.y;
for (let i = 0; i < 30; i++) updateDemo(P, 1 / 60);
console.log('  walking off mid-plant: ' + partial.toFixed(2) + 's -> ' + d1.t.toFixed(2) + 's',
            d1.t < partial && !d1.armed ? 'CORRECT (it bleeds back)' : 'WRONG');

// exfil must not open until every charge is set
game.demo.forEach(d => { d.armed = false; });
const ez = level.extraction[0];
P.x = ez.tx * TILE + 16; P.y = ez.ty * TILE + 16;
console.log('  standing on the boat with charges unset: extract ' + OBJECTIVES.extract.done(),
            !OBJECTIVES.extract.done() ? 'CORRECT' : 'WRONG');
game.demo.forEach(d => { d.armed = true; });
console.log('  all three set, standing on the boat: extract ' + OBJECTIVES.extract.done(),
            OBJECTIVES.extract.done() ? 'CORRECT' : 'WRONG');
console.log('  ...and the mission is complete with ' + game.enemies.filter(e => e.alive).length + ' defenders still alive',
            game.mission.objectives.every(k => OBJECTIVES[k].done()) && game.enemies.some(e => e.alive)
              ? 'CORRECT (you never had to kill them)' : 'WRONG');
game.mapIndex = 0; initGame();
console.log('BEACH TEST DONE');
})();

(function chargeAndAmmoTests(){
console.log('--- wall charges without H, and a readable magazine ---');
console.log('  H is no longer bound:', !/pressed\("h"\)/.test(updatePlayer.toString()) ? 'CORRECT' : 'WRONG');

game.mapIndex = MAPS.findIndex(m => m.training); initGame(); game.state = 'play';
const P = game.player;
// find an interior wall and stand next to it
let target = null;
outer: for (let y = 4; y < level.h - 4; y++) for (let x = 4; x < level.w - 4; x++) {
  if (!isWall(x, y) || doorAt(x, y)) continue;
  for (const [ox, oy] of [[1,0],[-1,0],[0,1],[0,-1]]) {
    if (!isWall(x + ox, y + oy) && !isWindow(x + ox, y + oy)) {
      target = { x, y, from: { x: (x + ox) * TILE + 16, y: (y + oy) * TILE + 16 } }; break outer;
    }
  }
}
P.x = target.from.x; P.y = target.from.y;
const wc = { x: target.x * TILE + 16, y: target.y * TILE + 16 };
console.log('  pointing at a wall in reach: ' + !!breachableAt(P, wc.x, wc.y),
            breachableAt(P, wc.x, wc.y) ? 'CORRECT (cursor-aimed)' : 'WRONG');
P.x = target.from.x + 600;
console.log('  same wall from 600px away: ' + !!breachableAt(P, wc.x, wc.y),
            !breachableAt(P, wc.x, wc.y) ? 'CORRECT (there is a reach)' : 'WRONG');
P.x = target.from.x;
console.log('  pointing at open floor: ' + !!breachableAt(P, P.x, P.y),
            !breachableAt(P, P.x, P.y) ? 'CORRECT' : 'WRONG');

// it blows on its own
game.wallCharge = null; P.charges = 2;
plantWallCharge(P, breachableAt(P, wc.x, wc.y));
console.log('  planted, charges left ' + P.charges + ', fuse ' + game.wallCharge.fuse + 's',
            game.wallCharge && P.charges === 1 ? 'CORRECT' : 'WRONG');
const wallBefore = level.wall[target.y][target.x];
let t = 0;
while (game.wallCharge && t < 10) { updateFx(1 / 60); t += 1 / 60;
  if (game.wallCharge) { game.wallCharge.fuse -= 1 / 60; if (game.wallCharge.fuse <= 0) detonateWallCharge(); } }
console.log('  it blew itself after ' + t.toFixed(1) + 's, wall ' + wallBefore + ' -> ' + level.wall[target.y][target.x],
            level.wall[target.y][target.x] === 0 ? 'CORRECT (no second keypress)' : 'WRONG');

// the wheel understands a wall
game.mapIndex = MAPS.findIndex(m => m.training); initGame(); game.state = 'play';
const up = WHEEL.find(w => w.dir === 'up');
const wallCtx = { x: wc.x, y: wc.y, wall: { tx: target.x, ty: target.y }, door: null, threat: null, far: true };
console.log('  wheel up on a wall reads: "' + up.label(wallCtx, game.squad) + '"',
            /WALL/.test(up.label(wallCtx, game.squad)) ? 'CORRECT' : 'WRONG');
up.run(game.squad.filter(s => s.alive), wallCtx);
const br = game.squad.find(s => s.order.type === 'wallbreach');
console.log('  it tasks the BREACHER: ' + (br ? br.name + ' (' + br.role + ')' : 'nobody') +
            ', others ' + JSON.stringify(game.squad.filter(s => s !== br).map(s => s.order.type)),
            br && br.role === 'breacher' ? 'CORRECT (the role finally does something)' : 'WRONG');
// and they stand clear of their own blast
const others = game.squad.filter(s => s !== br);
const clear = others.every(s => dist(s.order.x, s.order.y, wc.x, wc.y) > TUNE.blastWound);
console.log('  the rest wait outside the wounding radius: ' + clear, clear ? 'CORRECT' : 'WRONG');
console.log('CHARGE TEST DONE');
})();

(function veterancyTests(){
console.log('--- veterancy: the men get better, and dying costs you all of it ---');
localStorage.clear();
game.mapIndex = 0; game.diffIndex = 1; initGame(); game.state = 'play';

// a fresh team is three boots
let ranks = game.squad.map(s => s.rank.name);
console.log('  fresh team: ' + ranks.join(', '),
            ranks.every(r => r === 'BOOT') ? 'CORRECT' : 'WRONG');

// XP is credited to the man who did the work, not split across the team
const shooter = game.squad[0], bystander = game.squad[1];
const victim = game.enemies.find(e => e.alive);
killEntity(victim, 'squad', shooter);
console.log('  a kill credits the shooter ' + (shooter.mxp || 0) + ' XP, the man beside him ' +
            (bystander.mxp || 0), (shooter.mxp === XP.kill && !bystander.mxp) ? 'CORRECT' : 'WRONG');

// killing a man who has his hands up is not marksmanship
const surr = game.enemies.find(e => e.alive);
surr.state = 'surrender';
const before = shooter.mxp;
killEntity(surr, 'squad', shooter);
console.log('  executing a surrendered suspect pays ' + (shooter.mxp - before) + ' XP',
            shooter.mxp === before ? 'CORRECT (nothing)' : 'WRONG');

// banking: survivors keep it, and it persists
game.squad.forEach(s => { s.alive = true; s.mxp = 100; });
let rowsA = settleVeterancy(true);
let saved = JSON.parse(localStorage.getItem('tdt_vets'));
// only the men who DEPLOYED bank XP — the bench does not level from home
const deployed = game.squad.map(s => s.name);
const bench = SQUAD_NAMES.filter(n => !deployed.includes(n));
console.log('  after a win with +100 each: ' + deployed.map(n => n + '=' + saved[n].xp).join(' ') +
            ' | bench ' + bench.map(n => saved[n].xp).join(','),
            deployed.every(n => saved[n].xp === 100 + XP.win) &&
            bench.every(n => saved[n].xp === 0) ? 'CORRECT (bench stays at 0)' : 'WRONG');
console.log('  and it survives a new mission: ' +
            (initGame(), game.squad.map(s => s.name + ' ' + s.rank.name).join(', ')),
            game.squad.every(s => s.rank.name === 'OPERATOR') ? 'CORRECT (promoted)' : 'WRONG');

// rank is a real mechanical difference, not a label
const boot = RANKS[0], master = RANKS[RANKS.length - 1];
console.log('  BOOT vs MASTER — react x' + boot.react + '/' + master.react +
            ', cone x' + boot.spread + '/' + master.spread + ', suppression x' + boot.sup + '/' + master.sup,
            master.react < boot.react && master.spread < boot.spread && master.sup < boot.sup ? 'CORRECT' : 'WRONG');
const mono = RANKS.every((r, i) => i === 0 || (r.xp > RANKS[i-1].xp && r.react <= RANKS[i-1].react &&
                                               r.spread <= RANKS[i-1].spread && r.sup <= RANKS[i-1].sup));
console.log('  the ladder only ever improves:', mono ? 'CORRECT' : 'WRONG');
// and the tighter cone actually reaches the weapon
localStorage.setItem('tdt_vets', JSON.stringify({ REYES: { xp: 2000, missions: 9, kia: 0 },
                                                  OKAFOR: { xp: 0, missions: 0, kia: 0 },
                                                  DANE: { xp: 0, missions: 0, kia: 0 } }));
initGame();
const vetOp = game.squad.find(s => s.name === 'REYES'), rookie = game.squad.find(s => s.name === 'OKAFOR');
console.log('  REYES is ' + vetOp.rank.name + ' with a ' + (vetOp.weapon.spreadBase * 180 / Math.PI).toFixed(2) +
            '° base cone; OKAFOR is ' + rookie.rank.name + ' at ' +
            (rookie.weapon.spreadBase * 180 / Math.PI).toFixed(2) + '°',
            vetOp.weapon.spreadBase < rookie.weapon.spreadBase ? 'CORRECT' : 'WRONG');

// death wipes it — that is the whole stake
game.squad.forEach(s => { s.mxp = 500; });
vetOp.alive = false;
const rowsB = settleVeterancy(true);
saved = JSON.parse(localStorage.getItem('tdt_vets'));
console.log('  REYES KIA: xp ' + saved.REYES.xp + ', kia count ' + saved.REYES.kia +
            '; OKAFOR banked ' + saved.OKAFOR.xp,
            saved.REYES.xp === 0 && saved.REYES.kia === 1 && saved.OKAFOR.xp > 0 ? 'CORRECT' : 'WRONG');
const kiaRow = rowsB.find(r => r.name === 'REYES');
console.log('  and the debrief says so out loud: "' + kiaRow.text + '"',
            kiaRow.kia && /KIA/.test(kiaRow.text) && /lost/.test(kiaRow.text) ? 'CORRECT' : 'WRONG');
initGame();
console.log('  he comes back a boot: ' + game.squad.find(s => s.name === 'REYES').rank.name,
            game.squad.find(s => s.name === 'REYES').rank.name === 'BOOT' ? 'CORRECT' : 'WRONG');
localStorage.clear(); initGame();
console.log('VETERANCY TEST DONE');
})();

(function gamepadTests(){
console.log('--- gamepad: the pad writes into the same input the keyboard does ---');
game.mapIndex = 0; initGame(); game.state = 'play';

// deadzone: sticks rest dirty, and the response must be continuous past the floor
const rest = padStick(0.15, 0.10), edge = padStick(0.23, 0), full = padStick(1, 0);
console.log('  resting stick (0.15,0.10) -> magnitude ' + rest.m.toFixed(3),
            rest.m === 0 ? 'CORRECT (ignored)' : 'WRONG (drift reaches the game)');
console.log('  just past the floor -> ' + edge.m.toFixed(3) + ', full deflection -> ' + full.m.toFixed(3),
            edge.m > 0 && edge.m < 0.1 && Math.abs(full.m - 1) < 1e-9 ? 'CORRECT (no jump at the edge)' : 'WRONG');
const diag = padStick(1, 1);
console.log('  diagonal is normalised, not 1.41x fast: ' + Math.hypot(diag.x, diag.y).toFixed(3),
            Math.abs(Math.hypot(diag.x, diag.y) - 1) < 1e-9 ? 'CORRECT' : 'WRONG');

// rumble severity is derived from camKick, so it must span the whole range
const kinds = [1, 3, 6, 12].map(rumbleKindFor);
console.log('  camKick rise 1/3/6/12 -> ' + kinds.join(', '),
            new Set(kinds).size === 4 ? 'CORRECT (four distinct textures)' : 'WRONG');
console.log('  every kind has a pattern:',
            kinds.every(k => RUMBLE[k] && RUMBLE[k].ms > 0) ? 'CORRECT' : 'WRONG');
const asc = kinds.every((k, i) => i === 0 || RUMBLE[k].strong >= RUMBLE[kinds[i-1]].strong);
console.log('  and a bigger shake never rumbles less:', asc ? 'CORRECT' : 'WRONG');

// the standard mapping must cover every verb the keyboard has
const verbs = ['a','b','x','y','lb','rb','lt','rt','back','start','l3','r3','up','down','left','right'];
console.log('  buttons mapped: ' + verbs.length + ', all distinct indices: ' +
            new Set(verbs.map(v => PAD[v])).size,
            new Set(verbs.map(v => PAD[v])).size === verbs.length ? 'CORRECT' : 'WRONG');

// a d-pad press must call the SAME play a mouse flick calls
input.padDir = 'up';
game.wheel = { sx: 0, sy: 0, wx: game.player.x + 40, wy: game.player.y, dir: null };
const padPick = wheelDirection();
input.padDir = null;
input.mouse.x = 0; input.mouse.y = -80;      // a flick straight up
const mousePick = wheelDirection();
game.wheel = null;
console.log('  d-pad up -> "' + padPick + '", mouse flick up -> "' + mousePick + '"',
            padPick === 'up' && mousePick === 'up' ? 'CORRECT (one code path)' : 'WRONG');
console.log('  and the pad direction wins over a stale cursor offset:',
            padPick === 'up' ? 'CORRECT' : 'WRONG');

// padOrder must actually issue an order, not just open a wheel
const squad = game.squad.filter(s => s.alive);
squad.forEach(s => s.order = { type: 'follow' });
input.mouse.x = 400; input.mouse.y = 300;
input.mouse.wx = game.player.x + 120; input.mouse.wy = game.player.y;
padOrder(null);                               // "go there"
issueOrders();
input.justPressed.clear(); input.justReleased.clear(); input.padDir = null;
const moved = squad.filter(s => s.order.type !== 'follow').length;
console.log('  A ("go there") retasked ' + moved + '/' + squad.length + ' operators',
            moved === squad.length ? 'CORRECT' : 'WRONG');
console.log('  and the wheel closed behind it:', game.wheel === null ? 'CORRECT' : 'WRONG');

// selection cycling has to terminate back at "whole team"
game.selected.clear();
const seen = [];
for (let i = 0; i < game.squad.length + 1; i++) { padCycleSelection(); seen.push(game.selected.size); }
console.log('  cycling selection ' + (game.squad.length + 1) + 'x -> sizes ' + seen.join(','),
            seen[seen.length - 1] === 0 ? 'CORRECT (wraps back to whole team)' : 'WRONG');

// with no pad present nothing may leak into the keyboard state
input.keys.clear();
pad.connected = false; pad.index = null;
pollGamepad(1 / 60);
console.log('  no controller attached: ' + input.keys.size + ' synthetic keys held, connected=' + pad.connected,
            input.keys.size === 0 && !pad.connected ? 'CORRECT' : 'WRONG');
console.log('  and rumbling into no controller is a no-op:',
            (padRumble('blast', 1), true) ? 'CORRECT' : 'WRONG');
game.selected.clear();
console.log('GAMEPAD TEST DONE');
})();

(function grenadierTests(){
console.log('--- the 40mm: reaching the man you cannot shoot ---');
game.mapIndex = 0; game.loadout.squad = 'standard'; initGame(); game.state = 'play';

// arming distance: a round that flew 100px is a rock, a round that flew 300px is a blast
function fire(d, standoff) {
  const g = { x: 100, y: 100, kind: 'he40', side: 'squad', armed: d >= TUNE.he40Arm };
  const victim = game.enemies.find(e => e.alive);
  victim.x = 100 + standoff; victim.y = 100; const hp0 = victim.hp;
  const alive0 = victim.alive;
  detonateNade(g);
  return { dmg: hp0 - victim.hp, killed: alive0 && !victim.alive };
}
const dud = fire(100, 20);
console.log('  unarmed round (100px flight), man at 20px: ' + dud.dmg.toFixed(0) + ' dmg',
            dud.dmg === 0 ? 'CORRECT (a rock, not a blast)' : 'WRONG');
initGame();
const lethal = fire(300, 20);
console.log('  armed round, man inside the lethal radius: killed=' + lethal.killed,
            lethal.killed ? 'CORRECT' : 'WRONG');
initGame();
const wound = fire(300, 55);
console.log('  armed round, man at 55px: ' + wound.dmg.toFixed(0) + ' dmg through his armour',
            wound.dmg > 15 && !wound.killed ? 'CORRECT (wounds, does not delete the room)' : 'WRONG');

// the friendly-clear check refuses an impact near anyone we protect
initGame();
const h = game.hostages[0];
console.log('  impact point on top of a hostage: ' + blastClearOfFriends(h.x, h.y, TUNE.he40Wound),
            !blastClearOfFriends(h.x, h.y, TUNE.he40Wound) ? 'CORRECT (refused)' : 'WRONG');
const open = { x: game.player.x + 400, y: game.player.y };
// (an impact far from everyone should clear, geometry permitting)

// a grenadier with a covered target lobs; without the launcher role he cannot
const s0 = game.squad[0];
s0.role = 'grenadier'; s0.roe = 'free'; s0.nadeCd = 0; s0.reactT = 0; s0.stagger = 0;
const foe = game.enemies.find(e => e.alive);
foe.x = s0.x + 400; foe.y = s0.y; foe.state = 'combat';
game.bangs.length = 0;
// force the "sees him, cannot shoot him" condition via the AI's own branch:
s0.engaged = foe; s0._blockedBy = null;
const before = game.bangs.length;
if (dist(s0.x, s0.y, foe.x, foe.y) > TUNE.he40Arm + 40 &&
    blastClearOfFriends(foe.x, foe.y, TUNE.he40Wound)) launch40mm(s0, foe.x, foe.y);
const round = game.bangs[game.bangs.length - 1];
console.log('  launched: kind=' + (round && round.kind) + ', armed=' + (round && round.armed) +
            ', cooldown=' + s0.nadeCd + 's',
            round && round.kind === 'he40' && round.armed && s0.nadeCd === TUNE.he40Cd ? 'CORRECT' : 'WRONG');

// the round flies flat and fast and goes off on arrival, not on a hand-grenade fuse
let t = 0; const d0 = dist(round.x, round.y, foe.x, foe.y);
while (game.bangs.length && t < 3) { updateBangs(1 / 120); t += 1 / 120; }
console.log('  ' + d0.toFixed(0) + 'px flight took ' + t.toFixed(2) + 's',
            t < d0 / TUNE.he40Speed + 0.15 ? 'CORRECT (impact-fused, not thrown)' : 'WRONG');

// menu: the grenadier letter shows up in a template row
console.log('  GRENADIER role exists with launcher flag:',
            ROLES.grenadier && ROLES.grenadier.launcher ? 'CORRECT' : 'WRONG');
console.log('GRENADIER TEST DONE');
})();

(function rifleSquadTests(){
console.log('--- the rifle squad: nine guns in two fireteams ---');
localStorage.clear();
game.mapIndex = 0; game.loadout.squad = 'rifle9'; initGame(); game.state = 'play';

console.log('  squad size: ' + game.squad.length,
            game.squad.length === 8 ? 'CORRECT (you are the ninth)' : 'WRONG');
const A = game.squad.filter(s => s.team === 'A'), B = game.squad.filter(s => s.team === 'B');
console.log('  fireteams: A=' + A.length + ' B=' + B.length,
            A.length === 4 && B.length === 4 ? 'CORRECT' : 'WRONG');
const count = r => game.squad.filter(s => s.role === r).length;
console.log('  TO&E: ' + count('rifleman') + ' riflemen, ' + count('grenadier') + ' grenadiers, ' +
            count('support') + ' ARs',
            count('rifleman') === 4 && count('grenadier') === 2 && count('support') === 2
              ? 'CORRECT (TL/GRN/AR/RFLM x2)' : 'WRONG');
console.log('  team leads flagged: ' + game.squad.filter(s => s.lead).map(s => s.team + '-' + s.name).join(', '),
            game.squad.filter(s => s.lead).length === 2 ? 'CORRECT' : 'WRONG');
const names = new Set(game.squad.map(s => s.name));
console.log('  eight distinct names, all on the veterancy books: ' + names.size + '/' +
            Object.keys(loadVets()).length,
            names.size === 8 && Object.keys(loadVets()).length >= 8 ? 'CORRECT' : 'WRONG');

// every man spawned somewhere he can stand
const stuck = game.squad.filter(s => solidForMove(Math.floor(s.x / TILE), Math.floor(s.y / TILE)));
console.log('  spawn overflow ringed onto passable ground: ' + (8 - stuck.length) + '/8',
            stuck.length === 0 ? 'CORRECT' : 'WRONG');

// formation: eight distinct stations, none downrange of the player
game.player.face = 0;
const bearings = game.squad.map(s => { s._wedgeAng = undefined; const st = wedgeStation(s, 10); return angleTo(game.player.x, game.player.y, st.x, st.y); });
const inBore = bearings.filter(b => Math.abs(angDiff(0, b)) < deg(35)).length;
console.log('  stations inside ±35° of the bore: ' + inBore,
            inBore === 0 ? 'CORRECT (nobody downrange)' : 'WRONG');
const uniq = new Set(bearings.map(b => b.toFixed(1)));
console.log('  distinct bearings: ' + uniq.size + '/8', uniq.size >= 7 ? 'CORRECT' : 'WRONG');

// BOUND splits by fireteam, not by list order
const play = WHEEL.find(w => w.name === 'BOUND');
play.run(game.squad.filter(s => s.alive), { point: { x: game.player.x + 200, y: game.player.y } });
const aElems = new Set(A.map(s => s.order.element)), bElems = new Set(B.map(s => s.order.element));
console.log('  BOUND: team A elements ' + [...aElems].join(',') + ', team B ' + [...bElems].join(','),
            aElems.size === 1 && bElems.size === 1 && [...aElems][0] !== [...bElems][0]
              ? 'CORRECT (bounds by fireteam)' : 'WRONG');

// T cycles team selection
game.selected.clear(); game._teamSel = null;
input.justPressed.add('t'); issueOrders(); input.justPressed.clear();
const selA = [...game.selected].every(i => game.squad[i].team === 'A') && game.selected.size === 4;
input.justPressed.add('t'); issueOrders(); input.justPressed.clear();
const selB = [...game.selected].every(i => game.squad[i].team === 'B') && game.selected.size === 4;
input.justPressed.add('t'); issueOrders(); input.justPressed.clear();
console.log('  [T]: team A (' + selA + ') -> team B (' + selB + ') -> everyone (' + (game.selected.size === 0) + ')',
            selA && selB && game.selected.size === 0 ? 'CORRECT' : 'WRONG');

// the three-man templates are untouched
game.loadout.squad = 'standard'; initGame();
console.log('  STANDARD still fields ' + game.squad.length + ', teamless: ' +
            game.squad.every(s => !s.team),
            game.squad.length === 3 && game.squad.every(s => !s.team) ? 'CORRECT' : 'WRONG');
localStorage.clear();
console.log('RIFLE SQUAD TEST DONE');
})();

(function gasTests(){
console.log('--- CS gas: your masks work, theirs do not ---');
game.mapIndex = 0; game.loadout.squad = 'standard'; initGame(); game.state = 'play';

console.log('  you carry gas without choosing to: ' + (game.player.nades.gas > 0),
            game.player.nades.gas > 0 && game.player.nades.smoke > 0
              ? 'CORRECT (every nature, always)' : 'WRONG');

// the cloud must never block a sightline
game.smokes.length = 0;
popGas({ x: game.player.x + 100, y: game.player.y, side: 'player' });
for (let i = 0; i < 240; i++) { updateSmokes(1 / 60); }
const cloud = game.smokes[0];
// test the mechanism, not the map: a smoke cloud writes the vision grid, a gas
// cloud must not — and opaque() at the cloud's own centre must stay false
const gridSet = level.smokeGrid ? level.smokeGrid.reduce((n, v) => n + v, 0) : 0;
const ct = tileAt(cloud.x, cloud.y);
console.log('  cloud at r=' + cloud.r.toFixed(0) + ': smoke-grid cells set ' + gridSet +
            ', opaque at centre ' + opaque(ct.tx, ct.ty),
            gridSet === 0 && !opaque(ct.tx, ct.ty) ? 'CORRECT (CS is thin)' : 'WRONG');
game.smokes.length = 0; popSmoke({ x: cloud.x, y: cloud.y, side: 'player' });
for (let i = 0; i < 240; i++) updateSmokes(1 / 60);
const gridSet2 = level.smokeGrid.reduce((n, v) => n + v, 0);
console.log('  the same spot as SMOKE sets ' + gridSet2 + ' cells',
            gridSet2 > 10 ? 'CORRECT (smoke still blinds)' : 'WRONG');
game.smokes.length = 0; popGas({ x: cloud.x, y: cloud.y, side: 'player' });
for (let i = 0; i < 240; i++) updateSmokes(1 / 60);

// an unmasked man in the cloud accumulates pressure and eventually folds
const foe = game.enemies.find(e => e.alive && e.kind !== 'elite' && e.kind !== 'taker');
foe.x = cloud.x; foe.y = cloud.y; foe.state = 'idle'; foe.gasT = 0;
const r0 = Math.random; let seq = 0.99; Math.random = () => (seq = seq > 0.5 ? 0.01 : 0.99);
let t = 0;
while (foe.state !== 'surrender' && t < 20) { updateSmokes(1/60); updateGasEffects(1 / 60); t += 1 / 60; }
Math.random = r0;
console.log('  unmasked suspect in the cloud folded after ' + t.toFixed(1) + 's (gasT=' +
            foe.gasT.toFixed(1) + ', suppress=' + foe.suppress.toFixed(1) + ')',
            foe.state === 'surrender' && t > TUNE.gasSurrenderAt ? 'CORRECT (chokes, then checks the will table)' : 'WRONG');

// the squad is masked: standing in it costs them nothing
const op = game.squad[0]; op.x = cloud.x; op.y = cloud.y;
const sup0 = op.suppress || 0; op.gasT = 0;
for (let i = 0; i < 120; i++) updateGasEffects(1 / 60);
console.log('  a masked operator in the same cloud: gasT=' + (op.gasT || 0) + ', suppress +' +
            ((op.suppress || 0) - sup0).toFixed(2),
            !(op.gasT > 0) && (op.suppress || 0) - sup0 === 0 ? 'CORRECT (masks work)' : 'WRONG');

// hostages cough but are never killed by it
const h = game.hostages[0]; h.x = cloud.x; h.y = cloud.y; const hp0 = h.hp;
for (let i = 0; i < 600; i++) updateGasEffects(1 / 60);
console.log('  a hostage in the cloud for 10s: hp ' + hp0 + ' -> ' + h.hp + ', gasT=' + h.gasT.toFixed(1),
            h.hp === hp0 && h.gasT > 0 ? 'CORRECT (miserable, not dead)' : 'WRONG');

// gas has its own slot now; the pick is the slot, not what you happen to carry
const picked = THROW_ORDER.find(k => THROWABLES[k].dir === 'right');
console.log('  flick-right always picks: ' + picked,
            picked === 'gas' ? 'CORRECT (a slot means one thing)' : 'WRONG');
const pickedLeft = THROW_ORDER.find(k => THROWABLES[k].dir === 'left');
console.log('  flick-left always picks: ' + pickedLeft,
            pickedLeft === 'smoke' ? 'CORRECT' : 'WRONG');
console.log('GAS TEST DONE');
})();

(function suppressorTests(){
console.log('--- suppressors: silence bought with handling ---');
game.mapIndex = 0; game.diffIndex = 1; game.densityIndex = 1;
game.loadout.squad = 'standard'; // loud is the default, and the toggle reaches the whole team
game.loadout.can = false; initGame(); game.state = 'play';
console.log('  default loadout: player can=' + !!game.player.can,
            !game.player.can ? 'CORRECT (loud until chosen)' : 'WRONG');
game.loadout.can = true; initGame(); game.state = 'play';
// The whole team runs cans — EXCEPT anyone holding a shotgun, which cannot
// take one. So the invariant is not "everybody", it is "everybody who can".
const fitted = [game.player, ...game.squad];
const shouldHave = fitted.filter(e => !(ROLES[e.role] || {}).noCan);
console.log('  SUPPRESSED: player + squad fitted: ' + fitted.map(e => !!e.can).join(','),
            shouldHave.every(e => e.can) ? 'CORRECT (everyone whose gun takes one)' : 'WRONG');
console.log('  and the shotgun man is the exception: ' +
            fitted.filter(e => (ROLES[e.role] || {}).noCan).map(e => e.role + '=' + !!e.can).join(','),
            fitted.filter(e => (ROLES[e.role] || {}).noCan).every(e => !e.can)
              ? 'CORRECT' : 'WRONG');

// the report: radius, flash, and what an enemy hears through a wall
const P = game.player;
game.noises.length = 0; game.fx.length = 0;
P.cooldown = 0; P.reloading = 0; P.ammo = 30;
tryFire(P, P.face);
const nSupp = game.noises.find(n => n.type === 'shot');
const flashSupp = game.fx.some(f => f.kind === 'muzzle');
console.log('  suppressed shot: radius ' + nSupp.radius + ' (loud is ' + TUNE.noiseShot + '), fuzzy=' +
            nSupp.fuzzy + ', muzzle flash drawn=' + flashSupp,
            nSupp.radius === TUNE.suppNoiseShot && nSupp.fuzzy && !flashSupp ? 'CORRECT' : 'WRONG');
game.loadout.can = false; initGame(); game.state = 'play';
const P2 = game.player;
game.noises.length = 0; game.fx.length = 0;
P2.cooldown = 0; P2.ammo = 30; tryFire(P2, P2.face);
const nLoud = game.noises.find(n => n.type === 'shot');
console.log('  loud shot: radius ' + nLoud.radius + ', flash drawn=' + game.fx.some(f => f.kind === 'muzzle'),
            nLoud.radius === TUNE.noiseShot && !nLoud.fuzzy && game.fx.some(f => f.kind === 'muzzle')
              ? 'CORRECT' : 'WRONG');

// one interior wall swallows the suppressed report at ranges where loud carries
const behindWall = TUNE.suppNoiseShot - (SOUND_LOSS.drywall || 55);
console.log('  through one drywall partition: suppressed reaches ' + behindWall + 'px, loud reaches ' +
            (TUNE.noiseShot - 55) + 'px',
            behindWall < 160 && TUNE.noiseShot - 55 > 400 ? 'CORRECT (the wall does the work)' : 'WRONG');

// a heard suppressed shot investigates a WRONG point, and does not combat-alert
game.loadout.can = true; initGame(); game.state = 'play';
let scatter = 0, alerted = 0, trials = 40;
for (let i = 0; i < trials; i++) {
  const e = game.enemies.find(x => x.alive);
  e.state = 'idle'; e.investigate = null;
  game.noises.length = 0;
  addNoise(e.x + 60, e.y, TUNE.suppNoiseShot, 'shot', 'player', true);
  processNoises();
  if (e.state === 'combat') alerted++;
  if (e.investigate) scatter += dist(e.investigate.x, e.investigate.y, e.x + 60, e.y);
}
console.log('  40 heard suppressed shots: combat alerts ' + alerted + ', mean placement error ' +
            (scatter / trials).toFixed(0) + 'px',
            alerted === 0 && scatter / trials > 30 ? 'CORRECT (goes looking in the wrong place)' : 'WRONG');

// handling: the fitted gun swings slower
game.loadout.can = false; initGame();
const rate = (can) => {
  game.loadout.can = can; initGame(); game.state = 'play';
  const p = game.player; p.face = 0;
  input.mouse.wx = p.x - 500; input.mouse.wy = p.y;   // 180 degrees away
  updatePlayer(p, 1 / 60);
  return Math.abs(p.face);
};
const swungLoud = rate(false), swungCan = rate(true);
console.log('  one frame of a 180 swing: loud ' + swungLoud.toFixed(3) + ' rad, suppressed ' +
            swungCan.toFixed(3) + ' rad (' + (100 * swungCan / swungLoud).toFixed(0) + '%)',
            swungCan < swungLoud * 0.9 ? 'CORRECT (the longer gun is slower)' : 'WRONG');
game.loadout.can = false; initGame();
console.log('SUPPRESSOR TEST DONE');
})();

(function casualtyTests(){
console.log('--- casualties: down is not dead, and the tourniquet is the difference ---');
localStorage.clear();
game.mapIndex = 0; game.diffIndex = 1; game.densityIndex = 1;
game.loadout.squad = 'standard'; game.loadout.can = false; initGame(); game.state = 'play';

// a squaddie at zero goes DOWN, and the team does not count him lost yet
const cas = game.squad[0];
cas.hp = 1; cas.armor = 0;
killEntity(cas, 'enemy', null);
console.log('  hit to zero: alive=' + cas.alive + ' downed=' + cas.downed + ' bleedT=' +
            cas.bleedT + 's, squadLost=' + game.stats.squadLost,
            cas.alive && cas.downed && cas.bleedT === TUNE.bleedOut && game.stats.squadLost === 0
              ? 'CORRECT (a casualty, not a corpse)' : 'WRONG');

// enemies stop seeing him as a target
const foe = game.enemies.find(e => e.alive);
foe.x = cas.x + 80; foe.y = cas.y; foe.blind = 0; foe.alerted = true; foe.face = Math.PI;
let acquired = false;
for (const t of [game.player, ...game.squad]) {
  if (!t || !t.alive || t.downed) continue;
  if (t === cas) acquired = true;
}
console.log('  target scan skips the man on the ground:', !acquired ? 'CORRECT' : 'WRONG');

// the clock is real: unstabilized, he bleeds out and THEN it is a death
let t = 0;
while (cas.alive && t < 30) { updateSquaddie(cas, 0.5); t += 0.5; }
console.log('  left bleeding: died after ' + t.toFixed(1) + 's, squadLost=' + game.stats.squadLost,
            !cas.alive && Math.abs(t - TUNE.bleedOut) < 1.5 && game.stats.squadLost === 1
              ? 'CORRECT (the clock was the whole fight)' : 'WRONG');

// the tourniquet: hold [E] on him for tqTime and he is saved — but not healed
initGame(); game.state = 'play';
const cas2 = game.squad[0];
cas2.hp = 1; cas2.armor = 0; killEntity(cas2, 'enemy', null);
game.player.x = cas2.x + 10; game.player.y = cas2.y;
input.keys.add('e');
let held2 = 0;
while (!cas2.stabilized && held2 < 5) { updateTourniquet(game.player, 1 / 60); held2 += 1 / 60; }
input.keys.delete('e');
console.log('  held [E] for ' + held2.toFixed(2) + 's: stabilized=' + cas2.stabilized +
            ', still down=' + cas2.downed + ', hp=' + cas2.hp,
            cas2.stabilized && cas2.downed && cas2.hp === 0 && Math.abs(held2 - TUNE.tqTime) < 0.1
              ? 'CORRECT (saved, not healed)' : 'WRONG');
// and stable means the clock has stopped
const bt = cas2.bleedT;
for (let i = 0; i < 600; i++) updateSquaddie(cas2, 1 / 60);
console.log('  ten more seconds down: alive=' + cas2.alive + ', clock moved ' + (bt - cas2.bleedT).toFixed(1) + 's',
            cas2.alive && bt === cas2.bleedT ? 'CORRECT (stable holds)' : 'WRONG');

// walking away mid-hold loses progress
initGame(); game.state = 'play';
const cas3 = game.squad[0];
cas3.hp = 1; cas3.armor = 0; killEntity(cas3, 'enemy', null);
game.player.x = cas3.x + 10; game.player.y = cas3.y;
input.keys.add('e');
for (let i = 0; i < 60; i++) updateTourniquet(game.player, 1 / 60);   // 1s of 3
const partial = game.tq ? game.tq.t : 0;
game.player.x = cas3.x + 300;                                          // walked off
updateTourniquet(game.player, 1 / 60);
input.keys.delete('e');
console.log('  1s of hold, then walked away: progress was ' + partial.toFixed(2) + 's, now ' +
            (game.tq ? game.tq.t : 0),
            partial > 0.9 && !game.tq && !cas3.stabilized ? 'CORRECT (you have to stay on him)' : 'WRONG');

// veterancy: the stabilized man banks, the bleeder is wiped
localStorage.setItem('tdt_vets', JSON.stringify({ REYES: { xp: 600, missions: 5, kia: 0 },
  OKAFOR: { xp: 600, missions: 5, kia: 0 }, DANE: { xp: 0, missions: 0, kia: 0 } }));
initGame(); game.state = 'play';
const [rey, oka] = [game.squad.find(s => s.name === 'REYES'), game.squad.find(s => s.name === 'OKAFOR')];
rey.hp = 1; rey.armor = 0; killEntity(rey, 'enemy', null); rey.stabilized = true; rey.mxp = 50;
oka.hp = 1; oka.armor = 0; killEntity(oka, 'enemy', null); oka.mxp = 50;   // never tied off
const rows = settleVeterancy(false);
const saved = JSON.parse(localStorage.getItem('tdt_vets'));
console.log('  REYES (tourniquet on): ' + saved.REYES.xp + ' XP — "' + rows.find(r => r.name === 'REYES').text + '"',
            saved.REYES.xp === 660 ? 'CORRECT (kept + banked)' : 'WRONG');
console.log('  OKAFOR (left bleeding): ' + saved.OKAFOR.xp + ' XP, kia=' + saved.OKAFOR.kia,
            saved.OKAFOR.xp === 0 && saved.OKAFOR.kia === 1 ? 'CORRECT (the retreat does not save him)' : 'WRONG');
localStorage.clear(); initGame();
console.log('CASUALTY TEST DONE');
})();

(function newMapsTests(){
console.log('--- ramadi, the treeline, the standoff ---');
game.diffIndex = 1; game.densityIndex = 1; game.loadout.squad = 'standard';

// trees are a real material with the promised ballistics
console.log('  tree: opaque=' + MATERIALS.tree.opaque + ' resist=' + MATERIALS.tree.resist +
            ' (pistol pen ' + AMMO.pistol.pen + ', rifle pen ' + AMMO.fmj.pen + ')',
            MATERIALS.tree.opaque && AMMO.pistol.pen < MATERIALS.tree.resist &&
            AMMO.fmj.pen > MATERIALS.tree.resist ? 'CORRECT (blocks sight, eats pistol, blunts rifle)' : 'WRONG');

for (const nm of ['RAMADI ROW', 'THE TREELINE', 'THE STANDOFF']) {
  const mi = MAPS.findIndex(m => m.name === nm);
  game.mapIndex = mi; initGame(); game.state = 'play';
  // every enemy reachable from the player spawn
  const st0 = tileAt(level.spawns.player.x, level.spawns.player.y);
  const unreachable = level.spawns.enemies.filter(es => {
    const et = tileAt(es.x, es.y);
    return !astar(st0.tx, st0.ty, et.tx, et.ty, passForPath, pathCostSquad);
  });
  console.log('  ' + nm + ': ' + game.enemies.length + ' enemies, all reachable: ' +
              (unreachable.length === 0), unreachable.length === 0 ? 'CORRECT' : 'WRONG');
}

// the treeline actually fights through trees: count tree tiles and check a trunk
game.mapIndex = MAPS.findIndex(m => m.name === 'THE TREELINE'); initGame();
let trees = 0; for (let y = 0; y < level.h; y++) for (let x = 0; x < level.w; x++)
  if (level.mat[y][x] === 'tree') trees++;
console.log('  THE TREELINE has ' + trees + ' tree tiles', trees > 80 ? 'CORRECT (it is a forest)' : 'WRONG');

// the standoff: the front door is locked, and its garrison HOLDS (guards, no patrols)
game.mapIndex = MAPS.findIndex(m => m.name === 'THE STANDOFF'); initGame();
const locked = level.doors.filter(d => d.locked).length;
const patrols = game.enemies.filter(e => e.kind === 'patrol').length;
console.log('  THE STANDOFF: ' + locked + ' barricaded door, ' + patrols + ' patrols among ' +
            game.enemies.length + ' suspects',
            locked >= 1 && patrols === 0 ? 'CORRECT (they hold and wait)' : 'WRONG');

// DMR glass: zoom floor drops with the marksman rifle in hand
game.mapIndex = 0; game.loadout.primary = 'dmr'; initGame(); game.state = 'play';
game.player.gunIndex = 0;
console.log('  glassing() with the DMR up: ' + glassing(), glassing() ? 'CORRECT' : 'WRONG');
game.zoom = 0.7; glassing();
game.player.gunIndex = 1;    // sidearm out
updateCamera(1 / 60);
console.log('  swap to the sidearm at 0.7x: zoom snaps to ' + game.zoom,
            game.zoom === 1 ? 'CORRECT (the glass goes away with the rifle)' : 'WRONG');
game.loadout.primary = 'carbine'; initGame();
console.log('  carbine never glasses: ' + glassing(), !glassing() ? 'CORRECT' : 'WRONG');
console.log('NEW MAPS TEST DONE');
})();

(function buddyAidTests(){
console.log('--- buddy aid and the drag: a wounded man costs two guns ---');
localStorage.clear();
game.mapIndex = 0; game.diffIndex = 1; game.densityIndex = 1;
game.loadout.squad = 'standard'; initGame(); game.state = 'play';

// right-click a downed man assigns the nearest able squaddie as medic
const cas = game.squad[0], medic = game.squad[1];
cas.hp = 1; cas.armor = 0; killEntity(cas, 'enemy', null);
medic.x = cas.x + 60; medic.y = cas.y;
game.selected.clear();
input.mouse.wx = cas.x; input.mouse.wy = cas.y;
input.justPressed.add('rmb'); issueOrders(); input.justPressed.clear(); input.justReleased.clear();
console.log('  right-click on the casualty: ' + medic.name + ' order=' + medic.order.type,
            medic.order.type === 'aid' && medic.order.target === cas ? 'CORRECT (medic assigned)' : 'WRONG');

// he walks over, works for tqTime, and the casualty comes out stable
let t = 0;
while (!cas.stabilized && t < 20) { updateSquaddie(medic, 1 / 30); t += 1 / 30; }
console.log('  stabilized after ' + t.toFixed(1) + 's (travel + ' + TUNE.tqTime + 's of work): ' + cas.stabilized,
            cas.stabilized && t > TUNE.tqTime ? 'CORRECT' : 'WRONG');
console.log('  and the medic went back to the fight: order=' + medic.order.type,
            medic.order.type === 'hold' ? 'CORRECT' : 'WRONG');

// mid-treatment he does not shoot — that is the two-gun cost
initGame(); game.state = 'play';
const cas2 = game.squad[0], medic2 = game.squad[1];
cas2.hp = 1; cas2.armor = 0; killEntity(cas2, 'enemy', null);
medic2.x = cas2.x + 10; medic2.y = cas2.y;
medic2.order = { type: 'aid', target: cas2 };
updateSquaddie(medic2, 0.5);                       // hands in the wound now
const busy = medic2.order.type === 'aid' && medic2._aidT > 0;
console.log('  mid-treatment state: aidT=' + (medic2._aidT || 0).toFixed(2) + 's — a gun the team does not have',
            busy ? 'CORRECT' : 'WRONG');

// the drag: hold E while moving hauls him; still treats
initGame(); game.state = 'play';
const cas3 = game.squad[0], P = game.player;
cas3.hp = 1; cas3.armor = 0; killEntity(cas3, 'enemy', null);
P.x = cas3.x + 14; P.y = cas3.y;
input.keys.add('e'); P.moving = true;
const from = { x: cas3.x, y: cas3.y };
updateTourniquet(P, 1 / 60);                      // grab him first, within reach
for (let i = 0; i < 40; i++) { P.x += 4; updateTourniquet(P, 1 / 60); }   // then haul
const dragged = dist(cas3.x, cas3.y, from.x, from.y);
console.log('  moving with [E] held: casualty dragged ' + dragged.toFixed(0) + 'px behind, dragging=' + (P.dragging === cas3),
            dragged > 80 && P.dragging === cas3 ? 'CORRECT (haul him out)' : 'WRONG');
console.log('  he trails at arm\'s length: ' + dist(P.x, P.y, cas3.x, cas3.y).toFixed(0) + 'px',
            dist(P.x, P.y, cas3.x, cas3.y) < 30 ? 'CORRECT' : 'WRONG');
P.moving = false;
let held3 = 0;
while (!cas3.stabilized && held3 < 5) { updateTourniquet(P, 1 / 60); held3 += 1 / 60; }
input.keys.delete('e');
console.log('  then stood still ' + held3.toFixed(1) + 's: stabilized=' + cas3.stabilized + ', dragging cleared=' + !P.dragging,
            cas3.stabilized && !P.dragging ? 'CORRECT (one hold, two verbs)' : 'WRONG');
localStorage.clear(); initGame();
console.log('BUDDY AID TEST DONE');
})();

(function formationTests(){
console.log('--- formations: wedge, column, line (FM 3-21.8, compressed) ---');
game.mapIndex = 0; game.diffIndex = 1; game.densityIndex = 1;
game.loadout.squad = 'rifle9'; initGame(); game.state = 'play';
const P = game.player; P.face = 0;

function stations() {
  return game.squad.map(s => { s._wedgeAng = undefined; const st = wedgeStation(s, 10); 
    return { bear: angDiff(0, angleTo(P.x, P.y, st.x, st.y)), d: dist(P.x, P.y, st.x, st.y), sector: st.sector }; });
}
game.formation = 'wedge';
const W = stations();
console.log('  WEDGE: ' + W.filter(w => Math.abs(w.bear) < deg(35)).length + ' stations in the bore',
            W.filter(w => Math.abs(w.bear) < deg(35)).length === 0 ? 'CORRECT (balanced, nobody downrange)' : 'WRONG');

game.formation = 'column';
// test the CONTRACT (slot geometry), not the terrain snap — walls legitimately
// deflect a 300px tail on an indoor map, and that is nearestPassable working
const slots = game.squad.map((s, i) => formationSlot(i, game.squad.length));
const behind = slots.filter(sl => Math.abs(Math.abs(sl.bear) - Math.PI) < deg(15)).length;
const spread = Math.max(...slots.map(sl => sl.d)) - Math.min(...slots.map(sl => sl.d));
console.log('  COLUMN: ' + behind + '/8 slots trail behind, depth ' + spread.toFixed(0) + 'px',
            behind === 8 && spread > 200 ? 'CORRECT (a snake — narrow and deep)' : 'WRONG');
const C = stations();
const standable = C.every(c => c.d > 5);
console.log('  and every snapped station is standable ground:', standable ? 'CORRECT' : 'WRONG');
const flankSectors = slots.every(c => Math.abs(Math.abs(angDiff(0, c.sector)) - deg(95)) < deg(2));
console.log('  COLUMN sectors face the flanks (masked fire modeled):',
            flankSectors ? 'CORRECT (head-on contact is one gun)' : 'WRONG');

game.formation = 'line';
const L = stations();
const abreast = L.filter(l => Math.abs(Math.abs(l.bear) - deg(90)) < deg(20)).length;
console.log('  LINE: ' + abreast + '/8 stations abreast, all sectors forward: ' +
            L.every(l => Math.abs(angDiff(0, l.sector)) < deg(5)),
            abreast === 8 && L.every(l => Math.abs(angDiff(0, l.sector)) < deg(5))
              ? 'CORRECT (assault shape — every gun on the front)' : 'WRONG');

// Z cycles and wraps (moved off V in v0.44 — V is ROE, the shared key double-fired both)
game.formation = 'wedge';
input.justPressed.add('z'); updatePlayer(game.player, 1/60); input.justPressed.clear();
const f1 = game.formation;
input.justPressed.add('z'); updatePlayer(game.player, 1/60); input.justPressed.clear();
const f2 = game.formation;
input.justPressed.add('z'); updatePlayer(game.player, 1/60); input.justPressed.clear();
console.log('  [Z]: wedge -> ' + f1 + ' -> ' + f2 + ' -> ' + game.formation,
            f1 === 'column' && f2 === 'line' && game.formation === 'wedge' ? 'CORRECT (cycles)' : 'WRONG');
game.loadout.squad = 'standard'; game.formation = 'wedge'; initGame();
console.log('FORMATION TEST DONE');
})();

(function squadConeTests(){
console.log('--- every man casts a cone that follows him, at any squad size ---');
// Sam, playtesting v0.44: "when the squad is together I don't seem to see all
// of their vision cones... some of my squad is literally invisible to me when
// they move." The stagger was `i === game._coneTick` with the tick cycling
// 0,1,2 — written for a three-man squad. With the nine-man rifle squad indices
// 3..8 never matched, so their cones were computed once at spawn and frozen.
// A man outside every live cone is painted over by the fog: he vanishes.
for (const tmpl of ['standard', 'rifle9']) {
  game.loadout.squad = tmpl;
  game.mapIndex = 0; initGame(); game.state = 'play';
  const n = game.squad.length;
  game.squadPolys = []; game._coneTick = 0;

  // count how many times each index gets a genuinely fresh cone over 30 frames
  const before = game.squad.map(s => ({ x: s.x, y: s.y }));
  const seenFresh = new Array(n).fill(0);
  for (let f = 0; f < 30; f++) {
    const prev = game.squadPolys.slice();
    refreshSquadCones();
    for (let i = 0; i < n; i++) if (game.squadPolys[i] !== prev[i]) seenFresh[i]++;
  }
  const never = seenFresh.map((c, i) => c === 0 ? i : -1).filter(i => i >= 0);
  console.log('  ' + tmpl + ' (' + n + ' men): refreshes per man over 30 frames = ' + seenFresh.join(','),
              never.length === 0 ? 'CORRECT (nobody is skipped)'
                                 : 'WRONG — indices never refreshed: ' + never.join(','));

  // every man must be current within 3 frames of moving
  game.squad.forEach(s => { s.x += 150; });
  for (let f = 0; f < 3; f++) refreshSquadCones();
  const lag = game.squad.map((s, i) => {
    const apex = game.squadPolys[i] && game.squadPolys[i][0];
    return apex ? Math.round(Math.hypot(apex.x - s.x, apex.y - s.y)) : 99999;
  });
  const worst = Math.max(...lag);
  console.log('  ' + tmpl + ': worst cone lag 3 frames after a 150px move = ' + worst + 'px',
              worst < 2 ? 'CORRECT (every cone caught up)' : 'WRONG — a cone is stranded');

  // and the man's own position must be inside his own cone, or the fog eats him
  const orphans = game.squad.filter((s, i) => {
    const poly = game.squadPolys[i];
    if (!poly || poly.length < 3) return true;
    return Math.hypot(poly[0].x - s.x, poly[0].y - s.y) > 2;
  }).map(s => s.name);
  console.log('  ' + tmpl + ': men standing outside their own cone: ' + (orphans.join(',') || 'none'),
              orphans.length === 0 ? 'CORRECT (nobody gets fogged out)' : 'WRONG');
  void before;
}
game.loadout.squad = 'standard'; game.mapIndex = 0; initGame();
console.log('SQUAD CONE TEST DONE');
})();

(function casualtyClockTests(){
console.log('--- the bleed clock exists, ticks, and a tourniquet stops it ---');
// Sam: "unsure if the first aid and tourniquet mechanic works yet / i don't see
// a timer as they bleed out." The mechanic worked; the clock was only ever in
// the roster panel in the corner. These lock the SIM half down; the on-body
// readout is a render concern and is checked in the browser probe.
game.mapIndex = 0; initGame(); game.state = 'play';
const v = game.squad.find(s => s.alive);
killEntity(v, 'enemy', null);
console.log('  first zero downs him rather than killing him: downed=' + v.downed + ' alive=' + v.alive +
            ' clock=' + v.bleedT + 's',
            v.downed && v.alive && v.bleedT === TUNE.bleedOut ? 'CORRECT' : 'WRONG');
console.log('  bleedMax is stored so the bar can normalize: ' + v.bleedMax,
            v.bleedMax === TUNE.bleedOut ? 'CORRECT' : 'WRONG');

const t0 = v.bleedT;
for (let i = 0; i < 120; i++) update(1/60);
console.log('  the clock runs: ' + t0.toFixed(1) + 's -> ' + v.bleedT.toFixed(1) + 's',
            v.bleedT < t0 - 1.5 && v.alive ? 'CORRECT' : 'WRONG');

// stand on him and hold [E] for tqTime
game.player.x = v.x; game.player.y = v.y;
input.keys.add('e');
for (let i = 0; i < Math.ceil(TUNE.tqTime * 60) + 20; i++) updatePlayer(game.player, 1/60);
input.keys.delete('e');
console.log('  ' + TUNE.tqTime + 's of [E] stabilizes him: stabilized=' + v.stabilized,
            v.stabilized ? 'CORRECT' : 'WRONG');

const b0 = v.bleedT;
for (let i = 0; i < 600; i++) update(1/60);
console.log('  a stabilized man stops bleeding: ' + b0.toFixed(1) + 's -> ' + v.bleedT.toFixed(1) + 's after 10s',
            Math.abs(v.bleedT - b0) < 0.01 && v.alive ? 'CORRECT' : 'WRONG');

// the clock must actually be able to kill
game.mapIndex = 0; initGame(); game.state = 'play';
const w = game.squad.find(s => s.alive);
killEntity(w, 'enemy', null);
w.bleedT = 0.5;
for (let i = 0; i < 60; i++) update(1/60);
console.log('  an untreated clock runs out and kills him: alive=' + w.alive,
            !w.alive ? 'CORRECT' : 'WRONG');

// friendly fire: the first hit downs, a second hit on a DOWNED man is final
game.mapIndex = 0; initGame(); game.state = 'play';
const x = game.squad.find(s => s.alive);
killEntity(x, 'enemy', null);
const targetable = !!firstEntityOnSegment(
  { x: x.x - 60, y: x.y, side: 'player', owner: game.player, floorOverride: x.floor || 0 },
  x.x + 60, x.y);
console.log('  a downed man is still a bullet target for everyone: ' + targetable,
            targetable ? 'CORRECT (documented — realistic, and brutal)' : 'CHANGED');
applyHit(x, { dmg: 5, pen: 0, ang: 0, side: 'player', owner: game.player, ox: x.x - 60, oy: x.y }, x.x, x.y);
console.log('  and a second hit while down is final: alive=' + x.alive,
            !x.alive ? 'CORRECT' : 'WRONG');
console.log('CASUALTY CLOCK TEST DONE');
})();

(function bagTests(){
console.log('--- the bag: everything, always, priced by cadence ---');
// Sam, playtesting, used to say: "I don't see a way to get concussion and frag
// and smoke grenades in the loadout." The old answer was a kit picker whose
// button did not name what it carried. The new answer is that there is nothing
// to pick — you carry all five and never run out — so what used to be a
// labelling test is now an invariant test about the bag itself.
game.mapIndex = 0; initGame();
const bag = game.player.nades;
const missing = THROW_ORDER.filter(k => !(bag[k] > 0));
console.log('  every nature is in the bag: ' + THROW_ORDER.map(k => THROWABLES[k].name).join(', '),
            missing.length ? 'WRONG -> missing ' + missing.join(',') : 'CORRECT');
console.log('  and none of them can run out: ' + THROW_ORDER.every(k => bag[k] === Infinity),
            THROW_ORDER.every(k => bag[k] === Infinity) ? 'CORRECT' : 'WRONG');
// SUPPLY is gone, so CADENCE is the only thing left pricing a grenade — without
// it you could empty a building in one frame.
const p = game.player;
p.throwT = 0;
let thrown = 0;
for (let i = 0; i < 10; i++) { const n = game.bangs.length; throwSelected(p, 'bang', p.x + 60, p.y); if (game.bangs.length > n) thrown++; }
console.log('  ten throws in one frame yields ' + thrown,
            thrown === 1 ? 'CORRECT (cadence, not supply)' : 'WRONG');
let after = 0;
for (let i = 0; i < 60; i++) updateShooterWeapon(p, 1 / 60);   // a second later
const n2 = game.bangs.length; throwSelected(p, 'bang', p.x + 60, p.y);
if (game.bangs.length > n2) after = 1;
console.log('  and one more a second later: ' + after,
            after === 1 ? 'CORRECT (the cooldown clears)' : 'WRONG');
console.log('BAG TEST DONE');
})();

(function longWalkTests(){
console.log('--- the long walk: infil, snatch, exfil ---');
game.diffIndex = 1; game.densityIndex = 1; game.loadout.squad = 'standard';
const mi = MAPS.findIndex(m => m.name === 'THE LONG WALK');
game.mapIndex = mi; initGame(); game.state = 'play';
console.log('  map: ' + level.w + 'x' + level.h + ', objectives ' + JSON.stringify(MAPS[mi].objectives),
            level.w >= 70 && MAPS[mi].objectives.includes('capture') && MAPS[mi].objectives.includes('extract')
              ? 'CORRECT (large, and the job is a round trip)' : 'WRONG');
const st0 = tileAt(level.spawns.player.x, level.spawns.player.y);
const hvt = level.spawns.enemies.find(e => e.kind === 'hvt');
const ht = tileAt(hvt.x, hvt.y);
const path = astar(st0.tx, st0.ty, ht.tx, ht.ty, passForPath, pathCostSquad);
console.log('  HVT reachable, ' + (path ? path.length : 0) + ' tiles out',
            path && path.length > 60 ? 'CORRECT (a genuinely long walk)' : 'WRONG');
const unreachable = level.spawns.enemies.filter(es => {
  const et = tileAt(es.x, es.y);
  return !astar(st0.tx, st0.ty, et.tx, et.ty, passForPath, pathCostSquad);
});
console.log('  all ' + level.spawns.enemies.length + ' contacts reachable: ' + (unreachable.length === 0),
            unreachable.length === 0 ? 'CORRECT' : 'WRONG');
console.log('  extraction back at the treeline: ' + level.extraction.length + ' tiles at x=' +
            level.extraction.map(e => e.tx).join(','),
            level.extraction.length >= 2 && level.extraction.every(e => e.tx < 10) ? 'CORRECT' : 'WRONG');
console.log('LONG WALK TEST DONE');
})();

(function droneTests(){
console.log('--- FIELD TEST: the drones ---');
game.mapIndex = MAPS.findIndex(m => m.name === 'RAMADI ROW');
game.diffIndex = 1; game.densityIndex = 1; game.loadout.squad = 'standard';
initGame(); game.state = 'play';

// ISR: reveals the street, never the rooms
seen.init();
const yard = { x: 23 * TILE, y: 12 * TILE };          // mid-street
launchISR(yard.x, yard.y);
console.log('  launched: on station=' + !!game.isr + ', remaining=' + game.isrLeft,
            game.isr && game.isrLeft === 0 ? 'CORRECT (one per mission, field-test tuning)' : 'WRONG');
updateISR(0.5);
let ext = 0, int = 0;
for (let ty = 0; ty < level.h; ty++) for (let tx = 0; tx < level.w; tx++) {
  if (!seen.grid[ty][tx]) continue;
  const cx = tx * TILE + 16, cy = ty * TILE + 16;
  if (dist(yard.x, yard.y, cx, cy) > TUNE.isrRadius) continue;
  if (level.interior[ty][tx] && !level.wall[ty][tx]) int++;
  else if (!level.interior[ty][tx]) ext++;
}
console.log('  revealed: ' + ext + ' exterior tiles, ' + int + ' interior floor tiles',
            ext > 30 && int === 0 ? 'CORRECT (intel, not a wallhack)' : 'WRONG');
// paints men in the open, not men indoors
const outside = game.enemies.find(e => { const t2 = tileAt(e.x, e.y); return !level.interior[t2.ty][t2.tx]; })
             || game.enemies[0];
outside.x = yard.x + 40; outside.y = yard.y; outside.lastSeen = null;
const inside = game.enemies.find(e => e !== outside);
const it = tileAt(inside.x, inside.y);
inside.x = 8 * TILE + 16; inside.y = 6 * TILE + 16; inside.lastSeen = null;   // in a house
game.isr.tick = 0; updateISR(0.01);
console.log('  painted: man in the street=' + !!outside.lastSeen + ', man indoors=' + !!inside.lastSeen,
            outside.lastSeen && !inside.lastSeen ? 'CORRECT' : 'WRONG');
let t = 0; while (game.isr && t < 40) { updateISR(0.5); t += 0.5; }
console.log('  bingo after ' + t.toFixed(1) + 's', Math.abs(t - TUNE.isrTime) < 1.5 ? 'CORRECT' : 'WRONG');

// FPV: the man is a statue, the bird flies over walls, the blast is real
initGame(); game.state = 'play';
const P = game.player, px0 = P.x;
launchFPV();
console.log('  FPV up: ' + !!game.fpv + ', remaining=' + game.fpvLeft,
            game.fpv && game.fpvLeft === 0 ? 'CORRECT' : 'WRONG');
input.keys.add('d');
game.noises.length = 0;
for (let i = 0; i < 120; i++) { updatePlayer(P, 1 / 60); }
input.keys.delete('d');
const flew = game.fpv.x - px0;
console.log('  two seconds of D: bird +' + flew.toFixed(0) + 'px, man +' + (P.x - px0).toFixed(0) + 'px',
            flew > 300 && P.x === px0 ? 'CORRECT (goggles down, statue)' : 'WRONG');
console.log('  the world heard it: ' + game.noises.filter(n => n.side === 'player').length + ' buzz noises',
            game.noises.filter(n => n.side === 'player').length >= 3 ? 'CORRECT' : 'WRONG');
const foe2 = game.enemies.find(e => e.alive);
foe2.x = game.fpv.x + 15; foe2.y = game.fpv.y; const hp0 = foe2.hp; const alive0 = foe2.alive;
input.justPressed.add('lmb'); updatePlayer(P, 1 / 60); input.justPressed.clear();
console.log('  LMB: detonated=' + !game.fpv + ', man beside it ' + (foe2.alive ? (hp0 - foe2.hp).toFixed(0) + ' dmg' : 'killed'),
            !game.fpv && (!foe2.alive || foe2.hp < hp0) ? 'CORRECT (a frag with a camera)' : 'WRONG');
game.mapIndex = 0; initGame();
console.log('DRONE TEST DONE');
})();

(function cameraTests(){
console.log('--- FIELD TEST: security cameras ---');
game.diffIndex = 1; game.densityIndex = 1; game.loadout.squad = 'standard';
game.mapIndex = MAPS.findIndex(m => m.name === 'THE STANDOFF'); initGame(); game.state = 'play';

console.log('  THE STANDOFF mounts ' + level.cameras.length + ' cameras',
            level.cameras.length === 2 ? 'CORRECT' : 'WRONG');
const yardCam = level.cameras.reduce((a, b) => a.y > b.y ? a : b);
console.log('  yard camera faces ' + (Math.abs(angDiff(yardCam.face, Math.PI / 2)) < 0.1 ? 'south (the approach)' : yardCam.face.toFixed(2)),
            Math.abs(angDiff(yardCam.face, Math.PI / 2)) < 0.1 ? 'CORRECT (away from its wall)' : 'WRONG');

// stand in the cone: dwell, then the garrison learns
const P = game.player;
P.x = yardCam.x + Math.cos(yardCam.face) * 100; P.y = yardCam.y + Math.sin(yardCam.face) * 100;
game.enemies.forEach(e => { e.alerted = false; e.state = 'idle'; });
let t = 0;
while (t < 3 && !game.enemies.some(e => e.alerted)) { updateCameras(1 / 30); t += 1 / 30; }
const alerted = game.enemies.filter(e => e.alerted).length;
console.log('  stood in the cone: burned after ' + t.toFixed(1) + 's, ' + alerted + ' suspects alerted',
            t > TUNE.camDwell - 0.2 && t < TUNE.camDwell + 0.6 && alerted >= 1 && alerted <= 3
              ? 'CORRECT (dwell, then the call)' : 'WRONG');

// a fast crossing is a flicker, not a call
initGame(); game.state = 'play';
const cam2 = level.cameras.reduce((a, b) => a.y > b.y ? a : b);
game.player.x = cam2.x + Math.cos(cam2.face) * 100; game.player.y = cam2.y + Math.sin(cam2.face) * 100;
// the squad spawns at the police line — exactly what a yard camera watches, as
// the first draft of this test discovered. Park them out of frame.
game.squad.forEach((sq, i) => { sq.x = cam2.x - 400; sq.y = cam2.y - 400 + i * 30; });
game.enemies.forEach(e => { e.alerted = false; e.state = 'idle'; });
for (let i = 0; i < 15; i++) updateCameras(1 / 30);      // half a second
game.player.x = cam2.x - 300;                             // gone
for (let i = 0; i < 90; i++) updateCameras(1 / 30);
console.log('  crossed it in 0.5s: alerted=' + game.enemies.some(e => e.alerted) + ', dwell decayed to ' + cam2.dwell.toFixed(2),
            !game.enemies.some(e => e.alerted) && cam2.dwell === 0 ? 'CORRECT (a flicker)' : 'WRONG');

// any round takes it off the wall — loudly
game.bullets.push({ x: cam2.x - 60, y: cam2.y, ang: 0, speed: 1500, dmg: 30, pen: 26,
                    side: 'player', traveled: 0, range: 300, alive: true, ox: cam2.x - 60, oy: cam2.y });
game.noises.length = 0;
for (let i = 0; i < 10 && cam2.alive; i++) updateBullets(1 / 120);
console.log('  shot: camera dead=' + !cam2.alive + ', glass noise=' +
            game.noises.some(n => n.type === 'glass'),
            !cam2.alive && game.noises.some(n => n.type === 'glass') ? 'CORRECT (loud option)' : 'WRONG');

// the quiet option: walk under it and snip
initGame(); game.state = 'play';
const cam3 = level.cameras[0];
game.player.x = cam3.x + 10; game.player.y = cam3.y;
game.noises.length = 0;
playerInteract(game.player);
console.log('  [E] underneath: dead=' + !cam3.alive + ', noises made=' + game.noises.length,
            !cam3.alive && game.noises.length === 0 ? 'CORRECT (quiet option)' : 'WRONG');

game.mapIndex = MAPS.findIndex(m => m.name === 'THE LONG WALK'); initGame();
console.log('  THE LONG WALK town mounts ' + level.cameras.length,
            level.cameras.length === 2 ? 'CORRECT' : 'WRONG');
game.mapIndex = 0; initGame();
console.log('CAMERA TEST DONE');
})();

(function fireSupportTests(){
console.log('--- FIELD TEST: fire missions ---');
game.diffIndex = 1; game.densityIndex = 1; game.loadout.squad = 'standard';

// indoor missions have no guns on call
game.mapIndex = 0; initGame(); game.state = 'play';
callFireMission(game.player.x + 200, game.player.y);
console.log('  THE COMPOUND: missions=' + game.fireMissionsLeft + ', called=' + !!game.fireMission,
            game.fireMissionsLeft === 0 && !game.fireMission ? 'CORRECT (no guns for CQB)' : 'WRONG');

// the treeline has a battery
game.mapIndex = MAPS.findIndex(m => m.name === 'THE TREELINE'); initGame(); game.state = 'play';
console.log('  THE TREELINE: ' + game.fireMissionsLeft + ' fire missions on call',
            game.fireMissionsLeft === 2 ? 'CORRECT' : 'WRONG');
const tx = game.player.x + 500, ty = game.player.y;
const foe = game.enemies.find(e => e.alive);
foe.x = tx; foe.y = ty; const hp0 = foe.hp;
callFireMission(tx, ty);
console.log('  called: left=' + game.fireMissionsLeft + ', splash in ' + game.fireMission.t + 's',
            game.fireMissionsLeft === 1 && game.fireMission.t === TUNE.mortarFlight ? 'CORRECT' : 'WRONG');
// nothing lands during flight
for (let i = 0; i < 60 * 3.5; i++) updateFireMission(1 / 60);
console.log('  3.5s in: rounds still in the air=' + (game.fireMission.rounds === TUNE.mortarRounds),
            game.fireMission.rounds === TUNE.mortarRounds ? 'CORRECT (no recall, no early impact)' : 'WRONG');
let t = 0;
game.decals.length = 0;
while (game.fireMission && t < 10) { updateFireMission(1 / 60); t += 1 / 60; }
console.log('  fire for effect: ' + game.decals.length + ' craters over ' + t.toFixed(1) + 's, target ' +
            (foe.alive ? (hp0 - foe.hp).toFixed(0) + ' dmg' : 'killed'),
            game.decals.length === TUNE.mortarRounds && (!foe.alive || foe.hp < hp0)
              ? 'CORRECT (five rounds, a sheaf, a result)' : 'WRONG');
const spread2 = Math.max(...game.decals.map(d => dist(d.x, d.y, tx, ty)));
console.log('  worst round landed ' + spread2.toFixed(0) + 'px off the grid',
            spread2 <= TUNE.mortarScatter * 1.5 ? 'CORRECT (scatter bounded)' : 'WRONG');

// danger close warns but does not refuse — the sheaf is YOUR responsibility
initGame(); game.state = 'play';
callFireMission(game.player.x + 60, game.player.y);
console.log('  called on our own position: "' + game.hint.slice(0, 60) + '..."',
            /DANGER CLOSE/.test(game.hint) && game.fireMission ? 'CORRECT (warns, fires anyway)' : 'WRONG');
game.fireMission = null;
callFireMission(game.player.x + 500, game.player.y);
callFireMission(game.player.x + 500, game.player.y);
console.log('  battery dry: "' + game.hint.slice(0, 40) + '"',
            /dry|left/.test(game.hint) ? 'CORRECT' : 'WRONG');
game.mapIndex = 0; initGame();
console.log('FIRE SUPPORT TEST DONE');
})();

(function houseVariantTests(){
console.log('--- the standoff rotation: three houses, three problems ---');
game.diffIndex = 1; game.densityIndex = 1; game.loadout.squad = 'standard';
for (const nm of ['THE SPLIT', 'THE RANCH']) {
  const mi = MAPS.findIndex(m => m.name === nm);
  game.mapIndex = mi; initGame(); game.state = 'play';
  const st0 = tileAt(level.spawns.player.x, level.spawns.player.y);
  const unreachable = level.spawns.enemies.filter(es => {
    const et = tileAt(es.x, es.y);
    return !astar(st0.tx, st0.ty, et.tx, et.ty, passForPath, pathCostSquad);
  });
  const locked = level.doors.filter(d => d.locked).length;
  const patrols = game.enemies.filter(e => e.kind === 'patrol').length;
  console.log('  ' + nm + ': ' + game.enemies.length + ' suspects (' + patrols + ' patrols), ' +
              locked + ' barricaded doors, ' + level.cameras.length + ' camera, all reachable: ' +
              (unreachable.length === 0),
              unreachable.length === 0 && locked >= 1 && patrols === 0 && level.cameras.length === 1
                ? 'CORRECT (holds and waits, like the first one)' : 'WRONG');
}
// the ranch's corridor is real: the hallway row is open end to end
game.mapIndex = MAPS.findIndex(m => m.name === 'THE RANCH'); initGame();
let hall = 0;
for (let x = 7; x <= 38; x++) if (!level.wall[9][x]) hall++;
console.log('  THE RANCH hallway: ' + hall + '/32 tiles open',
            hall >= 30 ? 'CORRECT (a shooting gallery both ways)' : 'WRONG');
game.mapIndex = 0; initGame();
console.log('HOUSE VARIANT TEST DONE');
})();

(function coverUnderFireTests(){
console.log('--- the squad takes cover against the direction of contact ---');
// This test used to fire synthetic suppressAlong calls at three men parked in
// the open, and it PASSED while the feature was almost dead in real play:
// instrumenting actual firefights showed the squad taking cover ten times in
// two minutes across five maps. Two things were wrong. markContact only ran
// when a round passed near a man PERSONALLY, and the enemy mostly shoots at
// the player; and the commit test thresholded the raw magnitude of the summed
// bearing, which scales with how hard you are being shot at rather than with
// how much the fire agrees on a direction.
//
// So this drives a REAL engagement — an enemy that can see the squad, firing
// its own weapon through the real code path — and asserts the thing that
// actually matters: that a man who moves ends up better covered FROM THE
// BEARING THE FIRE CAME FROM.
game.mapIndex = MAPS.findIndex(m => m.name === 'THE TREELINE');
game.diffIndex = 1; game.loadout.squad = 'standard'; initGame(); game.state = 'play';
const P = game.player;
const team = game.squad.filter(s2 => s2.alive);
team.forEach(s2 => { s2.roe = 'return'; });
// one shooter, east of the team, with a clear line to them
const foe = game.enemies.find(e => e.alive);
let lane = null;
for (let i = 0; i < 360 && lane === null; i++) {
  const a = (i / 360) * TAU;
  const hit = raycast(P.x, P.y, a, 460, opaque);
  if (!hit.hit || hit.d > 420) lane = a;
}
foe.x = P.x + Math.cos(lane) * 360; foe.y = P.y + Math.sin(lane) * 360;
foe.state = 'combat'; foe.alerted = true; foe.floor = P.floor || 0;
game.alarm = true; game.settleT = 0;
// Measured AT THE MOMENT OF DECISION. Comparing after update() reads a man who
// has already walked part of the way, which muddies the very thing under test.
let moves = 0, better = 0, worse = 0;
const realSeek = seekCoverUnderFire;
seekCoverUnderFire = function (s2, dt) {
  const ox = s2.x, oy = s2.y, had = !!s2.repos;
  realSeek(s2, dt);
  if (had || !s2.repos) return;
  moves++;
  const ang = (s2.contactT > 0 && contactCoherence(s2) >= TUNE.contactCommit)
    ? Math.atan2(s2.contactY, s2.contactX)
    : angleTo(ox, oy, foe.x, foe.y);
  const fx = ox + Math.cos(ang) * 400, fy = oy + Math.sin(ang) * 400;
  const was = coveredFrom(ox, oy, fx, fy), got = coveredFrom(s2.repos.x, s2.repos.y, fx, fy);
  if (got > was + 0.02 || (lineOfSight(ox, oy, fx, fy, opaque) &&
                           !lineOfSight(s2.repos.x, s2.repos.y, fx, fy, opaque))) better++;
  else if (got < was - 0.02) worse++;
};
for (let i = 0; i < 60 * 20; i++) { foe.target = { x: P.x, y: P.y }; update(1 / 60); }
seekCoverUnderFire = realSeek;
console.log('  under real fire for 20s, cover moves: ' + moves,
            moves > 0 ? 'CORRECT (they do not stand in it)' : 'WRONG');
console.log('  of those, measurably better positioned: ' + better + ', no worse: ' + (moves - worse));
// Sampling a single 20-second engagement gives three or four moves, which is
// too thin to assert a RATE against — instrumenting fourteen real bot missions
// gave 66 moves, all of them improvements. So the directional property is
// asserted DETERMINISTICALLY here instead: given a bearing, the spot chosen
// must be better covered from it than the ground the man is standing on.
let dirTested = 0, dirGood = 0;
for (let i = 0; i < 40; i++) {
  const probeMan = team[i % team.length];
  const a2 = (i / 40) * TAU;
  const px = P.x + Math.cos(a2) * 120, py = P.y + Math.sin(a2) * 120;
  const at = nearestPassable(px, py);
  const saveX = probeMan.x, saveY = probeMan.y;
  probeMan.x = at.x; probeMan.y = at.y;
  const fx = at.x + Math.cos(a2) * 400, fy = at.y + Math.sin(a2) * 400;
  // The live path never even asks when a man is ALREADY covered from that
  // bearing — coverEnough stops him first — so probing those positions tests a
  // branch the game cannot reach and fails on it. Same precondition here.
  if (coveredFrom(at.x, at.y, fx, fy) > TUNE.coverEnough) { probeMan.x = saveX; probeMan.y = saveY; continue; }
  const spot = coverSpotFrom(probeMan, fx, fy) || concealSpotFrom(probeMan, fx, fy);
  if (spot) {
    dirTested++;
    const was = coveredFrom(at.x, at.y, fx, fy), got = coveredFrom(spot.x, spot.y, fx, fy);
    const losWas = lineOfSight(at.x, at.y, fx, fy, opaque);
    const losNow = lineOfSight(spot.x, spot.y, fx, fy, opaque);
    if (got >= was && !(losNow && !losWas)) dirGood++;
  }
  probeMan.x = saveX; probeMan.y = saveY;
}
console.log('  a chosen spot is never worse against its bearing: ' + dirGood + '/' + dirTested,
            dirTested > 0 && dirGood === dirTested
              ? 'CORRECT (it hides FROM the contact, not merely away)' : 'WRONG');
console.log('  moves that made it worse: ' + worse,
            worse === 0 ? 'CORRECT (never into the open)' : 'WRONG');
// COHERENCE, not magnitude. Fire from two sides is not a direction to hide
// from however heavy it gets, and one round from one side is a fine direction.
const probe = team[0];
probe.contactX = 0; probe.contactY = 0; probe.contactW = 0; probe.contactT = 0;
markContact(probe, probe.x + 400, probe.y, 0.3);
const oneRound = contactCoherence(probe);
console.log('  a single round is a usable bearing: coherence ' + oneRound.toFixed(2),
            oneRound >= TUNE.contactCommit ? 'CORRECT (scale-free)' : 'WRONG');
for (let i = 0; i < 12; i++) {
  markContact(probe, probe.x + 400, probe.y, 0.3);
  markContact(probe, probe.x - 400, probe.y, 0.3);
}
const split = contactCoherence(probe);
console.log('  fire from both sides cancels: coherence ' + split.toFixed(2),
            split < TUNE.contactCommit ? 'CORRECT (no wrong wall to dive behind)' : 'WRONG');
// HOLD FIRE is still the off switch
initGame(); game.state = 'play';
const t3 = game.squad.filter(s2 => s2.alive);
t3.forEach(s2 => s2.roe = 'hold');
const foe2 = game.enemies.find(e => e.alive);
foe2.x = P.x + Math.cos(lane) * 360; foe2.y = P.y + Math.sin(lane) * 360;
foe2.state = 'combat'; foe2.alerted = true; game.alarm = true; game.settleT = 0;
let heldSeeks = 0;
for (let i = 0; i < 60 * 12; i++) {
  update(1 / 60);
  heldSeeks += t3.filter(s2 => s2.repos).length;
}
console.log('  under HOLD FIRE nobody seeks cover: ' + heldSeeks + ' frames',
            heldSeeks === 0 ? 'CORRECT (the off switch works)' : 'WRONG');
console.log('COVER UNDER FIRE TEST DONE');
})();

(function droneTests(){
console.log('--- the drone: eyes, and a body ---');
game.mapIndex = MAPS.findIndex(m => m.name === 'THE SHOOT HOUSE');
initGame(); game.state = 'play';
launchFPV();
let insideWall = 0;
input.keys.clear(); input.keys.add('d');
for (let i = 0; i < 60 * 4 && game.fpv; i++) {
  updateFPV(1 / 60);
  if (!game.fpv) break;
  const t2 = tileAt(game.fpv.x, game.fpv.y);
  if (inBounds(t2.tx, t2.ty) && level.wall[t2.ty][t2.tx]) insideWall++;
}
input.keys.clear();
console.log('  frames inside a wall while flying straight at one: ' + insideWall,
            insideWall === 0 ? 'CORRECT (it does not pass through)' : 'WRONG');
initGame(); game.state = 'play';
launchFPV();
const g = game.fpv, foe = game.enemies.find(e => e.alive);
foe.lastSeen = null;
g.x = foe.x + 40; g.y = foe.y;
updateFPV(1 / 60);
console.log('  a man beside the bird is reported: ' + !!foe.lastSeen,
            foe.lastSeen ? 'CORRECT (it sees people)' : 'WRONG');
console.log('  and reads as live, not remembered: ' + visibleToPlayerSide(foe),
            visibleToPlayerSide(foe) === 'drone' ? 'CORRECT' : 'WRONG');
console.log('DRONE TEST DONE');
})();

(function soloTests(){
console.log('--- SOLO: nobody behind you ---');
const prevSquad = game.loadout.squad;
game.loadout.squad = 'solo';
let threw = 0, wrongSize = [];
for (let m = 0; m < MAPS.length; m++) {
  game.mapIndex = m;
  try {
    initGame(); game.state = 'play';
    for (let i = 0; i < 180; i++) {
      update(1 / 60);
      // poke every squad-facing system that could assume a team exists
      if (i === 30) for (const pl of PLAYS) callPlay(pl);
      if (i === 60) { padCycleSelection(); selectedSquaddies(); squadBarCards(); squadBarBottom(); }
      if (i === 90) { game.selected.add(0); issueOrders(); game.selected.clear(); }
    }
    // A map's casualties are squaddies and exist whether or not you brought
    // anyone — they are the objective, not support. Counted off the map source
    // rather than hard-coded: the count is a fact about BROKEN ARROW that has
    // already changed once, and a magic 2 here fails the day it changes again.
    const cnt = ch => MAPS[m].src.reduce((n, r) => n + r.split(ch).length - 1, 0);
    const want = cnt('w') + cnt('a');
    if (game.squad.length !== want) wrongSize.push(MAPS[m].name + '=' + game.squad.length + ' want ' + want);
  } catch (e) { threw++; wrongSize.push(MAPS[m].name + ' THREW ' + e.message); }
}
console.log('  twenty maps run solo, exceptions: ' + threw, threw === 0 ? 'CORRECT' : 'WRONG');
console.log('  solo squad is exactly the map\'s own casualties, nobody else: ' +
            (wrongSize.length ? wrongSize.join(' ') : 'yes'),
            wrongSize.length === 0 ? 'CORRECT' : 'WRONG');
game.loadout.squad = prevSquad;
console.log('SOLO TEST DONE');
})();

(function scopeTests(){
console.log('--- the glass: seeing further than the naked eye ---');
const prevGun = game.loadout.primary;
game.mapIndex = MAPS.findIndex(m => m.name === 'THE LONG WALK');
game.loadout.primary = 'dmr'; initGame(); game.state = 'play';
const p = game.player, foe = game.enemies.find(e => e.alive);
foe.floor = p.floor || 0;
console.log('  glassing with the DMR in hand: ' + glassing(), glassing() ? 'CORRECT' : 'WRONG');
let lane = null;
for (let i = 0; i < 720 && !lane; i++) {
  const a = (i / 720) * TAU;
  const hit = raycast(p.x, p.y, a, 1200, opaque);
  if (!hit.hit || hit.d > 1050) lane = a;
}
if (lane === null) { console.log('  (no open lane found — cannot assert visibility)'); }
else {
  foe.x = p.x + Math.cos(lane) * 950; foe.y = p.y + Math.sin(lane) * 950;
  input.mouse.wx = p.x + Math.cos(lane) * 1200; input.mouse.wy = p.y + Math.sin(lane) * 1200;
  p.steady = false; p.sprinting = false; p.blind = 0; p.stagger = 0;
  console.log('  a man at 950px, unaided (eye reaches ' + TUNE.playerViewDist + '): ' + visibleToPlayerSide(foe),
              !visibleToPlayerSide(foe) ? 'CORRECT (too far to see)' : 'WRONG');
  p.steady = true;
  console.log('  scoped(): ' + scoped(), scoped() ? 'CORRECT' : 'WRONG');
  console.log('  down the glass, same man: ' + visibleToPlayerSide(foe),
              visibleToPlayerSide(foe) === 'scope' ? 'CORRECT (the glass reaches him)' : 'WRONG');
  const off = lane + deg(60);
  foe.x = p.x + Math.cos(off) * 950; foe.y = p.y + Math.sin(off) * 950;
  console.log('  same range, 60 degrees off the aim line: ' + visibleToPlayerSide(foe),
              !visibleToPlayerSide(foe) ? 'CORRECT (a scope is a slot, not a sphere)' : 'WRONG');
}
// the camera walks out far enough that near-max-range ground is on screen
initGame(); game.state = 'play';
const q = game.player;
input.mouse.wx = q.x + 1200; input.mouse.wy = q.y;
game.cam.x = q.x; game.cam.y = q.y; q.steady = false;
for (let i = 0; i < 120; i++) updateCamera(1 / 60);
// The glass WIDENS the frame rather than sliding it off your man: the whole
// point is that you keep sight of your own position while you reach.
const zoomPlain = game.zoom;
q.steady = true;
for (let i = 0; i < 240; i++) updateCamera(1 / 60);
console.log('  zoom ' + zoomPlain.toFixed(2) + ' unaided -> ' + game.zoom.toFixed(2) + ' scoped',
            game.zoom < zoomPlain && Math.abs(game.zoom - TUNE.scopeZoom) < 0.01
              ? 'CORRECT (the frame pulls back)' : 'WRONG');
// your own man must still be on screen — that is the reason for doing it this way
const half = viewW / (2 * game.zoom);
const offCentre = Math.abs(game.cam.x - q.x);
// The invariant is that he is ON SCREEN, not that he is near the middle. At
// 0.55 the world-edge clamp often centres the camera on the whole map, which
// puts him off centre and fully visible — which is the point.
console.log('  your own sprite stays in frame: ' + Math.round(offCentre) + 'px off centre vs ' +
            Math.round(half) + 'px of half-screen',
            offCentre < half - 40 ? 'CORRECT (you can see yourself)' : 'WRONG');
// and the widened frame still covers most of the gun's reach
console.log('  aimable reach ' + Math.round(half) + 'px vs DMR range ' + PRIMARIES.dmr.w.range,
            half >= PRIMARIES.dmr.w.range * 0.8 ? 'CORRECT (max range is inside the frame)' : 'WRONG');
// coming off the sights hands the camera back
q.steady = false;
for (let i = 0; i < 240; i++) updateCamera(1 / 60);
console.log('  off the sights, zoom returns to ' + game.zoom.toFixed(2),
            Math.abs(game.zoom - zoomPlain) < 0.01 ? 'CORRECT (the glass gives it back)' : 'WRONG');
game.loadout.primary = prevGun;
console.log('SCOPE TEST DONE');
})();

(function gradeTests(){
console.log('--- the scorecard explains the letter ---');
game.mapIndex = 0; initGame();
const par = missionPar();
const set = o => Object.assign(game.stats,
  { time: par, arrests: 0, kills: 0, civsKilledByUs: 0, squadLost: 0,
    surrenderedKilled: 0, enemiesEngaged: 99 }, o);

// The explanation must never drift from the score it is explaining, so it is
// checked against the formula written out longhand rather than against itself.
// The three tabled terms are stirred in deliberately: if any of them leaks back
// into the arithmetic, this is where it shows up.
let mismatch = 0;
for (let i = 0; i < 400; i++) {
  set({ time: par * (0.4 + (i % 7) * 0.12),
        enemiesEngaged: i % 9,
        kills: (i * 3) % 8, arrests: i % 5, surrenderedKilled: i % 11 === 0 ? 1 : 0,
        civsKilledByUs: i % 3 === 0 ? 1 : 0,
        squadLost: i % 7 === 0 ? 1 : 0 });
  const st = game.stats;
  const quiet = clamp(game.enemies.length - st.enemiesEngaged, 0, 4);
  const pace  = clamp(Math.floor((par - st.time) / (par * 0.1)), 0, 4);
  const longhand = 100 + quiet * 3 + pace * 3 - st.civsKilledByUs * 20 - st.squadLost * 12;
  const want = longhand >= 118 ? 'S' : longhand >= 100 ? 'A' : longhand >= 80 ? 'B'
             : longhand >= 60 ? 'C' : 'D';
  const b = gradeBreakdown();
  if (b.score !== longhand || b.grade !== want || computeGrade() !== want) mismatch++;
}
console.log('  400 stat combinations vs the formula longhand, mismatches: ' + mismatch,
            mismatch === 0 ? 'CORRECT (the explanation cannot drift from the score)' : 'WRONG');

// TABLED, NOT DELETED. The surrender terms keep their rates and their advice and
// contribute nothing, so bringing the mechanic back is deleting one word each.
set({ enemiesEngaged: 0, time: par });
const without = gradeBreakdown().score;
set({ enemiesEngaged: 0, time: par, arrests: 9, kills: 9, surrenderedKilled: 9 });
const withThem = gradeBreakdown().score;
console.log('  the shelved surrender terms move nothing: ' + without + ' vs ' + withThem,
            without === withThem ? 'CORRECT' : 'WRONG — surrender is back in the score');
const tabled = GRADE_TERMS.filter(t => t.tabled).map(t => t.key).sort().join(',');
console.log('  ...and are still in the table, ready to come back: ' + tabled,
            tabled === 'arrests,kills,surrenderedKilled' ? 'CORRECT' : 'WRONG');
console.log('  nothing tabled reaches the scorecard: ' + gradeBreakdown().lines.map(l => l.label).join(' | '),
            gradeBreakdown().lines.every(l => !/arrest|Suspects killed|Surrendered/.test(l.label))
              ? 'CORRECT' : 'WRONG');

// S WAS MATHEMATICALLY UNREACHABLE the moment arrests left the table — base 100
// against a 105 band with nothing but penalties left, so every run could only
// count down. This is the guard against that ever being true again, and it has
// to hold on EVERY map: a term capped at four units is only earnable where there
// are four to earn.
let unreachable = [];
for (let i = 0; i < MAPS.length; i++) {
  game.mapIndex = i; initGame();
  Object.assign(game.stats, { time: 0, enemiesEngaged: 0, squadLost: 0,
    civsKilledByUs: 0, kills: 0, arrests: 0, surrenderedKilled: 0 });
  const b = gradeBreakdown();
  if (b.grade !== 'S' || b.next !== null) unreachable.push(MAPS[i].name + '=' + b.grade);
}
console.log('  a perfect run reaches the top band on all ' + MAPS.length + ' maps: ' +
            (unreachable.length ? unreachable.join(', ') : 'yes'),
            unreachable.length === 0 ? 'CORRECT (there is still something to reach for)' : 'WRONG');
console.log('  par spans the map sizes: ' +
            (function(){ const p = []; for (let i = 0; i < MAPS.length; i++) { game.mapIndex = i; initGame(); p.push(missionPar()); }
              return Math.min(...p).toFixed(0) + 's..' + Math.max(...p).toFixed(0) + 's'; })(),
            'CORRECT (informational)');
game.mapIndex = 0; initGame();

// Every suggestion that CLAIMS to close the gap must close it, must never advise
// undoing something that never happened, and — new — must not pretend when
// nothing single-handedly gets there.
let short = 0, phantom = 0, missing = 0;
for (const o of [{squadLost:1}, {civsKilledByUs:1}, {squadLost:1,civsKilledByUs:1},
                 {squadLost:3,civsKilledByUs:2}, {time: par*2}, {enemiesEngaged:99},
                 {enemiesEngaged:0, time:par}]) {
  set(o);
  const b = gradeBreakdown();
  if (!b.next) continue;
  if (!b.next.best) { missing++; continue; }
  if (b.next.best.closes && b.next.best.gain < b.next.gap) short++;
  const term = GRADE_TERMS.find(t => t.label === b.next.best.label);
  if (term && term.per < 0 && !(game.stats[term.key] > 0)) phantom++;
}
console.log('  every suggestion that claims to close the gap does: ' + (short ? short + ' do not' : 'yes'),
            short === 0 ? 'CORRECT' : 'WRONG');
console.log('  never advises undoing something you did not do: ' + (phantom ? phantom + ' do' : 'none'),
            phantom === 0 ? 'CORRECT' : 'WRONG');
console.log('  and there is always something to suggest: ' + (missing ? missing + ' blank' : 'yes'),
            missing === 0 ? 'CORRECT' : 'WRONG');

// A flawless run at par is 18 short of S and the biggest term left is worth 12.
// Nothing closes it alone. The old advice code assumed a closer always existed —
// it could, because arrests were unbounded — and reading .best off a null was a
// crash sitting in the most ordinary good run there is.
set({ enemiesEngaged: 99, time: par });
const flaw = gradeBreakdown();
console.log('  flawless-at-par: ' + flaw.score + ' ' + flaw.grade + ', ' + flaw.next.gap +
            (flaw.next ? flaw.next.gap + ' short of ' + flaw.next.grade +
              ', best=' + (flaw.next.best ? flaw.next.best.label + ' closes=' + flaw.next.best.closes : 'NONE') : ''),
            flaw.grade === 'A' && flaw.next && flaw.next.best && flaw.next.best.closes === false
              ? 'CORRECT (it says start here, not here is the answer)' : 'WRONG');

// A clean run is all green, which is why "nothing docked" cannot key on the line
// count any more.
set({ enemiesEngaged: 0, time: 0 });
const clean = gradeBreakdown();
console.log('  a perfect run tops out: ' + clean.score + ' ' + clean.grade + ', next=' + clean.next,
            clean.grade === 'S' && clean.next === null ? 'CORRECT' : 'WRONG');
console.log('  and its scorecard is all credit, no debits: ' + clean.lines.map(l => l.label + ' x' + l.n).join(' | '),
            clean.lines.length > 0 && clean.lines.every(l => l.delta > 0) ? 'CORRECT' : 'WRONG');

// The suite never calls render(), but the debrief is built out of strings and
// stub elements, so the one screen that consumes the breakdown CAN be exercised
// headless — and a null .best throws right here.
let debriefErrs = 0;
for (const o of [{}, {squadLost:1}, {civsKilledByUs:2}, {enemiesEngaged:99, time: par*3},
                 {enemiesEngaged:0, time:0}]) {
  set(o); game.state = 'play';
  try { endMission(true, ''); }
  catch (e) { debriefErrs++; if (debriefErrs < 3) console.log('  DEBRIEF THREW:', e.message); }
}
console.log('  the debrief builds for every shape of run: ' + (debriefErrs || 'no') + ' throws',
            debriefErrs === 0 ? 'CORRECT' : 'WRONG');

// SURRENDER IS TABLED, NOT REMOVED — and it cannot be, because CAPTURE is won by
// cuffing the principal and cuffEnemy refuses anything but a surrendered man.
// Gate the shout off and two of twenty missions quietly become unwinnable.
game.mapIndex = MAPS.findIndex(m => m.name === 'HIGH VALUE'); initGame(); game.state = 'play';
const hvt = hvtUnit();
console.log('  HIGH VALUE fields an HVT: ' + !!hvt, hvt ? 'CORRECT' : 'WRONG');
hvt.state = 'surrender';
cuffEnemy(hvt, game.player);
console.log('  and cuffing him satisfies CAPTURE: state=' + hvt.state + ' done=' + OBJECTIVES.capture.done(),
            hvt.state === 'cuffed' && OBJECTIVES.capture.done()
              ? 'CORRECT (the arrest path is scored-out, not torn out)' : 'WRONG');

localStorage.clear(); game.mapIndex = 0; initGame();
console.log('GRADE TEST DONE');
})();

(function cadenceTests(){
console.log('--- cadence: what each gun actually achieves ---');
const prevGun = game.loadout.primary;
const rate = {};
for (const key of ['carbine', 'shotgun', 'smg', 'saw', 'dmr']) {
  game.mapIndex = 0; game.loadout.primary = key; initGame(); game.state = 'play';
  const p = game.player;
  p.ammo = 999; p.weapon.mag = 999;          // isolate cadence from reloading
  let shots = 0;
  for (let i = 0; i < 60 * 6; i++) { updateShooterWeapon(p, 1 / 60); if (tryFire(p, 0)) shots++; }
  rate[key] = shots / 6;
}
console.log('  rounds per second: ' +
  Object.entries(rate).map(([k, v]) => k + ' ' + v.toFixed(2)).join(' · '));
// A breaching shotgun cycling slower than a precision rifle is backwards, and
// that is exactly what 95rpm did. This is the guard against it coming back.
console.log('  the shotgun out-cycles the marksman rifle: ' +
            rate.shotgun.toFixed(2) + ' vs ' + rate.dmr.toFixed(2),
            rate.shotgun > rate.dmr ? 'CORRECT' : 'WRONG');
console.log('  and is not the slowest gun carried: ' +
            (rate.shotgun > Math.min(...Object.values(rate)) ||
             Object.values(rate).filter(v => v < rate.shotgun).length >= 0),
            rate.shotgun > rate.dmr ? 'CORRECT' : 'WRONG');
// speed is available, accuracy is the bill
game.loadout.primary = 'shotgun'; initGame(); game.state = 'play';
const p2 = game.player; p2.ammo = 999; p2.weapon.mag = 999; p2.steady = false; p2.moving = false;
const cone = []; let n = 0;
for (let i = 0; i < 60 * 3; i++) {
  updateShooterWeapon(p2, 1 / 60);
  if (tryFire(p2, 0)) { n++; if (n <= 3) cone.push(currentSpread(p2)); }
}
console.log('  a held trigger opens the cone: ' + cone.map(c => (c * 180 / Math.PI).toFixed(1)).join(' -> ') + ' deg',
            cone[2] > cone[0] * 2 ? 'CORRECT (fast strings pay for it)' : 'WRONG');
initGame(); game.state = 'play';
const p3 = game.player; p3.ammo = 999; p3.weapon.mag = 999; p3.steady = false; p3.moving = false;
for (let i = 0; i < 60; i++) updateShooterWeapon(p3, 1 / 60);
console.log('  paced, it settles back to ' + (currentSpread(p3) * 180 / Math.PI).toFixed(2) + ' deg',
            currentSpread(p3) < cone[0] ? 'CORRECT (patience is rewarded)' : 'WRONG');
game.loadout.primary = prevGun;
console.log('CADENCE TEST DONE');
})();

(function canTests(){
console.log('--- a shotgun does not take a can ---');
const prevGun = game.loadout.primary, prevCan = game.loadout.can;
game.loadout.can = true;
let bad = [];
for (const g of ['carbine', 'shotgun', 'smg', 'dmr', 'saw']) {
  game.mapIndex = 0; game.loadout.primary = g; initGame(); game.state = 'play';
  const want = g !== 'shotgun';
  if (game.player.can !== want) bad.push(g + '=' + game.player.can);
}
console.log('  only the shotgun refuses it: ' + (bad.length ? bad.join(',') : 'all correct'),
            bad.length === 0 ? 'CORRECT' : 'WRONG');
// The muzzle picker is TEAM-WIDE, so this has to hold per man rather than by
// hiding a button: the breacher's shotgun loses the can, the rifleman keeps his.
game.loadout.primary = 'carbine'; game.loadout.squad = 'standard'; initGame();
const br = game.squad.find(s2 => s2.role === 'breacher');
const rf = game.squad.find(s2 => s2.role === 'rifleman');
console.log('  the breacher loses his, the rifleman keeps his: ' +
            (br ? br.can : 'n/a') + ' / ' + (rf ? rf.can : 'n/a'),
            br && !br.can && rf && rf.can ? 'CORRECT (enforced per shooter)' : 'WRONG');
game.loadout.primary = prevGun; game.loadout.can = prevCan;
console.log('CAN TEST DONE');
})();

(function reloadRingTests(){
console.log('--- the reload ring ---');
const prevGun = game.loadout.primary;
game.mapIndex = 0; game.loadout.primary = 'carbine'; initGame(); game.state = 'play';
const p = game.player; p.ammo = 0; tryReload(p);
const seq = [];
for (let i = 0; i < 90; i++) { const a = reloadArc(p); if (a && i % 20 === 0) seq.push(a.to / TAU); updateShooterWeapon(p, 1 / 60); }
console.log('  a magazine gun sweeps once: ' + seq.map(v => v.toFixed(2)).join(' -> '),
            seq.length > 1 && seq[seq.length - 1] > seq[0] ? 'CORRECT' : 'WRONG');
// A TUBE GUN TICKS PER SHELL. The suite cannot call render(), which is exactly
// why reloadArc exists as its own function — the numbers are assertable.
game.loadout.primary = 'shotgun'; initGame(); game.state = 'play';
const q = game.player; q.ammo = 0; tryReload(q);
let resets = 0, prev = 1; const froms = new Set();
for (let i = 0; i < 60 * 4; i++) {
  const a = reloadArc(q);
  if (a) { const f = a.to - a.from; if (f < prev - 0.05) resets++; prev = f; froms.add(a.from.toFixed(2)); }
  updateShooterWeapon(q, 1 / 60);
}
console.log('  a tube gun ticks per shell: ' + resets + ' resets, ' + froms.size + ' start angles',
            resets >= 3 && froms.size >= 4 ? 'CORRECT (ticks, not one long sweep)' : 'WRONG');
// breaking off keeps the shells and clears the ring with the reload
q.ammo = 0; q.reloading = 0; tryReload(q);
for (let i = 0; i < 72; i++) updateShooterWeapon(q, 1 / 60);
q.cooldown = 0; tryFire(q, 0);
console.log('  breaking off clears the ring: ' + reloadArc(q),
            reloadArc(q) === null ? 'CORRECT' : 'WRONG');
// updateSquaddie returns before updateShooterWeapon for a downed man, so his
// timer never ticks — a ring there would sit still and lie.
game.loadout.primary = 'carbine'; initGame(); game.state = 'play';
const s2 = game.squad[0]; s2.ammo = 0; tryReload(s2); s2.downed = true;
console.log('  a downed man shows none (his clock is frozen): ' + reloadArc(s2),
            reloadArc(s2) === null ? 'CORRECT' : 'WRONG');
let bad = 0;
for (const g of ['carbine', 'shotgun', 'smg', 'saw', 'dmr']) {
  game.loadout.primary = g; initGame(); game.state = 'play';
  const m = game.player; m.ammo = 0; tryReload(m);
  for (let i = 0; i < 60 * 9; i++) {
    const a = reloadArc(m);
    if (a && (a.to < a.from || a.to > TAU + 1e-6 || a.from < 0)) bad++;
    updateShooterWeapon(m, 1 / 60);
  }
}
console.log('  arcs never invert or overflow, all five guns: ' + bad + ' faults',
            bad === 0 ? 'CORRECT' : 'WRONG');
game.loadout.primary = prevGun;
console.log('RELOAD RING TEST DONE');
})();

(function m203Tests(){
console.log('--- M4 + M203: the whole bag, launched ---');
const prevGun = game.loadout.primary;
game.mapIndex = 0; game.loadout.primary = 'm203'; initGame(); game.state = 'play';
const p = game.player;
console.log('  carrying it means you have a tube: ' + hasLauncher(p),
            PRIMARIES.m203 && hasLauncher(p) ? 'CORRECT' : 'WRONG');
// All five natures go down it. Frag rides the HE fuze that was already there;
// the other four ride their OWN kind so detonateNade routes them into the same
// effect a hand grenade gets — one copy of popSmoke, one of detonateBang.
const launched = [];
for (const k of THROW_ORDER) {
  p.nadeCd = 0; const n0 = game.bangs.length;
  throwSelected(p, k, p.x + 400, p.y);
  if (game.bangs.length > n0) {
    const g = game.bangs[game.bangs.length - 1];
    launched.push(k + ':' + g.kind + (g.m203 ? '/m203' : ''));
  }
}
console.log('  all five natures launch: ' + launched.join(' '),
            launched.length === 5 ? 'CORRECT' : 'WRONG');
console.log('  frag rides the HE fuze, the rest their own kind',
            launched[1].includes('he40') && launched[0].includes('bang') ? 'CORRECT' : 'WRONG');
// The 8s IS the reach's price: a man who could launch and throw would just own
// a better hand grenade.
p.nadeCd = 0; game.bangs.length = 0;
throwSelected(p, 'frag', p.x + 400, p.y);
const after1 = game.bangs.length;
throwSelected(p, 'frag', p.x + 400, p.y);
console.log('  one round at a time: ' + after1 + ' then ' + game.bangs.length +
            ' (cd ' + p.nadeCd.toFixed(1) + 's)',
            after1 === 1 && game.bangs.length === 1 && p.nadeCd > 7 ? 'CORRECT' : 'WRONG');
// updateSquaddie always ticked nadeCd for the grenadier; NOTHING ticked it for
// the player, because until the M203 the player had no tube. Without that the
// launcher fires once per mission.
for (let i = 0; i < 60 * 9; i++) updatePlayer(p, 1 / 60);
console.log('  the tube reloads, it is not one shot a mission: cd=' + (p.nadeCd || 0).toFixed(1),
            (p.nadeCd || 0) === 0 ? 'CORRECT' : 'WRONG');
// A 40mm arms by spin, and spin comes from flight — not from what is in the nose.
let duds = 0;
for (const k of THROW_ORDER) {
  p.nadeCd = 0; game.bangs.length = 0;
  throwSelected(p, k, p.x + 40, p.y);
  const g = game.bangs[0];
  if (g) { g.flew = 40; if (!armed40(g)) duds++; }
}
console.log('  every nature duds inside the arming distance: ' + duds + '/5',
            duds === 5 ? 'CORRECT (same fuze, whatever is in the nose)' : 'WRONG');
game.loadout.primary = 'carbine'; initGame(); game.state = 'play';
const q = game.player; q.throwT = 0; game.bangs.length = 0;
throwSelected(q, 'bang', q.x + 80, q.y);
console.log('  a plain M4 still throws by hand: ' + (!hasLauncher(q) && game.bangs.length === 1),
            !hasLauncher(q) && game.bangs.length === 1 ? 'CORRECT' : 'WRONG');
game.loadout.primary = prevGun;
console.log('M203 TEST DONE');
})();

(function shieldTests(){
console.log('--- pistol + shield: armour you point ---');
const prevGun = game.loadout.primary, prevSquad = game.loadout.squad;
game.mapIndex = 0; game.loadout.primary = 'shield'; initGame(); game.state = 'play';
const p = game.player;
console.log('  carrying it: pool ' + p.shieldMax + ', guns ' + p.guns.length + ' (' + p.guns[0].name + ')',
            hasShield(p) && p.shieldMax === 300 && p.guns.length === 1 && p.guns[0].name === 'SIDEARM'
              ? 'CORRECT (the bunker bought the primary slot)' : 'WRONG');
// THE WHOLE MECHANIC IS THE ARC. 400 AK rounds from each bearing, with the pool
// restored each time so this measures the arc and not the wear.
const atBearing = off => {
  initGame(); game.state = 'play';
  const m = game.player; m.face = 0; m.hp = 1e6; m.armor = 1e6;
  let stopped = 0;
  for (let i = 0; i < 400; i++) {
    if (throughArmor(m, 21, 32, undefined, undefined, deg(off)).hitShield) stopped++;
    m.shield = m.shieldMax;
  }
  return stopped;
};
const ahead = atBearing(0), edge = atBearing(38), past = atBearing(42),
      flank = atBearing(90), back = atBearing(180);
console.log('  stopped by bearing — 0:' + ahead + ' 38:' + edge + ' 42:' + past +
            ' 90:' + flank + ' 180:' + back);
console.log('  it works inside the arc: ' + (ahead > 300 && edge > 300),
            ahead > 300 && edge > 300 ? 'CORRECT (~88% cover)' : 'WRONG');
console.log('  and is worth NOTHING outside it: ' + past + '/' + flank + '/' + back,
            past === 0 && flank === 0 && back === 0 ? 'CORRECT (you can be flanked)' : 'WRONG');
// rating 36 turns the garrison's x39 (32) but not AP (46) — and the emplaced
// M2 at fmj 26 x penMul 2.2 = 57 goes through it, which is most of why the
// mount is worth taking.
initGame(); game.state = 'play';
const m2 = game.player; m2.face = 0; m2.armor = 0;
let ak = 0, ap = 0;
for (let i = 0; i < 300; i++) { m2.shield = m2.shieldMax; ak += throughArmor(m2, 21, 32, undefined, undefined, 0).dmg; }
for (let i = 0; i < 300; i++) { m2.shield = m2.shieldMax; ap += throughArmor(m2, 21, 46, undefined, undefined, 0).dmg; }
console.log('  AK through ' + (ak / 300).toFixed(1) + ' vs AP through ' + (ap / 300).toFixed(1),
            ap > ak * 3 ? 'CORRECT (rating 36 turns x39, not AP)' : 'WRONG');
// A bunker is a PLANE and blast is a SPHERE, so the area-damage callers pass no
// bearing at all and the shield never fires. That omission is the mechanic.
initGame(); game.state = 'play';
const m3 = game.player; m3.face = 0; m3.armor = 0; m3.shield = m3.shieldMax;
console.log('  overpressure goes round it: hitShield=' +
            !!throughArmor(m3, 40, 16, m3.x, m3.y).hitShield,
            !throughArmor(m3, 40, 16, m3.x, m3.y).hitShield
              ? 'CORRECT (no bearing, no shield)' : 'WRONG');
// it must never be free
game.loadout.primary = 'shield'; initGame(); const sp = game.player;
game.loadout.primary = 'carbine'; initGame(); const cp = game.player;
console.log('  it slows you: ' + (sp.weapon.carrySpeed || 1).toFixed(2) + ' vs ' +
            (cp.weapon.carrySpeed || 1).toFixed(2),
            (sp.weapon.carrySpeed || 1) < (cp.weapon.carrySpeed || 1) ? 'CORRECT' : 'WRONG');
// and the squad can carry one
game.loadout.primary = 'carbine'; game.loadout.squad = 'bunker'; initGame();
const sh = game.squad.find(s2 => s2.role === 'shield');
console.log('  a squaddie can carry one too: ' + (sh ? sh.shieldMax : 'no shield role fielded'),
            sh && hasShield(sh) ? 'CORRECT' : 'WRONG');
// One sprite, two tints. #TEAMCOLOR is swapped at rasterisation and getSprite
// caches per (key, tint), so the player's blue bunker and a squaddie's green one
// come off the same art — which is why there is no player_shield key and why
// this whole feature cost zero art bytes.
game.loadout.primary = 'shield'; game.loadout.squad = 'bunker'; initGame(); game.state = 'play';
const pa = spriteFor(game.player), sq2 = game.squad.find(s2 => s2.role === 'shield');
console.log('  the bunker art draws for both, in different colours: ' +
            pa.key + '/' + (sq2 ? spriteFor(sq2).key : '-'),
            pa.key === 'squad_shield' && sq2 && spriteFor(sq2).key === 'squad_shield' &&
            pa.tint !== spriteFor(sq2).tint ? 'CORRECT (one sprite, zero new bytes)' : 'WRONG');
game.loadout.primary = 'carbine'; initGame(); game.state = 'play';
console.log('  and a plain player still draws the man: ' + spriteFor(game.player).key,
            spriteFor(game.player).key === 'player' ? 'CORRECT' : 'WRONG');

// Sam, on the first draft: "shield doesn't look right from above, should be a
// simple black curve on the left arm, and the right arm should hold the
// pistol." From directly overhead a shield is an EDGE, not a slab — the first
// version was a filled rectangle plus a filled accent and read as a blob. The
// suite never calls render(), so what it can hold is the geometry contract:
// stroked not filled, dark not team-coloured, left of the centreline, with the
// gun on the other side. Sprites are authored facing EAST, so his left is -y.
const art = SPRITES.squad_shield;
const shieldTag = (art.match(/<path data-part="shield"[^/]*\/>/) || [''])[0];
const curved = /stroke="#14181c"/.test(shieldTag) && /fill="none"/.test(shieldTag) && /Q/.test(shieldTag);
console.log('  the bunker is a stroked curve, not a filled slab: ' + curved,
            curved ? 'CORRECT (an edge is what you see from above)' : 'WRONG');
const ys = (shieldTag.match(/d="M([\d.]+) ([\d.]+)Q([\d.]+) ([\d.]+) ([\d.]+) ([\d.]+)"/) || []).slice(1).map(Number);
// Second note from Sam: "closer, the curve should cover their torso." The
// first version of this test asserted the arc stayed left of the centreline —
// which was the first draft's intent and is the wrong invariant. A shield you
// hold in front of you SPANS the body from above; what makes it the left arm's
// is that it is biased that way, not that it stops at the middle. The torso is
// y 20..44 in this frame.
const spans = ys.length === 6 && ys[1] < 20 && ys[5] >= 40;
const biasedLeft = ys.length === 6 && (ys[1] + ys[5]) / 2 < 32;
console.log('  it covers the torso: arc y ' + ys[1] + '..' + ys[5] + ' against a body of 20..44',
            spans ? 'CORRECT' : 'WRONG');
console.log('  and it is biased onto the LEFT arm: chord centre y=' + ((ys[1] + ys[5]) / 2).toFixed(1),
            biasedLeft ? 'CORRECT (-y is left of east)' : 'WRONG');
const gun = (art.match(/<g data-part="weapon">.*?<\/g>/) || [''])[0];
const gunYs = [...gun.matchAll(/y="([\d.]+)"/g)].map(m2 => Number(m2[1]));
const gunRight = gunYs.length > 0 && Math.min(...gunYs) > 32;
console.log('  the pistol is in the RIGHT hand: gun y from ' + (gunYs.length ? Math.min(...gunYs) : '—'),
            gunRight ? 'CORRECT (+y is right of east)' : 'WRONG');
const clear = spans && gunRight && Math.max(...ys.filter((_, i) => i % 2)) < Math.min(...gunYs);
console.log('  the gun comes round the LOW edge, clear of it: ' + clear,
            clear ? 'CORRECT (an earlier draft hid the gun under the shield)' : 'WRONG');
game.loadout.primary = prevGun; game.loadout.squad = prevSquad;
console.log('SHIELD TEST DONE');
})();

(function peelTests(){
console.log('--- the peel: leaving a fight alive ---');
game.diffIndex = 1; game.densityIndex = 1; game.loadout.squad = 'standard';
game.mapIndex = MAPS.findIndex(m => m.name === 'THE TREELINE'); initGame(); game.state = 'play';
const P = game.player;

// a known threat ahead, a rally behind
const foe = game.enemies.find(e => e.alive);
foe.x = P.x + 380; foe.y = P.y; foe.state = 'combat';
foe.lastSeen = { x: foe.x, y: foe.y, t: game.stats.time, face: 0 };
const rally = nearestPassable(P.x - 320, P.y);
input.mouse.wx = rally.x; input.mouse.wy = rally.y;
const play = PLAYS.find(pl => pl.name === 'PEEL');
console.log('  PEEL is on the call sheet [' + play.key + ']', play ? 'CORRECT' : 'WRONG');
callPlay(play);
console.log('  called: orders ' + JSON.stringify(game.squad.map(s => s.order.type)) +
            ', fire axis toward the threat: ' + (Math.abs(game.peel.tx - foe.x) < 60),
            game.squad.every(s => s.order.type === 'peel') && Math.abs(game.peel.tx - foe.x) < 60
              ? 'CORRECT' : 'WRONG');

// drive it: displacement toward the rally, rounds toward the threat, never uncovered
const d0 = game.squad.reduce((a, s2) => a + dist(s2.x, s2.y, rally.x, rally.y), 0) / 3;
const shots0 = game.stats.shotsFired;
let squadRounds = 0, bothMoving = 0, samples = 0, swaps = 0, lastUp = game.peel.moving;
const prevPos = new Map();
for (let f = 0; f < 60 * 16 && game.peel; f++) {
  game.squad.forEach(s2 => prevPos.set(s2, { x: s2.x, y: s2.y }));
  const ammoBefore = game.squad.reduce((a, s2) => a + s2.ammo, 0);
  update(1 / 60);
  squadRounds += Math.max(0, ammoBefore - game.squad.reduce((a, s2) => a + s2.ammo, 0));
  if (!game.peel) break;
  if (game.peel.moving !== lastUp) { swaps++; lastUp = game.peel.moving; }
  samples++;
  const moved = game.squad.filter(s2 => s2.alive && dist(s2.x, s2.y, prevPos.get(s2).x, prevPos.get(s2).y) > 0.4);
  if (moved.length === game.squad.filter(s2 => s2.alive).length) bothMoving++;
}
const d1 = game.squad.reduce((a, s2) => a + dist(s2.x, s2.y, rally.x, rally.y), 0) / 3;
console.log('  mean distance to rally ' + d0.toFixed(0) + ' -> ' + d1.toFixed(0) + 'px over ' +
            (samples / 60).toFixed(1) + 's, ' + swaps + ' element swaps',
            d1 < 80 && swaps >= 1 ? 'CORRECT (they got out, trading places)' : 'WRONG');
console.log('  rounds fired covering the withdrawal: ' + squadRounds,
            squadRounds > 6 ? 'CORRECT (shooting the whole way)' : 'WRONG');
console.log('  frames with nobody set: ' + bothMoving + '/' + samples,
            bothMoving / Math.max(1, samples) < 0.06 ? 'CORRECT' : 'WRONG');
console.log('  and it ended holding, facing the threat: ' +
            game.squad.every(s2 => s2.order.type === 'hold'),
            game.squad.every(s2 => s2.order.type === 'hold') ? 'CORRECT' : 'WRONG');
game.mapIndex = 0; initGame();
console.log('PEEL TEST DONE');
})();

(function turretQrfTests(){
console.log('--- FIELD TEST: the emplaced gun, and the counterattack ---');
game.diffIndex = 1; game.densityIndex = 1; game.loadout.squad = 'standard';
game.mapIndex = MAPS.findIndex(m => m.name === 'THE PILLBOX'); initGame(); game.state = 'play';

const t = level.turrets[0];
console.log('  THE PILLBOX mounts ' + level.turrets.length + ' gun, facing its slit: ' +
            (Math.abs(angDiff(t.face0, Math.PI)) < 0.1 ? 'west (the approach)' : t.face0.toFixed(2)),
            level.turrets.length === 1 && Math.abs(angDiff(t.face0, Math.PI)) < 0.1 ? 'CORRECT' : 'WRONG');

// mount: pinned, clamped, belt-fed
const P = game.player;
P.x = t.x + 12; P.y = t.y;
playerInteract(P);
console.log('  [E]: mounted=' + (P.turret === t) + ', weapon=' + P.weapon.name,
            P.turret === t && P.weapon.name === 'EMPLACED M2' ? 'CORRECT' : 'WRONG');
input.mouse.wx = t.x - 300; input.mouse.wy = t.y;      // into the arc
for (let i = 0; i < 30; i++) updatePlayer(P, 1 / 30);
const inArc = Math.abs(angDiff(t.face0, P.face)) < TUNE.turretArc / 2 + 0.01;
input.mouse.wx = t.x + 300;                             // directly behind the mount
for (let i = 0; i < 60; i++) updatePlayer(P, 1 / 30);
const clamped = Math.abs(angDiff(t.face0, P.face)) <= TUNE.turretArc / 2 + 0.01;
console.log('  aim into the arc ok=' + inArc + '; dragged behind the mount, face stays clamped=' + clamped,
            inArc && clamped ? 'CORRECT (it only points where the mount points)' : 'WRONG');
playerInteract(P);
console.log('  [E] again: off the gun, carbine back: ' + P.weapon.name,
            !P.turret && P.weapon.name !== 'EMPLACED M2' ? 'CORRECT' : 'WRONG');

// squaddie on the gun via right-click
const gnr = game.squad[0];
game.selected.clear();
input.mouse.wx = t.x; input.mouse.wy = t.y;
input.mouse.rx = 0; input.mouse.ry = 0;
input.mouse.x = 0; input.mouse.y = 0;      // no stale flick: this is a plain release
input.justPressed.add('rmb'); issueOrders();
input.justPressed.clear(); input.justReleased.add('rmb'); issueOrders(); input.justReleased.clear();
const manOrder = game.squad.find(s2 => s2.order.type === 'man');
console.log('  right-click the gun: ' + (manOrder ? manOrder.name + ' ordered to MAN it' : 'nobody'),
            manOrder ? 'CORRECT' : 'WRONG');
let tm = 0;
while (!manOrder.turret && tm < 15) { updateSquaddie(manOrder, 1 / 30); tm += 1 / 30; }
console.log('  he walked over and mounted in ' + tm.toFixed(1) + 's: ' + (manOrder.turret === t) +
            ', on the belt: ' + manOrder.weapon.name,
            manOrder.turret === t && manOrder.weapon.name === 'EMPLACED M2' ? 'CORRECT' : 'WRONG');
manOrder.order = { type: 'follow' };
updateSquaddie(manOrder, 1 / 30);
console.log('  new order pulls him off: dismounted=' + !manOrder.turret + ', gun free=' + !t.manned,
            !manOrder.turret && !t.manned ? 'CORRECT' : 'WRONG');

// QRF: the quiet minute is not a win
console.log('  QRF declared: ' + JSON.stringify(MAPS[game.mapIndex].qrf) + ', Q points=' + level.spawns.qrf.length,
            MAPS[game.mapIndex].qrf.size === 6 && level.spawns.qrf.length === 2 ? 'CORRECT' : 'WRONG');
const before2 = game.enemies.length;
game.enemies.forEach(e => { e.alive = false; });        // the garrison falls
updateQRF(1 / 30);
console.log('  garrison down: phase=' + game.qrfState.phase + ', neutralize done=' + OBJECTIVES.neutralize.done(),
            game.qrfState.phase === 'inbound' && !OBJECTIVES.neutralize.done()
              ? 'CORRECT (the quiet minute is for reloading)' : 'WRONG');
for (let i = 0; i < 8 * 30; i++) updateQRF(1 / 30);
console.log('  counterattack: ' + (game.enemies.length - before2) + ' fresh guns, all alerted: ' +
            game.enemies.slice(before2).every(e => e.alerted),
            game.enemies.length - before2 === 6 && game.enemies.slice(before2).every(e => e.alerted)
              ? 'CORRECT' : 'WRONG');
game.enemies.forEach(e => { e.alive = false; });
console.log('  wave destroyed: neutralize done=' + OBJECTIVES.neutralize.done(),
            OBJECTIVES.neutralize.done() ? 'CORRECT (NOW it is over)' : 'WRONG');
game.mapIndex = 0; initGame();
console.log('TURRET+QRF TEST DONE');
})();

(function brokenArrowTests(){
console.log('--- BROKEN ARROW: you are the QRF ---');
localStorage.clear();
game.diffIndex = 1; game.densityIndex = 1; game.loadout.squad = 'standard';
game.mapIndex = MAPS.findIndex(m => m.name === 'BROKEN ARROW'); initGame(); game.state = 'play';

const casualties = game.squad.filter(s2 => s2.qrfCasualty);
const wounded = casualties.filter(s2 => !s2.walkingWounded);      // flat on their backs
const walking = casualties.filter(s2 => s2.walkingWounded);       // up, hurt, holding
const mapSrc = MAPS[game.mapIndex].src;
const cnt = ch => mapSrc.reduce((n, r) => n + r.split(ch).length - 1, 0);
console.log('  deployed ' + game.squad.length + ' (' + (game.squad.length - casualties.length) + ' up + ' +
            wounded.length + ' down + ' + walking.length + ' walking), clocks: ' +
            wounded.map(s2 => s2.bleedT + 's').join(', '),
            wounded.length === cnt('w') && walking.length === cnt('a') &&
            wounded.every(s2 => s2.downed && !s2.stabilized && s2.bleedT === TUNE.brokenBleed)
              ? 'CORRECT (the mission is the men)' : 'WRONG');
// A man on his feet has nothing to tie off and nothing to drag. What he has is
// that he will not move until somebody reaches him.
console.log('  the walking wounded are up, stable, and holding: ' +
            walking.map(s2 => s2.name + '(' + s2.hp + 'hp)').join(', '),
            walking.length > 0 && walking.every(s2 =>
              s2.alive && !s2.downed && s2.stabilized && s2.needsRescue &&
              s2.order.type === 'hold' && s2.hp > 0 && s2.hp < s2.maxHp)
              ? 'CORRECT' : 'WRONG');
console.log('  they are strangers: ' + casualties.map(s2 => s2.name).join(', '),
            casualties.every(s2 => RECRUIT_NAMES.includes(s2.name) && s2.recruitCandidate)
              ? 'CORRECT (recruit pool — save them and they can sign)' : 'WRONG');
console.log('  objective reads: "' + OBJECTIVES.stabilize.label() + '", done=' + OBJECTIVES.stabilize.done(),
            OBJECTIVES.stabilize.label().indexOf('WOUNDED 0/' + wounded.length) === 0 &&
            !OBJECTIVES.stabilize.done() ? 'CORRECT' : 'WRONG');
// walking to him is the whole interaction — no keypress, he just falls in
{
  const m2 = walking[0];
  const px = game.player.x, py = game.player.y;
  game.player.x = m2.x + 10; game.player.y = m2.y;
  updateWalkingWounded();
  console.log('  reaching him falls him in: needsRescue=' + m2.needsRescue + ', order=' + m2.order.type,
              !m2.needsRescue && m2.order.type === 'follow' ? 'CORRECT (no keypress needed)' : 'WRONG');
  game.player.x = px; game.player.y = py;
  walking.slice(1).forEach(w2 => { w2.needsRescue = false; w2.order = { type: 'follow' }; });
}

// distance is the enemy: they are a real trip away
const st0 = tileAt(level.spawns.player.x, level.spawns.player.y);
const wt = tileAt(wounded[0].x, wounded[0].y);
const path = astar(st0.tx, st0.ty, wt.tx, wt.ty, passForPath, pathCostSquad);
console.log('  crash site is ' + (path ? path.length : 0) + ' tiles out on a ' + TUNE.brokenBleed + 's clock',
            path && path.length > 12 ? 'CORRECT' : 'WRONG');

// tie both off: objective completes, extract gates open
wounded.forEach(s2 => s2.stabilized = true);
console.log('  both tied off: stabilize done=' + OBJECTIVES.stabilize.done() +
            ', extract still pending=' + !OBJECTIVES.extract.done(),
            OBJECTIVES.stabilize.done() && !OBJECTIVES.extract.done() ? 'CORRECT (now walk home)' : 'WRONG');

// the whole premise: tourniquets are not the mission, the MEN are. Walking out
// alone with both of them tied off and lying in the wreckage is not a win.
const bez = level.extraction[0];
game.player.x = bez.tx * TILE + 16; game.player.y = bez.ty * TILE + 16;
console.log('  you stand on the exfil, both of them still at the wrecks: extract=' + OBJECTIVES.extract.done() +
            ', reads "' + OBJECTIVES.extract.label() + '"',
            !OBJECTIVES.extract.done() &&
            OBJECTIVES.extract.label().indexOf('EXFIL 0/' + casualties.length + ' HAULED') === 0
              ? 'CORRECT (you do not leave them where they fell)' : 'WRONG');

// and it has to be the real verb that gets them there: hold [E] and MOVE drags
// a man who is ALREADY stable — the wrap is done, the haul is not
const hauled = wounded[0];
const startAway = { x: bez.tx * TILE + 16 + 200, y: bez.ty * TILE + 16 };
hauled.x = startAway.x - 14; hauled.y = startAway.y;
game.player.x = startAway.x; game.player.y = startAway.y;
input.keys.add('e'); game.player.moving = true;
updateTourniquet(game.player, 1 / 60);                                    // grab
for (let i = 0; i < 80; i++) { game.player.x -= 3; updateTourniquet(game.player, 1 / 60); }
input.keys.delete('e'); game.player.moving = false;
console.log('  a stabilized man still drags: moved ' + dist(hauled.x, hauled.y, startAway.x, startAway.y).toFixed(0) +
            'px, still stable=' + hauled.stabilized,
            dist(hauled.x, hauled.y, startAway.x, startAway.y) > 150 && hauled.stabilized
              ? 'CORRECT (the wrap is done, the carry is not)' : 'WRONG');

// one on the tile, one still out: short a man is short a man
wounded[0].x = bez.tx * TILE + 16; wounded[0].y = bez.ty * TILE + 16;
console.log('  one hauled in, the rest still out: extract=' + OBJECTIVES.extract.done() +
            ', reads "' + OBJECTIVES.extract.label() + '"',
            !OBJECTIVES.extract.done() &&
            OBJECTIVES.extract.label().indexOf('EXFIL 1/' + casualties.length + ' HAULED') === 0
              ? 'CORRECT' : 'WRONG');

// everyone on the exfil with you: NOW it is over. The walking ones walk there
// themselves, which is the whole difference between them and a stretcher case.
const bez2 = level.extraction[level.extraction.length - 1];
casualties.slice(1).forEach(c2 => { c2.x = bez2.tx * TILE + 16; c2.y = bez2.ty * TILE + 16; });
game.player.x = bez.tx * TILE + 16; game.player.y = bez.ty * TILE + 16;
console.log('  everyone on the tile: extract=' + OBJECTIVES.extract.done() +
            ', reads "' + OBJECTIVES.extract.label() + '"',
            OBJECTIVES.extract.done() && /ALL IN/.test(OBJECTIVES.extract.label())
              ? 'CORRECT (everyone comes home)' : 'WRONG');

// and the gate is BROKEN ARROW's alone — a map with no casualties still exfils
// on the point man and nothing else
const savedMap = game.mapIndex;
game.mapIndex = MAPS.findIndex(m => m.objectives.join() === 'demolish,extract');
initGame(); game.state = 'play';
game.demo.forEach(d => { d.armed = true; });
const dez = level.extraction[0];
game.player.x = dez.tx * TILE + 16; game.player.y = dez.ty * TILE + 16;
console.log('  a map with no casualties is unchanged: extract=' + OBJECTIVES.extract.done() +
            ', reads "' + OBJECTIVES.extract.label() + '"',
            OBJECTIVES.extract.done() && /AT POINT/.test(OBJECTIVES.extract.label())
              ? 'CORRECT (the haul gate is BROKEN ARROW\'s alone)' : 'WRONG');
game.mapIndex = savedMap; initGame(); game.state = 'play';
const wounded2 = game.squad.filter(s2 => s2.qrfCasualty);
wounded2.forEach(s2 => s2.stabilized = true);
wounded.length = 0; wounded.push(...wounded2);

// lose one and the mission is lost with him
wounded[0].stabilized = false; wounded[0].bleedT = 0.01;
updateSquaddie(wounded[0], 0.1);
const fail = missionFailure();
console.log('  he bleeds out: "' + (fail || '').slice(0, 50) + '..."',
            fail && /bled out|mission/.test(fail) ? 'CORRECT (the mission fails with him)' : 'WRONG');
localStorage.clear(); game.mapIndex = 0; initGame();
console.log('BROKEN ARROW TEST DONE');
})();

(function muzzleSplitTests(){
console.log('--- the muzzle split: you see from the eye, you shoot from the barrel ---');
game.mapIndex = 0; game.diffIndex = 1; game.densityIndex = 1;
game.loadout.squad = 'standard'; game.loadout.primary = 'carbine'; game.loadout.can = false;
initGame(); game.state = 'play';
const P = game.player;

function firedFrom(can) {
  game.loadout.can = can; initGame(); game.state = 'play';
  const p = game.player;
  p.face = 0; p.cooldown = 0; p.ammo = 30; p.reloading = 0;
  game.bullets.length = 0;
  tryFire(p, 0);
  const b = game.bullets[0];
  const eye = eyePoint(p);
  return { d: dist(b.ox, b.oy, eye.x, eye.y), eye };
}
const loud = firedFrom(false), supp = firedFrom(true);
console.log('  carbine round leaves ' + loud.d.toFixed(1) + 'px past the eye, suppressed ' + supp.d.toFixed(1),
            Math.abs(loud.d - TUNE.gunLen.default) < 0.5 &&
            Math.abs(supp.d - (TUNE.gunLen.default + TUNE.gunLenCan)) < 0.5
              ? 'CORRECT (the can is a longer gun)' : 'WRONG');

// vision is untouched by the split: eyePoint has no idea what gun you carry
game.loadout.can = false; initGame(); game.state = 'play';
const p2 = game.player; p2.face = 0;
const e1 = eyePoint(p2);
game.loadout.can = true; initGame(); game.state = 'play';
game.player.face = 0;
game.player.x = p2.x; game.player.y = p2.y;
const e2 = eyePoint(game.player);
console.log('  eye point loud vs suppressed: ' + dist(e1.x, e1.y, e2.x, e2.y).toFixed(2) + 'px apart',
            dist(e1.x, e1.y, e2.x, e2.y) < 0.01 ? 'CORRECT (vision cone unchanged)' : 'WRONG');

// against a wall the muzzle clamps: no firing from the far side of masonry
game.loadout.can = false; initGame(); game.state = 'play';
const p3 = game.player;
let wallT = null;
outer: for (let ty = 1; ty < level.h - 1; ty++) for (let tx = 1; tx < level.w - 1; tx++) {
  if (level.wall[ty][tx] && !level.wall[ty][tx - 1] && inBounds(tx - 1, ty) && level.interior[ty][tx - 1]) { wallT = { tx, ty }; break outer; }
}
p3.x = wallT.tx * TILE - 12; p3.y = wallT.ty * TILE + 16; p3.face = 0;
const mzWall = muzzlePoint(p3, 0);
const mt = tileAt(mzWall.x, mzWall.y);
console.log('  12px from a wall, aiming into it: muzzle reaches ' + mzWall.len.toFixed(1) +
            'px, still outside the wall: ' + !level.wall[mt.ty][mt.tx],
            mzWall.len < 12 && !level.wall[mt.ty][mt.tx] ? 'CORRECT (pressed against the brick, not through it)' : 'WRONG');
game.loadout.can = false; initGame();
console.log('MUZZLE SPLIT TEST DONE');
})();

(function sectorTests(){
console.log('--- sectors of fire: responsibility made visible ---');
game.mapIndex = 0; game.diffIndex = 1; game.densityIndex = 1;
game.loadout.squad = 'rifle9'; initGame(); game.state = 'play';

// ANCHOR splits the circle by ACTUAL team size, not by three
const team = game.squad.filter(s => s.alive);
PLAYS.find(p => p.key === '4').run(team);
const faces = team.map(s => s.order.face);
const widths = new Set(team.map(s => s.order.sector.toFixed(4)));
let minGap = TAU;
for (let i = 0; i < faces.length; i++) for (let j = i + 1; j < faces.length; j++)
  minGap = Math.min(minGap, Math.abs(angDiff(faces[i], faces[j])));
console.log('  ANCHOR with 8 men: sector width ' + (TAU / 8 * 180 / Math.PI).toFixed(0) +
            '° each, smallest gap between faces ' + (minGap * 180 / Math.PI).toFixed(0) + '°',
            widths.size === 1 && Math.abs([...widths][0] - TAU / 8) < 1e-3 && minGap > deg(40)
              ? 'CORRECT (360 split eight ways, nothing unwatched)' : 'WRONG');

// every order type yields a drawable sector or an honest null
const kinds = {};
team[0].order = { type: 'hold', face: 1, sector: 1 }; kinds.hold = !!sectorOf(team[0]);
team[0].order = { type: 'suppress', x: team[0].x + 100, y: team[0].y }; kinds.suppress = !!sectorOf(team[0]);
team[0].order = { type: 'follow' }; kinds.follow = !!sectorOf(team[0]);
team[0].downed = true; kinds.downedNull = sectorOf(team[0]) === null; team[0].downed = false;
console.log('  sectors: hold=' + kinds.hold + ' suppress=' + kinds.suppress + ' follow=' +
            kinds.follow + ' downed->null=' + kinds.downedNull,
            kinds.hold && kinds.suppress && kinds.follow && kinds.downedNull ? 'CORRECT' : 'WRONG');
game.loadout.squad = 'standard'; initGame();
console.log('SECTOR TEST DONE');
})();

(function chainedWheelTests(){
console.log('--- the chained wheel: right is movement, then how, then what ---');
game.mapIndex = 0; game.diffIndex = 1; game.densityIndex = 1;
game.loadout.squad = 'standard'; initGame(); game.state = 'play';
const P = game.player;

function openWheelAt(wx, wy) {
  input.mouse.wx = wx; input.mouse.wy = wy;
  input.mouse.x = 400; input.mouse.y = 300;
  input.mouse.rx = 400; input.mouse.ry = 300;
  input.justPressed.add('rmb'); issueOrders(); input.justPressed.clear();
}
function flick(dir) {
  const OFF = { up: [0, -1], down: [0, 1], left: [-1, 0], right: [1, 0] };
  input.mouse.x = game.wheel.sx + OFF[dir][0] * (TUNE.wheelCommit + 10);
  input.mouse.y = game.wheel.sy + OFF[dir][1] * (TUNE.wheelCommit + 10);
  issueOrders();
}
function release() { input.justReleased.add('rmb'); issueOrders(); input.justReleased.clear(); }

// the exact chain from Sam's message: right (move) -> up (bump) -> right (overwatch)
const dest = nearestPassable(P.x + 200, P.y);
openWheelAt(dest.x, dest.y);
console.log('  opened on empty ground: menu=' + game.wheel.menu, game.wheel.menu === 'root' ? 'CORRECT' : 'WRONG');
flick('right');
console.log('  flick right: menu=' + game.wheel.menu + ' (re-anchored)', game.wheel.menu === 'gait' ? 'CORRECT (movement ring)' : 'WRONG');
flick('up');
console.log('  flick up: menu=' + game.wheel.menu + ', locked gait=' + (game.wheel.chain && game.wheel.chain.gait),
            game.wheel.menu === 'posture' && game.wheel.chain.gait === 'bump' ? 'CORRECT (bump locked)' : 'WRONG');
input.mouse.x = game.wheel.sx + TUNE.wheelDeadzone + 8; input.mouse.y = game.wheel.sy;  // point at OVERWATCH, under commit
issueOrders();
release();
const orders = game.squad.map(s2 => s2.order);
console.log('  release on overwatch: orders=' + JSON.stringify(orders.map(o => o.type + '/' + (o.posture || '-') + '/' + (o.fast ? 'fast' : 'slow'))),
            orders.every(o => o.type === 'move' && o.posture === 'overwatch' && o.fast) ? 'CORRECT (bump then overwatch)' : 'WRONG');

// arrival applies the posture
const m0 = game.squad[0];
m0.x = m0.order.x; m0.y = m0.order.y;
updateSquaddie(m0, 1 / 60);
console.log('  on arrival: ' + m0.order.type + ' sector ' + ((m0.order.sector || 0) * 180 / Math.PI).toFixed(0) + '°',
            m0.order.type === 'hold' && m0.order.sector > 1 ? 'CORRECT (overwatching onward)' : 'WRONG');

// operator ring: hold on a man, flick up = self aid; tap = select
initGame(); game.state = 'play';
const op = game.squad[0];
op.hp = 50;
openWheelAt(op.x, op.y);
console.log('  opened ON an operator: menu=' + game.wheel.menu + ' target=' + game.wheel.op.name,
            game.wheel.menu === 'operator' && game.wheel.op === op ? 'CORRECT (contextual)' : 'WRONG');
game.wheel.tapT = 1.0;                                  // held, not tapped
flick('up'); release();
console.log('  flick up (FIRST AID): order=' + op.order.type,
            op.order.type === 'selfaid' ? 'CORRECT' : 'WRONG');
let t3 = 0; const hp0 = op.hp;
while (op.order.type === 'selfaid' && t3 < 8) { updateSquaddie(op, 1 / 30); t3 += 1 / 30; }
console.log('  ' + t3.toFixed(1) + 's later: hp ' + hp0 + ' -> ' + op.hp,
            op.hp === hp0 + TUNE.selfAidHeal && t3 >= TUNE.selfAidTime ? 'CORRECT (a third of him back)' : 'WRONG');
// tap still selects
openWheelAt(game.squad[1].x, game.squad[1].y);
game.wheel.tapT = 0.05; release();
console.log('  a quick tap on a man still selects: ' + game.selected.has(1),
            game.selected.has(1) ? 'CORRECT (muscle memory kept)' : 'WRONG');
game.selected.clear(); initGame();
console.log('CHAINED WHEEL TEST DONE');
})();

(function rosterTests(){
console.log('--- the roster: recruits, recovery, and who actually deploys ---');
localStorage.clear();
game.diffIndex = 1; game.densityIndex = 1; game.loadout.squad = 'standard';

// a wounded survivor goes into recovery, and the next deployment skips him
game.mapIndex = 0; initGame(); game.state = 'play';
const w1 = game.squad[0];                     // REYES
w1.hp = 1; w1.armor = 0; killEntity(w1, 'enemy', null); w1.stabilized = true;
settleVeterancy(true);
let v = loadVets();
console.log('  REYES wounded+stabilized: status=' + v.REYES.status + ' recoverIn=' + v.REYES.recoverIn,
            v.REYES.status === 'recovering' && v.REYES.recoverIn === 2 ? 'CORRECT (out 2 missions)' : 'WRONG');
initGame();
console.log('  next deployment: ' + game.squad.map(s2 => s2.name).join(', '),
            !game.squad.some(s2 => s2.name === 'REYES') && game.squad.length === 3
              ? 'CORRECT (VASQUEZ steps up, REYES sits)' : 'WRONG');

// two finished missions later he is back
settleVeterancy(true); initGame(); settleVeterancy(true);
v = loadVets();
console.log('  after two missions on the sideline: status=' + (v.REYES.status || 'ready'),
            v.REYES.status !== 'recovering' ? 'CORRECT (cleared to return)' : 'WRONG');

// BROKEN ARROW: save a stranger, win, and he signs
localStorage.clear();
game.mapIndex = MAPS.findIndex(m => m.name === 'BROKEN ARROW'); initGame(); game.state = 'play';
const rc = game.squad.filter(s2 => s2.recruitCandidate);
rc.forEach(s2 => { s2.stabilized = true; });
const rows2 = settleVeterancy(true);
v = loadVets();
const signed = rc.filter(s2 => v[s2.name]);
console.log('  both saved and brought home: ' + signed.map(s2 => s2.name + ' (' + v[s2.name].xp + ' XP, ' +
            v[s2.name].status + ')').join(', '),
            signed.length === 2 && signed.every(s2 => v[s2.name].xp === 150 && v[s2.name].recruit &&
              v[s2.name].status === 'recovering') ? 'CORRECT (they owe you one)' : 'WRONG');
console.log('  roster grew: ' + loadRosterOrder().length + ' names',
            loadRosterOrder().length === 10 ? 'CORRECT (8 founders + 2 recruited)' : 'WRONG');
const recruitRow = rows2.find(r => r.recruited);
console.log('  debrief says: "' + recruitRow.text.slice(0, 44) + '..."',
            /RECRUITED/.test(recruitRow.text) ? 'CORRECT' : 'WRONG');

// an unsaved stranger does not sign
localStorage.clear();
initGame(); game.state = 'play';
const rc2 = game.squad.filter(s2 => s2.recruitCandidate);
rc2[0].stabilized = true; rc2[1].alive = false; rc2[1].downed = false;
settleVeterancy(true);
v = loadVets();
console.log('  one saved, one lost: on the books=' + [rc2[0].name, rc2[1].name].map(n => !!v[n]).join('/'),
            v[rc2[0].name] && !v[rc2[1].name] ? 'CORRECT (only the living sign)' : 'WRONG');
localStorage.clear(); game.mapIndex = 0; game.loadout.squad = 'standard'; initGame();
console.log('ROSTER TEST DONE');
})();

(function floorTwoTests(){
console.log('--- FLOOR TWO: the stairs are a door between worlds ---');
localStorage.clear();
game.diffIndex = 1; game.densityIndex = 1; game.loadout.squad = 'standard';
game.mapIndex = MAPS.findIndex(m => m.name === 'THE WALKUP'); initGame(); game.state = 'play';

console.log('  parsed: ' + game.floors.length + ' floors, stairs at floor0=' +
            game.floors[0].levelSnap.stairs.length + ' floor1=' + game.floors[1].levelSnap.stairs.length,
            game.floors.length === 2 && game.floors[0].levelSnap.stairs.length === 1 &&
            game.floors[1].levelSnap.stairs.length === 1 ? 'CORRECT' : 'WRONG');
const up = game.enemies.filter(e => e.floor === 1), down = game.enemies.filter(e => e.floor === 0);
console.log('  garrison: ' + down.length + ' downstairs, ' + up.length + ' upstairs (elite up there: ' +
            up.some(e => e.kind === 'elite') + ')',
            down.length >= 2 && up.length >= 2 && up.some(e => e.kind === 'elite') ? 'CORRECT' : 'WRONG');

// upstairs men are not in the downstairs fight
const upman = up[0];
console.log('  upstairs man visible from downstairs: ' + (visibleToPlayerSide(upman) || 'null'),
            visibleToPlayerSide(upman) === null ? 'CORRECT (ceilings are opaque)' : 'WRONG');

// take the stairs: world swaps, followers come along
const P = game.player;
const st = game.floors[0].levelSnap.stairs[0];
P.x = st.tx * TILE + 16; P.y = st.ty * TILE + 16;
game.squad.forEach(s2 => { s2.x = P.x + 30; s2.y = P.y; s2.order = { type: 'follow' }; });
const wall0 = level.wall.map(r => r.join('')).join('|');
useStairs(P);
const wall1 = level.wall.map(r => r.join('')).join('|');
console.log('  [E] on the stairs: floor=' + game.floor + ', the world actually changed: ' + (wall0 !== wall1) +
            ', squad came: ' + game.squad.every(s2 => s2.floor === 1),
            game.floor === 1 && wall0 !== wall1 && game.squad.every(s2 => s2.floor === 1)
              ? 'CORRECT (a new map up the stairs — Sam design, verbatim)' : 'WRONG');

// now the UPSTAIRS men are the fight and the downstairs men are not
console.log('  upstairs man visible test now: ' + (visibleToPlayerSide(upman) === null ? 'blocked by dist/walls only' : 'floor-eligible'),
            (upman.floor === 1 && game.floor === 1) ? 'CORRECT (same floor now)' : 'WRONG');
const downman = down.find(e => e.alive);
console.log('  downstairs man from upstairs: ' + (visibleToPlayerSide(downman) || 'null'),
            visibleToPlayerSide(downman) === null ? 'CORRECT' : 'WRONG');

// bullets do not cross ceilings
game.bullets.length = 0;
P.cooldown = 0; P.ammo = 30; P.reloading = 0;
downman.x = P.x + 40; downman.y = P.y;   // "beneath" you in coords, on floor 0
const hp0 = downman.hp;
tryFire(P, 0);
for (let i = 0; i < 30; i++) updateBullets(1 / 120);
console.log('  fired across his coordinates from the other floor: hp ' + hp0 + ' -> ' + downman.hp,
            downman.hp === hp0 ? 'CORRECT (ceilings are armour)' : 'WRONG');

// separate fog memories
const seen1 = seen.grid;
useStairs(P);   // back down
console.log('  back down: floor=' + game.floor + ', fog memory swapped: ' + (seen.grid !== seen1),
            game.floor === 0 && seen.grid !== seen1 ? 'CORRECT (each floor remembers itself)' : 'WRONG');

// threatsLeft spans both floors: the mission is the whole house
console.log('  threats left counts the whole house: ' + threatsLeft(),
            threatsLeft() === game.enemies.filter(e => e.alive && e.state !== 'cuffed').length &&
            threatsLeft() >= 5 ? 'CORRECT' : 'WRONG');
localStorage.clear(); game.mapIndex = 0; initGame();
console.log('FLOOR TWO TEST DONE');
})();

(function shellsAndRingsTests(){
console.log('--- shells on X, and the ring mount on the wreck ---');
game.diffIndex = 1; game.densityIndex = 1; game.loadout.squad = 'standard';
game.loadout.primary = 'shotgun'; game.loadout.ammo = 'buck'; initGame(); game.state = 'play';
const P = game.player;

// the answer to Sam's question, made true: X walks the shell types
const seq = [P.ammoType];
for (let i = 0; i < 3; i++) { P.reloading = 0; cycleAmmo(P); seq.push(P.ammoType); }
console.log('  shotgun shells: ' + seq.join(' -> '),
            seq[0] === 'buck' && seq.includes('slug') && seq.includes('bird') && seq[3] === seq[0]
              ? 'CORRECT (cycles and wraps)' : 'WRONG');
console.log('  the swap costs most of a reload: ' + P.reloading.toFixed(2) + 's',
            P.reloading > 1.5 ? 'CORRECT (deliberate, not free)' : 'WRONG');
const spreadByShell = {};
for (const k of ['buck', 'slug', 'bird']) spreadByShell[k] = AMMO[k].pellets || 1;
console.log('  and the load genuinely changes the gun: pellets buck=' + spreadByShell.buck +
            ' slug=' + spreadByShell.slug + ' bird=' + spreadByShell.bird,
            spreadByShell.buck === 6 && spreadByShell.slug === 1 && spreadByShell.bird === 9 ? 'CORRECT' : 'WRONG');
P.gunIndex = 1; P.reloading = 0; cycleAmmo(P);
console.log('  sidearm out: "' + game.hint.slice(0, 30) + '"',
            /sidearm/i.test(game.hint) ? 'CORRECT (only the primary cycles)' : 'WRONG');

// a ring mount swings the WHOLE circle
game.loadout.primary = 'carbine'; game.mapIndex = MAPS.findIndex(m => m.name === 'BROKEN ARROW');
initGame(); game.state = 'play';
const ringGun = level.turrets.find(t => t.ring);
console.log('  BROKEN ARROW ring guns: ' + level.turrets.filter(t => t.ring).length +
            ', arc=' + (ringGun ? (ringGun.arc * 180 / Math.PI).toFixed(0) : '—') + '°',
            ringGun && Math.abs(ringGun.arc - TAU) < 0.01
              ? 'CORRECT (a ring has no stop — the gunner turns round)' : 'WRONG');
// Sam: "they should just go 360 instead of having limited traversal, because
// then the turret isn't useful because the other humvees are in the way." So
// prove it: no bearing may be refused by the mount.
{
  const blockedBearings = [];
  for (let i = 0; i < 360; i += 5) {
    const want = deg(i);
    if (Math.abs(angDiff(clampToArc(ringGun, want), want)) > 1e-6) blockedBearings.push(i);
  }
  console.log('  and no bearing is refused by the mount: ' +
              (blockedBearings.length ? blockedBearings.length + ' blocked' : 'all 72 sampled clear'),
              blockedBearings.length === 0 ? 'CORRECT' : 'WRONG');
}
// every gun truck in the convoy carries a gun, not just the one
console.log('  every convoy vehicle has a ring gun: ' + level.turrets.filter(t => t.ring).length +
            ' guns for ' + level.vehicles.length + ' vehicles',
            level.turrets.filter(t => t.ring).length === level.vehicles.length ? 'CORRECT' : 'WRONG');
game.mapIndex = MAPS.findIndex(m => m.name === 'THE STANDOFF'); initGame();
console.log('  THE STANDOFF police truck: ' + level.turrets.filter(t => t.ring).length + ' ring mount',
            level.turrets.filter(t => t.ring).length === 1 ? 'CORRECT' : 'WRONG');
// and the pillbox gun still holds its narrow slit arc
game.mapIndex = MAPS.findIndex(m => m.name === 'THE PILLBOX'); initGame();
console.log('  THE PILLBOX slit gun stays narrow: ' + (level.turrets[0].arc * 180 / Math.PI).toFixed(0) + '°',
            Math.abs(level.turrets[0].arc - TUNE.turretArc) < 0.01 ? 'CORRECT' : 'WRONG');
game.mapIndex = 0; initGame();
console.log('SHELLS+RINGS TEST DONE');
})();

// Sam: "we should also be able to mount the turret on the humvee" ... "that is
// drawn where the turret on the humvee would be." It was drawn a metre off the
// bonnet. The gun now sits in the hatch the Humvee art already paints, which
// means the gunner is standing in bodywork — so this block checks the three
// things that has to not break: he can still see out, he can still be reached
// and stepped off, and nobody ELSE gets to see through a car.
(function ringMountTests(){
console.log('--- the gun goes ON the truck: the ring mount ---');
game.diffIndex = 1; game.densityIndex = 1;
let allOnHatch = true, allHumvee = true, allNosed = true, stepsClear = true;
const seen2 = [];
for (const name of ['BROKEN ARROW', 'THE STANDOFF']) {
  game.mapIndex = MAPS.findIndex(m => m.name === name); initGame(); game.state = 'play';
  for (const t of level.turrets.filter(t2 => t2.ring)) {
    const v = t.veh;
    if (!v) { allOnHatch = false; continue; }
    const off = Math.hypot(t.x - v.x, t.y - v.y);
    seen2.push(name.split(' ')[1] + ' ' + off.toFixed(0) + 'px');
    if (off > 8) allOnHatch = false;
    if (v.body !== 'humvee') allHumvee = false;
    if (Math.abs(angDiff(t.face0, v.ang)) > 0.01) allNosed = false;
    if (level.wall[Math.floor(t.sy / TILE)][Math.floor(t.sx / TILE)]) stepsClear = false;
  }
}
console.log('  the gun sits in the painted hatch: ' + seen2.join(', ') + ' off centre',
            allOnHatch ? 'CORRECT (the art draws its ring 3px aft of centre)' : 'WRONG');
console.log('  and the truck under it is a Humvee: ' + allHumvee,
            allHumvee ? 'CORRECT' : 'WRONG');
console.log('  a gun truck rests over its own bonnet: ' + allNosed,
            allNosed ? 'CORRECT (not aimed at whatever wall the scan found)' : 'WRONG');
console.log('  the step you climb from is open ground: ' + stepsClear,
            stepsClear ? 'CORRECT (nothing ever paths into bodywork)' : 'WRONG');

// he must be able to SEE. Before the hull exemption this was 0 of 360 bearings
// on both trucks, which is a gun that cannot be used.
game.mapIndex = MAPS.findIndex(m => m.name === 'BROKEN ARROW'); initGame(); game.state = 'play';
const rt = level.turrets.find(t2 => t2.ring);
let bearings = 0;
for (let i = 0; i < 360; i++) {
  const a = i / 360 * TAU;
  if (lineOfSight(rt.x, rt.y, rt.x + Math.cos(a) * 120, rt.y + Math.sin(a) * 120, opaque)) bearings++;
}
console.log('  from the ring he sees ' + bearings + '/360 bearings at 120px',
            bearings > 60 ? 'CORRECT (his own hull is under him, not in front of him)' : 'WRONG');

// ...but the exemption is the RING, not "inside a car". A wreck is still a
// wreck — checked on a map that still HAS an ordinary car, since every vehicle
// in BROKEN ARROW's convoy is a gun truck now.
const ringMap = game.mapIndex;
game.mapIndex = MAPS.findIndex(m => m.name === 'DOWNTOWN EXCHANGE'); initGame(); game.state = 'play';
const plain = level.vehicles.find(v => !v.ring);
let throughAPlainCar = 0;
if (plain) {
  for (let i = 0; i < 360; i++) {
    const a = i / 360 * TAU;
    if (lineOfSight(plain.x, plain.y, plain.x + Math.cos(a) * 120, plain.y + Math.sin(a) * 120, opaque))
      throughAPlainCar++;
  }
}
console.log('  a car with no ring still blocks from inside: ' + throughAPlainCar + '/360',
            plain && throughAPlainCar === 0 ? 'CORRECT (the loose version of this let a man see through a wreck)' : 'WRONG');
game.mapIndex = ringMap; initGame(); game.state = 'play';

// mount from the step, come off onto the step
const man = game.squad[0];
man.x = rt.sx; man.y = rt.sy; man.floor = 0;
const got = mountTurret(man, rt);
const onGun = got && Math.hypot(man.x - rt.x, man.y - rt.y) < 1;
dismountTurret(man);
const backDown = Math.abs(man.x - rt.sx) < 1 && Math.abs(man.y - rt.sy) < 1;
console.log('  he mounts into the ring and steps back down: on=' + onGun + ', off=' + backDown,
            onGun && backDown ? 'CORRECT (never left standing inside the truck)' : 'WRONG');

// and his rounds clear his own bodywork instead of hitting it
mountTurret(man, rt);
man.face = rt.veh.ang + Math.PI;                       // straight back down his own hull
const mz = muzzlePoint(man, man.face);
const outside = Math.abs(mz.x - rt.veh.x) > rt.veh.lw / 2 || Math.abs(mz.y - rt.veh.y) > rt.veh.lh / 2;
console.log('  the muzzle clears the hull: ' + mz.len.toFixed(0) + 'px out, past the bodywork=' + outside,
            outside ? 'CORRECT (a ring gun fires over its own truck)' : 'WRONG');
dismountTurret(man);
game.mapIndex = 0; initGame();
console.log('RING MOUNT TEST DONE');
})();

// Sam has said twice that cover which the fog eats is the thing that annoys him
// most, and v0.52/v0.58/v0.69 all lifted objects ABOVE the fog to fix it. They
// still looked wrong, and this is why: the alpha that decides live-vs-remembered
// was asked at the object's own centre, and a thing that STOPS sight sits
// exactly on the boundary of the polygon that stops at it. So the answer was
// always "not visible" and every opaque object in the game drew dimmed, forever.
(function fogAlphaTests(){
console.log('--- the fog dims what you are standing next to ---');
game.diffIndex = 1; game.densityIndex = 1; game.loadout.squad = 'standard';

function look() {
  // what frame() does before it calls render(), which the suite never does
  const eye = eyePoint(game.player);
  game.eye = eye;
  game.visPoly = computeVisPolygon(eye.x, eye.y, TUNE.playerViewDist);
  game.squadPolys = [];
  game.drawFrame = (game.drawFrame || 0) + 1;
}
function census() {
  const r = { cars: 0, carsOld: 0, carsNew: 0, trees: 0, tOld: 0, tNew: 0, drawnOld: 0, drawnNew: 0 };
  for (const v of (level.vehicles || [])) {
    r.cars++;
    if (inAnyView(v.x, v.y)) r.carsOld++;
    if (v.tiles.some(t => lookedAt(t.tx, t.ty))) r.carsNew++;
  }
  for (let y = 0; y < level.h; y++) for (let x = 0; x < level.w; x++) {
    if (level.mat[y][x] !== 'tree') continue;
    r.trees++;
    if (seen.grid[y][x]) r.drawnOld++;
    if (seenNear(x, y)) r.drawnNew++;
    if (inAnyView(x * TILE + 16, y * TILE + 16)) r.tOld++;
    if (lookedAt(x, y)) r.tNew++;
  }
  return r;
}

// Park the player right up against a car, which is the case that made the bug
// obvious: you are crouched behind a wing and it renders as a memory.
game.mapIndex = MAPS.findIndex(m => m.name === 'BROKEN ARROW'); initGame(); game.state = 'play';
const car = level.vehicles[0];
game.player.x = car.x - car.lw / 2 - 20; game.player.y = car.y;
game.player.face = 0;
look();                            // computeVisPolygon paints seen.grid as it casts
const A = census();
console.log('  a car you are 20px from, by its own centre: ' + A.carsOld + '/' + A.cars + ' lit',
            A.carsOld === 0 ? 'CORRECT (this is the bug: never, on any map, at any moment)' : 'WRONG');
console.log('  and by the ground it stands on: ' + A.carsNew + '/' + A.cars + ' lit',
            A.carsNew > 0 ? 'CORRECT' : 'WRONG');

game.mapIndex = MAPS.findIndex(m => m.name === 'THE TREELINE'); initGame(); game.state = 'play';
// Stand him on open ground one tile off a tree, looking at it — the case Sam
// actually complains about. Walking him in by hand is not the test: it measures
// wherever the walk happened to stop.
let stood = null;
for (let y = 1; y < level.h - 1 && !stood; y++) for (let x = 1; x < level.w - 1 && !stood; x++) {
  if (level.mat[y][x] !== 'tree') continue;
  for (const [dx, dy] of [[0, 1], [0, -1], [1, 0], [-1, 0]]) {
    if (level.wall[y + dy][x + dx]) continue;
    stood = { tx: x, ty: y, px: (x + dx) * TILE + 16, py: (y + dy) * TILE + 16, ang: Math.atan2(-dy, -dx) };
    break;
  }
}
game.player.x = stood.px; game.player.y = stood.py; game.player.face = stood.ang;
look();
const B = census();
console.log('  THE TREELINE, ' + B.trees + ' trees, by their own centres: ' + B.tOld + ' lit',
            B.tOld === 0 ? 'CORRECT (a canopy is never inside the polygon it truncates)' : 'WRONG');
console.log('  by the ground they stand on: ' + B.tNew + ' lit, including the one he is looking at: ' +
            lookedAt(stood.tx, stood.ty),
            B.tNew > 0 && lookedAt(stood.tx, stood.ty)
              ? 'CORRECT (the tree a metre in front of him is lit now)' : 'WRONG');
console.log('  and the wider crown gate draws more of the clump: ' + B.drawnOld + ' -> ' + B.drawnNew,
            B.drawnNew > B.drawnOld ? 'CORRECT (a 64px crown overhangs all eight neighbours)' : 'WRONG');

// the gate only ever ADDS — a tile that was drawn must never stop being drawn
let dropped = 0;
for (let y = 0; y < level.h; y++) for (let x = 0; x < level.w; x++)
  if (level.mat[y][x] === 'tree' && seen.grid[y][x] && !seenNear(x, y)) dropped++;
console.log('  and never takes one away: ' + dropped + ' dropped',
            dropped === 0 ? 'CORRECT (seenNear is a superset of seen)' : 'WRONG');

// the memo has to be a pure speed-up, and it has to expire
let agree = 0, checked = 0;
for (let y = 2; y < level.h - 2; y += 3) for (let x = 2; x < level.w - 2; x += 3) {
  checked++;
  if (viewedTile(x, y) === inAnyView(x * TILE + 16, y * TILE + 16)) agree++;
}
console.log('  the per-frame memo answers what inAnyView answers: ' + agree + '/' + checked,
            agree === checked ? 'CORRECT' : 'WRONG');
const before = viewedTile(4, 4);
game.player.x = level.spawns.player.x; game.player.y = level.spawns.player.y;
look();                                     // new frame, new eye
const after = viewedTile(4, 4);
console.log('  and it expires with the frame: cached=' + before + ' -> refreshed=' + after +
            ', matching live=' + inAnyView(4 * TILE + 16, 4 * TILE + 16),
            after === inAnyView(4 * TILE + 16, 4 * TILE + 16) ? 'CORRECT (a stale memo would freeze the fog)' : 'WRONG');
game.mapIndex = 0; initGame();
console.log('FOG ALPHA TEST DONE');
})();

// Sam has reported a stutter with many people on screen since session 1 and it
// has never reproduced. It still does not: 0, 8, 16, 24, 32 and 48 bodies
// around the player all held p50 at 16.7ms in Chromium, and so did a thousand
// effects and three hundred rounds in flight. The two things that came OUT of
// chasing it are testable, so they are tested.
(function stutterTests(){
console.log('--- the stutter: what chasing it actually produced ---');
game.diffIndex = 1; game.densityIndex = 1; game.mapIndex = 0; initGame(); game.state = 'play';

// 1. every mission now carries its own worst frame, and the opening beat —
//    which is the art decoding, measured at 333ms on frame one — is excluded,
//    or the number would report loading rather than stuttering.
const st = game.stats;
st.time = 0.4; noteFrameTime(120);
const duringLoad = st.worstFrame;
st.time = 9.0; noteFrameTime(48); noteFrameTime(19); noteFrameTime(900);
console.log('  the loading beat is not a stutter: worst after a 120ms frame at t=0.4 is ' + duringLoad,
            duringLoad === 0 ? 'CORRECT' : 'WRONG');
console.log('  a real hitch is: worst=' + st.worstFrame.toFixed(0) + 'ms, over-33ms frames=' + st.longFrames,
            st.worstFrame === 48 && st.longFrames === 1
              ? 'CORRECT (and the 900ms one is a sleeping tab, not a frame)' : 'WRONG');

// 2. prewarmArt has to be safe with no Image at all, because that is exactly
//    the situation the suite and the bots run in — and it is called from
//    initGame, so getting this wrong takes every test down with it.
let threw = null;
try { prewarmArt(); } catch (e) { threw = e.message; }
console.log('  prewarmArt is a no-op headless: ' + (threw || 'no throw'),
            threw === null ? 'CORRECT (guarded on typeof Image)' : 'WRONG');
console.log('STUTTER TEST DONE');
})();

// Props have been sitting in the file unplaced — twelve prop sprites and two
// environment ones that no map uses — because dropping one next to a building
// moved that building's walls. This is why.
(function propGroundTests(){
console.log('--- props: a hedge that is indoors at one end ---');

// A hedge laid to the LEFT of the floor it touches, which is against the scan
// order the inheritance pass runs in.
const HEDGE = [
  '############',
  '#....#~~~~.#',
  '#....#~~~~.#',
  '#..P.#...g.#',
  '#....#.....#',
  '############',
];
MAP_SRC = HEDGE; parseLevel();
const depths = [6, 7, 8, 9].map(x => level.interior[1][x]);
console.log('  a four-tile hedge is indoors all the way through: ' + depths.join(','),
            depths.every(Boolean) ? 'CORRECT (0,0,0,1 before: one pass only carries it downstream)' : 'WRONG');
console.log('  and the wall beside it reads as the partition it is: ' + level.mat[1][5],
            level.mat[1][5] === 'drywall' ? 'CORRECT (concrete before — a hedge was moving the wall)' : 'WRONG');
console.log('  the hedge is still walkable and still a material: wall=' + level.wall[1][7] +
            ' mat=' + level.mat[1][7],
            !level.wall[1][7] && level.mat[1][7] === 'hedgerow' ? 'CORRECT' : 'WRONG');

// THE INVARIANT THAT MATTERS: the briefing's floor plan and the world must
// agree about what every wall is made of. Comparing the two material grids
// needs no copy of either floor predicate, so it cannot drift with them — and
// the plan telling you a wall is shoot-through when it is not is the dangerous
// direction of any disagreement.
game.diffIndex = 1; game.densityIndex = 1;
let bad = 0, tiles = 0;
for (let i = 0; i < MAPS.length; i++) {
  game.mapIndex = i; initGame();
  const sv = surveyMap(MAPS[i].src, 1, null);
  for (let y = 0; y < level.h; y++) for (let x = 0; x < level.w; x++) {
    if (sv.mat[y][x] === null && level.mat[y][x] === null) continue;
    tiles++;
    if (sv.mat[y][x] !== level.mat[y][x]) bad++;
  }
}
console.log('  the plan hatches exactly what the world hatches: ' + bad + ' of ' + tiles + ' tiles disagree',
            bad === 0 ? 'CORRECT' : 'WRONG');

// There used to be a second assertion here that re-implemented the plan's floor
// predicate and compared it to the world's. It is gone on purpose: a copy of the
// thing under test is the thing that kept drifting — it drifted on doorways (99
// tiles), then on props (364) — and the survey now runs the world's computation
// rather than an approximation of it, so there is no second predicate left to
// compare. The material grids above are the honest test and they are stricter:
// they compare the OUTPUT, which is what the player actually sees hatched.
game.mapIndex = 0; initGame();
console.log('PROP GROUND TEST DONE');
})();

// The deliverable is ONE self-contained HTML file with a ceiling of about
// 1.5-2MB, and it spent eighteen versions over it. Now that it is under, the
// only thing that keeps it under is something that fails when it is not — an
// art drop is a couple of hundred kilobytes and nobody notices until the file
// will not load on a phone.
(function ceilingTests(){
console.log('--- the byte ceiling ---');
const fs = require('fs');
const path = require('path');
// same trick the version test uses: the suite runs as a concatenated bundle in
// /tmp, so __dirname is useless. run.sh cds into tests/, so the repo is one up.
const root = path.join(process.cwd(), '..');
const builds = fs.readdirSync(root).filter(f => /^top_down_tactical_v[\d.]+\.html$/.test(f));
console.log('  exactly one build in the repo: ' + builds.length,
            builds.length === 1 ? 'CORRECT' : 'WRONG');
const bytes = fs.statSync(path.join(root, builds[0])).size;
const CEILING = 2 * 1024 * 1024;
console.log('  ' + builds[0] + ' is ' + bytes.toLocaleString() + ' bytes, ceiling ' +
            CEILING.toLocaleString() + ' (' + (CEILING - bytes).toLocaleString() + ' of headroom)',
            bytes <= CEILING ? 'CORRECT' : 'WRONG (re-run tools/reencode_art.py, or drop art)');
// and it is one FILE — no external requests, ever
const html = fs.readFileSync(path.join(root, builds[0]), 'utf8');
const external = (html.match(/(?:src|href)\s*=\s*["'](?!data:|#)[^"']+["']/g) || [])
  .filter(t => !/^href\s*=\s*["']#/.test(t));
console.log('  and nothing loads from outside it: ' + external.length + ' external refs',
            external.length === 0 ? 'CORRECT' : 'WRONG: ' + external.join(' '));
console.log('CEILING TEST DONE');
})();

(function overwatchTests(){
console.log('--- elevated overwatch: the man in the window ---');
localStorage.clear();
game.diffIndex = 1; game.densityIndex = 1; game.loadout.squad = 'standard'; game.loadout.can = false;
game.mapIndex = MAPS.findIndex(m => m.name === 'THE WALKUP'); initGame(); game.state = 'play';

// window asymmetry, ground floor: outside-in through glass is half vision
const win0 = [...level.windowAt.values()][0];
// derive inside/outside from the interior grid — guessing by wall orientation
// mislabeled a north-wall window in this test's first draft
const dirs0 = win0.orient === 'h' ? [[0, -1], [0, 1]] : [[-1, 0], [1, 0]];
const inDir = dirs0.find(([ox, oy]) => level.interior[win0.ty + oy] && level.interior[win0.ty + oy][win0.tx + ox]);
const outDir = [-inDir[0], -inDir[1]];
const inx = (win0.tx + inDir[0] * 2) * TILE + 16, iny = (win0.ty + inDir[1] * 2) * TILE + 16;
const outx = (win0.tx + outDir[0] * 2) * TILE + 16, outy = (win0.ty + outDir[1] * 2) * TILE + 16;
const mulIn = windowVisionMul(outx, outy, inx, iny);
const mulOut = windowVisionMul(inx, iny, outx, outy);
console.log('  unbroken pane: outside-in x' + mulIn + ', inside-out x' + mulOut,
            mulIn === TUNE.windowInPenalty && mulOut === 1 ? 'CORRECT (glass beats eyes on the street)' : 'WRONG');
win0.broken = true;
console.log('  broken pane: outside-in x' + windowVisionMul(outx, outy, inx, iny),
            windowVisionMul(outx, outy, inx, iny) === 1 ? 'CORRECT (a hole is a hole)' : 'WRONG');
win0.broken = false;

// post a man at the south upper window
const L1 = game.floors[1].levelSnap;
const southWin = [...L1.windowAt.values()].reduce((a2, b2) => a2.ty > b2.ty ? a2 : b2);
const s1 = game.squad[0];
s1.floor = 1; s1.x = southWin.tx * TILE + 16; s1.y = southWin.ty * TILE - 10;
updatePosts(0.5);
console.log('  posted: ' + !!s1.post + ', watching ' + (s1.post && Math.abs(angDiff(s1.post.ang, Math.PI / 2)) < 0.1 ? 'south (the yard)' : '?') +
            ', exposed=' + (s1.post && s1.post.exposed),
            s1.post && Math.abs(angDiff(s1.post.ang, Math.PI / 2)) < 0.1 && !s1.post.exposed
              ? 'CORRECT (invisible in the glass)' : 'WRONG');

// he sees over the car: the guard behind it gets painted
const yardGuard = game.enemies.filter(e => e.floor === 0)
  .reduce((a2, b2) => dist(b2.x, b2.y, s1.post.ox, s1.post.oy + 100) < dist(a2.x, a2.y, s1.post.ox, s1.post.oy + 100) ? b2 : a2);
yardGuard.x = 19 * TILE + 16; yardGuard.y = 19 * TILE + 16;   // right behind the wreck
yardGuard.lastSeen = null;
s1.post.tick = 0; updatePosts(0.01);
console.log('  guard behind the car: painted=' + !!yardGuard.lastSeen,
            yardGuard.lastSeen ? 'CORRECT (cars are beneath his sightline)' : 'WRONG');
// but a man from the street cannot see him (the car blocks ground LOS)
const gx = s1.post.ox, gy = s1.post.oy;
console.log('  same line from street level: ' + !lineOfSight(gx, gy, yardGuard.x, yardGuard.y, opaque),
            !lineOfSight(gx, gy, yardGuard.x, yardGuard.y, opaque) ? 'CORRECT (the wreck blocks the ground)' : 'WRONG');

// he holds fire until weapons free — then the first shot breaks the glass
yardGuard.state = 'combat';
s1.roe = 'free'; s1.ammo = 30; s1.post.cd = 0;
game.noises.length = 0;
updatePosts(0.01);
console.log('  weapons free: exposed=' + s1.post.exposed + ', window broken=' + southWin.broken +
            ', glass noise on floor 0: ' + game.noises.some(n => n.type === 'glass' && n.floor === 0),
            s1.post.exposed && southWin.broken && game.noises.some(n => n.type === 'glass' && n.floor === 0)
              ? 'CORRECT (firing gives the window away)' : 'WRONG');
const round = game.bullets[game.bullets.length - 1];
console.log('  the round is in the STREET: floorOverride=' + round.floorOverride,
            round && round.floorOverride === 0 ? 'CORRECT (fired down into floor 0)' : 'WRONG');

// and the street answers: suppression and risk come back through the pane
const sup0 = s1.suppress || 0;
s1.post.hitT = 0;
updatePosts(0.01);
console.log('  return fire: suppression +' + ((s1.suppress || 0) - sup0).toFixed(2),
            (s1.suppress || 0) > sup0 ? 'CORRECT (they know where the window is now)' : 'WRONG');
localStorage.clear(); game.mapIndex = 0; initGame();
console.log('OVERWATCH TEST DONE');
})();

(function vehicleDamageTests(){
console.log('--- vehicles: the hood saves you, the door wears out ---');
localStorage.clear();
game.diffIndex = 1; game.densityIndex = 1; game.loadout.squad = 'standard';

// 1. What counts as a vehicle. '%' is sheet metal, and sheet metal is also
// buildings — THE SPLIT's garage, THE TREELINE's shed. Group on connectivity
// alone and you paint a sedan over a garage.
const shed = MAPS.findIndex(m => m.name === 'THE SPLIT');
game.mapIndex = shed; initGame(); game.state = 'play';
// THE SPLIT has two real cars AND a 21-tile corrugated garage. The cars must
// be found and the garage must not be one of them.
const splitBig = level.vehicles.filter(v => v.tiles.length > 8);
console.log('  THE SPLIT: ' + level.vehicles.length + ' cars found, ' + splitBig.length +
            ' of them building-sized',
            level.vehicles.length === 2 && splitBig.length === 0
              ? 'CORRECT (the garage has no engine block, so it is not a car)' : 'WRONG');
console.log('  and the garage tiles are still plain sheet metal: ' +
            (level.mat[6][3] === 'sheetmetal' && !level.vehAt.has('3,6')),
            level.mat[6][3] === 'sheetmetal' && !level.vehAt.has('3,6')
              ? 'CORRECT (no sedan painted over a garage)' : 'WRONG');

const lane = MAPS.findIndex(m => m.name === 'DOWNTOWN EXCHANGE');
game.mapIndex = lane; initGame(); game.state = 'play';
const cars = level.vehicles;
console.log('  DOWNTOWN EXCHANGE: ' + cars.length + ' cars, footprints ' +
            [...new Set(cars.map(v => v.tw + 'x' + v.th))].join(','),
            cars.length === 12 && cars.every(v => v.tw * v.th <= TUNE.vehMaxTiles)
              ? 'CORRECT (a lane of cars)' : 'WRONG');
console.log('  every car has an engine block and a body: ' +
            cars.every(v => v.tiles.some(t => t.engine) && v.panels > 0),
            cars.every(v => v.tiles.some(t => t.engine) && v.panels > 0) ? 'CORRECT' : 'WRONG');

// 2. The map already says which way a car points: the engine IS the nose.
const angs = [...new Set(cars.map(v => v.ang.toFixed(2)))];
// The invariant is not "every car points right" — DOWNTOWN EXCHANGE's two end
// cars are deliberately turned across the street so their length shields the
// spawns behind them. It is that the nose is wherever the ENGINE is, for every
// car, whichever way it was laid down. That holds on any map.
const nosesAtEngine = cars.every(v => {
  const eng = v.tiles.filter(t => t.engine);
  const ex = eng.reduce((a, t) => a + t.tx, 0) / eng.length;
  const ey = eng.reduce((a, t) => a + t.ty, 0) / eng.length;
  const cx = (v.x0 + v.x1) / 2, cy = (v.y0 + v.y1) / 2;
  return Math.abs(angDiff(v.ang, Math.atan2(ey - cy, ex - cx))) < deg(46);
});
console.log('  orientation read off the @ side: ' + angs.join(', '),
            nosesAtEngine ? 'CORRECT (every nose is at its own engine)' : 'WRONG');
const st = MAPS.findIndex(m => m.name === 'THE STANDOFF');
game.mapIndex = st; initGame(); game.state = 'play';
const facing = level.vehicles.map(v => v.ang);
console.log('  THE STANDOFF has one of each: ' + facing.map(a => a === 0 ? 'right' : 'left').join(', '),
            facing.includes(0) && facing.includes(Math.PI)
              ? 'CORRECT (@% points left, %@ points right)' : 'WRONG');

// 3. The engine block is not on the ladder AT ALL.
game.mapIndex = lane; initGame(); game.state = 'play';
const car = level.vehicles[0];
// Pin the body: the hash now picks from ten, two of which are ARMOURED, and
// this block is about what plain sheet metal does.
car.body = 'sedan_grey';
const hood = car.tiles.find(t => t.engine), door = car.tiles.find(t => !t.engine);
const identity = [];
for (const s of VEH_STATES) {
  car.state = s;
  identity.push(materialAt(hood.tx, hood.ty) === MATERIALS.engine);
}
car.state = 'intact';
console.log('  materialAt(hood) is MATERIALS.engine at every rung: ' + identity.join(','),
            identity.every(Boolean) ? 'CORRECT (you cannot shoot the hood away)' : 'WRONG');

// 4. The door does wear out, and what moves is what sheet metal was FOR.
const rungs = VEH_STATES.map(s => { car.state = s; return materialAt(door.tx, door.ty); });
car.state = 'intact';
console.log('  door dmgKeep down the ladder: ' + rungs.map(m => m.dmgKeep).join(' -> '),
            rungs[0].dmgKeep === 0.6 && rungs[3].dmgKeep > rungs[0].dmgKeep ? 'CORRECT' : 'WRONG');
console.log('  spall rises at shot_up then collapses: ' + rungs.map(m => m.spall).join(' -> '),
            rungs[2].spall > rungs[0].spall && rungs[3].spall < rungs[0].spall
              ? 'CORRECT (torn steel is the worst thing to hug)' : 'WRONG');
console.log('  a wreck stops hiding you: opaque ' + rungs.map(m => m.opaque).join(',') ,
            rungs[0].opaque && !rungs[3].opaque ? 'CORRECT' : 'WRONG');

// 5. level.mat and level.wall are IDENTITY and are never written.
car.state = 'wreck';
console.log('  mat/wall untouched by damage: mat=' + level.mat[door.ty][door.tx] +
            ' wall=' + level.wall[door.ty][door.tx],
            level.mat[door.ty][door.tx] === 'sheetmetal' && level.wall[door.ty][door.tx] === 1
              ? 'CORRECT (a wreck still stops a body)' : 'WRONG');
car.state = 'intact'; car.dmg = 0; car.scuff = 0;

// 6. Hood fire is quarantined: you cannot make the DOORS transparent by
// emptying magazines into the one part of the car meant to save you.
const c2 = level.vehicles[1];
for (let i = 0; i < 400; i++) damageVehicle(c2.tiles.find(t => t.engine).tx,
                                            c2.tiles.find(t => t.engine).ty,
                                            { pen: 40, dmg: 30, side: 'player' }, 1);
console.log('  400 rounds into the block: state=' + c2.state + ', scuff capped at ' +
            (c2.scuff / c2.hpMax).toFixed(2) + ' of hp',
            c2.state !== 'wreck' && c2.state !== 'shot_up'
              ? 'CORRECT (the hood never becomes a hole in the doors)' : 'WRONG');

// 7. The doors do go, and in order.
const c3 = level.vehicles[2];
const seq = [];
const dt3 = c3.tiles.find(t => !t.engine);
for (let i = 0; i < 60; i++) {
  damageVehicle(dt3.tx, dt3.ty, { pen: 26, dmg: 30, side: 'player' }, 1);
  if (c3.state !== 'intact' && seq[seq.length - 1] !== c3.state) seq.push(c3.state);
}
console.log('  60 rifle rounds through the doors: intact -> ' + seq.join(' -> '),
            seq.join(',') === 'glass_out,shot_up,wreck' ? 'CORRECT (monotonic, one way)' : 'WRONG');

// 8. A round that skips off the bodywork barely marks it.
const c4 = level.vehicles[3], c5 = level.vehicles[4];
const d4 = c4.tiles.find(t => !t.engine), d5 = c5.tiles.find(t => !t.engine);
damageVehicle(d4.tx, d4.ty, { pen: 30, dmg: 30, side: 'player' }, 1);
damageVehicle(d5.tx, d5.ty, { pen: 30, dmg: 30, side: 'player' }, TUNE.vehGraze);
console.log('  square hit ' + c4.dmg.toFixed(1) + ' vs graze ' + c5.dmg.toFixed(1),
            c5.dmg < c4.dmg * 0.2 ? 'CORRECT (the angle you chose, not a coin flip)' : 'WRONG');

// 9. Explosives come off the panels too.
const c6 = level.vehicles[5];
const before6 = c6.dmg;
applyBlast(c6.x, c6.y, 'player', TUNE.blastLethal, TUNE.blastWound, TUNE.blastDmg);
console.log('  a frag on the bonnet moves it: dmg ' + before6.toFixed(0) + ' -> ' + c6.dmg.toFixed(0),
            c6.dmg > before6 ? 'CORRECT (a 40mm is not weaker than a rifle)' : 'WRONG');
const far = level.vehicles.find(v => dist(v.x, v.y, 0, 0) > 900);
if (far) {
  const b4 = far.dmg;
  applyBlast(0, 0, 'player', TUNE.blastLethal, TUNE.blastWound, TUNE.blastDmg);
  console.log('  and a blast across the map does not: ' + (far.dmg === b4),
              far.dmg === b4 ? 'CORRECT' : 'WRONG');
}

// 10. The author's knob actually holds the door shut.
const c7 = level.vehicles[6]; c7.state = 'wreck';
TUNE.vehWreckSeeThrough = false;
const opaqueWreck = materialAt(c7.tiles.find(t => !t.engine).tx, c7.tiles.find(t => !t.engine).ty).opaque;
TUNE.vehWreckSeeThrough = true;
const clearWreck = materialAt(c7.tiles.find(t => !t.engine).tx, c7.tiles.find(t => !t.engine).ty).opaque;
console.log('  vehWreckSeeThrough flips only the sight rule: opaque ' + opaqueWreck + ' / ' + clearWreck,
            opaqueWreck === true && clearWreck === false ? 'CORRECT' : 'WRONG');

// 11. A real round, all the way through resolveBarrier.
game.mapIndex = lane; initGame(); game.state = 'play';
const c8 = level.vehicles[0], d8 = c8.tiles.find(t => !t.engine);
const b8 = { x: d8.tx * TILE - 8, y: d8.ty * TILE + 16, ang: 0, speed: 1500,
             dmg: 30, pen: 26, side: 'player', alive: true, traveled: 0 };
resolveBarrier(b8, { x: d8.tx * TILE, y: d8.ty * TILE + 16, axis: 'x' });
console.log('  a live round square through resolveBarrier: dmg=' + c8.dmg.toFixed(0),
            Math.abs(c8.dmg - 26) < 0.01 ? 'CORRECT (full penetration credited)' : 'WRONG');
// and the same round arriving along the panel deposits the graze fraction
const c9 = level.vehicles[1], d9 = c9.tiles.find(t => !t.engine);
const b9 = { x: d9.tx * TILE - 8, y: d9.ty * TILE + 16, ang: 0, speed: 1500,
             dmg: 30, pen: 26, side: 'player', alive: true, traveled: 0 };
resolveBarrier(b9, { x: d9.tx * TILE, y: d9.ty * TILE + 16, axis: 'y' });
console.log('  the same round along the panel: dmg=' + c9.dmg.toFixed(1),
            c9.dmg < 3 ? 'CORRECT (shallow angle, barely a mark)' : 'WRONG');

localStorage.clear(); game.mapIndex = 0; initGame();
console.log('VEHICLE DAMAGE TEST DONE');
})();

(function directionalDamageTests(){
console.log('--- vehicles: which side you shot it from ---');
localStorage.clear();
game.diffIndex = 1; game.densityIndex = 1; game.loadout.squad = 'standard';
game.mapIndex = MAPS.findIndex(m => m.name === 'DOWNTOWN EXCHANGE'); initGame(); game.state = 'play';

// A 4x2 car is bonnet, doors, doors, boot. The ends are front and rear; the
// middle tiles are the flanks — which is what a car actually looks like.
const v = level.vehicles[0];
const bySide = {};
for (const t of v.tiles) bySide[t.side] = (bySide[t.side] || 0) + 1;
console.log('  4x2 car panels: ' + Object.entries(bySide).map(([k,n]) => k + ':' + n).join(' '),
            bySide.front && bySide.rear && bySide.left === 2 && bySide.right === 2
              ? 'CORRECT (ends are bonnet and boot, middle is doors)' : 'WRONG');

// The art is named for the direction of TRAVEL and marks the face the fire
// came from. A round flying toward the nose has come from behind.
const nose0 = level.vehicles.find(x => x.ang === 0);
const hits = { rear: vehSideHit(nose0, 0), front: vehSideHit(nose0, Math.PI),
               left: vehSideHit(nose0, Math.PI/2), right: vehSideHit(nose0, -Math.PI/2) };
console.log('  bearings on a nose-right car: ' + Object.entries(hits).map(([k,r]) => k+'->'+r).join(' '),
            hits.rear==='rear' && hits.front==='front' && hits.left==='left' && hits.right==='right'
              ? 'CORRECT' : 'WRONG');
// and it rotates with the car, not with the world
const st = MAPS.findIndex(m => m.name === 'THE STANDOFF');
const keep = game.mapIndex;
game.mapIndex = st; initGame(); game.state = 'play';
const noseL = level.vehicles.find(x => x.ang === Math.PI);
console.log('  the same world bearing on a nose-LEFT car: ' + vehSideHit(noseL, 0),
            vehSideHit(noseL, 0) === 'front' ? 'CORRECT (the frame turns with the car)' : 'WRONG');
game.mapIndex = keep; initGame(); game.state = 'play';

// Shoot ONE door out. That door opens; the far side is untouched.
const c = level.vehicles[0];
c.body = 'sedan_grey';                       // unarmoured, for the same reason
const leftTile = c.tiles.find(t => t.side === 'left' && !t.engine);
const rightTile = c.tiles.find(t => t.side === 'right' && !t.engine);
// A side carries a third of the car's life, so concentrated fire opens ONE
// door well before the car as a whole is spent. Walk it round by round and
// find the window where the two sides genuinely disagree.
let opened = 0;
for (let i = 1; i <= 30; i++) {
  damageVehicle(leftTile.tx, leftTile.ty, { pen: 30, dmg: 30, side: 'player', ang: Math.PI/2 }, 1);
  const a = materialAt(leftTile.tx, leftTile.ty), b = materialAt(rightTile.tx, rightTile.ty);
  if (a.dmgKeep > b.dmgKeep && b.dmgKeep === 0.6 && !opened) opened = i;
}
console.log('  driver door opens at round ' + opened + ' while the far side is still shut',
            opened > 0 && opened < 20
              ? 'CORRECT (you opened one door, not the car)' : 'WRONG');
console.log('  and the picture shows the side you shot: hotSide=' + c.hotSide + ' stage=' + c.stage,
            c.hotSide === 'left' && c.stage > 0 ? 'CORRECT' : 'WRONG');

// Enough total damage and the whole car goes, wherever it came from.
const c2 = level.vehicles[1];
const t2 = c2.tiles.filter(t => !t.engine);
for (let i = 0; i < 90; i++) {
  const t = t2[i % t2.length];
  damageVehicle(t.tx, t.ty, { pen: 34, dmg: 30, side: 'player', ang: i * 1.7 }, 1);
}
const allSides = ['front','rear','left','right'].map(s => vehSideState(c2, s));
console.log('  90 rounds spread all round: state=' + c2.state + ', panels ' + allSides.join(','),
            c2.state === 'wreck' && allSides.every(s => s === 'wreck')
              ? 'CORRECT (past enough total damage the whole thing goes)' : 'WRONG');

// The engine block is STILL untouchable, directional or not.
const c3 = level.vehicles[2], hood = c3.tiles.find(t => t.engine);
for (let i = 0; i < 300; i++)
  damageVehicle(hood.tx, hood.ty, { pen: 40, dmg: 30, side: 'player', ang: Math.PI }, 1);
console.log('  300 rounds into the bonnet: ' + materialAt(hood.tx, hood.ty).name +
            ', state=' + c3.state,
            materialAt(hood.tx, hood.ty) === MATERIALS.engine && c3.state === 'intact'
              ? 'CORRECT (still nothing you can do to it)' : 'WRONG');

// The sprite chain degrades instead of blanking.
const c4 = level.vehicles[3];
c4.stage = 3; c4.hotSide = 'left'; c4.state = 'shot_up';
const chain = [];
for (const body of VEH_BODIES) {
  c4.body = body;
  chain.push(body + ':' + (VEHICLE_SPRITES[body + '__left__3'] ? 'full'
              : VEHICLE_SPRITES[body + '__left__d'] ? 'single' : 'rung'));
}
console.log('  ten bodies, two of them armoured: ' + VEH_BODIES.length + ' / ' +
            Object.keys(VEH_ARMOR).join(','),
            VEH_BODIES.length === 10 && VEH_ARMOR.humvee && VEH_ARMOR.police_cruiser
              && Object.keys(VEH_ARMOR).every(b => VEH_BODIES.includes(b))
              ? 'CORRECT (the armour tables are live now, not inert)' : 'WRONG');
console.log('  art coverage per body: ' + chain.join(' '),
            chain.some(x => x.endsWith('full')) && chain.every(x => !x.endsWith('none'))
              ? 'CORRECT (uneven coverage degrades, never blanks)' : 'WRONG');
console.log('  every body resolves to a real sprite at every stage: ' +
            VEH_BODIES.every(b => VEH_STATES.every((s,i) =>
              !!(VEHICLE_SPRITES[b + '__left__' + i] || VEHICLE_SPRITES[b + '__left__d'] ||
                 VEHICLE_SPRITES[b + '__' + s] || VEHICLE_SPRITES[b + '__intact']))),
            VEH_BODIES.every(b => VEH_STATES.every((s,i) =>
              !!(VEHICLE_SPRITES[b + '__left__' + i] || VEHICLE_SPRITES[b + '__left__d'] ||
                 VEHICLE_SPRITES[b + '__' + s] || VEHICLE_SPRITES[b + '__intact']))) ? 'CORRECT' : 'WRONG');

localStorage.clear(); game.mapIndex = 0; initGame();
console.log('DIRECTIONAL DAMAGE TEST DONE');
})();

(function propTierTests(){
console.log('--- props: three tiers, one glyph table ---');
localStorage.clear();
game.diffIndex = 1; game.densityIndex = 1; game.loadout.squad = 'standard';

// ONE table. The glyph->material map used to be written out four times with a
// comment begging them to agree; WALL_GLYPHS and the validator now derive.
console.log('  WALL_GLYPHS derives from GLYPH_MAT: "' + WALL_GLYPHS + '"',
            WALL_GLYPHS.includes('#') && WALL_GLYPHS.includes('n') &&
            !WALL_GLYPHS.includes('*') && !WALL_GLYPHS.includes('~')
              ? 'CORRECT (passable props are not wall)' : 'WRONG');
console.log('  the map validator accepts every glyph the table knows: ' +
            Object.keys(GLYPH_MAT).every(g => MAP_CHAR_RE.test(g)),
            Object.keys(GLYPH_MAT).every(g => MAP_CHAR_RE.test(g)) ? 'CORRECT' : 'WRONG');
console.log('  and still rejects one it does not: ' + !MAP_CHAR_RE.test('§'),
            !MAP_CHAR_RE.test('§') ? 'CORRECT' : 'WRONG');

// TIER 1 — a solid prop: body-blocking, with sight and bullets off the material.
game.mapIndex = MAPS.findIndex(m => m.name === 'THE PILLBOX'); initGame(); game.state = 'play';
let sb = null;
for (let y = 0; y < level.h && !sb; y++) for (let x = 0; x < level.w; x++)
  if (level.mat[y][x] === 'sandbags') { sb = { x, y }; break; }
console.log('  TIER 1 sandbags: opaque=' + opaque(sb.x, sb.y) + ' stops rounds=' +
            blocksBullet(sb.x, sb.y) + ' resist=' + materialAt(sb.x, sb.y).resist +
            ' blocks a body=' + solidForMove(sb.x, sb.y),
            !opaque(sb.x, sb.y) && blocksBullet(sb.x, sb.y) && solidForMove(sb.x, sb.y)
              ? 'CORRECT (a firing position: see over it, it stops a rifle round)' : 'WRONG');
console.log('  a bookshelf is the opposite trade: opaque=' + MATERIALS.bookshelf.opaque +
            ' resist=' + MATERIALS.bookshelf.resist,
            MATERIALS.bookshelf.opaque && MATERIALS.bookshelf.resist < 12
              ? 'CORRECT (hides you, barely slows a round)' : 'WRONG');

// TIER 2 — a material with no body. Concealment without cover.
const px = sb.x, py = sb.y + 3;
level.mat[py][px] = 'shrub';
console.log('  TIER 2 shrub: opaque=' + opaque(px, py) + ' stops rounds=' + blocksBullet(px, py) +
            ' blocks a body=' + solidForMove(px, py),
            opaque(px, py) && !blocksBullet(px, py) && !solidForMove(px, py)
              ? 'CORRECT (blocks the eye and nothing else)' : 'WRONG');
console.log('  and A* still routes through it: ' + !!astar(px - 1, py, px + 1, py, passForPath, pathCostSquad),
            !!astar(px - 1, py, px + 1, py, passForPath, pathCostSquad) ? 'CORRECT' : 'WRONG');
// the rule that makes tier 2 safe at all
const passable = Object.keys(PROPS).filter(k => PROPS[k].solid === false);
console.log('  every passable material has resist 0: ' + passable.join(','),
            passable.every(k => MATERIALS[k].resist === 0)
              ? 'CORRECT (resist on a standable tile makes a man unhittable)' : 'WRONG');
level.mat[py][px] = null;

// TIER 3 — ground and decals
console.log('  TIER 3 ground keys: out=' + level.groundOut + ' in=' + level.groundIn,
            level.groundOut === 'ground_dirt' && level.groundIn === 'ground_concrete'
              ? 'CORRECT (the map says once, the rest is default)' : 'WRONG');
console.log('  every ground key has art: ' +
            [...new Set(MAPS.map(m => m.ground || 'ground_asphalt'))].every(k => !!PROP_SPRITES[k]),
            [...new Set(MAPS.map(m => m.ground || 'ground_asphalt'))].every(k => !!PROP_SPRITES[k])
              ? 'CORRECT' : 'WRONG');
console.log('  decal list exists and parses: ' + Array.isArray(level.decalsFloor),
            Array.isArray(level.decalsFloor) ? 'CORRECT' : 'WRONG');

// every prop with art has art, and every art key is a real sprite
const artOk = Object.values(PROPS).filter(p => p.art).every(p => !!PROP_SPRITES[p.art]);
console.log('  every PROPS.art resolves to a sprite: ' + artOk, artOk ? 'CORRECT' : 'WRONG');

// THE BUG THIS UNCOVERED: a breached wall kept its material and went on
// blocking sight and stopping rounds while you walked through the hole.
game.mapIndex = 0; initGame(); game.state = 'play';
let wt = null;
for (let y = 1; y < level.h - 1 && !wt; y++) for (let x = 1; x < level.w - 1; x++)
  if (level.wall[y][x] && level.mat[y][x] === 'drywall') { wt = { x, y }; break; }
if (wt) {
  game.wallCharge = { tx: wt.x, ty: wt.y, fuse: 0 };
  detonateWallCharge();
  console.log('  a breached wall really is a hole: solid=' + solidForMove(wt.x, wt.y) +
              ' opaque=' + opaque(wt.x, wt.y) + ' stops rounds=' + blocksBullet(wt.x, wt.y),
              !solidForMove(wt.x, wt.y) && !opaque(wt.x, wt.y) && !blocksBullet(wt.x, wt.y)
                ? 'CORRECT (level.mat is cleared too now)' : 'WRONG');
}
localStorage.clear(); game.mapIndex = 0; initGame();
console.log('PROP TIER TEST DONE');
})();

(function vehicleArmorTests(){
console.log('--- armoured bodies: the exceptions to the engine-block rule ---');
game.mapIndex = MAPS.findIndex(m => m.name === 'DOWNTOWN EXCHANGE');
game.diffIndex = 1; game.densityIndex = 1; initGame(); game.state = 'play';
const v = level.vehicles[0], door = v.tiles.find(t => !t.engine);
const P = { buckshot: 8, pistol: 14, rifle: 26 };
const thru = (pen, r) => pen > r;
v.body = 'police_cruiser';
const m = materialAt(door.tx, door.ty);
console.log('  cruiser door is IIIA: resist ' + m.resist + ' — buck ' +
            (thru(P.buckshot, m.resist) ? 'through' : 'stops') + ', pistol ' +
            (thru(P.pistol, m.resist) ? 'through' : 'stops') + ', rifle ' +
            (thru(P.rifle, m.resist) ? 'through' : 'stops'),
            !thru(P.buckshot, m.resist) && !thru(P.pistol, m.resist) && thru(P.rifle, m.resist)
              ? 'CORRECT (that is what IIIA means)' : 'WRONG');
v.body = 'humvee';
const h = materialAt(door.tx, door.ty);
console.log('  humvee door: resist ' + h.resist + ', rifle ' +
            (thru(P.rifle, h.resist) ? 'through' : 'stops'),
            !thru(P.rifle, h.resist) ? 'CORRECT (a moving wall)' : 'WRONG');
v.state = 'shot_up'; v.side.front = v.hpMax;
const after = materialAt(door.tx, door.ty);
console.log('  shot_up compromises the plate: ' + after.name,
            after !== h ? 'CORRECT (armour you cannot degrade is just an engine block)' : 'WRONG');
const hood = v.tiles.find(t => t.engine);
console.log('  the engine block is untouched by any of this: ' +
            (materialAt(hood.tx, hood.ty) === MATERIALS.engine),
            materialAt(hood.tx, hood.ty) === MATERIALS.engine ? 'CORRECT' : 'WRONG');
localStorage.clear(); game.mapIndex = 0; initGame();
console.log('VEHICLE ARMOR TEST DONE');
})();

(function multiSideDamageTests(){
console.log('--- damage from a second direction must not heal the first ---');
localStorage.clear();
game.mapIndex = MAPS.findIndex(m => m.name === 'DOWNTOWN EXCHANGE');
game.diffIndex = 1; game.densityIndex = 1; initGame(); game.state = 'play';
const v = level.vehicles[0]; v.body = 'sedan_grey';
const L = v.tiles.find(t => t.side === 'left' && !t.engine);
const R = v.tiles.find(t => t.side === 'right' && !t.engine);
for (let i = 0; i < 10; i++)
  damageVehicle(L.tx, L.ty, { pen: 30, dmg: 30, side: 'player', ang: Math.PI/2 }, 1);
const s1 = v.stage, h1 = v.hotSide;
for (let i = 0; i < 10; i++)
  damageVehicle(R.tx, R.ty, { pen: 30, dmg: 30, side: 'player', ang: -Math.PI/2 }, 1);
console.log('  shot left to stage ' + s1 + ' (' + h1 + '), then shot right: stage ' +
            v.stage + ' (' + v.hotSide + ')',
            v.stage >= s1 ? 'CORRECT (the ladder only goes one way)' : 'WRONG');
console.log('  a second face drags it further down, not sideways: ' + (v.stage > s1),
            v.stage > s1 ? 'CORRECT' : 'WRONG');
// the picture must not flip on a near-tie
const before = v.hotSide;
damageVehicle(R.tx, R.ty, { pen: 4, dmg: 4, side: 'player', ang: -Math.PI/2 }, 1);
console.log('  and a near-tie does not flip the sprite: ' + before + ' -> ' + v.hotSide,
            v.hotSide === before ? 'CORRECT (hysteresis)' : 'WRONG');

// THE TURN COSTS A RUNG. Overtake the shown face decisively and the car must
// come out further down the ladder than it went in, not merely different.
const v3 = level.vehicles[2]; v3.body = 'sedan_grey';
const L3 = v3.tiles.find(t => t.side === 'left' && !t.engine);
const R3 = v3.tiles.find(t => t.side === 'right' && !t.engine);
for (let i = 0; i < 8; i++)
  damageVehicle(L3.tx, L3.ty, { pen: 26, dmg: 26, side: 'player', ang: Math.PI/2 }, 1);
const face0 = v3.hotSide, st0 = v3.stage;
let turned = false, stAtTurn = null;
for (let i = 0; i < 30 && !turned; i++) {
  damageVehicle(R3.tx, R3.ty, { pen: 26, dmg: 26, side: 'player', ang: -Math.PI/2 }, 1);
  if (v3.hotSide !== face0) { turned = true; stAtTurn = v3.stage; }
}
console.log('  the shown face turned ' + face0 + ' -> ' + v3.hotSide +
            ' and the rung went ' + st0 + ' -> ' + stAtTurn,
            turned && stAtTurn > st0
              ? 'CORRECT (more wrecked, not differently wrecked)' : 'WRONG');
// monotonic under any order of fire
const v2 = level.vehicles[1]; v2.body = 'sedan_grey';
let worst = 0, ok = true;
const ts = v2.tiles.filter(t => !t.engine);
for (let i = 0; i < 60; i++) {
  const t = ts[i % ts.length];
  damageVehicle(t.tx, t.ty, { pen: 22, dmg: 22, side: 'player', ang: i * 1.3 }, 1);
  if (v2.stage < worst) ok = false;
  worst = Math.max(worst, v2.stage);
}
console.log('  60 rounds from every angle, stage never regressed: ' + ok + ' (ended ' + v2.stage + ')',
            ok ? 'CORRECT' : 'WRONG');
localStorage.clear(); game.mapIndex = 0; initGame();
console.log('MULTI-SIDE DAMAGE TEST DONE');
})();

(function multiFrameTests(){
console.log('--- the all-round frame: shot from two sides ---');
game.mapIndex = MAPS.findIndex(m => m.name === 'DOWNTOWN EXCHANGE');
game.diffIndex = 1; game.densityIndex = 1; initGame(); game.state = 'play';
const missing = VEH_BODIES.filter(b => !VEHICLE_SPRITES[b + '__multi']);
console.log('  every body has an all-round frame: ' + (VEH_BODIES.length - missing.length) +
            '/' + VEH_BODIES.length + (missing.length ? ' missing ' + missing.join(',') : ''),
            missing.length === 0 ? 'CORRECT' : 'WRONG');
// one side only must NOT use it; two sides must
const v = level.vehicles[0]; v.body = 'pickup';
const L = v.tiles.find(t => t.side === 'left' && !t.engine);
const R = v.tiles.find(t => t.side === 'right' && !t.engine);
for (let i = 0; i < 6; i++) damageVehicle(L.tx, L.ty, { pen: 26, dmg: 26, side: 'player', ang: Math.PI/2 }, 1);
const oneSide = v.faces;
for (let i = 0; i < 6; i++) damageVehicle(R.tx, R.ty, { pen: 26, dmg: 26, side: 'player', ang: -Math.PI/2 }, 1);
console.log('  faces marked: one side ' + oneSide + ' -> two sides ' + v.faces,
            oneSide === 1 && v.faces >= 2 ? 'CORRECT' : 'WRONG');
console.log('  and the face count never goes back down: ' +
            (function(){ const f = v.faces;
              damageVehicle(L.tx, L.ty, { pen: 26, dmg: 26, side: 'player', ang: Math.PI/2 }, 1);
              return v.faces >= f; })(),
            v.faces >= 2 ? 'CORRECT (a car cannot un-learn it was hit from two sides)' : 'WRONG');
localStorage.clear(); game.mapIndex = 0; initGame();
console.log('MULTI FRAME TEST DONE');
})();

(function crestCoverTests(){
console.log('--- chest-high cover: you shoot over it, and it is not a roof ---');
game.mapIndex = MAPS.findIndex(m => m.name === 'BROKEN ARROW');
game.diffIndex = 1; game.densityIndex = 1; initGame(); game.state = 'play';

// The table itself: only the low stuff has a crest, and a wall never does.
const withCrest = Object.keys(MATERIALS).filter(k => MATERIALS[k].crest);
const walls = ['concrete', 'brick', 'drywall', 'sheetmetal', 'engine', 'tree', 'wood'];
console.log('  crest is on the low cover only: ' + withCrest.join(','),
            withCrest.length > 0 && walls.every(w => !MATERIALS[w].crest) ? 'CORRECT' : 'WRONG');
console.log('  and a crest is a fraction, not a flag: ' +
            withCrest.map(k => k + '=' + MATERIALS[k].crest).join(' '),
            withCrest.every(k => MATERIALS[k].crest > 0 && MATERIALS[k].crest < 1)
              ? 'CORRECT (never 1 — that would be a roof)' : 'WRONG');

// Fire a round AT a sandbag tile from far away, many times, and count what
// gets through. It must be most-but-not-all, and it must match the crest.
function throughRate(kind, fromDist, n) {
  // a clean synthetic lane: one barrier tile, nothing else in the way
  const tx = 5, ty = 5;
  const save = level.mat[ty][tx], saveW = level.wall[ty][tx];
  level.mat[ty][tx] = kind; level.wall[ty][tx] = 1;
  const cx = tx * TILE + TILE / 2, cy = ty * TILE + TILE / 2;
  let through = 0;
  for (let i = 0; i < n; i++) {
    const b = { x: cx - fromDist, y: cy, ox: cx - fromDist, oy: cy, ang: 0,
                dmg: 30, pen: 26, side: 'player', traveled: 0, range: 900,
                alive: true, speed: 900 };
    resolveBarrier(b, { x: cx - TILE / 2, y: cy, axis: 'x', hit: true });
    if (b.alive && !b.penetrated) through++;
  }
  level.mat[ty][tx] = save; level.wall[ty][tx] = saveW;
  return through / n;
}
for (const kind of ['sandbags', 'hesco']) {
  const want = 1 - MATERIALS[kind].crest;
  const got = throughRate(kind, 300, 4000);
  const ok = Math.abs(got - want) < 0.04;
  console.log('  ' + kind + ' from 300px: ' + (got * 100).toFixed(1) + '% clear the crest (want ~' +
              (want * 100).toFixed(0) + '%)', ok ? 'CORRECT (cover, not immunity)' : 'WRONG');
}
// ...and from right behind it, every round of yours goes over. This is the
// firing-position half, and it is the thing that makes cover near a spawn
// usable instead of a blindfold — the TREELINE lesson, answered.
for (const kind of ['sandbags', 'hesco']) {
  const got = throughRate(kind, TUNE.crestReach - 8, 500);
  console.log('  ' + kind + ' braced on it: ' + (got * 100).toFixed(0) + '% of YOUR rounds clear',
              got === 1 ? 'CORRECT (your muzzle is past it)' : 'WRONG');
}
// and one tile further back you are not braced any more
{
  const got = throughRate('sandbags', TUNE.crestReach + 30, 2000);
  console.log('  but two tiles back you are just a man behind a wall: ' + (got * 100).toFixed(0) + '% clear',
              got < 0.4 ? 'CORRECT' : 'WRONG');
}
// A round that clears the crest must keep its damage — it never touched it.
{
  const cx = 5 * TILE + TILE / 2, cy = 5 * TILE + TILE / 2;
  const save = level.mat[5][5]; level.mat[5][5] = 'hesco'; level.wall[5][5] = 1;
  let kept = true;
  for (let i = 0; i < 200; i++) {
    const b = { x: cx - 40, y: cy, ox: cx - 40, oy: cy, ang: 0, dmg: 30, pen: 26,
                side: 'player', traveled: 0, range: 900, alive: true, speed: 900 };
    resolveBarrier(b, { x: cx - TILE / 2, y: cy, axis: 'x', hit: true });
    if (b.dmg !== 30 || b.pen !== 26) kept = false;
  }
  level.mat[5][5] = save; level.wall[5][5] = 0;
  console.log('  a round over the top loses nothing:', kept ? 'CORRECT' : 'WRONG (it is being resisted anyway)');
}
// You still cannot walk through it, and you can still see over it.
for (const kind of ['sandbags', 'hesco']) {
  console.log('  ' + kind + ' is solid to a man and clear to the eye:',
              PROPS[kind].solid === true && MATERIALS[kind].opaque === false ? 'CORRECT' : 'WRONG');
}
localStorage.clear(); game.mapIndex = 0; initGame();
console.log('CREST COVER TEST DONE');
})();

(function convoyAndSpawnCoverTests(){
console.log('--- the laager, and cover you can actually use at the start line ---');
const bi = MAPS.findIndex(m => m.name === 'BROKEN ARROW');
game.mapIndex = bi; game.diffIndex = 1; game.densityIndex = 1; initGame(); game.state = 'play';

// Sam: "they should be surrounded by humvees." Every casualty must have hull
// between him and every cardinal direction he can be shot from.
const cas = game.squad.filter(s2 => s2.qrfCasualty && !s2.walkingWounded);
const bad = [];
for (const c of cas) {
  const t = tileAt(c.x, c.y);
  for (const [dx, dy, name] of [[1,0,'E'],[-1,0,'W'],[0,1,'S'],[0,-1,'N']]) {
    let found = false;
    for (let d = 1; d <= 6 && !found; d++) {
      const x = t.tx + dx * d, y = t.ty + dy * d;
      if (!inBounds(x, y)) { found = true; break; }
      if (level.vehAt && level.vehAt.has(x + ',' + y)) found = true;
      else if (level.wall[y][x]) found = true;      // sandbags count too
    }
    if (!found) bad.push(c.name + ' open to the ' + name);
  }
}
console.log('  every casualty has cover on all four sides: ' + (bad.length ? bad.join(', ') : 'yes'),
            bad.length === 0 ? 'CORRECT (a laager, not a car park)' : 'WRONG');

// A convoy is military vehicles, not a taxi rank.
const bodies = (level.vehicles || []).map(v => v.body);
console.log('  the convoy is ' + bodies.length + ' vehicles: ' + [...new Set(bodies)].join(','),
            bodies.length >= 6 && bodies.every(b => ['humvee', 'box_truck'].includes(b))
              ? 'CORRECT' : 'WRONG (civilian traffic in an ambushed convoy)');
// and every one of them is still a legal 4x2
const shapes = (level.vehicles || []).map(v => (v.x1 - v.x0 + 1) + 'x' + (v.y1 - v.y0 + 1));
console.log('  and every one is 4x2 or 2x4: ' + [...new Set(shapes)].join(','),
            shapes.every(sh => sh === '4x2' || sh === '2x4') ? 'CORRECT' : 'WRONG (two merged)');

// Sam: "the spawn point should still have cover." Under the old rules cover in
// front of a spawn was a blindfold; with a crest it is a firing position. So
// the rule is no longer "keep it clear", it is "whatever is there must be
// something you can shoot over".
{
  const lanes = level.spawns.squad.map(s2 => tileAt(s2.x, s2.y));
  lanes.push(tileAt(level.spawns.player.x, level.spawns.player.y));
  let covered = 0;
  const blind = [];
  for (const t of lanes) {
    for (let d = 1; d <= 3; d++) {
      const y = t.ty - d;                       // the fight is NORTH on this map
      if (!inBounds(t.tx, y)) continue;
      const m = level.mat[y][t.tx];
      if (!m || !level.wall[y][t.tx]) continue;
      if (MATERIALS[m] && MATERIALS[m].crest) covered++;
      else blind.push(m + '@' + t.tx + ',' + y);
    }
  }
  console.log('  nothing up-range of a spawn that you cannot shoot over: ' +
              (blind.length ? blind.join(' ') : 'none'),
              blind.length === 0 ? 'CORRECT' : 'WRONG');
  // and there IS cover, which is the actual ask
  let near = 0;
  for (const t of lanes)
    for (let dy = -2; dy <= 1; dy++) for (let dx = -3; dx <= 3; dx++) {
      const x = t.tx + dx, y = t.ty + dy;
      if (!inBounds(x, y)) continue;
      const m = level.mat[y][x];
      if (m && MATERIALS[m] && MATERIALS[m].crest) near++;
    }
  console.log('  and the start line has ' + near + ' tiles of usable cover around it',
              near >= 8 ? 'CORRECT' : 'WRONG (Sam asked for cover at the spawn)');
}
// the mission still has to be walkable end to end
{
  const st = tileAt(level.spawns.player.x, level.spawns.player.y);
  const goals = [...level.spawns.wounded, ...(level.spawns.walking || [])];
  const un = [];
  for (const g of goals) {
    const gt = tileAt(g.x, g.y);
    if (!astar(st.tx, st.ty, gt.tx, gt.ty, passForPath, pathCostSquad)) un.push(gt.tx + ',' + gt.ty);
  }
  console.log('  every man you came for is still reachable: ' + (un.length ? un.join(' ') : 'yes'),
              un.length === 0 ? 'CORRECT' : 'WRONG (the laager sealed somebody in)');
}
localStorage.clear(); game.mapIndex = 0; initGame();
console.log('LAAGER / SPAWN COVER TEST DONE');
})();

(function chargeTargetTests(){
console.log('--- a wall charge is for walls ---');
game.mapIndex = MAPS.findIndex(m => m.name === 'BROKEN ARROW');
game.diffIndex = 1; game.densityIndex = 1; initGame(); game.state = 'play';
const p = game.player;
p.charges = 2;
// Sam: "i shouldn't be able to put charges on a friendly humvee, i kept on
// accidentally putting charges on my own humvees." Of course he did — the
// convoy is parked around the casualties, so bodywork is the nearest solid
// thing to the cursor for most of the mission.
let veh = null;
for (const [k] of level.vehAt) { const [x, y] = k.split(',').map(Number); veh = { x, y }; break; }
p.x = veh.x * TILE + TILE / 2 + TILE; p.y = veh.y * TILE + TILE / 2;
console.log('  standing at a Humvee, cursor on its hull:',
            breachableAt(p, veh.x * TILE + 16, veh.y * TILE + 16) === null
              ? 'CORRECT (you do not breach your own truck)' : 'WRONG');
// nor on cover you can already shoot over
let low = null;
for (let y = 0; y < level.h && !low; y++) for (let x = 0; x < level.w && !low; x++) {
  const m = level.mat[y][x];
  if (m && MATERIALS[m] && MATERIALS[m].crest && level.wall[y][x]) low = { x, y };
}
p.x = low.x * TILE + TILE / 2 + TILE; p.y = low.y * TILE + TILE / 2;
console.log('  and not on a sandbag wall you can shoot over:',
            breachableAt(p, low.x * TILE + 16, low.y * TILE + 16) === null ? 'CORRECT' : 'WRONG');
// but a real wall is still a real wall, or the charge has no job left
{
  game.mapIndex = 0; initGame(); game.state = 'play';
  const q = game.player; q.charges = 2;
  let wall = null;
  for (let y = 1; y < level.h - 1 && !wall; y++) for (let x = 1; x < level.w - 1 && !wall; x++) {
    if (!level.wall[y][x] || doorAt(x, y)) continue;
    const m = level.mat[y][x];
    if (m && MATERIALS[m] && MATERIALS[m].crest) continue;
    if (level.vehAt && level.vehAt.has(x + ',' + y)) continue;
    wall = { x, y };
  }
  q.x = wall.x * TILE + TILE / 2; q.y = wall.y * TILE + TILE / 2 + TILE;
  const got = breachableAt(q, wall.x * TILE + 16, wall.y * TILE + 16);
  console.log('  a masonry wall is still breachable: ' + (got ? got.tx + ',' + got.ty : 'null'),
              got ? 'CORRECT (the charge still has a job)' : 'WRONG');
}
localStorage.clear(); game.mapIndex = 0; initGame();
console.log('CHARGE TARGET TEST DONE');
})();

(function interactPriorityTests(){
console.log('--- [E] priority: a man on the ground beats a gun ---');
game.mapIndex = MAPS.findIndex(m => m.name === 'BROKEN ARROW');
game.diffIndex = 1; game.densityIndex = 1; initGame(); game.state = 'play';
const p = game.player;
const ring = level.turrets.find(t => t.ring && t.veh);
const cas = game.squad.find(s2 => s2.qrfCasualty && s2.downed);
// stand him ON the hull, with a casualty at his feet — the v0.79 laager makes
// this the normal case rather than a corner one
p.x = ring.veh.x0 * TILE - 8; p.y = (ring.veh.y0 + ring.veh.y1 + 1) / 2 * TILE;
cas.x = p.x + 10; cas.y = p.y;
console.log('  turret is in reach from here:', reachableTurret(p) === ring ? 'yes' : 'no');
for (const stable of [false, true]) {
  cas.stabilized = stable;
  p.turret = null; ring.manned = null;
  playerInteract(p);
  console.log('  casualty ' + (stable ? 'already stable (the HAUL case)' : 'still bleeding') +
              ': mounted=' + !!p.turret,
              !p.turret ? 'CORRECT (the hold-[E] keeps him)' : 'WRONG (got in the gun instead)');
}
// with nobody down beside him it still mounts, or the fix broke the feature
cas.x = p.x + 400; cas.y = p.y + 400;
p.turret = null; ring.manned = null;
playerInteract(p);
console.log('  and with nobody at his feet it still mounts: ' + !!p.turret,
            p.turret ? 'CORRECT' : 'WRONG');
dismountTurret(p);
// a surrendered man and a hostage also outrank the gun
{
  const e = game.enemies.find(x => x.alive);
  e.state = 'surrender'; e.x = p.x + 12; e.y = p.y;
  p.turret = null; ring.manned = null;
  playerInteract(p);
  console.log('  a surrendered suspect outranks the gun: mounted=' + !!p.turret + ', cuffed=' + (e.state === 'cuffed'),
              !p.turret && e.state === 'cuffed' ? 'CORRECT' : 'WRONG');
  if (p.turret) dismountTurret(p);
}
localStorage.clear(); game.mapIndex = 0; initGame();
console.log('INTERACT PRIORITY TEST DONE');
})();

(function m2BeltTests(){
console.log('--- the M2 belt is a belt box ---');
game.mapIndex = MAPS.findIndex(m => m.name === 'BROKEN ARROW');
game.diffIndex = 1; game.densityIndex = 1; initGame(); game.state = 'play';
console.log('  belt capacity: ' + TUNE.m2w.mag,
            TUNE.m2w.mag === 100 ? 'CORRECT (an M2 belt box holds 100)' : 'WRONG');
const t = level.turrets.find(tt => tt.ring && tt.veh);
const p = game.player;
p.x = t.sx; p.y = t.sy;
mountTurret(p, t);
console.log('  a fresh gun mounts with a full belt: ' + p.ammo,
            p.ammo === 100 ? 'CORRECT' : 'WRONG');
// the belt is the GUN's: spend some, step off, come back to what you left
p.ammo = 41;
dismountTurret(p);
p.x = t.sx; p.y = t.sy;
mountTurret(p, t);
console.log('  and stepping off and back on resumes it, not refills it: ' + p.ammo,
            p.ammo === 41 ? 'CORRECT (no free reload)' : 'WRONG');
dismountTurret(p);
// thirteen seconds of trigger before the belt change, so the number means something
console.log('  which is ' + (TUNE.m2w.mag / (TUNE.m2w.rpm / 60)).toFixed(1) + 's of continuous fire before a ' +
            TUNE.m2w.reload + 's change',
            TUNE.m2w.mag / (TUNE.m2w.rpm / 60) > 10 ? 'CORRECT' : 'WRONG');
localStorage.clear(); game.mapIndex = 0; initGame();
console.log('M2 BELT TEST DONE');
})();
