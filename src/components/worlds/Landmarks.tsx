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
 * every place, a bench at the About lookout and a kiosk at Contact.
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

export default function Landmarks() {
  const a = SITES.about
  const c = SITES.contact
  const wood = <meshStandardMaterial color="#8a6a4a" roughness={0.8} />
  const steel = <meshStandardMaterial color="#3b4048" roughness={0.5} metalness={0.5} />
  return (
    <group>
      {sections.map((s, i) => (i === 0 ? null : <Beacon key={s.id} index={i} />))}

      {/* About: a bench and a flag at the pit lookout */}
      <group position={[a.x, topHeight(a.x, a.z), a.z]} rotation={[0, 0.6, 0]}>
        <mesh position={[0, 0.45, 0]} castShadow>
          <boxGeometry args={[1.8, 0.08, 0.5]} />
          {wood}
        </mesh>
        <mesh position={[0, 0.8, -0.24]} rotation={[0.15, 0, 0]} castShadow>
          <boxGeometry args={[1.8, 0.5, 0.06]} />
          {wood}
        </mesh>
        {[-0.75, 0.75].map((x) => (
          <mesh key={x} position={[x, 0.22, 0]} castShadow>
            <boxGeometry args={[0.08, 0.45, 0.45]} />
            {steel}
          </mesh>
        ))}
        <mesh position={[-1.6, 1.6, -0.4]} castShadow>
          <cylinderGeometry args={[0.03, 0.03, 3.2, 8]} />
          {steel}
        </mesh>
        <mesh position={[-1.22, 2.9, -0.4]}>
          <boxGeometry args={[0.75, 0.45, 0.02]} />
          <meshStandardMaterial color="#183F35" roughness={0.7} />
        </mesh>
      </group>

      {/* Contact: a small kiosk with a mailbox */}
      <group position={[c.x, topHeight(c.x, c.z), c.z]}>
        <mesh position={[0, 0.9, 0]} castShadow>
          <boxGeometry args={[1.6, 1.8, 1.1]} />
          <meshStandardMaterial color="#f1efe8" roughness={0.7} />
        </mesh>
        <mesh position={[0, 1.9, 0.1]} castShadow>
          <boxGeometry args={[2, 0.12, 1.6]} />
          <meshStandardMaterial color="#183F35" roughness={0.6} />
        </mesh>
        <mesh position={[0, 1.05, 0.56]}>
          <planeGeometry args={[1.1, 0.6]} />
          <meshStandardMaterial color="#8fb0bd" roughness={0.15} metalness={0.5} />
        </mesh>
        <mesh position={[1.4, 0.55, 0.3]} castShadow>
          <cylinderGeometry args={[0.04, 0.04, 1.1, 8]} />
          {steel}
        </mesh>
        <mesh position={[1.4, 1.2, 0.3]} castShadow>
          <boxGeometry args={[0.35, 0.3, 0.5]} />
          <meshStandardMaterial color="#b5483f" roughness={0.6} />
        </mesh>
      </group>
    </group>
  )
}
