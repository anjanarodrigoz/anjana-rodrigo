import * as THREE from "three"

import { guideScreen, type StageId } from "@/journey"

/**
 * A floating-island open-pit mine in a diorama style: grassy top with trees,
 * a benched pit with a spiral haul road, yellow mining equipment, a
 * processing plant with silos and a pond, and a rock underside that glows
 * blue. A small engineer (the guide) walks between tour stops as you scroll.
 */

export interface IslandHandle {
  setJourney: (from: StageId, to: StageId, t: number) => void
  dispose: () => void
}

// ---------------------------------------------------------------------------
// Terrain model
// ---------------------------------------------------------------------------

const RIM_A = 17 // island half-length (x)
const RIM_B = 11 // island half-width (z)
const PIT = { x: -3.5, z: -1, ax: 8.5, az: 6.2 }
const BENCHES = 5
const BENCH_H = 0.95
const BW = 1 / (BENCHES + 1.3) // bench width in normalised pit units
const RAMP_TURNS = 1.35
const RAMP_START = 0.9
const PLANT = { x: 10, z: 0.5 }
const OFFICE = { x: 3.8, z: 7.4 }
const GATE = { x: 5.2, z: 9.7 }

const smoothstep = (a: number, b: number, x: number) => {
  const t = Math.min(1, Math.max(0, (x - a) / (b - a)))
  return t * t * (3 - 2 * t)
}
const hash = (x: number, y: number) => {
  const s = Math.sin(x * 127.1 + y * 311.7) * 43758.5453
  return s - Math.floor(s)
}
const noise = (x: number, y: number) => {
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
const rimR = (theta: number) => {
  const c = Math.cos(theta) / RIM_A
  const s = Math.sin(theta) / RIM_B
  return (1 / Math.sqrt(c * c + s * s)) * (1 + 0.05 * Math.sin(3 * theta + 1) + 0.035 * Math.sin(5 * theta - 0.5))
}

/** Normalised pit coordinates: d < 1 inside the pit, θ around its centre. */
const pitCoords = (x: number, z: number) => {
  const u = (x - PIT.x) / PIT.ax
  const v = (z - PIT.z) / PIT.az
  return { d: Math.hypot(u, v), theta: Math.atan2(v, u) }
}

const pitDepth = (inward: number) => {
  const steps = inward / BW
  const level = Math.min(Math.floor(steps), BENCHES)
  const frac = steps - Math.floor(steps)
  const face = level >= BENCHES ? 0 : smoothstep(0.62, 0.95, frac)
  return (level + face) * BENCH_H
}

const rampPoint = (t: number) => {
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

const SURFACE_ROADS: [number, number][][] = [
  // ramp top → plant
  [[rampPoint(0).x, rampPoint(0).z], [3.5, 4.2], [7, 3.6], [PLANT.x - 1.5, PLANT.z + 2.4]],
  // junction → office → gate
  [[3.5, 4.2], [OFFICE.x - 1.6, OFFICE.z - 0.6], [GATE.x, GATE.z]],
  // plant ring road
  [[PLANT.x - 1.5, PLANT.z + 2.4], [PLANT.x + 4, PLANT.z + 3], [PLANT.x + 5, PLANT.z - 2.5], [PLANT.x + 1, PLANT.z - 4]],
]

const distToSeg = (px: number, pz: number, a: [number, number], b: [number, number]) => {
  const dx = b[0] - a[0]
  const dz = b[1] - a[1]
  const t = Math.max(0, Math.min(1, ((px - a[0]) * dx + (pz - a[1]) * dz) / (dx * dx + dz * dz)))
  return Math.hypot(px - (a[0] + dx * t), pz - (a[1] + dz * t))
}

const roadDistance = (x: number, z: number) => {
  let best = Infinity
  for (const road of SURFACE_ROADS) {
    for (let i = 0; i < road.length - 1; i++) best = Math.min(best, distToSeg(x, z, road[i], road[i + 1]))
  }
  return best
}

const padWeight = (x: number, z: number, cx: number, cz: number, rx: number, rz: number) =>
  smoothstep(1.15, 0.85, Math.hypot((x - cx) / rx, (z - cz) / rz))

/** Height of the island's top surface. */
function topHeight(x: number, z: number) {
  const theta = Math.atan2(z, x)
  const rr = Math.hypot(x, z) / rimR(theta)
  let y = 0.25 + (noise(x * 0.18, z * 0.18) - 0.5) * 0.7 + (noise(x * 0.6, z * 0.6) - 0.5) * 0.15
  y -= smoothstep(0.9, 1.0, rr) * 0.35

  // Flat pads for the plant and the office.
  const pads = Math.max(padWeight(x, z, PLANT.x, PLANT.z, 5, 4), padWeight(x, z, OFFICE.x, OFFICE.z, 2.4, 1.8))
  y = y * (1 - pads) + 0.1 * pads

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
function onRoad(x: number, z: number) {
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

// ---------------------------------------------------------------------------
// Scene
// ---------------------------------------------------------------------------

export function createIslandScene(canvas: HTMLCanvasElement, options: { still?: boolean } = {}): IslandHandle {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: "high-performance" })
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5))
  renderer.setClearColor(0x000000, 0)
  renderer.outputColorSpace = THREE.SRGBColorSpace

  const scene = new THREE.Scene()
  const fog = new THREE.Fog(0xffffff, 40, 110)
  scene.fog = fog
  const camera = new THREE.PerspectiveCamera(36, 1, 0.1, 300)

  scene.add(new THREE.HemisphereLight(0xffffff, 0x9fb7e6, 1.5))
  const sun = new THREE.DirectionalLight(0xfff6e8, 1.9)
  sun.position.set(-18, 30, 16)
  scene.add(sun)
  const underGlow = new THREE.PointLight(0x2f7bff, 60, 30, 1.6)
  underGlow.position.set(0, -10, 0)
  scene.add(underGlow)

  const disposables: { dispose: () => void }[] = []
  const track = <T extends { dispose: () => void }>(item: T) => {
    disposables.push(item)
    return item
  }
  const color = new THREE.Color()

  // -- Island top ----------------------------------------------------------
  const RINGS = 150
  const SEG = 320
  const topPos: number[] = []
  const topCol: number[] = []
  const rimY: number[] = []
  const pushTop = (x: number, z: number) => {
    const y = topHeight(x, z)
    topPos.push(x, y, z)
    const { d } = pitCoords(x, z)
    const n = noise(x * 0.9, z * 0.9)
    if (onRoad(x, z)) color.set(0xcfc8b8).multiplyScalar(0.92 + n * 0.1)
    else if (d < 1) color.set(0x8b9098).multiplyScalar(0.8 + n * 0.3)
    else if (padWeight(x, z, PLANT.x, PLANT.z, 5, 4) > 0.5 || padWeight(x, z, OFFICE.x, OFFICE.z, 2.4, 1.8) > 0.5)
      color.set(0xb7bcc2)
    else if (d < 1.08) color.set(0x9a9c94)
    else color.setHSL(0.25 + n * 0.05, 0.42, 0.34 + n * 0.12)
    topCol.push(color.r, color.g, color.b)
    return y
  }
  pushTop(0, 0)
  for (let j = 1; j <= RINGS; j++) {
    for (let i = 0; i < SEG; i++) {
      const theta = (i / SEG) * Math.PI * 2
      const r = (j / RINGS) * rimR(theta)
      const y = pushTop(Math.cos(theta) * r, Math.sin(theta) * r)
      if (j === RINGS) rimY.push(y)
    }
  }
  const topIdx: number[] = []
  const vid = (j: number, i: number) => (j === 0 ? 0 : 1 + (j - 1) * SEG + (i % SEG))
  for (let i = 0; i < SEG; i++) topIdx.push(0, vid(1, i + 1), vid(1, i))
  for (let j = 1; j < RINGS; j++) {
    for (let i = 0; i < SEG; i++) {
      const a = vid(j, i)
      const b = vid(j, i + 1)
      const c = vid(j + 1, i)
      const d = vid(j + 1, i + 1)
      topIdx.push(a, b, c, b, d, c)
    }
  }
  const topGeo = track(new THREE.BufferGeometry())
  topGeo.setAttribute("position", new THREE.Float32BufferAttribute(topPos, 3))
  topGeo.setAttribute("color", new THREE.Float32BufferAttribute(topCol, 3))
  topGeo.setIndex(topIdx)
  topGeo.computeVertexNormals()

  // Darken steep bench faces so the terraces read.
  {
    const nrm = topGeo.attributes.normal as THREE.BufferAttribute
    const col = topGeo.attributes.color as THREE.BufferAttribute
    for (let k = 0; k < nrm.count; k++) {
      const ny = nrm.getY(k)
      if (ny < 0.8) {
        const f = 0.55 + ny * 0.4
        col.setXYZ(k, col.getX(k) * f, col.getY(k) * f, col.getZ(k) * f)
      }
    }
  }
  const island = new THREE.Group()
  scene.add(island)
  island.add(new THREE.Mesh(topGeo, track(new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.95 }))))

  // -- Rock underside: tapering, jagged, glowing blue toward the tip -------
  {
    const K = 22
    const pos: number[] = []
    const col: number[] = []
    const rock = new THREE.Color(0x5d6168)
    const glow = new THREE.Color(0x2f7bff)
    for (let k = 0; k <= K; k++) {
      const f = k / K
      for (let i = 0; i < SEG; i++) {
        const theta = (i / SEG) * Math.PI * 2
        const depth = 8.5 + noise(Math.cos(theta) * 2 + 3, Math.sin(theta) * 2 + 3) * 4
        const jag = k === 0 ? 0 : (hash(i * 0.37, k * 1.3) - 0.5) * 0.16
        const radius = rimR(theta) * (1 - 0.82 * Math.pow(f, 1.6)) * (1 + jag)
        const y = (k === 0 ? rimY[i] : rimY[i] * (1 - f)) - f * depth + (k === 0 ? 0 : (hash(i, k) - 0.5) * 0.5)
        pos.push(Math.cos(theta) * radius, y, Math.sin(theta) * radius)
        const shade = 0.75 + hash(i * 1.7, k * 0.9) * 0.45 - f * 0.25
        color.copy(rock).multiplyScalar(shade).lerp(glow, smoothstep(0.55, 1, f) * 0.85)
        col.push(color.r, color.g, color.b)
      }
    }
    pos.push(0, -14.5, 0)
    color.copy(glow)
    col.push(color.r, color.g, color.b)
    const tip = (K + 1) * SEG
    const idx: number[] = []
    for (let k = 0; k < K; k++) {
      for (let i = 0; i < SEG; i++) {
        const a = k * SEG + i
        const b = k * SEG + ((i + 1) % SEG)
        const c = (k + 1) * SEG + i
        const d = (k + 1) * SEG + ((i + 1) % SEG)
        idx.push(a, c, b, b, c, d)
      }
    }
    for (let i = 0; i < SEG; i++) idx.push(K * SEG + i, tip, K * SEG + ((i + 1) % SEG))
    const geo = track(new THREE.BufferGeometry())
    geo.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3))
    geo.setAttribute("color", new THREE.Float32BufferAttribute(col, 3))
    geo.setIndex(idx)
    geo.computeVertexNormals()
    island.add(
      new THREE.Mesh(geo, track(new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 1, flatShading: true }))),
    )
  }

  // Soft blue halo under the island.
  {
    const c = document.createElement("canvas")
    c.width = c.height = 128
    const g = c.getContext("2d")!
    const grad = g.createRadialGradient(64, 64, 0, 64, 64, 64)
    grad.addColorStop(0, "rgba(47,123,255,0.55)")
    grad.addColorStop(1, "rgba(47,123,255,0)")
    g.fillStyle = grad
    g.fillRect(0, 0, 128, 128)
    const tex = track(new THREE.CanvasTexture(c))
    const halo = new THREE.Sprite(track(new THREE.SpriteMaterial({ map: tex, depthWrite: false, fog: false })))
    halo.scale.set(34, 22, 1)
    halo.position.set(0, -11, 0)
    island.add(halo)
  }

  // -- Shared materials & helpers ------------------------------------------
  const yellow = track(new THREE.MeshStandardMaterial({ color: 0xf2b200, roughness: 0.55 }))
  const dark = track(new THREE.MeshStandardMaterial({ color: 0x23262b, roughness: 0.8 }))
  const steel = track(new THREE.MeshStandardMaterial({ color: 0xb9c0c8, roughness: 0.35, metalness: 0.6 }))
  const blue = track(new THREE.MeshStandardMaterial({ color: 0x1f5fd6, roughness: 0.45, metalness: 0.2 }))
  const white = track(new THREE.MeshStandardMaterial({ color: 0xf4f6f8, roughness: 0.6 }))
  const ore = track(new THREE.MeshStandardMaterial({ color: 0x6f7378, roughness: 1, flatShading: true }))
  const box = track(new THREE.BoxGeometry(1, 1, 1))
  const cyl = track(new THREE.CylinderGeometry(1, 1, 1, 20))
  const ground = (x: number, z: number) => new THREE.Vector3(x, topHeight(x, z), z)
  const part = (parent: THREE.Object3D, geo: THREE.BufferGeometry, mat: THREE.Material, x: number, y: number, z: number, sx: number, sy: number, sz: number) => {
    const m = new THREE.Mesh(geo, mat)
    m.position.set(x, y, z)
    m.scale.set(sx, sy, sz)
    parent.add(m)
    return m
  }

  // -- Trees -----------------------------------------------------------------
  {
    const coneGeo = track(new THREE.ConeGeometry(0.42, 1.3, 7))
    coneGeo.translate(0, 0.95, 0)
    const trunkGeo = track(new THREE.CylinderGeometry(0.07, 0.09, 0.4, 5))
    trunkGeo.translate(0, 0.2, 0)
    const spots: THREE.Matrix4[] = []
    const m = new THREE.Matrix4()
    let tries = 0
    while (spots.length < 170 && tries < 6000) {
      tries++
      const theta = hash(tries * 0.13, 1.7) * Math.PI * 2
      const rr = Math.sqrt(hash(tries * 0.71, 4.2)) * 0.94
      const x = Math.cos(theta) * rr * rimR(theta)
      const z = Math.sin(theta) * rr * rimR(theta)
      if (pitCoords(x, z).d < 1.12 || onRoad(x, z) || roadDistance(x, z) < 0.9) continue
      if (padWeight(x, z, PLANT.x, PLANT.z, 5.4, 4.4) > 0.05 || padWeight(x, z, OFFICE.x, OFFICE.z, 2.8, 2.2) > 0.05) continue
      const s = 0.7 + hash(tries, 9.1) * 0.6
      m.compose(ground(x, z), new THREE.Quaternion(), new THREE.Vector3(s, s * (0.9 + hash(tries, 3) * 0.4), s))
      spots.push(m.clone())
    }
    const crowns = new THREE.InstancedMesh(coneGeo, track(new THREE.MeshStandardMaterial({ roughness: 0.9, flatShading: true })), spots.length)
    const trunks = new THREE.InstancedMesh(trunkGeo, track(new THREE.MeshStandardMaterial({ color: 0x5a4632 })), spots.length)
    spots.forEach((mat, i) => {
      crowns.setMatrixAt(i, mat)
      trunks.setMatrixAt(i, mat)
      crowns.setColorAt(i, color.setHSL(0.31 + hash(i, 2) * 0.05, 0.45, 0.2 + hash(i, 5) * 0.08))
    })
    island.add(crowns, trunks)
    disposables.push(crowns, trunks)
  }

  // -- Rocks scattered in the pit -------------------------------------------
  {
    const rockGeo = track(new THREE.DodecahedronGeometry(0.22, 0))
    const n = 90
    const rocks = new THREE.InstancedMesh(rockGeo, ore, n)
    const m = new THREE.Matrix4()
    for (let i = 0; i < n; i++) {
      const a = hash(i, 0.3) * Math.PI * 2
      const r = 0.05 + hash(i, 0.9) * 0.3
      const x = PIT.x + Math.cos(a) * r * PIT.ax
      const z = PIT.z + Math.sin(a) * r * PIT.az
      const s = 0.6 + hash(i, 4) * 1.2
      m.compose(ground(x, z), new THREE.Quaternion().setFromEuler(new THREE.Euler(a, a * 2, 0)), new THREE.Vector3(s, s * 0.8, s))
      rocks.setMatrixAt(i, m)
    }
    island.add(rocks)
    disposables.push(rocks)
  }

  // -- Haul road (dashed edge line) and trucks ------------------------------
  const roadPts: THREE.Vector3[] = []
  for (let i = 0; i <= 400; i++) {
    const p = rampPoint(i / 400)
    roadPts.push(ground(p.x, p.z).add(new THREE.Vector3(0, 0.05, 0)))
  }
  const roadCurve = new THREE.CatmullRomCurve3(roadPts)

  const makeTruck = (loaded: boolean) => {
    const g = new THREE.Group()
    part(g, box, yellow, 0.15, 0.55, 0, 1.15, 0.45, 0.78) // tray
    part(g, box, yellow, -0.62, 0.55, 0, 0.36, 0.5, 0.7) // cab
    part(g, box, dark, -0.12, 0.27, 0, 1.4, 0.16, 0.6) // chassis
    for (const [x, z] of [[-0.55, 0.36], [-0.55, -0.36], [0.4, 0.36], [0.4, -0.36]]) {
      const w = part(g, cyl, dark, x, 0.22, z, 0.22, 0.16, 0.22)
      w.rotation.x = Math.PI / 2
    }
    if (loaded) part(g, track(new THREE.DodecahedronGeometry(0.4, 0)), ore, 0.18, 0.85, 0, 1.3, 0.55, 0.85)
    g.scale.setScalar(0.85)
    island.add(g)
    return g
  }
  const trucks = Array.from({ length: 5 }, (_, i) => ({
    mesh: makeTruck(i % 2 === 0),
    offset: i / 5,
    speed: 0.014 + (i % 3) * 0.002,
    up: i % 2 === 0,
  }))

  // -- Excavator on the pit floor ------------------------------------------
  const excavator = new THREE.Group()
  {
    part(excavator, box, dark, 0, 0.18, 0, 1.5, 0.3, 1.1)
    part(excavator, box, yellow, -0.1, 0.62, 0, 1.1, 0.6, 0.9)
    const boom = part(excavator, box, yellow, 0.95, 1.2, 0, 1.6, 0.16, 0.16)
    boom.rotation.z = 0.6
    const stick = part(excavator, box, yellow, 1.7, 1.0, 0, 0.14, 0.9, 0.14)
    stick.rotation.z = -0.3
    part(excavator, box, dark, 1.85, 0.5, 0, 0.45, 0.4, 0.5)
    const at = ground(PIT.x + 1, PIT.z + 0.4)
    excavator.position.copy(at)
    island.add(excavator)
  }

  // -- Drill rig on the upper bench + blast holes ---------------------------
  const DRILL_THETA = -1.75
  const benchPoint = (theta: number, inward: number) =>
    ground(PIT.x + Math.cos(theta) * (1 - inward) * PIT.ax, PIT.z + Math.sin(theta) * (1 - inward) * PIT.az)
  const DRILL = benchPoint(DRILL_THETA, 1.45 * BW)
  {
    const rig = new THREE.Group()
    part(rig, box, dark, 0, 0.2, 0, 1.1, 0.3, 0.7)
    part(rig, box, yellow, -0.3, 0.6, 0, 0.5, 0.5, 0.6)
    part(rig, box, yellow, 0.4, 1.8, 0, 0.14, 3, 0.14)
    rig.position.copy(benchPoint(DRILL_THETA + 0.28, 1.45 * BW))
    rig.rotation.y = -DRILL_THETA
    island.add(rig)
  }
  const holeMat = track(new THREE.MeshStandardMaterial({ color: 0x1f5fd6, emissive: 0x2f7bff, emissiveIntensity: 0 }))
  {
    const holeGeo = track(new THREE.CylinderGeometry(0.05, 0.05, 0.12, 6))
    const holes = new THREE.InstancedMesh(holeGeo, holeMat, 36)
    const m = new THREE.Matrix4()
    let n = 0
    for (let row = 0; row < 3; row++) {
      for (let col = 0; col < 12; col++) {
        const p = benchPoint(DRILL_THETA - 0.3 + col * 0.05 + (row % 2) * 0.025, 1.25 * BW + row * 0.035)
        m.makeTranslation(p.x, p.y + 0.06, p.z)
        holes.setMatrixAt(n++, m)
      }
    }
    island.add(holes)
    disposables.push(holes)
  }

  // -- Processing plant -------------------------------------------------------
  {
    const P = ground(PLANT.x, PLANT.z)
    const plant = new THREE.Group()
    plant.position.copy(P)
    // Main mill building: blue cladding with a steel frame.
    part(plant, box, blue, 1.2, 1.6, -0.6, 2.4, 3.2, 2.2)
    part(plant, box, steel, 1.2, 3.3, -0.6, 2.6, 0.15, 2.4)
    part(plant, box, steel, 0.2, 2.2, 1.1, 0.1, 4.4, 0.1)
    part(plant, box, steel, 2.2, 2.2, 1.1, 0.1, 4.4, 0.1)
    // Stack and tall silo.
    part(plant, cyl, steel, 0.1, 2.6, -1.5, 0.35, 5.2, 0.35)
    part(plant, cyl, steel, -1.4, 1.6, -1.6, 0.75, 3.2, 0.75)
    // Tanks.
    part(plant, cyl, steel, -2.2, 0.9, 0.6, 0.85, 1.8, 0.85)
    part(plant, cyl, steel, -0.6, 0.9, 1.4, 0.75, 1.8, 0.75)
    part(plant, cyl, blue, 3.1, 1.0, 1.4, 0.9, 2.0, 0.9)
    // Pond.
    const pond = part(plant, cyl, track(new THREE.MeshStandardMaterial({ color: 0x4bb3f0, roughness: 0.15, metalness: 0.2 })), 3.4, 0.08, -2.4, 1.5, 0.12, 1.1)
    pond.scale.set(1.5, 0.12, 1.1)
    part(plant, cyl, white, 3.4, 0.04, -2.4, 1.65, 0.1, 1.25)
    island.add(plant)

    // Conveyor from the pit rim to the plant, on legs.
    const a = ground(3, -0.8).add(new THREE.Vector3(0, 0.5, 0))
    const b = P.clone().add(new THREE.Vector3(-0.2, 2.6, -0.6))
    const belt = new THREE.Mesh(box, dark)
    belt.scale.set(a.distanceTo(b), 0.14, 0.42)
    belt.position.copy(a).lerp(b, 0.5)
    belt.lookAt(b)
    belt.rotateY(Math.PI / 2)
    island.add(belt)
    for (let k = 1; k < 5; k++) {
      const at = a.clone().lerp(b, k / 5)
      const g = ground(at.x, at.z)
      const leg = new THREE.Mesh(box, steel)
      leg.scale.set(0.1, at.y - g.y, 0.1)
      leg.position.set(at.x, (at.y + g.y) / 2, at.z)
      island.add(leg)
    }
    // Crusher at the conveyor's tail.
    const C = ground(2.4, -0.4)
    const crusher = new THREE.Group()
    crusher.position.copy(C)
    part(crusher, box, steel, 0, 0.5, 0, 1.2, 1, 1.2)
    part(crusher, box, yellow, 0, 1.15, 0, 1.4, 0.3, 1.4)
    island.add(crusher)
  }

  // -- Site office, sheds and gate -----------------------------------------
  {
    const o = ground(OFFICE.x, OFFICE.z)
    const office = new THREE.Group()
    office.position.copy(o)
    office.rotation.y = 0.35
    part(office, box, white, 0, 0.45, 0, 2.2, 0.9, 1.1)
    part(office, box, blue, 0, 0.95, 0, 2.3, 0.1, 1.2)
    part(office, box, white, 1.8, 0.45, 0.5, 1, 0.9, 0.9)
    part(office, box, steel, 1.8, 0.95, 0.5, 1.1, 0.1, 1)
    island.add(office)
    const g = ground(GATE.x, GATE.z)
    const gate = new THREE.Group()
    gate.position.copy(g)
    gate.rotation.y = 0.45
    part(gate, box, dark, -0.9, 0.6, 0, 0.14, 1.2, 0.14)
    part(gate, box, dark, 0.9, 0.6, 0, 0.14, 1.2, 0.14)
    part(gate, box, blue, 0, 1.15, 0, 2, 0.12, 0.12)
    island.add(gate)
  }

  // -- Floating rocks under the island ---------------------------------------
  const floaters: { mesh: THREE.Mesh; base: THREE.Vector3; phase: number }[] = []
  {
    const geo = track(new THREE.DodecahedronGeometry(0.6, 0))
    const mat = track(new THREE.MeshStandardMaterial({ color: 0x5d6168, roughness: 1, flatShading: true }))
    for (let i = 0; i < 9; i++) {
      const a = (i / 9) * Math.PI * 2 + 0.3
      const mesh = new THREE.Mesh(geo, mat)
      const base = new THREE.Vector3(Math.cos(a) * (12 + (i % 3) * 3), -6 - (i % 4) * 2.2, Math.sin(a) * (8 + (i % 2) * 3))
      const s = 0.5 + hash(i, 1) * 1.3
      mesh.scale.set(s, s * 0.8, s)
      mesh.position.copy(base)
      scene.add(mesh)
      floaters.push({ mesh, base, phase: i * 0.7 })
    }
  }

  // -- The guide: a small engineer in a hard hat --------------------------
  const guide = new THREE.Group()
  const legs: THREE.Object3D[] = []
  const arms: THREE.Object3D[] = []
  {
    const skin = track(new THREE.MeshStandardMaterial({ color: 0xa8714d, roughness: 0.7 }))
    const navy = track(new THREE.MeshStandardMaterial({ color: 0x1b2a44, roughness: 0.8 }))
    const vest = track(new THREE.MeshStandardMaterial({ color: 0x1f5fd6, roughness: 0.6 }))
    const hair = track(new THREE.MeshStandardMaterial({ color: 0x1a1410, roughness: 0.9 }))
    const limb = (parent: THREE.Object3D, mat: THREE.Material, x: number, y: number, h: number, w: number) => {
      const pivot = new THREE.Group()
      pivot.position.set(x, y, 0)
      const m = new THREE.Mesh(box, mat)
      m.scale.set(w, h, w)
      m.position.y = -h / 2
      pivot.add(m)
      parent.add(pivot)
      return pivot
    }
    legs.push(limb(guide, navy, -0.09, 0.5, 0.5, 0.13), limb(guide, navy, 0.09, 0.5, 0.5, 0.13))
    part(guide, box, dark, -0.09, 0.03, 0.04, 0.14, 0.07, 0.22)
    part(guide, box, dark, 0.09, 0.03, 0.04, 0.14, 0.07, 0.22)
    part(guide, box, vest, 0, 0.75, 0, 0.36, 0.5, 0.22)
    part(guide, box, white, 0, 0.7, 0.112, 0.37, 0.05, 0.01)
    part(guide, box, white, 0, 0.82, 0.112, 0.37, 0.05, 0.01)
    arms.push(limb(guide, vest, -0.23, 0.98, 0.45, 0.1), limb(guide, vest, 0.23, 0.98, 0.45, 0.1))
    // Tablet in the left hand.
    const tablet = new THREE.Mesh(box, dark)
    tablet.scale.set(0.2, 0.26, 0.03)
    tablet.position.set(0, -0.42, 0.08)
    tablet.rotation.x = -0.5
    arms[0].add(tablet)
    const head = part(guide, track(new THREE.SphereGeometry(1, 16, 12)), skin, 0, 1.17, 0, 0.15, 0.17, 0.15)
    head.name = "head"
    part(guide, track(new THREE.SphereGeometry(1, 16, 8, 0, Math.PI * 2, 0, Math.PI / 2)), white, 0, 1.24, 0, 0.18, 0.14, 0.18)
    part(guide, cyl, white, 0, 1.24, 0.02, 0.21, 0.02, 0.23)
    part(guide, box, hair, 0, 1.2, -0.08, 0.26, 0.12, 0.08)
    guide.scale.setScalar(1.6)
    island.add(guide)
  }

  // -- Tour stops: where the guide stands and how the camera frames it -----
  const v = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z)
  const pitOut = (theta: number) => v(Math.cos(theta) * PIT.ax, 0, Math.sin(theta) * PIT.az).normalize()
  const WALLS_THETA = -0.55
  const stops: Record<StageId, { spot: THREE.Vector3; cam: (spot: THREE.Vector3) => { pos: THREE.Vector3; look: THREE.Vector3 } }> = {
    welcome: {
      spot: ground(0.5, 6.2),
      cam: () => ({ pos: v(-20, 22, 36), look: v(1.5, -3, 0) }),
    },
    office: {
      spot: ground(OFFICE.x - 1.2, OFFICE.z + 1.4),
      cam: (s) => ({ pos: s.clone().add(v(-9, 9, 15)), look: s.clone().add(v(2, 0.5, -3)) }),
    },
    control: {
      spot: ground(PLANT.x - 3, PLANT.z + 3),
      cam: (s) => ({ pos: s.clone().add(v(-8, 11, 16)), look: s.clone().add(v(3, 1, -3)) }),
    },
    drill: {
      spot: benchPoint(DRILL_THETA - 0.12, 1.5 * BW),
      cam: (s) => ({ pos: s.clone().addScaledVector(pitOut(DRILL_THETA), -13).add(v(0, 9, 0)), look: s.clone().add(v(0, 0.5, 0)) }),
    },
    load: {
      spot: ground(PIT.x - 0.4, PIT.z + 1.3),
      cam: (s) => ({ pos: s.clone().add(v(4, 14, 13)), look: s.clone().add(v(1, 0.3, -0.8)) }),
    },
    haul: {
      spot: (() => {
        const p = rampPoint(0.32)
        return ground(p.x, p.z)
      })(),
      cam: (s) => ({ pos: s.clone().add(v(5, 9, 13)), look: s.clone().add(v(0, 0.5, 0)) }),
    },
    walls: {
      spot: benchPoint(WALLS_THETA, 2.5 * BW),
      cam: (s) => ({ pos: s.clone().addScaledVector(pitOut(WALLS_THETA), -12).add(v(0, 6.5, 0)), look: s.clone().add(v(0, 1, 0)) }),
    },
    lookout: {
      spot: ground(-11.5, 5.5),
      cam: (s) => ({ pos: s.clone().add(v(-6, 9, 13)), look: v(-2, -1, 0) }),
    },
    gate: {
      spot: ground(GATE.x - 0.6, GATE.z - 0.8),
      cam: () => ({ pos: v(30, 24, 34), look: v(1, -3, 0) }),
    },
  }

  // -- Interaction & sizing --------------------------------------------------
  const pointer = { x: 0, y: 0, tx: 0, ty: 0 }
  const onPointer = (event: PointerEvent) => {
    pointer.tx = (event.clientX / window.innerWidth) * 2 - 1
    pointer.ty = (event.clientY / window.innerHeight) * 2 - 1
  }
  window.addEventListener("pointermove", onPointer, { passive: true })

  let portrait = false
  let wide = false
  const resize = () => {
    const { clientWidth: w, clientHeight: h } = canvas
    if (!w || !h) return
    renderer.setSize(w, h, false)
    camera.aspect = w / h
    camera.fov = w / h < 1 ? 48 : 36
    portrait = w / h < 0.8
    wide = w / h > 1.25
    camera.updateProjectionMatrix()
  }
  const resizeObserver = new ResizeObserver(resize)
  resizeObserver.observe(canvas)
  resize()

  // -- Loop ------------------------------------------------------------------
  const journey: { from: StageId; to: StageId; t: number } = { from: "welcome", to: "welcome", t: 0 }
  const clock = new THREE.Clock()
  const camPos = v(-17, 19, 31)
  const camLook = v(1.5, -3, 0)
  const guidePos = stops.welcome.spot.clone()
  const tangent = new THREE.Vector3()
  const head = new THREE.Vector3()
  let walkPhase = 0
  let frame = 0
  let running = !options.still
  let snap = true

  const weight = (id: StageId) => (journey.from === id ? 1 - journey.t : 0) + (journey.to === id ? journey.t : 0)

  const update = (t: number, dt: number) => {
    pointer.x += (pointer.tx - pointer.x) * 0.04
    pointer.y += (pointer.ty - pointer.y) * 0.04

    for (const truck of trucks) {
      let u = (truck.offset + t * truck.speed) % 1
      if (truck.up) u = 1 - u
      truck.mesh.position.copy(roadCurve.getPointAt(u))
      roadCurve.getTangentAt(u, tangent)
      if (truck.up) tangent.negate()
      truck.mesh.rotation.y = Math.atan2(-tangent.z, tangent.x) + Math.PI
    }
    excavator.rotation.y = Math.sin(t * 0.6) * 0.8
    holeMat.emissiveIntensity = weight("drill") * (0.7 + 0.3 * Math.sin(t * 4))
    for (const f of floaters) {
      f.mesh.position.y = f.base.y + Math.sin(t * 0.8 + f.phase) * 0.4
      f.mesh.rotation.y = t * 0.2 + f.phase
    }

    // The guide walks between stops along the ground.
    const a = stops[journey.from]
    const b = stops[journey.to]
    const target = a.spot.clone().lerp(b.spot, journey.t)
    target.y = topHeight(target.x, target.z)
    const before = guidePos.clone()
    guidePos.lerp(target, snap ? 1 : 0.08)
    guidePos.y = topHeight(guidePos.x, guidePos.z)
    guide.position.copy(guidePos)
    const step = Math.hypot(guidePos.x - before.x, guidePos.z - before.z)
    if (step > 0.004) {
      guide.rotation.y = Math.atan2(guidePos.x - before.x, guidePos.z - before.z)
      walkPhase += step * 9
    } else {
      // Standing: turn to face the camera.
      const face = Math.atan2(camPos.x - guidePos.x, camPos.z - guidePos.z)
      const diff = ((face - guide.rotation.y + Math.PI * 3) % (Math.PI * 2)) - Math.PI
      guide.rotation.y += diff * 0.08
    }
    const swing = step > 0.004 ? Math.sin(walkPhase) * 0.6 : Math.sin(t * 1.5) * 0.03
    legs[0].rotation.x = swing
    legs[1].rotation.x = -swing
    arms[0].rotation.x = step > 0.004 ? -swing * 0.7 : -0.9 // holds the tablet up when standing
    arms[1].rotation.x = step > 0.004 ? swing * 0.7 : Math.sin(t * 2) * 0.15 - 0.2

    // Camera: blend the two stop framings, then ease toward them.
    const ca = a.cam(a.spot)
    const cb = b.cam(b.spot)
    const pos = ca.pos.lerp(cb.pos, journey.t)
    const look = ca.look.lerp(cb.look, journey.t)
    if (portrait) pos.sub(look).multiplyScalar(1.5).add(look)
    pos.add(v(pointer.x * 0.9, -pointer.y * 0.6, 0))
    pos.y += Math.sin(t * 0.5) * 0.25 // gentle float
    const ease = snap ? 1 : 1 - Math.pow(0.001, dt) // frame-rate independent
    snap = false
    camPos.lerp(pos, ease)
    camLook.lerp(look, ease)
    camera.position.copy(camPos)
    camera.lookAt(camLook)

    const dist = camPos.distanceTo(camLook)
    fog.near = dist * 1.2
    fog.far = dist * 3

    // Hero framing: island right of the copy on desktop, above it on phones.
    const s = weight("welcome")
    const { clientWidth: w, clientHeight: h } = canvas
    // Elsewhere, lift the subject into the open space above the content card.
    const offX = wide ? -w * 0.22 * s : 0
    const offY = portrait ? h * 0.16 * s + h * 0.12 * (1 - s) : h * 0.1 * (1 - s)
    if (offX || offY) camera.setViewOffset(w, h, offX, offY, w, h)
    else camera.clearViewOffset()

    // Publish the guide's head position in screen space for the speech bubble.
    camera.updateMatrixWorld()
    head.copy(guidePos).add(v(0, 1.75, 0)).project(camera)
    guideScreen.visible = head.z < 1 && Math.abs(head.x) < 1.05 && Math.abs(head.y) < 1.05
    guideScreen.x = ((head.x + 1) / 2) * w
    guideScreen.y = ((1 - head.y) / 2) * h
  }

  let last = performance.now()
  const tick = (now: number) => {
    frame = 0
    if (!running) return
    const dt = Math.min(0.1, (now - last) / 1000)
    last = now
    update(clock.getElapsedTime(), dt)
    renderer.render(scene, camera)
    frame = requestAnimationFrame(tick)
  }

  if (options.still) {
    update(4, 1)
    renderer.render(scene, camera)
  } else frame = requestAnimationFrame(tick)

  return {
    setJourney(from, to, t) {
      journey.from = from
      journey.to = to
      journey.t = t
      if (options.still) {
        snap = true
        update(4, 1)
        renderer.render(scene, camera)
      }
    },
    dispose() {
      running = false
      cancelAnimationFrame(frame)
      window.removeEventListener("pointermove", onPointer)
      resizeObserver.disconnect()
      disposables.forEach((item) => item.dispose())
      renderer.dispose()
    },
  }
}
