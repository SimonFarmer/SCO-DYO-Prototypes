import { forwardRef } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { METALS, descriptionFor, highlightsFor, type MetalId, type Setting } from "@/data/products"
import { cn } from "@/lib/utils"

export type ProductInfoTab = "overview" | "specifications"

/** Specifications rows; "Metal Type" follows the selected metal. */
export function specsFor(setting: Setting, metal: MetalId) {
  return [{ label: "Metal Type", value: METALS[metal].label }, ...setting.specs]
}

export function SpecRow({ label, value, last }: { label: string; value: string; last?: boolean }) {
  return (
    <div className={cn("flex min-h-12 items-start gap-4 px-3 py-3.5 text-sm", !last && "border-b border-border-subtle")}>
      <dt className="flex-1 font-semibold text-foreground">{label}</dt>
      <dd className="flex-1 text-right font-medium text-primary">{value}</dd>
    </div>
  )
}

export function SpecList({ setting, metal }: { setting: Setting; metal: MetalId }) {
  const specs = specsFor(setting, metal)
  return (
    <dl>
      {specs.map((s, i) => (
        <SpecRow key={s.label} label={s.label} value={s.value} last={i === specs.length - 1} />
      ))}
    </dl>
  )
}

/**
 * Overview copy: description, then the key facts as a list (as on shaneco.com).
 * The stone-fit line ("Best fits up to…") lives here, so every details variant shows the same text.
 */
export function ProductOverview({ setting, metal, className }: { setting: Setting; metal: MetalId; className?: string }) {
  return (
    <div className={cn("flex flex-col gap-4 text-sm text-primary", className)}>
      <p>{descriptionFor(setting, metal)}</p>
      <ul className="flex list-disc flex-col gap-1 pl-5">
        {highlightsFor(setting, metal).map((h) => (
          <li key={h}>{h}</li>
        ))}
      </ul>
    </div>
  )
}

interface InlineProductDetailsProps {
  setting: Setting
  metal: MetalId
  tab: ProductInfoTab
  onTabChange: (tab: ProductInfoTab) => void
}

/**
 * Overview / Specifications tabs inside the buy form (Figma 7336:190340).
 * Test 1, details variant C: "View product details" scrolls here instead of opening the drawer.
 */
export const InlineProductDetails = forwardRef<HTMLDivElement, InlineProductDetailsProps>(function InlineProductDetails(
  { setting, metal, tab, onTabChange },
  ref,
) {
  return (
    <div ref={ref} id="product-info" className="scroll-mt-5">
      <Tabs value={tab} onValueChange={(v) => onTabChange(v as ProductInfoTab)} className="gap-6">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="specifications">Specifications</TabsTrigger>
        </TabsList>
        <TabsContent value="overview">
          <ProductOverview setting={setting} metal={metal} />
        </TabsContent>
        <TabsContent value="specifications">
          <SpecList setting={setting} metal={metal} />
        </TabsContent>
      </Tabs>
    </div>
  )
})
