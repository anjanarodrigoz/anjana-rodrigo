"use client"

import { projects } from "@/lib/data/portfolio"
import { Container } from "@/components/layout/container"
import { SectionHeading } from "@/components/layout/section-heading"
import { ProjectCard } from "@/components/portfolio/project-card"
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel"

export function ProjectsSection() {
  return (
    <section id="work" className="py-[72px] md:py-[104px]">
      <Container>
        <SectionHeading title="Selected Work" />

        <div className="mt-10">
          <Carousel opts={{ align: "start" }} className="group">
            <CarouselContent>
              {projects.map((project) => (
                <CarouselItem
                  key={project.slug}
                  className="basis-[88%] sm:basis-1/2 lg:basis-1/4"
                >
                  <ProjectCard project={project} />
                </CarouselItem>
              ))}
            </CarouselContent>
            <div className="mt-6 flex items-center justify-end gap-2">
              <CarouselPrevious className="static translate-y-0" />
              <CarouselNext className="static translate-y-0" />
            </div>
          </Carousel>
        </div>
      </Container>
    </section>
  )
}
