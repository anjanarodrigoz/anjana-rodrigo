"use client"

import { motion } from "framer-motion"
import { useInView } from "react-intersection-observer"
import { GraduationCap, BookOpen, Presentation, Building2, Lightbulb } from "lucide-react"

interface JourneyStep {
  id: number
  year: string
  title: string
  description: string
  icon: React.ReactNode
  color: string
}

const journeySteps: JourneyStep[] = [
  {
    id: 1,
    year: "2015",
    title: "University of Moratuwa",
    description: "Graduated as a Mining Engineer, gaining deep understanding of systems, processes, and optimization",
    icon: <GraduationCap className="w-8 h-8" />,
    color: "#f59e0b", // amber-500
  },
  {
    id: 2,
    year: "2016-2017",
    title: "Software Development Journey",
    description: "Self-studied programming, algorithms, and modern software development practices",
    icon: <BookOpen className="w-8 h-8" />,
    color: "#10b981", // emerald-500
  },
  {
    id: 3,
    year: "2018",
    title: "Demonstrator at BIT Moratuwa",
    description: "Teaching and mentoring students while enhancing my practical software development skills",
    icon: <Presentation className="w-8 h-8" />,
    color: "#f97316", // orange-500 (coral)
  },
  {
    id: 4,
    year: "2019-2021",
    title: "System Architecture Mastery",
    description: "Learned enterprise-level system design, microservices, cloud architecture, and scalable solutions",
    icon: <Building2 className="w-8 h-8" />,
    color: "#a855f7", // purple-500
  },
  {
    id: 5,
    year: "2022-Present",
    title: "Digital Innovations Creator",
    description: "Building cutting-edge applications, AI-powered solutions, and transforming ideas into reality",
    icon: <Lightbulb className="w-8 h-8" />,
    color: "#10b981", // emerald-500
  },
]

export function JourneySection() {
  const [ref, inView] = useInView({
    threshold: 0.1,
    triggerOnce: true,
  })

  return (
    <section
      id="journey"
      ref={ref}
      className="relative py-20 px-4 sm:px-6 lg:px-8 overflow-hidden bg-gradient-to-b from-background via-background/95 to-background"
    >
      {/* Background Aurora */}
      <div className="absolute inset-0 aurora-bg opacity-10 dark:opacity-20" />

      <div className="relative z-10 max-w-7xl mx-auto">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-20"
        >
          <h2 className="text-4xl sm:text-5xl font-bold mb-4 gradient-text">
            My Journey
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            From mining engineer to digital innovator - a transformation driven by passion for technology
          </p>
        </motion.div>

        {/* Horizontal Snake Roadmap */}
        <div className="relative">
          {/* Desktop View - Horizontal Snake */}
          <div className="hidden lg:block">
            <div className="relative">
              {journeySteps.map((step, index) => {
                const isEven = index % 2 === 0
                const isLast = index === journeySteps.length - 1

                return (
                  <div key={step.id} className="relative">
                    <motion.div
                      initial={{ opacity: 0, x: -50 }}
                      animate={inView ? { opacity: 1, x: 0 } : {}}
                      transition={{ duration: 0.6, delay: index * 0.2 }}
                      className={`flex items-center gap-8 mb-16 ${
                        isEven ? "flex-row" : "flex-row-reverse"
                      }`}
                    >
                      {/* Content Card */}
                      <div className={`flex-1 ${isEven ? "text-right" : "text-left"}`}>
                        <motion.div
                          whileHover={{ scale: 1.02 }}
                          className={`glass rounded-xl p-6 border-2 border-border/50 hover:border-${step.color}/50 dark:hover:border-${step.color} transition-all shadow-lg inline-block max-w-md ${
                            isEven ? "ml-auto" : "mr-auto"
                          }`}
                        >
                          <div className="text-sm font-semibold text-emerald mb-2">
                            {step.year}
                          </div>
                          <h3 className="text-xl font-bold mb-3 text-foreground">
                            {step.title}
                          </h3>
                          <p className="text-muted-foreground text-sm">
                            {step.description}
                          </p>
                        </motion.div>
                      </div>

                      {/* Icon Circle */}
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={inView ? { scale: 1 } : {}}
                        transition={{ duration: 0.5, delay: index * 0.2 + 0.3 }}
                        className="relative flex-shrink-0"
                      >
                        <div
                          className="w-20 h-20 rounded-full flex items-center justify-center shadow-2xl border-4 border-background relative z-10"
                          style={{
                            background: `linear-gradient(to bottom right, ${step.color}, ${step.color})`,
                          }}
                        >
                          <div className="text-white">
                            {step.icon}
                          </div>
                        </div>

                        {/* Connecting Line */}
                        {!isLast && (
                          <motion.div
                            initial={{ scaleY: 0 }}
                            animate={inView ? { scaleY: 1 } : {}}
                            transition={{ duration: 0.5, delay: index * 0.2 + 0.5 }}
                            className={`absolute top-20 ${
                              isEven ? "left-10" : "right-10"
                            } w-0.5 h-16 origin-top`}
                            style={{
                              background: `linear-gradient(to bottom, ${step.color}, ${journeySteps[index + 1].color})`,
                            }}
                          />
                        )}
                      </motion.div>

                      {/* Spacer for alignment */}
                      <div className="flex-1" />
                    </motion.div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Mobile/Tablet View - Vertical */}
          <div className="lg:hidden">
            {journeySteps.map((step, index) => {
              const isLast = index === journeySteps.length - 1

              return (
                <div key={step.id} className="relative pl-20 pb-12">
                  {/* Icon Circle */}
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={inView ? { scale: 1 } : {}}
                    transition={{ duration: 0.5, delay: index * 0.2 }}
                    className="absolute left-0 top-0"
                  >
                    <div
                      className="w-16 h-16 rounded-full flex items-center justify-center shadow-xl border-4 border-background"
                      style={{
                        background: `linear-gradient(to bottom right, ${step.color}, ${step.color})`,
                      }}
                    >
                      <div className="text-white">
                        {step.icon}
                      </div>
                    </div>

                    {/* Connecting Line */}
                    {!isLast && (
                      <motion.div
                        initial={{ scaleY: 0 }}
                        animate={inView ? { scaleY: 1 } : {}}
                        transition={{ duration: 0.5, delay: index * 0.2 + 0.3 }}
                        className="absolute top-16 left-8 w-0.5 h-20 origin-top"
                        style={{
                          background: `linear-gradient(to bottom, ${step.color}, ${journeySteps[index + 1].color})`,
                        }}
                      />
                    )}
                  </motion.div>

                  {/* Content Card */}
                  <motion.div
                    initial={{ opacity: 0, x: -30 }}
                    animate={inView ? { opacity: 1, x: 0 } : {}}
                    transition={{ duration: 0.6, delay: index * 0.2 }}
                    whileHover={{ scale: 1.02 }}
                    className="glass rounded-xl p-5 border-2 border-border/50 transition-all shadow-lg"
                  >
                    <div className="text-sm font-semibold text-emerald mb-2">
                      {step.year}
                    </div>
                    <h3 className="text-lg font-bold mb-2 text-foreground">
                      {step.title}
                    </h3>
                    <p className="text-muted-foreground text-sm">
                      {step.description}
                    </p>
                  </motion.div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </section>
  )
}
