import type { ReactNode } from "react"
import { Skeleton } from "@/components/ui/skeleton"

/**
 * Loading placeholders for listing tiles, shown briefly while a filter or sort change "refreshes" the grid.
 * Each mirrors its tile's layout and line heights.
 */

/**
 * While loading, lays the skeleton over the real tile, which stays in place but hidden and inert. Each
 * grid slot keeps its exact final size (titles wrap differently per row), so nothing shifts when the
 * products appear, and their images load behind the skeleton.
 */
export function TileLoading({ loading, skeleton, children }: { loading: boolean; skeleton: ReactNode; children: ReactNode }) {
  if (!loading) return children
  return (
    <div className="relative">
      <div className="invisible" aria-hidden inert>
        {children}
      </div>
      <div className="absolute inset-0 overflow-hidden">{skeleton}</div>
    </div>
  )
}

/** A bar sitting in a text line box, so stacked bars keep the real text's line heights. */
function Line({ box, bar }: { box: string; bar: string }) {
  return (
    <div className={`flex items-center ${box}`}>
      <Skeleton className={bar} />
    </div>
  )
}

/** Ring / setting card (PlpProductCard): square image, two-line title, price, metal swatches and label. */
export function ProductTileSkeleton() {
  return (
    <div aria-hidden className="flex min-w-0 flex-col">
      <Skeleton className="aspect-square w-full" />
      <div className="flex flex-col gap-3 py-3 pr-2">
        <div>
          <Line box="h-5 lg:h-6" bar="h-3.5 w-full lg:h-4" />
          {/* Names wrap to two lines on mobile; they fit one on desktop. */}
          <Line box="h-5 lg:hidden" bar="h-3.5 w-3/5" />
        </div>
        <Line box="h-5 lg:h-6" bar="h-3.5 w-1/3 lg:h-4" />
        {/* Swatches (26px mobile / 30px desktop with their ring); on mobile the metal label wraps below. */}
        <div className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1">
          <div className="flex gap-1">
            {[0, 1, 2].map((i) => (
              <Skeleton key={i} className="size-6.5 rounded-full lg:size-7.5" />
            ))}
          </div>
          <Line box="h-4 max-lg:basis-full" bar="h-3 w-16" />
        </div>
      </div>
    </div>
  )
}

/**
 * Stone tile (StoneTile on the diamond GLP, Test 3 and the Test 2 Diamonds PLP): square image, title, price, Clarity | Color | Cut.
 * Mobile titles run to two lines and the spec values wrap, so the text block is taller there.
 */
export function StoneTileSkeleton() {
  return (
    <div aria-hidden className="flex min-w-0 flex-col bg-bg-input-30">
      <Skeleton className="aspect-square w-full" />
      <div className="flex flex-col gap-3 py-3 pr-4">
        <div className="flex min-h-12 flex-col gap-2">
          <div>
            <Line box="h-5" bar="h-3.5 w-4/5" />
            <Line box="h-5 lg:hidden" bar="h-3.5 w-1/2" />
          </div>
          <Line box="h-5" bar="h-3.5 w-1/3" />
        </div>
        <div className="flex h-14 gap-2 lg:h-8">
          {[0, 1, 2].map((i) => (
            <div key={i} className="flex flex-1 flex-col gap-1 py-0.5">
              <Skeleton className="h-2.5 w-3/5" />
              <Skeleton className="h-2.5 w-4/5" />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
