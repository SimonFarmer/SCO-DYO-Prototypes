import { useLocation, useNavigate, useParams, useSearchParams } from "react-router"
import { DiamondPdp } from "@/components/diamond/diamond-pdp"
import { DIAMONDS } from "@/data/diamonds"
import { BackBar } from "@/flow/back-bar"
import { storedPlpQuery, storedStoneQuery, useFlow } from "@/flow/flow-context"
import { FLOW_ROUTES } from "@/flow/flow-paths"
import { SPECS_VARIANTS } from "@/pages/test-3/variants"
import { findFlowDiamond } from "./find-diamond"
import { flowStonePath } from "./simulator"
import { useFlowSelectDiamond } from "./use-flow-stone"

/**
 * Full DYO flow · Diamond PDP ("Full Details" from the Quickview, or a tile/pick with flow t31 A): Test 3's
 * Diamond PDP as is, for a stone of the flow's stock, spec layout from the flow config (t32).
 *
 * In the full-flow study the breadcrumb gives way to a link back to where the stone was opened (`from`: the
 * recommendations or the Diamond PLP), as on the PLP, so the participant can carry on with the task.
 */
export function FlowDiamondPdp() {
  const flow = useFlow()
  const navigate = useNavigate()
  const { key } = useLocation()
  const [params] = useSearchParams()
  const selectDiamond = useFlowSelectDiamond()
  const diamond = findFlowDiamond(useParams().id) ?? DIAMONDS[0]
  const layout = SPECS_VARIANTS[flow?.config.t32 ?? "A"].layout

  let backBar = null
  if (flow?.study) {
    const recs = params.get("from") === "recs"
    const fallback = recs ? flowStonePath("recommendations", storedStoneQuery(flow.base)) : `${FLOW_ROUTES.diamonds}${storedPlpQuery(flow.base)}`
    backBar = (
      <BackBar
        page
        label={recs ? "Back to your recommendations" : "Back to diamonds"}
        // Back in history when there is one (the page as it was left); a direct visit goes to the page itself.
        onBack={() => (key !== "default" ? navigate(-1) : navigate(flow.path(fallback)))}
      />
    )
  }
  return <DiamondPdp key={diamond.id} diamond={diamond} specLayout={layout} onSelect={() => selectDiamond(diamond)} stickyBar backBar={backBar} />
}
