import { useMemo, useState } from "react"
import { useNavigate } from "react-router"
import { CaretLeftIcon } from "@phosphor-icons/react"
import { SectionDivider, StepIntro } from "@/components/dyo/finishing-sections"
import { useNotInTest } from "@/components/prototype/not-in-test"
import { StoneCtas } from "@/components/stones/stone-ctas"
import { Badge } from "@/components/ui/badge"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { SETTING } from "@/data/dyo"
import { recommend, stoneImage, stoneShape, stoneTitle, stoneType, type StonePick } from "@/data/stones"
import { formatPrice } from "@/lib/format"
import { cn } from "@/lib/utils"
import { targetCarat, useStonePrefs, type StonePrefs } from "./preferences"
import { StoneStepLayout } from "./stone-step-layout"
import type { StonePreferenceVariant } from "./variants"

/** One line under the title that ties the picks back to the shopper's choices (comprehension test). */
function basis(variant: StonePreferenceVariant["id"], p: StonePrefs, count: number) {
  const what = `${count.toLocaleString("en-US")} ${stoneShape(p.shape).label.toLowerCase()} ${stoneType(p.type).noun.toLowerCase()}s`
  if (variant === "A") return `Picked from ${what} between ${p.caratLo.toFixed(2)} and ${p.caratHi.toFixed(2)} ct.`
  if (variant === "B") return `Picked from ${what} that keep your ring at or near ${formatPrice(p.budgetHi)}.`
  return `Picked from ${what} around ${p.carat.toFixed(2)} ct for a ring between ${formatPrice(p.budgetLo)} and ${formatPrice(p.budgetHi)}.`
}

function PickTile({ pick, selected, onSelect }: { pick: StonePick; selected: boolean; onSelect: () => void }) {
  const notInTest = useNotInTest()
  const img = stoneImage(pick.stone)
  return (
    <div
      onClick={onSelect}
      className={cn(
        "flex cursor-pointer gap-5 p-4",
        selected ? "border-2 border-primary" : "border border-input hover:border-border",
      )}
    >
      <div className="size-25.75 shrink-0 bg-secondary">
        <img src={img.src} alt="" className={cn("size-full", img.photo ? "object-cover" : "object-contain p-5")} />
      </div>
      <div className="flex min-w-0 flex-1 flex-col gap-3">
        <div className="flex flex-col gap-1.5">
          <div className="flex items-start justify-between gap-2">
            <Badge
              variant={pick.kind === "our-pick" ? "default" : "secondary"}
              className={pick.kind === "our-pick" ? undefined : "text-primary"}
            >
              {pick.label}
            </Badge>
            <RadioGroupItem value={pick.kind} aria-label={`${pick.label}: ${stoneTitle(pick.stone)}`} className="border-primary" />
          </div>
          <p className="text-sm leading-5 font-semibold text-primary">{stoneTitle(pick.stone)}</p>
          <p className="text-xs leading-4 tracking-[0.12px] text-primary">{pick.description}</p>
        </div>
        <p className="text-sm leading-5 font-semibold text-primary">Ring Total: {formatPrice(SETTING.price + pick.stone.price)}</p>
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation()
            notInTest("Stone details")
          }}
          className="cursor-pointer self-start type-label-xs text-primary underline"
        >
          View details
        </button>
      </div>
    </div>
  )
}

function RingSummary({ pick }: { pick: StonePick }) {
  const rows = [
    { label: `Setting: ${SETTING.name}, ${SETTING.metal.replace("14K", "14k")}`, price: SETTING.price },
    { label: `Stone: ${stoneTitle(pick.stone)}`, price: pick.stone.price },
  ]
  return (
    <div className="flex flex-col gap-4 bg-bg-input-50 p-4" aria-live="polite">
      <h2 className="type-h4 text-primary">Ring Summary</h2>
      <div className="flex flex-col gap-3">
        {rows.map((r) => (
          <div key={r.label} className="flex items-start justify-between gap-3">
            <span className="text-xs leading-4 font-medium text-primary">{r.label}</span>
            <span className="text-sm leading-none font-semibold text-muted-foreground">{formatPrice(r.price)}</span>
          </div>
        ))}
      </div>
      <div className="h-px bg-input" />
      <div className="flex items-center justify-between text-base leading-6 font-semibold text-primary">
        <span>Ring Total:</span>
        <span>{formatPrice(SETTING.price + pick.stone.price)}</span>
      </div>
    </div>
  )
}

/**
 * Test 2 · Recommendations (2b). Figma 7685:416729.
 * Replaces the preferences form with three picks from the stones that match 2a; "Edit stone
 * preferences" goes back with every choice kept, and "View All" opens the PLP with them preset.
 */
export function Test2Recommendations() {
  const navigate = useNavigate()
  const notInTest = useNotInTest()
  const { variant, prefs, matching, href } = useStonePrefs()
  const picks = useMemo(() => recommend(matching, targetCarat(variant.id, prefs)), [matching, variant.id, prefs])
  const [selectedKind, setSelectedKind] = useState(picks[0]?.kind)
  const selected = picks.find((p) => p.kind === selectedKind) ?? picks[0]

  const editPrefs = () => navigate(href("preferences"))

  return (
    <div data-variant={variant.id}>
      <StoneStepLayout prefs={prefs} carat={selected?.stone.carat}>
        <header className="flex flex-col gap-8 max-lg:gap-4">
          <StepIntro
            eyebrow="Step 2 of 3 · Stone"
            title="Stone Recommendations"
            subtitle={selected ? basis(variant.id, prefs, matching.length) : undefined}
          />
          <button
            type="button"
            onClick={editPrefs}
            className="flex h-6 cursor-pointer items-center gap-0.5 self-start type-label-xs text-primary underline"
          >
            <CaretLeftIcon className="size-4" />
            Edit stone preferences
          </button>
        </header>
        <SectionDivider />
        {selected ? (
          <>
            <RadioGroup value={selected.kind} onValueChange={(v) => setSelectedKind(v as StonePick["kind"])} aria-label="Recommended stones">
              {picks.map((p) => (
                <PickTile key={p.kind} pick={p} selected={p.kind === selected.kind} onSelect={() => setSelectedKind(p.kind)} />
              ))}
            </RadioGroup>
            <SectionDivider />
            <RingSummary pick={selected} />
          </>
        ) : (
          <div className="flex flex-col gap-2 bg-bg-input-50 p-4">
            <p className="type-h5 text-primary">No stones match these preferences</p>
            <p className="text-xs leading-4 text-muted-foreground">Edit your stone preferences to see recommendations.</p>
          </div>
        )}
        <StoneCtas
          primary="Select This Diamond"
          onPrimary={() => notInTest("Finishing touches (step 3)")}
          primaryDisabled={!selected}
          shape={prefs.shape}
          count={matching.length}
          onViewAll={() => navigate(href("diamonds", { from: "recs" }))}
        />
      </StoneStepLayout>
    </div>
  )
}
