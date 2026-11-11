# Shane Co. — Design Your Own (DYO) Ring Flow

## Overview
We're building the Shane Co. Design Your Own flow: setting → stone → finishing touches.
It's mainly for engagement rings but may extend to other custom jewelry.

The first build is clickable prototypes for four unmoderated usability tests,
tested on both mobile and desktop. Features are briefed piecemeal: build only what's asked.

## Sources of truth
- **Test plan** (hypotheses, variants, success measures, prototype requirements):
  https://osfdigital.atlassian.net/wiki/spaces/SCO/pages/7887650819
  Read the relevant test section before building any prototype. Link, don't copy; it changes.
- **Designs:** Figma "SCO Drop 3b – Customizer"
  https://www.figma.com/design/Q4Wp6ls6O4nBvicBjbosQI
- **Design system:** Figma "SCO Pattern Library"
  https://www.figma.com/design/ceWHNjl5yoEXdjK2b3Oo5J
  Day-to-day reference: `DESIGN_SYSTEM.md` (generated from the Figma Variables;
  lists every token class). Use it instead of re-reading the Variables from Figma.
- Pull specs from Figma via the figma-console MCP (Desktop Bridge) before building a component.

## Tests in scope
1. Settings PDP Gallery & Details
2. Stone Preferences & Recommendations
3. Stone Details
4. Ring Personalization as a Separate Step

The moderated flow test (5) comes later and reuses the winning variants.

## Stack & hosting
- Standalone prototype app (not Storefront Next)
- **Styling:** Tailwind CSS, with design tokens from the SCO Pattern Library
- **Components:** shadcn/ui for atomic components, themed to the design system
- **Hosting:** Cloudflare (domain TBC)

## Design fidelity
- Match the designs as closely as possible. Build page structure to mirror the
  frames in the SCO Drop 3b – Customizer file.
- Build mobile and desktop layouts from their matching Figma frames.

## Design system rules
- From the Pattern Library, use only the Figma Variables and the atomic components.
  Ignore the other components.
- Bind every value (color, type, spacing, radius, shadow) to a token. Never hard-code.
- Where a Figma value has no matching token, apply the closest defined token.
- Use semantic tokens (`bg-background`, `text-muted-foreground`, `border-border`)
  in components. Brand palettes (charcoal, signature burgundy, warm stone,
  natural linen, dove gray) belong in the theme layer only.
- Use an existing atomic or shared component before creating a new one.

## Prototype rules
- Every tested variant is switchable (e.g. `?variant=A`), using the same products
  and data across variants.
- Simulated data must be realistic and consistent: prices, 4Cs, carat ranges and
  totals update correctly when choices change.
- Anything outside a test's scope (e.g. stepper View/Edit links) is inert or shows
  a "not part of this test" state.
- Each prototype starts and ends where the test plan says.
- Build shared pieces once (stepper, buy form, price summary, gallery, stone tiles,
  mock data) so the tests can be split across the team.

## Workflow
- GitHub remote: https://github.com/SimonFarmer/SCO-DYO-Prototypes (public).
  Pushes use the GitHub CLI login (`gh auth login`, `gh auth setup-git`).
- Branch per feature; push the branch and merge into `main` via pull request.
- Design tokens: when the Pattern Library Variables change, re-export the snapshot
  and run `npm run tokens` (regenerates the CSS and `DESIGN_SYSTEM.md`).
