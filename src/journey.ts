/**
 * The portfolio is a guided tour of a floating mine. Each page section carries
 * `data-stage="<id>"`; scrolling between two sections walks the guide and moves
 * the 3D camera between their stops. Sections may share a stop.
 */

export const stages = [
  { id: "welcome", label: "Welcome", place: "Island overview", guide: "Hi, I'm Anjana. Let me walk you through my work." },
  { id: "office", label: "About me", place: "Site office", guide: "This is where I plan — engineering first, then code." },
  { id: "control", label: "MineBook", place: "Processing plant", guide: "MineBook runs the whole operation from one screen." },
  { id: "drill", label: "Blast Pattern", place: "Drill bench", guide: "Every blast starts with a pattern. Try designing one." },
  { id: "load", label: "Fleet Dispatch", place: "Pit floor", guide: "Down at the face: keep shovels busy, trucks moving." },
  { id: "haul", label: "Cycle-Time", place: "Haul road", guide: "Cycle time is won or lost on this road." },
  { id: "walls", label: "Crack Survey", place: "Pit walls", guide: "Walls move. We log every crack before it matters." },
  { id: "lookout", label: "Experience", place: "Lookout", guide: "From up here: where I've worked and trained." },
  { id: "gate", label: "Contact", place: "Mine gate", guide: "That's the tour. Got a mine to improve?" },
] as const

export type StageId = (typeof stages)[number]["id"]

export interface Journey {
  from: StageId
  to: StageId
  /** 0 = at `from`, 1 = at `to`, eased so the camera holds while you read. */
  t: number
  /** Stage whose section owns the reading line. */
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

  // A stop is "arrived" when its section's top sits 20% down the viewport.
  const anchors = sections.map((el) => ({
    id: el.dataset.stage as StageId,
    at: el.getBoundingClientRect().top + window.scrollY + vh * 0.3,
  }))

  if (!anchors.length) return { from: "welcome", to: "welcome", t: 0, active: "welcome" }
  if (line <= anchors[0].at || anchors.length === 1) {
    return { from: anchors[0].id, to: anchors[0].id, t: 0, active: anchors[0].id }
  }

  for (let i = 0; i < anchors.length - 1; i++) {
    const a = anchors[i]
    const b = anchors[i + 1]
    if (line < b.at) {
      const raw = (line - a.at) / Math.max(1, b.at - a.at)
      // Hold at the current stop while it is read, then walk to the next.
      return { from: a.id, to: b.id, t: smoothstep(0.5, 1, raw), active: raw < 0.75 ? a.id : b.id }
    }
  }

  const last = anchors[anchors.length - 1]
  return { from: last.id, to: last.id, t: 0, active: last.id }
}

/** Screen position of each stop's anchor in the 3D scene, written by the scene every frame. */
export const screenAnchors: Partial<Record<string, { x: number; y: number; visible: boolean }>> = {}

/** Live state of the mine published by the scene (for MineBook's connected-system tags). */
export const mineState = {
  trucks: [] as { id: string; state: string; payload: number }[],
  passes: 126,
  loadsToday: 412,
  blasts: 3,
  crusherTph: 1240,
  stockpile: 24530,
}
