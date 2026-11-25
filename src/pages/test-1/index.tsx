import { useRef, useState } from "react"
import { DyoStepper } from "@/components/dyo/dyo-stepper"
import { Breadcrumb } from "@/components/site/breadcrumb"
import { SiteFooter } from "@/components/site/site-footer"
import { SiteHeader } from "@/components/site/site-header"
import { MobileBottomNav } from "@/components/site/mobile-bottom-nav"
import { useNotInTest } from "@/components/prototype/not-in-test"
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
import { ShapeSelector } from "@/components/stones/preference-parts"
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
import { useElementHeight, useVariant } from "@/lib/hooks"
import { cn, PAGE_MAX } from "@/lib/utils"
import { SETTING_PDP_VARIANTS, VARIANT_IDS } from "./variants"

/**
 * Test 1 · Settings PDP Gallery & Details (DYO step 1). Participant URLs: /test-1/a … /test-1/f.
 * The variant only changes the gallery and how product details are reached (2 × 3); see ./variants.ts.
 */
export function Test1() {
  const variant = SETTING_PDP_VARIANTS[useVariant(VARIANT_IDS)]

  const setting = ELLA_CATHEDRAL
  const [metal, setMetal] = useState<MetalId>(setting.defaultMetal)
  const [detailsOpen, setDetailsOpen] = useState(false)
  const [detailsTab, setDetailsTab] = useState<ProductInfoTab>("overview")
  const inlineDetailsRef = useRef<HTMLDivElement>(null)
  const ctaRef = useRef<HTMLDivElement>(null)
  const productDetailsRef = useRef<HTMLElement>(null)
  const buyFormRef = useRef<HTMLDivElement>(null)
  const buyFormHeight = useElementHeight(buyFormRef)
  const notInTest = useNotInTest()
  const price = (setting.variants.find((v) => v.metal === metal) ?? setting.variants[0]).price
  const { carat } = setting.previewStone
  const [previewShape, setPreviewShape] = useState(setting.shapes[0])
  const shapeLabel = SHAPES.find((s) => s.id === previewShape)?.label ?? setting.previewStone.shape
  const isThumbnails = variant.gallery === "thumbnails"
  // The stone preview dropdown swaps the hero image in every variant.
  const media = galleryFor(setting, metal, previewShape)
  // G: the preview is a shape selector in the buy form instead, so the gallery has no dropdown.
  const shapeInForm = variant.shapeInForm === true
  // Picking a shape on phones, where the gallery is above the form: glide back up so the new preview is seen
  // (as a metal change does).
  const previewShapeInForm = (next: string) => {
    if (next === previewShape) return
    setPreviewShape(next)
    if (window.matchMedia("(min-width: 80rem)").matches) return
    requestAnimationFrame(() => requestAnimationFrame(() => window.scrollTo({ top: 0, behavior: "smooth" })))
  }
  // Same selector in every other variant; on phones it also carries the carat (no room for a separate badge).
  const previewMenu = shapeInForm ? undefined : (
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
      <SiteHeader contained />
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
          <Breadcrumb items={[...setting.breadcrumb, setting.name]} className="mx-2 bg-secondary" />
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
              mobileNav={variant.mobileDots ? "dots" : "thumbnails"}
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
                ctaRef={ctaRef}
                teaser={variant.details === "teaser-drawer"}
                afterMetal={
                  shapeInForm ? (
                    <ShapeSelector
                      title="Preview a Stone Shape"
                      shapes={setting.shapes}
                      value={previewShape}
                      onChange={previewShapeInForm}
                    />
                  ) : null
                }
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
        shopInTest={false}
        cta={{
          label: `${formatPrice(price)} - Select this Setting`,
          onClick: () => notInTest("Selecting the setting"),
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
