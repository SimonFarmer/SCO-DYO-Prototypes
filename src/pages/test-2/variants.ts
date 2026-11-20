/**
 * Test 2 — Stone Preferences & Recommendations (unmoderated).
 * Test plan: https://osfdigital.atlassian.net/wiki/spaces/SCO/pages/7887650819
 * Behaviour: the "BASIC Diamond Preferences + Recommendations (DYO Step 2)" concept's three
 * "Shop by" modes. Styling: Figma 7685:417428 (Size + Budget, styled).
 *
 * The variant only changes how size and budget are set on 2a (and so which stones the picks
 * and the PLP draw from). Stones, prices, picks and the PLP are the same for every variant.
 * Participant URLs: `/test-2/a`, `/test-2/b`, `/test-2/c` (older `/test-2?variant=A` links still work).
 */

/** size = carat first; budget = budget first; both = size + budget */
export type ShopBy = "size" | "budget" | "both"

export interface StonePreferenceVariant {
  id: "A" | "B" | "C"
  name: string
  summary: string
  /** Figma frame this variant is built from */
  figma: string
  shopBy: ShopBy
}

const FIGMA = "https://www.figma.com/design/Q4Wp6ls6O4nBvicBjbosQI/SCO-Drop-3b---Customizer?node-id="

export const STONE_PREFERENCE_VARIANTS: Record<StonePreferenceVariant["id"], StonePreferenceVariant> = {
  A: {
    id: "A",
    name: "Carat first",
    summary: "Carat handle → whole-ring price range for that size (green band on the budget line). No budget handles.",
    figma: `${FIGMA}7685-417428`,
    shopBy: "size",
  },
  B: {
    id: "B",
    name: "Budget first",
    summary: "Budget handles on a stepped scale → sizes available at that budget (green band); the carat handle previews a size inside it.",
    figma: `${FIGMA}7685-417428`,
    shopBy: "budget",
  },
  C: {
    id: "C",
    name: "Size + Budget",
    summary:
      "Budget handles show the sizes that fit (green band); the carat handle can go outside it, to test whether shoppers should be able to choose a stone outside their budget.",
    figma: `${FIGMA}7685-417428`,
    shopBy: "both",
  },
}

export const VARIANT_IDS = ["A", "B", "C"] as const
