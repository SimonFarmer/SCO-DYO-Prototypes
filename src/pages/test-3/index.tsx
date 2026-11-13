import { useState } from "react"
import { useNavigate, useParams } from "react-router"
import { CheckCircleIcon } from "@phosphor-icons/react"
import { DiamondGlp } from "@/components/diamond/diamond-glp"
import { DiamondPdp } from "@/components/diamond/diamond-pdp"
import { DiamondQuickview } from "@/components/diamond/diamond-quickview"
import { DyoStepper } from "@/components/dyo/dyo-stepper"
import { RingSummary } from "@/components/dyo/ring-summary"
import { SiteHeader } from "@/components/site/site-header"
import { DIAMONDS, findDiamond, toStone, type Diamond } from "@/data/diamonds"
import { useVariant } from "@/lib/hooks"
import { useRingBuild } from "@/state/ring-build"
import {
  QUICKVIEW_PDP_LAYOUT,
  QUICKVIEW_VARIANTS,
  QUICKVIEW_VARIANT_IDS,
  SPECS_VARIANTS,
  SPECS_VARIANT_IDS,
} from "./variants"

/** Base path of the current variant, e.g. /test-3-quickview/b */
function useBase(prefix: string, variant: string) {
  return `/${prefix}/${variant.toLowerCase()}`
}

/** Picks the stone for the ring and goes to the end-of-task screen (stands in for Ring Review). */
function useSelectStone(base: string) {
  const { setStone } = useRingBuild()
  const navigate = useNavigate()
  return (d: Diamond) => {
    setStone(toStone(d))
    navigate(`${base}/review`)
    window.scrollTo(0, 0)
  }
}

/* ───────────────────────── 3.1 Quickview vs PDP ───────────────────────── */

/** GLP. Variant A: tile → PDP. Variant B: tile → Quickview (Full Details → PDP). */
export function Test3Quickview() {
  const variant = useVariant(QUICKVIEW_VARIANT_IDS)
  const base = useBase("test-3-quickview", variant)
  const navigate = useNavigate()
  const select = useSelectStone(base)
  const [quickview, setQuickview] = useState<Diamond | null>(null)
  const toPdp = (d: Diamond) => {
    setQuickview(null)
    navigate(`${base}/diamond/${d.id}`)
    window.scrollTo(0, 0)
  }
  const opensQuickview = QUICKVIEW_VARIANTS[variant].opens === "quickview"

  return (
    <div data-variant={variant}>
      <DiamondGlp onOpen={opensQuickview ? setQuickview : toPdp} />
      {opensQuickview && (
        <DiamondQuickview
          diamond={quickview}
          onOpenChange={(open) => !open && setQuickview(null)}
          onSelect={select}
          onViewDetails={toPdp}
        />
      )}
    </div>
  )
}

/** Full Diamond PDP reached from the GLP (A) or the Quickview’s Full Details (B). */
export function Test3QuickviewPdp() {
  const variant = useVariant(QUICKVIEW_VARIANT_IDS)
  const base = useBase("test-3-quickview", variant)
  const select = useSelectStone(base)
  const diamond = findDiamond(useParams().id) ?? DIAMONDS[0]
  return <DiamondPdp key={diamond.id} diamond={diamond} specLayout={QUICKVIEW_PDP_LAYOUT} onSelect={() => select(diamond)} />
}

/* ───────────────────────── 3.2 Spec layout ───────────────────────── */

/** Diamond PDP with horizontal spec tiles (A) or a vertical spec table (B). Same stone in both. */
export function Test3Specs() {
  const variant = useVariant(SPECS_VARIANT_IDS)
  const select = useSelectStone(useBase("test-3-specs", variant))
  const diamond = DIAMONDS[0]
  return (
    <div data-variant={variant}>
      <DiamondPdp diamond={diamond} specLayout={SPECS_VARIANTS[variant].layout} onSelect={() => select(diamond)} />
    </div>
  )
}

/* ───────────────────────── End of task ───────────────────────── */

/** Reached after “Select this Diamond”: the ring with the chosen stone, and the end-of-task note. */
export function Test3Done() {
  return (
    <div className="min-h-svh bg-secondary">
      <SiteHeader />
      <DyoStepper current={3} />
      <main className="px-margin py-16 max-lg:py-8">
        <div className="mx-auto flex max-w-2xl flex-col gap-8 bg-background p-10 max-lg:p-6">
          <div className="flex flex-col items-center gap-4 text-center">
            <CheckCircleIcon className="size-10 text-success" weight="fill" />
            <h1 className="type-h3 text-primary">Your diamond has been added to your ring</h1>
          </div>
          <div className="h-px bg-muted" />
          <RingSummary readOnly />
          <div className="flex flex-col gap-1 bg-bg-input-50 p-4 text-center">
            <p className="type-label-xs text-primary">This is the end of the task</p>
            <p className="type-caption text-muted-foreground">Please return to the test instructions to continue.</p>
          </div>
        </div>
      </main>
    </div>
  )
}
