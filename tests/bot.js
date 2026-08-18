
// ===== assault-bot end-to-end playthrough (drives the real input path) =====
function botRun(mapIdx, seedLabel) {
  game.mapIndex = mapIdx; initGame(); game.state = 'play';
  const P = game.player;
  let frames = 0, banged = false, errs = 0;
  input.keys.clear(); input.justPressed.clear();
  while (game.state === 'play' && frames < 60 * (MAPS[mapIdx].siege ? 420 : 150)) {
    frames++;
    input.justPressed.clear();
    input.keys.clear();
    input.mouse.down = false;
    const target = nearestEntity(game.hostages, P.x, P.y, 1e9, h => h.alive && !h.secured)
      || nearestEntity(game.enemies, P.x, P.y, 1e9, e => e.alive && e.state !== 'cuffed');
    // NOTHING TO CHASE IS NOT THE SAME AS NOTHING TO DO. This is an assault bot
    // and it has always read an empty map as "mission over" — which is true on
    // every map that writes its enemies down, and false on a siege, where the
    // map starts empty on purpose and the first wave is twenty seconds out. It
    // used to break out on frame one and report a 0-second run.
    // A defender holds. So: stand on the position and keep the clock running.
    if (!target) {
      if (!game.siegeState || game.siegeState.phase === 'done') break;
      const z = level.extraction[0];
      if (z) {
        const zx = z.tx * TILE + 16, zy = z.ty * TILE + 16;
        if (zx > P.x + 6) input.keys.add('d'); if (zx < P.x - 6) input.keys.add('a');
        if (zy > P.y + 6) input.keys.add('s'); if (zy < P.y - 6) input.keys.add('w');
      }
      input.mouse.wx = P.x + 100; input.mouse.wy = P.y;
      try { update(1 / 60); } catch (e) { errs++; if (errs < 3) console.log('UPDATE ERROR:', e.message); }
      continue;
    }
    // pathing intent: recompute every second
    if (frames % 60 === 1) {
      const st = tileAt(P.x, P.y), gt = tileAt(target.x, target.y);
      P._botPath = astar(st.tx, st.ty, gt.tx, gt.ty, passForPath, pathCostSquad);
      P._botI = 0;
    }
    let mx = target.x, my = target.y;
    if (P._botPath && P._botI < P._botPath.length) {
      const n = P._botPath[P._botI];
      const nx = n.tx * TILE + 16, ny = n.ty * TILE + 16;
      if (dist(P.x, P.y, nx, ny) < 14) P._botI++;
      else {
        if (nx > P.x + 6) input.keys.add('d'); if (nx < P.x - 6) input.keys.add('a');
        if (ny > P.y + 6) input.keys.add('s'); if (ny < P.y - 6) input.keys.add('w');
      }
    }
    // combat: aim & shoot nearest visible enemy
    const foe = nearestEntity(game.enemies, P.x, P.y, 600,
      e => e.alive && e.state !== 'cuffed' && e.state !== 'surrender' && lineOfSight(P.x, P.y, e.x, e.y, opaque));
    if (foe) { mx = foe.x; my = foe.y; input.mouse.down = true; }
    input.mouse.wx = mx; input.mouse.wy = my;
    // doors: kick what's in the way
    const d = nearestDoor(P.x, P.y, 50);
    if (d && d.state === 'closed') input.justPressed.add(d.locked ? 'f' : 'e');
    else if (d && d.state === 'open' && frames % 97 === 0) input.justPressed.add('e');  // close it too
    // one bang into the hostage room when close
    if (!banged && dist(P.x, P.y, target.x, target.y) < TILE * 6 && game.hostages.includes(target)) {
      input.justPressed.add('g'); banged = true;
    }
    // cuff & secure opportunistically
    if (nearestEntity(game.enemies, P.x, P.y, 46, e => e.alive && e.state === 'surrender')) input.justPressed.add('e');
    if (nearestEntity(game.hostages, P.x, P.y, 46, h => h.alive && !h.secured)) input.justPressed.add('e');
    try { update(1 / 60); } catch (e) { errs++; if (errs < 3) console.log('UPDATE ERROR:', e.message); }
  }
  // A failure now lands in the after-action review first; step through it so the
  // harness still exercises the real path to the debrief.
  let aarSteps = 0;
  while (game.state === 'aar' && aarSteps++ < 8) {
    try { endMission(false, game.aar.reason); } catch (e) { errs++; if (errs < 3) console.log('AAR ERROR:', e.message); }
  }
  const st = game.stats;
  console.log(`bot[${seedLabel}] map${mapIdx}: end=${game.state} t=${st.time.toFixed(0)}s ` +
    `playerAlive=${game.player.alive} hostSec=${st.hostagesSecured} hostDead=${st.hostagesDead} ` +
    `kills=${st.kills} arrests=${st.arrests} squadLost=${st.squadLost} errors=${errs}`);
  return errs;
}
let totalErrs = 0;
for (let r = 0; r < 3; r++) totalErrs += botRun(0, 'r' + r);
for (let r = 0; r < 3; r++) totalErrs += botRun(1, 'r' + r);
for (let r = 0; r < 3; r++) totalErrs += botRun(2, 'r' + r);
for (let r = 0; r < 3; r++) totalErrs += botRun(3, 'r' + r);
for (let r = 0; r < 2; r++) totalErrs += botRun(4, 'r' + r);
for (let r = 0; r < 2; r++) totalErrs += botRun(5, 'r' + r);
console.log('BOT RUNS DONE, total update errors:', totalErrs);
