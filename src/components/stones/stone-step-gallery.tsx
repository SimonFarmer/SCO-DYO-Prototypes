import { useEffect, useMemo, useState } from "react"
import { ImageGalleryOverlay } from "@/components/pdp/image-gallery-overlay"
import { SettingGallery, ThumbnailGallery } from "@/components/pdp/setting-gallery"
import { Badge } from "@/components/ui/badge"
import { FINISHING_GALLERY, REVIEW_GALLERY } from "@/data/dyo"
import type { GalleryMedia } from "@/data/products"
import { useIsDesktop } from "@/lib/hooks"
import { formatSize, gemById, previewImage, sizeScale, stoneShape, stoneType, type StoneTypeId } from "@/data/stones"

/** How the stone step shows its media. */
export type StoneGalleryMode =
  /** Preferences (2a): the live preview alone, large, so it can be watched while the handles move */
  | "preview"
  /** Recommendations (2b): every image (Test 1's long-scroll grid on desktop, image + thumbnails on mobile) */
  | "full"

/**
 * Stone step gallery. The first image is Shane Co.'s own render of this ring with the chosen stone, shape
 * and size (shaneco.com "Preview with Shape / Gemstone / Size"); diamonds then show the 360 view, close-up,
 * size guide and the two proportion diagrams (Figma 7685:412972), and gemstones the setting photos and two
 * size comparisons. In "preview" mode those extra images are kept but not shown.
 */
export function StoneStepGallery({
  type,
  shape,
  size,
  gem,
  previewNote,
  mode = "preview",
}: {
  type: StoneTypeId
  shape: string
  /** Carats for diamonds, millimetres for gemstones */
  size: number
  gem?: string
  /** e.g. "middle of your range" when the shopper chose a range, not one size */
  previewNote?: string
  mode?: StoneGalleryMode
}) {
  const scale = sizeScale(type, gem)
  const what = type === "gemstone" ? gemById(gem).label : stoneType(type).noun
  const shown = formatSize(size, scale.unit)
  // Test 1's badge style ("Previewing: Round ∙ 1.00 ct"), naming the gem for gemstones; short enough for phones.
  const previewLabel = `Previewing: ${type === "gemstone" ? `${what} · ` : ""}${stoneShape(shape).label} · ${shown}${previewNote ? `, ${previewNote}` : ""}`

  const media = useMemo<GalleryMedia[]>(() => {
    const hero: GalleryMedia = {
      kind: "image",
      src: previewImage(type, shape, size, gem),
      alt: `Timeless Solitaire ring previewed with a ${shown} ${stoneShape(shape).label.toLowerCase()} ${what.toLowerCase()}`,
    }
    if (type === "gemstone") {
      // The diamond photography and diagrams don't apply, and Shane Co. renders only this one view of a gem,
      // so gemstones get the setting photos (labelled as shown with a diamond) and the same gem one size
      // either side, as a size comparison. A long gallery also lets the buy form stick, as it does for diamonds.
      const [front, top] = [REVIEW_GALLERY[0], REVIEW_GALLERY[6]]
      const below = size - 1 >= scale.min ? size - 1 : size + 2
      const above = size + 1 <= scale.max ? size + 1 : size - 2
      const compare = [below, above]
        .sort((x, y) => x - y)
        .map<GalleryMedia>((v) => ({
          kind: "image",
          src: previewImage(type, shape, v, gem),
          alt: `The ring with a ${formatSize(v, scale.unit)} ${stoneShape(shape).label.toLowerCase()} ${what.toLowerCase()}, for size comparison`,
          badge: `${formatSize(v, scale.unit)} for comparison`,
        }))
      return [
        hero,
        { kind: "image", src: front.src, alt: "Timeless Solitaire setting, front view", badge: "Shown with round diamond" },
        { kind: "image", src: top.src, alt: "Timeless Solitaire setting, top view", badge: "Shown with round diamond" },
        ...compare,
      ]
    }
    const [video, diamondTop, , sizeGuide] = FINISHING_GALLERY.tiles
    return [
      hero,
      // The 360 still already carries its play button.
      // The 360 view and close-up are of the chosen diamond, so they're labelled with it ("Round · 1.25 ct").
      { kind: "image", src: video.src, alt: `360° view of the ${shown} ${stoneShape(shape).label.toLowerCase()} diamond`, badge: `${stoneShape(shape).label} · ${shown}` },
      { kind: "image", src: diamondTop.src, alt: `${shown} ${stoneShape(shape).label.toLowerCase()} diamond, top view`, badge: `${stoneShape(shape).label} · ${shown}` },
      { kind: "image", src: sizeGuide.src, alt: sizeGuide.alt },
      { kind: "image", src: REVIEW_GALLERY[4].src, alt: REVIEW_GALLERY[4].alt },
      { kind: "image", src: REVIEW_GALLERY[5].src, alt: REVIEW_GALLERY[5].alt },
    ]
  }, [type, shape, size, gem, shown, what, scale.min, scale.max, scale.unit])

  // Warm every size of the current stone and shape so dragging the size handle swaps the hero without a blank frame.
  useEffect(() => {
    for (let v = scale.min; v <= scale.max + 1e-9; v += scale.step) {
      const img = new Image()
      img.src = previewImage(type, shape, v, gem)
    }
  }, [type, shape, gem, scale.min, scale.max, scale.step])

  const isDesktop = useIsDesktop()

  if (mode === "preview") return <PreviewStage hero={media[0]} label={previewLabel} />
  if (isDesktop) return <SettingGallery media={media} previewLabel={previewLabel} />
  // Mobile: Test 1 C's image + thumbnail strip. Keyed by the preview, so changing the stone, shape or
  // size brings the stage back to it.
  return <ThumbnailGallery key={media[0].src} media={media} />
}

/**
 * The live preview on its own: one large image (opens the zoom overlay), capped at the viewport height on
 * desktop so the whole ring stays on screen while the layout keeps it in view.
 */
function PreviewStage({ hero, label }: { hero: GalleryMedia; label: string }) {
  const [open, setOpen] = useState(false)
  const [session, setSession] = useState(0)
  return (
    <div className="bg-secondary">
      <button
        type="button"
        onClick={() => {
          setSession((n) => n + 1)
          setOpen(true)
        }}
        aria-label={`Enlarge: ${hero.alt}`}
        className="relative block aspect-square w-full cursor-zoom-in overflow-clip outline-none focus-visible:ring-3 focus-visible:ring-ring/50 lg:max-h-[calc(100svh-var(--header-offset)-var(--spacing)*4)]"
      >
        <img src={hero.src} alt={hero.alt} className="absolute inset-0 size-full object-contain mix-blend-multiply" />
        <Badge className="absolute bottom-2 left-4">{label}</Badge>
      </button>
      <ImageGalleryOverlay key={session} media={[hero]} open={open} onOpenChange={setOpen} startIndex={0} />
    </div>
  )
}
