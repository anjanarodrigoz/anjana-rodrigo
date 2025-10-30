import { HeroSection } from "@/components/sections/hero-section"

export default function HomePage() {
  return (
    <div className="relative min-h-screen">
      <HeroSection />

      {/* Sections will be added here */}
      <section id="about" className="min-h-screen flex items-center justify-center">
        <div className="container">
          <h2 className="text-4xl font-bold">About Me Section</h2>
          <p className="text-muted-foreground">Coming soon...</p>
        </div>
      </section>

      <section id="projects" className="min-h-screen flex items-center justify-center">
        <div className="container">
          <h2 className="text-4xl font-bold">Projects Section</h2>
          <p className="text-muted-foreground">Coming soon...</p>
        </div>
      </section>

      <section id="blog" className="min-h-screen flex items-center justify-center">
        <div className="container">
          <h2 className="text-4xl font-bold">Blog Section</h2>
          <p className="text-muted-foreground">Coming soon...</p>
        </div>
      </section>

      <section id="youtube" className="min-h-screen flex items-center justify-center">
        <div className="container">
          <h2 className="text-4xl font-bold">YouTube Section</h2>
          <p className="text-muted-foreground">Coming soon...</p>
        </div>
      </section>

      <section id="contact" className="min-h-screen flex items-center justify-center">
        <div className="container">
          <h2 className="text-4xl font-bold">Contact Section</h2>
          <p className="text-muted-foreground">Coming soon...</p>
        </div>
      </section>
    </div>
  )
}
