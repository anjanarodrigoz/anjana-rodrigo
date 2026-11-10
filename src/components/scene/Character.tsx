"use client"

import { useFrame, useThree } from "@react-three/fiber"
import { useMemo, useRef } from "react"
import * as THREE from "three"

import { sections } from "@/lib/sections"
import { player, rig, useWorld } from "@/lib/store"

/**
 * The guide: a stylised cartoon boy with an oversized head, short black hair,
 * a dark-green hoodie, trousers and sneakers. He wears a safety helmet only
 * in the mining and construction scenes. Built procedurally from smooth
 * primitives (a prototype stand-in for a sculpted GLB character).
 *
 * He stands facing the viewer and travels by dissolving into green
 * particles and reappearing at the next place.
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

  const gear = useRef({ helmet: true, tablet: false, lab: false })
  const coat = useRef<THREE.Group>(null!)
  const glasses = useRef<THREE.Group>(null!)

  useFrame((state, dt) => {
    const t = state.clock.elapsedTime
    const zone = useWorld.getState().active
    // Helmet and tablet follow the place he is in; elsewhere he keeps the last ones.
    if (zone >= 0) gear.current = { helmet: sections[zone].helmet, tablet: sections[zone].tablet, lab: Boolean(sections[zone].lab) }
    const s = { ...gear.current, wave: zone === 0 }
    root.current.position.set(player.x, player.y, player.z)

    // Dissolve: the body shrinks and spins away while particles swirl up.
    const d = THREE.MathUtils.clamp(rig.dissolve, 0, 1)
    const solid = 1 - THREE.MathUtils.smoothstep(d, 0.05, 0.8)
    body.current.visible = solid > 0.01
    body.current.scale.set(solid, 0.4 + 0.6 * solid, solid)
    body.current.rotation.y = player.heading + d * d * 6
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

    body.current.position.y = Math.sin(t * 2.2) * 0.012
    body.current.rotation.x = 0
    const move = 0
    const sw = 0
    const amp = 0

    const local = root.current.worldToLocal(camera.position.clone())
    // Wrap the difference so a heading past a full turn does not twist his neck.
    const rawYaw = Math.atan2(local.x, local.z) - body.current.rotation.y
    const yaw = THREE.MathUtils.clamp(((rawYaw + Math.PI * 9) % (Math.PI * 2)) - Math.PI, -0.8, 0.8)
    head.current.rotation.y = THREE.MathUtils.lerp(head.current.rotation.y, yaw, 1 - Math.pow(0.01, dt))
    head.current.rotation.z = Math.sin(t * 0.9) * 0.04 * (1 - move)
    helmet.current.visible = s.helmet
    coat.current.visible = s.lab
    glasses.current.visible = s.lab
    tablet.current.visible = s.tablet && move < 0.5
    const waving = s.wave && Math.sin(t * 0.6) > -0.2
    const ease = 1 - Math.pow(0.002, dt)
    armR.current.rotation.z = THREE.MathUtils.lerp(armR.current.rotation.z, waving ? -2.5 + Math.sin(t * 7) * 0.3 : -0.12, ease)
    armR.current.rotation.x = THREE.MathUtils.lerp(armR.current.rotation.x, sw * amp * 0.9, ease * 3)
    const hold = s.tablet && move < 0.5
    armL.current.rotation.x = THREE.MathUtils.lerp(armL.current.rotation.x, hold ? -1.1 : -sw * amp * 0.9, ease * 3)
    armL.current.rotation.z = 0.12

    blink.current -= dt
    if (blink.current < -0.12) blink.current = 2 + Math.random() * 3
    eyes.current.scale.y = blink.current < 0 ? 0.1 : 1
  })

  return (
    <group ref={root} scale={1.35}>
      <points ref={points} geometry={particles.g} frustumCulled={false}>
        <pointsMaterial color="#b7e3c0" size={0.07} transparent opacity={0} depthWrite={false} sizeAttenuation />
      </points>

      <group ref={body}>
        {/* Legs and sneakers */}
        {[-1, 1].map((side) => (
          <group key={side} position={[side * 0.13, 0.62, 0]}>
            <mesh material={mats.trousers} position={[0, -0.29, 0]} castShadow>
              <capsuleGeometry args={[0.095, 0.36, 6, 12]} />
            </mesh>
            <mesh material={mats.shoe} position={[0, -0.55, 0.06]} rotation={[Math.PI / 2, 0, 0]} castShadow>
              <capsuleGeometry args={[0.085, 0.16, 6, 12]} />
            </mesh>
            <mesh material={mats.sole} position={[0, -0.605, 0.06]}>
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

        {/* Lab coat, worn over the hoodie in the research lab */}
        <group ref={coat} visible={false}>
          <mesh material={mats.white} position={[0, 0.8, -0.01]} scale={[1.09, 1.06, 0.9]} castShadow>
            <capsuleGeometry args={[0.24, 0.3, 8, 16]} />
          </mesh>
          <mesh material={mats.white} position={[0, 0.5, -0.01]} scale={[1, 1, 0.82]} castShadow>
            <cylinderGeometry args={[0.25, 0.3, 0.42, 20, 1, true]} />
          </mesh>
          {/* Open front showing the hoodie, with lapels */}
          <mesh material={mats.hoodie} position={[0, 0.78, 0.208]} scale={[0.34, 1, 0.1]}>
            <capsuleGeometry args={[0.2, 0.34, 6, 10]} />
          </mesh>
          {[-1, 1].map((side) => (
            <mesh key={side} material={mats.white} position={[side * 0.075, 0.98, 0.215]} rotation={[0, 0, side * -0.35]}>
              <boxGeometry args={[0.07, 0.2, 0.02]} />
            </mesh>
          ))}
          {[-1, 1].map((side) => (
            <mesh key={side} material={mats.white} position={[side * 0.29, 0.83, 0]} scale={[1.14, 1.02, 1.14]}>
              <capsuleGeometry args={[0.075, 0.28, 6, 12]} />
            </mesh>
          ))}
        </group>

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
          {/* Hair: short and smooth, swept to one side, with a soft fringe */}
          <mesh material={mats.hair} position={[0, 0.03, -0.035]} rotation={[-0.28, 0, 0]} scale={[1.03, 1, 1.04]} castShadow>
            <sphereGeometry args={[0.432, 32, 20, 0, Math.PI * 2, 0, Math.PI * 0.5]} />
          </mesh>
          {[-0.2, -0.07, 0.07, 0.2].map((x, i) => (
            <mesh key={x} material={mats.hair} position={[x, 0.3 - Math.abs(x) * 0.25, 0.27 - Math.abs(x) * 0.2]} rotation={[0.5, 0, -0.5 + i * 0.12]} scale={[1.25, 0.5, 0.75]}>
              <sphereGeometry args={[0.12, 14, 10]} />
            </mesh>
          ))}
          {[-1, 1].map((side) => (
            <mesh key={side} material={mats.hair} position={[side * 0.36, 0.08, -0.02]} scale={[0.4, 1, 0.9]}>
              <sphereGeometry args={[0.13, 12, 10]} />
            </mesh>
          ))}
          {/* Research glasses */}
          <group ref={glasses} visible={false} position={[0, 0, 0.4]}>
            {[-1, 1].map((side) => (
              <mesh key={side} material={mats.black} position={[side * 0.155, 0, 0]}>
                <torusGeometry args={[0.105, 0.012, 8, 28]} />
              </mesh>
            ))}
            <mesh material={mats.black} position={[0, 0.01, 0]}>
              <boxGeometry args={[0.1, 0.014, 0.014]} />
            </mesh>
            {[-1, 1].map((side) => (
              <mesh key={side} material={mats.black} position={[side * 0.32, 0, -0.2]} rotation={[0, side * 0.25, 0]}>
                <boxGeometry args={[0.012, 0.012, 0.42]} />
              </mesh>
            ))}
          </group>
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
