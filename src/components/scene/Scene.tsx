"use client"

import { AdaptiveDpr, PerformanceMonitor } from "@react-three/drei"
import { Canvas } from "@react-three/fiber"
import { Suspense, lazy, useEffect, useState, type MutableRefObject } from "react"
import * as THREE from "three"

import { WORLD_ORIGIN, sections, type WorldId } from "@/lib/sections"
import { useWorld } from "@/lib/store"

import { Character } from "./Character"
import { Rig } from "./Rig"

const worlds: Record<WorldId, ReturnType<typeof lazy>> = {
  mine: lazy(() => import("@/components/worlds/MineWorld")),
  software: lazy(() => import("@/components/worlds/SoftwareWorld")),
  crack: lazy(() => import("@/components/worlds/CrackWorld")),
  experience: lazy(() => import("@/components/worlds/ExperienceWorld")),
  research: lazy(() => import("@/components/worlds/ResearchWorld")),
}

/**
 * One canvas, one universe. Each world is code-split and only built when the
 * visitor is one section away; worlds far from the camera are hidden.
 */
export default function Scene({ eventSource }: { eventSource: MutableRefObject<HTMLElement | null> }) {
  const active = useWorld((s) => s.active)
  const set = useWorld((s) => s.set)
  const [built, setBuilt] = useState<Set<WorldId>>(() => new Set<WorldId>(["mine"]))
  const [near, setNear] = useState<Set<WorldId>>(() => new Set<WorldId>(["mine"]))
  const [dpr, setDpr] = useState(1.5)

  useEffect(() => {
    if (active < 0) return
    const wanted = new Set<WorldId>([sections[active].world])
    if (sections[active + 1]) wanted.add(sections[active + 1].world)
    if (sections[active - 1]) wanted.add(sections[active - 1].world)
    setNear(wanted)
    setBuilt((prev) => {
      const next = new Set(prev)
      wanted.forEach((w) => next.add(w))
      return next.size === prev.size ? prev : next
    })
  }, [active])

  return (
    <Canvas
      shadows
      dpr={dpr}
      camera={{ fov: 38, near: 0.1, far: 900, position: [-44, 21, 46] }}
      gl={{ antialias: true, powerPreference: "high-performance" }}
      eventSource={eventSource as MutableRefObject<HTMLElement>}
      eventPrefix="client"
      onCreated={({ gl }) => {
        gl.toneMapping = THREE.ACESFilmicToneMapping
        gl.toneMappingExposure = 1.05
        set({ ready: true })
      }}
      style={{ position: "fixed", inset: 0 }}
    >
      {/* Drop resolution if the device struggles; restore it when it recovers. */}
      <PerformanceMonitor onDecline={() => setDpr(1)} onIncline={() => setDpr(1.5)} />
      <AdaptiveDpr pixelated={false} />
      <Rig />
      <Character />
      {(Object.keys(worlds) as WorldId[]).map((id) => {
        if (!built.has(id)) return null
        const World = worlds[id]
        return (
          <group key={id} position={WORLD_ORIGIN[id]} visible={near.has(id)}>
            <Suspense fallback={null}>
              <World />
            </Suspense>
          </group>
        )
      })}
    </Canvas>
  )
}
