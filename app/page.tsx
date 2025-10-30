import { HeroSection } from "@/components/sections/hero-section"
import { AboutSection } from "@/components/sections/about-section"
import { ProjectsSection } from "@/components/sections/projects-section"
import { ContactSection } from "@/components/sections/contact-section"

export default function HomePage() {
  return (
    <div className="relative min-h-screen">
      <HeroSection />
      <AboutSection />
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
