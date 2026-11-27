import { useState } from "react"
import { CLASSIC_CROWN, CROWN_OPTIONS, CROWN_PREVIEW_RING, FLOW_CLASSIC_CROWN, FLOW_CROWNS, crownHolds } from "@/data/dyo"
import { useFlow } from "@/flow/flow-context"
import { ellaPreview } from "@/flow/ring-images"
import { useRingBuild } from "@/state/ring-build"
import { OptionList, OptionPreview } from "./option-list"
import { OverlaySheet } from "./overlay-sheet"

/**
 * Upgrade Your Crown (Figma "change crown overlay", 7552:44596).
 * The setting's Classic 4-Prong Crown is preselected at no cost; choosing it removes any upgrade.
 * Full flows: four upgrades, sized to the chosen stone, previewed beside the shopper's own ring (setting,
 * metal and chosen diamond) instead of Test 4's Timeless Solitaire.
 */
export function CrownSheet({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  const { crownId, setCrownId, setting, stone } = useRingBuild()
  const flow = useFlow()
  const options = flow ? [FLOW_CLASSIC_CROWN, ...FLOW_CROWNS].map((c) => ({ ...c, holds: crownHolds(stone) })) : CROWN_OPTIONS
  const ring = flow
    ? { src: ellaPreview(setting.article, stone.shape, stone.carat), alt: `${setting.name} with a ${stone.title.toLowerCase()}, front view` }
    : { src: CROWN_PREVIEW_RING, alt: "Timeless Solitaire ring, front view" }
  const current = crownId ?? CLASSIC_CROWN.id
  const [pending, setPending] = useState(current)

  const [wasOpen, setWasOpen] = useState(open)
  if (open !== wasOpen) {
    setWasOpen(open)
    if (open) setPending(current)
  }

  const selected = options.find((c) => c.id === pending) ?? options[0]
  // Full flows: the classic crown is already on the ring, so there is nothing to add.
  const alreadyOn = !!flow && pending === CLASSIC_CROWN.id && current === CLASSIC_CROWN.id

  return (
    <OverlaySheet
      open={open}
      onOpenChange={onOpenChange}
      fullScreenMobile
      title="Upgrade Your Crown"
      description="Upgrade your crown to customise your ring’s look and styling."
      primaryLabel="Add"
      secondaryLabel="Close"
      primaryDisabled={alreadyOn}
      onPrimary={() => {
        setCrownId(pending === CLASSIC_CROWN.id ? null : pending)
        onOpenChange(false)
      }}
      subheader={
        <OptionPreview
          images={[
            ring,
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
        options={options.map((c) => ({
          id: c.id,
          name: c.price ? `${c.name} (${c.holds})` : c.name,
          price: c.price,
          image: c.image,
        }))}
      />
    </OverlaySheet>
  )
}
