import { OFFICE, SITES, WASTE } from "@/three/terrain"

import { experience, research, software } from "./content"

/**
 * One world. Every part of the story is a place in the same mine valley,
 * and the character teleports between them.
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
  /** Lab coat and glasses (research). */
  lab?: boolean
  /** Number of items shown one at a time here (projects, roles, research steps). */
  items?: number
}

const S = SITES
export const sections: Zone[] = [
  { id: "intro", nav: "Start", world: "mine", at: [WASTE.x - 0.6, WASTE.z + 0.9], radius: 4.5, arrive: { x: WASTE.x - 0.6, z: WASTE.z + 0.9, heading: 2.2 }, helmet: true, tablet: false, items: 2 },
  { id: "minebook", nav: "MineBook", world: "mine", at: [OFFICE.x, OFFICE.z + 1], radius: 7.5, arrive: { x: OFFICE.x - 1.6, z: OFFICE.z + 4.2, heading: 2.6 }, helmet: true, tablet: true },
  { id: "software", nav: "Projects", world: "software", at: [S.software.x, S.software.z], radius: 10, arrive: { x: S.software.x + 2.5, z: S.software.z + 1.4, heading: Math.PI }, helmet: false, tablet: false, items: software.length },
  { id: "experience", nav: "Experience", world: "experience", at: [S.experience.x, S.experience.z], radius: 10, arrive: { x: S.experience.x + 2.5, z: S.experience.z + 1.4, heading: Math.PI }, helmet: false, tablet: false, items: experience.length },
  { id: "research", nav: "Research", world: "research", at: [S.research.x, S.research.z], radius: 10, arrive: { x: S.research.x + 2.5, z: S.research.z + 1.4, heading: Math.PI }, helmet: false, tablet: true, lab: true, items: research.steps.length },
  { id: "about", nav: "About", world: "mine", at: [S.about.x, S.about.z], radius: 5.5, arrive: { x: S.about.x + 2.4, z: S.about.z + 2.6, heading: Math.PI }, helmet: true, tablet: false },
  { id: "contact", nav: "Contact", world: "mine", at: [S.contact.x, S.contact.z], radius: 5.8, arrive: { x: S.contact.x + 0.2, z: S.contact.z + 2.4, heading: Math.PI }, helmet: false, tablet: false },
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

/** Zone index by id, so code never depends on the order of the list. */
export const zoneIndex = (id: string) => sections.findIndex((s) => s.id === id)
