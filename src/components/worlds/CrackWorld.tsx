"use client"

import { useFrame } from "@react-three/fiber"
import { useMemo, useRef } from "react"
import * as THREE from "three"

import { Assemble, Hotspot, canvasTexture } from "@/components/scene/helpers"
import { crackSurvey } from "@/lib/content"
import { useWorld } from "@/lib/store"

/**
 * World three: a residential street beside a construction site. The house
 * carries hairline cracks that are recorded before construction and compared
 * after. Toggle Before/After and lift the roof to inspect interior walls.
 */

const HOUSE = { w: 9, d: 6.5, h: 2.9 }

/** A hairline crack as a jagged, branching stroke on a transparent texture. */
function crackTexture(seed: number, width: number) {
  return canvasTexture(256, 256, (g) => {
    g.clearRect(0, 0, 256, 256)
    let s = seed * 9301 + 49297
    const rnd = () => ((s = (s * 9301 + 49297) % 233280), s / 233280)
    const stroke = (x: number, y: number, len: number, w: number) => {
      g.beginPath()
      g.moveTo(x, y)
      for (let i = 0; i < len; i++) {
        x += (rnd() - 0.5) * 26
        y += 12 + rnd() * 10
        g.lineTo(x, y)
        if (rnd() < 0.18 && w > 1) stroke(x, y, 4, w * 0.5)
      }
      g.strokeStyle = "rgba(38,34,30,0.9)"
      g.lineWidth = w
      g.lineCap = "round"
      g.lineJoin = "round"
      g.stroke()
    }
    stroke(118 + rnd() * 20, 14, 13, width)
  })
}

function Crack({ index, position, rotation }: { index: number; position: [number, number, number]; rotation: [number, number, number] }) {
  const rec = crackSurvey.records[index]
  const phase = useWorld((s) => s.phase)
  const set = useWorld((s) => s.set)
  const before = useMemo(() => crackTexture(index + 1, 1.2 + rec.before * 1.5), [index, rec])
  const after = useMemo(() => crackTexture(index + 1, 1.2 + rec.after * 1.5), [index, rec])
  const pos = useMemo(() => new THREE.Vector3(...position), [position])
  return (
    <>
      <mesh position={position} rotation={rotation}>
        <planeGeometry args={[1.1, 1.5]} />
        <meshBasicMaterial map={phase === "before" ? before : after} transparent depthWrite={false} polygonOffset polygonOffsetFactor={-2} />
      </mesh>
      <Hotspot section={3} at={() => pos} radius={0.55} color="#183F35" onSelect={() => set({ panel: { kind: "crack", id: rec.id } })} />
    </>
  )
}

function Window({ position, rotation = [0, 0, 0] as [number, number, number] }: { position: [number, number, number]; rotation?: [number, number, number] }) {
  return (
    <group position={position} rotation={rotation}>
      <mesh>
        <boxGeometry args={[1.3, 1.1, 0.08]} />
        <meshStandardMaterial color="#f4f2ec" roughness={0.6} />
      </mesh>
      <mesh position={[0, 0, 0.03]}>
        <planeGeometry args={[1.1, 0.9]} />
        <meshStandardMaterial color="#7f9aa8" roughness={0.1} metalness={0.4} />
      </mesh>
      <mesh position={[0, 0, 0.045]}>
        <boxGeometry args={[0.04, 0.9, 0.02]} />
        <meshStandardMaterial color="#f4f2ec" />
      </mesh>
    </group>
  )
}

export default function CrackWorld() {
  const roof = useRef<THREE.Group>(null!)
  const frame = useRef<THREE.Group>(null!)
  const pit = useRef<THREE.Group>(null!)
  const { w, d, h } = HOUSE

  const plan = useMemo(
    () =>
      canvasTexture(900, 650, (g) => {
        g.fillStyle = "#F6F7F3"
        g.fillRect(0, 0, 900, 650)
        g.strokeStyle = "#102C25"
        g.lineWidth = 10
        g.strokeRect(20, 20, 860, 610)
        g.lineWidth = 6
        g.beginPath()
        g.moveTo(450, 20)
        g.lineTo(450, 250)
        g.moveTo(20, 320)
        g.lineTo(380, 320)
        g.moveTo(520, 320)
        g.lineTo(880, 320)
        g.moveTo(450, 400)
        g.lineTo(450, 630)
        g.stroke()
        g.fillStyle = "rgba(16,44,37,.55)"
        g.font = "500 30px Inter, system-ui, sans-serif"
        ;[["Bedroom 2", 150, 180], ["Bedroom 1", 600, 180], ["Living room", 140, 490], ["Kitchen", 620, 490]].forEach(([t, x, y]) => g.fillText(t as string, x as number, y as number))
        crackSurvey.records.forEach((r) => {
          g.fillStyle = "#b5483f"
          g.beginPath()
          g.arc(20 + r.plan[0] * 860, 20 + (1 - r.plan[1]) * 610, 16, 0, 7)
          g.fill()
        })
      }),
    [],
  )

  useFrame((_, dt) => {
    const { roofOpen, phase } = useWorld.getState()
    const k = 1 - Math.pow(0.003, dt)
    roof.current.position.y += ((roofOpen ? 4.2 : 0) - roof.current.position.y) * k
    roof.current.rotation.z += ((roofOpen ? 0.12 : 0) - roof.current.rotation.z) * k
    const built = phase === "after" ? 1 : 0
    frame.current.scale.y += (Math.max(0.001, built) - frame.current.scale.y) * k
    pit.current.scale.y += ((1 - built * 0.85) - pit.current.scale.y) * k
  })

  const wall = <meshStandardMaterial color="#ece6da" roughness={0.9} />
  const inner = <meshStandardMaterial color="#f5f1e8" roughness={0.95} />

  return (
    <group>
      {/* Ground: lawn, street, footpath */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <circleGeometry args={[60, 48]} />
        <meshStandardMaterial color="#7f9a6a" roughness={1} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 9.5]} receiveShadow>
        <planeGeometry args={[120, 5]} />
        <meshStandardMaterial color="#5c5f63" roughness={0.9} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 6.4]} receiveShadow>
        <planeGeometry args={[120, 1.2]} />
        <meshStandardMaterial color="#c9c5bb" roughness={0.9} />
      </mesh>

      {/* The house */}
      <Assemble world="crack" order={0}>
        <mesh position={[0, 0.1, 0]} receiveShadow castShadow>
          <boxGeometry args={[w + 0.3, 0.2, d + 0.3]} />
          <meshStandardMaterial color="#b9b4a8" roughness={0.9} />
        </mesh>
        {/* Exterior walls */}
        <mesh position={[0, h / 2 + 0.2, d / 2]} castShadow receiveShadow>
          <boxGeometry args={[w, h, 0.2]} />
          {wall}
        </mesh>
        <mesh position={[0, h / 2 + 0.2, -d / 2]} castShadow receiveShadow>
          <boxGeometry args={[w, h, 0.2]} />
          {wall}
        </mesh>
        <mesh position={[w / 2, h / 2 + 0.2, 0]} castShadow receiveShadow>
          <boxGeometry args={[0.2, h, d]} />
          {wall}
        </mesh>
        <mesh position={[-w / 2, h / 2 + 0.2, 0]} castShadow receiveShadow>
          <boxGeometry args={[0.2, h, d]} />
          {wall}
        </mesh>
        {/* Interior partitions and floor */}
        <mesh position={[0, 0.21, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
          <planeGeometry args={[w - 0.2, d - 0.2]} />
          <meshStandardMaterial color="#c8a77c" roughness={0.7} />
        </mesh>
        <mesh position={[0, h / 2 + 0.2, -1.6]} receiveShadow>
          <boxGeometry args={[0.12, h, 3.1]} />
          {inner}
        </mesh>
        <mesh position={[-2.6, h / 2 + 0.2, 0]} receiveShadow>
          <boxGeometry args={[3.6, h, 0.12]} />
          {inner}
        </mesh>
        <mesh position={[2.6, h / 2 + 0.2, 0]} receiveShadow>
          <boxGeometry args={[3.6, h, 0.12]} />
          {inner}
        </mesh>
        {/* Door and windows */}
        <mesh position={[0.2, 1.25, d / 2 + 0.11]}>
          <boxGeometry args={[1, 2.1, 0.06]} />
          <meshStandardMaterial color="#3d5a4c" roughness={0.6} />
        </mesh>
        <Window position={[-2.6, 1.8, d / 2 + 0.1]} />
        <Window position={[2.8, 1.8, d / 2 + 0.1]} />
        <Window position={[w / 2 + 0.1, 1.8, -1.4]} rotation={[0, Math.PI / 2, 0]} />
        {/* Cracks: three exterior, two interior (lift the roof to see them) */}
        <Crack index={0} position={[-3.9, 1.5, d / 2 + 0.115]} rotation={[0, 0, 0.1]} />
        <Crack index={1} position={[w / 2 + 0.115, 1.6, 1.4]} rotation={[0, Math.PI / 2, -0.15]} />
        <Crack index={2} position={[1.5, 2.2, d / 2 + 0.115]} rotation={[0, 0, -0.3]} />
        <Crack index={3} position={[-1.6, 1.7, 0.075]} rotation={[0, 0, 0.2]} />
        <Crack index={4} position={[-2.6, 1.7, -d / 2 + 0.115]} rotation={[0, 0, -0.1]} />
        {/* Roof (lifts off) */}
        <group ref={roof}>
          <mesh position={[0, h + 0.3, 0]} castShadow>
            <boxGeometry args={[w + 0.7, 0.14, d + 0.7]} />
            <meshStandardMaterial color="#f1eee6" roughness={0.8} />
          </mesh>
          {[-1, 1].map((side) => (
            <mesh key={side} position={[0, h + 1.1, side * (d / 4 + 0.15)]} rotation={[side * 0.52, 0, 0]} castShadow>
              <boxGeometry args={[w + 0.8, 0.12, d / 2 + 0.95]} />
              <meshStandardMaterial color="#7c4a3a" roughness={0.85} />
            </mesh>
          ))}
        </group>
      </Assemble>

      {/* Floor plan laid out on the lawn, with crack locations marked */}
      <Assemble world="crack" order={2} position={[-1.5, 0, 5.1]}>
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.06, 0]} receiveShadow>
          <planeGeometry args={[2.7, 1.95]} />
          <meshStandardMaterial map={plan} roughness={0.8} />
        </mesh>
      </Assemble>

      {/* Neighbouring construction site */}
      <Assemble world="crack" order={3} position={[13, 0, -1]}>
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.03, 0]} receiveShadow>
          <planeGeometry args={[12, 11]} />
          <meshStandardMaterial color="#a48d6c" roughness={1} />
        </mesh>
        <group ref={pit}>
          {/* Excavation spoil while the site is open */}
          {[[-3, 3.4], [3.6, -3.2], [-3.6, -2.4]].map(([x, z], i) => (
            <mesh key={i} position={[x, 0.5, z]} castShadow>
              <coneGeometry args={[1.3, 1, 9]} />
              <meshStandardMaterial color="#8d7654" roughness={1} flatShading />
            </mesh>
          ))}
        </group>
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.05, 0]}>
          <planeGeometry args={[6.4, 5.4]} />
          <meshStandardMaterial color="#6f5c43" roughness={1} />
        </mesh>
        {/* The new building's frame rises in the After phase */}
        <group ref={frame} scale={[1, 0.001, 1]}>
          {[-2.8, 0, 2.8].flatMap((x) => [-2.3, 2.3].map((z) => (
            <mesh key={`${x}${z}`} position={[x, 3, z]} castShadow>
              <boxGeometry args={[0.3, 6, 0.3]} />
              <meshStandardMaterial color="#b9b6ae" roughness={0.8} />
            </mesh>
          )))}
          {[2, 4, 6].map((y) => (
            <mesh key={y} position={[0, y, 0]} castShadow receiveShadow>
              <boxGeometry args={[6.2, 0.2, 5.2]} />
              <meshStandardMaterial color="#c9c6be" roughness={0.8} />
            </mesh>
          ))}
        </group>
        {/* Site fence with hazard banding */}
        {Array.from({ length: 12 }, (_, i) => (
          <group key={i} position={[-6, 0, -5 + i * 0.92]}>
            <mesh position={[0, 0.6, 0]}>
              <boxGeometry args={[0.05, 1.2, 0.9]} />
              <meshStandardMaterial color={i % 2 ? "#e9a23b" : "#f4f2ec"} roughness={0.7} />
            </mesh>
          </group>
        ))}
        {/* Tower crane */}
        <group position={[4.6, 0, 4]}>
          <mesh position={[0, 4.5, 0]} castShadow>
            <boxGeometry args={[0.35, 9, 0.35]} />
            <meshStandardMaterial color="#e0a100" roughness={0.6} />
          </mesh>
          <mesh position={[-2, 9, 0]} castShadow>
            <boxGeometry args={[7.5, 0.25, 0.25]} />
            <meshStandardMaterial color="#e0a100" roughness={0.6} />
          </mesh>
          <mesh position={[-4.2, 7.4, 0]}>
            <boxGeometry args={[0.03, 3, 0.03]} />
            <meshStandardMaterial color="#202824" />
          </mesh>
        </group>
      </Assemble>

      {/* Garden trees */}
      <Assemble world="crack" order={4}>
        {[[-8, -3], [-9.5, 2.5], [-6.5, -6], [4, -6.5]].map(([x, z], i) => (
          <group key={i} position={[x, 0, z]}>
            <mesh position={[0, 0.8, 0]} castShadow>
              <cylinderGeometry args={[0.12, 0.16, 1.6, 8]} />
              <meshStandardMaterial color="#6a4f3a" roughness={0.9} />
            </mesh>
            <mesh position={[0, 2.3, 0]} castShadow>
              <icosahedronGeometry args={[1.2, 1]} />
              <meshStandardMaterial color="#4f7a4c" roughness={0.9} flatShading />
            </mesh>
          </group>
        ))}
      </Assemble>
    </group>
  )
}
