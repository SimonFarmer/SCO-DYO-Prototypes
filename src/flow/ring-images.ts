import { useMemo } from "react"
import { FINISHING_GALLERY, type GalleryImage } from "@/data/dyo"
import { flowMetalFor, flowSettingFor } from "@/data/flow-settings"
import { galleryFor } from "@/data/products"
import { previewImage } from "@/data/stones"
import { findFlowDiamond } from "@/flow/stone/find-diamond"
import { useRingBuild } from "@/state/ring-build"

/** Shane Co.'s preview renders are per setting item; data/stones.ts builds them for Test 2's setting. */
const TEST_2_ITEM = "41004888"

/**
 * Shane Co.'s render of the flow's setting (Ella Cathedral, by article number, so in the chosen metal) with a
 * natural diamond of this shape and carat (shaneco.com "Preview with", the same service Test 2 uses).
 */
export const ellaPreview = (article: string, shape: string, carat: number, width?: number) =>
  previewImage("natural", shape.toLowerCase(), carat, undefined, width).replace(`built-item_${TEST_2_ITEM}_`, `built-item_${article}_`)

/**
 * The flow's step 3 galleries (Finishing Touches, Ring Review): the ring actually being built, instead of
 * Test 4's Timeless Solitaire with its 1.21 ct round. Ella in the build's metal with the chosen stone first,
 * then the stone, Ella's own photos in that metal and the shared Shane Co. tiles (source, size guide).
 */
export function useFlowRingGallery() {
  const { setting, stone, settingId, settingMetal } = useRingBuild()
  return useMemo(() => {
    const picked = flowSettingFor(settingId)
    const metal = flowMetalFor(picked, settingMetal)
    const hero: GalleryImage = {
      src: ellaPreview(setting.article, stone.shape, stone.carat),
      alt: `${setting.name} in ${setting.metal.toLowerCase()} with a ${stone.title.toLowerCase()}`,
    }
    const stonePhoto = findFlowDiamond(stone.id)?.image
    const stoneTile: GalleryImage[] = stonePhoto ? [{ src: stonePhoto, alt: `${stone.title}, top view`, badge: `${stone.shape} · ${stone.carat.toFixed(2)} ct`, badgePosition: "bottom" }] : []
    // The setting's own shots in the chosen metal (the PDP gallery, without its size guide).
    const ellaPhotos: GalleryImage[] = galleryFor(picked, metal)
      .filter((m) => m.kind === "image")
      .slice(0, 4)
      .map((m) => ({ src: m.src, alt: m.alt, badge: m.badge, badgePosition: m.badge ? ("bottom" as const) : undefined }))
    const [, , source, sizeGuide] = FINISHING_GALLERY.tiles
    return {
      /** Finishing Touches: the hero spans the grid, with a "Previewing" badge (Test 4 B layout). */
      finishing: [
        { ...hero, span: 2 as const, badge: `Previewing: ${stone.origin} · ${stone.shape} · ${stone.carat.toFixed(2)} ct`, badgePosition: "bottom" as const },
        ...stoneTile,
        ...ellaPhotos,
        source,
        sizeGuide,
      ],
      /** Ring Review: same images, the ring first. */
      review: [hero, ...stoneTile, ...ellaPhotos, source, sizeGuide],
    }
  }, [setting.article, setting.name, setting.metal, stone, settingId, settingMetal])
}
