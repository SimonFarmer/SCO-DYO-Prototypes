import { useState } from "react"
import { Play } from "@phosphor-icons/react"
import { Badge } from "@/components/ui/badge"
import { ImageGalleryOverlay } from "@/components/pdp/image-gallery-overlay"
import type { GalleryMedia } from "@/data/products"
import { cn } from "@/lib/utils"

interface SettingGalleryProps {
  media: GalleryMedia[]
  /** Badge on the hero image, e.g. "Previewing: Round ∙ 1.00 ct" */
  previewLabel: string
  className?: string
}

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
      {item.badge && <Badge className="absolute bottom-3 left-3">{item.badge}</Badge>}
    </button>
  )
}

/**
 * Single image + thumbnail strip (Figma 7336:173017 — Drop 3A style gallery, Test 1 variant C).
 * Thumbnails list every media item for the selected metal, so the content matches the long-scroll variants.
 * No annotation badges ("Shown with 2ct diamond"…) in this gallery. Clicking the main image opens the overlay.
 */
export function ThumbnailGallery({ media, className }: { media: GalleryMedia[]; className?: string }) {
  const [index, setIndex] = useState(0)
  const overlay = useOverlay()
  const current = Math.min(index, media.length - 1)
  const active = media[current]
  return (
    // On desktop the gallery is sticky, so it is capped at the viewport height: the stage shrinks
    // and the thumbnail row always stays on screen (short laptop screens would otherwise hide it).
    <div className={cn("flex flex-col bg-secondary transition-[max-height] duration-300 ease-out lg:max-h-[calc(100svh-var(--header-offset))]", className)}>
      {/* Figma stage: 810×656, 80px side padding, 16px bottom, square image centred.
          Square only on phones; from md up the Figma ratio keeps the photo from being
          upscaled past its native ~1000px when the gallery spans the full width (md–lg). */}
      <button
        type="button"
        onClick={() => overlay.openAt(current)}
        aria-label={`Enlarge: ${active.alt}`}
        className={cn(zoomTrigger, "aspect-square min-h-0 md:aspect-[810/656]")}
      >
        <span className="absolute inset-0 flex justify-center px-10 pb-4 md:px-20">
          <img key={active.src} src={active.src} alt={active.alt} className="size-full object-contain mix-blend-multiply" />
        </span>
        {active.kind === "video" && (
          <span className="absolute inset-0 flex items-center justify-center">
            <span className="flex size-14 items-center justify-center rounded-full bg-white">
              <img src="/images/icons/play.svg" alt="" className="size-6" />
            </span>
          </span>
        )}
      </button>
      <div className="flex shrink-0 justify-center px-4 pb-8">
        <ul className="flex flex-wrap justify-center gap-2" aria-label="Product media">
          {media.map((item, i) => (
            <li key={item.src}>
              <button
                type="button"
                aria-label={`Show ${item.alt}`}
                aria-current={i === current}
                onClick={() => setIndex(i)}
                className={cn(
                  "relative block size-16 overflow-clip border bg-primary-foreground",
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
        </ul>
      </div>
      <ImageGalleryOverlay key={overlay.session} media={media} open={overlay.open} onOpenChange={overlay.setOpen} startIndex={overlay.start} />
    </div>
  )
}

/**
 * Settings PDP long-scroll gallery (Test 1 variants A and B): hero image + 2-column grid of supporting media.
 * Every image opens the zoomable gallery overlay at that image.
 */
export function SettingGallery({ media, previewLabel, className }: SettingGalleryProps) {
  const [hero, ...rest] = media
  const overlay = useOverlay()
  return (
    <div className={cn("flex flex-col gap-2 px-2 pb-8", className)}>
      <button type="button" onClick={() => overlay.openAt(0)} aria-label={`Enlarge: ${hero.alt}`} className={cn(zoomTrigger, "aspect-square")}>
        <img src={hero.src} alt={hero.alt} className="absolute inset-0 size-full object-cover mix-blend-multiply" />
        <Badge className="absolute bottom-2 left-4">{previewLabel}</Badge>
      </button>
      <div className="grid grid-cols-2 gap-2">
        {rest.map((item, i) => (
          <MediaTile key={item.src} item={item} onOpen={() => overlay.openAt(i + 1)} />
        ))}
      </div>
      <ImageGalleryOverlay key={overlay.session} media={media} open={overlay.open} onOpenChange={overlay.setOpen} startIndex={overlay.start} />
    </div>
  )
}
