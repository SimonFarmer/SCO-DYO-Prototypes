/**
 * Engagement Ring PLP catalogue (Figma SCO Drop 3b – Customizer › "Engagement Ring PLP", 7845:197888).
 * 14 real Shane Co. settings, two per setting style, with their live item IDs, metals, setting prices
 * and accepted center-stone shapes (read from each shaneco.com PDP, November 2026). One card per
 * setting × metal. Card images are Shane Co.'s own renders of that setting in that metal holding each
 * accepted shape (~1 ct), saved under /images/plp/settings/{itemId}/{shape}.webp, so the card shows the
 * stone shape the shopper filters by. Fulfilment and popularity are simulated, deterministically.
 */

// ---------------------------------------------------------------------------------------------
// Facets
// ---------------------------------------------------------------------------------------------

export interface Facet {
  id: string
  label: string
}

/** Setting styles, in the order of the hero carousel and sidebar (Figma). Images are real settings in that style. */
export const STYLES: (Facet & { image: string })[] = [
  { id: "classic", label: "Classic", image: "/images/plp/settings/41004888/round.webp" },
  { id: "halo", label: "Halo", image: "/images/plp/settings/41098343/marquise.webp" },
  { id: "pave", label: "Pavé", image: "/images/plp/settings/41048069/oval.webp" },
  { id: "cathedral", label: "Cathedral", image: "/images/plp/settings/41050654/round.webp" },
  { id: "vintage", label: "Vintage", image: "/images/plp/settings/41097557/oval.webp" },
  { id: "swirl", label: "Swirl", image: "/images/plp/settings/41088492/round.webp" },
  { id: "three-stone", label: "3 Stone", image: "/images/plp/settings/41071639/round.webp" },
]

export const SHAPES: (Facet & { icon: string })[] = [
  { id: "round", label: "Round", icon: "/images/plp/shapes/round.png" },
  { id: "pear", label: "Pear", icon: "/images/plp/shapes/pear.png" },
  { id: "oval", label: "Oval", icon: "/images/plp/shapes/oval.png" },
  { id: "asscher", label: "Asscher", icon: "/images/plp/shapes/asscher.png" },
  { id: "marquise", label: "Marquise", icon: "/images/plp/shapes/marquise.png" },
  { id: "cushion", label: "Cushion", icon: "/images/plp/shapes/cushion.png" },
  { id: "heart", label: "Heart", icon: "/images/plp/shapes/heart.png" },
  { id: "emerald", label: "Emerald", icon: "/images/plp/shapes/emerald.png" },
  { id: "princess", label: "Princess", icon: "/images/plp/shapes/princess.png" },
  { id: "radiant", label: "Radiant", icon: "/images/plp/shapes/radiant.png" },
]

export interface PlpMetal extends Facet {
  /** Swatch fill: product data, not a design token (no Pattern Library variable exists for metals). */
  swatch: string
}

/** The metals the settings come in, in sidebar order (Figma: 14k White, 14k Yellow, 14k Rose, Platinum). */
export const PLP_METALS: PlpMetal[] = [
  { id: "14k-white-gold", label: "14k White Gold", swatch: "#dedede" },
  { id: "14k-yellow-gold", label: "14k Yellow Gold", swatch: "#eed9ac" },
  { id: "14k-rose-gold", label: "14k Rose Gold", swatch: "#efb8a7" },
  { id: "platinum", label: "Platinum", swatch: "#c5c5c5" },
]

export const metalById = (id: string) => PLP_METALS.find((m) => m.id === id)!

/** Shop by Budget entry points (mega menu); each lands on the PLP with that price range set. */
export const PRICE_BANDS: (Facet & { min: number; max: number })[] = [
  { id: "under-1000", label: "Under $1,000", min: 0, max: 999 },
  { id: "1000-2000", label: "$1,000 – $2,000", min: 1000, max: 2000 },
  { id: "2000-3000", label: "$2,000 – $3,000", min: 2000, max: 3000 },
  { id: "3000-plus", label: "$3,000 & Above", min: 3000, max: Infinity },
]

export const ACCENTS: Facet[] = [
  { id: "none", label: "No Accent Stones" },
  { id: "diamond", label: "Diamond Accents" },
  { id: "gemstone", label: "Gemstone Accents" },
]

/** The store and address the fulfilment filters refer to (Figma "Fulfilment filters"). */
export const STORE = {
  name: "Cupertino",
  region: "Cupertino, CA",
  address: "21780 Stevens Creek Boulevard, Building 4, Suite 210, Cupertino, CA 95014",
  addressShort: "21780 Stevens Creek Boulevard",
}

export type FulfilmentId = "instore"

export const FULFILMENT: {
  id: FulfilmentId
  label: string
  /** Mobile chip label (Figma mobile filter bar). */
  shortLabel: string
  icon: "pin"
}[] = [
  { id: "instore", label: "In-store today", shortLabel: "In-store", icon: "pin" },
]

/** Sort options (SCO Drop 2 "Mobile Filters" Sort By). */
export const SORTS: Facet[] = [
  { id: "recommended", label: "Recommended" },
  { id: "price-asc", label: "Price Low to High" },
  { id: "price-desc", label: "Price High to Low" },
  { id: "newest", label: "Newest" },
  { id: "best-selling", label: "Best Selling" },
]

export const DEFAULT_SORT = "recommended"

// ---------------------------------------------------------------------------------------------
// Designs → cards
// ---------------------------------------------------------------------------------------------

interface Design {
  id: string
  name: string
  styles: string[]
  accent: "none" | "diamond" | "gemstone"
  /** A Top Seller on shaneco.com (Best Selling sort and the Top Sellers collection). */
  topSeller?: boolean
  /** Show the Top Seller label on its lead-metal card. Kept to a few so the label still stands out. */
  label?: boolean
  /** Center-stone shapes the setting accepts (PDP "Preview with Shape"). The first is its default picture. */
  shapes: string[]
  /** [metal, Shane Co. item ID, setting price], first = the metal the live listing leads with. */
  metals: [metal: string, itemId: string, price: number][]
}

const ALL_SHAPES = ["round", "oval", "cushion", "pear", "marquise", "princess", "emerald", "radiant", "heart", "asscher"]

/** Catalogue order = "Recommended" order. */
const DESIGNS: Design[] = [
  { id: "timeless-solitaire", label: true, name: "Timeless Solitaire Engagement Ring", styles: ["classic"], accent: "none", topSeller: true, shapes: ALL_SHAPES, metals: [["14k-yellow-gold", "41004888", 690], ["14k-white-gold", "41004893", 690], ["14k-rose-gold", "41089052", 690], ["platinum", "41006535", 1050]] },
  { id: "luminary-solitaire", name: "Luminary Solitaire Engagement Ring", styles: ["classic"], accent: "none", shapes: ["round", "oval", "cushion", "pear", "emerald", "heart"], metals: [["14k-white-gold", "41041604", 690], ["14k-yellow-gold", "41045174", 690], ["14k-rose-gold", "41060741", 690], ["platinum", "41045179", 1050]] },
  { id: "cypress-halo", name: "Cypress Halo Engagement Ring", styles: ["halo", "pave", "vintage"], accent: "diamond", topSeller: true, shapes: ["marquise"], metals: [["14k-yellow-gold", "41098343", 4175], ["14k-white-gold", "41088380", 4175], ["14k-rose-gold", "41088555", 4175], ["platinum", "41105430", 4375]] },
  { id: "ella-halo", name: "Ella Halo Engagement Ring for 1 ct Round", styles: ["halo"], accent: "diamond", shapes: ["round", "cushion", "princess", "asscher"], metals: [["14k-white-gold", "41071388", 2595], ["14k-yellow-gold", "41081279", 2595], ["14k-rose-gold", "41074306", 2595]] },
  { id: "vista-pave", label: true, name: "Vista Diamond Pave Engagement Ring", styles: ["pave", "classic"], accent: "diamond", topSeller: true, shapes: ALL_SHAPES, metals: [["14k-yellow-gold", "41048069", 1295], ["14k-white-gold", "41045046", 1295], ["14k-rose-gold", "41048912", 1295], ["platinum", "41073550", 1495]] },
  { id: "privet", name: "Privet Engagement Ring (1/5 tcw Diamond Accents)", styles: ["pave", "classic"], accent: "diamond", shapes: ALL_SHAPES, metals: [["14k-yellow-gold", "41111140", 1195], ["14k-white-gold", "41111139", 1195], ["14k-rose-gold", "41111142", 1195], ["platinum", "41111141", 1395]] },
  { id: "modena-cathedral", name: "Modena Cathedral Engagement Ring", styles: ["cathedral", "classic"], accent: "none", topSeller: true, shapes: ALL_SHAPES, metals: [["14k-yellow-gold", "41050654", 1060], ["14k-white-gold", "41050653", 1060], ["14k-rose-gold", "41077509", 1060], ["platinum", "41089432", 1260]] },
  { id: "aspen-cathedral", name: "Aspen Cathedral Engagement Ring", styles: ["cathedral", "swirl"], accent: "diamond", topSeller: true, shapes: ALL_SHAPES, metals: [["14k-white-gold", "41097388", 1060], ["14k-yellow-gold", "41097387", 1060], ["14k-rose-gold", "41097389", 1060], ["platinum", "41105441", 1260]] },
  { id: "antonia", name: "Antonia Engagement Ring", styles: ["vintage", "swirl", "three-stone"], accent: "diamond", shapes: ALL_SHAPES, metals: [["14k-yellow-gold", "41080416", 1925], ["14k-white-gold", "41061672", 1925]] },
  { id: "woodland", name: "Woodland Engagement Ring", styles: ["vintage", "swirl"], accent: "diamond", shapes: ALL_SHAPES, metals: [["14k-yellow-gold", "41097557", 1295], ["14k-white-gold", "41097358", 1295], ["14k-rose-gold", "41097559", 1295], ["platinum", "41106380", 1495]] },
  { id: "willow-infinity", name: "Willow Infinity Engagement Ring", styles: ["swirl", "pave"], accent: "diamond", topSeller: true, shapes: ALL_SHAPES, metals: [["14k-white-gold", "41046616", 1625], ["14k-yellow-gold", "41046617", 1625], ["14k-rose-gold", "41088492", 1625], ["platinum", "41088476", 1825]] },
  { id: "plume", name: "Plume Engagement Ring", styles: ["swirl", "classic"], accent: "diamond", topSeller: true, shapes: ALL_SHAPES, metals: [["14k-yellow-gold", "41093781", 1265], ["14k-white-gold", "41093784", 1265], ["14k-rose-gold", "41093780", 1265], ["platinum", "41093785", 1465]] },
  { id: "marianne-three-stone", name: "Marianne Three-Stone Engagement Ring", styles: ["three-stone", "classic", "pave", "cathedral"], accent: "diamond", shapes: ALL_SHAPES, metals: [["14k-white-gold", "41047499", 1555], ["14k-yellow-gold", "41047500", 1555]] },
  { id: "poesie-three-stone", label: true, name: "Poesie Three-Stone Engagement Ring", styles: ["three-stone"], accent: "diamond", topSeller: true, shapes: ALL_SHAPES, metals: [["14k-white-gold", "41071262", 3825], ["14k-yellow-gold", "41071639", 3825], ["platinum", "41105477", 4025]] },
]

/** Shane Co. render of a setting (by item ID) holding a center stone of the given shape. */
export const settingImage = (itemId: string, shape: string) => `/images/plp/settings/${itemId}/${shape}.webp`

export interface PlpProduct {
  id: string
  designId: string
  name: string
  metal: PlpMetal
  /** The design's other metals, for the card swatches (first = this card's metal). */
  metals: PlpMetal[]
  price: number
  /** Shane Co. item ID: one per setting × metal. Its renders sit in /images/plp/settings/{itemId}/. */
  itemId: string
  /** Shapes the card can show. A setting shows any shape it accepts; a ready-to-ship ring only its own stone. */
  shapes: string[]
  /** Fixed gallery (ready-to-ship rings: front, then side). Settings build theirs from the filtered shape. */
  images?: string[]
  styles: string[]
  accent: Design["accent"]
  badge?: string
  topSeller: boolean
  fulfilment: Record<FulfilmentId, boolean>
  popularity: number
  newness: number
}

/** Card image: the first filtered shape this product accepts, otherwise its default shape. */
export function productImage(p: PlpProduct, preferredShapes: string[] = []) {
  return p.images?.[0] ?? settingImage(p.itemId, preferredShapes.find((s) => p.shapes.includes(s)) ?? p.shapes[0])
}

/** Card gallery: the front view (holding the filtered shape), then the side profile (Shane Co. "A2" view). */
export function productImages(p: PlpProduct, preferredShapes: string[] = []) {
  return p.images ?? [productImage(p, preferredShapes), `/images/plp/settings/${p.itemId}/side.webp`]
}

/** Small deterministic hash so fulfilment and popularity look random but never change. */
function hash(s: string) {
  let h = 2166136261
  for (let i = 0; i < s.length; i++) h = Math.imul(h ^ s.charCodeAt(i), 16777619)
  return (h >>> 0) / 4294967295
}

// Higher item IDs are the newer designs on shaneco.com.
const newestFirst = [...DESIGNS].sort((a, b) => Number(b.metals[0][1]) - Number(a.metals[0][1])).map((d) => d.id)

export const SETTINGS: PlpProduct[] = DESIGNS.flatMap((d, di) =>
  d.metals.map(([metalId, itemId, price], mi) => {
    const metal = metalById(metalId)
    const r = hash(`${d.id}:${metalId}`)
    // In-store stock is the scarcest.
    return {
      id: `${d.id}--${metalId}`,
      designId: d.id,
      name: d.name,
      metal,
      metals: [metal, ...d.metals.filter(([m]) => m !== metalId).map(([m]) => metalById(m))],
      price,
      itemId,
      shapes: d.shapes,
      styles: d.styles,
      accent: d.accent,
      badge: d.label && mi === 0 ? "Top Seller" : undefined,
      topSeller: !!d.topSeller,
      fulfilment: { instore: r < 0.4 },
      // "Recommended" shows every design's lead metal first, in catalogue order, then the other metals,
      // so a page isn't four cards of the same ring.
      popularity: mi * 100 + di,
      newness: newestFirst.indexOf(d.id) * 10 + mi,
    }
  }),
)

// ---------------------------------------------------------------------------------------------
// Ready to Ship: preset rings (setting + center stone), outside the DYO flow
// ---------------------------------------------------------------------------------------------

interface PresetRing {
  name: string
  shape: string
  carat: number
  accent: Design["accent"]
  styles: string[]
  /** [metal, Shane Co. item ID, price], first = the metal the live listing shows. */
  metals: [metal: string, itemId: string, price: number][]
}

/**
 * Real preset rings from shaneco.com/premounted-bridal/c (November 2026), in the live listing's order:
 * name, center stone, metals with item IDs and prices read from each PDP. Style comes from the PDP's
 * category. Front ("M") and side ("A2") photos sit in /images/plp/rts/{itemId}/.
 */
const PRESET_RINGS: PresetRing[] = [
  { name: "2 ct Lab-Grown Diamond Tulip Engagement Ring", shape: "emerald", carat: 2, accent: "none", styles: ["classic"], metals: [["14k-yellow-gold", "41108013", 3120], ["14k-white-gold", "41108009", 3120], ["platinum", "41108018", 3320]] },
  { name: "Willow 1 5/8 tcw Lab-Grown Diamond Engagement Ring", shape: "marquise", carat: 1.5, accent: "diamond", styles: ["swirl"], metals: [["14k-yellow-gold", "41113279", 2515], ["14k-white-gold", "41113278", 2515], ["platinum", "41113351", 2715]] },
  { name: "Bree 2 ct Lab-Grown Diamond Engagement Ring", shape: "oval", carat: 2, accent: "none", styles: ["classic"], metals: [["14k-white-gold", "41108184", 3650], ["14k-yellow-gold", "41108205", 3650], ["platinum", "41108214", 3850]] },
  { name: "Willow 1 5/8 tcw Lab-Grown Diamond Engagement Ring", shape: "round", carat: 1.5, accent: "diamond", styles: ["swirl"], metals: [["14k-rose-gold", "41113269", 2095], ["14k-white-gold", "41113264", 2095], ["14k-yellow-gold", "41113267", 2095], ["platinum", "41113348", 2295]] },
  { name: "Evelyn 1 1/4 tcw Lab-Grown Diamond Engagement Ring", shape: "oval", carat: 1, accent: "diamond", styles: ["classic"], metals: [["14k-yellow-gold", "41113742", 1900], ["14k-white-gold", "41113741", 1900], ["platinum", "41113738", 2100]] },
  { name: "Evelyn 2 1/4 tcw Lab-Grown Diamond Engagement Ring", shape: "oval", carat: 2, accent: "diamond", styles: ["classic"], metals: [["14k-yellow-gold", "41113749", 3075], ["14k-white-gold", "41113748", 3075], ["platinum", "41113740", 3275]] },
  { name: "Audra 3 ct Lab-Grown Diamond Engagement Ring", shape: "oval", carat: 3, accent: "none", styles: ["classic"], metals: [["14k-yellow-gold", "41107998", 4400], ["14k-white-gold", "41107989", 4400], ["platinum", "41108002", 4600]] },
  { name: "Audra 1 ct Lab-Grown Diamond Engagement Ring", shape: "oval", carat: 1, accent: "none", styles: ["classic"], metals: [["14k-yellow-gold", "41107995", 1885], ["14k-white-gold", "41107980", 1885], ["platinum", "41107999", 2085]] },
  { name: "2 ct Lab-Grown Diamond Tulip Engagement Ring", shape: "oval", carat: 2, accent: "none", styles: ["classic"], metals: [["14k-yellow-gold", "41107988", 2830], ["14k-white-gold", "41107982", 2830], ["platinum", "41107993", 3030]] },
  { name: "1 ct Lab-Grown Diamond Bezel Engagement Ring", shape: "oval", carat: 1, accent: "none", styles: ["classic"], metals: [["14k-yellow-gold", "41105497", 2150], ["14k-white-gold", "41105496", 2150]] },
  { name: "Audra 2 ct Lab-Grown Diamond Engagement Ring", shape: "oval", carat: 2, accent: "none", styles: ["classic"], metals: [["14k-yellow-gold", "41107997", 3055], ["14k-white-gold", "41107987", 3055], ["platinum", "41108001", 3255]] },
  { name: "3 ct Lab-Grown Diamond Tulip Engagement Ring", shape: "oval", carat: 3, accent: "none", styles: ["classic"], metals: [["14k-yellow-gold", "41107990", 4175], ["14k-white-gold", "41107984", 4175], ["platinum", "41107994", 4375]] },
  { name: "Evelyn 2 1/4 tcw Lab-Grown Diamond Engagement Ring", shape: "marquise", carat: 2, accent: "diamond", styles: ["classic"], metals: [["14k-yellow-gold", "41113785", 3365], ["14k-white-gold", "41113784", 3365], ["platinum", "41113763", 3565]] },
  { name: "1 1/2 ct Lab-Grown Diamond Bezel Engagement Ring", shape: "oval", carat: 1.5, accent: "none", styles: ["classic"], metals: [["14k-yellow-gold", "41105499", 2850], ["14k-white-gold", "41105498", 2850]] },
  { name: "Audra 1 ct Lab-Grown Diamond Engagement Ring", shape: "emerald", carat: 1, accent: "none", styles: ["classic"], metals: [["14k-yellow-gold", "41108037", 2000], ["14k-white-gold", "41108017", 2000], ["platinum", "41108049", 2200]] },
  { name: "Audra 3 ct Lab-Grown Diamond Engagement Ring", shape: "emerald", carat: 3, accent: "none", styles: ["cathedral", "classic"], metals: [["14k-yellow-gold", "41108043", 4850], ["14k-white-gold", "41108032", 4850], ["platinum", "41108052", 5050]] },
  { name: "Evelyn 3 1/4 tcw Lab-Grown Diamond Engagement Ring", shape: "oval", carat: 3, accent: "diamond", styles: ["classic"], metals: [["14k-yellow-gold", "41113753", 4420], ["14k-white-gold", "41113752", 4420], ["platinum", "41113744", 4620]] },
  { name: "Evelyn 3 1/4 tcw Lab-Grown Diamond Engagement Ring", shape: "radiant", carat: 3, accent: "diamond", styles: ["classic"], metals: [["14k-yellow-gold", "41113773", 4875], ["14k-white-gold", "41113772", 4875], ["platinum", "41113757", 5075]] },
  { name: "Evelyn 1 3/4 tcw Lab-Grown Diamond Engagement Ring", shape: "radiant", carat: 1.5, accent: "diamond", styles: ["classic"], metals: [["14k-yellow-gold", "41113765", 2665], ["14k-white-gold", "41113764", 2665], ["platinum", "41113755", 2865]] },
  { name: "Willow 2 1/8 tcw Lab-Grown Diamond Engagement Ring", shape: "oval", carat: 2, accent: "diamond", styles: ["swirl"], metals: [["14k-yellow-gold", "41113217", 2925], ["14k-white-gold", "41113216", 2925], ["platinum", "41113192", 3125]] },
  { name: "Evelyn 2 1/4 tcw Lab-Grown Diamond Engagement Ring", shape: "radiant", carat: 2, accent: "diamond", styles: ["classic"], metals: [["14k-yellow-gold", "41113769", 3365], ["14k-white-gold", "41113768", 3365], ["platinum", "41113756", 3565]] },
  { name: "Evelyn 1 3/4 tcw Lab-Grown Diamond Engagement Ring", shape: "round", carat: 1.5, accent: "diamond", styles: ["classic"], metals: [["14k-white-gold", "41113796", 2245], ["14k-yellow-gold", "41113797", 2245], ["platinum", "41113775", 2445]] },
  { name: "2 ct Lab-Grown Diamond Tulip Engagement Ring", shape: "pear", carat: 2, accent: "none", styles: ["classic"], metals: [["14k-yellow-gold", "41108077", 3120], ["14k-white-gold", "41108073", 3120], ["platinum", "41108081", 3320]] },
  { name: "2 ct Lab-Grown Diamond Tulip Engagement Ring", shape: "radiant", carat: 2, accent: "none", styles: ["classic"], metals: [["14k-yellow-gold", "41108105", 3120], ["14k-white-gold", "41108101", 3120], ["platinum", "41108109", 3320]] },
  { name: "Willow 3 1/8 tcw Lab-Grown Diamond Engagement Ring", shape: "marquise", carat: 3, accent: "diamond", styles: ["swirl"], metals: [["14k-yellow-gold", "41113292", 4725], ["14k-white-gold", "41113291", 4725], ["platinum", "41113359", 4925]] },
  { name: "1 1/2 ct Lab-Grown Diamond Tulip Engagement Ring", shape: "pear", carat: 1.5, accent: "none", styles: ["classic"], metals: [["14k-yellow-gold", "41108076", 2420], ["14k-white-gold", "41108044", 2420], ["platinum", "41108080", 2620]] },
  { name: "Willow 1 1/8 tcw Lab-Grown Diamond Engagement Ring", shape: "oval", carat: 1, accent: "diamond", styles: ["swirl"], metals: [["14k-yellow-gold", "41113229", 1750], ["14k-white-gold", "41113228", 1750], ["platinum", "41113337", 1950]] },
  { name: "Audra 2 ct Lab-Grown Diamond Engagement Ring", shape: "marquise", carat: 2, accent: "none", styles: ["classic"], metals: [["14k-yellow-gold", "41108063", 3350], ["14k-white-gold", "41108059", 3350], ["platinum", "41108067", 3550]] },
  { name: "Bree 2 ct Lab-Grown Diamond Engagement Ring", shape: "round", carat: 2, accent: "none", styles: ["classic"], metals: [["platinum", "41108178", 3850], ["14k-white-gold", "41108166", 3650], ["14k-yellow-gold", "41108172", 3650]] },
  { name: "Willow 2 1/8 tcw Lab-Grown Diamond Engagement Ring", shape: "radiant", carat: 2, accent: "diamond", styles: ["swirl"], metals: [["14k-white-gold", "41113259", 3215], ["14k-yellow-gold", "41113260", 3215], ["platinum", "41113380", 3415]] },
  { name: "1 ct Lab-Grown Diamond Tulip Engagement Ring", shape: "round", carat: 1, accent: "none", styles: ["classic"], metals: [["14k-white-gold", "41107954", 1515], ["14k-yellow-gold", "41107960", 1515], ["platinum", "41107971", 1715]] },
]

const presetImages = (itemId: string) => [`/images/plp/rts/${itemId}/main.webp`, `/images/plp/rts/${itemId}/side.webp`]
const newestPresets = PRESET_RINGS.map((_, i) => i).sort((a, b) => Number(PRESET_RINGS[b].metals[0][1]) - Number(PRESET_RINGS[a].metals[0][1]))

/**
 * One card per preset ring × metal, like the settings, so a metal filter finds every ring made in it.
 * "Recommended" lists every ring's lead metal first, then the other metals.
 */
export const READY_TO_SHIP: PlpProduct[] = PRESET_RINGS.flatMap((r, ri) =>
  r.metals.map(([metalId, itemId, price], mi) => {
    const metal = metalById(metalId)
    return {
      id: `rts-${itemId}`,
      designId: `rts-${ri}`,
      name: r.name,
      metal,
      metals: [metal, ...r.metals.filter(([m]) => m !== metalId).map(([m]) => metalById(m))],
      price,
      itemId,
      shapes: [r.shape],
      images: presetImages(itemId),
      styles: r.styles,
      accent: r.accent,
      // Two labels across the listing, like the live site's sparing use.
      badge: mi === 0 && (ri === 1 || ri === 6) ? "Top Seller" : undefined,
      topSeller: ri < 8,
      // Preset rings are already made, so more are in store than settings.
      fulfilment: { instore: hash(`rts:${itemId}`) < 0.55 },
      popularity: mi * 100 + ri,
      newness: newestPresets.indexOf(ri) * 10 + mi,
    }
  }),
)

/** The same design in another metal (card swatches): a setting's sibling card, or a preset ring's variant. */
export function productVariant(p: PlpProduct, metalId: string) {
  const pool = p.images ? READY_TO_SHIP : SETTINGS
  return pool.find((v) => v.designId === p.designId && v.metal.id === metalId)
}

// ---------------------------------------------------------------------------------------------
// Filtering
// ---------------------------------------------------------------------------------------------

export interface ListingFilters {
  style: string[]
  shape: string[]
  metal: string[]
  accent: string[]
  /** Price range (SCO Drop 2 price filter: min/max inputs + range slider). null = no bound. */
  minPrice: number | null
  maxPrice: number | null
  fulfil: FulfilmentId | null
}

export const EMPTY_FILTERS: ListingFilters = { style: [], shape: [], metal: [], accent: [], minPrice: null, maxPrice: null, fulfil: null }

/** Facets that take one value at a time: picking another replaces it, picking it again clears it. */
const SINGLE_SELECT: ReadonlySet<string> = new Set(["shape"])

/** Toggle a facet value (multi-select, except the single-select facets above). */
export function toggleFilter(f: ListingFilters, key: "style" | "shape" | "metal" | "accent", value: string): ListingFilters {
  const has = f[key].includes(value)
  if (SINGLE_SELECT.has(key)) return { ...f, [key]: has ? [] : [value] }
  return { ...f, [key]: has ? f[key].filter((v) => v !== value) : [...f[key], value] }
}

export const hasPrice = (f: ListingFilters) => f.minPrice !== null || f.maxPrice !== null

export const filterCount = (f: ListingFilters) =>
  f.style.length + f.shape.length + f.metal.length + f.accent.length + (hasPrice(f) ? 1 : 0) + (f.fulfil ? 1 : 0)

/** Slider bounds for a catalogue: its cheapest and dearest prices, rounded out to $50. */
export function priceBounds(products: PlpProduct[]) {
  const prices = products.map((p) => p.price)
  return { min: Math.floor(Math.min(...prices) / 50) * 50, max: Math.ceil(Math.max(...prices) / 50) * 50 }
}

/** OR within a facet, AND across facets (standard PLP behaviour). */
export function applyFilters(products: PlpProduct[], f: ListingFilters) {
  return products.filter(
    (p) =>
      (!f.style.length || f.style.some((s) => p.styles.includes(s))) &&
      (!f.shape.length || f.shape.some((s) => p.shapes.includes(s))) &&
      (!f.metal.length || f.metal.includes(p.metal.id)) &&
      (!f.accent.length || f.accent.includes(p.accent)) &&
      (f.minPrice === null || p.price >= f.minPrice) &&
      (f.maxPrice === null || p.price <= f.maxPrice) &&
      (!f.fulfil || p.fulfilment[f.fulfil]),
  )
}

export function sortProducts(products: PlpProduct[], sort: string) {
  const list = [...products]
  if (sort === "price-asc") list.sort((a, b) => a.price - b.price)
  else if (sort === "price-desc") list.sort((a, b) => b.price - a.price)
  else if (sort === "newest") list.sort((a, b) => a.newness - b.newness)
  else if (sort === "best-selling") list.sort((a, b) => Number(b.topSeller) - Number(a.topSeller) || a.popularity - b.popularity)
  else list.sort((a, b) => a.popularity - b.popularity)
  return list
}

export const PAGE_SIZE = 24

// ---------------------------------------------------------------------------------------------
// Level 3 collections (landing pages from the navigation)
// ---------------------------------------------------------------------------------------------

export interface Collection {
  slug: string
  title: string
  description: string
  filters: Partial<ListingFilters>
  /** Featured collections that aren't a filter value (e.g. Top Sellers) narrow the catalogue themselves. */
  only?: (p: PlpProduct) => boolean
}

const styleCopy: Record<string, string> = {
  classic: "Timeless and understated, classic settings let your center stone take the spotlight.",
  halo: "A circle of diamonds frames the center stone, adding sparkle and making it look larger.",
  pave: "Tiny diamonds set closely along the band for continuous sparkle from every angle.",
  cathedral: "Graceful arches lift the center stone above the band for an elegant, elevated profile.",
  vintage: "Milgrain, filigree and engraved details inspired by heirloom designs.",
  swirl: "Flowing, twisting bands that wrap around the center stone for a romantic look.",
  "three-stone": "A center stone flanked by two side stones, for your past, present and future.",
}

export const COLLECTIONS: Collection[] = [
  ...STYLES.map((s) => ({
    slug: s.id,
    title: `${s.label} Engagement Rings`,
    description: `${styleCopy[s.id]} Choose your setting, then add the perfect stone.`,
    filters: { style: [s.id] },
  })),
  ...SHAPES.map((s) => ({
    slug: `${s.id}-shape`,
    title: `${s.label} Engagement Rings`,
    description: `Settings designed to hold a ${s.label.toLowerCase()} center stone. Choose your setting, then find your perfect ${s.label.toLowerCase()} diamond or gemstone.`,
    filters: { shape: [s.id] },
  })),
  {
    slug: "white-gold",
    title: "White Gold Engagement Rings",
    description: "Bright and modern, white gold makes diamonds look even whiter. Choose your setting, then add the perfect stone.",
    filters: { metal: ["14k-white-gold"] },
  },
  {
    slug: "rose-gold",
    title: "Rose Gold Engagement Rings",
    description: "Warm and romantic, rose gold flatters every skin tone. Choose your setting, then add the perfect stone.",
    filters: { metal: ["14k-rose-gold"] },
  },
  {
    slug: "yellow-gold",
    title: "Yellow Gold Engagement Rings",
    description: "Classic 14k yellow gold for a warm and timeless look. Choose your setting, then add the perfect stone.",
    filters: { metal: ["14k-yellow-gold"] },
  },
  {
    slug: "platinum",
    title: "Platinum Engagement Rings",
    description: "Naturally white, dense and durable: platinum is made to be worn for a lifetime. Choose your setting, then add the perfect stone.",
    filters: { metal: ["platinum"] },
  },
  {
    slug: "top-sellers",
    title: "Top Selling Engagement Rings",
    description: "Our customers’ favorite settings. Choose your setting, then add the perfect stone.",
    filters: {},
    only: (p) => p.topSeller,
  },
  {
    slug: "new-arrivals",
    title: "New Engagement Rings",
    description: "The latest settings from our designers. Choose your setting, then add the perfect stone.",
    filters: {},
    only: (p) => p.newness < 40,
  },
]

export const collectionBySlug = (slug?: string) => COLLECTIONS.find((c) => c.slug === slug)

// ---------------------------------------------------------------------------------------------
// Navigation (Engagement Rings Level 1 → Level 2 → links)
// ---------------------------------------------------------------------------------------------

export interface NavLink {
  label: string
  /** Route to open, or null for links outside the prototype (shows "not part of this test"). */
  to: string | null
  /** Illustration shown before the label (Stone Shapes, Figma SCO Drop 1 "Stone Shape" 28px). */
  icon?: string
}

export interface NavGroup {
  heading: string
  links: NavLink[]
  /** Lay the links out in two columns (Setting Styles in Figma). */
  columns?: 2
}

export interface NavSection {
  id: string
  label: string
  groups: NavGroup[]
}

export const PLP_PATH = "/engagement-rings"
export const RTS_PATH = "/engagement-rings/ready-to-ship"

export const NAV_TOP_LINKS: NavLink[] = [
  { label: "Ring Finder Quiz", to: null },
  { label: "Shop All Engagement Rings", to: PLP_PATH },
  { label: "Design Your Own", to: PLP_PATH },
]

const toCollection = (slug: string) => `${PLP_PATH}/${slug}`

export const NAV_SECTIONS: NavSection[] = [
  {
    id: "look",
    label: "Shop by Look",
    groups: [
      {
        heading: "Setting Styles",
        columns: 2,
        // Figma order (column 1 then column 2).
        links: ["classic", "vintage", "pave", "cathedral", "halo", "swirl", "three-stone"].map(
          (id) => ({ label: id === "pave" ? "Pave" : STYLES.find((s) => s.id === id)!.label, to: toCollection(id) }),
        ),
      },
      {
        heading: "Metal Types",
        links: [
          { label: "White Gold", to: toCollection("white-gold") },
          { label: "Rose Gold", to: toCollection("rose-gold") },
          { label: "Yellow Gold", to: toCollection("yellow-gold") },
          { label: "Platinum", to: toCollection("platinum") },
        ],
      },
    ],
  },
  {
    id: "stone",
    label: "Shop by Stone",
    groups: [
      {
        heading: "Stone Shapes",
        columns: 2,
        // Figma order (SCO Drop 1, 4548:45957 / 4548:45788): column 1 then column 2.
        links: ["oval", "round", "marquise", "radiant", "cushion", "princess", "emerald", "pear", "heart", "asscher"].map((id) => ({
          label: id === "emerald" ? "Emerald Cut" : SHAPES.find((s) => s.id === id)!.label,
          to: toCollection(`${id}-shape`),
          icon: `/images/nav/shapes/${id}.png`,
        })),
      },
      {
        heading: "Stone Types",
        links: [
          { label: "Natural Diamonds", to: null },
          { label: "Lab-Grown Diamonds", to: null },
          { label: "Gemstones", to: null },
        ],
      },
    ],
  },
  {
    id: "budget",
    label: "Shop by Budget",
    groups: [
      {
        heading: "Setting Price",
        links: PRICE_BANDS.map((b) => ({
          label: b.label,
          to: `${PLP_PATH}?price=${b.min > 0 ? b.min : ""}-${Number.isFinite(b.max) ? b.max : ""}`,
        })),
      },
    ],
  },
  {
    id: "featured",
    label: "Featured",
    groups: [
      {
        heading: "Featured",
        links: [
          { label: "Top Sellers", to: toCollection("top-sellers") },
          { label: "New Arrivals", to: toCollection("new-arrivals") },
          { label: "Ready to Ship Engagement Rings", to: RTS_PATH },
        ],
      },
    ],
  },
]

export const NAV_PROMO = {
  image: "/images/nav/mega-menu-promo.jpg",
  title: "Find the perfect ring with guidance from our experts",
  links: ["How to pick a ring", "Diamond buying guide", "Ring Style quiz", "Customer Gallery"],
}

/** Level 1 categories. Only Engagement Rings opens its menu in this prototype. */
export const NAV_LEVEL_1 = ["Engagement Rings", "Wedding Bands", "Diamonds", "Gemstones", "Fine Jewelry", "Personalize"]
