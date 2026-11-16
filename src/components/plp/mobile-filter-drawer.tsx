import { useState } from "react"
import { XIcon } from "@phosphor-icons/react"
import { AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet"
import { SORTS, type ListingFilters } from "@/data/plp"
import { FilterPanel, RadioList } from "./filter-panel"
import type { Listing } from "./use-listing"

/**
 * Mobile filters (SCO Drop 2 "Mobile Filters", 7060:38372): "Filters" title, applied-filter pills
 * with Clear Filter(s), Sort By radios, the filter groups, and one "View N Items" button.
 * Choices are pending until View (the count is live), so a shopper on a Level 3 page only moves
 * to Level 2 once they apply.
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
        <div className="flex shrink-0 items-center justify-between px-margin pt-8 pb-6">
          <SheetTitle className="type-h3 font-normal text-primary">Filters</SheetTitle>
          <button type="button" onClick={onClose} aria-label="Close" className="flex size-8 cursor-pointer items-center justify-center text-primary">
            <XIcon className="size-6" weight="light" />
          </button>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto px-margin pb-6">
          <FilterPanel
            mode={listing.mode}
            filters={pending}
            bounds={listing.bounds}
            onChange={setPending}
            onToggle={(key, value) =>
              setPending((p) => ({ ...p, [key]: p[key].includes(value) ? p[key].filter((v) => v !== value) : [...p[key], value] }))
            }
            onFulfil={(fulfil) => setPending((p) => ({ ...p, fulfil }))}
            onPrice={(minPrice, maxPrice) => setPending((p) => ({ ...p, minPrice, maxPrice }))}
            before={
              <AccordionItem value="sort" className="border-b border-border-subtle">
                <AccordionTrigger className="items-center py-5 font-sans type-label-s font-semibold text-primary hover:no-underline **:data-[slot=accordion-trigger-icon]:size-5 **:data-[slot=accordion-trigger-icon]:text-primary">
                  Sort By
                </AccordionTrigger>
                <AccordionContent className="pb-5">
                  <RadioList label="Sort by" value={sort} options={SORTS} onChange={setSort} />
                </AccordionContent>
              </AccordionItem>
            }
          />
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
