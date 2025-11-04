"use client"

import { motion } from "framer-motion"
import { ExternalLink, Github } from "lucide-react"
import { Project } from "@/components/sections/projects-section"

interface ProjectCardProps {
  project: Project
  index: number
  onClick: () => void
}

export function ProjectCard({ project, index, onClick }: ProjectCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6, delay: index * 0.1 }}
      whileHover={{ y: -10 }}
      className="group cursor-pointer"
      onClick={onClick}
    >
      <div className="glass rounded-2xl overflow-hidden border-2 border-border/50 hover:border-emerald/70 dark:hover:border-emerald transition-all duration-300 h-full flex flex-col shadow-lg hover:shadow-xl hover:shadow-emerald/20">
        {/* Project Image/Preview */}
        <div className="relative h-64 overflow-hidden bg-gradient-to-br from-emerald/30 via-amber/30 to-coral/30 dark:from-emerald/20 dark:via-amber/20 dark:to-coral/20">
          <motion.div
            className="absolute inset-0 bg-gradient-to-br from-emerald via-amber to-coral opacity-50"
            animate={{
              scale: [1, 1.2, 1],
              rotate: [0, 90, 0],
            }}
            transition={{
              duration: 20,
              repeat: Infinity,
              ease: "linear",
            }}
          />

          {/* Overlay on hover */}
          <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-4">
            {project.liveUrl && (
              <motion.a
                href={project.liveUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="p-3 glass rounded-full hover:bg-emerald hover:text-white transition-colors"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={(e) => e.stopPropagation()}
              >
                <ExternalLink className="w-6 h-6" />
              </motion.a>
            )}
            {project.githubUrl && (
              <motion.a
                href={project.githubUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="p-3 glass rounded-full hover:bg-emerald hover:text-white transition-colors"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={(e) => e.stopPropagation()}
              >
                <Github className="w-6 h-6" />
              </motion.a>
            )}
          </div>

          {/* Project Title Overlay */}
          <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/80 to-transparent">
            <h3 className="text-2xl font-bold text-white mb-2">{project.title}</h3>
          </div>
        </div>

        {/* Project Content */}
        <div className="p-6 flex-1 flex flex-col">
          <p className="text-muted-foreground mb-4 line-clamp-2">
            {project.description}
          </p>

          {/* Tags */}
          <div className="flex flex-wrap gap-2 mb-4">
            {project.tags.map((tag) => (
              <span
                key={tag}
                className="px-3 py-1 text-xs font-medium bg-emerald/30 dark:bg-emerald/20 text-emerald-700 dark:text-emerald rounded-full border border-emerald/30"
              >
                {tag}
              </span>
            ))}
          </div>

          {/* Tech Stack */}
          <div className="mt-auto">
            <div className="text-sm font-semibold mb-2 text-foreground">Tech Stack:</div>
            <div className="flex flex-wrap gap-2">
              {project.techStack.slice(0, 4).map((tech) => (
                <div
                  key={tech.name}
                  className="px-3 py-1 text-xs glass rounded-full border-2 font-medium"
                  style={{ borderColor: tech.color, color: tech.color }}
                >
                  {tech.name}
                </div>
              ))}
              {project.techStack.length > 4 && (
                <div className="px-3 py-1 text-xs glass rounded-full border-2 border-muted-foreground text-muted-foreground">
                  +{project.techStack.length - 4} more
                </div>
              )}
            </div>
          </div>

          {/* Click to expand hint */}
          <div className="mt-4 text-sm text-emerald-700 dark:text-emerald font-semibold opacity-0 group-hover:opacity-100 transition-opacity">
            Click to view full case study →
          </div>
        </div>
      </div>
    </motion.div>
  )
}
