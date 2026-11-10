/**
 * The island's ground: shape, pit benches, spiral haul road and surface
 * roads, as pure functions so the renderer, physics and character all agree.
 */

export const RIM_A = 24 // island half-length (x)
export const RIM_B = 15.5 // island half-width (z)
export const PIT = { x: -5, z: -1.5, ax: 10.5, az: 7.6 }
export const BENCHES = 7
export const BENCH_H = 0.9
export const BW = 1 / (BENCHES + 1.3) // bench width in normalised pit units
export const RAMP_TURNS = 1.6
export const RAMP_START = 0.9
export const PLANT = { x: 14, z: 1 }
export const OFFICE = { x: 6, z: 10.5 }
export const GATE = { x: 8.6, z: 13.6 }
export const CRUSHER = { x: 7.6, z: 2.6 }
export const STOCKPILE = { x: 11.2, z: -2.4 }
export const WORKSHOP = { x: 12.6, z: 9.4 }
export const FUEL = { x: 2.2, z: 12.2 }
export const MAGAZINE = { x: -19, z: -7.5 }
/** Terraced waste-rock dump (three lifts). */
export const WASTE = { x: -17, z: 6.5, rx: 5.2, rz: 3.6, lifts: 3, liftH: 0.85 }
/** Tailings storage facility: an embanked pond south-east of the plant. */
export const TSF = { x: 15, z: -8.5, rx: 4.4, rz: 3.0 }

export const smoothstep = (a: number, b: number, x: number) => {
  const t = Math.min(1, Math.max(0, (x - a) / (b - a)))
  return t * t * (3 - 2 * t)
}
export const hash = (x: number, y: number) => {
  const s = Math.sin(x * 127.1 + y * 311.7) * 43758.5453
  return s - Math.floor(s)
}
export const noise = (x: number, y: number) => {
  const ix = Math.floor(x)
  const iy = Math.floor(y)
  const fx = x - ix
  const fy = y - iy
  const ux = fx * fx * (3 - 2 * fx)
  const uy = fy * fy * (3 - 2 * fy)
  const a = hash(ix, iy)
  const b = hash(ix + 1, iy)
  const c = hash(ix, iy + 1)
  const d = hash(ix + 1, iy + 1)
  return a + (b - a) * ux + (c - a) * uy + (a - b - c + d) * ux * uy
}

/** Distance from the island centre to its rim along angle θ. */
export const rimR = (theta: number) => {
  const c = Math.cos(theta) / RIM_A
  const s = Math.sin(theta) / RIM_B
  return (1 / Math.sqrt(c * c + s * s)) * (1 + 0.05 * Math.sin(3 * theta + 1) + 0.035 * Math.sin(5 * theta - 0.5))
}

/** Normalised pit coordinates: d < 1 inside the pit, θ around its centre. */
export const pitCoords = (x: number, z: number) => {
  const u = (x - PIT.x) / PIT.ax
  const v = (z - PIT.z) / PIT.az
  return { d: Math.hypot(u, v), theta: Math.atan2(v, u) }
}

export const pitDepth = (inward: number) => {
  const steps = inward / BW
  const level = Math.min(Math.floor(steps), BENCHES)
  const frac = steps - Math.floor(steps)
  const face = level >= BENCHES ? 0 : smoothstep(0.62, 0.95, frac)
  return (level + face) * BENCH_H
}

export const rampPoint = (t: number) => {
  const theta = t * Math.PI * 2 * RAMP_TURNS + RAMP_START
  const inward = 0.04 + t * (BENCHES - 0.1) * BW
  const d = 1 - inward
  return {
    theta,
    inward,
    x: PIT.x + Math.cos(theta) * d * PIT.ax,
    z: PIT.z + Math.sin(theta) * d * PIT.az,
    depth: (inward / BW) * BENCH_H * 0.97,
  }
}

export const SURFACE_ROADS: [number, number][][] = [
  // ramp top → plant
  [[rampPoint(0).x, rampPoint(0).z], [4.5, 5.4], [9.5, 4.9], [PLANT.x - 1.5, PLANT.z + 2.8]],
  // junction → office → gate
  [[4.5, 5.4], [OFFICE.x - 1.8, OFFICE.z - 0.8], [GATE.x, GATE.z]],
  // office → workshop, office → fuel bay
  [[OFFICE.x + 1.8, OFFICE.z - 1.2], [WORKSHOP.x - 2.6, WORKSHOP.z - 0.6]],
  [[OFFICE.x - 1.8, OFFICE.z - 0.8], [FUEL.x + 1.4, FUEL.z - 0.4]],
  // plant ring road and the tailings pipeline track
  [[PLANT.x - 1.5, PLANT.z + 2.8], [PLANT.x + 4.5, PLANT.z + 3.2], [PLANT.x + 5.5, PLANT.z - 3], [PLANT.x + 1, PLANT.z - 4.5], [TSF.x - 2.5, TSF.z + 2.6]],
  // spur to the crusher's tipping point
  [[7.2, 5.1], [7.6, 3.9]],
  // waste haul road along the north side to the dump
  [[rampPoint(0).x, rampPoint(0).z], [-1.5, 8.6], [-8, 9.6], [WASTE.x + WASTE.rx - 0.6, WASTE.z + 1.2]],
]

/** Where haul trucks tip into the crusher hopper. */
export const TIP_POINT = { x: 7.6, z: 3.9 }

export const distToSeg = (px: number, pz: number, a: [number, number], b: [number, number]) => {
  const dx = b[0] - a[0]
  const dz = b[1] - a[1]
  const t = Math.max(0, Math.min(1, ((px - a[0]) * dx + (pz - a[1]) * dz) / (dx * dx + dz * dz)))
  return Math.hypot(px - (a[0] + dx * t), pz - (a[1] + dz * t))
}

export const roadDistance = (x: number, z: number) => {
  let best = Infinity
  for (const road of SURFACE_ROADS) {
    for (let i = 0; i < road.length - 1; i++) best = Math.min(best, distToSeg(x, z, road[i], road[i + 1]))
  }
  return best
}

export const padWeight = (x: number, z: number, cx: number, cz: number, rx: number, rz: number) =>
  smoothstep(1.15, 0.85, Math.hypot((x - cx) / rx, (z - cz) / rz))

/** Height of the island's top surface. */
export function topHeight(x: number, z: number) {
  const theta = Math.atan2(z, x)
  const rr = Math.hypot(x, z) / rimR(theta)
  let y = 0.25 + (noise(x * 0.18, z * 0.18) - 0.5) * 0.7 + (noise(x * 0.6, z * 0.6) - 0.5) * 0.15
  // Beyond the mine lease the ground climbs into a ring of mountains.
  if (rr > 1.9) {
    const m = smoothstep(1.9, 3.7, rr)
    y += m * (4 + 17 * noise(x * 0.045 + 7, z * 0.045 + 3) + 5 * noise(x * 0.14, z * 0.14)) + m * m * 6
  }

  // Flat pads for the plant and the office.
  const pads = Math.max(
    padWeight(x, z, PLANT.x, PLANT.z, 5.5, 4.5),
    padWeight(x, z, OFFICE.x, OFFICE.z, 2.6, 2),
    padWeight(x, z, CRUSHER.x, CRUSHER.z, 1.9, 1.7),
    padWeight(x, z, WORKSHOP.x, WORKSHOP.z, 3, 2.2),
    padWeight(x, z, FUEL.x, FUEL.z, 1.6, 1.3),
    padWeight(x, z, MAGAZINE.x, MAGAZINE.z, 1.4, 1.4),
  )
  y = y * (1 - pads) + 0.1 * pads

  // Waste dump: three flat-topped lifts with steep, berm-free faces.
  {
    const dd = Math.hypot((x - WASTE.x) / WASTE.rx, (z - WASTE.z) / WASTE.rz)
    let dump = 0
    for (let k = 0; k < WASTE.lifts; k++) {
      const edge = 1 - k * 0.27
      dump += smoothstep(edge + 0.06, edge - 0.04, dd) * WASTE.liftH
    }
    y += dump
  }

  // Tailings dam: an embankment ring with a level pond inside.
  {
    const dd = Math.hypot((x - TSF.x) / TSF.rx, (z - TSF.z) / TSF.rz)
    const wall = smoothstep(1.18, 1.0, dd) * smoothstep(0.78, 0.92, dd) * 0.75
    const floor = smoothstep(0.95, 0.85, dd)
    y = y * (1 - floor) + 0.42 * floor + wall
  }

  const { d, theta: pt } = pitCoords(x, z)
  if (d < 1) {
    const inward = 1 - d
    y = y * Math.max(0, 1 - inward * 4) - pitDepth(inward)

    // Carve the spiral haul road into the benches.
    const thetaN = (((pt - RAMP_START) % (Math.PI * 2)) + Math.PI * 4) % (Math.PI * 2)
    for (let k = 0; k < 2; k++) {
      const t = (thetaN + k * Math.PI * 2) / (Math.PI * 2 * RAMP_TURNS)
      if (t > 1) continue
      const p = rampPoint(t)
      const delta = Math.abs(inward - p.inward)
      if (delta < BW * 0.42) {
        const w = smoothstep(BW * 0.42, BW * 0.18, delta)
        y = y * (1 - w) - p.depth * w
      }
    }
  }
  return y
}

/** True where the road runs, for colouring and keeping trees off it. */
export function onRoad(x: number, z: number) {
  if (roadDistance(x, z) < 0.5) return true
  const { d, theta } = pitCoords(x, z)
  if (d >= 1) return false
  const inward = 1 - d
  const thetaN = (((theta - RAMP_START) % (Math.PI * 2)) + Math.PI * 4) % (Math.PI * 2)
  for (let k = 0; k < 2; k++) {
    const t = (thetaN + k * Math.PI * 2) / (Math.PI * 2 * RAMP_TURNS)
    if (t <= 1 && Math.abs(inward - rampPoint(t).inward) < BW * 0.2) return true
  }
  return false
}

/** World point on the ground. */
export const groundY = (x: number, z: number) => topHeight(x, z)

/** A point on a pit bench at angle θ around the pit and normalised depth `inward`. */
export const benchXZ = (theta: number, inward: number) => ({
  x: PIT.x + Math.cos(theta) * (1 - inward) * PIT.ax,
  z: PIT.z + Math.sin(theta) * (1 - inward) * PIT.az,
})

/** Island extents for physics/shadow bounds. */
export const BOUNDS = { minX: -RIM_A * 1.1, maxX: RIM_A * 1.1, minZ: -RIM_B * 1.15, maxZ: RIM_B * 1.15 }

/** True on a levelled industrial pad (no trees). */
export const onPad = (x: number, z: number, margin = 1) =>
  padWeight(x, z, PLANT.x, PLANT.z, 5.5 * margin, 4.5 * margin) > 0.05 ||
  padWeight(x, z, OFFICE.x, OFFICE.z, 2.6 * margin, 2 * margin) > 0.05 ||
  padWeight(x, z, CRUSHER.x, CRUSHER.z, 1.9 * margin, 1.7 * margin) > 0.05 ||
  padWeight(x, z, WORKSHOP.x, WORKSHOP.z, 3 * margin, 2.2 * margin) > 0.05 ||
  padWeight(x, z, FUEL.x, FUEL.z, 1.6 * margin, 1.3 * margin) > 0.05 ||
  padWeight(x, z, MAGAZINE.x, MAGAZINE.z, 1.4 * margin, 1.4 * margin) > 0.05 ||
  Math.hypot((x - WASTE.x) / (WASTE.rx * margin), (z - WASTE.z) / (WASTE.rz * margin)) < 1.08 ||
  Math.hypot((x - TSF.x) / (TSF.rx * margin), (z - TSF.z) / (TSF.rz * margin)) < 1.25

/** Height of the waste dump's top lift (the lookout). */
export const wasteTop = () => ({ x: WASTE.x, z: WASTE.z })

/** True on the waste dump's slopes or lifts (for colouring). */
export const onWaste = (x: number, z: number) => Math.hypot((x - WASTE.x) / WASTE.rx, (z - WASTE.z) / WASTE.rz) < 1.06

/** True inside the tailings pond. */
export const inTailings = (x: number, z: number) => Math.hypot((x - TSF.x) / TSF.rx, (z - TSF.z) / TSF.rz) < 0.9
