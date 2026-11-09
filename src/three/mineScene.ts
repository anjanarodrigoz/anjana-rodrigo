import * as THREE from "three"

/**
 * Procedural open-pit mine rendered in monochrome.
 *
 * The pit is a single height-field: a gently undulating plateau with a
 * terraced excavation cut into it. Benches are flat, faces are steep, and a
 * haul road spirals down the walls. Haul trucks drive the spiral, a survey
 * scan sweeps through the benches, and dust drifts above the floor.
 */

export interface MineSceneHandle {
  dispose: () => void
  setScroll: (progress: number) => void
}

interface Options {
  /** Render one still frame and stop (prefers-reduced-motion). */
  still?: boolean
}

// ---------------------------------------------------------------------------
// Geometry helpers
// ---------------------------------------------------------------------------

const PIT_RADIUS = 13
const BENCHES = 8
const BENCH_WIDTH = PIT_RADIUS / (BENCHES + 1.6)
const BENCH_HEIGHT = 1.15
const RAMP_TURNS = 1.65

/** Irregular pit outline so it reads as excavated, not machined. */
const shape = (theta: number) =>
  1 + 0.13 * Math.sin(2 * theta + 0.8) + 0.06 * Math.sin(3 * theta - 0.4) + 0.025 * Math.sin(7 * theta)

const smoothstep = (a: number, b: number, x: number) => {
  const t = Math.min(1, Math.max(0, (x - a) / (b - a)))
  return t * t * (3 - 2 * t)
}

/** Cheap deterministic value noise for the plateau surface. */
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

/** Depth of the pit at normalised inward distance `inward` (0 at crest). */
const pitDepth = (inward: number) => {
  const steps = inward / BENCH_WIDTH
  const level = Math.min(Math.floor(steps), BENCHES)
  const frac = steps - Math.floor(steps)
  // Flat bench for most of the step, then a steep face down to the next one.
  const face = level >= BENCHES ? 0 : smoothstep(0.68, 0.96, frac)
  return (level + face) * BENCH_HEIGHT
}

/** Ramp position as a function of t ∈ [0, 1] from crest to floor. */
const rampPoint = (t: number) => {
  const theta = t * Math.PI * 2 * RAMP_TURNS + 0.6
  const inward = 0.25 + t * (BENCHES - 0.05) * BENCH_WIDTH
  const r = (PIT_RADIUS - inward) * shape(theta)
  return { theta, inward, r, depth: inward * (BENCH_HEIGHT / BENCH_WIDTH) * 0.98 }
}

function heightAt(x: number, z: number) {
  const theta = Math.atan2(z, x)
  const d = Math.hypot(x, z) / shape(theta)
  const plateau = (noise(x * 0.12, z * 0.12) - 0.5) * 1.4 + (noise(x * 0.4, z * 0.4) - 0.5) * 0.25
  // The plateau gently rises toward the crest like waste dumps around a pit.
  const berm = smoothstep(PIT_RADIUS + 6, PIT_RADIUS + 0.4, d) * 0.6
  if (d >= PIT_RADIUS) return plateau * smoothstep(PIT_RADIUS, PIT_RADIUS + 6, d) + berm

  const inward = PIT_RADIUS - d
  let y = -pitDepth(inward) + berm

  // Carve the haul road: wherever the spiral passes, flatten to its grade.
  const thetaN = (theta - 0.6 + Math.PI * 4) % (Math.PI * 2)
  for (let k = 0; k < 2; k++) {
    const t = (thetaN + k * Math.PI * 2) / (Math.PI * 2 * RAMP_TURNS)
    if (t > 1) continue
    const p = rampPoint(t)
    const delta = Math.abs(inward - p.inward)
    if (delta < BENCH_WIDTH * 0.42) {
      const w = smoothstep(BENCH_WIDTH * 0.42, BENCH_WIDTH * 0.18, delta)
      y = y * (1 - w) + (-p.depth + berm) * w
    }
  }
  return y
}

// ---------------------------------------------------------------------------
// Scene
// ---------------------------------------------------------------------------

export function createMineScene(canvas: HTMLCanvasElement, options: Options = {}): MineSceneHandle {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: "high-performance" })
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
  renderer.setClearColor(0x000000, 0)
  renderer.toneMapping = THREE.NoToneMapping

  const scene = new THREE.Scene()
  const fog = new THREE.Fog(0xffffff, 26, 62)
  scene.fog = fog

  const camera = new THREE.PerspectiveCamera(34, 1, 0.1, 200)

  // -- Lighting: one hard key, a cool-neutral fill — strictly greyscale. ----
  scene.add(new THREE.HemisphereLight(0xffffff, 0xb0b0b0, 1.9))
  const sun = new THREE.DirectionalLight(0xffffff, 1.1)
  sun.position.set(-14, 22, 10)
  scene.add(sun)

  const disposables: { dispose: () => void }[] = []
  const track = <T extends { dispose: () => void }>(item: T) => {
    disposables.push(item)
    return item
  }

  // -- Terrain -----------------------------------------------------------
  const SIZE = 58
  const SEG = 320
  const terrainGeo = track(new THREE.PlaneGeometry(SIZE, SIZE, SEG, SEG))
  terrainGeo.rotateX(-Math.PI / 2)
  const pos = terrainGeo.attributes.position as THREE.BufferAttribute
  for (let i = 0; i < pos.count; i++) {
    pos.setY(i, heightAt(pos.getX(i), pos.getZ(i)))
  }
  terrainGeo.computeVertexNormals()

  const terrain = new THREE.Mesh(
    terrainGeo,
    track(new THREE.MeshStandardMaterial({ color: 0xeef2f8, roughness: 0.95, metalness: 0 })),
  )
  scene.add(terrain)

  // -- Survey contours: crest and toe lines of every bench -----------------
  const contourMat = track(new THREE.LineBasicMaterial({ color: 0x0b5fe0, transparent: true, opacity: 0.7 }))
  const faintMat = track(new THREE.LineBasicMaterial({ color: 0x0b5fe0, transparent: true, opacity: 0.2 }))
  const contours = new THREE.Group()
  const ring = (inward: number, lift: number, mat: THREE.LineBasicMaterial) => {
    const pts: THREE.Vector3[] = []
    const N = 260
    for (let i = 0; i <= N; i++) {
      const theta = (i / N) * Math.PI * 2
      const r = (PIT_RADIUS - inward) * shape(theta)
      const x = Math.cos(theta) * r
      const z = Math.sin(theta) * r
      pts.push(new THREE.Vector3(x, heightAt(x, z) + lift, z))
    }
    const geo = track(new THREE.BufferGeometry().setFromPoints(pts))
    contours.add(new THREE.Line(geo, mat))
  }
  for (let level = 0; level <= BENCHES; level++) {
    const crest = level * BENCH_WIDTH + BENCH_WIDTH * 0.66
    ring(Math.max(0.02, level * BENCH_WIDTH), 0.04, contourMat)
    if (level < BENCHES) ring(crest, 0.04, faintMat)
  }
  // Topographic lines on the plateau outside the pit.
  for (let k = 1; k <= 7; k++) ring(-k * 1.7, 0.05, faintMat)
  scene.add(contours)

  // -- Haul road centreline -------------------------------------------------
  const roadPts: THREE.Vector3[] = []
  const roadSamples = 420
  for (let i = 0; i <= roadSamples; i++) {
    const p = rampPoint(i / roadSamples)
    const x = Math.cos(p.theta) * p.r
    const z = Math.sin(p.theta) * p.r
    roadPts.push(new THREE.Vector3(x, heightAt(x, z) + 0.06, z))
  }
  const roadCurve = new THREE.CatmullRomCurve3(roadPts)
  const roadLine = new THREE.Line(
    track(new THREE.BufferGeometry().setFromPoints(roadCurve.getPoints(600))),
    track(new THREE.LineDashedMaterial({ color: 0x0b5fe0, dashSize: 0.28, gapSize: 0.22, transparent: true, opacity: 0.85 })),
  )
  roadLine.computeLineDistances()
  scene.add(roadLine)

  // -- Haul trucks ---------------------------------------------------------
  const bodyMat = track(new THREE.MeshStandardMaterial({ color: 0x0b5fe0, roughness: 0.5, metalness: 0.1 }))
  const darkMat = track(new THREE.MeshStandardMaterial({ color: 0x1d2b45, roughness: 0.8 }))
  const loadMat = track(new THREE.MeshStandardMaterial({ color: 0x9c9c9c, roughness: 1, flatShading: true }))
  const boxGeo = track(new THREE.BoxGeometry(1, 1, 1))
  const wheelGeo = track(new THREE.CylinderGeometry(0.17, 0.17, 0.12, 14))
  wheelGeo.rotateX(Math.PI / 2)
  const loadGeo = track(new THREE.DodecahedronGeometry(0.28, 0))

  const makeTruck = (loaded: boolean) => {
    const g = new THREE.Group()
    const add = (mesh: THREE.Mesh, x: number, y: number, z: number, sx = 1, sy = 1, sz = 1) => {
      mesh.position.set(x, y, z)
      mesh.scale.set(sx, sy, sz)
      g.add(mesh)
    }
    add(new THREE.Mesh(boxGeo, bodyMat), 0.12, 0.42, 0, 0.95, 0.36, 0.56) // tray
    add(new THREE.Mesh(boxGeo, bodyMat), -0.48, 0.42, 0, 0.26, 0.42, 0.5) // cab
    add(new THREE.Mesh(boxGeo, darkMat), -0.1, 0.22, 0, 1.15, 0.12, 0.42) // chassis
    for (const [x, z] of [[-0.42, 0.26], [-0.42, -0.26], [0.3, 0.26], [0.3, -0.26]]) {
      add(new THREE.Mesh(wheelGeo, darkMat), x, 0.17, z)
    }
    if (loaded) add(new THREE.Mesh(loadGeo, loadMat), 0.14, 0.66, 0, 1.4, 0.55, 0.9)
    g.scale.setScalar(0.8)
    return g
  }

  const trucks = Array.from({ length: 6 }, (_, i) => {
    const loaded = i % 2 === 0
    const truck = makeTruck(loaded)
    scene.add(truck)
    return { mesh: truck, offset: i / 6, speed: 0.012 + (i % 3) * 0.002, up: loaded }
  })

  // -- Excavator on the pit floor -----------------------------------------
  const excavator = new THREE.Group()
  {
    const base = new THREE.Mesh(boxGeo, darkMat)
    base.scale.set(1.2, 0.25, 0.9)
    base.position.y = 0.15
    const house = new THREE.Mesh(boxGeo, bodyMat)
    house.scale.set(0.9, 0.5, 0.7)
    house.position.set(-0.1, 0.55, 0)
    const boom = new THREE.Mesh(boxGeo, bodyMat)
    boom.scale.set(1.5, 0.14, 0.14)
    boom.position.set(0.8, 1.05, 0)
    boom.rotation.z = 0.55
    const bucket = new THREE.Mesh(boxGeo, darkMat)
    bucket.scale.set(0.35, 0.35, 0.4)
    bucket.position.set(1.5, 0.95, 0)
    excavator.add(base, house, boom, bucket)
    const floorDepth = heightAt(1.2, -0.6)
    excavator.position.set(1.2, floorDepth, -0.6)
    excavator.scale.setScalar(0.75)
    scene.add(excavator)
  }

  // -- Survey scan: a horizontal plane slicing through the benches ---------
  const scanGeo = track(new THREE.RingGeometry(0.1, PIT_RADIUS * 1.25, 96, 1))
  scanGeo.rotateX(-Math.PI / 2)
  const scanMat = track(
    new THREE.MeshBasicMaterial({ color: 0x0b5fe0, transparent: true, opacity: 0.05, side: THREE.DoubleSide, depthWrite: false }),
  )
  const scan = new THREE.Mesh(scanGeo, scanMat)
  scene.add(scan)

  // -- Drill-hole grid on one bench (blast pattern) -----------------------
  const holeGeo = track(new THREE.CylinderGeometry(0.035, 0.035, 0.16, 6))
  const holes = new THREE.InstancedMesh(holeGeo, bodyMat, 60)
  {
    const m = new THREE.Matrix4()
    let n = 0
    for (let row = 0; row < 4; row++) {
      for (let col = 0; col < 15; col++) {
        const theta = -2.1 + col * 0.07 + (row % 2) * 0.035
        const inward = 3 * BENCH_WIDTH + 0.3 + row * 0.38
        const r = (PIT_RADIUS - inward) * shape(theta)
        const x = Math.cos(theta) * r
        const z = Math.sin(theta) * r
        m.makeTranslation(x, heightAt(x, z) + 0.08, z)
        holes.setMatrixAt(n++, m)
      }
    }
  }
  scene.add(holes)

  // -- Dust ------------------------------------------------------------------
  const DUST = 900
  const dustGeo = track(new THREE.BufferGeometry())
  const dustPos = new Float32Array(DUST * 3)
  for (let i = 0; i < DUST; i++) {
    const a = Math.random() * Math.PI * 2
    const r = Math.sqrt(Math.random()) * PIT_RADIUS * 1.6
    dustPos[i * 3] = Math.cos(a) * r
    dustPos[i * 3 + 1] = -BENCHES * BENCH_HEIGHT + Math.random() * 14
    dustPos[i * 3 + 2] = Math.sin(a) * r
  }
  dustGeo.setAttribute("position", new THREE.BufferAttribute(dustPos, 3))
  const dust = new THREE.Points(
    dustGeo,
    track(new THREE.PointsMaterial({ color: 0x0b5fe0, size: 0.04, transparent: true, opacity: 0.3, depthWrite: false })),
  )
  scene.add(dust)

  // -- Interaction ---------------------------------------------------------
  const pointer = { x: 0, y: 0, tx: 0, ty: 0 }
  let scroll = 0
  const onPointer = (event: PointerEvent) => {
    pointer.tx = (event.clientX / window.innerWidth) * 2 - 1
    pointer.ty = (event.clientY / window.innerHeight) * 2 - 1
  }
  window.addEventListener("pointermove", onPointer, { passive: true })

  let distance = 1
  const resize = () => {
    const { clientWidth: w, clientHeight: h } = canvas
    if (!w || !h) return
    renderer.setSize(w, h, false)
    camera.aspect = w / h
    // Pull back on narrow screens so the whole pit stays in frame.
    camera.fov = w / h < 1 ? 40 : 34
    distance = w / h < 0.8 ? 2.1 : 1
    fog.near = 26 * distance
    fog.far = 62 * distance
    // On wide screens, slide the pit right so the headline has clear ground.
    // On phones, lift it into the top of the screen above the copy.
    if (w / h > 1.25) camera.setViewOffset(w, h, -w * 0.16, 0, w, h)
    else if (w / h < 0.8) camera.setViewOffset(w, h, 0, h * 0.17, w, h)
    else camera.clearViewOffset()
    camera.updateProjectionMatrix()
  }
  const resizeObserver = new ResizeObserver(resize)
  resizeObserver.observe(canvas)
  resize()

  // -- Loop ------------------------------------------------------------------
  const clock = new THREE.Clock()
  const target = new THREE.Vector3(0, -4, 0)
  const tangent = new THREE.Vector3()
  let frame = 0
  let running = !options.still
  let visible = true

  const update = (t: number) => {
    pointer.x += (pointer.tx - pointer.x) * 0.04
    pointer.y += (pointer.ty - pointer.y) * 0.04

    const orbit = t * 0.035 + pointer.x * 0.35
    const radius = (30 - scroll * 8) * distance
    const height = (17 + pointer.y * -2.5 - scroll * 5) * distance
    camera.position.set(Math.cos(orbit) * radius, height, Math.sin(orbit) * radius)
    camera.lookAt(target)

    for (const truck of trucks) {
      let u = (truck.offset + t * truck.speed) % 1
      if (truck.up) u = 1 - u
      const p = roadCurve.getPointAt(u)
      roadCurve.getTangentAt(u, tangent)
      if (truck.up) tangent.negate()
      truck.mesh.position.copy(p)
      truck.mesh.rotation.y = Math.atan2(-tangent.z, tangent.x) + Math.PI
    }

    excavator.rotation.y = Math.sin(t * 0.6) * 0.9

    const sweep = (t * 0.08) % 1
    scan.position.y = 1 - sweep * (BENCHES * BENCH_HEIGHT + 1)
    scanMat.opacity = 0.06 * Math.sin(sweep * Math.PI)

    dust.rotation.y = t * 0.01
    const arr = dustGeo.attributes.position.array as Float32Array
    for (let i = 1; i < arr.length; i += 3) {
      arr[i] += 0.004
      if (arr[i] > 6) arr[i] = -BENCHES * BENCH_HEIGHT
    }
    dustGeo.attributes.position.needsUpdate = true
  }

  const tick = () => {
    frame = 0
    if (!running || !visible) return
    update(clock.getElapsedTime())
    renderer.render(scene, camera)
    frame = requestAnimationFrame(tick)
  }

  const visibility = new IntersectionObserver(([entry]) => {
    visible = entry.isIntersecting
    if (visible && running && !frame) {
      frame = requestAnimationFrame(tick)
    }
  })
  visibility.observe(canvas)

  if (options.still) {
    update(4)
    renderer.render(scene, camera)
  } else {
    frame = requestAnimationFrame(tick)
  }

  return {
    setScroll(progress) {
      scroll = Math.min(1, Math.max(0, progress))
      if (options.still) {
        update(4)
        renderer.render(scene, camera)
      }
    },
    dispose() {
      running = false
      cancelAnimationFrame(frame)
      window.removeEventListener("pointermove", onPointer)
      resizeObserver.disconnect()
      visibility.disconnect()
      holes.dispose()
      disposables.forEach((item) => item.dispose())
      renderer.dispose()
    },
  }
}
