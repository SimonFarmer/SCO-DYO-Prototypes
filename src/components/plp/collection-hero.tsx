import { useEffect, useRef, useState } from "react"
import { useNavigate } from "react-router"
import { ArrowLeftIcon, ArrowRightIcon, CaretRightIcon, HandbagIcon, MagicWandIcon, XIcon } from "@phosphor-icons/react"
import { Breadcrumb, type Crumb } from "@/components/site/breadcrumb"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet"
import { PLP_PATH, RTS_PATH, SHAPES, STYLES, type ListingFilters } from "@/data/plp"
import { cn } from "@/lib/utils"
import type { Listing } from "./use-listing"

type ExploreKey = "style" | "shape"

const EXPLORE: { key: ExploreKey; label: string }[] = [
  { key: "style", label: "Setting Style" },
  { key: "shape", label: "Stone Shape" },
]

const tilesFor = (key: ExploreKey) =>
  key === "style"
    ? STYLES.map((s) => ({ id: s.id, label: s.label, image: s.image, icon: false }))
    : SHAPES.map((s) => ({ id: s.id, label: s.label, image: s.icon, icon: true }))

const DYO_COPY =
  "Create the perfect custom engagement ring, uniquely built for you. Start designing your own Gemstone or Diamond engagement ring by choosing a setting or a stone."
const RTS_COPY =
  "Beautiful engagement rings with the center stone already set, ready to ship or pick up in store. Prefer to choose every detail? Switch to Design Your Own."

/** Design Your Own / Ready to Ship switch (Figma hero "Fullfilment Filters" buttons). */
function ModeToggle({ mode }: { mode: Listing["mode"] }) {
  const navigate = useNavigate()
  const go = (to: string) => {
    navigate(to)
    window.scrollTo({ top: 0 })
  }
  const item = (active: boolean, label: string, Icon: typeof MagicWandIcon, to: string) => (
    <button
      type="button"
      aria-pressed={active}
      onClick={() => !active && go(to)}
      className={cn(
        "flex h-10 flex-1 cursor-pointer items-center justify-center gap-2 border px-4 type-label-xs text-primary lg:flex-none",
        active ? "border-primary" : "border-border-subtle bg-background/60 hover:border-border",
      )}
    >
      <Icon className="size-4 max-lg:hidden" />
      {label}
    </button>
  )
  return (
    <div className="flex gap-2" role="group" aria-label="Shopping mode">
      {item(mode === "dyo", "Design Your Own", MagicWandIcon, PLP_PATH)}
      {item(mode === "rts", "Ready to Ship", HandbagIcon, RTS_PATH)}
    </div>
  )
}

/** Image tile used by the desktop carousel and the mobile drawer. */
function ExploreTile({
  tile,
  selected,
  onClick,
  className,
}: {
  tile: ReturnType<typeof tilesFor>[number]
  selected: boolean
  onClick: () => void
  className?: string
}) {
  return (
    <button type="button" aria-pressed={selected} onClick={onClick} className={cn("group flex cursor-pointer flex-col gap-4 text-left", className)}>
      <span
        className={cn(
          "flex aspect-square w-full items-center justify-center border bg-background",
          selected ? "border-primary" : "border-transparent group-hover:border-border-subtle",
        )}
      >
        <img
          src={tile.image}
          alt=""
          className={cn("object-contain mix-blend-multiply", tile.icon ? "size-1/3" : "size-full")}
        />
      </span>
      <span className={cn("type-label-xs text-primary underline underline-offset-4", selected && "decoration-2")}>{tile.label}</span>
    </button>
  )
}

/** Desktop "Explore by" carousel: Setting Style | Stone Shape tabs, tiles apply the filter immediately. */
function ExploreCarousel({ listing }: { listing: Listing }) {
  // Open on the facet the shopper arrived with (e.g. a stone-shape landing page).
  const [tab, setTab] = useState<ExploreKey>(listing.filters.shape.length && !listing.filters.style.length ? "shape" : "style")
  const track = useRef<HTMLDivElement>(null)
  const [canPrev, setCanPrev] = useState(false)
  const [canNext, setCanNext] = useState(true)

  const update = () => {
    const el = track.current
    if (!el) return
    setCanPrev(el.scrollLeft > 1)
    setCanNext(el.scrollLeft + el.clientWidth < el.scrollWidth - 1)
  }
  useEffect(() => {
    const el = track.current
    if (!el) return
    el.scrollTo({ left: 0 })
    update()
    const ro = new ResizeObserver(update)
    ro.observe(el)
    return () => ro.disconnect()
  }, [tab])

  const scroll = (dir: 1 | -1) => track.current?.scrollBy({ left: dir * track.current.clientWidth * 0.8, behavior: "smooth" })

  return (
    <div className="flex min-w-0 flex-1 flex-col gap-4">
      <p className="type-label-xs text-muted-foreground">Explore by</p>
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
      <div
        ref={track}
        onScroll={update}
        className="flex snap-x gap-2 overflow-x-auto pt-1 [scrollbar-width:none]"
        role="tabpanel"
      >
        {tilesFor(tab).map((t) => (
          <ExploreTile
            key={t.id}
            tile={t}
            selected={listing.filters[tab].includes(t.id)}
            onClick={() => listing.toggle(tab, t.id)}
            className="w-category-wayfinder-hero shrink-0 snap-start"
          />
        ))}
      </div>
      <div className="flex justify-end gap-2">
        <Button variant="outline" size="icon" aria-label="Previous" disabled={!canPrev} onClick={() => scroll(-1)}>
          <ArrowLeftIcon />
        </Button>
        <Button variant="outline" size="icon" aria-label="Next" disabled={!canNext} onClick={() => scroll(1)}>
          <ArrowRightIcon />
        </Button>
      </div>
    </div>
  )
}

/**
 * Mobile "Explore by" drawer (Figma "Mobile - Setting Style or Stone Shape Filter", 7845:198033).
 * Choices are pending until "View N Items", which shows the live result count.
 */
function ExploreDrawer({ listing, open, onClose }: { listing: Listing; open: ExploreKey | null; onClose: () => void }) {
  const [pending, setPending] = useState<ListingFilters>(listing.filters)
  const [wasOpen, setWasOpen] = useState(open)
  if (open !== wasOpen) {
    setWasOpen(open)
    if (open) setPending(listing.filters)
  }
  const key = open ?? wasOpen ?? "style"
  const count = listing.countFor(pending)
  const toggle = (id: string) =>
    setPending((p) => ({ ...p, [key]: p[key].includes(id) ? p[key].filter((v) => v !== id) : [...p[key], id] }))

  return (
    <Sheet open={!!open} onOpenChange={(o) => !o && onClose()}>
      <SheetContent side="bottom" showCloseButton={false} className="top-auto! max-h-[calc(100svh-12rem)] border-t-0 lg:hidden">
        <div className="flex items-center justify-between px-margin pt-6 pb-4">
          <SheetTitle className="type-h4 font-normal text-primary">{EXPLORE.find((e) => e.key === key)?.label}</SheetTitle>
          <button type="button" onClick={onClose} aria-label="Close" className="flex size-8 cursor-pointer items-center justify-center text-primary">
            <XIcon className="size-5" weight="light" />
          </button>
        </div>
        <div className="grid min-h-0 flex-1 grid-cols-2 gap-x-3 gap-y-6 overflow-y-auto px-margin pb-6">
          {tilesFor(key).map((t) => (
            <ExploreTile key={t.id} tile={t} selected={pending[key].includes(t.id)} onClick={() => toggle(t.id)} className="[&>span:first-child]:bg-secondary" />
          ))}
        </div>
        <div className="border-t border-border-subtle px-margin py-5">
          <Button
            className="w-full"
            disabled={count === 0}
            onClick={() => {
              listing.setFilters(pending)
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

/** Collection Hero (Figma 7845:197922 "Collection Hero" / mobile 7845:198032). */
export function CollectionHero({ listing }: { listing: Listing }) {
  const { mode, collection, filters } = listing
  const [readMore, setReadMore] = useState(false)
  const [drawer, setDrawer] = useState<ExploreKey | null>(null)

  const title = mode === "rts" ? "Ready to Ship Engagement Rings" : collection?.title ?? "Engagement Rings"
  const crumbs: Crumb[] = [{ label: "Home", to: "/shop" }]
  if (mode === "rts" || collection) crumbs.push({ label: "Engagement Rings", to: PLP_PATH })
  crumbs.push(title)
  const copy = mode === "rts" ? RTS_COPY : collection?.description ?? DYO_COPY

  return (
    <section className="bg-secondary">
      <Breadcrumb items={crumbs} className="px-margin pt-5 pb-0 lg:pt-5" />

      <div className="flex flex-col gap-5 px-margin pt-4 pb-6 lg:flex-row lg:gap-16 lg:pt-6 lg:pb-10">
        <div className="flex flex-col gap-5 lg:w-guided-intent lg:shrink-0 lg:gap-6 lg:pr-16">
          <h1 className="type-h2 text-primary">{title}</h1>
          <div className="flex flex-col items-start gap-2">
            <p className={cn("text-base leading-6 text-primary", !readMore && "max-lg:line-clamp-2")}>{copy}</p>
            <button
              type="button"
              onClick={() => setReadMore((r) => !r)}
              className="cursor-pointer type-label-xs text-primary underline underline-offset-4 lg:hidden"
            >
              {readMore ? "Read Less" : "Read More"}
            </button>
          </div>
          <ModeToggle mode={mode} />
        </div>

        {/* Desktop carousel, with the column divider */}
        <div className="hidden min-w-0 flex-1 gap-16 lg:flex">
          <span aria-hidden className="-my-4 w-px shrink-0 bg-border-subtle" />
          <ExploreCarousel key={`${mode}-${collection?.slug ?? ""}`} listing={listing} />
        </div>

        {/* Mobile: Explore by pills open the drawer */}
        <div className="flex flex-col gap-4 border-t border-border-subtle pt-5 lg:hidden">
          <p className="type-label-xs text-muted-foreground">Explore by</p>
          <div className="flex gap-2">
            {EXPLORE.map((e) => {
              const n = filters[e.key].length
              return (
                <button
                  key={e.key}
                  type="button"
                  onClick={() => setDrawer(e.key)}
                  className={cn(
                    "flex h-10 cursor-pointer items-center gap-1.5 rounded-full border bg-background px-4 type-label-xs whitespace-nowrap text-primary",
                    n ? "border-primary" : "border-border-subtle",
                  )}
                >
                  {e.label}
                  {n > 0 && ` (${n})`}
                  <CaretRightIcon className="size-4" />
                </button>
              )
            })}
          </div>
        </div>
      </div>
      <ExploreDrawer listing={listing} open={drawer} onClose={() => setDrawer(null)} />
    </section>
  )
}
