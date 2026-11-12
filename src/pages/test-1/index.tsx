import { useRef, useState } from "react"
import { DyoStepper } from "@/components/dyo/dyo-stepper"
import { Breadcrumb } from "@/components/site/breadcrumb"
import { SiteFooter } from "@/components/site/site-footer"
import { SiteHeader } from "@/components/site/site-header"
import { CompleteTheLook } from "@/components/pdp/complete-the-look"
import {
  FeatureBlock,
  ProductDetailsBlock,
  UgcBlock,
  ValuePropsBlock,
} from "@/components/pdp/content-blocks"
import { ReviewsBlock } from "@/components/pdp/reviews-block"
import { InlineProductDetails, type ProductInfoTab } from "@/components/pdp/product-info"
import { ProductInfoDrawer } from "@/components/pdp/product-info-drawer"
import { SettingBuyForm } from "@/components/pdp/setting-buy-form"
import { SettingGallery, ThumbnailGallery } from "@/components/pdp/setting-gallery"
import { ProductCarousel } from "@/components/shared/product-carousel"
import {
  MATCHING_BANDS,
  RECENTLY_VIEWED,
  SIMILAR_STYLES,
  ELLA_CATHEDRAL,
  galleryFor,
  type MetalId,
} from "@/data/products"
import { useVariant } from "@/lib/hooks"
import { cn } from "@/lib/utils"
import { SETTING_PDP_VARIANTS, VARIANT_IDS } from "./variants"

/** Matching set shown in variant C — same bands as the recommender, without merchandising badges (Figma). */
const COMPLETE_THE_LOOK = MATCHING_BANDS.slice(0, 3).map((p) => ({ ...p, badge: undefined }))

/**
 * Test 1 · Settings PDP Gallery & Details (DYO step 1). Switch with ?variant=A|B|C.
 * The variant only changes the gallery and how product details are reached; see ./variants.ts.
 */
export function Test1() {
  const variant = SETTING_PDP_VARIANTS[useVariant(VARIANT_IDS)]

  const setting = ELLA_CATHEDRAL
  const [metal, setMetal] = useState<MetalId>(setting.defaultMetal)
  const [detailsOpen, setDetailsOpen] = useState(false)
  const [detailsTab, setDetailsTab] = useState<ProductInfoTab>("overview")
  const inlineDetailsRef = useRef<HTMLDivElement>(null)
  const { shape, carat } = setting.previewStone
  const media = galleryFor(setting, metal)
  const isThumbnails = variant.gallery === "thumbnails"

  const viewDetails = () => {
    setDetailsTab("overview")
    if (variant.details === "drawer") setDetailsOpen(true)
    else inlineDetailsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" })
  }

  return (
    <div className="min-h-screen bg-background" data-variant={variant.id}>
      <SiteHeader />
      <DyoStepper current={1} />

      <main>
        {/* Figma: breadcrumb is its own 48px full-width row ("Section") above both columns,
            so the buy form starts 48 + 20 = 68px below the stepper. */}
        <div className="grid lg:grid-cols-[826fr_606fr] lg:gap-2">
          <Breadcrumb items={[...setting.breadcrumb, setting.name]} className="mx-2 bg-secondary" />
        </div>
        <div className="grid lg:grid-cols-[826fr_606fr] lg:gap-2">
          {isThumbnails ? (
            // Short gallery sticks while the (longer) buy form scrolls; it sits below the
            // sticky-on-intent header when that is showing (--header-offset).
            <div className="px-2 transition-[top] duration-300 ease-out lg:sticky lg:top-(--header-offset) lg:self-start">
              {/* Not keyed by metal: the selected image position is kept when the metal changes. */}
              <ThumbnailGallery media={media} />
            </div>
          ) : (
            <SettingGallery key={metal} media={media} previewLabel={`Previewing: ${shape} ∙ ${carat.toFixed(2)} ct`} />
          )}
          <aside className="px-margin pb-8 lg:px-14 lg:pt-5">
            <div className={cn(!isThumbnails && "transition-[top] duration-300 ease-out lg:sticky lg:top-[calc(var(--header-offset)+--spacing(5))]")}>
              <SettingBuyForm
                setting={setting}
                metal={metal}
                onMetalChange={setMetal}
                onViewDetails={viewDetails}
                teaser={variant.teaser}
                afterActions={variant.completeTheLook ? <CompleteTheLook products={COMPLETE_THE_LOOK} /> : null}
                beforeDelivery={
                  variant.details === "inline-tabs" ? (
                    <InlineProductDetails
                      ref={inlineDetailsRef}
                      setting={setting}
                      metal={metal}
                      tab={detailsTab}
                      onTabChange={setDetailsTab}
                    />
                  ) : null
                }
              />
            </div>
          </aside>
        </div>

        <ProductCarousel title="Similar Styles" products={SIMILAR_STYLES} />
        <ProductCarousel title="Matching Wedding Bands" products={MATCHING_BANDS} className="pt-0" />
        <ProductDetailsBlock setting={setting} metal={metal} />
        <ValuePropsBlock />
        <FeatureBlock />
        <UgcBlock />
        <ReviewsBlock />
        <ProductCarousel
          title="Pick Up Where You Left Off"
          products={RECENTLY_VIEWED}
          showWishlist
          className="border-t border-border-subtle"
        />
      </main>

      <SiteFooter />

      {variant.details === "drawer" && (
        <ProductInfoDrawer
          setting={setting}
          metal={metal}
          open={detailsOpen}
          onOpenChange={setDetailsOpen}
          tab={detailsTab}
          onTabChange={setDetailsTab}
        />
      )}
    </div>
  )
}
