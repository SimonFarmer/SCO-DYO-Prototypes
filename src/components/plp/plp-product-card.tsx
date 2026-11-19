import { useState } from "react"
import { CaretLeftIcon, CaretRightIcon, HeartStraightIcon } from "@phosphor-icons/react"
import { Badge } from "@/components/ui/badge"
import { useNotInTest } from "@/components/prototype/not-in-test"
import { productImages, productVariant, type PlpProduct } from "@/data/plp"
import { formatPrice } from "@/lib/format"
import { cn } from "@/lib/utils"

/**
 * PLP product card (Pattern Library "Product Card", Figma 7845:197922 grid).
 * Differs from the shared recommender ProductCard: fluid width, "Setting only" price label, and the
 * swatches switch the card to that metal's variant (image, price, label) like the live site.
 * The image shows the setting holding the shopper's filtered stone shape when it accepts it.
 * On desktop, hovering the image reveals arrows to step to the side view (Figma SCO Drop 2, 7935:401489).
 * Ready to Ship cards lead the price with "Starting at" (Figma SCO Drop 2, 8693:145558).
 */
export function PlpProductCard({
  product,
  priceLabel,
  pricePrefix,
  preferredShapes,
}: {
  product: PlpProduct
  /** Label after the price, e.g. "Setting only". */
  priceLabel?: string
  /** Label before the price, e.g. "Starting at". */
  pricePrefix?: string
  /** Stone shapes the listing is filtered by, in the order chosen. */
  preferredShapes?: string[]
}) {
  const notInTest = useNotInTest()
  const [metalId, setMetalId] = useState(product.metal.id)
  const [wished, setWished] = useState(false)
  // Settings have one card per metal; swatches show the sibling variants.
  const [slide, setSlide] = useState(0)
  // Settings have one card per metal; swatches show the sibling variants.
  const shown = (metalId !== product.metal.id && productVariant(product, metalId)) || product
  const metal = product.metals.find((m) => m.id === metalId) ?? product.metal
  const images = productImages(shown, preferredShapes)
  const step = (dir: 1 | -1) => setSlide((i) => (i + dir + images.length) % images.length)
  const arrow = "absolute top-[calc(50%-4px)] hidden size-8 -translate-y-1/2 cursor-pointer items-center justify-center bg-background text-primary opacity-0 transition-opacity group-hover:opacity-100 focus-visible:opacity-100 lg:flex"

  return (
    <article className="flex min-w-0 flex-col">
      <div className="group relative aspect-square w-full overflow-hidden bg-secondary">
        <button
          type="button"
          onClick={() => notInTest("The product page")}
          className="block size-full cursor-pointer"
          aria-label={`${shown.name}, ${metal.label}`}
        >
          <span className="flex size-full transition-transform duration-300" style={{ transform: `translateX(-${slide * 100}%)` }}>
            {images.map((src) => (
              <img key={src} src={src} alt="" loading="lazy" className="size-full shrink-0 object-contain p-4 mix-blend-multiply" />
            ))}
          </span>
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
        {images.length > 1 && (
          <>
            <button type="button" aria-label="Previous image" onClick={() => step(-1)} className={cn(arrow, "left-2")}>
              <CaretLeftIcon className="size-4" />
            </button>
            <button type="button" aria-label="Next image" onClick={() => step(1)} className={cn(arrow, "right-2")}>
              <CaretRightIcon className="size-4" />
            </button>
            <div className="absolute right-2 bottom-2 flex h-5 items-center gap-1 px-2" aria-hidden>
              {images.map((src, i) => (
                <span key={src} className={cn("h-1 rounded-xs bg-primary transition-all", i === slide ? "w-2" : "w-1 opacity-50")} />
              ))}
            </div>
          </>
        )}
      </div>

      <div className="flex flex-col gap-3 py-3 pr-2">
        <h3 className="line-clamp-2 font-sans text-sm leading-5 font-medium text-primary lg:text-base lg:leading-6">
          <button type="button" onClick={() => notInTest("The product page")} className="cursor-pointer text-left hover:underline">
            {shown.name}
          </button>
        </h3>
        <p className="flex flex-wrap items-baseline gap-x-1">
          {pricePrefix && <span className="type-label-xs font-medium text-muted-foreground">{pricePrefix}</span>}
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
