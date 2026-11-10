"use client"

import { useFrame } from "@react-three/fiber"
import { useMemo, useRef } from "react"
import * as THREE from "three"

import { Assemble, canvasTexture, overUi } from "@/components/scene/helpers"
import { experience, type Role } from "@/lib/content"
import { useWorld } from "@/lib/store"

/**
 * World four: a miniature engineering and technology landscape. A path runs
 * forward in time past one small location per real role. The quarry, crusher,
 * tunnel portal and survey house are scenery for the kinds of sites this work
 * touches; they carry no role claims of their own.
 */

const PATH: [number, number][] = [[-9, 5], [-5.5, 0.5], [-1, 3.2], [3.4, -0.6], [8, 2.6]]

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

function Stop({ role, index }: { role: Role; index: number }) {
  const set = useWorld((s) => s.set)
  const active = useWorld((s) => s.active === 4)
  const current = useWorld((s) => s.roleIndex === index)
  const beacon = useRef<THREE.Mesh>(null!)
  const [x, z] = PATH[index]
  const year = useMemo(
    () =>
      canvasTexture(256, 96, (g) => {
        g.clearRect(0, 0, 256, 96)
        g.fillStyle = "#183F35"
        g.font = "600 44px 'Space Grotesk', system-ui, sans-serif"
        g.textAlign = "center"
        g.textBaseline = "middle"
        g.fillText(role.period.split(" - ")[0], 128, 50)
      }),
    [role],
  )
  useFrame((state) => {
    const m = beacon.current.material as THREE.MeshBasicMaterial
    m.opacity += ((current && active ? 0.55 + 0.25 * Math.sin(state.clock.elapsedTime * 3) : 0) - m.opacity) * 0.1
  })
  return (
    <Assemble world="experience" order={index + 1} position={[x, 0.3, z - 2.2]}>
      <group
        onClick={(e) => {
          if (!active || overUi(e)) return
          e.stopPropagation()
          set({ roleIndex: index, panel: { kind: "role", role } })
        }}
        onPointerOver={() => active && (document.body.style.cursor = "pointer")}
        onPointerOut={() => (document.body.style.cursor = "")}
      >
        <Place kind={role.place} />
      </group>
      <mesh ref={beacon} position={[0, 0.03, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[1.7, 1.85, 48]} />
        <meshBasicMaterial color="#183F35" transparent opacity={0} />
      </mesh>
      {/* Year marker on the path */}
      <mesh position={[0, 0.02, 2.2]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[1.3, 0.5]} />
        <meshBasicMaterial map={year} transparent toneMapped={false} />
      </mesh>
    </Assemble>
  )
}

export default function ExperienceWorld() {
  const path = useMemo(() => {
    const curve = new THREE.CatmullRomCurve3(PATH.map(([x, z]) => new THREE.Vector3(x, 0.33, z)))
    return new THREE.TubeGeometry(curve, 120, 0.09, 8, false)
  }, [])

  return (
    <group>
      {/* The model board */}
      <mesh position={[0, 0.15, 0]} receiveShadow castShadow>
        <cylinderGeometry args={[13.5, 13.8, 0.3, 64]} />
        <meshStandardMaterial color="#e9eadf" roughness={0.9} />
      </mesh>
      <mesh position={[0, -0.3, 0]}>
        <cylinderGeometry args={[13.8, 13.2, 0.6, 64]} />
        <meshStandardMaterial color="#183F35" roughness={0.7} />
      </mesh>
      <Assemble world="experience" order={0}>
        <mesh geometry={path} castShadow>
          <meshStandardMaterial color="#183F35" roughness={0.6} />
        </mesh>
        {PATH.map(([x, z], i) => (
          <mesh key={i} position={[x, 0.36, z]}>
            <sphereGeometry args={[0.2, 16, 12]} />
            <meshStandardMaterial color="#F6F7F3" roughness={0.4} />
          </mesh>
        ))}
      </Assemble>

      {experience.map((r, i) => (
        <Stop key={r.id} role={r} index={i} />
      ))}

      {/* Scenery: quarry benches, crusher plant, tunnel portal, survey house */}
      <Assemble world="experience" order={6} position={[-8.5, 0.3, -6.5]}>
        {[0, 1, 2, 3].map((k) => (
          <mesh key={k} position={[k * 0.5, 0.25 + k * 0.5, -k * 0.55]} castShadow receiveShadow>
            <boxGeometry args={[5 - k * 1, 0.5, 2.6 - k * 0.5]} />
            <meshStandardMaterial color={["#cfc6b3", "#c2b8a3", "#b5ab96", "#a89e89"][k]} roughness={1} />
          </mesh>
        ))}
      </Assemble>
      <Assemble world="experience" order={7} position={[-1.5, 0.3, -8.5]}>
        <mesh position={[0, 0.6, 0]} castShadow>
          <boxGeometry args={[1.2, 1.2, 1.1]} />
          <meshStandardMaterial color="#9aa3ab" roughness={0.5} metalness={0.5} />
        </mesh>
        <mesh position={[0, 1.35, 0]} castShadow>
          <boxGeometry args={[1.5, 0.3, 1.4]} />
          <meshStandardMaterial color="#c98f00" roughness={0.6} />
        </mesh>
        <mesh position={[1.9, 1.0, 0]} rotation={[0, 0, 0.32]} castShadow>
          <boxGeometry args={[3.2, 0.1, 0.4]} />
          <meshStandardMaterial color="#2c3632" roughness={0.6} />
        </mesh>
        <mesh position={[3.8, 0.55, 0]} castShadow>
          <coneGeometry args={[1.2, 1.1, 14]} />
          <meshStandardMaterial color="#8a857c" roughness={1} flatShading />
        </mesh>
      </Assemble>
      <Assemble world="experience" order={8} position={[7.5, 0.3, -7]}>
        <mesh position={[0, 0.9, 0]} scale={[1.5, 0.6, 1]} castShadow>
          <sphereGeometry args={[2.6, 20, 12, 0, Math.PI * 2, 0, Math.PI / 2]} />
          <meshStandardMaterial color="#8f9a80" roughness={1} flatShading />
        </mesh>
        <mesh position={[0, 0.75, 2.45]} rotation={[0.25, 0, 0]}>
          <cylinderGeometry args={[0.85, 0.85, 0.5, 20, 1, false, 0, Math.PI]} />
          <meshStandardMaterial color="#c9c6be" roughness={0.8} />
        </mesh>
        <mesh position={[0, 0.7, 2.62]}>
          <circleGeometry args={[0.68, 20, 0, Math.PI]} />
          <meshStandardMaterial color="#151a18" />
        </mesh>
      </Assemble>
      <Assemble world="experience" order={9} position={[9.8, 0.3, 7]}>
        <mesh position={[0, 0.55, 0]} castShadow>
          <boxGeometry args={[1.7, 1.1, 1.3]} />
          <meshStandardMaterial color="#ece6da" roughness={0.9} />
        </mesh>
        <mesh position={[0, 1.38, 0]} rotation={[0, Math.PI / 4, 0]} scale={[1, 0.5, 0.78]} castShadow>
          <coneGeometry args={[1.35, 1, 4]} />
          <meshStandardMaterial color="#7c4a3a" roughness={0.85} />
        </mesh>
      </Assemble>
    </group>
  )
}
