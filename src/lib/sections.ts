/**
 * The journey: eight sections across five world locations in one universe.
 * Camera poses and character spots are relative to each world's origin.
 */

export type V3 = [number, number, number]
export type WorldId = "mine" | "software" | "crack" | "experience" | "research"

export const WORLD_ORIGIN: Record<WorldId, V3> = {
  mine: [0, 0, 0],
  software: [600, 0, 0],
  crack: [1200, 0, 0],
  experience: [1800, 0, 0],
  research: [2400, 0, 0],
}

export interface Pose {
  pos: V3
  look: V3
}

export interface Atmosphere {
  bg: string
  fog: [number, number]
  sun: string
  sunI: number
  sunDir: V3
  sky: string
  ground: string
  hemiI: number
}

export interface Section {
  id: string
  nav: string
  world: WorldId
  /** Camera on arrival, and where it drifts to while the section is read. */
  a: Pose
  b: Pose
  /** Close-up on the character just before leaving. */
  c: Pose
  /** How we leave: dissolve and jump worlds, or fly within the same world. */
  exit: "teleport" | "fly"
  spot: { pos: V3; rotY: number; scale: number }
  helmet: boolean
  tablet: boolean
  wave?: boolean
  air: Atmosphere
}

const day: Atmosphere = { bg: "#dfe9ee", fog: [80, 260], sun: "#fff1dc", sunI: 2.5, sunDir: [-0.45, 0.75, 0.45], sky: "#dfeaff", ground: "#7b6a55", hemiI: 0.85 }

export const sections: Section[] = [
  {
    id: "intro",
    nav: "Intro",
    world: "mine",
    a: { pos: [-37, 13, 31], look: [-4, -3, -1] },
    b: { pos: [-30, 9.5, 26], look: [-4, -3, -1] },
    c: { pos: [-24.5, 6.2, 16.5], look: [-17.5, 3.6, 7.2] },
    exit: "fly",
    spot: { pos: [-17.6, 0, 7.4], rotY: -0.7, scale: 1.25 },
    helmet: true,
    tablet: false,
    wave: true,
    air: day,
  },
  {
    id: "minebook",
    nav: "MineBook",
    world: "mine",
    a: { pos: [-6, 9, 30], look: [4, 0.5, 4] },
    b: { pos: [20, 11, 27], look: [3, 0, 2] },
    c: { pos: [3.6, 2.6, 17.5], look: [4.6, 1.4, 12.6] },
    exit: "teleport",
    spot: { pos: [4.4, 0, 13.2], rotY: 0.2, scale: 1 },
    helmet: true,
    tablet: true,
    air: day,
  },
  {
    id: "software",
    nav: "Software",
    world: "software",
    a: { pos: [0.5, 3.4, 11], look: [0, 2.2, 0] },
    b: { pos: [5, 2.8, 9], look: [0.4, 2.1, 0] },
    c: { pos: [-1.2, 1.9, 5.2], look: [-2.4, 1.2, 2] },
    exit: "teleport",
    spot: { pos: [-2.6, 0.12, 2.2], rotY: 0.5, scale: 1 },
    helmet: false,
    tablet: false,
    air: { bg: "#102C25", fog: [16, 60], sun: "#e9fff2", sunI: 1.2, sunDir: [0.3, 0.8, 0.5], sky: "#8DAA91", ground: "#0b1f1a", hemiI: 0.9 },
  },
  {
    id: "crack-survey",
    nav: "Crack Survey",
    world: "crack",
    a: { pos: [-15, 7, 18], look: [1, 1.6, 0] },
    b: { pos: [14, 6.5, 18], look: [1, 1.6, 0] },
    c: { pos: [-3.4, 2.1, 9], look: [-5.4, 1.3, 5.6] },
    exit: "teleport",
    spot: { pos: [-5.6, 0, 5.4], rotY: 0.9, scale: 1 },
    helmet: true,
    tablet: true,
    air: { bg: "#e9eef0", fog: [30, 110], sun: "#fff4e2", sunI: 2.4, sunDir: [0.5, 0.8, 0.5], sky: "#eef3ff", ground: "#8a8474", hemiI: 1.1 },
  },
  {
    id: "experience",
    nav: "Experience",
    world: "experience",
    a: { pos: [-9, 12, 21], look: [0, 0.5, 0] },
    b: { pos: [10, 9.5, 19], look: [1, 0.5, 0] },
    c: { pos: [3.6, 3, 13], look: [5.4, 1.8, 8.2] },
    exit: "teleport",
    spot: { pos: [5.5, 0.3, 8], rotY: -0.3, scale: 1.5 },
    helmet: false,
    tablet: false,
    air: { bg: "#F6F7F3", fog: [28, 90], sun: "#fff6ea", sunI: 2.2, sunDir: [-0.4, 0.85, 0.4], sky: "#ffffff", ground: "#b9b6a8", hemiI: 1.2 },
  },
  {
    id: "research",
    nav: "Research",
    world: "research",
    a: { pos: [-1, 3.2, 11], look: [0, 2.2, 0] },
    b: { pos: [-5.5, 2.8, 8.5], look: [0, 2.2, 0] },
    c: { pos: [3.6, 1.9, 5.4], look: [2.6, 1.2, 2.2] },
    exit: "teleport",
    spot: { pos: [2.7, 0.12, 2.3], rotY: -0.5, scale: 1 },
    helmet: false,
    tablet: false,
    air: { bg: "#151c19", fog: [14, 52], sun: "#dff5ea", sunI: 0.9, sunDir: [0.2, 0.9, 0.3], sky: "#8DAA91", ground: "#0c1210", hemiI: 0.7 },
  },
  {
    id: "about",
    nav: "About",
    world: "mine",
    a: { pos: [-27, 5.6, 14.5], look: [-10, 1.5, 0] },
    b: { pos: [-25.5, 5.2, 16.5], look: [-8, 1.5, -1] },
    c: { pos: [-24, 5, 14], look: [-17.5, 3.6, 7.2] },
    exit: "fly",
    spot: { pos: [-17.6, 0, 7.4], rotY: -0.9, scale: 1.25 },
    helmet: true,
    tablet: false,
    air: { bg: "#f3dcc0", fog: [60, 220], sun: "#ffc58a", sunI: 2.6, sunDir: [0.7, 0.42, 0.3], sky: "#ffe9d2", ground: "#7a6654", hemiI: 1.1 },
  },
  {
    id: "contact",
    nav: "Contact",
    world: "mine",
    a: { pos: [-40, 30, 56], look: [0, -2, 0] },
    b: { pos: [-22, 46, 70], look: [0, -2, 0] },
    c: { pos: [-22, 46, 70], look: [0, -2, 0] },
    exit: "fly",
    spot: { pos: [-17.6, 0, 7.4], rotY: -0.6, scale: 1.25 },
    helmet: true,
    tablet: false,
    wave: true,
    air: { bg: "#f1d9c4", fog: [80, 260], sun: "#ffb783", sunI: 2.4, sunDir: [0.7, 0.4, 0.35], sky: "#ffe2cc", ground: "#75614f", hemiI: 1.1 },
  },
]

/** Timeline constants (fractions of one section). */
export const HOLD = 0.66
export const LEAVE = 0.8
export const ARRIVE = 0.88

/** Which section the character and atmosphere belong to at timeline time t. */
export const sectionAt = (t: number) => {
  const i = Math.min(sections.length - 1, Math.floor(t))
  const f = t - i
  return f >= ARRIVE - 0.02 && i < sections.length - 1 ? i + 1 : i
}

/** Section whose text should be on screen, or -1 during travel. */
export const readingAt = (t: number) => {
  const i = Math.min(sections.length - 1, Math.floor(t))
  const f = t - i
  if (i === sections.length - 1) return i
  if (f < HOLD + 0.04) return i
  if (f > 0.97) return i + 1
  return -1
}
