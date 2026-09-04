# Raycaster tactical asset library

Authored first-person assets for the `claude/raycaster-poc` adaptation. Every
damage ladder shares its aperture geometry with player sight, bullets, enemy
detection, and movement rather than using decorative damage alone.

## Implemented slices

### Drywall

Four stages: intact, punctured, opened, breached. Includes 1254×1254 masters,
256×256 runtime textures, 64×64 four-channel logic masks, manifest, and prompts.

### Closed wood door

Four stages: intact, punctured, opened, breached. Includes 1254×1254 masters,
256×256 runtime textures, 64×64 four-channel logic masks, manifest, and prompts.
Door pose is intentionally separate from damage state.

### Floor-to-ceiling glass partition

Four stages: intact, punctured/cracked, opened/shattered, and breached. Uses a
two-material pipeline: translucent pale-cyan glass remains visible and
ballistically resistive, while actual holes use zero-alpha open air. Includes a
separate glass-coverage mask so shots through intact glass can deflect and lose
energy without blocking sight.

### Grey sedan — eight bearings

An intact eight-view raycaster billboard set derived from the repository's grey
sedan identity. Each bearing has real-alpha background, translucent automotive
glass, opaque-body and glass masks, a shared tire-contact anchor, physical-height
normalization, and an oriented cover-volume manifest. The included composite
demonstrates a hostile remaining visible through the windows while the lower
door body occludes them.

## Shared stage semantics

- **Intact:** blocks sight, shots, detection, and movement.
- **Punctured:** exact player sight/shot holes; AI cannot acquire through them.
- **Opened:** substantial sight/shot aperture; AI acquisition is delayed;
  movement remains blocked.
- **Breached:** normal sight/detection and a traversable floor-level gap where
  the material permits it.

Final asset PNGs use real alpha. Files ending in `_key.png` retain the flat
magenta source openings so the extraction is reproducible.
