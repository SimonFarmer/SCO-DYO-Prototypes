import { Separator } from "@/components/ui/separator"
import { ProductCard } from "@/components/shared/product-card"
import type { ProductCardData } from "@/data/products"

/** "Matching set — Complete the Look" block in the buy form (Figma 7336:186023, Test 1 variant C). */
export function CompleteTheLook({ products }: { products: ProductCardData[] }) {
  return (
    <div className="flex flex-col gap-8">
      <Separator className="my-3 bg-muted" />
      <div className="flex flex-col gap-6">
        <div className="flex flex-col text-primary">
          <p className="type-label-xs font-semibold">Matching set</p>
          <div className="flex items-baseline justify-between gap-4">
            <h2 className="type-h4 font-medium">Complete the Look</h2>
            <a href="#" onClick={(e) => e.preventDefault()} className="type-label-xs font-semibold whitespace-nowrap underline">
              View all sets
            </a>
          </div>
        </div>
        {/* Figma gap is 5px; closest spacing token is 1 (4px). */}
        <div className="flex items-start gap-1">
          {products.map((p) => (
            <ProductCard
              key={p.id}
              product={p}
              showWishlist
              compact
              className="w-auto min-w-0 flex-1"
            />
          ))}
        </div>
      </div>
      <Separator className="my-3 bg-muted" />
    </div>
  )
}
