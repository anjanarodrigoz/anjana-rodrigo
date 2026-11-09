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

- **Full-screen mine tour** (`src/pages/TourPage.tsx`). The 3D floating-island mine always fills the screen. Scrolling walks a 3D Anjana between tour stops (`src/journey.ts`).
- **The mine** (`src/three/`):
  - `terrain.ts` — island shape, a 7-bench open pit with spiral haul ramp, surface roads, a terraced waste dump and a tailings dam, as pure height functions shared by rendering, physics and walking.
  - `islandScene.ts` — shadows, tone mapping and textured ground; ore trucks cycle pit → crusher and waste trucks pit → dump; excavator dig/swing/dump cycle; drill rig and timed blasts; crusher, conveyor, stockpile, processing plant, tailings pond and pipeline; workshop, fuel farm, explosives magazine, lighting towers, power line, comms tower, site office, gate and weighbridge; water truck, grader and dozer; dust and spray.
  - `physics.ts` — cannon-es rigid bodies on a heightfield of the island: blasted rock, rock dumped into the truck, and ore falling off the conveyor onto the stockpile.
  - `character.ts` — Anjana as a jointed rig (curly hair, beard, navy suit, white shirt, tie, watch, tablet) with a speed-driven walk/run gait; he moves with acceleration, turn-rate limits and gravity (dropping off ledges, climbing bench faces).
  - `vehicles.ts` — haul truck, excavator and drill rig models.
- **MineBook stop:** the whole mine lights up as one connected system — every asset links to a MineBook hub, with live tags (`ConnectedTags.tsx`).
- **Cards inside the mine** (`StopCards.tsx`): one small see-through card per stop, pinned to its object with a leader line; docked at the bottom on phones.
- **Detail pages** (hash routes in `src/router.ts`): `#/project/<id>` with the working prototype, `#/about` with experience and credentials; "Back" returns to the same stop.
- Prototypes and live tags use simulated data — demos, not engineering tools.

## Design

- White and blue (`#0b5fe0`) only.
- One typeface, Inter, upright everywhere.
- Content is copied from `src/content.tsx`.
