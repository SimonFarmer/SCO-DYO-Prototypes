# Shane Co. DYO prototypes

Clickable prototypes for the Design Your Own usability tests. See [CLAUDE.md](CLAUDE.md) for scope and rules.

**Stack:** Vite + React + TypeScript, React Router, Tailwind CSS v4, shadcn/ui (Base UI).

```bash
npm install
npm run dev      # local dev server
npm run build    # type-check + production build
npm run tokens   # regenerate CSS from the Figma Variables snapshot
```

## Design tokens

Every style value comes from the **SCO Pattern Library** Figma Variables. The full class reference is in [DESIGN_SYSTEM.md](DESIGN_SYSTEM.md) (generated).

| File | What it is |
| --- | --- |
| `tokens/sco-pattern-library.tokens.json` | DTCG snapshot of the Figma Variables (source of truth in the repo) |
| `scripts/build-tokens.mjs` | Generator: snapshot → CSS |
| `src/styles/tokens.css` | **Generated.** CSS custom properties: brand palette, semantic Light/Dark colours, responsive layout tokens |
| `src/styles/theme.css` | **Generated.** Tailwind `@theme` that maps tokens to utilities |

Tailwind's default colour palette, radii, font sizes, shadows and breakpoints are reset. Only Pattern Library tokens produce utilities, so `bg-red-500` or `sm:` compile to nothing.

**To update tokens:** change the variables in Figma, re-export the snapshot with the figma-console MCP (`figma_export_tokens`, format `dtcg`, `resolveAliases: false`, output to `tokens/sco-pattern-library.tokens.json`), then run `npm run tokens`. Don't edit the generated CSS by hand.

### Quick reference

- **Colours (semantic only):** `background`, `foreground`, `primary`, `secondary`, `tertiary` (burgundy), `accent`, `accent-2`, `muted`, `card`, `popover`, `border`, `border-subtle`, `border-light`, `input`, `ring`, `focus`, `destructive`, `success`, `warning`, `info`, plus each one's `-foreground`. Brand palettes (`--charcoal-*`, `--signature-burgundy-*`, `--warm-stone-*`, `--natural-linen-*`, `--dove-gray-*`) exist only as CSS variables for the theme layer.
- **Type:** `font-sans` Montserrat, `font-serif`/`font-heading` Playfair Display, `font-mono` Sen. Sizes `text-xxs` (11) · `xs` (12) · `xs-2` (13) · `sm` · `base` · `lg` · `xl` · `2xl`–`9xl`, each with the line height its Figma text style uses.
- **Spacing:** the usual 4px scale (`p-4` = 16px), matching the Figma Spacing collection.
- **Layout (changes with breakpoint):** `px-margin`, `px-margin-inset`, `px-margin-listing`, `px-content-margin`, `py-section-y`, `gap-card-gap`, `w-card`, `w-product-card`, and others. See `theme.css`.
- **Breakpoints (the Figma Viewport modes):** 390px is the base. `md` 768 · `lg` 1280 · `xl` 1440 · `2xl` 1680.
- **Radius:** Shane is square. `rounded-sm` through `rounded-xl` are 0; `rounded-xs` is 3px; `rounded-full` is a pill.
- **Border widths:** `border-w-50` · `border-w-100` · `border-w-200` · `border-w-300`.

### Adding shadcn components

`npx shadcn@latest add <component>`. New components may import `cn` from `"cn"`. Change that to `@/lib/utils`, which knows the custom token names.
