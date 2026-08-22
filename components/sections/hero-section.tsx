import Image from "next/image"
import { ArrowRight } from "lucide-react"

import { siteConfig } from "@/lib/data/portfolio"
import { Container } from "@/components/layout/container"
import { Button } from "@/components/ui/button"

export function HeroSection() {
  return (
    <section id="home" className="relative overflow-hidden bg-background">
      <Container className="grid grid-cols-1 items-center gap-10 py-14 sm:py-16 lg:grid-cols-[38%_62%] lg:gap-6 lg:py-20">
        <div>
          <p className="text-xs font-bold tracking-[0.12em] text-primary sm:text-sm">
            {siteConfig.eyebrow}
          </p>
          <h1 className="mt-4 font-black uppercase leading-[0.98] tracking-tight text-navy text-[48px] sm:text-[58px] lg:text-[76px] xl:text-[86px]">
            Anjana
            <br />
            Rodrigo
          </h1>
          <p className="mt-6 max-w-md text-[17px] leading-relaxed text-navy-muted sm:text-lg">
            {siteConfig.tagline}
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-4">
            <Button asChild size="lg">
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

        <div className="relative mx-auto aspect-[1627/967] w-full max-w-[720px] lg:mx-0 lg:max-w-none">
          {/* Pale blue organic background shape */}
          <div
            className="absolute -right-10 top-0 h-[75%] w-[85%] rounded-[45%] bg-primary-soft/70 blur-2xl"
            style={{ zIndex: 0 }}
            aria-hidden="true"
          />

          {/* Composed hero visual - mine, devices, and avatar */}
          <div className="absolute inset-0" style={{ zIndex: 10 }}>
            <Image
              src="/assets/mining/hero-mining-digitalization-transparent.png"
              alt="Anjana Rodrigo working at his laptop, connected to a digital twin of a mining operation shown across a phone and laptop dashboard"
              fill
              className="object-contain object-bottom"
              priority
              fetchPriority="high"
              sizes="(max-width: 1024px) 90vw, 55vw"
            />
          </div>
        </div>
      </Container>
    </section>
  )
}
