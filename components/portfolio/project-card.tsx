"use client"

import { useState } from "react"
import { ArrowRight, CheckCircle2 } from "lucide-react"
import Image from "next/image"

import type { Project } from "@/lib/data/portfolio"
import { Badge } from "@/components/ui/badge"
import { ProjectVisual } from "@/components/portfolio/project-visual"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog"

export function ProjectCard({ project }: { project: Project }) {
  const [isOpen, setIsOpen] = useState(false)

  const imageSrc = {
    minebook: "/assets/projects/minebook-screen.png",
    "fleet-dispatch": "/assets/projects/fleet-dispatch-screen.png",
    "cycle-time": "/assets/projects/cycle-time-screen.png",
    "melbourne-mover": "/assets/projects/melbourne-mover-screen.png",
    "restaurant-optimization": "/assets/projects/restaurant-optimization-screen.png",
  }[project.visual]

  return (
    <>
      <div
        onClick={() => setIsOpen(true)}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault()
            setIsOpen(true)
          }
        }}
        role="button"
        tabIndex={0}
        className="flex h-full flex-col overflow-hidden rounded-[18px] border border-border bg-card shadow-md hover:shadow-lg hover:-translate-y-1 transition-all duration-300 group cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
      >
        <ProjectVisual visual={project.visual} />
        <div className="flex flex-1 flex-col p-5">
          <Badge variant="secondary" className="w-fit uppercase tracking-wide">
            {project.category}
          </Badge>
          <h3 className="mt-3 text-[18px] font-bold text-navy group-hover:text-primary transition-colors">
            {project.title}
          </h3>
          <p className="mt-2 text-sm leading-relaxed text-navy-muted flex-1">
            {project.description}
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            {project.technologies.slice(0, 3).map((tech) => (
              <Badge key={tech} variant="outline">
                {tech}
              </Badge>
            ))}
            {project.technologies.length > 3 && (
              <Badge variant="outline" className="text-navy-muted">
                +{project.technologies.length - 3} more
              </Badge>
            )}
          </div>
          <div className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-primary group-hover:text-primary-hover transition-colors">
            View Project Details
            <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" aria-hidden="true" />
          </div>
        </div>
      </div>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-md sm:max-w-2xl lg:max-w-4xl p-0 overflow-hidden bg-white border border-border rounded-xl shadow-2xl max-h-[90vh] flex flex-col">
          <div className="overflow-y-auto flex-1 p-6 md:p-8">
            <div className="flex flex-col gap-6">
              {/* Header */}
              <div>
                <Badge variant="secondary" className="w-fit uppercase tracking-wide mb-2 text-primary bg-primary-soft hover:bg-primary-soft">
                  {project.category}
                </Badge>
                <DialogTitle className="text-2xl md:text-3xl font-black text-navy leading-tight">
                  {project.title}
                </DialogTitle>
                <DialogDescription className="mt-2 text-base text-navy-muted leading-relaxed">
                  {project.description}
                </DialogDescription>
              </div>

              {/* Large Image Showcase */}
              <div className="relative aspect-[16/10] w-full overflow-hidden rounded-xl border border-border bg-surface-muted shadow-inner">
                {imageSrc && (
                  <Image
                    src={imageSrc}
                    alt={`${project.title} Interface Screen`}
                    fill
                    className="object-cover object-top"
                    sizes="(max-width: 1024px) 100vw, 900px"
                  />
                )}
              </div>

              {/* Content Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 md:gap-8">
                {/* Description Column */}
                <div className="lg:col-span-3 space-y-4">
                  <h4 className="text-lg font-bold text-navy border-b border-border pb-2">
                    About Project
                  </h4>
                  <p className="text-sm md:text-base leading-relaxed text-navy-muted whitespace-pre-line">
                    {project.longDescription}
                  </p>
                </div>

                {/* Info Column (Features & Tech Stack) */}
                <div className="lg:col-span-2 space-y-6">
                  {/* Key Features */}
                  <div className="space-y-3">
                    <h4 className="text-lg font-bold text-navy border-b border-border pb-2">
                      Key Features
                    </h4>
                    <ul className="space-y-2">
                      {project.features.map((feature, idx) => (
                        <li key={idx} className="flex items-start gap-2 text-sm text-navy-muted">
                          <CheckCircle2 className="h-4 w-4 text-success mt-0.5 shrink-0" aria-hidden="true" />
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Technologies */}
                  <div className="space-y-3">
                    <h4 className="text-lg font-bold text-navy border-b border-border pb-2">
                      Technologies Used
                    </h4>
                    <div className="flex flex-wrap gap-2 pt-1">
                      {project.technologies.map((tech) => (
                        <Badge key={tech} variant="outline" className="text-navy border-navy/20 bg-surface-muted py-1 px-2.5 text-xs font-medium">
                          {tech}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}

