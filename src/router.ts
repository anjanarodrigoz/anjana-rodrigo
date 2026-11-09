import { useEffect, useState } from "react"

import type { StageId } from "@/journey"

/**
 * Hash routes, so the site works on any static host with no server config:
 *   #/                 the mine tour
 *   #/tour/<stage>     the mine tour, opened at a stop
 *   #/project/<id>     a project's detail page
 *   #/about            about, experience and credentials
 */
export type Route =
  | { name: "tour"; stage?: StageId }
  | { name: "project"; id: string }
  | { name: "about" }

const parse = (hash: string): Route => {
  const parts = hash.replace(/^#\/?/, "").split("/").filter(Boolean)
  if (parts[0] === "project" && parts[1]) return { name: "project", id: parts[1] }
  if (parts[0] === "about") return { name: "about" }
  if (parts[0] === "tour" && parts[1]) return { name: "tour", stage: parts[1] as StageId }
  return { name: "tour" }
}

export function useRoute() {
  const [route, setRoute] = useState<Route>(() => parse(window.location.hash))

  useEffect(() => {
    const onChange = () => setRoute(parse(window.location.hash))
    window.addEventListener("hashchange", onChange)
    return () => window.removeEventListener("hashchange", onChange)
  }, [])

  return route
}

export const href = {
  tour: (stage?: StageId) => (stage ? `#/tour/${stage}` : "#/"),
  project: (id: string) => `#/project/${id}`,
  about: () => "#/about",
}

/** Which tour stop each project lives at. */
export const projectStage: Record<string, StageId> = {
  minebook: "control",
  "blast-pattern": "drill",
  "fleet-dispatch": "load",
  "cycle-time": "haul",
  "crack-survey": "walls",
}
