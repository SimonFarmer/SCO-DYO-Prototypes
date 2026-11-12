import { useState } from "react"
import { CROWN_PREVIEW_RING, WEDDING_BANDS } from "@/data/dyo"
import { useRingBuild } from "@/state/ring-build"
import { OptionList, OptionPreview } from "./option-list"
import { OverlaySheet } from "./overlay-sheet"

/**
 * Add a Matching Wedding Band (Figma "Personalization Overlay", 7551:81007). Test 4 · B only.
 * The first band is preselected so the preview shows the set straight away.
 */
export function BandSheet({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  const { bandId, setBandId, ringSize, setting } = useRingBuild()
  const current = bandId ?? WEDDING_BANDS[0].id
  const [pending, setPending] = useState(current)

  const [wasOpen, setWasOpen] = useState(open)
  if (open !== wasOpen) {
    setWasOpen(open)
    if (open) setPending(current)
  }

  const selected = WEDDING_BANDS.find((b) => b.id === pending) ?? WEDDING_BANDS[0]

  return (
    <OverlaySheet
      open={open}
      onOpenChange={onOpenChange}
      fullScreenMobile
      title="Add a Matching Wedding Band"
      description="Add a matching band to complete your ring."
      primaryLabel={bandId === pending ? "Done" : "Add"}
      secondaryLabel="Close"
      onPrimary={() => {
        setBandId(pending)
        onOpenChange(false)
      }}
      subheader={
        <OptionPreview
          images={[
            selected.withRingImage
              ? { src: selected.withRingImage, alt: `${selected.name} stacked with the engagement ring` }
              : { src: CROWN_PREVIEW_RING, alt: "Timeless Solitaire ring, front view" },
            { src: selected.image, alt: selected.name },
          ]}
          caption={`Preview: ${selected.name}`}
          note={
            ringSize
              ? `Size ${ringSize}, ${setting.metal}: matched to your engagement ring’s size and metal.`
              : `${setting.metal}: matched to your engagement ring’s metal. Its size will match your ring size.`
          }
        />
      }
    >
      <OptionList label="Wedding band" value={pending} onChange={setPending} options={WEDDING_BANDS} />
    </OverlaySheet>
  )
}
