import { useNavigate } from "react-router"
import { flowMetalFor, flowSettingFor } from "@/data/flow-settings"
import { useFlow } from "@/flow/flow-context"
import { FLOW_CRUMBS } from "@/flow/flow-paths"
import { firstStoneQuery, flowStonePath } from "@/flow/stone/simulator"
import { SettingPdp } from "@/flow/pages/setting-pdp"
import { useRingBuild } from "@/state/ring-build"

/**
 * Full DYO flow (Test 5, moderated) · step 1, Settings PDP. Reached from the flow's Settings PLP, it shows
 * the setting that was clicked (Ella Cathedral when none was). The Test 1 variant comes from the flow config
 * (default B, `?t1=` to switch).
 */
export function FlowSettingPdp() {
  const flow = useFlow()
  const navigate = useNavigate()
  const { settingId, settingMetal, setSettingMetal, shape, start, setting: built, setSettingChosen } = useRingBuild()
  const setting = flowSettingFor(settingId)
  if (!flow) return null

  return (
    <SettingPdp
      key={setting.id}
      variant={flow.config.t1}
      flow={{
        setting,
        metal: flowMetalFor(setting, settingMetal),
        onMetalChange: setSettingMetal,
        initialShape: shape,
        breadcrumb: flow.config.crumbs ? FLOW_CRUMBS.setting(settingId) : null,
        // On to step 2, stone preferences, in the shape the shopper came in with when this setting takes it,
        // otherwise the setting's own default shape (a marquise halo starts on marquise, not round).
        onSelect: () => {
          setSettingChosen(true)
          // Stone-first (setting removed with a stone already picked): the stone is done, so on to step 3.
          if (start === "stone") {
            navigate(flow.path("/finish"))
            window.scrollTo({ top: 0 })
            return
          }
          const stoneShape = shape && setting.shapes.includes(shape) ? shape : setting.shapes[0]
          navigate(flow.path(flowStonePath("preferences", firstStoneQuery(flow.config.t2, stoneShape, built.price))))
          window.scrollTo({ top: 0 })
        },
      }}
    />
  )
}
