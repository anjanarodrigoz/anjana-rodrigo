import * as THREE from "three"

import {
  BW,
  CRUSHER,
  GATE,
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
  topHeight,
} from "./terrain"
import { createKit } from "./vehicles"

/**
 * Procedural open-pit mine set in a mountain valley: benched pit with a
 * spiral haul ramp, haul trucks cycling ore to the crusher and waste to the
 * dump, an excavator loading a truck, drill rig, processing plant, site
 * office, workshop and an equipment parking line.
 *
 * This is a procedural prototype built from primitives, not scanned or
 * modelled assets. Swap `createKit()` models for GLBs when they exist.
 */

const v = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z)
export const ground = (x: number, z: number) => v(x, topHeight(x, z), z)

export function buildMine() {
  const group = new THREE.Group()
  const disposables: { dispose: () => void }[] = []
  const track = <T extends { dispose: () => void }>(item: T) => (disposables.push(item), item)
  const kit = createKit()
  const { mat, geo, add } = kit
  const color = new THREE.Color()
  const tmpColor = new THREE.Color()

  // Fine grain multiplied over vertex colours (gravel, grass, rock).
  const grain = (() => {
    const c = document.createElement("canvas")
    c.width = c.height = 256
    const g = c.getContext("2d")!
    const img = g.createImageData(256, 256)
    for (let i = 0; i < 256 * 256; i++) {
      const n = 0.8 + 0.2 * (0.6 * Math.random() + 0.4 * noise((i % 256) * 0.08, ((i / 256) | 0) * 0.08))
      const val = Math.round(255 * n)
      img.data.set([val, val, val, 255], i * 4)
    }
    g.putImageData(img, 0, 0)
    const tex = track(new THREE.CanvasTexture(c))
    tex.wrapS = tex.wrapT = THREE.RepeatWrapping
    tex.repeat.set(90, 90)
    tex.colorSpace = THREE.SRGBColorSpace
    tex.anisotropy = 4
    return tex
  })()

  const soft = (() => {
    const c = document.createElement("canvas")
    c.width = c.height = 128
    const g = c.getContext("2d")!
    const grad = g.createRadialGradient(64, 64, 0, 64, 64, 64)
    grad.addColorStop(0, "rgba(255,255,255,1)")
    grad.addColorStop(0.5, "rgba(255,255,255,0.4)")
    grad.addColorStop(1, "rgba(255,255,255,0)")
    g.fillStyle = grad
    g.fillRect(0, 0, 128, 128)
    return track(new THREE.CanvasTexture(c))
  })()

  // -- Terrain: pit, roads, dump, tailings, valley floor and mountains -------
  {
    const SIZE = 260
    const SEG = 320
    const g = track(new THREE.PlaneGeometry(SIZE, SIZE, SEG, SEG))
    g.rotateX(-Math.PI / 2)
    const p = g.attributes.position as THREE.BufferAttribute
    const col = new Float32Array(p.count * 3)
    for (let i = 0; i < p.count; i++) {
      const x = p.getX(i)
      const z = p.getZ(i)
      const y = topHeight(x, z)
      p.setY(i, y)
      const { d, theta } = pitCoords(x, z)
      const n = noise(x * 0.9, z * 0.9)
      const rr = Math.hypot(x, z) / rimR(Math.atan2(z, x))
      if (onRoad(x, z)) {
        const rut = 0.92 + 0.08 * Math.sin((roadDistance(x, z) + x * 0.02) * 40)
        color.set(0xbcae97).multiplyScalar((0.9 + n * 0.12) * rut)
      } else if (d < 1) {
        const band = 0.86 + 0.14 * noise(theta * 30, y * 2.2)
        color.set(0x9a8b78).lerp(tmpColor.set(0x77706a), n * 0.6).multiplyScalar(band)
      } else if (inTailings(x, z)) color.set(0xcfc7b4).multiplyScalar(0.92 + n * 0.1)
      else if (onWaste(x, z)) color.set(0x8f7a62).multiplyScalar(0.82 + n * 0.3)
      else if (onPad(x, z, 1)) color.set(0xb4b1aa).multiplyScalar(0.9 + n * 0.12)
      else if (d < 1.07) color.set(0x9a9384)
      else {
        // Valley grass, thinning to scrub and bare rock with altitude.
        color.setHSL(0.24 + n * 0.06, 0.36, 0.29 + n * 0.12)
        if (rr > 1.9) {
          const alt = THREE.MathUtils.smoothstep(y, 5, 17)
          color.lerp(tmpColor.set(0x8b8478).multiplyScalar(0.85 + n * 0.3), alt)
          if (y > 21) color.lerp(tmpColor.set(0xe9ecef), THREE.MathUtils.smoothstep(y, 21, 27) * 0.8)
        }
      }
      col.set([color.r, color.g, color.b], i * 3)
    }
    g.setAttribute("color", new THREE.BufferAttribute(col, 3))
    g.computeVertexNormals()
    // Steep faces: darker, with vertical streaking on the pit benches.
    const nrm = g.attributes.normal as THREE.BufferAttribute
    for (let k = 0; k < nrm.count; k++) {
      const ny = nrm.getY(k)
      if (ny < 0.85) {
        const inPit = pitCoords(p.getX(k), p.getZ(k)).d < 1.02
        const streak = inPit ? 0.85 + 0.15 * noise(Math.atan2(p.getZ(k) - PIT.z, p.getX(k) - PIT.x) * 60, 0.5) : 1
        const f = (inPit ? 0.5 + ny * 0.45 : 0.62 + ny * 0.4) * streak
        col[k * 3] *= f
        col[k * 3 + 1] *= f
        col[k * 3 + 2] *= f
      }
    }
    const mesh = new THREE.Mesh(g, track(new THREE.MeshStandardMaterial({ vertexColors: true, map: grain, roughness: 0.96 })))
    mesh.receiveShadow = true
    group.add(mesh)
  }

  // -- Vegetation: three-tier pines over the valley and lower slopes ---------
  {
    const tiers = [0, 1, 2].map((k) => {
      const g = track(new THREE.ConeGeometry(0.5 - k * 0.11, 0.75, 7))
      g.translate(0, 0.55 + k * 0.38, 0)
      return g
    })
    const trunk = track(new THREE.CylinderGeometry(0.06, 0.09, 0.6, 5))
    trunk.translate(0, 0.3, 0)
    const leaf = track(new THREE.MeshStandardMaterial({ roughness: 0.85, flatShading: true }))
    const bark = track(new THREE.MeshStandardMaterial({ color: 0x5a4330, roughness: 0.9 }))
    const spots: THREE.Matrix4[] = []
    const m4 = new THREE.Matrix4()
    let tries = 0
    while (spots.length < 1100 && tries < 40000) {
      tries++
      const a = hash(tries * 0.13, 1.7) * Math.PI * 2
      const r = Math.sqrt(hash(tries * 0.71, 4.2)) * 95
      const x = Math.cos(a) * r
      const z = Math.sin(a) * r
      const y = topHeight(x, z)
      if (pitCoords(x, z).d < 1.12 || onRoad(x, z) || roadDistance(x, z) < 0.9 || onPad(x, z, 1.15) || y > 15) continue
      // Clump trees: skip where low-frequency noise says "clearing".
      if (noise(x * 0.11 + 3, z * 0.11) < 0.36) continue
      // Keep the dump lookout and its view of the pit clear.
      if (Math.hypot(x + 24, z - 13) < 9) continue
      const s = 0.7 + hash(tries, 9.1) * 0.8
      const q = new THREE.Quaternion().setFromEuler(new THREE.Euler((hash(tries, 5) - 0.5) * 0.08, hash(tries, 6) * 6, (hash(tries, 7) - 0.5) * 0.08))
      m4.compose(v(x, y - 0.05, z), q, v(s, s * (0.9 + hash(tries, 3) * 0.5), s))
      spots.push(m4.clone())
    }
    const meshes = [...tiers.map((g) => new THREE.InstancedMesh(g, leaf, spots.length)), new THREE.InstancedMesh(trunk, bark, spots.length)]
    spots.forEach((m, i) =>
      meshes.forEach((im, k) => {
        im.setMatrixAt(i, m)
        if (k < 3) im.setColorAt(i, color.setHSL(0.3 + hash(i, 2) * 0.06, 0.4, 0.16 + hash(i, 5) * 0.07 + k * 0.025))
      }),
    )
    meshes.forEach((im) => {
      im.castShadow = true
      im.receiveShadow = true
      group.add(im)
      disposables.push(im)
    })
  }

  // -- Boulders on the slopes and pit floor -----------------------------------
  {
    const rock = track(new THREE.DodecahedronGeometry(0.5, 0))
    const n = 160
    const im = new THREE.InstancedMesh(rock, mat.ore, n)
    const m4 = new THREE.Matrix4()
    for (let i = 0; i < n; i++) {
      let x: number
      let z: number
      let s: number
      if (i < 50) {
        const q = benchXZ(hash(i, 0.3) * 6.28, 1 - 0.19 * (0.6 + hash(i, 0.9) * 0.45))
        x = q.x
        z = q.z
        s = 0.2 + hash(i, 4) * 0.4
      } else {
        const a = hash(i, 2.1) * 6.28
        const r = 34 + hash(i, 3.3) * 60
        x = Math.cos(a) * r
        z = Math.sin(a) * r
        s = 0.6 + hash(i, 4) * 2.4
      }
      m4.compose(ground(x, z), new THREE.Quaternion().setFromEuler(new THREE.Euler(i, i * 2, 0)), v(s, s * 0.7, s))
      im.setMatrixAt(i, m4)
    }
    im.castShadow = true
    im.receiveShadow = true
    group.add(im)
    disposables.push(im)
  }

  // -- Haul ramp: centre line and safety berm ---------------------------------
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
    const m = new THREE.Mesh(tube, track(new THREE.MeshStandardMaterial({ color: 0x8a7d6a, roughness: 1 })))
    m.castShadow = true
    group.add(m)
  }

  const routeFrom = (via: [number, number][]) => {
    const pts = roadPts.slice().reverse()
    const rim = pts[pts.length - 1]
    const lead = v(rim.x + (via[0][0] - rim.x) * 0.4, 0, rim.z + (via[0][1] - rim.z) * 0.4)
    const extra = [lead, ...via.map(([x, z]) => v(x, 0, z))].map((p) => ground(p.x, p.z).add(v(0, 0.04, 0)))
    const curve = new THREE.CatmullRomCurve3([...pts, ...extra])
    return { curve, len: curve.getLength() }
  }
  const oreRoute = routeFrom([[4.5, 5.4], [7.2, 5.1], [TIP_POINT.x, TIP_POINT.z]])
  const wasteRoute = routeFrom([[-1.5, 8.6], [-8, 9.6], [WASTE.x + WASTE.rx - 0.6, WASTE.z + 1.2]])

  // -- Excavator loading a truck on the pit floor -----------------------------
  const EXC = ground(PIT.x + 0.9, PIT.z - 0.4)
  const exc = kit.excavator()
  exc.root.position.copy(EXC)
  exc.root.scale.setScalar(1.35)
  exc.root.rotation.y = 0.4
  group.add(exc.root)
  const loader = kit.haulTruck()
  loader.root.position.copy(ground(PIT.x - 1.1, PIT.z + 0.9))
  loader.root.rotation.y = -0.35
  loader.root.scale.setScalar(1.2)
  loader.load.visible = false
  group.add(loader.root)
  const trayAt = loader.root.position.clone().add(v(0.15, 0.6, 0))
  const excToTruck = Math.atan2(-(trayAt.z - EXC.z), trayAt.x - EXC.x) - exc.root.rotation.y
  const excToFace = excToTruck + Math.PI * 0.85

  // -- Haul fleet ---------------------------------------------------------------
  const trucks = Array.from({ length: 7 }, (_, i) => {
    const t = kit.haulTruck()
    t.root.scale.setScalar(1.15)
    group.add(t.root)
    const route = i < 5 ? oreRoute : wasteRoute
    return {
      ...t,
      route: route.curve,
      len: route.len,
      u: i < 5 ? (i + 0.3) / 5.4 : (i - 5 + 0.4) / 2.4,
      dir: i % 2 === 0 ? 1 : -1,
      wait: 0,
      speed: 0,
      tip: 0,
      dust: 0,
    }
  })

  // -- Drill bench and planned block -------------------------------------------
  const DRILL_THETA = -1.75
  const benchPoint = (theta: number, inward: number) => {
    const q = benchXZ(theta, inward)
    return ground(q.x, q.z)
  }
  const rig = kit.drillRig()
  rig.root.position.copy(benchPoint(DRILL_THETA + 0.3, 1.45 * BW))
  rig.root.rotation.y = -DRILL_THETA + Math.PI / 2
  rig.root.scale.setScalar(1.3)
  group.add(rig.root)
  const planning = benchPoint(DRILL_THETA - 0.05, 1.3 * BW)
  {
    const holeGeo = track(new THREE.CylinderGeometry(0.045, 0.045, 0.08, 8))
    const holes = new THREE.InstancedMesh(holeGeo, mat.darkSteel, 36)
    const m4 = new THREE.Matrix4()
    const outline: THREE.Vector3[] = []
    let n = 0
    for (let row = 0; row < 3; row++) {
      for (let c = 0; c < 12; c++) {
        const p = benchPoint(DRILL_THETA - 0.32 + c * 0.05 + (row % 2) * 0.025, 1.22 * BW + row * 0.035)
        m4.makeTranslation(p.x, p.y + 0.04, p.z)
        holes.setMatrixAt(n++, m4)
      }
    }
    group.add(holes)
    disposables.push(holes)
    // Survey stakes with flagging tape around the planned block.
    for (const [th, inw] of [[-0.36, 1.16], [0.3, 1.16], [0.3, 1.38], [-0.36, 1.38]]) {
      const p = benchPoint(DRILL_THETA + th, inw * BW)
      add(group, geo.cyl8, mat.white, p.x, p.y + 0.25, p.z, 0.02, 0.5, 0.02)
      add(group, geo.box, mat.red, p.x + 0.07, p.y + 0.45, p.z, 0.12, 0.07, 0.01)
      outline.push(p.clone().add(v(0, 0.4, 0)))
    }
    outline.push(outline[0])
    group.add(new THREE.Line(track(new THREE.BufferGeometry().setFromPoints(outline)), track(new THREE.LineBasicMaterial({ color: 0xc8322b }))))
  }

  // -- Crusher, conveyor, stockpile, plant ---------------------------------------
  const CR = ground(CRUSHER.x, CRUSHER.z)
  {
    const g = new THREE.Group()
    g.position.copy(CR)
    add(g, geo.box, mat.steel, 0, 0.6, 0, 1.3, 1.2, 1.2)
    add(g, geo.box, mat.yellowDark, 0, 1.3, 0.55, 1.5, 0.25, 0.9)
    add(g, geo.box, mat.darkSteel, 0, 1.0, 0.8, 1.2, 0.5, 0.6)
    add(g, geo.box, mat.yellow, 0.8, 0.9, -0.2, 0.12, 1.8, 0.12)
    add(g, geo.box, mat.white, -0.4, 1.45, -0.3, 0.5, 0.35, 0.4)
    add(g, geo.box, mat.glass, -0.4, 1.47, -0.095, 0.4, 0.18, 0.01)
    group.add(g)
  }
  const SP = ground(STOCKPILE.x, STOCKPILE.z)
  {
    const pile = new THREE.Mesh(track(new THREE.ConeGeometry(2.1, 1.7, 22, 3)), track(new THREE.MeshStandardMaterial({ color: 0x77736c, roughness: 1, flatShading: true })))
    pile.position.copy(SP).add(v(0, 0.85, 0))
    pile.castShadow = true
    pile.receiveShadow = true
    group.add(pile)
  }
  const beltA = CR.clone().add(v(0.4, 0.9, -0.5))
  const beltB = SP.clone().add(v(0, 2.5, 0))
  {
    const len = beltA.distanceTo(beltB)
    const belt = new THREE.Group()
    belt.position.copy(beltA).lerp(beltB, 0.5)
    belt.lookAt(beltB)
    group.add(belt)
    add(belt, geo.box, mat.darkSteel, 0, 0, 0, 0.42, 0.08, len)
    add(belt, geo.box, mat.black, 0, 0.05, 0, 0.32, 0.02, len)
    add(belt, geo.box, mat.steel, 0.2, 0.12, 0, 0.02, 0.06, len)
    for (let k = 1; k < 6; k++) {
      const at = beltA.clone().lerp(beltB, k / 6)
      const gy = topHeight(at.x, at.z)
      add(group, geo.box, mat.steel, at.x, (at.y + gy) / 2, at.z, 0.08, at.y - gy, 0.08)
    }
  }
  const beltOre = new THREE.InstancedMesh(track(new THREE.DodecahedronGeometry(0.07, 0)), mat.ore, 12)
  group.add(beltOre)
  disposables.push(beltOre)

  let rake: THREE.Object3D | null = null
  {
    const P = ground(PLANT.x, PLANT.z)
    const plant = new THREE.Group()
    plant.position.copy(P)
    const cladding = track(new THREE.MeshStandardMaterial({ color: 0x9aa3ab, roughness: 0.5, metalness: 0.4 }))
    add(plant, geo.box, cladding, 1.2, 1.6, -0.6, 2.4, 3.2, 2.2)
    add(plant, geo.box, mat.steel, 1.2, 3.25, -0.6, 2.6, 0.12, 2.4)
    add(plant, geo.box, cladding, 1.2, 3.55, -0.6, 0.9, 0.5, 2.2)
    for (let k = 0; k < 3; k++) add(plant, geo.box, mat.glass, 0.55 + k * 0.65, 2.4, 0.51, 0.4, 0.5, 0.01)
    add(plant, geo.cyl, mat.steel, 0.1, 2.8, -1.6, 0.3, 5.6, 0.3)
    add(plant, geo.cyl, mat.steel, -1.4, 1.7, -1.6, 0.75, 3.4, 0.75)
    add(plant, geo.cyl, mat.steel, -2.3, 1.0, 0.6, 0.85, 2.0, 0.85)
    add(plant, geo.cyl, mat.white, 3.2, 1.1, 1.4, 0.9, 2.2, 0.9)
    add(plant, geo.cyl, mat.white, 3.4, 0.25, -2.4, 1.6, 0.5, 1.6)
    add(plant, geo.cyl, track(new THREE.MeshStandardMaterial({ color: 0x5bb4dc, roughness: 0.35, metalness: 0 })), 3.4, 0.46, -2.4, 1.5, 0.05, 1.5)
    rake = add(plant, geo.box, mat.yellow, 3.4, 0.62, -2.4, 3.1, 0.08, 0.12)
    group.add(plant)
    const pond = new THREE.Mesh(track(new THREE.CircleGeometry(1, 40)), track(new THREE.MeshStandardMaterial({ color: 0x7fb0bb, roughness: 0.35, metalness: 0 })))
    pond.rotation.x = -Math.PI / 2
    pond.scale.set(TSF.rx * 0.78, TSF.rz * 0.72, 1)
    pond.position.set(TSF.x + 0.3, 0.47, TSF.z - 0.2)
    group.add(pond)
  }

  // -- Site office (with MineBook sign), utes, gate ---------------------------
  const OF = ground(OFFICE.x, OFFICE.z)
  {
    const office = new THREE.Group()
    office.position.copy(OF)
    office.rotation.y = 0.35
    office.scale.setScalar(1.3)
    add(office, geo.box, mat.white, 0, 0.5, 0, 2.4, 1.0, 1.2)
    add(office, geo.box, mat.darkSteel, 0, 1.05, 0, 2.5, 0.1, 1.3)
    for (let k = 0; k < 4; k++) add(office, geo.box, mat.glass, -0.85 + k * 0.57, 0.55, 0.605, 0.38, 0.35, 0.01)
    add(office, geo.box, mat.darkSteel, 1.0, 0.4, 0.605, 0.3, 0.75, 0.01)
    add(office, geo.box, mat.white, 2.0, 0.45, 0.5, 1.1, 0.9, 1.0)
    const c = document.createElement("canvas")
    c.width = 512
    c.height = 128
    const g = c.getContext("2d")!
    g.fillStyle = "#183F35"
    g.fillRect(0, 0, 512, 128)
    g.fillStyle = "#F6F7F3"
    g.font = "700 70px 'Space Grotesk', system-ui, sans-serif"
    g.textAlign = "center"
    g.textBaseline = "middle"
    g.fillText("MineBook", 256, 68)
    const tex = track(new THREE.CanvasTexture(c))
    tex.colorSpace = THREE.SRGBColorSpace
    const board = new THREE.Mesh(track(new THREE.PlaneGeometry(1.4, 0.35)), track(new THREE.MeshStandardMaterial({ map: tex, roughness: 0.4 })))
    board.position.set(0, 1.35, 0.3)
    office.add(board)
    group.add(office)
    for (let k = 0; k < 3; k++) {
      const ute = new THREE.Group()
      ute.position.copy(ground(OFFICE.x - 2.2 + k * 1.0, OFFICE.z + 2.3))
      ute.rotation.y = 0.35 + Math.PI / 2
      ute.scale.setScalar(1.35)
      add(ute, geo.box, mat.white, 0, 0.17, 0, 0.6, 0.16, 0.3)
      add(ute, geo.box, mat.white, -0.08, 0.31, 0, 0.3, 0.14, 0.28)
      add(ute, geo.box, mat.glass, -0.08, 0.32, 0, 0.31, 0.09, 0.285)
      for (const [x, z] of [[-0.2, 0.15], [0.2, 0.15], [-0.2, -0.15], [0.2, -0.15]]) add(ute, geo.cyl, mat.tyre, x, 0.08, z, 0.08, 0.06, 0.08).rotation.x = Math.PI / 2
      group.add(ute)
    }
    const G = ground(GATE.x, GATE.z)
    const gate = new THREE.Group()
    gate.position.copy(G)
    gate.rotation.y = 0.45
    add(gate, geo.box, mat.white, -1.1, 0.35, 0, 0.5, 0.7, 0.5)
    add(gate, geo.box, mat.red, 0.1, 0.75, 0, 1.6, 0.06, 0.06)
    group.add(gate)
  }

  // -- Workshop and the equipment parking line ----------------------------------
  {
    const WS = ground(WORKSHOP.x, WORKSHOP.z)
    const g = new THREE.Group()
    g.position.copy(WS)
    g.rotation.y = -0.2
    add(g, geo.box, mat.steel, 0, 0.9, -0.5, 4.4, 1.8, 1.8)
    for (const side of [-1, 1]) add(g, geo.box, mat.darkSteel, 0, 2.0, -0.5 + side * 0.48, 4.6, 0.08, 1.1).rotation.x = side * 0.32
    for (let k = 0; k < 3; k++) add(g, geo.box, mat.black, -1.4 + k * 1.4, 0.75, 0.405, 1.05, 1.4, 0.02)
    group.add(g)
    for (let k = 0; k < 3; k++) {
      const parked = kit.haulTruck()
      const at = WS.clone().add(v(-1.9 + k * 1.55, 0, 2.0).applyAxisAngle(v(0, 1, 0), -0.2))
      parked.root.position.set(at.x, topHeight(at.x, at.z), at.z)
      parked.root.rotation.y = -0.2 + Math.PI / 2
      parked.root.scale.setScalar(1.1)
      parked.load.visible = false
      group.add(parked.root)
    }
  }

  // -- Dozer shaping the waste dump --------------------------------------------
  const dozer = new THREE.Group()
  {
    for (const z of [-0.3, 0.3]) add(dozer, geo.box, mat.black, 0, 0.14, z, 0.9, 0.26, 0.2)
    add(dozer, geo.box, mat.yellow, 0.05, 0.4, 0, 0.75, 0.3, 0.55)
    add(dozer, geo.box, mat.yellow, -0.15, 0.68, 0, 0.32, 0.3, 0.45)
    add(dozer, geo.box, mat.yellowDark, 0.6, 0.25, 0, 0.08, 0.38, 0.9)
    dozer.scale.setScalar(1.4)
    group.add(dozer)
  }

  // -- Dust -----------------------------------------------------------------------
  const dustPool = Array.from({ length: 60 }, () => {
    const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: soft, color: 0xc9b9a0, transparent: true, opacity: 0, depthWrite: false }))
    s.visible = false
    group.add(s)
    return { s, age: 0, life: 1, grow: 1, vy: 0.3 }
  })
  let dustNext = 0
  const puff = (at: THREE.Vector3, size: number, life: number) => {
    const d = dustPool[dustNext++ % dustPool.length]
    d.s.position.copy(at)
    d.s.visible = true
    d.age = 0
    d.life = life
    d.grow = size
  }

  // -- Build-in: on first view the site assembles itself, piece by piece -----
  const buildables = group.children
    .filter((c) => c.type === "Group")
    .map((c) => ({ o: c, base: c.scale.x, d: Math.hypot(c.position.x - PIT.x, c.position.z - PIT.z) }))
    .sort((p, q) => p.d - q.d)
  const forests = group.children.filter((c) => (c as THREE.InstancedMesh).isInstancedMesh && (c as THREE.InstancedMesh).count > 500)
  buildables.forEach((b) => b.o.scale.setScalar(0.0001))
  forests.forEach((f) => (f.scale.y = 0.0001))
  let buildStart = -1
  const building = (t: number) => {
    if (buildStart < 0) buildStart = t + 0.8
    const e = t - buildStart
    if (e > 9) return
    buildables.forEach((b, i) => {
      const k = THREE.MathUtils.clamp((e - i * 0.16) / 0.7, 0, 1)
      // Overshoot slightly, then settle: each piece "drops" into place.
      const s = k === 0 ? 0.0001 : 1 + 2.2 * Math.pow(k - 1, 3) + 1.2 * Math.pow(k - 1, 2)
      b.o.scale.setScalar(b.base * Math.max(0.0001, s))
    })
    const g = THREE.MathUtils.smoothstep(e, 0.2, 3.5)
    forests.forEach((f) => (f.scale.y = Math.max(0.0001, g)))
  }

  // -- Per-frame update -----------------------------------------------------------
  const tangent = new THREE.Vector3()
  const m4 = new THREE.Matrix4()
  let excClock = 0
  let passes = 0
  let dumped = false
  let beltClock = 0
  const ss = THREE.MathUtils.smoothstep

  const update = (t: number, dt: number) => {
    building(t)
    for (const tr of trucks) {
      if (tr.wait > 0) {
        tr.wait -= dt
        tr.speed = 0
        if (tr.dir === 1 && tr.u > 0.99) tr.tip = Math.min(1, tr.tip + dt * 0.8)
        if (tr.wait <= 0) {
          tr.load.visible = tr.u < 0.5
          tr.dir = tr.u > 0.99 ? -1 : 1
        }
      } else {
        tr.tip = Math.max(0, tr.tip - dt * 0.8)
        const target = tr.dir === 1 ? 1.0 : 2.0
        tr.speed += (target - tr.speed) * Math.min(1, dt * 0.8)
        tr.u += (tr.dir * tr.speed * dt) / tr.len
        if (tr.u >= 1) {
          tr.u = 1
          tr.wait = 2.6
          puff(tr.route.getPointAt(1).add(v(0, 0.8, 0)), 1.8, 1.8)
        } else if (tr.u <= 0) {
          tr.u = 0
          tr.wait = 2
        }
      }
      const u = THREE.MathUtils.clamp(tr.u, 0, 1)
      const p = tr.route.getPointAt(u)
      tr.route.getTangentAt(u, tangent)
      const fwd = tangent.clone().multiplyScalar(tr.dir)
      const side = v(fwd.z, 0, -fwd.x).normalize().multiplyScalar(0.3)
      tr.root.position.copy(p).add(side)
      tr.root.position.y = topHeight(tr.root.position.x, tr.root.position.z) + 0.02
      tr.root.rotation.y = Math.atan2(-fwd.z, fwd.x) + Math.PI
      tr.root.rotation.z = -Math.asin(THREE.MathUtils.clamp(fwd.y, -1, 1))
      tr.tray.rotation.z = -tr.tip * 0.75
      tr.body.rotation.x = Math.sin(t * 6 + tr.u * 40) * 0.01 * Math.min(1, tr.speed)
      for (const w of tr.wheels) w.rotation.z += (tr.speed * dt) / 0.3
      tr.dust -= dt
      if (tr.speed > 0.6 && tr.dust <= 0) {
        tr.dust = 0.22
        puff(tr.root.position.clone().addScaledVector(fwd, -0.7).add(v(0, 0.2, 0)), 1.0, 1.8)
      }
    }

    // Excavator: dig, swing, dump, return. Every fourth pass fills the truck.
    excClock += dt
    const ph = (excClock % 7) / 7
    const swing = ss(ph, 0.25, 0.38) * (1 - ss(ph, 0.62, 0.78))
    exc.house.rotation.y = THREE.MathUtils.lerp(excToFace, excToTruck, swing)
    const dig = ss(ph, 0, 0.12) * (1 - ss(ph, 0.15, 0.27))
    exc.boom.rotation.z = -0.15 - dig * 0.35 + swing * 0.25
    exc.stick.rotation.z = -0.4 + dig * 0.5 - swing * 0.15
    const dump = ss(ph, 0.48, 0.55) * (1 - ss(ph, 0.62, 0.7))
    exc.bucket.rotation.z = 0.4 - dig * 0.9 + dump * 1.6
    exc.scoop.visible = ph > 0.16 && ph < 0.52
    if (ph > 0.52 && !dumped) {
      dumped = true
      passes++
      puff(trayAt.clone().add(v(0, 0.5, 0)), 1.2, 1.3)
      loader.load.visible = passes % 5 !== 0
      loader.load.scale.setScalar(0.4 + 0.2 * (passes % 5))
    }
    if (ph < 0.1) dumped = false

    rig.rod.rotation.y += dt * 12
    if (Math.random() < dt * 1.5) puff(rig.root.position.clone().add(v(0.4, 0.2, 0)), 0.7, 1.4)
    if (rake) rake.rotation.y += dt * 0.25

    beltClock += dt
    const dir = beltB.clone().sub(beltA)
    for (let k = 0; k < 12; k++) {
      const p = beltA.clone().addScaledVector(dir, (beltClock * 0.12 + k / 12) % 1).add(v(0, 0.1, 0))
      m4.makeTranslation(p.x, p.y, p.z)
      beltOre.setMatrixAt(k, m4)
    }
    beltOre.instanceMatrix.needsUpdate = true

    const dx = WASTE.x + Math.sin(t * 0.3) * 1.6
    dozer.position.set(dx, topHeight(dx, WASTE.z - 0.9) + 0.02, WASTE.z - 0.9)
    dozer.rotation.y = Math.cos(t * 0.3) > 0 ? Math.PI : 0

    for (const d of dustPool) {
      if (!d.s.visible) continue
      d.age += dt
      const k = d.age / d.life
      if (k >= 1) {
        d.s.visible = false
        continue
      }
      d.s.position.y += d.vy * dt
      d.s.scale.setScalar(0.3 + d.grow * Math.sqrt(k))
      d.s.material.opacity = 0.42 * (1 - k) * Math.min(1, k * 6)
    }
  }

  return {
    group,
    update,
    /** World positions of the three interactive objects. */
    hot: {
      truck: () => trucks[0].root.position.clone().add(v(0, 0.7, 0)),
      office: () => OF.clone().add(v(0, 0.9, 0)),
      planning: () => planning.clone().add(v(0, 0.4, 0)),
    },
    dispose() {
      kit.dispose()
      dustPool.forEach((d) => d.s.material.dispose())
      disposables.forEach((d) => d.dispose())
    },
  }
}

export type Mine = ReturnType<typeof buildMine>
