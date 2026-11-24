import { CheckCircleIcon } from "@phosphor-icons/react"
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog"
import { productImages, productVariant, type PlpProduct } from "@/data/plp"
import { formatPrice } from "@/lib/format"

export interface PickedRing {
  product: PlpProduct
  metalId: string
}

/**
 * End of the PLP task (standalone PLP prototypes, where there is no product page): clicking a ring
 * ends the task, with the end-of-task note in the style of the other tests' end screens. The testing
 * tool has its own Finish Task button, so there is no confirmation step, and the modal can't be closed
 * (no outside click, Escape or close button).
 * No Figma frame: built from the exit modal and end screens.
 */
export function RingPickedModal({
  picked,
  preferredShapes,
  priceLabel,
  pricePrefix,
}: {
  picked: PickedRing | null
  preferredShapes?: string[]
  priceLabel?: string
  pricePrefix?: string
}) {
  return (
    <Dialog open={!!picked}>
      <DialogContent showCloseButton={false} className="gap-6 rounded-none bg-background p-6 ring-0 md:max-w-120">
        {picked && <RingPicked picked={picked} preferredShapes={preferredShapes} priceLabel={priceLabel} pricePrefix={pricePrefix} />}
      </DialogContent>
    </Dialog>
  )
}

function RingPicked({
  picked,
  preferredShapes,
  priceLabel,
  pricePrefix,
}: {
  picked: PickedRing
  preferredShapes?: string[]
  priceLabel?: string
  pricePrefix?: string
}) {
  const ring = productVariant(picked.product, picked.metalId) ?? picked.product

  return (
    <>
      <div className="flex flex-col gap-2">
        <CheckCircleIcon className="size-10 text-success" weight="fill" />
        <DialogTitle className="font-heading text-3xl leading-10 font-semibold tracking-[-0.025em] text-primary">Great choice</DialogTitle>
        <DialogDescription className="text-sm leading-5 text-muted-foreground">You’ve picked the ring you’d go with.</DialogDescription>
      </div>

      <div className="flex items-center gap-4 border border-border-subtle p-3">
        <img src={productImages(ring, preferredShapes)[0]} alt="" className="size-20 shrink-0 bg-secondary object-contain p-1 mix-blend-multiply" />
        <div className="flex min-w-0 flex-col gap-1">
          <p className="line-clamp-2 text-sm leading-5 font-medium text-primary">{ring.name}</p>
          <p className="type-caption text-muted-foreground">{ring.metal.label}</p>
          <p className="flex flex-wrap items-baseline gap-x-1">
            {pricePrefix && <span className="type-label-xs font-medium text-muted-foreground">{pricePrefix}</span>}
            <span className="text-sm leading-5 font-semibold text-primary">{formatPrice(ring.price)}</span>
            {priceLabel && <span className="type-label-xs font-medium text-muted-foreground">{priceLabel}</span>}
          </p>
        </div>
      </div>

      <div className="flex flex-col gap-1 bg-bg-input-50 p-4 text-center">
        <p className="type-label-xs text-primary">This is the end of the task</p>
        <p className="type-caption text-muted-foreground">Please return to the test instructions to continue.</p>
      </div>
    </>
  )
}
