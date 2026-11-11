import { useState } from "react"
import { Input } from "@/components/ui/input"
import { ENGRAVING } from "@/data/dyo"
import { formatPrice } from "@/lib/format"
import { cn } from "@/lib/utils"
import { useRingBuild } from "@/state/ring-build"
import { OverlaySheet } from "./overlay-sheet"

export function EngravingSheet({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  const { engraving, setEngraving } = useRingBuild()
  const [text, setText] = useState(engraving?.text ?? "")
  const [styleId, setStyleId] = useState(engraving?.styleId ?? ENGRAVING.styles[0].id)

  const [wasOpen, setWasOpen] = useState(open)
  if (open !== wasOpen) {
    setWasOpen(open)
    if (open) {
      setText(engraving?.text ?? "")
      setStyleId(engraving?.styleId ?? ENGRAVING.styles[0].id)
    }
  }

  const style = ENGRAVING.styles.find((s) => s.id === styleId) ?? ENGRAVING.styles[0]
  const trimmed = text.trim()

  return (
    <OverlaySheet
      open={open}
      onOpenChange={onOpenChange}
      fullScreenMobile
      title="Add Engraving"
      titleSuffix={`+ ${formatPrice(ENGRAVING.price)}`}
      primaryLabel="Apply"
      primaryDisabled={!trimmed}
      onPrimary={() => {
        setEngraving({ text: trimmed, styleId })
        onOpenChange(false)
      }}
    >
      <div className="flex flex-col gap-8">
        <div className="flex flex-col gap-2">
          <Input
            value={text}
            maxLength={ENGRAVING.maxLength}
            onChange={(e) => setText(e.target.value)}
            placeholder="Enter your engraving text"
            aria-label="Engraving text"
            autoComplete="off"
          />
          <p className="type-caption text-muted-foreground" aria-live="polite">
            {text.length}/{ENGRAVING.maxLength} Characters
          </p>
        </div>

        <fieldset className="flex flex-col gap-3">
          <legend className="mb-3 text-sm leading-5 font-semibold text-primary">Choose engraving style</legend>
          <div className="grid grid-cols-4 gap-2 max-md:grid-cols-3">
            {ENGRAVING.styles.map((s) => (
              <button
                key={s.id}
                type="button"
                aria-pressed={s.id === styleId}
                onClick={() => setStyleId(s.id)}
                className={cn(
                  "flex h-14 cursor-pointer items-center justify-center border px-1 text-base text-primary",
                  s.id === styleId ? "border-primary" : "border-border-subtle hover:border-border"
                )}
                style={{ fontFamily: s.fontFamily, fontSize: `calc(var(--text-base) * ${s.scale})` }}
              >
                {s.name}
              </button>
            ))}
          </div>
        </fieldset>

        <div className="h-px bg-muted" />

        <div className="flex flex-col gap-3">
          <div className="flex flex-col gap-1">
            <p className="text-sm leading-5 font-semibold text-primary">Engraving preview</p>
            <p className="type-caption text-primary">Engraving will be made on the inside, facing the stone</p>
          </div>
          <div className="relative overflow-hidden bg-secondary">
            <img src="/images/engraving/band.jpg" alt="" className="w-full" />
            <p
              className="absolute inset-x-0 top-1/2 -translate-y-1/2 px-6 text-center text-muted-foreground"
              style={{ fontFamily: style.fontFamily, fontSize: `calc(var(--text-lg) * ${style.scale})` }}
              aria-live="polite"
            >
              {trimmed || "Your engraving"}
            </p>
          </div>
        </div>

        <div className="flex flex-col gap-1 bg-bg-input-50 p-3">
          <p className="type-caption font-semibold text-primary">Final Sale - Not Eligible for Return</p>
          <p className="type-caption text-muted-foreground">
            Because these pieces are customized specifically for you, we’re unable to accept them back once the
            engraving has been completed.
          </p>
        </div>

        {engraving && (
          <button
            type="button"
            onClick={() => {
              setEngraving(null)
              onOpenChange(false)
            }}
            className="cursor-pointer self-start type-label-xs text-primary underline"
          >
            Remove engraving
          </button>
        )}
      </div>
    </OverlaySheet>
  )
}
