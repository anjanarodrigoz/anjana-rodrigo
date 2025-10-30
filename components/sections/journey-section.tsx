"use client"

import { useState, useEffect } from "react"
import { motion, useScroll, useTransform } from "framer-motion"
import { useInView } from "react-intersection-observer"
import { Hammer, Code, Mountain } from "lucide-react"

export function JourneySection() {
  const [ref, inView] = useInView({
    threshold: 0.3,
    triggerOnce: false,
  })

  const { scrollYProgress } = useScroll({
    target: ref as any,
    offset: ["start end", "end start"],
  })

  const [transformationProgress, setTransformationProgress] = useState(0)

  // Map scroll to transformation progress (0 to 1)
  const progress = useTransform(scrollYProgress, [0.2, 0.8], [0, 1])

  useEffect(() => {
    const unsubscribe = progress.on("change", (v) => {
      setTransformationProgress(v)
    })
    return () => unsubscribe()
  }, [progress])

  // Calculate opacities
  const miningOpacity = Math.max(0, 1 - transformationProgress * 2)
  const techOpacity = Math.min(1, transformationProgress * 2)
  const transitionOpacity = 1 - Math.abs(transformationProgress - 0.5) * 2

  return (
    <section
      id="journey"
      ref={ref}
      className="relative min-h-screen w-full overflow-hidden bg-background"
    >
      {/* Animated Background */}
      <div className="absolute inset-0">
        {/* Mining Background */}
        <motion.div
          className="absolute inset-0 bg-gradient-to-br from-amber-900/20 via-orange-900/20 to-yellow-900/20"
          style={{ opacity: miningOpacity }}
        >
          {/* Floating rocks/particles */}
          {Array.from({ length: 30 }).map((_, i) => (
            <motion.div
              key={`rock-${i}`}
              className="absolute w-4 h-4 bg-amber-700/30 rounded-full"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
              }}
              animate={{
                y: [0, -20, 0],
                x: [0, Math.random() * 10 - 5, 0],
                opacity: [0.3, 0.6, 0.3],
              }}
              transition={{
                duration: 3 + Math.random() * 2,
                repeat: Infinity,
                delay: Math.random() * 2,
              }}
            />
          ))}
        </motion.div>

        {/* Tech Background */}
        <motion.div
          className="absolute inset-0 bg-gradient-to-br from-emerald-900/20 via-blue-900/20 to-cyan-900/20"
          style={{ opacity: techOpacity }}
        >
          {/* Digital particles */}
          {Array.from({ length: 30 }).map((_, i) => (
            <motion.div
              key={`digital-${i}`}
              className="absolute w-2 h-2 bg-emerald-500/50 rounded-sm"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
              }}
              animate={{
                y: [0, -30, 0],
                x: [0, Math.random() * 15 - 7.5, 0],
                opacity: [0.3, 0.8, 0.3],
                rotate: [0, 360],
              }}
              transition={{
                duration: 2 + Math.random() * 1.5,
                repeat: Infinity,
                delay: Math.random() * 2,
              }}
            />
          ))}
        </motion.div>

        {/* Aurora effect */}
        <motion.div
          className="absolute inset-0 aurora-bg opacity-20"
          animate={{
            backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
          }}
          transition={{
            duration: 15,
            repeat: Infinity,
            ease: "linear",
          }}
        />
      </div>

      {/* Main Content */}
      <div className="relative z-10 flex min-h-screen flex-col items-center justify-center px-4">
        {/* Title */}
        <motion.div
          initial={{ opacity: 0, y: -50 }}
          animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: -50 }}
          transition={{ duration: 1 }}
          className="mb-8 text-center"
        >
          <h2 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl mb-6">
            <span className="gradient-text">The Transformation</span>
          </h2>
        </motion.div>

        {/* Quote */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : { opacity: 0 }}
          transition={{ duration: 1, delay: 0.5 }}
          className="max-w-4xl text-center mb-12"
        >
          <p className="text-xl sm:text-2xl md:text-3xl font-light italic text-muted-foreground">
            "From beneath the surface of the earth to the depths of digital innovation —
            I transformed mining logic into software intelligence."
          </p>
        </motion.div>

        {/* Visual Representation */}
        <div className="mb-12 relative w-full max-w-4xl h-64">
          {/* Mining Character */}
          <motion.div
            className="absolute left-0 top-1/2 -translate-y-1/2"
            style={{ opacity: miningOpacity }}
          >
            <div className="flex flex-col items-center gap-4">
              <motion.div
                className="relative"
                animate={{
                  y: [0, -10, 0],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              >
                <div className="w-32 h-32 rounded-full bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center shadow-2xl">
                  <Hammer className="w-16 h-16 text-white" />
                </div>
                <div className="absolute -top-2 -right-2 w-8 h-8 bg-yellow-400 rounded-full animate-pulse" />
              </motion.div>
              <div className="text-center">
                <div className="font-bold text-amber-500">Mining Engineer</div>
                <div className="text-sm text-muted-foreground">2010-2016</div>
              </div>
            </div>
          </motion.div>

          {/* Transition Animation */}
          <motion.div
            className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
            style={{ opacity: transitionOpacity }}
          >
            <div className="relative">
              <motion.div
                className="w-24 h-24 rounded-full border-4 border-coral"
                animate={{
                  rotate: 360,
                  scale: [1, 1.2, 1],
                }}
                transition={{
                  rotate: {
                    duration: 2,
                    repeat: Infinity,
                    ease: "linear",
                  },
                  scale: {
                    duration: 1.5,
                    repeat: Infinity,
                    ease: "easeInOut",
                  },
                }}
              />
              <motion.div
                className="absolute inset-0 flex items-center justify-center"
                animate={{
                  rotate: -360,
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: "linear",
                }}
              >
                <Mountain className="w-12 h-12 text-coral" />
              </motion.div>
            </div>
            <div className="text-center mt-4">
              <div className="font-bold text-coral">Transition</div>
              <div className="text-sm text-muted-foreground">2016-2018</div>
            </div>
          </motion.div>

          {/* Tech Character */}
          <motion.div
            className="absolute right-0 top-1/2 -translate-y-1/2"
            style={{ opacity: techOpacity }}
          >
            <div className="flex flex-col items-center gap-4">
              <motion.div
                className="relative"
                animate={{
                  y: [0, -10, 0],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: 0.5,
                }}
              >
                <div className="w-32 h-32 rounded-full bg-gradient-to-br from-emerald-500 to-cyan-600 flex items-center justify-center shadow-2xl">
                  <Code className="w-16 h-16 text-white" />
                </div>
                <motion.div
                  className="absolute -top-2 -right-2 w-8 h-8 bg-emerald-400 rounded-full"
                  animate={{
                    scale: [1, 1.3, 1],
                  }}
                  transition={{
                    duration: 1.5,
                    repeat: Infinity,
                  }}
                />
              </motion.div>
              <div className="text-center">
                <div className="font-bold text-emerald-500">Software Engineer</div>
                <div className="text-sm text-muted-foreground">2018-Present</div>
              </div>
            </div>
          </motion.div>

          {/* Connection Line */}
          <motion.div
            className="absolute left-1/4 right-1/4 top-1/2 h-0.5 bg-gradient-to-r from-amber via-coral to-emerald"
            style={{
              scaleX: transformationProgress,
              originX: 0,
            }}
          />
        </div>

        {/* Progress Indicator */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
          transition={{ duration: 1, delay: 1 }}
          className="glass p-6 rounded-2xl max-w-2xl w-full"
        >
          <div className="space-y-4">
            {/* Progress Bar */}
            <div>
              <div className="flex justify-between mb-2 text-sm">
                <span className="text-amber">Mining Engineer</span>
                <span className="text-emerald">Software Engineer</span>
              </div>
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-gradient-to-r from-amber via-coral to-emerald"
                  style={{
                    width: `${transformationProgress * 100}%`,
                  }}
                  transition={{ duration: 0.3 }}
                />
              </div>
            </div>

            {/* Stage Indicators */}
            <div className="grid grid-cols-3 gap-4 text-center text-sm">
              <div
                className={`p-3 rounded-lg transition-all ${
                  transformationProgress < 0.33
                    ? "bg-amber/20 text-amber border border-amber"
                    : "glass"
                }`}
              >
                <div className="font-semibold">Mining Field</div>
                <div className="text-xs text-muted-foreground">2010-2016</div>
              </div>
              <div
                className={`p-3 rounded-lg transition-all ${
                  transformationProgress >= 0.33 && transformationProgress < 0.66
                    ? "bg-coral/20 text-coral border border-coral"
                    : "glass"
                }`}
              >
                <div className="font-semibold">Transition</div>
                <div className="text-xs text-muted-foreground">2016-2018</div>
              </div>
              <div
                className={`p-3 rounded-lg transition-all ${
                  transformationProgress >= 0.66
                    ? "bg-emerald/20 text-emerald border border-emerald"
                    : "glass"
                }`}
              >
                <div className="font-semibold">Tech Workspace</div>
                <div className="text-xs text-muted-foreground">2018-Present</div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Scroll Hint */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : { opacity: 0 }}
          transition={{ duration: 1, delay: 2 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2"
        >
          <motion.div
            animate={{ y: [0, 10, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="text-center text-muted-foreground"
          >
            <div className="text-sm mb-2">Scroll to witness the transformation</div>
            <div className="text-2xl">↓</div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}
