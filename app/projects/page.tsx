import { Metadata } from "next"
import { ProjectsSection } from "@/components/sections/projects-section"

export const metadata: Metadata = {
  title: "Projects",
  description: "Explore my portfolio of innovative software projects - from Learning Management Systems to Travel Apps",
}

export default function ProjectsPage() {
  return (
    <div className="min-h-screen pt-8">
      <ProjectsSection />
    </div>
  )
}
