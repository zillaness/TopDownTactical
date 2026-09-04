#!/bin/bash
# file: run.sh (raycaster-poc/tests)
# version: 1.0
# author: Sam Cao
# created: 2026-09-04
# last_updated: 2026-09-04
# description: Extract the raycaster script from the HTML and run the headless assertions in Node.
# ai_update: Update last_updated and version. Append changelog at bottom.
set -e
cd "$(dirname "$0")"
GAME_HTML=$(ls ../raycaster_poc_v*.html | sort -V | tail -1)
python3 - "$GAME_HTML" <<'PYEOF'
import re, sys
src = open(sys.argv[1]).read()
m = re.search(r'<script>\n(.*)</script>', src, re.S)
open('game_extracted.js', 'w').write(m.group(1))
PYEOF
node --check game_extracted.js && echo "SYNTAX OK: $GAME_HTML"
cat stubs.js game_extracted.js tests.js > /tmp/rc_bundle.js && node /tmp/rc_bundle.js
# CHANGELOG
# v1.0 (2026-09-04): Initial harness.
