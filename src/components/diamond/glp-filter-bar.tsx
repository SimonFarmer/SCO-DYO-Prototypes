import { useState } from "react"
import { CaretDownIcon, MapPinIcon, SlidersHorizontalIcon, XIcon } from "@phosphor-icons/react"
import { useNotInTest } from "@/components/prototype/not-in-test"
import { DiamondFilters } from "@/components/diamond/diamond-filters"
import { RadioList } from "@/components/plp/filter-panel"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet"
import { STORE } from "@/data/plp"
import type { DiamondFilterState } from "@/lib/diamond-filters"
import { cn } from "@/lib/utils"
import { GLP_SORTS, type DiamondListing, type GlpSort } from "./use-diamond-listing"

/** "Stone · In-Store" pill (Pattern Library Filter.Tag.Button). Selected, it shows a ✕ and the store note. */
function InStoreChip({ listing, compact }: { listing: DiamondListing; compact?: boolean }) {
  const notInTest = useNotInTest()
  const on = listing.filters.instore
  return (
    <div className="flex min-w-0 items-center gap-4">
      <button
        type="button"
        aria-pressed={on}
        aria-label={on ? "Remove filter: Stone in-store" : "Filter: stones you can see in store"}
        onClick={() => listing.setFilters({ ...listing.filters, instore: !on })}
        className={cn(
          "flex h-10.5 shrink-0 cursor-pointer items-center gap-2.5 rounded-full border bg-background pr-4 pl-3 text-left whitespace-nowrap",
          on ? "border-primary" : "border-border-subtle hover:border-border",
        )}
      >
        <MapPinIcon className="size-4.5 shrink-0 text-primary" weight={on ? "fill" : "regular"} />
        <span className="flex flex-col">
          <span className="text-xxs leading-3 text-muted-foreground">Stone</span>
          <span className="type-label-xs text-primary">In-Store</span>
        </span>
        {on && <XIcon className="size-4 shrink-0 text-primary" />}
      </button>
      {on && (
        <p className="type-caption text-muted-foreground">
          {!compact && (
            <>
              View this stone in store today
              <br />
            </>
          )}
          at{" "}
          <button type="button" onClick={() => notInTest("Changing your store")} className="cursor-pointer font-semibold text-primary underline">
            {STORE.name}
          </button>
        </p>
      )}
    </div>
  )
}

function ShowingCount({ listing }: { listing: DiamondListing }) {
  const shown = listing.pageItems.length
  return (
    <p className="type-caption whitespace-nowrap text-muted-foreground" aria-live="polite">
      Showing <span className="font-semibold text-primary">{shown}</span> of{" "}
      <span className="font-semibold text-primary">{listing.results.length.toLocaleString("en-US")}</span> Items
    </p>
  )
}

function SortMenu({ listing }: { listing: DiamondListing }) {
  const label = GLP_SORTS.find((s) => s.id === listing.sort)?.label ?? "Popular"
  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="flex h-10 cursor-pointer items-center gap-2 type-label-xs text-primary">
        Sort by: {label}
        <CaretDownIcon className="size-4" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuRadioGroup value={listing.sort} onValueChange={(v) => listing.setSort(v as GlpSort)}>
          {GLP_SORTS.map((s) => (
            <DropdownMenuRadioItem key={s.id} value={s.id} closeOnClick className="py-2 text-sm">
              {s.label}
            </DropdownMenuRadioItem>
          ))}
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

/** Desktop filter bar (Figma 8032:112756): Hide Filters | Stone In-Store … Showing N of M | Sort by. */
export function GlpDesktopBar({ listing, sidebarOpen, onToggleSidebar }: { listing: DiamondListing; sidebarOpen: boolean; onToggleSidebar: () => void }) {
  return (
    <div className="hidden items-center gap-6 px-margin py-7 lg:flex">
      <button
        type="button"
        onClick={onToggleSidebar}
        aria-expanded={sidebarOpen}
        className="flex h-10 shrink-0 cursor-pointer items-center gap-2 type-label-xs text-primary"
      >
        <SlidersHorizontalIcon className="size-4" />
        {sidebarOpen ? "Hide Filters" : "Show Filters"}
      </button>
      <span aria-hidden className="h-6 w-px shrink-0 bg-border-subtle" />
      <div className="min-w-0 flex-1">
        <InStoreChip listing={listing} />
      </div>
      <ShowingCount listing={listing} />
      <span aria-hidden className="h-6 w-px shrink-0 bg-border-subtle" />
      <SortMenu listing={listing} />
    </div>
  )
}

/** Mobile filter controls (Figma "Filter.Controls", 8032:112912): In-Store chip, rule, Filter & Sort and the count. */
export function GlpMobileBar({ listing, onOpenFilters }: { listing: DiamondListing; onOpenFilters: () => void }) {
  return (
    <div className="flex flex-col gap-4 px-margin pt-6 pb-8 lg:hidden">
      <InStoreChip listing={listing} compact />
      <hr className="border-border-subtle" />
      <div className="flex items-center justify-between gap-4">
        <button type="button" onClick={onOpenFilters} className="flex cursor-pointer items-center gap-2 type-label-xs text-primary">
          <SlidersHorizontalIcon className="size-4" />
          Filter &amp; Sort{listing.activeCount > 0 && ` (${listing.activeCount})`}
        </button>
        <ShowingCount listing={listing} />
      </div>
    </div>
  )
}

/**
 * Mobile Filter & Sort drawer: Sort By, then the full diamond filter set, on pending state. The live
 * count on "View N Items" shows the refinement before it's applied.
 */
export function GlpMobileFilterDrawer({ listing, open, onClose }: { listing: DiamondListing; open: boolean; onClose: () => void }) {
  const [pending, setPending] = useState<DiamondFilterState>(listing.filters)
  const [sort, setSort] = useState<GlpSort>(listing.sort)
  const [wasOpen, setWasOpen] = useState(open)
  if (open !== wasOpen) {
    setWasOpen(open)
    if (open) {
      setPending(listing.filters)
      setSort(listing.sort)
    }
  }
  const count = listing.countFor(pending)

  const apply = () => {
    if (JSON.stringify(pending) !== JSON.stringify(listing.filters)) listing.setFilters(pending)
    if (sort !== listing.sort) listing.setSort(sort)
    onClose()
  }

  return (
    <Sheet open={open} onOpenChange={(o) => !o && onClose()}>
      <SheetContent side="right" showCloseButton={false} className="w-full max-w-none! border-l-0 lg:hidden">
        <div className="flex shrink-0 items-center justify-between px-margin pt-8 pb-6">
          <SheetTitle className="type-h3 font-normal text-primary">Filters</SheetTitle>
          <button type="button" onClick={onClose} aria-label="Close" className="flex size-8 cursor-pointer items-center justify-center text-primary">
            <XIcon className="size-6" weight="light" />
          </button>
        </div>
        <div className="flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto px-margin pb-6">
          <div className="flex flex-col gap-2 border-b border-muted pb-5">
            <p className="pt-2 type-label-s font-semibold text-muted-foreground">Sort By</p>
            <RadioList label="Sort by" value={sort} options={[...GLP_SORTS]} onChange={(v) => setSort(v as GlpSort)} />
          </div>
          <DiamondFilters value={pending} onChange={setPending} />
        </div>
        <div className="shrink-0 border-t border-border-subtle px-margin py-5">
          <Button className="w-full" disabled={count === 0} onClick={apply}>
            {count === 0 ? "No Matching Items" : `View ${count.toLocaleString("en-US")} Items`}
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  )
}

