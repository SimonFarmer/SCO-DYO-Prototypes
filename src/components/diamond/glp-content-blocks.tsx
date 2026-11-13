import { useState } from "react"
import { CalendarDotsIcon, ChatIcon, PhoneIcon } from "@phosphor-icons/react"
import { useNotInTest } from "@/components/prototype/not-in-test"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

/*
 * Content below the Natural Diamonds GLP grid (Figma 7375:125910 → “Section” 7218:221397):
 * SEO intro, FAQ, Need Help, Related Articles, Related Categories. None of it is part of the
 * test, so links show the “not part of this test” notice.
 */

/** Accordion trigger styled to the Pattern Library (14px medium label, 24px caret, input-colour rule). */
const triggerClass =
  "items-center py-4 font-sans text-foreground hover:no-underline **:data-[slot=accordion-trigger-icon]:size-6 **:data-[slot=accordion-trigger-icon]:text-primary"
const itemClass = "border-b border-border-subtle"

/** “Natural Diamonds at Shane Co.” — full-bleed photo with a dark gradient and clamped copy. */
export function SeoIntroBlock() {
  const [expanded, setExpanded] = useState(false)
  return (
    <section className="relative flex flex-col justify-end overflow-clip px-margin py-14 lg:min-h-152">
      <img src="/images/diamonds/seo-hero.jpg" alt="" loading="lazy" className="absolute inset-0 size-full object-cover" />
      <span aria-hidden className="absolute inset-0 bg-linear-to-b from-black/20 to-black/60" />
      <div className="relative flex max-w-2xl flex-col gap-6 text-primary-foreground">
        <h2 className="type-h3 font-medium">Natural Diamonds at Shane Co.</h2>
        {/* Paragraph spacing via margins: line-clamp switches the box to -webkit-box, which drops flex gaps. */}
        <div className={cn("text-sm [&>p+p]:mt-5", !expanded && "line-clamp-6")}>
          <p>
            Searching for the perfect loose diamond to add to your favorite setting? Shane Co. offers high-quality, GIA-certified
            loose diamonds in a variety of shapes and sizes. Choose Shane Co. loose diamonds to use in your favorite jewelry
            pieces.
          </p>
          <p>
            At Shane Co. we’ve been experts in the diamond business since 1929. This means we know diamonds better than anyone
            else. But most importantly, there’s always transparency and integrity in everything we do. So no matter what diamond
            you choose, with Shane Co. you can always be sure you’re getting the most beautiful stone at the best value. As your
            friend, we promise that all of our diamonds, no matter if they’re natural or lab-grown, are: conflict-free and
            ethically sourced, sourced directly from our vendors, hand-selected for quality by our expert team, hand-matched for
            consistency, cut to the highest standards, covered by our Free Lifetime Warranty, eligible for upgrades, available in
            a huge range of shapes and carat weights, and available in our stores, where you can use a loupe to look at them up
            close like our master jewelers.
          </p>
          <p>
            We offer an incredible selection of diamond shapes — round, pear, cushion cut, emerald cut, and more — in a wide range
            of carat weights, from 1 carat all the way to 5 carats.
          </p>
        </div>
        <Button
          variant="link"
          className="h-auto w-fit px-0 text-primary-foreground"
          aria-expanded={expanded}
          onClick={() => setExpanded((e) => !e)}
        >
          {expanded ? "Read Less" : "Read More"}
        </Button>
      </div>
    </section>
  )
}

const FAQS = [
  {
    q: "What is considered fine jewelry?",
    a: "Fine jewelry is crafted from high-quality materials like silver, gold, and platinum, often adorned with colorful gemstones and diamonds, ensuring durability for a lifetime.",
  },
  {
    q: "What should I look for when buying fine jewelry?",
    a: "Look at the quality of the metal and stones, how securely the stones are set, and the jeweler’s warranty. For diamonds, a grading report from an independent lab such as the GIA confirms the 4Cs.",
  },
  {
    q: "What is the difference between fine jewelry and costume jewelry?",
    a: "Fine jewelry uses precious metals and genuine gemstones and is made to last for generations. Costume jewelry uses base metals, plating and simulated stones, so it wears and tarnishes over time.",
  },
  {
    q: "Can I wear fine jewelry every day?",
    a: "Yes. Gold and platinum are made for everyday wear. Take rings off for heavy work, the gym or swimming, and bring them in for a free cleaning and inspection every six months.",
  },
  {
    q: "How long does it take to get an engagement ring?",
    a: "Most Design Your Own rings are set by our jewelers and ship within 5–7 business days. Ready-to-ship rings leave the next business day.",
  },
  {
    q: "Are Shane Co. natural diamonds certified?",
    a: "Yes. Every natural diamond we sell comes with a grading report from the Gemological Institute of America (GIA), so you know exactly what you’re buying.",
  },
  {
    q: "Which of the 4Cs matters most?",
    a: "Cut has the biggest effect on sparkle, so we suggest prioritizing it. Many people then balance color and clarity to get a larger carat weight within their budget.",
  },
  {
    q: "What is the difference between natural and lab-grown diamonds?",
    a: "Both are real diamonds with the same chemical and optical properties. Natural diamonds formed in the earth over billions of years; lab-grown diamonds are created in weeks and cost less.",
  },
  {
    q: "Can I see a diamond in person before I buy?",
    a: "Yes. Book an in-store or online appointment and a jewelry consultant will show you the stones you’re considering, side by side under a loupe.",
  },
  {
    q: "What is the Lifetime Diamond Upgrade?",
    a: "When you’re ready for a bigger diamond, trade in a Shane Co. diamond and receive its full original purchase price toward one that costs at least twice as much.",
  },
]

/** FAQ accordion (first item open, as in Figma). */
export function FaqBlock() {
  return (
    <section className="flex flex-col items-center bg-secondary px-margin py-14">
      {/* Figma: 1092px content column — closest max-width token is max-w-6xl (1152px). */}
      <div className="flex w-full max-w-6xl flex-col gap-4">
        <h2 className="type-h3 font-medium text-primary">FAQ</h2>
        <Accordion defaultValue={[FAQS[0].q]}>
          {FAQS.map((faq) => (
            <AccordionItem key={faq.q} value={faq.q} className={itemClass}>
              <AccordionTrigger className={triggerClass}>{faq.q}</AccordionTrigger>
              <AccordionContent className="pb-5 text-sm text-foreground lg:pr-36">{faq.a}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  )
}

/** “Need a Little Extra Help?” — copy left, contact links right, in a white panel. */
export function NeedHelpBlock() {
  const notInTest = useNotInTest()
  const links = [
    { icon: ChatIcon, label: "Chat with a Jewelry Consultant" },
    { icon: CalendarDotsIcon, label: "Schedule an in-store or online appointment" },
    { icon: PhoneIcon, label: "(866) 467-4263" },
  ]
  return (
    <section className="bg-secondary px-margin">
      {/* Figma: 110px side padding — closest token is px-28 (112px). */}
      <div className="flex flex-col gap-8 bg-primary-foreground px-6 py-14 lg:flex-row lg:items-center lg:justify-between lg:px-28">
        <div className="flex max-w-guided-intent flex-1 flex-col gap-4">
          <h2 className="type-h3 font-medium text-primary">Need a Little Extra Help?</h2>
          <p className="text-sm text-muted-foreground">Our knowledgeable and friendly team is here for you!</p>
        </div>
        <ul className="flex max-w-guided-intent flex-1 flex-col gap-4 lg:min-w-80">
          {links.map(({ icon: Icon, label }) => (
            <li key={label}>
              <button
                type="button"
                onClick={() => notInTest(label === "(866) 467-4263" ? "Calling" : label)}
                className="flex cursor-pointer items-center gap-2 type-label-xs font-semibold text-primary underline"
              >
                <Icon className="size-4" />
                {label}
              </button>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}

const ARTICLES = [
  {
    title: "Diamonds 101",
    text: "Shopping for a diamond? You’ve probably heard of the 4Cs, cut, color, clarity, and carat, the universal standard for grading diamonds.",
    image: "/images/diamonds/articles/diamonds-101.png",
    position: "object-center",
  },
  {
    title: "Colored Gems 101",
    text: "Learn more about our most vibrant stones — sapphires, rubies and gemstones.",
    image: "/images/diamonds/articles/colored-gems-101.png",
    position: "object-center",
  },
  {
    title: "Birthstones by Month",
    text: "Explore our wide selection of beautiful, hand-selected birthstones.",
    image: "/images/diamonds/articles/birthstones.png",
    // Figma crops this wide photo a quarter of the way in from the left.
    position: "object-[25%_50%]",
  },
  {
    title: "Free Lifetime Warranty",
    text: "We make quality that lasts a lifetime and stand behind the quality for life. That’s been the Shane family’s promise for four generations, and it’s why we give you a Free Lifetime Warranty.",
    image: "/images/diamonds/articles/lifetime-warranty.png",
    position: "object-center",
  },
]

/** “Explore Related Articles” — four square-image cards. */
export function RelatedArticlesBlock() {
  const notInTest = useNotInTest()
  return (
    <section className="flex flex-col gap-10 bg-secondary px-margin py-14">
      <h2 className="type-h3 font-medium text-primary">Explore Related Articles</h2>
      <div className="grid gap-2.5 md:grid-cols-2 lg:grid-cols-4">
        {ARTICLES.map((a) => (
          <article key={a.title} className="flex flex-col overflow-clip">
            <img src={a.image} alt="" loading="lazy" className={cn("aspect-square w-full object-cover", a.position)} />
            <div className="flex flex-1 flex-col gap-4 bg-background p-5">
              <div className="flex min-h-28 flex-col gap-3">
                <h3 className="type-h4 font-medium text-primary">{a.title}</h3>
                <p className="line-clamp-3 text-sm text-muted-foreground">{a.text}</p>
              </div>
              <Button variant="link" className="h-auto w-fit px-0" onClick={() => notInTest(a.title)}>
                Read More
              </Button>
            </div>
          </article>
        ))}
      </div>
    </section>
  )
}

const CATEGORIES = [
  {
    title: "Explore Our Natural Diamonds",
    chips: [
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
  {
    title: "Explore Our Lab-Grown Diamonds",
    chips: ["Loose Lab-Grown Diamonds", "Lab-Grown Engagement Rings", "Lab-Grown Wedding Rings", "Lab-Grown Stud Earrings", "Lab-Grown Tennis Bracelets"],
  },
  {
    title: "Explore Our Gemstones",
    chips: ["Sapphires", "Rubies", "Emeralds", "Morganite", "Aquamarine", "Birthstone Jewelry"],
  },
  {
    title: "Learn More About Our Diamonds",
    chips: ["The 4Cs", "Diamond Shapes", "Natural vs Lab-Grown", "GIA Certification", "Lifetime Diamond Upgrade", "Diamond Care"],
  },
]

/** “Related Categories” — accordion of chip links (first group open, as in Figma). */
export function RelatedCategoriesBlock() {
  const notInTest = useNotInTest()
  return (
    <section className="flex flex-col items-center bg-secondary px-margin py-14">
      <div className="flex w-full max-w-6xl flex-col gap-4">
        <h2 className="type-h3 font-medium text-primary">Related Categories</h2>
        <Accordion defaultValue={[CATEGORIES[0].title]}>
          {CATEGORIES.map((group) => (
            <AccordionItem key={group.title} value={group.title} className={itemClass}>
              <AccordionTrigger className={triggerClass}>{group.title}</AccordionTrigger>
              <AccordionContent className="pb-5">
                <div className="flex flex-wrap gap-2">
                  {group.chips.map((chip) => (
                    <Button key={chip} variant="outline" className="h-10 rounded-full bg-transparent px-5" onClick={() => notInTest(chip)}>
                      {chip}
                    </Button>
                  ))}
                </div>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  )
}
