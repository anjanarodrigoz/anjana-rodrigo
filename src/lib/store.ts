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
  /** Place whose title card is showing on arrival, or -1. */
  titling: number
  /** Which item is on show in a place that presents one thing at a time. */
  sub: number
  set: (patch: Partial<State>) => void
}

export const useWorld = create<State>((set) => ({
  active: 0,
  ready: false,
  webgl: true,
  started: false,
  panel: null,
  titling: -1,
  sub: 0,
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
  /** Which way he faces. He always faces the camera. */
  heading: sections[0].arrive.heading + Math.PI,
  /** Camera orbit around the character. */
  camYaw: sections[0].arrive.heading + Math.PI,
  camPitch: 0.32,
}

/** The place the character last teleported to (index into `sections`). */
export const tour = { place: 0 }
