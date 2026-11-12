import { CheckCircleIcon } from "@phosphor-icons/react"
import { RingSummary } from "@/components/dyo/ring-summary"
import { SiteHeader } from "@/components/site/site-header"
import { useVariant } from "@/lib/hooks"

/** End of the Test 4 task: shown after "Add Ring to Bag". */
export function AddedToBag() {
  const variant = useVariant(["A", "B"] as const)
  return (
    <div className="min-h-svh bg-secondary">
      <SiteHeader />
      <main className="px-margin py-16 max-lg:py-8">
        <div className="mx-auto flex max-w-2xl flex-col gap-8 bg-background p-10 max-lg:p-6">
          <div className="flex flex-col items-center gap-4 text-center">
            <CheckCircleIcon className="size-10 text-success" weight="fill" />
            <h1 className="type-h3 text-primary">Your ring has been added to your bag</h1>
          </div>
          <div className="h-px bg-muted" />
          <RingSummary readOnly thumbnail personalization={variant === "B" ? "grouped" : "inline"} />
          <div className="flex flex-col gap-1 bg-bg-input-50 p-4 text-center">
            <p className="type-label-xs text-primary">This is the end of the task</p>
            <p className="type-caption text-muted-foreground">Please return to the test instructions to continue.</p>
          </div>
        </div>
      </main>
    </div>
  )
}
