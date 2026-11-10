"use client"

import { useTexture } from "@react-three/drei"
import { useFrame } from "@react-three/fiber"
import { useMemo, useRef } from "react"
import * as THREE from "three"

import { Assemble, canvasTexture, overUi } from "@/components/scene/helpers"
import { software, type SoftwareProject } from "@/lib/content"
import { useWorld } from "@/lib/store"

/** The projects site: an open-air studio where each product runs on a real device. */

const INK = "#102C25"
const SAGE = "#8DAA91"

/** Where each device stands on the stage, and how wide it is. */
const LAYOUT: { pos: [number, number, number]; rotY: number; width: number }[] = [
  { pos: [0, 3.25, -2.6], rotY: 0, width: 3.5 },
  { pos: [-4.1, 2.55, -1.1], rotY: 0.5, width: 2.9 },
  { pos: [4.1, 2.55, -1.1], rotY: -0.5, width: 2.9 },
  { pos: [-2.9, 1.25, 1.7], rotY: 0.35, width: 2.3 },
  { pos: [2.9, 1.25, 1.7], rotY: -0.35, width: 2.3 },
]

/**
 * A project shown as the real product: its actual screenshot inside a device.
 * Web products sit in a monitor with a browser bar; the mobile apps (whose
 * screenshots already show the phones) sit on a slim display panel.
 */
function Device({ project, index }: { project: SoftwareProject; index: number }) {
  const ref = useRef<THREE.Group>(null!)
  const set = useWorld((s) => s.set)
  const active = useWorld((s) => s.active === 2)
  const L = LAYOUT[index]
  const w = L.width
  const h = w / project.aspect
  const tex = useTexture(project.image)
  tex.colorSpace = THREE.SRGBColorSpace
  tex.anisotropy = 8
  const web = project.device === "web"
  const bar = useMemo(
    () =>
      canvasTexture(1024, 56, (g) => {
        g.fillStyle = "#e7e9e4"
        g.fillRect(0, 0, 1024, 56)
        ;["#d9695f", "#e0b04a", "#6fae7a"].forEach((c, i) => {
          g.fillStyle = c
          g.beginPath()
          g.arc(30 + i * 30, 28, 9, 0, 7)
          g.fill()
        })
        g.fillStyle = "#ffffff"
        g.beginPath()
        g.roundRect(150, 10, 724, 36, 18)
        g.fill()
        g.fillStyle = "#4f5b55"
        g.font = "500 22px Inter, system-ui, sans-serif"
        g.textBaseline = "middle"
        g.fillText(project.url ? project.url.replace(/^https?:\/\/|\/$/g, "") : project.title, 172, 29)
      }),
    [project],
  )
  const barH = web ? w * (56 / 1024) : 0
  // A clear call to action under every device.
  const cta = useMemo(
    () =>
      canvasTexture(640, 128, (g) => {
        g.clearRect(0, 0, 640, 128)
        g.fillStyle = "#183F35"
        g.beginPath()
        g.roundRect(4, 14, 632, 100, 50)
        g.fill()
        g.fillStyle = "#F6F7F3"
        g.font = "600 40px 'Space Grotesk', system-ui, sans-serif"
        g.textBaseline = "middle"
        g.textAlign = "center"
        g.fillText(`${project.title}  |  View  \u2192`, 320, 66)
      }),
    [project],
  )
  const hover = useRef(false)
  const glow = useRef<THREE.Mesh>(null!)
  const tag = useRef<THREE.Mesh>(null!)
  useFrame((state) => {
    const t = state.clock.elapsedTime
    ref.current.position.y = Math.sin(t * 0.8 + index * 1.3) * 0.04
    // Hover: the device lifts toward you and its outline lights up.
    const k = hover.current && active ? 1 : 0
    const sc = ref.current.scale.x + (1 + k * 0.06 - ref.current.scale.x) * 0.15
    ref.current.scale.setScalar(sc)
    const m = glow.current.material as THREE.MeshBasicMaterial
    m.opacity += ((active ? 0.35 + 0.25 * Math.sin(t * 2.4 + index) + k * 0.4 : 0) - m.opacity) * 0.15
    tag.current.scale.setScalar(1 + (active ? Math.sin(t * 2.4 + index) * 0.03 : 0) + k * 0.08)
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
        onPointerOver={() => {
          hover.current = true
          if (active) document.body.style.cursor = "pointer"
        }}
        onPointerOut={() => {
          hover.current = false
          document.body.style.cursor = ""
        }}
      >
        {/* Pulsing outline that says "this is selectable" */}
        <mesh ref={glow} position={[0, barH / 2, -0.07]}>
          <planeGeometry args={[w + 0.34, h + barH + 0.34]} />
          <meshBasicMaterial color="#8DAA91" transparent opacity={0} toneMapped={false} />
        </mesh>
        <mesh ref={tag} position={[0, -h / 2 - 0.08, 0.12]} renderOrder={6}>
          <planeGeometry args={[Math.min(w * 0.72, 1.9), Math.min(w * 0.72, 1.9) * 0.2]} />
          <meshBasicMaterial map={cta} transparent toneMapped={false} depthWrite={false} />
        </mesh>
        {/* Bezel */}
        <mesh position={[0, barH / 2, -0.035]} castShadow>
          <boxGeometry args={[w + 0.14, h + barH + 0.14, 0.06]} />
          <meshStandardMaterial color="#1b1f1d" roughness={0.35} metalness={0.6} />
        </mesh>
        <mesh>
          <planeGeometry args={[w, h]} />
          <meshBasicMaterial map={tex} toneMapped={false} />
        </mesh>
        {web ? (
          <>
            <mesh position={[0, h / 2 + barH / 2, 0]}>
              <planeGeometry args={[w, barH]} />
              <meshBasicMaterial map={bar} toneMapped={false} />
            </mesh>
            {/* Monitor neck and foot */}
            <mesh position={[0, -h / 2 - 0.28, -0.06]} castShadow>
              <boxGeometry args={[0.16, 0.5, 0.06]} />
              <meshStandardMaterial color="#9aa3ab" roughness={0.3} metalness={0.8} />
            </mesh>
            <mesh position={[0, -h / 2 - 0.54, 0]} castShadow>
              <boxGeometry args={[w * 0.34, 0.04, 0.5]} />
              <meshStandardMaterial color="#9aa3ab" roughness={0.3} metalness={0.8} />
            </mesh>
          </>
        ) : (
          <mesh position={[0, -h / 2 - 0.42, -0.2]} rotation={[0.25, 0, 0]} castShadow>
            <boxGeometry args={[0.1, 0.8, 0.06]} />
            <meshStandardMaterial color="#9aa3ab" roughness={0.3} metalness={0.8} />
          </mesh>
        )}
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
        <Device key={p.id} project={p} index={i} />
      ))}

      {/* Data flowing between every screen and the core */}
      <Assemble world="software" order={6}>
        {LAYOUT.map((L, i) => (
          <Flow key={i} from={hub} to={new THREE.Vector3(L.pos[0], L.pos[1] - 0.6, L.pos[2])} speed={0.2 + i * 0.03} />
        ))}
        {/* Architecture strip above the stage */}
        <mesh position={[0, 5.6, -2.6]}>
          <planeGeometry args={[6.4, 1.6]} />
          <meshBasicMaterial map={arch} transparent toneMapped={false} />
        </mesh>
      </Assemble>
    </group>
  )
}
