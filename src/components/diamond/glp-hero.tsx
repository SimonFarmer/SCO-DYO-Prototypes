import { useRef, useState, type ReactNode } from "react"
import { ArrowLeftIcon, ArrowRightIcon, CaretLeftIcon, CaretRightIcon, InfoIcon, XIcon } from "@phosphor-icons/react"
import { useNotInTest } from "@/components/prototype/not-in-test"
import { useFlow } from "@/flow/flow-context"
import { CUT_HINT, GradeSlider } from "@/components/diamond/diamond-filters"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet"
import { CLARITY_GRADES, COLOR_GRADES, CUT_GRADES, SHAPES, shapeIcon, type CutGrade, type Shape } from "@/data/diamonds"
import { NO_FILTERS, type DiamondFilterState } from "@/lib/diamond-filters"
import { useScrollOverflow } from "@/lib/hooks"
import { scrollAfterUnlock, scrollToResults } from "@/lib/scroll-to-results"
import { cn } from "@/lib/utils"
import type { DiamondListing } from "./use-diamond-listing"

type ExploreKey = "shape" | "cut" | "clarity" | "color"

/** Explore by tabs (Figma "Explore by filters", 8032:117460): copy, and whether it has a Learn More link. */
const EXPLORE: { key: ExploreKey; label: string; copy: string; learnMore: boolean }[] = [
  {
    key: "shape",
    label: "Shape",
    copy: "Shape is often the first step in choosing a diamond. Each shape has its own character, from the timeless brilliance of Round to the distinctive elegance of Oval, Emerald and Pear.",
    learnMore: false,
  },
  { key: "cut", label: "Cut", copy: "Cut determines how brilliantly a diamond reflects light, creating its sparkle and fire.", learnMore: true },
  { key: "clarity", label: "Clarity", copy: "Clarity measures visible inclusions on a scale from IF (highest) to I3 (lowest).", learnMore: true },
  { key: "color", label: "Color", copy: "Colour Grade helps compare diamonds from D (brightest white) to M (warmest tone).", learnMore: true },
]

/** Color bands under the hero color scale (Figma: Faint Yellow | Near Colorless | Colorless). */
const COLOR_BANDS: [string, number, number][] = [
  ["Faint Yellow", 0, 2],
  ["Near Colorless", 3, 6],
  ["Colorless", 7, 9],
]

const CUT_ORDER = [...CUT_GRADES].reverse() as CutGrade[]
const cutImage = (cut: CutGrade) => `/images/diamonds/cut/${cut.toLowerCase().replace(" ", "-")}.png`

const INTRO =
  "Hand-selected, GIA-certified loose diamonds in a wide range of shapes and sizes. Choose the one that’s right for your ring."

/** Is the Explore facet narrowed? (drives the mobile pill's selected state and count) */
function facetCount(f: DiamondFilterState, key: ExploreKey) {
  if (key === "shape") return f.shapes.length
  if (key === "cut") return f.cuts.length
  const full = NO_FILTERS[key]
  return f[key][0] !== full[0] || f[key][1] !== full[1] ? 1 : 0
}

const toggle = <T,>(list: T[], v: T) => (list.includes(v) ? list.filter((x) => x !== v) : [...list, v])

/* ───────────────────────── Tiles ───────────────────────── */

/** Shape tile: 88px square, outline icon over a Label XXS name (Figma "Hero.Shape"). */
function ShapeTile({ shape, selected, onClick, className }: { shape: Shape; selected: boolean; onClick: () => void; className?: string }) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      onClick={onClick}
      className={cn(
        "flex shrink-0 cursor-pointer flex-col items-center justify-center gap-2.5 border bg-background p-3 hover:border-primary",
        selected ? "border-primary" : "border-border-subtle",
        className,
      )}
    >
      <img src={shapeIcon(shape)} alt="" className="size-8" />
      {/* Figma: 10px label — closest type token text-xxs (11px). */}
      <span className="text-xxs leading-3 font-semibold tracking-[1px] text-muted-foreground uppercase">{shape}</span>
    </button>
  )
}

/** Cut tile: sparkle illustration, grade and one-line hint (Figma "Hero.Cut", 155×254). */
function CutTile({ cut, selected, onClick, className }: { cut: CutGrade; selected: boolean; onClick: () => void; className?: string }) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      onClick={onClick}
      className={cn(
        "flex shrink-0 cursor-pointer flex-col items-center gap-3 border bg-background p-3 pb-4 text-center hover:border-primary",
        selected ? "border-primary" : "border-border-subtle",
        className,
      )}
    >
      <img src={cutImage(cut)} alt="" className="aspect-[131/170] w-full object-cover" />
      <span className="flex flex-col gap-1">
        <span className="text-xxs leading-3 font-semibold tracking-[1px] text-primary uppercase">{cut}</span>
        <span className="text-xs leading-4 text-muted-foreground">{CUT_HINT[cut]}</span>
      </span>
    </button>
  )
}

/* ───────────────────────── Panels ───────────────────────── */

/** Horizontal tile rail with prev/next controls that only show when the tiles overflow. */
function TileRail({ children, gap }: { children: ReactNode; gap: string }) {
  const rail = useRef<HTMLDivElement>(null)
  const { overflows, canPrev, canNext } = useScrollOverflow(rail)
  const scroll = (dir: 1 | -1) => rail.current?.scrollBy({ left: dir * rail.current.clientWidth * 0.8, behavior: "smooth" })
  return (
    <div className="flex flex-col gap-5">
      <div ref={rail} className={cn("flex snap-x overflow-x-auto [scrollbar-width:none] *:snap-start", gap)}>
        {children}
      </div>
      {overflows && (
        <div className="flex justify-end gap-2">
          <Button variant="outline" size="icon" aria-label="Previous" disabled={!canPrev} onClick={() => scroll(-1)}>
            <ArrowLeftIcon />
          </Button>
          <Button variant="outline" size="icon" aria-label="Next" disabled={!canNext} onClick={() => scroll(1)}>
            <ArrowRightIcon />
          </Button>
        </div>
      )}
    </div>
  )
}

/**
 * The control for one Explore facet, bound to a filter state. Tiles toggle (and, on the page, glide to
 * the results); sliders set a grade range and clear any "What matters most?" preset, as in the sidebar.
 */
function ExplorePanel({
  tab,
  filters,
  onChange,
  onPick,
  layout,
}: {
  tab: ExploreKey
  filters: DiamondFilterState
  onChange: (f: DiamondFilterState) => void
  /** Called after a tile choice (desktop: scroll to results) */
  onPick?: () => void
  layout: "rail" | "grid"
}) {
  const pick = (next: DiamondFilterState) => {
    onChange(next)
    onPick?.()
  }
  if (tab === "shape") {
    const tiles = SHAPES.map((s) => (
      <ShapeTile
        key={s}
        shape={s}
        selected={filters.shapes.includes(s)}
        onClick={() => pick({ ...filters, shapes: toggle(filters.shapes, s) })}
        className={layout === "rail" ? "size-22" : "aspect-square w-full min-w-0"}
      />
    ))
    return layout === "rail" ? <TileRail gap="gap-1">{tiles}</TileRail> : <div className="grid grid-cols-3 gap-2">{tiles}</div>
  }
  if (tab === "cut") {
    const tiles = CUT_ORDER.map((c) => (
      <CutTile
        key={c}
        cut={c}
        selected={filters.cuts.includes(c)}
        onClick={() => pick({ ...filters, preset: null, cuts: toggle(filters.cuts, c) })}
        className={layout === "rail" ? "w-39" : "w-full min-w-0"}
      />
    ))
    return layout === "rail" ? <TileRail gap="gap-1">{tiles}</TileRail> : <div className="grid grid-cols-2 gap-2">{tiles}</div>
  }
  return (
    <GradeSlider
      label={tab === "clarity" ? "Clarity" : "Color"}
      grades={tab === "clarity" ? CLARITY_GRADES : COLOR_GRADES}
      groups={tab === "color" ? COLOR_BANDS : undefined}
      value={filters[tab]}
      onChange={(range) => onChange({ ...filters, preset: null, [tab]: range })}
      className="pt-2"
    />
  )
}

function ExploreCopy({ tab }: { tab: ExploreKey }) {
  const notInTest = useNotInTest()
  const e = EXPLORE.find((x) => x.key === tab)!
  return (
    <div className="flex flex-col items-start gap-1">
      <p className="text-sm leading-5 text-primary">{e.copy}</p>
      {e.learnMore && (
        <Button variant="link" className="h-6 gap-0.5 px-0" onClick={() => notInTest(`${e.label} education`)}>
          Learn More
          <InfoIcon />
        </Button>
      )}
    </div>
  )
}

/* ───────────────────────── Desktop ───────────────────────── */

/** Desktop "Explore by": Shape | Cut | Clarity | Color tabs over the matching control. */
function ExploreTabs({ listing }: { listing: DiamondListing }) {
  const [tab, setTab] = useState<ExploreKey>("shape")
  return (
    <div className="flex min-w-0 flex-1 flex-col gap-2">
      <p className="type-label-xs text-primary">Explore by</p>
      <div className="flex min-w-0 flex-col gap-5">
        <div role="tablist" className="flex gap-4">
          {EXPLORE.map((e) => (
            <button
              key={e.key}
              role="tab"
              type="button"
              aria-selected={tab === e.key}
              onClick={() => setTab(e.key)}
              className={cn(
                "cursor-pointer border-b-2 pb-1 type-h4 text-primary",
                tab === e.key ? "border-primary" : "border-transparent text-muted-foreground hover:text-primary",
              )}
            >
              {e.label}
            </button>
          ))}
        </div>
        <div role="tabpanel" className="flex flex-col gap-5">
          <ExploreCopy tab={tab} />
          <ExplorePanel key={tab} tab={tab} filters={listing.filters} onChange={listing.setFilters} onPick={scrollToResults} layout="rail" />
        </div>
      </div>
    </div>
  )
}

/* ───────────────────────── Mobile ───────────────────────── */

/** Mobile pills: Shape | Cut | Clarity | Color, each opening its drawer (Figma mobile hero, 8032:112878). */
function ExplorePills({ filters, onOpen }: { filters: DiamondFilterState; onOpen: (key: ExploreKey) => void }) {
  return (
    <div className="-mx-margin flex gap-2 overflow-x-auto px-margin [scrollbar-width:none] lg:hidden">
      {EXPLORE.map((e) => {
        const n = facetCount(filters, e.key)
        return (
          <button
            key={e.key}
            type="button"
            onClick={() => onOpen(e.key)}
            className={cn(
              "flex h-10 shrink-0 cursor-pointer items-center gap-2 rounded-full border bg-background pr-4 pl-5 type-label-xs whitespace-nowrap text-primary",
              n ? "border-primary" : "border-border-subtle",
            )}
          >
            {e.label}
            {n > 0 && (e.key === "shape" || e.key === "cut") && ` (${n})`}
            <CaretRightIcon className="size-4" />
          </button>
        )
      })}
    </div>
  )
}

/** Mobile Explore drawer: the facet's control on pending filters, applied with "View N Items". */
function ExploreDrawer({ listing, open, onClose }: { listing: DiamondListing; open: ExploreKey | null; onClose: () => void }) {
  const [pending, setPending] = useState<DiamondFilterState>(listing.filters)
  const [wasOpen, setWasOpen] = useState(open)
  if (open !== wasOpen) {
    setWasOpen(open)
    if (open) setPending(listing.filters)
  }
  const tab = open ?? wasOpen ?? "shape"
  const count = listing.countFor(pending)
  // Set by "View N Items"; the scroll waits until the drawer has closed and released its scroll lock.
  const applied = useRef(false)

  return (
    <Sheet
      open={!!open}
      onOpenChange={(o) => !o && onClose()}
      onOpenChangeComplete={(o) => {
        if (o || !applied.current) return
        applied.current = false
        scrollAfterUnlock()
      }}
    >
      <SheetContent side="bottom" showCloseButton={false} className="top-auto! max-h-[calc(100svh-8rem)] border-t-0 lg:hidden">
        <div className="flex items-center justify-between px-margin pt-6 pb-4">
          <SheetTitle className="type-h4 font-normal text-primary">{EXPLORE.find((e) => e.key === tab)?.label}</SheetTitle>
          <button type="button" onClick={onClose} aria-label="Close" className="flex size-8 cursor-pointer items-center justify-center text-primary">
            <XIcon className="size-5" weight="light" />
          </button>
        </div>
        <div className="flex min-h-0 flex-1 flex-col gap-5 overflow-y-auto px-margin pb-6">
          <ExploreCopy tab={tab} />
          <ExplorePanel tab={tab} filters={pending} onChange={setPending} layout="grid" />
        </div>
        <div className="border-t border-border-subtle px-margin py-5">
          <Button
            className="w-full"
            disabled={count === 0}
            onClick={() => {
              listing.setFilters(pending)
              applied.current = true
              onClose()
            }}
          >
            {count === 0 ? "No Matching Items" : `View ${count.toLocaleString("en-US")} Items`}
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  )
}

/* ───────────────────────── Hero ───────────────────────── */

/** Natural | Lab-Grown | Gemstones (Figma hero toggle). Only Natural is in this prototype. */
function StoneTypeToggle() {
  const notInTest = useNotInTest()
  const types = ["Natural", "Lab-Grown", "Gemstones"]
  return (
    <div className="flex w-full lg:w-fit" role="group" aria-label="Stone type">
      {types.map((t, i) => {
        const active = i === 0
        return (
          <button
            key={t}
            type="button"
            aria-pressed={active}
            onClick={() => !active && notInTest(`${t} stones`)}
            className={cn(
              "flex h-11 flex-1 cursor-pointer items-center justify-center bg-background px-2 type-label-xs text-primary lg:w-29 lg:flex-none",
              active ? "border-2 border-primary" : "border border-l-0 border-border-subtle hover:border-border",
            )}
          >
            {t}
          </button>
        )
      })}
    </div>
  )
}

/**
 * Diamond GLP Collection Hero (desktop 8032:112721, mobile 8032:112878). Mobile stacks the intro, the
 * Explore pills, copy and the stone-type toggle on a stone-to-white gradient; desktop puts the intro
 * column beside the Explore tabs on a flat stone fill.
 */
export function GlpHero({ listing }: { listing: DiamondListing }) {
  const notInTest = useNotInTest()
  const flow = useFlow()
  const [readMore, setReadMore] = useState(false)
  const [drawer, setDrawer] = useState<ExploreKey | null>(null)

  return (
    <section className="flex flex-col gap-8 bg-linear-to-b from-secondary from-32% to-secondary/0 px-page pt-5 pb-8 lg:gap-5 lg:bg-secondary lg:bg-none lg:pb-10">
      <button
        type="button"
        // Full flow: back to the shopper's stone preferences. Elsewhere it isn't part of the test.
        onClick={() => (flow ? flow.goToStep(2, "edit") : notInTest("Stone preferences"))}
        className="flex cursor-pointer items-center gap-1 self-start type-caption text-muted-foreground hover:text-primary"
      >
        <CaretLeftIcon className="size-4" />
        Back to stone preferences
      </button>

      <div className="flex flex-col lg:flex-row lg:gap-16">
        <div className="flex flex-col gap-6 lg:w-guided-intent lg:shrink-0 lg:gap-8 lg:border-r lg:border-border-subtle lg:pr-16 lg:pb-7">
          <div className="flex flex-col gap-6 lg:gap-4">
            <div className="flex flex-col gap-3">
              <p className="type-label-xs text-muted-foreground">
                Design Your Own <span className="font-normal">∙</span> <span className="font-medium">Select Your Stone</span>
              </p>
              <h1 className="type-h2 text-primary">Natural Diamonds</h1>
            </div>
            <ExplorePills filters={listing.filters} onOpen={setDrawer} />
            <div className="flex flex-col items-start gap-1">
              <p className={cn("text-sm leading-5 text-primary lg:text-base lg:leading-6", !readMore && "max-lg:line-clamp-2")}>{INTRO}</p>
              <button
                type="button"
                onClick={() => setReadMore((r) => !r)}
                className="cursor-pointer type-label-xs text-primary underline underline-offset-4 lg:hidden"
              >
                {readMore ? "Read Less" : "Read More"}
              </button>
            </div>
          </div>
          <StoneTypeToggle />
        </div>

        <div className="hidden min-w-0 flex-1 lg:flex">
          <ExploreTabs listing={listing} />
        </div>
      </div>
      <ExploreDrawer listing={listing} open={drawer} onClose={() => setDrawer(null)} />
    </section>
  )
}
