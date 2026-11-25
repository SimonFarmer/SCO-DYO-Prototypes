import { useRef, useState } from "react"
import type { GalleryImage } from "@/data/dyo"
import { GalleryCounter } from "@/components/shared/gallery-counter"
import { GalleryNotes } from "@/components/shared/gallery-notes"
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

function Tile({ img, className, eager, badge = true }: { img: GalleryImage; className?: string; eager?: boolean; badge?: boolean }) {
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
      {badge && <TileBadge img={img} />}
    </div>
  )
}

/**
 * Product gallery.
 * Desktop (lg+): two-column long-scroll grid (a `span: 2` image becomes a full-width hero).
 * Mobile: swipeable carousel with a "1 / 4" counter bottom-right (Figma 8242:61615); the tile labels
 * stay put bottom-left and fade with the swipe instead of sliding (same as Test 1 A's carousel).
 */
export function ProductGallery({ images }: { images: GalleryImage[] }) {
  const track = useRef<HTMLDivElement>(null)
  const [index, setIndex] = useState(0)
  /** Scroll position in slides (fractional mid-swipe), so the labels fade with the swipe. */
  const [pos, setPos] = useState(0)

  const onScroll = () => {
    const el = track.current
    if (!el) return
    const p = el.scrollLeft / el.clientWidth
    setPos(p)
    setIndex(Math.round(p))
  }

  const current = images[Math.min(index, images.length - 1)]

  return (
    <>
      <div className="hidden grid-cols-2 gap-2 p-2 lg:grid">
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
            <Tile key={img.src} img={img} eager={i === 0} badge={false} className="w-full shrink-0 snap-center" />
          ))}
        </div>
        <GalleryNotes notes={images.map((img) => img.badge)} pos={pos} index={index} />
        {/* "Contain" photos sit inset on the plain background, so their corner needs no measuring. */}
        <GalleryCounter index={index} total={images.length} src={current?.fit === "contain" ? undefined : current?.src} />
      </div>
    </>
  )
}
