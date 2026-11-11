import { ENGRAVING } from "@/data/dyo"
import { formatPrice } from "@/lib/format"
import { useRingBuild } from "@/state/ring-build"

function Row({ label, detail, price }: { label: string; detail: string; price: number }) {
  return (
    <div className="flex flex-col gap-1">
      <span className="type-label-xs text-primary">{label}</span>
      <div className="flex items-start justify-between gap-2">
        <span className="type-caption text-muted-foreground">{detail}</span>
        <span className="type-caption font-semibold text-primary">{formatPrice(price)}</span>
      </div>
    </div>
  )
}

/** Running price summary (Figma "Price Explained"): one row per component, then the ring total. */
export function PriceBreakdown() {
  const { setting, stone, ringSize, crown, engraving, engravingStyle, total } = useRingBuild()
  return (
    <div className="flex flex-col gap-3 border border-border-subtle bg-bg-input-50 p-4" aria-live="polite">
      <Row
        label="Setting"
        detail={`${setting.name}${ringSize ? `, Size ${ringSize}` : ""} · ${setting.metal}`}
        price={setting.price}
      />
      <Row label="Stone" detail={`${stone.origin} · ${stone.shape} · ${stone.carat} ct`} price={stone.price} />
      {crown && <Row label="Crown" detail={`${crown.name} (${crown.holds})`} price={crown.price} />}
      {engraving && (
        <Row label="Engraving" detail={`“${engraving.text}” · ${engravingStyle?.name}`} price={ENGRAVING.price} />
      )}
      <div className="h-px bg-border-subtle" />
      <div className="flex items-center justify-between gap-2 text-sm leading-5 font-semibold text-primary">
        <span>Ring Total:</span>
        <span>{formatPrice(total)}</span>
      </div>
    </div>
  )
}
