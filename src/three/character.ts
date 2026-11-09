import * as THREE from "three"

/**
 * Anjana, modelled from his portrait: medium-brown skin, short dense curly
 * black hair, a short full beard, navy two-button suit, white shirt, navy
 * patterned tie, brown belt and shoes, wristwatch on the left wrist.
 *
 * The body is a jointed rig (pelvis → spine → chest → neck → head, shoulders
 * → elbows → wrists, hips → knees → ankles) animated by a procedural gait
 * that is driven by real ground speed, so the feet do not slide.
 */

export interface CharacterPose {
  /** Ground speed in world units / second. */
  speed: number
  /** Signed turn rate (rad/s) — the body leans into turns. */
  turn: number
  /** Forward acceleration — the body leans with it. */
  accel: number
  /** Seconds since start, for idle motion. */
  time: number
  /** World-space point the head should look toward when standing. */
  lookAt?: THREE.Vector3
  /** 0..1 how airborne (falling off a ledge). */
  air: number
}

export interface Character {
  root: THREE.Group
  /** Height of the top of the head above the feet, in world units. */
  height: number
  stride: number
  update: (dt: number, pose: CharacterPose) => void
  dispose: () => void
}

type Mat = THREE.MeshStandardMaterial

export function createCharacter(): Character {
  const disposables: { dispose: () => void }[] = []
  const track = <T extends { dispose: () => void }>(x: T) => (disposables.push(x), x)

  // -- Materials ------------------------------------------------------------
  const m = (color: number, roughness = 0.7, extra: Partial<THREE.MeshStandardMaterialParameters> = {}): Mat =>
    track(new THREE.MeshStandardMaterial({ color, roughness, ...extra }))
  const skin = m(0x8d5638, 0.55)
  const skinShade = m(0x7a4a30, 0.6)
  const suit = m(0x18213a, 0.62)
  const suitEdge = m(0x111830, 0.6)
  const shirt = m(0xf4f6f9, 0.5)
  const tieMat = m(0x24345e, 0.45)
  const tieDot = m(0x8a9cc8, 0.5)
  const hair = m(0x0f0b09, 0.85)
  const hair2 = m(0x1c1410, 0.85)
  const leather = m(0x4a2c18, 0.35)
  const sole = m(0x1a120c, 0.8)
  const gold = m(0xc9a24a, 0.3, { metalness: 0.9 })
  const eyeWhite = m(0xf2efe9, 0.3)
  const iris = m(0x2a1a10, 0.2)
  const pupil = m(0x050403, 0.1)
  const lip = m(0x6b3a2a, 0.5)
  const tablet = m(0x16181c, 0.25, { metalness: 0.4 })
  const screen = m(0x2f7bff, 0.2, { emissive: 0x2f7bff, emissiveIntensity: 0.6 })

  // -- Geometry -------------------------------------------------------------
  const sphere = track(new THREE.SphereGeometry(1, 24, 18))
  const capsule = (r: number, len: number) => track(new THREE.CapsuleGeometry(r, len, 6, 14))
  const box = track(new THREE.BoxGeometry(1, 1, 1))
  const cyl = track(new THREE.CylinderGeometry(1, 1, 1, 18))

  const mesh = (geo: THREE.BufferGeometry, mat: THREE.Material, parent: THREE.Object3D, x = 0, y = 0, z = 0, sx = 1, sy = 1, sz = 1) => {
    const o = new THREE.Mesh(geo, mat)
    o.position.set(x, y, z)
    o.scale.set(sx, sy, sz)
    o.castShadow = true
    parent.add(o)
    return o
  }
  const joint = (parent: THREE.Object3D, x = 0, y = 0, z = 0) => {
    const g = new THREE.Group()
    g.position.set(x, y, z)
    parent.add(g)
    return g
  }

  // Real proportions (≈ 7.5 heads tall). Units: metres, scaled at the end.
  const root = new THREE.Group()
  const pelvis = joint(root, 0, 0.98, 0)

  // Hips & trousers ----------------------------------------------------------
  mesh(sphere, suit, pelvis, 0, 0, 0, 0.17, 0.12, 0.11)
  mesh(box, leather, pelvis, 0, 0.07, 0, 0.33, 0.035, 0.21) // belt
  mesh(box, gold, pelvis, 0, 0.07, 0.106, 0.035, 0.03, 0.006) // buckle

  const legs = [-1, 1].map((side) => {
    const hip = joint(pelvis, side * 0.095, -0.03, 0)
    mesh(capsule(0.072, 0.34), suit, hip, 0, -0.22, 0) // thigh
    const knee = joint(hip, 0, -0.45, 0)
    mesh(capsule(0.058, 0.36), suit, knee, 0, -0.22, 0) // shin
    mesh(cyl, suitEdge, knee, 0, -0.42, 0.005, 0.064, 0.02, 0.064) // trouser hem
    const ankle = joint(knee, 0, -0.45, 0)
    const shoe = joint(ankle, 0, -0.045, 0.045)
    mesh(capsule(0.046, 0.15), leather, shoe, 0, 0, 0).rotation.x = Math.PI / 2
    mesh(box, sole, shoe, 0, -0.04, 0.005, 0.095, 0.02, 0.27)
    return { hip, knee, ankle }
  })

  // Torso ----------------------------------------------------------------------
  const spine = joint(pelvis, 0, 0.09, 0)
  // Shirt torso, jacket over it (slightly larger), open at the front.
  mesh(capsule(0.15, 0.22), shirt, spine, 0, 0.2, 0, 1.05, 1, 0.78)
  const jacket = mesh(capsule(0.162, 0.24), suit, spine, 0, 0.19, -0.012, 1.08, 1, 0.8)
  jacket.scale.set(1.08, 1, 0.8)
  // Jacket skirt below the waist.
  mesh(track(new THREE.CylinderGeometry(0.17, 0.19, 0.2, 20, 1, true)), suit, spine, 0, -0.05, -0.005, 1, 1, 0.74)
  // Lapels: two angled panels meeting at the button.
  for (const side of [-1, 1]) {
    const lapel = mesh(box, suitEdge, spine, side * 0.055, 0.3, 0.118, 0.06, 0.22, 0.012)
    lapel.rotation.z = side * -0.32
    lapel.rotation.y = side * 0.18
  }
  mesh(sphere, suitEdge, spine, 0, 0.13, 0.126, 0.012, 0.012, 0.006) // button
  // Shirt collar and tie.
  for (const side of [-1, 1]) {
    const collar = mesh(box, shirt, spine, side * 0.035, 0.425, 0.08, 0.06, 0.035, 0.012)
    collar.rotation.z = side * 0.6
  }
  mesh(box, tieMat, spine, 0, 0.405, 0.1, 0.034, 0.03, 0.02) // knot
  const tie = mesh(box, tieMat, spine, 0, 0.27, 0.118, 0.045, 0.24, 0.01)
  tie.rotation.x = -0.06
  for (let i = 0; i < 5; i++) mesh(box, tieDot, spine, (i % 2 ? 0.01 : -0.01), 0.36 - i * 0.045, 0.124, 0.006, 0.006, 0.004)
  // Pocket square line and pocket flaps.
  mesh(box, suitEdge, spine, -0.1, 0.02, 0.135, 0.07, 0.012, 0.01)
  mesh(box, suitEdge, spine, 0.1, 0.02, 0.135, 0.07, 0.012, 0.01)

  // Arms -----------------------------------------------------------------------
  const arms = [-1, 1].map((side) => {
    const shoulder = joint(spine, side * 0.205, 0.38, -0.01)
    mesh(sphere, suit, shoulder, 0, 0, 0, 0.068, 0.06, 0.066) // shoulder pad
    mesh(capsule(0.052, 0.22), suit, shoulder, 0, -0.15, 0)
    const elbow = joint(shoulder, 0, -0.3, 0)
    mesh(capsule(0.045, 0.2), suit, elbow, 0, -0.13, 0)
    mesh(cyl, shirt, elbow, 0, -0.26, 0, 0.04, 0.02, 0.04) // shirt cuff
    const wrist = joint(elbow, 0, -0.285, 0)
    // Hand: palm, thumb and closed-ish fingers.
    mesh(sphere, skin, wrist, 0, -0.045, 0.005, 0.034, 0.05, 0.022)
    mesh(capsule(0.012, 0.035), skin, wrist, side * -0.028, -0.04, 0.018).rotation.z = side * 0.6
    for (let f = 0; f < 4; f++) mesh(capsule(0.0095, 0.04), skinShade, wrist, (f - 1.5) * 0.016 * -side, -0.1, 0.008)
    return { shoulder, elbow, wrist }
  })
  // Wristwatch on the left wrist.
  mesh(cyl, gold, arms[0].wrist, 0, 0.005, 0, 0.042, 0.018, 0.042)
  mesh(cyl, track(new THREE.MeshStandardMaterial({ color: 0xe8e2d0, roughness: 0.2 })), arms[0].wrist, 0, 0.005, 0.038, 0.016, 0.004, 0.016).rotation.x = Math.PI / 2
  // Tablet in the left hand.
  const pad = joint(arms[0].wrist, 0.02, -0.09, 0.04)
  mesh(box, tablet, pad, 0, 0, 0, 0.17, 0.235, 0.012)
  mesh(box, screen, pad, 0, 0, 0.0065, 0.15, 0.21, 0.001)
  pad.rotation.set(-1.1, 0, 0.1)

  // Neck & head ----------------------------------------------------------------
  const neck = joint(spine, 0, 0.45, 0)
  mesh(cyl, skin, neck, 0, 0.04, 0, 0.055, 0.1, 0.055)
  const head = joint(neck, 0, 0.1, 0.005)
  // Skull and face (slightly long oval), jaw.
  mesh(sphere, skin, head, 0, 0.1, 0, 0.098, 0.122, 0.11)
  mesh(sphere, skin, head, 0, 0.035, 0.03, 0.082, 0.07, 0.08) // jaw / cheeks
  // Ears.
  for (const side of [-1, 1]) {
    mesh(sphere, skinShade, head, side * 0.097, 0.09, -0.005, 0.016, 0.03, 0.022)
  }
  // Eyes: sclera, iris, pupil; eyebrows.
  for (const side of [-1, 1]) {
    mesh(sphere, eyeWhite, head, side * 0.036, 0.11, 0.093, 0.016, 0.011, 0.008)
    mesh(sphere, iris, head, side * 0.036, 0.11, 0.1, 0.008, 0.008, 0.003)
    mesh(sphere, pupil, head, side * 0.036, 0.11, 0.103, 0.004, 0.004, 0.002)
    const brow = mesh(box, hair, head, side * 0.038, 0.136, 0.098, 0.036, 0.008, 0.008)
    brow.rotation.z = side * -0.12
  }
  // Nose.
  const nose = mesh(sphere, skin, head, 0, 0.085, 0.108, 0.016, 0.03, 0.018)
  nose.rotation.x = 0.25
  mesh(sphere, skinShade, head, 0, 0.068, 0.112, 0.02, 0.01, 0.012)
  // Beard: short full beard over jaw and chin, moustache, smile.
  const beardGeo = track(new THREE.SphereGeometry(1, 28, 16, 0, Math.PI * 2, Math.PI * 0.52, Math.PI * 0.4))
  const beard = mesh(beardGeo, hair2, head, 0, 0.075, 0.012, 0.094, 0.11, 0.103)
  beard.rotation.x = -0.2
  mesh(box, hair, head, 0, 0.058, 0.108, 0.052, 0.009, 0.01) // moustache
  mesh(box, lip, head, 0, 0.044, 0.107, 0.034, 0.007, 0.008) // lower lip
  mesh(box, shirt, head, 0, 0.05, 0.108, 0.028, 0.004, 0.004) // smile (teeth)
  mesh(sphere, hair2, head, 0, 0.012, 0.085, 0.03, 0.02, 0.02) // chin tuft
  // Hair: short, dense, curly — many tight curls on a cap, fading at the sides.
  {
    const curl = track(new THREE.IcosahedronGeometry(1, 1))
    const curls = new THREE.InstancedMesh(curl, hair, 240)
    curls.castShadow = true
    const mat4 = new THREE.Matrix4()
    const q = new THREE.Quaternion()
    let n = 0
    for (let i = 0; i < 400 && n < 240; i++) {
      // Fibonacci sphere points over the upper skull.
      const y = 1 - (i / 399) * 1.1
      const r = Math.sqrt(Math.max(0, 1 - y * y))
      const phi = i * 2.399963
      const x = Math.cos(phi) * r
      const z = Math.sin(phi) * r
      if (y < 0.15 && z > 0.25) continue // forehead / hairline
      if (y < -0.05) continue
      if (y < 0.35 && z > 0.55) continue
      const lift = 1 + 0.06 * Math.sin(i * 1.7)
      const pos = new THREE.Vector3(x * 0.104 * lift, 0.13 + y * 0.115 * lift + 0.015, z * 0.112 * lift - 0.008)
      const s = 0.016 + ((i * 37) % 7) * 0.0012
      q.setFromEuler(new THREE.Euler(i, i * 0.5, i * 0.3))
      mat4.compose(pos, q, new THREE.Vector3(s, s, s))
      curls.setMatrixAt(n++, mat4)
    }
    curls.count = n
    head.add(curls)
    disposables.push(curls)
    // A dark cap under the curls so no scalp shows through.
    mesh(sphere, hair, head, 0, 0.145, -0.012, 0.102, 0.09, 0.11)
  }

  // Scale to the island: a little larger than life so he reads at distance.
  const SCALE = 1.35
  root.scale.setScalar(SCALE)
  root.traverse((o) => {
    if ((o as THREE.Mesh).isMesh) (o as THREE.Mesh).receiveShadow = false
  })

  // -- Gait -----------------------------------------------------------------
  const LEG = 0.9 // hip height (m)
  const strideWalk = 0.75 // metres per step at walking pace
  let phase = 0
  let blink = 0
  let breathe = 0
  const lookQ = new THREE.Quaternion()
  const tmp = new THREE.Vector3()

  const update = (dt: number, pose: CharacterPose) => {
    const speed = pose.speed / SCALE // body-relative m/s
    // Walk (≤1.6 m/s) blends into run (≥2.6 m/s).
    const run = THREE.MathUtils.smoothstep(speed, 1.6, 2.6)
    const moving = THREE.MathUtils.smoothstep(speed, 0.05, 0.35)
    const stride = THREE.MathUtils.lerp(strideWalk, 1.15, run)
    phase += (speed / stride) * Math.PI * dt

    const s = Math.sin(phase)
    const c = Math.cos(phase)
    const A = THREE.MathUtils.lerp(0.42, 0.75, run) * moving // thigh swing
    const K = THREE.MathUtils.lerp(0.75, 1.5, run) * moving // swing-knee flexion

    legs.forEach((leg, i) => {
      const p = i === 0 ? phase : phase + Math.PI
      const sp = Math.sin(p)
      const cp = Math.cos(p)
      // Swing phase when the thigh is moving forward (cos > 0): knee bends.
      const swing = Math.max(0, cp)
      const stance = Math.max(0, -cp)
      leg.hip.rotation.x = -A * sp - pose.air * 0.5
      leg.knee.rotation.x = K * Math.pow(swing, 1.4) + 0.08 * moving * stance + pose.air * 0.9
      // Ankle keeps the sole roughly level; toe-off at the end of stance.
      leg.ankle.rotation.x = -(leg.hip.rotation.x + leg.knee.rotation.x) * 0.85 + 0.25 * moving * Math.max(0, -sp) * stance
      leg.hip.rotation.z = (i === 0 ? 1 : -1) * 0.02
    })

    // Pelvis: highest at mid-stance, small lateral sway, yaw with the stride.
    const bob = moving * (0.025 + run * 0.03)
    pelvis.position.y = LEG + 0.08 + bob * Math.cos(2 * phase) - run * 0.05 - pose.air * 0.06
    pelvis.position.x = moving * 0.022 * s * (1 - run)
    pelvis.rotation.y = moving * 0.09 * s
    pelvis.rotation.z = moving * 0.03 * c

    // Spine counter-rotates; lean into acceleration and turns.
    const lean = THREE.MathUtils.clamp(pose.accel * 0.05, -0.12, 0.18) + run * 0.18
    spine.rotation.y = -pelvis.rotation.y * 1.4
    spine.rotation.x = THREE.MathUtils.lerp(spine.rotation.x, lean, 1 - Math.pow(0.002, dt))
    spine.rotation.z = THREE.MathUtils.lerp(spine.rotation.z, -THREE.MathUtils.clamp(pose.turn * 0.08, -0.15, 0.15), 1 - Math.pow(0.01, dt))

    // Breathing when standing.
    breathe += dt
    const chestRise = (1 - moving) * Math.sin(breathe * 1.6) * 0.006
    spine.position.y = 0.09 + chestRise

    // Arms swing opposite to the legs; elbows bend more when running.
    arms.forEach((arm, i) => {
      const p = i === 0 ? phase + Math.PI : phase
      const holdTablet = i === 0
      const swingArm = -Math.sin(p) * THREE.MathUtils.lerp(0.4, 0.9, run) * moving
      const idleArm = holdTablet ? -0.55 : 0.04 + Math.sin(pose.time * 0.9) * 0.03
      arm.shoulder.rotation.x = THREE.MathUtils.lerp(idleArm, swingArm + (holdTablet ? -0.25 : 0), moving)
      arm.shoulder.rotation.z = (i === 0 ? 1 : -1) * -0.08
      const elbowIdle = holdTablet ? -1.25 : -0.18
      arm.elbow.rotation.x = THREE.MathUtils.lerp(elbowIdle, -0.25 - run * 1.1 - Math.max(0, -Math.sin(p)) * 0.3, moving)
    })

    // Head: steady while walking (counter-bob), looks toward the camera when idle.
    neck.rotation.x = -spine.rotation.x * 0.6
    if (pose.lookAt && moving < 0.5) {
      head.getWorldPosition(tmp)
      const local = head.parent!.worldToLocal(pose.lookAt.clone())
      const yaw = THREE.MathUtils.clamp(Math.atan2(local.x, local.z), -0.7, 0.7)
      const pitch = THREE.MathUtils.clamp(-Math.atan2(local.y - head.position.y, Math.hypot(local.x, local.z)) * 0.5, -0.3, 0.2)
      lookQ.setFromEuler(new THREE.Euler(pitch, yaw, 0))
    } else {
      lookQ.identity()
    }
    head.quaternion.slerp(lookQ, 1 - Math.pow(0.02, dt))

    // Blink.
    blink -= dt
    if (blink < -0.12) blink = 2.5 + Math.random() * 3
  }

  return {
    root,
    height: 1.82 * SCALE,
    stride: strideWalk * SCALE,
    update,
    dispose: () => disposables.forEach((d) => d.dispose()),
  }
}
