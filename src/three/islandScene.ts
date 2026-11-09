import * as THREE from "three"

import { mineState, screenAnchors, type StageId } from "@/journey"

import { createCharacter } from "./character"
import { createPhysics } from "./physics"
import {
  BW,
  CRUSHER,
  FUEL,
  GATE,
  MAGAZINE,
  OFFICE,
  PIT,
  PLANT,
  STOCKPILE,
  TIP_POINT,
  TSF,
  WASTE,
  WORKSHOP,
  benchXZ,
  hash,
  inTailings,
  noise,
  onPad,
  onRoad,
  onWaste,
  pitCoords,
  rampPoint,
  rimR,
  roadDistance,
  smoothstep,
  topHeight,
} from "./terrain"
import { createKit } from "./vehicles"

/**
 * A floating-island open-pit mine. Haul trucks cycle between the excavator
 * on the pit floor and the crusher, the excavator loads a truck with
 * physics-simulated rock, the drill bench blasts, ore rides the conveyor to
 * the stockpile, and Anjana walks the tour with a physics-driven gait.
 * At the MineBook stop, the whole mine lights up as one connected system.
 */

export interface IslandHandle {
  setJourney: (from: StageId, to: StageId, t: number) => void
  dispose: () => void
}

const v = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z)
const ground = (x: number, z: number) => v(x, topHeight(x, z), z)

export function createIslandScene(canvas: HTMLCanvasElement, options: { still?: boolean } = {}): IslandHandle {
  // -- Renderer ---------------------------------------------------------------
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: "high-performance" })
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5))
  renderer.setClearColor(0x000000, 0)
  renderer.outputColorSpace = THREE.SRGBColorSpace
  renderer.toneMapping = THREE.ACESFilmicToneMapping
  renderer.toneMappingExposure = 1.05
  renderer.shadowMap.enabled = true
  renderer.shadowMap.type = THREE.PCFSoftShadowMap

  const scene = new THREE.Scene()
  const fog = new THREE.Fog(0xffffff, 40, 110)
  scene.fog = fog
  const camera = new THREE.PerspectiveCamera(36, 1, 0.1, 300)

  // -- Light: soft sky + a warm low sun casting shadows ------------------------
  scene.add(new THREE.HemisphereLight(0xdfeaff, 0x7b6a55, 1.25))
  const sun = new THREE.DirectionalLight(0xfff1dc, 2.6)
  sun.position.set(-22, 34, 19)
  sun.castShadow = true
  sun.shadow.mapSize.set(2048, 2048)
  sun.shadow.camera.left = -30
  sun.shadow.camera.right = 30
  sun.shadow.camera.top = 22
  sun.shadow.camera.bottom = -22
  sun.shadow.camera.near = 1
  sun.shadow.camera.far = 100
  sun.shadow.bias = -0.0006
  sun.shadow.normalBias = 0.02
  scene.add(sun)
  const fill = new THREE.DirectionalLight(0xbcd2ff, 0.45)
  fill.position.set(18, 10, -12)
  scene.add(fill)
  const underGlow = new THREE.PointLight(0x2f7bff, 110, 42, 1.6)
  underGlow.position.set(0, -13, 0)
  scene.add(underGlow)

  const disposables: { dispose: () => void }[] = []
  const track = <T extends { dispose: () => void }>(item: T) => (disposables.push(item), item)
  const kit = createKit()
  const { mat, geo, add } = kit
  const color = new THREE.Color()

  // Fine grain texture multiplied over vertex colours (gravel, grass, rock).
  const grain = (() => {
    const c = document.createElement("canvas")
    c.width = c.height = 256
    const g = c.getContext("2d")!
    const img = g.createImageData(256, 256)
    for (let i = 0; i < 256 * 256; i++) {
      const x = i % 256
      const y = (i / 256) | 0
      const n = 0.82 + 0.18 * (0.6 * Math.random() + 0.4 * noise(x * 0.08, y * 0.08))
      const val = Math.round(255 * n)
      img.data.set([val, val, val, 255], i * 4)
    }
    g.putImageData(img, 0, 0)
    const tex = track(new THREE.CanvasTexture(c))
    tex.wrapS = tex.wrapT = THREE.RepeatWrapping
    tex.colorSpace = THREE.SRGBColorSpace
    tex.anisotropy = 4
    return tex
  })()

  const island = new THREE.Group()
  scene.add(island)

  // -- Island top: terraced pit, haul roads, grass ---------------------------
  const RINGS = 190
  const SEG = 400
  const rimY: number[] = []
  {
    const pos: number[] = []
    const col: number[] = []
    const uv: number[] = []
    const push = (x: number, z: number) => {
      const y = topHeight(x, z)
      pos.push(x, y, z)
      uv.push(x * 0.35, z * 0.35)
      const { d, theta } = pitCoords(x, z)
      const n = noise(x * 0.9, z * 0.9)
      if (onRoad(x, z)) {
        // Compacted haul road gravel with darker wheel ruts.
        const rut = 0.92 + 0.08 * Math.sin((roadDistance(x, z) + x * 0.02) * 40)
        color.set(0xbcae97).multiplyScalar((0.9 + n * 0.12) * rut)
      } else if (d < 1) {
        // Pit rock: warm grey with horizontal banding by bench and vertical joints.
        const band = 0.88 + 0.12 * noise(theta * 30, y * 2.2)
        color.set(0x8c8378).lerp(color.clone().set(0x6f6a64), n * 0.6).multiplyScalar(band)
      } else if (inTailings(x, z)) color.set(0xcfc7b4).multiplyScalar(0.92 + n * 0.1) // dried tailings beach
      else if (onWaste(x, z)) color.set(0x8f7a62).multiplyScalar(0.82 + n * 0.3) // dumped waste rock
      else if (onPad(x, z, 1)) color.set(0xb4b1aa).multiplyScalar(0.9 + n * 0.12)
      else if (d < 1.07) color.set(0x9a9384) // disturbed ground at the crest
      else color.setHSL(0.24 + n * 0.06, 0.38, 0.3 + n * 0.12)
      col.push(color.r, color.g, color.b)
      return y
    }
    push(0, 0)
    for (let j = 1; j <= RINGS; j++) {
      for (let i = 0; i < SEG; i++) {
        const theta = (i / SEG) * Math.PI * 2
        const r = (j / RINGS) * rimR(theta)
        const y = push(Math.cos(theta) * r, Math.sin(theta) * r)
        if (j === RINGS) rimY.push(y)
      }
    }
    const idx: number[] = []
    const vid = (j: number, i: number) => (j === 0 ? 0 : 1 + (j - 1) * SEG + (i % SEG))
    for (let i = 0; i < SEG; i++) idx.push(0, vid(1, i + 1), vid(1, i))
    for (let j = 1; j < RINGS; j++) {
      for (let i = 0; i < SEG; i++) {
        const a = vid(j, i)
        const b = vid(j, i + 1)
        const c = vid(j + 1, i)
        const d = vid(j + 1, i + 1)
        idx.push(a, b, c, b, d, c)
      }
    }
    const g = track(new THREE.BufferGeometry())
    g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3))
    g.setAttribute("color", new THREE.Float32BufferAttribute(col, 3))
    g.setAttribute("uv", new THREE.Float32BufferAttribute(uv, 2))
    g.setIndex(idx)
    g.computeVertexNormals()
    // Bench faces: darker, with vertical streaking.
    const nrm = g.attributes.normal as THREE.BufferAttribute
    const c = g.attributes.color as THREE.BufferAttribute
    const p = g.attributes.position as THREE.BufferAttribute
    for (let k = 0; k < nrm.count; k++) {
      const ny = nrm.getY(k)
      if (ny < 0.85) {
        const streak = 0.85 + 0.15 * noise(Math.atan2(p.getZ(k) - PIT.z, p.getX(k) - PIT.x) * 60, 0.5)
        const f = (0.5 + ny * 0.45) * streak
        c.setXYZ(k, c.getX(k) * f, c.getY(k) * f, c.getZ(k) * f)
      }
    }
    const top = new THREE.Mesh(g, track(new THREE.MeshStandardMaterial({ vertexColors: true, map: grain, roughness: 0.95 })))
    top.receiveShadow = true
    island.add(top)
  }

  // -- Rock underside, tapering and glowing blue toward the tip ------------
  {
    const K = 22
    const pos: number[] = []
    const col: number[] = []
    const rock = new THREE.Color(0x5e5f63)
    const glow = new THREE.Color(0x2f7bff)
    for (let k = 0; k <= K; k++) {
      const f = k / K
      for (let i = 0; i < SEG; i++) {
        const theta = (i / SEG) * Math.PI * 2
        const depth = 11.5 + noise(Math.cos(theta) * 2 + 3, Math.sin(theta) * 2 + 3) * 5
        const jag = k === 0 ? 0 : (hash(i * 0.37, k * 1.3) - 0.5) * 0.16
        const radius = rimR(theta) * (1 - 0.82 * Math.pow(f, 1.6)) * (1 + jag)
        const y = (k === 0 ? rimY[i] : rimY[i] * (1 - f)) - f * depth + (k === 0 ? 0 : (hash(i, k) - 0.5) * 0.5)
        pos.push(Math.cos(theta) * radius, y, Math.sin(theta) * radius)
        // Soil band just under the grass, then rock strata.
        const strata = 0.85 + 0.15 * Math.sin(y * 3 + hash(i, 2))
        if (f < 0.06) color.set(0x6b5440)
        else color.copy(rock).multiplyScalar((0.75 + hash(i * 1.7, k * 0.9) * 0.4 - f * 0.25) * strata)
        color.lerp(glow, smoothstep(0.55, 1, f) * 0.85)
        col.push(color.r, color.g, color.b)
      }
    }
    pos.push(0, -19.5, 0)
    col.push(glow.r, glow.g, glow.b)
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
    const g = track(new THREE.BufferGeometry())
    g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3))
    g.setAttribute("color", new THREE.Float32BufferAttribute(col, 3))
    g.setIndex(idx)
    g.computeVertexNormals()
    island.add(new THREE.Mesh(g, track(new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 1, flatShading: true }))))
  }

  // Soft blue halo under the island + soft round texture shared with dust.
  const softTex = (() => {
    const c = document.createElement("canvas")
    c.width = c.height = 128
    const g = c.getContext("2d")!
    const grad = g.createRadialGradient(64, 64, 0, 64, 64, 64)
    grad.addColorStop(0, "rgba(255,255,255,1)")
    grad.addColorStop(0.5, "rgba(255,255,255,0.45)")
    grad.addColorStop(1, "rgba(255,255,255,0)")
    g.fillStyle = grad
    g.fillRect(0, 0, 128, 128)
    return track(new THREE.CanvasTexture(c))
  })()
  {
    const halo = new THREE.Sprite(track(new THREE.SpriteMaterial({ map: softTex, color: 0x2f7bff, opacity: 0.5, transparent: true, depthWrite: false, fog: false })))
    halo.scale.set(48, 30, 1)
    halo.position.set(0, -14, 0)
    island.add(halo)
  }

  // -- Trees: three-tier pines with natural variation ----------------------
  {
    const tiers = [0, 1, 2].map((k) => {
      const g = track(new THREE.ConeGeometry(0.5 - k * 0.11, 0.75, 8))
      g.translate(0, 0.55 + k * 0.38, 0)
      return g
    })
    const trunkGeo = track(new THREE.CylinderGeometry(0.06, 0.09, 0.6, 6))
    trunkGeo.translate(0, 0.3, 0)
    const leaf = track(new THREE.MeshStandardMaterial({ roughness: 0.85, flatShading: true }))
    const bark = track(new THREE.MeshStandardMaterial({ color: 0x5a4330, roughness: 0.9 }))
    const spots: THREE.Matrix4[] = []
    const m4 = new THREE.Matrix4()
    let tries = 0
    while (spots.length < 400 && tries < 16000) {
      tries++
      const theta = hash(tries * 0.13, 1.7) * Math.PI * 2
      const rr = Math.sqrt(hash(tries * 0.71, 4.2)) * 0.94
      const x = Math.cos(theta) * rr * rimR(theta)
      const z = Math.sin(theta) * rr * rimR(theta)
      if (pitCoords(x, z).d < 1.12 || onRoad(x, z) || roadDistance(x, z) < 0.9 || onPad(x, z, 1.15)) continue
      const s = 0.65 + hash(tries, 9.1) * 0.7
      const tilt = new THREE.Quaternion().setFromEuler(new THREE.Euler((hash(tries, 5) - 0.5) * 0.08, hash(tries, 6) * 6, (hash(tries, 7) - 0.5) * 0.08))
      m4.compose(ground(x, z).add(v(0, -0.05, 0)), tilt, v(s, s * (0.9 + hash(tries, 3) * 0.45), s))
      spots.push(m4.clone())
    }
    const meshes = [...tiers.map((g) => new THREE.InstancedMesh(g, leaf, spots.length)), new THREE.InstancedMesh(trunkGeo, bark, spots.length)]
    spots.forEach((m, i) => {
      meshes.forEach((im, k) => {
        im.setMatrixAt(i, m)
        if (k < 3) im.setColorAt(i, color.setHSL(0.3 + hash(i, 2) * 0.06, 0.42, 0.17 + hash(i, 5) * 0.07 + k * 0.025))
      })
    })
    meshes.forEach((im) => {
      im.castShadow = true
      im.receiveShadow = true
      island.add(im)
      disposables.push(im)
    })
  }

  // -- Safety berms along the drop-off edge of the haul ramp ---------------
  const roadPts: THREE.Vector3[] = []
  {
    const berm: THREE.Vector3[] = []
    for (let i = 0; i <= 420; i++) {
      const p = rampPoint(i / 420)
      roadPts.push(ground(p.x, p.z).add(v(0, 0.04, 0)))
      const q = benchXZ(p.theta, p.inward + BW * 0.33)
      berm.push(v(q.x, topHeight(p.x, p.z) + 0.05, q.z))
    }
    const tube = track(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(berm), 600, 0.075, 5, false))
    const m = new THREE.Mesh(tube, track(new THREE.MeshStandardMaterial({ color: 0x8a7d6a, roughness: 1, map: grain })))
    m.castShadow = true
    m.receiveShadow = true
    island.add(m)
  }
  const rampCurve = new THREE.CatmullRomCurve3(roadPts)

  // Pit-floor sump (dewatering pond) and scattered rock.
  {
    const floor = ground(PIT.x - 0.9, PIT.z - 0.9)
    const water = new THREE.Mesh(track(new THREE.CircleGeometry(1, 32)), track(new THREE.MeshStandardMaterial({ color: 0x3e7f8c, roughness: 0.1, metalness: 0.3 })))
    water.rotation.x = -Math.PI / 2
    water.scale.set(0.7, 0.45, 1)
    water.position.copy(floor).add(v(0, 0.03, 0))
    water.receiveShadow = true
    island.add(water)
    const rockGeo = track(new THREE.DodecahedronGeometry(0.2, 0))
    const n = 70
    const rocks = new THREE.InstancedMesh(rockGeo, mat.ore, n)
    const m4 = new THREE.Matrix4()
    for (let i = 0; i < n; i++) {
      const a = hash(i, 0.3) * Math.PI * 2
      const r = 0.6 + hash(i, 0.9) * 0.45
      const q = benchXZ(a, 1 - 0.19 * r)
      const s = 0.5 + hash(i, 4) * 1.1
      m4.compose(ground(q.x, q.z), new THREE.Quaternion().setFromEuler(new THREE.Euler(a, a * 2, 0)), v(s, s * 0.75, s))
      rocks.setMatrixAt(i, m4)
    }
    rocks.castShadow = true
    rocks.receiveShadow = true
    island.add(rocks)
    disposables.push(rocks)
  }

  // -- Physics -------------------------------------------------------------
  const physics = createPhysics(island, mat.ore)

  // -- Excavator and the truck it is loading --------------------------------
  const EXC = ground(PIT.x + 0.9, PIT.z - 0.4)
  const exc = kit.excavator()
  exc.root.position.copy(EXC)
  exc.root.scale.setScalar(0.95)
  exc.root.rotation.y = 0.4
  island.add(exc.root)

  const loader = kit.haulTruck()
  const LOAD_AT = ground(PIT.x - 0.5, PIT.z + 0.55)
  loader.root.position.copy(LOAD_AT)
  loader.root.rotation.y = -0.35
  loader.root.scale.setScalar(0.9)
  loader.load.visible = false
  island.add(loader.root)
  // Tray colliders so dumped rock lands inside the truck.
  loader.root.updateMatrixWorld(true)
  const trayWorld = (x: number, y: number, z: number) => loader.root.localToWorld(v(x, y, z))
  const trayCenter = trayWorld(0.17, 0.62, 0)
  {
    const s = 0.9
    const ry = loader.root.rotation.y
    physics.addStaticBox({ half: v(0.56 * s, 0.03 * s, 0.4 * s), position: trayWorld(0.17, 0.6, 0), rotationY: ry })
    physics.addStaticBox({ half: v(0.56 * s, 0.22 * s, 0.02 * s), position: trayWorld(0.17, 0.83, 0.41), rotationY: ry })
    physics.addStaticBox({ half: v(0.56 * s, 0.22 * s, 0.02 * s), position: trayWorld(0.17, 0.83, -0.41), rotationY: ry })
    physics.addStaticBox({ half: v(0.03 * s, 0.28 * s, 0.42 * s), position: trayWorld(-0.39, 0.86, 0), rotationY: ry })
    physics.addStaticBox({ half: v(0.03 * s, 0.1 * s, 0.42 * s), position: trayWorld(0.75, 0.68, 0), rotationY: ry })
  }
  const trayMin = trayCenter.clone().add(v(-0.9, -0.4, -0.9))
  const trayMax = trayCenter.clone().add(v(0.9, 0.9, 0.9))
  const excToTruck = Math.atan2(-(trayCenter.z - EXC.z), trayCenter.x - EXC.x) - exc.root.rotation.y
  const excToFace = excToTruck + Math.PI * 0.85

  // -- Haul trucks: pit floor → ramp → crusher, and back -------------------
  // Two routes share the ramp: ore to the crusher, waste to the dump.
  const routeFrom = (via: [number, number][]) => {
    const pts = roadPts.slice().reverse() // floor → rim
    const rim = pts[pts.length - 1]
    const lead = v(rim.x + (via[0][0] - rim.x) * 0.4, 0, rim.z + (via[0][1] - rim.z) * 0.4)
    const extra = [lead, ...via.map(([x, z]) => v(x, 0, z))].map((p) => ground(p.x, p.z).add(v(0, 0.04, 0)))
    const curve = new THREE.CatmullRomCurve3([...pts, ...extra])
    return { curve, len: curve.getLength() }
  }
  const oreRoute = routeFrom([[4.5, 5.4], [7.2, 5.1], [TIP_POINT.x, TIP_POINT.z]])
  const wasteRoute = routeFrom([[-1.5, 8.6], [-8, 9.6], [WASTE.x + WASTE.rx - 0.6, WASTE.z + 1.2]])
  const trucks = Array.from({ length: 6 }, (_, i) => {
    const t = kit.haulTruck()
    t.root.scale.setScalar(0.85)
    island.add(t.root)
    const route = i < 4 ? oreRoute : wasteRoute
    return {
      ...t,
      id: `DT-${101 + i}`,
      route: route.curve,
      len: route.len,
      waste: i >= 4,
      u: i < 4 ? (i + 0.3) / 4.4 : (i - 4 + 0.4) / 2.4, // position along the route (0 = floor)
      dir: i % 2 === 0 ? 1 : -1, // 1 = loaded uphill
      wait: 0,
      speed: 0,
      state: "Hauling",
      dustTimer: 0,
      tip: 0,
    }
  })

  // -- Drill bench: rig, blast pattern, timed blasts ----------------------
  const DRILL_THETA = -1.75
  const DRILL_IN = 1.45 * BW
  const benchPoint = (theta: number, inward: number) => {
    const q = benchXZ(theta, inward)
    return ground(q.x, q.z)
  }
  const pitOut = (theta: number) => v(Math.cos(theta) * PIT.ax, 0, Math.sin(theta) * PIT.az).normalize()
  const DRILL = benchPoint(DRILL_THETA, DRILL_IN)
  const rig = kit.drillRig()
  rig.root.position.copy(benchPoint(DRILL_THETA + 0.3, DRILL_IN))
  rig.root.rotation.y = -DRILL_THETA + Math.PI / 2
  rig.root.scale.setScalar(0.9)
  island.add(rig.root)
  const holeMat = track(new THREE.MeshStandardMaterial({ color: 0x1f5fd6, emissive: 0x2f7bff, emissiveIntensity: 0 }))
  const holePositions: THREE.Vector3[] = []
  {
    const holeGeo = track(new THREE.CylinderGeometry(0.045, 0.045, 0.1, 8))
    const holes = new THREE.InstancedMesh(holeGeo, holeMat, 36)
    const m4 = new THREE.Matrix4()
    let n = 0
    for (let row = 0; row < 3; row++) {
      for (let col = 0; col < 12; col++) {
        const p = benchPoint(DRILL_THETA - 0.32 + col * 0.05 + (row % 2) * 0.025, 1.22 * BW + row * 0.035)
        holePositions.push(p)
        m4.makeTranslation(p.x, p.y + 0.05, p.z)
        holes.setMatrixAt(n++, m4)
      }
    }
    island.add(holes)
    disposables.push(holes)
  }
  let blastClock = 6
  let blastArmed = false

  // -- Crusher, conveyor, stockpile, processing plant ----------------------
  const CR = ground(CRUSHER.x, CRUSHER.z)
  {
    const g = new THREE.Group()
    g.position.copy(CR)
    add(g, geo.box, mat.steel, 0, 0.6, 0, 1.3, 1.2, 1.2)
    add(g, geo.box, mat.yellowDark, 0, 1.3, 0.55, 1.5, 0.25, 0.9) // tipping hopper rim
    add(g, geo.box, mat.darkSteel, 0, 1.0, 0.8, 1.2, 0.5, 0.6)
    add(g, geo.box, mat.yellow, 0.8, 0.9, -0.2, 0.12, 1.8, 0.12) // stair tower
    add(g, geo.box, mat.white, -0.4, 1.45, -0.3, 0.5, 0.35, 0.4) // control room
    add(g, geo.box, mat.glass, -0.4, 1.47, -0.095, 0.4, 0.18, 0.01)
    island.add(g)
  }
  const SP = ground(STOCKPILE.x, STOCKPILE.z)
  {
    const pile = new THREE.Mesh(track(new THREE.ConeGeometry(2.1, 1.7, 22, 3)), track(new THREE.MeshStandardMaterial({ color: 0x77736c, roughness: 1, flatShading: true, map: grain })))
    pile.position.copy(SP).add(v(0, 0.85, 0))
    pile.castShadow = true
    pile.receiveShadow = true
    island.add(pile)
    // Physics stand-in for the cone: a sphere buried so its cap matches.
    physics.addStaticSphere(2.6, SP.clone().add(v(0, -0.95, 0)))
  }
  // Conveyor from crusher to above the stockpile, with rollers and legs.
  const beltA = CR.clone().add(v(0.4, 0.9, -0.5))
  const beltB = SP.clone().add(v(0, 2.5, 0))
  {
    const dir = beltB.clone().sub(beltA)
    const len = dir.length()
    const belt = new THREE.Group()
    belt.position.copy(beltA).lerp(beltB, 0.5)
    belt.lookAt(beltB)
    island.add(belt)
    add(belt, geo.box, mat.darkSteel, 0, 0, 0, 0.42, 0.08, len)
    add(belt, geo.box, mat.black, 0, 0.05, 0, 0.32, 0.02, len)
    add(belt, geo.box, mat.steel, 0.2, 0.12, 0, 0.02, 0.06, len) // handrail
    for (let k = 1; k < 6; k++) {
      const at = beltA.clone().lerp(beltB, k / 6)
      const gy = topHeight(at.x, at.z)
      const leg = add(island, geo.box, mat.steel, at.x, (at.y + gy) / 2, at.z, 0.08, at.y - gy, 0.08)
      leg.castShadow = true
    }
  }
  // Ore pieces riding the belt (kinematic), dropping onto the pile (physics).
  const beltOre = new THREE.InstancedMesh(track(new THREE.DodecahedronGeometry(0.07, 0)), mat.ore, 12)
  beltOre.castShadow = true
  island.add(beltOre)
  disposables.push(beltOre)
  let beltClock = 0

  {
    const P = ground(PLANT.x, PLANT.z)
    const plant = new THREE.Group()
    plant.position.copy(P)
    // Mill building: blue cladding, steel frame, roof monitor, windows.
    add(plant, geo.box, mat.blue, 1.2, 1.6, -0.6, 2.4, 3.2, 2.2)
    add(plant, geo.box, mat.steel, 1.2, 3.25, -0.6, 2.6, 0.12, 2.4)
    add(plant, geo.box, mat.blue, 1.2, 3.55, -0.6, 0.9, 0.5, 2.2)
    for (let k = 0; k < 3; k++) add(plant, geo.box, mat.glass, 0.55 + k * 0.65, 2.4, 0.51, 0.4, 0.5, 0.01)
    for (const x of [0, 2.4]) add(plant, geo.box, mat.steel, x, 1.7, 0.55, 0.08, 3.4, 0.08)
    // Stack and silos.
    add(plant, geo.cyl, mat.steel, 0.1, 2.8, -1.6, 0.3, 5.6, 0.3)
    add(plant, geo.cyl, mat.steel, -1.4, 1.7, -1.6, 0.75, 3.4, 0.75)
    add(plant, geo.cyl, mat.darkSteel, -1.4, 3.45, -1.6, 0.78, 0.1, 0.78)
    add(plant, geo.cyl, mat.steel, -2.3, 1.0, 0.6, 0.85, 2.0, 0.85)
    add(plant, geo.cyl, mat.blue, 3.2, 1.1, 1.4, 0.9, 2.2, 0.9)
    // Thickener with a rotating rake bridge.
    add(plant, geo.cyl, mat.white, 3.4, 0.25, -2.4, 1.6, 0.5, 1.6)
    const water = add(plant, geo.cyl, track(new THREE.MeshStandardMaterial({ color: 0x4aa9d6, roughness: 0.1, metalness: 0.2 })), 3.4, 0.46, -2.4, 1.5, 0.05, 1.5)
    water.receiveShadow = true
    const rake = add(plant, geo.box, mat.yellow, 3.4, 0.62, -2.4, 3.1, 0.08, 0.12)
    rake.name = "rake"
    // Pipes between tanks.
    const pipe = add(plant, geo.cyl, mat.steel, 0.6, 0.8, 0.9, 0.07, 3.2, 0.07)
    pipe.rotation.z = Math.PI / 2
    island.add(plant)
  }

  // -- Site office (MineBook sign), light vehicles, gate & weighbridge -----
  const OF = ground(OFFICE.x, OFFICE.z)
  {
    const office = new THREE.Group()
    office.position.copy(OF)
    office.rotation.y = 0.35
    add(office, geo.box, mat.white, 0, 0.5, 0, 2.4, 1.0, 1.2)
    add(office, geo.box, mat.blue, 0, 1.05, 0, 2.5, 0.1, 1.3)
    for (let k = 0; k < 4; k++) add(office, geo.box, mat.glass, -0.85 + k * 0.57, 0.55, 0.605, 0.38, 0.35, 0.01)
    add(office, geo.box, mat.darkSteel, 1.0, 0.4, 0.605, 0.3, 0.75, 0.01) // door
    add(office, geo.box, mat.white, 2.0, 0.45, 0.5, 1.1, 0.9, 1.0)
    // MineBook sign on the roof.
    const sign = (() => {
      const c = document.createElement("canvas")
      c.width = 512
      c.height = 128
      const g = c.getContext("2d")!
      g.fillStyle = "#0b5fe0"
      g.fillRect(0, 0, 512, 128)
      g.fillStyle = "#ffffff"
      g.font = "700 70px Inter, system-ui, sans-serif"
      g.textAlign = "center"
      g.textBaseline = "middle"
      g.fillText("MineBook", 256, 68)
      const tex = track(new THREE.CanvasTexture(c))
      tex.colorSpace = THREE.SRGBColorSpace
      return tex
    })()
    const board = new THREE.Mesh(track(new THREE.PlaneGeometry(1.4, 0.35)), track(new THREE.MeshStandardMaterial({ map: sign, roughness: 0.4 })))
    board.position.set(0, 1.35, 0.3)
    office.add(board)
    add(office, geo.box, mat.darkSteel, -0.5, 1.2, 0.29, 0.04, 0.3, 0.04)
    add(office, geo.box, mat.darkSteel, 0.5, 1.2, 0.29, 0.04, 0.3, 0.04)
    island.add(office)
    // Light vehicles (white utes) parked in a row.
    for (let k = 0; k < 3; k++) {
      const ute = new THREE.Group()
      ute.position.copy(ground(OFFICE.x - 1.6 + k * 0.75, OFFICE.z + 1.7))
      ute.rotation.y = 0.35 + Math.PI / 2
      add(ute, geo.box, mat.white, 0, 0.17, 0, 0.6, 0.16, 0.3)
      add(ute, geo.box, mat.white, -0.08, 0.31, 0, 0.3, 0.14, 0.28)
      add(ute, geo.box, mat.glass, -0.08, 0.32, 0, 0.31, 0.09, 0.285)
      add(ute, geo.box, mat.light, -0.3, 0.32, 0, 0.02, 0.3, 0.05) // light bar
      for (const [x, z] of [[-0.2, 0.15], [0.2, 0.15], [-0.2, -0.15], [0.2, -0.15]]) add(ute, geo.cyl, mat.tyre, x, 0.08, z, 0.08, 0.06, 0.08).rotation.x = Math.PI / 2
      island.add(ute)
    }
    const G = ground(GATE.x, GATE.z)
    const gate = new THREE.Group()
    gate.position.copy(G)
    gate.rotation.y = 0.45
    add(gate, geo.box, mat.white, -1.1, 0.35, 0, 0.5, 0.7, 0.5) // gatehouse
    add(gate, geo.box, mat.glass, -1.1, 0.42, 0.255, 0.35, 0.25, 0.01)
    add(gate, geo.box, mat.darkSteel, -0.75, 0.4, 0, 0.1, 0.8, 0.1)
    const boom = add(gate, geo.box, mat.red, 0.1, 0.75, 0, 1.6, 0.06, 0.06)
    boom.name = "boom"
    add(gate, geo.box, mat.darkSteel, 0.1, 0.02, -1, 1.8, 0.04, 1.0) // weighbridge
    island.add(gate)
  }

  // -- Workshop: maintenance shed with open bays and a truck under service --
  const WS = ground(WORKSHOP.x, WORKSHOP.z)
  {
    const g = new THREE.Group()
    g.position.copy(WS)
    g.rotation.y = -0.2
    add(g, geo.box, mat.steel, 0, 0.9, 0, 4.4, 1.8, 2.4)
    for (const side of [-1, 1]) {
      const roof = add(g, geo.box, mat.blue, 0, 2.05, side * 0.62, 4.6, 0.08, 1.4)
      roof.rotation.x = side * 0.32
    }
    for (let k = 0; k < 3; k++) add(g, geo.box, mat.black, -1.4 + k * 1.4, 0.75, 1.205, 1.05, 1.4, 0.02) // open bays
    add(g, geo.box, mat.white, 2.7, 0.5, 0.3, 1.0, 1.0, 1.4) // workshop office
    add(g, geo.box, mat.glass, 2.7, 0.6, 1.005, 0.6, 0.3, 0.01)
    island.add(g)
    const serviced = kit.haulTruck()
    serviced.root.position.copy(WS).add(v(-0.4, 0, 1.9))
    serviced.root.rotation.y = -0.2 + Math.PI / 2
    serviced.root.scale.setScalar(0.85)
    serviced.load.visible = false
    serviced.tray.rotation.z = -0.5 // tray raised for maintenance
    island.add(serviced.root)
  }

  // -- Fuel farm: horizontal tanks on saddles inside a concrete bund --------
  const FU = ground(FUEL.x, FUEL.z)
  {
    const g = new THREE.Group()
    g.position.copy(FU)
    g.rotation.y = 0.3
    add(g, geo.box, mat.white, 0, 0.12, 0, 2.6, 0.24, 1.8)
    add(g, geo.box, mat.steel, 0, 0.05, 0, 2.4, 0.04, 1.6)
    for (let k = 0; k < 3; k++) {
      const tank = add(g, geo.cyl, mat.white, 0, 0.5, -0.55 + k * 0.55, 0.22, 1.9, 0.22)
      tank.rotation.z = Math.PI / 2
      for (const x of [-0.6, 0.6]) add(g, geo.box, mat.darkSteel, x, 0.3, -0.55 + k * 0.55, 0.08, 0.2, 0.36)
    }
    add(g, geo.box, mat.blue, 1.9, 1.0, 0, 1.1, 0.06, 1.0) // bowser canopy
    for (const [x, z] of [[1.45, -0.4], [2.35, -0.4], [1.45, 0.4], [2.35, 0.4]]) add(g, geo.box, mat.steel, x, 0.5, z, 0.05, 1.0, 0.05)
    add(g, geo.box, mat.red, 1.9, 0.3, 0, 0.18, 0.6, 0.18) // dispenser
    island.add(g)
  }

  // -- Explosives magazine: bunded bunker, fence and red flag --------------
  const MG = ground(MAGAZINE.x, MAGAZINE.z)
  {
    const g = new THREE.Group()
    g.position.copy(MG)
    const mound = add(g, track(new THREE.SphereGeometry(1, 20, 10, 0, Math.PI * 2, 0, Math.PI / 2)), track(new THREE.MeshStandardMaterial({ color: 0x7b6a4f, roughness: 1, map: grain })), 0, 0, 0, 1.3, 0.55, 1.3)
    mound.receiveShadow = true
    add(g, geo.box, mat.white, 0, 0.3, 0.75, 0.7, 0.6, 0.5)
    add(g, geo.box, mat.darkSteel, 0, 0.25, 1.005, 0.3, 0.45, 0.01)
    for (let k = 0; k < 16; k++) {
      const a = (k / 16) * Math.PI * 2
      add(g, geo.box, mat.steel, Math.cos(a) * 1.6, 0.3, Math.sin(a) * 1.6, 0.04, 0.6, 0.04)
    }
    add(g, geo.box, mat.steel, 1.1, 0.8, -1.1, 0.03, 1.6, 0.03)
    add(g, geo.box, mat.red, 1.25, 1.45, -1.1, 0.3, 0.18, 0.01)
    island.add(g)
  }

  // -- Lighting towers on the benches for night shift ----------------------
  for (const [theta, inward] of [[2.2, 2.2 * BW], [-0.4, 3.2 * BW], [-2.6, 1.2 * BW], [0.9, 4.3 * BW]]) {
    const at = benchPoint(theta, inward)
    const g = new THREE.Group()
    g.position.copy(at)
    add(g, geo.box, mat.yellow, 0, 0.18, 0, 0.6, 0.3, 0.35) // trailer & generator
    add(g, geo.cyl8, mat.steel, 0, 1.1, 0, 0.035, 1.9, 0.035)
    add(g, geo.box, mat.darkSteel, 0, 2.05, 0, 0.6, 0.1, 0.1)
    for (let k = 0; k < 4; k++) add(g, geo.box, mat.light, -0.22 + k * 0.15, 2.0, 0.06, 0.12, 0.1, 0.03)
    g.lookAt(PIT.x, at.y, PIT.z)
    island.add(g)
  }

  // -- Power line: plant → office → pit rim, with sagging conductors -------
  {
    const route = [
      [PLANT.x - 2.5, PLANT.z + 4.2],
      [PLANT.x - 6, PLANT.z + 6.6],
      [OFFICE.x + 2.4, OFFICE.z - 2.6],
      [OFFICE.x - 3.2, OFFICE.z - 2.8],
      [-2.5, 8.1],
    ].map(([x, z]) => ground(x, z))
    const tops: THREE.Vector3[] = []
    for (const p of route) {
      add(island, geo.cyl8, mat.darkSteel, p.x, p.y + 0.9, p.z, 0.04, 1.8, 0.04)
      add(island, geo.box, mat.darkSteel, p.x, p.y + 1.7, p.z, 0.04, 0.04, 0.6)
      tops.push(p.clone().add(v(0, 1.68, 0)))
    }
    const wireMat = track(new THREE.LineBasicMaterial({ color: 0x2a2d33 }))
    for (const off of [-0.27, 0.27]) {
      for (let i = 0; i < tops.length - 1; i++) {
        const a = tops[i].clone().add(v(0, 0, off))
        const b = tops[i + 1].clone().add(v(0, 0, off))
        const pts: THREE.Vector3[] = []
        for (let k = 0; k <= 16; k++) {
          const f = k / 16
          pts.push(a.clone().lerp(b, f).add(v(0, -Math.sin(f * Math.PI) * 0.35, 0)))
        }
        island.add(new THREE.Line(track(new THREE.BufferGeometry().setFromPoints(pts)), wireMat))
      }
    }
  }

  // -- Tailings: pond, decant tower, pipeline from the plant ---------------
  {
    const pond = new THREE.Mesh(track(new THREE.CircleGeometry(1, 48)), track(new THREE.MeshStandardMaterial({ color: 0x6f9aa3, roughness: 0.12, metalness: 0.25 })))
    pond.rotation.x = -Math.PI / 2
    pond.scale.set(TSF.rx * 0.78, TSF.rz * 0.72, 1)
    pond.position.set(TSF.x + 0.3, 0.47, TSF.z - 0.2)
    pond.receiveShadow = true
    island.add(pond)
    add(island, geo.cyl, mat.steel, TSF.x - 0.6, 0.8, TSF.z, 0.18, 0.8, 0.18) // decant tower
    const pipe = [ground(PLANT.x + 2.5, PLANT.z - 3.2), ground(PLANT.x + 2.8, PLANT.z - 5.5), ground(TSF.x - 1, TSF.z + 2.6), v(TSF.x - 1.2, 1.0, TSF.z + 1.6)]
    const curve = new THREE.CatmullRomCurve3(pipe.map((p) => p.clone().add(v(0, 0.12, 0))))
    const tube = new THREE.Mesh(track(new THREE.TubeGeometry(curve, 60, 0.06, 8, false)), mat.darkSteel)
    tube.castShadow = true
    island.add(tube)
  }

  // -- Comms tower: the mine's network link to MineBook --------------------
  const COMMS = ground(OFFICE.x + 3.2, OFFICE.z + 1.4)
  {
    const g = new THREE.Group()
    g.position.copy(COMMS)
    for (const [x, z] of [[-0.15, -0.15], [0.15, -0.15], [0, 0.17]]) add(g, geo.box, mat.white, x, 2, z, 0.04, 4, 0.04)
    for (let k = 0; k < 10; k++) add(g, geo.box, mat.red, 0, 0.3 + k * 0.4, 0, 0.36, 0.03, 0.36).rotation.y = k * 0.6
    const dish = add(g, track(new THREE.SphereGeometry(1, 16, 8, 0, Math.PI * 2, 0, Math.PI / 3)), mat.white, 0.2, 3.4, 0, 0.35, 0.18, 0.35)
    dish.rotation.z = -Math.PI / 2
    add(g, geo.sphere, mat.red, 0, 4.05, 0, 0.06, 0.06, 0.06)
    island.add(g)
  }

  // -- Support fleet: water truck, grader on the ramp, dozer on the dump ---
  const waterTruck = (() => {
    const t = kit.haulTruck()
    t.tray.visible = false
    const tank = add(t.body, geo.cyl, mat.white, 0.2, 0.72, 0, 0.36, 1.1, 0.36)
    tank.rotation.z = Math.PI / 2
    add(t.body, geo.box, mat.blue, 0.2, 0.72, 0.37, 1.0, 0.08, 0.01)
    t.root.scale.setScalar(0.75)
    island.add(t.root)
    return t
  })()
  const waterLoop = new THREE.CatmullRomCurve3(
    [[1.6, 4.6], [4.5, 5.4], [9.5, 4.9], [PLANT.x - 1.5, PLANT.z + 2.8], [9.5, 4.9], [4.5, 5.4], [-1.5, 8.6], [-8, 9.6], [-1.5, 8.6]].map(([x, z]) =>
      ground(x, z).add(v(0, 0.04, 0)),
    ),
    true,
  )
  const waterLen = waterLoop.getLength()

  const grader = (() => {
    const g = new THREE.Group()
    add(g, geo.box, mat.yellow, 0, 0.3, 0, 1.3, 0.12, 0.22) // long frame
    add(g, geo.box, mat.yellow, 0.45, 0.45, 0, 0.4, 0.3, 0.45) // engine
    add(g, geo.box, mat.yellow, 0.15, 0.62, 0, 0.3, 0.35, 0.4) // cab
    add(g, geo.box, mat.glass, 0.0, 0.66, 0, 0.01, 0.22, 0.34)
    const blade = add(g, geo.box, mat.darkSteel, -0.1, 0.15, 0, 0.08, 0.14, 0.8)
    blade.rotation.y = 0.5
    for (const [x, z] of [[-0.6, 0.2], [-0.6, -0.2], [0.4, 0.24], [0.4, -0.24], [0.62, 0.24], [0.62, -0.24]]) add(g, geo.cyl, mat.tyre, x, 0.14, z, 0.14, 0.1, 0.14).rotation.x = Math.PI / 2
    g.scale.setScalar(0.9)
    island.add(g)
    return g
  })()

  const dozer = (() => {
    const g = new THREE.Group()
    for (const z of [-0.3, 0.3]) add(g, geo.box, mat.black, 0, 0.14, z, 0.9, 0.26, 0.2)
    add(g, geo.box, mat.yellow, 0.05, 0.4, 0, 0.75, 0.3, 0.55)
    add(g, geo.box, mat.yellow, -0.15, 0.68, 0, 0.32, 0.3, 0.45)
    add(g, geo.box, mat.glass, -0.15, 0.7, 0.23, 0.26, 0.2, 0.01)
    add(g, geo.box, mat.yellowDark, 0.6, 0.25, 0, 0.08, 0.38, 0.9) // blade
    add(g, geo.box, mat.darkSteel, -0.5, 0.15, 0, 0.12, 0.3, 0.06) // ripper
    island.add(g)
    return g
  })()

  // -- Floating rocks ---------------------------------------------------------
  const floaters: { mesh: THREE.Mesh; base: THREE.Vector3; phase: number }[] = []
  {
    const fg = track(new THREE.DodecahedronGeometry(0.6, 0))
    const fm = track(new THREE.MeshStandardMaterial({ color: 0x5d5e62, roughness: 1, flatShading: true }))
    for (let i = 0; i < 9; i++) {
      const a = (i / 9) * Math.PI * 2 + 0.3
      const mesh = new THREE.Mesh(fg, fm)
      const base = v(Math.cos(a) * (17 + (i % 3) * 4), -8 - (i % 4) * 2.8, Math.sin(a) * (11 + (i % 2) * 4))
      const s = 0.5 + hash(i, 1) * 1.3
      mesh.scale.set(s, s * 0.8, s)
      mesh.position.copy(base)
      scene.add(mesh)
      floaters.push({ mesh, base, phase: i * 0.7 })
    }
  }

  // -- Dust: soft sprites behind trucks and from blasts --------------------
  const dustPool = Array.from({ length: 70 }, () => {
    const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: softTex, color: 0xb9ab95, transparent: true, opacity: 0, depthWrite: false }))
    s.visible = false
    island.add(s)
    return { s, age: 0, life: 1, grow: 1, vel: v(0, 0, 0) }
  })
  let dustNext = 0
  const puff = (at: THREE.Vector3, size: number, life: number, vel = v(0, 0.25, 0)) => {
    const d = dustPool[dustNext++ % dustPool.length]
    d.s.position.copy(at)
    d.s.material.color.set(0xb9ab95)
    d.s.visible = true
    d.age = 0
    d.life = life
    d.grow = size
    d.vel.copy(vel)
    return d
  }

  // -- MineBook: the whole mine as one connected system --------------------
  const HUB = v(-1, 12, 1)
  const net = new THREE.Group()
  scene.add(net)
  const netMat = track(new THREE.LineBasicMaterial({ color: 0x2f7bff, transparent: true, opacity: 0, depthWrite: false }))
  const pulseMat = track(new THREE.SpriteMaterial({ map: softTex, color: 0x6aa5ff, transparent: true, opacity: 0, depthWrite: false, fog: false }))
  const hubCore = new THREE.Mesh(track(new THREE.IcosahedronGeometry(0.55, 2)), track(new THREE.MeshStandardMaterial({ color: 0x0b5fe0, emissive: 0x2f7bff, emissiveIntensity: 0.9, transparent: true, opacity: 0 })))
  hubCore.position.copy(HUB)
  net.add(hubCore)
  const hubRing = new THREE.Mesh(track(new THREE.TorusGeometry(1.05, 0.04, 8, 64)), track(new THREE.MeshBasicMaterial({ color: 0x6aa5ff, transparent: true, opacity: 0 })))
  hubRing.position.copy(HUB)
  hubRing.rotation.x = Math.PI / 2
  net.add(hubRing)
  const hubGlow = new THREE.Sprite(track(new THREE.SpriteMaterial({ map: softTex, color: 0x2f7bff, transparent: true, opacity: 0, depthWrite: false, fog: false })))
  hubGlow.scale.setScalar(4)
  hubGlow.position.copy(HUB)
  net.add(hubGlow)

  // Connected assets: id → live world position.
  const assets: { id: string; at: () => THREE.Vector3 }[] = [
    { id: "drill", at: () => rig.root.position.clone().add(v(0, 2.6, 0)) },
    { id: "excavator", at: () => EXC.clone().add(v(0, 1.6, 0)) },
    { id: "loader", at: () => LOAD_AT.clone().add(v(0, 1.0, 0)) },
    ...trucks.map((t, i) => ({ id: `truck${i}`, at: () => t.root.position.clone().add(v(0, 0.9, 0)) })),
    { id: "crusher", at: () => CR.clone().add(v(0, 1.9, 0)) },
    { id: "stockpile", at: () => SP.clone().add(v(0, 1.9, 0)) },
    { id: "plant", at: () => ground(PLANT.x, PLANT.z).add(v(1.2, 4.0, -0.6)) },
    { id: "office", at: () => OF.clone().add(v(0, 1.7, 0)) },
    { id: "workshop", at: () => WS.clone().add(v(0, 2.4, 0)) },
    { id: "fuel", at: () => FU.clone().add(v(0, 1.3, 0)) },
    { id: "tsf", at: () => v(TSF.x, 1.4, TSF.z) },
    { id: "dozer", at: () => dozer.position.clone().add(v(0, 1.0, 0)) },
    { id: "water", at: () => waterTruck.root.position.clone().add(v(0, 0.9, 0)) },
    { id: "comms", at: () => COMMS.clone().add(v(0, 4.2, 0)) },
    { id: "magazine", at: () => MG.clone().add(v(0, 1.2, 0)) },
    { id: "gate", at: () => ground(GATE.x, GATE.z).add(v(0, 1.0, 0)) },
  ]
  const SAMPLES = 28
  const links = assets.map(() => {
    const g = track(new THREE.BufferGeometry())
    g.setAttribute("position", new THREE.Float32BufferAttribute(new Float32Array((SAMPLES + 1) * 3), 3))
    const line = new THREE.Line(g, netMat)
    line.frustumCulled = false
    net.add(line)
    const pulses = [0, 1].map(() => {
      const s = new THREE.Sprite(pulseMat)
      s.scale.setScalar(0.45)
      net.add(s)
      return s
    })
    return { line, pulses, curve: new THREE.QuadraticBezierCurve3(v(0, 0, 0), v(0, 0, 0), HUB) }
  })

  // -- The guide: Anjana, with a physics-driven walk -----------------------
  const anjana = createCharacter()
  island.add(anjana.root)
  anjana.root.traverse((o) => ((o as THREE.Mesh).castShadow = true))

  // -- Tour stops: where Anjana stands, how the camera frames it -----------
  const WALLS_THETA = -0.55
  const stops: Record<StageId, { spot: THREE.Vector3; cam: (s: THREE.Vector3) => { pos: THREE.Vector3; look: THREE.Vector3 } }> = {
    welcome: { spot: ground(2.5, 7.8), cam: () => ({ pos: v(-28, 31, 50), look: v(1, -4, 0) }) },
    office: {
      spot: ground(OFFICE.x - 1.2, OFFICE.z + 1.0),
      cam: (s) => ({ pos: s.clone().add(v(-8, 6.5, 11)), look: s.clone().add(v(1.8, 0.9, -1.8)) }),
    },
    // MineBook: pull right out so the whole connected mine is in view.
    control: { spot: ground(OFFICE.x - 0.4, OFFICE.z - 1.6), cam: () => ({ pos: v(-16, 47, 53), look: v(-1, 8.5, -1) }) },
    drill: {
      spot: benchPoint(DRILL_THETA - 0.06, 1.55 * BW),
      cam: (s) => ({ pos: s.clone().addScaledVector(pitOut(DRILL_THETA), -11).add(v(0, 7, 0)), look: s.clone().add(v(0, 0.6, 0)) }),
    },
    load: {
      spot: ground(PIT.x + 0.3, PIT.z + 1.4),
      cam: (s) => ({ pos: s.clone().add(v(2, 12.5, 7.5)), look: s.clone().add(v(-0.6, 0.2, -1.6)) }),
    },
    haul: {
      spot: (() => {
        const p = rampPoint(0.32)
        return ground(p.x, p.z)
      })(),
      cam: (s) => ({ pos: s.clone().add(v(5, 8, 12)), look: s.clone().add(v(0, 0.6, 0)) }),
    },
    walls: {
      spot: benchPoint(WALLS_THETA, 2.5 * BW),
      cam: (s) => ({ pos: s.clone().addScaledVector(pitOut(WALLS_THETA), -10).add(v(0, 5, 0)), look: s.clone().add(v(0, 1.2, 0)) }),
    },
    lookout: { spot: ground(WASTE.x + 0.4, WASTE.z), cam: (s) => ({ pos: s.clone().add(v(-7, 7, 11)), look: v(-4, -2, 0) }) },
    gate: { spot: ground(GATE.x - 0.6, GATE.z - 1.0), cam: () => ({ pos: v(42, 33, 47), look: v(1, -4, 0) }) },
  }

  // Card anchors for each stop + MineBook tags for each connected asset.
  const anchorFor: Record<string, () => THREE.Vector3> = {
    welcome: () => body.pos.clone().add(v(0, anjana.height + 0.4, 0)),
    office: () => OF.clone().add(v(0, 2.0, 0)),
    control: () => HUB.clone(),
    drill: () => DRILL.clone().add(v(0, 3, 0)),
    load: () => EXC.clone().add(v(0, 2.4, 0)),
    haul: () => trucks[0].root.position.clone().add(v(0, 1.5, 0)),
    walls: () => stops.walls.spot.clone().add(v(0, 1.8, 0)),
    lookout: () => body.pos.clone().add(v(0, anjana.height + 0.4, 0)),
    gate: () => ground(GATE.x, GATE.z).add(v(0, 1.6, 0)),
  }
  for (const a of assets) anchorFor[`mb:${a.id}`] = a.at

  // -- Interaction & sizing -------------------------------------------------
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

  // -- Anjana's body: a character controller with gravity --------------------
  const body = {
    pos: stops.welcome.spot.clone(),
    vel: v(0, 0, 0),
    vy: 0,
    heading: 0.4,
    turn: 0,
    accel: 0,
    air: 0,
  }
  const WALK = 1.9
  const RUN = 5.2
  const ACCEL = 7
  const GRAVITY = 14
  const CLIMB = 2.4

  const stepBody = (dt: number, target: THREE.Vector3) => {
    const to = v(target.x - body.pos.x, 0, target.z - body.pos.z)
    const dist = to.length()
    // Teleport only on a huge jump (e.g. opening the page mid-tour).
    if (dist > 60) {
      body.pos.copy(target)
      body.vel.set(0, 0, 0)
      return
    }
    // Arrive: run when far, walk when near, ease to a stop.
    const top = dist > 7 ? RUN : WALK
    const want = to.normalize().multiplyScalar(Math.min(top, dist * 1.6))
    if (dist < 0.06) want.set(0, 0, 0)
    const dv = want.sub(body.vel)
    const maxDv = ACCEL * dt
    if (dv.length() > maxDv) dv.setLength(maxDv)
    const before = body.vel.length()
    body.vel.add(dv)
    body.accel = (body.vel.length() - before) / Math.max(dt, 1e-3)
    body.pos.x += body.vel.x * dt
    body.pos.z += body.vel.z * dt

    // Vertical: fall with gravity off ledges; climb up bench faces.
    const gy = topHeight(body.pos.x, body.pos.z)
    if (body.pos.y > gy + 0.01) {
      body.vy -= GRAVITY * dt
      body.pos.y += body.vy * dt
      if (body.pos.y <= gy) {
        body.pos.y = gy
        if (body.vy < -3) puff(body.pos.clone().add(v(0, 0.1, 0)), 0.8, 0.9)
        body.vy = 0
      }
    } else if (body.pos.y < gy) {
      body.pos.y = Math.min(gy, body.pos.y + CLIMB * dt)
      body.vy = 0
    }
    body.air = THREE.MathUtils.clamp((body.pos.y - gy) / 0.6 + (gy - body.pos.y > 0.05 ? 0.6 : 0), 0, 1)

    // Turn toward travel direction with a limited turn rate.
    const speed = Math.hypot(body.vel.x, body.vel.z)
    if (speed > 0.15) {
      const want = Math.atan2(body.vel.x, body.vel.z)
      const diff = ((want - body.heading + Math.PI * 3) % (Math.PI * 2)) - Math.PI
      const step = THREE.MathUtils.clamp(diff, -6 * dt, 6 * dt)
      body.heading += step
      body.turn = step / Math.max(dt, 1e-3)
    } else {
      // Standing: turn to face the camera.
      const face = Math.atan2(camPos.x - body.pos.x, camPos.z - body.pos.z)
      const diff = ((face - body.heading + Math.PI * 3) % (Math.PI * 2)) - Math.PI
      body.heading += diff * Math.min(1, dt * 3)
      body.turn = 0
    }
  }

  // -- Loop ------------------------------------------------------------------
  const journey: { from: StageId; to: StageId; t: number } = { from: "welcome", to: "welcome", t: 0 }
  const camPos = v(-28, 31, 50)
  const camLook = v(1, -4, 0)
  const projected = new THREE.Vector3()
  const tangent = new THREE.Vector3()
  const m4 = new THREE.Matrix4()
  let frame = 0
  let running = !options.still
  let snap = true
  let time = 0

  const weight = (id: StageId) => (journey.from === id ? 1 - journey.t : 0) + (journey.to === id ? journey.t : 0)

  // Excavator cycle: dig → swing to truck → dump (physics) → swing back.
  const EXC_CYCLE = 7
  let excClock = 0
  let excDumped = false
  let passes = 0

  const update = (t: number, dt: number) => {
    time = t
    pointer.x += (pointer.tx - pointer.x) * 0.04
    pointer.y += (pointer.ty - pointer.y) * 0.04

    // Haul trucks: accelerate/brake, wait at ends, tip at the crusher.
    mineState.trucks = trucks.map((tr) => {
      if (tr.wait > 0) {
        tr.wait -= dt
        tr.speed = 0
        if (tr.dir === 1 && tr.u > 0.99) tr.tip = Math.min(1, tr.tip + dt * 0.8) // raise tray
        if (tr.wait <= 0) {
          if (tr.u > 0.99) {
            tr.dir = -1
            tr.load.visible = false
            mineState.loadsToday += 1
          } else {
            tr.dir = 1
            tr.load.visible = true
          }
        }
      } else {
        tr.tip = Math.max(0, tr.tip - dt * 0.8)
        const target = tr.dir === 1 ? (1.6 + 0.4) / 2 : 2.2 // units/s (loaded uphill slower)
        tr.speed += (target - tr.speed) * Math.min(1, dt * 0.8)
        tr.u += (tr.dir * tr.speed * dt) / tr.len
        if (tr.u >= 1) {
          tr.u = 1
          tr.wait = 2.6
          if (tr.load.visible) puff(tr.route.getPointAt(1).add(v(0, 0.8, 0)), 1.6, 1.8)
        } else if (tr.u <= 0) {
          tr.u = 0
          tr.wait = 2
        }
      }
      // Two-lane road: keep left of the centreline.
      const p = tr.route.getPointAt(THREE.MathUtils.clamp(tr.u, 0, 1))
      tr.route.getTangentAt(THREE.MathUtils.clamp(tr.u, 0, 1), tangent)
      const fwd = tangent.clone().multiplyScalar(tr.dir)
      const side = v(fwd.z, 0, -fwd.x).normalize().multiplyScalar(0.22)
      tr.root.position.copy(p).add(side)
      tr.root.position.y = topHeight(tr.root.position.x, tr.root.position.z) + 0.02
      const yaw = Math.atan2(-fwd.z, fwd.x) + Math.PI
      tr.root.rotation.y = yaw
      tr.root.rotation.z = Math.asin(THREE.MathUtils.clamp(fwd.y, -1, 1)) * -1 // pitch on grades
      tr.tray.rotation.z = -tr.tip * 0.75
      tr.body.rotation.x = Math.sin(t * 6 + tr.u * 40) * 0.01 * Math.min(1, tr.speed) // suspension
      for (const w of tr.wheels) w.rotation.z += (tr.speed * dt) / 0.22
      // Dust behind moving trucks.
      tr.dustTimer -= dt
      if (tr.speed > 0.6 && tr.dustTimer <= 0) {
        tr.dustTimer = 0.18
        puff(tr.root.position.clone().addScaledVector(fwd, -0.7).add(v(0, 0.2, 0)), 0.9, 1.6, v(0, 0.3, 0))
      }
      tr.state = tr.wait > 0 ? (tr.u > 0.99 ? "Dumping" : "Queuing") : tr.dir === 1 ? "Hauling" : "Returning"
      return { id: tr.id, state: tr.waste && tr.state === "Dumping" ? "Tipping waste" : tr.state, payload: tr.load.visible ? 218 : 0 }
    })

    // Excavator dig cycle with physics rock into the loading truck.
    excClock += dt
    const ph = (excClock % EXC_CYCLE) / EXC_CYCLE
    const ease = (a: number, b: number, x: number) => smoothstep(a, b, x)
    // Swing: face (0–0.25) → truck (0.35–0.6) → face (0.7–1).
    const swing = ease(0.25, 0.38, ph) * (1 - ease(0.62, 0.78, ph))
    exc.house.rotation.y = THREE.MathUtils.lerp(excToFace, excToTruck, swing)
    const dig = ease(0, 0.12, ph) * (1 - ease(0.15, 0.27, ph))
    exc.boom.rotation.z = -0.15 - dig * 0.35 + swing * 0.25
    exc.stick.rotation.z = -0.4 + dig * 0.5 - swing * 0.15
    const dump = ease(0.48, 0.55, ph) * (1 - ease(0.62, 0.7, ph))
    exc.bucket.rotation.z = 0.4 - dig * 0.9 + dump * 1.6
    exc.scoop.visible = ph > 0.16 && ph < 0.52
    if (ph > 0.52 && !excDumped) {
      excDumped = true
      exc.bucket.updateMatrixWorld(true)
      const at = exc.bucket.localToWorld(v(0.12, -0.1, 0))
      const mid = trayCenter.clone()
      // Ballistic aim: horizontal speed that lands the rock in the tray.
      const drop = Math.max(0.2, at.y - mid.y)
      const tFall = Math.sqrt((2 * drop) / 9.82)
      for (let k = 0; k < 5; k++) {
        const jitter = v((Math.random() - 0.5) * 0.25, Math.random() * 0.15, (Math.random() - 0.5) * 0.25)
        const aim = mid.clone().add(v((Math.random() - 0.5) * 0.5, 0, (Math.random() - 0.5) * 0.4)).sub(at).setY(0).divideScalar(tFall)
        physics.spawnRock(at.clone().add(jitter), v(aim.x, 0, aim.z), 0.07 + Math.random() * 0.05, 30)
      }
      puff(at.clone().add(v(0, -0.3, 0)), 1.0, 1.2)
      passes += 1
      mineState.passes += 1
      if (passes % 4 === 0) {
        // Truck full: it "leaves" — swap physics rock for a carried load.
        loader.load.visible = true
        window.setTimeout(() => {
          physics.clearIn(trayMin, trayMax)
          loader.load.visible = false
        }, 2400)
      }
    }
    if (ph < 0.1) excDumped = false

    // Water truck sprays the haul roads; grader trims the ramp; dozer pushes waste.
    {
      const u = ((((t * 1.3) / waterLen) % 1) + 1) % 1
      const p = waterLoop.getPointAt(u)
      waterLoop.getTangentAt(u, tangent)
      waterTruck.root.position.copy(p).add(v(tangent.z, 0, -tangent.x).normalize().multiplyScalar(0.25))
      waterTruck.root.rotation.y = Math.atan2(-tangent.z, tangent.x) + Math.PI
      for (const w of waterTruck.wheels) w.rotation.z += (1.3 * dt) / 0.2
      if (Math.random() < dt * 6) {
        const back = waterTruck.root.position.clone().addScaledVector(tangent, -0.75)
        puff(back.add(v(0, 0.15, 0)), 0.7, 0.8, v(0, 0.05, 0)).s.material.color.set(0xbfd8f0) // spray mist, not dust
      }
      const gu = 0.35 + 0.25 * Math.sin(t * 0.05)
      grader.position.copy(rampCurve.getPointAt(gu))
      rampCurve.getTangentAt(gu, tangent)
      grader.rotation.y = Math.atan2(-tangent.z, tangent.x) + (Math.cos(t * 0.05) > 0 ? Math.PI : 0)
      const dz = Math.sin(t * 0.35)
      const dx = WASTE.x + dz * 1.6
      const dzz = WASTE.z + 0.4
      dozer.position.set(dx, topHeight(dx, dzz) + 0.02, dzz)
      dozer.rotation.y = Math.cos(t * 0.35) > 0 ? Math.PI : 0
      if (Math.abs(Math.cos(t * 0.35)) > 0.6 && Math.random() < dt * 4) puff(dozer.position.clone().add(v(0, 0.3, 0)), 0.8, 1.2)
    }

    // Drill: rod spins; blasts while the visitor is at the drill bench.
    rig.rod.rotation.y += dt * 12
    const atDrill = weight("drill")
    blastClock -= dt
    if (atDrill > 0.75 && blastClock < 2) blastArmed = true
    holeMat.emissiveIntensity = Math.max(atDrill * 0.6, blastArmed ? 0.6 + 0.6 * Math.sin(t * 16) : 0)
    if (blastArmed && blastClock <= 0) {
      blastArmed = false
      blastClock = 10
      mineState.blasts += 1
      for (const h of holePositions) {
        const out = v(h.x - PIT.x, 0, h.z - PIT.z).normalize().multiplyScalar(-(1.5 + Math.random() * 2))
        for (let k = 0; k < 2; k++) {
          physics.spawnRock(
            h.clone().add(v((Math.random() - 0.5) * 0.15, 0.15 + k * 0.1, (Math.random() - 0.5) * 0.15)),
            v(out.x + (Math.random() - 0.5), 3 + Math.random() * 3.5, out.z + (Math.random() - 0.5)),
            0.05 + Math.random() * 0.07,
            9,
          )
        }
        if (Math.random() < 0.5) puff(h.clone().add(v(0, 0.4, 0)), 2.2, 2.6, v(0, 0.7, 0))
      }
    }

    // Conveyor: ore rides the belt, then drops onto the stockpile under gravity.
    beltClock += dt
    const beltDir = beltB.clone().sub(beltA)
    for (let k = 0; k < 12; k++) {
      const f = (beltClock * 0.12 + k / 12) % 1
      const p = beltA.clone().addScaledVector(beltDir, f).add(v(0, 0.1, 0))
      m4.makeTranslation(p.x, p.y, p.z)
      beltOre.setMatrixAt(k, m4)
    }
    beltOre.instanceMatrix.needsUpdate = true
    if ((beltClock * 0.12 * 12) % 1 < dt * 0.12 * 12) {
      physics.spawnRock(beltB.clone().add(v(0, 0.1, 0)), beltDir.clone().normalize().multiplyScalar(0.8), 0.06 + Math.random() * 0.03, 6)
    }
    mineState.crusherTph = 1180 + Math.round(Math.sin(t * 0.3) * 90)
    mineState.stockpile += dt * 4

    // Plant thickener rake turns slowly.
    island.getObjectByName("rake")?.rotateY(dt * 0.25)

    physics.step(dt)

    // Dust puffs.
    for (const d of dustPool) {
      if (!d.s.visible) continue
      d.age += dt
      const k = d.age / d.life
      if (k >= 1) {
        d.s.visible = false
        continue
      }
      d.s.position.addScaledVector(d.vel, dt)
      d.s.scale.setScalar(0.3 + d.grow * Math.sqrt(k))
      d.s.material.opacity = 0.45 * (1 - k) * Math.min(1, k * 6)
    }

    for (const f of floaters) {
      f.mesh.position.y = f.base.y + Math.sin(t * 0.8 + f.phase) * 0.4
      f.mesh.rotation.y = t * 0.2 + f.phase
    }

    // Anjana walks to the blended tour target.
    const a = stops[journey.from]
    const b = stops[journey.to]
    const target = a.spot.clone().lerp(b.spot, journey.t)
    if (snap) {
      body.pos.copy(target)
      body.pos.y = topHeight(target.x, target.z)
    }
    stepBody(dt, target)
    anjana.root.position.copy(body.pos)
    anjana.root.rotation.y = body.heading
    anjana.update(dt, {
      speed: Math.hypot(body.vel.x, body.vel.z),
      turn: body.turn,
      accel: body.accel,
      time: t,
      lookAt: camPos,
      air: body.air,
    })

    // Camera: blend the two stop framings, then ease toward them.
    const ca = a.cam(a.spot)
    const cb = b.cam(b.spot)
    const pos = ca.pos.lerp(cb.pos, journey.t)
    const look = ca.look.lerp(cb.look, journey.t)
    if (portrait) pos.sub(look).multiplyScalar(1.5).add(look)
    pos.add(v(pointer.x * 0.9, -pointer.y * 0.6, 0))
    pos.y += Math.sin(t * 0.5) * 0.2
    const k = snap ? 1 : 1 - Math.pow(0.001, dt)
    snap = false
    camPos.lerp(pos, k)
    camLook.lerp(look, k)
    camera.position.copy(camPos)
    camera.lookAt(camLook)
    const dist = camPos.distanceTo(camLook)
    fog.near = dist * 1.3
    fog.far = dist * 3.2

    // MineBook network: visible at the MineBook stop.
    const mb = weight("control")
    netMat.opacity = 0.75 * mb
    pulseMat.opacity = mb
    ;(hubCore.material as THREE.MeshStandardMaterial).opacity = mb
    ;(hubRing.material as THREE.MeshBasicMaterial).opacity = 0.8 * mb
    hubGlow.material.opacity = 0.6 * mb
    net.visible = mb > 0.01
    if (net.visible) {
      hubRing.rotation.z = t * 0.6
      hubCore.rotation.y = t * 0.4
      hubCore.position.y = HUB.y + Math.sin(t * 1.2) * 0.15
      assets.forEach((asset, i) => {
        const L = links[i]
        const from = asset.at()
        const mid = from.clone().lerp(HUB, 0.5).add(v(0, 2.5, 0))
        L.curve.v0.copy(from)
        L.curve.v1.copy(mid)
        L.curve.v2.copy(hubCore.position)
        const arr = (L.line.geometry.attributes.position as THREE.BufferAttribute).array as Float32Array
        for (let s = 0; s <= SAMPLES; s++) {
          const p = L.curve.getPoint(s / SAMPLES)
          arr[s * 3] = p.x
          arr[s * 3 + 1] = p.y
          arr[s * 3 + 2] = p.z
        }
        L.line.geometry.attributes.position.needsUpdate = true
        // Data flows up to MineBook; instructions flow back down.
        L.pulses[0].position.copy(L.curve.getPoint((t * 0.35 + i * 0.13) % 1))
        L.pulses[1].position.copy(L.curve.getPoint(1 - ((t * 0.25 + i * 0.29) % 1)))
      })
    }

    // Leave room for the card (subject left on wide screens, high on phones).
    const { clientWidth: w, clientHeight: h } = canvas
    const offX = wide ? w * 0.08 : 0
    const offY = portrait ? h * 0.17 : 0
    if (offX || offY) camera.setViewOffset(w, h, offX, offY, w, h)
    else camera.clearViewOffset()

    // Publish screen positions of anchors for the cards and tags.
    camera.updateMatrixWorld()
    for (const id of Object.keys(anchorFor)) {
      projected.copy(anchorFor[id]()).project(camera)
      const slot = (screenAnchors[id] ??= { x: 0, y: 0, visible: false })
      slot.visible = projected.z < 1 && Math.abs(projected.x) < 1.1 && Math.abs(projected.y) < 1.1
      slot.x = ((projected.x + 1) / 2) * w
      slot.y = ((1 - projected.y) / 2) * h
    }
  }

  let last = performance.now()
  const tick = (now: number) => {
    frame = 0
    if (!running) return
    // rAF timestamps can precede the time we started; never step backwards.
    const dt = Math.min(0.05, Math.max(0, (now - last) / 1000))
    last = now
    update(time + dt, dt)
    renderer.render(scene, camera)
    frame = requestAnimationFrame(tick)
  }

  if (options.still) {
    update(4, 1 / 60)
    renderer.render(scene, camera)
  } else frame = requestAnimationFrame(tick)

  return {
    setJourney(from, to, t) {
      journey.from = from
      journey.to = to
      journey.t = t
      if (options.still) {
        snap = true
        update(time + 1 / 60, 1 / 60)
        renderer.render(scene, camera)
      }
    },
    dispose() {
      running = false
      cancelAnimationFrame(frame)
      window.removeEventListener("pointermove", onPointer)
      resizeObserver.disconnect()
      physics.dispose()
      anjana.dispose()
      kit.dispose()
      dustPool.forEach((d) => d.s.material.dispose())
      disposables.forEach((item) => item.dispose())
      renderer.dispose()
    },
  }
}
