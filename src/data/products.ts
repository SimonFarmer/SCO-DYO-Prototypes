/**
 * Shared mock data for the DYO prototypes. Keep products identical across test variants.
 */

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
  "14k-rose-gold": { id: "14k-rose-gold", label: "14k Rose Gold", swatch: "#efb8a7" },
  platinum: { id: "platinum", label: "Platinum", swatch: "#c5c5c5" },
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
const SIZE_GUIDE: GalleryMedia = {
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
  /** Gallery per metal — the image count can differ by metal (Test 1 variant A: exact-metal images only). */
  gallery: Partial<Record<MetalId, GalleryMedia[]>>
  /** `{metal}` is replaced with the selected metal (see descriptionFor). */
  description: string
  detailSections: string[]
  /** Specifications tab of the product info drawer. "Metal Type" is derived from the selected metal. */
  specs: { label: string; value: string }[]
}

export const TIMELESS_SOLITAIRE: Setting = {
  id: "timeless-solitaire",
  name: "Timeless Solitaire Engagement Ring",
  breadcrumb: ["Home", "Engagement Rings"],
  variants: [
    { metal: "14k-white-gold", articleNo: "41004887", price: 690 },
    { metal: "14k-yellow-gold", articleNo: "41004888", price: 690 },
  ],
  defaultMetal: "14k-yellow-gold",
  previewStone: { shape: "Round", carat: 1 },
  gallery: {
    "14k-yellow-gold": [
      { kind: "image", src: "/images/gallery/yellow-gold/main.png", alt: "Timeless Solitaire in 14k yellow gold with a round diamond" },
      { kind: "video", src: "/images/gallery/yellow-gold/video.png", alt: "360° view of the setting in 14k yellow gold", badge: "360 view" },
      { kind: "image", src: "/images/gallery/yellow-gold/on-hand-1.png", alt: "Ring on hand", badge: "Shown with 2ct diamond" },
      { kind: "image", src: "/images/gallery/yellow-gold/on-hand-2.png", alt: "Ring on hand with upgraded crown", badge: "Shown with 2ct diamond + Upgraded Crown" },
      { kind: "image", src: "/images/gallery/yellow-gold/on-hand-3.png", alt: "Ring stacked with a pavé band", badge: "Styled with Vista Diamond Pave Band" },
      { kind: "image", src: "/images/gallery/yellow-gold/on-hand-4.png", alt: "Ring stacked with a baguette band", badge: "Styled with Baguette & Round Diamond Band" },
      SIZE_GUIDE,
    ],
    // Figma 7386:62056 (+ the shared size guide, which is not metal-specific).
    "14k-white-gold": [
      { kind: "image", src: "/images/gallery/white-gold/main.png", alt: "Timeless Solitaire in 14k white gold with a round diamond" },
      { kind: "video", src: "/images/gallery/white-gold/video.png", alt: "360° view of the setting in 14k white gold", badge: "360 view" },
      { kind: "image", src: "/images/gallery/white-gold/on-hand-1.png", alt: "Ring on hand", badge: "Shown with 2ct diamond" },
      { kind: "image", src: "/images/gallery/white-gold/on-hand-2.jpg", alt: "Ring on hand with upgraded crown", badge: "Shown with 2ct diamond + Upgraded Crown" },
      { kind: "image", src: "/images/gallery/white-gold/on-hand-3.png", alt: "Ring stacked with a pavé band", badge: "Styled with Vista Diamond Pave Band" },
      { kind: "image", src: "/images/gallery/white-gold/on-hand-4.jpg", alt: "Ring stacked with a baguette band", badge: "Styled with Baguette & Round Diamond Band" },
      SIZE_GUIDE,
    ],
  },
  description:
    "Add the center stone of your dreams to this {metal} solitaire engagement ring for a timeless, elegant look. For more information on selecting your center stone, live chat online, call a customer service representative at 1-866-467-4263, or visit one of our store locations.",
  detailSections: ["Setting Details", "Center Stone Compatibility", "Ring Size Guide"],
  specs: [
    { label: "Band Width", value: "Approx. 1.8 mm" },
    { label: "Engravable", value: "Yes" },
    { label: "Resizable", value: "Yes" },
    { label: "Metal Finish", value: "High Polish" },
    { label: "Fits Center Stones", value: "0.50 – 3.00 ct" },
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

export const SIMILAR_STYLES: ProductCardData[] = [
  { id: "ss-1", name: "Vista Diamond Pave Band", price: 1195, image: "/images/products/ring-1-alt.png", badge: "Top seller" },
  { id: "ss-2", name: "Baguette & Round Diamond Band", price: 2365, image: "/images/products/ring-2.png" },
  { id: "ss-3", name: "Margaret Double Row Diamond Band", price: 2950, image: "/images/products/ring-3.png", badge: "Top seller" },
  { id: "ss-4", name: "14K Yellow Gold Band (1.3mm)", price: 315, image: "/images/products/ring-4.png" },
  { id: "ss-5", name: "Orbit 0.25 tcw Diamond Band", price: 1657, image: "/images/products/ring-5.png", badge: "Top seller" },
  { id: "ss-6", name: "Solitaire Engagement Ring", price: 460, image: "/images/products/ring-1.png" },
  // Added beyond the Figma frame so the carousel fills wide screens (images reused from the library).
  { id: "ss-7", name: "Classic Marquise Bezel Solitaire", price: 890, image: "/images/matching-bands/band-2-baguette.png" },
  { id: "ss-8", name: "Princess Cut Cathedral Solitaire", price: 1240, image: "/images/matching-bands/gallery-placeholder.png", badge: "Top seller" },
  { id: "ss-9", name: "Petite Knife-Edge Solitaire", price: 640, image: "/images/products/ring-4.png" },
  { id: "ss-10", name: "Twisted Pavé Bypass Ring", price: 1875, image: "/images/products/ring-5.png" },
  { id: "ss-11", name: "Hidden Halo Solitaire", price: 1490, image: "/images/products/ring-3.png", badge: "Top seller" },
  { id: "ss-12", name: "Rose Gold Comfort Fit Solitaire", price: 720, image: "/images/recommender/rec-5-rose-band.png" },
]

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
export function galleryFor(setting: Setting, metal: MetalId): GalleryMedia[] {
  return setting.gallery[metal] ?? setting.gallery[setting.defaultMetal] ?? []
}

const METAL_PHRASE: Record<MetalId, string> = {
  "14k-white-gold": "14-karat white gold",
  "14k-yellow-gold": "14-karat yellow gold",
  "14k-rose-gold": "14-karat rose gold",
  platinum: "platinum",
  "sterling-silver": "sterling silver",
}

export function descriptionFor(setting: Setting, metal: MetalId) {
  return setting.description.replace("{metal}", METAL_PHRASE[metal])
}
