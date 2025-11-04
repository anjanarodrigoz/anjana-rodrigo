"use client"

import { useRef, useEffect, useMemo } from "react"
import { useFrame, useThree } from "@react-three/fiber"
import { OrbitControls, Float } from "@react-three/drei"
import * as THREE from "three"
import { Howl } from "howler"

interface TransformationSceneProps {
  progress: number
  inView: boolean
  soundEnabled: boolean
}

// Mining Character Component
function MiningCharacter({ opacity }: { opacity: number }) {
  const meshRef = useRef<THREE.Group>(null)

  useFrame((state) => {
    if (meshRef.current) {
      // Idle animation
      meshRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.5) * 0.1
      meshRef.current.position.y = Math.sin(state.clock.elapsedTime) * 0.05
    }
  })

  return (
    <group ref={meshRef} position={[-2, 0, 0]}>
      {/* Character body - simplified placeholder */}
      <mesh>
        <capsuleGeometry args={[0.3, 1, 8, 16]} />
        <meshStandardMaterial
          color="#D97706"
          transparent
          opacity={opacity}
          roughness={0.8}
          metalness={0.2}
        />
      </mesh>

      {/* Mining helmet */}
      <mesh position={[0, 0.8, 0]}>
        <sphereGeometry args={[0.35, 16, 16]} />
        <meshStandardMaterial
          color="#EAB308"
          transparent
          opacity={opacity}
          roughness={0.5}
          metalness={0.8}
        />
      </mesh>

      {/* Helmet light */}
      <pointLight
        position={[0, 0.8, 0.4]}
        intensity={opacity * 2}
        color="#FACC15"
        distance={5}
      />
    </group>
  )
}

// Tech Character Component
function TechCharacter({ opacity }: { opacity: number }) {
  const meshRef = useRef<THREE.Group>(null)

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.3) * 0.1
      meshRef.current.position.y = Math.sin(state.clock.elapsedTime * 0.5) * 0.05
    }
  })

  return (
    <group ref={meshRef} position={[2, 0, 0]}>
      {/* Character body */}
      <mesh>
        <capsuleGeometry args={[0.3, 1, 8, 16]} />
        <meshStandardMaterial
          color="#3B82F6"
          transparent
          opacity={opacity}
          roughness={0.3}
          metalness={0.7}
          emissive="#3B82F6"
          emissiveIntensity={opacity * 0.3}
        />
      </mesh>

      {/* Tech headset */}
      <mesh position={[0, 0.8, 0]} rotation={[0, 0, Math.PI / 16]}>
        <torusGeometry args={[0.35, 0.05, 8, 32]} />
        <meshStandardMaterial
          color="#10B981"
          transparent
          opacity={opacity}
          roughness={0.2}
          metalness={0.9}
          emissive="#10B981"
          emissiveIntensity={opacity * 0.5}
        />
      </mesh>
    </group>
  )
}

// Dust Particles for Mining Environment
function DustParticles({ opacity }: { opacity: number }) {
  const pointsRef = useRef<THREE.Points>(null)

  const particles = useMemo(() => {
    const positions = new Float32Array(500 * 3)
    for (let i = 0; i < 500; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 10
      positions[i * 3 + 1] = Math.random() * 5
      positions[i * 3 + 2] = (Math.random() - 0.5) * 10
    }
    return positions
  }, [])

  useFrame((state) => {
    if (pointsRef.current) {
      pointsRef.current.rotation.y += 0.001
      const positions = pointsRef.current.geometry.attributes.position.array as Float32Array
      for (let i = 0; i < positions.length; i += 3) {
        positions[i + 1] += Math.sin(state.clock.elapsedTime + i) * 0.001
      }
      pointsRef.current.geometry.attributes.position.needsUpdate = true
    }
  })

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={particles.length / 3}
          array={particles}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.05}
        color="#92400E"
        transparent
        opacity={opacity * 0.6}
        sizeAttenuation
      />
    </points>
  )
}

// Digital Particles for Tech Environment
function DigitalParticles({ opacity }: { opacity: number }) {
  const pointsRef = useRef<THREE.Points>(null)

  const particles = useMemo(() => {
    const positions = new Float32Array(500 * 3)
    for (let i = 0; i < 500; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 10
      positions[i * 3 + 1] = Math.random() * 5
      positions[i * 3 + 2] = (Math.random() - 0.5) * 10
    }
    return positions
  }, [])

  useFrame((state) => {
    if (pointsRef.current) {
      pointsRef.current.rotation.y -= 0.002
      const positions = pointsRef.current.geometry.attributes.position.array as Float32Array
      for (let i = 0; i < positions.length; i += 3) {
        positions[i + 1] += Math.cos(state.clock.elapsedTime + i) * 0.002
        positions[i] += Math.sin(state.clock.elapsedTime * 0.5 + i) * 0.001
      }
      pointsRef.current.geometry.attributes.position.needsUpdate = true
    }
  })

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={particles.length / 3}
          array={particles}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.08}
        color="#10B981"
        transparent
        opacity={opacity * 0.8}
        sizeAttenuation
      />
    </points>
  )
}

// Mining Rocks Environment
function MiningEnvironment({ opacity }: { opacity: number }) {
  return (
    <group position={[0, -2, 0]}>
      {/* Ground rocks */}
      {Array.from({ length: 20 }).map((_, i) => {
        const x = (Math.random() - 0.5) * 15
        const z = (Math.random() - 0.5) * 15
        const scale = Math.random() * 0.5 + 0.3
        return (
          <mesh
            key={i}
            position={[x, Math.random() * 0.3, z]}
            rotation={[Math.random(), Math.random(), Math.random()]}
            scale={scale}
          >
            <dodecahedronGeometry args={[0.5, 0]} />
            <meshStandardMaterial
              color="#78350F"
              transparent
              opacity={opacity}
              roughness={0.9}
              metalness={0.1}
            />
          </mesh>
        )
      })}

      {/* Ground plane */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
        <planeGeometry args={[20, 20]} />
        <meshStandardMaterial
          color="#451A03"
          transparent
          opacity={opacity}
          roughness={0.9}
        />
      </mesh>
    </group>
  )
}

// Tech Workspace Environment
function TechEnvironment({ opacity }: { opacity: number }) {
  return (
    <group position={[0, -2, 0]}>
      {/* Floating screens */}
      {Array.from({ length: 8 }).map((_, i) => {
        const angle = (i / 8) * Math.PI * 2
        const radius = 4
        return (
          <Float
            key={i}
            speed={1 + i * 0.1}
            rotationIntensity={0.2}
            floatIntensity={0.5}
          >
            <mesh
              position={[
                Math.cos(angle) * radius,
                2 + Math.sin(i) * 0.5,
                Math.sin(angle) * radius,
              ]}
              rotation={[0, -angle, 0]}
            >
              <planeGeometry args={[1, 0.6]} />
              <meshStandardMaterial
                color="#10B981"
                transparent
                opacity={opacity * 0.6}
                emissive="#10B981"
                emissiveIntensity={opacity * 0.5}
                side={THREE.DoubleSide}
              />
            </mesh>
          </Float>
        )
      })}

      {/* Floor grid */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]}>
        <planeGeometry args={[20, 20, 20, 20]} />
        <meshStandardMaterial
          color="#0F172A"
          transparent
          opacity={opacity}
          wireframe
          emissive="#3B82F6"
          emissiveIntensity={opacity * 0.2}
        />
      </mesh>

      {/* Holographic pillars */}
      {[...Array(4)].map((_, i) => {
        const positions = [
          [-3, 1, -3],
          [3, 1, -3],
          [-3, 1, 3],
          [3, 1, 3],
        ]
        return (
          <mesh key={i} position={positions[i] as [number, number, number]}>
            <cylinderGeometry args={[0.1, 0.1, 2, 8]} />
            <meshStandardMaterial
              color="#06B6D4"
              transparent
              opacity={opacity * 0.7}
              emissive="#06B6D4"
              emissiveIntensity={opacity * 0.8}
            />
          </mesh>
        )
      })}
    </group>
  )
}

export function TransformationScene({
  progress,
  inView,
  soundEnabled,
}: TransformationSceneProps) {
  const { camera } = useThree()
  const soundRef = useRef<{ mining: Howl | null; tech: Howl | null }>({
    mining: null,
    tech: null,
  })

  // Initialize sounds (using placeholder - replace with actual sound files)
  useEffect(() => {
    // Note: You'll need to add actual sound files to public/sounds/
    // soundRef.current.mining = new Howl({
    //   src: ['/sounds/mining-ambience.mp3'],
    //   loop: true,
    //   volume: 0.3,
    // })
    //
    // soundRef.current.tech = new Howl({
    //   src: ['/sounds/tech-ambience.mp3'],
    //   loop: true,
    //   volume: 0.3,
    // })

    return () => {
      soundRef.current.mining?.stop()
      soundRef.current.tech?.stop()
    }
  }, [])

  // Handle sound playback
  useEffect(() => {
    if (!soundEnabled) {
      soundRef.current.mining?.fade(soundRef.current.mining.volume(), 0, 500)
      soundRef.current.tech?.fade(soundRef.current.tech.volume(), 0, 500)
      setTimeout(() => {
        soundRef.current.mining?.pause()
        soundRef.current.tech?.pause()
      }, 500)
      return
    }

    if (progress < 0.5) {
      soundRef.current.mining?.play()
      soundRef.current.mining?.fade(0, 0.3 * (1 - progress * 2), 500)
      soundRef.current.tech?.fade(soundRef.current.tech.volume(), 0, 500)
    } else {
      soundRef.current.tech?.play()
      soundRef.current.tech?.fade(0, 0.3 * ((progress - 0.5) * 2), 500)
      soundRef.current.mining?.fade(soundRef.current.mining.volume(), 0, 500)
    }
  }, [progress, soundEnabled])

  // Camera animation based on progress
  useFrame(() => {
    if (inView) {
      // Move camera from mining (left) to tech (right)
      camera.position.x = THREE.MathUtils.lerp(camera.position.x, (progress - 0.5) * 4, 0.05)
      camera.position.y = THREE.MathUtils.lerp(camera.position.y, 2 + progress, 0.05)
      camera.lookAt(0, 0, 0)
    }
  })

  // Calculate opacities based on progress
  const miningOpacity = Math.max(0, 1 - progress * 2)
  const techOpacity = Math.min(1, progress * 2)

  return (
    <>
      {/* Lighting */}
      <ambientLight intensity={0.2} />

      {/* Mining warm light */}
      <directionalLight
        position={[-5, 5, 5]}
        intensity={miningOpacity * 1.5}
        color="#F59E0B"
        castShadow
      />

      {/* Tech cool light */}
      <directionalLight
        position={[5, 5, -5]}
        intensity={techOpacity * 2}
        color="#3B82F6"
      />

      {/* Spot light for drama */}
      <spotLight
        position={[0, 10, 0]}
        angle={0.3}
        penumbra={1}
        intensity={1}
        color={progress < 0.5 ? "#F59E0B" : "#10B981"}
        castShadow
      />

      {/* Characters */}
      <MiningCharacter opacity={miningOpacity} />
      <TechCharacter opacity={techOpacity} />

      {/* Environments */}
      <MiningEnvironment opacity={miningOpacity} />
      <TechEnvironment opacity={techOpacity} />

      {/* Particles */}
      <DustParticles opacity={miningOpacity} />
      <DigitalParticles opacity={techOpacity} />

      {/* Fog */}
      <fog
        attach="fog"
        args={[
          progress < 0.5 ? "#78350F" : "#0F172A",
          10,
          30,
        ]}
      />

      {/* Controls - subtle, automatic rotation */}
      <OrbitControls
        enableZoom={false}
        enablePan={false}
        autoRotate
        autoRotateSpeed={0.5}
        maxPolarAngle={Math.PI / 2}
        minPolarAngle={Math.PI / 4}
      />
    </>
  )
}
