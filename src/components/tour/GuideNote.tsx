import { stages, type StageId } from "@/journey"

/** Speech bubble from Anjana for one tour stop; the arrow overlay points it at the 3D guide. */
export function GuideNote({ stage }: { stage: StageId }) {
  const info = stages.find((s) => s.id === stage)!
  return (
    <figure className="guide-note" data-guide-note={stage}>
      <img src="/assets/about/anjana-professional.png" alt="" width="56" height="56" />
      <figcaption>
        <span>
          Anjana · {info.place}
        </span>
        {info.guide}
      </figcaption>
    </figure>
  )
}
