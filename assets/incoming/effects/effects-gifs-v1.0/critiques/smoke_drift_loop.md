Verdict: PASS

# `smoke_drift_loop` critique

## Whole-family generation and review history

- The canonical source is v5, generated as one complete 4x2/eight-frame family in one built-in ImageGen call. No frame was generated, edited, painted, resized, trimmed, recentered, or replaced independently.
- Earlier whole-family candidates remain preserved. V1 failed row registration and the loop seam. V2 corrected registration but failed independent review because large internal redraws were separated by a `4 -> 5` near-hold. V3 fixed within-row phase spacing but reintroduced a 32.8px row shift; v4 reduced that shift but still triggered the explicit evenness screen at `4 -> 5 = 1.517x` the median. The controller ruled that the approved plan's whole-sheet-regeneration requirement governs and imposes no attempt cap, so v5 targeted only square-cell geometric registration while preserving the improved phase cadence.
- V5 shows exactly eight strict-overhead, neutral grey-white smoke patches in row-major order. It has no ground plane, cast shadow, fire, debris, emission source, directional plume, panel, divider, label, frame number, text, watermark, magenta/pink artwork, or cross-cell material.
- The same complex distribution of many similarly weighted soft folds remains recognizable across adjacent frames. Local billows curl, merge, soften, and split without wholesale replacement of the bright/dark lobe map. No single lobe, hole, ring, spiral, tail, stem, or isolated puff dominates the loop as a trackable landmark.
- Runtime scale is explicitly `world_diameter_px: 64`, equal to two 32-world-pixel tiles. The native 447x447 source-cell canvases remain intentionally unscaled.

## In-place motion and seam verdict

- I inspected the individual PNGs, canonical contact sheet, and frames decoded from the actual serialized GIF over checkerboard, neutral gray, and black. I reviewed full-loop and focused `7 -> 8 -> 1 -> 2` evidence at native 180 ms and slowed 720 ms cadence.
- The outer envelope, centre, apparent area, density, luminance, and neutral-grey balance remain pinned while internal folds deform by comparable modest amounts. There is no net drift, growth, contraction, fade, rotation, density reset, brightness reset, or colour reset.
- Contact-based topology review passes every adjacent pair, including `4 -> 5`: persistent upper, side, and lower fold groups move locally through the row boundary rather than freezing or being redrawn wholesale. All seven interior transitions fall inside the controller's inclusive `0.65–1.5x` median screen; none is flagged.
- The focused `7 -> 8 -> 1 -> 2` sequence closes smoothly. Frame 8 is close to frame 1 but visibly and byte-wise distinct, then frame 1 continues onward into frame 2. The seam is smaller than ordinary interior deformation without being an identical hold, and there is no visible registration, silhouette, density, brightness, or palette jump.

## Quantitative loop screening

Metrics are screening evidence only; the contact-based topology and seam judgments above remain decisive.

- Apparent alpha-above-8 area is `102,184–104,595 px`, around a median of `103,975.5 px` (about `-1.7%/+0.6%`).
- Alpha mass is `88,300.58–92,070.99`, around a median of `91,398.29` (about `-3.4%/+0.7%`).
- Alpha-weighted D95 diameter is `338.07–342.95 px`, around a median of `341.92 px` (about `-1.1%/+0.3%`).
- Alpha-weighted centroid ranges only `2.96 px` in x and `2.96 px` in y within the 447px cells.
- Alpha-weighted mean smoke luminance is `0.6382–0.6542`. Mean neutral channel spread is `0.01023–0.01072`, and R-minus-B bias remains a small stable `0.00982–0.01038`; no frame has a perceptible colour-temperature reset.
- Premultiplied RGBA interior transition distances are `[0.08834, 0.07135, 0.07023, 0.06991, 0.05038, 0.08059, 0.09404]`, with ratios to the `0.07135` median of `[1.238, 1.000, 0.984, 0.980, 0.706, 1.129, 1.318]`. The explicit evenness screen flags no transition.
- The 8->1 seam is `0.03159`: `0.443x` the median interior distance and `0.336x` the maximum interior distance. All eight PNG pixel hashes are unique.

## Alpha, chroma, topology, and serialized GIF

- The v5 RGBA source has 650,561 fully transparent pixels; all four outer corners are alpha zero. Inferred inter-cell gutter maxima are `[6,8,8]` on x and `[7]` on y, so no artwork above the approved cutoff crosses a cut and there is no canvas-wide alpha haze.
- Normalization preserved all 829,236 source pixels above the alpha cutoff and used family-level transparent padding only. Every canonical PNG is byte-identical to its normalized-source cell.
- The public source is 1788x894 RGB with exact `(255,0,255)` at all four corners. The internal 1788x894 RGBA source remains the processing artifact.
- The actual saved GIF reopens as eight 447x447 frames with transparency index `0`, `loop=0`, and durations `[180,180,180,180,180,180,180,180]` ms.
- Expected ordered-alpha-mask occupancy is `[88920,90743,91973,92484,92794,92586,92280,89456]`; decoded GIF occupancy matches exactly in every frame.
- Decoded GIF frames contain zero saturated rose-like, saturated olive-like, or high-chroma opaque pixels. RGB mean absolute error against selected source pixels is at most `1.51` levels with a 95th-percentile absolute error of `3` levels. Checkerboard, gray, and black composites show no magenta fringe, coloured palette blotch, opaque matte, clipping, or disappearing topology.

## Evidence

- Numeric record: `work/effects_gif_pipeline/qa/smoke_drift_loop_metrics.json`
- PNG composites: `smoke_drift_loop_png_contact_checkerboard.png`, `smoke_drift_loop_png_contact_gray.png`, and `smoke_drift_loop_png_contact_black.png`
- Actual-GIF composites: `smoke_drift_loop_gif_contact_checkerboard.png`, `smoke_drift_loop_gif_contact_gray.png`, and `smoke_drift_loop_gif_contact_black.png`
- Native and slowed actual-GIF playbacks exist for all three backgrounds.
- Focused seam artifacts: `smoke_drift_loop_seam_7812_checkerboard.png`, `smoke_drift_loop_seam_7812_checkerboard_native.gif`, `smoke_drift_loop_seam_7812_checkerboard_slow.gif`, and `smoke_drift_loop_seam_78_81_12_diff_x3.png`
- Prior independent rejection preserved at `work/effects_gif_pipeline/sdd/task-6-review.md`; v3/v4 normalization diagnostics are preserved under `work/effects_gif_pipeline/diagnostics/`.
