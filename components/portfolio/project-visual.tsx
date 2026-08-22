import Image from "next/image"

import type { ProjectVisualKey } from "@/lib/data/portfolio"
import { cn } from "@/lib/utils"

const VISUALS: Record<ProjectVisualKey, string> = {
  minebook: "/assets/projects/minebook-screen.png",
  "fleet-dispatch": "/assets/projects/fleet-dispatch-screen.png",
  "cycle-time": "/assets/projects/cycle-time-screen.png",
  "melbourne-mover": "/assets/projects/melbourne-mover-screen.png",
  "restaurant-optimization": "/assets/projects/restaurant-optimization-screen.png",
}

interface ProjectVisualProps {
  visual: ProjectVisualKey
  className?: string
}

export function ProjectVisual({ visual, className }: ProjectVisualProps) {
  const src = VISUALS[visual]

  return (
    <div
      className={cn(
        "relative aspect-[4/3] w-full overflow-hidden rounded-t-[18px] bg-surface-muted border-b border-border",
        className
      )}
    >
      <Image
        src={src}
        alt=""
        fill
        className="object-cover object-top transition-transform duration-500 group-hover:scale-[1.03]"
        loading="lazy"
        sizes="(max-width: 768px) 90vw, 400px"
      />
    </div>
  )
}

