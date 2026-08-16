Verdict: PASS

# `debris_burst` critique

## Ordered event read

- Frame 01 is a compact, sharp grey-white breach flash at the registered centre. Its small mineral chips and hard radial dust edge read as the first masonry impulse, not a mature fireball or generic smoke cloud.
- Frame 02 expands from the same breach point into dense pale concrete/plaster dust. Multiple angular masonry chunks and narrow splinters are clearly visible on radial paths.
- Frame 03 is the widest, highest-energy beat. The dust and solid fragments have moved farther out in every direction, the angular broken-mineral faces remain readable through the cloud, and the centre stays visually anchored.
- Frame 04 removes the explosive radial spokes and replaces them with a lower, darker, settled rubble field around the same breach point. The remaining pale dust is thinner and lower-energy, while large fragments, small aggregate, and splinters visibly lie on the ground.

The family therefore reads as one continuous dust flash -> outward masonry throw -> maximum radial spread -> settling dust and grounded rubble event. It does not read as four unrelated effects. No orange/yellow/red flame, emissive core, sparks, or renewed fire growth is visible.

## Viewpoint, material, registration, and scale

- All four moments use a strict overhead tactical presentation with no horizon, scenery, floor plane, isometric camera, or angled blast column. Broken concrete/plaster, mineral aggregate, pale chalky dust, and a small number of structural splinters establish the intended material identity.
- Alpha-weighted centroids are `(360.83,349.79)`, `(375.01,349.71)`, `(349.77,347.35)`, and `(347.32,363.42)` in 700px cells. The visible centre remains anchored around the same breach point; the modest movement comes from asymmetric outward fragments rather than a centre jump.
- Alpha-weighted D95 diameters progress `188.44 -> 378.14 -> 572.80 -> 391.89` source pixels. This supports the visible compact flash, rapid expansion, widest throw, and contracted settling-rubble cadence.
- Metadata records `world_diameter_px: 64`, exactly two 32-world-pixel tiles. The 700px native cell canvas remains intentionally unscaled.

## Grid, alpha, and clipping

- The accepted source is one RGBA 2103x748 whole-family generation. It contains genuine transparency, transparent outer margins, and three fully unoccupied vertical runs at x `306-442`, `856-898`, and `1529-1624` above the alpha cutoff. There are no opaque panels, divider lines, labels, frame numbers, text, watermarks, or cross-cell debris.
- The unchanged normalizer inferred four ordered regions and produced four 700x700 cells. All 528,599 occupied RGBA pixels above alpha 8 were preserved as an exact multiset; every canonical PNG is byte-equivalent to its corresponding normalized cell.
- Frame alpha>8 bounding boxes are `[256,236,469,457]`, `[167,120,580,557]`, `[22,25,652,676]`, and `[135,155,563,577]`. Every cell border has alpha 0, including the widest frame 03, so no artwork is clipped.
- PNG composites on checkerboard, neutral gray, and black show clean isolated silhouettes without an opaque canvas haze or magenta fringe. Tiny warm hidden-RGB samples visible in alpha-naive viewers are not visible artwork when the alpha channel is composited correctly.

## Serialized-GIF review

- The actual saved GIF decodes to four unique 700x700 frames with transparency index `0`, `loop=0`, and durations `[70,90,120,200]` ms. This is an event preview; last-to-first continuity is not a pass gate.
- Expected ordered-mask occupancies are `[23256,89218,190380,95295]`; actual decoded-GIF opaque occupancies match exactly, with mismatch `[0,0,0,0]`.
- Source-to-GIF RGB mean absolute error is `1.78-2.21` channel values and RMSE is `2.30-3.05`, preserving the pale dust, grey masonry, dark mineral faces, and brown splinters without a material or palette shift.
- Conservative decoded-GIF screens find zero bright fire-like pixels and zero magenta/pink opaque pixels in every frame. Direct decoded-GIF contacts on checkerboard, gray, and black retain the complete debris topology, stable centre, outward progression, and settled-rubble beat without matte, disappearing chunks, clipping, or conspicuous palette corruption.

## Timing assessment

The 70ms flash is appropriately abrupt, 90ms and 120ms middle beats let the radial masonry throw expand without a frozen hold, and the 200ms final beat gives the settling dust and grounded rubble time to read. The three forward premultiplied-RGBA transition distances are `0.24969`, `0.30804`, and `0.30459`; all frames are materially distinct and no unintended duplicate hold is present.

## Decision

PASS. The complete four-frame family satisfies the strict overhead, masonry/plaster, dust-flash, outward-debris, settled-rubble, two-tile-scale, transparency, clipping, timing, uniqueness, serialized-GIF occupancy, and colour-retention gates. No whole-family regeneration is justified.
