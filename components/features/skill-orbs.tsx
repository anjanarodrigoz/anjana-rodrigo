"use client"

import { motion } from "framer-motion"
import { useEffect, useRef, useState } from "react"

interface Skill {
  name: string
  level: number
  color: string
}

interface SkillOrbsProps {
  skills: Skill[]
}

interface OrbPosition {
  x: number
  y: number
  vx: number
  vy: number
  radius: number
}

export function SkillOrbs({ skills }: SkillOrbsProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [hoveredSkill, setHoveredSkill] = useState<number | null>(null)
  const [orbPositions, setOrbPositions] = useState<OrbPosition[]>([])
  const animationFrameRef = useRef<number>()

  useEffect(() => {
    if (!containerRef.current) return

    const container = containerRef.current
    const rect = container.getBoundingClientRect()
    const centerX = rect.width / 2
    const centerY = rect.height / 2

    // Initialize orb positions in a circular pattern
    const positions: OrbPosition[] = skills.map((skill, index) => {
      const angle = (index / skills.length) * Math.PI * 2
      const distance = 150
      const radius = 30 + (skill.level / 100) * 30

      return {
        x: centerX + Math.cos(angle) * distance,
        y: centerY + Math.sin(angle) * distance,
        vx: (Math.random() - 0.5) * 0.5,
        vy: (Math.random() - 0.5) * 0.5,
        radius,
      }
    })

    setOrbPositions(positions)

    // Physics animation loop
    const animate = () => {
      setOrbPositions((prev) => {
        return prev.map((orb, index) => {
          let newX = orb.x + orb.vx
          let newY = orb.y + orb.vy
          let newVx = orb.vx
          let newVy = orb.vy

          // Boundary collision
          if (newX - orb.radius < 0 || newX + orb.radius > rect.width) {
            newVx *= -0.8
            newX = Math.max(orb.radius, Math.min(rect.width - orb.radius, newX))
          }
          if (newY - orb.radius < 0 || newY + orb.radius > rect.height) {
            newVy *= -0.8
            newY = Math.max(orb.radius, Math.min(rect.height - orb.radius, newY))
          }

          // Gravity towards center
          const dx = centerX - newX
          const dy = centerY - newY
          const distance = Math.sqrt(dx * dx + dy * dy)
          const force = 0.001
          newVx += (dx / distance) * force
          newVy += (dy / distance) * force

          // Damping
          newVx *= 0.99
          newVy *= 0.99

          // Collision with other orbs
          prev.forEach((otherOrb, otherIndex) => {
            if (index === otherIndex) return
            const dx = otherOrb.x - newX
            const dy = otherOrb.y - newY
            const distance = Math.sqrt(dx * dx + dy * dy)
            const minDistance = orb.radius + otherOrb.radius

            if (distance < minDistance) {
              const angle = Math.atan2(dy, dx)
              const targetX = newX + Math.cos(angle) * minDistance
              const targetY = newY + Math.sin(angle) * minDistance
              const ax = (targetX - otherOrb.x) * 0.05
              const ay = (targetY - otherOrb.y) * 0.05
              newVx -= ax
              newVy -= ay
            }
          })

          return {
            ...orb,
            x: newX,
            y: newY,
            vx: newVx,
            vy: newVy,
          }
        })
      })

      animationFrameRef.current = requestAnimationFrame(animate)
    }

    animate()

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }
    }
  }, [skills.length])

  return (
    <div
      ref={containerRef}
      className="relative w-full h-[600px] bg-background/50 rounded-2xl overflow-hidden glass"
    >
      {/* Central Core */}
      <motion.div
        className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 w-24 h-24 rounded-full bg-gradient-to-br from-emerald via-amber to-coral opacity-30 blur-2xl"
        animate={{
          scale: [1, 1.2, 1],
          rotate: [0, 180, 360],
        }}
        transition={{
          duration: 10,
          repeat: Infinity,
          ease: "linear",
        }}
      />

      {/* Skill Orbs */}
      {skills.map((skill, index) => {
        const position = orbPositions[index]
        if (!position) return null

        const isHovered = hoveredSkill === index

        return (
          <motion.div
            key={index}
            className="absolute cursor-pointer"
            style={{
              left: position.x,
              top: position.y,
              width: position.radius * 2,
              height: position.radius * 2,
              x: "-50%",
              y: "-50%",
            }}
            animate={{
              scale: isHovered ? 1.3 : 1,
            }}
            transition={{ duration: 0.3 }}
            onMouseEnter={() => setHoveredSkill(index)}
            onMouseLeave={() => setHoveredSkill(null)}
          >
            {/* Orb Glow */}
            <div
              className="absolute inset-0 rounded-full blur-xl opacity-50"
              style={{
                background: skill.color,
              }}
            />

            {/* Orb Body */}
            <div
              className="absolute inset-0 rounded-full border-2 glass flex items-center justify-center"
              style={{
                borderColor: skill.color,
                background: `linear-gradient(135deg, ${skill.color}20, ${skill.color}05)`,
              }}
            >
              <div className="text-center">
                <div
                  className="text-xs font-bold mb-1"
                  style={{ color: skill.color }}
                >
                  {skill.level}%
                </div>
              </div>
            </div>

            {/* Skill Label */}
            {isHovered && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="absolute top-full left-1/2 transform -translate-x-1/2 mt-4 px-4 py-2 glass rounded-lg border whitespace-nowrap z-10"
                style={{
                  borderColor: skill.color,
                }}
              >
                <div className="text-sm font-semibold">{skill.name}</div>
                <div className="text-xs text-muted-foreground">
                  Proficiency: {skill.level}%
                </div>
              </motion.div>
            )}

            {/* Orbital Ring */}
            {isHovered && (
              <motion.div
                className="absolute inset-0 rounded-full border-2"
                style={{
                  borderColor: skill.color,
                  borderStyle: "dashed",
                }}
                initial={{ scale: 1, opacity: 0 }}
                animate={{
                  scale: [1, 1.5, 1],
                  opacity: [0, 0.5, 0],
                  rotate: 360,
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "linear",
                }}
              />
            )}
          </motion.div>
        )
      })}

      {/* Connecting Lines */}
      <svg
        className="absolute inset-0 w-full h-full pointer-events-none"
        style={{ opacity: 0.2 }}
      >
        {orbPositions.map((orb1, i) => {
          return orbPositions.slice(i + 1).map((orb2, j) => {
            const dx = orb2.x - orb1.x
            const dy = orb2.y - orb1.y
            const distance = Math.sqrt(dx * dx + dy * dy)

            // Only draw lines between nearby orbs
            if (distance < 200) {
              return (
                <line
                  key={`${i}-${j}`}
                  x1={orb1.x}
                  y1={orb1.y}
                  x2={orb2.x}
                  y2={orb2.y}
                  stroke="currentColor"
                  strokeWidth="1"
                  strokeOpacity={1 - distance / 200}
                />
              )
            }
            return null
          })
        })}
      </svg>

      {/* Instructions */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 text-sm text-muted-foreground text-center">
        Hover over orbs to see details • Skills orbit with physics-based motion
      </div>
    </div>
  )
}
