import { useState } from "react"
import { XIcon } from "@phosphor-icons/react"
import { AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet"
import { EMPTY_FILTERS, SORTS, filterCount, type ListingFilters } from "@/data/plp"
import { CheckRow, FilterPanel } from "./filter-panel"
import type { Listing } from "./use-listing"

/**
 * Mobile Filter & Sort drawer. Choices are pending until "View N Items" (count is live), so a
 * shopper on a Level 3 page only moves to Level 2 once they apply.
 */
export function MobileFilterDrawer({ listing, open, onClose }: { listing: Listing; open: boolean; onClose: () => void }) {
  const [pending, setPending] = useState<ListingFilters>(listing.filters)
  const [sort, setSort] = useState(listing.sort)
  const [wasOpen, setWasOpen] = useState(open)
  if (open !== wasOpen) {
    setWasOpen(open)
    if (open) {
      setPending(listing.filters)
      setSort(listing.sort)
    }
  }
  const count = listing.countFor(pending)
  const changed = JSON.stringify(pending) !== JSON.stringify(listing.filters)

  const apply = () => {
    // Changing filters lands on Level 2; a sort-only change keeps the current page.
    if (changed) listing.setFilters(pending, sort)
    else if (sort !== listing.sort) listing.setSort(sort)
    onClose()
  }

  return (
    <Sheet open={open} onOpenChange={(o) => !o && onClose()}>
      <SheetContent side="right" showCloseButton={false} className="w-full max-w-none! border-l-0 lg:hidden">
        <div className="flex h-16 shrink-0 items-center justify-between border-b border-border-subtle px-margin">
          <SheetTitle className="type-h4 font-normal text-primary">Filter &amp; Sort</SheetTitle>
          <button type="button" onClick={onClose} aria-label="Close" className="flex size-8 cursor-pointer items-center justify-center text-primary">
            <XIcon className="size-5" weight="light" />
          </button>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto px-margin">
          <FilterPanel
            mode={listing.mode}
            filters={pending}
            className="border-t-0"
            onToggle={(key, value) =>
              setPending((p) => ({ ...p, [key]: p[key].includes(value) ? p[key].filter((v) => v !== value) : [...p[key], value] }))
            }
            onFulfil={(fulfil) => setPending((p) => ({ ...p, fulfil }))}
            before={
              <AccordionItem value="sort" className="border-b border-border-subtle">
                <AccordionTrigger className="items-center font-sans py-5 type-label-s font-semibold text-primary hover:no-underline **:data-[slot=accordion-trigger-icon]:size-5 **:data-[slot=accordion-trigger-icon]:text-primary">
                  Sort By: {SORTS.find((s) => s.id === sort)?.label}
                </AccordionTrigger>
                <AccordionContent className="pb-6">
                  {SORTS.map((s) => (
                    <CheckRow key={s.id} role="radio" label={s.label} checked={sort === s.id} onChange={() => setSort(s.id)} />
                  ))}
                </AccordionContent>
              </AccordionItem>
            }
          />
        </div>
        <div className="flex shrink-0 gap-2 border-t border-border-subtle px-margin py-5">
          <Button variant="outline" className="flex-1" disabled={filterCount(pending) === 0} onClick={() => setPending(EMPTY_FILTERS)}>
            Clear All
          </Button>
          <Button className="flex-2" disabled={count === 0} onClick={apply}>
            {count === 0 ? "No Matching Items" : `View ${count.toLocaleString("en-US")} Items`}
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  )
}
