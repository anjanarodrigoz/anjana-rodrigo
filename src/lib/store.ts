import { create } from "zustand"

import type { Role, SoftwareProject } from "./content"
import { sections } from "./sections"

export type Panel =
  | { kind: "equipment" }
  | { kind: "workforce" }
  | { kind: "planning" }
  | { kind: "project"; project: SoftwareProject }
  | { kind: "role"; role: Role }
  | { kind: "paper" }

interface State {
  /** Zone the character is standing in, or -1 while roaming between places. */
  active: number
  ready: boolean
  webgl: boolean
  /** True once the visitor has moved: the welcome text steps aside. */
  started: boolean
  panel: Panel | null
  roleIndex: number
  set: (patch: Partial<State>) => void
}

export const useWorld = create<State>((set) => ({
  active: 0,
  ready: false,
  webgl: true,
  started: false,
  panel: null,
  roleIndex: 0,
  set: (patch) => set(patch),
}))

/**
 * Per-frame game state, kept outside React so walking never re-renders the UI.
 */
export const rig = {
  /** 0 = character solid, 1 = dissolved into particles (fast travel). */
  dissolve: 0,
  /** Assembly progress of each site: it builds itself as you approach. */
  asm: { software: 0, experience: 0, research: 0 } as Record<string, number>,
}

export const player = {
  x: sections[0].arrive.x,
  z: sections[0].arrive.z,
  y: 0,
  vx: 0,
  vz: 0,
  heading: sections[0].arrive.heading,
  /** Ground speed in units per second, for the walk and run animation. */
  speed: 0,
  /** Camera orbit around the character. */
  camYaw: sections[0].arrive.heading + Math.PI,
  camPitch: 0.32,
  /** Seconds since the visitor last dragged the camera. */
  sinceDrag: 10,
  /** A point the character is walking to on his own (experience stops). */
  goal: null as { x: number; z: number } | null,
}

/** Movement input from keyboard or the on-screen joystick. x: right, y: forward. */
export const input = { x: 0, y: 0, run: false }
