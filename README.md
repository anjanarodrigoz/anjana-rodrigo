# Anjana Rodrigo | Interactive 3D Portfolio

One walkable 3D world. The visitor controls a character in a mine valley and explores places that tell the story: MineBook at the site office, a projects studio with the real products on devices, a miniature experience path, a research lab, an About lookout and a Contact kiosk.

## Controls

| Action | Desktop | Touch |
|---|---|---|
| Walk | W A S D or arrow keys | Joystick |
| Run | Hold Shift | Push the joystick far |
| Look around | Drag | Drag |
| Fast travel | Menu on the right, or keys 1-7 | Menu |
| Experience stops | Scroll: one stop per scroll | Previous / Next |

## Stack

Next.js 14 (App Router, TypeScript) | React Three Fiber | Three.js | drei | GSAP | Tailwind CSS | Zustand | Web Audio

```bash
npm install
npm run dev      # http://localhost:3000
npm run build && npm start
```

## Where things are

| Piece | File |
|---|---|
| All text and facts | `src/lib/content.ts` |
| Places, arrival points, obstacles | `src/lib/sections.ts` |
| Game loop: movement, camera, collisions, fast travel | `src/components/scene/Rig.tsx` |
| Character and gait | `src/components/scene/Character.tsx` |
| Interface: text, menu, joystick, keyboard, sound toggle | `src/components/Experience.tsx` |
| Info panels | `src/components/Panels.tsx` |
| Sites | `src/components/worlds/*` |
| Mine terrain and equipment | `src/three/*` |
| Sound (synthesised, no files) | `src/lib/sound.ts` |

## Honest notes

- All 3D is a procedural prototype built from primitives in code. No GLB models are imported yet.
- Projects are interactive 3D exhibits built in code, not screenshots. MineBook previews in the mine are illustrative.
- The research hologram shows the paper's method and displays no result numbers.
- In the experience model, the quarry, crusher plant, tunnel portal and house are scenery. Only the five roles in `content.ts` carry role information.

## Accessibility and fallbacks

- All text is real HTML in semantic sections (server-rendered, indexable).
- No WebGL, or `?lite` in the URL: the site becomes a plain readable page.
- Sound starts only after the first click, tap or key press, and can be muted.
