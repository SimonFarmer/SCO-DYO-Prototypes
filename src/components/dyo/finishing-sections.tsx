import { useState, type ReactNode } from "react"
import { InfoIcon } from "@phosphor-icons/react"
import { CROWNS, CROWN_FROM_PRICE, ENGRAVING } from "@/data/dyo"
import { formatPrice } from "@/lib/format"
import { useRingBuild } from "@/state/ring-build"
import { CrownSheet } from "./crown-sheet"
import { EngravingSheet } from "./engraving-sheet"
import { AddedOptionBlock, OptionBlock } from "./option-block"
import { RingSizeSheet } from "./ring-size-sheet"

/** Section divider used between buy-form sections (Figma "Separator"). */
export function SectionDivider() {
  return (
    <div className="lg:py-3" aria-hidden>
      <div className="h-px bg-muted" />
    </div>
  )
}

/** Eyebrow + H2 + subtitle at the top of a step's buy form. */
export function StepIntro({ eyebrow, title, subtitle }: { eyebrow: string; title: string; subtitle: string }) {
  return (
    <header className="flex flex-col gap-8 max-lg:gap-4">
      <p className="type-label-xs text-muted-foreground">{eyebrow}</p>
      <div className="flex flex-col gap-2">
        <h1 className="type-h2 text-primary max-lg:type-h3">{title}</h1>
        <p className="text-sm leading-5 font-medium text-muted-foreground">{subtitle}</p>
      </div>
    </header>
  )
}

export type FinishingOverlay = "size" | "size-guide" | "engraving" | "crown" | null

/** Owns which finishing-touches overlay is open and renders the sheets. */
// eslint-disable-next-line react-refresh/only-export-components
export function useFinishingOverlays(initial: FinishingOverlay = null) {
  const [overlay, setOverlay] = useState<FinishingOverlay>(initial)
  const close = (open: boolean) => !open && setOverlay(null)
  const sheets: ReactNode = (
    <>
      <RingSizeSheet
        open={overlay === "size" || overlay === "size-guide"}
        initialTab={overlay === "size-guide" ? "guide" : "size"}
        onOpenChange={close}
      />
      <EngravingSheet open={overlay === "engraving"} onOpenChange={close} />
      <CrownSheet open={overlay === "crown"} onOpenChange={close} />
    </>
  )
  return { overlay, open: setOverlay, sheets }
}

export function RingSizeSection({
  onOpen,
  error,
  id,
}: {
  onOpen: (overlay: "size" | "size-guide") => void
  /** Shown when the shopper tries to continue without a size. */
  error?: string
  id?: string
}) {
  const { ringSize } = useRingBuild()
  return (
    <section id={id} className="flex scroll-mt-24 flex-col gap-6" aria-labelledby="ring-size-heading">
      <h2 id="ring-size-heading" className="type-h4 text-primary">Select your Ring Size</h2>
      <div className="flex flex-col gap-2">
        <OptionBlock
          label="Ring Size"
          value={ringSize ?? undefined}
          emphasis={!!ringSize}
          invalid={!!error}
          onClick={() => onOpen("size")}
        />
        {error && <p className="type-caption text-destructive" role="alert">{error}</p>}
      </div>
      <div className="flex flex-col gap-2 bg-bg-input-50 p-3">
        <button
          type="button"
          onClick={() => onOpen("size-guide")}
          className="flex cursor-pointer items-center gap-1 self-start type-label-xs text-primary underline"
        >
          Don’t know your size?
          <InfoIcon className="size-4" />
        </button>
        <p className="type-caption text-primary">Order your best guess. Resizing is free, for life.</p>
      </div>
    </section>
  )
}

const engravingIcon = (
  <span className="text-2xl text-primary" style={{ fontFamily: ENGRAVING.styles[0].fontFamily }}>
    Abc
  </span>
)

export function PersonalizeSection({ onOpen }: { onOpen: (overlay: "engraving" | "crown") => void }) {
  const { engraving, engravingStyle, crown, setEngraving, setCrownId } = useRingBuild()
  return (
    <section className="flex flex-col gap-6" aria-labelledby="personalize-heading">
      <h2 id="personalize-heading" className="type-h4 text-primary">Personalize your Piece</h2>
      <div className="flex flex-col gap-2">
        {engraving ? (
          <AddedOptionBlock
            label="Add Engraving"
            price={ENGRAVING.price}
            media={engravingIcon}
            detail={`“${engraving.text}” · ${engravingStyle?.name} style`}
            onEdit={() => onOpen("engraving")}
            onRemove={() => setEngraving(null)}
          />
        ) : (
          <OptionBlock
            label="Add Engraving"
            media={engravingIcon}
            description={<>Make it uniquely yours · <span className="font-semibold text-primary">from {formatPrice(ENGRAVING.price)}</span></>}
            onClick={() => onOpen("engraving")}
          />
        )}
        {crown ? (
          <AddedOptionBlock
            label="Add a Crown"
            price={crown.price}
            media={<img src={crown.image} alt="" className="size-10 object-contain mix-blend-multiply" />}
            detail={`${crown.name} (${crown.holds})`}
            onEdit={() => onOpen("crown")}
            onRemove={() => setCrownId(null)}
          />
        ) : (
          <OptionBlock
            label="Add a Crown"
            media={<img src="/images/crowns/rosebud-petite.png" alt="" className="size-10 object-contain mix-blend-multiply" />}
            description={<>{CROWNS.length} available options · <span className="font-semibold text-primary">from {formatPrice(CROWN_FROM_PRICE)}</span></>}
            onClick={() => onOpen("crown")}
          />
        )}
      </div>
    </section>
  )
}
