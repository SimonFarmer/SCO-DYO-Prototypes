import { useState } from "react"
import { HeartStraightIcon, PlayIcon } from "@phosphor-icons/react"
import { useNotInTest } from "@/components/prototype/not-in-test"
import { stoneImage, stoneSpecs, stoneTitle, type LooseStone } from "@/data/stones"
import { formatPrice } from "@/lib/format"
import { cn } from "@/lib/utils"

/**
 * Loose stone tile (Pattern Library "Product Card", Type=Diamond; Figma Diamonds PLP grid):
 * image with wishlist and 360°, title, price, then Clarity | Color | Cut.
 * Stone details are Test 3, so opening a stone is inert here.
 */
export function DiamondCard({ stone }: { stone: LooseStone }) {
  const notInTest = useNotInTest()
  const [wished, setWished] = useState(false)
  const img = stoneImage(stone)
  const specs = stoneSpecs(stone)
  const title = stoneTitle(stone)

  return (
    <article className="flex min-w-0 flex-col bg-bg-input-30">
      <div className="relative aspect-square w-full overflow-hidden bg-secondary">
        <button type="button" onClick={() => notInTest("Stone details")} className="block size-full cursor-pointer" aria-label={title}>
          <img
            src={img.src}
            alt=""
            loading="lazy"
            className={cn("size-full transition-transform duration-300 hover:scale-105", img.render ? "object-contain" : img.photo ? "object-cover" : "object-contain p-[22%] mix-blend-multiply")}
          />
        </button>
        <button
          type="button"
          aria-label={wished ? "Remove from wishlist" : "Add to wishlist"}
          aria-pressed={wished}
          onClick={() => setWished((w) => !w)}
          className="absolute top-1.5 right-1.5 flex cursor-pointer items-center justify-center p-1 text-primary"
        >
          <HeartStraightIcon className="size-4" weight={wished ? "fill" : "regular"} />
        </button>
        <button
          type="button"
          onClick={() => notInTest("The 360° view")}
          className="absolute right-2 bottom-2 flex h-6 cursor-pointer items-center gap-2 p-1 text-xxs leading-3 font-semibold tracking-[1px] text-primary uppercase"
        >
          <PlayIcon className="size-4" />
          360°
        </button>
      </div>

      <div className="flex flex-col gap-3 py-3 pr-4">
        <div className="flex flex-col gap-2">
          <h3 className="font-sans text-sm leading-5 font-medium text-primary">
            <button type="button" onClick={() => notInTest("Stone details")} className="cursor-pointer text-left hover:underline">
              {title}
            </button>
          </h3>
          <p className="text-sm leading-5 font-semibold text-primary">{formatPrice(stone.price)}</p>
        </div>
        <dl className="flex items-start gap-2">
          {(
            [
              ["Clarity", specs.clarity],
              ["Color", specs.color],
              ["Cut", specs.cut],
            ] as const
          ).map(([label, value], i) => (
            <div key={label} className="flex min-w-0 flex-1 items-start gap-2">
              {i > 0 && <span aria-hidden className="h-8 w-px shrink-0 bg-input" />}
              <div className="flex min-w-0 flex-col gap-1 py-0.5">
                <dt className="type-spec leading-3 text-muted-foreground">{label}</dt>
                <dd className="text-xxs leading-3 font-semibold tracking-[0.5px] text-primary">{value}</dd>
              </div>
            </div>
          ))}
        </dl>
      </div>
    </article>
  )
}
