#!/usr/bin/env node
/**
 * Builds src/styles/tokens.css and src/styles/theme.css from the
 * SCO Pattern Library Figma Variables snapshot (tokens/sco-pattern-library.tokens.json).
 *
 * Refresh the snapshot with the figma-console MCP (export_tokens, format "dtcg",
 * resolveAliases false) and re-run `npm run tokens`. Never edit the generated CSS by hand.
 *
 * Layers:
 *   tokens.css  — raw CSS custom properties.
 *                 :root  → brand palette primitives (theme layer only) + semantic Light values
 *                 .dark  → semantic Dark values
 *                 @media → Viewport layout tokens per breakpoint
 *   theme.css   — Tailwind v4 `@theme inline` mapping tokens to utilities.
 *                 Tailwind's default palette, radius, font-size and breakpoint scales are
 *                 reset so only Pattern Library tokens produce utilities.
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const SRC = path.join(root, 'tokens/sco-pattern-library.tokens.json')
const OUT_TOKENS = path.join(root, 'src/styles/tokens.css')
const OUT_THEME = path.join(root, 'src/styles/theme.css')

const doc = JSON.parse(fs.readFileSync(SRC, 'utf8'))
const meta = doc.$extensions?.['figma-console-mcp'] ?? {}

// ---------------------------------------------------------------------------
// Flatten DTCG into { "collection.path.to.token": { type, modes: {name: value}, primaryMode } }
// ---------------------------------------------------------------------------
const tokens = new Map()
function walk(node, trail) {
  for (const [key, val] of Object.entries(node)) {
    if (key.startsWith('$') || !val || typeof val !== 'object') continue
    if ('$value' in val) {
      const ext = val.$extensions?.['figma-console-mcp'] ?? {}
      const primary = ext.primaryMode ?? 'default'
      tokens.set([...trail, key].join('.'), {
        type: ext.figmaResolvedType,
        primaryMode: primary,
        modes: { [primary]: val.$value, ...(ext.modes ?? {}) },
      })
    } else walk(val, [...trail, key])
  }
}
walk(doc, [])

const get = (id) => {
  const t = tokens.get(id)
  if (!t) throw new Error(`Unknown token ${id}`)
  return t
}
const isRef = (v) => typeof v === 'string' && /^\{.+\}$/.test(v)
const refId = (v) => v.slice(1, -1)

/** Resolve a value (possibly an alias) to a literal, following a given mode where it exists. */
function resolve(value, mode) {
  let v = value
  for (let i = 0; i < 20 && isRef(v); i++) {
    const t = get(refId(v))
    v = t.modes[mode] ?? t.modes[t.primaryMode]
  }
  return v
}

// ---------------------------------------------------------------------------
// Naming
// ---------------------------------------------------------------------------
const slug = (s) =>
  s
    .replace(/★/g, '')
    .trim()
    .replace(/,/g, '_') // p-0,5 → p-0_5 (handled below for Tailwind keys)
    .replace(/\s+/g, '-')
    .toLowerCase()

/** Brand palette primitive → CSS var, e.g. primatives.brand colors.charcoal.900 ★ → --charcoal-900 */
const brandVar = (id) => {
  const [, , family, step] = id.split('.')
  return `--${slug(family)}-${slug(step)}`
}

/**
 * Semantic (Mode collection) token → CSS var, following shadcn naming:
 *   mode.primary → --primary, mode.sidebar.sidebar → --sidebar, mode.chart.chart-1 → --chart-1,
 *   mode.custom.focus → --focus, mode.shadow.sm → --shadow-color-sm
 */
function semanticVar(segments) {
  const s = segments.map(slug)
  if (s[0] === 'custom') s.shift()
  if (s[0] === 'shadow') return `--shadow-color-${s.slice(1).join('-')}`
  if (s.length === 2 && (s[0] === s[1] || s[1].startsWith(`${s[0]}-`))) return `--${s[1]}`
  return `--${s.join('-')}`
}

/** CSS value for a color: brand primitives become var() refs; other values are literals. */
function colorValue(value, mode) {
  let v = value
  for (let i = 0; i < 20 && isRef(v); i++) {
    const id = refId(v)
    if (id.startsWith('primatives.brand colors.')) return `var(${brandVar(id)})`
    const t = get(id)
    v = t.modes[mode] ?? t.modes[t.primaryMode]
  }
  return v
}

const rem = (px) => (px === 0 ? '0' : `${+(px / 16).toFixed(4)}rem`)
const px = (n) => (n === 0 ? '0' : `${+n.toFixed(2)}px`)

/** Literal value of a single-mode token. */
const val = (id) => {
  const t = get(id)
  return resolve(t.modes[t.primaryMode], t.primaryMode)
}
const byNum = (a, b) => parseFloat(a[1]) - parseFloat(b[1])

const ids = [...tokens.keys()]
const under = (prefix) => ids.filter((id) => id.startsWith(prefix + '.'))
const leaf = (id, prefix) => id.slice(prefix.length + 1)

// ---------------------------------------------------------------------------
// 1. Brand palette primitives (theme layer only — not exposed as utilities)
// ---------------------------------------------------------------------------
const brand = under('primatives.brand colors')
  .map((id) => [brandVar(id), val(id)])
  .sort(([a], [b]) => a.localeCompare(b, 'en', { numeric: true }))

// ---------------------------------------------------------------------------
// 2. Semantic colors (Mode collection: Light / Dark)
// ---------------------------------------------------------------------------
const semantic = []
for (const id of under('mode')) {
  const t = get(id)
  if (t.type !== 'COLOR') continue
  const name = semanticVar(leaf(id, 'mode').split('.'))
  const light = colorValue(t.modes.Light, 'Light')
  const dark = colorValue(t.modes.Dark ?? t.modes.Light, 'Dark')
  semantic.push({ name, light, dark })
}

// Shane Template colours that designers bind directly but the Mode collection doesn't alias.
const covered = new Set(semantic.map((s) => s.name))
for (const id of under('shane-template.colors.light')) {
  const rel = leaf(id, 'shane-template.colors.light').split('.')
  const name = semanticVar(rel)
  if (covered.has(name)) continue
  if (['opacity', 'chart', 'shadow', 'sidebar', 'agentic'].some((p) => name.startsWith(`--${p}`))) continue
  const darkId = id.replace('.light.', '.dark.')
  semantic.push({
    name,
    light: colorValue(get(id).modes.Shane, 'Shane'),
    dark: tokens.has(darkId) ? colorValue(get(darkId).modes.Shane, 'Shane') : null,
  })
  covered.add(name)
}
semantic.sort((a, b) => a.name.localeCompare(b.name))

// ---------------------------------------------------------------------------
// 3. Typography (Shane Template)
// ---------------------------------------------------------------------------
const ST = 'shane-template'
const fontFamily = Object.fromEntries(
  under(`${ST}.font.family`).map((id) => [leaf(id, `${ST}.font.family`).replace('font-', ''), resolve(get(id).modes.Shane, 'Shane')]),
)
const fontSize = under(`${ST}.font.size`).map((id) => [leaf(id, `${ST}.font.size`).replace('text-', ''), val(id)]).sort(byNum)
const fontWeight = under(`${ST}.font.weight`).map((id) => [leaf(id, `${ST}.font.weight`).replace('font-', ''), val(id)]).sort(byNum)
const leading = under(`${ST}.font.line-height`).map((id) => [leaf(id, `${ST}.font.line-height`).replace('leading-', ''), val(id)]).sort(byNum)
const leadingPx = Object.fromEntries(leading)

/**
 * Default line-height per font size, taken from the Pattern Library text styles
 * (Body/Label/Caption "leading-normal" and Headings). Sizes only used at 100% in the
 * text styles (H1, Display) default to leading-none.
 */
const DEFAULT_LEADING = {
  xxs: '3', xs: '4', 'xs-2': '4', sm: '5', base: '6', lg: '8',
  xl: '7', '2xl': '9', '3xl': '10', '4xl': '11',
}

// ---------------------------------------------------------------------------
// 4. Radius (Shane Template overrides Primitives — Shane is square-cornered)
// ---------------------------------------------------------------------------
const radius = under(`${ST}.radius`).map((id) => [leaf(id, `${ST}.radius`).replace('rounded-', ''), val(id)]).sort(byNum)

// ---------------------------------------------------------------------------
// 5. Spacing (Spacing collection) and container widths (Primitives max-width)
// ---------------------------------------------------------------------------
const spacing = under('spacing')
  .map((id) => [leaf(id, 'spacing').replace(/^p-/, '').replace(',', '.'), val(id)])
  .sort((a, b) => parseFloat(a[0]) - parseFloat(b[0]))
const containers = under('primatives.max-width')
  .map((id) => [leaf(id, 'primatives.max-width').replace('max-w-', ''), val(id)])
  .filter(([k]) => !k.startsWith('screen-'))
  .sort(byNum)
const borderWidths = under('primatives.border-width').map((id) => [leaf(id, 'primatives.border-width').replace('w-', ''), val(id)]).sort(byNum)

// ---------------------------------------------------------------------------
// 6. Shadows: compose layered shadows from Shane Template geometry + Mode shadow colours
// ---------------------------------------------------------------------------
const shadowNames = [...new Set(under(`${ST}.shadow`).map((id) => leaf(id, `${ST}.shadow`).split('.')[0]))]
const shadows = shadowNames.map((name) => {
  const layers = [...new Set(under(`${ST}.shadow.${name}`).map((id) => leaf(id, `${ST}.shadow.${name}`).split('.')[0]))].sort()
  const v = (layer, k) => resolve(get(`${ST}.shadow.${name}.${layer}.${k}`).modes.Shane, 'Shane')
  const key = name === 'shadow' ? 'DEFAULT' : name
  const color = `var(--shadow-color-${name})`
  const value = layers.map((l) => `${px(v(l, 'x'))} ${px(v(l, 'y'))} ${px(v(l, 'blur'))} ${px(v(l, 'spread'))} ${color}`).join(', ')
  return [key, value]
})

// ---------------------------------------------------------------------------
// 7. Viewport (layout tokens by breakpoint)
// ---------------------------------------------------------------------------
// Figma modes → breakpoints. Mobile (390) is the base; others are min-width queries.
const VIEWPORTS = [
  { mode: '390px', bp: null },
  { mode: '768px', bp: 'md', min: 768 },
  { mode: '1280px', bp: 'lg', min: 1280 },
  { mode: '1440px', bp: 'xl', min: 1440 },
  { mode: '1680px', bp: '2xl', min: 1680 },
]
// Layout tokens exposed as spacing utilities (e.g. px-margin, gap-card-gap, w-product-card).
const VIEWPORT_TOKENS = {
  'Margin-Size.Width': 'margin',
  'Margin-Size.Width Inset': 'margin-inset',
  'Margin-Size.Product Listing': 'margin-listing',
  'Content.Margin-Size.Width': 'content-margin',
  'Padding-Size.Padding Vertical': 'section-y',
  'Card.Gap': 'card-gap',
  'Card.Width': 'card',
  'Product Card.Width': 'product-card',
  'Product Card.Margin': 'product-card-margin',
  'Guided Intent.Width': 'guided-intent',
  'Assurances.Width': 'assurances',
  'Recommender.Width': 'recommender',
  'Category Wayfinder.Width': 'category-wayfinder',
  'Category Wayfinder.Width (Interactive Hero)': 'category-wayfinder-hero',
}
const viewport = Object.entries(VIEWPORT_TOKENS).map(([path, name]) => {
  const t = get(`viewport.${path}`)
  return { name, values: Object.fromEntries(VIEWPORTS.map(({ mode }) => [mode, resolve(t.modes[mode] ?? t.modes[t.primaryMode], mode)])) }
})

// ---------------------------------------------------------------------------
// Hand-mapped aliases: shadcn slots the Pattern Library has no variable for.
// Each points at the closest defined token (CLAUDE.md: "apply the closest defined token").
// ---------------------------------------------------------------------------
const ALIASES = [
  ['--input', 'var(--border)', 'shadcn input border → Pattern Library border (no light-mode input variable)'],
]

// ---------------------------------------------------------------------------
// Emit tokens.css
// ---------------------------------------------------------------------------
const header = (what) =>
  `/* ${what}\n * GENERATED by scripts/build-tokens.mjs from the SCO Pattern Library Figma Variables.\n * Source: Figma file ${meta.figmaFileKey ?? '?'} · exported ${meta.exportedAt ?? '?'}\n * Do not edit by hand — update Figma, re-export, then run \`npm run tokens\`.\n */\n`

let css = header('Design tokens: CSS custom properties')
css += '\n:root {\n  /* Brand palette (theme layer only — components use semantic tokens) */\n'
for (const [n, v] of brand) css += `  ${n}: ${v};\n`
css += `  --white: ${val('primatives.white')};\n  --black: ${val('primatives.black')};\n`
css += '\n  /* Semantic colours — Light */\n'
for (const s of semantic) css += `  ${s.name}: ${s.light};\n`
css += '\n  /* Aliases for shadcn slots without a Pattern Library variable */\n'
for (const [n, v, why] of ALIASES) css += `  ${n}: ${v}; /* ${why} */\n`
css += '\n  /* Layout (Viewport collection, 390px mobile base) */\n'
for (const t of viewport) css += `  --layout-${t.name}: ${rem(t.values['390px'])};\n`
css += '}\n\n.dark {\n  /* Semantic colours — Dark */\n'
for (const s of semantic) if (s.dark && s.dark !== s.light) css += `  ${s.name}: ${s.dark};\n`
css += '}\n'
for (const { mode, min } of VIEWPORTS.slice(1)) {
  css += `\n/* Viewport ${mode} */\n@media (min-width: ${min}px) {\n  :root {\n`
  for (const t of viewport) css += `    --layout-${t.name}: ${rem(t.values[mode])};\n`
  css += '  }\n}\n'
}

// ---------------------------------------------------------------------------
// Emit theme.css
// ---------------------------------------------------------------------------
let theme = header('Tailwind v4 theme: maps tokens to utilities')
theme += '\n@theme inline {\n'
theme += '  /* Reset Tailwind defaults so only Pattern Library tokens generate utilities */\n'
theme += '  --color-*: initial;\n  --radius-*: initial;\n  --text-*: initial;\n  --font-*: initial;\n  --font-weight-*: initial;\n  --leading-*: initial;\n  --shadow-*: initial;\n  --container-*: initial;\n  --breakpoint-*: initial;\n\n'
theme += '  /* Colours (semantic only) */\n'
theme += '  --color-white: var(--white);\n  --color-black: var(--black);\n  --color-transparent: transparent;\n  --color-current: currentColor;\n'
for (const s of semantic) if (!s.name.startsWith('--shadow-color')) theme += `  --color-${s.name.slice(2)}: var(${s.name});\n`
for (const [n] of ALIASES) theme += `  --color-${n.slice(2)}: var(${n});\n`

theme += '\n  /* Typography */\n'
theme += `  --font-sans: "${fontFamily.sans} Variable", "${fontFamily.sans}", ui-sans-serif, system-ui, sans-serif;\n`
theme += `  --font-serif: "${fontFamily.serif} Variable", "${fontFamily.serif}", ui-serif, Georgia, serif;\n`
theme += `  --font-mono: "${fontFamily.mono}", ui-monospace, monospace;\n`
theme += '  --font-heading: var(--font-serif);\n'
for (const [k, v] of fontSize) {
  theme += `  --text-${k}: ${rem(v)};\n`
  const lh = DEFAULT_LEADING[k]
  theme += `  --text-${k}--line-height: ${lh ? rem(leadingPx[lh]) : '1'};\n`
}
for (const [k, v] of fontWeight) theme += `  --font-weight-${k}: ${v};\n`
for (const [k, v] of leading) theme += `  --leading-${k}: ${rem(v)};\n`
theme += '  --leading-none: 1;\n'

theme += '\n  /* Spacing (Spacing collection; base unit 4px = Figma p-1) */\n  --spacing: 0.25rem;\n'
for (const [k, v] of spacing) if (v !== parseFloat(k) * 4) theme += `  --spacing-${k.replace('.', '\\.')}: ${rem(v)}; /* Figma p-${k} deviates from 4px grid */\n`
theme += '\n  /* Layout spacing (Viewport collection — responds to breakpoint) */\n'
for (const t of viewport) theme += `  --spacing-${t.name}: var(--layout-${t.name});\n`

theme += '\n  /* Radius (Shane Template) */\n'
for (const [k, v] of radius) theme += `  --radius-${k}: ${v >= 9999 ? 'calc(infinity * 1px)' : px(v)};\n`
theme += '  --radius: var(--radius-lg);\n'
theme += '  --radius-2xl: var(--radius-xl); /* not defined in Shane Template → closest (xl) */\n'
theme += '  --radius-3xl: var(--radius-xl);\n  --radius-4xl: var(--radius-xl);\n'

theme += '\n  /* Shadows (geometry from Shane Template, colour from Mode) */\n'
for (const [k, v] of shadows) theme += `  --shadow${k === 'DEFAULT' ? '' : '-' + k}: ${v};\n`

theme += '\n  /* Container widths (Primitives max-width) */\n'
for (const [k, v] of containers) theme += `  --container-${k}: ${rem(v)};\n`

theme += '\n  /* Breakpoints (Viewport collection modes; 390px mobile is the base) */\n'
for (const { mode, bp, min } of VIEWPORTS.slice(1)) theme += `  --breakpoint-${bp}: ${min / 16}rem; /* ${mode} */\n`
theme += '}\n'

theme += '\n/* Border widths (Primitives) */\n'
for (const [k, v] of borderWidths) theme += `@utility border-w-${k} { border-width: ${px(v)}; }\n`

fs.mkdirSync(path.dirname(OUT_TOKENS), { recursive: true })
fs.writeFileSync(OUT_TOKENS, css)
fs.writeFileSync(OUT_THEME, theme)
console.log(`tokens.css: ${brand.length} brand, ${semantic.length} semantic, ${viewport.length} layout`)
console.log(`theme.css: ${fontSize.length} font sizes, ${spacing.length} spacing, ${radius.length} radii, ${shadows.length} shadows`)
