#!/usr/bin/env python3
"""
file: repo_size.py (top-down-tactical/tools)
version: 1.0
author: Sam Cao
created: 2026-08-18
description: Measure where the repository's weight actually is, and print the
             exact command for each way of dealing with it. Runs none of them.
ai_update: Update last_updated and version. Append changelog at bottom.

THIS TOOL DELETES NOTHING, AND IT IS NOT ALLOWED TO.

CLAUDE.md reserves this decision: "Ask first only when the change is genuinely
destructive (history rewrite, purging assets/, deleting the repo's past)." Those
are the three things on this menu, so the menu is all this prints. It exists
because "the repo is too big" kept being carried forward as an open item when it
was never work — it was a choice nobody had been given the numbers for.

    python3 tools/repo_size.py

WHAT THE NUMBERS MEAN

assets/incoming is the raw art from the generators: PNG masters at 2-4MB each.
assets/source is the intermediate WebP, and it is what actually gets inlined —
104 of the pictures in the build are byte-identical to a file in there. So the
masters are not needed to BUILD; they are needed to re-encode at a different
quality, to re-crop, or to repair alpha. Losing them is losing the ability to
change your mind about the art, which is why this is a decision and not a chore.

Repacking recovers nothing. PNG is already deflate, so git's pack is within a
couple of percent of the files on disk — the tool prints both so you can see it
rather than take it on faith.
"""
import os
import subprocess
import sys


def sh(*cmd):
    try:
        return subprocess.run(cmd, capture_output=True, text=True, timeout=120).stdout.strip()
    except Exception:
        return ""


def du(path):
    total = 0
    for root, _dirs, files in os.walk(path):
        for f in files:
            try:
                total += os.path.getsize(os.path.join(root, f))
            except OSError:
                pass
    return total


def mb(n):
    return f"{n / (1024 * 1024):,.0f}MB"


def main():
    root = sh("git", "rev-parse", "--show-toplevel")
    if not root:
        sys.exit("not a git repository")
    os.chdir(root)

    git_dir = du(".git")
    incoming = du("assets/incoming") if os.path.isdir("assets/incoming") else 0
    source = du("assets/source") if os.path.isdir("assets/source") else 0
    builds = [f for f in os.listdir(".") if f.startswith("top_down_tactical_v") and f.endswith(".html")]
    build = os.path.getsize(builds[0]) if builds else 0
    tree = du(".") - git_dir

    counts = sh("git", "count-objects", "-vH")
    pack = next((l.split(":", 1)[1].strip() for l in counts.splitlines()
                 if l.startswith("size-pack")), "?")

    print("WHERE THE WEIGHT IS")
    print(f"  the deliverable            {mb(build)}   {builds[0] if builds else '-'}")
    print(f"  assets/source              {mb(source)}   what actually gets inlined")
    print(f"  assets/incoming            {mb(incoming)}   raw PNG masters, "
          f"{sum(1 for _ in (f for _r, _d, fs in os.walk('assets/incoming') for f in fs)) if incoming else 0} files")
    print(f"  working tree               {mb(tree)}")
    print(f"  .git                       {mb(git_dir)}   pack {pack}")
    if incoming:
        print(f"\n  git's pack is {pack} against {mb(incoming)} of PNG on disk — repacking")
        print("  recovers nothing, because PNG is already deflate. `git gc` is not an option,")
        print("  it is a no-op.")

    print("\nTHE THREE OPTIONS. This tool runs none of them.")
    print(f"""
  1. LEAVE IT.                          tree {mb(tree)}   .git {mb(git_dir)}
     Costs a slow clone. Loses nothing.

  2. DELETE THE MASTERS FROM THE TREE.   tree ~{mb(tree - incoming)}   .git {mb(git_dir)}
     git rm -r --cached assets/incoming && echo 'assets/incoming/' >> .gitignore
     git commit -m 'Stop tracking the raw art masters'
     REVERSIBLE — every byte is still in history, and `git checkout <sha> --
     assets/incoming` brings them back. Does not shrink the clone.

  3. REWRITE HISTORY.                    tree ~{mb(tree - incoming)}   .git ~5MB
     git filter-repo --path assets/incoming --invert-paths
     NOT REVERSIBLE. Destroys the only lossless originals, rewrites every commit
     SHA, and breaks every existing clone and every link to a commit. CLAUDE.md
     says do not do this without Sam saying so in as many words.

  A fourth, if the masters matter but the clone does too: push assets/incoming to
  a separate repository or a release asset first, THEN option 3. That keeps the
  originals and the fast clone, at the cost of a second place to look.""")


if __name__ == "__main__":
    main()

# CHANGELOG
# v1.0 (2026-08-18): Written to turn a standing open item into a decision with
#   numbers attached. Prints commands; runs none of them, by design.
