import { useVariant } from "@/lib/hooks"
import { RingReviewA } from "./ring-review-a"

const VARIANTS = ["A", "B"] as const

/** Test 4 · Ring Personalization as a Separate Step. Switch with ?variant=A|B. */
export function Test4() {
  const variant = useVariant(VARIANTS)
  if (variant === "B") {
    return (
      <main className="flex min-h-svh items-center justify-center bg-secondary px-margin">
        <p className="type-label-xs text-muted-foreground">Variant B isn’t built yet</p>
      </main>
    )
  }
  return <RingReviewA />
}
