Verdict: PASS

# `gas_pop` critique

## Visual judgment

The accepted v17 whole-family source is a strict overhead tactical canister event with a stable circular olive-grey metal top, a cream central vent, and pale sickly yellow-green vapor. Frame 1 is a short narrow vent. Frame 2 opens into a loose, transparent trace around the same source; frame 3 reaches wider with broken feathery turbulence; frame 4 continues outward while fading into sparse hanging residuals. The family reads as one initial CS release, not four variants and not the sustained engine-drawn gas volume. There is no fire, flash, sparks, debris, ground plane, checker residue, fantasy glow, slime, text, or visible side-face perspective.

Checkerboard, neutral-gray, and black review of both canonical PNGs and frames decoded from the actual GIF passes at native resolution and after mapping each cell to the configured 48-world-pixel sprite. Frame 4's alpha-above-8 box is `35.38 x 40.62` runtime pixels and its D95 diameter is `31.90` runtime pixels within that 48px canvas. Relative to frame 3, vapor alpha mass falls `45.58%` and vapor mean alpha falls `59.51%`, even as the footprint grows. It therefore reads as a wider but materially thinner hanging trace rather than a filled late billow.

Direct runtime comparison with accepted `smoke_pop` confirms the required distinction. Gas vapor runtime-equivalent alpha mass is only `0.35x`, `0.52x`, `0.54x`, and `0.34x` smoke across frames 1-4. Vapor mean alpha is `0.84x`, `0.53x`, `0.53x`, and `0.34x`; bbox fill is lower in every frame. The gas is visibly airier and more open, while its chromatic vapor stays near `60.11-63.27 degrees` hue with `98.70-99.11%` of alpha weight in the documented yellow-green class. This hue is intentional CS art, not an olive palette defect.

## Approved registration correction and alpha audit

V17 passed the independent material, cadence, viewpoint, scale, and actual-GIF screen but originally failed fixed-source continuity. Common-origin normalization placed the four inferred source regions into unchanged 559px cells, preserving every source-region byte and every one of the `256,948` pixels above alpha 8. Its shared `[82,641)` y-band crop omitted exactly `215` nonzero pixels, all alpha 1 and none above cutoff.

After independent Task 9B review, the four complete RGBA cells were rigidly translated inside their unchanged canvases by ordered offsets `[(14,0),(-25,0),(-20,0),(-29,0)]`. Retained RGBA bytes are exact, every newly exposed strip is literal `(0,0,0,0)`, and the alpha>8 RGBA multiset/count remains exact. Translation clips `0`, `204`, `12`, and `87` pixels by cell: exactly `303` pixels total, all alpha 1, zero above cutoff, or `1.1882` opaque-pixel equivalents across the family. The earlier 179 forecast sampled the wrong source edge for negative x offsets and is superseded by this independently reproduced audit.

Corrected cream-vent centroids are `[(279.509,281.924),(279.716,280.183),(279.113,280.529),(279.746,280.004)]`. X spans only `0.633px` (`0.113%` of a cell, `0.054` runtime pixels); y spans `1.921px` (`0.344%`, `0.165` runtime pixels). Native/runtime contacts show the canister locked in place with no visible art, cadence, footprint, or material change. The immutable raw v17 family, common-origin stage, corrected stage, audit, and before/after evidence remain preserved.

## Canonical alpha, public sheet, and serialized GIF

- Canonical normalized RGBA is byte-identical to the independently approved corrected stage (`SHA-256 cc546f815a503d8dc365fc379189ef92e40ea17cf61091eb44afb43411fd0c93`). Every canonical PNG is byte-identical to its corresponding normalized cell; all four PNGs are unique and all borders are clear above alpha 8.
- `prepare_transparent_sheet.py` required zero padding and wrote a `2236 x 559` RGB public sheet. It is pixelwise identical to compositing canonical RGBA over exact `#FF00FF`; every alpha-zero source position and all four corners are exact magenta.
- Metadata and actual GIF structure are exact: four `559 x 559` frames, durations `[90,110,140,190]` ms, `loop=0`, transparency index `0`, and `world_diameter_px: 48`.
- Post-translation production ordered-mask occupancy is `[15588,29444,44350,26595]`. The actual decoded GIF matches each mask exactly, with zero occupancy difference and zero XOR pixels in every frame.
- Source-to-GIF RGB MAE is `1.85-2.16` channel values and hue MAE is `3.13-4.20 degrees`. Yellow-green classification mismatch is only `0.65-2.61%`, so the required sickly hue is preserved with low serialization error.
- Decoded frames contain zero visible magenta/pink pixels, zero cyan pixels, zero visible border pixels, and no matte. Sparse source-side diagnostic pixels reach only alpha 9 in the broad magenta/pink class and are not visible in any composite or decoded GIF.

## Whole-family history and decision

Nineteen primary candidates plus two alternate complete families are preserved. All image-model calls produced or edited one complete 4x1 family; no individual frame was generated, art-edited, replaced, trimmed, resized, or algorithmically keyed from an opaque composite. Rejected candidates are retained for structural and semantic audit, including opaque black/checker returns from reference workflows, dense billows, slime/tendril reads, geometric fragments, round puffs, upright-plume perspective, scale failures, and unresolved source drift.

PASS. The approved v17 derivative satisfies the complete-family, strict overhead, fixed-source, vent-to-wispy-spread, late-thinning, yellow-green CS, 48-world-pixel, transparency, public-magenta, clipping-audit, timing, uniqueness, ordered-mask, and actual-GIF gates. The correction is deterministic, independently reviewed, and limited to the explicitly approved whole-cell translations; no regeneration is warranted.
