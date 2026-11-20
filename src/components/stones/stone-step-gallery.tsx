import { useEffect, useMemo, useState } from "react"
import { ImageGalleryOverlay } from "@/components/pdp/image-gallery-overlay"
import { SettingGallery, ThumbnailGallery } from "@/components/pdp/setting-gallery"
import { Badge } from "@/components/ui/badge"
import { FINISHING_GALLERY, REVIEW_GALLERY } from "@/data/dyo"
import type { GalleryMedia } from "@/data/products"
import { useIsDesktop } from "@/lib/hooks"
import { formatSize, gemById, previewImage, sizeScale, stonePhotos, stoneShape, stoneType, type StoneTypeId } from "@/data/stones"

/** Shane Co.'s gemstone size guide (shaneco.com loose gemstone pages). */
const GEM_SIZE_GUIDE = "/images/stones/gemstone/size-guide.jpg"

/** How the stone step shows its media. */
export type StoneGalleryMode =
  /** Preferences (2a): the live preview alone, large, so it can be watched while the handles move */
  | "preview"
  /** Recommendations (2b): every image (Test 1's long-scroll grid on desktop, image + thumbnails on mobile) */
  | "full"

/**
 * Stone step gallery. The first image is Shane Co.'s own render of this ring with the chosen stone, shape
 * and size (shaneco.com "Preview with Shape / Gemstone / Size"). Then, as on Shane Co.'s loose stone pages,
 * a 360° view and a face-up photo of a stone of that shape (and gem), and the size guide; diamonds also
 * show the two proportion diagrams (Figma 7685:412972). In "preview" mode only the ring is shown.
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
    // The chosen stone: the first frame of its 360° spin and its face-up photo, labelled with it.
    const shapeName = stoneShape(shape).label
    const label = `${type === "gemstone" ? `${what} · ` : ""}${shapeName} · ${shown}`
    const noun = `${shown} ${shapeName.toLowerCase()} ${what.toLowerCase()}`
    const photos = stonePhotos(type, shape, gem)
    const stone: GalleryMedia[] = photos
      ? [
          { kind: "video", src: photos.spin, alt: `360° view of the ${noun}`, badge: label },
          { kind: "image", src: photos.faceUp, alt: `The ${noun}, face up`, badge: label },
        ]
      : []
    if (type === "gemstone") {
      // Shane Co. shows one gemstone size guide (sapphires, 6×4 mm to 10×8 mm) on every gemstone.
      return [hero, ...stone, { kind: "size-guide", src: GEM_SIZE_GUIDE, alt: "Gemstone size guide on the hand, 6×4 mm to 10×8 mm" }]
    }
    // Diamonds: the carat size guide and the two proportion diagrams (examples for now).
    const sizeGuide = FINISHING_GALLERY.tiles[3]
    return [
      hero,
      ...stone,
      { kind: "size-guide", src: sizeGuide.src, alt: sizeGuide.alt },
      { kind: "image", src: REVIEW_GALLERY[4].src, alt: REVIEW_GALLERY[4].alt },
      { kind: "image", src: REVIEW_GALLERY[5].src, alt: REVIEW_GALLERY[5].alt },
    ]
  }, [type, shape, size, gem, shown, what])

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
