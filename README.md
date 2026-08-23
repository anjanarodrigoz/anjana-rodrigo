# Anjana Rodrigo — Portfolio

A premium, responsive portfolio for a mining engineer and software developer. The visual direction combines a clean light interface with a floating 3D mining model, operational data cards, and a dedicated professional portrait section.

## Technology

- Vite
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
    Header.tsx       responsive navigation
  lib/
    utils.ts         shared class-name utility
  App.tsx            portfolio sections and content
  index.css          design system and responsive styles
public/
  assets/            image assets used throughout the site
components.json      shadcn configuration
```

## Design system

The interface uses a light canvas, deep navy typography, the brand's vivid blue for primary actions, rounded white surfaces, subtle blue shadows, and restrained motion. Responsive layouts are included for desktop, tablet, and mobile screens.
