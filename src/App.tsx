import { BrowserRouter, Link, Route, Routes } from "react-router-dom"
import { DyoSettingPdp } from "@/pages/dyo-setting-pdp"
import { SETTING_PDP_VARIANTS } from "@/prototypes/setting-pdp-variants"

interface PrototypeTest {
  title: string
  note: string
  links: { href: string; label: string; summary: string; figma?: string }[]
}

const TESTS: PrototypeTest[] = [
  {
    title: "Test 1 · Settings PDP Gallery & Details",
    note: "DYO Step 1 — Timeless Solitaire. Same product and data in every variant.",
    links: Object.values(SETTING_PDP_VARIANTS).map((v) => ({
      href: `/dyo/setting?variant=${v.id}`,
      label: `${v.id} — ${v.name}`,
      summary: v.summary,
      figma: v.figma,
    })),
  },
]

function PrototypeIndex() {
  return (
    <main className="mx-auto flex max-w-3xl flex-col gap-10 px-margin py-14">
      <div className="flex flex-col gap-1">
        <p className="type-label-xs font-semibold text-muted-foreground">Shane Co. · Drop 3B</p>
        <h1 className="type-h2 font-medium text-primary">DYO Prototypes</h1>
      </div>
      {TESTS.map((test) => (
        <section key={test.title} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <h2 className="type-h4 font-medium text-primary">{test.title}</h2>
            <p className="type-caption text-muted-foreground">{test.note}</p>
          </div>
          <ul className="flex flex-col border-t border-border-subtle">
            {test.links.map((link) => (
              <li key={link.href} className="flex items-start gap-4 border-b border-border-subtle py-4">
                <Link to={link.href} className="flex flex-1 flex-col gap-1 hover:underline">
                  <span className="text-base font-semibold text-primary">{link.label}</span>
                  <span className="type-caption text-muted-foreground">{link.summary}</span>
                  <span className="type-caption text-muted-foreground">{link.href}</span>
                </Link>
                {link.figma && (
                  <a href={link.figma} target="_blank" rel="noreferrer" className="type-label-xs font-semibold text-primary underline">
                    Figma
                  </a>
                )}
              </li>
            ))}
          </ul>
        </section>
      ))}
    </main>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<PrototypeIndex />} />
        <Route path="/dyo/setting" element={<DyoSettingPdp />} />
      </Routes>
    </BrowserRouter>
  )
}
