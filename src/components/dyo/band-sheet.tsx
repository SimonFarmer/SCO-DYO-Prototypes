import { useState } from "react"
import { CircleDashedIcon, ProhibitIcon } from "@phosphor-icons/react"
import { CROWN_PREVIEW_RING, WEDDING_BANDS } from "@/data/dyo"
import { useFlow } from "@/flow/flow-context"
import { ellaPreview } from "@/flow/ring-images"
import { useRingBuild } from "@/state/ring-build"
import { OptionList, OptionPreview } from "./option-list"
import { OverlaySheet } from "./overlay-sheet"

/**
 * Add a Matching Wedding Band (Figma "Personalization Overlay", 7551:81007). Test 4 · B only.
 * In the tests the first band is preselected so the preview shows the set straight away. In the full flows
 * the list starts with "None" (chosen while there is no band, and how to take one off), and the preview
 * shows the shopper's own ring.
 */
const NONE = "none"

export function BandSheet({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  const { bandId, setBandId, ringSize, setting, stone } = useRingBuild()
  const flow = useFlow()
  const current = bandId ?? (flow ? NONE : WEDDING_BANDS[0].id)
  const [pending, setPending] = useState<string>(current)
  const ring = flow
    ? { src: ellaPreview(setting.article, stone.shape, stone.carat), alt: `${setting.name} with a ${stone.title.toLowerCase()}, front view` }
    : { src: CROWN_PREVIEW_RING, alt: "Timeless Solitaire ring, front view" }

  const [wasOpen, setWasOpen] = useState(open)
  if (open !== wasOpen) {
    setWasOpen(open)
    if (open) setPending(current)
  }

  const selected = WEDDING_BANDS.find((b) => b.id === pending) ?? null

  return (
    <OverlaySheet
      open={open}
      onOpenChange={onOpenChange}
      fullScreenMobile
      title="Add a Matching Wedding Band"
      description="Add a matching band to complete your ring."
      primaryLabel={current === pending ? "Done" : pending === NONE ? "Remove Band" : "Add"}
      secondaryLabel="Close"
      onPrimary={() => {
        setBandId(pending === NONE ? null : pending)
        onOpenChange(false)
      }}
      subheader={
        <OptionPreview
          images={
            selected
              ? [
                  selected.withRingImage
                    ? { src: selected.withRingImage, alt: `${selected.name} stacked with the engagement ring` }
                    : ring,
                  { src: selected.image, alt: selected.name },
                ]
              : [ring]
          }
          caption={selected ? `Preview: ${selected.name}` : "Choose a band to preview it with your ring"}
          empty={
            <>
              <CircleDashedIcon className="size-8 text-muted-foreground" aria-hidden />
              <p className="type-caption text-muted-foreground">Your band will appear here</p>
            </>
          }
          note={
            ringSize
              ? `Size ${ringSize}, ${setting.metal}: matched to your engagement ring’s size and metal.`
              : `${setting.metal}: matched to your engagement ring’s metal. Its size will match your ring size.`
          }
        />
      }
    >
      <OptionList
        label="Wedding band"
        value={pending}
        onChange={setPending}
        options={flow ? [{ id: NONE, name: "None", price: null, icon: <ProhibitIcon className="size-6 text-muted-foreground" /> }, ...WEDDING_BANDS] : WEDDING_BANDS}
      />
    </OverlaySheet>
  )
}
