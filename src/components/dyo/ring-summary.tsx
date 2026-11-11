import type { ReactNode } from "react"
import { ENGRAVING } from "@/data/dyo"
import { formatPrice } from "@/lib/format"
import { useNotInTest } from "@/components/prototype/not-in-test"
import { useRingBuild } from "@/state/ring-build"

function SpecRows({ rows }: { rows: [string, ReactNode][] }) {
  return (
    <dl className="grid grid-cols-[--spacing(16)_1fr] gap-x-0 gap-y-1">
      {rows.map(([label, value]) => (
        <div key={label} className="contents">
          <dt className="type-spec text-muted-foreground">{label}</dt>
          <dd className="type-spec text-primary">{value}</dd>
        </div>
      ))}
    </dl>
  )
}

function LineItem({
  eyebrow,
  title,
  price,
  children,
  actions,
}: {
  eyebrow: string
  title: ReactNode
  price: number
  children?: ReactNode
  actions?: ReactNode
}) {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-col gap-1">
        <span className="type-label-xs text-muted-foreground">{eyebrow}</span>
        <div className="flex items-start justify-between gap-4">
          <span className="type-caption font-semibold text-primary">{title}</span>
          <span className="type-caption font-medium text-primary">{formatPrice(price)}</span>
        </div>
      </div>
      {children}
      {actions && <div className="flex gap-4">{actions}</div>}
    </div>
  )
}

const linkClass = "cursor-pointer self-start text-xxs leading-4 font-semibold text-primary underline"

/**
 * Ring summary ("Cart Item" in Figma): thumbnail, total, and a line item per component.
 * Totals update as finishing touches change. Shared by Ring Review (A/B) and the end screen.
 */
export function RingSummary({
  onEditCrown,
  onEditEngraving,
  readOnly = false,
}: {
  onEditCrown?: () => void
  onEditEngraving?: () => void
  readOnly?: boolean
}) {
  const { setting, stone, ringSize, crown, engraving, engravingStyle, total, setCrownId, setEngraving } = useRingBuild()
  const notInTest = useNotInTest()

  return (
    <div className="flex gap-8 max-md:gap-4">
      <img
        src={setting.image}
        alt={setting.name}
        className="size-26 shrink-0 bg-secondary object-cover max-md:size-20"
      />
      <div className="flex min-w-0 flex-1 flex-col gap-5">
        <div className="flex items-start justify-between gap-4 max-md:flex-col max-md:gap-2">
          <div className="flex flex-col gap-2">
            <p className="text-sm leading-5 font-semibold text-primary">{setting.name}</p>
            <p className="type-caption font-medium text-muted-foreground">
              {stone.carat} ct, {stone.origin}, {stone.shape} · {setting.metal}
            </p>
          </div>
          <p className="shrink-0 text-sm leading-5 font-semibold text-primary" aria-live="polite">
            Total: {formatPrice(total)}
          </p>
        </div>

        <div className="flex flex-col gap-5">
          <LineItem
            eyebrow="Setting"
            title={setting.name}
            price={setting.price}
            actions={!readOnly && (
              <button type="button" className={linkClass} onClick={() => notInTest("Editing the setting")}>
                Edit Setting
              </button>
            )}
          >
            <SpecRows rows={[["Metal", setting.metal], ["Ring Size", ringSize ?? "Not selected"]]} />
          </LineItem>

          <div className="h-px bg-border-subtle" />

          <LineItem
            eyebrow="Stone"
            title={stone.title}
            price={stone.price}
            actions={!readOnly && (
              <button type="button" className={linkClass} onClick={() => notInTest("Editing the stone")}>
                Edit Stone
              </button>
            )}
          >
            <SpecRows
              rows={[
                ["Carat", `${stone.carat} Ct`],
                ["Clarity", stone.clarity],
                ["Colour", stone.color],
                ["Cut", stone.cut],
              ]}
            />
          </LineItem>

          {crown && (
            <>
              <div className="h-px bg-border-subtle" />
              <LineItem
                eyebrow="Crown"
                title={crown.name}
                price={crown.price}
                actions={!readOnly && (
                  <>
                    <button type="button" className={linkClass} onClick={onEditCrown}>Edit</button>
                    <button type="button" className={linkClass} onClick={() => setCrownId(null)}>Remove</button>
                  </>
                )}
              >
                <SpecRows rows={[["Fit", crown.holds]]} />
              </LineItem>
            </>
          )}

          {engraving && (
            <>
              <div className="h-px bg-border-subtle" />
              <LineItem
                eyebrow="Engraving"
                title={`“${engraving.text}”`}
                price={ENGRAVING.price}
                actions={!readOnly && (
                  <>
                    <button type="button" className={linkClass} onClick={onEditEngraving}>Edit</button>
                    <button type="button" className={linkClass} onClick={() => setEngraving(null)}>Remove</button>
                  </>
                )}
              >
                <SpecRows rows={[["Style", engravingStyle?.name], ["Placement", "Inside band"]]} />
              </LineItem>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
