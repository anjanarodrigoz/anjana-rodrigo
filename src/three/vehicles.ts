import * as THREE from "three"

/** Shared materials and helpers for the mining equipment. */
export function createKit() {
  const disposables: { dispose: () => void }[] = []
  const track = <T extends { dispose: () => void }>(x: T) => (disposables.push(x), x)
  const std = (color: number, roughness = 0.6, metalness = 0, extra: Partial<THREE.MeshStandardMaterialParameters> = {}) =>
    track(new THREE.MeshStandardMaterial({ color, roughness, metalness, ...extra }))

  const mat = {
    yellow: std(0xf0b000, 0.5, 0.15),
    yellowDark: std(0xc98f00, 0.55, 0.15),
    steel: std(0xaab3bd, 0.35, 0.7),
    darkSteel: std(0x3b4048, 0.5, 0.6),
    tyre: std(0x1b1c1f, 0.9),
    rim: std(0x8c8f94, 0.4, 0.6),
    glass: std(0x1d2a3a, 0.08, 0.3, { transparent: true, opacity: 0.85 }),
    black: std(0x15171a, 0.7),
    white: std(0xf2f4f6, 0.55),
    blue: std(0x1f5fd6, 0.45, 0.2),
    red: std(0xc8322b, 0.5),
    ore: std(0x6c6f74, 0.95, 0, { flatShading: true }),
    light: std(0xfff6d8, 0.3, 0, { emissive: 0xfff2c0, emissiveIntensity: 0.5 }),
  }
  const geo = {
    box: track(new THREE.BoxGeometry(1, 1, 1)),
    cyl: track(new THREE.CylinderGeometry(1, 1, 1, 22)),
    cyl8: track(new THREE.CylinderGeometry(1, 1, 1, 8)),
    sphere: track(new THREE.SphereGeometry(1, 16, 12)),
    tyre: track(new THREE.TorusGeometry(0.75, 0.25, 10, 24)),
  }

  const add = (parent: THREE.Object3D, g: THREE.BufferGeometry, m: THREE.Material, x: number, y: number, z: number, sx: number, sy: number, sz: number) => {
    const o = new THREE.Mesh(g, m)
    o.position.set(x, y, z)
    o.scale.set(sx, sy, sz)
    o.castShadow = true
    o.receiveShadow = true
    parent.add(o)
    return o
  }

  const wheel = (parent: THREE.Object3D, x: number, y: number, z: number, r: number, w: number) => {
    const g = new THREE.Group()
    g.position.set(x, y, z)
    const t = add(g, geo.tyre, mat.tyre, 0, 0, 0, r, r, w * 2.2)
    t.rotation.set(0, 0, 0)
    add(g, geo.cyl, mat.rim, 0, 0, 0, r * 0.55, w * 0.9, r * 0.55).rotation.x = Math.PI / 2
    // Tread blocks so the rotation reads.
    for (let k = 0; k < 10; k++) {
      const a = (k / 10) * Math.PI * 2
      const b = add(g, geo.box, mat.tyre, Math.cos(a) * r * 0.98, Math.sin(a) * r * 0.98, 0, r * 0.12, r * 0.12, w * 0.95)
      b.rotation.z = a
    }
    parent.add(g)
    return g
  }

  // -- Haul truck (rigid-frame, ~1:? diorama scale; length ≈ 1.6 units) -------
  const haulTruck = () => {
    const root = new THREE.Group()
    const body = new THREE.Group() // suspension sway applied here
    root.add(body)
    // Frame and deck.
    add(body, geo.box, mat.darkSteel, -0.05, 0.36, 0, 1.35, 0.14, 0.42)
    add(body, geo.box, mat.yellow, -0.62, 0.52, 0, 0.32, 0.18, 0.82) // front deck
    add(body, geo.box, mat.black, -0.79, 0.42, 0, 0.04, 0.2, 0.44) // grille
    for (const z of [-0.3, 0.3]) add(body, geo.box, mat.light, -0.8, 0.5, z, 0.02, 0.05, 0.08)
    // Cab (left side) with glass and handrail.
    add(body, geo.box, mat.yellow, -0.6, 0.76, -0.24, 0.26, 0.28, 0.28)
    add(body, geo.box, mat.glass, -0.735, 0.79, -0.24, 0.01, 0.17, 0.24)
    add(body, geo.box, mat.glass, -0.6, 0.79, -0.385, 0.2, 0.17, 0.01)
    add(body, geo.box, mat.black, -0.62, 0.62, 0.41, 0.3, 0.02, 0.02) // rail
    // Exhaust stacks.
    for (const z of [0.12, 0.2]) add(body, geo.cyl8, mat.darkSteel, -0.5, 0.82, z, 0.022, 0.2, 0.022)
    // Dump body: sloped floor, sides, canopy over the cab.
    const tray = new THREE.Group()
    tray.position.set(0.72, 0.5, 0) // hinge at the rear
    body.add(tray)
    const floor = add(tray, geo.box, mat.yellow, -0.55, 0.12, 0, 1.12, 0.06, 0.8)
    floor.rotation.z = -0.1
    add(tray, geo.box, mat.yellowDark, -0.55, 0.33, 0.4, 1.12, 0.42, 0.04)
    add(tray, geo.box, mat.yellowDark, -0.55, 0.33, -0.4, 1.12, 0.42, 0.04)
    add(tray, geo.box, mat.yellow, -1.1, 0.4, 0, 0.05, 0.56, 0.84) // headboard
    add(tray, geo.box, mat.yellow, -1.3, 0.66, -0.05, 0.42, 0.04, 0.9) // canopy
    for (let k = 0; k < 4; k++) add(tray, geo.box, mat.yellowDark, -0.2 - k * 0.25, 0.33, 0.425, 0.03, 0.4, 0.02) // ribs
    // Load (shown when full).
    const load = new THREE.Group()
    tray.add(load)
    for (let k = 0; k < 7; k++) {
      const r = add(load, geo.sphere, mat.ore, -0.25 - (k % 4) * 0.2, 0.33 + (k > 3 ? 0.08 : 0), (k % 2 ? 0.17 : -0.17), 0.2, 0.15, 0.18)
      r.rotation.set(k, k * 2, 0)
    }
    add(load, geo.sphere, mat.ore, -0.55, 0.36, 0, 0.5, 0.18, 0.34)
    // Access ladder and platform handrails beside the cab.
    for (let k = 0; k < 4; k++) add(body, geo.box, mat.darkSteel, -0.78, 0.3 + k * 0.08, -0.34, 0.03, 0.012, 0.14)
    for (const z of [-0.41, -0.27]) add(body, geo.box, mat.darkSteel, -0.78, 0.44, z, 0.02, 0.36, 0.012)
    for (const x of [-0.74, -0.5]) add(body, geo.box, mat.black, x, 0.69, 0.41, 0.012, 0.16, 0.012)
    // Mirrors, bumper, fuel tank, rear lights and mudflaps.
    for (const z of [-0.44, 0.44]) add(body, geo.box, mat.black, -0.74, 0.86, z, 0.02, 0.1, 0.05)
    add(body, geo.box, mat.darkSteel, -0.83, 0.3, 0, 0.06, 0.1, 0.86)
    add(body, geo.cyl, mat.steel, -0.05, 0.3, 0.3, 0.09, 0.3, 0.09).rotation.z = Math.PI / 2
    for (const z of [-0.3, 0.3]) add(body, geo.box, mat.red, 0.74, 0.4, z, 0.02, 0.05, 0.08)
    for (const z of [-0.44, 0.44]) add(body, geo.box, mat.black, 0.72, 0.22, z, 0.02, 0.2, 0.2)
    // Rock ejector bars between the dual rear wheels, and a cab roof beacon.
    const beacon = add(body, geo.box, track(new THREE.MeshStandardMaterial({ color: 0xff9a00, emissive: 0xff8a00, emissiveIntensity: 2 })), -0.6, 0.93, -0.24, 0.07, 0.05, 0.07)
    // Wheels: single front, dual rear.
    const wheels = [
      wheel(body, -0.55, 0.26, 0.42, 0.26, 0.11),
      wheel(body, -0.55, 0.26, -0.42, 0.26, 0.11),
      wheel(body, 0.45, 0.26, 0.38, 0.26, 0.11),
      wheel(body, 0.45, 0.26, 0.5, 0.26, 0.11),
      wheel(body, 0.45, 0.26, -0.38, 0.26, 0.11),
      wheel(body, 0.45, 0.26, -0.5, 0.26, 0.11),
    ]
    return { root, body, tray, load, wheels, beacon, length: 1.7 }
  }

  // -- Hydraulic excavator with articulated boom, stick and bucket -------------
  const excavator = () => {
    const root = new THREE.Group()
    // Undercarriage: two tracks with rollers.
    for (const z of [-0.42, 0.42]) {
      const t = add(root, geo.box, mat.black, 0, 0.16, z, 1.45, 0.3, 0.26)
      t.geometry = geo.box
      for (let k = 0; k < 5; k++) add(root, geo.cyl, mat.darkSteel, -0.55 + k * 0.275, 0.16, z, 0.08, 0.28, 0.08).rotation.x = Math.PI / 2
      for (let k = 0; k < 14; k++) add(root, geo.box, mat.darkSteel, -0.68 + k * 0.105, 0.31, z, 0.07, 0.025, 0.27) // shoes
    }
    add(root, geo.cyl, mat.darkSteel, 0, 0.36, 0, 0.32, 0.1, 0.32) // slew ring
    const house = new THREE.Group()
    house.position.y = 0.42
    root.add(house)
    add(house, geo.box, mat.yellow, -0.2, 0.25, 0, 1.15, 0.42, 0.95)
    add(house, geo.box, mat.yellowDark, -0.85, 0.3, 0, 0.3, 0.46, 0.95) // counterweight
    add(house, geo.box, mat.black, -0.2, 0.47, 0.1, 0.5, 0.04, 0.5) // engine grille
    // Cab with glass.
    add(house, geo.box, mat.yellow, 0.28, 0.6, 0.3, 0.42, 0.45, 0.36)
    add(house, geo.box, mat.glass, 0.495, 0.62, 0.3, 0.01, 0.34, 0.3)
    add(house, geo.box, mat.glass, 0.28, 0.62, 0.485, 0.36, 0.34, 0.01)
    add(house, geo.box, mat.light, 0.5, 0.86, 0.3, 0.03, 0.04, 0.2)
    // Handrails, exhaust, air cleaner and cab roof lights.
    for (const z of [-0.46, 0.1]) add(house, geo.box, mat.black, -0.35, 0.56, z, 0.7, 0.012, 0.012)
    for (const x of [-0.7, -0.35, 0]) add(house, geo.box, mat.black, x, 0.51, -0.46, 0.012, 0.1, 0.012)
    add(house, geo.cyl8, mat.darkSteel, -0.55, 0.62, -0.2, 0.03, 0.3, 0.03)
    add(house, geo.cyl, mat.steel, -0.3, 0.52, -0.25, 0.06, 0.12, 0.06)
    for (const z of [0.2, 0.4]) add(house, geo.box, mat.light, 0.47, 0.88, z, 0.03, 0.04, 0.06)
    add(house, geo.box, mat.black, 0.28, 0.4, 0.49, 0.36, 0.02, 0.02) // cab step
    // Boom → stick → bucket.
    const boom = new THREE.Group()
    boom.position.set(0.35, 0.45, -0.12)
    house.add(boom)
    add(boom, geo.box, mat.yellow, 0.75, 0, 0, 1.55, 0.2, 0.22)
    add(boom, geo.cyl, mat.steel, 0.55, -0.16, 0, 0.04, 0.9, 0.04).rotation.z = Math.PI / 2 // hydraulic ram
    const stick = new THREE.Group()
    stick.position.set(1.5, 0, 0)
    boom.add(stick)
    add(stick, geo.box, mat.yellow, 0, -0.5, 0, 0.16, 1.05, 0.18)
    add(stick, geo.cyl, mat.steel, 0.12, -0.35, 0, 0.03, 0.7, 0.03)
    const bucket = new THREE.Group()
    bucket.position.set(0, -1.02, 0)
    stick.add(bucket)
    add(bucket, geo.box, mat.yellowDark, 0.12, -0.12, 0, 0.36, 0.28, 0.46)
    add(bucket, geo.box, mat.darkSteel, 0.3, -0.27, 0, 0.12, 0.04, 0.46) // teeth bar
    for (let k = 0; k < 5; k++) add(bucket, geo.box, mat.darkSteel, 0.38, -0.27, -0.18 + k * 0.09, 0.06, 0.03, 0.04)
    // Bucket load (visible while carrying).
    const scoop = add(bucket, geo.sphere, mat.ore, 0.12, -0.03, 0, 0.18, 0.1, 0.2)
    return { root, house, boom, stick, bucket, scoop }
  }

  // -- Blast-hole drill rig: tracked base, cab, lattice mast, spinning rod -----
  const drillRig = () => {
    const root = new THREE.Group()
    for (const z of [-0.32, 0.32]) add(root, geo.box, mat.black, 0, 0.12, z, 1.1, 0.22, 0.2)
    add(root, geo.box, mat.yellow, -0.05, 0.36, 0, 1.1, 0.26, 0.75)
    add(root, geo.box, mat.yellow, -0.35, 0.65, 0.18, 0.38, 0.34, 0.36)
    add(root, geo.box, mat.glass, -0.155, 0.67, 0.18, 0.01, 0.24, 0.3)
    const mast = new THREE.Group()
    mast.position.set(0.42, 0.45, -0.05)
    root.add(mast)
    for (const [x, z] of [[-0.06, -0.06], [0.06, -0.06], [-0.06, 0.06], [0.06, 0.06]]) {
      add(mast, geo.box, mat.yellowDark, x, 1.4, z, 0.03, 2.8, 0.03)
    }
    for (let k = 0; k < 12; k++) {
      const b = add(mast, geo.box, mat.yellowDark, 0, 0.15 + k * 0.23, 0.06, 0.15, 0.02, 0.02)
      b.rotation.z = k % 2 ? 0.6 : -0.6
    }
    add(mast, geo.box, mat.darkSteel, 0, 2.85, 0, 0.22, 0.12, 0.22) // crown
    const rod = add(mast, geo.cyl8, mat.steel, 0, 1.2, 0, 0.025, 2.6, 0.025)
    const head = add(mast, geo.box, mat.red, 0, 2.2, 0, 0.16, 0.18, 0.16) // rotary head
    return { root, mast, rod, head }
  }

  return { mat, geo, add, haulTruck, excavator, drillRig, track, dispose: () => disposables.forEach((d) => d.dispose()) }
}

export type Kit = ReturnType<typeof createKit>
