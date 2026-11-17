import { useEffect, useMemo } from "react"
import { ProductGallery } from "@/components/dyo/product-gallery"
import { FINISHING_GALLERY, REVIEW_GALLERY, type GalleryImage } from "@/data/dyo"
import { PREVIEW_CODES, shapePreviewImage, stoneShape, stoneType, type StoneTypeId } from "@/data/stones"

/**
 * Stone step gallery (Figma 7685:412972): the setting with a previewed stone, then the 360 view,
 * diamond close-up, size guide and the two proportion diagrams. The hero badge follows the
 * shopper's current type, shape and size so the preview reads as their stone.
 */
export function StoneStepGallery({
  type,
  shape,
  carat,
  previewNote,
}: {
  type: StoneTypeId
  shape: string
  carat: number
  /** e.g. "middle of your range" when the shopper chose a range, not one size */
  previewNote?: string
}) {
  const images = useMemo<GalleryImage[]>(() => {
    const [video, diamondTop, , sizeGuide] = FINISHING_GALLERY.tiles
    return [
      {
        ...FINISHING_GALLERY.hero,
        // The setting rendered with the chosen shape and size (shaneco.com "Preview with Shape").
        src: shapePreviewImage(shape, carat),
        alt: `Timeless Solitaire ring previewed with a ${carat.toFixed(2)} ct ${stoneShape(shape).label.toLowerCase()} ${stoneType(type).noun.toLowerCase()}`,
        badge: `Previewing: ${stoneType(type).noun} · ${stoneShape(shape).label} · ${carat.toFixed(2)} ct${previewNote ? `, ${previewNote}` : ""}`,
      },
      video,
      diamondTop,
      sizeGuide,
      REVIEW_GALLERY[4],
      REVIEW_GALLERY[5],
    ]
  }, [type, shape, carat, previewNote])

  // Warm every size of the current shape so dragging the carat slider swaps the hero without a blank frame.
  useEffect(() => {
    const { min, max, step } = PREVIEW_CODES
    for (let code = min; code <= max; code += step) {
      const img = new Image()
      img.src = shapePreviewImage(shape, 0).replace(/-\d+\.webp$/, `-${code}.webp`)
    }
  }, [shape])

  return <ProductGallery images={images} />
}
