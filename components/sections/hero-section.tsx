import Image from "next/image"
import { ArrowRight } from "lucide-react"

import { siteConfig } from "@/lib/data/portfolio"
import { Container } from "@/components/layout/container"
import { Button } from "@/components/ui/button"

export function HeroSection() {
  return (
    <section
      id="home"
      className="relative isolate overflow-hidden border-b border-border/60 bg-background"
    >
      <div
        className="pointer-events-none absolute inset-x-0 top-0 -z-20 h-[72%] bg-[radial-gradient(circle_at_72%_34%,hsl(var(--primary)/0.13),transparent_42%)]"
        aria-hidden="true"
      />
      <div
        className="hero-grid-pattern pointer-events-none absolute inset-0 -z-10 opacity-45"
        aria-hidden="true"
      />

      <Container className="grid grid-cols-1 items-center gap-8 py-12 sm:gap-10 sm:py-16 lg:min-h-[calc(100svh-5rem)] lg:grid-cols-[41%_59%] lg:gap-2 lg:py-16 xl:grid-cols-[38%_62%]">
        <div className="relative z-30 max-w-xl">
          <div className="inline-flex items-center gap-2.5 rounded-full border border-primary/20 bg-primary-soft/80 px-3.5 py-2 text-[11px] font-bold tracking-[0.12em] text-primary shadow-sm backdrop-blur-sm sm:text-xs">
            <span className="relative flex h-2 w-2" aria-hidden="true">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-cyan opacity-60" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-primary" />
            </span>
            {siteConfig.eyebrow}
          </div>

          <h1 className="mt-5 text-[48px] font-black uppercase leading-[0.92] tracking-[-0.045em] text-navy sm:text-[64px] lg:text-[72px] xl:text-[86px]">
            Anjana
            <br />
            Rodrigo
          </h1>

          <p className="mt-6 max-w-lg text-[17px] leading-relaxed text-navy-muted sm:text-lg">
            {siteConfig.tagline}
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-4">
            <Button asChild size="lg" className="shadow-lg shadow-primary/20">
              <a href="#work">
                View My Work
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </a>
            </Button>
            <Button asChild variant="link" size="lg" className="px-0">
              <a href="#about">About Me</a>
            </Button>
          </div>
        </div>

        <div className="relative mx-auto aspect-[1627/967] w-full max-w-[820px] select-none lg:-mr-10 lg:max-w-none xl:-mr-16">
          <div
            className="hero-visual-glow absolute inset-x-[9%] bottom-[7%] top-[12%] z-0 rounded-[48%] bg-primary-soft/80 blur-3xl"
            aria-hidden="true"
          />
          <div
            className="hero-mine-shadow absolute bottom-[3.5%] left-[11%] z-[1] h-[8%] w-[58%] rounded-full bg-navy/15 blur-2xl"
            aria-hidden="true"
          />

          <div className="hero-mine-float absolute inset-0 z-10">
            <Image
              src="/assets/mining/hero-mining-background-transparent.png"
              alt="Open-pit mine digital twin connected to mobile and laptop operations dashboards"
              fill
              className="object-contain object-center"
              priority
              fetchPriority="high"
              sizes="(max-width: 1024px) 90vw, 55vw"
              draggable={false}
            />
          </div>

          <div className="absolute inset-0 z-20">
            <Image
              src="/assets/mining/hero-mining-avatar-transparent.png"
              alt="Anjana Rodrigo working on a laptop"
              fill
              className="object-contain object-center"
              priority
              sizes="(max-width: 1024px) 90vw, 55vw"
              draggable={false}
            />
          </div>
        </div>
      </Container>
    </section>
  )
}
