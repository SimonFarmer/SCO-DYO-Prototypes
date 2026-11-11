import { Link } from "react-router"
import { useRingBuild } from "@/state/ring-build"

const PROTOTYPES = [
  { test: "Test 4 · Ring Personalization as a Separate Step", links: [
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
