/**
 * Shared mock data for the DYO prototypes. Keep products identical across test variants.
 */

import { SETTINGS, productImage } from "./plp"

export type MetalId = "14k-white-gold" | "14k-yellow-gold" | "14k-rose-gold" | "platinum" | "sterling-silver"

export interface Metal {
  id: MetalId
  label: string
  /** Swatch fill. Product data, not a design token (no Pattern Library variable exists for metals). */
  swatch: string
}

export const METALS: Record<MetalId, Metal> = {
  "14k-white-gold": { id: "14k-white-gold", label: "14k White Gold", swatch: "#dedede" },
  "14k-yellow-gold": { id: "14k-yellow-gold", label: "14k Yellow Gold", swatch: "#eed9ac" },
  "14k-rose-gold": { id: "14k-rose-gold", label: "14k Rose Gold", swatch: "#edbea0" },
  platinum: { id: "platinum", label: "Platinum", swatch: "#d6d6d6" },
  "sterling-silver": { id: "sterling-silver", label: "Sterling Silver", swatch: "#dedede" },
}

export interface GalleryMedia {
  src: string
  alt: string
  kind: "image" | "video" | "size-guide"
  /** Annotation badge shown bottom-left of the tile */
  badge?: string
}

/** Carat size guide — not metal-specific, shown in every metal's gallery. */
export const SIZE_GUIDE: GalleryMedia = {
  kind: "size-guide",
  src: "/images/gallery/size-guide.png",
  alt: "Carat size guide on hand, 1 to 5 ct",
}

export interface SettingVariant {
  metal: MetalId
  articleNo: string
  /** Setting-only price in USD */
  price: number
}

export interface Setting {
  id: string
  name: string
  breadcrumb: string[]
  variants: SettingVariant[]
  defaultMetal: MetalId
  /** Center stone the gallery hero is previewed with */
  previewStone: { shape: string; carat: number }
  /** Center-stone shapes the setting is made for (ids from SHAPES in plp.ts), first = default preview. */
  shapes: string[]
  /** Hero image per metal and preview shape (stone preview dropdown). The default shape keeps the gallery's own hero. */
  shapeImages?: Partial<Record<MetalId, Record<string, string>>>
  /** Gallery per metal: the first three images follow the metal, the styled photos after them are shared. */
  gallery: Partial<Record<MetalId, GalleryMedia[]>>
  /** `{metal}` is replaced with the selected metal (see descriptionFor). */
  description: string
  /** Key facts listed under the description; `{metal}` is replaced with the metal name (see highlightsFor). */
  highlights: string[]
  detailSections: string[]
  /** Specifications tab of the product info drawer. "Metal Type" is derived from the selected metal. */
  specs: { label: string; value: string }[]
}

const G = "/images/gallery/ella"

/**
 * Ella Cathedral Engagement Ring — content, prices and article numbers from shaneco.com
 * (e.g. /p/41072560, Nov 2026). Chosen for Test 1 because its description carries stone-fit
 * info ("Best fits up to a 1.50 ct. diamond") and its metals have different image sets.
 */
/**
 * Styled photos shown for every metal, after the metal's own three shots. Each badge says which
 * metal and center stone the photo actually shows, since it may differ from the selection.
 */
const STYLED: GalleryMedia[] = [
  { kind: "image", src: `${G}/white-gold/styled.jpg`, alt: "Ring in 14k white gold with a round diamond, resting on rosemary", badge: "Shown in white gold, round cut" },
  { kind: "image", src: `${G}/yellow-gold/on-hand-princess.jpg`, alt: "Ring in 14k yellow gold with a princess-cut diamond, on hand", badge: "Shown in yellow gold, princess cut" },
  { kind: "image", src: `${G}/rose-gold/styled-box.jpg`, alt: "Ring in 14k rose gold with a round diamond, in a green velvet ring box", badge: "Shown in rose gold, round cut" },
  { kind: "image", src: `${G}/platinum/styled-blush-box-oval.jpg`, alt: "Ring in platinum with an oval diamond, in a blush velvet ring box", badge: "Shown in platinum, oval cut" },
  { kind: "image", src: `${G}/white-gold/on-hand-lace.jpg`, alt: "Ring in 14k white gold with a round diamond, on hand against a lace wedding dress", badge: "Shown in white gold, round cut" },
]

export const ELLA_CATHEDRAL: Setting = {
  id: "ella-cathedral",
  name: "Ella Cathedral Engagement Ring",
  breadcrumb: ["Home", "Engagement Rings", "Classic Engagement Rings"],
  variants: [
    { metal: "14k-white-gold", articleNo: "41072560", price: 2225 },
    { metal: "14k-yellow-gold", articleNo: "41076522", price: 2225 },
    { metal: "14k-rose-gold", articleNo: "41072561", price: 2225 },
    { metal: "platinum", articleNo: "41072448", price: 2425 },
  ],
  defaultMetal: "14k-white-gold",
  previewStone: { shape: "Round", carat: 1 },
  // Same shapes as the Ella Cathedral card on the PLP.
  shapes: ["round", "oval", "cushion", "princess"],
  shapeImages: Object.fromEntries(
    (
      [
        ["14k-white-gold", "white-gold"],
        ["14k-yellow-gold", "yellow-gold"],
        ["14k-rose-gold", "rose-gold"],
        ["platinum", "platinum"],
      ] as const
    ).map(([metal, dir]) => [
      metal,
      Object.fromEntries(["round", "oval", "cushion", "princess"].map((s) => [s, `${G}/${dir}/shape-${s}.webp`])),
    ]),
  ),
  // The first three images follow the selected metal; the styled photos after them are the same
  // for every metal, each annotated with the metal and stone it actually shows (see STYLED below).
  gallery: Object.fromEntries(
    (
      [
        ["14k-white-gold", "white-gold", "14k white gold"],
        ["14k-yellow-gold", "yellow-gold", "14k yellow gold"],
        ["14k-rose-gold", "rose-gold", "14k rose gold"],
        ["platinum", "platinum", "platinum"],
      ] as const
    ).map(([metal, dir, name]) => [
      metal,
      [
        { kind: "image", src: `${G}/${dir}/main.jpg`, alt: `Ella Cathedral in ${name} with a 1 ct round diamond` },
        { kind: "image", src: `${G}/${dir}/side.jpg`, alt: "Side profile showing the diamond pavé cathedral" },
        { kind: "image", src: `${G}/${dir}/front.jpg`, alt: "Front view through the band, showing the pavé gallery under the head" },
        ...STYLED,
        SIZE_GUIDE,
      ] satisfies GalleryMedia[],
    ]),
  ),
  description:
    "This {metal} engagement ring offers sparkle from all angles. It features a natural diamond pavé band and a shimmering cathedral encrusted with more natural diamond accents. Add the center stone of your choice to complete this dreamy ring. For more information on selecting your center stone, including accommodating a center stone larger than 1.50 ct. or adding a decorative crown, live chat online, call a customer service representative at 1-866-467-4263, or visit one of our store locations.",
  highlights: [
    "Best fits up to a 1.50 ct. diamond",
    "48 round natural diamond accents at approx. 0.30 tcw",
    "Center stone sold separately",
    "{metal}",
    "Approx. 1.5mm band width",
    "Engravable and resizable",
  ],
  detailSections: ["Setting Details", "Center Stone Compatibility", "Ring Size Guide"],
  specs: [
    { label: "Band Width", value: "Approx. 1.5mm" },
    { label: "Engravable", value: "Yes" },
    { label: "Stackable", value: "Yes" },
    { label: "Metal Finish", value: "Polished" },
    { label: "Gemstone Type", value: "Natural Diamond" },
    { label: "Gemstone Carat Weight", value: "Approx. 0.30 tcw (center stone sold separately)" },
    { label: "Number of Gemstones", value: "48" },
    { label: "Accent Stone Shape", value: "Round" },
  ],
}

export interface ProductCardData {
  id: string
  name: string
  price: number
  image: string
  badge?: string
  /** Optional muted variant line under the name */
  variantLabel?: string
  /** Swatches, first one selected */
  metals?: MetalId[]
}

/** PLP designs shown in Similar Styles, closest styles to the Ella Cathedral first. Two keep a Top seller badge. */
const SIMILAR_DESIGNS: { id: string; badge?: string }[] = [
  { id: "modena-cathedral" },
  { id: "aspen-cathedral" },
  { id: "vista-pave", badge: "Top seller" },
  { id: "privet" },
  { id: "marianne-three-stone" },
  { id: "ella-halo" },
  { id: "willow-infinity" },
  { id: "timeless-solitaire", badge: "Top seller" },
  { id: "plume" },
  { id: "poesie-three-stone" },
  { id: "luminary-solitaire" },
]

/**
 * Engagement rings from the PLP catalogue (src/data/plp.ts): each design's lead-metal card, with the
 * same name, price and Shane Co. render the PLP shows, so the images follow the PLP data.
 */
export const SIMILAR_STYLES: ProductCardData[] = SIMILAR_DESIGNS.flatMap(({ id, badge }) => {
  const card = SETTINGS.find((p) => p.designId === id)
  return card ? [{ id: `ss-${id}`, name: card.name, price: card.price, image: productImage(card), badge }] : []
})

export const MATCHING_BANDS: ProductCardData[] = [
  { id: "mb-1", name: "Vista Diamond Pave Band", price: 1195, image: "/images/matching-bands/band-1-vista.png", badge: "Top seller" },
  { id: "mb-2", name: "Baguette & Round Diamond Band", price: 2365, image: "/images/matching-bands/band-2-baguette.png" },
  { id: "mb-3", name: "Margaret Double Row Diamond Band", price: 2950, image: "/images/matching-bands/band-3-margaret.png", badge: "Top seller" },
  { id: "mb-4", name: "14K Yellow Gold Band (1.3mm)", price: 315, image: "/images/matching-bands/band-4-14k-yellow.png" },
  { id: "mb-5", name: "Reign Double Row 1.50 tcw Diamond Pave Band", price: 4997, image: "/images/matching-bands/band-5-reign.png", badge: "Top seller" },
  { id: "mb-6", name: "Solitaire Engagement Ring", price: 460, image: "/images/matching-bands/ring-6-solitaire.png" },
  // Added beyond the Figma frame so the carousel fills wide screens (images reused from the library).
  { id: "mb-7", name: "Contour Diamond Wedding Band", price: 1450, image: "/images/products/ring-2.png" },
  { id: "mb-8", name: "14K White Gold Band (2mm)", price: 395, image: "/images/products/ring-4.png" },
  { id: "mb-9", name: "Eternity Shared Prong Diamond Band", price: 3290, image: "/images/matching-bands/band-3-margaret.png", badge: "Top seller" },
  { id: "mb-10", name: "Milgrain Edge Wedding Band", price: 540, image: "/images/matching-bands/band-4-14k-yellow.png" },
  { id: "mb-11", name: "Rose Gold Pavé Stacking Band", price: 980, image: "/images/recommender/rec-5-rose-band.png" },
  { id: "mb-12", name: "Channel Set Baguette Band", price: 2180, image: "/images/matching-bands/band-2-baguette.png" },
]

/** "Pick up where you left off" — names are Lorem placeholders in Figma; kept verbatim. */
export const RECENTLY_VIEWED: ProductCardData[] = [
  { id: "rv-1", name: "Morbi in sem quis dui placerat", price: 460, image: "/images/products/ring-1.png", metals: ["14k-yellow-gold", "14k-white-gold", "platinum"] },
  { id: "rv-2", name: "Morbi in sem quis dui placerat", price: 460, image: "/images/recommender/rec-2-cross-necklace.png", metals: ["14k-white-gold", "14k-yellow-gold", "platinum"] },
  { id: "rv-3", name: "Morbi in sem quis dui placerat", price: 460, image: "/images/recommender/rec-3-hoop-earrings.png", metals: ["sterling-silver"] },
  { id: "rv-4", name: "Morbi in sem quis dui placerat", price: 460, image: "/images/matching-bands/gallery-placeholder.png", badge: "Top seller", metals: ["14k-white-gold", "14k-yellow-gold", "platinum"] },
  { id: "rv-5", name: "Morbi in sem quis dui placerat", price: 460, image: "/images/recommender/rec-5-rose-band.png", metals: ["14k-rose-gold"] },
  { id: "rv-6", name: "Solitaire Engagement Ring", price: 460, image: "/images/products/ring-1.png", variantLabel: "14K Yellow Gold" },
  // Added beyond the Figma frame so the carousel fills wide screens (images reused from the library).
  { id: "rv-7", name: "Vista Diamond Pave Band", price: 1195, image: "/images/matching-bands/band-1-vista.png", metals: ["14k-yellow-gold", "14k-white-gold", "platinum"] },
  { id: "rv-8", name: "Margaret Double Row Diamond Band", price: 2950, image: "/images/matching-bands/band-3-margaret.png", metals: ["14k-yellow-gold", "14k-white-gold"] },
  { id: "rv-9", name: "Diamond Cross Pendant", price: 650, image: "/images/recommender/rec-2-cross-necklace.png", metals: ["14k-white-gold", "14k-yellow-gold"] },
  { id: "rv-10", name: "Reign Double Row 1.50 tcw Diamond Pave Band", price: 4997, image: "/images/matching-bands/band-5-reign.png", badge: "Top seller", metals: ["14k-yellow-gold", "14k-white-gold", "platinum"] },
  { id: "rv-11", name: "Sterling Silver Hoop Earrings", price: 175, image: "/images/recommender/rec-3-hoop-earrings.png", metals: ["sterling-silver"] },
  { id: "rv-12", name: "Orbit 0.25 tcw Diamond Band", price: 1657, image: "/images/products/ring-5.png", metals: ["14k-white-gold", "14k-yellow-gold", "platinum"] },
]

export const VALUE_PROPS = [
  { title: ["Free Lifetime", "Warranty"], cta: "How It Works", image: "/images/how-we-do-right/warranty.jpg", position: "50% 76%" },
  { title: ["Trade Up", "Program"], cta: "How to Upgrade", image: "/images/how-we-do-right/trade-up.jpg", position: "50% 40%" },
  { title: ["Free 2 Day", "Shipping"], cta: "Delivery Options", image: "/images/how-we-do-right/shipping.jpg", position: "50% 35%" },
  { title: ["Always the Best", "Possible Price"], cta: "Fair Pricing", image: "/images/how-we-do-right/best-price.jpg", position: "50% 45%" },
  { title: ["Quality Diamonds", "Direct From Source"], cta: "How We Source", image: "/images/how-we-do-right/best-price.jpg", position: "50% 45%" },
  { title: ["60 Day", "Free Returns"], cta: "Return Policy", image: "/images/how-we-do-right/returns.jpg", position: "50% 55%" },
]

export const UGC_PHOTOS = [
  { src: "/images/ugc/ugc-1-couple.png", alt: "Couple embracing outdoors" },
  { src: "/images/ugc/ugc-2-ring-box.png", alt: "Hand with ring and Shane Co. box" },
  { src: "/images/ugc/ugc-3-hands.png", alt: "Couple's hands close-up" },
  { src: "/images/ugc/ugc-4-proposal.png", alt: "Outdoor proposal" },
]

/** Suggested monthly payment on 12-month special financing, rounded up to the dollar. */
export function monthlyPayment(total: number, months = 12) {
  return Math.ceil(total / months)
}

/** Gallery for the selected metal, falling back to the default metal's images. */
export function galleryFor(setting: Setting, metal: MetalId, previewShape?: string): GalleryMedia[] {
  const media = setting.gallery[metal] ?? setting.gallery[setting.defaultMetal] ?? []
  // Stone preview: a non-default shape swaps the hero for that shape's render in this metal.
  const src = previewShape && previewShape !== setting.shapes[0] ? setting.shapeImages?.[metal]?.[previewShape] : undefined
  if (!src || media.length === 0) return media
  const [hero, ...rest] = media
  return [{ ...hero, src, alt: `${setting.name} in ${METALS[metal].label.toLowerCase()} with a 1 ct ${previewShape} diamond` }, ...rest]
}

const METAL_PHRASE: Record<MetalId, string> = {
  "14k-white-gold": "14-karat white gold",
  "14k-yellow-gold": "14-karat yellow gold",
  "14k-rose-gold": "14-karat rose gold",
  platinum: "platinum",
  "sterling-silver": "sterling silver",
}

export function highlightsFor(setting: Setting, metal: MetalId) {
  const name = METALS[metal].label
  return setting.highlights.map((h) => h.replace("{metal}", metal === "platinum" ? name : name.toLowerCase()))
}

export function descriptionFor(setting: Setting, metal: MetalId) {
  return setting.description.replace("{metal}", METAL_PHRASE[metal])
}
