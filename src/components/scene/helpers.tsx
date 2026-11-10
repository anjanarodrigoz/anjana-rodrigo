"use client"

import { useFrame } from "@react-three/fiber"
import { useRef, type ReactNode } from "react"
import * as THREE from "three"

import { rig, useWorld } from "@/lib/store"

/**
 * A piece of a world that assembles itself when the visitor arrives:
 * it rises and scales into place, staggered by `order`.
 */
export function Assemble({ world, order = 0, children, ...props }: { world: string; order?: number; children: ReactNode } & JSX.IntrinsicElements["group"]) {
  const ref = useRef<THREE.Group>(null!)
  useFrame(() => {
    const k = THREE.MathUtils.clamp(rig.asm[world] * 2.2 - order * 0.14, 0, 1)
    const e = 1 - Math.pow(1 - k, 3)
    ref.current.scale.setScalar(Math.max(0.0001, e))
    ref.current.position.y = (1 - e) * -1.5
    ref.current.rotation.y = (1 - e) * 0.6
  })
  return (
    <group {...props}>
      <group ref={ref}>{children}</group>
    </group>
  )
}

/** Was the pointer event aimed at the HTML interface rather than the 3D world? */
export const overUi = (e: { nativeEvent: Event }) => Boolean((e.nativeEvent.target as HTMLElement | null)?.closest?.("[data-ui]"))

/**
 * An invisible click target with a quiet pulsing ring, so a few chosen
 * objects invite interaction without labelling the whole scene.
 */
export function Hotspot({
  at,
  radius = 1,
  section,
  onSelect,
  color = "#F6F7F3",
}: {
  at: () => THREE.Vector3
  radius?: number
  section: number
  onSelect: () => void
  color?: string
}) {
  const group = useRef<THREE.Group>(null!)
  const ring = useRef<THREE.Mesh>(null!)
  const active = useWorld((s) => s.active === section)
  useFrame((state) => {
    group.current.position.copy(at())
    const t = state.clock.elapsedTime
    ring.current.quaternion.copy(state.camera.quaternion)
    const pulse = (t * 0.7) % 1
    ring.current.scale.setScalar(radius * (0.35 + pulse * 0.45))
    ;(ring.current.material as THREE.MeshBasicMaterial).opacity = active ? (1 - pulse) * 0.9 : 0
  })
  return (
    <group ref={group}>
      <mesh
        visible={false}
        onClick={(e) => {
          if (!active || overUi(e)) return
          e.stopPropagation()
          onSelect()
        }}
        onPointerOver={() => active && (document.body.style.cursor = "pointer")}
        onPointerOut={() => (document.body.style.cursor = "")}
      >
        <sphereGeometry args={[radius, 12, 10]} />
      </mesh>
      <mesh ref={ring} renderOrder={10}>
        <ringGeometry args={[0.82, 1, 40]} />
        <meshBasicMaterial color={color} transparent opacity={0} depthTest={false} fog={false} />
      </mesh>
    </group>
  )
}

/** Canvas texture helper for signs and screens (no font files or CDNs needed). */
export function canvasTexture(w: number, h: number, draw: (g: CanvasRenderingContext2D) => void) {
  const c = document.createElement("canvas")
  c.width = w
  c.height = h
  draw(c.getContext("2d")!)
  const tex = new THREE.CanvasTexture(c)
  tex.colorSpace = THREE.SRGBColorSpace
  tex.anisotropy = 4
  return tex
}
