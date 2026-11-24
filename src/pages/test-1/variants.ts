/**
 * Test 1 — Settings PDP Gallery & Details (unmoderated).
 * Test plan: https://osfdigital.atlassian.net/wiki/spaces/SCO/pages/7887650819
 *
 * Full factorial: 2 galleries × 3 ways to reach the product details = 6 variants.
 *
 *                       | Link → drawer | 2-line teaser → drawer | Link → tabs below the CTA
 *   Long-scroll gallery |       A       |           B            |            D
 *   Thumbnail gallery   |       E       |           F            |            C
 *
 * A, B and C keep the URLs they launched with; D, E and F fill the remaining cells.
 * Products, prices and data are identical across variants; only these two dimensions change.
 * Open a variant with `/test-1/a` … `/test-1/f`, or `/test-1?variant=A`. Unknown or missing → A (via `useVariant`).
 */

export type GalleryMode = "long-scroll" | "thumbnails"
export type DetailsMode = "drawer" | "teaser-drawer" | "inline-tabs"

export interface SettingPdpVariant {
  id: "A" | "B" | "C" | "D" | "E" | "F"
  /** Short name used in the prototype index */
  name: string
  /** What the researcher needs to know about this variant */
  summary: string
  /** Figma frames this variant is built from (gallery frame, details frame) */
  figma: string
  gallery: GalleryMode
  details: DetailsMode
  /** Mobile carousel without thumbnails, dots on the image instead (Figma SCO Drop 3a – PDP 4096:179324). Variant A only. */
  mobileDots?: boolean
}

const FIGMA = "https://www.figma.com/design/Q4Wp6ls6O4nBvicBjbosQI/SCO-Drop-3b---Customizer?node-id="

/** Wording for each dimension, shared by the variant names and summaries. */
export const GALLERY_LABEL: Record<GalleryMode, string> = {
  "long-scroll": "Long-scroll gallery",
  thumbnails: "Thumbnail gallery",
}
export const DETAILS_LABEL: Record<DetailsMode, string> = {
  drawer: "details link → drawer",
  "teaser-drawer": "2-line teaser + details link → drawer",
  "inline-tabs": "details link → tabs below the CTA",
}

const variant = (id: SettingPdpVariant["id"], gallery: GalleryMode, details: DetailsMode, figma: string): SettingPdpVariant => ({
  id,
  name: `${GALLERY_LABEL[gallery]} · ${DETAILS_LABEL[details]}`,
  summary: `${GALLERY_LABEL[gallery]}; product details via ${DETAILS_LABEL[details]}.`,
  figma: `${FIGMA}${figma}`,
  gallery,
  details,
})

export const SETTING_PDP_VARIANTS: Record<SettingPdpVariant["id"], SettingPdpVariant> = {
  // A on phones: the carousel drops its thumbnail row for dots (desktop unchanged).
  A: { ...variant("A", "long-scroll", "drawer", "7342-118090"), mobileDots: true },
  B: variant("B", "long-scroll", "teaser-drawer", "7342-118191"),
  C: variant("C", "thumbnails", "inline-tabs", "7342-118091"),
  D: variant("D", "long-scroll", "inline-tabs", "7342-118090"),
  E: variant("E", "thumbnails", "drawer", "7342-118091"),
  F: variant("F", "thumbnails", "teaser-drawer", "7342-118091"),
}

/** Allowed ?variant= values, first one is the default. */
export const VARIANT_IDS = ["A", "B", "C", "D", "E", "F"] as const
