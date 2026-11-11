import { useState } from "react"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { CROWNS, REVIEW_GALLERY } from "@/data/dyo"
import { formatPrice } from "@/lib/format"
import { cn } from "@/lib/utils"
import { useRingBuild } from "@/state/ring-build"
import { OverlaySheet } from "./overlay-sheet"

export function CrownSheet({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  const { crownId, setCrownId } = useRingBuild()
  const [pending, setPending] = useState<string | null>(crownId)

  const [wasOpen, setWasOpen] = useState(open)
  if (open !== wasOpen) {
    setWasOpen(open)
    if (open) setPending(crownId)
  }

  const selected = CROWNS.find((c) => c.id === pending)
  const ringImage = REVIEW_GALLERY[6]

  return (
    <OverlaySheet
      open={open}
      onOpenChange={onOpenChange}
      fullScreenMobile
      title="Add a Crown"
      description="Add an optional crown to customise your ring’s look and styling."
      primaryLabel={crownId && pending === crownId ? "Done" : "Add"}
      primaryDisabled={!pending}
      secondaryLabel="Close"
      onPrimary={() => {
        setCrownId(pending)
        onOpenChange(false)
      }}
      subheader={
        selected && (
          <div className="flex flex-col gap-3 border-b border-muted px-10 py-6 max-lg:px-margin">
            <div className="grid grid-cols-2 gap-2">
              <img src={ringImage.src} alt={ringImage.alt} className="aspect-square w-full bg-secondary object-cover" />
              <img src={selected.image} alt={selected.name} className="aspect-square w-full bg-secondary object-contain mix-blend-multiply" />
            </div>
            <p className="type-label-xs text-primary">Preview: {selected.name}</p>
          </div>
        )
      }
    >
      <RadioGroup value={pending} onValueChange={(v) => setPending(v as string)} className="gap-0" aria-label="Crown">
        {CROWNS.map((c) => (
          <label
            key={c.id}
            className={cn(
              "flex cursor-pointer items-center gap-4 border-b border-muted py-3 hover:bg-bg-input-50",
              pending === c.id && "bg-bg-input-50"
            )}
          >
            <span className="flex size-16 shrink-0 items-center justify-center bg-secondary">
              <img src={c.image} alt="" className="size-14 object-contain mix-blend-multiply" />
            </span>
            <span className="flex-1 text-xs-2 leading-4 font-semibold text-primary">
              {c.name} ({c.holds})
            </span>
            <span className="text-xs-2 leading-4 font-medium text-primary">{formatPrice(c.price)}</span>
            <RadioGroupItem value={c.id} />
          </label>
        ))}
      </RadioGroup>
      {crownId && (
        <button
          type="button"
          onClick={() => {
            setCrownId(null)
            onOpenChange(false)
          }}
          className="mt-6 cursor-pointer type-label-xs text-primary underline"
        >
          Remove crown
        </button>
      )}
    </OverlaySheet>
  )
}
