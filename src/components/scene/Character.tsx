"use client"

import { useFrame, useThree } from "@react-three/fiber"
import { useMemo, useRef } from "react"
import * as THREE from "three"

import { WORLD_ORIGIN, sectionAt, sections } from "@/lib/sections"
import { rig } from "@/lib/store"
import { topHeight } from "@/three/terrain"

/**
 * The guide: a stylised cartoon boy with an oversized head, curly black hair,
 * a dark-green hoodie, trousers and sneakers. He wears a safety helmet only
 * in the mining and construction scenes. Built procedurally from smooth
 * primitives (a prototype stand-in for a sculpted GLB character).
 *
 * He does not walk between worlds. He dissolves into green particles and
 * reappears at the next stop.
 */

const PARTICLES = 140

export function Character() {
  const root = useRef<THREE.Group>(null!)
  const body = useRef<THREE.Group>(null!)
  const head = useRef<THREE.Group>(null!)
  const armL = useRef<THREE.Group>(null!)
  const armR = useRef<THREE.Group>(null!)
  const eyes = useRef<THREE.Group>(null!)
  const helmet = useRef<THREE.Group>(null!)
  const tablet = useRef<THREE.Group>(null!)
  const points = useRef<THREE.Points>(null!)
  const camera = useThree((s) => s.camera)
  const blink = useRef(2)

  const mats = useMemo(
    () => ({
      skin: new THREE.MeshStandardMaterial({ color: 0xe0ac7e, roughness: 0.6 }),
      hoodie: new THREE.MeshStandardMaterial({ color: 0x1d4a3e, roughness: 0.8 }),
      hoodieDark: new THREE.MeshStandardMaterial({ color: 0x163a31, roughness: 0.85 }),
      trousers: new THREE.MeshStandardMaterial({ color: 0x3a4046, roughness: 0.85 }),
      shoe: new THREE.MeshStandardMaterial({ color: 0xf2f2ee, roughness: 0.5 }),
      sole: new THREE.MeshStandardMaterial({ color: 0x8DAA91, roughness: 0.6 }),
      hair: new THREE.MeshStandardMaterial({ color: 0x14100e, roughness: 0.75 }),
      white: new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.25 }),
      iris: new THREE.MeshStandardMaterial({ color: 0x3a2416, roughness: 0.2 }),
      black: new THREE.MeshStandardMaterial({ color: 0x0a0807, roughness: 0.2 }),
      mouth: new THREE.MeshStandardMaterial({ color: 0x8a3b32, roughness: 0.5 }),
      cheek: new THREE.MeshStandardMaterial({ color: 0xe89a80, roughness: 0.7, transparent: true, opacity: 0.55 }),
      helmet: new THREE.MeshStandardMaterial({ color: 0xf2c200, roughness: 0.35 }),
      tablet: new THREE.MeshStandardMaterial({ color: 0x1b1f1d, roughness: 0.3, metalness: 0.4 }),
      screen: new THREE.MeshStandardMaterial({ color: 0xdfeee2, emissive: 0x8DAA91, emissiveIntensity: 0.7, roughness: 0.2 }),
    }),
    [],
  )

  // Curls: instanced spheres over the top and back of the head.
  const curls = useMemo(() => {
    const out: { p: [number, number, number]; s: number }[] = []
    for (let i = 0; i < 300; i++) {
      const y = 1 - (i / 299) * 1.25
      const r = Math.sqrt(Math.max(0, 1 - y * y))
      const phi = i * 2.399963
      const x = Math.cos(phi) * r
      const z = Math.sin(phi) * r
      if (z > 0.35 && y < 0.42) continue // keep the face clear
      if (y < -0.25) continue
      const lift = 1.06 + 0.07 * Math.sin(i * 1.7)
      out.push({ p: [x * 0.44 * lift, 0.02 + y * 0.43 * lift, z * 0.43 * lift - 0.02], s: 0.085 + ((i * 37) % 7) * 0.006 })
    }
    return out
  }, [])

  const particles = useMemo(() => {
    const dir = new Float32Array(PARTICLES * 3)
    const pos = new Float32Array(PARTICLES * 3)
    for (let i = 0; i < PARTICLES; i++) {
      const a = Math.random() * Math.PI * 2
      const r = 0.25 + Math.random() * 0.75
      dir.set([Math.cos(a) * r, Math.random() * 1.9, Math.sin(a) * r], i * 3)
    }
    const g = new THREE.BufferGeometry()
    g.setAttribute("position", new THREE.BufferAttribute(pos, 3))
    return { g, dir }
  }, [])

  const tmp = useMemo(() => new THREE.Vector3(), [])

  useFrame((state, dt) => {
    const t = state.clock.elapsedTime
    const s = sections[sectionAt(rig.time)]
    const o = WORLD_ORIGIN[s.world]
    const [x, , z] = s.spot.pos
    const y = s.world === "mine" ? topHeight(x, z) : s.spot.pos[1]
    root.current.position.set(o[0] + x, o[1] + y, o[2] + z)
    root.current.scale.setScalar(s.spot.scale)

    // Dissolve: the body shrinks and spins away while particles swirl up.
    const d = THREE.MathUtils.clamp(rig.dissolve, 0, 1)
    const solid = 1 - THREE.MathUtils.smoothstep(d, 0.05, 0.8)
    body.current.visible = solid > 0.01
    body.current.scale.set(solid, 0.4 + 0.6 * solid, solid)
    body.current.rotation.y = s.spot.rotY + d * d * 6
    const arr = particles.g.attributes.position.array as Float32Array
    const spread = 0.35 + d * 1.1
    for (let i = 0; i < PARTICLES; i++) {
      const swirl = t * 2 + i
      arr[i * 3] = particles.dir[i * 3] * spread + Math.cos(swirl) * 0.08
      arr[i * 3 + 1] = particles.dir[i * 3 + 1] * (0.6 + d * 0.9) + d * 0.5 + Math.sin(swirl * 1.3) * 0.05
      arr[i * 3 + 2] = particles.dir[i * 3 + 2] * spread + Math.sin(swirl) * 0.08
    }
    particles.g.attributes.position.needsUpdate = true
    const pm = points.current.material as THREE.PointsMaterial
    pm.opacity = Math.sin(Math.PI * Math.min(1, d * 1.05)) * 0.95
    points.current.visible = pm.opacity > 0.01

    // Idle life: breathing, a small bounce, a wave, and looking at the camera.
    body.current.position.y = Math.sin(t * 2.2) * 0.012
    head.current.getWorldPosition(tmp)
    const local = root.current.worldToLocal(camera.position.clone())
    const yaw = THREE.MathUtils.clamp(Math.atan2(local.x, local.z) - body.current.rotation.y, -0.8, 0.8)
    head.current.rotation.y = THREE.MathUtils.lerp(head.current.rotation.y, yaw, 1 - Math.pow(0.01, dt))
    head.current.rotation.z = Math.sin(t * 0.9) * 0.04
    helmet.current.visible = s.helmet
    // The helmet sits on the hair: hide the curls it would cover.
    for (const child of head.current.children) if (child.userData.top) child.visible = !s.helmet
    tablet.current.visible = s.tablet
    const waving = s.wave && Math.sin(t * 0.6) > -0.2
    armR.current.rotation.z = THREE.MathUtils.lerp(armR.current.rotation.z, waving ? -2.5 + Math.sin(t * 7) * 0.3 : -0.12, 1 - Math.pow(0.002, dt))
    armL.current.rotation.x = THREE.MathUtils.lerp(armL.current.rotation.x, s.tablet ? -1.1 : Math.sin(t * 1.4) * 0.05, 1 - Math.pow(0.002, dt))
    armL.current.rotation.z = 0.12

    blink.current -= dt
    if (blink.current < -0.12) blink.current = 2 + Math.random() * 3
    eyes.current.scale.y = blink.current < 0 ? 0.1 : 1
  })

  return (
    <group ref={root}>
      <points ref={points} geometry={particles.g} frustumCulled={false}>
        <pointsMaterial color="#b7e3c0" size={0.07} transparent opacity={0} depthWrite={false} sizeAttenuation />
      </points>

      <group ref={body}>
        {/* Legs and sneakers */}
        {[-1, 1].map((side) => (
          <group key={side} position={[side * 0.13, 0, 0]}>
            <mesh material={mats.trousers} position={[0, 0.33, 0]} castShadow>
              <capsuleGeometry args={[0.095, 0.36, 6, 12]} />
            </mesh>
            <mesh material={mats.shoe} position={[0, 0.07, 0.06]} rotation={[Math.PI / 2, 0, 0]} castShadow>
              <capsuleGeometry args={[0.085, 0.16, 6, 12]} />
            </mesh>
            <mesh material={mats.sole} position={[0, 0.015, 0.06]}>
              <boxGeometry args={[0.17, 0.03, 0.34]} />
            </mesh>
          </group>
        ))}

        {/* Hoodie: torso, pocket, hood, drawstrings */}
        <mesh material={mats.hoodie} position={[0, 0.82, 0]} scale={[1, 1, 0.82]} castShadow>
          <capsuleGeometry args={[0.24, 0.26, 8, 16]} />
        </mesh>
        <mesh material={mats.hoodieDark} position={[0, 0.7, 0.19]} scale={[1, 0.6, 0.3]}>
          <sphereGeometry args={[0.16, 16, 12]} />
        </mesh>
        <mesh material={mats.hoodieDark} position={[0, 1.08, -0.14]} scale={[1.05, 0.7, 0.8]} castShadow>
          <sphereGeometry args={[0.22, 16, 12]} />
        </mesh>
        {[-1, 1].map((side) => (
          <mesh key={side} material={mats.white} position={[side * 0.06, 0.95, 0.2]}>
            <capsuleGeometry args={[0.008, 0.12, 4, 6]} />
          </mesh>
        ))}

        {/* Arms */}
        <group ref={armL} position={[-0.29, 1.02, 0]}>
          <mesh material={mats.hoodie} position={[0, -0.2, 0]} castShadow>
            <capsuleGeometry args={[0.075, 0.3, 6, 12]} />
          </mesh>
          <mesh material={mats.skin} position={[0, -0.42, 0]}>
            <sphereGeometry args={[0.075, 14, 10]} />
          </mesh>
          <group ref={tablet} position={[0.06, -0.46, 0.1]} rotation={[-0.5, 0.2, 0]}>
            <mesh material={mats.tablet}>
              <boxGeometry args={[0.3, 0.4, 0.02]} />
            </mesh>
            <mesh material={mats.screen} position={[0, 0, 0.011]}>
              <planeGeometry args={[0.26, 0.36]} />
            </mesh>
          </group>
        </group>
        <group ref={armR} position={[0.29, 1.02, 0]}>
          <mesh material={mats.hoodie} position={[0, -0.2, 0]} castShadow>
            <capsuleGeometry args={[0.075, 0.3, 6, 12]} />
          </mesh>
          <mesh material={mats.skin} position={[0, -0.42, 0]}>
            <sphereGeometry args={[0.075, 14, 10]} />
          </mesh>
        </group>

        {/* Oversized head */}
        <group ref={head} position={[0, 1.55, 0]}>
          <mesh material={mats.skin} scale={[1, 0.96, 0.95]} castShadow>
            <sphereGeometry args={[0.42, 32, 24]} />
          </mesh>
          {[-1, 1].map((side) => (
            <mesh key={side} material={mats.skin} position={[side * 0.41, -0.03, 0]} scale={[0.5, 1, 0.8]}>
              <sphereGeometry args={[0.09, 12, 10]} />
            </mesh>
          ))}
          <group ref={eyes}>
            {[-1, 1].map((side) => (
              <group key={side} position={[side * 0.155, 0.0, 0.345]}>
                <mesh material={mats.white} scale={[1, 1.15, 0.5]}>
                  <sphereGeometry args={[0.095, 20, 16]} />
                </mesh>
                <mesh material={mats.iris} position={[0, -0.005, 0.035]} scale={[1, 1.1, 0.4]}>
                  <sphereGeometry args={[0.058, 16, 12]} />
                </mesh>
                <mesh material={mats.black} position={[0, -0.005, 0.05]} scale={[1, 1.1, 0.4]}>
                  <sphereGeometry args={[0.032, 12, 10]} />
                </mesh>
                <mesh material={mats.white} position={[0.02, 0.025, 0.062]}>
                  <sphereGeometry args={[0.012, 8, 6]} />
                </mesh>
              </group>
            ))}
          </group>
          {[-1, 1].map((side) => (
            <mesh key={side} material={mats.hair} position={[side * 0.16, 0.15, 0.37]} rotation={[0, 0, Math.PI / 2 + side * -0.2]}>
              <capsuleGeometry args={[0.014, 0.09, 4, 8]} />
            </mesh>
          ))}
          <mesh material={mats.skin} position={[0, -0.09, 0.41]}>
            <sphereGeometry args={[0.04, 12, 10]} />
          </mesh>
          <mesh material={mats.mouth} position={[0, -0.2, 0.36]} rotation={[0.25, 0, Math.PI]}>
            <torusGeometry args={[0.075, 0.016, 8, 16, Math.PI]} />
          </mesh>
          {[-1, 1].map((side) => (
            <mesh key={side} material={mats.cheek} position={[side * 0.25, -0.13, 0.3]} scale={[1, 0.7, 0.3]}>
              <sphereGeometry args={[0.06, 10, 8]} />
            </mesh>
          ))}
          {curls.map((c, i) => (
            <mesh key={i} material={mats.hair} position={c.p} scale={c.s} castShadow={i % 6 === 0} userData={{ top: c.p[1] > 0.1 }}>
              <icosahedronGeometry args={[1, 1]} />
            </mesh>
          ))}
          <group ref={helmet} position={[0, 0.12, 0]} scale={1.04}>
            <mesh material={mats.helmet} scale={[1, 0.72, 1.02]} castShadow>
              <sphereGeometry args={[0.5, 24, 14, 0, Math.PI * 2, 0, Math.PI / 2]} />
            </mesh>
            <mesh material={mats.helmet} position={[0, 0.0, 0.1]} scale={[1.08, 0.05, 1.22]}>
              <cylinderGeometry args={[0.5, 0.5, 1, 24]} />
            </mesh>
            <mesh material={mats.helmet} position={[0, 0.2, 0]} scale={[0.12, 0.5, 0.95]}>
              <sphereGeometry args={[0.5, 12, 8, 0, Math.PI * 2, 0, Math.PI / 2]} />
            </mesh>
          </group>
        </group>
      </group>
    </group>
  )
}
