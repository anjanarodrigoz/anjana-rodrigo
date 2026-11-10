"use client"

import { useFrame, useThree } from "@react-three/fiber"
import gsap from "gsap"
import { useEffect, useMemo, useRef } from "react"
import * as THREE from "three"

import { WORLD_ORIGIN, sections, zoneAt } from "@/lib/sections"
import { sound } from "@/lib/sound"
import { player, rig, tour, useWorld } from "@/lib/store"
import { SITES, pitCoords, topHeight } from "@/three/terrain"


// Teleports take real time even when frames are slow, instead of crawling.
gsap.ticker.lagSmoothing(0)

/** Ground height under the character, including the raised floors of the sites. */
export const standHeight = (x: number, z: number) => {
  const onFloor = [SITES.software, SITES.research, SITES.experience].some((s) => Math.hypot(x - s.x, z - s.z) < 9)
  return topHeight(x, z) + (onFloor ? 0.1 : 0)
}

/** Dissolve, jump to a point, reappear. Every move in the world is a teleport. */
function jump(x: number, z: number, heading: number) {
  gsap.killTweensOf(rig)
  sound.teleport()
  gsap
    .timeline()
    .to(rig, { dissolve: 1, duration: 0.5, ease: "power2.in" })
    .add(() => {
      player.x = x
      player.z = z
      // The camera looks the way `heading` points; he stands facing back at it.
      player.heading = heading + Math.PI
      player.camYaw = heading + Math.PI
      player.camPitch = 0.32
      player.y = standHeight(x, z)
    })
    .to(rig, { dissolve: 0, duration: 0.55, ease: "power2.out" })
}

/**
 * In a place that shows one thing at a time, move to the next or previous
 * item. Returns false at either end, so the caller can move on to the next place.
 */
export function stepItem(dir: 1 | -1) {
  const store = useWorld.getState()
  const count = sections[store.active]?.items ?? 0
  const next = store.sub + dir
  if (!count || next < 0 || next >= count) return false
  store.set({ sub: next, started: true, panel: null })
  sound.open()
  return true
}

/** Teleport to a place. `sub` picks which item is on show when it has several. */
export function travelTo(index: number, sub = 0) {
  const i = Math.max(0, Math.min(sections.length - 1, index))
  tour.place = i
  useWorld.getState().set({ started: i !== 0 || useWorld.getState().started, sub })
  const a = sections[i].arrive
  jump(a.x, a.z, a.heading)
}

/**
 * Per-frame loop: keeps the character on the ground and facing the viewer,
 * frames him with an orbiting camera, and tracks which place he is in.
 */
export function Rig() {
  const { camera, scene, size, gl } = useThree()
  const sun = useRef<THREE.DirectionalLight>(null!)
  const target = useMemo(() => new THREE.Object3D(), [])
  const camPos = useMemo(() => new THREE.Vector3(), [])
  const look = useMemo(() => new THREE.Vector3(), [])
  const first = useRef(true)

  useMemo(() => {
    scene.background = new THREE.Color("#dfe9ee")
    scene.fog = new THREE.Fog("#dfe9ee", 70, 250)
    player.y = standHeight(player.x, player.z)
  }, [scene])

  // Drag anywhere on the world to look around.
  useEffect(() => {
    const el = gl.domElement
    let dragging = false
    let lx = 0
    let ly = 0
    const down = (e: PointerEvent) => {
      if ((e.target as HTMLElement).closest?.("[data-ui]")) return
      dragging = true
      lx = e.clientX
      ly = e.clientY
    }
    const move = (e: PointerEvent) => {
      if (!dragging) return
      player.camYaw -= (e.clientX - lx) * 0.006
      // Touch keeps vertical swipes for moving between places.
      if (e.pointerType !== "touch") player.camPitch = THREE.MathUtils.clamp(player.camPitch + (e.clientY - ly) * 0.004, 0.08, 1.1)
      lx = e.clientX
      ly = e.clientY
    }
    const up = () => (dragging = false)
    const root = document.getElementById("world-root") ?? el
    root.addEventListener("pointerdown", down)
    window.addEventListener("pointermove", move)
    window.addEventListener("pointerup", up)
    window.addEventListener("pointercancel", up)
    return () => {
      root.removeEventListener("pointerdown", down)
      window.removeEventListener("pointermove", move)
      window.removeEventListener("pointerup", up)
      window.removeEventListener("pointercancel", up)
    }
  }, [gl])

  useFrame((_, rawDt) => {
    const dt = Math.min(rawDt, 0.05)
    const p = player
    p.y = standHeight(p.x, p.z)
    // He always turns to face the viewer, wherever the camera orbits.
    const turn = ((p.camYaw - p.heading + Math.PI * 3) % (Math.PI * 2)) - Math.PI
    p.heading += turn * Math.min(1, dt * 6)

    const portrait = size.width / size.height < 0.8
    const zone = zoneAt(p.x, p.z)
    const store0 = useWorld.getState()
    const inPit = pitCoords(p.x, p.z).d < 1
    // The opening has two looks: first the whole site from far back, then a
    // slow push in to the character. Everywhere else is a medium shot.
    let dist = inPit ? 12 : 8.5
    let pitch = p.camPitch
    if (zone === 0) {
      dist = store0.sub === 0 ? 40 : 5.2
      pitch = store0.sub === 0 ? 0.42 : 0.14
    }
    if (portrait) dist *= 1.25
    // Phones: at a showcase, frame the exhibit and the guide together
    // instead of centring on the guide alone.
    let fx = p.x
    let fz = p.z
    if (portrait && zone > 0 && sections[zone].items) {
      fx = (p.x + sections[zone].at[0] - 0.6) / 2
      fz = (p.z + sections[zone].at[1] - 0.8) / 2
      dist *= 1.3
    }
    look.set(fx, p.y + 2.2, fz)
    camPos.set(fx + Math.sin(p.camYaw) * Math.cos(pitch) * dist, p.y + 2.2 + Math.sin(pitch) * dist, fz + Math.cos(p.camYaw) * Math.cos(pitch) * dist)
    camPos.y = Math.max(camPos.y, topHeight(camPos.x, camPos.z) + 0.8)
    // The opening push-in is deliberately slow; other moves are quicker.
    const k = first.current ? 1 : 1 - Math.pow(zone === 0 ? 0.12 : 0.0015, dt)
    first.current = false
    camera.position.lerp(camPos, k)
    camera.lookAt(look)
    const cam = camera as THREE.PerspectiveCamera
    const fov = portrait ? 58 : 46
    if (cam.fov !== fov) {
      cam.fov = fov
      cam.updateProjectionMatrix()
    }
    // Wide screens: slide the scene right so the exhibit clears the text column.
    if (size.width / size.height > 1.25) cam.setViewOffset(size.width, size.height, -size.width * 0.15, 0, size.width, size.height)
    // Phones: lift the scene into the space above the bottom text panel.
    else if (portrait) cam.setViewOffset(size.width, size.height, 0, size.height * 0.2, size.width, size.height)
    else if (cam.view) cam.clearViewOffset()

    // Sun and its shadow follow the character.
    target.position.set(p.x, 0, p.z)
    target.updateMatrixWorld()
    sun.current.position.set(p.x - 32, 52, p.z + 32)

    // Sites assemble themselves as the character approaches.
    for (const id of ["software", "experience", "research"] as const) {
      const o = WORLD_ORIGIN[id]
      if (rig.asm[id] === 0 && Math.hypot(p.x - o[0], p.z - o[2]) < 24) gsap.to(rig.asm, { [id]: 1, duration: 1.6, ease: "power1.out" })
    }

    // Tell the interface where we are (only when it changes).
    const store = useWorld.getState()
    if (zone !== store.active) {
      store.set({ active: zone, panel: null })
      if (zone > 0 && store.started) sound.arrive()
    }
  })

  return (
    <>
      <hemisphereLight args={["#dfeaff", "#7b6a55", 0.85]} />
      <directionalLight
        ref={sun}
        target={target}
        castShadow
        color="#fff1dc"
        intensity={2.5}
        shadow-mapSize={[2048, 2048]}
        shadow-camera-left={-42}
        shadow-camera-right={42}
        shadow-camera-top={42}
        shadow-camera-bottom={-42}
        shadow-camera-near={1}
        shadow-camera-far={160}
        shadow-bias={-0.0006}
        shadow-normalBias={0.03}
      />
      <primitive object={target} />
    </>
  )
}

