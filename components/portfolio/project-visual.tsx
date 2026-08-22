import Image from "next/image"

import type { ProjectVisualKey } from "@/lib/data/portfolio"
import { cn } from "@/lib/utils"

type Layer = {
  src: string
  className: string
  opacity?: string
}

const VISUALS: Record<ProjectVisualKey, { background: string; layers: Layer[] }> = {
  minebook: {
    background: "bg-surface-muted",
    layers: [
      {
        src: "/assets/mining/open-pit-mine-diorama.png",
        className: "inset-0",
        opacity: "opacity-60",
      },
      {
        src: "/assets/mining/haul-truck.png",
        className: "bottom-1 right-1 h-[26%] w-[30%]",
      },
      {
        src: "/assets/ui/rugged-field-tablet.png",
        className: "inset-2",
      },
    ],
  },
  "fleet-dispatch": {
    background: "bg-surface-muted",
    layers: [
      {
        src: "/assets/mining/open-pit-mine-diorama.png",
        className: "inset-0",
        opacity: "opacity-60",
      },
      {
        src: "/assets/ui/electric-blue-data-network.png",
        className: "inset-2",
        opacity: "opacity-40",
      },
      {
        src: "/assets/ui/fleet-dispatch-laptop.png",
        className: "inset-2",
      },
    ],
  },
  "cycle-time": {
    background: "bg-surface-muted",
    layers: [
      {
        src: "/assets/mining/open-pit-mine-diorama.png",
        className: "inset-0",
        opacity: "opacity-60",
      },
      {
        src: "/assets/mining/hydraulic-excavator.png",
        className: "bottom-1 left-1 h-[24%] w-[26%]",
      },
      {
        src: "/assets/ui/mining-cycle-time-phone.png",
        className: "inset-4",
      },
    ],
  },
  "melbourne-mover": {
    background: "bg-primary-soft",
    layers: [
      {
        src: "/assets/ui/electric-blue-data-network.png",
        className: "inset-2",
        opacity: "opacity-40",
      },
      {
        src: "/assets/avatar/anjana-portrait.png",
        className: "inset-2",
      },
    ],
  },
  "restaurant-optimization": {
    background: "bg-surface-muted",
    layers: [
      {
        src: "/assets/avatar/anjana-portrait.png",
        className: "inset-2",
      },
    ],
  },
}

export function ProjectVisual({ visual }: { visual: ProjectVisualKey }) {
  const config = VISUALS[visual]

  return (
    <div
      className={cn(
        "relative aspect-[4/3] w-full overflow-hidden rounded-t-[18px]",
        config.background
      )}
    >
      {config.layers.map((layer) => (
        <div key={layer.src} className={cn("absolute", layer.className, layer.opacity)}>
          <Image
            src={layer.src}
            alt=""
            fill
            className="object-contain"
            loading="lazy"
            sizes="(max-width: 768px) 90vw, 320px"
          />
        </div>
      ))}
    </div>
  )
}
