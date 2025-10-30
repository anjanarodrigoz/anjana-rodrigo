"use client"

import dynamic from "next/dynamic"
import { HeroSection } from "@/components/sections/hero-section"
import { ProjectsSection } from "@/components/sections/projects-section"
import { ContactSection } from "@/components/sections/contact-section"

// Dynamically import JourneySection to avoid SSR issues with React Three Fiber
const JourneySection = dynamic(
  () => import("@/components/sections/journey-section").then((mod) => mod.JourneySection),
  { ssr: false }
)

export default function HomePage() {
  return (
    <div className="relative min-h-screen">
      <HeroSection />
      <JourneySection />
      <ProjectsSection />

      {/* Blog and YouTube sections - Coming soon */}
      <section id="blog" className="min-h-screen flex items-center justify-center">
        <div className="container text-center">
          <h2 className="text-4xl font-bold mb-4">
            <span className="gradient-text">Blog</span>
          </h2>
          <p className="text-xl text-muted-foreground">Coming soon...</p>
        </div>
      </section>

      <section id="youtube" className="min-h-screen flex items-center justify-center">
        <div className="container text-center">
          <h2 className="text-4xl font-bold mb-4">
            <span className="gradient-text">YouTube</span>
          </h2>
          <p className="text-xl text-muted-foreground">Coming soon...</p>
        </div>
      </section>

      <ContactSection />
    </div>
  )
}
