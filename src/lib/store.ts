import { create } from "zustand"

import type { Role, SoftwareProject } from "./content"

export type Panel =
  | { kind: "equipment" }
  | { kind: "workforce" }
  | { kind: "planning" }
  | { kind: "project"; project: SoftwareProject }
  | { kind: "crack"; id: string }
  | { kind: "role"; role: Role }
  | { kind: "paper" }

interface State {
  /** Section being read, or -1 while travelling between worlds. */
  active: number
  ready: boolean
  webgl: boolean
  panel: Panel | null
  /** Crack Survey: before or after construction. */
  phase: "before" | "after"
  roofOpen: boolean
  /** Experience world: role nearest the camera path. */
  roleIndex: number
  set: (patch: Partial<State>) => void
}

export const useWorld = create<State>((set) => ({
  active: 0,
  ready: false,
  webgl: true,
  panel: null,
  phase: "before",
  roofOpen: false,
  roleIndex: 0,
  set: (patch) => set(patch),
}))

/**
 * Per-frame animation state written by the GSAP scroll timeline and read by
 * the 3D scene. Kept outside React so scrolling never re-renders components.
 */
export const rig = {
  time: 0,
  px: 0, py: 20, pz: 40,
  lx: 0, ly: 0, lz: 0,
  /** 0 = character solid, 1 = fully dissolved into particles. */
  dissolve: 0,
  /** 0..1 soft white veil that hides the jump between worlds. */
  veil: 0,
  /** Assembly progress of each world, 0 = packed away, 1 = built. */
  asm: { software: 0, crack: 0, experience: 0, research: 0 } as Record<string, number>,
}
