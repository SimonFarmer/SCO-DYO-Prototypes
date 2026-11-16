import {
  CalendarCheckIcon,
  CaretDownIcon,
  LightningIcon,
  MapPinIcon,
  SlidersHorizontalIcon,
  XIcon,
} from "@phosphor-icons/react"
import { useNotInTest } from "@/components/prototype/not-in-test"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { FULFILMENT, PAGE_SIZE, SORTS, STORE, type FulfilmentId } from "@/data/plp"
import { cn } from "@/lib/utils"
import type { Listing } from "./use-listing"

const ICONS = { pin: MapPinIcon, lightning: LightningIcon, calendar: CalendarCheckIcon }

/** Helper text next to a selected fulfilment chip (Figma "Fulfilment filters", 7845:197923). */
function FulfilmentNote({ id, mode, compact }: { id: FulfilmentId; mode: Listing["mode"]; compact?: boolean }) {
  const notInTest = useNotInTest()
  const link = (label: string) => (
    <button type="button" onClick={() => notInTest("Changing your store")} className="cursor-pointer font-semibold text-primary underline">
      {label}
    </button>
  )
  if (id === "instore")
    return compact ? (
      <>at {link(STORE.name)}</>
    ) : (
      <>
        View this {mode === "dyo" ? "setting" : "ring"} in store today
        <br />
        at {link(STORE.name)}
      </>
    )
  if (id === "sameday")
    return compact ? (
      link(STORE.addressShort)
    ) : (
      <>
        Order by 3pm to get it today, arrives within 4 hours or less
        <br />
        to {link(STORE.address)}
      </>
    )
  return (
    <>
      Free by Friday,
      <br />
      $10 by Thursday
    </>
  )
}

/** Pill filter (Pattern Library Filter.Tag.Button): "Setting" eyebrow over the option. */
function FulfilmentChip({
  id,
  selected,
  mode,
  compact,
  onClick,
}: {
  id: FulfilmentId
  selected: boolean
  mode: Listing["mode"]
  compact?: boolean
  onClick: () => void
}) {
  const f = FULFILMENT.find((x) => x.id === id)!
  const IconCmp = ICONS[f.icon]
  return (
    <button
      type="button"
      aria-pressed={selected}
      onClick={onClick}
      aria-label={selected ? `Remove filter: ${f.label}` : `Filter: ${mode === "dyo" ? "setting " : ""}${f.label}`}
      className={cn(
        "flex h-10.5 shrink-0 cursor-pointer items-center rounded-full border bg-background text-left whitespace-nowrap",
        compact ? "gap-2 pr-3 pl-2.5" : "gap-2.5 pr-4 pl-3",
        selected ? "border-primary" : "border-border-subtle hover:border-border",
      )}
    >
      <IconCmp className="size-4.5 shrink-0 text-primary" weight={selected ? "fill" : "regular"} />
      <span className="flex flex-col">
        {mode === "dyo" && <span className="text-xxs leading-3 text-muted-foreground">Setting</span>}
        <span className="type-label-xs text-primary">{compact ? f.shortLabel : f.label}</span>
      </span>
      {selected && <XIcon className="size-4 shrink-0 text-primary" />}
    </button>
  )
}

/** Fulfilment chips. With one selected, only that chip shows, followed by its helper text (Figma). */
function FulfilmentChips({ listing, compact }: { listing: Listing; compact?: boolean }) {
  const { filters, setFulfil, mode } = listing
  if (filters.fulfil) {
    return (
      <div className="flex min-w-0 items-center gap-4">
        <FulfilmentChip id={filters.fulfil} selected mode={mode} compact={compact} onClick={() => setFulfil(null)} />
        <p className={cn("type-caption text-muted-foreground", compact && filters.fulfil === "sameday" && "truncate")}>
          <FulfilmentNote id={filters.fulfil} mode={mode} compact={compact} />
        </p>
      </div>
    )
  }
  return (
    <div className={cn("flex gap-2", compact && "-mx-margin overflow-x-auto px-margin [scrollbar-width:none]")}>
      {FULFILMENT.map((f) => (
        <FulfilmentChip key={f.id} id={f.id} selected={false} mode={mode} compact={compact} onClick={() => setFulfil(f.id)} />
      ))}
    </div>
  )
}

function ShowingCount({ listing }: { listing: Listing }) {
  const { results, page } = listing
  const shown = Math.min(PAGE_SIZE, results.length - (page - 1) * PAGE_SIZE)
  return (
    <p className="type-caption whitespace-nowrap text-muted-foreground" aria-live="polite">
      Showing <span className="font-semibold text-primary">{Math.max(shown, 0)}</span> of{" "}
      <span className="font-semibold text-primary">{results.length.toLocaleString("en-US")}</span> Items
    </p>
  )
}

function SortMenu({ listing }: { listing: Listing }) {
  const label = SORTS.find((s) => s.id === listing.sort)?.label ?? "Recommended"
  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="flex h-10 cursor-pointer items-center gap-2 type-label-xs text-primary">
        Sort by: {label}
        <CaretDownIcon className="size-4" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuRadioGroup value={listing.sort} onValueChange={(v) => listing.setSort(v as string)}>
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

/** Desktop filter bar (Figma 7845:154413): Hide Filters | fulfilment chips … count | sort. */
export function DesktopFilterBar({
  listing,
  sidebarOpen,
  onToggleSidebar,
}: {
  listing: Listing
  sidebarOpen: boolean
  onToggleSidebar: () => void
}) {
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
        <FulfilmentChips listing={listing} />
      </div>
      <ShowingCount listing={listing} />
      <span aria-hidden className="h-6 w-px shrink-0 bg-border-subtle" />
      <SortMenu listing={listing} />
    </div>
  )
}

/** Mobile filter bar (Figma 7845:168558): Filter & Sort button, fulfilment chips, count. */
export function MobileFilterBar({ listing, onOpenFilters, activeCount }: { listing: Listing; onOpenFilters: () => void; activeCount: number }) {
  return (
    <div className="flex flex-col gap-3 px-margin pt-8 pb-8 lg:hidden">
      <button
        type="button"
        onClick={onOpenFilters}
        className="flex h-10 w-full cursor-pointer items-center justify-center gap-2 border border-border-subtle type-label-xs text-primary"
      >
        <SlidersHorizontalIcon className="size-4" />
        Filter &amp; Sort{activeCount > 0 && ` (${activeCount})`}
      </button>
      <FulfilmentChips listing={listing} compact />
      <ShowingCount listing={listing} />
    </div>
  )
}
