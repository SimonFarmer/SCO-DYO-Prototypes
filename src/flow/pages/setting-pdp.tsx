import { useRef, useState } from "react"
import { DyoStepper } from "@/components/dyo/dyo-stepper"
import { Breadcrumb, type Crumb } from "@/components/site/breadcrumb"
import { SiteFooter } from "@/components/site/site-footer"
import { SiteHeader } from "@/components/site/site-header"
import { MobileBottomNav } from "@/components/site/mobile-bottom-nav"
import { formatPrice } from "@/lib/format"
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
  METALS,
  galleryFor,
  type MetalId,
  type Setting,
} from "@/data/products"
import { useElementHeight } from "@/lib/hooks"
import { cn, PAGE_MAX } from "@/lib/utils"
import { SETTING_PDP_VARIANTS, type SettingPdpVariant } from "@/pages/test-1/variants"

/** What the full DYO flow (/flow) changes on the Settings PDP. */
export interface SettingPdpFlow {
  /** The build's metal, so the stepper and later steps follow the PDP. */
  metal: MetalId
  /** The setting picked on the PLP. */
  setting: Setting
  onMetalChange: (metal: MetalId) => void
  /** Stone shape the shopper came in with, previewed first when the setting is made for it. */
  initialShape?: string | null
  /** Breadcrumb trail, or null to hide it (moderator switch). */
  breadcrumb: Crumb[] | null
  /** "Select this Setting": on to the stone step. */
  onSelect: () => void
}

/**
 * Full DYO flow · Settings PDP. A copy of Test 1's page (src/pages/test-1/index.tsx, synced with its six
 * A–F variants), so Test 1 stays untouched: same gallery, buy form and details per Test 1 variant, plus live
 * navigation, the build's metal, the flow breadcrumb and the next step. Keep visual fixes in sync with Test 1.
 */
export function SettingPdp({ variant: variantId, flow }: { variant: SettingPdpVariant["id"]; flow: SettingPdpFlow }) {
  const variant = SETTING_PDP_VARIANTS[variantId]

  const setting = flow.setting
  const metal = flow.metal
  const setMetal = flow.onMetalChange
  const [detailsOpen, setDetailsOpen] = useState(false)
  const [detailsTab, setDetailsTab] = useState<ProductInfoTab>("overview")
  const inlineDetailsRef = useRef<HTMLDivElement>(null)
  const ctaRef = useRef<HTMLDivElement>(null)
  const productDetailsRef = useRef<HTMLElement>(null)
  const buyFormRef = useRef<HTMLDivElement>(null)
  const buyFormHeight = useElementHeight(buyFormRef)
  const price = (setting.variants.find((v) => v.metal === metal) ?? setting.variants[0]).price
  const { carat } = setting.previewStone
  const [previewShape, setPreviewShape] = useState(
    flow.initialShape && setting.shapes.includes(flow.initialShape) ? flow.initialShape : setting.shapes[0],
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
    if (variant.details !== "inline-tabs") setDetailsOpen(true)
    else scrollToInlineDetails()
  }

  // Glide to the tabs below the CTA. Measured in normal flow: when the long-scroll buy form is stuck,
  // the browser's scrollIntoView reads its shifted position and stops short. The form then sticks with
  // the tabs in view. Leaves room for the sticky header and mobile stepper bar: the header ignores
  // scrolling right after a click, so it may still be showing when the scroll ends.
  const scrollToInlineDetails = () => {
    const tabs = inlineDetailsRef.current
    const form = buyFormRef.current
    const aside = form?.parentElement
    if (!tabs || !form || !aside) return
    const formTop = aside.getBoundingClientRect().top + window.scrollY + parseFloat(getComputedStyle(aside).paddingTop)
    const offsetInForm = tabs.getBoundingClientRect().top - form.getBoundingClientRect().top
    const bar = document.querySelector<HTMLElement>('[data-slot="stepper-bar"]')
    const gap = parseFloat(getComputedStyle(tabs).scrollMarginTop) || 0
    const header = parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--header-offset")) || 0
    window.scrollTo({ top: formTop + offsetInForm - header - (bar?.offsetHeight ?? 0) - gap, behavior: "smooth" })
  }

  return (
    <div className="min-h-screen bg-background" data-variant={variant.id}>
      <SiteHeader contained navigation />
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
          {flow.breadcrumb && <Breadcrumb items={flow.breadcrumb} className="mx-2 bg-secondary" />}
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
            {/* Long-scroll: the buy form is sticky beside the gallery. When it's taller than the screen (always
                with the tabs below the CTA), it scrolls with the page until its bottom is in view and then
                sticks there, so every part of it stays reachable. */}
            <div
              ref={buyFormRef}
              className={cn(!isThumbnails && "transition-[top] duration-300 ease-out lg:sticky")}
              style={
                isThumbnails
                  ? undefined
                  : {
                      top: `min(calc(var(--header-offset) + var(--sticky-bar-offset, 0px) + var(--spacing) * 5), calc(100vh - ${buyFormHeight}px - var(--spacing) * 8))`,
                    }
              }
            >
              <SettingBuyForm
                setting={setting}
                metal={metal}
                onMetalChange={setMetal}
                onViewDetails={viewDetails}
                onSelect={flow.onSelect}
                ctaRef={ctaRef}
                teaser={variant.details === "teaser-drawer"}
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
        shopInTest
        cta={{
          label: `${formatPrice(price)} - Select this Setting`,
          onClick: flow.onSelect,
          watch: ctaRef,
        }}
      />

      {variant.details !== "inline-tabs" && (
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
