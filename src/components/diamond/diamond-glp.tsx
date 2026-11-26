import { Fragment, useEffect, useState, type ReactNode } from "react"
import { useNotInTest } from "@/components/prototype/not-in-test"
import { DiamondFilters } from "@/components/diamond/diamond-filters"
import { GlpDesktopBar, GlpMobileBar, GlpMobileFilterDrawer } from "@/components/diamond/glp-filter-bar"
import { GlpCatalogProvider, NATURAL_GLP, type GlpCatalog } from "@/components/diamond/glp-catalog"
import { GlpHero } from "@/components/diamond/glp-hero"
import { useDiamondListing, type DiamondListing } from "@/components/diamond/use-diamond-listing"
import {
  FaqBlock,
  NeedHelpBlock,
  RelatedArticlesBlock,
  RelatedCategoriesBlock,
  SeoIntroBlock,
} from "@/components/diamond/glp-content-blocks"
import { StoneTile } from "@/components/diamond/stone-tile"
import { StoneTileSkeleton, TileLoading } from "@/components/shared/tile-skeletons"
import { useFilterLoading } from "@/lib/use-filter-loading"
import { DyoStepper, type DyoStart } from "@/components/dyo/dyo-stepper"
import { Pagination } from "@/components/plp/product-grid"
import { ProductCarousel } from "@/components/shared/product-carousel"
import { MobileBottomNav } from "@/components/site/mobile-bottom-nav"
import { SiteFooter } from "@/components/site/site-footer"
import { SiteHeader } from "@/components/site/site-header"
import { Button } from "@/components/ui/button"
import type { Diamond, Shape } from "@/data/diamonds"
import { NO_FILTERS } from "@/lib/diamond-filters"
import { RECENTLY_VIEWED } from "@/data/products"
import { RESULTS_ID } from "@/lib/scroll-to-results"
import { cn, PAGE_MAX } from "@/lib/utils"

/* ───────────────────────── In-grid banner ───────────────────────── */

function FourCsBanner() {
  const notInTest = useNotInTest()
  return (
    <div className="col-span-full">
      <div className="relative flex flex-wrap items-center gap-x-10 gap-y-6 overflow-clip px-6 py-10 lg:px-16">
        {/* Figma crops the hand photo to ~75% down the image. */}
        <img src="/images/diamonds/banner-4cs.png" alt="" className="absolute inset-0 size-full object-cover object-[50%_75%]" />
        <span aria-hidden className="absolute inset-0 bg-linear-to-r from-black/50 to-transparent" />
        <div className="relative flex min-w-72 flex-1 flex-col gap-2 text-white">
          <h2 className="max-w-guided-intent font-heading text-2xl leading-[1.2] font-medium tracking-[-0.6px] text-shadow-2xs">Understand the 4Cs</h2>
          <p className="text-sm">How cut, color, clarity and carat work together, and where to spend your budget.</p>
        </div>
        {/* Inverted button (Figma: primary #F7F7F7 fill, dark label). */}
        <Button className="relative bg-primary-foreground px-14 text-primary hover:bg-primary-foreground/85" onClick={() => notInTest("The diamond guide")}>
          Diamond Guide
        </Button>
      </div>
    </div>
  )
}

/* ───────────────────────── Page ───────────────────────── */

/**
 * Natural Diamonds GLP, DYO step 2 (Figma "Diamond GLP — DYO Step 3": desktop 8032:112719, mobile 8032:112876).
 * `onOpen` decides what a tile does: the Quickview on the GLP prototype, the PDP in Test 3.1 variant A.
 * `start` is where the shopper entered the DYO flow: from Shop by Stone the stone is step 1.
 * `entryShape` (a Shop by Stone link) starts a fresh refinement on that shape; `onEntryApplied` then
 * drops it from the URL so Back and reloads keep the shopper's later refinements.
 */
export function DiamondGlp({
  onOpen,
  storageKey,
  shopInTest = true,
  start = "setting",
  entryShape,
  onEntryApplied,
}: {
  onOpen: (d: Diamond) => void
  storageKey?: string
  /** false: the mobile bar's Shop shows the "not part of this test" notice (Test 3) */
  shopInTest?: boolean
  start?: DyoStart
  entryShape?: Shape | null
  onEntryApplied?: () => void
}) {
  const listing = useDiamondListing(storageKey)
  const { setFilters } = listing
  useEffect(() => {
    if (!entryShape) return
    setFilters({ ...NO_FILTERS, shapes: [entryShape] })
    onEntryApplied?.()
  }, [entryShape, setFilters, onEntryApplied])
  return (
    <DiamondGlpView
      listing={listing}
      onOpen={onOpen}
      shopInTest={shopInTest}
      stepper={<DyoStepper current={start === "stone" ? 1 : 2} start={start} showTotal={start !== "stone"} mobileTone="plp" contained />}
    />
  )
}

/**
 * The GLP page itself, over any listing: the GLP prototype and Test 3 list Test 3's natural diamonds;
 * Test 2's PLP passes its own listing and catalogue (natural, lab-grown or gemstones, preset from the
 * shopper's preferences), its stepper, and tile titles.
 */
export function DiamondGlpView({
  listing,
  onOpen,
  shopInTest = true,
  stepper,
  catalog = NATURAL_GLP,
  tileTitle,
  stickyBar,
}: {
  listing: DiamondListing
  onOpen: (d: Diamond) => void
  shopInTest?: boolean
  stepper: ReactNode
  catalog?: GlpCatalog
  tileTitle?: (d: Diamond) => string
  /** A bar over the top of the hero that stays on screen while the results scroll (the full flows' way back). */
  stickyBar?: ReactNode
}) {
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const { pageItems, page, pageCount, results } = listing
  // Any filter or sort change shows skeleton tiles for a second, as if the grid were refreshing.
  const loading = useFilterLoading(JSON.stringify([listing.filters, listing.sort]))
  const cols = sidebarOpen ? 3 : 4
  const title = catalog.hero.title

  useEffect(() => {
    const previous = document.title
    document.title = `${title} | Shane Co.`
    return () => {
      document.title = previous
    }
  }, [title])

  return (
    <GlpCatalogProvider value={catalog}>
    <div className="min-h-svh bg-background">
      <SiteHeader navigation contained />
      <main>
        {stickyBar}
        <GlpHero listing={listing} />
        {stepper}

        {/* Results capped at 1680px (PAGE_MAX, as the Test 2 PLP). */}
        <div id={RESULTS_ID} className={cn("scroll-mt-(--header-offset)", PAGE_MAX)}>
          <GlpDesktopBar listing={listing} sidebarOpen={sidebarOpen} onToggleSidebar={() => setSidebarOpen((o) => !o)} />
          <GlpMobileBar listing={listing} onOpenFilters={() => setDrawerOpen(true)} />

          <div className="flex gap-16 px-margin-listing pb-14 lg:px-margin">
            {sidebarOpen && (
              <aside aria-label="Diamond filters" className="hidden w-66.5 shrink-0 lg:block">
                <DiamondFilters value={listing.filters} onChange={listing.setFilters} />
              </aside>
            )}
            <div className="flex min-w-0 flex-1 flex-col gap-10">
              {results.length > 0 ? (
                <ul aria-busy={loading} className={cn("grid grid-flow-row-dense grid-cols-2 gap-x-card-gap gap-y-6 lg:gap-y-8", cols === 3 ? "lg:grid-cols-3" : "lg:grid-cols-4")}>
                  {pageItems.map((d, i) => (
                    <Fragment key={d.id}>
                      {/* Banner after the first desktop row; on mobile, dense flow pulls the next tile up beside it. */}
                      {catalog.banner && page === 1 && i === cols && (
                        <li className="col-span-full">
                          <FourCsBanner />
                        </li>
                      )}
                      <li className="min-w-0">
                        <TileLoading loading={loading} skeleton={<StoneTileSkeleton />}>
                          <StoneTile diamond={d} onOpen={onOpen} title={tileTitle?.(d)} />
                        </TileLoading>
                      </li>
                    </Fragment>
                  ))}
                </ul>
              ) : (
                <div className="flex flex-col items-center gap-4 border border-border-subtle px-6 py-12 text-center">
                  <p className="type-h4 text-primary">No matching {catalog.hero.type.value === "gemstone" ? "gemstones" : "diamonds"}</p>
                  <p className="max-w-md text-sm leading-5 text-muted-foreground">
                    No {catalog.hero.type.value === "gemstone" ? "gemstones" : "diamonds"} match all of these filters. Widen the price or {catalog.size.label.toLowerCase()} range, or clear your filters to see more.
                  </p>
                  <Button variant="outline" onClick={listing.clearAll}>
                    Clear All Filters
                  </Button>
                </div>
              )}
              {results.length > 0 && (
                <div className="flex flex-col items-center gap-6 border-t border-border-subtle pt-8">
                  <Pagination
                    page={page}
                    pageCount={pageCount}
                    onPage={(p) => {
                      listing.setPage(p)
                      document.getElementById(RESULTS_ID)?.scrollIntoView({ block: "start" })
                    }}
                  />
                </div>
              )}
            </div>
          </div>
        </div>

        <SeoIntroBlock />
        <FaqBlock />
        <NeedHelpBlock />
        <RelatedArticlesBlock />
        <RelatedCategoriesBlock />
        <ProductCarousel title="Pick Up Where You Left Off" products={RECENTLY_VIEWED} showWishlist className="border-t border-border-subtle" contained />
      </main>
      <SiteFooter contained />
      <MobileBottomNav shopInTest={shopInTest} />
      <GlpMobileFilterDrawer listing={listing} open={drawerOpen} onClose={() => setDrawerOpen(false)} />
    </div>
    </GlpCatalogProvider>
  )
}
