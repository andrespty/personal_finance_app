# App icons

Sources for the app icons in `public/`. `icon.svg` (full-bleed) and
`icon-maskable.svg` (glyph inside the Android safe zone). The PNGs are rendered from them:

| File                           | Size     | Used by                     |
| ------------------------------ | -------- | --------------------------- |
| `apple-touch-icon.png`         | 180×180  | iPhone "Add to Home Screen" |
| `icon-192.png`, `icon-512.png` | 192, 512 | `manifest.webmanifest`      |
| `icon-maskable-512.png`        | 512      | Android adaptive icons      |

To regenerate after editing an SVG, render it at each size (e.g. open it in a
browser at that size and screenshot, or `rsvg-convert -w 180 -h 180 icon.svg`).
iOS rounds the corners itself, so keep the SVGs square and full-bleed.
