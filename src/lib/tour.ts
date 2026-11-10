import { EXPERIENCE_PATH, experienceStop, sections, zoneIndex } from "./sections"

/**
 * The scroll tour: one route that loops clockwise around the pit and passes
 * every place in story order. Scrolling moves the character along it.
 */

interface Waypoint {
  x: number
  z: number
  /** Zone this waypoint is the arrival point of. */
  zone?: number
  /** Experience role this waypoint is the stop for. */
  role?: number
}

const arrive = (id: string): Waypoint => {
  const i = zoneIndex(id)
  return { x: sections[i].arrive.x, z: sections[i].arrive.z, zone: i }
}
const via = (x: number, z: number): Waypoint => ({ x, z })

const route: Waypoint[] = [
  arrive("intro"),
  via(-10, 11.5),
  via(0, 12.8),
  arrive("minebook"),
  via(15, 16),
  arrive("software"),
  via(37, 8),
  via(36, -4),
  via(30, -8),
  ...EXPERIENCE_PATH.map((_, i) => ({ ...experienceStop(i), role: i, zone: i === 0 ? zoneIndex("experience") : undefined })),
  via(30, -21),
  via(20, -20),
  via(6, -19.5),
  via(1, -15),
  arrive("research"),
  via(-20, -14),
  arrive("about"),
  via(-33, 0),
  via(-28, 10),
  via(-18, 16),
  via(-4, 19),
  arrive("contact"),
]

const cum: number[] = [0]
for (let i = 1; i < route.length; i++) cum.push(cum[i - 1] + Math.hypot(route[i].x - route[i - 1].x, route[i].z - route[i - 1].z))

export const TOUR_LENGTH = cum[cum.length - 1]

/** Point on the route at distance s. */
export const pointAt = (s: number) => {
  const d = Math.max(0, Math.min(TOUR_LENGTH, s))
  let i = 1
  while (i < cum.length - 1 && cum[i] < d) i++
  const f = (d - cum[i - 1]) / Math.max(1e-6, cum[i] - cum[i - 1])
  return { x: route[i - 1].x + (route[i].x - route[i - 1].x) * f, z: route[i - 1].z + (route[i].z - route[i - 1].z) * f }
}

/** Distance along the route of the point nearest to (x, z). */
export const nearestS = (x: number, z: number) => {
  let best = 0
  let bestD = Infinity
  for (let i = 1; i < route.length; i++) {
    const a = route[i - 1]
    const b = route[i]
    const dx = b.x - a.x
    const dz = b.z - a.z
    const t = Math.max(0, Math.min(1, ((x - a.x) * dx + (z - a.z) * dz) / (dx * dx + dz * dz)))
    const d = Math.hypot(x - (a.x + dx * t), z - (a.z + dz * t))
    if (d < bestD) {
      bestD = d
      best = cum[i - 1] + (cum[i] - cum[i - 1]) * t
    }
  }
  return best
}

export const sOfZone = (zone: number) => cum[Math.max(0, route.findIndex((w) => w.zone === zone))]
export const sOfRole = (role: number) => cum[Math.max(0, route.findIndex((w) => w.role === role))]
