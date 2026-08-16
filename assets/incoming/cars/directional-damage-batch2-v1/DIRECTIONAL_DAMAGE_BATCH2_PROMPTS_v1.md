# Directional Damage — Batch 2 Prompts v1

## Included identities

- taxi
- SUV
- police cruiser
- Humvee
- hatchback
- box truck

## Deliberately skipped repeats and terminal states

- grey sedan
- faded-red sedan
- pickup
- panel van
- burned wreck
- overturned car

The repeated vehicle identities already have directional-damage sets. The wreck and overturned car are terminal states rather than intact vehicles suitable for four directional branches.

## Orientation and filenames

All sprites use a strict 90-degree top-down view with the nose pointing right.

- `*_shot_front.png`: fire enters at the right/nose and exits at the left/rear.
- `*_shot_rear.png`: fire enters at the left/rear and exits at the right/nose.
- `*_shot_driver_side.png`: fire enters along the upper edge and exits along the lower edge.
- `*_shot_passenger_side.png`: fire enters along the lower edge and exits along the upper edge.

Each direction is an independent branch made from the intact source, not a cumulative damage ladder.

## Common damage prompt

> Edit this exact intact vehicle into a localized directional pass-through gunfire-damage branch. Concentrate approximately 70% of the visible damage on the entry face using denser bullet strikes, stronger dents, and localized broken glass. Add approximately 30% as fewer, cleaner, aligned exit punctures with lighter outward deformation on the opposite face. Keep the broad middle and unrelated panels mostly intact, with at least 60% of the vehicle visually undamaged. Preserve the exact vehicle model, paint and wear, wheelbase, trim, wheels, equipment, strict 90-degree top-down view, nose pointing right, scale, placement, lighting, and silhouette. Use genuine transparent alpha. No global or symmetrical damage, random hits outside the trajectory, burn, scorch, fire, smoke, scenery, added text, logos, or watermark.

## Identity locks

### Taxi

Preserve the yellow sedan, roof taxi sign and existing lettering, checker details, windows, and proportions.

### SUV

Preserve the dark-green taller body, long roof, roof rails, window layout, and larger proportions.

### Police cruiser

Preserve the black-and-white livery, existing insignia and markings, red/blue lightbar, push bumper, spotlights, and antenna. Do not move, remove, replace, or invent emergency equipment.

### Humvee

Use armor-appropriate damage: impact cups, chipped coating, scraped bare metal, shallow plate deformation, and only limited penetrations. Preserve the tan armored body, turret ring and hatch, roof plates, hinges, rear spare tire, fuel cans, storage boxes, stowed bag, racks, and armored windshield sections. The entry side remains visibly worse, but armor stops many rounds; the opposite side receives only a small aligned exit group. At least 65% remains visually undamaged.

### Hatchback

Preserve the pale mint-white paint, rounded compact body, short wheelbase, small wheels, antenna, window layout, and rear hatch. Never enlarge it or turn it into a sedan.

### Box truck

Preserve the pale-green compact cab, long rectangular cargo box, cab/box separation, rivet rows, panel seams, corner caps, cab roof ribs, windshield, and mirrors. Never shorten, widen, open, or reshape the box, and never add cargo-box windows or branding.

## Output handling

Assets were generated serially, one vehicle identity at a time, using built-in ImageGen. Final PNGs use the intact source's dimensions and alpha silhouette. Two passenger-side renders required deterministic localization of the generated impact pixels over the untouched source sprite to remove placement fringe while retaining the approved damage pattern.
