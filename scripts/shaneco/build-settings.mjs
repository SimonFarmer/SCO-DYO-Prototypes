#!/usr/bin/env node
/**
 * Builds the full flow's setting PDP content from shaneco.com.
 *
 * Input: scripts/shaneco/pdps/{itemId}.json, one per PLP design (any of its metals), read from the live PDP in a
 * real browser (JSON-LD description and price, the "Read More" highlights, the Product Details table and the
 * gallery's Scene7 paths). shaneco.com blocks scripted page requests, so the pages are read by hand; the
 * Scene7 image CDN isn't blocked, so this script downloads the gallery photos itself.
 *
 * Gallery shots are named {slug}_{itemId}_A{n}, one item ID per metal, and Scene7 ignores the slug, so every
 * metal's own shots can be fetched: the front and side views (A2, A1, sometimes A3, A4) exist in every metal;
 * styled and on-hand photos (the PDP's other A numbers) only in some. A missing shot returns a placeholder.
 *
 * Output: src/data/setting-pdps.ts (generated, keyed by PLP design id) and
 * public/images/gallery/{designId}/{itemId}-A{n}.jpg.
 *
 *   node scripts/shaneco/build-settings.mjs
 */
import { existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from "node:fs"
import { createHash } from "node:crypto"
import { dirname, join } from "node:path"
import { fileURLToPath } from "node:url"

const root = join(dirname(fileURLToPath(import.meta.url)), "../..")
const pdpDir = join(root, "scripts/shaneco/pdps")
const SCENE7 = "https://images.shaneco.com/is/image/ShaneCo/"

// PLP designs: every item ID (one per metal) to its design id and metal, from the DESIGNS table in src/data/plp.ts.
const plp = readFileSync(join(root, "src/data/plp.ts"), "utf8")
const designByItem = new Map()
for (const line of plp.matchAll(/^\s*\{ id: "([a-z0-9-]+)",.*metals: (\[.*\]) \},?$/gm)) {
  const items = [...line[2].matchAll(/\["([a-z0-9-]+)", "(\d+)"/g)].map(([, metal, item]) => ({ metal, item }))
  for (const { metal, item } of items) designByItem.set(item, { id: line[1], metal, items })
}

const METAL_WORDS = {
  "14k-white-gold": ["14k white gold", "14-karat white gold"],
  "14k-yellow-gold": ["14k yellow gold", "14-karat yellow gold"],
  "14k-rose-gold": ["14k rose gold", "14-karat rose gold"],
  platinum: ["platinum", "platinum"],
}

const titleCase = (s) => s.replace(/(^|[\s-])\w/g, (c) => c.toUpperCase())

/** Specs for the drawer: the PDP's own table when it has one, otherwise read from the highlights. */
function specsFrom(page) {
  const own = page.specs.filter(([label]) => label !== "Metal Type")
  if (own.length) return own.map(([label, value]) => ({ label, value }))
  const specs = []
  const width = page.highlights.filter((h) => /band width/i.test(h)).map((h) => h.replace(/\s*band width\s*/i, " ").replace(/\.$/, "").trim())
  if (width.length) specs.push({ label: "Band Width", value: width.join(" – ").replace(/ max – (.*) min$/, " max, $1 min") })
  specs.push({ label: "Engravable", value: "Yes" })
  const accents = page.highlights.map((h) => h.match(/^(\d+) ([\w-]+(?: [\w-]+)?) natural diamond accents at (?:approx\. )?([\d./]+ tcw)/i)).filter(Boolean)
  if (accents.length) {
    specs.push({ label: "Gemstone Type", value: "Natural Diamond" })
    specs.push({ label: "Number of Gemstones", value: String(accents.reduce((n, a) => n + Number(a[1]), 0)) })
    specs.push({ label: "Accent Stone Shape", value: [...new Set(accents.map((a) => titleCase(a[2].replace(/-shaped$/, ""))))].join(", ") })
  } else {
    specs.push({ label: "Gemstone Type", value: "No Stones" })
  }
  return specs
}

// The 800 px preset (ring/800/…) exists for every gallery shot; larger presets fall back to a thumbnail.
const shotUrl = (item, shot) => `${SCENE7}ring/800/ring_${item}_${shot}.jpg`
const hashOf = (buf) => createHash("md5").update(buf).digest("hex")

async function fetchImage(url) {
  const res = await fetch(url)
  const type = res.headers.get("content-type") ?? ""
  if (!res.ok || !type.startsWith("image/")) throw new Error(`${url}: ${res.status} ${type}`)
  return Buffer.from(await res.arrayBuffer())
}

// What Scene7 returns for a shot that doesn't exist.
const PLACEHOLDER = hashOf(await fetchImage(shotUrl("99999999", "A1")))

/** Downloads the shot if this item has it; returns its public path, or null when it doesn't exist. */
async function shot(designId, item, name) {
  const file = join(root, "public/images/gallery", designId, `${item}-${name}.jpg`)
  const src = `/images/gallery/${designId}/${item}-${name}.jpg`
  if (existsSync(file)) return src
  const buf = await fetchImage(shotUrl(item, name))
  if (hashOf(buf) === PLACEHOLDER) return null
  // Some shots exist but are blank white (e.g. 41004888_A1): an 800 px white JPEG is ~8 KB, real shots 18 KB+.
  if (buf.length < 12_000) return null
  writeFileSync(file, buf)
  return src
}

const out = {}
for (const f of readdirSync(pdpDir).filter((f) => f.endsWith(".json")).sort()) {
  const page = JSON.parse(readFileSync(join(pdpDir, f), "utf8"))
  const design = designByItem.get(page.id)
  if (!design) throw new Error(`${page.id} (${page.name}) isn't a setting item in src/data/plp.ts`)
  const [short, long] = METAL_WORDS[design.metal]
  const highlights = page.highlights.map((h) => (h.toLowerCase() === short ? "{metal}" : h))
  const description = page.description.replace(long, "{metal}")
  if (!description.includes("{metal}")) console.warn(`${design.id}: no metal phrase in the description`)

  // Per metal: the product views first (front, side, then any extra angle), then the styled photos in the
  // PDP's order, keeping only the shots that metal has. The hero render comes from the PLP's local images.
  mkdirSync(join(root, "public/images/gallery", design.id), { recursive: true })
  const pageShots = page.media.filter((p) => p.startsWith("ring/")).map((p) => p.match(/_(A\d+)\.jpg$/)[1])
  const shots = [...new Set(["A2", "A1", "A3", "A4", ...pageShots])]
  const gallery = {}
  for (const { metal, item } of design.items) {
    gallery[metal] = []
    for (const name of shots) {
      const src = await shot(design.id, item, name)
      if (src) gallery[metal].push(src)
    }
  }

  const section = page.url.split("/")[2] ?? "engagement-rings"
  out[design.id] = {
    url: `https://www.shaneco.com${page.url}`,
    breadcrumb: ["Home", "Engagement Rings", titleCase(section.replace(/-/g, " "))],
    description,
    highlights,
    specs: specsFrom(page),
    gallery,
  }
  console.log(`${design.id}: ${Object.entries(gallery).map(([m, g]) => `${m} ${g.length}`).join(", ")}`)
}

const header = `// Generated by scripts/shaneco/build-settings.mjs from shaneco.com PDPs (November 2026). Do not edit by hand.\n\nimport type { MetalId } from "./products"\n\nexport interface SettingPdpContent {\n  /** Live PDP the content was read from (the design's lead metal). */\n  url: string\n  breadcrumb: string[]\n  /** \`{metal}\` is replaced with the selected metal. */\n  description: string\n  highlights: string[]\n  specs: { label: string; value: string }[]\n  /** Each metal's own photos after the hero: front and side views, then the styled photos that metal has. */\n  gallery: Partial<Record<MetalId, string[]>>\n}\n\n`
writeFileSync(join(root, "src/data/setting-pdps.ts"), `${header}export const SETTING_PDPS: Record<string, SettingPdpContent> = ${JSON.stringify(out, null, 2)}\n`)
console.log(`Wrote src/data/setting-pdps.ts (${Object.keys(out).length} settings)`)
