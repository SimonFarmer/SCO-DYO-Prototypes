import { forwardRef } from "react"
import { CaretRightIcon, PlayIcon } from "@phosphor-icons/react"
import { useNotInTest } from "@/components/prototype/not-in-test"
import { ProfileDiagram, TopDiagram } from "@/components/diamond/diamond-diagrams"
import { SectionHeading } from "@/components/shared/section-heading"
import { Button } from "@/components/ui/button"
import { DIAMOND_IMAGE, diamondName, expertTake, fourCs, type Diamond } from "@/data/diamonds"
import { cn } from "@/lib/utils"

/** 2-column media grid (Figma 7375:134706): 360° video, top view, size guide, At the Source, diagrams. */
export function DiamondGallery({ diamond }: { diamond: Diamond }) {
  const notInTest = useNotInTest()
  const tile = "relative aspect-square overflow-clip bg-secondary"
  return (
    <div className="grid grid-cols-2 gap-2">
      <div className={tile}>
        <img src="/images/diamonds/side-view.png" alt={`${diamond.carat.toFixed(2)} ct diamond, side view`} className="size-full object-cover" />
        {/* Figma badge text is 10px; closest type token is text-xxs (11px). */}
        <span className="absolute top-3 left-3 flex h-5 items-center bg-primary px-2 text-xxs leading-3 font-semibold tracking-[1px] text-primary-foreground uppercase">
          360° Video
        </span>
        <button
          type="button"
          aria-label="Play 360° video"
          onClick={() => notInTest("The 360° video")}
          className="absolute top-1/2 left-1/2 flex size-14 -translate-1/2 cursor-pointer items-center justify-center rounded-full bg-primary text-primary-foreground"
        >
          <PlayIcon className="size-4" />
        </button>
      </div>
      <div className={tile}>
        <img src={DIAMOND_IMAGE} alt={`${diamond.carat.toFixed(2)} ct diamond, top view`} className="size-full object-cover" />
      </div>
      <div className={tile}>
        <img src="/images/diamonds/size-guide.png" alt="Size guide: carat sizes on a hand" className="size-full object-cover" />
      </div>
      <div className={tile}>
        <img src="/images/diamonds/at-the-source.png" alt="At the Source: we work directly with our diamond partners" className="size-full object-cover object-bottom" />
      </div>
      <ProfileDiagram diamond={diamond} className="w-full" />
      <TopDiagram diamond={diamond} className="w-full" />
    </div>
  )
}

/** Segmented grade meter (6px bars, 3px gaps). */
function Meter({ level, segments }: { level: number; segments: number }) {
  return (
    <div className="flex gap-0.75" role="img" aria-label={`${level} of ${segments}`}>
      {Array.from({ length: segments }, (_, i) => (
        <span key={i} className={cn("h-1.5 flex-1", i < level ? "bg-primary" : "bg-muted")} />
      ))}
    </div>
  )
}

/** “The Four C’s of Your Diamond” report card (Figma 7225:269603, Option B). Below the fold. */
export function FourCsReportCard({ diamond }: { diamond: Diamond }) {
  const notInTest = useNotInTest()
  const take = expertTake(diamond)
  return (
    <section className="flex flex-col gap-6 bg-secondary px-margin py-14" aria-labelledby="four-cs">
      <div className="flex flex-col gap-2">
        <p className="type-label-xs font-semibold text-muted-foreground">
          {diamondName(diamond)} · {diamond.carat.toFixed(2)} ct
        </p>
        <h2 id="four-cs" className="type-h3 font-medium text-primary">
          The Four C’s of Your Diamond
        </h2>
      </div>
      <div className="grid gap-2 md:grid-cols-2 lg:grid-cols-4">
        {fourCs(diamond).map((c) => (
          <article key={c.key} className="flex flex-col gap-4 bg-card p-6">
            <div className="flex flex-col gap-1.5">
              <p className="type-label-xs font-semibold text-muted-foreground">{c.label}</p>
              <p className="type-h3 font-medium text-primary">{c.value}</p>
            </div>
            <Meter level={c.level} segments={c.segments} />
            <p className="text-xs font-medium text-primary">{c.summary}</p>
            <span aria-hidden className="h-px bg-muted" />
            {/* Figma: 11px regular, 1.2 line height — closest tokens text-xxs / leading-4. */}
            <div className="text-xxs leading-4 text-muted-foreground">
              {c.definition.map((line) => (
                <p key={line}>{line}</p>
              ))}
            </div>
          </article>
        ))}
      </div>
      <div className="flex flex-col gap-6 bg-card p-6 lg:flex-row lg:items-center lg:gap-8">
        {[
          { title: "Where it shines", items: take.shines },
          { title: "What to know", items: take.know },
        ].map((col) => (
          <div key={col.title} className="flex flex-1 flex-col gap-2.5">
            <p className="type-label-xs font-semibold text-primary">{col.title}</p>
            <ul className="text-xs leading-5 text-muted-foreground">
              {col.items.map((item) => (
                <li key={item}>•&nbsp;&nbsp;{item}</li>
              ))}
            </ul>
          </div>
        ))}
        <Button size="sm" className="w-fit" onClick={() => notInTest("Asking a diamond expert")}>
          Ask a diamond expert
        </Button>
      </div>
    </section>
  )
}

const DETAIL_ROWS = ["Diamond Details", "Grading Certificate", "Lifetime Diamond Upgrade"]

/** “About this diamond” (Figma 7375:134967): copy + detail rows, stone image on the right. */
export const AboutDiamondBlock = forwardRef<HTMLElement, { diamond: Diamond }>(function AboutDiamondBlock({ diamond }, ref) {
  const notInTest = useNotInTest()
  return (
    <section ref={ref} id="product-details" className="scroll-mt-4 bg-secondary px-margin py-14">
      <div className="grid gap-8 lg:grid-cols-[762fr_542fr] lg:gap-2">
        <div className="flex flex-col gap-6 lg:pt-14 lg:pr-16">
          <SectionHeading eyebrow="About this diamond" title={diamondName(diamond)} />
          <p className="max-w-2xl text-base text-primary">
            A {diamond.carat.toFixed(2)} carat round brilliant, graded {diamond.color} color and {diamond.clarity} clarity with {/^[AEIOU]/.test(diamond.cut) ? "an" : "a"}{" "}
            {diamond.cut} cut by the GIA. Hand-selected by our buyers and sourced directly from our diamond partners, it comes
            with its grading certificate and our Lifetime Diamond Upgrade.
          </p>
          <ul className="max-w-2xl">
            {DETAIL_ROWS.map((label, i) => (
              <li key={label} className={i < DETAIL_ROWS.length - 1 ? "border-b border-border-subtle" : undefined}>
                <button type="button" onClick={() => notInTest(label)} className="flex w-full cursor-pointer items-center gap-4 py-4 text-left">
                  <span className="flex-1 truncate text-sm leading-none font-medium text-foreground">{label}</span>
                  <CaretRightIcon className="size-4 text-primary" />
                </button>
              </li>
            ))}
          </ul>
        </div>
        <img src={DIAMOND_IMAGE} alt="" className="aspect-square w-full object-cover" loading="lazy" />
      </div>
    </section>
  )
})
