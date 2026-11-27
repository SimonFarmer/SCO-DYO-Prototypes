import { useMemo } from "react"
import { FINISHING_GALLERY, type GalleryImage } from "@/data/dyo"
import { flowMetalFor, flowSettingFor } from "@/data/flow-settings"
import { galleryFor } from "@/data/products"
import { previewImage } from "@/data/stones"
import { useFlow } from "@/flow/flow-context"
import { findFlowDiamond } from "@/flow/stone/find-diamond"
import { STUDY_DIAMOND_ID } from "@/flow/study/study"
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
 * Part 4's diamond in "3D": a Vision360 turntable of a round diamond, 256 frames (public/images/study/diamond-spin).
 * The capture stores its frames scrambled; they were put back in turning order by how alike neighbouring frames
 * look, and numbered from the face-up front view (000), where it rests.
 */
const STUDY_DIAMOND_SPIN = {
  frames: Array.from({ length: 256 }, (_, i) => `/images/study/diamond-spin/${String(i).padStart(3, "0")}.jpg`),
  start: 0,
}

/**
 * The flow's step 3 galleries (Finishing Touches, Ring Review): the ring actually being built, instead of
 * Test 4's Timeless Solitaire with its 1.21 ct round. Ella in the build's metal with the chosen stone first,
 * then the stone, Ella's own photos in that metal and the shared Shane Co. tiles (source, size guide).
 */
export function useFlowRingGallery() {
  const { setting, stone, settingId, settingMetal } = useRingBuild()
  // Full-flow study part 4: its preselected diamond turns in 3D instead of the still photo.
  const spin = useFlow()?.study?.part === 4 && stone.id === STUDY_DIAMOND_ID
  return useMemo(() => {
    const picked = flowSettingFor(settingId)
    const metal = flowMetalFor(picked, settingMetal)
    const hero: GalleryImage = {
      src: ellaPreview(setting.article, stone.shape, stone.carat),
      alt: `${setting.name} in ${setting.metal.toLowerCase()} with a ${stone.title.toLowerCase()}`,
    }
    const stonePhoto = findFlowDiamond(stone.id)?.image
    const badge = `${stone.shape} ∙ ${stone.carat.toFixed(2)} ct`
    const stoneTile: GalleryImage[] = spin
      ? [{ src: STUDY_DIAMOND_SPIN.frames[STUDY_DIAMOND_SPIN.start], spin: STUDY_DIAMOND_SPIN, alt: `${stone.title}, 3D view`, badge, badgePosition: "bottom" }]
      : stonePhoto
        ? [{ src: stonePhoto, alt: `${stone.title}, top view`, badge, badgePosition: "bottom" }]
        : []
    // The setting's own shots in the chosen metal (the PDP gallery, without its size guide). Its first shot is
    // the front view the hero already shows with the shopper's stone, so it is left out (no repeated photo).
    const ellaPhotos: GalleryImage[] = galleryFor(picked, metal)
      .filter((m) => m.kind === "image")
      .slice(1, 5)
      .map((m) => ({ src: m.src, alt: m.alt, badge: m.badge, badgePosition: m.badge ? ("bottom" as const) : undefined }))
    const [, , source, sizeGuide] = FINISHING_GALLERY.tiles
    return {
      /** Finishing Touches: the hero spans the grid, with a "Previewing" badge (Test 4 B layout). */
      finishing: [
        { ...hero, span: 2 as const, badge: `Previewing: ${stone.origin} ∙ ${stone.shape} ∙ ${stone.carat.toFixed(2)} ct`, badgePosition: "bottom" as const },
        ...stoneTile,
        ...ellaPhotos,
        source,
        sizeGuide,
      ],
      /** Ring Review: same images, the ring first. */
      review: [hero, ...stoneTile, ...ellaPhotos, source, sizeGuide],
    }
  }, [setting.article, setting.name, setting.metal, stone, settingId, settingMetal, spin])
}
