import { useState } from "react"
import { MagnifyingGlassIcon } from "@phosphor-icons/react"
import { Input } from "@/components/ui/input"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { RING_SIZES } from "@/data/dyo"
import { cn } from "@/lib/utils"
import { useRingBuild } from "@/state/ring-build"
import { OverlaySheet } from "./overlay-sheet"

type Tab = "size" | "guide"

export function RingSizeSheet({
  open,
  onOpenChange,
  initialTab = "size",
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  initialTab?: Tab
}) {
  const { ringSize, setRingSize } = useRingBuild()
  const [pending, setPending] = useState(ringSize)
  const [tab, setTab] = useState<Tab>(initialTab)
  const [query, setQuery] = useState("")

  // Reset the draft each time the sheet opens.
  const [wasOpen, setWasOpen] = useState(open)
  if (open !== wasOpen) {
    setWasOpen(open)
    if (open) {
      setPending(ringSize)
      setTab(initialTab)
      setQuery("")
    }
  }

  const sizes = RING_SIZES.filter((s) => s.value.startsWith(query.trim()))

  return (
    <OverlaySheet
      open={open}
      onOpenChange={onOpenChange}
      title="Select Your Ring Size"
      description="Select the ring size that best suits your fit and comfort."
      primaryLabel="Apply"
      primaryDisabled={!pending}
      onPrimary={() => {
        if (pending) setRingSize(pending)
        onOpenChange(false)
      }}
      subheader={
        <div role="tablist" className="flex gap-6 border-b border-muted px-10 max-lg:px-margin">
          {(["size", "guide"] as const).map((t) => (
            <button
              key={t}
              type="button"
              role="tab"
              aria-selected={tab === t}
              onClick={() => setTab(t)}
              className={cn(
                "-mb-px cursor-pointer border-b-2 py-4 type-label-xs",
                tab === t ? "border-primary text-primary" : "border-transparent text-muted-foreground"
              )}
            >
              {t === "size" ? "Ring Size" : "Size Guide"}
            </button>
          ))}
        </div>
      }
    >
      {tab === "size" ? (
        <div className="flex flex-col gap-4">
          <div className="relative">
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search Size"
              inputMode="decimal"
              aria-label="Search ring sizes"
              className="pr-10"
            />
            <MagnifyingGlassIcon className="pointer-events-none absolute top-1/2 right-3 size-4 -translate-y-1/2 text-muted-foreground" />
          </div>
          <RadioGroup
            value={pending}
            onValueChange={(v) => setPending(v as string)}
            className="gap-0"
            aria-label="Ring size"
          >
            {sizes.map((s) => (
              <label
                key={s.value}
                className={cn(
                  "flex items-center gap-3 border-b border-muted px-2 py-3",
                  s.inStock ? "cursor-pointer hover:bg-bg-input-50" : "cursor-not-allowed",
                  pending === s.value && "bg-bg-input-50"
                )}
              >
                <span className={cn("flex-1 text-xs-2 leading-4 font-semibold text-primary", !s.inStock && "text-muted-foreground line-through")}>
                  {s.value}
                </span>
                {!s.inStock && <span className="type-caption text-destructive">Out of Stock</span>}
                <RadioGroupItem value={s.value} disabled={!s.inStock} />
              </label>
            ))}
            {sizes.length === 0 && <p className="py-6 type-caption text-muted-foreground">No sizes match “{query}”.</p>}
          </RadioGroup>
        </div>
      ) : (
        <SizeGuide />
      )}
    </OverlaySheet>
  )
}

function SizeGuide() {
  return (
    <div className="flex flex-col gap-4">
      <p className="text-sm leading-5 text-primary">
        Measure the inside diameter of a ring that fits the intended finger, then match it below. Between
        sizes? Choose the larger one. Resizing is free, for life.
      </p>
      <table className="w-full text-left">
        <thead>
          <tr className="border-b border-border-subtle">
            <th className="py-2 type-label-xs text-muted-foreground">US size</th>
            <th className="py-2 type-label-xs text-muted-foreground">Inside diameter</th>
          </tr>
        </thead>
        <tbody>
          {RING_SIZES.filter((s) => Number(s.value) % 0.5 === 0).map((s) => (
            <tr key={s.value} className="border-b border-muted">
              <td className="py-2 type-caption font-semibold text-primary">{s.value}</td>
              <td className="py-2 type-caption text-primary">{s.diameterMm.toFixed(1)} mm</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
