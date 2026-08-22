import { credentials } from "@/lib/data/portfolio"
import { Container } from "@/components/layout/container"
import { SectionHeading } from "@/components/layout/section-heading"
import { CredentialCard } from "@/components/portfolio/credential-card"

export function EducationSection() {
  return (
    <section aria-label="Education and credentials" className="bg-surface-muted py-[72px] md:py-[104px]">
      <Container>
        <SectionHeading title="Education & Credentials" />

        <div className="mt-10 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {credentials.map((credential) => (
            <CredentialCard key={credential.title} credential={credential} />
          ))}
        </div>
      </Container>
    </section>
  )
}
