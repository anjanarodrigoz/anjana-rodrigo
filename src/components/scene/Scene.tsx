"use client"

import { AdaptiveDpr, PerformanceMonitor } from "@react-three/drei"
import { Canvas } from "@react-three/fiber"
import { Suspense, lazy, useEffect, useState, type MutableRefObject } from "react"
import * as THREE from "three"

import Landmarks from "@/components/worlds/Landmarks"
import { WORLD_ORIGIN, type WorldId } from "@/lib/sections"
import { player, useWorld } from "@/lib/store"

import { Character } from "./Character"
import { Rig } from "./Rig"

const worlds: Record<WorldId, ReturnType<typeof lazy>> = {
  mine: lazy(() => import("@/components/worlds/MineWorld")),
  software: lazy(() => import("@/components/worlds/SoftwareWorld")),
  experience: lazy(() => import("@/components/worlds/ExperienceWorld")),
  research: lazy(() => import("@/components/worlds/ResearchWorld")),
}

/**
 * One canvas, one world. The mine is always there; each site in the valley is
 * code-split and built the first time the character comes within range.
 */
export default function Scene({ eventSource }: { eventSource: MutableRefObject<HTMLElement | null> }) {
  const set = useWorld((s) => s.set)
  const [built, setBuilt] = useState<Set<WorldId>>(() => new Set<WorldId>(["mine"]))
  const [dpr, setDpr] = useState(1.5)

  useEffect(() => {
    const id = window.setInterval(() => {
      setBuilt((prev) => {
        let next = prev
        for (const w of Object.keys(WORLD_ORIGIN) as WorldId[]) {
          const o = WORLD_ORIGIN[w]
          if (!prev.has(w) && Math.hypot(player.x - o[0], player.z - o[2]) < 60) {
            if (next === prev) next = new Set(prev)
            next.add(w)
          }
        }
        return next
      })
    }, 400)
    return () => window.clearInterval(id)
  }, [])

  return (
    <Canvas
      shadows
      dpr={dpr}
      camera={{ fov: 46, near: 0.1, far: 900, position: [-40, 20, 30] }}
      gl={{ antialias: true, powerPreference: "high-performance" }}
      eventSource={eventSource as MutableRefObject<HTMLElement>}
      eventPrefix="client"
      onCreated={({ gl }) => {
        gl.toneMapping = THREE.ACESFilmicToneMapping
        gl.toneMappingExposure = 1.05
        set({ ready: true })
      }}
      style={{ position: "fixed", inset: 0, touchAction: "none" }}
    >
      {/* Drop resolution if the device struggles; restore it when it recovers. */}
      <PerformanceMonitor onDecline={() => setDpr(1)} onIncline={() => setDpr(1.5)} />
      <AdaptiveDpr pixelated={false} />
      <Rig />
      <Character />
      <Landmarks />
      {(Object.keys(worlds) as WorldId[]).map((id) => {
        if (!built.has(id)) return null
        const World = worlds[id]
        return (
          <group key={id} position={WORLD_ORIGIN[id]}>
            <Suspense fallback={null}>
              <World />
            </Suspense>
          </group>
        )
      })}
    </Canvas>
  )
}
