import { useEffect, useMemo } from "react"
import { SettingGallery, ThumbnailGallery } from "@/components/pdp/setting-gallery"
import { FINISHING_GALLERY, REVIEW_GALLERY } from "@/data/dyo"
import type { GalleryMedia } from "@/data/products"
import { useIsDesktop } from "@/lib/hooks"
import { formatSize, gemById, previewImage, sizeScale, stoneShape, stoneType, type StoneTypeId } from "@/data/stones"

/**
 * Stone step gallery: Test 1's long-scroll gallery (hero + 2-column grid, every image opens the zoom
 * overlay) so both steps look and size the same. The hero is Shane Co.'s own render of this ring with
 * the chosen stone, shape and size (shaneco.com "Preview with Shape / Gemstone / Size"); diamonds then
 * show the 360 view, close-up, size guide and the two proportion diagrams (Figma 7685:412972).
 * Below lg it's Test 1 C's single image + thumbnail strip instead, so the buy form starts one screen down.
 */
export function StoneStepGallery({
  type,
  shape,
  size,
  gem,
  previewNote,
}: {
  type: StoneTypeId
  shape: string
  /** Carats for diamonds, millimetres for gemstones */
  size: number
  gem?: string
  /** e.g. "middle of your range" when the shopper chose a range, not one size */
  previewNote?: string
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
      { kind: "image", src: video.src, alt: video.alt, badge: "360 view" },
      { kind: "image", src: diamondTop.src, alt: diamondTop.alt },
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
  if (!isDesktop) {
    return (
      // As Test 1 C on mobile; the hero (the live preview) is the first image. Keyed by it, so changing
      // the stone, shape or size brings the stage back to the preview to show the change.
      <div className="px-2">
        <ThumbnailGallery key={media[0].src} media={media} />
      </div>
    )
  }
  return <SettingGallery media={media} previewLabel={previewLabel} />
}
