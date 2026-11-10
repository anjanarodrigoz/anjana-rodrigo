"use client"

import { useFrame } from "@react-three/fiber"
import { useMemo, useRef } from "react"
import * as THREE from "three"

import { Assemble, OneAtATime, canvasTexture } from "@/components/scene/helpers"
import { research } from "@/lib/content"
import { zoneIndex } from "@/lib/sections"
import { useWorld } from "@/lib/store"

const HERE = zoneIndex("research")

/**
 * The research lab. The published study is explained in six steps, one
 * exhibit at a time: the question, the data, the equipment, the models, the
 * predictions and the paper. The exhibits show the method only. No result
 * figures are displayed that are not quoted from the paper.
 */

const SAGE = "#8DAA91"
const yellow = <meshStandardMaterial color="#f0b000" roughness={0.5} />
const dark = <meshStandardMaterial color="#2c3632" roughness={0.6} />
const white = <meshStandardMaterial color="#f6f7f3" roughness={0.6} />
const rock = <meshStandardMaterial color="#cfc6b3" roughness={1} />

/** Small label that always faces the camera. */
function Tag({ text, position, width = 1.5 }: { text: string; position: [number, number, number]; width?: number }) {
  const ref = useRef<THREE.Mesh>(null!)
  const tex = useMemo(
    () =>
      canvasTexture(512, 96, (g) => {
        g.clearRect(0, 0, 512, 96)
        g.fillStyle = "rgba(24,63,53,0.92)"
        g.beginPath()
        g.roundRect(4, 8, 504, 80, 40)
        g.fill()
        g.fillStyle = "#F6F7F3"
        g.font = "600 38px Inter, system-ui, sans-serif"
        g.textAlign = "center"
        g.textBaseline = "middle"
        g.fillText(text, 256, 50)
      }),
    [text],
  )
  useFrame((state) => ref.current.quaternion.copy(state.camera.quaternion))
  return (
    <mesh ref={ref} position={position} renderOrder={6}>
      <planeGeometry args={[width, width * 0.1875]} />
      <meshBasicMaterial map={tex} transparent toneMapped={false} depthWrite={false} />
    </mesh>
  )
}

const Truck = ({ position }: { position: [number, number, number] }) => (
  <group position={position}>
    <mesh position={[0.05, 0.16, 0]} castShadow>
      <boxGeometry args={[0.42, 0.18, 0.28]} />
      {yellow}
    </mesh>
    <mesh position={[-0.22, 0.14, 0]} castShadow>
      <boxGeometry args={[0.14, 0.2, 0.26]} />
      {yellow}
    </mesh>
    {[-0.18, 0.16].map((x) => (
      <mesh key={x} position={[x, 0.06, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.07, 0.07, 0.32, 12]} />
        {dark}
      </mesh>
    ))}
  </group>
)

const Excavator = ({ position }: { position: [number, number, number] }) => (
  <group position={position}>
    <mesh position={[0, 0.06, 0]}>
      <boxGeometry args={[0.46, 0.1, 0.36]} />
      {dark}
    </mesh>
    <mesh position={[-0.03, 0.22, 0]} castShadow>
      <boxGeometry args={[0.34, 0.2, 0.3]} />
      {yellow}
    </mesh>
    <mesh position={[0.28, 0.38, 0]} rotation={[0, 0, 0.6]} castShadow>
      <boxGeometry args={[0.5, 0.06, 0.07]} />
      {yellow}
    </mesh>
    <mesh position={[0.5, 0.3, 0]} rotation={[0, 0, -0.5]}>
      <boxGeometry args={[0.06, 0.32, 0.06]} />
      {yellow}
    </mesh>
  </group>
)

const Dozer = ({ position }: { position: [number, number, number] }) => (
  <group position={position}>
    {[-0.13, 0.13].map((z) => (
      <mesh key={z} position={[0, 0.07, z]}>
        <boxGeometry args={[0.44, 0.12, 0.09]} />
        {dark}
      </mesh>
    ))}
    <mesh position={[0, 0.2, 0]} castShadow>
      <boxGeometry args={[0.34, 0.16, 0.26]} />
      {yellow}
    </mesh>
    <mesh position={[-0.06, 0.34, 0]}>
      <boxGeometry args={[0.16, 0.14, 0.22]} />
      {yellow}
    </mesh>
    <mesh position={[0.27, 0.12, 0]}>
      <boxGeometry args={[0.04, 0.2, 0.42]} />
      {dark}
    </mesh>
  </group>
)

/** 1. The question: machines at work on a quarry bench under a running clock. */
function Question() {
  const hand = useRef<THREE.Mesh>(null!)
  useFrame((_, dt) => (hand.current.rotation.z -= dt * 1.2))
  return (
    <>
      {[0, 1, 2].map((k) => (
        <mesh key={k} position={[-0.2 + k * 0.25, 0.1 + k * 0.2, -0.3 - k * 0.22]} castShadow receiveShadow>
          <boxGeometry args={[1.5 - k * 0.3, 0.2, 0.7]} />
          {rock}
        </mesh>
      ))}
      <Excavator position={[-0.35, 0.2, -0.2]} />
      <Truck position={[0.35, 0, 0.35]} />
      <group position={[0.65, 1.15, -0.4]}>
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.3, 0.3, 0.05, 32]} />
          {white}
        </mesh>
        <mesh>
          <torusGeometry args={[0.3, 0.025, 8, 32]} />
          {dark}
        </mesh>
        <mesh ref={hand} position={[0, 0, 0.03]}>
          <boxGeometry args={[0.025, 0.42, 0.01]} />
          <meshBasicMaterial color="#b5483f" />
        </mesh>
      </group>
      <Tag text="Machine hours?" position={[0.65, 1.7, -0.4]} />
    </>
  )
}

/** 2. The data: thirty-six monthly reports, three years in three rows. */
function Data() {
  const sheets = useRef<THREE.Group>(null!)
  useFrame((state) => {
    const t = (state.clock.elapsedTime * 6) % 48
    sheets.current.children.forEach((c, i) => {
      const k = THREE.MathUtils.clamp(t - i, 0, 1)
      c.scale.setScalar(Math.max(0.001, k))
    })
  })
  return (
    <>
      <mesh position={[0, 0.03, 0]} receiveShadow>
        <boxGeometry args={[1.8, 0.06, 1.2]} />
        <meshStandardMaterial color="#b08d64" roughness={0.6} />
      </mesh>
      <group ref={sheets}>
        {Array.from({ length: 36 }, (_, i) => (
          <group key={i} position={[-0.77 + (i % 12) * 0.14, 0.08 + ((i * 7) % 3) * 0.004, -0.36 + Math.floor(i / 12) * 0.36]}>
            <mesh rotation={[-Math.PI / 2, 0, ((i * 13) % 5) * 0.03 - 0.06]} castShadow>
              <planeGeometry args={[0.11, 0.26]} />
              <meshStandardMaterial color="#fffdf5" roughness={0.9} side={THREE.DoubleSide} />
            </mesh>
            <mesh position={[0, 0.002, -0.08]} rotation={[-Math.PI / 2, 0, 0]}>
              <planeGeometry args={[0.08, 0.025]} />
              <meshBasicMaterial color="#183F35" />
            </mesh>
          </group>
        ))}
      </group>
      {["Year 1", "Year 2", "Year 3"].map((y, i) => (
        <Tag key={y} text={y} position={[-1.25, 0.25, -0.36 + i * 0.36]} width={0.7} />
      ))}
      <Tag text="36 monthly reports" position={[0, 1.0, 0]} width={1.7} />
    </>
  )
}

/** 3. The equipment: the three machine types that were studied. */
function Equipment() {
  const group = useRef<THREE.Group>(null!)
  useFrame((state) => group.current.children.forEach((c, i) => (c.position.y = Math.max(0, Math.sin(state.clock.elapsedTime * 2 - i * 1.2)) * 0.06)))
  return (
    <>
      {[-0.7, 0, 0.7].map((x) => (
        <mesh key={x} position={[x, 0.03, 0]} receiveShadow>
          <cylinderGeometry args={[0.42, 0.42, 0.06, 28]} />
          {rock}
        </mesh>
      ))}
      <group ref={group}>
        <group>
          <Truck position={[-0.7, 0.06, 0]} />
        </group>
        <group>
          <Excavator position={[-0.05, 0.06, 0]} />
        </group>
        <group>
          <Dozer position={[0.7, 0.06, 0]} />
        </group>
      </group>
      {research.equipment.map((e, i) => (
        <Tag key={e} text={e} position={[-0.7 + i * 0.7, 0.95, 0]} width={0.95} />
      ))}
    </>
  )
}

/** 4. The models: four algorithms, each drawn as what it is. */
function Models() {
  const stack = useRef<THREE.Group>(null!)
  useFrame((state) => {
    const n = Math.floor((state.clock.elapsedTime * 2) % 7)
    stack.current.children.forEach((c, i) => (c.visible = i <= n))
  })
  const xs = [-0.9, -0.3, 0.3, 0.9]
  return (
    <>
      {/* Decision tree: a root that splits and splits again */}
      <group position={[xs[0], 0, 0]}>
        {[[0, 0.75, 0], [-0.14, 0.5, 0], [0.14, 0.5, 0], [-0.21, 0.25, 0], [-0.07, 0.25, 0], [0.07, 0.25, 0], [0.21, 0.25, 0]].map((p, i) => (
          <mesh key={i} position={p as [number, number, number]}>
            <sphereGeometry args={[0.05, 12, 10]} />
            <meshStandardMaterial color={i < 3 ? "#183F35" : SAGE} roughness={0.5} />
          </mesh>
        ))}
        {[[-0.07, 0.625, 0.5], [0.07, 0.625, -0.5], [-0.175, 0.375, 0.27], [-0.105, 0.375, -0.27], [0.105, 0.375, 0.27], [0.175, 0.375, -0.27]].map(([x, y, r], i) => (
          <mesh key={i} position={[x, y, 0]} rotation={[0, 0, r]}>
            <boxGeometry args={[0.012, 0.27, 0.012]} />
            {dark}
          </mesh>
        ))}
      </group>
      {/* Linear regression: one straight line through scattered points */}
      <group position={[xs[1], 0.15, 0]}>
        {[[-0.2, 0.12], [-0.12, 0.2], [-0.04, 0.22], [0.03, 0.36], [0.1, 0.38], [0.18, 0.52]].map(([x, y], i) => (
          <mesh key={i} position={[x, y, 0]}>
            <sphereGeometry args={[0.03, 10, 8]} />
            <meshStandardMaterial color={SAGE} roughness={0.5} />
          </mesh>
        ))}
        <mesh position={[0, 0.32, 0]} rotation={[0, 0, -0.8]}>
          <boxGeometry args={[0.015, 0.62, 0.015]} />
          <meshBasicMaterial color="#183F35" />
        </mesh>
      </group>
      {/* LGBM: boosting, where each round adds a small correction on top */}
      <group ref={stack} position={[xs[2], 0.1, 0]}>
        {[0, 1, 2, 3, 4, 5, 6].map((i) => (
          <mesh key={i} position={[0, i * 0.09, 0]} castShadow>
            <boxGeometry args={[0.34 - i * 0.035, 0.07, 0.34 - i * 0.035]} />
            <meshStandardMaterial color={i % 2 ? SAGE : "#183F35"} roughness={0.5} />
          </mesh>
        ))}
      </group>
      {/* Random forest: many small trees voting together */}
      <group position={[xs[3], 0.06, 0]}>
        {[[-0.14, -0.1], [0.12, -0.12], [0, 0.02], [-0.12, 0.14], [0.14, 0.12]].map(([x, z], i) => (
          <group key={i} position={[x, 0, z]}>
            <mesh position={[0, 0.1, 0]}>
              <cylinderGeometry args={[0.015, 0.02, 0.2, 6]} />
              {dark}
            </mesh>
            <mesh position={[0, 0.32 + (i % 2) * 0.05, 0]} castShadow>
              <coneGeometry args={[0.09, 0.32, 8]} />
              <meshStandardMaterial color={i % 2 ? "#4f7a4c" : "#183F35"} roughness={0.8} flatShading />
            </mesh>
          </group>
        ))}
      </group>
      {research.models.map((m, i) => (
        <Tag key={m} text={m} position={[xs[i], 1.05 + (i % 2) * 0.22, 0]} width={1.05} />
      ))}
    </>
  )
}

/** 5. The predictions: data flows through a model into the two outputs. */
function Predictions() {
  const dots = useRef<THREE.InstancedMesh>(null!)
  const hand = useRef<THREE.Mesh>(null!)
  const fuel = useRef<THREE.Mesh>(null!)
  const m = useMemo(() => new THREE.Matrix4(), [])
  const from = useMemo(() => new THREE.Vector3(-0.85, 0.45, 0), [])
  const mid = useMemo(() => new THREE.Vector3(0, 0.45, 0), [])
  const outs = useMemo(() => [new THREE.Vector3(0.85, 0.75, 0), new THREE.Vector3(0.85, 0.2, 0)], [])
  const p = useMemo(() => new THREE.Vector3(), [])
  useFrame((state, dt) => {
    const t = state.clock.elapsedTime
    for (let i = 0; i < 12; i++) {
      const u = (t * 0.5 + i / 12) % 1
      if (u < 0.5) p.copy(from).lerp(mid, u * 2)
      else p.copy(mid).lerp(outs[i % 2], (u - 0.5) * 2)
      m.makeTranslation(p.x, p.y, p.z)
      dots.current.setMatrixAt(i, m)
    }
    dots.current.instanceMatrix.needsUpdate = true
    hand.current.rotation.z -= dt * 1.5
    // The gauge only animates to show "a predicted level". It is not a result.
    fuel.current.scale.y = 0.55 + Math.sin(t * 0.9) * 0.25
    fuel.current.position.y = -0.2 + fuel.current.scale.y * 0.2
  })
  return (
    <>
      <Truck position={[-0.85, 0.3, 0]} />
      <mesh position={mid}>
        <boxGeometry args={[0.32, 0.32, 0.32]} />
        <meshStandardMaterial color="#183F35" emissive={SAGE} emissiveIntensity={0.5} wireframe />
      </mesh>
      <instancedMesh ref={dots} args={[undefined, undefined, 12]}>
        <sphereGeometry args={[0.03, 8, 6]} />
        <meshBasicMaterial color="#183F35" />
      </instancedMesh>
      {/* Machine hours: a clock */}
      <group position={outs[0]}>
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.2, 0.2, 0.04, 28]} />
          {white}
        </mesh>
        <mesh>
          <torusGeometry args={[0.2, 0.02, 8, 28]} />
          {dark}
        </mesh>
        <mesh ref={hand} position={[0, 0, 0.03]}>
          <boxGeometry args={[0.02, 0.28, 0.01]} />
          <meshBasicMaterial color="#b5483f" />
        </mesh>
      </group>
      {/* Fuel consumption: a drum with a level */}
      <group position={outs[1]}>
        <mesh>
          <cylinderGeometry args={[0.16, 0.16, 0.42, 24, 1, true]} />
          <meshStandardMaterial color="#9aa3ab" roughness={0.3} metalness={0.6} transparent opacity={0.45} side={THREE.DoubleSide} />
        </mesh>
        <mesh ref={fuel}>
          <cylinderGeometry args={[0.14, 0.14, 0.4, 24]} />
          <meshStandardMaterial color="#e0a100" roughness={0.4} />
        </mesh>
      </group>
      <Tag text="Model" position={[0, 0.85, 0]} width={0.7} />
      <Tag text="Machine hours" position={[0.85, 1.12, 0]} width={1.1} />
      <Tag text="Fuel consumption" position={[0.85, -0.1, 0.3]} width={1.25} />
    </>
  )
}

/** 6. The paper itself. */
function Paper() {
  const ref = useRef<THREE.Group>(null!)
  const cover = useMemo(
    () =>
      canvasTexture(600, 800, (g) => {
        g.fillStyle = "#F6F7F3"
        g.fillRect(0, 0, 600, 800)
        g.fillStyle = "#183F35"
        g.fillRect(0, 0, 600, 90)
        g.fillStyle = "#F6F7F3"
        g.font = "600 30px 'Space Grotesk', system-ui, sans-serif"
        g.fillText("IEEE | MERCon 2023", 36, 56)
        g.fillStyle = "#102C25"
        g.font = "600 34px 'Space Grotesk', system-ui, sans-serif"
        let line = ""
        let y = 160
        for (const w of research.title.split(" ")) {
          if (g.measureText(line + w).width > 520) {
            g.fillText(line, 36, y)
            line = ""
            y += 46
          }
          line += w + " "
        }
        g.fillText(line, 36, y)
        g.fillStyle = "rgba(16,44,37,.25)"
        for (let i = 0; i < 9; i++) g.fillRect(36, y + 70 + i * 26, 528 - (i % 3) * 60, 8)
      }),
    [],
  )
  useFrame((state) => {
    ref.current.position.y = 0.75 + Math.sin(state.clock.elapsedTime * 1.1) * 0.04
    ref.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.5) * 0.25
  })
  return (
    <group ref={ref} position={[0, 0.75, 0]}>
      <mesh castShadow>
        <boxGeometry args={[0.9, 1.2, 0.03]} />
        {white}
      </mesh>
      <mesh position={[0, 0, 0.017]}>
        <planeGeometry args={[0.88, 1.18]} />
        <meshBasicMaterial map={cover} toneMapped={false} />
      </mesh>
    </group>
  )
}

export default function ResearchWorld() {
  const sub = useWorld((s) => s.sub)
  const active = useWorld((s) => s.active === HERE)
  const index = active ? Math.min(sub, research.steps.length - 1) : 0
  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <circleGeometry args={[9, 64]} />
        <meshStandardMaterial color="#e3e8e6" roughness={0.6} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.012, 0]}>
        <ringGeometry args={[6.6, 6.65, 6]} />
        <meshBasicMaterial color="#183F35" transparent opacity={0.4} />
      </mesh>

      {/* Lab benches with instruments either side */}
      <Assemble world="research" order={1}>
        {[-6, 4.8].map((x) => (
          <group key={x} position={[x, 0, -2.2]} rotation={[0, x < 0 ? 0.5 : -0.5, 0]}>
            <mesh position={[0, 0.45, 0]} castShadow receiveShadow>
              <boxGeometry args={[2.4, 0.9, 0.9]} />
              {white}
            </mesh>
            <mesh position={[0, 0.92, 0]}>
              <boxGeometry args={[2.5, 0.05, 1]} />
              {dark}
            </mesh>
            <mesh position={[-0.6, 1.3, -0.1]} castShadow>
              <boxGeometry args={[0.9, 0.6, 0.05]} />
              {dark}
            </mesh>
            <mesh position={[-0.6, 1.3, -0.07]}>
              <planeGeometry args={[0.82, 0.52]} />
              <meshStandardMaterial color="#dfeee2" emissive={SAGE} emissiveIntensity={0.5} />
            </mesh>
            {[0.3, 0.6, 0.9].map((bx, i) => (
              <mesh key={bx} position={[bx, 1.08 + i * 0.03, 0.1]}>
                <cylinderGeometry args={[0.07, 0.09, 0.26 + i * 0.06, 12]} />
                <meshStandardMaterial color={["#8DAA91", "#9cc3d6", "#e0c070"][i]} roughness={0.2} transparent opacity={0.75} />
              </mesh>
            ))}
          </group>
        ))}
      </Assemble>

      {/* The step on show */}
      <Assemble world="research" order={0} position={[-0.6, 0, -0.8]}>
        <mesh position={[0, 0.4, 0]} castShadow receiveShadow>
          <cylinderGeometry args={[2.3, 2.5, 0.8, 48]} />
          {white}
        </mesh>
        <group position={[0, 0.84, 0]} scale={1.9}>
          <OneAtATime index={index}>
            {[<Question key="q" />, <Data key="d" />, <Equipment key="e" />, <Models key="m" />, <Predictions key="p" />, <Paper key="x" />]}
          </OneAtATime>
        </group>
      </Assemble>
    </group>
  )
}
