import { ProductGallery } from "@/components/dyo/product-gallery"
import type { GalleryImage } from "@/data/dyo"
import { useFlow } from "@/flow/flow-context"

/**
 * The flows' step 3 gallery (Finishing Touches, Ring Review). In the full-flow study its photos open in the
 * zoomable overlay, as the stone step's and the PDPs' galleries do; the full flows keep Test 4's plain gallery.
 */
export function FlowProductGallery({ images }: { images: GalleryImage[] }) {
  const study = useFlow()?.study != null
  return <ProductGallery images={images} expandable={study} />
}
