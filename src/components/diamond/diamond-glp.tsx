import { Fragment, useMemo, useRef, useState } from "react"
import { ArrowLeftIcon, ArrowRightIcon, CaretRightIcon, FadersHorizontalIcon } from "@phosphor-icons/react"
import { ChevronDown, Ellipsis } from "lucide-react"
import { useNotInTest } from "@/components/prototype/not-in-test"
import { DiamondFilters } from "@/components/diamond/diamond-filters"
import {
  FaqBlock,
  NeedHelpBlock,
  RelatedArticlesBlock,
  RelatedCategoriesBlock,
  SeoIntroBlock,
} from "@/components/diamond/glp-content-blocks"
import { StoneTile } from "@/components/diamond/stone-tile"
import { DyoStepper } from "@/components/dyo/dyo-stepper"
import { ProductCarousel } from "@/components/shared/product-carousel"
import { SiteFooter } from "@/components/site/site-footer"
import { SiteHeader } from "@/components/site/site-header"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { DIAMONDS, INVENTORY_COUNT, SHAPES, shapeIcon, type Diamond, type Shape } from "@/data/diamonds"
import { NO_FILTERS, appliedFilters, matchesFilters, type DiamondFilterState } from "@/lib/diamond-filters"
import { RECENTLY_VIEWED } from "@/data/products"
import { useScrollOverflow } from "@/lib/hooks"
import { cn } from "@/lib/utils"

const PAGE_SIZE = 24

type Sort = "popular" | "price-asc" | "price-desc" | "carat-desc"
const SORTS: Record<Sort, string> = {
  popular: "Popular",
  "price-asc": "Price: Low to High",
  "price-desc": "Price: High to Low",
  "carat-desc": "Carat: High to Low",
}

/* ───────────────────────── Collection hero ───────────────────────── */

function CollectionHero({ shapes, onShape }: { shapes: Shape[]; onShape: (s: Shape) => void }) {
  const notInTest = useNotInTest()
  const rail = useRef<HTMLDivElement>(null)
  const { overflows, canPrev, canNext } = useScrollOverflow(rail)
  const scroll = (dir: 1 | -1) => rail.current?.scrollBy({ left: dir * 368, behavior: "smooth" })
  return (
    <section className="flex flex-col gap-5 bg-secondary px-margin pt-5 pb-10">
      <nav aria-label="Breadcrumb" className="flex items-center gap-2.5 type-caption">
        {["Home", "Diamonds"].map((item) => (
          <Fragment key={item}>
            <button type="button" onClick={() => notInTest(item)} className="cursor-pointer text-muted-foreground hover:text-foreground">
              {item}
            </button>
            <CaretRightIcon className="size-4 text-muted-foreground" />
          </Fragment>
        ))}
        <span aria-current="page" className="text-foreground">
          Natural Diamonds
        </span>
      </nav>
      <div className="flex flex-col gap-8 lg:flex-row lg:gap-16">
        {/* Figma: 432px header column with a right rule. */}
        <div className="flex shrink-0 flex-col gap-5 border-border-subtle pb-7 lg:w-guided-intent lg:border-r lg:pr-16">
          <h1 className="type-h2 font-medium text-primary">Natural Diamonds</h1>
          <p className="text-base text-primary">
            Hand-selected, GIA-certified loose diamonds in a wide range of shapes and sizes. Choose the one that’s right for your ring.
          </p>
        </div>
        <div className="flex min-w-0 flex-1 flex-col gap-2">
          <p className="type-label-xs font-semibold text-primary">Explore by</p>
          <div className="flex flex-col gap-5">
            <div role="tablist" className="flex gap-4">
              {["Shape", "Cut", "Clarity", "Color"].map((tab, i) => (
                <button
                  key={tab}
                  type="button"
                  role="tab"
                  aria-selected={i === 0}
                  onClick={() => i > 0 && notInTest(`Exploring by ${tab.toLowerCase()}`)}
                  className={cn(
                    "h-10 cursor-pointer pb-2 type-h4 font-medium",
                    i === 0 ? "border-b-w-300 border-primary text-primary" : "text-muted-foreground hover:text-primary",
                  )}
                >
                  {tab}
                </button>
              ))}
            </div>
            <p className="text-sm text-primary">
              Shape is often the first step in choosing a diamond. Each shape has its own character, from the timeless brilliance of
              Round to the distinctive elegance of Oval, Emerald and Pear.
            </p>
            <div ref={rail} className="flex gap-1 overflow-x-auto [scrollbar-width:none]">
              {SHAPES.map((shape) => {
                const on = shapes.includes(shape)
                return (
                  <button
                    key={shape}
                    type="button"
                    aria-pressed={on}
                    onClick={() => onShape(shape)}
                    className={cn(
                      "flex size-22 shrink-0 cursor-pointer flex-col items-center justify-center gap-2.5 border bg-background p-3 hover:border-primary",
                      on ? "border-primary" : "border-border-subtle",
                    )}
                  >
                    <img src={shapeIcon(shape)} alt="" className="size-8" />
                    {/* Figma: 10px label — closest type token text-xxs (11px). */}
                    <span className="text-xxs leading-3 font-semibold tracking-[1px] text-muted-foreground uppercase">{shape}</span>
                  </button>
                )
              })}
            </div>
            {/* Controls only when the shapes don't all fit (wide screens show every shape). */}
            {overflows && (
              <div className="flex justify-end gap-2">
                <Button variant="outline" size="icon" aria-label="Previous shapes" disabled={!canPrev} onClick={() => scroll(-1)}>
                  <ArrowLeftIcon />
                </Button>
                <Button variant="outline" size="icon" aria-label="More shapes" disabled={!canNext} onClick={() => scroll(1)}>
                  <ArrowRightIcon />
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}

/* ───────────────────────── In-grid banner ───────────────────────── */

function FourCsBanner() {
  const notInTest = useNotInTest()
  return (
    <div className="col-span-full py-2">
      <div className="relative flex flex-wrap items-center gap-x-10 gap-y-6 overflow-clip px-margin py-10">
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

/* ───────────────────────── Pagination ───────────────────────── */

function Pagination({ pages }: { pages: number }) {
  const notInTest = useNotInTest()
  if (pages <= 1) return null
  const shown = pages <= 5 ? Array.from({ length: pages }, (_, i) => i + 1) : [1, 2, 3, 0, pages]
  const go = () => notInTest("Browsing more pages")
  return (
    <nav aria-label="Pagination" className="flex items-start justify-center gap-1">
      {shown.map((p, i) =>
        p === 0 ? (
          <span key={`gap-${i}`} className="flex size-9 items-center justify-center text-primary">
            <Ellipsis className="size-4" />
          </span>
        ) : (
          <button
            key={p}
            type="button"
            aria-current={p === 1 ? "page" : undefined}
            onClick={p === 1 ? undefined : go}
            className={cn(
              "flex size-9 cursor-pointer items-center justify-center text-xxs leading-5 font-semibold tracking-[1px] text-primary",
              p === 1 && "border border-border-subtle bg-background",
            )}
          >
            {p}
          </button>
        ),
      )}
      <button type="button" onClick={go} className="flex h-9 cursor-pointer items-center gap-1 px-2.5 py-2 text-xxs leading-5 font-semibold tracking-[1px] text-primary uppercase">
        Next
        <CaretRightIcon className="size-4" />
      </button>
    </nav>
  )
}

/* ───────────────────────── Page ───────────────────────── */

/**
 * Natural Diamonds GLP — DYO step 2 (Figma “Diamond GLP — DYO Step 3”, 7375:125910).
 * Same page for both Test 3.1 variants; `onOpen` decides whether a tile opens the PDP or the Quickview.
 */
export function DiamondGlp({ onOpen }: { onOpen: (d: Diamond) => void }) {
  const notInTest = useNotInTest()
  const [filters, setFilters] = useState<DiamondFilterState>(NO_FILTERS)
  const [showFilters, setShowFilters] = useState(true)
  const [sort, setSort] = useState<Sort>("popular")

  const results = useMemo(() => {
    const list = DIAMONDS.filter((d) => matchesFilters(d, filters))
    if (sort === "price-asc") list.sort((a, b) => a.price - b.price)
    if (sort === "price-desc") list.sort((a, b) => b.price - a.price)
    if (sort === "carat-desc") list.sort((a, b) => b.carat - a.carat)
    return list
  }, [filters, sort])

  // Unfiltered, the 24 stones stand in for page 1 of the 5,295-stone inventory. Once a filter is
  // on, the count is the real number of matches (one page), so counts and tiles always agree.
  const filtered = appliedFilters(filters).length > 0
  const total = filtered ? results.length : INVENTORY_COUNT
  const pages = Math.ceil(total / PAGE_SIZE)
  const toggleShape = (shape: Shape) =>
    setFilters((f) => ({ ...f, shapes: f.shapes.includes(shape) ? f.shapes.filter((s) => s !== shape) : [...f.shapes, shape] }))
  const cols = showFilters ? 3 : 4

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <DyoStepper current={2} />
      <main>
        <CollectionHero shapes={filters.shapes} onShape={toggleShape} />

        <div className="flex flex-wrap items-center gap-6 bg-primary-foreground px-margin py-7">
          <button
            type="button"
            aria-expanded={showFilters}
            onClick={() => setShowFilters((s) => !s)}
            className="flex h-10 cursor-pointer items-center gap-2 type-label-xs font-semibold text-primary"
          >
            <FadersHorizontalIcon className="size-4" />
            {showFilters ? "Hide Filters" : "Show Filters"}
          </button>
          <span aria-hidden className="h-6 w-px bg-border-subtle" />
          <div className="flex gap-2">
            <Button variant="outline" className="h-10 rounded-full border-primary px-5" aria-pressed>
              Natural Diamonds
            </Button>
            <Button variant="outline" className="h-10 rounded-full px-5" onClick={() => notInTest("Lab-grown diamonds")}>
              Lab-Grown Diamonds
            </Button>
            <Button variant="outline" className="h-10 rounded-full px-5" onClick={() => notInTest("Gemstones")}>
              Gemstones
            </Button>
          </div>
          <div className="flex flex-1 items-center justify-end gap-6">
            <p className="text-xs tracking-[0.12px] text-muted-foreground" aria-live="polite">
              Showing <span className="font-semibold">{results.length}</span> of{" "}
              <span className="font-semibold">{total.toLocaleString("en-US")} Items</span>
            </p>
            <span aria-hidden className="h-6 w-px bg-border-subtle" />
            <DropdownMenu>
              <DropdownMenuTrigger render={<Button variant="ghost" className="h-10 gap-2 px-0 hover:bg-transparent" />}>
                Sort by: {SORTS[sort]}
                <ChevronDown />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-52">
                {(Object.keys(SORTS) as Sort[]).map((key) => (
                  <DropdownMenuItem key={key} onClick={() => setSort(key)}>
                    {SORTS[key]}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        <div className={cn("grid gap-16 px-margin pb-10", showFilters && "lg:grid-cols-[266px_1fr]")}>
          {showFilters && (
            <aside aria-label="Diamond filters">
              <DiamondFilters value={filters} onChange={setFilters} />
            </aside>
          )}
          <div className="flex min-w-0 flex-col gap-12">
            {results.length > 0 ? (
              <div className={cn("grid grid-cols-2 gap-x-2 gap-y-4", cols === 3 ? "lg:grid-cols-3" : "lg:grid-cols-4")}>
                {results.map((d, i) => (
                  <Fragment key={d.id}>
                    <StoneTile diamond={d} onOpen={onOpen} />
                    {i === cols - 1 && <FourCsBanner />}
                  </Fragment>
                ))}
                {results.length < cols && <FourCsBanner />}
              </div>
            ) : (
              <div className="flex flex-col items-center gap-4 bg-secondary px-6 py-12 text-center">
                <p className="type-h5 text-primary">No diamonds match your filters</p>
                <p className="text-sm text-muted-foreground">Try widening the price or carat range, or clear your filters.</p>
                <Button onClick={() => setFilters(NO_FILTERS)}>Clear Filter(s)</Button>
              </div>
            )}
            <span aria-hidden className="h-px bg-muted" />
            <Pagination pages={pages} />
          </div>
        </div>

        <SeoIntroBlock />
        <FaqBlock />
        <NeedHelpBlock />
        <RelatedArticlesBlock />
        <RelatedCategoriesBlock />
        <ProductCarousel title="Pick Up Where You Left Off" products={RECENTLY_VIEWED} showWishlist className="border-t border-border-subtle" />
      </main>
      <SiteFooter />
    </div>
  )
}
