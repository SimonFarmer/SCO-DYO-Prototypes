import type { Crumb } from "@/components/site/breadcrumb"
import { flowSettingFor, flowSettingStyle } from "@/data/flow-settings"
import { PLP_PATH } from "@/data/plp"

const HOME: Crumb = { label: "Home", to: "/shop" }
const ENGAGEMENT_RINGS: Crumb = { label: "Engagement Rings", to: PLP_PATH }

/**
 * Breadcrumbs on the flow's steps. As on Blue Nile and Brilliant Earth, the trail places the current page in the
 * catalog and ends on it (the setting, the stone page, the diamond, the finishing step); the stepper under the
 * header says which Design Your Own step it is. `step` crumbs go back within the build, without the exit warning.
 */
export const FLOW_CRUMBS = {
  /** Setting PDP (and every accordion step, one product page): Home › Engagement Rings › {Style} › {Setting} */
  setting: (settingId: string | null | undefined): Crumb[] => {
    const style = flowSettingStyle(settingId)
    return [HOME, ENGAGEMENT_RINGS, { label: style.label, to: `${PLP_PATH}/${style.id}` }, flowSettingFor(settingId).name]
  },
  /** Stone preferences: Home › Engagement Rings › Find Your Stone */
  stone: [HOME, ENGAGEMENT_RINGS, "Find Your Stone"] as Crumb[],
  /** Recommendations: Home › Engagement Rings › Find Your Stone (the shopper's preferences) › Stone Recommendations */
  recommendations: (preferences: string): Crumb[] => [
    HOME,
    ENGAGEMENT_RINGS,
    { label: "Find Your Stone", to: preferences, step: true },
    "Stone Recommendations",
  ],
  /** Diamonds PLP opened from the header's Shop by Stone: Home › Diamonds */
  diamonds: [HOME, "Diamonds"] as Crumb[],
  /** Diamond PDP: Home › Diamonds (the flow's listing) › {Diamond} */
  diamond: (listing: string, name: string): Crumb[] => [HOME, { label: "Diamonds", to: listing, step: true }, name],
  /** Step 3: Home › Engagement Rings › Complete Your Ring / Review Your Ring */
  finish: [HOME, ENGAGEMENT_RINGS, "Complete Your Ring"] as Crumb[],
  review: [HOME, ENGAGEMENT_RINGS, "Review Your Ring"] as Crumb[],
}

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
