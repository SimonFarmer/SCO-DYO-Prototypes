import { useState } from "react"
import { useNavigate } from "react-router"
import { InfoIcon } from "@phosphor-icons/react"
import { Assurances, BuyActions, DeliveryOptions } from "@/components/dyo/buy-actions"
import { CrownSheet } from "@/components/dyo/crown-sheet"
import { DyoStepper } from "@/components/dyo/dyo-stepper"
import { EngravingSheet } from "@/components/dyo/engraving-sheet"
import { OptionBlock } from "@/components/dyo/option-block"
import { ProductGallery } from "@/components/dyo/product-gallery"
import { RingSizeSheet } from "@/components/dyo/ring-size-sheet"
import { RingSummary } from "@/components/dyo/ring-summary"
import { Breadcrumb } from "@/components/site/breadcrumb"
import { SiteHeader } from "@/components/site/site-header"
import { CROWNS, CROWN_FROM_PRICE, ENGRAVING, REVIEW_GALLERY } from "@/data/dyo"
import { formatPrice } from "@/lib/format"
import { useRingBuild } from "@/state/ring-build"

function Divider() {
  return (
    <div className="lg:py-3" aria-hidden>
      <div className="h-px bg-muted" />
    </div>
  )
}

type Overlay = "size" | "size-guide" | "engraving" | "crown" | null

/**
 * Test 4 · Variant A — options on the Ring Review step (current flow).
 * Figma: SCO Drop 3b – Customizer › Test 4 › "Step 3 — Review your ring" (7366:137280).
 * Starts on Ring Review with setting + stone chosen; ends at Add to bag.
 */
export function RingReviewA() {
  const navigate = useNavigate()
  const { ringSize, engraving, engravingStyle, crown } = useRingBuild()
  const [overlay, setOverlay] = useState<Overlay>(null)
  const close = (open: boolean) => !open && setOverlay(null)

  return (
    <div className="min-h-svh bg-background">
      <SiteHeader />
      <DyoStepper current={3} />

      <main className="lg:flex lg:items-start">
        {/* Gallery column */}
        <div className="bg-secondary lg:w-7/12">
          <Breadcrumb items={["Home", "Diamonds", "Brilliant Round Natural Diamond"]} className="max-lg:bg-background max-lg:px-margin max-lg:py-3" />
          <ProductGallery images={REVIEW_GALLERY} />
        </div>

        {/* Review column */}
        <div className="bg-primary-foreground px-margin py-8 lg:w-5/12 lg:pt-5 lg:pr-16 lg:pb-5 lg:pl-14">
          <div className="mx-auto flex max-w-xl flex-col gap-6 lg:mx-0 lg:gap-8 lg:max-w-none lg:pt-5">
            <header className="flex flex-col gap-8 max-lg:gap-4">
              <p className="type-label-xs text-muted-foreground">Step 3 of 3 · Finishing Touches</p>
              <div className="flex flex-col gap-2">
                <h1 className="type-h2 text-primary max-lg:type-h3">Review Your Ring</h1>
                <p className="text-sm leading-5 font-medium text-muted-foreground">
                  Add the final details to make your ring yours.
                </p>
              </div>
            </header>

            <Divider />

            <section className="flex flex-col gap-6" aria-labelledby="ring-size-heading">
              <h2 id="ring-size-heading" className="type-h4 text-primary">Select your Ring Size</h2>
              <OptionBlock
                label="Ring Size"
                value={ringSize ?? undefined}
                emphasis
                onClick={() => setOverlay("size")}
              />
              <div className="flex flex-col gap-2 bg-bg-input-50 p-3">
                <button
                  type="button"
                  onClick={() => setOverlay("size-guide")}
                  className="flex cursor-pointer items-center gap-1 self-start type-label-xs text-primary underline"
                >
                  Don’t know your size?
                  <InfoIcon className="size-4" />
                </button>
                <p className="type-caption text-primary">Order your best guess. Resizing is free, for life.</p>
              </div>
            </section>

            <Divider />

            <section className="flex flex-col gap-6" aria-labelledby="personalize-heading">
              <h2 id="personalize-heading" className="type-h4 text-primary">Personalize your Piece</h2>
              <div className="flex flex-col gap-2">
                <OptionBlock
                  label={engraving ? "Engraving" : "Add Engraving"}
                  selected={!!engraving}
                  media={<span className="text-2xl text-primary" style={{ fontFamily: ENGRAVING.styles[0].fontFamily }}>Abc</span>}
                  description={
                    engraving
                      ? `“${engraving.text}” · ${engravingStyle?.name} · ${formatPrice(ENGRAVING.price)}`
                      : <>Make it uniquely yours · <span className="font-semibold text-primary">from {formatPrice(ENGRAVING.price)}</span></>
                  }
                  onClick={() => setOverlay("engraving")}
                />
                <OptionBlock
                  label={crown ? "Crown" : "Add a Crown"}
                  selected={!!crown}
                  media={<img src={crown?.image ?? "/images/crowns/rosebud-petite.png"} alt="" className="size-10 object-contain mix-blend-multiply" />}
                  description={
                    crown
                      ? `${crown.name} · ${formatPrice(crown.price)}`
                      : <>{CROWNS.length} available options · <span className="font-semibold text-primary">from {formatPrice(CROWN_FROM_PRICE)}</span></>
                  }
                  onClick={() => setOverlay("crown")}
                />
              </div>
            </section>

            <Divider />

            <section aria-label="Ring summary">
              <RingSummary onEditCrown={() => setOverlay("crown")} onEditEngraving={() => setOverlay("engraving")} />
            </section>

            <Divider />

            <BuyActions onAddToBag={() => navigate("/test-4/added?variant=A")} />
            <Assurances />
            <DeliveryOptions />
          </div>
        </div>
      </main>

      <RingSizeSheet
        open={overlay === "size" || overlay === "size-guide"}
        initialTab={overlay === "size-guide" ? "guide" : "size"}
        onOpenChange={close}
      />
      <EngravingSheet open={overlay === "engraving"} onOpenChange={close} />
      <CrownSheet open={overlay === "crown"} onOpenChange={close} />
    </div>
  )
}
