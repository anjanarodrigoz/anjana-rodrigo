"use client"

import { useFrame, useThree } from "@react-three/fiber"
import { useMemo, useRef } from "react"
import * as THREE from "three"

import { sections } from "@/lib/sections"
import { player, rig, useWorld } from "@/lib/store"

/**
 * The guide: a boy with curly black hair, a dark-green hoodie, trousers and
 * sneakers. He wears a safety helmet at the mine, and a lab coat and glasses
 * in the research lab.
 *
 * Built from smooth primitives with jointed limbs (shoulder, elbow, hip,
 * knee), hands with fingers and a detailed face. It is a procedural stand-in
 * for a sculpted GLB character: closer to natural proportions than a toy, but
 * still stylised.
 *
 * He stands facing the viewer and travels by dissolving into green particles.
 */

/** How large he stands in the world. */
export const CHARACTER_SCALE = 1.5

const PARTICLES = 160

export function Character() {
  const root = useRef<THREE.Group>(null!)
  const body = useRef<THREE.Group>(null!)
  const chest = useRef<THREE.Group>(null!)
  const head = useRef<THREE.Group>(null!)
  const armL = useRef<THREE.Group>(null!)
  const armR = useRef<THREE.Group>(null!)
  const foreL = useRef<THREE.Group>(null!)
  const foreR = useRef<THREE.Group>(null!)
  const lids = useRef<THREE.Group>(null!)
  const helmet = useRef<THREE.Group>(null!)
  const tablet = useRef<THREE.Group>(null!)
  const coat = useRef<THREE.Group>(null!)
  const glasses = useRef<THREE.Group>(null!)
  const points = useRef<THREE.Points>(null!)
  const camera = useThree((s) => s.camera)
  const blink = useRef(2)
  const gear = useRef({ helmet: true, tablet: false, lab: false })

  const m = useMemo(() => {
    const std = (color: number, roughness: number, extra: THREE.MeshStandardMaterialParameters = {}) => new THREE.MeshStandardMaterial({ color, roughness, ...extra })
    return {
      skin: std(0xd9a274, 0.55),
      skinDark: std(0xc48d62, 0.6),
      hoodie: std(0x1d4a3e, 0.9),
      hoodieDark: std(0x15382f, 0.9),
      rib: std(0x122f28, 0.85),
      trousers: std(0x33383f, 0.9),
      trouserDark: std(0x272b31, 0.9),
      shoe: std(0xf2f2ee, 0.5),
      shoeTrim: std(0x1d4a3e, 0.6),
      sole: std(0xe3e0d6, 0.7),
      hair: std(0x120e0c, 0.8),
      white: std(0xffffff, 0.25),
      coat: std(0xfafbfc, 0.75),
      iris: std(0x4a2c18, 0.25),
      black: std(0x0a0807, 0.25),
      lip: std(0xb46a5a, 0.5),
      tooth: std(0xfbfaf6, 0.3),
      helmet: std(0xf2c200, 0.3),
      helmetBand: std(0x2c3632, 0.6),
      tablet: std(0x1b1f1d, 0.3, { metalness: 0.4 }),
      screen: std(0xdfeee2, 0.2, { emissive: 0x8daa91, emissiveIntensity: 0.7 }),
      lens: std(0xcfe6ee, 0.05, { transparent: true, opacity: 0.25 }),
    }
  }, [])

  // Curls: tight spheres over the top, sides and back of the head.
  const curls = useMemo(() => {
    const out: { p: [number, number, number]; s: number }[] = []
    for (let i = 0; i < 420; i++) {
      const y = 1 - (i / 419) * 1.3
      const r = Math.sqrt(Math.max(0, 1 - y * y))
      const phi = i * 2.399963
      const x = Math.cos(phi) * r
      const z = Math.sin(phi) * r
      if (z > 0.3 && y < 0.5) continue // forehead and face stay clear
      if (y < -0.3) continue
      if (y < 0 && Math.abs(x) > 0.75 && z > -0.1) continue // sideburns stop at the ears
      const lift = 1.08 + 0.08 * Math.sin(i * 1.7)
      out.push({ p: [x * 0.27 * lift, 0.03 + y * 0.29 * lift, z * 0.28 * lift - 0.02], s: 0.05 + ((i * 37) % 7) * 0.004 })
    }
    return out
  }, [])

  const particles = useMemo(() => {
    const dir = new Float32Array(PARTICLES * 3)
    for (let i = 0; i < PARTICLES; i++) {
      const a = Math.random() * Math.PI * 2
      const r = 0.25 + Math.random() * 0.75
      dir.set([Math.cos(a) * r, Math.random() * 2, Math.sin(a) * r], i * 3)
    }
    const g = new THREE.BufferGeometry()
    g.setAttribute("position", new THREE.BufferAttribute(new Float32Array(PARTICLES * 3), 3))
    return { g, dir }
  }, [])

  useFrame((state, dt) => {
    const t = state.clock.elapsedTime
    const store = useWorld.getState()
    const zone = store.active
    // Gear follows the place he is in; between places he keeps the last set.
    if (zone >= 0) gear.current = { helmet: sections[zone].helmet, tablet: sections[zone].tablet, lab: Boolean(sections[zone].lab) }
    const g = gear.current
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

    // Standing life: breathing, a slow weight shift, and looking at the viewer.
    const breath = Math.sin(t * 1.7)
    chest.current.scale.set(1 + breath * 0.012, 1 + breath * 0.008, 1 + breath * 0.02)
    body.current.position.y = breath * 0.006
    body.current.rotation.z = Math.sin(t * 0.45) * 0.015
    const local = root.current.worldToLocal(camera.position.clone())
    const yaw = THREE.MathUtils.clamp(Math.atan2(local.x, local.z) - body.current.rotation.y, -0.7, 0.7)
    const pitch = THREE.MathUtils.clamp(-Math.atan2(local.y - 1.6, Math.hypot(local.x, local.z)) * 0.6, -0.35, 0.2)
    const k = 1 - Math.pow(0.01, dt)
    head.current.rotation.y = THREE.MathUtils.lerp(head.current.rotation.y, yaw, k)
    head.current.rotation.x = THREE.MathUtils.lerp(head.current.rotation.x, pitch, k)
    head.current.rotation.z = Math.sin(t * 0.9) * 0.03

    helmet.current.visible = g.helmet
    coat.current.visible = g.lab
    glasses.current.visible = g.lab
    // The helmet sits on the hair: hide the curls it would cover.
    for (const child of head.current.children) if (child.userData.top) child.visible = !g.helmet
    tablet.current.visible = g.tablet

    // Arms: a wave at the start, holding the tablet where he has one, relaxed otherwise.
    const waving = zone === 0 && Math.sin(t * 0.6) > -0.2
    const ease = 1 - Math.pow(0.002, dt)
    armR.current.rotation.z = THREE.MathUtils.lerp(armR.current.rotation.z, waving ? -2.3 : -0.1, ease)
    foreR.current.rotation.z = THREE.MathUtils.lerp(foreR.current.rotation.z, waving ? -0.5 + Math.sin(t * 7) * 0.35 : -0.08, ease * 2)
    foreR.current.rotation.x = THREE.MathUtils.lerp(foreR.current.rotation.x, waving ? 0 : -0.15, ease)
    armL.current.rotation.x = THREE.MathUtils.lerp(armL.current.rotation.x, g.tablet ? -0.45 : 0.02, ease)
    armL.current.rotation.z = 0.1
    foreL.current.rotation.x = THREE.MathUtils.lerp(foreL.current.rotation.x, g.tablet ? -1.25 : -0.15, ease)

    blink.current -= dt
    if (blink.current < -0.13) blink.current = 2 + Math.random() * 3.5
    lids.current.scale.y = blink.current < 0 ? 1 : 0.12
  })

  /** A hand: palm, thumb and four fingers, slightly curled. */
  const hand = (side: number) => (
    <group position={[0, -0.3, 0]}>
      <mesh material={m.skin} scale={[0.85, 1.15, 0.5]} castShadow>
        <sphereGeometry args={[0.052, 14, 10]} />
      </mesh>
      <mesh material={m.skin} position={[side * -0.045, 0.005, 0.02]} rotation={[0.3, 0, side * 0.7]}>
        <capsuleGeometry args={[0.013, 0.04, 4, 8]} />
      </mesh>
      {[0, 1, 2, 3].map((f) => (
        <mesh key={f} material={m.skin} position={[(f - 1.5) * 0.021 * -side, -0.075, 0.01]} rotation={[0.35, 0, 0]}>
          <capsuleGeometry args={[0.011, f === 3 ? 0.03 : 0.042, 4, 8]} />
        </mesh>
      ))}
    </group>
  )

  return (
    <group ref={root} scale={CHARACTER_SCALE}>
      <points ref={points} geometry={particles.g} frustumCulled={false}>
        <pointsMaterial color="#b7e3c0" size={0.09} transparent opacity={0} depthWrite={false} sizeAttenuation />
      </points>

      <group ref={body}>
        {/* Legs: thigh, knee, shin, and sneakers with soles, toe caps and laces */}
        {[-1, 1].map((side) => (
          <group key={side} position={[side * 0.105, 0.86, 0]} rotation={[0, 0, side * -0.02]}>
            <mesh material={m.trousers} position={[0, -0.2, 0]} castShadow>
              <capsuleGeometry args={[0.09, 0.26, 6, 14]} />
            </mesh>
            <mesh material={m.trousers} position={[0, -0.4, 0.006]} castShadow>
              <sphereGeometry args={[0.082, 14, 10]} />
            </mesh>
            <mesh material={m.trousers} position={[0, -0.6, 0]} castShadow>
              <capsuleGeometry args={[0.072, 0.28, 6, 14]} />
            </mesh>
            <mesh material={m.trouserDark} position={[0, -0.775, 0]}>
              <cylinderGeometry args={[0.078, 0.078, 0.03, 16]} />
            </mesh>
            <group position={[0, -0.82, 0.045]}>
              <mesh material={m.shoe} rotation={[Math.PI / 2, 0, 0]} scale={[1, 1, 0.8]} castShadow>
                <capsuleGeometry args={[0.07, 0.15, 6, 14]} />
              </mesh>
              <mesh material={m.sole} position={[0, -0.045, 0]}>
                <boxGeometry args={[0.145, 0.03, 0.3]} />
              </mesh>
              <mesh material={m.shoeTrim} position={[0, 0.0, -0.1]} scale={[1, 0.9, 0.5]}>
                <sphereGeometry args={[0.072, 12, 10]} />
              </mesh>
              {[0, 1, 2].map((l) => (
                <mesh key={l} material={m.shoeTrim} position={[0, 0.047, 0.01 + l * 0.035]} rotation={[0, 0, Math.PI / 2]}>
                  <capsuleGeometry args={[0.006, 0.05, 3, 6]} />
                </mesh>
              ))}
            </group>
          </group>
        ))}

        {/* Hips */}
        <mesh material={m.trousers} position={[0, 0.9, 0]} scale={[1.05, 0.7, 0.8]} castShadow>
          <sphereGeometry args={[0.19, 16, 12]} />
        </mesh>

        {/* Torso: hoodie with ribbed hem, pocket, hood and drawstrings */}
        <group ref={chest}>
          <mesh material={m.hoodie} position={[0, 1.2, 0]} scale={[1, 1, 0.74]} castShadow>
            <capsuleGeometry args={[0.215, 0.26, 8, 18]} />
          </mesh>
          {[-1, 1].map((side) => (
            <mesh key={side} material={m.hoodie} position={[side * 0.215, 1.4, 0]} scale={[1, 0.85, 0.95]} castShadow>
              <sphereGeometry args={[0.095, 14, 10]} />
            </mesh>
          ))}
          <mesh material={m.rib} position={[0, 0.975, 0]} scale={[1, 1, 0.76]}>
            <cylinderGeometry args={[0.205, 0.2, 0.06, 24]} />
          </mesh>
          <mesh material={m.hoodieDark} position={[0, 1.08, 0.148]} scale={[1, 0.5, 0.22]}>
            <sphereGeometry args={[0.15, 16, 10]} />
          </mesh>
          <mesh material={m.hoodieDark} position={[0, 1.47, -0.1]} scale={[1.1, 0.75, 0.9]} castShadow>
            <sphereGeometry args={[0.17, 16, 12]} />
          </mesh>
          <mesh material={m.rib} position={[0, 1.475, 0.01]} rotation={[Math.PI / 2 - 0.25, 0, 0]}>
            <torusGeometry args={[0.095, 0.03, 8, 22]} />
          </mesh>
          {[-1, 1].map((side) => (
            <group key={side} position={[side * 0.045, 1.37, 0.165]}>
              <mesh material={m.white}>
                <capsuleGeometry args={[0.006, 0.12, 4, 6]} />
              </mesh>
              <mesh material={m.white} position={[0, -0.075, 0]}>
                <sphereGeometry args={[0.012, 8, 6]} />
              </mesh>
            </group>
          ))}

          {/* Lab coat, worn open over the hoodie in the research lab */}
          <group ref={coat} visible={false}>
            {[-1, 1].map((side) => (
              <mesh key={side} material={m.coat} position={[side * 0.085, 1.16, 0]} scale={[0.72, 1, 0.82]} castShadow>
                <capsuleGeometry args={[0.235, 0.34, 8, 16, ]} />
              </mesh>
            ))}
            <mesh material={m.coat} position={[0, 1.17, -0.06]} scale={[1.02, 1, 0.6]} castShadow>
              <capsuleGeometry args={[0.235, 0.34, 8, 16]} />
            </mesh>
            {[-1, 1].map((side) => (
              <mesh key={side} material={m.coat} position={[side * 0.13, 0.83, 0.02]} scale={[0.62, 1, 0.8]} castShadow>
                <cylinderGeometry args={[0.22, 0.25, 0.42, 16]} />
              </mesh>
            ))}
            {[-1, 1].map((side) => (
              <mesh key={side} material={m.coat} position={[side * 0.085, 1.38, 0.168]} rotation={[0.1, 0, side * -0.42]}>
                <boxGeometry args={[0.075, 0.24, 0.02]} />
              </mesh>
            ))}
            <mesh material={m.coat} position={[0.15, 1.08, 0.176]}>
              <boxGeometry args={[0.1, 0.11, 0.012]} />
            </mesh>
            <mesh material={m.shoeTrim} position={[0.165, 1.14, 0.184]}>
              <capsuleGeometry args={[0.006, 0.07, 3, 6]} />
            </mesh>
          </group>
        </group>

        {/* Arms: shoulder, elbow, cuff and a hand with fingers */}
        {[-1, 1].map((side) => (
          <group key={side} ref={side < 0 ? armL : armR} position={[side * 0.275, 1.41, 0]}>
            <mesh material={m.hoodie} position={[0, -0.14, 0]} castShadow>
              <capsuleGeometry args={[0.068, 0.18, 6, 14]} />
            </mesh>
            <group ref={side < 0 ? foreL : foreR} position={[0, -0.28, 0]}>
              <mesh material={m.hoodie} castShadow>
                <sphereGeometry args={[0.066, 12, 10]} />
              </mesh>
              <mesh material={m.hoodie} position={[0, -0.13, 0]} castShadow>
                <capsuleGeometry args={[0.058, 0.17, 6, 14]} />
              </mesh>
              <mesh material={m.rib} position={[0, -0.245, 0]}>
                <cylinderGeometry args={[0.056, 0.052, 0.045, 14]} />
              </mesh>
              {hand(side)}
              {side < 0 ? (
                <group ref={tablet} position={[0.07, -0.36, 0.06]} rotation={[1.0, 0.25, 0.1]}>
                  <mesh material={m.tablet} castShadow>
                    <boxGeometry args={[0.24, 0.32, 0.016]} />
                  </mesh>
                  <mesh material={m.screen} position={[0, 0, 0.009]}>
                    <planeGeometry args={[0.21, 0.29]} />
                  </mesh>
                </group>
              ) : null}
            </group>
          </group>
        ))}

        {/* Neck */}
        <mesh material={m.skinDark} position={[0, 1.53, 0]}>
          <cylinderGeometry args={[0.062, 0.07, 0.12, 14]} />
        </mesh>

        {/* Head */}
        <group ref={head} position={[0, 1.78, 0]}>
          <mesh material={m.skin} scale={[0.92, 1.04, 0.98]} castShadow>
            <sphereGeometry args={[0.26, 36, 28]} />
          </mesh>
          {/* Jaw and chin give the face a shape instead of a ball */}
          <mesh material={m.skin} position={[0, -0.12, 0.03]} scale={[0.82, 0.7, 0.86]}>
            <sphereGeometry args={[0.22, 24, 18]} />
          </mesh>
          {/* Ears */}
          {[-1, 1].map((side) => (
            <group key={side} position={[side * 0.238, -0.02, -0.01]}>
              <mesh material={m.skin} scale={[0.45, 1, 0.75]}>
                <sphereGeometry args={[0.06, 12, 10]} />
              </mesh>
              <mesh material={m.skinDark} position={[side * 0.012, 0, 0.012]} scale={[0.3, 0.6, 0.45]}>
                <sphereGeometry args={[0.05, 10, 8]} />
              </mesh>
            </group>
          ))}
          {/* Eyes: sclera, iris, pupil, highlight, and lids that blink */}
          {[-1, 1].map((side) => (
            <group key={side} position={[side * 0.095, 0.02, 0.212]}>
              <mesh material={m.white} scale={[1.15, 0.95, 0.5]}>
                <sphereGeometry args={[0.048, 20, 16]} />
              </mesh>
              <mesh material={m.iris} position={[0, -0.002, 0.018]} scale={[1, 1, 0.4]}>
                <sphereGeometry args={[0.029, 16, 12]} />
              </mesh>
              <mesh material={m.black} position={[0, -0.002, 0.026]} scale={[1, 1, 0.4]}>
                <sphereGeometry args={[0.015, 12, 10]} />
              </mesh>
              <mesh material={m.white} position={[0.011, 0.012, 0.031]}>
                <sphereGeometry args={[0.006, 8, 6]} />
              </mesh>
              {/* Upper lash line */}
              <mesh material={m.black} position={[0, 0.036, 0.012]} rotation={[0, 0, Math.PI / 2 + side * 0.08]}>
                <capsuleGeometry args={[0.005, 0.085, 3, 8]} />
              </mesh>
            </group>
          ))}
          <group ref={lids} scale={[1, 0.12, 1]} position={[0, 0.068, 0]}>
            {[-1, 1].map((side) => (
              <mesh key={side} material={m.skin} position={[side * 0.095, -0.048, 0.222]} scale={[1.2, 1, 0.5]}>
                <sphereGeometry args={[0.05, 16, 10]} />
              </mesh>
            ))}
          </group>
          {/* Brows */}
          {[-1, 1].map((side) => (
            <mesh key={side} material={m.hair} position={[side * 0.097, 0.095, 0.228]} rotation={[0, side * 0.25, Math.PI / 2 + side * -0.14]}>
              <capsuleGeometry args={[0.011, 0.075, 4, 8]} />
            </mesh>
          ))}
          {/* Nose: bridge, tip and nostril shadow */}
          <mesh material={m.skin} position={[0, -0.02, 0.245]} rotation={[0.25, 0, 0]} scale={[0.5, 1, 0.6]}>
            <capsuleGeometry args={[0.03, 0.05, 6, 10]} />
          </mesh>
          <mesh material={m.skin} position={[0, -0.062, 0.262]} scale={[1, 0.8, 0.9]}>
            <sphereGeometry args={[0.033, 14, 10]} />
          </mesh>
          {[-1, 1].map((side) => (
            <mesh key={side} material={m.skinDark} position={[side * 0.026, -0.07, 0.25]} scale={[1, 0.7, 0.8]}>
              <sphereGeometry args={[0.018, 10, 8]} />
            </mesh>
          ))}
          {/* Mouth: a gentle smile with lips and a hint of teeth */}
          <mesh material={m.lip} position={[0, -0.135, 0.222]} rotation={[0.2, 0, Math.PI]}>
            <torusGeometry args={[0.052, 0.011, 8, 18, Math.PI]} />
          </mesh>
          <mesh material={m.tooth} position={[0, -0.146, 0.226]} scale={[1, 0.45, 0.3]}>
            <sphereGeometry args={[0.036, 12, 8]} />
          </mesh>
          <mesh material={m.lip} position={[0, -0.166, 0.224]} rotation={[0, 0, Math.PI / 2]} scale={[0.8, 1, 0.8]}>
            <capsuleGeometry args={[0.011, 0.05, 4, 8]} />
          </mesh>
          {/* Hair */}
          <mesh material={m.hair} position={[0, 0.05, -0.03]} scale={[0.97, 1, 0.98]}>
            <sphereGeometry args={[0.262, 20, 14, 0, Math.PI * 2, 0, Math.PI * 0.55]} />
          </mesh>
          {curls.map((c, i) => (
            <mesh key={i} material={m.hair} position={c.p} scale={c.s} castShadow={i % 8 === 0} userData={{ top: c.p[1] > 0.06 }}>
              <icosahedronGeometry args={[1, 1]} />
            </mesh>
          ))}
          {/* Research glasses */}
          <group ref={glasses} visible={false} position={[0, 0.02, 0.245]}>
            {[-1, 1].map((side) => (
              <group key={side} position={[side * 0.095, 0, 0]}>
                <mesh material={m.black}>
                  <torusGeometry args={[0.062, 0.008, 8, 28]} />
                </mesh>
                <mesh material={m.lens}>
                  <circleGeometry args={[0.06, 24]} />
                </mesh>
              </group>
            ))}
            <mesh material={m.black} position={[0, 0.012, 0]}>
              <boxGeometry args={[0.07, 0.01, 0.01]} />
            </mesh>
            {[-1, 1].map((side) => (
              <mesh key={side} material={m.black} position={[side * 0.2, 0.005, -0.13]} rotation={[0, side * 0.3, 0]}>
                <boxGeometry args={[0.008, 0.008, 0.27]} />
              </mesh>
            ))}
          </group>
          {/* Safety helmet: shell, brim, ridge and band */}
          <group ref={helmet} position={[0, 0.07, 0]}>
            <mesh material={m.helmet} scale={[1, 0.74, 1.04]} castShadow>
              <sphereGeometry args={[0.32, 28, 16, 0, Math.PI * 2, 0, Math.PI / 2]} />
            </mesh>
            <mesh material={m.helmet} position={[0, 0.0, 0.07]} scale={[1.07, 0.05, 1.22]}>
              <cylinderGeometry args={[0.32, 0.32, 1, 28]} />
            </mesh>
            <mesh material={m.helmet} position={[0, 0.13, 0]} scale={[0.12, 0.5, 0.95]}>
              <sphereGeometry args={[0.32, 12, 8, 0, Math.PI * 2, 0, Math.PI / 2]} />
            </mesh>
            <mesh material={m.helmetBand} position={[0, 0.02, 0]} scale={[1, 1, 1.04]}>
              <cylinderGeometry args={[0.322, 0.322, 0.03, 28, 1, true]} />
            </mesh>
          </group>
        </group>
      </group>
    </group>
  )
}
