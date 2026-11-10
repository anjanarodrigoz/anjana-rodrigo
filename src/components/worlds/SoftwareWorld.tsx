"use client"

import { useFrame } from "@react-three/fiber"
import { useMemo, useRef } from "react"
import * as THREE from "three"

import { Assemble, canvasTexture, overUi } from "@/components/scene/helpers"
import { software, type SoftwareProject } from "@/lib/content"
import { useWorld } from "@/lib/store"

/** World two: a digital workspace of floating, readable application screens. */

const INK = "#102C25"
const SAGE = "#8DAA91"

function drawScreen(g: CanvasRenderingContext2D, p: SoftwareProject, w: number, h: number) {
  g.fillStyle = "#F6F7F3"
  g.fillRect(0, 0, w, h)
  g.fillStyle = INK
  g.fillRect(0, 0, w, h * 0.13)
  g.fillStyle = "#F6F7F3"
  g.font = `600 ${Math.round(h * 0.065)}px 'Space Grotesk', system-ui, sans-serif`
  g.textBaseline = "middle"
  g.fillText(p.title, w * 0.05, h * 0.068)
  const x0 = w * 0.06
  const y0 = h * 0.2
  const cw = w * 0.88
  const ch = h * 0.72
  g.strokeStyle = "rgba(16,44,37,.12)"
  g.lineWidth = 2
  if (p.screen === "dispatch") {
    // Haul network with trucks along routes.
    g.strokeStyle = "rgba(16,44,37,.25)"
    g.lineWidth = 10
    g.beginPath()
    g.moveTo(x0, y0 + ch * 0.3)
    g.bezierCurveTo(x0 + cw * 0.3, y0, x0 + cw * 0.5, y0 + ch * 0.6, x0 + cw, y0 + ch * 0.2)
    g.moveTo(x0, y0 + ch * 0.85)
    g.bezierCurveTo(x0 + cw * 0.35, y0 + ch * 0.9, x0 + cw * 0.5, y0 + ch * 0.6, x0 + cw, y0 + ch * 0.9)
    g.stroke()
    for (let i = 0; i < 9; i++) {
      g.fillStyle = i % 3 ? "#183F35" : "#e0a100"
      g.beginPath()
      g.arc(x0 + cw * (0.08 + i * 0.105), y0 + ch * (0.25 + 0.3 * Math.sin(i * 1.7) + (i % 2) * 0.3), 12, 0, 7)
      g.fill()
    }
  } else if (p.screen === "cycle") {
    const parts = [0.15, 0.06, 0.08, 0.39, 0.04, 0.28]
    const cols = ["#b5483f", "#c9d6cb", SAGE, "#183F35", "#5d8a6c", "#a9c2ac"]
    let x = x0
    parts.forEach((f, i) => {
      g.fillStyle = cols[i]
      g.fillRect(x, y0, cw * f - 6, ch * 0.22)
      x += cw * f
    })
    for (let i = 0; i < 5; i++) {
      g.fillStyle = "rgba(16,44,37,.1)"
      g.fillRect(x0, y0 + ch * (0.36 + i * 0.13), cw, ch * 0.08)
      g.fillStyle = "#183F35"
      g.fillRect(x0, y0 + ch * (0.36 + i * 0.13), cw * (0.35 + 0.12 * ((i * 3) % 5)), ch * 0.08)
    }
  } else if (p.screen === "blast") {
    g.strokeStyle = INK
    g.lineWidth = 6
    g.beginPath()
    g.moveTo(x0, y0 + 10)
    g.lineTo(x0 + cw, y0 + 10)
    g.stroke()
    for (let r = 0; r < 4; r++)
      for (let c = 0; c < 9; c++) {
        g.beginPath()
        g.arc(x0 + cw * (0.07 + c * 0.105 + (r % 2) * 0.05), y0 + ch * (0.2 + r * 0.22), 13, 0, 7)
        g.fillStyle = r === 0 ? "#183F35" : "#fff"
        g.fill()
        g.strokeStyle = "#183F35"
        g.lineWidth = 4
        g.stroke()
      }
  } else if (p.screen === "mobile") {
    for (let i = 0; i < 4; i++) {
      g.fillStyle = "#fff"
      g.strokeStyle = "rgba(16,44,37,.15)"
      g.beginPath()
      g.roundRect(x0, y0 + i * ch * 0.24, cw, ch * 0.2, 18)
      g.fill()
      g.stroke()
      g.fillStyle = i === 0 ? "#183F35" : SAGE
      g.beginPath()
      g.arc(x0 + 44, y0 + i * ch * 0.24 + ch * 0.1, 20, 0, 7)
      g.fill()
      g.fillStyle = "rgba(16,44,37,.75)"
      g.fillRect(x0 + 84, y0 + i * ch * 0.24 + ch * 0.06, cw * 0.5, 12)
      g.fillStyle = "rgba(16,44,37,.25)"
      g.fillRect(x0 + 84, y0 + i * ch * 0.24 + ch * 0.12, cw * 0.32, 10)
    }
  } else {
    for (let r = 0; r < 7; r++) {
      g.fillStyle = r === 0 ? "rgba(141,170,145,.45)" : r % 2 ? "#fff" : "rgba(16,44,37,.04)"
      g.fillRect(x0, y0 + r * ch * 0.13, cw, ch * 0.12)
      for (let c = 0; c < 4; c++) {
        g.fillStyle = r === 0 ? INK : "rgba(16,44,37,.4)"
        g.fillRect(x0 + 16 + c * cw * 0.25, y0 + r * ch * 0.13 + ch * 0.045, cw * (0.1 + 0.03 * ((r + c) % 3)), 10)
      }
    }
  }
}

const LAYOUT: { pos: [number, number, number]; rotY: number; size: [number, number] }[] = [
  { pos: [-3.6, 2.5, -1.2], rotY: 0.45, size: [2.6, 1.6] },
  { pos: [0, 3.1, -2.4], rotY: 0, size: [3, 1.85] },
  { pos: [3.7, 2.5, -1.2], rotY: -0.45, size: [2.6, 1.6] },
  { pos: [-1.5, 1.35, 0.6], rotY: 0.25, size: [0.8, 1.55] },
  { pos: [1.9, 1.3, 0.3], rotY: -0.25, size: [1.9, 1.2] },
]

function Screen({ project, index }: { project: SoftwareProject; index: number }) {
  const ref = useRef<THREE.Group>(null!)
  const set = useWorld((s) => s.set)
  const active = useWorld((s) => s.active === 2)
  const L = LAYOUT[index]
  const tex = useMemo(() => canvasTexture(Math.round(512 * (L.size[0] / L.size[1])), 512, (g) => drawScreen(g, project, Math.round(512 * (L.size[0] / L.size[1])), 512)), [project, L])
  useFrame((state) => {
    ref.current.position.y = Math.sin(state.clock.elapsedTime * 0.8 + index * 1.3) * 0.06
  })
  return (
    <Assemble world="software" order={index + 1} position={L.pos} rotation={[0, L.rotY, 0]}>
      <group
        ref={ref}
        onClick={(e) => {
          if (!active || overUi(e)) return
          e.stopPropagation()
          set({ panel: { kind: "project", project } })
        }}
        onPointerOver={() => active && (document.body.style.cursor = "pointer")}
        onPointerOut={() => (document.body.style.cursor = "")}
      >
        <mesh position={[0, 0, -0.03]}>
          <boxGeometry args={[L.size[0] + 0.1, L.size[1] + 0.1, 0.04]} />
          <meshStandardMaterial color="#0d231d" roughness={0.3} metalness={0.5} />
        </mesh>
        <mesh>
          <planeGeometry args={L.size} />
          <meshBasicMaterial map={tex} toneMapped={false} />
        </mesh>
      </group>
    </Assemble>
  )
}

/** Data packets flowing along a curve between two points. */
function Flow({ from, to, n = 7, speed = 0.25 }: { from: THREE.Vector3; to: THREE.Vector3; n?: number; speed?: number }) {
  const ref = useRef<THREE.InstancedMesh>(null!)
  const curve = useMemo(() => new THREE.QuadraticBezierCurve3(from, from.clone().lerp(to, 0.5).add(new THREE.Vector3(0, 0.9, 0.4)), to), [from, to])
  const line = useMemo(
    () => new THREE.Line(new THREE.BufferGeometry().setFromPoints(curve.getPoints(30)), new THREE.LineBasicMaterial({ color: SAGE, transparent: true, opacity: 0.35 })),
    [curve],
  )
  const m = useMemo(() => new THREE.Matrix4(), [])
  useFrame((state) => {
    for (let i = 0; i < n; i++) {
      const p = curve.getPoint((state.clock.elapsedTime * speed + i / n) % 1)
      m.makeTranslation(p.x, p.y, p.z)
      ref.current.setMatrixAt(i, m)
    }
    ref.current.instanceMatrix.needsUpdate = true
  })
  return (
    <>
      <primitive object={line} />
      <instancedMesh ref={ref} args={[undefined, undefined, n]}>
        <sphereGeometry args={[0.045, 8, 6]} />
        <meshBasicMaterial color="#dff5e4" />
      </instancedMesh>
    </>
  )
}

export default function SoftwareWorld() {
  const core = useRef<THREE.Mesh>(null!)
  const hub = useMemo(() => new THREE.Vector3(0, 1.1, -0.6), [])
  const arch = useMemo(() => canvasTexture(1024, 256, (g) => {
    g.clearRect(0, 0, 1024, 256)
    const nodes = ["Flutter app", "React web", "API", "Cloud data", "AI"]
    nodes.forEach((n, i) => {
      const x = 40 + i * 198
      g.strokeStyle = SAGE
      g.lineWidth = 3
      g.beginPath()
      g.roundRect(x, 90, 160, 76, 14)
      g.stroke()
      g.fillStyle = "#F6F7F3"
      g.font = "500 26px Inter, system-ui, sans-serif"
      g.textAlign = "center"
      g.textBaseline = "middle"
      g.fillText(n, x + 80, 129)
      if (i < nodes.length - 1) {
        g.beginPath()
        g.moveTo(x + 164, 128)
        g.lineTo(x + 194, 128)
        g.stroke()
      }
    })
  }), [])
  useFrame((state) => {
    core.current.rotation.y = state.clock.elapsedTime * 0.5
    core.current.rotation.x = state.clock.elapsedTime * 0.3
  })

  return (
    <group>
      {/* Stage: a dark circular floor with soft green rings */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <circleGeometry args={[9, 64]} />
        <meshStandardMaterial color="#12332b" roughness={0.55} metalness={0.2} />
      </mesh>
      {[3, 5.2, 7.4].map((r) => (
        <mesh key={r} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.012, 0]}>
          <ringGeometry args={[r, r + 0.03, 96]} />
          <meshBasicMaterial color={SAGE} transparent opacity={0.4} />
        </mesh>
      ))}

      {/* Workstation */}
      <Assemble world="software" order={0}>
        <mesh position={[0, 0.72, -0.6]} castShadow receiveShadow>
          <boxGeometry args={[2.6, 0.07, 1]} />
          <meshStandardMaterial color="#e9ebe4" roughness={0.5} />
        </mesh>
        {[-1.15, 1.15].map((x) => (
          <mesh key={x} position={[x, 0.36, -0.6]} castShadow>
            <boxGeometry args={[0.07, 0.72, 0.9]} />
            <meshStandardMaterial color="#0d231d" roughness={0.4} metalness={0.5} />
          </mesh>
        ))}
        <mesh position={[0, 0.78, -0.35]}>
          <boxGeometry args={[0.9, 0.025, 0.3]} />
          <meshStandardMaterial color="#202824" roughness={0.6} />
        </mesh>
        <mesh ref={core} position={hub}>
          <icosahedronGeometry args={[0.22, 1]} />
          <meshStandardMaterial color="#183F35" emissive={SAGE} emissiveIntensity={0.9} wireframe />
        </mesh>
        <pointLight position={[0, 1.6, 0.4]} intensity={6} distance={9} color="#dff5e4" />
      </Assemble>

      {software.map((p, i) => (
        <Screen key={p.id} project={p} index={i} />
      ))}

      {/* Data flowing between every screen and the core */}
      <Assemble world="software" order={6}>
        {LAYOUT.map((L, i) => (
          <Flow key={i} from={hub} to={new THREE.Vector3(L.pos[0], L.pos[1] - L.size[1] / 2, L.pos[2])} speed={0.2 + i * 0.03} />
        ))}
        {/* Architecture strip above the stage */}
        <mesh position={[0, 4.75, -2.6]}>
          <planeGeometry args={[6.4, 1.6]} />
          <meshBasicMaterial map={arch} transparent toneMapped={false} />
        </mesh>
      </Assemble>
    </group>
  )
}
