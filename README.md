# Anjana Rodrigo | Interactive 3D Portfolio

One 3D world. A character guides the visitor around a mine valley, teleporting between places that tell the story: MineBook at the site office, a projects studio with the real products on devices, a miniature experience path, a research lab, an About lookout and a Contact kiosk.

## Controls

The character does not walk. He teleports from place to place and stands facing the viewer.

| Action | Desktop | Touch |
|---|---|---|
| Next / previous | Scroll, or arrow keys | Swipe up / down |
| Step through projects, roles, research steps | Same: these places show one item at a time | Swipe, or Previous / Next |
| Jump to any place | Keys 1-7 | - |
| Look around | Drag | Drag sideways |

The site opens on a wide view while the mine assembles itself, then pushes in to the character before the first teleport. Each place announces its name on arrival, then shows its content. On phones the text sits in a white panel at the bottom.

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
| Places and arrival points | `src/lib/sections.ts` |
| Camera, teleport, place tracking | `src/components/scene/Rig.tsx` |
| Character | `src/components/scene/Character.tsx` |
| Interface: text, menu, scroll/keys/swipe, sound toggle | `src/components/Experience.tsx` |
| Info panels | `src/components/Panels.tsx` |
| Sites | `src/components/worlds/*` |
| Mine terrain and equipment | `src/three/*` |
| Sound (synthesised, no files) | `src/lib/sound.ts` |

## Honest notes

- All 3D is a procedural prototype built from primitives in code. No GLB models are imported yet.
- Projects are interactive 3D exhibits built in code, not screenshots. MineBook previews in the mine are illustrative.
- The research hologram shows the paper's method and displays no result numbers.
- The Restaurant Management App entry has only a generic one-line description until real details are supplied.

## Accessibility and fallbacks

- All text is real HTML in semantic sections (server-rendered, indexable).
- No WebGL, or `?lite` in the URL: the site becomes a plain readable page.
- Sound starts only after the first click, tap or key press, and can be muted.
