"use client"

import { useFrame } from "@react-three/fiber"
import { useEffect, useMemo, useRef, useState, type ReactNode } from "react"
import * as THREE from "three"

import { Assemble, OneAtATime, canvasTexture, overUi } from "@/components/scene/helpers"
import { software } from "@/lib/content"
import { sound } from "@/lib/sound"
import { zoneIndex } from "@/lib/sections"
import { useWorld } from "@/lib/store"
import { createKit } from "@/three/vehicles"

const HERE = zoneIndex("software")

/**
 * The projects site: each product is an interactive 3D exhibit, shown one at
 * a time on a central plinth.
 */

const SAGE = "#8DAA91"
const yellow = <meshStandardMaterial color="#f0b000" roughness={0.5} />
const dark = <meshStandardMaterial color="#2c3632" roughness={0.6} />

/**
 * MineBook: a whole mine as one connected system. Excavator, drill rig and
 * haul trucks work a benched pit; the site office, crew, workshop and a
 * live dashboard sit on the surface; and every one of them reports to the
 * data mast. Select to change shift.
 */
function MineBookExhibit({ n }: { n: number }) {
  const night = n % 2 === 1
  const S = 0.3 // surface level above the plinth
  const rig = useMemo(() => {
    const kit = createKit()
    const shadow = (o: THREE.Object3D) => o.traverse((c) => (c.castShadow = true))
    const trucks = [0, 1, 2].map(() => {
      const t = kit.haulTruck()
      t.root.scale.setScalar(0.1)
      shadow(t.root)
      return t
    })
    const exc = kit.excavator()
    exc.root.scale.setScalar(0.1)
    exc.root.position.set(0.02, 0.02, 0.02)
    shadow(exc.root)
    const drill = kit.drillRig()
    drill.root.scale.setScalar(0.085)
    drill.root.position.set(-0.1, 0.1, -0.26)
    drill.root.rotation.y = 0.6
    shadow(drill.root)
    const parked = kit.haulTruck()
    parked.root.scale.setScalar(0.1)
    parked.root.position.set(0.8, S, 0.1)
    parked.root.rotation.y = 1.2
    parked.load.visible = false
    shadow(parked.root)
    // Benched pit, cut into the surface: floor, two benches, then the ground.
    const pit = new THREE.LatheGeometry(
      [
        [0, 0.02], [0.2, 0.02], [0.22, 0.1], [0.36, 0.1], [0.38, 0.2], [0.52, 0.2], [0.54, S], [1, S], [1, 0],
      ].map(([r, y]) => new THREE.Vector2(r, y)),
      48,
    )
    const links = new THREE.BufferGeometry()
    links.setAttribute("position", new THREE.BufferAttribute(new Float32Array(8 * 2 * 3), 3))
    return { kit, trucks, exc, drill, parked, pit, links }
  }, [])
  useEffect(
    () => () => {
      rig.kit.dispose()
      rig.pit.dispose()
      rig.links.dispose()
    },
    [rig],
  )
  const hub = useRef<THREE.Mesh>(null!)
  const pulses = useRef<THREE.Group>(null!)
  const bars = useRef<THREE.Group>(null!)
  const alarm = useRef<THREE.Mesh>(null!)
  const windows = useRef<THREE.Group>(null!)
  const HUB = useMemo(() => new THREE.Vector3(-0.6, S + 0.62, -0.55), [S])
  const ends = useMemo(() => [0, 1, 2, 3, 4, 5, 6, 7].map(() => new THREE.Vector3()), [])
  useFrame((state, dt) => {
    const t = state.clock.elapsedTime
    const pace = night ? 0.45 : 1
    // Haul trucks: two on the upper bench, one on the lower.
    rig.trucks.forEach((tr, i) => {
      const r = i === 2 ? 0.29 : 0.45
      const y = i === 2 ? 0.1 : 0.2
      const dir = i === 2 ? -1 : 1
      const a = t * 0.5 * pace * dir + i * Math.PI
      tr.root.position.set(Math.cos(a) * r, y, Math.sin(a) * r)
      tr.root.rotation.y = Math.atan2(-Math.cos(a) * dir, -Math.sin(a) * dir) + Math.PI
      tr.load.visible = i !== 1
      for (const w of tr.wheels) w.rotation.z += dt * 5 * pace
      ends[i].copy(tr.root.position).setY(y + 0.1)
    })
    // The excavator works the floor; the drill turns its rod on the bench.
    rig.exc.house.rotation.y = Math.sin(t * 0.7 * pace) * 1.2
    rig.exc.boom.rotation.z = 0.45 + Math.sin(t * 1.4 * pace) * 0.1
    rig.exc.stick.rotation.z = -0.5
    rig.drill.rod.rotation.y += dt * 8 * pace
    rig.drill.head.position.y = 1.6 + Math.sin(t * 0.8) * 0.6
    ends[3].set(0.02, 0.14, 0.02)
    ends[4].set(-0.1, 0.36, -0.26)
    ends[5].set(0.55, S + 0.3, -0.6) // site office
    ends[6].set(0.8, S + 0.18, 0.1) // workshop
    ends[7].set(-0.82, S + 0.3, 0.12) // dashboard
    // Data links from every asset to the mast, with a pulse travelling up each.
    const arr = rig.links.attributes.position.array as Float32Array
    ends.forEach((e, i) => {
      arr.set([e.x, e.y, e.z, HUB.x, HUB.y, HUB.z], i * 6)
      const k = (t * 0.6 + i * 0.37) % 1
      pulses.current.children[i].position.lerpVectors(e, HUB, k)
    })
    rig.links.attributes.position.needsUpdate = true
    hub.current.rotation.y += dt * 0.8
    const m = hub.current.material as THREE.MeshStandardMaterial
    m.emissiveIntensity += ((night ? 1.8 : 0.8) - m.emissiveIntensity) * 0.1
    // Dashboard bars move with production; the workshop lamp flags downtime.
    bars.current.children.forEach((b, i) => {
      b.scale.y = 0.35 + 0.65 * Math.abs(Math.sin(t * 0.5 * pace + i * 1.3))
      b.position.y = -0.11 + b.scale.y * 0.1
    })
    ;(alarm.current.material as THREE.MeshStandardMaterial).emissiveIntensity = Math.sin(t * 6) > 0 ? 2.5 : 0.1
    windows.current.children.forEach((w) => {
      const wm = (w as THREE.Mesh).material as THREE.MeshStandardMaterial
      wm.emissiveIntensity += ((night ? 1.2 : 0.15) - wm.emissiveIntensity) * 0.1
    })
  })
  const person = (x: number, z: number, hat: string) => (
    <group key={`${x}${z}`} position={[x, S, z]}>
      <mesh position={[0, 0.055, 0]} castShadow>
        <capsuleGeometry args={[0.02, 0.05, 4, 8]} />
        <meshStandardMaterial color="#e2732a" roughness={0.7} />
      </mesh>
      <mesh position={[0, 0.125, 0]}>
        <sphereGeometry args={[0.02, 10, 8]} />
        <meshStandardMaterial color="#c99a78" roughness={0.8} />
      </mesh>
      <mesh position={[0, 0.138, 0]} scale={[1, 0.6, 1]}>
        <sphereGeometry args={[0.024, 10, 8, 0, Math.PI * 2, 0, Math.PI / 2]} />
        <meshStandardMaterial color={hat} roughness={0.5} />
      </mesh>
    </group>
  )
  return (
    <>
      <mesh geometry={rig.pit} receiveShadow castShadow>
        <meshStandardMaterial color="#a8977f" roughness={1} side={THREE.DoubleSide} />
      </mesh>
      {/* Bench floors, a shade darker with depth */}
      {[
        [0, 0.2, 0.021, "#7f715e"],
        [0.22, 0.36, 0.101, "#8d7d68"],
        [0.38, 0.52, 0.201, "#9a8a73"],
      ].map(([a, b, y, c]) => (
        <mesh key={y as number} position={[0, y as number, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
          <ringGeometry args={[a as number, b as number, 48]} />
          <meshStandardMaterial color={c as string} roughness={1} />
        </mesh>
      ))}
      <mesh position={[0, S + 0.001, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <ringGeometry args={[0.54, 1, 48]} />
        <meshStandardMaterial color="#b9c7a8" roughness={1} />
      </mesh>
      {rig.trucks.map((t, i) => (
        <primitive key={i} object={t.root} />
      ))}
      <primitive object={rig.exc.root} />
      <primitive object={rig.drill.root} />
      {/* Site office with the shift crew outside */}
      <group position={[0.55, S, -0.6]} rotation={[0, -0.5, 0]}>
        <mesh position={[0, 0.1, 0]} castShadow>
          <boxGeometry args={[0.36, 0.2, 0.22]} />
          {paper}
        </mesh>
        <mesh position={[0, 0.215, 0]}>
          <boxGeometry args={[0.4, 0.03, 0.26]} />
          <meshStandardMaterial color="#183F35" roughness={0.7} />
        </mesh>
        <group ref={windows}>
          {[-0.1, 0.02, 0.12].map((x) => (
            <mesh key={x} position={[x, 0.11, 0.111]}>
              <planeGeometry args={[0.07, 0.07]} />
              <meshStandardMaterial color="#cfe0d6" emissive="#ffd36b" emissiveIntensity={0.15} />
            </mesh>
          ))}
        </group>
      </group>
      {person(0.36, -0.52, "#f0b000")}
      {person(0.44, -0.44, "#f6f7f3")}
      {person(0.3, -0.62, "#f0b000")}
      {/* Workshop: a truck down for maintenance under a warning lamp */}
      <group position={[0.8, S, 0.1]} rotation={[0, 1.2, 0]}>
        {[-0.13, 0.13].map((z) => (
          <mesh key={z} position={[0, 0.11, z]} castShadow>
            <boxGeometry args={[0.3, 0.22, 0.012]} />
            {steel}
          </mesh>
        ))}
        <mesh position={[0, 0.225, 0]} castShadow>
          <boxGeometry args={[0.32, 0.014, 0.29]} />
          <meshStandardMaterial color="#3b4048" roughness={0.6} />
        </mesh>
      </group>
      <primitive object={rig.parked.root} />
      <mesh ref={alarm} position={[0.8, S + 0.26, 0.1]}>
        <sphereGeometry args={[0.025, 10, 8]} />
        <meshStandardMaterial color="#b5483f" emissive="#ff3b2f" emissiveIntensity={2} />
      </mesh>
      {/* Live dashboard: production bars */}
      <group position={[-0.82, S + 0.2, 0.12]} rotation={[0, 0.9, 0]}>
        <mesh castShadow>
          <boxGeometry args={[0.34, 0.26, 0.02]} />
          {dark}
        </mesh>
        <mesh position={[0, 0, 0.011]}>
          <planeGeometry args={[0.31, 0.23]} />
          <meshBasicMaterial color="#F6F7F3" toneMapped={false} />
        </mesh>
        <group ref={bars} position={[0, 0, 0.013]}>
          {[-0.1, -0.05, 0, 0.05, 0.1].map((x, i) => (
            <mesh key={x} position={[x, 0, 0]}>
              <planeGeometry args={[0.032, 0.2]} />
              <meshBasicMaterial color={i === 3 ? "#b5483f" : i % 2 ? "#8DAA91" : "#183F35"} toneMapped={false} />
            </mesh>
          ))}
        </group>
        <mesh position={[0, -0.17, -0.01]}>
          <cylinderGeometry args={[0.012, 0.012, 0.1, 8]} />
          {steel}
        </mesh>
      </group>
      {/* Data mast: everything on site reports here */}
      <mesh position={[HUB.x, S + 0.28, HUB.z]} castShadow>
        <cylinderGeometry args={[0.012, 0.02, 0.56, 8]} />
        {steel}
      </mesh>
      <mesh ref={hub} position={HUB}>
        <icosahedronGeometry args={[0.1, 1]} />
        <meshStandardMaterial color="#183F35" emissive={SAGE} emissiveIntensity={0.8} wireframe />
      </mesh>
      <lineSegments geometry={rig.links}>
        <lineBasicMaterial color={SAGE} transparent opacity={0.55} />
      </lineSegments>
      <group ref={pulses}>
        {ends.map((_, i) => (
          <mesh key={i}>
            <sphereGeometry args={[0.018, 8, 6]} />
            <meshBasicMaterial color="#dff5e4" toneMapped={false} />
          </mesh>
        ))}
      </group>
      <pointLight position={[HUB.x, HUB.y, HUB.z]} intensity={night ? 3 : 0.6} distance={3} color="#dff5e4" />
    </>
  )
}

/** Fleet Dispatch: trucks on two haul routes. Select to send them all down the other route. */
function FleetExhibit({ n }: { n: number }) {
  const group = useRef<THREE.Group>(null!)
  const blend = useRef(0)
  const routes = useMemo(() => {
    const v = (x: number, z: number) => new THREE.Vector3(x, 0.05, z)
    return [
      new THREE.CatmullRomCurve3([v(-0.8, 0.5), v(-0.3, -0.1), v(0.2, 0.3), v(0.8, -0.5)]),
      new THREE.CatmullRomCurve3([v(-0.8, 0.5), v(-0.4, 0.7), v(0.3, 0.75), v(0.8, 0.45)]),
    ]
  }, [])
  const tubes = useMemo(() => routes.map((c) => new THREE.TubeGeometry(c, 40, 0.03, 6, false)), [routes])
  const p = useMemo(() => new THREE.Vector3(), [])
  const q = useMemo(() => new THREE.Vector3(), [])
  useFrame((state, dt) => {
    blend.current += ((n % 2) - blend.current) * Math.min(1, dt * 2.5)
    group.current.children.forEach((c, i) => {
      const u = (state.clock.elapsedTime * 0.12 + i / 5) % 1
      const home = i % 2
      // Half the fleet normally takes each route; a rebalance moves everyone to the other one.
      const k = home === 0 ? blend.current : 1 - blend.current
      routes[0].getPoint(u, p)
      routes[1].getPoint(u, q)
      c.position.copy(p).lerp(q, k)
    })
  })
  return (
    <>
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <circleGeometry args={[1, 40]} />
        <meshStandardMaterial color="#d9d3c2" roughness={1} />
      </mesh>
      {tubes.map((g, i) => (
        <mesh key={i} geometry={g}>
          <meshStandardMaterial color={i === 0 ? "#183F35" : SAGE} roughness={0.6} />
        </mesh>
      ))}
      {[[-0.8, 0.5, "#2c3632"], [0.8, -0.5, "#b5483f"], [0.8, 0.45, "#8a857c"]].map(([x, z, c], i) => (
        <mesh key={i} position={[x as number, 0.12, z as number]} castShadow>
          <boxGeometry args={[0.18, 0.2, 0.18]} />
          <meshStandardMaterial color={c as string} roughness={0.6} />
        </mesh>
      ))}
      <group ref={group}>
        {[0, 1, 2, 3, 4].map((i) => (
          <mesh key={i} castShadow>
            <boxGeometry args={[0.09, 0.08, 0.09]} />
            {yellow}
          </mesh>
        ))}
      </group>
    </>
  )
}

/** A flat road ribbon of the given width along a list of points. */
function ribbon(pts: THREE.Vector3[], width: number, closed: boolean) {
  const pos: number[] = []
  const idx: number[] = []
  const n = pts.length
  for (let i = 0; i < n; i++) {
    const a = pts[closed ? (i - 1 + n) % n : Math.max(0, i - 1)]
    const b = pts[closed ? (i + 1) % n : Math.min(n - 1, i + 1)]
    const tx = b.x - a.x
    const tz = b.z - a.z
    const l = Math.hypot(tx, tz) || 1
    const sx = (tz / l) * width * 0.5
    const sz = (-tx / l) * width * 0.5
    pos.push(pts[i].x + sx, 0, pts[i].z + sz, pts[i].x - sx, 0, pts[i].z - sz)
  }
  const last = closed ? n : n - 1
  for (let i = 0; i < last; i++) {
    const a = i * 2
    const b = ((i + 1) % n) * 2
    idx.push(a, b, a + 1, a + 1, b, b + 1)
  }
  const g = new THREE.BufferGeometry()
  g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3))
  g.setIndex(idx)
  g.computeVertexNormals()
  return g
}

const CY = { cx: 0, cz: 0.22, a: 0.58, b: 0.36, dump: 4.539 }
const ovalAt = (th: number, out: THREE.Vector3) => out.set(CY.cx - CY.a * Math.cos(th), 0, CY.cz + CY.b * Math.sin(th))

/**
 * Cycle Time Tracking: a working haul cycle. The dump truck reverses under
 * the excavator, is loaded, hauls round the haul road, reverses to the
 * crusher and tips, then returns empty. A stopwatch times each stage.
 * Select to skip to the next stage.
 */
function CycleExhibit({ n }: { n: number }) {
  const rig = useMemo(() => {
    const kit = createKit()
    const truck = kit.haulTruck()
    truck.root.scale.setScalar(0.2)
    truck.root.traverse((o) => (o.castShadow = true))
    const exc = kit.excavator()
    exc.root.scale.setScalar(0.16)
    exc.root.position.set(-0.28, 0, -0.5)
    exc.root.traverse((o) => (o.castShadow = true))
    const oval: THREE.Vector3[] = []
    for (let i = 0; i < 72; i++) oval.push(ovalAt((i / 72) * Math.PI * 2, new THREE.Vector3()))
    const berm = new THREE.CatmullRomCurve3(
      oval.map((p) => new THREE.Vector3(CY.cx + (p.x - CY.cx) * 1.2, 0.012, CY.cz + (p.z - CY.cz) * 1.3)),
      true,
    )
    const pL = ovalAt(0, new THREE.Vector3())
    const pD = ovalAt(CY.dump, new THREE.Vector3())
    // Reversing spurs: off the haul road and back to the loader / the crusher.
    const spurL = new THREE.CatmullRomCurve3([pL, new THREE.Vector3(-0.59, 0, 0.02), new THREE.Vector3(-0.6, 0, -0.3)])
    const spurD = new THREE.CatmullRomCurve3([pD, new THREE.Vector3(0.3, 0, -0.17), new THREE.Vector3(0.56, 0, -0.36)])
    return {
      kit,
      truck,
      exc,
      road: ribbon(oval, 0.17, true),
      roadL: ribbon(spurL.getPoints(16), 0.17, false),
      roadD: ribbon(spurD.getPoints(16), 0.17, false),
      bermGeo: new THREE.TubeGeometry(berm, 90, 0.016, 5, true),
      spurL,
      spurD,
    }
  }, [])
  useEffect(
    () => () => {
      rig.kit.dispose()
      rig.road.dispose()
      rig.roadL.dispose()
      rig.roadD.dispose()
      rig.bermGeo.dispose()
    },
    [rig],
  )
  const st = useRef({ phase: 0, k: 0, yaw: Math.PI / 2, cycle: 0, lastN: n })
  const hand = useRef<THREE.Mesh>(null!)
  const segs = useRef<THREE.Group>(null!)
  const tmp = useMemo(() => ({ p: new THREE.Vector3(), f: new THREE.Vector3() }), [])
  useFrame((state, rawDt) => {
    const dt = Math.min(rawDt, 0.05)
    const s = st.current
    const { truck, exc, spurL, spurD } = rig
    // Phases: 0 reverse to loader, 1 load, 2 pull out, 3 haul, 4 reverse to crusher, 5 tip, 6 pull out, 7 return.
    const rate = [0.8, 0.42, 0.9, 0.2, 0.8, 0.45, 0.9, 0.5][s.phase]
    s.k += dt * rate
    if (n !== s.lastN) {
      s.lastN = n
      s.k = 1
    }
    if (s.k >= 1) {
      s.k = 0
      s.phase = (s.phase + 1) % 8
      if (s.phase === 0) s.cycle = 0
    }
    s.cycle += dt
    const k = s.k
    const ease = k * k * (3 - 2 * k)
    let reversing = false
    if (s.phase <= 2 || (s.phase >= 4 && s.phase <= 6)) {
      const spur = s.phase <= 2 ? spurL : spurD
      const moving = s.phase !== 1 && s.phase !== 5
      const back = s.phase === 0 || s.phase === 4
      const v = !moving ? 1 : back ? ease : 1 - ease
      spur.getPointAt(v, tmp.p)
      spur.getTangentAt(v, tmp.f).negate() // the cab points away from the loader or the crusher
      reversing = back
    } else {
      const th = s.phase === 3 ? ease * CY.dump : CY.dump + ease * (Math.PI * 2 - CY.dump)
      ovalAt(th, tmp.p)
      tmp.f.set(CY.a * Math.sin(th), 0, CY.b * Math.cos(th)).normalize()
    }
    truck.root.position.set(tmp.p.x, 0.012, tmp.p.z)
    const want = Math.atan2(-tmp.f.z, tmp.f.x) + Math.PI
    const diff = ((want - s.yaw + Math.PI * 3) % (Math.PI * 2)) - Math.PI
    s.yaw += THREE.MathUtils.clamp(diff, -3 * dt, 3 * dt)
    truck.root.rotation.y = s.yaw
    truck.beacon.visible = reversing && Math.sin(state.clock.elapsedTime * 14) > 0
    const spin = (s.phase === 1 || s.phase === 5 ? 0 : reversing ? -1 : 1) * dt * 6
    for (const w of truck.wheels) w.rotation.z += spin
    // Loaded from the end of loading until the tray has tipped.
    truck.load.visible = (s.phase === 1 && k > 0.55) || s.phase === 2 || s.phase === 3 || s.phase === 4 || (s.phase === 5 && k < 0.45)
    truck.tray.rotation.z = s.phase === 5 ? -Math.sin(k * Math.PI) * 0.75 : 0
    // The excavator digs at the face and swings over the truck while loading.
    const swing = s.phase === 1 ? 0.5 - 0.5 * Math.cos(k * Math.PI * 4) : 0
    exc.house.rotation.y = THREE.MathUtils.lerp(exc.house.rotation.y, 1.9 + swing * 1.7, Math.min(1, dt * 5))
    exc.boom.rotation.z = 0.45 - swing * 0.15
    exc.stick.rotation.z = -0.5 + swing * 0.25
    exc.scoop.visible = s.phase === 1
    // Stopwatch: the hand sweeps once per cycle and the current stage lights up.
    hand.current.rotation.z = -(s.cycle / 15.5) * Math.PI * 2
    const stage = s.phase <= 2 ? 0 : s.phase === 3 ? 1 : s.phase <= 6 ? 2 : 3
    segs.current.children.forEach((c, i) => {
      const m = (c as THREE.Mesh).material as THREE.MeshStandardMaterial
      m.emissiveIntensity += ((i === stage ? 0.9 : 0) - m.emissiveIntensity) * 0.2
    })
  })
  const gravel = <meshStandardMaterial color="#6b6257" roughness={1} side={THREE.DoubleSide} />
  const rock = <meshStandardMaterial color="#8d8474" roughness={1} flatShading />
  const dial = [
    { len: 0.3, color: SAGE },
    { len: 0.34, color: "#183F35" },
    { len: 0.24, color: "#5d8a6c" },
    { len: 0.12, color: "#a9c2ac" },
  ]
  let turn = Math.PI / 2
  return (
    <>
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <circleGeometry args={[1, 40]} />
        <meshStandardMaterial color="#b8a888" roughness={1} />
      </mesh>
      {/* Haul road with its safety berm, and the two reversing bays */}
      <mesh geometry={rig.road} position={[0, 0.008, 0]} receiveShadow>
        {gravel}
      </mesh>
      <mesh geometry={rig.roadL} position={[0, 0.007, 0]} receiveShadow>
        {gravel}
      </mesh>
      <mesh geometry={rig.roadD} position={[0, 0.007, 0]} receiveShadow>
        {gravel}
      </mesh>
      <mesh geometry={rig.bermGeo}>
        <meshStandardMaterial color="#9a8c74" roughness={1} />
      </mesh>
      {/* The face being dug */}
      <mesh position={[-0.42, 0.1, -0.82]} rotation={[0, 0.25, 0]} castShadow>
        <boxGeometry args={[0.7, 0.2, 0.2]} />
        {rock}
      </mesh>
      <mesh position={[-0.36, 0.26, -0.9]} rotation={[0, 0.25, 0]} castShadow>
        <boxGeometry args={[0.5, 0.14, 0.12]} />
        {rock}
      </mesh>
      {[-0.62, -0.45, -0.2].map((x, i) => (
        <mesh key={x} position={[x, 0.03, -0.66 + i * 0.02]} scale={[0.07, 0.05, 0.06]} rotation={[i, i * 2, 0]}>
          <dodecahedronGeometry args={[1, 0]} />
          {rock}
        </mesh>
      ))}
      <primitive object={rig.exc.root} />
      <primitive object={rig.truck.root} />
      {/* Crusher: tipping hopper, conveyor and stockpile */}
      <group position={[0.74, 0, -0.44]} rotation={[0, 0.6, 0]}>
        <mesh position={[0, 0.07, 0]} castShadow>
          <boxGeometry args={[0.2, 0.14, 0.24]} />
          {dark}
        </mesh>
        <mesh position={[0, 0.16, 0]} castShadow>
          <cylinderGeometry args={[0.16, 0.09, 0.06, 4, 1, true]} />
          <meshStandardMaterial color="#3b4048" roughness={0.6} side={THREE.DoubleSide} />
        </mesh>
        <mesh position={[-0.05, 0.16, -0.26]} rotation={[0.5, 0, 0]} castShadow>
          <boxGeometry args={[0.07, 0.02, 0.5]} />
          {steel}
        </mesh>
        <mesh position={[-0.05, 0.1, -0.52]} castShadow>
          <coneGeometry args={[0.16, 0.2, 14]} />
          {rock}
        </mesh>
      </group>
      {/* Stopwatch for the cycle */}
      <group position={[0.1, 0.62, -0.72]}>
        <mesh position={[0, -0.34, 0]}>
          <cylinderGeometry args={[0.014, 0.014, 0.56, 8]} />
          {steel}
        </mesh>
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.2, 0.2, 0.03, 32]} />
          {paper}
        </mesh>
        <group ref={segs} position={[0, 0, 0.02]}>
          {dial.map((d, i) => {
            const start = turn - d.len * Math.PI * 2
            turn = start
            return (
              <mesh key={i} rotation={[0, 0, start + 0.04]}>
                <torusGeometry args={[0.2, 0.022, 8, 24, d.len * Math.PI * 2 - 0.08]} />
                <meshStandardMaterial color={d.color} emissive={d.color} emissiveIntensity={0} roughness={0.5} />
              </mesh>
            )
          })}
        </group>
        <mesh ref={hand} position={[0, 0, 0.022]}>
          <mesh position={[0, 0.07, 0]}>
            <boxGeometry args={[0.014, 0.15, 0.006]} />
            <meshStandardMaterial color="#b5483f" roughness={0.5} />
          </mesh>
        </mesh>
        <mesh position={[0, 0.235, 0]}>
          <cylinderGeometry args={[0.025, 0.025, 0.04, 10]} />
          {steel}
        </mesh>
      </group>
    </>
  )
}

/** Blast Pattern Design: a bench of drilled holes. Select to fire the pattern in sequence. */
function BlastExhibit({ n }: { n: number }) {
  const holes = useMemo(() => {
    const out: { x: number; z: number; delay: number }[] = []
    for (let r = 0; r < 3; r++) for (let c = 0; c < 5; c++) out.push({ x: -0.6 + c * 0.3 + (r % 2) * 0.15, z: -0.3 + r * 0.3, delay: Math.abs(c - 2) * 0.12 + r * 0.3 })
    return out
  }, [])
  const chips = useRef<THREE.Group>(null!)
  const fired = useRef(-10)
  const last = useRef(0)
  useFrame((state) => {
    if (n !== last.current) {
      last.current = n
      fired.current = state.clock.elapsedTime
    }
    const t = state.clock.elapsedTime - fired.current
    chips.current.children.forEach((c, i) => {
      const k = (t - holes[i].delay) / 0.7
      const live = k > 0 && k < 1
      c.visible = live
      if (live) {
        c.position.y = 0.36 + Math.sin(k * Math.PI) * 0.7
        c.scale.setScalar(0.6 + k)
      }
    })
  })
  return (
    <>
      <mesh position={[0, 0.17, 0]} castShadow receiveShadow>
        <boxGeometry args={[1.7, 0.34, 1.1]} />
        <meshStandardMaterial color="#9a8b78" roughness={1} />
      </mesh>
      {holes.map((h, i) => (
        <mesh key={i} position={[h.x, 0.345, h.z]}>
          <cylinderGeometry args={[0.035, 0.035, 0.02, 10]} />
          <meshStandardMaterial color="#1b1f1d" />
        </mesh>
      ))}
      <group ref={chips}>
        {holes.map((h, i) => (
          <mesh key={i} position={[h.x, 0.36, h.z]} visible={false}>
            <dodecahedronGeometry args={[0.06, 0]} />
            <meshStandardMaterial color="#c9b9a0" roughness={1} flatShading />
          </mesh>
        ))}
      </group>
    </>
  )
}

/**
 * Melbourne Mover: the whole job, played as a loop. A booking reaches the
 * office, a driver is assigned by SMS, opens the job on the driver app,
 * starts it, is tracked live, and the customer is emailed the invoice.
 * Select to jump to the next step. No words on the model: it is told with objects.
 */
function MoverExhibit({ n }: { n: number }) {
  const van = useRef<THREE.Group>(null!)
  const pin = useRef<THREE.Mesh>(null!)
  const msg = useRef<THREE.Mesh>(null!)
  const clock = useRef(0)
  const lastN = useRef(n)
  const [stage, setStage] = useState(0)
  const stageRef = useRef(0)
  const screens = useMemo(
    () =>
      [0, 1, 2, 3, 4, 5].map((k) =>
        canvasTexture(256, 420, (g) => {
          g.fillStyle = "#F6F7F3"
          g.fillRect(0, 0, 256, 420)
          g.fillStyle = "#183F35"
          g.fillRect(0, 0, 256, 84)
          g.fillStyle = "rgba(246,247,243,.85)"
          g.fillRect(18, 34, 120, 18)
          g.fillStyle = "rgba(32,40,36,.45)"
          g.fillRect(18, 126, 190, 14)
          g.fillRect(18, 170, 140, 14)
          // progress dots
          for (let d = 0; d < 6; d++) {
            g.fillStyle = d <= k ? "#183F35" : "rgba(24,63,53,.2)"
            g.beginPath()
            g.arc(38 + d * 36, 260, 9, 0, Math.PI * 2)
            g.fill()
          }
          g.fillStyle = "#8DAA91"
          g.fillRect(18, 320, 220, 60)
        }),
      ),
    [],
  )
  const vanX = useRef(0)
  useFrame((state, dt) => {
    // A click skips to the next step; otherwise the story plays on its own.
    if (n !== lastN.current) {
      lastN.current = n
      clock.current = (Math.floor(clock.current / 3.2) + 1) * 3.2
    }
    clock.current += dt
    const st = Math.floor(clock.current / 3.2) % 6
    const u = (clock.current % 3.2) / 3.2
    if (st !== stageRef.current) {
      stageRef.current = st
      setStage(st)
    }
    // The van waits at the office, drives to the pickup, then to the drop.
    const goal = st < 3 ? 0 : st === 3 ? -0.62 : 0.62
    vanX.current += (goal - vanX.current) * Math.min(1, dt * 1.4)
    van.current.position.x = vanX.current
    van.current.rotation.y = goal < vanX.current - 0.01 ? Math.PI : 0
    pin.current.visible = st === 4
    pin.current.position.set(vanX.current, 0.5 + Math.sin(state.clock.elapsedTime * 3) * 0.04, 0.15)
    // Messages fly out of the office: the SMS to the phone, the invoice to the customer.
    const flying = (st === 1 || st === 5) && u < 0.6
    msg.current.visible = flying
    if (flying) {
      const k = u / 0.6
      const to = st === 1 ? [-0.7, 0.5, 0.6] : [0.62, 0.5, -0.45]
      msg.current.position.set(THREE.MathUtils.lerp(0, to[0], k), 0.6 + Math.sin(k * Math.PI) * 0.35 + (to[1] - 0.6) * k, THREE.MathUtils.lerp(-0.6, to[2], k))
      msg.current.rotation.y = state.clock.elapsedTime * 3
    }
  })
  const house = (x: number, roof: string) => (
    <group position={[x, 0, -0.45]}>
      <mesh position={[0, 0.17, 0]} castShadow>
        <boxGeometry args={[0.42, 0.34, 0.36]} />
        <meshStandardMaterial color="#ece6da" roughness={0.9} />
      </mesh>
      <mesh position={[0, 0.44, 0]} rotation={[0, Math.PI / 4, 0]} scale={[1, 0.6, 0.86]} castShadow>
        <coneGeometry args={[0.36, 0.34, 4]} />
        <meshStandardMaterial color={roof} roughness={0.85} />
      </mesh>
    </group>
  )
  return (
    <>
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <circleGeometry args={[1, 40]} />
        <meshStandardMaterial color="#b9c7a8" roughness={1} />
      </mesh>
      <mesh position={[0, 0.006, 0.15]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[1.7, 0.3]} />
        <meshStandardMaterial color="#5c5f63" roughness={0.9} />
      </mesh>
      {house(-0.62, "#7c4a3a")}
      {house(0.62, "#3d5a4c")}
      {/* The company office, where bookings are taken and jobs assigned */}
      <group position={[0, 0, -0.62]}>
        <mesh position={[0, 0.26, 0]} castShadow>
          <boxGeometry args={[0.46, 0.52, 0.34]} />
          <meshStandardMaterial color="#183F35" roughness={0.7} />
        </mesh>
        {[0.14, 0.34].map((y) =>
          [-0.12, 0.12].map((x) => (
            <mesh key={`${x}${y}`} position={[x, y, 0.172]}>
              <planeGeometry args={[0.14, 0.1]} />
              <meshStandardMaterial color={stage === 0 || stage === 1 || stage === 5 ? "#ffe9a8" : "#cfe0d6"} emissive={stage === 0 || stage === 1 || stage === 5 ? "#ffd36b" : "#000000"} emissiveIntensity={0.6} />
            </mesh>
          )),
        )}
      </group>
      <group ref={van} position={[0, 0, 0.15]}>
        <mesh position={[-0.03, 0.14, 0]} castShadow>
          <boxGeometry args={[0.26, 0.2, 0.16]} />
          <meshStandardMaterial color="#f4f2ec" roughness={0.6} />
        </mesh>
        <mesh position={[0.15, 0.11, 0]} castShadow>
          <boxGeometry args={[0.1, 0.14, 0.15]} />
          <meshStandardMaterial color="#183F35" roughness={0.6} />
        </mesh>
        {[-0.1, 0.13].map((x) => (
          <mesh key={x} position={[x, 0.04, 0]} rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.04, 0.04, 0.18, 12]} />
            {dark}
          </mesh>
        ))}
      </group>
      <mesh ref={pin} rotation={[Math.PI, 0, 0]}>
        <coneGeometry args={[0.06, 0.16, 12]} />
        <meshStandardMaterial color="#b5483f" roughness={0.5} />
      </mesh>
      {/* The SMS or the invoice email on its way */}
      <mesh ref={msg} visible={false}>
        <boxGeometry args={[0.16, 0.11, 0.02]} />
        <meshStandardMaterial color="#F6F7F3" emissive="#F6F7F3" emissiveIntensity={0.4} />
      </mesh>
      {/* The driver's phone */}
      <group position={[-0.7, 0.3, 0.6]} rotation={[-0.3, 0.35, 0]}>
        <mesh castShadow>
          <boxGeometry args={[0.3, 0.5, 0.03]} />
          {dark}
        </mesh>
        <mesh position={[0, 0, 0.016]}>
          <planeGeometry args={[0.27, 0.45]} />
          <meshBasicMaterial map={screens[stage]} toneMapped={false} />
        </mesh>
      </group>
    </>
  )
}

/** Restaurant Management App: a table, a tablet and the order rail. Select to send an order. */
function RestaurantExhibit({ n }: { n: number }) {
  const tickets = useRef<THREE.Group>(null!)
  const plates = useRef<THREE.Group>(null!)
  useFrame(() => {
    // Each order adds a ticket to the rail and a plate to the table (up to four).
    const count = n % 5
    tickets.current.children.forEach((c, i) => {
      const s = c.scale.y + ((i < count ? 1 : 0.001) - c.scale.y) * 0.18
      c.scale.set(1, s, 1)
    })
    plates.current.children.forEach((c, i) => c.scale.setScalar(c.scale.x + ((i < count ? 1 : 0.001) - c.scale.x) * 0.18))
  })
  return (
    <>
      {/* Table */}
      <mesh position={[0, 0.34, 0.15]} castShadow receiveShadow>
        <cylinderGeometry args={[0.55, 0.55, 0.05, 32]} />
        <meshStandardMaterial color="#8a6a4a" roughness={0.7} />
      </mesh>
      <mesh position={[0, 0.17, 0.15]}>
        <cylinderGeometry args={[0.06, 0.1, 0.34, 12]} />
        {dark}
      </mesh>
      <group ref={plates} position={[0, 0.375, 0.15]}>
        {[0, 1, 2, 3].map((i) => (
          <group key={i} position={[Math.cos(i * 1.57 + 0.8) * 0.32, 0, Math.sin(i * 1.57 + 0.8) * 0.32]} scale={0.001}>
            <mesh>
              <cylinderGeometry args={[0.12, 0.1, 0.02, 20]} />
              <meshStandardMaterial color="#f6f7f3" roughness={0.4} />
            </mesh>
            <mesh position={[0, 0.03, 0]}>
              <sphereGeometry args={[0.06, 12, 8, 0, Math.PI * 2, 0, Math.PI / 2]} />
              <meshStandardMaterial color={["#d98a3d", "#6fae7a", "#c4574a", "#e0c070"][i]} roughness={0.7} />
            </mesh>
          </group>
        ))}
      </group>
      {/* Ordering tablet on the table */}
      <group position={[0, 0.5, 0.15]} rotation={[-0.5, 0.5, 0]}>
        <mesh castShadow>
          <boxGeometry args={[0.26, 0.18, 0.015]} />
          {dark}
        </mesh>
        <mesh position={[0, 0, 0.009]}>
          <planeGeometry args={[0.23, 0.15]} />
          <meshStandardMaterial color="#dfeee2" emissive={SAGE} emissiveIntensity={0.6} />
        </mesh>
      </group>
      {/* Kitchen order rail with tickets */}
      <mesh position={[0, 1.05, -0.55]}>
        <boxGeometry args={[1.3, 0.04, 0.04]} />
        <meshStandardMaterial color="#9aa3ab" roughness={0.3} metalness={0.7} />
      </mesh>
      {[-0.6, 0.6].map((x) => (
        <mesh key={x} position={[x, 0.52, -0.55]}>
          <boxGeometry args={[0.04, 1.05, 0.04]} />
          <meshStandardMaterial color="#9aa3ab" roughness={0.3} metalness={0.7} />
        </mesh>
      ))}
      <group ref={tickets} position={[0, 1.03, -0.53]}>
        {[0, 1, 2, 3].map((i) => (
          <group key={i} position={[-0.42 + i * 0.28, 0, 0]} scale={[1, 0.001, 1]}>
            <mesh position={[0, -0.16, 0]}>
              <planeGeometry args={[0.2, 0.32]} />
              <meshStandardMaterial color="#fffdf5" roughness={0.9} side={THREE.DoubleSide} />
            </mesh>
            {[0, 1, 2].map((k) => (
              <mesh key={k} position={[0, -0.08 - k * 0.07, 0.002]}>
                <planeGeometry args={[0.14, 0.02]} />
                <meshBasicMaterial color="#2c3632" />
              </mesh>
            ))}
          </group>
        ))}
      </group>
    </>
  )
}

const steel = <meshStandardMaterial color="#9aa3ab" roughness={0.3} metalness={0.7} />
const paper = <meshStandardMaterial color="#f6f7f3" roughness={0.6} />

/** A simple monitor on a stand, with a canvas-drawn screen. */
function Monitor({ tex, position = [0, 0, 0] as [number, number, number], w = 1.1 }: { tex: THREE.Texture; position?: [number, number, number]; w?: number }) {
  const h = w * 0.62
  return (
    <group position={position}>
      <mesh position={[0, 0.3 + h / 2, 0]} castShadow>
        <boxGeometry args={[w + 0.06, h + 0.06, 0.04]} />
        {dark}
      </mesh>
      <mesh position={[0, 0.3 + h / 2, 0.022]}>
        <planeGeometry args={[w, h]} />
        <meshBasicMaterial map={tex} toneMapped={false} />
      </mesh>
      <mesh position={[0, 0.16, -0.02]}>
        <boxGeometry args={[0.07, 0.3, 0.04]} />
        {steel}
      </mesh>
      <mesh position={[0, 0.015, 0]}>
        <boxGeometry args={[0.42, 0.03, 0.26]} />
        {steel}
      </mesh>
    </group>
  )
}

const MIS_SCREENS: [string, string[]][] = [
  ["Student portal", ["Module selection", "Module purchase", "Payment gateway", "Hostel booking"]],
  ["Admin portal", ["Intake creation", "Semester creation", "Module creation", "Offerings per semester", "Examiners", "Module coordinators"]],
  ["Marks", ["CA marks submission", "Final marks submission", "Marks upload", "Result comparison", "Board of Examination reports"]],
  ["Rules", ["Module eligibility logic", "Performance criteria", "Grade scales", "Per degree programme", "Engineering | Medicine"]],
  ["Access", ["WSO2 Identity Server SSO", "Role-based permissions", "Resource-based permissions"]],
]

/** University MIS: a monitor that pages through the system's modules and their features. Select for the next module. */
function MisExhibit({ n }: { n: number }) {
  const screens = useMemo(
    () =>
      MIS_SCREENS.map(([name, items], k) =>
        canvasTexture(1024, 640, (g) => {
          g.fillStyle = "#F6F7F3"
          g.fillRect(0, 0, 1024, 640)
          g.fillStyle = "#183F35"
          g.fillRect(0, 0, 300, 640)
          g.textBaseline = "middle"
          MIS_SCREENS.forEach(([side], i) => {
            g.fillStyle = i === k ? "#8DAA91" : "rgba(246,247,243,.12)"
            g.beginPath()
            g.roundRect(22, 40 + i * 78, 256, 58, 12)
            g.fill()
            g.fillStyle = i === k ? "#102C25" : "rgba(246,247,243,.85)"
            g.font = "600 31px Inter, system-ui, sans-serif"
            g.fillText(side, 40, 70 + i * 78)
          })
          g.fillStyle = "#102C25"
          g.font = "600 54px 'Space Grotesk', system-ui, sans-serif"
          g.fillText(name, 344, 74)
          items.forEach((item, r) => {
            g.fillStyle = "rgba(16,44,37,.07)"
            g.beginPath()
            g.roundRect(344, 126 + r * 82, 640, 66, 12)
            g.fill()
            g.fillStyle = "#183F35"
            g.beginPath()
            g.arc(380, 159 + r * 82, 12, 0, Math.PI * 2)
            g.fill()
            g.fillStyle = "#202824"
            g.font = "500 40px Inter, system-ui, sans-serif"
            g.fillText(item, 412, 160 + r * 82)
          })
        }),
      ),
    [],
  )
  // The screen pages on its own; a click moves it on at once.
  const [page, setPage] = useState(0)
  const clock = useRef(0)
  const lastN = useRef(n)
  useFrame((_, dt) => {
    clock.current += dt
    if (n !== lastN.current || clock.current > 3.5) {
      lastN.current = n
      clock.current = 0
      setPage((p) => (p + 1) % MIS_SCREENS.length)
    }
  })
  return (
    <>
      <Monitor tex={screens[page]} w={1.75} position={[0.1, 0, -0.15]} />
      {/* A small campus building beside it */}
      <group position={[-0.72, 0, 0.45]} scale={0.34}>
        <mesh position={[0, 0.5, 0]} castShadow>
          <boxGeometry args={[1.6, 1, 1]} />
          <meshStandardMaterial color="#e6dfcf" roughness={0.8} />
        </mesh>
        {[-0.55, 0, 0.55].map((x) => (
          <mesh key={x} position={[x, 0.5, 0.55]}>
            <cylinderGeometry args={[0.07, 0.07, 1, 10]} />
            {paper}
          </mesh>
        ))}
        <mesh position={[0, 1.2, 0.1]} rotation={[0, Math.PI / 4, 0]} scale={[1, 0.4, 0.7]}>
          <coneGeometry args={[1.3, 1, 4]} />
          <meshStandardMaterial color="#7c4a3a" roughness={0.8} />
        </mesh>
      </group>
    </>
  )
}

/** Acorn Travel: a business trip - the flight round a globe, the hotel, local transport and the quotation. Select for a new trip. */
function TravelExhibit({ n }: { n: number }) {
  const plane = useRef<THREE.Group>(null!)
  const orbit = useRef<THREE.Group>(null!)
  useFrame((state, dt) => {
    // Each new trip tilts the flight path to a different route.
    orbit.current.rotation.z += ((n % 4) * 0.45 - 0.6 - orbit.current.rotation.z) * Math.min(1, dt * 2)
    plane.current.rotation.y = state.clock.elapsedTime * 1.3
  })
  return (
    <>
      <mesh position={[0, 0.62, 0]} castShadow>
        <sphereGeometry args={[0.42, 32, 24]} />
        <meshStandardMaterial color="#7fb0bb" roughness={0.5} />
      </mesh>
      {[[0.2, 0.75, 0.3, 0.2], [-0.25, 0.6, 0.28, 0.24], [0.05, 0.42, -0.36, 0.2], [-0.2, 0.85, -0.2, 0.17]].map(([x, y, z, r], i) => (
        <mesh key={i} position={[x, y, z]}>
          <sphereGeometry args={[r, 12, 10]} />
          <meshStandardMaterial color="#6f9a6a" roughness={0.9} />
        </mesh>
      ))}
      <group ref={orbit} position={[0, 0.62, 0]}>
        <group ref={plane}>
          <group position={[0.62, 0, 0]}>
            <mesh rotation={[Math.PI / 2, 0, 0]} castShadow>
              <capsuleGeometry args={[0.035, 0.16, 4, 10]} />
              {paper}
            </mesh>
            <mesh>
              <boxGeometry args={[0.26, 0.012, 0.07]} />
              {paper}
            </mesh>
            <mesh position={[0, 0.03, 0.1]}>
              <boxGeometry args={[0.012, 0.07, 0.05]} />
              <meshStandardMaterial color="#183F35" />
            </mesh>
          </group>
        </group>
      </group>
      <mesh position={[0, 0.04, 0]}>
        <cylinderGeometry args={[0.2, 0.26, 0.08, 24]} />
        {steel}
      </mesh>
      {/* The rest of the trip: a hotel stay, local transport and the quotation */}
      <group position={[-0.68, 0, 0.25]} rotation={[0, 0.4, 0]}>
        <mesh position={[0, 0.2, 0]} castShadow>
          <boxGeometry args={[0.26, 0.4, 0.2]} />
          <meshStandardMaterial color="#ece6da" roughness={0.9} />
        </mesh>
        {[0.1, 0.2, 0.3].map((y) =>
          [-0.07, 0.07].map((x) => (
            <mesh key={`${x}${y}`} position={[x, y, 0.101]}>
              <planeGeometry args={[0.06, 0.05]} />
              <meshStandardMaterial color="#ffe9a8" emissive="#ffd36b" emissiveIntensity={0.5} />
            </mesh>
          )),
        )}
        <mesh position={[0, 0.42, 0]}>
          <boxGeometry args={[0.3, 0.03, 0.24]} />
          <meshStandardMaterial color="#183F35" roughness={0.7} />
        </mesh>
      </group>
      <group position={[0.2, 0, 0.66]} rotation={[0, 0.3, 0]}>
        <mesh position={[0, 0.07, 0]} castShadow>
          <boxGeometry args={[0.28, 0.07, 0.13]} />
          <meshStandardMaterial color="#f0b000" roughness={0.5} />
        </mesh>
        <mesh position={[-0.01, 0.13, 0]} castShadow>
          <boxGeometry args={[0.15, 0.06, 0.12]} />
          <meshStandardMaterial color="#2c3632" roughness={0.3} />
        </mesh>
        {[-0.09, 0.09].map((x) => (
          <mesh key={x} position={[x, 0.035, 0]} rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.035, 0.035, 0.15, 12]} />
            {dark}
          </mesh>
        ))}
      </group>
      <group position={[0.7, 0.2, 0.15]} rotation={[-0.25, -0.5, 0]}>
        <mesh castShadow>
          <boxGeometry args={[0.24, 0.32, 0.012]} />
          {paper}
        </mesh>
        {[0.09, 0.03, -0.03].map((y, i) => (
          <mesh key={y} position={[-0.02 + i * 0.01, y, 0.008]}>
            <planeGeometry args={[0.15 - i * 0.02, 0.022]} />
            <meshStandardMaterial color="#8DAA91" />
          </mesh>
        ))}
        <mesh position={[0.05, -0.1, 0.008]}>
          <planeGeometry args={[0.09, 0.04]} />
          <meshStandardMaterial color="#183F35" />
        </mesh>
      </group>
    </>
  )
}

/** Desktop POS: a till screen with a receipt printer. Select to ring up a sale. */
function PosExhibit({ n }: { n: number }) {
  const receipt = useRef<THREE.Mesh>(null!)
  const len = useRef(0.05)
  const last = useRef(0)
  const screen = useMemo(
    () =>
      canvasTexture(512, 320, (g) => {
        g.fillStyle = "#F6F7F3"
        g.fillRect(0, 0, 512, 320)
        for (let r = 0; r < 3; r++)
          for (let c = 0; c < 4; c++) {
            g.fillStyle = (r + c) % 3 ? "#8DAA91" : "#183F35"
            g.beginPath()
            g.roundRect(18 + c * 82, 20 + r * 96, 70, 82, 10)
            g.fill()
          }
        g.fillStyle = "#102C25"
        g.fillRect(360, 20, 134, 280)
        g.fillStyle = "#F6F7F3"
        for (let i = 0; i < 5; i++) g.fillRect(374, 44 + i * 34, 80 + ((i * 29) % 26), 8)
        g.fillStyle = "#8DAA91"
        g.fillRect(374, 250, 106, 34)
      }),
    [],
  )
  useFrame((_, dt) => {
    if (n !== last.current) {
      last.current = n
      len.current = 0.05
    }
    // The receipt feeds out of the printer after each sale.
    len.current = Math.min(0.55, len.current + dt * 0.5)
    receipt.current.scale.y = len.current
    receipt.current.position.y = 0.26 + len.current * 0.5
  })
  return (
    <>
      <Monitor tex={screen} w={1.15} position={[-0.2, 0, -0.1]} />
      <mesh position={[0.72, 0.13, 0.2]} castShadow>
        <boxGeometry args={[0.36, 0.26, 0.4]} />
        {dark}
      </mesh>
      <mesh ref={receipt} position={[0.72, 0.3, 0.2]}>
        <planeGeometry args={[0.24, 1]} />
        <meshStandardMaterial color="#fffdf5" roughness={0.9} side={THREE.DoubleSide} />
      </mesh>
      <mesh position={[-0.2, 0.05, 0.45]} castShadow>
        <boxGeometry args={[0.7, 0.1, 0.4]} />
        {steel}
      </mesh>
    </>
  )
}

/** ChinaBridge: a bridge between two shores. Select to send a delivery across. */
function BridgeExhibit({ n }: { n: number }) {
  const crate = useRef<THREE.Mesh>(null!)
  const pos = useRef(0)
  useFrame((_, dt) => {
    pos.current += ((n % 2) - pos.current) * Math.min(1, dt * 1.4)
    const x = -0.72 + pos.current * 1.44
    crate.current.position.set(x, 0.52 + Math.sin(pos.current * Math.PI) * 0.16, 0)
  })
  return (
    <>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0]}>
        <circleGeometry args={[1, 40]} />
        <meshStandardMaterial color="#7fb0bb" roughness={0.4} />
      </mesh>
      {[-0.78, 0.78].map((x, i) => (
        <mesh key={x} position={[x, 0.18, 0]} castShadow>
          <boxGeometry args={[0.44, 0.36, 0.9]} />
          <meshStandardMaterial color={i ? "#b9c7a8" : "#d9cdb8"} roughness={0.9} />
        </mesh>
      ))}
      <mesh position={[0, 0.36, 0]} rotation={[Math.PI / 2, 0, 0]} scale={[1, 0.3, 1]}>
        <torusGeometry args={[0.6, 0.05, 10, 32, Math.PI]} />
        <meshStandardMaterial color="#b5483f" roughness={0.6} />
      </mesh>
      <mesh position={[0, 0.38, 0]}>
        <boxGeometry args={[1.3, 0.04, 0.28]} />
        <meshStandardMaterial color="#b5483f" roughness={0.6} />
      </mesh>
      {[-0.3, 0, 0.3].map((x) => (
        <mesh key={x} position={[x, 0.2, 0]}>
          <boxGeometry args={[0.05, 0.36, 0.2]} />
          <meshStandardMaterial color="#8c3a33" roughness={0.7} />
        </mesh>
      ))}
      <mesh ref={crate} castShadow>
        <boxGeometry args={[0.16, 0.14, 0.14]} />
        {yellow}
      </mesh>
    </>
  )
}

/** Local business apps: four phones, one per experiment. Select to switch. */
function LocalAppsExhibit({ n }: { n: number }) {
  const group = useRef<THREE.Group>(null!)
  const colors = ["#7fb0bb", "#d98aa0", "#e0c070", "#6fae7a"] // laundry, salon, school, clinic
  useFrame((_, dt) => {
    group.current.children.forEach((c, i) => {
      const on = i === n % 4
      c.position.y += ((on ? 0.62 : 0.42) - c.position.y) * Math.min(1, dt * 6)
      c.scale.setScalar(c.scale.x + ((on ? 1.25 : 1) - c.scale.x) * Math.min(1, dt * 6))
    })
  })
  return (
    <group ref={group}>
      {colors.map((c, i) => (
        <group key={c} position={[-0.66 + i * 0.44, 0.42, 0]} rotation={[-0.2, 0, 0]}>
          <mesh castShadow>
            <boxGeometry args={[0.32, 0.6, 0.035]} />
            {dark}
          </mesh>
          <mesh position={[0, 0, 0.019]}>
            <planeGeometry args={[0.28, 0.55]} />
            <meshStandardMaterial color="#f6f7f3" roughness={0.4} />
          </mesh>
          <mesh position={[0, 0.12, 0.021]}>
            <circleGeometry args={[0.09, 24]} />
            <meshStandardMaterial color={c} roughness={0.5} />
          </mesh>
          {[0, 1, 2].map((k) => (
            <mesh key={k} position={[0, -0.05 - k * 0.07, 0.021]}>
              <planeGeometry args={[0.2 - k * 0.03, 0.03]} />
              <meshStandardMaterial color={c} roughness={0.5} transparent opacity={0.6} />
            </mesh>
          ))}
        </group>
      ))}
    </group>
  )
}

const EXHIBITS: Record<string, (p: { n: number }) => ReactNode> = {
  mis: MisExhibit,
  "acorn-travel": TravelExhibit,
  pos: PosExhibit,
  chinabridge: BridgeExhibit,
  "local-apps": LocalAppsExhibit,
  "melbourne-mover": MoverExhibit,
  restaurant: RestaurantExhibit,
  minebook: MineBookExhibit,
  "fleet-dispatch": FleetExhibit,
  "cycle-time": CycleExhibit,
  "blast-pattern": BlastExhibit,
}

/**
 * One plinth, one project at a time. Scrolling steps through the projects;
 * selecting the exhibit plays its interaction.
 */
export default function SoftwareWorld() {
  const sub = useWorld((s) => s.sub)
  const active = useWorld((s) => s.active === HERE)
  const [clicks, setClicks] = useState<number[]>(() => software.map(() => 0))
  const index = active ? Math.min(sub, software.length - 1) : 0
  const hover = useRef(false)
  const top = useRef<THREE.Group>(null!)
  const ring = useRef<THREE.Mesh>(null!)
  const tag = useRef<THREE.Mesh>(null!)
  // A name sign for each project, shown above the exhibit on the plinth.
  const signs = useMemo(
    () =>
      software.map((p) =>
        canvasTexture(1024, 256, (g) => {
          g.clearRect(0, 0, 1024, 256)
          g.fillStyle = "#183F35"
          g.beginPath()
          g.roundRect(8, 8, 1008, 240, 60)
          g.fill()
          g.textAlign = "center"
          g.textBaseline = "middle"
          g.fillStyle = "#F6F7F3"
          g.font = "600 84px 'Space Grotesk', system-ui, sans-serif"
          g.fillText(p.title.replace(" Management App", "").replace(" Business Apps", " apps"), 512, 132)
        }),
      ),
    [],
  )
  useFrame((state) => {
    const t = state.clock.elapsedTime
    const k = hover.current && active ? 1 : 0
    top.current.scale.setScalar(top.current.scale.x + (2.1 + k * 0.12 - top.current.scale.x) * 0.15)
    const m = ring.current.material as THREE.MeshBasicMaterial
    m.opacity += ((active ? 0.45 + 0.3 * Math.sin(t * 2.4) + k * 0.25 : 0.15) - m.opacity) * 0.15
    tag.current.quaternion.copy(state.camera.quaternion)
    ;(tag.current.material as THREE.MeshBasicMaterial).map = signs[index]
    tag.current.scale.setScalar(1 + k * 0.1 + Math.sin(t * 2.4) * 0.03)
  })
  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <circleGeometry args={[9, 64]} />
        <meshStandardMaterial color="#e9eadf" roughness={0.9} />
      </mesh>
      {[3.4, 6.6].map((r) => (
        <mesh key={r} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.012, 0]}>
          <ringGeometry args={[r, r + 0.05, 96]} />
          <meshBasicMaterial color="#183F35" transparent opacity={0.35} />
        </mesh>
      ))}
      <Assemble world="software" order={0} position={[-0.6, 0, -0.8]}>
        <group
          onClick={(e) => {
            if (!active || overUi(e)) return
            e.stopPropagation()
            sound.click()
            setClicks((c) => c.map((v, i) => (i === index ? v + 1 : v)))
          }}
          onPointerOver={() => {
            hover.current = true
            if (active) document.body.style.cursor = "pointer"
          }}
          onPointerOut={() => {
            hover.current = false
            document.body.style.cursor = ""
          }}
        >
          <mesh position={[0, 0.4, 0]} castShadow receiveShadow>
            <cylinderGeometry args={[2.3, 2.5, 0.8, 48]} />
            <meshStandardMaterial color="#f1efe8" roughness={0.7} />
          </mesh>
          <mesh ref={ring} position={[0, 0.805, 0]} rotation={[-Math.PI / 2, 0, 0]}>
            <ringGeometry args={[2.18, 2.3, 64]} />
            <meshBasicMaterial color="#183F35" transparent opacity={0.2} />
          </mesh>
          <group ref={top} position={[0, 0.84, 0]} scale={2.1}>
            <OneAtATime index={index}>
              {software.map((p, i) => {
                const Body = EXHIBITS[p.id]
                return <Body key={p.id} n={clicks[i]} />
              })}
            </OneAtATime>
          </group>
          {/* Invisible volume so the whole exhibit is easy to hit */}
          <mesh position={[0, 2.2, 0]} visible={false}>
            <cylinderGeometry args={[2.3, 2.3, 3.6, 12]} />
          </mesh>
        </group>
        <mesh ref={tag} position={[0, 4.7, 0]} renderOrder={6}>
          <planeGeometry args={[3, 0.75]} />
          <meshBasicMaterial map={signs[0]} transparent toneMapped={false} depthWrite={false} />
        </mesh>
      </Assemble>
    </group>
  )
}
