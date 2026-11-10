import { GATE, OFFICE, SITES, WASTE } from "@/three/terrain"

/**
 * One world. Every part of the story is a place in the same mine valley,
 * and the visitor walks (or runs, or fast-travels) between them.
 */

export type V3 = [number, number, number]
export type WorldId = "mine" | "software" | "experience" | "research"

/** Where each sub-site sits in the valley (y is the levelled pad height). */
export const WORLD_ORIGIN: Record<WorldId, V3> = {
  mine: [0, 0, 0],
  software: [SITES.software.x, 0.2, SITES.software.z],
  experience: [SITES.experience.x, 0.2, SITES.experience.z],
  research: [SITES.research.x, 0.2, SITES.research.z],
}

/** The experience model is a miniature: it is scaled down inside its site. */
export const EXPERIENCE_SCALE = 0.62

/** The path through the experience model (model coordinates), one point per role. */
export const EXPERIENCE_PATH: [number, number][] = [[-9, 5], [-5.5, 0.5], [-1, 3.2], [3.4, -0.6], [8, 2.6]]

/** Where the character stands for role i, in world coordinates. */
export const experienceStop = (i: number) => {
  const [x, z] = EXPERIENCE_PATH[Math.max(0, Math.min(EXPERIENCE_PATH.length - 1, i))]
  return { x: SITES.experience.x + x * EXPERIENCE_SCALE, z: SITES.experience.z + (z + 0.9) * EXPERIENCE_SCALE }
}

export interface Zone {
  id: string
  nav: string
  world: WorldId
  /** Centre and radius of the area where this zone's story shows. */
  at: [number, number]
  radius: number
  /** Where fast travel drops the character, and which way he faces. */
  arrive: { x: number; z: number; heading: number }
  helmet: boolean
  tablet: boolean
}

const S = SITES
export const sections: Zone[] = [
  { id: "intro", nav: "Start", world: "mine", at: [WASTE.x - 0.6, WASTE.z + 0.9], radius: 4.5, arrive: { x: WASTE.x - 0.6, z: WASTE.z + 0.9, heading: 2.2 }, helmet: true, tablet: false },
  { id: "minebook", nav: "MineBook", world: "mine", at: [OFFICE.x, OFFICE.z + 1], radius: 7.5, arrive: { x: OFFICE.x - 1.6, z: OFFICE.z + 4.2, heading: 2.6 }, helmet: true, tablet: true },
  { id: "software", nav: "Projects", world: "software", at: [S.software.x, S.software.z], radius: 10, arrive: { x: S.software.x, z: S.software.z + 1.6, heading: Math.PI }, helmet: false, tablet: false },
  { id: "experience", nav: "Experience", world: "experience", at: [S.experience.x, S.experience.z], radius: 10, arrive: { x: S.experience.x - 9 * 0.62, z: S.experience.z + 5.9 * 0.62, heading: Math.PI }, helmet: false, tablet: false },
  { id: "research", nav: "Research", world: "research", at: [S.research.x, S.research.z], radius: 10, arrive: { x: S.research.x, z: S.research.z + 7.5, heading: Math.PI }, helmet: false, tablet: false },
  { id: "about", nav: "About", world: "mine", at: [S.about.x, S.about.z], radius: 4, arrive: { x: S.about.x + 1.6, z: S.about.z - 1.2, heading: 0.6 }, helmet: true, tablet: false },
  { id: "contact", nav: "Contact", world: "mine", at: [S.contact.x, S.contact.z], radius: 4, arrive: { x: S.contact.x - 0.4, z: S.contact.z + 2, heading: Math.PI }, helmet: false, tablet: false },
]

/** Index of the zone the point is standing in, or -1 when roaming. */
export const zoneAt = (x: number, z: number) => {
  let best = -1
  let bestD = Infinity
  sections.forEach((s, i) => {
    const d = Math.hypot(x - s.at[0], z - s.at[1]) / s.radius
    if (d < 1 && d < bestD) {
      best = i
      bestD = d
    }
  })
  return best
}

/** Things the character cannot walk through: [x, z, halfX, halfZ]. Circles have halfZ = 0. */
export const OBSTACLES: [number, number, number, number][] = [
  [15.2, 0.4, 3.4, 0],
  [OFFICE.x + 0.5, OFFICE.z, 2.1, 0],
  [12.6, 9.0, 3.0, 0],
  [7.6, 2.8, 1.5, 0],
  [11.2, -2.4, 2.3, 0],
  [GATE.x - 1, GATE.z, 0.7, 0],
  [S.research.x - 2.2, S.research.z + 2.6, 0.8, 0],
  [S.research.x - 5.2, S.research.z - 1, 1.5, 0],
  [S.research.x + 5.2, S.research.z - 1, 1.5, 0],
]

/** Where each project's exhibit stands in the projects site (site coordinates), in content order. */
export const PROJECT_SPOTS: [number, number][] = [[0, -4.6], [-5, -0.4], [-2.9, -3.5], [2.9, -3.5], [5, -0.4]]
for (const [x, z] of PROJECT_SPOTS) OBSTACLES.push([S.software.x + x, S.software.z + z, 1.15, 0])

/** Zone index by id, so code never depends on the order of the list. */
export const zoneIndex = (id: string) => sections.findIndex((s) => s.id === id)
