/**
 * Engagement Ring PLP mock catalog (Figma SCO Drop 3b – Customizer › "Engagement Ring PLP", 7845:197888).
 * One card per design × metal, as in the Figma grid (Timeless Solitaire appears in yellow and white gold).
 * Everything is deterministic so counts, prices and fulfilment stay the same on every visit.
 */

// ---------------------------------------------------------------------------------------------
// Facets
// ---------------------------------------------------------------------------------------------

export interface Facet {
  id: string
  label: string
}

/** Setting styles, in the order of the hero carousel and sidebar (Figma), then the nav-only styles. */
export const STYLES: (Facet & { image: string })[] = [
  { id: "classic", label: "Classic", image: "/images/plp/rings/timeless-solitaire-yg.png" },
  { id: "halo", label: "Halo", image: "/images/plp/rings/halo-emerald.png" },
  { id: "pave", label: "Pavé", image: "/images/plp/rings/privet-oval.png" },
  { id: "cathedral", label: "Cathedral", image: "/images/plp/rings/engraved-cathedral.png" },
  { id: "vintage", label: "Vintage", image: "/images/plp/rings/vintage-marquise.png" },
  { id: "swirl", label: "Swirl", image: "/images/plp/rings/willow-swirl-rg.png" },
  { id: "three-stone", label: "3 Stone", image: "/images/plp/rings/petite-pave-accent.png" },
  { id: "solitaire", label: "Solitaire", image: "/images/plp/rings/princess-solitaire-wg.png" },
  { id: "channel", label: "Channel Setting", image: "/images/crowns/ring-preview.png" },
  { id: "infinity", label: "Infinity", image: "/images/matching-bands/ring-6-solitaire.png" },
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

type Tone = "white" | "yellow" | "rose"

export interface PlpMetal extends Facet {
  /** Swatch fill: product data, not a design token (no Pattern Library variable exists for metals). */
  swatch: string
  tone: Tone
  /** Price relative to the design's 14k price. */
  factor: number
}

/** Sidebar metals in Figma order (two columns: 14k White, 14k Yellow, 14k Rose, Platinum…). */
export const PLP_METALS: PlpMetal[] = [
  { id: "14k-white-gold", label: "14k White Gold", swatch: "#dedede", tone: "white", factor: 1 },
  { id: "14k-yellow-gold", label: "14k Yellow Gold", swatch: "#eed9ac", tone: "yellow", factor: 1 },
  { id: "14k-rose-gold", label: "14k Rose Gold", swatch: "#efb8a7", tone: "rose", factor: 1 },
  { id: "platinum", label: "Platinum", swatch: "#c5c5c5", tone: "white", factor: 1.45 },
  { id: "two-tone", label: "Two-Tone Gold", swatch: "linear-gradient(135deg, #efb8a7 50%, #dedede 50%)", tone: "yellow", factor: 1.1 },
  { id: "18k-white-gold", label: "18k White Gold", swatch: "#e8e8e8", tone: "white", factor: 1.3 },
  { id: "18k-yellow-gold", label: "18k Yellow Gold", swatch: "#e9cf8f", tone: "yellow", factor: 1.3 },
  { id: "three-tone", label: "Three-Tone Gold", swatch: "linear-gradient(135deg, #eed9ac 33%, #efb8a7 33% 66%, #dedede 66%)", tone: "yellow", factor: 1.15 },
]

export const metalById = (id: string) => PLP_METALS.find((m) => m.id === id)!

export const PRICE_BANDS: (Facet & { min: number; max: number })[] = [
  { id: "under-1000", label: "Under $1,000", min: 0, max: 999 },
  { id: "1000-2000", label: "$1,000 – $2,000", min: 1000, max: 2000 },
  { id: "2000-3000", label: "$2,000 – $3,000", min: 2001, max: 3000 },
  { id: "3000-plus", label: "$3,000 & Above", min: 3001, max: Infinity },
]

/** Ready to Ship prices include the center stone, so they need wider bands. */
export const RTS_PRICE_BANDS: (Facet & { min: number; max: number })[] = [
  { id: "under-2000", label: "Under $2,000", min: 0, max: 1999 },
  { id: "2000-4000", label: "$2,000 – $4,000", min: 2000, max: 4000 },
  { id: "4000-7500", label: "$4,000 – $7,500", min: 4001, max: 7500 },
  { id: "7500-plus", label: "$7,500 & Above", min: 7501, max: Infinity },
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

export type FulfilmentId = "instore" | "sameday" | "friday"

export const FULFILMENT: {
  id: FulfilmentId
  label: string
  /** Mobile chip label (Figma mobile filter bar). */
  shortLabel: string
  icon: "pin" | "lightning" | "calendar"
}[] = [
  { id: "instore", label: "In-store today", shortLabel: "In-store", icon: "pin" },
  { id: "sameday", label: "Same day delivery", shortLabel: "Same day", icon: "lightning" },
  { id: "friday", label: "Arrives by Friday", shortLabel: "By Fri", icon: "calendar" },
]

export const SORTS: Facet[] = [
  { id: "popular", label: "Popular" },
  { id: "newest", label: "Newest" },
  { id: "price-asc", label: "Price: Low to High" },
  { id: "price-desc", label: "Price: High to Low" },
]

// ---------------------------------------------------------------------------------------------
// Designs → cards
// ---------------------------------------------------------------------------------------------

interface Design {
  id: string
  name: string
  styles: string[]
  /** Center-stone shapes the setting is made for. The first is the one it's pictured with. */
  shapes: string[]
  accent: "none" | "diamond" | "gemstone"
  /** 14k price, setting only. */
  price: number
  metals: string[]
  image: string
  imageTone: Tone
  /** Photographed in each metal (no tinting needed). */
  metalImages?: Partial<Record<string, string>>
  badge?: "Top Seller" | "New" | "Exclusive"
}

const IMG = {
  timeless: "/images/plp/rings/timeless-solitaire-yg.png",
  princess: "/images/plp/rings/princess-solitaire-wg.png",
  halo: "/images/plp/rings/halo-emerald.png",
  vintage: "/images/plp/rings/vintage-marquise.png",
  cathedral: "/images/plp/rings/engraved-cathedral.png",
  accent: "/images/plp/rings/petite-pave-accent.png",
  privet: "/images/plp/rings/privet-oval.png",
  willow: "/images/plp/rings/willow-swirl-rg.png",
  solitaire: "/images/products/ring-1.png",
  preview: "/images/crowns/ring-preview.png",
  knife: "/images/matching-bands/ring-6-solitaire.png",
}

const ELLA = "/images/gallery/ella"
const STD = ["14k-white-gold", "14k-yellow-gold", "14k-rose-gold", "platinum"]

const DESIGNS: Design[] = [
  { id: "timeless-solitaire", name: "Timeless Solitaire Engagement Ring", styles: ["classic", "solitaire"], shapes: ["round", "oval", "princess", "cushion", "emerald", "pear", "radiant"], accent: "none", price: 690, metals: ["14k-yellow-gold", "14k-white-gold", "14k-rose-gold", "platinum", "18k-yellow-gold", "18k-white-gold"], image: IMG.timeless, imageTone: "yellow", badge: "Top Seller" },
  { id: "privet", name: "Privet Engagement Ring (1/5 tcw Diamond Accents)", styles: ["pave", "classic"], shapes: ["oval", "round", "pear", "marquise"], accent: "diamond", price: 1195, metals: ["14k-yellow-gold", "14k-white-gold", "14k-rose-gold", "platinum"], image: IMG.privet, imageTone: "yellow", badge: "Top Seller" },
  { id: "ella-cathedral", name: "Ella Cathedral Engagement Ring", styles: ["cathedral", "pave"], shapes: ["round", "oval", "cushion", "princess"], accent: "diamond", price: 2225, metals: STD, image: `${ELLA}/white-gold/main.jpg`, imageTone: "white", metalImages: { "14k-white-gold": `${ELLA}/white-gold/main.jpg`, "14k-yellow-gold": `${ELLA}/yellow-gold/main.jpg`, "14k-rose-gold": `${ELLA}/rose-gold/main.jpg`, platinum: `${ELLA}/platinum/main.jpg` }, badge: "Top Seller" },
  { id: "celeste-halo", name: "Celeste Halo Engagement Ring (1/3 tcw)", styles: ["halo", "pave"], shapes: ["emerald", "radiant", "cushion", "oval"], accent: "diamond", price: 2450, metals: ["14k-yellow-gold", "14k-white-gold", "platinum", "18k-white-gold"], image: IMG.halo, imageTone: "yellow", badge: "Top Seller" },
  { id: "odette-vintage", name: "Odette Vintage Engagement Ring (1/6 tcw)", styles: ["vintage", "three-stone"], shapes: ["marquise", "pear", "oval"], accent: "diamond", price: 1590, metals: ["14k-yellow-gold", "14k-rose-gold", "14k-white-gold"], image: IMG.vintage, imageTone: "yellow", badge: "New" },
  { id: "heirloom-cathedral", name: "Heirloom Engraved Cathedral Engagement Ring", styles: ["cathedral", "vintage", "solitaire"], shapes: ["round", "cushion", "oval", "asscher"], accent: "none", price: 1295, metals: ["14k-yellow-gold", "14k-white-gold", "14k-rose-gold", "platinum", "two-tone"], image: IMG.cathedral, imageTone: "yellow" },
  { id: "petite-trinity", name: "Petite Trinity Three-Stone Engagement Ring", styles: ["three-stone", "classic"], shapes: ["round", "oval", "emerald", "princess"], accent: "diamond", price: 1450, metals: ["14k-yellow-gold", "14k-white-gold", "platinum"], image: IMG.accent, imageTone: "yellow", badge: "Top Seller" },
  { id: "willow", name: "Willow Leaf Engagement Ring", styles: ["swirl", "vintage"], shapes: ["round", "oval", "pear", "heart"], accent: "none", price: 1150, metals: ["14k-rose-gold", "14k-yellow-gold", "14k-white-gold"], image: IMG.willow, imageTone: "rose", badge: "Exclusive" },
  { id: "princess-solitaire", name: "Princess Cut Classic Solitaire Engagement Ring", styles: ["solitaire", "classic"], shapes: ["princess", "asscher", "radiant", "cushion"], accent: "none", price: 640, metals: ["14k-white-gold", "14k-yellow-gold", "platinum", "18k-white-gold"], image: IMG.princess, imageTone: "white" },
  { id: "knife-edge", name: "Knife-Edge Solitaire Engagement Ring", styles: ["solitaire", "classic"], shapes: ["round", "oval", "pear", "marquise", "heart"], accent: "none", price: 795, metals: ["14k-yellow-gold", "14k-white-gold", "14k-rose-gold", "platinum"], image: IMG.knife, imageTone: "yellow" },
  { id: "aurora-halo", name: "Aurora Hidden Halo Engagement Ring (1/4 tcw)", styles: ["halo", "classic"], shapes: ["round", "oval", "cushion"], accent: "diamond", price: 1890, metals: ["14k-white-gold", "14k-yellow-gold", "platinum"], image: IMG.preview, imageTone: "yellow", badge: "New" },
  { id: "regent-halo", name: "Regent Double Halo Engagement Ring (1/2 tcw)", styles: ["halo", "vintage"], shapes: ["emerald", "cushion", "radiant", "asscher"], accent: "diamond", price: 3295, metals: ["14k-white-gold", "platinum", "18k-white-gold", "18k-yellow-gold"], image: IMG.halo, imageTone: "yellow" },
  { id: "margaret-vintage", name: "Margaret Milgrain Vintage Engagement Ring", styles: ["vintage", "cathedral"], shapes: ["round", "cushion", "asscher"], accent: "diamond", price: 2150, metals: ["14k-white-gold", "14k-yellow-gold", "platinum", "three-tone"], image: IMG.cathedral, imageTone: "yellow" },
  { id: "seraphina-pave", name: "Seraphina Petite Pavé Engagement Ring (1/4 tcw)", styles: ["pave", "classic"], shapes: ["oval", "round", "pear", "radiant"], accent: "diamond", price: 1395, metals: ["14k-white-gold", "14k-yellow-gold", "14k-rose-gold", "platinum"], image: IMG.privet, imageTone: "yellow", badge: "Top Seller" },
  { id: "eden-swirl", name: "Eden Twisted Vine Engagement Ring", styles: ["swirl", "infinity"], shapes: ["round", "oval", "heart"], accent: "none", price: 985, metals: ["14k-rose-gold", "14k-yellow-gold", "14k-white-gold", "two-tone"], image: IMG.willow, imageTone: "rose" },
  { id: "ivy-swirl", name: "Ivy Pavé Swirl Engagement Ring (1/5 tcw)", styles: ["swirl", "pave"], shapes: ["round", "pear", "marquise"], accent: "diamond", price: 1675, metals: ["14k-white-gold", "14k-rose-gold", "platinum"], image: IMG.willow, imageTone: "rose", badge: "New" },
  { id: "harmony-three-stone", name: "Harmony Three-Stone Engagement Ring (3/8 tcw)", styles: ["three-stone", "vintage"], shapes: ["oval", "round", "cushion", "emerald"], accent: "diamond", price: 2690, metals: ["14k-white-gold", "14k-yellow-gold", "platinum", "18k-yellow-gold"], image: IMG.accent, imageTone: "yellow" },
  { id: "sapphire-trinity", name: "Sapphire Accent Three-Stone Engagement Ring", styles: ["three-stone", "classic"], shapes: ["round", "oval", "emerald"], accent: "gemstone", price: 1790, metals: ["14k-white-gold", "14k-yellow-gold", "platinum"], image: IMG.accent, imageTone: "yellow", badge: "Exclusive" },
  { id: "sienna-channel", name: "Sienna Channel-Set Engagement Ring (1/3 tcw)", styles: ["channel", "classic"], shapes: ["princess", "round", "emerald", "radiant"], accent: "diamond", price: 1990, metals: ["14k-white-gold", "14k-yellow-gold", "platinum"], image: IMG.preview, imageTone: "yellow" },
  { id: "avalon-channel", name: "Avalon Baguette Channel Engagement Ring (1/2 tcw)", styles: ["channel", "cathedral"], shapes: ["emerald", "asscher", "radiant", "princess"], accent: "diamond", price: 2875, metals: ["14k-white-gold", "platinum", "18k-white-gold"], image: IMG.cathedral, imageTone: "yellow" },
  { id: "eternal-infinity", name: "Eternal Infinity Engagement Ring (1/5 tcw)", styles: ["infinity", "pave"], shapes: ["round", "oval", "heart"], accent: "diamond", price: 1495, metals: ["14k-white-gold", "14k-rose-gold", "14k-yellow-gold"], image: IMG.willow, imageTone: "rose" },
  { id: "infinity-twist", name: "Infinity Twist Solitaire Engagement Ring", styles: ["infinity", "solitaire"], shapes: ["round", "oval", "cushion", "pear"], accent: "none", price: 890, metals: ["14k-white-gold", "14k-yellow-gold", "14k-rose-gold", "platinum"], image: IMG.knife, imageTone: "yellow" },
  { id: "cathedral-solitaire", name: "Classic Cathedral Solitaire Engagement Ring", styles: ["cathedral", "solitaire", "classic"], shapes: ["round", "princess", "oval", "cushion", "emerald"], accent: "none", price: 1050, metals: ["14k-white-gold", "14k-yellow-gold", "platinum", "18k-white-gold"], image: IMG.solitaire, imageTone: "yellow", badge: "Top Seller" },
  { id: "petite-solitaire", name: "Petite Comfort-Fit Solitaire Engagement Ring", styles: ["solitaire", "classic"], shapes: ["round", "oval", "pear", "marquise", "princess"], accent: "none", price: 525, metals: ["14k-white-gold", "14k-yellow-gold", "14k-rose-gold"], image: IMG.solitaire, imageTone: "yellow" },
  { id: "luna-halo", name: "Luna Pear Halo Engagement Ring (1/3 tcw)", styles: ["halo", "pave"], shapes: ["pear", "marquise", "oval"], accent: "diamond", price: 2290, metals: ["14k-white-gold", "14k-rose-gold", "platinum"], image: IMG.halo, imageTone: "yellow", badge: "New" },
  { id: "juliet-vintage", name: "Juliet Filigree Vintage Engagement Ring", styles: ["vintage", "halo"], shapes: ["round", "cushion", "oval"], accent: "diamond", price: 2590, metals: ["14k-white-gold", "14k-yellow-gold", "platinum", "three-tone"], image: IMG.vintage, imageTone: "yellow" },
  { id: "ruby-vintage", name: "Rosalind Ruby Accent Vintage Engagement Ring", styles: ["vintage", "three-stone"], shapes: ["marquise", "oval", "round"], accent: "gemstone", price: 1850, metals: ["14k-yellow-gold", "14k-rose-gold"], image: IMG.vintage, imageTone: "yellow" },
  { id: "grace-pave", name: "Grace Hidden Halo Pavé Engagement Ring (3/8 tcw)", styles: ["pave", "halo"], shapes: ["round", "oval", "radiant", "cushion"], accent: "diamond", price: 3150, metals: ["14k-white-gold", "14k-yellow-gold", "platinum", "18k-yellow-gold"], image: IMG.privet, imageTone: "yellow" },
  { id: "bellevue-cathedral", name: "Bellevue Pavé Cathedral Engagement Ring (1/2 tcw)", styles: ["cathedral", "pave"], shapes: ["round", "oval", "princess", "emerald"], accent: "diamond", price: 3490, metals: ["14k-white-gold", "platinum", "18k-white-gold"], image: `${ELLA}/platinum/main.jpg`, imageTone: "white" },
  { id: "tapered-baguette", name: "Tapered Baguette Three-Stone Engagement Ring", styles: ["three-stone", "classic"], shapes: ["emerald", "radiant", "princess", "asscher"], accent: "diamond", price: 2990, metals: ["14k-white-gold", "platinum"], image: IMG.accent, imageTone: "yellow", badge: "Exclusive" },
  { id: "everly-solitaire", name: "Everly Bezel Solitaire Engagement Ring", styles: ["solitaire", "classic"], shapes: ["round", "oval", "emerald", "pear"], accent: "none", price: 875, metals: ["14k-yellow-gold", "14k-white-gold", "platinum"], image: IMG.timeless, imageTone: "yellow", badge: "New" },
  { id: "camille-swirl", name: "Camille Bypass Swirl Engagement Ring (1/6 tcw)", styles: ["swirl", "pave"], shapes: ["round", "oval", "marquise"], accent: "diamond", price: 1290, metals: ["14k-white-gold", "14k-yellow-gold", "14k-rose-gold"], image: IMG.willow, imageTone: "rose" },
  { id: "sterling-channel", name: "Sterling Princess Channel Engagement Ring (1/4 tcw)", styles: ["channel"], shapes: ["princess", "asscher", "radiant"], accent: "diamond", price: 1690, metals: ["14k-white-gold", "14k-yellow-gold"], image: IMG.princess, imageTone: "white" },
  { id: "emerald-halo", name: "Emerald Accent Halo Engagement Ring", styles: ["halo", "vintage"], shapes: ["oval", "round", "cushion"], accent: "gemstone", price: 2390, metals: ["14k-yellow-gold", "14k-white-gold"], image: IMG.halo, imageTone: "yellow" },
  { id: "ava-infinity", name: "Ava Infinity Pavé Engagement Ring (1/3 tcw)", styles: ["infinity", "pave", "swirl"], shapes: ["round", "oval", "pear"], accent: "diamond", price: 2050, metals: ["14k-white-gold", "14k-rose-gold", "platinum"], image: IMG.willow, imageTone: "rose" },
  { id: "noble-cathedral", name: "Noble Six-Prong Cathedral Engagement Ring", styles: ["cathedral", "classic"], shapes: ["round", "cushion", "oval"], accent: "none", price: 1390, metals: ["14k-white-gold", "14k-yellow-gold", "platinum", "18k-yellow-gold"], image: IMG.solitaire, imageTone: "yellow" },
]

export interface PlpProduct {
  id: string
  designId: string
  name: string
  metal: PlpMetal
  /** The design's other metals, for the card swatches (first = this card's metal). */
  metals: PlpMetal[]
  price: number
  image: string
  /** CSS class that shifts a photographed metal to this card's metal (see theme.css). */
  tint?: string
  styles: string[]
  shapes: string[]
  accent: Design["accent"]
  badge?: string
  fulfilment: Record<FulfilmentId, boolean>
  popularity: number
  newness: number
}

/** Small deterministic hash so fulfilment and popularity look random but never change. */
function hash(s: string) {
  let h = 2166136261
  for (let i = 0; i < s.length; i++) h = Math.imul(h ^ s.charCodeAt(i), 16777619)
  return (h >>> 0) / 4294967295
}

const roundPrice = (n: number) => Math.round(n / 5) * 5

export function tintFor(source: Tone, target: Tone) {
  if (source === target) return undefined
  return `metal-${source}-to-${target}`
}

/** Card image and tint for a design in a given metal. */
export function imageFor(design: { image: string; imageTone: Tone; metalImages?: Partial<Record<string, string>> }, metal: PlpMetal) {
  const own = design.metalImages?.[metal.id]
  return own ? { image: own, tint: undefined } : { image: design.image, tint: tintFor(design.imageTone, metal.tone) }
}

export const SETTINGS: PlpProduct[] = DESIGNS.flatMap((d, di) =>
  d.metals.map((metalId, mi) => {
    const metal = metalById(metalId)
    const r = hash(`${d.id}:${metalId}`)
    // In-store stock is the scarcest; same-day delivery comes from that stock; most ship by Friday.
    const instore = r < 0.4
    const sameday = instore && r < 0.22
    const friday = r < 0.8
    return {
      id: `${d.id}--${metalId}`,
      designId: d.id,
      name: d.name,
      metal,
      metals: [metal, ...d.metals.filter((m) => m !== metalId).map(metalById)],
      price: roundPrice(d.price * metal.factor),
      ...imageFor(d, metal),
      styles: d.styles,
      shapes: d.shapes,
      accent: d.accent,
      badge: d.badge,
      fulfilment: { instore, sameday, friday },
      // Designs keep their catalogue order for "Popular"; a design's first metal ranks highest.
      popularity: di * 10 + mi + hash(d.id) * 5,
      newness: d.badge === "New" ? 0 : hash(`${d.id}new`),
    }
  }),
)

export function settingVariant(designId: string, metalId: string) {
  return SETTINGS.find((p) => p.designId === designId && p.metal.id === metalId)
}

// ---------------------------------------------------------------------------------------------
// Ready to Ship: preset rings (setting + center stone), outside the DYO flow
// ---------------------------------------------------------------------------------------------

const RTS_STONES = [
  { carat: 0.5, natural: 990, lab: 390 },
  { carat: 0.75, natural: 1890, lab: 640 },
  { carat: 1, natural: 3990, lab: 890 },
  { carat: 1.5, natural: 7490, lab: 1490 },
  { carat: 2, natural: 12990, lab: 2290 },
]

const caratLabel = (c: number) => (c === 0.5 ? "1/2" : c === 0.75 ? "3/4" : c === 1.5 ? "1 1/2" : `${c}`)

export const READY_TO_SHIP: PlpProduct[] = DESIGNS.slice(0, 30).map((d, i) => {
  const metal = metalById(d.metals[0])
  const stone = RTS_STONES[Math.floor(hash(`${d.id}rts`) * RTS_STONES.length)]
  const lab = hash(`${d.id}lab`) < 0.45
  const shape = SHAPES.find((s) => s.id === d.shapes[0])!
  const r = hash(`${d.id}rtsf`)
  const baseName = d.name.replace(/ Engagement Ring.*$/, "")
  return {
    id: `rts-${d.id}`,
    designId: d.id,
    name: `${baseName} ${caratLabel(stone.carat)} ct. ${shape.label} ${lab ? "Lab-Grown " : ""}Diamond Engagement Ring`,
    metal,
    metals: [metal],
    price: roundPrice(d.price + (lab ? stone.lab : stone.natural)),
    ...imageFor(d, metal),
    styles: d.styles,
    shapes: [d.shapes[0]],
    accent: d.accent,
    badge: d.badge,
    // Ready-to-ship rings are already made, so more are in store.
    fulfilment: { instore: r < 0.55, sameday: r < 0.3, friday: true },
    popularity: i,
    newness: d.badge === "New" ? 0 : hash(`${d.id}new`),
  }
})

// ---------------------------------------------------------------------------------------------
// Filtering
// ---------------------------------------------------------------------------------------------

export interface ListingFilters {
  style: string[]
  shape: string[]
  metal: string[]
  price: string[]
  accent: string[]
  fulfil: FulfilmentId | null
}

export const EMPTY_FILTERS: ListingFilters = { style: [], shape: [], metal: [], price: [], accent: [], fulfil: null }

export const filterCount = (f: ListingFilters) =>
  f.style.length + f.shape.length + f.metal.length + f.price.length + f.accent.length + (f.fulfil ? 1 : 0)

/** OR within a facet, AND across facets (standard PLP behaviour). */
export function applyFilters(products: PlpProduct[], f: ListingFilters) {
  return products.filter(
    (p) =>
      (!f.style.length || f.style.some((s) => p.styles.includes(s))) &&
      (!f.shape.length || f.shape.some((s) => p.shapes.includes(s))) &&
      (!f.metal.length || f.metal.includes(p.metal.id)) &&
      (!f.accent.length || f.accent.includes(p.accent)) &&
      (!f.price.length ||
        f.price.some((id) => {
          const band = [...PRICE_BANDS, ...RTS_PRICE_BANDS].find((b) => b.id === id)
          return band ? p.price >= band.min && p.price <= band.max : false
        })) &&
      (!f.fulfil || p.fulfilment[f.fulfil]),
  )
}

export function sortProducts(products: PlpProduct[], sort: string) {
  const list = [...products]
  if (sort === "price-asc") list.sort((a, b) => a.price - b.price)
  else if (sort === "price-desc") list.sort((a, b) => b.price - a.price)
  else if (sort === "newest") list.sort((a, b) => a.newness - b.newness)
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
  solitaire: "A single center stone on a simple band: the most iconic engagement ring.",
  channel: "Diamonds set securely in a channel along the band for a sleek, modern finish.",
  infinity: "Interwoven bands that symbolize never-ending love.",
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
    filters: { metal: ["14k-white-gold", "18k-white-gold"] },
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
    description: "Classic yellow gold, in 14k or 18k, for a warm and timeless look. Choose your setting, then add the perfect stone.",
    filters: { metal: ["14k-yellow-gold", "18k-yellow-gold"] },
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
    only: (p) => p.badge === "Top Seller",
  },
  {
    slug: "new-arrivals",
    title: "New Engagement Rings",
    description: "The latest settings from our designers. Choose your setting, then add the perfect stone.",
    filters: {},
    only: (p) => p.badge === "New",
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
        links: ["classic", "vintage", "pave", "cathedral", "halo", "swirl", "three-stone", "solitaire", "channel", "infinity"].map(
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
        links: SHAPES.map((s) => ({ label: s.label, to: toCollection(`${s.id}-shape`) })),
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
        links: PRICE_BANDS.map((b) => ({ label: b.label, to: `${PLP_PATH}?price=${b.id}` })),
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
