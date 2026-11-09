import * as CANNON from "cannon-es"
import * as THREE from "three"

import { BOUNDS, topHeight } from "./terrain"

/**
 * Rigid-body physics for loose rock: blasted rock thrown from the drill
 * bench, rock dumped from the excavator bucket into a truck, and ore falling
 * off the conveyor onto the stockpile. The island ground is a heightfield
 * sampled from the same terrain function the renderer uses.
 */

interface Rock {
  body: CANNON.Body
  mesh: THREE.Mesh
  born: number
  life: number
  baseScale: number
}

export interface StaticBox {
  half: THREE.Vector3
  position: THREE.Vector3
  rotationY?: number
}

export function createPhysics(scene: THREE.Object3D, rockMaterial: THREE.Material, maxRocks = 90) {
  const world = new CANNON.World({ gravity: new CANNON.Vec3(0, -9.82, 0) })
  world.broadphase = new CANNON.SAPBroadphase(world)
  world.allowSleep = true
  ;(world.solver as CANNON.GSSolver).iterations = 6

  const ground = new CANNON.Material("ground")
  const stone = new CANNON.Material("stone")
  world.addContactMaterial(new CANNON.ContactMaterial(ground, stone, { friction: 0.6, restitution: 0.15 }))
  world.addContactMaterial(new CANNON.ContactMaterial(stone, stone, { friction: 0.5, restitution: 0.1 }))

  // Heightfield: data[i][j] with i along +x and j along −z after rotating
  // the shape so its local z (height) points up the world y axis.
  {
    const es = 0.28
    const nx = Math.ceil((BOUNDS.maxX - BOUNDS.minX) / es) + 1
    const nz = Math.ceil((BOUNDS.maxZ - BOUNDS.minZ) / es) + 1
    const data: number[][] = []
    for (let i = 0; i < nx; i++) {
      const row: number[] = []
      for (let j = 0; j < nz; j++) {
        const x = BOUNDS.minX + i * es
        const z = BOUNDS.maxZ - j * es
        row.push(topHeight(x, z))
      }
      data.push(row)
    }
    const hf = new CANNON.Heightfield(data, { elementSize: es })
    const body = new CANNON.Body({ mass: 0, material: ground })
    body.addShape(hf)
    body.quaternion.setFromEuler(-Math.PI / 2, 0, 0)
    body.position.set(BOUNDS.minX, 0, BOUNDS.maxZ)
    world.addBody(body)
  }

  /** Add a static box collider (truck tray walls, stockpile, plant walls). */
  const addStaticBox = ({ half, position, rotationY = 0 }: StaticBox) => {
    const body = new CANNON.Body({ mass: 0, material: ground })
    body.addShape(new CANNON.Box(new CANNON.Vec3(half.x, half.y, half.z)))
    body.position.set(position.x, position.y, position.z)
    body.quaternion.setFromEuler(0, rotationY, 0)
    world.addBody(body)
    return body
  }

  /** Static sphere (e.g. a stockpile cone approximated by a buried sphere). */
  const addStaticSphere = (radius: number, position: THREE.Vector3) => {
    const body = new CANNON.Body({ mass: 0, material: ground, shape: new CANNON.Sphere(radius) })
    body.position.set(position.x, position.y, position.z)
    world.addBody(body)
    return body
  }

  // Rock pool.
  const rockGeo = new THREE.DodecahedronGeometry(1, 0)
  const rocks: Rock[] = []
  let clock = 0

  const spawnRock = (at: THREE.Vector3, velocity: THREE.Vector3, size = 0.12, life = 9) => {
    if (rocks.length >= maxRocks) {
      const old = rocks.shift()!
      world.removeBody(old.body)
      scene.remove(old.mesh)
    }
    const body = new CANNON.Body({
      mass: size * size * size * 2600,
      material: stone,
      shape: new CANNON.Sphere(size),
      linearDamping: 0.05,
      angularDamping: 0.4,
      sleepSpeedLimit: 0.15,
      sleepTimeLimit: 0.6,
    })
    body.position.set(at.x, at.y, at.z)
    body.velocity.set(velocity.x, velocity.y, velocity.z)
    body.angularVelocity.set((Math.random() - 0.5) * 8, (Math.random() - 0.5) * 8, (Math.random() - 0.5) * 8)
    world.addBody(body)
    const mesh = new THREE.Mesh(rockGeo, rockMaterial)
    const s = size * (1.05 + Math.random() * 0.2)
    mesh.scale.set(s, s * (0.75 + Math.random() * 0.3), s)
    mesh.castShadow = true
    mesh.receiveShadow = true
    scene.add(mesh)
    rocks.push({ body, mesh, born: clock, life, baseScale: 1 })
    return body
  }

  /** Remove rocks inside a box (e.g. when a loaded truck's load is "carried away"). */
  const clearIn = (min: THREE.Vector3, max: THREE.Vector3) => {
    for (let i = rocks.length - 1; i >= 0; i--) {
      const p = rocks[i].body.position
      if (p.x > min.x && p.x < max.x && p.y > min.y && p.y < max.y && p.z > min.z && p.z < max.z) {
        world.removeBody(rocks[i].body)
        scene.remove(rocks[i].mesh)
        rocks.splice(i, 1)
      }
    }
  }

  const countIn = (min: THREE.Vector3, max: THREE.Vector3) =>
    rocks.filter(({ body: { position: p } }) => p.x > min.x && p.x < max.x && p.y > min.y && p.y < max.y && p.z > min.z && p.z < max.z).length

  const step = (dt: number) => {
    clock += dt
    world.step(1 / 60, dt, 3)
    for (let i = rocks.length - 1; i >= 0; i--) {
      const r = rocks[i]
      const age = clock - r.born
      // Fell off the island, or expired: remove (shrinking out over 0.6 s).
      if (r.body.position.y < -20 || age > r.life) {
        const k = Math.max(0, 1 - (age - r.life) / 0.6)
        if (k <= 0 || r.body.position.y < -20) {
          world.removeBody(r.body)
          scene.remove(r.mesh)
          rocks.splice(i, 1)
          continue
        }
        r.mesh.scale.setScalar(r.mesh.scale.x * (0.9 + 0.1 * k))
      }
      r.mesh.position.copy(r.body.position as unknown as THREE.Vector3)
      r.mesh.quaternion.copy(r.body.quaternion as unknown as THREE.Quaternion)
    }
  }

  const dispose = () => {
    for (const r of rocks) scene.remove(r.mesh)
    rocks.length = 0
    rockGeo.dispose()
  }

  return { world, step, spawnRock, addStaticBox, addStaticSphere, clearIn, countIn, dispose }
}

export type Physics = ReturnType<typeof createPhysics>
