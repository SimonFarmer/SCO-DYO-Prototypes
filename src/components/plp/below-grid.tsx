import { useState } from "react"
import { CalendarBlankIcon, ChatTextIcon, PhoneIcon } from "@phosphor-icons/react"
import { useNavigate } from "react-router"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Button } from "@/components/ui/button"
import { useNotInTest } from "@/components/prototype/not-in-test"
import { ProductCarousel } from "@/components/shared/product-carousel"
import { RECENTLY_VIEWED } from "@/data/products"
import { RTS_PATH } from "@/data/plp"
import { cn, PAGE_MAX } from "@/lib/utils"

const FAQ = [
  {
    q: "What is considered fine jewelry?",
    a: "Fine jewelry is crafted from high-quality materials like silver, gold, and platinum, often adorned with colorful gemstones and diamonds, ensuring durability for a lifetime.",
  },
  {
    q: "How does Design Your Own work?",
    a: "Choose a setting, then a diamond or gemstone that fits it, and finish with your ring size and any personal touches. Our jewelers set the stone for you.",
  },
  {
    q: "Can I see a setting in store before I buy?",
    a: "Yes. Use the In-Store Today filter to see settings available at your store today, then book an appointment or drop in.",
  },
  {
    q: "What is the difference between a setting and a ready to ship ring?",
    a: "A setting is the ring without its center stone, so you choose the stone yourself. Ready to ship rings come with the center stone already set.",
  },
  {
    q: "How long does it take to get an engagement ring?",
    a: "Most custom rings are ready in 5–7 business days. Ready to ship rings can be delivered the same day or collected in store.",
  },
]

const ARTICLES = [
  { title: "Diamonds 101", copy: "Shopping for a diamond? You’ve probably heard of the 4Cs, cut, color, clarity, and carat, the universal standard for grading diamonds.", image: "/images/plp/content/article-diamonds-101.jpg" },
  { title: "Choosing Your Setting", copy: "From classic solitaires to vintage halos: how to pick the setting that suits their style and your stone.", image: "/images/plp/content/article-consultation.jpg" },
  { title: "Diamond Stud Earrings", copy: "Explore our wide selection of beautiful, hand-selected diamond studs. ", image: "/images/plp/content/article-earrings.jpg" },
  { title: "Free Lifetime Warranty", copy: "We make quality that lasts a lifetime and stand behind the quality for life. That’s been the Shane family’s promise for four generations, and it’s why we give you a Free Lifetime Warranty.", image: "/images/plp/content/article-proposal.jpg" },
]

const RELATED = [
  {
    heading: "Explore Our Natural Diamonds",
    links: [
      "Loose Natural Diamonds",
      "All Diamond Jewelry",
      "Engagement Rings with Diamond Accents",
      "Ready to Ship Diamond Engagement Rings",
      "Diamond Wedding Rings",
      "Diamond Stud Earrings",
      "Diamond Rings",
      "Diamond Necklaces",
      "Diamond Chain Necklaces",
    ],
  },
  { heading: "Explore Our Lab-Grown Diamonds", links: ["Loose Lab-Grown Diamonds", "Lab-Grown Engagement Rings", "Lab-Grown Diamond Jewelry"] },
  { heading: "Explore Our Gemstones", links: ["Sapphire Engagement Rings", "Loose Gemstones", "Birthstone Jewelry"] },
  { heading: "Learn More About Our Diamonds", links: ["Diamond Buying Guide", "The 4Cs", "Diamond Shapes"] },
]

const sectionTitle = "type-h3 text-primary"

function NaturalDiamonds({ contained }: { contained: boolean }) {
  const [more, setMore] = useState(false)
  return (
    <section className={cn("relative isolate flex min-h-152 items-end overflow-hidden py-12 text-primary-foreground lg:items-center", !contained && "px-margin")}>
      {/* With `contained`, the photo stays full bleed and the copy lines up with the 1680px page edge. */}
      <div className={cn(contained && ["px-margin", PAGE_MAX])}>
      <img src="/images/plp/content/natural-diamonds.jpg" alt="" loading="lazy" className="absolute inset-0 -z-20 size-full object-cover" />
      <div aria-hidden className="absolute inset-0 -z-10 bg-linear-to-t from-black/70 via-black/30 to-transparent lg:bg-linear-to-r" />
      <div className="flex max-w-2xl flex-col items-start gap-4">
        <h2 className="type-h3">Natural Diamonds at Shane Co.</h2>
        <div className={cn("flex flex-col gap-4 text-sm leading-5", !more && "line-clamp-5")}>
          <p>
            Searching for the perfect loose diamond to add to your favorite setting? Shane Co. offers high-quality,
            GIA-certified loose diamonds in a variety of shapes and sizes. Choose Shane Co. loose diamonds to use in your
            favorite jewelry pieces.
          </p>
          <p>
            At Shane Co. we’ve been experts in the diamond business since 1929. This means we know diamonds better than
            anyone else. But most importantly, there’s always transparency and integrity in everything we do.
          </p>
        </div>
        <Button variant="link" className="text-primary-foreground" onClick={() => setMore((m) => !m)}>
          {more ? "Read Less" : "Read More"}
        </Button>
      </div>
      </div>
    </section>
  )
}

/**
 * Content below the PLP grid. `contained` (Test 2 PLP) caps the full-width sections at the 1680px page
 * width while their backgrounds still run edge to edge; without it they're unchanged.
 */
export function BelowGridContent({ contained = false }: { contained?: boolean } = {}) {
  const notInTest = useNotInTest()
  const navigate = useNavigate()

  return (
    <div className="flex flex-col bg-secondary">
      <NaturalDiamonds contained={contained} />

      <section className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-margin py-14">
        <h2 className={sectionTitle}>FAQ</h2>
        <Accordion defaultValue={[FAQ[0].q]}>
          {FAQ.map((f) => (
            <AccordionItem key={f.q} value={f.q} className="border-b border-border-subtle">
              <AccordionTrigger className="items-center font-sans py-4 text-sm font-medium text-primary hover:no-underline">{f.q}</AccordionTrigger>
              <AccordionContent className="max-w-3xl pb-4 text-sm leading-5 text-muted-foreground">{f.a}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </section>

      <section className="px-margin">
        <div className="mx-auto flex max-w-7xl flex-col gap-6 bg-background px-6 py-10 lg:flex-row lg:items-center lg:justify-between lg:px-14">
          <div className="flex flex-col gap-2">
            <h2 className={sectionTitle}>Need a Little Extra Help?</h2>
            <p className="text-sm leading-5 text-muted-foreground">Our knowledgeable and friendly team is here for you!</p>
          </div>
          <ul className="flex flex-col gap-3 lg:w-guided-intent">
            {[
              { label: "Chat with a Jewelry Consultant", icon: ChatTextIcon },
              { label: "Schedule an In-Store or Online Appointment", icon: CalendarBlankIcon },
              { label: "(866) 467-4263", icon: PhoneIcon },
            ].map(({ label, icon: IconCmp }) => (
              <li key={label}>
                <button type="button" onClick={() => notInTest(label)} className="flex cursor-pointer items-center gap-2 type-label-xs text-primary underline underline-offset-4">
                  <IconCmp className="size-4" />
                  {label}
                </button>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className={cn("flex flex-col gap-8 px-margin py-14", contained && PAGE_MAX)}>
        <h2 className={sectionTitle}>Explore Related Articles</h2>
        <ul className="-mr-margin flex snap-x gap-card-gap overflow-x-auto pr-margin [scrollbar-width:none] lg:mr-0 lg:grid lg:grid-cols-4 lg:pr-0">
          {ARTICLES.map((a) => (
            <li key={a.title} className="flex w-card shrink-0 snap-start flex-col bg-background lg:w-auto">
              <img src={a.image} alt="" loading="lazy" className="aspect-square w-full object-cover" />
              <div className="flex flex-1 flex-col items-start gap-3 p-5">
                <h3 className="type-h4 text-primary">{a.title}</h3>
                <p className="line-clamp-3 text-sm leading-5 text-muted-foreground">{a.copy}</p>
                <Button variant="link" className="mt-auto pt-2" onClick={() => notInTest(a.title)}>
                  Read More
                </Button>
              </div>
            </li>
          ))}
        </ul>
      </section>

      <section className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-margin pb-14">
        <h2 className={sectionTitle}>Related Categories</h2>
        <Accordion defaultValue={[RELATED[0].heading]}>
          {RELATED.map((r) => (
            <AccordionItem key={r.heading} value={r.heading} className="border-b border-border-subtle">
              <AccordionTrigger className="items-center font-sans py-4 text-sm font-medium text-primary hover:no-underline">{r.heading}</AccordionTrigger>
              <AccordionContent className="pb-5">
                <ul className="flex flex-wrap gap-2">
                  {r.links.map((l) => (
                    <li key={l}>
                      <button
                        type="button"
                        onClick={() => {
                          if (l === "Ready to Ship Diamond Engagement Rings") {
                            navigate(RTS_PATH)
                            window.scrollTo({ top: 0 })
                          } else notInTest(l)
                        }}
                        className="cursor-pointer rounded-full border border-border-subtle bg-background px-4 py-2.5 text-xxs leading-3 font-semibold tracking-[1px] text-primary uppercase hover:border-border"
                      >
                        {l}
                      </button>
                    </li>
                  ))}
                </ul>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </section>

      <ProductCarousel title="Pick Up Where You Left Off" products={RECENTLY_VIEWED} showWishlist className="border-t border-border-subtle" contained={contained} />
    </div>
  )
}
