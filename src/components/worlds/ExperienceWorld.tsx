"use client"

import { useFrame } from "@react-three/fiber"
import { useMemo, useRef } from "react"
import * as THREE from "three"

import { Assemble, OneAtATime, canvasTexture } from "@/components/scene/helpers"
import { experience, type Role } from "@/lib/content"
import { zoneIndex } from "@/lib/sections"
import { useWorld } from "@/lib/store"

const HERE = zoneIndex("experience")

/** The experience site: a career told one role at a time. */


function Place({ kind }: { kind: Role["place"] }) {
  const glass = <meshStandardMaterial color="#8fb0bd" roughness={0.15} metalness={0.5} />
  const white = <meshStandardMaterial color="#f1efe8" roughness={0.7} />
  const dark = <meshStandardMaterial color="#2c3632" roughness={0.6} />
  if (kind === "studio")
    return (
      <>
        <mesh position={[0, 0.6, 0]} castShadow>
          <boxGeometry args={[1.8, 1.2, 1.3]} />
          {white}
        </mesh>
        <mesh position={[0, 0.65, 0.66]}>
          <planeGeometry args={[1.4, 0.7]} />
          {glass}
        </mesh>
        {/* A phone on the roof: mobile apps were built here */}
        <mesh position={[0.5, 1.75, 0]} rotation={[0, 0.4, 0.1]} castShadow>
          <boxGeometry args={[0.5, 0.95, 0.07]} />
          {dark}
        </mesh>
        <mesh position={[0.5, 1.75, 0.04]} rotation={[0, 0.4, 0.1]}>
          <planeGeometry args={[0.42, 0.82]} />
          <meshStandardMaterial color="#dfeee2" emissive="#8DAA91" emissiveIntensity={0.5} />
        </mesh>
      </>
    )
  if (kind === "university")
    return (
      <>
        <mesh position={[0, 0.15, 0]} castShadow>
          <boxGeometry args={[2.6, 0.3, 1.6]} />
          {white}
        </mesh>
        {[-0.9, -0.3, 0.3, 0.9].map((x) => (
          <mesh key={x} position={[x, 0.85, 0.55]} castShadow>
            <cylinderGeometry args={[0.09, 0.09, 1.1, 10]} />
            {white}
          </mesh>
        ))}
        <mesh position={[0, 0.85, -0.1]} castShadow>
          <boxGeometry args={[2.3, 1.1, 1]} />
          <meshStandardMaterial color="#e6dfcf" roughness={0.8} />
        </mesh>
        <mesh position={[0, 1.62, 0.2]} rotation={[0, Math.PI / 4, 0]} scale={[1, 0.35, 0.62]} castShadow>
          <coneGeometry args={[1.75, 1, 4]} />
          <meshStandardMaterial color="#7c4a3a" roughness={0.8} />
        </mesh>
      </>
    )
  if (kind === "office")
    return (
      <>
        <mesh position={[0, 1, 0]} castShadow>
          <boxGeometry args={[1.5, 2, 1.3]} />
          {white}
        </mesh>
        {[0.5, 1.1, 1.7].map((y) => (
          <mesh key={y} position={[0, y, 0.66]}>
            <planeGeometry args={[1.2, 0.32]} />
            {glass}
          </mesh>
        ))}
      </>
    )
  if (kind === "tunnel")
    return (
      <>
        {/* The hill the tunnel is driven through */}
        <mesh position={[-0.5, 0, -0.2]} scale={[1.5, 1.1, 1.2]} castShadow>
          <sphereGeometry args={[1, 24, 14, 0, Math.PI * 2, 0, Math.PI / 2]} />
          <meshStandardMaterial color="#7d8f6c" roughness={1} />
        </mesh>
        {/* Concrete portal and the dark bore */}
        <mesh position={[0.55, 0.42, 0.62]} rotation={[0, 0.5, 0]} castShadow>
          <torusGeometry args={[0.42, 0.09, 10, 28]} />
          {white}
        </mesh>
        <mesh position={[0.53, 0.42, 0.6]} rotation={[0, 0.5, 0]}>
          <circleGeometry args={[0.42, 28]} />
          <meshStandardMaterial color="#1c211f" roughness={1} />
        </mesh>
        {/* The TBM: cutterhead and shield, ready to enter */}
        <group position={[1.05, 0.42, 1.5]} rotation={[0, 0.5, 0]}>
          <mesh rotation={[Math.PI / 2, 0, 0]} castShadow>
            <cylinderGeometry args={[0.36, 0.36, 0.9, 24]} />
            <meshStandardMaterial color="#dfe4e0" roughness={0.5} metalness={0.3} />
          </mesh>
          <mesh position={[0, 0, -0.47]} rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.38, 0.38, 0.06, 24]} />
            <meshStandardMaterial color="#f0b000" roughness={0.5} />
          </mesh>
          {[0, 1, 2].map((k) => (
            <mesh key={k} position={[0, 0, -0.505]} rotation={[0, 0, (k * Math.PI) / 3]}>
              <boxGeometry args={[0.7, 0.07, 0.02]} />
              {dark}
            </mesh>
          ))}
        </group>
        {/* The canal carrying water away */}
        <mesh position={[-0.2, 0.03, 1.55]} rotation={[0, -0.25, 0]}>
          <boxGeometry args={[1.7, 0.06, 0.5]} />
          {white}
        </mesh>
        <mesh position={[-0.2, 0.065, 1.55]} rotation={[-Math.PI / 2, 0, -0.25]}>
          <planeGeometry args={[1.66, 0.34]} />
          <meshStandardMaterial color="#6fa9b8" roughness={0.3} />
        </mesh>
        {/* A survey tripod for setting out */}
        <group position={[-1.2, 0, 1.0]}>
          {[0, 1, 2].map((k) => (
            <mesh key={k} position={[Math.cos(k * 2.1) * 0.09, 0.2, Math.sin(k * 2.1) * 0.09]} rotation={[Math.sin(k * 2.1) * 0.4, 0, -Math.cos(k * 2.1) * 0.4]}>
              <cylinderGeometry args={[0.012, 0.012, 0.44, 6]} />
              {dark}
            </mesh>
          ))}
          <mesh position={[0, 0.45, 0]}>
            <boxGeometry args={[0.12, 0.09, 0.09]} />
            <meshStandardMaterial color="#f0b000" roughness={0.5} />
          </mesh>
        </group>
      </>
    )
  if (kind === "mine")
    return (
      <>
        {[0, 1, 2].map((k) => (
          <mesh key={k} position={[0, -0.02 - k * 0.14, 0]} rotation={[-Math.PI / 2, 0, 0]}>
            <ringGeometry args={[0.35 + (2 - k) * 0.38, 0.35 + (3 - k) * 0.38, 28]} />
            <meshStandardMaterial color={["#a8977f", "#93836d", "#7f715e"][k]} roughness={1} />
          </mesh>
        ))}
        <mesh position={[0, -0.42, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <circleGeometry args={[0.4, 20]} />
          <meshStandardMaterial color="#6f6252" roughness={1} />
        </mesh>
        <mesh position={[1.25, 0.22, 0.5]} castShadow>
          <boxGeometry args={[0.6, 0.3, 0.36]} />
          <meshStandardMaterial color="#f0b000" roughness={0.5} />
        </mesh>
        <mesh position={[-1.3, 0.35, -0.6]} castShadow>
          <boxGeometry args={[0.9, 0.7, 0.6]} />
          {white}
        </mesh>
      </>
    )
  return (
    <>
      <mesh position={[0, 1.6, 0]} castShadow>
        <boxGeometry args={[1.2, 3.2, 1.2]} />
        {glass}
      </mesh>
      <mesh position={[0, 3.3, 0]} castShadow>
        <boxGeometry args={[1.3, 0.12, 1.3]} />
        {dark}
      </mesh>
      {[0.8, 1.6, 2.4].map((y) => (
        <mesh key={y} position={[0, y, 0]}>
          <boxGeometry args={[1.22, 0.04, 1.22]} />
          {dark}
        </mesh>
      ))}
    </>
  )
}

/** A career stage: one role at a time, as a building on the central plinth. */
export default function ExperienceWorld() {
  const sub = useWorld((s) => s.sub)
  const active = useWorld((s) => s.active === HERE)
  const index = active ? Math.min(sub, experience.length - 1) : 0
  const years = useMemo(
    () =>
      experience.map((r) =>
        canvasTexture(640, 128, (g) => {
          g.clearRect(0, 0, 640, 128)
          g.fillStyle = "#183F35"
          g.beginPath()
          g.roundRect(4, 14, 632, 100, 50)
          g.fill()
          g.fillStyle = "#F6F7F3"
          g.font = "600 44px 'Space Grotesk', system-ui, sans-serif"
          g.textAlign = "center"
          g.textBaseline = "middle"
          g.fillText(r.period, 320, 66)
        }),
      ),
    [],
  )
  const tag = useRef<THREE.Mesh>(null!)
  const dots = useRef<THREE.Group>(null!)
  useFrame((state) => {
    tag.current.quaternion.copy(state.camera.quaternion)
    ;(tag.current.material as THREE.MeshBasicMaterial).map = years[index]
    dots.current.children.forEach((c, i) => c.scale.setScalar(c.scale.x + ((i === index ? 1.9 : 1) - c.scale.x) * 0.15))
  })
  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <circleGeometry args={[9, 64]} />
        <meshStandardMaterial color="#e9eadf" roughness={0.9} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.012, 0]}>
        <ringGeometry args={[6.6, 6.65, 96]} />
        <meshBasicMaterial color="#183F35" transparent opacity={0.35} />
      </mesh>
      <Assemble world="experience" order={0} position={[-0.6, 0, -0.8]}>
        <mesh position={[0, 0.4, 0]} castShadow receiveShadow>
          <cylinderGeometry args={[2.3, 2.5, 0.8, 48]} />
          <meshStandardMaterial color="#f1efe8" roughness={0.7} />
        </mesh>
        <group position={[0, 0.82, 0]} scale={1.15}>
          <OneAtATime index={index}>
            {experience.map((r) => (
              <group key={r.id} position={[0, r.place === "mine" ? 0.5 : 0, 0]}>
                <Place kind={r.place} />
              </group>
            ))}
          </OneAtATime>
        </group>
        <mesh ref={tag} position={[0, 5.3, 0]} renderOrder={6}>
          <planeGeometry args={[2.4, 0.48]} />
          <meshBasicMaterial map={years[0]} transparent toneMapped={false} depthWrite={false} />
        </mesh>
        {/* Timeline: one marker per role, oldest on the left */}
        <group ref={dots} position={[0, 0.06, 3.1]}>
          {experience.map((r, i) => (
            <mesh key={r.id} position={[(i - (experience.length - 1) / 2) * 0.8, 0, 0]}>
              <sphereGeometry args={[0.13, 16, 12]} />
              <meshStandardMaterial color="#183F35" roughness={0.5} />
            </mesh>
          ))}
        </group>
      </Assemble>
    </group>
  )
}
