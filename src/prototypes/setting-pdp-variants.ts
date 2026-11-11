/**
 * Test 1 — Settings PDP Gallery & Details (unmoderated).
 * Test plan: https://osfdigital.atlassian.net/wiki/spaces/SCO/pages/7887650819
 *
 * Each variant is a fixed combination of the dimensions under test. Products, prices and
 * data are identical across variants; only the presentation changes.
 * Open a variant with `/dyo/setting?variant=A` (B, C). Unknown or missing → A.
 */

export type GalleryMode = "long-scroll" | "thumbnails"
export type DetailsMode = "drawer" | "inline-tabs"

export interface SettingPdpVariant {
  id: "A" | "B" | "C"
  /** Short name used in the prototype index */
  name: string
  /** What the researcher needs to know about this variant */
  summary: string
  /** Figma frame this variant is built from */
  figma: string
  gallery: GalleryMode
  details: DetailsMode
  /** Two-line description teaser above the details link (B) */
  teaser: boolean
  /** "Complete the Look" matching-set block in the buy form (C) */
  completeTheLook: boolean
}

const FIGMA = "https://www.figma.com/design/Q4Wp6ls6O4nBvicBjbosQI/SCO-Drop-3b---Customizer?node-id="

export const SETTING_PDP_VARIANTS: Record<SettingPdpVariant["id"], SettingPdpVariant> = {
  A: {
    id: "A",
    name: "Drawer only (control)",
    summary: "Long-scroll gallery. “View product details” opens the details drawer.",
    figma: `${FIGMA}7342-118090`,
    gallery: "long-scroll",
    details: "drawer",
    teaser: false,
    completeTheLook: false,
  },
  B: {
    id: "B",
    name: "Teaser + drawer",
    summary: "Long-scroll gallery. 2-line description teaser; “View full product details” opens the drawer.",
    figma: `${FIGMA}7342-118191`,
    gallery: "long-scroll",
    details: "drawer",
    teaser: true,
    completeTheLook: false,
  },
  C: {
    id: "C",
    name: "Thumbnails + tabs below the CTA",
    summary:
      "Single image with thumbnails. Overview / Specifications tabs sit in the buy form; “View product details” scrolls to them.",
    figma: `${FIGMA}7342-118091`,
    gallery: "thumbnails",
    details: "inline-tabs",
    teaser: false,
    completeTheLook: true,
  },
}

export function resolveSettingPdpVariant(param: string | null): SettingPdpVariant {
  const key = (param ?? "").toUpperCase() as SettingPdpVariant["id"]
  return SETTING_PDP_VARIANTS[key] ?? SETTING_PDP_VARIANTS.A
}
