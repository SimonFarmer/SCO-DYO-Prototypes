import { useState } from "react"
import { HeartStraight } from "@phosphor-icons/react"
import { Badge } from "@/components/ui/badge"
import { METALS, type MetalId, type ProductCardData } from "@/data/products"
import { formatPrice } from "@/lib/format"
import { cn } from "@/lib/utils"

interface ProductCardProps {
  product: ProductCardData
  /** Show wishlist heart + gallery dots (recently-viewed style) */
  showWishlist?: boolean
  /** Tighter content spacing (gap 8 / py 12) for cards inside the buy form */
  compact?: boolean
  className?: string
}

function MetalSwatches({ metals }: { metals: MetalId[] }) {
  const [selected, setSelected] = useState(metals[0])
  return (
    <div className="flex flex-wrap items-center gap-2">
      <div className="flex gap-1">
        {metals.map((id) => (
          <button
            key={id}
            type="button"
            aria-label={METALS[id].label}
            aria-pressed={selected === id}
            onClick={() => setSelected(id)}
            className={cn(
              "rounded-full border p-1",
              selected === id ? "border-primary" : "border-transparent",
            )}
          >
            <span className="block size-5 rounded-full" style={{ backgroundColor: METALS[id].swatch }} />
          </button>
        ))}
      </div>
      <span className="text-xxs leading-3 font-medium tracking-[0.5px] text-muted-foreground">
        {METALS[selected].label}
      </span>
    </div>
  )
}

/** Pattern Library "Product Card" used by every recommender carousel. */
export function ProductCard({ product, showWishlist, compact, className }: ProductCardProps) {
  const [wished, setWished] = useState(false)
  return (
    <article className={cn("flex w-64 shrink-0 snap-start flex-col overflow-clip bg-bg-input-30", className)}>
      <div className="relative aspect-square w-full bg-secondary">
        <img src={product.image} alt={product.name} className="size-full object-cover" loading="lazy" />
        {product.badge && (
          <div className="absolute top-0 left-0 p-3">
            <Badge variant="dark">{product.badge}</Badge>
          </div>
        )}
        {showWishlist && (
          <>
            <div className="absolute top-0 right-0 p-2.5">
              <button
                type="button"
                aria-label={wished ? "Remove from wishlist" : "Add to wishlist"}
                aria-pressed={wished}
                onClick={() => setWished((w) => !w)}
                className="flex size-6 items-center justify-center text-primary"
              >
                <HeartStraight className="size-4" weight={wished ? "fill" : "regular"} />
              </button>
            </div>
          </>
        )}
        {showWishlist && product.metals && (
          // Image-gallery dots: only on the recently-viewed card style (Figma "Pick Up Where You Left Off").
          <div className="absolute right-0 bottom-0 flex h-5 items-center gap-1 p-2" aria-hidden>
            <span className="h-1 w-2 rounded-xs bg-primary" />
            <span className="size-1 rounded-xs bg-primary/50" />
            <span className="size-1 rounded-xs bg-primary/50" />
          </div>
        )}
      </div>
      <div className={cn("flex flex-col gap-3 py-4 pr-4", (product.metals || compact) && "py-3", compact && "gap-2")}>
        <div className="flex flex-col gap-2">
          <h3 className="font-sans text-sm font-medium text-primary">{product.name}</h3>
          {product.variantLabel && (
            <p className="text-xxs leading-3 text-muted-foreground">{product.variantLabel}</p>
          )}
          {product.metals && <p className="text-sm font-semibold text-primary">{formatPrice(product.price)}</p>}
        </div>
        {product.metals ? (
          <MetalSwatches metals={product.metals} />
        ) : (
          <p className="text-sm font-semibold text-primary">{formatPrice(product.price)}</p>
        )}
      </div>
    </article>
  )
}
