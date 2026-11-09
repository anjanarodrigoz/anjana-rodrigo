/**
 * The scroll journey through the mine. Each page section carries
 * `data-stage="<id>"`; scrolling between two sections moves the 3D camera
 * between their stages. Several sections may share a stage (the camera holds).
 */

export const stages = [
  { id: "surface", label: "Surface", rl: "RL 0 m" },
  { id: "control", label: "Mine control", rl: "RL +12 m" },
  { id: "drill", label: "Drill & blast", rl: "RL −41 m" },
  { id: "load", label: "Load & haul", rl: "RL −110 m" },
  { id: "haul", label: "Haul road", rl: "RL −62 m" },
  { id: "walls", label: "Pit walls", rl: "RL −75 m" },
  { id: "office", label: "Site office", rl: "RL +4 m" },
  { id: "gate", label: "Mine gate", rl: "RL +2 m" },
] as const

export type StageId = (typeof stages)[number]["id"]

export interface Journey {
  from: StageId
  to: StageId
  /** 0 = at `from`, 1 = at `to`, already eased so the camera holds while you read. */
  t: number
  /** Stage whose section owns the reading line — drives the depth gauge. */
  active: StageId
}

const smoothstep = (a: number, b: number, x: number) => {
  const t = Math.min(1, Math.max(0, (x - a) / (b - a)))
  return t * t * (3 - 2 * t)
}

/** Read the current journey position from the DOM. */
export function readJourney(): Journey {
  const sections = Array.from(document.querySelectorAll<HTMLElement>("[data-stage]"))
  const vh = window.innerHeight
  const line = window.scrollY + vh * 0.5

  // A stage is "arrived" when its section's top sits 20% down the viewport.
  const anchors = sections.map((el) => ({
    id: el.dataset.stage as StageId,
    at: el.getBoundingClientRect().top + window.scrollY + vh * 0.3,
  }))

  if (!anchors.length) return { from: "surface", to: "surface", t: 0, active: "surface" }
  if (line <= anchors[0].at || anchors.length === 1) {
    return { from: anchors[0].id, to: anchors[0].id, t: 0, active: anchors[0].id }
  }

  for (let i = 0; i < anchors.length - 1; i++) {
    const a = anchors[i]
    const b = anchors[i + 1]
    if (line < b.at) {
      const raw = (line - a.at) / Math.max(1, b.at - a.at)
      // Hold on the current stage while its content is read, then travel.
      return { from: a.id, to: b.id, t: smoothstep(0.5, 1, raw), active: raw < 0.75 ? a.id : b.id }
    }
  }

  const last = anchors[anchors.length - 1]
  return { from: last.id, to: last.id, t: 0, active: last.id }
}
