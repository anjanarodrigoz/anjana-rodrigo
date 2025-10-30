"use client"

import { Canvas } from "@react-three/fiber"
import { Suspense, useState, useEffect } from "react"
import { motion, useScroll, useTransform } from "framer-motion"
import { useInView } from "react-intersection-observer"
import { Button } from "@/components/ui/button"
import { Volume2, VolumeX, Loader2 } from "lucide-react"

// Lazy load the 3D scene to avoid hydration issues
import dynamic from "next/dynamic"

const TransformationScene = dynamic(
  () => import("@/components/features/transformation-scene").then((mod) => mod.TransformationScene),
  {
    ssr: false,
    loading: () => (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin mx-auto mb-4 text-emerald" />
          <p className="text-muted-foreground">Loading 3D Experience...</p>
        </div>
      </div>
    ),
  }
)

export function JourneySection() {
  const [ref, inView] = useInView({
    threshold: 0.3,
    triggerOnce: false,
  })

  const { scrollYProgress } = useScroll({
    target: ref as any,
    offset: ["start end", "end start"],
  })

  const [soundEnabled, setSoundEnabled] = useState(false)
  const [transformationProgress, setTransformationProgress] = useState(0)
  const [is3DReady, setIs3DReady] = useState(false)

  // Map scroll to transformation progress (0 to 1)
  const progress = useTransform(scrollYProgress, [0.2, 0.8], [0, 1])

  useEffect(() => {
    const unsubscribe = progress.on("change", (v) => {
      setTransformationProgress(v)
    })
    return () => unsubscribe()
  }, [progress])

  // Check if we're on the client side
  useEffect(() => {
    setIs3DReady(true)
  }, [])

  return (
    <section
      id="journey"
      ref={ref}
      className="relative min-h-screen w-full overflow-hidden bg-background"
    >
      {/* 3D Canvas */}
      {is3DReady && (
        <div className="absolute inset-0">
          <Suspense
            fallback={
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <Loader2 className="w-12 h-12 animate-spin mx-auto mb-4 text-emerald" />
                  <p className="text-muted-foreground">Loading 3D Experience...</p>
                </div>
              </div>
            }
          >
            <Canvas
              camera={{ position: [0, 2, 8], fov: 50 }}
              gl={{ antialias: true, alpha: true }}
              dpr={[1, 2]}
              onCreated={(state) => {
                state.gl.setClearColor('#000000', 0)
              }}
            >
              <TransformationScene
                progress={transformationProgress}
                inView={inView}
                soundEnabled={soundEnabled}
              />
            </Canvas>
          </Suspense>
        </div>
      )}

      {/* Overlay Content */}
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

        {/* Sound Toggle */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : { opacity: 0 }}
          transition={{ duration: 1, delay: 1.5 }}
          className="mt-8"
        >
          <Button
            variant="outline"
            size="lg"
            onClick={() => setSoundEnabled(!soundEnabled)}
            className="gap-2"
          >
            {soundEnabled ? (
              <>
                <Volume2 className="w-5 h-5" />
                Sound On
              </>
            ) : (
              <>
                <VolumeX className="w-5 h-5" />
                Sound Off
              </>
            )}
          </Button>
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
