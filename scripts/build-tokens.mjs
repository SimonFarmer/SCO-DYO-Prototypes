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

// ---------------------------------------------------------------------------
// Emit DESIGN_SYSTEM.md — the readable reference for people and Claude
// ---------------------------------------------------------------------------
const brandHex = Object.fromEntries(brand)
const show = (v) => {
  if (!v) return '—'
  const m = /^var\((--[^)]+)\)$/.exec(v)
  return m ? `\`${brandHex[m[1]] ?? v}\` (${m[1].slice(2)})` : `\`${v}\``
}
const BP_LABEL = { '390px': 'base (<768)', '768px': 'md ≥768', '1280px': 'lg ≥1280', '1440px': 'xl ≥1440', '1680px': '2xl ≥1680' }
const fam = Object.entries(Object.groupBy(brand, ([n]) => n.replace(/-\d+$/, '').slice(2)))

let md = `# SCO Pattern Library — design system reference

> GENERATED by \`scripts/build-tokens.mjs\` from the SCO Pattern Library Figma Variables
> (file ${meta.figmaFileKey ?? '?'}, exported ${meta.exportedAt ?? '?'}). Do not edit by hand.
> Figma: https://www.figma.com/design/ceWHNjl5yoEXdjK2b3Oo5J

## How to use this

- Style only with the Tailwind classes below. Every class is bound to a Figma Variable.
- Tailwind's default palette, radii, type scale, shadows and \`sm:\` breakpoint are switched off,
  so \`bg-red-500\`, \`text-[13px]\`-style guesses or \`sm:\` won't match the design system. Don't use
  arbitrary values (\`[...]\`) for colour, type, spacing, radius or shadow.
- Use **semantic** colours in components. Brand palettes are theme-layer only (CSS variables, no classes).
- Where Figma has a value with no token, use the closest token here and note it.
- Merge classes with \`cn()\` from \`@/lib/utils\` (it knows the custom token names).

## Semantic colours

Use as \`bg-*\`, \`text-*\`, \`border-*\`, \`ring-*\`, \`fill-*\` etc. Opacity modifiers work (\`bg-primary/80\`).

| Token | Light | Dark |
| --- | --- | --- |
`
for (const s of semantic) if (!s.name.startsWith('--shadow-color')) md += `| \`${s.name.slice(2)}\` | ${show(s.light)} | ${show(s.dark && s.dark !== s.light ? s.dark : s.light)} |\n`
for (const [n, v, why] of ALIASES) md += `| \`${n.slice(2)}\` | same as \`${v.slice(6, -1)}\` | — (${why}) |\n`
md += '\nAlso available: `white`, `black`, `transparent`, `current`.\n'

md += '\n## Brand palettes (theme layer only)\n\nCSS variables like `var(--charcoal-800)`. Never use in components.\n\n| Family | Steps |\n| --- | --- |\n'
for (const [f, rows] of fam) md += `| ${f} | ${rows.map(([n, v]) => `${n.split('-').pop()} \`${v}\``).join(' · ')} |\n`

md += `\n## Typography

| Class | Font |
| --- | --- |
| \`font-sans\` (default body) | ${fontFamily.sans} |
| \`font-serif\`, \`font-heading\` (h1–h6 default) | ${fontFamily.serif} |
| \`font-mono\` | ${fontFamily.mono} |

| Size class | Size | Default line height |
| --- | --- | --- |
`
for (const [k, v] of fontSize) md += `| \`text-${k}\` | ${v}px | ${DEFAULT_LEADING[k] ? `${leadingPx[DEFAULT_LEADING[k]]}px (\`leading-${DEFAULT_LEADING[k]}\`)` : '1 (100%)'} |\n`
md += `\nWeights: ${fontWeight.map(([k, v]) => `\`font-${k}\` ${v}`).join(' · ')}\n`
md += `\nLine heights: ${leading.map(([k, v]) => `\`leading-${k}\` ${v}px`).join(' · ')} · \`leading-none\` 1\n`
md += `
Figma text styles (apply as class combinations):

| Style | Classes |
| --- | --- |
| Display S/M/L/XL | \`font-heading text-6xl\` / \`7xl\` / \`8xl\` / \`9xl\`, \`leading-none tracking-[-0.025em]\` |
| H1 | \`font-heading text-5xl leading-none tracking-[-0.025em]\` |
| H2 | \`font-heading text-4xl\` (leading-11), \`tracking-[-0.025em]\` |
| H3 | \`font-heading text-3xl\` (leading-10), \`tracking-[-0.025em]\` |
| H4 | \`font-heading text-2xl\` (leading-9), \`tracking-[-0.6px]\` |
| H5 | \`font-heading text-xl\` (leading-7), \`tracking-[-0.6px]\` |
| Body L / M / S | \`text-lg\` / \`text-base\` / \`text-sm\` (add \`leading-none\` for the leading-none variants) |
| Caption | \`text-xs\` |
| Label XS / S | \`text-xxs\` / \`text-xs-2\`, \`leading-3 uppercase tracking-[1px]\` |
| Label M | \`text-sm leading-4 uppercase\` |
| Label L | \`text-base leading-6\` |

Weights per style: \`font-normal\`, \`font-medium\`, \`font-semibold\`, \`font-bold\` (\`font-extrabold\` for Display/H1).
Letter-spacing has no Figma Variable, so these tracking values are the one sanctioned arbitrary value.
`

md += `\n## Spacing\n\nStandard 4px scale: \`p-1\` = 4px, \`p-4\` = 16px, etc. Figma Spacing tokens: ${spacing.map(([k, v]) => `${k} (${v})`).join(', ')}.\n`
const offGrid = spacing.filter(([k, v]) => v !== parseFloat(k) * 4)
if (offGrid.length) md += `\nOff-grid in Figma (kept as-is): ${offGrid.map(([k, v]) => `\`${k}\` = ${v}px`).join(', ')}.\n`

md += '\n## Layout tokens (change with breakpoint)\n\nUse with any spacing/sizing utility: `px-margin`, `gap-card-gap`, `w-product-card`, `py-section-y`…\n\n'
md += `| Token | ${VIEWPORTS.map((v) => BP_LABEL[v.mode]).join(' | ')} |\n| --- |${VIEWPORTS.map(() => ' --- |').join('')}\n`
for (const t of viewport) md += `| \`${t.name}\` | ${VIEWPORTS.map(({ mode }) => `${t.values[mode]}px`).join(' | ')} |\n`

md += `\n## Breakpoints\n\nMobile-first, from the Figma Viewport modes. Design at 390px (base), then ${VIEWPORTS.slice(1).map((v) => `\`${v.bp}:\` ${v.min}px`).join(', ')}.\n`

md += '\n## Radius\n\nShane is square-cornered.\n\n| Class | Value |\n| --- | --- |\n'
for (const [k, v] of radius) md += `| \`rounded-${k}\` | ${v >= 9999 ? 'pill' : `${v}px`} |\n`
md += '| `rounded`, `rounded-2xl`…`4xl` | 0 (closest defined) |\n'

md += '\n## Shadows\n\n| Class | Value |\n| --- | --- |\n'
for (const [k, v] of shadows) md += `| \`${k === 'DEFAULT' ? 'shadow' : 'shadow-' + k}\` | \`${v.replace(/var\(--shadow-color-[^)]+\)/g, 'c')}\` |\n`
md += '\n`c` = the matching `--shadow-color-*` token (black at 10–20%).\n'

md += `\n## Borders and widths\n\nBorder widths: ${borderWidths.map(([k, v]) => `\`border-w-${k}\` ${v.toFixed(2).replace(/\.?0+$/, '')}px`).join(' · ')} (plain \`border\` = 1px).\n`
md += `\nMax widths: ${containers.map(([k, v]) => `\`max-w-${k}\` ${v}px`).join(' · ')}.\n`

md += `
## Components

shadcn/ui (Base UI) atomic components live in \`src/components/ui\`. Add with
\`npx shadcn@latest add <name>\`, then change any \`import { cn } from "cn"\` to \`@/lib/utils\`.
Restyle them with the tokens above to match the Pattern Library's atomic components in Figma.
`

fs.mkdirSync(path.dirname(OUT_TOKENS), { recursive: true })
fs.writeFileSync(OUT_TOKENS, css)
fs.writeFileSync(OUT_THEME, theme)
fs.writeFileSync(path.join(root, 'DESIGN_SYSTEM.md'), md)
console.log(`tokens.css: ${brand.length} brand, ${semantic.length} semantic, ${viewport.length} layout`)
console.log(`theme.css: ${fontSize.length} font sizes, ${spacing.length} spacing, ${radius.length} radii, ${shadows.length} shadows`)
