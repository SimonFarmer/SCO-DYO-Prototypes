import { forwardRef } from "react"
import { CaretRight } from "@phosphor-icons/react"
import { Button } from "@/components/ui/button"
import { SectionHeading } from "@/components/shared/section-heading"
import { UGC_PHOTOS, VALUE_PROPS, galleryFor, type MetalId, type Setting } from "@/data/products"
import { ProductOverview } from "@/components/pdp/product-info"
import { useNotInTest } from "@/components/prototype/not-in-test"

/** "About this setting" — description + detail rows, lifestyle image on the right. */
export const ProductDetailsBlock = forwardRef<HTMLElement, { setting: Setting; metal: MetalId }>(function ProductDetailsBlock(
  { setting, metal },
  ref,
) {
  const notInTest = useNotInTest()
  // Last styled/on-hand shot of the selected metal (the gallery ends with the shared size guide).
  const lifestyle = galleryFor(setting, metal).filter((m) => m.kind === "image").at(-1)
  return (
    <section ref={ref} id="product-details" className="scroll-mt-4 bg-secondary px-margin py-14">
      <div className="grid gap-8 lg:grid-cols-[762fr_542fr] lg:gap-2">
        <div className="flex flex-col gap-6 lg:pt-14 lg:pr-16">
          <SectionHeading eyebrow="About this setting" title={setting.name} />
          <ProductOverview setting={setting} metal={metal} className="max-w-2xl text-base" />
          <ul className="max-w-2xl">
            {setting.detailSections.map((label, i, all) => (
              <li key={label} className={i < all.length - 1 ? "border-b border-border-subtle" : undefined}>
                {/* Opening a details drawer is out of this prototype's scope (Test 1 compares detail variants separately). */}
                <button type="button" onClick={() => notInTest(label)} className="flex w-full items-center gap-4 py-4 text-left">
                  <span className="flex-1 truncate text-sm leading-none font-medium text-foreground">{label}</span>
                  <CaretRight className="size-4 text-primary" />
                </button>
              </li>
            ))}
          </ul>
        </div>
        <img
          src={lifestyle?.src}
          alt={lifestyle?.alt ?? ""}
          className="aspect-square w-full object-cover"
          loading="lazy"
        />
      </div>
    </section>
  )
})

/** "How We Do Right by You" value-prop rail — bleeds off the right edge. */
export function ValuePropsBlock() {
  const notInTest = useNotInTest()
  return (
    <section className="flex flex-col gap-8 bg-secondary pb-14 pl-margin">
      <SectionHeading eyebrow="We are more than a jeweler" title="How We Do Right by You" className="pr-margin" />
      <div className="flex snap-x gap-card-gap overflow-x-auto pr-margin [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {VALUE_PROPS.map((card) => (
          <article key={card.title.join(" ")} className="flex w-card shrink-0 snap-start flex-col overflow-clip">
            <img
              src={card.image}
              alt=""
              className="aspect-video w-full object-cover"
              style={{ objectPosition: card.position }}
              loading="lazy"
            />
            <div className="flex flex-1 flex-col justify-between gap-4 bg-background p-5">
              <h3 className="h-16 type-h4 font-medium text-primary">
                {card.title[0]}
                <br />
                {card.title[1]}
              </h3>
              <a
                href="#"
                onClick={(e) => {
                  e.preventDefault()
                  notInTest(card.cta)
                }}
                className="w-fit type-label-xs leading-5 font-semibold text-primary underline"
              >
                {card.cta}
              </a>
            </div>
          </article>
        ))}
      </div>
    </section>
  )
}

/** Next-step teaser: image + "Our Diamonds & Gemstones" + CTA. */
export function FeatureBlock() {
  const notInTest = useNotInTest()
  return (
    <section className="bg-primary-foreground px-margin py-14">
      <div className="grid gap-8 lg:grid-cols-[542fr_762fr] lg:gap-2">
        <img
          src="/images/feature-block/diamonds-loupe.jpg"
          alt="Diamonds under a jeweler's loupe"
          className="aspect-square w-full object-cover"
          loading="lazy"
        />
        <div className="flex flex-col justify-center gap-8 lg:pl-16">
          <div className="flex max-w-2xl flex-col gap-6 text-primary">
            <div className="flex flex-col gap-2">
              <p className="type-label-xs font-semibold">Next: Step 2</p>
              <h2 className="type-h3 font-medium">Our Diamonds &amp; Gemstones</h2>
            </div>
            <p className="text-base">
              From lab grown to natural, the 4Cs to certification — everything you need to shop with confidence.
            </p>
          </div>
          <Button className="w-fit px-14" onClick={() => notInTest("The diamond guide")}>
            Read The Guide
          </Button>
        </div>
      </div>
    </section>
  )
}

/** "As Seen on You" user-generated photo row. */
export function UgcBlock() {
  const notInTest = useNotInTest()
  return (
    <section className="flex flex-col bg-secondary px-margin py-14">
      <div className="flex w-full flex-col gap-8">
        <SectionHeading eyebrow="As Seen on You" title="#ShaneCo" />
        <div className="grid grid-cols-2 gap-2.5 lg:grid-cols-4">
          {UGC_PHOTOS.map((photo) => (
            <a key={photo.src} href="#" onClick={(e) => {
              e.preventDefault()
              notInTest("Customer photos")
            }} className="relative aspect-square overflow-clip bg-opacity-50">
              <img src={photo.src} alt={photo.alt} className="size-full object-cover" loading="lazy" />
              <img src="/images/ugc/instagram-badge.svg" alt="" className="absolute top-1 right-1 size-5" />
            </a>
          ))}
        </div>
      </div>
    </section>
  )
}
