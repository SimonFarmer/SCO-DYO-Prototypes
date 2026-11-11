import { X } from "@phosphor-icons/react"
import { Button } from "@/components/ui/button"
import { Sheet, SheetClose, SheetContent, SheetTitle } from "@/components/ui/sheet"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { SpecList, SpecRow, type ProductInfoTab } from "@/components/pdp/product-info"
import { descriptionFor, galleryFor, type MetalId, type Setting } from "@/data/products"

interface ProductInfoDrawerProps {
  setting: Setting
  metal: MetalId
  open: boolean
  onOpenChange: (open: boolean) => void
  tab: ProductInfoTab
  onTabChange: (tab: ProductInfoTab) => void
}

/**
 * "Product Info Overlay" (Figma 7342:118093) — right-hand drawer opened by "View product details".
 * Test 1, details variants A and B.
 */
export function ProductInfoDrawer({ setting, metal, open, onOpenChange, tab, onTabChange }: ProductInfoDrawerProps) {
  const variant = setting.variants.find((v) => v.metal === metal) ?? setting.variants[0]
  const hero = galleryFor(setting, metal)[0]

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" showCloseButton={false} className="gap-0 shadow-none data-[side=right]:border-l-0 data-[side=right]:w-full data-[side=right]:md:max-w-xl">
        {/* Header, image and tab content scroll together (Figma "Overlay Frame"); only the footer is fixed.
            The tab bar sticks to the top so switching tabs stays reachable on short screens. */}
        <Tabs
          value={tab}
          onValueChange={(v) => onTabChange(v as ProductInfoTab)}
          className="min-h-0 flex-1 gap-0 overflow-y-auto"
        >
          <header className="flex flex-col gap-6 bg-primary-foreground px-5 pt-6 pb-6 md:gap-8 md:px-10 md:pt-10 md:pb-8">
            <div className="flex items-center gap-6">
              <SheetTitle className="flex-1 type-h4 font-medium text-primary">{setting.name}</SheetTitle>
              <SheetClose
                render={<Button variant="ghost" size="icon-sm" aria-label="Close product details" />}
              >
                <X className="size-5" />
              </SheetClose>
            </div>
            {/* Figma: 264px tall, image contained → h-64 (256px, closest token); shorter on mobile. */}
            <div className="h-44 w-full shrink-0 bg-secondary md:h-64">
              <img src={hero.src} alt={hero.alt} className="size-full object-contain" />
            </div>
          </header>

          <div className="sticky top-0 z-10 border-b border-border-subtle bg-primary-foreground px-5 md:px-10">
            <TabsList className="-mb-px border-b-0">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="specifications">Specifications</TabsTrigger>
            </TabsList>
          </div>

          <div>
            <TabsContent value="overview" className="flex flex-col gap-10 p-5 md:p-10">
              <p className="text-sm text-primary">{descriptionFor(setting, metal)}</p>
              <dl className="border-t border-border-subtle">
                <SpecRow label="Article No." value={variant.articleNo} last />
              </dl>
            </TabsContent>
            <TabsContent value="specifications" className="p-5 md:p-10">
              <SpecList setting={setting} metal={metal} />
            </TabsContent>
          </div>
        </Tabs>

        <footer className="shrink-0 border-t border-muted bg-white px-5 py-5 md:px-10">
          <SheetClose render={<Button variant="outline" size="wide" className="w-full" />}>Close</SheetClose>
        </footer>
      </SheetContent>
    </Sheet>
  )
}
