import { useRef, useState } from "react"
import { DyoStepper } from "@/components/dyo/dyo-stepper"
import { Breadcrumb, type Crumb } from "@/components/site/breadcrumb"
import { SiteFooter } from "@/components/site/site-footer"
import { SiteHeader } from "@/components/site/site-header"
import { MobileBottomNav } from "@/components/site/mobile-bottom-nav"
import { useNotInTest } from "@/components/prototype/not-in-test"
import { formatPrice } from "@/lib/format"
import { CompleteTheLook } from "@/components/pdp/complete-the-look"
import {
  FeatureBlock,
  ProductDetailsBlock,
  UgcBlock,
  ValuePropsBlock,
} from "@/components/pdp/content-blocks"
import { PdpStickyBar } from "@/components/pdp/pdp-sticky-bar"
import { ReviewsBlock } from "@/components/pdp/reviews-block"
import { InlineProductDetails, type ProductInfoTab } from "@/components/pdp/product-info"
import { ProductInfoDrawer } from "@/components/pdp/product-info-drawer"
import { SettingBuyForm } from "@/components/pdp/setting-buy-form"
import { SettingGallery, ThumbnailGallery } from "@/components/pdp/setting-gallery"
import { StonePreviewMenu } from "@/components/pdp/stone-preview-menu"
import { SHAPES } from "@/data/plp"
import { ProductCarousel } from "@/components/shared/product-carousel"
import {
  MATCHING_BANDS,
  RECENTLY_VIEWED,
  SIMILAR_STYLES,
  ELLA_CATHEDRAL,
  METALS,
  galleryFor,
  type MetalId,
} from "@/data/products"
import { cn, PAGE_MAX } from "@/lib/utils"
import { SETTING_PDP_VARIANTS, type SettingPdpVariant } from "@/pages/test-1/variants"

/** Matching set shown in variant C — same bands as the recommender, without merchandising badges (Figma). */
const COMPLETE_THE_LOOK = MATCHING_BANDS.slice(0, 3).map((p) => ({ ...p, badge: undefined }))

/** What the full DYO flow (/flow) changes on the Settings PDP; the unmoderated test passes none of it. */
export interface SettingPdpFlow {
  /** The build's metal, so the stepper and later steps follow the PDP. */
  metal: MetalId
  onMetalChange: (metal: MetalId) => void
  /** Stone shape the shopper came in with, previewed first when the setting is made for it. */
  initialShape?: string | null
  /** Breadcrumb trail, or null to hide it (moderator switch). */
  breadcrumb: Crumb[] | null
  /** "Select this Setting": on to the stone step. */
  onSelect: () => void
}

/**
 * Full DYO flow · Settings PDP. A copy of Test 1's page (src/pages/test-1), so Test 1 stays untouched:
 * same gallery, buy form and details per Test 1 variant, plus live navigation, the build's metal,
 * the flow breadcrumb and the next step. Keep visual fixes in sync with Test 1.
 */
export function SettingPdp({ variant: variantId, flow }: { variant: SettingPdpVariant["id"]; flow?: SettingPdpFlow }) {
  const variant = SETTING_PDP_VARIANTS[variantId]

  const setting = ELLA_CATHEDRAL
  const [localMetal, setLocalMetal] = useState<MetalId>(setting.defaultMetal)
  const metal = flow?.metal ?? localMetal
  const setMetal = flow?.onMetalChange ?? setLocalMetal
  const [detailsOpen, setDetailsOpen] = useState(false)
  const [detailsTab, setDetailsTab] = useState<ProductInfoTab>("overview")
  const inlineDetailsRef = useRef<HTMLDivElement>(null)
  const ctaRef = useRef<HTMLDivElement>(null)
  const productDetailsRef = useRef<HTMLElement>(null)
  const notInTest = useNotInTest()
  const price = (setting.variants.find((v) => v.metal === metal) ?? setting.variants[0]).price
  const { carat } = setting.previewStone
  const [previewShape, setPreviewShape] = useState(
    flow?.initialShape && setting.shapes.includes(flow.initialShape) ? flow.initialShape : setting.shapes[0],
  )
  const shapeLabel = SHAPES.find((s) => s.id === previewShape)?.label ?? setting.previewStone.shape
  const isThumbnails = variant.gallery === "thumbnails"
  // The stone preview dropdown swaps the hero image in every variant.
  const media = galleryFor(setting, metal, previewShape)
  // Same selector in every variant; on phones it also carries the carat (no room for a separate badge).
  const previewMenu = (
    <StonePreviewMenu
      shapes={setting.shapes}
      value={previewShape}
      onChange={setPreviewShape}
      mobileDetail={`${carat.toFixed(2)} ct`}
    />
  )

  const viewDetails = () => {
    setDetailsTab("overview")
    if (variant.details === "drawer") setDetailsOpen(true)
    else inlineDetailsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" })
  }

  return (
    <div className="min-h-screen bg-background" data-variant={variant.id}>
      {/* In the flow the header navigation is live; in the test it is inert. */}
      <SiteHeader contained navigation={!!flow} />
      <DyoStepper current={1} contained />
      <PdpStickyBar
        image={media[0]?.src ?? ""}
        imageAlt={media[0]?.alt ?? setting.name}
        title={setting.name}
        specs={[METALS[metal].label, `Previewing: ${shapeLabel} ∙ ${carat.toFixed(2)} ct`]}
        price={formatPrice(price)}
        showFrom={productDetailsRef}
      />

      <main>
        {/* Figma: breadcrumb is its own 48px full-width row ("Section") above both columns,
            so the buy form starts 48 + 20 = 68px below the stepper. */}
        {/* Gallery + buy form stop growing at 1680px and centre (PAGE_MAX, as Test 2); the bands below
            keep a full-width background with their content on the same edges (px-page). */}
        <div className={PAGE_MAX}>
        <div className="grid lg:grid-cols-[826fr_606fr] lg:gap-2">
          {flow ? (
            flow.breadcrumb && <Breadcrumb items={flow.breadcrumb} className="mx-2 bg-secondary" />
          ) : (
            <Breadcrumb items={[...setting.breadcrumb, setting.name]} className="mx-2 bg-secondary" />
          )}
        </div>
        <div className="grid lg:grid-cols-[826fr_606fr] lg:gap-2">
          {isThumbnails ? (
            // Short gallery sticks while the (longer) buy form scrolls; it sits below the
            // sticky-on-intent header when that is showing (--header-offset).
            // Full-bleed carousel on mobile; framed gallery from lg up.
            <div className="transition-[top] duration-300 ease-out lg:sticky lg:top-[calc(var(--header-offset)+var(--sticky-bar-offset,0px))] lg:self-start lg:px-2">
              {/* Not keyed by metal: the selected image position is kept when the metal changes. */}
              <ThumbnailGallery media={media} previewMenu={previewMenu} previewShape={previewShape} />
            </div>
          ) : (
            <SettingGallery
              key={metal}
              media={media}
              previewLabel={`Previewing: ${shapeLabel} ∙ ${carat.toFixed(2)} ct`}
              previewMenu={previewMenu}
              previewShape={previewShape}
            />
          )}
          <aside className="px-margin pt-8 pb-8 lg:px-14 lg:pt-5">
            <div className={cn(!isThumbnails && "transition-[top] duration-300 ease-out lg:sticky lg:top-[calc(var(--header-offset)+var(--sticky-bar-offset,0px)+--spacing(5))]")}>
              <SettingBuyForm
                setting={setting}
                metal={metal}
                onMetalChange={setMetal}
                onViewDetails={viewDetails}
                onSelect={flow?.onSelect}
                ctaRef={ctaRef}
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
        </div>

        <ProductCarousel title="Similar Styles" products={SIMILAR_STYLES} contained />
        <ProductCarousel title="Matching Wedding Bands" products={MATCHING_BANDS} className="pt-0" contained />
        <ProductDetailsBlock ref={productDetailsRef} setting={setting} metal={metal} />
        <ValuePropsBlock />
        <FeatureBlock />
        <UgcBlock />
        <ReviewsBlock />
        <ProductCarousel
          title="Pick Up Where You Left Off"
          products={RECENTLY_VIEWED}
          showWishlist
          className="border-t border-border-subtle"
          contained
        />
      </main>

      <SiteFooter contained />

      {/* Mobile: navigation bar that swaps to the CTA once the buy form’s CTA scrolls away (fixes sheet #9). */}
      <MobileBottomNav
        shopInTest={!!flow}
        cta={{
          label: `${formatPrice(price)} - Select this Setting`,
          onClick: flow?.onSelect ?? (() => notInTest("Selecting the setting")),
          watch: ctaRef,
        }}
      />

      {variant.details === "drawer" && (
        <ProductInfoDrawer
          setting={setting}
          metal={metal}
          previewShape={previewShape}
          open={detailsOpen}
          onOpenChange={setDetailsOpen}
          tab={detailsTab}
          onTabChange={setDetailsTab}
        />
      )}
    </div>
  )
}
