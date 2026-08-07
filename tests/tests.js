
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
