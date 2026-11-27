import { CaretLeftIcon } from "@phosphor-icons/react"
import { Button } from "@/components/ui/button"

/**
 * Full flows: the way back from the listing, at the top of the hero (where the setting PLP has its
 * breadcrumb). On desktop it stays under the header as the results scroll; on phones the stepper bar takes
 * that spot, so it stays at the top of the hero. Serves both ways in: "View all stones" on the stone step
 * (back to stone preferences) and on the recommendations (back to them); the study's Diamond PDP uses it too.
 */
export function BackBar({ label, onBack }: { label: string; onBack: () => void }) {
  return (
    <>
      {/* 8px of banner above the 40px bar puts the link where the setting PLP has its breadcrumb (20px under
          the header), while the bar itself keeps the link centred when it sticks under the header. */}
      <div aria-hidden className="h-2 bg-secondary" />
      <div className="z-20 bg-secondary transition-[top] duration-300 ease-out lg:sticky lg:top-(--header-offset)">
        <div className="flex h-10 items-center px-page">
          <Button variant="link" className="h-auto gap-1 px-0 py-0" onClick={onBack}>
            <CaretLeftIcon /> {label}
          </Button>
        </div>
      </div>
    </>
  )
}
