import { services } from "@/lib/data/portfolio"
import { Container } from "@/components/layout/container"
import { ServiceCard } from "@/components/portfolio/service-card"

export function ServicesSection() {
  return (
    <section aria-label="Service pillars" className="relative -mt-4 pb-4 sm:-mt-8">
      <Container>
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
          {services.map((service) => (
            <ServiceCard key={service.title} service={service} />
          ))}
        </div>
      </Container>
    </section>
  )
}
