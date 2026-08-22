import Image from "next/image"

import { aboutPillars } from "@/lib/data/portfolio"
import { Container } from "@/components/layout/container"
import { SectionHeading } from "@/components/layout/section-heading"

export function AboutSection() {
  return (
    <section id="about" className="bg-surface-muted py-[72px] md:py-[104px]">
      <Container>
        <SectionHeading title="About" />

        <div className="mt-10 grid grid-cols-1 gap-10 lg:grid-cols-[34%_66%] lg:items-center lg:gap-14">
          <div className="relative mx-auto aspect-[4/5] w-full max-w-sm overflow-visible rounded-[18px] border border-border bg-surface p-3 shadow-[0_12px_35px_rgba(7,27,70,0.07)] lg:mx-0">
            <div className="relative h-full w-full overflow-hidden rounded-[14px] bg-primary-soft">
              <Image
                src="/profile_nobg.png"
                alt="Portrait of Anjana Rodrigo"
                fill
                className="object-contain object-bottom"
                loading="lazy"
                sizes="(max-width: 1024px) 60vw, 320px"
              />
            </div>
          </div>

          <div>
            <p className="text-[15px] leading-relaxed text-navy-muted sm:text-base">
              I&apos;m a mining engineer who applies software engineering skills to the mining
              field, giving digitalized and process-optimized solutions to real-world operations.
            </p>
            <p className="mt-4 text-[15px] leading-relaxed text-navy-muted sm:text-base">
              I enjoy solving practical problems, building reliable systems and turning complex
              data into actionable insights.
            </p>

            <div className="relative mt-10 flex flex-col gap-8 sm:flex-row sm:items-start sm:justify-between">
              <div
                className="absolute left-0 right-0 top-6 hidden border-t border-dashed border-primary/40 sm:block"
                aria-hidden="true"
              />
              {aboutPillars.map((pillar) => (
                <div
                  key={pillar.title}
                  className="relative z-10 flex flex-col items-center text-center sm:w-1/3"
                >
                  <div className="rounded-full ring-4 ring-surface-muted">
                    <Image src={pillar.icon} alt="" width={48} height={48} className="h-12 w-12" />
                  </div>
                  <h3 className="mt-3 text-[15px] font-bold text-navy">{pillar.title}</h3>
                  <p className="mt-1 text-sm text-navy-muted">{pillar.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Container>
    </section>
  )
}
