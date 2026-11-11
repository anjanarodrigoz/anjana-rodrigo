"use client"

import { useFrame } from "@react-three/fiber"
import { useMemo, useRef, useState, type ReactNode } from "react"
import * as THREE from "three"

import { Assemble, OneAtATime, canvasTexture, overUi } from "@/components/scene/helpers"
import { software } from "@/lib/content"
import { sound } from "@/lib/sound"
import { zoneIndex } from "@/lib/sections"
import { useWorld } from "@/lib/store"

const HERE = zoneIndex("software")

/**
 * The projects site: each product is an interactive 3D exhibit, shown one at
 * a time on a central plinth.
 */

const SAGE = "#8DAA91"
const yellow = <meshStandardMaterial color="#f0b000" roughness={0.5} />
const dark = <meshStandardMaterial color="#2c3632" roughness={0.6} />

/** MineBook: a little pit with trucks circling under a data hub. Select to change shift. */
function MineBookExhibit({ n }: { n: number }) {
  const trucks = useRef<THREE.Group>(null!)
  const hub = useRef<THREE.Mesh>(null!)
  const night = n % 2 === 1
  useFrame((state, dt) => {
    trucks.current.children.forEach((c, i) => {
      const r = 0.75 - i * 0.2
      const a = state.clock.elapsedTime * (night ? 0.5 : 1.1) * (i % 2 ? 1 : -1) + i * 2
      c.position.set(Math.cos(a) * r, 0.06 - i * 0.1, Math.sin(a) * r)
      c.rotation.y = -a
    })
    hub.current.rotation.y += dt * 0.8
    const m = hub.current.material as THREE.MeshStandardMaterial
    m.emissiveIntensity += ((night ? 1.6 : 0.7) - m.emissiveIntensity) * 0.1
  })
  return (
    <>
      {[0, 1, 2].map((k) => (
        <mesh key={k} position={[0, -k * 0.1, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
          <ringGeometry args={[0.2 + (2 - k) * 0.25, 0.2 + (3 - k) * 0.25, 32]} />
          <meshStandardMaterial color={["#a8977f", "#93836d", "#7f715e"][k]} roughness={1} />
        </mesh>
      ))}
      <mesh position={[0, -0.3, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.2, 20]} />
        <meshStandardMaterial color="#6f6252" roughness={1} />
      </mesh>
      <group ref={trucks}>
        {[0, 1, 2].map((i) => (
          <mesh key={i} castShadow>
            <boxGeometry args={[0.07, 0.07, 0.16]} />
            {yellow}
          </mesh>
        ))}
      </group>
      <mesh ref={hub} position={[0, 0.9, 0]}>
        <icosahedronGeometry args={[0.2, 1]} />
        <meshStandardMaterial color="#183F35" emissive={SAGE} emissiveIntensity={0.7} wireframe />
      </mesh>
      <pointLight position={[0, 0.9, 0]} intensity={night ? 3 : 0.6} distance={3} color="#dff5e4" />
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

/** Mining Cycle-Time: the haul cycle as a ring of segments. Select to step through them. */
function CycleExhibit({ n }: { n: number }) {
  const parts = useMemo(() => {
    const share = [0.15, 0.06, 0.08, 0.39, 0.04, 0.28] // queue, spot, load, haul, dump, return
    const cols = ["#b5483f", "#c9d6cb", SAGE, "#183F35", "#5d8a6c", "#a9c2ac"]
    let a = 0
    return share.map((s, i) => {
      const seg = { start: a, len: s * Math.PI * 2 - 0.06, color: cols[i] }
      a += s * Math.PI * 2
      return seg
    })
  }, [])
  const truck = useRef<THREE.Mesh>(null!)
  const segs = useRef<THREE.Group>(null!)
  useFrame((state) => {
    const a = state.clock.elapsedTime * 0.6
    truck.current.position.set(Math.cos(a) * 0.75, 0.62, -Math.sin(a) * 0.75)
    truck.current.rotation.y = a
    segs.current.children.forEach((c, i) => {
      const on = i === n % parts.length && n > 0
      c.position.z += ((on ? 0.14 : 0) - c.position.z) * 0.15
    })
  })
  return (
    <group rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.5, 0]}>
      <group ref={segs}>
        {parts.map((s, i) => (
          <group key={i} rotation={[0, 0, s.start]}>
            <mesh castShadow>
              <torusGeometry args={[0.75, 0.09, 10, 40, s.len]} />
              <meshStandardMaterial color={s.color} roughness={0.5} />
            </mesh>
          </group>
        ))}
      </group>
      <group rotation={[Math.PI / 2, 0, 0]} position={[0, 0, -0.5]}>
        <mesh ref={truck} castShadow>
          <boxGeometry args={[0.16, 0.1, 0.1]} />
          {yellow}
        </mesh>
      </group>
    </group>
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

/** University MIS: a monitor showing the system's modules. Select to switch module. */
function MisExhibit({ n }: { n: number }) {
  const screens = useMemo(
    () =>
      [0, 1, 2, 3].map((k) =>
        canvasTexture(512, 320, (g) => {
          g.fillStyle = "#F6F7F3"
          g.fillRect(0, 0, 512, 320)
          g.fillStyle = "#183F35"
          g.fillRect(0, 0, 120, 320)
          ;[0, 1, 2, 3].forEach((i) => {
            g.fillStyle = i === k ? "#8DAA91" : "rgba(246,247,243,.3)"
            g.fillRect(14, 30 + i * 44, 92, 22)
          })
          g.fillStyle = "#102C25"
          g.fillRect(144, 28, 150, 22)
          for (let r = 0; r < 6; r++) {
            g.fillStyle = r % 2 ? "rgba(16,44,37,.06)" : "rgba(16,44,37,.12)"
            g.fillRect(144, 76 + r * 38, 344, 30)
            g.fillStyle = "rgba(16,44,37,.45)"
            g.fillRect(156, 86 + r * 38, 90 + ((r * 37 + k * 23) % 120), 10)
          }
        }),
      ),
    [],
  )
  return (
    <>
      <Monitor tex={screens[n % 4]} w={1.3} position={[0, 0, -0.1]} />
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

/** Acorn Travel: a plane circling a globe, with a phone. Select for a new trip. */
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
