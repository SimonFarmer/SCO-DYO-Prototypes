import { createContext, useContext, type ReactNode } from "react"
import { CLARITY_GRADES, COLOR_GRADES, CUT_GRADES } from "@/data/diamonds"
import { CARAT_BOUNDS, NO_FILTERS, PRICE_BOUNDS, appliedFilters, type DiamondFilterState } from "@/lib/diamond-filters"

/** `presets`: "What Matters Most" (the full flows only), the sidebar's presets as tiles. */
export type ExploreKey = "shape" | "presets" | "cut" | "clarity" | "color"

export interface ExploreTab {
  key: ExploreKey
  label: string
  copy: string
  learnMore: boolean
}

export interface AppliedChip {
  label: string
  clear: (f: DiamondFilterState) => DiamondFilterState
}

/**
 * What the Diamond GLP lists and how it words it. The GLP prototype and Test 3 use NATURAL_GLP (Test 3's
 * natural diamond catalogue); Test 2's PLP passes its own for natural, lab-grown or gemstone stock, so the
 * same hero, filters, tiles and content serve every stone type. Filter state keeps the GLP's shape:
 * `carat` holds the size (millimetres for gemstones) and colour / clarity are index ranges into `grades`.
 */
export interface GlpCatalog {
  hero: {
    title: string
    intro: string
    /** "Back to stone preferences". `inBar`: the page shows it in its own sticky bar instead (the full flows), so the hero leaves it out. */
    back: { label: string; onClick?: () => void; inBar?: boolean }
    /** Natural | Lab-Grown | Gemstones. Without `onChange`, only Natural is live (other types say "not part of this test"). */
    type: { value: string; options: { id: string; label: string }[]; onChange?: (id: string) => void }
  }
  explore: ExploreTab[]
  priceLabel: string
  priceBounds: [number, number]
  size: { label: string; info: string; bounds: [number, number]; step: number; format: (n: number) => string }
  noFilters: DiamondFilterState
  /** Worst → best, as the filter state's indexes */
  grades: { cut: readonly string[]; color: readonly string[]; clarity: readonly string[] }
  cutHint: Record<string, string>
  info: { cut: string; color: string; clarity: string }
  colorBands?: [string, number, number][]
  /** "What matters most?" presets (diamond grades) */
  presets: boolean
  certification: string
  /** The "Understand the 4Cs" in-grid banner */
  banner: boolean
  chips: (f: DiamondFilterState) => AppliedChip[]
  /** Extra sidebar section after Stone Shape (Test 2: the gemstone kinds) */
  extraFilters?: (value: DiamondFilterState, onChange: (f: DiamondFilterState) => void) => ReactNode
  /** Carat, Cut, Color and Clarity "Learn More" open the 4Cs drawers (full-flow study); otherwise "not part of this test". */
  education?: boolean
  /**
   * Certification (GIA, GSI, IGI) and L/W Ratio as filter controls (Figma 8300:40301) that only say "not part of this
   * test" (full-flow study); otherwise the two closed notes.
   */
  inertFilters?: boolean
}

export const CUT_HINT: Record<string, string> = {
  "Shane Classic": "Maximum sparkle and brilliance",
  Excellent: "Magnificent sparkle and light return",
  "Very Good": "Exceptional sparkle at a great value",
  Good: "Balanced sparkle and value",
  Fair: "Some sparkle with visible dark areas",
  Poor: "Limited sparkle and brilliance",
}

export const DIAMOND_EXPLORE: ExploreTab[] = [
  {
    key: "shape",
    label: "Shape",
    copy: "Shape is often the first step in choosing a diamond. Each shape has its own character, from the timeless brilliance of Round to the distinctive elegance of Oval, Emerald and Pear.",
    learnMore: false,
  },
  { key: "cut", label: "Cut", copy: "Cut determines how brilliantly a diamond reflects light, creating its sparkle and fire.", learnMore: true },
  { key: "clarity", label: "Clarity", copy: "Clarity measures visible inclusions on a scale from IF (highest) to I3 (lowest).", learnMore: true },
  { key: "color", label: "Color", copy: "Colour Grade helps compare diamonds from D (brightest white) to M (warmest tone).", learnMore: true },
]

/**
 * The full flows' Explore tabs for diamonds: Shape and "What Matters Most" (the sidebar's presets as
 * tiles). The hero keeps to the two plain-language decisions, as the setting PLP's Style | Shape; the
 * technical grades (Cut, Clarity, Color) stay in the sidebar, where a preset can be fine-tuned.
 */
export const DIAMOND_EXPLORE_WITH_PRESETS: ExploreTab[] = [
  DIAMOND_EXPLORE[0],
  { key: "presets", label: "What Matters Most", copy: "Pick a priority and we’ll set Cut, Color and Clarity for you.", learnMore: false },
]

/** Color bands under the color scale (Figma: Faint Yellow | Near Colorless | Colorless). */
export const DIAMOND_COLOR_BANDS: [string, number, number][] = [
  ["Faint Yellow", 0, 2],
  ["Near Colorless", 3, 6],
  ["Colorless", 7, 9],
]

export const STONE_TYPE_OPTIONS = [
  { id: "natural", label: "Natural" },
  { id: "lab", label: "Lab-Grown" },
  { id: "gemstone", label: "Gemstones" },
]

/** The Diamond GLP prototype as built (Test 3's natural diamonds). */
export const NATURAL_GLP: GlpCatalog = {
  hero: {
    title: "Natural Diamonds",
    intro: "Hand-selected, GIA-certified loose diamonds in a wide range of shapes and sizes. Choose the one that’s right for your ring.",
    back: { label: "Back to stone preferences" },
    type: { value: "natural", options: STONE_TYPE_OPTIONS },
  },
  explore: DIAMOND_EXPLORE,
  priceLabel: "Diamond Price",
  priceBounds: PRICE_BOUNDS,
  size: {
    label: "Carat",
    info: "Carat measures a diamond’s weight. While larger carat sizes often appear more impressive, a diamond’s cut and proportions also influence how large it looks.",
    bounds: CARAT_BOUNDS,
    step: 0.01,
    format: (n) => `${n.toFixed(2)} ct`,
  },
  noFilters: NO_FILTERS,
  grades: { cut: CUT_GRADES, color: COLOR_GRADES, clarity: CLARITY_GRADES },
  cutHint: CUT_HINT,
  info: {
    cut: "Cut determines how brilliantly a diamond reflects light, creating its sparkle and fire.",
    color: "Colour Grade helps compare diamonds from D (brightest white) to M (warmest tone).",
    clarity: "Clarity measures visible inclusions on a scale from IF (highest) to I3 (lowest).",
  },
  colorBands: DIAMOND_COLOR_BANDS,
  presets: true,
  certification: "All our natural diamonds are GIA certified.",
  banner: true,
  chips: appliedFilters,
}

const GlpCatalogContext = createContext<GlpCatalog>(NATURAL_GLP)

export const GlpCatalogProvider = GlpCatalogContext.Provider

export const useGlpCatalog = () => useContext(GlpCatalogContext)
