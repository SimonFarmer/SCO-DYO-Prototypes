import { useRef, useState } from "react"
import { CaretLeft, CaretRight, MagnifyingGlassMinus, MagnifyingGlassPlus, Play, X } from "@phosphor-icons/react"
import { Dialog, DialogClose, DialogContent, DialogTitle } from "@/components/ui/dialog"
import { MediaNote } from "@/components/pdp/media-note"
import type { GalleryMedia } from "@/data/products"
import { cn } from "@/lib/utils"

interface ImageGalleryOverlayProps {
  media: GalleryMedia[]
  open: boolean
  onOpenChange: (open: boolean) => void
  /** Index shown on open. Re-mount (change `key`) per opening so state starts fresh. */
  startIndex: number
}

const ZOOM = 2.5

/**
 * Full-screen image gallery with zoom (Figma "SCO Drop 3a – PDP", Image Gallery · Zoom Overlay, 3295:111014).
 * Counter top-left, zoom + close top-right, vertical thumbnails on desktop, prev/next arrows.
 * Zoom: click the image or the magnifier; while zoomed, the image pans with the pointer.
 * Mobile (below lg, Figma SCO Drop 3a – PDP 2019:7548): counter + white 48px close top-right,
 * square image between 80px top / 96px bottom, 64px thumbnails along the bottom, swipe to change
 * image (no arrows, no zoom button).
 * "Try it on" from the reference is a separate feature and is not part of these prototypes.
 */
export function ImageGalleryOverlay({ media, open, onOpenChange, startIndex }: ImageGalleryOverlayProps) {
  const [index, setIndex] = useState(startIndex)
  const [zoomed, setZoomed] = useState(false)
  const [origin, setOrigin] = useState({ x: 50, y: 50 })
  const stageRef = useRef<HTMLDivElement>(null)
  /** The photo's own box: zoom origin is measured against it (the stage also has margins around it). */
  const photoRef = useRef<HTMLDivElement>(null)
  /** Horizontal swipe on the stage (touch / pen): start x, and whether the gesture was a swipe. */
  const swipe = useRef<{ x: number; moved: boolean } | null>(null)
  const item = media[Math.min(index, media.length - 1)]

  const go = (d: number) => {
    setZoomed(false)
    setIndex((i) => (i + d + media.length) % media.length)
  }

  const pan = (e: React.PointerEvent) => {
    const r = photoRef.current?.getBoundingClientRect()
    if (!r) return
    const pct = (v: number) => Math.min(100, Math.max(0, v * 100))
    setOrigin({ x: pct((e.clientX - r.left) / r.width), y: pct((e.clientY - r.top) / r.height) })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        className="top-0 left-0 flex h-dvh w-full max-w-none translate-x-0 translate-y-0 flex-col gap-0 bg-secondary p-0 text-primary ring-0 md:max-w-none data-open:zoom-in-100 data-closed:zoom-out-100"
        onKeyDown={(e) => {
          if (e.key === "ArrowRight") go(1)
          if (e.key === "ArrowLeft") go(-1)
        }}
      >
        <DialogTitle className="sr-only">Product images</DialogTitle>

        {/* Top bar */}
        <div className="absolute inset-x-0 top-0 z-20 flex items-center justify-end gap-4 px-4 pt-4 lg:justify-between lg:px-10 lg:pt-10">
          <p
            className="type-label-xs text-primary [font-variant-numeric:tabular-nums] lg:text-base lg:font-normal lg:tracking-[1px]"
            aria-live="polite"
          >
            {index + 1} / {media.length}
          </p>
          <div className="flex items-center gap-4">
            <button
              type="button"
              aria-label={zoomed ? "Zoom out" : "Zoom in"}
              aria-pressed={zoomed}
              disabled={item.kind === "video"}
              onClick={() => setZoomed((z) => !z)}
              className="hidden size-8 items-center justify-center disabled:opacity-30 lg:flex"
            >
              {zoomed ? <MagnifyingGlassMinus className="size-5" /> : <MagnifyingGlassPlus className="size-5" />}
            </button>
            <DialogClose
              aria-label="Close gallery"
              className="flex size-12 items-center justify-center bg-primary-foreground lg:size-8 lg:bg-transparent"
            >
              <X className="size-6 lg:size-5" />
            </DialogClose>
          </div>
        </div>

        <div className="relative flex min-h-0 flex-1">
          {/* Vertical thumbnails (desktop) */}
          <ul
            aria-label="Gallery images"
            className="absolute top-1/2 left-10 z-20 hidden -translate-y-1/2 flex-col gap-2 lg:flex"
          >
            {media.map((m, i) => (
              <li key={m.src}>
                <button
                  type="button"
                  aria-label={`Show ${m.alt}`}
                  aria-current={i === index}
                  onClick={() => {
                    setZoomed(false)
                    setIndex(i)
                  }}
                  className={cn(
                    "relative block size-14 overflow-clip border bg-primary-foreground",
                    i === index ? "border-primary" : "border-transparent hover:border-border-subtle",
                  )}
                >
                  <img src={m.src} alt="" className="size-full object-cover mix-blend-multiply" />
                  {m.kind === "video" && (
                    <span className="absolute inset-0 flex items-center justify-center">
                      <span className="flex size-6 items-center justify-center rounded-full bg-primary text-primary-foreground">
                        <Play className="size-3" weight="fill" />
                      </span>
                    </span>
                  )}
                </button>
              </li>
            ))}
          </ul>

          {/* Stage */}
          <div
            ref={stageRef}
            onPointerDown={(e) => {
              if (e.pointerType !== "mouse") swipe.current = { x: e.clientX, moved: false }
            }}
            onPointerMove={(e) => {
              if (zoomed) pan(e)
              if (swipe.current && Math.abs(e.clientX - swipe.current.x) > 10) swipe.current.moved = true
            }}
            onPointerUp={(e) => {
              const s = swipe.current
              if (!s?.moved || zoomed) return
              const dx = e.clientX - s.x
              if (Math.abs(dx) > 40 && media.length > 1) go(dx < 0 ? 1 : -1)
            }}
            onClick={(e) => {
              const swiped = swipe.current?.moved
              swipe.current = null
              if (swiped || item.kind === "video") return
              pan(e as unknown as React.PointerEvent)
              setZoomed((z) => !z)
            }}
            className={cn(
              "relative flex flex-1 touch-pan-y items-center justify-center overflow-hidden pt-20 pb-24 lg:py-0",
              item.kind !== "video" && (zoomed ? "cursor-zoom-out" : "cursor-zoom-in"),
            )}
          >
            {/* A square box the size of the photo (full width on mobile, full height on desktop), so the note sits on the photo. */}
            <div ref={photoRef} className="relative aspect-square max-h-full w-full lg:h-full lg:w-auto lg:max-w-full">
              <img
                key={item.src}
                src={item.src}
                alt={item.alt}
                draggable={false}
                className="h-full max-h-full w-full object-contain mix-blend-multiply transition-transform duration-200 ease-out select-none"
                style={{ transform: zoomed ? `scale(${ZOOM})` : undefined, transformOrigin: `${origin.x}% ${origin.y}%` }}
              />
              {item.badge && !zoomed && (
                <MediaNote className="bottom-3 left-4 max-w-[calc(100%-2rem)] lg:bottom-6 lg:left-6">{item.badge}</MediaNote>
              )}
            </div>
            {item.kind === "video" && (
              <span className="pointer-events-none absolute inset-0 flex items-center justify-center">
                <span className="flex size-14 items-center justify-center rounded-full bg-white">
                  <img src="/images/icons/play.svg" alt="" className="size-6" />
                </span>
              </span>
            )}
          </div>

          {/* Prev / next */}
          {media.length > 1 && (
            <>
              <button
                type="button"
                aria-label="Previous image"
                onClick={() => go(-1)}
                className="absolute top-1/2 left-3 z-20 hidden size-10 -translate-y-1/2 items-center justify-center bg-background lg:left-36 lg:flex"
              >
                <CaretLeft className="size-4" />
              </button>
              <button
                type="button"
                aria-label="Next image"
                onClick={() => go(1)}
                className="absolute top-1/2 right-3 z-20 hidden size-10 -translate-y-1/2 items-center justify-center bg-background lg:right-36 lg:flex"
              >
                <CaretRight className="size-4" />
              </button>
            </>
          )}

          {/* Horizontal thumbnails (mobile), 16px from the bottom */}
          <ul
            aria-label="Gallery images"
            className="absolute inset-x-0 bottom-4 z-20 flex justify-center-safe gap-2 overflow-x-auto px-4 [scrollbar-width:none] lg:hidden"
          >
            {media.map((m, i) => (
              <li key={m.src} className="shrink-0">
                <button
                  type="button"
                  aria-label={`Show ${m.alt}`}
                  aria-current={i === index}
                  onClick={() => {
                    setZoomed(false)
                    setIndex(i)
                  }}
                  className={cn(
                    "relative block size-16 overflow-clip border bg-primary-foreground",
                    i === index ? "border-primary" : "border-transparent",
                  )}
                >
                  <img src={m.src} alt="" className="size-full object-cover mix-blend-multiply" />
                  {m.kind === "video" && (
                    <span className="absolute inset-0 flex items-center justify-center">
                      <span className="flex size-6 items-center justify-center rounded-full bg-primary text-primary-foreground">
                        <Play className="size-3" weight="fill" />
                      </span>
                    </span>
                  )}
                </button>
              </li>
            ))}
          </ul>
        </div>
      </DialogContent>
    </Dialog>
  )
}
