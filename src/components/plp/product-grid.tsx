import { Fragment, useState } from "react"
import { CaretLeftIcon, CaretRightIcon } from "@phosphor-icons/react"
import { Button } from "@/components/ui/button"
import { useNavigate } from "react-router"
import { useNotInTest } from "@/components/prototype/not-in-test"
import { ProductTileSkeleton, TileLoading } from "@/components/shared/tile-skeletons"
import { ELLA_CATHEDRAL, type MetalId } from "@/data/products"
import { useFlow } from "@/flow/flow-context"
import { useFilterLoading } from "@/lib/use-filter-loading"
import { useRingBuild } from "@/state/ring-build"
import { cn } from "@/lib/utils"
import { PlpProductCard } from "./plp-product-card"
import { RingPickedModal, type PickedRing } from "./ring-picked-modal"
import type { Listing } from "./use-listing"

/** "Find Your Ring Style" in-grid content banner (Figma In-Grid Content Banner). */
function InGridBanner() {
  const notInTest = useNotInTest()
  return (
    <div className="relative isolate col-span-full flex min-h-116 flex-col justify-end overflow-hidden p-6 text-primary-foreground lg:min-h-34 lg:flex-row lg:items-center lg:justify-between lg:px-16 lg:py-6">
      <img src="/images/plp/content/style-banner.jpg" alt="" className="absolute inset-0 -z-20 size-full object-cover object-[50%_42%]" loading="lazy" />
      <div aria-hidden className="absolute inset-0 -z-10 bg-linear-to-t from-black/60 to-transparent lg:bg-linear-to-r" />
      <div className="flex flex-col gap-2">
        <p className="type-h3 lg:type-h4">Find Your Ring Style</p>
        <p className="text-sm leading-5">Explore the details that make each engagement ring style unique.</p>
      </div>
      <Button
        variant="link"
        className="mt-4 self-start text-primary-foreground lg:hidden"
        onClick={() => notInTest("The style guide")}
      >
        Style Guide
      </Button>
      <Button
        variant="secondary"
        className="hidden w-49 bg-background text-primary hover:bg-secondary lg:inline-flex"
        onClick={() => notInTest("The style guide")}
      >
        Style Guide
      </Button>
    </div>
  )
}

/** Numbered pagination (1 2 3 … n) with previous/next carets. Shared with the diamond GLP. */
export function Pagination({ page, pageCount, onPage }: { page: number; pageCount: number; onPage: (p: number) => void }) {
  if (pageCount <= 1) return null
  // 1 2 3 … n, keeping the current page and its neighbours visible.
  const pages = Array.from({ length: pageCount }, (_, i) => i + 1).filter(
    (p) => p === 1 || p === pageCount || Math.abs(p - page) <= 1,
  )
  return (
    <nav aria-label="Pagination" className="flex items-center justify-center gap-1">
      <Button variant="ghost" size="icon-sm" aria-label="Previous page" disabled={page === 1} onClick={() => onPage(page - 1)}>
        <CaretLeftIcon />
      </Button>
      {pages.map((p, i) => (
        <Fragment key={p}>
          {i > 0 && p - pages[i - 1] > 1 && <span className="px-1 text-sm text-muted-foreground">…</span>}
          <button
            type="button"
            aria-current={p === page ? "page" : undefined}
            onClick={() => onPage(p)}
            className={cn(
              "flex size-8 cursor-pointer items-center justify-center text-sm leading-5 text-primary",
              p === page ? "border border-primary font-semibold" : "hover:bg-secondary",
            )}
          >
            {p}
          </button>
        </Fragment>
      ))}
      <Button variant="ghost" size="icon-sm" aria-label="Next page" disabled={page === pageCount} onClick={() => onPage(page + 1)}>
        <CaretRightIcon />
      </Button>
    </nav>
  )
}

/** Product grid, in-grid banner after the first row, pagination, and the no-results state. */
export function ProductGrid({ listing, wide }: { listing: Listing; wide: boolean }) {
  const { pageItems, page, pageCount, results, mode } = listing
  // Any filter or sort change shows skeleton tiles for a second, as if the grid were refreshing.
  const loading = useFilterLoading(JSON.stringify([listing.filters, listing.sort]))
  const flow = useFlow()
  const navigate = useNavigate()
  const { setSettingMetal, setShape } = useRingBuild()

  /**
   * Full flow: every setting opens the Ella Cathedral PDP (the only setting with full PDP data), in the
   * card's metal when Ella comes in it, previewing the first shape the listing is filtered by.
   */
  const openSetting =
    flow && mode === "dyo"
      ? (metalId: string) => {
          const ella = ELLA_CATHEDRAL.variants.find((v) => v.metal === metalId)
          setSettingMetal((ella?.metal ?? ELLA_CATHEDRAL.defaultMetal) as MetalId)
          const shape = listing.filters.shape.find((s) => ELLA_CATHEDRAL.shapes.includes(s))
          setShape(shape ?? null)
          navigate(flow.path("/setting"))
          window.scrollTo({ top: 0 })
        }
      : undefined

  // Standalone PLP prototypes have no product page: a click asks if this is the ring, ending the task.
  const [picked, setPicked] = useState<PickedRing | null>(null)
  const priceLabel = mode === "dyo" ? "Setting only" : undefined
  const pricePrefix = mode === "rts" ? "Starting at" : undefined

  if (results.length === 0) {
    return (
      <div className="flex flex-col items-center gap-4 border border-border-subtle px-6 py-12 text-center">
        <p className="type-h4 text-primary">No matching rings</p>
        <p className="max-w-md text-sm leading-5 text-muted-foreground">
          No {mode === "dyo" ? "settings" : "rings"} match all of these filters. Remove a filter or clear them all to see more.
        </p>
        <Button variant="outline" onClick={listing.clearAll}>
          Clear All Filters
        </Button>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-10">
      <RingPickedModal
        picked={picked}
        preferredShapes={listing.filters.shape}
        priceLabel={priceLabel}
        pricePrefix={pricePrefix}
        onClose={() => setPicked(null)}
      />
      <ul aria-busy={loading} className={cn("grid grid-flow-row-dense grid-cols-2 gap-x-card-gap gap-y-6 lg:gap-y-8", wide ? "lg:grid-cols-4" : "lg:grid-cols-3")}>
        {pageItems.map((p, i) => (
          <Fragment key={p.id}>
            {/* Banner after the first desktop row; on mobile, dense flow moves card 4 up beside card 3. */}
            {page === 1 && i === 3 && pageItems.length > 4 && (
              <li className="col-span-full">
                <InGridBanner />
              </li>
            )}
            <li className="min-w-0">
              <TileLoading loading={loading} skeleton={<ProductTileSkeleton />}>
                <PlpProductCard
                  product={p}
                  priceLabel={priceLabel}
                  pricePrefix={pricePrefix}
                  preferredShapes={listing.filters.shape}
                  onOpen={openSetting ?? (flow ? undefined : (metalId) => setPicked({ product: p, metalId }))}
                />
              </TileLoading>
            </li>
          </Fragment>
        ))}
      </ul>
      <div className="flex flex-col items-center gap-6 border-t border-border-subtle pt-8">
        <Pagination
          page={page}
          pageCount={pageCount}
          onPage={(p) => {
            listing.setPage(p)
            document.getElementById("plp-results")?.scrollIntoView({ block: "start" })
          }}
        />
      </div>
    </div>
  )
}
