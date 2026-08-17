<!--
  file: CLAUDE.md
  version: 1.0
  author: Sam Cao
  created: 2026-08-17
  last_updated: 2026-08-17
  description: Working agreement for Claude sessions on TopDownTactical — how to ship, what must agree with what, and the traps that have already cost a session.
  ai_update: Update last_updated and version. Append changelog at bottom.
-->

# TopDownTactical — working agreement

## Shipping: publish when ready, don't ask

**Standing instruction from Sam (2026-08-17): a finished version goes live.**
Do not stop at the feature branch and ask. The loop is:

1. Develop on the designated `claude/…` branch.
2. Bump the version (see below) and get `./tests/run.sh` to **0 WRONGs**.
3. Commit, push the branch.
4. `git checkout main && git merge --ff-only <branch> && git push origin main`.
5. Re-run the suite **on main before pushing it**, not just on the branch.

GitHub Pages serves `main` at https://zillaness.github.io/TopDownTactical/,
so step 4 is the publish. Fast-forward only — keep history linear.

Ask first only when the change is genuinely destructive (history rewrite,
purging `assets/`, deleting the repo's past), not for ordinary releases.

Note: the sandbox proxy 403s on `github.io`, so you cannot curl the live page
to confirm. Verify via the GitHub API instead — check that `main` lists exactly
one `top_down_tactical_vX.Y.html` and that `index.html` redirects to it.

## Version bumps — six things must agree

A test enforces all of it. **Run bumps from the repo root**; doing it from
`tests/` silently half-applied one and pushed a partial state to main.

| # | Where |
|---|---|
| 1 | the filename itself |
| 2 | `file:` in the HTML frontmatter |
| 3 | `version:` in the frontmatter |
| 4 | `<title>` |
| 5 | the menu `<h2>` |
| 6 | the newest changelog entry, plus `index.html`'s redirect |

There must be **exactly one** `top_down_tactical_vX.Y.html` in the repo.

## Tests

`./tests/run.sh` **from the repo root**. Success is `0 WRONGs` and
`total update errors: 0`. It never calls `render()` — anything visual must be
checked in Chromium at `/opt/pw-browsers/chromium-1194/chrome-linux/chrome`
(Playwright installs into the scratchpad; do not `playwright install`).

**When a test fails, decide which is wrong — the code or the test.** Both have
happened here. Two real cases worth remembering:

- The vehicle orientation test asserted *"every car points right"*, which was
  only ever true by accident of how the maps were drawn. The moment a car was
  deliberately laid across a street it failed. **The test was wrong**; it now
  asserts that a nose is wherever its own engine is.
- Cover placed near THE TREELINE's spawn dropped covering rounds from 8 to 5.
  **The code was wrong** — cover blocks sight *both ways*, so it sat on the
  squad's own firing lane.

## Hard constraints

- **One self-contained HTML file.** Art inlined as data URIs. No external
  requests, ever.
- **Byte ceiling ~1.5–2MB.** Currently ~2.19MB and over. Every art drop must
  be measured, not estimated.
- Art authored at **2x** (one 32px tile = 64px), vehicles nose-**RIGHT**,
  alpha-first with **magenta** as the named fallback key.
- **WebP over indexed PNG** for photographic art — but measure. It was 3x on
  car frames and only 7% on doors, where container overhead dominates.
- Commit footer: `Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>` plus
  the `Claude-Session:` line. **Never a raw model ID** in anything pushed.

## World scale

`TILE = 32`, a man is `r = 9`. **One tile ≈ one metre.** Use it: a 2x1 "car"
is 1.8m — a golf cart — which is how twelve undersized vehicles were found.
Every vehicle is 4x2 (2x4 on end).

## Design rules already settled — do not relitigate

- Passable prop materials **must** have `resist: 0`. A standable tile with
  resist above zero makes the man on it unhittable (measured 0/20 vs 40/40)
  and reads as perfect cover to the AI.
- The engine block is unreachable by any damage path: `materialAt(hood)` is
  `MATERIALS.engine` by object identity at every rung. Humvee (999) and police
  cruiser (IIIA, 20) are the only exceptions, and armour degrades at `shot_up`.
- Vehicle damage is directional; stage and face count are **monotonic**, so
  damage can never appear to heal.
- **Trees stay as they are** (2026-08-17). `resist: 22`, `opaque`,
  `dmgKeep: 0.55`: hard cover against pistol and shot, concealment-that-bleeds
  against rifles. Sam considered a trunk/foliage split and explicitly declined.
- Objects the fog must not eat are drawn **above** it, gated on `seen.grid` and
  dimmed when only remembered — cars, trees, doors, windows, turrets.
- The squad may act without orders **only** when shot at, and `roe: "hold"` is
  the player's off switch. Never on stack, entry, aid, turret, the set element
  of a bound, or PEEL/SUPPRESS/WALLBREACH.

## Traps

- **Codex pushes art to its own branches, never main.** Always
  `git fetch --all --prune` and search every branch before concluding a drop
  didn't land.
- `d.locked` is cleared when a door opens **and** when it is breached. Never
  infer material from it — capture at parse time, or a steel door becomes
  plywood the instant you get through it.
- Enemy facing is **randomised at spawn**, so "did I start in combat?" is a
  coin flip and cannot be fixed with cover alone. `TUNE.missionSettle` gives
  the opening beat; noise and gunfire are deliberately exempt.
- The repo is ~681MB (raw art in `assets/incoming/` plus the same again in
  history) against a ~2.2MB deliverable. Purging is **unresolved** — ask.

# CHANGELOG
# v1.0 (2026-08-17): First written down, at the point Sam said finished
#   versions should just go live rather than waiting on a branch.
