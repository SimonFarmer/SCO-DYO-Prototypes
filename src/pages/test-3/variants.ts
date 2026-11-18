/**
 * Test 3 — Stone Details (unmoderated).
 * Test plan: https://osfdigital.atlassian.net/wiki/spaces/SCO/pages/7887650819
 *
 * Two prototypes, each with its own participant URLs. Same stones and data in every variant.
 *   3.1 Quickview vs PDP   /test-3-quickview/a  /test-3-quickview/b
 *   3.2 Spec layout        /test-3-specs/a      /test-3-specs/b
 * 3.3 (4Cs education & layout) comes later; its links are inert for now.
 * Neither prototype links to another test: each starts on its own first page.
 */
import type { SpecLayout } from "@/components/diamond/diamond-specs"

const FIGMA = "https://www.figma.com/design/Q4Wp6ls6O4nBvicBjbosQI/SCO-Drop-3b---Customizer?node-id="

export const QUICKVIEW_VARIANT_IDS = ["A", "B"] as const
export type QuickviewVariantId = (typeof QUICKVIEW_VARIANT_IDS)[number]

export const QUICKVIEW_VARIANTS: Record<QuickviewVariantId, { name: string; summary: string; opens: "pdp" | "quickview" }> = {
  A: { name: "Tile → full PDP (control)", summary: "Clicking a stone tile on the GLP opens the full Diamond PDP.", opens: "pdp" },
  B: {
    name: "Quickview modal",
    summary: "Clicking a stone tile opens the Quickview with Select This Diamond and View Full Details (→ PDP).",
    opens: "quickview",
  },
}

/** Spec layout on the 3.1 PDP: the list, so it matches the Quickview and only the navigation differs. */
export const QUICKVIEW_PDP_LAYOUT: SpecLayout = "list"

export const SPECS_VARIANT_IDS = ["A", "B"] as const
export type SpecsVariantId = (typeof SPECS_VARIANT_IDS)[number]

export const SPECS_VARIANTS: Record<SpecsVariantId, { name: string; layout: SpecLayout; figma: string }> = {
  A: { name: "Horizontal spec tiles", layout: "tiles", figma: `${FIGMA}7375-129294` },
  B: { name: "Vertical spec table", layout: "list", figma: `${FIGMA}7375-134699` },
}

export const FIGMA_GLP = `${FIGMA}7375-125910`
export const FIGMA_QUICKVIEW = `${FIGMA}7375-133345`
