import { useEffect, useRef, type ComponentType } from "react"
import { X } from "lucide-react"

import { useBodyLock } from "@/hooks"

import { BlastPatternDemo } from "./BlastPatternDemo"
import { CrackSurveyDemo } from "./CrackSurveyDemo"
import { CycleTimeDemo } from "./CycleTimeDemo"
import { FleetDispatchDemo } from "./FleetDispatchDemo"
import { MineBookDemo } from "./MineBookDemo"

export const prototypes: Record<string, ComponentType> = {
  minebook: MineBookDemo,
  "fleet-dispatch": FleetDispatchDemo,
  "cycle-time": CycleTimeDemo,
  "crack-survey": CrackSurveyDemo,
  "blast-pattern": BlastPatternDemo,
}

/** Native modal <dialog>: the browser handles focus trapping and Escape. */
export function PrototypeDialog({
  id,
  title,
  onClose,
}: {
  id: string | null
  title: string
  onClose: () => void
}) {
  const ref = useRef<HTMLDialogElement>(null)
  const Demo = id ? prototypes[id] : null

  useBodyLock(Boolean(Demo))

  useEffect(() => {
    const dialog = ref.current
    if (!dialog) return
    if (Demo && !dialog.open) dialog.showModal()
    if (!Demo && dialog.open) dialog.close()
  }, [Demo])

  return (
    <dialog
      ref={ref}
      className="proto-dialog"
      aria-labelledby="proto-dialog-title"
      onClose={onClose}
      onClick={(event) => {
        // Clicking the backdrop (the dialog element itself) closes it.
        if (event.target === event.currentTarget) onClose()
      }}
    >
      {Demo ? (
        <>
          <div className="proto-dialog-head">
            <div>
              <p className="eyebrow" style={{ marginBottom: 4 }}>
                <i aria-hidden="true" />
                Working prototype
              </p>
              <h2 id="proto-dialog-title">{title}</h2>
            </div>
            <button type="button" onClick={onClose} aria-label="Close prototype">
              <X aria-hidden="true" />
            </button>
          </div>
          <div className="proto-dialog-body">
            <Demo />
          </div>
        </>
      ) : null}
    </dialog>
  )
}
