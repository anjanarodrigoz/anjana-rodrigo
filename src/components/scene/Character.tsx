"use client"

import { useGLTF } from "@react-three/drei"
import { useFrame, useThree } from "@react-three/fiber"
import { useMemo, useRef } from "react"
import * as THREE from "three"

import { sections } from "@/lib/sections"
import { player, rig, useWorld } from "@/lib/store"

/**
 * The guide: a cartoon boy with an oversized head, curly black hair, a
 * dark-green hoodie, trousers and sneakers. He wears a safety helmet at the
 * mine, and a lab coat and glasses in the research lab.
 *
 * The model is built in Blender (`tools/blender/character.py`) and loaded
 * from `public/models/character.glb`. Its named parts are posed here.
 * He stands facing the viewer and travels by dissolving into particles.
 */

const PARTICLES = 140
const MODEL_URL = "/models/character.glb"

export function Character() {
  const root = useRef<THREE.Group>(null!)
  const body = useRef<THREE.Group>(null!)
  const points = useRef<THREE.Points>(null!)
  const camera = useThree((s) => s.camera)
  const blink = useRef(2)
  const gear = useRef({ helmet: true, tablet: false, lab: false })

  // The character is modelled in Blender (tools/blender/character.py).
  const { scene } = useGLTF(MODEL_URL)
  const parts = useMemo(() => {
    scene.traverse((o) => {
      o.castShadow = true
    })
    const get = (name: string) => scene.getObjectByName(name) as THREE.Object3D
    return {
      head: get("Head"),
      eyes: get("Eyes"),
      armL: get("ArmL"),
      armR: get("ArmR"),
      helmet: get("Helmet"),
      hairTop: get("HairTop"),
      glasses: get("Glasses"),
      tablet: get("Tablet"),
      coat: [get("Coat"), get("CoatSleeveL"), get("CoatSleeveR")],
    }
  }, [scene])

  const particles = useMemo(() => {
    const dir = new Float32Array(PARTICLES * 3)
    for (let i = 0; i < PARTICLES; i++) {
      const a = Math.random() * Math.PI * 2
      const r = 0.25 + Math.random() * 0.75
      dir.set([Math.cos(a) * r, Math.random() * 1.9, Math.sin(a) * r], i * 3)
    }
    const g = new THREE.BufferGeometry()
    g.setAttribute("position", new THREE.BufferAttribute(new Float32Array(PARTICLES * 3), 3))
    return { g, dir }
  }, [])

  useFrame((state, dt) => {
    const t = state.clock.elapsedTime
    const zone = useWorld.getState().active
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

    // Idle life: breathing, and turning his head to look at the viewer.
    body.current.position.y = Math.sin(t * 2.2) * 0.012
    const local = root.current.worldToLocal(camera.position.clone())
    // Wrap the difference so a heading past a full turn does not twist his neck.
    const rawYaw = Math.atan2(local.x, local.z) - body.current.rotation.y
    const yaw = THREE.MathUtils.clamp(((rawYaw + Math.PI * 9) % (Math.PI * 2)) - Math.PI, -0.8, 0.8)
    parts.head.rotation.y = THREE.MathUtils.lerp(parts.head.rotation.y, yaw, 1 - Math.pow(0.01, dt))
    parts.head.rotation.z = Math.sin(t * 0.9) * 0.04

    // Outfit for the place he is in.
    parts.helmet.visible = g.helmet
    parts.hairTop.visible = !g.helmet // the helmet sits on the hair
    parts.glasses.visible = g.lab
    parts.coat.forEach((c) => (c.visible = g.lab))
    parts.tablet.visible = g.tablet

    // Arms: a wave on the opening view, holding the tablet where he has one.
    const waving = zone === 0 && Math.sin(t * 0.6) > -0.2
    const ease = 1 - Math.pow(0.002, dt)
    parts.armR.rotation.z = THREE.MathUtils.lerp(parts.armR.rotation.z, waving ? 2.5 + Math.sin(t * 7) * 0.3 : 0.12, ease)
    parts.armL.rotation.x = THREE.MathUtils.lerp(parts.armL.rotation.x, g.tablet ? -1.1 : Math.sin(t * 1.4) * 0.05, ease)
    parts.armL.rotation.z = -0.12

    blink.current -= dt
    if (blink.current < -0.12) blink.current = 2 + Math.random() * 3
    parts.eyes.scale.y = blink.current < 0 ? 0.1 : 1
  })

  return (
    <group ref={root} scale={1.35}>
      <points ref={points} geometry={particles.g} frustumCulled={false}>
        <pointsMaterial color="#b7e3c0" size={0.07} transparent opacity={0} depthWrite={false} sizeAttenuation />
      </points>
      <group ref={body}>
        <primitive object={scene} />
      </group>
    </group>
  )
}

useGLTF.preload(MODEL_URL)
