"use client"

import { motion } from "framer-motion"
import { LucideIcon } from "lucide-react"
import { useState } from "react"

interface Milestone {
  year: string
  title: string
  icon: LucideIcon
  description: string
  color: "emerald" | "amber" | "coral"
}

interface Timeline3DProps {
  milestones: Milestone[]
}

const colorClasses = {
  emerald: {
    bg: "bg-emerald/20",
    border: "border-emerald",
    text: "text-emerald",
    glow: "shadow-emerald/50",
  },
  amber: {
    bg: "bg-amber/20",
    border: "border-amber",
    text: "text-amber",
    glow: "shadow-amber/50",
  },
  coral: {
    bg: "bg-coral/20",
    border: "border-coral",
    text: "text-coral",
    glow: "shadow-coral/50",
  },
}

export function Timeline3D({ milestones }: Timeline3DProps) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null)

  return (
    <div className="relative">
      {/* Timeline Line */}
      <div className="absolute left-1/2 top-0 bottom-0 w-1 bg-gradient-to-b from-emerald via-amber to-coral transform -translate-x-1/2 hidden md:block" />

      {/* Milestones */}
      <div className="space-y-12">
        {milestones.map((milestone, index) => {
          const Icon = milestone.icon
          const colors = colorClasses[milestone.color]
          const isLeft = index % 2 === 0
          const isActive = activeIndex === index

          return (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: isLeft ? -50 : 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.2 }}
              className={`relative flex items-center ${
                isLeft ? "md:flex-row" : "md:flex-row-reverse"
              } flex-col`}
              onMouseEnter={() => setActiveIndex(index)}
              onMouseLeave={() => setActiveIndex(null)}
            >
              {/* Content Card */}
              <motion.div
                className={`w-full md:w-5/12 ${isLeft ? "md:pr-8" : "md:pl-8"}`}
                animate={{
                  scale: isActive ? 1.05 : 1,
                  rotateY: isActive ? (isLeft ? -5 : 5) : 0,
                }}
                transition={{ duration: 0.3 }}
              >
                <div
                  className={`glass p-6 rounded-xl border-2 ${colors.border} ${
                    isActive ? `shadow-2xl ${colors.glow}` : ""
                  } transition-all duration-300`}
                  style={{
                    transformStyle: "preserve-3d",
                  }}
                >
                  <div className="flex items-start gap-4">
                    <div
                      className={`${colors.bg} p-3 rounded-lg ${colors.text}`}
                    >
                      <Icon className="w-6 h-6" />
                    </div>
                    <div className="flex-1">
                      <div className={`text-sm font-semibold ${colors.text} mb-2`}>
                        {milestone.year}
                      </div>
                      <h4 className="text-xl font-bold mb-2">{milestone.title}</h4>
                      <p className="text-muted-foreground leading-relaxed">
                        {milestone.description}
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Center Node */}
              <motion.div
                className={`absolute left-1/2 transform -translate-x-1/2 w-8 h-8 rounded-full border-4 ${colors.border} bg-background z-10 hidden md:flex items-center justify-center`}
                animate={{
                  scale: isActive ? 1.5 : 1,
                  rotate: isActive ? 180 : 0,
                }}
                transition={{ duration: 0.3 }}
              >
                <motion.div
                  className={`w-3 h-3 rounded-full ${colors.bg}`}
                  animate={{
                    scale: isActive ? [1, 1.5, 1] : 1,
                  }}
                  transition={{
                    duration: 0.8,
                    repeat: isActive ? Infinity : 0,
                  }}
                />
              </motion.div>

              {/* Empty space for alternating layout */}
              <div className="w-full md:w-5/12 hidden md:block" />

              {/* Particle Effect on Hover */}
              {isActive && (
                <motion.div
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0 }}
                  className="absolute inset-0 pointer-events-none"
                >
                  {[...Array(8)].map((_, i) => (
                    <motion.div
                      key={i}
                      className={`absolute w-2 h-2 ${colors.bg} rounded-full`}
                      style={{
                        left: "50%",
                        top: "50%",
                      }}
                      animate={{
                        x: [0, (Math.cos((i * Math.PI) / 4) * 100)],
                        y: [0, (Math.sin((i * Math.PI) / 4) * 100)],
                        opacity: [1, 0],
                      }}
                      transition={{
                        duration: 1,
                        repeat: Infinity,
                        delay: i * 0.1,
                      }}
                    />
                  ))}
                </motion.div>
              )}
            </motion.div>
          )
        })}
      </div>

      {/* Bottom Glow Effect */}
      <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-32 h-32 bg-gradient-radial from-emerald/30 to-transparent rounded-full blur-3xl" />
    </div>
  )
}
