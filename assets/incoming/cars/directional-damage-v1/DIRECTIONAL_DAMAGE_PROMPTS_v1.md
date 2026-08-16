# Directional Vehicle Damage Prompts v1

## Scope

This set contains four alternative gunfire-damage branches for each of four vehicle identities:

- grey-blue sedan
- faded-red sedan
- pickup truck
- panel van

Each branch starts from the intact vehicle. The four directions are alternatives, not cumulative damage stages. Assets were generated serially, one vehicle identity at a time, to preserve model and texture continuity.

## Orientation

All sprites use a strict 90-degree top-down view with the vehicle nose pointing right.

- `front`: fire enters at the right/nose and exits at the left/rear.
- `rear`: fire enters at the left/rear and exits at the right/nose.
- `driver_side`: fire enters along the upper edge and exits along the lower edge.
- `passenger_side`: fire enters along the lower edge and exits along the upper edge.

## Ballistic damage rule

Incoming fire creates a pass-through pattern instead of leaving the opposite side pristine:

- approximately 70% of the visible damage is concentrated on the entry face;
- approximately 30% appears as a smaller, sparser, aligned exit cluster on the opposite face;
- entry damage uses denser bullet strikes, stronger dents, and localized broken glass;
- exit damage uses fewer, cleaner punctures and lighter outward deformation;
- at least 60% of the vehicle remains visually undamaged;
- the broad middle and unrelated panels stay mostly intact;
- no global, random, or symmetrical damage; no fire, smoke, scorch, or burn.

## Common identity-preservation prompt

> Edit the exact intact vehicle supplied as the identity reference. Preserve its model, paint and wear, geometry, wheelbase, trim, wheels, strict 90-degree top-down view, nose pointing right, scale, placement, lighting, and silhouette. Apply localized pass-through gunfire damage only along the named trajectory. Make the entry face visibly worse and add a lighter aligned exit cluster on the opposite face. Keep at least 60% visually undamaged. Use true transparent alpha with no checkerboard, backdrop, floor, scenery, text, logos, or watermark.

## Vehicle-specific locks

### Grey-blue sedan

Preserve the exact grey-blue paint, trim, sunroof, window layout, wheelbase, and body proportions.

### Faded-red sedan

Preserve the exact boxy model, faded red paint, rust and wear pattern, trim, wheelbase, and body proportions.

### Pickup truck

Preserve the exact cab, open bed, ribbed bed floor, tailgate, bed rails, wheelbase, and wheels. Never cover or close the bed.

### Panel van

Use the corrected dirtier, duller off-white intact van as the identity and brightness reference. Preserve its layered grey-brown road grime, oily seam streaks, dusty roof patches, oxidation, chips, and lower-edge dirt. Keep visible-metal brightness close to the game's 120 anchor. Preserve the long windowless cargo body, roof ribs and seams, cab/body transition, rear cargo doors, wheelbase, and wheels. Never add cargo-side windows, branding, or roof equipment.

## Filenames

Each vehicle folder contains:

- `*_shot_front.png`
- `*_shot_rear.png`
- `*_shot_driver_side.png`
- `*_shot_passenger_side.png`

All deliverables are transparent PNG sprites.
