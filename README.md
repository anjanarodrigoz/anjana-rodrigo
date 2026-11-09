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

- **The island** (`src/three/islandScene.ts`) is built in code: grassy top with trees, a benched pit with a spiral haul road, yellow trucks, excavator and drill rig, a processing plant with silos, conveyor, crusher and pond, a site office and gate, and a rock underside that glows blue. It is fixed behind the whole page.
- **The tour** (`src/journey.ts`) lists the stops. Each page section declares its stop with `data-stage`; scrolling between sections moves the camera and walks the guide character to the next stop.
- **The guide** is a small engineer in a hard hat and blue vest. Each stop has a speech note with Anjana's photo; a dashed arrow (`GuideArrow`) points from the note to the guide.
- **Tour stops:** Welcome → About me (site office) → MineBook (processing plant) → Blast Pattern (drill bench) → Fleet Dispatch (pit floor) → Cycle-Time (haul road) → Crack Survey (pit walls) → Experience & credentials (lookout) → Contact (mine gate).
- **Prototypes** (`src/components/prototypes/`) are interactive demos with simulated data and rules of thumb — not engineering tools.
- **Navigation:** a numbered tour rail on wide screens; a progress strip on phones.
- Without WebGL the page is plain white and fully usable; under `prefers-reduced-motion` the scene renders still frames only when you scroll.

## Design

- White and blue (`#0b5fe0`) only.
- One typeface, Inter, upright everywhere.
- Content is copied from `src/content.tsx`.
