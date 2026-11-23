import { useNavigate } from "react-router"
import { ELLA_CATHEDRAL } from "@/data/products"
import { useFlow } from "@/flow/flow-context"
import { FLOW_CRUMBS } from "@/flow/flow-paths"
import { firstStoneQuery, flowStonePath } from "@/flow/stone/simulator"
import { SettingPdp } from "@/flow/pages/setting-pdp"
import { useRingBuild } from "@/state/ring-build"

/**
 * Full DYO flow (Test 5, moderated) · step 1, Settings PDP. Reached from the flow's Settings PLP; every
 * setting opens Ella Cathedral (the only setting with full PDP data). The Test 1 variant comes from the
 * flow config (default B, `?t1=` to switch).
 */
export function FlowSettingPdp() {
  const flow = useFlow()
  const navigate = useNavigate()
  const { settingMetal, setSettingMetal, shape } = useRingBuild()
  if (!flow) return null

  return (
    <SettingPdp
      variant={flow.config.t1}
      flow={{
        metal: settingMetal ?? ELLA_CATHEDRAL.defaultMetal,
        onMetalChange: setSettingMetal,
        initialShape: shape,
        breadcrumb: flow.config.crumbs ? FLOW_CRUMBS : null,
        // On to step 2, stone preferences, in the shape the shopper came in with.
        onSelect: () => {
          navigate(flow.path(flowStonePath("preferences", firstStoneQuery(flow.config.t2, shape))))
          window.scrollTo({ top: 0 })
        },
      }}
    />
  )
}
