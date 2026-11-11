/**
 * Shared mock data for the DYO prototypes. Same products across every test and variant.
 * Keep it realistic: prices, 4Cs and sizes must stay internally consistent.
 */

export interface Setting {
  id: string
  name: string
  article: string
  price: number
  metal: string
  image: string
}

export interface Stone {
  id: string
  title: string
  price: number
  carat: number
  shape: string
  origin: string
  clarity: string
  color: string
  cut: string
  /** Measured diameter, used to match crowns. */
  diameterMm: number
}

export interface RingSize {
  value: string
  inStock: boolean
  /** Inside diameter in mm (US sizing). */
  diameterMm: number
}

export interface Crown {
  id: string
  name: string
  holds: string
  price: number
  image: string
}

export interface EngravingStyle {
  id: string
  name: string
  /** Typeface used to render the style (content, not UI type). */
  fontFamily: string
  /** Optical size tweak so styles read at a similar size. */
  scale: number
}

export const SETTING: Setting = {
  id: "timeless-solitaire",
  name: "Timeless Solitaire Engagement Ring",
  article: "41094280",
  price: 690,
  metal: "14K Yellow Gold",
  image: "/images/review/ring-thumb.jpg",
}

export const STONE: Stone = {
  id: "rd-121-g-vs2",
  title: "1.21 ct Round Natural Diamond",
  price: 5825,
  carat: 1.21,
  shape: "Round",
  origin: "Natural Diamond",
  clarity: "VS2",
  color: "G",
  cut: "Very Good",
  diameterMm: 6.17,
}

/** US ring sizes 4.5–9 in quarter sizes. Inside diameter ≈ 11.63 + 0.8128 × size. */
export const RING_SIZES: RingSize[] = Array.from({ length: 19 }, (_, i) => {
  const size = 4.5 + i * 0.25
  return {
    value: Number.isInteger(size) ? size.toFixed(1) : String(size),
    inStock: size > 4.75,
    diameterMm: Math.round((11.63 + 0.8128 * size) * 10) / 10,
  }
})

export const DEFAULT_RING_SIZE = "6.5"

const holds = `Holds approx. ${STONE.diameterMm.toFixed(1)}mm ${STONE.shape}`

/** Crowns compatible with the selected stone (12 options, from $300). */
export const CROWNS: Crown[] = [
  { id: "halo-diamond", name: "Diamond Halo Decorative Crown", holds, price: 500, image: "/images/crowns/halo.png" },
  { id: "rosebud-diamond", name: "Rosebud Diamond Decorative Crown", holds, price: 400, image: "/images/crowns/rosebud-classic.png" },
  { id: "rosebud-petite", name: "Petite Rosebud Decorative Crown", holds, price: 300, image: "/images/crowns/rosebud-petite.png" },
  { id: "rosebud-pave", name: "Pavé Rosebud Decorative Crown", holds, price: 450, image: "/images/crowns/rosebud-pave.png" },
  { id: "halo-double", name: "Double Halo Diamond Crown", holds, price: 750, image: "/images/crowns/halo.png" },
  { id: "halo-hidden", name: "Hidden Halo Decorative Crown", holds, price: 600, image: "/images/crowns/rosebud-pave.png" },
  { id: "milgrain-halo", name: "Milgrain Halo Decorative Crown", holds, price: 550, image: "/images/crowns/halo.png" },
  { id: "six-prong-pave", name: "Six-Prong Pavé Decorative Crown", holds, price: 350, image: "/images/crowns/rosebud-classic.png" },
  { id: "cathedral-rosebud", name: "Cathedral Rosebud Decorative Crown", holds, price: 425, image: "/images/crowns/rosebud-pave.png" },
  { id: "floral-halo", name: "Floral Halo Decorative Crown", holds, price: 650, image: "/images/crowns/halo.png" },
  { id: "vintage-milgrain", name: "Vintage Milgrain Decorative Crown", holds, price: 375, image: "/images/crowns/rosebud-petite.png" },
  { id: "bezel-halo", name: "Bezel Halo Decorative Crown", holds, price: 900, image: "/images/crowns/halo.png" },
]

export const CROWN_FROM_PRICE = Math.min(...CROWNS.map((c) => c.price))

export const ENGRAVING = {
  price: 60,
  maxLength: 30,
  styles: [
    { id: "antique", name: "Antique", fontFamily: "'Great Vibes', cursive", scale: 1.35 },
    { id: "letterbox", name: "Letterbox", fontFamily: "'Poiret One', sans-serif", scale: 1.1 },
    { id: "calligraphy", name: "Calligraphy", fontFamily: "'Pinyon Script', cursive", scale: 1.2 },
    { id: "deco", name: "Deco", fontFamily: "'Limelight', serif", scale: 1 },
    { id: "traditional", name: "Traditional", fontFamily: "'Cormorant Garamond', serif", scale: 1.15 },
    { id: "journal", name: "Journal", fontFamily: "'Dancing Script', cursive", scale: 1.2 },
    { id: "modern", name: "Modern", fontFamily: "var(--font-sans)", scale: 1 },
  ] satisfies EngravingStyle[],
}

export interface GalleryImage {
  src: string
  alt: string
}

/** Ring Review gallery (setting + stone), in Figma order. */
export const REVIEW_GALLERY: GalleryImage[] = [
  { src: "/images/review/gallery-1.jpg", alt: "Timeless Solitaire ring with 1.21 ct round diamond, front view" },
  { src: "/images/review/gallery-2-video.jpg", alt: "360° video of the 1.21 ct round diamond" },
  { src: "/images/review/gallery-3.jpg", alt: "1.21 ct round diamond, top view" },
  { src: "/images/review/gallery-4-source.jpg", alt: "At the Source: we work directly with our diamond partners" },
  { src: "/images/review/gallery-5-profile.png", alt: "Diamond profile: table 57%, depth 66%, girdle very thick, culet none" },
  { src: "/images/review/gallery-6-top.png", alt: "Diamond measurements: 6.17mm × 6.17mm" },
  { src: "/images/review/gallery-7.jpg", alt: "Timeless Solitaire ring, side view" },
  { src: "/images/review/gallery-8.jpg", alt: "Decorative crown option" },
  { src: "/images/review/gallery-9.jpg", alt: "Decorative crown option, top view" },
]

export const DELIVERY = {
  shipBy: "By Thu, Nov 19",
  pickupStore: "Cupertino, Valley Fair",
  pickupReady: "Ready Fri, Nov 20",
}
