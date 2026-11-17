import { Link } from "react-router"
import { useRingBuild } from "@/state/ring-build"

const PROTOTYPES = [
  {
    test: "Engagement Ring PLP · DYO entry point",
    links: [
      { label: "Homepage: navigation entry point (start here)", to: "/shop" },
      { label: "PLP: all engagement rings (DYO step 1)", to: "/engagement-rings" },
      { label: "PLP: Level 3 landing (Classic)", to: "/engagement-rings/classic" },
      { label: "PLP: Shop by Budget preset (under $1,000)", to: "/engagement-rings?price=under-1000" },
      { label: "PLP: Ready to Ship", to: "/engagement-rings/ready-to-ship" },
    ],
  },
  {
    test: "Test 1 · Settings PDP Gallery & Details",
    links: [
      { label: "Variant A: long-scroll gallery, details drawer", to: "/test-1?variant=A" },
      { label: "Variant B: long-scroll gallery, 2-line teaser + drawer", to: "/test-1?variant=B" },
      { label: "Variant C: thumbnail gallery, details tabs below the CTA", to: "/test-1?variant=C" },
    ],
  },
  {
    test: "Test 2 · Stone Preferences & Recommendations",
    links: [
      { label: "Variant A: size selector → total ring price range", to: "/test-2?variant=A" },
      { label: "Variant B: total budget slider → available stone sizes", to: "/test-2?variant=B" },
      { label: "Variant C: size + budget together, with trade-off messaging", to: "/test-2?variant=C" },
    ],
  },
  {
    test: "Test 4 · Ring Personalization as a Separate Step",
    links: [
      { label: "Variant A: options on Ring Review", to: "/test-4?variant=A" },
      { label: "Variant B: separate Finishing Touches step", to: "/test-4?variant=B" },
    ],
  },
]

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
