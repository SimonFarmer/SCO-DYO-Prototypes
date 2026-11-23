import { useEffect, useMemo, useState } from "react"
import { ImageGalleryOverlay } from "@/components/pdp/image-gallery-overlay"
import { SettingGallery, ThumbnailGallery } from "@/components/pdp/setting-gallery"
import type { StoneGalleryMode } from "@/components/stones/stone-step-gallery"
import { Badge } from "@/components/ui/badge"
import { FINISHING_GALLERY, REVIEW_GALLERY } from "@/data/dyo"
import type { GalleryMedia } from "@/data/products"
import { formatSize, sizeScale, stoneShape } from "@/data/stones"
import { ellaPreview } from "@/flow/ring-images"
import { useIsDesktop } from "@/lib/hooks"
import { useRingBuild } from "@/state/ring-build"


/**
 * Full DYO flow · stone step gallery. A copy of the shared StoneStepGallery (components/stones), which renders
 * Test 2's Timeless Solitaire, so the flow previews the ring actually being built: Ella Cathedral in the chosen
 * metal (shaneco.com serves the same "Preview with" render for any setting item). Natural diamonds only.
 */
export function FlowStoneGallery({ shape, size, previewNote, mode = "preview" }: { shape: string; size: number; previewNote?: string; mode?: StoneGalleryMode }) {
  const { setting } = useRingBuild()
  const scale = sizeScale("natural")
  const shown = formatSize(size, scale.unit)
  const label = stoneShape(shape).label
  const previewLabel = `Previewing: ${label} · ${shown}${previewNote ? `, ${previewNote}` : ""}`

  const media = useMemo<GalleryMedia[]>(() => {
    const hero: GalleryMedia = {
      kind: "image",
      src: ellaPreview(setting.article, shape, size),
      alt: `${setting.name} in ${setting.metal.toLowerCase()}, previewed with a ${shown} ${label.toLowerCase()} diamond`,
    }
    const [video, diamondTop, , sizeGuide] = FINISHING_GALLERY.tiles
    return [
      hero,
      { kind: "image", src: video.src, alt: `360° view of the ${shown} ${label.toLowerCase()} diamond`, badge: `${label} · ${shown}` },
      { kind: "image", src: diamondTop.src, alt: `${shown} ${label.toLowerCase()} diamond, top view`, badge: `${label} · ${shown}` },
      { kind: "image", src: sizeGuide.src, alt: sizeGuide.alt },
      { kind: "image", src: REVIEW_GALLERY[4].src, alt: REVIEW_GALLERY[4].alt },
      { kind: "image", src: REVIEW_GALLERY[5].src, alt: REVIEW_GALLERY[5].alt },
    ]
  }, [setting.article, setting.name, setting.metal, shape, size, shown, label])

  // Warm every size so dragging the size handle swaps the hero without a blank frame.
  useEffect(() => {
    for (let v = scale.min; v <= scale.max + 1e-9; v += scale.step) {
      const img = new Image()
      img.src = ellaPreview(setting.article, shape, v)
    }
  }, [setting.article, shape, scale.min, scale.max, scale.step])

  const isDesktop = useIsDesktop()

  if (mode === "preview") return <PreviewStage hero={media[0]} label={previewLabel} />
  if (isDesktop) return <SettingGallery media={media} previewLabel={previewLabel} />
  return <ThumbnailGallery key={media[0].src} media={media} />
}

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
