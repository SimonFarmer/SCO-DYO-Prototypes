import { DESIGNS, SHAPES, STYLES, settingImage } from "./plp"
import { ELLA_CATHEDRAL, METALS, SIZE_GUIDE, type GalleryMedia, type MetalId, type Setting } from "./products"
import { SETTING_PDPS } from "./setting-pdps"

/**
 * The full flow's settings: every PLP design as a full Setting PDP, so the flow opens the ring that was
 * clicked. Content (description, highlights, specs, styled photos) is shaneco.com's, generated into
 * setting-pdps.ts by scripts/shaneco/build-settings.mjs; metals, item IDs, prices and accepted shapes come
 * from the PLP catalogue. Ella Cathedral (Test 1's setting, not on the PLP) stays the fallback.
 *
 * Per metal the gallery is Shane Co.'s render of that metal holding the default shape, its side profile, then
 * the styled photos, which exist in one metal only and say so in a badge (as on Ella Cathedral).
 */
function settingFromDesign(designId: string): Setting | undefined {
  const design = DESIGNS.find((d) => d.id === designId)
  const pdp = SETTING_PDPS[designId]
  if (!design || !pdp) return undefined

  const variants = design.metals.map(([metal, articleNo, price]) => ({ metal: metal as MetalId, articleNo, price }))
  const [defaultShape] = design.shapes
  const shapeLabel = (id: string) => SHAPES.find((s) => s.id === id)?.label ?? id
  const shownIn = METALS[pdp.shownIn].label.toLowerCase()
  const styled: GalleryMedia[] = pdp.styled.map((src) => ({
    kind: "image",
    src,
    alt: `${design.name} in ${shownIn}, styled`,
    badge: `Shown in ${shownIn.replace(/^14k /, "")}`,
  }))

  return {
    id: design.id,
    name: design.name,
    breadcrumb: pdp.breadcrumb,
    variants,
    defaultMetal: variants[0].metal,
    previewStone: { shape: shapeLabel(defaultShape), carat: 1 },
    shapes: design.shapes,
    shapeImages: Object.fromEntries(
      variants.map((v) => [v.metal, Object.fromEntries(design.shapes.map((s) => [s, settingImage(v.articleNo, s)]))]),
    ),
    gallery: Object.fromEntries(
      variants.map((v) => {
        const metal = METALS[v.metal].label.toLowerCase()
        return [
          v.metal,
          [
            { kind: "image", src: settingImage(v.articleNo, defaultShape), alt: `${design.name} in ${metal} with a 1 ct ${shapeLabel(defaultShape).toLowerCase()} diamond` },
            { kind: "image", src: `/images/plp/settings/${v.articleNo}/side.webp`, alt: `${design.name} in ${metal}, side profile` },
            ...styled,
            SIZE_GUIDE,
          ] satisfies GalleryMedia[],
        ]
      }),
    ),
    description: pdp.description,
    highlights: pdp.highlights,
    detailSections: ELLA_CATHEDRAL.detailSections,
    specs: pdp.specs,
  }
}

const cache = new Map<string, Setting>()

/** The flow's setting for a PLP design id; Ella Cathedral when none was picked (or the id is unknown). */
export function flowSettingFor(designId: string | null | undefined): Setting {
  if (!designId) return ELLA_CATHEDRAL
  if (!cache.has(designId)) cache.set(designId, settingFromDesign(designId) ?? ELLA_CATHEDRAL)
  return cache.get(designId)!
}

/** The PLP style a setting's breadcrumb goes back to: its first style (Classic for Ella Cathedral). */
export function flowSettingStyle(designId: string | null | undefined) {
  const id = DESIGNS.find((d) => d.id === designId)?.styles[0] ?? "classic"
  return { id, label: `${STYLES.find((s) => s.id === id)?.label ?? "Classic"} Engagement Rings` }
}

/** The setting's metal: the build's when the setting comes in it, otherwise the setting's default. */
export const flowMetalFor = (setting: Setting, metal: MetalId | null | undefined): MetalId =>
  setting.variants.some((v) => v.metal === metal) ? metal! : setting.defaultMetal
