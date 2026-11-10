"use client"

import { useFrame, useThree } from "@react-three/fiber"
import { useMemo, useRef } from "react"
import * as THREE from "three"

import { experience } from "@/lib/content"
import { HOLD, WORLD_ORIGIN, readingAt, sectionAt, sections } from "@/lib/sections"
import { rig, useWorld } from "@/lib/store"
import { topHeight } from "@/three/terrain"

/**
 * Applies the scroll timeline to the camera, and blends the atmosphere
 * (background, fog, sun, sky light) toward the current world's settings.
 */
export function Rig() {
  const { camera, scene, size } = useThree()
  const sun = useRef<THREE.DirectionalLight>(null!)
  const hemi = useRef<THREE.HemisphereLight>(null!)
  const target = useMemo(() => new THREE.Object3D(), [])
  const look = useMemo(() => new THREE.Vector3(), [])
  const pos = useMemo(() => new THREE.Vector3(), [])
  const c = useMemo(() => new THREE.Color(), [])
  const pointer = useRef({ x: 0, y: 0 })
  const reduce = useMemo(() => typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches, [])

  useMemo(() => {
    scene.background = new THREE.Color(sections[0].air.bg)
    scene.fog = new THREE.Fog(sections[0].air.bg, ...sections[0].air.fog)
  }, [scene])

  useFrame((state, dt) => {
    const portrait = size.width / size.height < 0.8
    pos.set(rig.px, rig.py, rig.pz)
    look.set(rig.lx, rig.ly, rig.lz)
    // Phones see less width: step back from the subject.
    if (portrait) pos.sub(look).multiplyScalar(1.55).add(look)
    if (!reduce) {
      pointer.current.x += (state.pointer.x - pointer.current.x) * 0.04
      pointer.current.y += (state.pointer.y - pointer.current.y) * 0.04
      const d = pos.distanceTo(look) * 0.018
      pos.x += pointer.current.x * d
      pos.y += pointer.current.y * d * 0.6 + Math.sin(state.clock.elapsedTime * 0.5) * d * 0.15
    }
    // Never let the camera sink into the mine's terrain.
    if (Math.abs(pos.x) < 130) pos.y = Math.max(pos.y, topHeight(pos.x, pos.z) + 1.5)
    camera.position.copy(pos)
    camera.lookAt(look)
    const cam = camera as THREE.PerspectiveCamera
    const fov = portrait ? 52 : 38
    if (cam.fov !== fov) {
      cam.fov = fov
      cam.updateProjectionMatrix()
    }
    // Wide screens: slide the subject right, clear of the text column.
    if (size.width / size.height > 1.25) cam.setViewOffset(size.width, size.height, -size.width * 0.13, 0, size.width, size.height)
    else if (cam.view) cam.clearViewOffset()

    // Atmosphere.
    const s = sections[sectionAt(rig.time)]
    const k = 1 - Math.pow(0.02, dt)
    const air = s.air
    ;(scene.background as THREE.Color).lerp(c.set(air.bg), k)
    const fog = scene.fog as THREE.Fog
    fog.color.copy(scene.background as THREE.Color)
    fog.near += (air.fog[0] - fog.near) * k
    fog.far += (air.fog[1] - fog.far) * k
    sun.current.color.lerp(c.set(air.sun), k)
    sun.current.intensity += (air.sunI - sun.current.intensity) * k
    hemi.current.color.lerp(c.set(air.sky), k)
    hemi.current.groundColor.lerp(c.set(air.ground), k)
    hemi.current.intensity += (air.hemiI - hemi.current.intensity) * k
    const o = WORLD_ORIGIN[s.world]
    target.position.set(o[0], o[1], o[2])
    target.updateMatrixWorld()
    sun.current.position.set(o[0] + air.sunDir[0] * 70, o[1] + air.sunDir[1] * 70, o[2] + air.sunDir[2] * 70)

    // Tell the HTML layer which section is being read (only when it changes).
    const store = useWorld.getState()
    const reading = readingAt(rig.time)
    if (reading !== store.active) store.set({ active: reading, panel: null })
    if (reading === 4) {
      const f = THREE.MathUtils.clamp((rig.time - 4) / HOLD, 0, 0.999)
      const idx = Math.floor(f * experience.length)
      if (idx !== store.roleIndex) store.set({ roleIndex: idx })
    }
    const veil = document.getElementById("veil")
    if (veil) veil.style.opacity = String(rig.veil)
  })

  return (
    <>
      <hemisphereLight ref={hemi} args={["#e3edff", "#7b6a55", 1.15]} />
      <directionalLight
        ref={sun}
        target={target}
        castShadow
        intensity={2.7}
        shadow-mapSize={[2048, 2048]}
        shadow-camera-left={-46}
        shadow-camera-right={46}
        shadow-camera-top={36}
        shadow-camera-bottom={-36}
        shadow-camera-near={1}
        shadow-camera-far={160}
        shadow-bias={-0.0006}
        shadow-normalBias={0.03}
      />
      <primitive object={target} />
    </>
  )
}
