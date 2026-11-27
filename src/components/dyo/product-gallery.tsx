import { useRef, useState } from "react"
import type { GalleryImage } from "@/data/dyo"
import type { GalleryMedia } from "@/data/products"
import { ImageGalleryOverlay } from "@/components/pdp/image-gallery-overlay"
import { GalleryCounter } from "@/components/shared/gallery-counter"
import { GalleryNotes } from "@/components/shared/gallery-notes"
import { SpinViewer } from "@/components/shared/spin-viewer"
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

function Tile({
  img,
  className,
  eager,
  badge = true,
  onOpen,
}: {
  img: GalleryImage
  className?: string
  eager?: boolean
  badge?: boolean
  /** Expandable gallery: clicking the photo opens it in the overlay (zoom-in cursor, as the PDP galleries) */
  onOpen?: () => void
}) {
  const photo = (
    <img
      src={img.src}
      alt={img.alt}
      loading={eager ? "eager" : "lazy"}
      className={cn("size-full", img.fit === "contain" ? "object-contain p-10 mix-blend-multiply" : "object-cover")}
    />
  )
  return (
    <div className={cn("relative aspect-square bg-secondary", img.span === 2 && "lg:col-span-2", className)}>
      {img.spin ? (
        // The 3D stone keeps its own play and drag (in the overlay too, reached from the other tiles).
        <SpinViewer frames={img.spin.frames} start={img.spin.start} alt={img.alt} />
      ) : onOpen ? (
        <button
          type="button"
          onClick={onOpen}
          aria-label={`Enlarge: ${img.alt}`}
          className="block size-full cursor-zoom-in outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
        >
          {photo}
        </button>
      ) : (
        photo
      )}
      {badge && <TileBadge img={img} />}
    </div>
  )
}

/** The overlay's media for the gallery: the photos and the 3D stone (notes where they're plain text). */
const toMedia = (img: GalleryImage): GalleryMedia => ({
  kind: "image",
  src: img.src,
  alt: img.alt,
  badge: typeof img.badge === "string" ? img.badge : undefined,
  spin: img.spin,
})

/**
 * Product gallery.
 * Desktop (lg+): two-column long-scroll grid (a `span: 2` image becomes a full-width hero).
 * Mobile: swipeable carousel with a "1 / 4" counter bottom-right (Figma 8242:61615); the tile labels
 * stay put bottom-left and fade with the swipe instead of sliding (same as Test 1 A's carousel).
 * `expandable`: a click (tap) on a photo opens the zoomable gallery overlay at it, as the PDP and stone step galleries.
 */
export function ProductGallery({ images, expandable }: { images: GalleryImage[]; expandable?: boolean }) {
  const track = useRef<HTMLDivElement>(null)
  const [index, setIndex] = useState(0)
  /** Scroll position in slides (fractional mid-swipe), so the labels fade with the swipe. */
  const [pos, setPos] = useState(0)
  const [overlay, setOverlay] = useState({ open: false, start: 0, session: 0 })
  /** A tile's click handler: opens the overlay at it (a fresh session, so it starts there unzoomed). */
  const openAt = (i: number) => (expandable ? () => setOverlay((o) => ({ open: true, start: i, session: o.session + 1 })) : undefined)

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
          <Tile key={img.src} img={img} eager={i < 2} onOpen={openAt(i)} />
        ))}
      </div>

      <div className="relative lg:hidden">
        <div
          ref={track}
          onScroll={onScroll}
          className="flex snap-x snap-mandatory overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {images.map((img, i) => (
            <Tile key={img.src} img={img} eager={i === 0} badge={false} onOpen={openAt(i)} className="w-full shrink-0 snap-center" />
          ))}
        </div>
        <GalleryNotes notes={images.map((img) => img.badge)} pos={pos} index={index} />
        {/* "Contain" photos sit inset on the plain background, so their corner needs no measuring. */}
        <GalleryCounter index={index} total={images.length} src={current?.fit === "contain" ? undefined : current?.src} />
      </div>

      {expandable && (
        <ImageGalleryOverlay
          key={overlay.session}
          media={images.map(toMedia)}
          open={overlay.open}
          onOpenChange={(open) => setOverlay((o) => ({ ...o, open }))}
          startIndex={overlay.start}
        />
      )}
    </>
  )
}
