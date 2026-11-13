import { useRef } from "react"
import { DiamondBuyForm } from "@/components/diamond/diamond-buy-form"
import { AboutDiamondBlock, DiamondGallery, FourCsReportCard } from "@/components/diamond/diamond-pdp-sections"
import type { SpecLayout } from "@/components/diamond/diamond-specs"
import { DyoStepper } from "@/components/dyo/dyo-stepper"
import { FeatureBlock, UgcBlock, ValuePropsBlock } from "@/components/pdp/content-blocks"
import { ReviewsBlock } from "@/components/pdp/reviews-block"
import { ProductCarousel } from "@/components/shared/product-carousel"
import { Breadcrumb } from "@/components/site/breadcrumb"
import { SiteFooter } from "@/components/site/site-footer"
import { SiteHeader } from "@/components/site/site-header"
import { diamondName, type Diamond } from "@/data/diamonds"
import { RECENTLY_VIEWED } from "@/data/products"

interface DiamondPdpProps {
  diamond: Diamond
  specLayout: SpecLayout
  onSelect: () => void
}

/**
 * Diamond PDP — DYO step 2 (Figma “Diamond PDP — DYO Step 9”, 7375:129294 / 7375:134699).
 * Shared by Test 3.1 (full-details destination) and Test 3.2 (spec layouts).
 */
export function DiamondPdp({ diamond, specLayout, onSelect }: DiamondPdpProps) {
  const aboutRef = useRef<HTMLElement>(null)
  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <DyoStepper current={2} />
      <main>
        <div className="grid lg:grid-cols-[826fr_606fr] lg:gap-2">
          <Breadcrumb items={["Home", "Diamonds", diamondName(diamond)]} className="mx-2 bg-secondary" />
        </div>
        <div className="grid lg:grid-cols-[826fr_606fr] lg:gap-2">
          <div className="px-2">
            <DiamondGallery diamond={diamond} />
          </div>
          <aside className="px-margin pb-8 lg:px-14 lg:pt-5">
            <div className="transition-[top] duration-300 ease-out lg:sticky lg:top-[calc(var(--header-offset)+--spacing(5))]">
              <DiamondBuyForm
                diamond={diamond}
                specLayout={specLayout}
                onSelect={onSelect}
                onViewDetails={() => aboutRef.current?.scrollIntoView({ behavior: "smooth", block: "start" })}
              />
            </div>
          </aside>
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
        />
      </main>
      <SiteFooter />
    </div>
  )
}
