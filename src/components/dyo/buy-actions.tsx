import {
  ArrowsClockwiseIcon,
  ArrowsOutLineVerticalIcon,
  CaretDownIcon,
  CaretRightIcon,
  ChatCircleIcon,
  CheckCircleIcon,
  DotsThreeVerticalIcon,
  HeartIcon,
  ShieldCheckIcon,
  StorefrontIcon,
} from "@phosphor-icons/react"
import { Button } from "@/components/ui/button"
import { useNotInTest } from "@/components/prototype/not-in-test"
import { DELIVERY } from "@/data/dyo"

/** Primary CTA row + secondary actions (Figma buy form). Only `onAddToBag` is live. */
export function BuyActions({ onAddToBag, addDisabled }: { onAddToBag: () => void; addDisabled?: boolean }) {
  const notInTest = useNotInTest()
  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-2">
        <div className="flex gap-2">
          <Button className="flex-1" onClick={onAddToBag} disabled={addDisabled}>
            Add Ring to Bag
          </Button>
          <Button variant="outline" size="icon" aria-label="More options" onClick={() => notInTest("More options")}>
            <DotsThreeVerticalIcon />
          </Button>
        </div>
        <div className="grid grid-cols-2 gap-2 max-md:grid-cols-1">
          <Button variant="outline" onClick={() => notInTest("Saving")}>
            <HeartIcon /> Save
          </Button>
          <Button variant="outline" onClick={() => notInTest("Booking an appointment")}>
            <StorefrontIcon /> Book an Appointment
          </Button>
        </div>
      </div>
      <Button variant="link" className="self-center" onClick={() => notInTest("Chat")}>
        <ChatCircleIcon /> Chat with a Jewelry Consultant
      </Button>
    </div>
  )
}

const ASSURANCES = [
  { icon: ArrowsClockwiseIcon, label: "Free shipping & returns" },
  { icon: ShieldCheckIcon, label: "Free lifetime warranty" },
  { icon: CheckCircleIcon, label: "Lifetime diamond upgrade" },
  { icon: ArrowsOutLineVerticalIcon, label: "Free ring resizing" },
]

export function Assurances() {
  return (
    <section className="flex flex-col gap-2">
      <h2 className="type-label-xs text-primary">We’ve got you covered</h2>
      <ul className="grid grid-cols-2 gap-1">
        {ASSURANCES.map(({ icon: Icon, label }) => (
          <li key={label} className="flex h-20 flex-col items-center justify-center gap-2 bg-secondary p-4 text-center">
            <Icon className="size-4 text-primary" />
            <span className="type-label-xs text-primary">{label}</span>
          </li>
        ))}
      </ul>
    </section>
  )
}

export function DeliveryOptions() {
  const notInTest = useNotInTest()
  return (
    <div className="border border-border-subtle">
      <div className="flex items-center justify-between gap-3 p-4">
        <span className="type-label-xs text-primary">Made for you · free shipping</span>
        <span className="type-h5 text-primary">{DELIVERY.shipBy}</span>
      </div>
      <button
        type="button"
        onClick={() => notInTest("Delivery options")}
        className="flex w-full cursor-pointer items-center gap-3 border-t border-muted p-4 text-left"
      >
        <span className="flex flex-1 flex-col gap-2">
          <span className="type-label-xs text-primary">Need it sooner?</span>
          <span className="type-caption text-secondary-foreground">Choose a faster delivery option at checkout.</span>
        </span>
        <CaretDownIcon className="size-4 text-primary" />
      </button>
      <button
        type="button"
        onClick={() => notInTest("Store pickup")}
        className="flex w-full cursor-pointer items-center gap-3 border-t border-muted p-4 text-left"
      >
        <span className="flex flex-1 flex-col gap-2">
          <span className="type-label-xs text-primary">Pick up in store</span>
          <span className="type-caption font-medium">
            <span className="text-primary underline">{DELIVERY.pickupStore}</span>
            <span className="text-primary"> - </span>
            <span className="text-muted-foreground">{DELIVERY.pickupReady}</span>
          </span>
        </span>
        <CaretRightIcon className="size-4 text-primary" />
      </button>
    </div>
  )
}
