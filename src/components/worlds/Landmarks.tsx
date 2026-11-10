"use client"

import { useFrame } from "@react-three/fiber"
import { useMemo, useRef } from "react"
import * as THREE from "three"

import { canvasTexture } from "@/components/scene/helpers"
import { sections } from "@/lib/sections"
import { player, useWorld } from "@/lib/store"
import { SITES, topHeight } from "@/three/terrain"

/**
 * Wayfinding for the open world: a soft light beam and a name sign over
 * every place, the About site and the Contact office.
 */

function Beacon({ index }: { index: number }) {
  const z = sections[index]
  const beam = useRef<THREE.Mesh>(null!)
  const sign = useRef<THREE.Mesh>(null!)
  const y = useMemo(() => topHeight(z.at[0], z.at[1]), [z])
  const tex = useMemo(
    () =>
      canvasTexture(512, 128, (g) => {
        g.clearRect(0, 0, 512, 128)
        g.fillStyle = "#183F35"
        g.beginPath()
        g.roundRect(6, 14, 500, 100, 50)
        g.fill()
        g.fillStyle = "#F6F7F3"
        g.font = "600 54px 'Space Grotesk', system-ui, sans-serif"
        g.textAlign = "center"
        g.textBaseline = "middle"
        g.fillText(z.nav, 256, 68)
      }),
    [z],
  )
  useFrame((state) => {
    const here = useWorld.getState().active === index
    const d = Math.hypot(player.x - z.at[0], player.z - z.at[1])
    // Beams fade out as you arrive, so they guide without cluttering.
    const m = beam.current.material as THREE.MeshBasicMaterial
    m.opacity += ((here ? 0 : THREE.MathUtils.clamp((d - z.radius) / 12, 0, 1) * 0.3) - m.opacity) * 0.08
    sign.current.quaternion.copy(state.camera.quaternion)
    const s = THREE.MathUtils.clamp(d / 22, 0.7, 2.6)
    sign.current.scale.set(3.2 * s, 0.8 * s, 1)
    ;(sign.current.material as THREE.MeshBasicMaterial).opacity = here ? 0 : 0.95
  })
  const high = index === 0 ? 5 : 7.5
  return (
    <group position={[z.at[0], y, z.at[1]]}>
      <mesh ref={beam} position={[0, 14, 0]}>
        <cylinderGeometry args={[0.5, 0.5, 28, 16, 1, true]} />
        <meshBasicMaterial color="#8DAA91" transparent opacity={0} depthWrite={false} side={THREE.DoubleSide} fog={false} />
      </mesh>
      <mesh ref={sign} position={[0, high, 0]} renderOrder={5}>
        <planeGeometry args={[1, 1]} />
        <meshBasicMaterial map={tex} transparent depthWrite={false} toneMapped={false} fog={false} />
      </mesh>
    </group>
  )
}

/** A tabletop model of the mine: benches and tiny haul trucks circling them. */
function MineModel() {
  const trucks = useRef<THREE.Group>(null!)
  useFrame((state) => {
    trucks.current.children.forEach((c, i) => {
      const r = 0.52 - i * 0.14
      const a = state.clock.elapsedTime * 0.8 * (i % 2 ? 1 : -1) + i * 2
      c.position.set(Math.cos(a) * r, 0.05 - i * 0.07, Math.sin(a) * r)
      c.rotation.y = -a
    })
  })
  return (
    <group>
      {[0, 1, 2].map((k) => (
        <mesh key={k} position={[0, -k * 0.07, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[0.14 + (2 - k) * 0.17, 0.14 + (3 - k) * 0.17, 32]} />
          <meshStandardMaterial color={["#a8977f", "#93836d", "#7f715e"][k]} roughness={1} />
        </mesh>
      ))}
      <mesh position={[0, -0.21, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.14, 20]} />
        <meshStandardMaterial color="#6f6252" roughness={1} />
      </mesh>
      <mesh position={[0, -0.13, 0]}>
        <cylinderGeometry args={[0.72, 0.72, 0.26, 40, 1, true]} />
        <meshStandardMaterial color="#6f8a5f" roughness={1} side={THREE.DoubleSide} />
      </mesh>
      <group ref={trucks}>
        {[0, 1, 2].map((i) => (
          <mesh key={i} castShadow>
            <boxGeometry args={[0.05, 0.05, 0.11]} />
            <meshStandardMaterial color="#f0b000" roughness={0.5} />
          </mesh>
        ))}
      </group>
    </group>
  )
}

/**
 * Contact: an open-fronted site office with a desk and computer, tablets on
 * stands, and a 3D model of the mine on a display table.
 */
function Office() {
  const c = SITES.contact
  const y = useMemo(() => topHeight(c.x, c.z), [c])
  const sign = useMemo(
    () =>
      canvasTexture(768, 192, (g) => {
        g.fillStyle = "#183F35"
        g.fillRect(0, 0, 768, 192)
        g.fillStyle = "#F6F7F3"
        g.font = "600 92px 'Space Grotesk', system-ui, sans-serif"
        g.textAlign = "center"
        g.textBaseline = "middle"
        g.fillText("Let's talk", 384, 100)
      }),
    [],
  )
  const screen = useMemo(
    () =>
      canvasTexture(512, 320, (g) => {
        g.fillStyle = "#F6F7F3"
        g.fillRect(0, 0, 512, 320)
        g.fillStyle = "#183F35"
        g.fillRect(0, 0, 512, 44)
        g.fillStyle = "#8DAA91"
        ;[60, 120, 90, 150, 110, 170].forEach((h, i) => g.fillRect(40 + i * 54, 280 - h, 36, h))
        g.fillStyle = "rgba(16,44,37,.2)"
        for (let i = 0; i < 4; i++) g.fillRect(380, 80 + i * 50, 100, 26)
      }),
    [],
  )
  const wall = <meshStandardMaterial color="#f1efe8" roughness={0.8} />
  const wood = <meshStandardMaterial color="#b08d64" roughness={0.6} />
  const steel = <meshStandardMaterial color="#3b4048" roughness={0.5} metalness={0.5} />
  const glow = <meshStandardMaterial color="#dfeee2" emissive="#8DAA91" emissiveIntensity={0.6} roughness={0.3} />
  return (
    <group position={[c.x, y, c.z]}>
      {/* Floor, back wall, side walls, roof beam */}
      <mesh position={[0, 0.08, -0.4]} receiveShadow castShadow>
        <boxGeometry args={[7.6, 0.16, 4.8]} />
        <meshStandardMaterial color="#d9cdb8" roughness={0.8} />
      </mesh>
      <mesh position={[0, 1.55, -2.7]} castShadow receiveShadow>
        <boxGeometry args={[7.6, 2.8, 0.16]} />
        {wall}
      </mesh>
      {[-3.72, 3.72].map((x) => (
        <mesh key={x} position={[x, 1.55, -1.5]} castShadow receiveShadow>
          <boxGeometry args={[0.16, 2.8, 2.4]} />
          {wall}
        </mesh>
      ))}
      <mesh position={[0, 3.0, -1.5]} castShadow>
        <boxGeometry args={[8, 0.14, 2.9]} />
        <meshStandardMaterial color="#183F35" roughness={0.6} />
      </mesh>
      <mesh position={[0, 2.35, -2.61]}>
        <planeGeometry args={[2.6, 0.65]} />
        <meshBasicMaterial map={sign} toneMapped={false} />
      </mesh>
      <mesh position={[2.4, 1.6, -2.61]}>
        <planeGeometry args={[1.5, 1]} />
        <meshStandardMaterial color="#8fb0bd" roughness={0.15} metalness={0.4} />
      </mesh>

      {/* Desk with a computer, keyboard and chair */}
      <group position={[-1.6, 0.16, -1.5]}>
        <mesh position={[0, 0.74, 0]} castShadow receiveShadow>
          <boxGeometry args={[2.2, 0.07, 0.95]} />
          {wood}
        </mesh>
        {[[-1, -0.4], [1, -0.4], [-1, 0.4], [1, 0.4]].map(([x, z], i) => (
          <mesh key={i} position={[x, 0.36, z]}>
            <boxGeometry args={[0.06, 0.72, 0.06]} />
            {steel}
          </mesh>
        ))}
        <mesh position={[0, 1.28, -0.2]} castShadow>
          <boxGeometry args={[1.1, 0.68, 0.05]} />
          {steel}
        </mesh>
        <mesh position={[0, 1.28, -0.172]}>
          <planeGeometry args={[1.02, 0.6]} />
          <meshBasicMaterial map={screen} toneMapped={false} />
        </mesh>
        <mesh position={[0, 0.88, -0.2]}>
          <boxGeometry args={[0.08, 0.24, 0.06]} />
          {steel}
        </mesh>
        <mesh position={[0, 0.79, 0.18]}>
          <boxGeometry args={[0.6, 0.025, 0.2]} />
          {steel}
        </mesh>
        {/* Chair */}
        <mesh position={[0, 0.48, 0.95]} castShadow>
          <boxGeometry args={[0.5, 0.07, 0.5]} />
          <meshStandardMaterial color="#183F35" roughness={0.7} />
        </mesh>
        <mesh position={[0, 0.85, 1.18]} castShadow>
          <boxGeometry args={[0.5, 0.65, 0.07]} />
          <meshStandardMaterial color="#183F35" roughness={0.7} />
        </mesh>
        <mesh position={[0, 0.24, 0.95]}>
          <cylinderGeometry args={[0.04, 0.04, 0.46, 8]} />
          {steel}
        </mesh>
      </group>

      {/* Tablets on stands */}
      {[0.1, 0.75].map((x, i) => (
        <group key={x} position={[x, 0.16, -2.1]}>
          <mesh position={[0, 0.5, 0]}>
            <cylinderGeometry args={[0.03, 0.05, 1, 10]} />
            {steel}
          </mesh>
          <group position={[0, 1.12, 0.03]} rotation={[-0.35, i ? -0.2 : 0.2, 0]}>
            <mesh castShadow>
              <boxGeometry args={[0.34, 0.46, 0.025]} />
              {steel}
            </mesh>
            <mesh position={[0, 0, 0.014]}>
              <planeGeometry args={[0.3, 0.42]} />
              {glow}
            </mesh>
          </group>
        </group>
      ))}

      {/* Display table with the 3D mine model */}
      <group position={[2.2, 0.16, -1.2]}>
        <mesh position={[0, 0.42, 0]} castShadow receiveShadow>
          <cylinderGeometry args={[0.85, 0.75, 0.84, 32]} />
          {wall}
        </mesh>
        <group position={[0, 1.1, 0]}>
          <MineModel />
        </group>
      </group>

      {/* A plant by the door */}
      <group position={[-3.3, 0.16, 0.9]}>
        <mesh position={[0, 0.2, 0]} castShadow>
          <cylinderGeometry args={[0.2, 0.15, 0.4, 12]} />
          <meshStandardMaterial color="#c9c5bb" roughness={0.8} />
        </mesh>
        <mesh position={[0, 0.7, 0]} castShadow>
          <icosahedronGeometry args={[0.42, 1]} />
          <meshStandardMaterial color="#4f7a4c" roughness={0.9} flatShading />
        </mesh>
      </group>
    </group>
  )
}

/**
 * About: objects that stand for who he is. A graduation cap on a plinth (the
 * degree), a desk with a laptop and a hard hat (engineer and developer), two
 * membership plaques, a bench and a flag.
 */
function AboutSite() {
  const a = SITES.about
  const y = useMemo(() => topHeight(a.x, a.z), [a])
  const cap = useRef<THREE.Group>(null!)
  const plaque = (title: string, sub: string) =>
    canvasTexture(512, 320, (g) => {
      g.fillStyle = "#183F35"
      g.fillRect(0, 0, 512, 320)
      g.strokeStyle = "#8DAA91"
      g.lineWidth = 6
      g.strokeRect(18, 18, 476, 284)
      g.fillStyle = "#F6F7F3"
      g.textAlign = "center"
      g.textBaseline = "middle"
      g.font = "700 76px 'Space Grotesk', system-ui, sans-serif"
      g.fillText(title, 256, 130)
      g.font = "500 30px Inter, system-ui, sans-serif"
      g.fillStyle = "#cfe0d2"
      g.fillText(sub, 256, 215)
    })
  const iesl = useMemo(() => plaque("IESL", "Associate Member"), [])
  const ea = useMemo(() => plaque("EA", "Engineers Australia"), [])
  const code = useMemo(
    () =>
      canvasTexture(256, 160, (g) => {
        g.fillStyle = "#102C25"
        g.fillRect(0, 0, 256, 160)
        ;["#8DAA91", "#F6F7F3", "#e0c070", "#8DAA91", "#F6F7F3"].forEach((c, i) => {
          g.fillStyle = c
          g.fillRect(16 + (i % 3) * 14, 22 + i * 24, 90 + ((i * 53) % 110), 9)
        })
      }),
    [],
  )
  useFrame((state) => {
    cap.current.rotation.y = state.clock.elapsedTime * 0.5
    cap.current.position.y = 1.55 + Math.sin(state.clock.elapsedTime * 1.2) * 0.05
  })
  const wood = <meshStandardMaterial color="#8a6a4a" roughness={0.8} />
  const steel = <meshStandardMaterial color="#3b4048" roughness={0.5} metalness={0.5} />
  const stone = <meshStandardMaterial color="#f1efe8" roughness={0.7} />
  const black = <meshStandardMaterial color="#1b1f1d" roughness={0.5} />
  return (
    <group position={[a.x, y, a.z]}>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.03, 0]} receiveShadow>
        <circleGeometry args={[4.6, 48]} />
        <meshStandardMaterial color="#e9eadf" roughness={0.9} />
      </mesh>

      {/* Degree: a graduation cap turning on a plinth */}
      <group position={[-1.2, 0, -0.6]}>
        <mesh position={[0, 0.5, 0]} castShadow>
          <cylinderGeometry args={[0.55, 0.62, 1, 28]} />
          {stone}
        </mesh>
        <group ref={cap} position={[0, 1.55, 0]}>
          <mesh castShadow>
            <cylinderGeometry args={[0.3, 0.33, 0.24, 24]} />
            {black}
          </mesh>
          <mesh position={[0, 0.15, 0]} rotation={[0, Math.PI / 4, 0]} castShadow>
            <boxGeometry args={[0.95, 0.04, 0.95]} />
            {black}
          </mesh>
          <mesh position={[0, 0.18, 0]}>
            <sphereGeometry args={[0.04, 10, 8]} />
            <meshStandardMaterial color="#e0c070" roughness={0.4} metalness={0.5} />
          </mesh>
          <mesh position={[0.4, 0.0, 0.4]}>
            <cylinderGeometry args={[0.012, 0.012, 0.36, 6]} />
            <meshStandardMaterial color="#e0c070" roughness={0.4} />
          </mesh>
          <mesh position={[0.4, -0.2, 0.4]}>
            <coneGeometry args={[0.04, 0.12, 8]} />
            <meshStandardMaterial color="#e0c070" roughness={0.4} />
          </mesh>
        </group>
      </group>

      {/* Engineer and developer: a desk with a laptop, a hard hat and a rock sample */}
      <group position={[0.9, 0, -1.5]} rotation={[0, -0.25, 0]}>
        <mesh position={[0, 0.78, 0]} castShadow receiveShadow>
          <boxGeometry args={[1.8, 0.07, 0.85]} />
          {wood}
        </mesh>
        {[[-0.8, -0.35], [0.8, -0.35], [-0.8, 0.35], [0.8, 0.35]].map(([x, z], i) => (
          <mesh key={i} position={[x, 0.39, z]}>
            <boxGeometry args={[0.06, 0.78, 0.06]} />
            {steel}
          </mesh>
        ))}
        <mesh position={[-0.35, 0.83, 0.05]} castShadow>
          <boxGeometry args={[0.6, 0.025, 0.4]} />
          {steel}
        </mesh>
        <group position={[-0.35, 0.84, -0.15]} rotation={[-0.3, 0, 0]}>
          <mesh position={[0, 0.2, 0]} castShadow>
            <boxGeometry args={[0.6, 0.4, 0.02]} />
            {steel}
          </mesh>
          <mesh position={[0, 0.2, 0.011]}>
            <planeGeometry args={[0.55, 0.35]} />
            <meshBasicMaterial map={code} toneMapped={false} />
          </mesh>
        </group>
        <group position={[0.45, 0.815, 0.05]}>
          <mesh scale={[1, 0.72, 1.04]} castShadow>
            <sphereGeometry args={[0.2, 20, 12, 0, Math.PI * 2, 0, Math.PI / 2]} />
            <meshStandardMaterial color="#f2c200" roughness={0.3} />
          </mesh>
          <mesh position={[0, 0.005, 0.04]} scale={[1.08, 0.05, 1.22]}>
            <cylinderGeometry args={[0.2, 0.2, 1, 20]} />
            <meshStandardMaterial color="#f2c200" roughness={0.3} />
          </mesh>
        </group>
        <mesh position={[0.05, 0.87, 0.25]} rotation={[0.4, 0.8, 0]} castShadow>
          <dodecahedronGeometry args={[0.09, 0]} />
          <meshStandardMaterial color="#8c8378" roughness={1} flatShading />
        </mesh>
      </group>

      {/* Memberships: two plaques on posts */}
      {[
        [-3.1, 0.6, iesl, 0.5],
        [3.2, -0.2, ea, -0.5],
      ].map(([x, z, tex, r], i) => (
        <group key={i} position={[x as number, 0, z as number]} rotation={[0, r as number, 0]}>
          <mesh position={[0, 0.7, 0]}>
            <cylinderGeometry args={[0.04, 0.05, 1.4, 10]} />
            {steel}
          </mesh>
          <mesh position={[0, 1.6, 0]} castShadow>
            <boxGeometry args={[1.2, 0.78, 0.06]} />
            {steel}
          </mesh>
          <mesh position={[0, 1.6, 0.032]}>
            <planeGeometry args={[1.12, 0.7]} />
            <meshBasicMaterial map={tex as THREE.Texture} toneMapped={false} />
          </mesh>
        </group>
      ))}

      {/* A bench and a flag */}
      <group position={[-2.6, 0, 2.2]} rotation={[0, 0.9, 0]}>
        <mesh position={[0, 0.45, 0]} castShadow>
          <boxGeometry args={[1.8, 0.08, 0.5]} />
          {wood}
        </mesh>
        <mesh position={[0, 0.8, -0.24]} rotation={[0.15, 0, 0]} castShadow>
          <boxGeometry args={[1.8, 0.5, 0.06]} />
          {wood}
        </mesh>
        {[-0.75, 0.75].map((x) => (
          <mesh key={x} position={[x, 0.22, 0]}>
            <boxGeometry args={[0.08, 0.45, 0.45]} />
            {steel}
          </mesh>
        ))}
      </group>
      <mesh position={[3.4, 1.9, -2.6]} castShadow>
        <cylinderGeometry args={[0.035, 0.035, 3.8, 8]} />
        {steel}
      </mesh>
      <mesh position={[3.85, 3.45, -2.6]}>
        <boxGeometry args={[0.9, 0.55, 0.02]} />
        <meshStandardMaterial color="#183F35" roughness={0.7} />
      </mesh>
    </group>
  )
}

export default function Landmarks() {
  return (
    <group>
      {sections.map((s, i) => (i === 0 ? null : <Beacon key={s.id} index={i} />))}

      <AboutSite />
      <Office />
    </group>
  )
}
