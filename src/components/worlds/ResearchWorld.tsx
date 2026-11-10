"use client"

import { useFrame } from "@react-three/fiber"
import { useMemo, useRef } from "react"
import * as THREE from "three"

import { Assemble, canvasTexture, overUi } from "@/components/scene/helpers"
import { research } from "@/lib/content"
import { useWorld } from "@/lib/store"

/**
 * World five: a research lab. The hologram shows the method of the published
 * paper (equipment data -> four models -> two predictions), not its results:
 * no numbers are displayed that the paper did not report.
 */

const SAGE = "#8DAA91"

const label = (text: string, w = 512) =>
  canvasTexture(w, 96, (g) => {
    g.clearRect(0, 0, w, 96)
    g.fillStyle = "#e6f3e8"
    g.font = "500 40px Inter, system-ui, sans-serif"
    g.textAlign = "center"
    g.textBaseline = "middle"
    g.fillText(text, w / 2, 50)
  })

function Tag({ text, position, width = 1.6 }: { text: string; position: [number, number, number]; width?: number }) {
  const tex = useMemo(() => label(text), [text])
  return (
    <mesh position={position}>
      <planeGeometry args={[width, width * 0.1875]} />
      <meshBasicMaterial map={tex} transparent toneMapped={false} depthWrite={false} />
    </mesh>
  )
}

function Stream({ from, to, offset }: { from: THREE.Vector3; to: THREE.Vector3; offset: number }) {
  const ref = useRef<THREE.InstancedMesh>(null!)
  const line = useMemo(
    () => new THREE.Line(new THREE.BufferGeometry().setFromPoints([from, to]), new THREE.LineBasicMaterial({ color: SAGE, transparent: true, opacity: 0.22 })),
    [from, to],
  )
  const m = useMemo(() => new THREE.Matrix4(), [])
  const p = useMemo(() => new THREE.Vector3(), [])
  useFrame((state) => {
    for (let i = 0; i < 3; i++) {
      p.copy(from).lerp(to, (state.clock.elapsedTime * 0.35 + offset + i / 3) % 1)
      m.makeTranslation(p.x, p.y, p.z)
      ref.current.setMatrixAt(i, m)
    }
    ref.current.instanceMatrix.needsUpdate = true
  })
  return (
    <>
      <primitive object={line} />
      <instancedMesh ref={ref} args={[undefined, undefined, 3]}>
        <sphereGeometry args={[0.035, 8, 6]} />
        <meshBasicMaterial color="#e6f3e8" />
      </instancedMesh>
    </>
  )
}

export default function ResearchWorld() {
  const set = useWorld((s) => s.set)
  const active = useWorld((s) => s.active === 4)
  const paper = useRef<THREE.Group>(null!)
  const ring = useRef<THREE.Mesh>(null!)

  const cols = useMemo(() => {
    const eq = research.equipment.map((_, i) => new THREE.Vector3(-3, 3.3 - i * 0.9, 0))
    const models = research.models.map((_, i) => new THREE.Vector3(0, 3.75 - i * 0.9, 0))
    const out = research.targets.map((_, i) => new THREE.Vector3(3, 2.85 - i * 0.9, 0))
    return { eq, models, out }
  }, [])

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
        const words = research.title.split(" ")
        let line = ""
        let y = 160
        for (const w of words) {
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
    const t = state.clock.elapsedTime
    paper.current.position.y = 1.5 + Math.sin(t * 1.1) * 0.06
    paper.current.rotation.y = -0.35 + Math.sin(t * 0.5) * 0.12
    ring.current.rotation.z = t * 0.3
  })

  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <circleGeometry args={[9, 64]} />
        <meshStandardMaterial color="#1b2420" roughness={0.4} metalness={0.4} />
      </mesh>
      <mesh ref={ring} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.015, 0]}>
        <ringGeometry args={[4.4, 4.46, 6]} />
        <meshBasicMaterial color={SAGE} transparent opacity={0.6} />
      </mesh>

      {/* Lab benches */}
      <Assemble world="research" order={0}>
        {[-5.2, 5.2].map((x) => (
          <group key={x} position={[x, 0, -1]} rotation={[0, x < 0 ? 0.5 : -0.5, 0]}>
            <mesh position={[0, 0.45, 0]} castShadow receiveShadow>
              <boxGeometry args={[2.4, 0.9, 0.9]} />
              <meshStandardMaterial color="#2a3531" roughness={0.5} metalness={0.3} />
            </mesh>
            <mesh position={[0, 1.3, -0.2]}>
              <boxGeometry args={[1.2, 0.7, 0.05]} />
              <meshStandardMaterial color="#0c1210" emissive={SAGE} emissiveIntensity={0.25} />
            </mesh>
          </group>
        ))}
        <pointLight position={[0, 4, 3]} intensity={14} distance={14} color="#dff5e4" />
      </Assemble>

      {/* Hologram: the paper's method */}
      <Assemble world="research" order={2} position={[0, 0.2, -1.6]}>
        {cols.eq.map((p, i) => (
          <group key={i}>
            <mesh position={p}>
              <octahedronGeometry args={[0.2, 0]} />
              <meshStandardMaterial color="#e0a100" emissive="#e0a100" emissiveIntensity={0.4} wireframe />
            </mesh>
            <Tag text={research.equipment[i]} position={[p.x, p.y - 0.36, p.z]} />
            {cols.models.map((m, j) => (
              <Stream key={j} from={p} to={m} offset={(i * 4 + j) * 0.11} />
            ))}
          </group>
        ))}
        {cols.models.map((p, i) => (
          <group key={i}>
            <mesh position={p}>
              <boxGeometry args={[0.3, 0.3, 0.3]} />
              <meshStandardMaterial color="#183F35" emissive={SAGE} emissiveIntensity={0.8} wireframe />
            </mesh>
            <Tag text={research.models[i]} position={[p.x, p.y - 0.36, p.z]} />
            {cols.out.map((o, j) => (
              <Stream key={j} from={p} to={o} offset={(i * 2 + j) * 0.17} />
            ))}
          </group>
        ))}
        {cols.out.map((p, i) => (
          <group key={i}>
            <mesh position={p}>
              <sphereGeometry args={[0.24, 16, 12]} />
              <meshStandardMaterial color="#F6F7F3" emissive="#dff5e4" emissiveIntensity={0.7} wireframe />
            </mesh>
            <Tag text={research.targets[i]} position={[p.x, p.y - 0.42, p.z]} />
          </group>
        ))}
      </Assemble>

      {/* The publication itself: click to open the record */}
      <Assemble world="research" order={4} position={[-2.2, 0, 2.6]}>
        <mesh position={[0, 0.45, 0]} castShadow>
          <cylinderGeometry args={[0.5, 0.6, 0.9, 24]} />
          <meshStandardMaterial color="#2a3531" roughness={0.4} metalness={0.4} />
        </mesh>
        <group
          ref={paper}
          onClick={(e) => {
            if (!active || overUi(e)) return
            e.stopPropagation()
            set({ panel: { kind: "paper" } })
          }}
          onPointerOver={() => active && (document.body.style.cursor = "pointer")}
          onPointerOut={() => (document.body.style.cursor = "")}
        >
          <mesh>
            <boxGeometry args={[0.9, 1.2, 0.03]} />
            <meshStandardMaterial color="#F6F7F3" roughness={0.6} />
          </mesh>
          <mesh position={[0, 0, 0.017]}>
            <planeGeometry args={[0.88, 1.18]} />
            <meshBasicMaterial map={cover} toneMapped={false} />
          </mesh>
        </group>
        <pointLight position={[0, 1.6, 0.8]} intensity={4} distance={5} color="#ffffff" />
      </Assemble>
    </group>
  )
}
