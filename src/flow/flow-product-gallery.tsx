import { ProductGallery } from "@/components/dyo/product-gallery"
import type { GalleryImage } from "@/data/dyo"
import { useFlow } from "@/flow/flow-context"
import { MobileGalleryBar } from "@/flow/mobile-gallery-bar"
import { useRingBuild } from "@/state/ring-build"

/**
 * The flows' step 3 gallery (Finishing Touches, Ring Review). In the full-flow study its photos open in the
 * zoomable overlay, as the stone step's and the PDPs' galleries do; the full flows keep Test 4's plain gallery.
 * On phones the sticky preview bar takes over once the gallery has scrolled away.
 */
export function FlowProductGallery({ images }: { images: GalleryImage[] }) {
  const study = useFlow()?.study != null
  const { setting, stone } = useRingBuild()
  const [hero] = images
  return (
    <MobileGalleryBar image={hero?.src ?? ""} imageAlt={hero?.alt ?? setting.name} title={setting.name} specs={[setting.metal, stone.title]}>
      <ProductGallery images={images} expandable={study} />
    </MobileGalleryBar>
  )
}
