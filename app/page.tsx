"use client"

import dynamic from "next/dynamic"
import { HeroSection } from "@/components/sections/hero-section"
import { ProjectsSection } from "@/components/sections/projects-section"
import { TechStackSection } from "@/components/sections/tech-stack-section"
import { YouTubeSection } from "@/components/sections/youtube-section"
import { ContactSection } from "@/components/sections/contact-section"

// Dynamically import JourneySection to avoid SSR issues
const JourneySection = dynamic(
  () => import("@/components/sections/journey-section").then((mod) => mod.JourneySection),
  { ssr: false }
)

export default function HomePage() {
  return (
    <div className="relative min-h-screen">
      <HeroSection />
      <JourneySection />
      <TechStackSection />
      <ProjectsSection />
      <YouTubeSection />
      <ContactSection />
    </div>
  )
}
