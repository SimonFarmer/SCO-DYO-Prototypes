import { DESIGNS, SHAPES, STYLES, settingImage } from "./plp"
import { ELLA_CATHEDRAL, METALS, SIZE_GUIDE, type GalleryMedia, type MetalId, type Setting } from "./products"
import { SETTING_PDPS } from "./setting-pdps"

/**
 * The full flow's settings: every PLP design as a full Setting PDP, so the flow opens the ring that was
 * clicked. Content (description, highlights, specs, styled photos) is shaneco.com's, generated into
 * setting-pdps.ts by scripts/shaneco/build-settings.mjs; metals, item IDs, prices and accepted shapes come
 * from the PLP catalogue. Ella Cathedral (Test 1's setting, not on the PLP) stays the fallback.
 *
 * Gallery per metal, as on shaneco.com: Shane Co.'s render of that metal holding the default shape, then that
 * metal's own product views (front, side, extra angles), then its own styled photos. Styled photos exist in some
 * metals only: a metal without them borrows one other metal's set, badged "Shown in …" (as on Ella Cathedral).
 */
function settingFromDesign(designId: string): Setting | undefined {
  const design = DESIGNS.find((d) => d.id === designId)
  const pdp = SETTING_PDPS[designId]
  if (!design || !pdp) return undefined

  const variants = design.metals.map(([metal, articleNo, price]) => ({ metal: metal as MetalId, articleNo, price }))
  const [defaultShape] = design.shapes
  const shapeLabel = (id: string) => SHAPES.find((s) => s.id === id)?.label ?? id
  const metalName = (m: MetalId) => METALS[m].label.toLowerCase()
  // Shots A1–A4 are product views (side, front, extra angles); higher numbers are styled and on-hand photos.
  const isView = (src: string) => Number(src.match(/-A(\d+)\.jpg$/)?.[1]) <= 4
  const viewName = (src: string) => ({ "1": "side view", "2": "front view" })[src.match(/-A(\d+)\.jpg$/)?.[1] ?? ""] ?? "angled view"
  const styledOf = (m: MetalId) => (pdp.gallery[m] ?? []).filter((src) => !isView(src))
  /** This metal's styled photos; without any, the first other metal's set (in the PLP's metal order), badged. */
  const styledFor = (m: MetalId): GalleryMedia[] => {
    const own = styledOf(m)
    if (own.length) return own.map((src) => ({ kind: "image", src, alt: `${design.name} in ${metalName(m)}, styled` }))
    const donor = variants.find((o) => styledOf(o.metal).length)?.metal
    if (!donor) return []
    const shown = metalName(donor).replace(/^14k /, "")
    return styledOf(donor).map((src) => ({ kind: "image", src, alt: `${design.name} in ${shown}, styled`, badge: `Shown in ${shown}` }))
  }

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
        const metal = metalName(v.metal)
        return [
          v.metal,
          [
            { kind: "image", src: settingImage(v.articleNo, defaultShape), alt: `${design.name} in ${metal} with a 1 ct ${shapeLabel(defaultShape).toLowerCase()} diamond` },
            // Shane Co.'s order: front view (A2), side view (A1), extra angles.
            ...(pdp.gallery[v.metal] ?? []).filter(isView).map((src): GalleryMedia => ({ kind: "image", src, alt: `${design.name} in ${metal}, ${viewName(src)}` })),
            ...styledFor(v.metal),
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
