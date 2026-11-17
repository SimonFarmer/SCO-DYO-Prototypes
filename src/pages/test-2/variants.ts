/**
 * Test 2 — Stone Preferences & Recommendations (unmoderated).
 * Test plan: https://osfdigital.atlassian.net/wiki/spaces/SCO/pages/7887650819
 *
 * The variant only changes the step 2a entry controls. Stones, prices, the recommendations (2b)
 * and the Diamonds PLP are the same for every variant.
 * Open a variant with `/test-2?variant=A` (B, C). Unknown or missing → A.
 */

export type EntryControls = "size" | "budget" | "size-and-budget"

export interface StonePreferenceVariant {
  id: "A" | "B" | "C"
  name: string
  summary: string
  /** Figma frame this variant is built from */
  figma: string
  controls: EntryControls
}

const FIGMA = "https://www.figma.com/design/Q4Wp6ls6O4nBvicBjbosQI/SCO-Drop-3b---Customizer?node-id="

export const STONE_PREFERENCE_VARIANTS: Record<StonePreferenceVariant["id"], StonePreferenceVariant> = {
  A: {
    id: "A",
    name: "Size selector",
    summary: "Carat range slider with two independent handles (opens at 0.75–1.25 ct) → whole-ring price range for that range.",
    figma: `${FIGMA}7685-412966`,
    controls: "size",
  },
  B: {
    id: "B",
    name: "Total budget slider",
    summary: "Total ring budget → the stone sizes that budget buys.",
    figma: `${FIGMA}7685-414388`,
    controls: "budget",
  },
  C: {
    id: "C",
    name: "Size + budget",
    summary: "Budget handles set the available sizes; the carat slider picks a size within them, with trade-off messaging.",
    figma: `${FIGMA}7685-415174`,
    controls: "size-and-budget",
  },
}

export const VARIANT_IDS = ["A", "B", "C"] as const
