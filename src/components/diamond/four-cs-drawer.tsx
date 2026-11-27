import { XIcon } from "@phosphor-icons/react"
import { Button } from "@/components/ui/button"
import { Sheet, SheetClose, SheetContent, SheetTitle } from "@/components/ui/sheet"

export type FourC = "carat" | "cut" | "color" | "clarity"

/** Copy from Figma "SCO Drop 3b – Customizer" 8291:114364 (PLP Filter Overlay, one per C). */
const FOUR_CS: Record<
  FourC,
  { title: string; question: string; body: string[]; closing: string }
> = {
  carat: {
    title: "Diamond Carat",
    question: "What does diamond carat mean?",
    body: [
      "Diamonds are sold by the carat (ct), which is a unit of weight, not size. One carat weighs 200 milligrams, the world standard since 1914. A carat is divided into 100 points, with one point corresponding to .01 carat.",
      "Two diamonds with the same carat weight can appear different in size depending on their cut. For example, oval and emerald-cut diamonds often appear larger than a round brilliant diamond of the same carat weight because they have a larger face-up appearance.",
    ],
    closing:
      "At Shane Co., we have the largest in-stock diamond selections, so you can compare different carat weights and diamond shapes side by side to find the look you love and the size that fits your budget.",
  },
  cut: {
    title: "Diamond Cut",
    question: "What does diamond cut mean?",
    body: [
      "Cut describes how well a diamond’s facets are angled and proportioned to reflect light. It’s the grade that most affects sparkle: brightness (white light reflected back to you), fire (flashes of color) and scintillation (the play of light as the diamond moves).",
      "Cut grades range from Excellent to Poor. A well-cut diamond can outshine one with higher color and clarity grades. GIA gives cut grades only to round brilliant diamonds; for other shapes, polish and symmetry grades are a good guide to how well the stone was cut.",
    ],
    closing:
      "At Shane Co., our Shane Classic cut is our highest cut grade, made for maximum sparkle and brilliance, and every diamond is hand-selected for quality by our expert team.",
  },
  color: {
    title: "Diamond Color",
    question: "What does diamond color mean?",
    body: [
      "Diamond color measures how colorless a diamond is. White diamonds are graded from D (colorless) to Z (light yellow or brown). Differences between neighboring grades are subtle, and often only visible when diamonds are compared side by side.",
      "D–F diamonds are colorless, and G–J diamonds are near-colorless and look white face up to most people. Your setting matters too: platinum and white gold show off whiter grades, while yellow and rose gold complement warmer ones.",
    ],
    closing:
      "At Shane Co., we hand-pick every diamond to be the highest quality in its grade, so you can choose the color that fits your setting and your budget with confidence.",
  },
  clarity: {
    title: "Diamond Clarity",
    question: "What does diamond clarity mean?",
    body: [
      "Clarity measures the tiny natural marks inside a diamond (inclusions) and on its surface (blemishes). Grades run from Flawless (FL) and Internally Flawless (IF), through VVS1–VVS2, VS1–VS2 and SI1–SI2, to Included (I1–I3).",
      "Many VS and SI diamonds look clean to the naked eye, so a lower clarity grade can let you put more of your budget toward size or color without a visible difference. Inclusions are also harder to spot in brilliant shapes, like round and oval, than in step cuts, like emerald and Asscher.",
    ],
    closing:
      "At Shane Co., we hand-pick every diamond to be among the prettiest in its grade, and you can see any stone up close with a loupe in our stores.",
  },
}

/**
 * 4Cs "Learn More" drawer, opened from a diamond filter's Learn More link (Figma 8291:114364).
 * Right-hand drawer on desktop; full-width on mobile, where it opens over the filter drawer.
 */
export function FourCsDrawer({ topic, open, onOpenChange }: { topic: FourC; open: boolean; onOpenChange: (open: boolean) => void }) {
  const c = FOUR_CS[topic]
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" showCloseButton={false} nestedOverlay className="gap-0 shadow-none data-[side=right]:border-l-0">
        <header className="flex shrink-0 items-start gap-6 bg-primary-foreground px-5 pt-6 md:px-10 md:pt-10">
          <SheetTitle className="flex-1 type-h4 font-medium text-primary">{c.title}</SheetTitle>
          <SheetClose render={<Button variant="ghost" size="icon-sm" aria-label={`Close ${c.title}`} />}>
            <XIcon className="size-5" />
          </SheetClose>
        </header>
        <div className="min-h-0 flex-1 overflow-y-auto bg-white">
          <div className="flex flex-col gap-8 p-5 md:p-10">
            <p className="text-base leading-none font-semibold text-foreground">{c.question}</p>
            <div className="flex flex-col gap-5 text-sm leading-5 text-foreground">
              {c.body.map((p) => (
                <p key={p}>{p}</p>
              ))}
              <p className="font-semibold">{c.closing}</p>
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}
