#!/bin/bash
# file: run.sh (top-down-tactical/tests)
# version: 1.1
# author: Sam Cao
# created: 2026-08-07
# last_updated: 2026-08-15
# description: Extract the game script from the HTML and run the headless smoke tests and assault-bot playthroughs in Node.
# ai_update: Update last_updated and version. Append changelog at bottom.
set -e
cd "$(dirname "$0")"
GAME_HTML=$(ls ../top_down_tactical_v*.html | sort -V | tail -1)
python3 - "$GAME_HTML" <<'PYEOF'
import re, sys
src = open(sys.argv[1]).read()
m = re.search(r'<script>\n(.*)</script>', src, re.S)
open('game_extracted.js', 'w').write(m.group(1))
PYEOF
node --check game_extracted.js && echo "SYNTAX OK: $GAME_HTML"
cat stubs.js game_extracted.js tests.js > /tmp/tdt_bundle.js && node /tmp/tdt_bundle.js
cat stubs.js game_extracted.js bot.js > /tmp/tdt_botbundle.js && node /tmp/tdt_botbundle.js
# The art tooling carries its own fixtures and its own dependencies. Skip it
# cleanly rather than failing a game-side run on a machine without pillow —
# but run it here, because a tool nobody runs is a tool that has already rotted.
if python3 -c "import PIL, numpy" 2>/dev/null; then
  python3 ../tools/test_alpha_repair.py
else
  echo "ALPHA REPAIR TEST SKIPPED (pip install pillow numpy)"
fi
# CHANGELOG
# v1.0 (2026-08-07): Initial harness — smoke tests + assault-bot runs.
# v1.1 (2026-08-15): Runs the alpha-repair fixtures too, skipping if pillow is absent.
