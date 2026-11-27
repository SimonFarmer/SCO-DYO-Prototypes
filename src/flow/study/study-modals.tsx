import { useState } from "react"
import { CheckCircleIcon, InfoIcon, XIcon } from "@phosphor-icons/react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog"
import { formatPrice } from "@/lib/format"

/** What the end-of-task modal shows: the choice that ended the task. */
export interface TaskEnd {
  title: string
  description: string
  item: {
    image?: string
    name: string
    /** Short lines under the name: metal, 4Cs, finishing touches… */
    details: string[]
    price: number
    /** "Ring total", "Setting only"… */
    priceLabel?: string
  }
}

/** The last non-null value, so a modal keeps its content while it animates closed. */
function useLast<T>(value: T | null): T | null {
  const [last, setLast] = useState(value)
  if (value !== null && value !== last) setLast(value)
  return value ?? last
}

/** Same frame as the exit modal and the pilot's end-of-task modal (RingPickedModal): square, 24px padding, X top right. */
function StudyDialog({ open, onClose, children }: { open: boolean; onClose: () => void; children: React.ReactNode }) {
  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent showCloseButton={false} className="gap-6 rounded-none bg-background p-6 ring-0 md:max-w-120">
        <DialogClose aria-label="Close" className="absolute top-3 right-3 flex cursor-pointer items-center justify-center p-3 text-primary">
          <XIcon className="size-4" />
        </DialogClose>
        {children}
      </DialogContent>
    </Dialog>
  )
}

/**
 * End of a full-flow study part (Lucid "Full-flow test plan for Nov 30"): the pilot's end-of-task modal
 * (RingPickedModal) with what the participant chose. The testing tool has its own Finish button, so there is no
 * confirm step; X, Esc or a click outside closes it and returns to the page.
 */
export function TaskEndModal({ end: current, onClose }: { end: TaskEnd | null; onClose: () => void }) {
  const end = useLast(current)
  return (
    <StudyDialog open={!!current} onClose={onClose}>
      {end && (
        <>
          <div className="flex flex-col gap-2">
            <CheckCircleIcon className="size-10 text-success" weight="fill" />
            <DialogTitle className="font-heading text-3xl leading-10 font-semibold tracking-[-0.025em] text-primary">{end.title}</DialogTitle>
            <DialogDescription className="text-sm leading-5 text-muted-foreground">{end.description}</DialogDescription>
          </div>

          <div className="flex items-center gap-4 border border-border-subtle p-3">
            {end.item.image && <img src={end.item.image} alt="" className="size-20 shrink-0 bg-secondary object-contain p-1 mix-blend-multiply" />}
            <div className="flex min-w-0 flex-col gap-1">
              <p className="line-clamp-2 text-sm leading-5 font-medium text-primary">{end.item.name}</p>
              {end.item.details.map((d) => (
                <p key={d} className="type-caption text-muted-foreground">
                  {d}
                </p>
              ))}
              <p className="flex flex-wrap items-baseline gap-x-1">
                {end.item.priceLabel && <span className="type-label-xs font-medium text-muted-foreground">{end.item.priceLabel}</span>}
                <span className="text-sm leading-5 font-semibold text-primary">{formatPrice(end.item.price)}</span>
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-1 bg-bg-input-50 p-4 text-center">
            <p className="type-label-xs text-primary">This is the end of the task</p>
            <p className="type-caption text-muted-foreground">Please return to the test instructions to continue.</p>
          </div>
        </>
      )}
    </StudyDialog>
  )
}

/**
 * Part 3: "Select this Diamond" on the recommendations doesn't end the task; this sends the participant to the
 * full catalog instead (copy from the Lucid prototype notes).
 */
export function CatalogGuideModal({ viewAllLabel: current, onClose }: { viewAllLabel: string | null; onClose: () => void }) {
  const viewAllLabel = useLast(current)
  return (
    <StudyDialog open={current !== null} onClose={onClose}>
      <div className="flex flex-col gap-2">
        <InfoIcon className="size-10 text-primary" />
        <DialogTitle className="font-heading text-3xl leading-10 font-semibold tracking-[-0.025em] text-primary">Choose from the full catalog</DialogTitle>
        <DialogDescription className="text-sm leading-5 text-muted-foreground">
          For this part, we’d like you to choose from the full diamond catalog. Go back and click “{viewAllLabel}” to see every diamond available in
          your shape.
        </DialogDescription>
      </div>
      <Button className="w-full" onClick={onClose}>
        Go Back
      </Button>
    </StudyDialog>
  )
}

/**
 * A control that looks and works as usual but is outside the task (part 2's View All): a click explains that rather
 * than going anywhere, and Go Back returns to the page.
 */
export function NotInTestModal({ what: current, onClose }: { what: string | null; onClose: () => void }) {
  const what = useLast(current)
  return (
    <StudyDialog open={current !== null} onClose={onClose}>
      <div className="flex flex-col gap-2">
        <InfoIcon className="size-10 text-primary" />
        <DialogTitle className="font-heading text-3xl leading-10 font-semibold tracking-[-0.025em] text-primary">Not part of this test</DialogTitle>
        <DialogDescription className="text-sm leading-5 text-muted-foreground">{what} isn’t part of this test. Please continue with the task.</DialogDescription>
      </div>
      <Button className="w-full" onClick={onClose}>
        Go Back
      </Button>
    </StudyDialog>
  )
}
