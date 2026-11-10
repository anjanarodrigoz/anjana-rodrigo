"use client"

import { useFrame, useThree } from "@react-three/fiber"
import gsap from "gsap"
import { useEffect, useMemo, useRef } from "react"
import * as THREE from "three"

import { experience } from "@/lib/content"
import { EXPERIENCE_PATH, EXPERIENCE_SCALE, OBSTACLES, WORLD_ORIGIN, experienceStop, sections, zoneAt, zoneIndex } from "@/lib/sections"
import { input, player, rig, useWorld } from "@/lib/store"
import { SITES, pitCoords, rimR, topHeight } from "@/three/terrain"

const EXP = zoneIndex("experience")
const WALK = 3.4
const RUN = 8
const ACCEL = 16

/** Ground height under the character, including the experience model board. */
export const standHeight = (x: number, z: number) => {
  const e = SITES.experience
  const onBoard = Math.hypot(x - e.x, z - e.z) < 13.5 * EXPERIENCE_SCALE
  // The projects and research floors sit just above the ground.
  const onFloor = [SITES.software, SITES.research].some((s) => Math.hypot(x - s.x, z - s.z) < 9)
  return topHeight(x, z) + (onBoard ? 0.1 + 0.3 * EXPERIENCE_SCALE : onFloor ? 0.1 : 0)
}

/**
 * Experience: step to the next or previous role and stop dead on it.
 * One scroll, one stop. Returns false at either end of the path.
 */
export function stepRole(dir: 1 | -1) {
  const store = useWorld.getState()
  const next = store.roleIndex + dir
  if (next < 0 || next >= EXPERIENCE_PATH.length) return false
  store.set({ roleIndex: next, started: true, panel: null })
  player.goal = experienceStop(next)
  return true
}

/** Fast travel: dissolve, move, reappear. */
export function travelTo(index: number) {
  const a = sections[index].arrive
  if (sections[index].id === "experience") useWorld.getState().set({ roleIndex: 0 })
  gsap.killTweensOf(rig)
  gsap
    .timeline()
    .to(rig, { dissolve: 1, duration: 0.55, ease: "power2.in" })
    .add(() => {
      player.goal = null
      player.x = a.x
      player.z = a.z
      player.vx = player.vz = 0
      player.heading = a.heading
      player.camYaw = a.heading + Math.PI
      player.y = standHeight(a.x, a.z)
    })
    .to(rig, { dissolve: 0, duration: 0.6, ease: "power2.out" })
}

/**
 * The game loop: moves the character from input, keeps him on the ground and
 * out of buildings, follows with a third-person camera, and tracks which
 * place he is standing in.
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
      player.camPitch = THREE.MathUtils.clamp(player.camPitch + (e.clientY - ly) * 0.004, 0.08, 1.1)
      player.sinceDrag = 0
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
    const moving = Math.hypot(input.x, input.y) > 0.08 && rig.dissolve < 0.2

    // Desired velocity, relative to where the camera is looking.
    const fx = -Math.sin(p.camYaw)
    const fz = -Math.cos(p.camYaw)
    const mag = Math.min(1, Math.hypot(input.x, input.y))
    const top = (input.run ? RUN : WALK) * mag
    let wx = 0
    let wz = 0
    if (moving) p.goal = null
    if (p.goal) {
      // Walk straight to the stop and halt on it exactly: no drift, no overshoot.
      const gx = p.goal.x - p.x
      const gz = p.goal.z - p.z
      const gd = Math.hypot(gx, gz)
      if (gd < 0.12) {
        p.x = p.goal.x
        p.z = p.goal.z
        p.vx = p.vz = 0
        p.goal = null
      } else {
        const sp = Math.min(RUN * 0.8, Math.max(1.2, gd * 4))
        wx = (gx / gd) * sp
        wz = (gz / gd) * sp
        p.vx = wx
        p.vz = wz
      }
    } else if (moving) {
      const ix = input.x / Math.max(mag, 1e-3)
      const iy = input.y / Math.max(mag, 1e-3)
      wx = (fx * iy - fz * ix) * top
      wz = (fz * iy + fx * ix) * top
    }
    // Accelerate toward it, so starts, stops and turns have weight.
    const dvx = wx - p.vx
    const dvz = wz - p.vz
    const dv = Math.hypot(dvx, dvz)
    const step = Math.min(dv, ACCEL * dt)
    if (dv > 1e-4) {
      p.vx += (dvx / dv) * step
      p.vz += (dvz / dv) * step
    }
    let nx = p.x + p.vx * dt
    let nz = p.z + p.vz * dt

    // Stay in the valley, and out of buildings.
    const rr = Math.hypot(nx, nz) / rimR(Math.atan2(nz, nx))
    if (rr > 1.86) {
      const k = 1.86 / rr
      nx *= k
      nz *= k
    }
    for (const [ox, oz, hx, hz] of OBSTACLES) {
      if (hz === 0) {
        const d = Math.hypot(nx - ox, nz - oz)
        if (d < hx + 0.35 && d > 1e-3) {
          nx = ox + ((nx - ox) / d) * (hx + 0.35)
          nz = oz + ((nz - oz) / d) * (hx + 0.35)
        }
      } else {
        const dx = nx - ox
        const dz = nz - oz
        if (Math.abs(dx) < hx + 0.35 && Math.abs(dz) < hz + 0.35) {
          if (hx + 0.35 - Math.abs(dx) < hz + 0.35 - Math.abs(dz)) nx = ox + Math.sign(dx) * (hx + 0.35)
          else nz = oz + Math.sign(dz) * (hz + 0.35)
        }
      }
    }
    // Bench faces are steep: slow the climb instead of gliding up them.
    const ground = standHeight(nx, nz)
    const rise = ground - p.y
    if (rise > 0.5 && pitCoords(nx, nz).d < 1.05) {
      nx = p.x + (nx - p.x) * 0.35
      nz = p.z + (nz - p.z) * 0.35
    }
    p.x = nx
    p.z = nz
    const gy = standHeight(p.x, p.z)
    p.y += (gy - p.y) * Math.min(1, dt * (gy > p.y ? 9 : 14))
    p.speed = Math.hypot(p.vx, p.vz)
    if (p.speed > 0.3) {
      const want = Math.atan2(p.vx, p.vz)
      const diff = ((want - p.heading + Math.PI * 3) % (Math.PI * 2)) - Math.PI
      p.heading += THREE.MathUtils.clamp(diff, -9 * dt, 9 * dt)
    }

    // Camera: swing behind the character while he moves, unless being dragged.
    p.sinceDrag += dt
    if (p.speed > 1 && p.sinceDrag > 1.2) {
      const want = p.heading + Math.PI
      const diff = ((want - p.camYaw + Math.PI * 3) % (Math.PI * 2)) - Math.PI
      p.camYaw += diff * Math.min(1, dt * 1.1)
    }
    const portrait = size.width / size.height < 0.8
    const zone = zoneAt(p.x, p.z)
    const started = useWorld.getState().started
    // Pull back for a wider view at the start and inside the pit.
    const inPit = pitCoords(p.x, p.z).d < 1
    const dist = (started ? (inPit ? 11 : 8.5) : 15) * (portrait ? 1.25 : 1)
    const pitch = started ? p.camPitch : 0.36
    look.set(p.x, p.y + 1.5, p.z)
    camPos.set(p.x + Math.sin(p.camYaw) * Math.cos(pitch) * dist, p.y + 1.5 + Math.sin(pitch) * dist, p.z + Math.cos(p.camYaw) * Math.cos(pitch) * dist)
    camPos.y = Math.max(camPos.y, topHeight(camPos.x, camPos.z) + 0.8)
    const k = first.current ? 1 : 1 - Math.pow(0.0015, dt)
    first.current = false
    camera.position.lerp(camPos, k)
    camera.lookAt(look)
    const cam = camera as THREE.PerspectiveCamera
    const fov = portrait ? 58 : 46
    if (cam.fov !== fov) {
      cam.fov = fov
      cam.updateProjectionMatrix()
    }

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
    if (zone !== store.active) store.set({ active: zone, panel: null })
    if (!store.started && (moving || zone !== 0)) store.set({ started: true })
    if (zone === EXP) {
      // When walking freely, show the role whose stop is nearest.
      if (!p.goal && moving) {
        let idx = 0
        let best = Infinity
        experience.forEach((_, i) => {
          const s = experienceStop(i)
          const d = Math.hypot(p.x - s.x, p.z - s.z)
          if (d < best) {
            best = d
            idx = i
          }
        })
        if (idx !== store.roleIndex) store.set({ roleIndex: idx })
      }
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

