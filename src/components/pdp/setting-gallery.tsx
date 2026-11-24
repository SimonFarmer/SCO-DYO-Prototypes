import { useEffect, useRef, useState, type ReactNode } from "react"
import { Play } from "@phosphor-icons/react"
import { Badge } from "@/components/ui/badge"
import { ImageGalleryOverlay } from "@/components/pdp/image-gallery-overlay"
import { MediaNote } from "@/components/pdp/media-note"
import type { GalleryMedia } from "@/data/products"
import { cn } from "@/lib/utils"

interface SettingGalleryProps {
  media: GalleryMedia[]
  /** Badge on the hero image, e.g. "Previewing: Round ∙ 1.00 ct" */
  previewLabel: string
  /** Stone shape picker shown bottom-right of the hero, level with the badge */
  previewMenu?: ReactNode
  /** Changing the shape scrolls the mobile carousel back to the first slide */
  previewShape?: string
  /** Mobile carousel navigation: thumbnail row below (default) or dots on the image */
  mobileNav?: MobileNav
  className?: string
}

/**
 * How the mobile carousel shows where you are. "thumbnails": a thumbnail row below the slides
 * (Figma SCO Drop 3a – PDP 5492:71771). "dots": no thumbnails, dots bottom-right of the slides and
 * a "+X" count of the photos only seen in the expanded gallery (Figma SCO Drop 3a – PDP 4096:179324).
 */
export type MobileNav = "thumbnails" | "dots"

/** Images open the zoomable gallery; the zoom-in cursor is the only affordance (no on-image icon). */
const zoomTrigger =
  "relative block w-full cursor-zoom-in overflow-clip bg-secondary text-left outline-none focus-visible:ring-3 focus-visible:ring-ring/50"

function useOverlay() {
  const [open, setOpen] = useState(false)
  const [start, setStart] = useState(0)
  /** Bumped on every opening so the overlay re-mounts at the clicked image, unzoomed. */
  const [session, setSession] = useState(0)
  const openAt = (i: number) => {
    setStart(i)
    setSession((n) => n + 1)
    setOpen(true)
  }
  return { open, setOpen, start, session, openAt }
}

function MediaTile({ item, onOpen }: { item: GalleryMedia; onOpen: () => void }) {
  return (
    <button type="button" onClick={onOpen} aria-label={`Enlarge: ${item.alt}`} className={cn(zoomTrigger, "aspect-[401/405]")}>
      <img src={item.src} alt={item.alt} className="absolute inset-0 size-full object-cover mix-blend-multiply" loading="lazy" />
      {item.kind === "video" && (
        <span className="absolute inset-0 flex items-center justify-center">
          <span className="flex size-14 items-center justify-center rounded-full bg-white">
            <img src="/images/icons/play.svg" alt="" className="size-6" />
          </span>
        </span>
      )}
      {item.badge && <MediaNote className="bottom-3 left-3 max-w-[calc(100%-1.5rem)]">{item.badge}</MediaNote>}
    </button>
  )
}

/** Bottom-right corner brightness per image, so each photo is measured once. */
const cornerCache = new Map<string, boolean>()

/**
 * Whether the bottom-right corner of an image is dark (where the carousel dots sit), so the dots
 * can switch to the light colour there. Reads a downscaled copy of the image (same-origin files).
 */
function useDarkCorner(src: string | undefined) {
  // Re-render once a newly measured image lands in the cache.
  const [, setMeasured] = useState(0)
  useEffect(() => {
    if (!src || cornerCache.has(src)) return
    let live = true
    const img = new Image()
    img.onload = () => {
      const size = 48
      const canvas = document.createElement("canvas")
      canvas.width = canvas.height = size
      const ctx = canvas.getContext("2d", { willReadFrequently: true })
      if (!ctx) return
      ctx.drawImage(img, 0, 0, size, size)
      // The dots and "+X" take roughly the right 30% × bottom 10% of a slide.
      const { data } = ctx.getImageData(Math.round(size * 0.7), Math.round(size * 0.9), Math.round(size * 0.3), Math.round(size * 0.1))
      let sum = 0
      for (let i = 0; i < data.length; i += 4) sum += 0.2126 * data[i] + 0.7152 * data[i + 1] + 0.0722 * data[i + 2]
      const isDark = sum / (data.length / 4) < 140
      cornerCache.set(src, isDark)
      if (live) setMeasured((n) => n + 1)
    }
    img.src = src
    return () => {
      live = false
    }
  }, [src])
  return src ? (cornerCache.get(src) ?? false) : false
}

/**
 * Single image + thumbnail strip (Figma 7336:173017 — Drop 3A style gallery, Test 1 variant C).
 * Thumbnails list every media item for the selected metal, so the content matches the long-scroll variants.
 * Photos with a note ("Shown in rose gold, round cut") show it on the main image / carousel slide. Clicking the main image opens the overlay.
 */
const MAX_THUMBS = 4

/**
 * Mobile PDP gallery for every Test 1 variant (Figma SCO Drop 3a – PDP 5492:71771): full-width
 * square slides that swipe with scroll-snap, and a thumbnail row below on the secondary background
 * (4 thumbnails, then "+X More", which opens the gallery overlay). Only the thumbnailed photos swipe
 * inline; the rest are seen in the overlay. Tapping a thumbnail scrolls to that slide; tapping a slide
 * opens the overlay there. "Try it on" from the reference is not built: its slot holds the stone
 * shape picker. With `nav="dots"` the thumbnail row gives way to dots on the slides (see MobileNav).
 */
function MobileCarousel({
  media,
  onOpen,
  previewMenu,
  previewShape,
  nav = "thumbnails",
  className,
}: {
  media: GalleryMedia[]
  onOpen: (index: number) => void
  /** Stone shape picker, bottom-left of the first slide */
  previewMenu?: ReactNode
  /** Changing the shape scrolls back to the first slide, where the preview shows */
  previewShape?: string
  nav?: MobileNav
  className?: string
}) {
  const [index, setIndex] = useState(0)
  const trackRef = useRef<HTMLUListElement>(null)
  const firstShape = useRef(previewShape)
  const goTo = (i: number) => {
    const el = trackRef.current
    if (el) el.scrollTo({ left: el.clientWidth * i, behavior: "smooth" })
  }
  useEffect(() => {
    if (previewShape === firstShape.current) return
    firstShape.current = previewShape
    trackRef.current?.scrollTo({ left: 0, behavior: "smooth" })
  }, [previewShape])
  // Up to 5 items fit as thumbnails; beyond that the 5th slot becomes "+X More".
  const shown = media.length > MAX_THUMBS + 1 ? media.slice(0, MAX_THUMBS) : media
  const hidden = media.length - shown.length
  const darkCorner = useDarkCorner(nav === "dots" ? shown[Math.min(index, shown.length - 1)]?.src : undefined)
  return (
    <div className={cn("bg-secondary", className)}>
      <div className="relative">
        <ul
          ref={trackRef}
          aria-label="Product media"
          className="flex snap-x snap-mandatory overflow-x-auto [scrollbar-width:none]"
          onScroll={(e) => {
            const el = e.currentTarget
            setIndex(Math.round(el.scrollLeft / el.clientWidth))
          }}
        >
          {/* Only the thumbnailed photos swipe inline; the rest open in the expanded gallery ("+X More"). */}
          {shown.map((item, i) => (
            <li key={item.src} className="w-full shrink-0 snap-start">
              <button
                type="button"
                onClick={() => onOpen(i)}
                aria-label={`Enlarge: ${item.alt}`}
                className={cn(zoomTrigger, "aspect-square")}
              >
                <img
                  src={item.src}
                  alt={item.alt}
                  className="absolute inset-0 size-full object-cover mix-blend-multiply"
                  loading={i === 0 ? undefined : "lazy"}
                />
                {item.kind === "video" && (
                  <span className="absolute inset-0 flex items-center justify-center">
                    <span className="flex size-14 items-center justify-center rounded-full bg-white">
                      <img src="/images/icons/play.svg" alt="" className="size-6" />
                    </span>
                  </span>
                )}
                {item.badge && <MediaNote className="bottom-2 left-2 max-w-[calc(100%-1rem)]">{item.badge}</MediaNote>}
              </button>
            </li>
          ))}
        </ul>
        {/* The shape preview only changes the first image, so the picker shows only there
            (Figma's "Try it on" slot, bottom-left). */}
        {previewMenu && index === 0 && <div className="absolute bottom-2 left-2">{previewMenu}</div>}
        {nav === "dots" && (
          // Figma "Right Bottom Items": dots (current one 8px wide), then "+X" for the rest, which opens the gallery.
          // Dark on light photos (as in Figma), light on dark ones: the colour follows the photo under them.
          <div className="absolute right-0 bottom-0 flex h-9 items-center p-2">
            <div className="flex h-5 items-center gap-1 px-2" aria-hidden>
              {shown.map((item, i) => (
                <span
                  key={item.src}
                  className={cn(
                    "h-1 rounded-xs transition-all duration-300",
                    darkCorner ? "bg-primary-foreground" : "bg-primary",
                    i === index ? "w-2" : "w-1 opacity-50",
                  )}
                />
              ))}
            </div>
            {hidden > 0 && (
              <button
                type="button"
                aria-label={`Show ${hidden} more`}
                onClick={() => onOpen(MAX_THUMBS)}
                className={cn(
                  "flex h-5 cursor-pointer items-center type-label-xs transition-colors duration-300",
                  darkCorner ? "text-primary-foreground" : "text-primary",
                )}
              >
                +{hidden}
              </button>
            )}
          </div>
        )}
      </div>
      {nav === "thumbnails" && (
      <ul className="flex gap-1.5 px-2 pb-2" aria-label="Product media thumbnails">
        {shown.map((item, i) => (
          <li key={item.src} className="min-w-0 flex-1">
            <button
              type="button"
              aria-label={`Show ${item.alt}`}
              aria-current={i === index}
              onClick={() => goTo(i)}
              className={cn(
                "relative block aspect-square w-full overflow-clip border bg-primary-foreground",
                i === index ? "border-primary" : "border-transparent",
              )}
            >
              <img src={item.src} alt="" className="size-full object-cover mix-blend-multiply" loading="lazy" />
              {item.kind === "video" && (
                <span className="absolute inset-0 flex items-center justify-center bg-primary/20">
                  <span className="flex size-8 items-center justify-center rounded-full bg-primary text-primary-foreground">
                    <Play className="size-4" weight="fill" />
                  </span>
                </span>
              )}
            </button>
          </li>
        ))}
        {hidden > 0 && (
          <li className="min-w-0 flex-1">
            <button
              type="button"
              aria-label={`Show ${hidden} more`}
              onClick={() => onOpen(MAX_THUMBS)}
              className="flex aspect-square w-full flex-col items-center justify-center border border-transparent bg-primary-foreground type-label-xs text-primary"
            >
              <span>+{hidden}</span>
              <span>More</span>
            </button>
          </li>
        )}
      </ul>
      )}
    </div>
  )
}

export function ThumbnailGallery({
  media,
  previewMenu,
  previewShape,
  className,
}: {
  media: GalleryMedia[]
  /** Stone shape picker, shown only on the first image (top-right on desktop, bottom-left on the mobile carousel) */
  previewMenu?: ReactNode
  /** Changing the shape jumps back to the first image, where the preview shows */
  previewShape?: string
  className?: string
}) {
  const [index, setIndex] = useState(0)
  const [lastShape, setLastShape] = useState(previewShape)
  if (previewShape !== lastShape) {
    setLastShape(previewShape)
    setIndex(0)
  }
  const overlay = useOverlay()
  const current = Math.min(index, media.length - 1)
  const active = media[current]
  // Up to 5 items fit as thumbnails; beyond that the 5th slot becomes "+X More".
  const overflow = media.length > MAX_THUMBS + 1
  const shown = overflow ? media.slice(0, MAX_THUMBS) : media
  const hidden = media.length - shown.length
  return (
    // On desktop the gallery is sticky, so it is capped at the viewport height: the stage shrinks
    // and the thumbnail row always stays on screen (short laptop screens would otherwise hide it).
    <div className={className}>
    {/* Mobile (below lg): swipeable carousel with dots (Figma 2009:35395). */}
    <MobileCarousel media={media} onOpen={overlay.openAt} previewMenu={previewMenu} previewShape={previewShape} className="lg:hidden" />
    <div className="hidden flex-col bg-secondary transition-[max-height] duration-300 ease-out lg:flex lg:max-h-[calc(100svh-var(--header-offset))]">
      {/* Figma stage: 810×656, 80px side padding, 16px bottom, square image centred.
          Square only on phones; from md up the Figma ratio keeps the photo from being
          upscaled past its native ~1000px when the gallery spans the full width (md–lg). */}
      <div className="relative flex min-h-0 flex-col">
      <button
        type="button"
        onClick={() => overlay.openAt(current)}
        aria-label={`Enlarge: ${active.alt}`}
        className={cn(zoomTrigger, "aspect-square min-h-0 md:aspect-[810/656]")}
      >
        <span className="absolute inset-0 flex justify-center px-10 pb-4 md:px-20">
          {/* Square box the size of the photo, so the note sits on the photo, not on the stage margin. */}
          <span className="relative aspect-square h-full max-w-full">
            <img key={active.src} src={active.src} alt={active.alt} className="size-full object-contain mix-blend-multiply" />
            {active.badge && <MediaNote className="bottom-3 left-3 max-w-[calc(100%-1.5rem)]">{active.badge}</MediaNote>}
          </span>
        </span>
        {active.kind === "video" && (
          <span className="absolute inset-0 flex items-center justify-center">
            <span className="flex size-14 items-center justify-center rounded-full bg-white">
              <img src="/images/icons/play.svg" alt="" className="size-6" />
            </span>
          </span>
        )}
      </button>
      {/* Top-right of the stage, clear of the centred thumbnail row below. Only on the first image,
          the one the shape preview changes. */}
      {previewMenu && current === 0 && <div className="absolute top-4 right-4">{previewMenu}</div>}
      </div>
      {/* Figma 2577:54421: 4 thumbnails, then a "+X More" tile that opens the gallery overlay. */}
      <div className="flex shrink-0 justify-center px-4 pb-8">
        <ul className="flex w-full justify-center gap-2" aria-label="Product media">
          {shown.map((item, i) => (
            <li key={item.src} className="min-w-0 max-w-16 flex-1">
              <button
                type="button"
                aria-label={`Show ${item.alt}`}
                aria-current={i === current}
                onClick={() => setIndex(i)}
                className={cn(
                  "relative block aspect-square w-full overflow-clip border bg-primary-foreground",
                  i === current ? "border-primary" : "border-transparent hover:border-border-subtle",
                )}
              >
                <img src={item.src} alt="" className="size-full object-cover mix-blend-multiply" loading="lazy" />
                {item.kind === "video" && (
                  <span className="absolute inset-0 flex items-center justify-center">
                    <span className="flex size-8 items-center justify-center rounded-full bg-primary text-primary-foreground">
                      <Play className="size-4" weight="fill" />
                    </span>
                  </span>
                )}
              </button>
            </li>
          ))}
          {hidden > 0 && (
            <li className="min-w-0 max-w-16 flex-1">
              <button
                type="button"
                aria-label={`Show ${hidden} more`}
                onClick={() => overlay.openAt(MAX_THUMBS)}
                className="flex aspect-square w-full flex-col items-center justify-center border border-transparent bg-primary-foreground type-label-xs text-primary hover:border-border-subtle"
              >
                <span>+{hidden}</span>
                <span>More</span>
              </button>
            </li>
          )}
        </ul>
      </div>
    </div>
      <ImageGalleryOverlay key={overlay.session} media={media} open={overlay.open} onOpenChange={overlay.setOpen} startIndex={overlay.start} />
    </div>
  )
}

/**
 * Settings PDP long-scroll gallery (Test 1 variants A and B): hero image + 2-column grid of supporting media.
 * Every image opens the zoomable gallery overlay at that image.
 */
export function SettingGallery({ media, previewLabel, previewMenu, previewShape, mobileNav, className }: SettingGalleryProps) {
  const [hero, ...rest] = media
  const overlay = useOverlay()
  return (
    <div className={className}>
    {/* Mobile (below lg): carousel + thumbnails, same as variant C (Figma 5492:71771), or with dots (mobileNav). */}
    <MobileCarousel media={media} onOpen={overlay.openAt} previewMenu={previewMenu} previewShape={previewShape} nav={mobileNav} className="lg:hidden" />
    <div className="hidden flex-col gap-2 px-2 pb-8 lg:flex">
      <div className="relative">
        <button type="button" onClick={() => overlay.openAt(0)} aria-label={`Enlarge: ${hero.alt}`} className={cn(zoomTrigger, "aspect-square")}>
          <img src={hero.src} alt={hero.alt} className="absolute inset-0 size-full object-cover mix-blend-multiply" />
        </button>
        {/* Badge and shape picker share a row along the bottom of the hero (Figma 7247:101450).
            The hero is taller than the first fold, so the row sticks to the bottom of the viewport while
            the hero is on screen: the picker is reachable without scrolling and the stone being previewed
            stays in view above it. Once the hero's bottom scrolls up, the row settles back in place.
            (-mt-12 = row height + bottom-2, mb-2 gives the 8px back, so the hero keeps its size.) */}
        <div className="pointer-events-none sticky bottom-2 z-10 mx-4 -mt-12 mb-2 flex items-center justify-between gap-2">
          <Badge className="max-lg:hidden">{previewLabel}</Badge>
          {previewMenu && <div className="pointer-events-auto ml-auto">{previewMenu}</div>}
        </div>
      </div>
      <div className="grid grid-cols-2 gap-2">
        {rest.map((item, i) => (
          <MediaTile key={item.src} item={item} onOpen={() => overlay.openAt(i + 1)} />
        ))}
      </div>
    </div>
      <ImageGalleryOverlay key={overlay.session} media={media} open={overlay.open} onOpenChange={overlay.setOpen} startIndex={overlay.start} />
    </div>
  )
}
