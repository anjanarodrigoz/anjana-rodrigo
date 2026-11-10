# Anjana Rodrigo | Interactive 3D Portfolio

A scroll-driven 3D world. Visitors travel through five environments in one connected universe, guided by a 3D character who teleports between them.

Intro → MineBook → Software Engineering → Crack Survey → Professional Experience → Research → About → Contact

## Stack

Next.js 14 (App Router, TypeScript) | React Three Fiber | Three.js | drei | GSAP ScrollTrigger | Tailwind CSS | Zustand

```bash
npm install
npm run dev      # http://localhost:3000
npm run build && npm start
```

## How it works

| Piece | File | What it does |
|---|---|---|
| Content | `src/lib/content.ts` | Every fact shown on the site. Edit text here. |
| Journey | `src/lib/sections.ts` | The eight sections: world, camera poses, character spot, lighting. |
| Scroll timeline | `src/components/Experience.tsx` | One GSAP ScrollTrigger timeline drives the camera, the character dissolve, the veil between worlds and each world's assembly. Also the HTML text, nav and fallback. |
| Shared state | `src/lib/store.ts` | Zustand store for UI state; a plain `rig` object for per-frame animation values. |
| Canvas | `src/components/scene/Scene.tsx` | One canvas. Worlds are code-split, built one section ahead, hidden when far. Adaptive resolution. |
| Camera and light | `src/components/scene/Rig.tsx` | Applies the timeline to the camera; blends sky, fog and sun per world. |
| Character | `src/components/scene/Character.tsx` | The guide: cartoon boy, curly hair, green hoodie, helmet on site. Dissolves into particles to travel. |
| Worlds | `src/components/worlds/*` | Mine, Software, Crack Survey, Experience, Research. |
| Mine | `src/three/mine.ts`, `terrain.ts`, `vehicles.ts` | Procedural valley, benched pit, haul fleet, excavator cycle, plant, office, workshop. |

## Interactions

- MineBook: select the haul truck, the site office or the staked bench.
- Software: select a screen.
- Crack Survey: switch before/after construction, lift the roof, select a crack to open its record.
- Experience: scroll along the path or select a location.
- Research: open the publication record and the IEEE Xplore link.

## Honest notes

- All 3D is a **procedural prototype** built from primitives in code. There are no imported GLB models yet. Components are structured so `createKit()` vehicles, the character and buildings can be swapped for Blender/GLB assets.
- Preview panels and crack records are illustrative samples, labelled as such.
- The research hologram shows the paper's method (equipment data, four models, two targets). It displays no result numbers.
- In the Experience world, the quarry, crusher plant, tunnel portal and survey house are scenery. Only the five roles in `content.ts` carry role information.

## Accessibility and fallbacks

- All text is real HTML in semantic sections (server-rendered, indexable).
- No WebGL, or `?lite` in the URL: the site becomes a plain readable page.
- `prefers-reduced-motion`: camera sway and UI animation are reduced.
- Phones: wider field of view, camera pulled back, text docked at the bottom.
