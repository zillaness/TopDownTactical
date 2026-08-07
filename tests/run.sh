#!/bin/bash
# file: run.sh (top-down-tactical/tests)
# version: 1.0
# author: Sam Cao
# created: 2026-08-07
# last_updated: 2026-08-07
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
# CHANGELOG
# v1.0 (2026-08-07): Initial harness — smoke tests + assault-bot runs.
