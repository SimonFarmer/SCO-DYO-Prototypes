import { Fragment, useEffect, useMemo, useRef, useState } from "react"
import { useNavigate, useSearchParams } from "react-router"
import { ArrowLeftIcon, ArrowRightIcon, CaretDownIcon, CaretLeftIcon, SlidersHorizontalIcon, XIcon } from "@phosphor-icons/react"
import { DyoStepper } from "@/components/dyo/dyo-stepper"
import { BelowGridContent } from "@/components/plp/below-grid"
import { Pagination } from "@/components/plp/product-grid"
import { useNotInTest } from "@/components/prototype/not-in-test"
import { Breadcrumb } from "@/components/site/breadcrumb"
import { MobileBottomNav } from "@/components/site/mobile-bottom-nav"
import { SiteFooter } from "@/components/site/site-footer"
import { SiteHeader } from "@/components/site/site-header"
import { DiamondCard } from "@/components/stones/diamond-card"
import { DiamondFilterPanel, type PresetId } from "@/components/stones/diamond-filters"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet"
import {
  STONE_SHAPES,
  STONE_TYPES,
  emptyStoneFilters,
  filterStones,
  gradesFor,
  stoneType,
  type LooseStone,
  type StoneFilters,
  type StoneTypeId,
} from "@/data/stones"
import { useIsDesktop } from "@/lib/hooks"
import { cn } from "@/lib/utils"
import { useStonePrefs } from "./preferences"

const PAGE_SIZE = 24

const SORTS = [
  { id: "popular", label: "Popular" },
  { id: "price-asc", label: "Price: Low to High" },
  { id: "price-desc", label: "Price: High to Low" },
  { id: "carat-desc", label: "Carat: High to Low" },
]

const SORTERS: Record<string, (a: LooseStone, b: LooseStone) => number> = {
  popular: (a, b) => b.popularity - a.popularity,
  "price-asc": (a, b) => a.price - b.price,
  "price-desc": (a, b) => b.price - a.price,
  "carat-desc": (a, b) => b.carat - a.carat,
}

const INTRO: Record<StoneTypeId, string> = {
  natural: "Hand-selected, GIA-certified loose diamonds in a wide range of shapes and sizes. Choose the one that’s right for your ring.",
  lab: "IGI-certified lab-grown diamonds: the same sparkle and hardness as natural diamonds, at a lower price per carat.",
  gemstone: "Hand-selected blue sapphires in classic and fancy shapes. Choose the one that’s right for your ring.",
}

type ExploreTab = "shape" | "cut" | "clarity" | "color"

const EXPLORE_COPY: Record<ExploreTab, string> = {
  shape: "Shape is often the first step in choosing a diamond. Each shape has its own character, from the timeless brilliance of Round to the distinctive elegance of Oval, Emerald and Pear.",
  cut: "Cut is how well a diamond’s facets return light. The better the cut, the more it sparkles at any size.",
  clarity: "Clarity grades the tiny natural marks inside a diamond. Most are invisible to the eye from SI1 up.",
  color: "Color runs from D (colorless) to M (warm). Near-colorless grades G–J look white once set.",
}

/** "Explore by" carousel in the hero (Figma "Collection Hero Content / Shape"). Tiles apply filters. */
function ExploreBy({ filters, onChange }: { filters: StoneFilters; onChange: (f: StoneFilters) => void }) {
  const [tab, setTab] = useState<ExploreTab>("shape")
  const rail = useRef<HTMLUListElement>(null)
  const g = gradesFor(filters.type)
  const tabs: ExploreTab[] = filters.type === "gemstone" ? ["shape", "color"] : ["shape", "cut", "clarity", "color"]

  const items =
    tab === "shape"
      ? STONE_SHAPES.map((s) => ({ key: s.id, label: s.label, icon: s.icon, on: filters.shapes.includes(s.id), apply: () => onChange({ ...filters, shapes: filters.shapes.includes(s.id) ? filters.shapes.filter((x) => x !== s.id) : [...filters.shapes, s.id] }) }))
      : tab === "cut"
        ? [...g.cut].map((c, i) => ({ key: c.label, label: c.label, icon: undefined, on: filters.cuts.length === 1 && filters.cuts[0] === i, apply: () => onChange({ ...filters, cuts: [i] }) })).reverse()
        : (tab === "color" ? g.color : g.clarity)
            .map((c, i) => {
              const cur = tab === "color" ? filters.color : filters.clarity
              return { key: c.label, label: c.label, icon: undefined, on: !!cur && cur[0] === i && cur[1] === i, apply: () => onChange({ ...filters, [tab]: [i, i] }) }
            })
            .reverse()

  const scroll = (dir: 1 | -1) => rail.current?.scrollBy({ left: dir * 368, behavior: "smooth" })

  return (
    <div className="flex min-w-0 flex-col gap-2">
      <p className="type-label-xs text-primary">Explore by</p>
      <div className="flex flex-col gap-5">
        <div role="tablist" className="flex gap-4">
          {tabs.map((t) => (
            <button
              key={t}
              type="button"
              role="tab"
              aria-selected={tab === t}
              onClick={() => setTab(t)}
              className={cn(
                "h-10 cursor-pointer pb-2 type-h4 capitalize",
                tab === t ? "border-b-2 border-primary text-primary" : "text-muted-foreground hover:text-primary",
              )}
            >
              {t}
            </button>
          ))}
        </div>
        <p className="text-sm leading-5 text-primary">{EXPLORE_COPY[tab]}</p>
        <ul ref={rail} className="flex gap-1 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {items.map((it) => (
            <li key={it.key}>
              <button
                type="button"
                aria-pressed={it.on}
                onClick={it.apply}
                className={cn(
                  "flex size-22 shrink-0 cursor-pointer flex-col items-center justify-center gap-2.5 border bg-background px-1 py-3",
                  it.on ? "border-primary" : "border-input hover:border-border",
                )}
              >
                {it.icon ? <img src={it.icon} alt="" className="size-8" /> : <span className="type-h4 text-primary">{it.label.split(" ")[0]}</span>}
                <span className="max-w-full truncate text-xxs leading-3 font-semibold tracking-[1px] text-muted-foreground uppercase">{it.label}</span>
              </button>
            </li>
          ))}
        </ul>
        <div className="hidden justify-end gap-2 lg:flex">
          <Button variant="outline" size="icon" className="border-input" aria-label="Scroll left" onClick={() => scroll(-1)}>
            <ArrowLeftIcon />
          </Button>
          <Button variant="outline" size="icon" className="border-input" aria-label="Scroll right" onClick={() => scroll(1)}>
            <ArrowRightIcon />
          </Button>
        </div>
      </div>
    </div>
  )
}

/** "Understand the 4Cs" in-grid banner (Figma In-Grid Content Banner). */
function FourCsBanner() {
  const notInTest = useNotInTest()
  return (
    <div className="relative isolate flex min-h-80 flex-col justify-end gap-6 overflow-hidden p-6 text-primary-foreground lg:min-h-34 lg:flex-row lg:items-center lg:justify-between lg:px-16 lg:py-10">
      <img src="/images/product-details/lifestyle-hand.png" alt="" loading="lazy" className="absolute inset-0 -z-20 size-full object-cover object-[50%_45%]" />
      <div aria-hidden className="absolute inset-0 -z-10 bg-linear-to-t from-black/60 to-transparent lg:bg-linear-to-r lg:from-black/50" />
      <div className="flex max-w-108 flex-col gap-2">
        <p className="font-heading text-2xl leading-[1.2] font-medium tracking-[-0.6px]">Understand the 4Cs</p>
        <p className="text-sm leading-5">How cut, color, clarity and carat work together, and where to spend your budget.</p>
      </div>
      <Button variant="secondary" className="self-start bg-background px-14 text-primary hover:bg-secondary lg:self-center" onClick={() => notInTest("The diamond guide")}>
        Diamond Guide
      </Button>
    </div>
  )
}

function TypeChips({ value, onChange, compact }: { value: StoneTypeId; onChange: (t: StoneTypeId) => void; compact?: boolean }) {
  return (
    <div className={cn("flex gap-2", compact && "-mx-margin overflow-x-auto px-margin [scrollbar-width:none]")}>
      {STONE_TYPES.map((t) => (
        <button
          key={t.id}
          type="button"
          aria-pressed={t.id === value}
          onClick={() => onChange(t.id)}
          className={cn(
            "flex h-10 shrink-0 cursor-pointer items-center rounded-full border bg-background px-5 type-label-xs whitespace-nowrap text-primary",
            t.id === value ? "border-primary" : "border-input hover:border-border",
          )}
        >
          {t.plpLabel}
        </button>
      ))}
    </div>
  )
}

function SortMenu({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="flex h-10 cursor-pointer items-center gap-2 type-label-xs whitespace-nowrap text-primary">
        Sort by: {SORTS.find((s) => s.id === value)?.label}
        <CaretDownIcon className="size-4" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuRadioGroup value={value} onValueChange={(v) => onChange(v as string)}>
          {SORTS.map((s) => (
            <DropdownMenuRadioItem key={s.id} value={s.id} className="py-2 text-sm">
              {s.label}
            </DropdownMenuRadioItem>
          ))}
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

/**
 * Test 2 · Diamonds PLP (the GLP). Figma 7685:399664.
 * Opens with stone type, shape, carat (and price, for the budget variants) preset from Stone
 * Preferences, so "View All (N)" and "Showing … of N" match. Back returns to the page it came from.
 */
export function Test2DiamondsPlp() {
  const navigate = useNavigate()
  const isDesktop = useIsDesktop()
  const [params] = useSearchParams()
  const { variant, filters: preset, query } = useStonePrefs()
  const from = params.get("from") === "recs" ? "recs" : "prefs"

  const [filters, setFiltersState] = useState<StoneFilters>(preset)
  const [presetId, setPresetId] = useState<PresetId | null>(null)
  const [sort, setSort] = useState("popular")
  const [page, setPage] = useState(1)
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [drawerOpen, setDrawerOpen] = useState(false)

  const setFilters = (f: StoneFilters) => {
    setFiltersState(f)
    setPage(1)
  }

  // A new type has different price and grade scales: keep shape and carat, reset the rest.
  const setType = (type: StoneTypeId) => {
    if (type === filters.type) return
    setPresetId(null)
    setFilters({ ...emptyStoneFilters(type), shapes: filters.shapes, minCarat: filters.minCarat, maxCarat: filters.maxCarat })
  }

  const results = useMemo(() => filterStones(filters).sort(SORTERS[sort]), [filters, sort])
  const pageCount = Math.max(1, Math.ceil(results.length / PAGE_SIZE))
  const current = Math.min(page, pageCount)
  const pageItems = results.slice((current - 1) * PAGE_SIZE, current * PAGE_SIZE)
  const title = stoneType(filters.type).plpLabel

  // Arriving from 2a/2b starts at the top of the listing page.
  useEffect(() => {
    window.scrollTo({ top: 0 })
  }, [])

  useEffect(() => {
    const previous = document.title
    document.title = `${title} | Shane Co.`
    return () => {
      document.title = previous
    }
  }, [title])

  const back = () => navigate(from === "recs" ? `/test-2/recommendations${query()}` : `/test-2${query()}`)
  const count = (
    <p className="type-caption whitespace-nowrap text-muted-foreground" aria-live="polite">
      Showing <span className="font-semibold text-primary">{pageItems.length}</span> of{" "}
      <span className="font-semibold text-primary">{results.length.toLocaleString("en-US")} Items</span>
    </p>
  )
  const panel = (
    <DiamondFilterPanel filters={filters} onChange={setFilters} preset={presetId} onPreset={setPresetId} />
  )

  return (
    <div className="min-h-svh bg-background" data-variant={variant.id}>
      <SiteHeader navigation />
      <DyoStepper current={2} mobileLabel="Stone" showTotal={false} />
      <main>
        {/* Collection hero (Figma "Collection Hero") */}
        <section className="flex flex-col gap-5 bg-secondary px-margin pt-5 pb-10">
          <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-2">
            <Breadcrumb items={["Home", "Diamonds", title]} className="p-0" />
            <button type="button" onClick={back} className="flex h-6 cursor-pointer items-center gap-0.5 type-label-xs text-primary underline">
              <CaretLeftIcon className="size-4" />
              {from === "recs" ? "Back to your recommendations" : "Back to stone preferences"}
            </button>
          </div>
          <div className="flex flex-col gap-8 lg:flex-row lg:gap-16">
            <div className="flex flex-col gap-5 lg:w-108 lg:shrink-0 lg:border-r lg:border-input lg:pr-16 lg:pb-7">
              <h1 className="type-h2 text-primary max-lg:type-h3">{title}</h1>
              <p className="text-base leading-6 text-primary">{INTRO[filters.type]}</p>
            </div>
            <ExploreBy filters={filters} onChange={setFilters} />
          </div>
        </section>

        <div id="plp-results" className="scroll-mt-(--header-offset)">
          {/* Desktop filter bar (Figma "Filter.Controls") */}
          <div className="hidden items-center gap-6 px-margin py-7 lg:flex">
            <button
              type="button"
              onClick={() => setSidebarOpen((o) => !o)}
              aria-expanded={sidebarOpen}
              className="flex h-10 shrink-0 cursor-pointer items-center gap-2 type-label-xs text-primary"
            >
              <SlidersHorizontalIcon className="size-4" />
              {sidebarOpen ? "Hide Filters" : "Show Filters"}
            </button>
            <span aria-hidden className="h-6 w-px shrink-0 bg-input" />
            <div className="min-w-0 flex-1">
              <TypeChips value={filters.type} onChange={setType} />
            </div>
            {count}
            <span aria-hidden className="h-6 w-px shrink-0 bg-input" />
            <SortMenu value={sort} onChange={(s) => { setSort(s); setPage(1) }} />
          </div>

          {/* Mobile filter bar */}
          <div className="flex flex-col gap-3 px-margin py-8 lg:hidden">
            <button
              type="button"
              onClick={() => setDrawerOpen(true)}
              className="flex h-10 w-full cursor-pointer items-center justify-center gap-2 border border-border-subtle type-label-xs text-primary"
            >
              <SlidersHorizontalIcon className="size-4" />
              Filter &amp; Sort
            </button>
            <TypeChips value={filters.type} onChange={setType} compact />
            {count}
          </div>

          <div className="flex gap-16 px-margin-listing pb-14 lg:px-margin">
            {sidebarOpen && isDesktop && (
              <aside aria-label="Filters" className="w-66.5 shrink-0">
                {panel}
              </aside>
            )}
            <div className="min-w-0 flex-1">
              {results.length === 0 ? (
                <div className="flex flex-col items-center gap-4 border border-border-subtle px-6 py-12 text-center">
                  <p className="type-h4 text-primary">No matching stones</p>
                  <p className="max-w-md text-sm leading-5 text-muted-foreground">No stones match all of these filters. Remove a filter or clear them all to see more.</p>
                  <Button variant="outline" onClick={() => setFilters(emptyStoneFilters(filters.type))}>
                    Clear All Filters
                  </Button>
                </div>
              ) : (
                <div className="flex flex-col gap-10">
                  <ul className={cn("grid grid-cols-2 gap-x-card-gap gap-y-4", sidebarOpen ? "lg:grid-cols-3" : "lg:grid-cols-4")}>
                    {pageItems.map((s, i) => (
                      <Fragment key={s.id}>
                        {current === 1 && i === (sidebarOpen ? 3 : 4) && pageItems.length > i && (
                          <li className="col-span-full">
                            <FourCsBanner />
                          </li>
                        )}
                        <li className="min-w-0">
                          <DiamondCard stone={s} />
                        </li>
                      </Fragment>
                    ))}
                  </ul>
                  <div className="flex flex-col items-center gap-6 border-t border-border-subtle pt-8">
                    <Pagination
                      page={current}
                      pageCount={pageCount}
                      onPage={(p) => {
                        setPage(p)
                        document.getElementById("plp-results")?.scrollIntoView({ block: "start" })
                      }}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        <BelowGridContent />
      </main>
      <SiteFooter />
      <MobileBottomNav />

      {/* Mobile filters: changes apply as they're made; the button shows the live count. */}
      <Sheet open={drawerOpen && !isDesktop} onOpenChange={(o) => !o && setDrawerOpen(false)}>
        <SheetContent side="right" showCloseButton={false} className="w-full max-w-none! border-l-0 lg:hidden">
          <div className="flex shrink-0 items-center justify-between px-margin pt-8 pb-6">
            <SheetTitle className="type-h3 font-normal text-primary">Filters</SheetTitle>
            <button type="button" onClick={() => setDrawerOpen(false)} aria-label="Close" className="flex size-8 cursor-pointer items-center justify-center text-primary">
              <XIcon className="size-6" weight="light" />
            </button>
          </div>
          <div className="min-h-0 flex-1 overflow-y-auto px-margin pb-6">
            <div className="flex flex-col gap-3 border-b border-muted pb-5">
              <p className="type-label-s text-muted-foreground">Sort By</p>
              <SortMenu value={sort} onChange={(s) => { setSort(s); setPage(1) }} />
            </div>
            {panel}
          </div>
          <div className="shrink-0 border-t border-border-subtle px-margin py-4">
            <Button className="w-full" onClick={() => setDrawerOpen(false)}>
              View {results.length.toLocaleString("en-US")} Items
            </Button>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  )
}
