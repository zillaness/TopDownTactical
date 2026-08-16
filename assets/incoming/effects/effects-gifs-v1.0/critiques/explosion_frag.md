Verdict: PASS

Task 1E's shared-palette GIF rerun is accepted from the unchanged normalized whole-family RGBA source.

- Visual sequence: the row-major 4x2 family remains coherent and top-down: compact white-yellow ignition (01), orange fireball and fragment expansion (02–03), then neutral grey-brown smoke/dust (04–06) that thins into plausible settling decay (07–08). Centre, scale, and style are stable; frame 08 is a sparse, neutral final residue rather than an opaque coloured cloud.
- Alpha/fringe QA: the actual serialized GIF was rendered on a checkerboard, and the canonical PNG contact sheet was physically alpha-composited on checkerboard and black. Neither has a material green, rose, or olive fringe. In the serialized GIF, opaque rose-like (`R > G` and `B >= G`) counts and opaque olive-like (`R == G > B`) counts are both `[0, 0, 0, 0, 0, 0, 0, 0]` across frames 01–08.
- GIF fidelity: its ordered opaque-mask occupancy exactly matches the normalized source: `[2296, 21599, 78089, 61424, 61100, 47214, 26369, 7402]`. It has eight 459x459 frames, binary alpha (0/255), transparency index 0, `loop=0`, and durations `70, 70, 80, 90, 110, 140, 180, 240` ms.
- Packaging: canonical frames, contact sheet, GIF, and metadata agree; there is no duplicate `outputs/effects-gifs-v1.0/explosion_frag` subtree. The public RGB sheet uses `#FF00FF` at all four corners as required, while `work/effects_gif_pipeline/normalized-alpha/explosion_frag.png` is the internal RGBA processing source.
- Scale semantics: `world_diameter_px: 64` means the two-tile runtime display diameter (2 x 32 world pixels); it does not resize or trim the preserved high-resolution 459px native cells.
- No image generation, normalizer run, individual-frame art edit, or Git action occurred in this rerun.
