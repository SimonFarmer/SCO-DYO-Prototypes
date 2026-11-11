# Shane Co. — DYO Prototypes

Clickable prototypes for the Drop 3B Design Your Own usability tests. See `CLAUDE.md` (scope and rules) and `DESIGN_SYSTEM.md` (tokens).

## Run

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # static output in dist/ (Cloudflare Pages; SPA fallback via public/_redirects)
```

## Stack

Vite + React + TypeScript, Tailwind CSS v4, shadcn/ui (Base UI, `base-nova`), Phosphor + Lucide icons.

## Structure

| Path | What |
| --- | --- |
| `src/index.css` | Pattern Library tokens → Tailwind theme (defaults switched off), `type-*` text-style utilities |
| `src/components/ui` | shadcn atomic components, restyled to the Pattern Library |
| `src/components/layout` | Shared site chrome: `SiteHeader`, `SiteFooter`, `Breadcrumbs` |
| `src/components/dyo` | Shared DYO pieces: `DyoStepper` |
| `src/components/shared` | `ProductCard`, `ProductCarousel` (recommender), `SectionHeading` |
| `src/components/pdp` | Settings PDP sections (gallery, buy form, content blocks) |
| `src/data/products.ts` | Mock products shared across variants |
| `src/pages` | One file per prototype screen |
| `public/assets` | Images/SVGs exported from Figma |

## Prototypes

The index at `/` links every prototype and variant.

### Test 1 · Settings PDP Gallery & Details — `/dyo/setting?variant=…`

Variants are defined in `src/prototypes/setting-pdp-variants.ts` (one config per variant; the page reads it). Missing or unknown `variant` falls back to A.

| Variant | Gallery | Product details | Figma |
| --- | --- | --- | --- |
| `A` — Drawer only (control) | Long-scroll | "View product details" opens the drawer | `7342:118090` |
| `B` — Teaser + drawer | Long-scroll | 2-line description teaser; "View full product details" opens the drawer | `7342:118191` |
| `C` — Thumbnails + tabs | Single image + thumbnails | Overview / Specifications tabs in the buy form; the link scrolls to them. Adds "Complete the Look" | `7342:118091` |

Shared in every variant: metal switch (gallery, drawer image, copy and article no. follow the selected metal), mock data in `src/data/products.ts`.
