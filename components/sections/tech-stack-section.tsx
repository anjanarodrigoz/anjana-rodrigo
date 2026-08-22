import { toolkit } from "@/lib/data/portfolio"
import { Container } from "@/components/layout/container"
import { SectionHeading } from "@/components/layout/section-heading"
import { ToolkitBadge } from "@/components/portfolio/toolkit-badge"

export function ToolkitSection() {
  return (
    <section aria-label="Digital mining toolkit" className="py-[72px] md:py-[104px]">
      <Container>
        <SectionHeading title="Digital Mining Toolkit" />

        <ul className="mt-8 flex flex-wrap gap-3">
          {toolkit.map((item) => (
            <li key={item.name}>
              <ToolkitBadge item={item} />
            </li>
          ))}
        </ul>
      </Container>
    </section>
  )
}
