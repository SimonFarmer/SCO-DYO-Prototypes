import { useState, type ReactNode } from "react"
import { ArrowLeftIcon, InfoIcon } from "@phosphor-icons/react"
import {
  BAND_FROM_PRICE,
  CLASSIC_CROWN,
  CROWNS,
  CROWN_FROM_PRICE,
  ENGRAVING,
  WEDDING_BANDS,
  type EngravingStyle,
} from "@/data/dyo"
import { formatPrice } from "@/lib/format"
import { useRingBuild, type Engraving } from "@/state/ring-build"
import { BandSheet } from "./band-sheet"
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

/** Eyebrow + H2 + subtitle (or a Back link) at the top of a step's buy form. */
export function StepIntro({
  eyebrow,
  title,
  subtitle,
  onBack,
}: {
  eyebrow: string
  title: string
  subtitle?: string
  /** Shows "Back" under the title instead of a subtitle (Figma Order Review). */
  onBack?: () => void
}) {
  return (
    <header className="flex flex-col gap-8 max-lg:gap-4">
      <p className="type-label-xs text-muted-foreground">{eyebrow}</p>
      <div className="flex flex-col gap-2">
        <h1 className="type-h2 text-primary max-lg:type-h3">{title}</h1>
        {subtitle && <p className="text-sm leading-5 font-medium text-muted-foreground">{subtitle}</p>}
        {onBack && (
          <button
            type="button"
            onClick={onBack}
            className="flex cursor-pointer items-center gap-1 self-start py-2 type-label-xs text-primary"
          >
            <ArrowLeftIcon className="size-4" />
            Back
          </button>
        )}
      </div>
    </header>
  )
}

export type FinishingOverlay = "size" | "size-guide" | "engraving" | "crown" | "band" | "band-engraving" | null

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
      <BandSheet open={overlay === "band"} onOpenChange={close} />
      <EngravingSheet target="band" open={overlay === "band-engraving"} onOpenChange={close} />
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

const thumb = (src: string) => <img src={src} alt="" className="size-10 object-contain mix-blend-multiply" />

const fromPrice = (lead: string, price: number) => (
  <>
    {lead} · <span className="font-semibold text-primary">from {formatPrice(price)}</span>
  </>
)

const engravingDetail = (e: Engraving, style: EngravingStyle | null) => `Style: ${style?.name} · Text: ${e.text}`

export function PersonalizeSection({ onOpen }: { onOpen: (overlay: "engraving" | "crown") => void }) {
  const { engraving, engravingStyle, crown, setEngraving, setCrownId } = useRingBuild()
  return (
    <section className="flex flex-col gap-6" aria-labelledby="personalize-heading">
      <h2 id="personalize-heading" className="type-h4 text-primary">Personalize your Piece</h2>
      <div className="flex flex-col gap-2">
        {engraving ? (
          <AddedOptionBlock
            label="Engraving"
            media={engravingIcon}
            detail={engravingDetail(engraving, engravingStyle)}
            price={ENGRAVING.price}
            onEdit={() => onOpen("engraving")}
            onRemove={() => setEngraving(null)}
          />
        ) : (
          <OptionBlock
            label="Add Engraving"
            media={engravingIcon}
            description={fromPrice("Make it uniquely yours", ENGRAVING.price)}
            onClick={() => onOpen("engraving")}
          />
        )}
        {crown ? (
          <AddedOptionBlock
            label="Crown"
            media={thumb(crown.image)}
            detail={`${crown.name} (${crown.holds})`}
            price={crown.price}
            onEdit={() => onOpen("crown")}
            onRemove={() => setCrownId(null)}
          />
        ) : (
          <OptionBlock
            label="Upgrade your Crown"
            media={thumb(CLASSIC_CROWN.image)}
            description={fromPrice(`${CROWNS.length} available options`, CROWN_FROM_PRICE)}
            onClick={() => onOpen("crown")}
          />
        )}
      </div>
    </section>
  )
}

/** Matching wedding band upsell (Test 4 · B). Once a band is added, its engraving can be added. */
export function WeddingBandSection({ onOpen }: { onOpen: (overlay: "band" | "band-engraving") => void }) {
  const { band, bandEngraving, bandEngravingStyle, setBandId, setBandEngraving } = useRingBuild()
  return (
    <section className="flex flex-col gap-6" aria-labelledby="band-heading">
      <h2 id="band-heading" className="type-h4 text-primary">Matching Wedding Bands</h2>
      <div className="flex flex-col gap-2">
        {band ? (
          <AddedOptionBlock
            label="Wedding Band"
            media={thumb(band.image)}
            detail={band.name}
            price={band.price}
            onEdit={() => onOpen("band")}
            onRemove={() => setBandId(null)}
          />
        ) : (
          <OptionBlock
            label="Add a Matching Wedding Band"
            media={thumb(WEDDING_BANDS[0].image)}
            description={fromPrice("Complete the set", BAND_FROM_PRICE)}
            onClick={() => onOpen("band")}
          />
        )}
        {band &&
          (bandEngraving ? (
            <AddedOptionBlock
              label="Wedding Band Engraving"
              media={engravingIcon}
              detail={engravingDetail(bandEngraving, bandEngravingStyle)}
              price={ENGRAVING.price}
              onEdit={() => onOpen("band-engraving")}
              onRemove={() => setBandEngraving(null)}
            />
          ) : (
            <OptionBlock
              label="Add Wedding Band Engraving"
              media={engravingIcon}
              description={fromPrice("Make it uniquely yours", ENGRAVING.price)}
              onClick={() => onOpen("band-engraving")}
            />
          ))}
      </div>
    </section>
  )
}
