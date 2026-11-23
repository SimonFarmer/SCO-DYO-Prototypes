import { useState } from "react"
import { useNavigate, useParams } from "react-router"
import { DiamondGlp } from "@/components/diamond/diamond-glp"
import { DiamondPdp } from "@/components/diamond/diamond-pdp"
import { DiamondQuickview } from "@/components/diamond/diamond-quickview"
import { DIAMONDS, type Diamond } from "@/data/diamonds"
import { useFlow } from "@/flow/flow-context"
import { FLOW_GLP_KEY, FLOW_ROUTES } from "@/flow/flow-paths"
import { SPECS_VARIANTS } from "@/pages/test-3/variants"
import { findFlowDiamond } from "./stone-bridge"
import { useFlowSelectDiamond } from "./use-flow-stone"

/**
 * Full DYO flow · GLP ("View All" from the stone step). Test 3's GLP as is, on the flow's own session
 * state (seeded with the shopper's preferences). Tiles open the Quickview (t31 B) or the Diamond PDP (t31 A).
 */
export function FlowGlp() {
  const flow = useFlow()
  const navigate = useNavigate()
  const selectDiamond = useFlowSelectDiamond()
  const [quickview, setQuickview] = useState<Diamond | null>(null)
  const opensQuickview = flow?.config.t31 !== "A"
  const toPdp = (d: Diamond) => {
    setQuickview(null)
    navigate(flow ? flow.path(FLOW_ROUTES.diamond(d.id)) : FLOW_ROUTES.diamond(d.id))
    window.scrollTo({ top: 0 })
  }

  return (
    <>
      <DiamondGlp onOpen={opensQuickview ? setQuickview : toPdp} storageKey={FLOW_GLP_KEY} />
      {opensQuickview && (
        <DiamondQuickview
          diamond={quickview}
          onOpenChange={(open) => !open && setQuickview(null)}
          onSelect={(d) => {
            setQuickview(null)
            selectDiamond(d)
          }}
          onViewDetails={toPdp}
        />
      )}
    </>
  )
}

/** Full DYO flow · Diamond PDP: a GLP stone or a recommended pick, spec layout from the flow config (t32). */
export function FlowDiamondPdp() {
  const flow = useFlow()
  const selectDiamond = useFlowSelectDiamond()
  const diamond = findFlowDiamond(useParams().id) ?? DIAMONDS[0]
  const layout = SPECS_VARIANTS[flow?.config.t32 ?? "A"].layout
  return <DiamondPdp key={diamond.id} diamond={diamond} specLayout={layout} onSelect={() => selectDiamond(diamond)} stickyBar />
}
