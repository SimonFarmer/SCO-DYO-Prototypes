import { HeartStraightIcon, PlayIcon } from "@phosphor-icons/react"
import { useNotInTest } from "@/components/prototype/not-in-test"
import { TileSpecs } from "@/components/diamond/diamond-specs"
import { DIAMOND_IMAGE, diamondTitle, type Diamond } from "@/data/diamonds"
import { formatPrice } from "@/lib/format"

/**
 * GLP stone tile (Figma “Product Card · Type=Diamond”). The whole tile opens the stone;
 * what “open” means (full PDP or Quickview) is up to the page.
 */
export function StoneTile({ diamond, onOpen }: { diamond: Diamond; onOpen: (d: Diamond) => void }) {
  const notInTest = useNotInTest()
  const title = diamondTitle(diamond)
  return (
    <article className="group relative flex flex-col bg-bg-input-30">
      <div className="relative aspect-square overflow-clip">
        <img
          src={DIAMOND_IMAGE}
          alt=""
          loading="lazy"
          className="size-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
        />
        <span className="absolute right-2 bottom-2 flex h-6 items-center gap-2 p-1 text-xxs leading-3 font-semibold tracking-[1px] text-primary uppercase">
          <PlayIcon className="size-4" />
          360°
        </span>
      </div>
      <div className="flex flex-col gap-3 py-3 pr-4">
        <div className="flex h-12 flex-col gap-2">
          <h3 className="font-sans text-sm font-medium text-primary">
            {/* Stretched button: the whole tile is the hit area (wishlist sits above it). */}
            <button type="button" onClick={() => onOpen(diamond)} className="cursor-pointer text-left after:absolute after:inset-0">
              {title}
            </button>
          </h3>
          <p className="text-sm font-semibold text-primary">{formatPrice(diamond.price)}</p>
        </div>
        <TileSpecs diamond={diamond} />
      </div>
      <button
        type="button"
        aria-label={`Save ${title}`}
        onClick={() => notInTest("Saving")}
        className="absolute top-0 right-0 z-10 cursor-pointer p-2.5"
      >
        <span className="flex rounded-full p-1 hover:bg-primary-foreground">
          <HeartStraightIcon className="size-4 text-primary" />
        </span>
      </button>
    </article>
  )
}
