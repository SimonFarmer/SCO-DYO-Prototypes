import { useState } from "react"
import { HeartStraightIcon } from "@phosphor-icons/react"
import { Badge } from "@/components/ui/badge"
import { useNotInTest } from "@/components/prototype/not-in-test"
import { productImage, settingVariant, type PlpProduct } from "@/data/plp"
import { formatPrice } from "@/lib/format"
import { cn } from "@/lib/utils"

/**
 * PLP product card (Pattern Library "Product Card", Figma 7845:197922 grid).
 * Differs from the shared recommender ProductCard: fluid width, "Setting only" price label, and the
 * swatches switch the card to that metal's variant (image, price, label) like the live site.
 * The image shows the setting holding the shopper's filtered stone shape when it accepts it.
 */
export function PlpProductCard({
  product,
  priceLabel,
  preferredShapes,
}: {
  product: PlpProduct
  priceLabel?: string
  /** Stone shapes the listing is filtered by, in the order chosen. */
  preferredShapes?: string[]
}) {
  const notInTest = useNotInTest()
  const [metalId, setMetalId] = useState(product.metal.id)
  const [wished, setWished] = useState(false)
  // Settings have one card per metal; swatches show the sibling variants.
  const shown = (metalId !== product.metal.id && settingVariant(product.designId, metalId)) || product
  const metal = product.metals.find((m) => m.id === metalId) ?? product.metal

  return (
    <article className="flex min-w-0 flex-col">
      <div className="relative aspect-square w-full overflow-hidden bg-secondary">
        <button
          type="button"
          onClick={() => notInTest("The product page")}
          className="block size-full cursor-pointer"
          aria-label={`${shown.name}, ${metal.label}`}
        >
          <img
            src={productImage(shown, preferredShapes)}
            alt=""
            loading="lazy"
            className="size-full object-contain p-4 mix-blend-multiply transition-transform duration-300 hover:scale-105"
          />
        </button>
        {product.badge && (
          <div className="pointer-events-none absolute top-0 left-0 p-3">
            <Badge variant="dark">{product.badge}</Badge>
          </div>
        )}
        <button
          type="button"
          aria-label={wished ? "Remove from wishlist" : "Add to wishlist"}
          aria-pressed={wished}
          onClick={() => setWished((w) => !w)}
          className="absolute top-2 right-2 flex size-8 cursor-pointer items-center justify-center text-primary"
        >
          <HeartStraightIcon className="size-5" weight={wished ? "fill" : "regular"} />
        </button>
        <div className="absolute right-0 bottom-0 flex h-5 items-center gap-1 p-3" aria-hidden>
          <span className="h-1 w-2 rounded-xs bg-primary" />
          <span className="size-1 rounded-xs bg-primary/50" />
          <span className="size-1 rounded-xs bg-primary/50" />
        </div>
      </div>

      <div className="flex flex-col gap-3 py-3 pr-2">
        <h3 className="line-clamp-2 font-sans text-sm leading-5 font-medium text-primary lg:text-base lg:leading-6">
          <button type="button" onClick={() => notInTest("The product page")} className="cursor-pointer text-left hover:underline">
            {shown.name}
          </button>
        </h3>
        <p className="flex flex-wrap items-baseline gap-x-2">
          <span className="text-sm leading-5 font-semibold text-primary lg:text-base lg:leading-6">{formatPrice(shown.price)}</span>
          {priceLabel && <span className="type-label-xs font-medium text-muted-foreground">{priceLabel}</span>}
        </p>
        <div className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1">
          <div className="flex gap-1" role="radiogroup" aria-label="Metal">
            {product.metals.slice(0, 4).map((m) => (
              <button
                key={m.id}
                type="button"
                role="radio"
                aria-checked={metalId === m.id}
                aria-label={m.label}
                onClick={() => setMetalId(m.id)}
                className={cn(
                  "cursor-pointer rounded-full border p-0.5",
                  metalId === m.id ? "border-primary" : "border-transparent",
                )}
              >
                {/* Swatch fill is product data (metal colour), not a design token. */}
                <span className="block size-5 rounded-full lg:size-6" style={{ background: m.swatch }} />
              </button>
            ))}
            {product.metals.length > 4 && (
              <span className="self-center pl-1 type-caption text-muted-foreground">+{product.metals.length - 4}</span>
            )}
          </div>
          <span className="type-caption font-medium tracking-[0.5px] text-muted-foreground">{metal.label}</span>
        </div>
      </div>
    </article>
  )
}
