import type { Crumb } from "@/components/site/breadcrumb"
import { PLP_PATH } from "@/data/plp"

/** Breadcrumb on every DYO step of the flow: benchmarks end the trail on the DYO step, not the product. */
export const FLOW_CRUMBS: Crumb[] = [{ label: "Home", to: "/shop" }, { label: "Engagement Rings", to: PLP_PATH }, "Design Your Own"]

/** Flow routes (relative to the site root; FlowLayout's `path` adds /flow). */
export const FLOW_ROUTES = {
  setting: "/setting",
  diamonds: "/diamonds",
  diamond: (id: string) => `/diamond/${id}`,
  /** Step 3: Finishing Touches (t4 B) or Ring Review with the options (t4 A) */
  finish: "/finish",
  /** t4 B's Ring Review */
  review: "/review",
  added: "/added",
} as const

/** Session key for the flow's GLP state (filters carried in from the stone preferences). */
export const FLOW_GLP_KEY = "flow-glp"
