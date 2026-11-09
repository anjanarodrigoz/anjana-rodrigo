import type { ComponentType } from "react"

import { BlastPatternDemo } from "./BlastPatternDemo"
import { CrackSurveyDemo } from "./CrackSurveyDemo"
import { CycleTimeDemo } from "./CycleTimeDemo"
import { FleetDispatchDemo } from "./FleetDispatchDemo"
import { MineBookDemo } from "./MineBookDemo"

/** Product id (from content.tsx) → its working prototype. */
export const prototypes: Record<string, ComponentType> = {
  minebook: MineBookDemo,
  "fleet-dispatch": FleetDispatchDemo,
  "cycle-time": CycleTimeDemo,
  "crack-survey": CrackSurveyDemo,
  "blast-pattern": BlastPatternDemo,
}
