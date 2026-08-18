---
file: README.md (top-down-tactical/assets/incoming/sound)
version: 1.0
author: Sam Cao
created: 2026-08-18
description: Where recorded sound effects go, and what they have to be called.
ai_update: Update last_updated and version. Append changelog at bottom.
---

# Drop sounds here

The game already makes every noise it needs from oscillators and filtered
noise. This folder is how a **recorded** sound replaces a synthesised one, one
at a time. Nothing here is required, and the build works forever with this
folder empty.

## Verified: the files are not reachable from any sandbox

Searched, not assumed (2026-08-18): no `N:` drive, no network mount, no
`/mnt` or `/media` share, and no audio file anywhere in the container except
LibreOffice's clip-art gallery. There is nothing here to inline. The only step
that cannot be automated is the copy.

## Why this folder exists rather than the work being done

The files are on `N:\gun sound effects`, which is a drive on Sam's machine. No
sandbox can see it, so the work stopped there — and it looked like a coding
task when it is a copy-and-run task. The wiring has been finished since v0.62;
`tools/inline_sound.py` is the run half. Copy the files in, run one command.

```
python3 tools/inline_sound.py assets/incoming/sound top_down_tactical_vX.Y.html
python3 tools/inline_sound.py assets/incoming/sound top_down_tactical_vX.Y.html --write
```

It dry-runs by default and prints what each key costs.

## Naming

**The stem of the filename is the sound.** It has to be one of the twelve the
game actually makes, because `sfxAt()` looks in `SOUND_ART` first and falls
through to the oscillators when it finds nothing — a file called anything else
is a file that is never played and nobody would ever notice.

| key | what it is |
|---|---|
| `shot` | any gunshot. The distance, pan and muffling model is applied on top |
| `kick` | a door taking a boot |
| `breach` | a demolition charge, and the wall charge |
| `bang` | a flashbang going off |
| `shout` | a challenge, a callout, a bark |
| `hit` | a round finding a body |
| `thud` | a body hitting the floor |
| `door` | a door swinging |
| `glass` | a window breaking, and a camera being sniped |
| `click` | dry fire, and the small mechanical UI sounds |
| `surrender` | hands going up |
| `plate` | a round stopped by armour or a bunker |

```
shot.ogg              -> one recorded gunshot
glass.1.ogg
glass.2.ogg
glass.3.ogg           -> three, picked at random per play
shot.gain             -> a plain text file containing e.g. 0.8
```

Variants matter more than fidelity. Thirty rounds of the same file sounds like
a machine; three files at random does not, and the player already gets a small
random pitch shift on every play.

## Format and budget

**Opus in OGG, or AAC in MP4.** A gunshot at 48kbps mono is indistinguishable
from 700kbps of PCM and costs a fifteenth as much.

The deliverable is one self-contained HTML file with a hard ceiling of 2MB, the
test suite fails if it goes over, and `inline_sound.py` refuses to write a set
that would break it. Base64 costs a third on top of the raw file size and that
is counted. As of v0.76 there are about **115KB of headroom** — enough for a
dozen short Opus samples, not enough for one WAV.

WAV is accepted and warned about.

## CHANGELOG
- v1.0 (2026-08-18): Written so the drop is unblocked on everything except the
  files themselves.
