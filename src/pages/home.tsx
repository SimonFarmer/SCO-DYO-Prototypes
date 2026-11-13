import { Link } from "react-router"
import { useRingBuild } from "@/state/ring-build"

const PROTOTYPES = [
  {
    test: "Test 1 · Settings PDP Gallery & Details",
    links: [
      { label: "Variant A: long-scroll gallery, details drawer", to: "/test-1/a" },
      { label: "Variant B: long-scroll gallery, 2-line teaser + drawer", to: "/test-1/b" },
      { label: "Variant C: thumbnail gallery, details tabs below the CTA", to: "/test-1/c" },
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
  { test: "Test 4 · Ring Personalization as a Separate Step", links: [{ label: "Variant A: options on Ring Review", to: "/test-4/a" }] },
]

/** Unlisted path of the team index (not linked from anywhere, so participants can't reach other variants). */
export const TEAM_INDEX_PATH = "/team-7k2p9"

/** Root and unknown URLs: an empty page, so a participant who edits the URL doesn't find the other variants. */
export function Blank() {
  return <main className="min-h-svh bg-background" />
}

/** Index of prototypes (for the team, not shown to participants). */
export function Home() {
  // Opening a prototype from here starts a fresh build (clears choices from a previous run).
  const { reset } = useRingBuild()
  return (
    <main className="mx-auto flex max-w-2xl flex-col gap-8 px-margin py-16">
      <h1 className="type-h3 text-primary">DYO prototypes</h1>
      {PROTOTYPES.map((p) => (
        <section key={p.test} className="flex flex-col gap-3">
          <h2 className="type-label-xs text-muted-foreground">{p.test}</h2>
          <ul className="flex flex-col gap-2">
            {p.links.map((l) => (
              <li key={l.to}>
                <Link to={l.to} onClick={reset} className="text-sm leading-5 font-medium text-primary underline">
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
