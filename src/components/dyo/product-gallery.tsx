import { useRef, useState } from "react"
import type { GalleryImage } from "@/data/dyo"
import { cn } from "@/lib/utils"

function TileBadge({ img }: { img: GalleryImage }) {
  if (!img.badge) return null
  return (
    <span
      className={cn(
        "absolute left-4 bg-primary px-2 py-1 type-label-xs text-primary-foreground",
        img.badgePosition === "bottom" ? "bottom-4" : "top-4"
      )}
    >
      {img.badge}
    </span>
  )
}

function Tile({ img, className, eager }: { img: GalleryImage; className?: string; eager?: boolean }) {
  return (
    <div className={cn("relative aspect-square bg-secondary", img.span === 2 && "lg:col-span-2", className)}>
      <img
        src={img.src}
        alt={img.alt}
        loading={eager ? "eager" : "lazy"}
        className={cn(
          "size-full",
          img.fit === "contain" ? "object-contain p-10 mix-blend-multiply" : "object-cover"
        )}
      />
      <TileBadge img={img} />
    </div>
  )
}

/**
 * Product gallery.
 * Desktop (lg+): two-column long-scroll grid (a `span: 2` image becomes a full-width hero).
 * Mobile: swipeable carousel with dots, following the non-DYO mobile PDP.
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
        {images.map((img, i) => (
          <Tile key={img.src} img={img} eager={i < 2} />
        ))}
      </div>

      <div className="relative lg:hidden">
        <div
          ref={track}
          onScroll={onScroll}
          className="flex snap-x snap-mandatory overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {images.map((img, i) => (
            <Tile key={img.src} img={img} eager={i === 0} className="w-full shrink-0 snap-center" />
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
