"use client"

import { useFrame } from "@react-three/fiber"
import { useMemo, useRef, useState, type ReactNode } from "react"
import * as THREE from "three"

import { Assemble, OneAtATime, canvasTexture, overUi } from "@/components/scene/helpers"
import { software } from "@/lib/content"
import { sound } from "@/lib/sound"
import { useWorld } from "@/lib/store"

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

/** Crack Survey: a wall, a crack and a phone measuring it. Select to compare before and after. */
function CrackExhibit({ n }: { n: number }) {
  const after = n % 2 === 1
  const tex = useMemo(
    () =>
      [1.6, 4.2].map((w) =>
        canvasTexture(256, 256, (g) => {
          g.clearRect(0, 0, 256, 256)
          let s = 7
          const rnd = () => ((s = (s * 9301 + 49297) % 233280), s / 233280)
          let x = 128
          g.beginPath()
          g.moveTo(x, 10)
          for (let y = 24; y < 250; y += 14) {
            x += (rnd() - 0.5) * 30
            g.lineTo(x, y)
          }
          g.strokeStyle = "rgba(38,34,30,0.92)"
          g.lineWidth = w
          g.lineCap = "round"
          g.lineJoin = "round"
          g.stroke()
        }),
      ),
    [],
  )
  const gauge = useRef<THREE.Group>(null!)
  const phone = useRef<THREE.Group>(null!)
  useFrame((state) => {
    const t = state.clock.elapsedTime
    gauge.current.position.y = 0.75 + Math.sin(t * 1.2) * 0.35
    gauge.current.scale.x += ((after ? 2.2 : 1) - gauge.current.scale.x) * 0.12
    phone.current.position.y = gauge.current.position.y
  })
  return (
    <>
      <mesh position={[0, 0.75, -0.25]} castShadow receiveShadow>
        <boxGeometry args={[1.6, 1.5, 0.14]} />
        <meshStandardMaterial color="#ece6da" roughness={0.9} />
      </mesh>
      <mesh position={[0, 0.75, -0.175]}>
        <planeGeometry args={[1.1, 1.4]} />
        <meshBasicMaterial map={after ? tex[1] : tex[0]} transparent depthWrite={false} />
      </mesh>
      {/* Width gauge that widens when the crack has grown */}
      <group ref={gauge} position={[0, 0.75, -0.16]}>
        <mesh>
          <boxGeometry args={[0.16, 0.015, 0.01]} />
          <meshBasicMaterial color={after ? "#b5483f" : "#183F35"} />
        </mesh>
      </group>
      <group ref={phone} position={[0.25, 0.75, 0.35]} rotation={[0, -0.25, 0]}>
        <mesh castShadow>
          <boxGeometry args={[0.34, 0.62, 0.035]} />
          {dark}
        </mesh>
        <mesh position={[0, 0, -0.019]} rotation={[0, Math.PI, 0]}>
          <planeGeometry args={[0.29, 0.56]} />
          <meshStandardMaterial color="#dfeee2" emissive={after ? "#b5483f" : SAGE} emissiveIntensity={0.6} />
        </mesh>
      </group>
      <mesh position={[0.25, 0.2, 0.35]}>
        <cylinderGeometry args={[0.015, 0.015, 0.5, 6]} />
        {dark}
      </mesh>
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

/** Melbourne Mover: a removal van between two homes. Select to dispatch a job. */
function MoverExhibit({ n }: { n: number }) {
  const van = useRef<THREE.Group>(null!)
  const pin = useRef<THREE.Mesh>(null!)
  const pos = useRef(0)
  useFrame((state, dt) => {
    // Each job sends the van to the other house; a pin tracks it live.
    const target = n % 2
    pos.current += (target - pos.current) * Math.min(1, dt * 1.6)
    const x = -0.62 + pos.current * 1.24
    van.current.position.x = x
    van.current.rotation.y = target ? 0 : Math.PI
    pin.current.position.set(x, 0.5 + Math.sin(state.clock.elapsedTime * 3) * 0.04, 0.15)
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

const EXHIBITS: Record<string, (p: { n: number }) => ReactNode> = {
  "melbourne-mover": MoverExhibit,
  restaurant: RestaurantExhibit,
  minebook: MineBookExhibit,
  "fleet-dispatch": FleetExhibit,
  "cycle-time": CycleExhibit,
  "crack-survey": CrackExhibit,
  "blast-pattern": BlastExhibit,
}

/**
 * One plinth, one project at a time. Scrolling steps through the projects;
 * selecting the exhibit plays its interaction.
 */
export default function SoftwareWorld() {
  const sub = useWorld((s) => s.sub)
  const active = useWorld((s) => s.active === 2)
  const [clicks, setClicks] = useState<number[]>(() => software.map(() => 0))
  const index = active ? Math.min(sub, software.length - 1) : 0
  const hover = useRef(false)
  const top = useRef<THREE.Group>(null!)
  const ring = useRef<THREE.Mesh>(null!)
  const tag = useRef<THREE.Mesh>(null!)
  const cta = useMemo(
    () =>
      canvasTexture(640, 128, (g) => {
        g.clearRect(0, 0, 640, 128)
        g.fillStyle = "#183F35"
        g.beginPath()
        g.roundRect(4, 14, 632, 100, 50)
        g.fill()
        g.fillStyle = "#F6F7F3"
        g.font = "600 44px 'Space Grotesk', system-ui, sans-serif"
        g.textBaseline = "middle"
        g.textAlign = "center"
        g.fillText("Select to try it", 320, 66)
      }),
    [],
  )
  useFrame((state) => {
    const t = state.clock.elapsedTime
    const k = hover.current && active ? 1 : 0
    top.current.scale.setScalar(top.current.scale.x + (2.1 + k * 0.12 - top.current.scale.x) * 0.15)
    const m = ring.current.material as THREE.MeshBasicMaterial
    m.opacity += ((active ? 0.45 + 0.3 * Math.sin(t * 2.4) + k * 0.25 : 0.15) - m.opacity) * 0.15
    tag.current.quaternion.copy(state.camera.quaternion)
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
          <planeGeometry args={[2.1, 0.42]} />
          <meshBasicMaterial map={cta} transparent toneMapped={false} depthWrite={false} />
        </mesh>
      </Assemble>
    </group>
  )
}
