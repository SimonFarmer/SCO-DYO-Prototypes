import { useEffect, useState } from "react"
import { DyoStepper } from "@/components/dyo/dyo-stepper"
import { BelowGridContent } from "@/components/plp/below-grid"
import { CollectionHero } from "@/components/plp/collection-hero"
import { DesktopFilterBar, MobileFilterBar } from "@/components/plp/filter-controls"
import { FilterPanel } from "@/components/plp/filter-panel"
import { MobileFilterDrawer } from "@/components/plp/mobile-filter-drawer"
import { ProductGrid } from "@/components/plp/product-grid"
import { useListing } from "@/components/plp/use-listing"
import { MobileBottomNav } from "@/components/site/mobile-bottom-nav"
import { SiteFooter } from "@/components/site/site-footer"
import { SiteHeader } from "@/components/site/site-header"
import { filterCount } from "@/data/plp"

/**
 * Engagement Ring PLP: DYO step 1 (choose a setting), or Ready to Ship preset rings.
 * Figma SCO Drop 3b – Customizer › "Engagement Ring PLP" (desktop 7845:197922, mobile 7845:198032).
 */
export function EngagementRingPlp() {
  const listing = useListing()
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const { mode, collection } = listing

  useEffect(() => {
    document.title = `${mode === "rts" ? "Ready to Ship Engagement Rings" : collection?.title ?? "Engagement Rings"} | Shane Co.`
  }, [mode, collection])

  return (
    <div className="min-h-svh bg-background">
      <SiteHeader navigation />
      <main>
        <CollectionHero listing={listing} />
        {/* Ready to Ship is outside Design Your Own, so it has no progress stepper. */}
        {mode === "dyo" && <DyoStepper current={1} showTotal={false} mobileTone="accent" />}

        <div id="plp-results" className="scroll-mt-(--header-offset)">
          <DesktopFilterBar listing={listing} sidebarOpen={sidebarOpen} onToggleSidebar={() => setSidebarOpen((o) => !o)} />
          <MobileFilterBar listing={listing} activeCount={filterCount(listing.filters)} onOpenFilters={() => setDrawerOpen(true)} />

          <div className="flex gap-16 px-margin-listing pb-14 lg:px-margin">
            {sidebarOpen && (
              <aside aria-label="Filters" className="hidden w-66.5 shrink-0 lg:block">
                <FilterPanel
                  mode={mode}
                  filters={listing.filters}
                  bounds={listing.bounds}
                  onToggle={listing.toggle}
                  onFulfil={listing.setFulfil}
                  onPrice={listing.setPrice}
                  onChange={(next) => listing.setFilters(next)}
                />
              </aside>
            )}
            <div className="min-w-0 flex-1">
              <ProductGrid listing={listing} wide={!sidebarOpen} />
            </div>
          </div>
        </div>

        <BelowGridContent />
      </main>
      <SiteFooter />
      <MobileBottomNav />
      <MobileFilterDrawer listing={listing} open={drawerOpen} onClose={() => setDrawerOpen(false)} />
    </div>
  )
}
