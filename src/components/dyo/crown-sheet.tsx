import { useState } from "react"
import { CLASSIC_CROWN, CROWN_OPTIONS, CROWN_PREVIEW_RING } from "@/data/dyo"
import { useRingBuild } from "@/state/ring-build"
import { OptionList, OptionPreview } from "./option-list"
import { OverlaySheet } from "./overlay-sheet"

/**
 * Upgrade Your Crown (Figma "change crown overlay", 7552:44596).
 * The setting's Classic 4-Prong Crown is preselected at no cost; choosing it removes any upgrade.
 */
export function CrownSheet({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  const { crownId, setCrownId } = useRingBuild()
  const current = crownId ?? CLASSIC_CROWN.id
  const [pending, setPending] = useState(current)

  const [wasOpen, setWasOpen] = useState(open)
  if (open !== wasOpen) {
    setWasOpen(open)
    if (open) setPending(current)
  }

  const selected = CROWN_OPTIONS.find((c) => c.id === pending) ?? CLASSIC_CROWN

  return (
    <OverlaySheet
      open={open}
      onOpenChange={onOpenChange}
      fullScreenMobile
      title="Upgrade Your Crown"
      description="Upgrade your crown to customise your ring’s look and styling."
      primaryLabel="Add"
      secondaryLabel="Close"
      onPrimary={() => {
        setCrownId(pending === CLASSIC_CROWN.id ? null : pending)
        onOpenChange(false)
      }}
      subheader={
        <OptionPreview
          images={[
            { src: CROWN_PREVIEW_RING, alt: "Timeless Solitaire ring, front view" },
            { src: selected.image, alt: selected.name },
          ]}
          caption={`Preview: ${selected.name}`}
        />
      }
    >
      <OptionList
        label="Crown"
        value={pending}
        onChange={setPending}
        options={CROWN_OPTIONS.map((c) => ({
          id: c.id,
          name: c.price ? `${c.name} (${c.holds})` : c.name,
          price: c.price,
          image: c.image,
        }))}
      />
    </OverlaySheet>
  )
}
