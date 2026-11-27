import { useRef, type ReactNode } from "react"
import { DiamondBuyForm } from "@/components/diamond/diamond-buy-form"
import { AboutDiamondBlock, DiamondGallery, FourCsReportCard } from "@/components/diamond/diamond-pdp-sections"
import type { SpecLayout } from "@/components/diamond/diamond-specs"
import { DyoStepper, type DyoStart } from "@/components/dyo/dyo-stepper"
import { PdpStickyBar } from "@/components/pdp/pdp-sticky-bar"
import { FeatureBlock, UgcBlock, ValuePropsBlock } from "@/components/pdp/content-blocks"
import { ReviewsBlock } from "@/components/pdp/reviews-block"
import { ProductCarousel } from "@/components/shared/product-carousel"
import { Breadcrumb } from "@/components/site/breadcrumb"
import { SiteFooter } from "@/components/site/site-footer"
import { SiteHeader } from "@/components/site/site-header"
import { diamondName, type Diamond } from "@/data/diamonds"
import { storedPlpQuery, useFlow } from "@/flow/flow-context"
import { FLOW_CRUMBS } from "@/flow/flow-paths"
import { RECENTLY_VIEWED } from "@/data/products"
import { formatPrice } from "@/lib/format"
import { PAGE_MAX } from "@/lib/utils"

interface DiamondPdpProps {
  diamond: Diamond
  specLayout: SpecLayout
  onSelect: () => void
  /** Desktop sticky product bar from “About this diamond” down (Tests 3.1 and 3.2). */
  stickyBar?: boolean
  /** DYO entry point; stone-first journeys show the stone as step 1. */
  start?: DyoStart
  /** In place of the breadcrumb: the full-flow study's way back to where the shopper opened this stone. */
  backBar?: ReactNode
}

/**
 * Diamond PDP — DYO step 2 (Figma “Diamond PDP — DYO Step 9”, 7375:129294 / 7375:134699).
 * Shared by Test 3.1 (full-details destination) and Test 3.2 (spec layouts).
 */
export function DiamondPdp({ diamond, specLayout, onSelect, stickyBar = false, start = "setting", backBar }: DiamondPdpProps) {
  const flow = useFlow()
  const aboutRef = useRef<HTMLElement>(null)
  // Full flow, mobile: the sticky bar shows once the buy form (after the gallery) reaches the top.
  const buyFormRef = useRef<HTMLElement>(null)
  return (
    <div className="min-h-screen bg-background">
      {/* Full flow: live header navigation and the flow breadcrumb; Test 3 keeps them inert. */}
      <SiteHeader contained navigation={!!flow} />
      <DyoStepper current={start === "stone" ? 1 : 2} start={start} showTotal={start !== "stone"} contained />
      {stickyBar && (
        <PdpStickyBar
          image={diamond.image}
          imageAlt={`${diamond.carat.toFixed(2)} ct diamond, top view`}
          title={diamondName(diamond)}
          specs={[`${diamond.carat.toFixed(2)} ct`, `${diamond.color} Color`, `${diamond.clarity} Clarity`, `${diamond.cut} Cut`]}
          price={formatPrice(diamond.price)}
          showFrom={aboutRef}
          mobileFrom={buyFormRef}
        />
      )}
      <main>
        {/* Gallery + buy form capped at 1680px (PAGE_MAX, as Test 2); the bands below use px-page. */}
        <div className={PAGE_MAX}>
        <div className="grid lg:grid-cols-[826fr_606fr] lg:gap-2">
          {backBar ? (
            <div className="lg:col-span-2">{backBar}</div>
          ) : flow ? (
            flow.config.crumbs && (
              <Breadcrumb items={FLOW_CRUMBS.diamond(`/diamonds${storedPlpQuery(flow.base)}`, diamondName(diamond))} className="mx-2 bg-secondary" />
            )
          ) : (
            <Breadcrumb items={["Home", "Diamonds", diamondName(diamond)]} className="mx-2 bg-secondary" />
          )}
        </div>
        <div className="grid lg:grid-cols-[826fr_606fr] lg:gap-2">
          <div className="px-2">
            <DiamondGallery diamond={diamond} />
          </div>
          <aside ref={buyFormRef} className="px-margin pb-8 lg:px-14 lg:pt-5">
            <div className="transition-[top] duration-300 ease-out lg:sticky lg:top-[calc(var(--header-offset)+var(--sticky-bar-offset,0px)+--spacing(5))]">
              <DiamondBuyForm
                diamond={diamond}
                specLayout={specLayout}
                onSelect={onSelect}
                onViewDetails={() => aboutRef.current?.scrollIntoView({ behavior: "smooth", block: "start" })}
              />
            </div>
          </aside>
        </div>
        </div>
        <FourCsReportCard diamond={diamond} />
        <AboutDiamondBlock ref={aboutRef} diamond={diamond} />
        <ValuePropsBlock />
        <FeatureBlock
          eyebrow="Chosen by Our Experts"
          title="Our Diamonds"
          image="/images/diamonds/our-diamonds.png"
          imageAlt="Loose diamonds on a Shane Co. card"
        />
        <UgcBlock />
        <ReviewsBlock empty />
        <ProductCarousel
          title="Pick Up Where You Left Off"
          products={RECENTLY_VIEWED}
          showWishlist
          className="border-t border-border-subtle"
          contained
        />
      </main>
      <SiteFooter contained />
    </div>
  )
}
