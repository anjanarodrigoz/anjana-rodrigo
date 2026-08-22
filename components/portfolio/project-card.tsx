import { ArrowRight } from "lucide-react"

import type { Project } from "@/lib/data/portfolio"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ProjectVisual } from "@/components/portfolio/project-visual"

export function ProjectCard({ project }: { project: Project }) {
  return (
    <Card className="flex h-full flex-col overflow-hidden p-0">
      <ProjectVisual visual={project.visual} />
      <CardContent className="flex flex-1 flex-col p-5">
        <Badge variant="secondary" className="w-fit uppercase tracking-wide">
          {project.category}
        </Badge>
        <h3 className="mt-3 text-[18px] font-bold text-navy">{project.title}</h3>
        <p className="mt-2 text-sm leading-relaxed text-navy-muted">{project.description}</p>
        <div className="mt-4 flex flex-wrap gap-2">
          {project.technologies.map((tech) => (
            <Badge key={tech} variant="outline">
              {tech}
            </Badge>
          ))}
        </div>
        <a
          href={`/projects/${project.slug}`}
          className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:text-primary-hover"
        >
          View Case Study
          <ArrowRight className="h-4 w-4" aria-hidden="true" />
        </a>
      </CardContent>
    </Card>
  )
}
