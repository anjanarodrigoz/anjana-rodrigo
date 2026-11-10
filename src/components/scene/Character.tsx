"use client"

import { useAnimations, useGLTF } from "@react-three/drei"
import { useFrame, useThree } from "@react-three/fiber"
import { Suspense, useEffect, useMemo, useRef, useState } from "react"
import * as THREE from "three"

import { sections } from "@/lib/sections"
import { player, rig, useWorld } from "@/lib/store"

/**
 * The guide: a boy with curly black hair, a dark-green hoodie, trousers and
 * sneakers. He wears a safety helmet at the mine, and a lab coat and glasses
 * in the research lab.
 *
 * Built from smooth primitives with natural proportions (about seven heads
 * tall), jointed limbs, hands with fingers and a detailed face. A fully
 * lifelike human needs a sculpted, textured and rigged GLB model; this is the
 * closest procedural stand-in.
 *
 * He stands facing the viewer and travels by dissolving into green particles.
 */

/** How large he stands in the world. */
export const CHARACTER_SCALE = 1.5

const PARTICLES = 160

/** Optional sculpted model. If this file exists it replaces the built-in figure. */
const MODEL_URL = "/models/character.glb"

function Model() {
  const { scene, animations } = useGLTF(MODEL_URL)
  const { actions, names } = useAnimations(animations, scene)
  // Fit any model to the same standing height as the built-in figure.
  const fit = useMemo(() => {
    const box = new THREE.Box3().setFromObject(scene)
    const h = Math.max(0.001, box.max.y - box.min.y)
    scene.traverse((o) => {
      o.castShadow = true
    })
    return { scale: 1.95 / h, y: -box.min.y * (1.95 / h) }
  }, [scene])
  useEffect(() => {
    if (names[0]) actions[names[0]]?.reset().fadeIn(0.3).play()
  }, [actions, names])
  return <primitive object={scene} scale={fit.scale} position={[0, fit.y, 0]} />
}

export function Character() {
  const root = useRef<THREE.Group>(null!)
  const body = useRef<THREE.Group>(null!)
  const chest = useRef<THREE.Group>(null!)
  const head = useRef<THREE.Group>(null!)
  const armL = useRef<THREE.Group>(null!)
  const armR = useRef<THREE.Group>(null!)
  const foreL = useRef<THREE.Group>(null!)
  const foreR = useRef<THREE.Group>(null!)
  const helmet = useRef<THREE.Group>(null!)
  const tablet = useRef<THREE.Group>(null!)
  const coat = useRef<THREE.Group>(null!)
  const glasses = useRef<THREE.Group>(null!)
  const points = useRef<THREE.Points>(null!)
  const camera = useThree((s) => s.camera)
  const blink = useRef(2)
  const gear = useRef({ helmet: true, tablet: false, lab: false })
  const [hasModel, setHasModel] = useState(false)
  useEffect(() => {
    fetch(MODEL_URL, { method: "HEAD" })
      .then((r) => setHasModel(r.ok && !(r.headers.get("content-type") ?? "").includes("text/html")))
      .catch(() => {})
  }, [])

  const m = useMemo(() => {
    const std = (color: number, roughness: number, extra: THREE.MeshStandardMaterialParameters = {}) => new THREE.MeshStandardMaterial({ color, roughness, ...extra })
    const cloth = (color: number, sheen: number) => new THREE.MeshPhysicalMaterial({ color, roughness: 0.92, sheen: 1, sheenRoughness: 0.6, sheenColor: new THREE.Color(sheen) })
    return {
      skin: std(0xb07a52, 0.6),
      skinDark: std(0x98673f, 0.65),
      hoodie: cloth(0x1d4a3e, 0x4f8a76),
      hoodieDark: cloth(0x15382f, 0x3b6e5d),
      rib: std(0x122f28, 0.85),
      trousers: cloth(0x2f343b, 0x59606b),
      trouserDark: std(0x24282e, 0.9),
      shoe: std(0xf2f2ee, 0.5),
      shoeTrim: std(0x1d4a3e, 0.6),
      sole: std(0xe3e0d6, 0.7),
      hair: std(0x120e0c, 0.85),
      white: std(0xffffff, 0.25),
      coat: cloth(0xfafbfc, 0xffffff),
      black: std(0x0a0807, 0.25),
      helmet: std(0xf2c200, 0.3),
      helmetBand: std(0x2c3632, 0.6),
      tablet: std(0x1b1f1d, 0.3, { metalness: 0.4 }),
      screen: std(0xdfeee2, 0.2, { emissive: 0x8daa91, emissiveIntensity: 0.7 }),
      lens: std(0xcfe6ee, 0.05, { transparent: true, opacity: 0.25 }),
    }
  }, [])

  // -- Sculpted head: a sphere pushed into a skull, jaw, nose, lips and chin --
  const headGeo = useMemo(() => {
    const g = new THREE.SphereGeometry(1, 96, 72)
    const p = g.attributes.position as THREE.BufferAttribute
    const ss = THREE.MathUtils.smoothstep
    for (let i = 0; i < p.count; i++) {
      const x0 = p.getX(i)
      const y0 = p.getY(i)
      const z0 = p.getZ(i)
      let x = x0 * 0.8
      let z = z0 * (z0 < 0 ? 0.96 : 0.9)
      // The face narrows from the cheekbones down to the chin.
      if (y0 < 0.1) {
        const t = (0.1 - y0) / 1.1
        x *= 1 - 0.4 * Math.pow(t, 1.4)
        z *= 1 - 0.1 * t
      }
      const front = ss(z0, 0.05, 0.55)
      const bump = (cx: number, cy: number, rx: number, ry: number) => Math.exp(-(((x0 - cx) * (x0 - cx)) / (rx * rx) + ((y0 - cy) * (y0 - cy)) / (ry * ry)))
      const both = (cx: number, cy: number, rx: number, ry: number) => bump(cx, cy, rx, ry) + bump(-cx, cy, rx, ry)
      z +=
        front *
        (0.17 * bump(0, -0.1, 0.1, 0.2) + // nose bridge
          0.11 * bump(0, -0.24, 0.13, 0.08) + // nose tip
          0.05 * bump(0, 0.24, 0.5, 0.07) - // brow ridge
          0.06 * both(0.33, 0.1, 0.15, 0.09) + // eye sockets
          0.05 * bump(0, -0.46, 0.22, 0.08) + // lips
          0.07 * bump(0, -0.78, 0.26, 0.16) + // chin
          0.035 * both(0.42, -0.18, 0.2, 0.2)) // cheekbones
      p.setXYZ(i, x, y0, z)
    }
    g.computeVertexNormals()
    return g
  }, [])

  // -- Painted face: skin, eyes, brows, lips, short beard and hairline -----
  const faces = useMemo(() => {
    const paint = (open: boolean) => {
      const c = document.createElement("canvas")
      c.width = c.height = 2048
      const g = c.getContext("2d")!
      const S = 2
      const X = 256 * S // centre of the face in texture space
      g.fillStyle = "#b07a52"
      g.fillRect(0, 0, 2048, 2048)
      // Soft shading: warmer cheeks, darker under the brow and jaw.
      const blob = (x: number, y: number, r: number, color: string) => {
        const gr = g.createRadialGradient(x, y, 0, x, y, r)
        gr.addColorStop(0, color)
        gr.addColorStop(1, "rgba(0,0,0,0)")
        g.fillStyle = gr
        g.fillRect(x - r, y - r, r * 2, r * 2)
      }
      for (const sx of [-1, 1]) {
        blob(X + sx * 78 * S, 560 * S, 60 * S, "rgba(190,110,90,0.28)")
        blob(X + sx * 55 * S, 470 * S, 40 * S, "rgba(70,40,25,0.22)")
      }
      blob(X, 600 * S, 26 * S, "rgba(70,40,25,0.2)")
      // Short beard and moustache.
      g.save()
      g.beginPath()
      g.moveTo(X - 175 * S, 520 * S)
      g.bezierCurveTo(X - 170 * S, 760 * S, X - 60 * S, 850 * S, X, 850 * S)
      g.bezierCurveTo(X + 60 * S, 850 * S, X + 170 * S, 760 * S, X + 175 * S, 520 * S)
      g.bezierCurveTo(X + 120 * S, 640 * S, X + 70 * S, 630 * S, X + 48 * S, 640 * S)
      g.bezierCurveTo(X + 20 * S, 615 * S, X - 20 * S, 615 * S, X - 48 * S, 640 * S)
      g.bezierCurveTo(X - 70 * S, 630 * S, X - 120 * S, 640 * S, X - 175 * S, 520 * S)
      g.fillStyle = "rgba(22,16,13,0.82)"
      g.filter = `blur(${5 * S}px)`
      g.fill()
      g.restore()
      // Skin window around the mouth, then the lips.
      g.save()
      g.filter = `blur(${4 * S}px)`
      g.fillStyle = "#a9744d"
      g.beginPath()
      g.ellipse(X, 682 * S, 34 * S, 15 * S, 0, 0, 7)
      g.fill()
      g.restore()
      g.fillStyle = "#8c4f44"
      g.beginPath()
      g.ellipse(X, 676 * S, 30 * S, 7 * S, 0, Math.PI, 0)
      g.fill()
      g.fillStyle = "#9c5a4c"
      g.beginPath()
      g.ellipse(X, 678 * S, 27 * S, 10 * S, 0, 0, Math.PI)
      g.fill()
      g.strokeStyle = "#4a2a22"
      g.lineWidth = 2 * S
      g.beginPath()
      g.moveTo(X - 31 * S, 675 * S)
      g.quadraticCurveTo(X, 683 * S, X + 31 * S, 675 * S)
      g.stroke()
      // Eyes and brows.
      for (const sx of [-1, 1]) {
        const ex = X + sx * 56 * S
        const ey = 480 * S
        if (open) {
          g.save()
          g.beginPath()
          g.ellipse(ex, ey, 22 * S, 10 * S, 0, 0, 7)
          g.clip()
          g.fillStyle = "#f4efe9"
          g.fillRect(ex - 30 * S, ey - 20 * S, 60 * S, 40 * S)
          const ir = g.createRadialGradient(ex, ey, 2 * S, ex, ey, 10 * S)
          ir.addColorStop(0, "#2a160c")
          ir.addColorStop(0.45, "#4a2a14")
          ir.addColorStop(1, "#1c0f08")
          g.fillStyle = ir
          g.beginPath()
          g.arc(ex, ey, 10 * S, 0, 7)
          g.fill()
          g.fillStyle = "#050302"
          g.beginPath()
          g.arc(ex, ey, 4.5 * S, 0, 7)
          g.fill()
          g.fillStyle = "rgba(255,255,255,0.9)"
          g.beginPath()
          g.arc(ex + 3.5 * S, ey - 3.5 * S, 2 * S, 0, 7)
          g.fill()
          // Shadow cast by the upper lid.
          g.fillStyle = "rgba(40,20,10,0.35)"
          g.fillRect(ex - 30 * S, ey - 12 * S, 60 * S, 5 * S)
          g.restore()
        }
        // Lash line (also the closed eye).
        g.strokeStyle = "#140c08"
        g.lineWidth = (open ? 3 : 3.5) * S
        g.lineCap = "round"
        g.beginPath()
        g.moveTo(ex - 23 * S, ey + (open ? 1 : 3) * S)
        g.quadraticCurveTo(ex, ey - (open ? 13 : -4) * S, ex + 23 * S, ey + (open ? 1 : 3) * S)
        g.stroke()
        // Brow: thick, slightly arched, tapering outward.
        g.save()
        g.filter = `blur(${1.2 * S}px)`
        g.strokeStyle = "#16100d"
        g.lineWidth = 10 * S
        g.beginPath()
        g.moveTo(ex - sx * 26 * S, 444 * S)
        g.quadraticCurveTo(ex + sx * 4 * S, 428 * S, ex + sx * 32 * S, 440 * S)
        g.stroke()
        g.restore()
      }
      // Hair: the scalp is dark under the curls, with a soft hairline.
      g.save()
      g.filter = `blur(${8 * S}px)`
      g.fillStyle = "#120e0c"
      g.fillRect(0, 0, 2048, 345 * S)
      g.fillRect(X + 205 * S, 0, 2048, 600 * S)
      g.fillRect(0, 0, X - 205 * S, 600 * S)
      g.fillRect(X + 300 * S, 0, 2048, 2048)
      g.restore()
      const t = new THREE.CanvasTexture(c)
      t.colorSpace = THREE.SRGBColorSpace
      t.anisotropy = 8
      return t
    }
    const open = paint(true)
    return { open, closed: paint(false), mat: new THREE.MeshStandardMaterial({ map: open, roughness: 0.6 }) }
  }, [])

  // -- Smooth, tapered body parts turned on a lathe ----------------------------
  const shapes = useMemo(() => {
    const lathe = (pts: [number, number][]) => new THREE.LatheGeometry(pts.map(([r, y]) => new THREE.Vector2(r, y)), 28)
    return {
      torso: lathe([[0.001, 0.93], [0.17, 0.94], [0.182, 1.0], [0.174, 1.1], [0.178, 1.2], [0.192, 1.32], [0.196, 1.4], [0.17, 1.455], [0.105, 1.5], [0.072, 1.535], [0.001, 1.54]]),
      upperArm: lathe([[0.001, 0.02], [0.052, 0], [0.058, -0.08], [0.054, -0.2], [0.05, -0.29], [0.001, -0.3]]),
      foreArm: lathe([[0.001, 0.01], [0.055, 0], [0.058, -0.06], [0.047, -0.19], [0.042, -0.25], [0.001, -0.255]]),
      thigh: lathe([[0.001, 0.02], [0.098, 0], [0.1, -0.08], [0.088, -0.25], [0.075, -0.4], [0.001, -0.41]]),
      shin: lathe([[0.001, 0.01], [0.074, 0], [0.078, -0.1], [0.062, -0.28], [0.058, -0.38], [0.001, -0.385]]),
    }
  }, [])

  // Curls: tight spheres over the top, sides and back of the head.
  const curls = useMemo(() => {
    const out: { p: [number, number, number]; s: number }[] = []
    for (let i = 0; i < 520; i++) {
      const y = 1 - (i / 519) * 1.25
      const r = Math.sqrt(Math.max(0, 1 - y * y))
      const phi = i * 2.399963
      const x = Math.cos(phi) * r
      const z = Math.sin(phi) * r
      if (z > 0.38 && y < 0.56) continue // forehead and face stay clear
      if (y < -0.25) continue
      if (y < 0.05 && z > -0.15) continue // stop above the ears at the sides
      const lift = 1.1 + 0.09 * Math.sin(i * 1.7)
      out.push({ p: [x * 0.118 * lift, y * 0.142 * lift, z * 0.132 * lift - 0.006], s: 0.024 + ((i * 37) % 7) * 0.0022 })
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
    // Wrap the difference so a heading past a full turn does not twist his neck.
    const rawYaw = Math.atan2(local.x, local.z) - body.current.rotation.y
    const yaw = THREE.MathUtils.clamp(((rawYaw + Math.PI * 9) % (Math.PI * 2)) - Math.PI, -0.7, 0.7)
    const pitch = THREE.MathUtils.clamp(-Math.atan2(local.y - 1.7, Math.hypot(local.x, local.z)) * 0.6, -0.35, 0.2)
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
    faces.mat.map = blink.current < 0 ? faces.closed : faces.open
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
        {hasModel ? (
          <Suspense fallback={null}>
            <Model />
          </Suspense>
        ) : null}
        <group visible={!hasModel}>
        {/* Legs: tapered thigh and calf, and sneakers with soles, toe caps and laces */}
        {[-1, 1].map((side) => (
          <group key={side} position={[side * 0.1, 0.88, 0]} rotation={[0, 0, side * -0.025]}>
            <mesh material={m.trousers} geometry={shapes.thigh} castShadow />
            <mesh material={m.trousers} geometry={shapes.shin} position={[0, -0.4, 0.004]} castShadow />
            <mesh material={m.trouserDark} position={[0, -0.79, 0.004]}>
              <cylinderGeometry args={[0.064, 0.064, 0.03, 16]} />
            </mesh>
            <group position={[0, -0.835, 0.05]}>
              <mesh material={m.shoe} rotation={[Math.PI / 2, 0, 0]} scale={[1, 1, 0.8]} castShadow>
                <capsuleGeometry args={[0.066, 0.15, 6, 14]} />
              </mesh>
              <mesh material={m.sole} position={[0, -0.042, 0]}>
                <boxGeometry args={[0.138, 0.028, 0.29]} />
              </mesh>
              <mesh material={m.shoeTrim} position={[0, 0.0, -0.1]} scale={[1, 0.9, 0.5]}>
                <sphereGeometry args={[0.068, 12, 10]} />
              </mesh>
              {[0, 1, 2].map((l) => (
                <mesh key={l} material={m.shoeTrim} position={[0, 0.044, 0.01 + l * 0.035]} rotation={[0, 0, Math.PI / 2]}>
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
          <mesh material={m.hoodie} geometry={shapes.torso} scale={[1.04, 1, 0.68]} castShadow />
          {[-1, 1].map((side) => (
            <mesh key={side} material={m.hoodie} position={[side * 0.195, 1.42, 0]} scale={[1.05, 0.8, 0.95]} castShadow>
              <sphereGeometry args={[0.07, 16, 12]} />
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
          <group key={side} ref={side < 0 ? armL : armR} position={[side * 0.24, 1.415, 0]}>
            <mesh material={m.hoodie} geometry={shapes.upperArm} castShadow />
            <group ref={side < 0 ? foreL : foreR} position={[0, -0.28, 0]}>
              <mesh material={m.hoodie} geometry={shapes.foreArm} castShadow />
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
        <mesh material={m.skin} position={[0, 1.56, 0.005]}>
          <cylinderGeometry args={[0.05, 0.058, 0.12, 16]} />
        </mesh>

        {/* Head: sculpted skull with a painted face */}
        <group ref={head} position={[0, 1.725, 0.01]} scale={1.16}>
          <mesh geometry={headGeo} material={faces.mat} scale={0.142} rotation={[0, -Math.PI / 2 + Math.PI / 2, 0]} castShadow />
          {[-1, 1].map((side) => (
            <group key={side} position={[side * 0.111, -0.008, -0.004]}>
              <mesh material={m.skin} scale={[0.4, 1, 0.7]}>
                <sphereGeometry args={[0.03, 12, 10]} />
              </mesh>
              <mesh material={m.skinDark} position={[side * 0.005, 0, 0.006]} scale={[0.25, 0.6, 0.4]}>
                <sphereGeometry args={[0.026, 10, 8]} />
              </mesh>
            </group>
          ))}
          {curls.map((c, i) => (
            <mesh key={i} material={m.hair} position={c.p} scale={c.s} castShadow={i % 8 === 0} userData={{ top: c.p[1] > 0.045 }}>
              <icosahedronGeometry args={[1, 1]} />
            </mesh>
          ))}
          {/* Research glasses */}
          <group ref={glasses} visible={false} position={[0, 0.012, 0.128]} scale={0.56}>
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
          <group ref={helmet} position={[0, 0.045, -0.004]} scale={0.5}>
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
    </group>
  )
}
