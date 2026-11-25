import { Link } from "react-router"
import { useRingBuild } from "@/state/ring-build"
import { SETTING_PDP_VARIANTS } from "./test-1/variants"

const PROTOTYPES = [
  {
    test: "Full DYO Flow · Step by Step",
    links: [
      { label: "Start on the homepage", to: "/flow?t1=b&t2=b&t31=b&t32=a&t4=b&crumbs=on" },
      { label: "Start without breadcrumbs", to: "/flow?t1=b&t2=b&t31=b&t32=a&t4=b&crumbs=off" },
    ],
  },
  {
    test: "Full DYO Flow · Accordion",
    links: [
      { label: "Start on the homepage", to: "/flow-accordion?t2=b&t31=b&t32=a&crumbs=on" },
      { label: "Start without breadcrumbs", to: "/flow-accordion?t2=b&t31=b&t32=a&crumbs=off" },
    ],
  },
  {
    test: "Engagement Ring PLP · DYO entry point",
    links: [
      { label: "Homepage: navigation entry point (start here)", to: "/shop" },
      { label: "PLP: all engagement rings (DYO step 1) · A: shape illustrations", to: "/engagement-rings?variant=A" },
      { label: "PLP: all engagement rings (DYO step 1) · B: shape product images", to: "/engagement-rings?variant=B" },
      { label: "PLP: Level 3 landing (Classic)", to: "/engagement-rings/classic" },
      { label: "PLP: Shop by Budget preset (under $1,000)", to: "/engagement-rings?price=under-1000" },
      { label: "PLP: Ready to Ship", to: "/engagement-rings/ready-to-ship" },
      { label: "GLP: Natural Diamonds (DYO step 2) · tile opens Quickview", to: "/natural-diamonds" },
    ],
  },
  {
    test: "Test 1 · Settings PDP Gallery & Details",
    links: [
      // 2 galleries × 3 details placements, listed gallery by gallery (A, B, C keep their launch URLs).
      ...(["A", "B", "D", "E", "F", "C"] as const).map((id) => ({
        label: `Variant ${id}: ${SETTING_PDP_VARIANTS[id].name}`,
        to: `/test-1/${id.toLowerCase()}`,
      })),
    ],
  },
  {
    test: "Test 3.1 · Stone Details: Quickview vs PDP",
    links: [
      { label: "Variant A: GLP tile opens the full Diamond PDP", to: "/test-3-quickview/a" },
      { label: "Variant B: GLP tile opens the Quickview (Full Details → PDP)", to: "/test-3-quickview/b" },
    ],
  },
  {
    test: "Test 3.2 · Stone Details: spec layout on the Diamond PDP",
    links: [
      { label: "Variant A: horizontal spec tiles", to: "/test-3-specs/a" },
      { label: "Variant B: vertical spec table", to: "/test-3-specs/b" },
    ],
  },
  {
    test: "Test 2 · Stone Preferences & Recommendations",
    links: [
      { label: "Variant A: carat first (size → ring price range)", to: "/test-2/a" },
      { label: "Variant B: budget first (budget → sizes in stock)", to: "/test-2/b" },
      { label: "Variant C: size + budget (size priced inside your budget)", to: "/test-2/c" },
    ],
  },
  {
    test: "Test 4 · Ring Personalization as a Separate Step",
    links: [
      { label: "Variant A: options on Ring Review", to: "/test-4/a" },
      { label: "Variant B: separate Finishing Touches step", to: "/test-4/b" },
    ],
  },
]

/** Unknown URLs: an empty page, so a participant who edits the URL doesn't land on another variant. */
export function Blank() {
  return <main className="min-h-svh bg-background" />
}

/** Index of prototypes (for the team, not shown to participants). */
export function Home() {
  // Opening a prototype from here starts a fresh build (clears choices from a previous run).
  const { resetAll } = useRingBuild()
  return (
    <main className="mx-auto flex max-w-2xl flex-col gap-8 px-margin py-16">
      <h1 className="type-h3 text-primary">DYO prototypes</h1>
      {PROTOTYPES.map((p) => (
        <section key={p.test} className="flex flex-col gap-3">
          <h2 className="type-label-xs text-muted-foreground">{p.test}</h2>
          <ul className="flex flex-col gap-2">
            {p.links.map((l) => (
              <li key={l.to}>
                <Link to={l.to} onClick={resetAll} className="text-sm leading-5 font-medium text-primary underline">
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ))}
    </main>
  )
}
