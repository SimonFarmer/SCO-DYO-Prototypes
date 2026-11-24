import { useState } from "react"
import { CheckCircleIcon, XIcon } from "@phosphor-icons/react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog"
import { productImages, productVariant, type PlpProduct } from "@/data/plp"
import { formatPrice } from "@/lib/format"

export interface PickedRing {
  product: PlpProduct
  metalId: string
}

/**
 * End of the PLP task (standalone PLP prototypes, where there is no product page): clicking a ring
 * asks whether it's the one. "Yes" shows the end-of-task note, in the style of the other tests'
 * end screens, and the modal can no longer be closed; "Keep Browsing" closes it.
 * No Figma frame: built from the exit modal and end screens.
 */
export function RingPickedModal({
  picked,
  preferredShapes,
  priceLabel,
  pricePrefix,
  onClose,
}: {
  picked: PickedRing | null
  preferredShapes?: string[]
  priceLabel?: string
  pricePrefix?: string
  onClose: () => void
}) {
  // Once the task is finished the modal stays: no outside click, Escape or close button.
  const [done, setDone] = useState(false)
  return (
    <Dialog open={!!picked} onOpenChange={(o) => !o && !done && onClose()}>
      <DialogContent showCloseButton={false} className="gap-6 rounded-none bg-background p-6 ring-0 md:max-w-120">
        {picked && (
          <RingPicked
            picked={picked}
            done={done}
            onFinish={() => setDone(true)}
            preferredShapes={preferredShapes}
            priceLabel={priceLabel}
            pricePrefix={pricePrefix}
            onClose={onClose}
          />
        )}
      </DialogContent>
    </Dialog>
  )
}

function RingPicked({
  picked,
  done,
  onFinish,
  preferredShapes,
  priceLabel,
  pricePrefix,
  onClose,
}: {
  picked: PickedRing
  done: boolean
  onFinish: () => void
  preferredShapes?: string[]
  priceLabel?: string
  pricePrefix?: string
  onClose: () => void
}) {
  const ring = productVariant(picked.product, picked.metalId) ?? picked.product

  return (
    <>
      <div className="flex items-start gap-4">
        <div className="flex flex-1 flex-col gap-2">
          {done && <CheckCircleIcon className="size-10 text-success" weight="fill" />}
          <DialogTitle className="font-heading text-3xl leading-10 font-semibold tracking-[-0.025em] text-primary">
            {done ? "Great choice" : "Happy with this ring?"}
          </DialogTitle>
          <DialogDescription className="text-sm leading-5 text-muted-foreground">
            {done
              ? "You’ve picked the ring you’d go with."
              : "If this is the one you’d choose, finish the task. If not, keep browsing."}
          </DialogDescription>
        </div>
        {!done && (
          <button type="button" onClick={onClose} aria-label="Close" className="flex cursor-pointer items-center justify-center p-3 text-primary">
            <XIcon className="size-4" />
          </button>
        )}
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

      {done ? (
        <div className="flex flex-col gap-1 bg-bg-input-50 p-4 text-center">
          <p className="type-label-xs text-primary">This is the end of the task</p>
          <p className="type-caption text-muted-foreground">Please return to the test instructions to continue.</p>
        </div>
      ) : (
        <div className="flex gap-2 max-sm:flex-col-reverse">
          <Button variant="outline" className="flex-1 border-input" onClick={onClose}>
            Keep Browsing
          </Button>
          <Button className="flex-1" onClick={onFinish}>
            Yes, Finish Task
          </Button>
        </div>
      )}
    </>
  )
}
