import { useRef, useState } from "react"
import type { GalleryImage } from "@/data/dyo"
import { cn } from "@/lib/utils"

/**
 * Product gallery.
 * Desktop (lg+): two-column long-scroll grid. Mobile: swipeable carousel with dots,
 * following the non-DYO mobile PDP.
 */
export function ProductGallery({ images }: { images: GalleryImage[] }) {
  const track = useRef<HTMLDivElement>(null)
  const [index, setIndex] = useState(0)

  const onScroll = () => {
    const el = track.current
    if (el) setIndex(Math.round(el.scrollLeft / el.clientWidth))
  }

  const goTo = (i: number) => {
    const el = track.current
    el?.scrollTo({ left: i * el.clientWidth, behavior: "smooth" })
  }

  return (
    <>
      <div className="hidden grid-cols-2 gap-2 p-2 pt-0 lg:grid">
        {images.map((img) => (
          <img
            key={img.src}
            src={img.src}
            alt={img.alt}
            className="aspect-square w-full bg-secondary object-cover"
          />
        ))}
      </div>

      <div className="relative lg:hidden">
        <div
          ref={track}
          onScroll={onScroll}
          className="flex snap-x snap-mandatory overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {images.map((img, i) => (
            <img
              key={img.src}
              src={img.src}
              alt={img.alt}
              loading={i === 0 ? "eager" : "lazy"}
              className="aspect-square w-full shrink-0 snap-center bg-secondary object-cover"
            />
          ))}
        </div>
        <div className="absolute right-3 bottom-3 flex items-center gap-1" role="tablist" aria-label="Gallery images">
          {images.map((img, i) => (
            <button
              key={img.src}
              type="button"
              role="tab"
              aria-selected={i === index}
              aria-label={`Image ${i + 1} of ${images.length}`}
              onClick={() => goTo(i)}
              className={cn(
                "h-1 cursor-pointer rounded-full transition-all",
                i === index ? "w-2 bg-primary" : "w-1 bg-muted-foreground/50"
              )}
            />
          ))}
        </div>
      </div>
    </>
  )
}
