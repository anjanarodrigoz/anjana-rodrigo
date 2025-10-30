"use client"

import { useEffect, useRef } from "react"
import { useTheme } from "next-themes"

interface Particle {
  x: number
  y: number
  vx: number
  vy: number
  size: number
  opacity: number
  targetX?: number
  targetY?: number
}

export function ParticleSystem() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const { theme } = useTheme()
  const particlesRef = useRef<Particle[]>([])
  const animationFrameRef = useRef<number>()
  const mouseRef = useRef({ x: 0, y: 0 })

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Set canvas size
    const resizeCanvas = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }
    resizeCanvas()
    window.addEventListener("resize", resizeCanvas)

    // Initialize particles
    const particleCount = Math.min(10000, Math.floor((canvas.width * canvas.height) / 5000))
    particlesRef.current = Array.from({ length: particleCount }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      vx: (Math.random() - 0.5) * 0.5,
      vy: (Math.random() - 0.5) * 0.5,
      size: Math.random() * 2 + 0.5,
      opacity: Math.random() * 0.5 + 0.3,
    }))

    // Mouse move handler
    const handleMouseMove = (e: MouseEvent) => {
      mouseRef.current = { x: e.clientX, y: e.clientY }
    }
    window.addEventListener("mousemove", handleMouseMove)

    // Get theme colors
    const getColors = () => {
      const isDark = theme === "dark" || (theme === "system" && window.matchMedia("(prefers-color-scheme: dark)").matches)
      if (isDark) {
        return {
          particles: ["#10B981", "#F59E0B", "#FB7185"],
          background: "rgba(23, 23, 23, 0.02)",
        }
      } else {
        return {
          particles: ["#86EFAC", "#FB923C", "#FAF9F6"],
          background: "rgba(250, 249, 246, 0.02)",
        }
      }
    }

    // Animation loop
    const animate = () => {
      if (!ctx || !canvas) return

      const colors = getColors()
      ctx.fillStyle = colors.background
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      const particles = particlesRef.current

      particles.forEach((particle, index) => {
        // Mouse interaction
        const dx = mouseRef.current.x - particle.x
        const dy = mouseRef.current.y - particle.y
        const distance = Math.sqrt(dx * dx + dy * dy)
        const maxDistance = 150

        if (distance < maxDistance) {
          const force = (maxDistance - distance) / maxDistance
          particle.vx -= (dx / distance) * force * 0.1
          particle.vy -= (dy / distance) * force * 0.1
        }

        // Update position
        particle.x += particle.vx
        particle.y += particle.vy

        // Add slight friction
        particle.vx *= 0.99
        particle.vy *= 0.99

        // Add slight random movement
        particle.vx += (Math.random() - 0.5) * 0.05
        particle.vy += (Math.random() - 0.5) * 0.05

        // Boundary conditions
        if (particle.x < 0 || particle.x > canvas.width) {
          particle.vx *= -0.5
          particle.x = Math.max(0, Math.min(canvas.width, particle.x))
        }
        if (particle.y < 0 || particle.y > canvas.height) {
          particle.vy *= -0.5
          particle.y = Math.max(0, Math.min(canvas.height, particle.y))
        }

        // Draw particle
        const colorIndex = index % colors.particles.length
        ctx.fillStyle = colors.particles[colorIndex]
        ctx.globalAlpha = particle.opacity

        ctx.beginPath()
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2)
        ctx.fill()

        // Draw connections to nearby particles
        for (let j = index + 1; j < particles.length; j++) {
          const other = particles[j]
          const dx = particle.x - other.x
          const dy = particle.y - other.y
          const distance = Math.sqrt(dx * dx + dy * dy)

          if (distance < 100) {
            ctx.strokeStyle = colors.particles[colorIndex]
            ctx.globalAlpha = (1 - distance / 100) * 0.2
            ctx.lineWidth = 0.5
            ctx.beginPath()
            ctx.moveTo(particle.x, particle.y)
            ctx.lineTo(other.x, other.y)
            ctx.stroke()
          }

          // Optimize by only checking a subset
          if (j - index > 5) break
        }
      })

      ctx.globalAlpha = 1

      animationFrameRef.current = requestAnimationFrame(animate)
    }

    animate()

    return () => {
      window.removeEventListener("resize", resizeCanvas)
      window.removeEventListener("mousemove", handleMouseMove)
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }
    }
  }, [theme])

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 h-full w-full"
      style={{ mixBlendMode: "screen" }}
    />
  )
}
