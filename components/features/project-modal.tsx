"use client"

import { motion, AnimatePresence } from "framer-motion"
import { X, ExternalLink, Github, CheckCircle } from "lucide-react"
import { Project } from "@/components/sections/projects-section"
import { Button } from "@/components/ui/button"
import { useEffect } from "react"

interface ProjectModalProps {
  project: Project
  onClose: () => void
}

export function ProjectModal({ project, onClose }: ProjectModalProps) {
  useEffect(() => {
    document.body.style.overflow = "hidden"
    return () => {
      document.body.style.overflow = "auto"
    }
  }, [])

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, y: 20 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.9, y: 20 }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          className="relative w-full max-w-6xl max-h-[90vh] overflow-y-auto glass rounded-2xl border border-border scrollbar-thin"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Close Button */}
          <button
            onClick={onClose}
            className="sticky top-4 right-4 float-right z-10 p-2 glass rounded-full hover:bg-destructive hover:text-destructive-foreground transition-colors"
          >
            <X className="w-6 h-6" />
          </button>

          <div className="p-8">
            {/* Header */}
            <div className="mb-8">
              <h2 className="text-4xl font-bold mb-4 gradient-text">
                {project.title}
              </h2>
              <p className="text-xl text-muted-foreground mb-6">
                {project.description}
              </p>

              {/* Action Buttons */}
              <div className="flex gap-4">
                {project.liveUrl && (
                  <Button
                    variant="emerald"
                    asChild
                  >
                    <a
                      href={project.liveUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2"
                    >
                      <ExternalLink className="w-4 h-4" />
                      View Live Demo
                    </a>
                  </Button>
                )}
                {project.githubUrl && (
                  <Button
                    variant="outline"
                    asChild
                  >
                    <a
                      href={project.githubUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2"
                    >
                      <Github className="w-4 h-4" />
                      View Source
                    </a>
                  </Button>
                )}
              </div>
            </div>

            {/* Stats */}
            {project.stats && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                {Object.entries(project.stats).map(([key, value]) => (
                  <div key={key} className="glass p-4 rounded-xl text-center">
                    <div className="text-2xl font-bold text-emerald mb-1">
                      {value}
                    </div>
                    <div className="text-sm text-muted-foreground capitalize">
                      {key}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Problem & Solution */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div className="glass p-6 rounded-xl border-l-4 border-amber">
                <h3 className="text-xl font-bold mb-3 text-amber">The Problem</h3>
                <p className="text-muted-foreground leading-relaxed">
                  {project.problem}
                </p>
              </div>
              <div className="glass p-6 rounded-xl border-l-4 border-emerald">
                <h3 className="text-xl font-bold mb-3 text-emerald">The Solution</h3>
                <p className="text-muted-foreground leading-relaxed">
                  {project.solution}
                </p>
              </div>
            </div>

            {/* Tech Stack */}
            <div className="mb-8">
              <h3 className="text-2xl font-bold mb-4">Technology Stack</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {project.techStack.map((tech) => (
                  <motion.div
                    key={tech.name}
                    whileHover={{ scale: 1.05 }}
                    className="glass p-4 rounded-xl text-center border"
                    style={{ borderColor: tech.color }}
                  >
                    <div
                      className="w-12 h-12 mx-auto mb-2 rounded-lg flex items-center justify-center text-2xl font-bold"
                      style={{
                        background: `${tech.color}20`,
                        color: tech.color,
                      }}
                    >
                      {tech.name.charAt(0)}
                    </div>
                    <div className="text-sm font-medium">{tech.name}</div>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Key Features */}
            <div className="mb-8">
              <h3 className="text-2xl font-bold mb-4">Key Features</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {project.features.map((feature, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-start gap-3 glass p-4 rounded-lg"
                  >
                    <CheckCircle className="w-5 h-5 text-emerald flex-shrink-0 mt-0.5" />
                    <span className="text-muted-foreground">{feature}</span>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Screenshots */}
            {project.screenshots && project.screenshots.length > 0 && (
              <div>
                <h3 className="text-2xl font-bold mb-4">Screenshots</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {project.screenshots.map((_screenshot, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, scale: 0.9 }}
                      whileInView={{ opacity: 1, scale: 1 }}
                      viewport={{ once: true }}
                      transition={{ delay: index * 0.1 }}
                      whileHover={{ scale: 1.05 }}
                      className="aspect-video glass rounded-xl overflow-hidden bg-gradient-to-br from-emerald/20 via-amber/20 to-coral/20"
                    >
                      {/* Placeholder for screenshot */}
                      <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                        Screenshot {index + 1}
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
