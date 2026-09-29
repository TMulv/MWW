# Design

Visual system for mulveyswoodworking.com, as built. Reference the owner pinned: pangaia.com (clean apparel-store grammar).

## Principles
- White space and big product frames do the work. Photos lead, copy is short.
- One maker talking: first-person copy, the cat mascot is the only illustration.
- The only color on the page is the category dots.

## Tokens (app/globals.css `@theme`)
| Token | Value | Use |
|---|---|---|
| `--color-ground` | `#ffffff` | Page |
| `--color-ink` | `#141414` | Text, buttons, announcement bar |
| `--color-muted` | `#5f5d59` | Secondary text (≥4.5:1 on white and frame) |
| `--color-line` | `#e4e1dc` | Hairline rules, borders |
| `--color-frame` | `#f1efec` | Photo frames, About panel, request section |
| `--color-catbg` | `#fcf5e5` | Frame behind the cat gif (matches the gif's own ground) |
| Selection | `#fcf0c9` | `::selection` |
| Error text | `#9a3b2f` | Form warnings/errors |

Category dots (lib/catalog.ts, from the mascot's palette): Puzzles `#7f9a86`, Figurines `#e0917c`, Engraving & Glass `#2f4057`, Flags `#b8453a`, Kids & Toys `#d9a53c`, Home & Garden `#6f9ab5`, Holiday `#7a5236`.

## Type
- One family: Schibsted Grotesk Variable (self-hosted via @fontsource-variable).
- Display: bold, tracking -0.03 to -0.035em, leading 0.9–1. Hero `clamp(3rem,7.4vw,6rem)`, section h2 `clamp(2rem,4vw,3.25rem)`.
- Body 15–18px, regular, leading-relaxed. Prices use tabular numerals (`.tabular`).

## Components
- **Buttons:** square corners, solid ink, white text, hover `#3a3a3a`. Secondary action is an underlined text link.
- **Header:** announcement bar (ink) + solid white sticky bar: nav left, logo badge + wordmark center, Instagram + Request right. Mobile adds a scrollable link row.
- **Category filter:** row of text tabs with a colored dot; active tab is ink with white text. URL param `?c=`.
- **Item card:** 4:5 frame, cover crop, second photo fades in on hover; name + "From $X" on one line, dot + category below.
- **Item page** (`/work/[id]`): gallery (contain-fit in frame, arrows, counter, thumbnail strip) with optional "Photos / Spin in 3D" tabs (`<model-viewer>`, only when `model` is set); sticky details column with title, price, description, black "Request this piece", hairline definition list.
- **Request form:** 48px bordered inputs, ink focus ring, labels above, optional fields marked "(optional)". Section on `frame` ground.
- **Icons:** lucide-react, stroke 1.75; Instagram is a local SVG in the same stroke.

## Motion
- One authored moment: the hero h1 rises 0.18em with an expo ease-out (already visible, transform only).
- Card hover: photo crossfade + 3% zoom. Everything respects `prefers-reduced-motion`.

## Don'ts
- No eyebrow/kicker labels, no cards-with-icons scaffolds, no gradients, glass, textures or drop shadows.
- No second typeface, no serif display, no cream page ground.
