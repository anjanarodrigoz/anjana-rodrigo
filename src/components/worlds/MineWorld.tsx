"use client"

import { useFrame } from "@react-three/fiber"
import { useEffect, useMemo, useRef } from "react"
import * as THREE from "three"

import { buildMine } from "@/three/mine"

/** World one: the open-pit mine. Also the stage for Intro, About and Contact. */
export default function MineWorld() {
  const mine = useMemo(() => buildMine(), [])
  const sky = useRef<THREE.Mesh>(null!)
  useEffect(() => () => mine.dispose(), [mine])

  // Sky dome: zenith blue fading to horizon haze, tinted by the scene fog.
  const dome = useMemo(() => {
    const g = new THREE.SphereGeometry(420, 32, 16)
    const col = new Float32Array(g.attributes.position.count * 3)
    const top = new THREE.Color("#8fb9e4")
    const c = new THREE.Color()
    for (let i = 0; i < g.attributes.position.count; i++) {
      const h = THREE.MathUtils.clamp(g.attributes.position.getY(i) / 420, 0, 1)
      c.set("#ffffff").lerp(top, Math.pow(h, 0.55))
      col.set([c.r, c.g, c.b], i * 3)
    }
    g.setAttribute("color", new THREE.BufferAttribute(col, 3))
    return g
  }, [])

  useFrame((state, dt) => {
    mine.update(state.clock.elapsedTime, Math.min(dt, 0.05))
    sky.current.position.copy(state.camera.position)
    const bg = state.scene.background as THREE.Color
    ;(sky.current.material as THREE.MeshBasicMaterial).color.copy(bg).multiplyScalar(1.08)
  })

  return (
    <group>
      <mesh ref={sky} geometry={dome} renderOrder={-10}>
        <meshBasicMaterial vertexColors side={THREE.BackSide} fog={false} depthWrite={false} />
      </mesh>
      <primitive object={mine.group} />
    </group>
  )
}
