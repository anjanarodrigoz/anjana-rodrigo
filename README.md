# Anjana Rodrigo — Portfolio

A portfolio told as a guided tour of a floating-island open-pit mine. A small 3D version of Anjana walks you from stop to stop as you scroll, and each of his products is shown as a working prototype at the place in the mine where it is used.

## Technology

- Vite, React 18, TypeScript
- three.js (the island scene, loaded on demand)
- Tailwind base + hand-written CSS
- Lucide icons

## Run locally

```bash
npm install
npm run dev
```

## Production build

```bash
npm run build
npm run preview
```

## How it works

- **Full-screen mine tour** (`src/pages/TourPage.tsx`). The 3D floating-island mine (`src/three/islandScene.ts`) always fills the screen. Scrolling walks a 3D Anjana — curly black hair, short beard, navy suit and tie — between tour stops (`src/journey.ts`).
- **Cards inside the mine** (`src/components/tour/StopCards.tsx`). Each stop shows one small card pinned next to the object it describes, joined by a leader line; the scene publishes each anchor's screen position every frame. On phones the card docks at the bottom with the line pointing up into the mine.
- **Detail pages** (hash routes in `src/router.ts`, so any static host works):
  - `#/project/<id>` — project details and its working prototype (`src/components/prototypes/`), with previous/next links.
  - `#/about` — photo, contact, capabilities, experience, credentials, expertise.
  - "Back" returns to the same stop in the mine (`#/tour/<stop>`).
- **Stops:** Welcome → About me (site office) → MineBook (processing plant) → Blast Pattern (drill bench) → Fleet Dispatch (pit floor) → Cycle-Time (haul road) → Crack Survey (pit walls) → Experience (lookout) → Contact (mine gate).
- Prototypes use simulated data and rules of thumb — demos, not engineering tools.
- Without WebGL the cards still work over a white page; under `prefers-reduced-motion` the scene renders still frames only when you scroll.

## Design

- White and blue (`#0b5fe0`) only.
- One typeface, Inter, upright everywhere.
- Content is copied from `src/content.tsx`.
