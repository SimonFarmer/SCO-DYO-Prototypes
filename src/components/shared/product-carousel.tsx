import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { ArrowLeft, ArrowRight } from "@phosphor-icons/react"
import { Button } from "@/components/ui/button"
import { SectionHeading } from "@/components/shared/section-heading"
import { ProductCard } from "@/components/shared/product-card"
import type { ProductCardData } from "@/data/products"
import { cn } from "@/lib/utils"

interface ProductCarouselProps {
  title: string
  products: ProductCardData[]
  showWishlist?: boolean
  className?: string
}

/**
 * Pattern Library "Recommender": H3 title, horizontally scrolling product cards, prev/next controls.
 * Always fills its track: on screens wider than the list, items repeat so there is no empty tail.
 */
export function ProductCarousel({ title, products, showWishlist, className }: ProductCarouselProps) {
  const trackRef = useRef<HTMLDivElement>(null)
  const [canPrev, setCanPrev] = useState(false)
  const [canNext, setCanNext] = useState(true)
  /** Cards needed to overflow the track at the current width (so it never shows an empty tail). */
  const [slots, setSlots] = useState(0)

  const update = useCallback(() => {
    const el = trackRef.current
    if (!el) return
    setCanPrev(el.scrollLeft > 1)
    setCanNext(el.scrollLeft + el.clientWidth < el.scrollWidth - 1)
    const card = el.firstElementChild as HTMLElement | null
    if (card) {
      const gap = parseFloat(getComputedStyle(el).columnGap) || 0
      setSlots(Math.ceil(el.clientWidth / (card.offsetWidth + gap)) + 1)
    }
  }, [])

  useEffect(() => {
    const el = trackRef.current
    if (!el) return
    const ro = new ResizeObserver(update)
    ro.observe(el)
    return () => ro.disconnect()
  }, [update])

  // If a list is too short for the screen, cycle through it again so the carousel always scrolls.
  const items = useMemo(() => {
    if (products.length === 0 || products.length >= slots) return products.map((p) => ({ product: p, key: p.id }))
    return Array.from({ length: slots }, (_, i) => ({ product: products[i % products.length], key: `${products[i % products.length].id}-${i}` }))
  }, [products, slots])

  useEffect(update, [items, update])

  const scroll = (dir: 1 | -1) => {
    const el = trackRef.current
    const card = el?.firstElementChild as HTMLElement | null
    if (!el || !card) return
    const gap = parseFloat(getComputedStyle(el).columnGap) || 0
    el.scrollBy({ left: dir * (card.offsetWidth + gap), behavior: "smooth" })
  }

  return (
    <section className={cn("flex flex-col gap-8 bg-background px-margin py-14", className)}>
      <SectionHeading title={title} />
      <div
        ref={trackRef}
        onScroll={update}
        className="-mr-margin flex snap-x snap-mandatory gap-card-gap overflow-x-auto pr-margin [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {items.map(({ product, key }) => (
          <ProductCard key={key} product={product} showWishlist={showWishlist} />
        ))}
      </div>
      <div className="flex justify-end gap-card-gap">
        <Button variant="outline" size="icon" aria-label="Previous" disabled={!canPrev} onClick={() => scroll(-1)}>
          <ArrowLeft />
        </Button>
        <Button variant="outline" size="icon" aria-label="Next" disabled={!canNext} onClick={() => scroll(1)}>
          <ArrowRight />
        </Button>
      </div>
    </section>
  )
}
