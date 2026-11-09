# Anjana Rodrigo — Portfolio

A responsive portfolio for a mining engineer and software developer, and the front door for **MineBook** ([minebook.lk](https://minebook.lk)). The site is strictly black and white on a white canvas; the hero is a real-time three.js model of an open-pit mine, and the only colour on the page is product imagery.

## Technology

- Vite
- three.js (hero scene, loaded on demand)
- React 18
- TypeScript
- Tailwind CSS
- shadcn/ui-compatible components
- Radix UI primitives
- Lucide icons

## Run locally

```bash
npm install
npm run dev
```

Open the local address shown by Vite, normally `http://localhost:5173`.

## Production build

```bash
npm run build
npm run preview
```

## Project structure

```text
src/
  components/
    ui/              shadcn-compatible primitives
    site/Header.tsx      responsive navigation
    site/MineCanvas.tsx  lazy-loads the three.js hero scene
  three/
    mineScene.ts     procedural open pit: benches, haul road, trucks, survey scan
  lib/
    utils.ts         shared class-name utility
  App.tsx            portfolio sections and content
  index.css          design system and responsive styles
public/
  assets/            image assets used throughout the site
components.json      shadcn configuration
```

## Design system

- **Monochrome.** White canvas, black ink, neutral greys. No brand colour in the UI.
- **Product is the colour.** The MineBook dashboard is shown in full colour; the other project screenshots are greyscale and colourise on hover/focus (or as they scroll in on touch devices).
- **Hero.** A procedural open-pit mine (terraced benches, spiral haul road, haul trucks, excavator, blast-hole pattern, survey scan and dust) rendered with three.js. It follows the pointer, dollies on scroll, pauses off-screen, renders a single still frame under `prefers-reduced-motion`, and falls back to a static contour backdrop without WebGL.
- **MineBook onboarding.** A dedicated section with a three-step onboarding flow and calls to action linking to [minebook.lk](https://minebook.lk).
- Type: Inter Tight (display), Instrument Serif italics (accents), Inter (body), JetBrains Mono (labels).
