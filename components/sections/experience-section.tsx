import { experience } from "@/lib/data/portfolio"
import { Container } from "@/components/layout/container"
import { SectionHeading } from "@/components/layout/section-heading"
import { ExperienceRow } from "@/components/portfolio/experience-row"

export function ExperienceSection() {
  return (
    <section id="experience" className="py-[72px] md:py-[104px]">
      <Container>
        <SectionHeading title="Experience" />

        <div className="mt-10 max-w-3xl">
          {experience.map((item, index) => (
            <ExperienceRow
              key={`${item.organization}-${item.role}`}
              item={item}
              isLast={index === experience.length - 1}
            />
          ))}
        </div>
      </Container>
    </section>
  )
}
