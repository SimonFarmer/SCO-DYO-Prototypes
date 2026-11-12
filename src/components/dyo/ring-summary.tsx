import type { ReactNode } from "react"
import { InfoIcon } from "@phosphor-icons/react"
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

function ItemHeading({ title, price }: { title: ReactNode; price: number }) {
  return (
    <div className="flex items-start justify-between gap-4">
      <span className="type-caption font-semibold text-primary">{title}</span>
      <span className="type-caption font-medium text-primary">{formatPrice(price)}</span>
    </div>
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
        <ItemHeading title={title} price={price} />
      </div>
      {children}
      {actions && <div className="flex flex-wrap gap-x-4 gap-y-2">{actions}</div>}
    </div>
  )
}

function SummaryLink({ onClick, children }: { onClick?: () => void; children: ReactNode }) {
  return (
    <button type="button" onClick={onClick} className="cursor-pointer self-start text-xxs leading-4 font-semibold text-primary underline">
      {children}
    </button>
  )
}

const Rule = () => <div className="h-px bg-border-subtle" />

interface RingSummaryProps {
  readOnly?: boolean
  onEditCrown?: () => void
  onEditEngraving?: () => void
  /**
   * "inline" (Variant A): crown and engraving as their own line items.
   * "grouped" (Variant B review): one Personalization section, per the Order Review frame.
   */
  personalization?: "inline" | "grouped"
  /** Adds an "Edit Ring Size" link to the setting (Variant B: back to Finishing Touches). */
  onEditRingSize?: () => void
  /** Shown in the grouped layout when nothing is added (Variant B: back to Finishing Touches). */
  onAddPersonalization?: () => void
  /** Wedding band edit links (Variant B: back to Finishing Touches with the overlay open). */
  onEditBand?: () => void
  onEditBandEngraving?: () => void
}

/**
 * Ring summary ("Cart Item" in Figma): thumbnail, total, and a line item per component.
 * Totals update as finishing touches change. Shared by Ring Review (A/B) and the end screen.
 */
export function RingSummary({
  readOnly = false,
  onEditCrown,
  onEditEngraving,
  personalization = "inline",
  onEditRingSize,
  onAddPersonalization,
  onEditBand,
  onEditBandEngraving,
}: RingSummaryProps) {
  const {
    setting,
    stone,
    ringSize,
    crown,
    engraving,
    engravingStyle,
    band,
    bandEngraving,
    bandEngravingStyle,
    total,
    setCrownId,
    setEngraving,
    setBandId,
    setBandEngraving,
  } = useRingBuild()
  const notInTest = useNotInTest()

  const crownActions = !readOnly && (
    <>
      <SummaryLink onClick={onEditCrown}>Edit Crown</SummaryLink>
      <SummaryLink onClick={() => setCrownId(null)}>Remove Crown</SummaryLink>
    </>
  )
  const engravingActions = !readOnly && (
    <>
      <SummaryLink onClick={onEditEngraving}>Edit Engraving</SummaryLink>
      <SummaryLink onClick={() => setEngraving(null)}>Remove Engraving</SummaryLink>
    </>
  )
  const engravingSpecs = engraving && (
    <SpecRows rows={[["Style", engravingStyle?.name], ["Text", engraving.text]]} />
  )
  const finalSale = (
    <p className="flex items-center gap-2 type-spec text-muted-foreground">
      <InfoIcon className="size-3.5 shrink-0" />
      Engraved items are final sale and non-returnable.
    </p>
  )

  return (
    <div className="flex gap-8 max-md:gap-4">
      <img src={setting.image} alt={setting.name} className="size-26 shrink-0 bg-secondary object-cover max-md:size-20" />
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
              <>
                <SummaryLink onClick={() => notInTest("Editing the setting")}>Edit Setting</SummaryLink>
                {onEditRingSize && <SummaryLink onClick={onEditRingSize}>Edit Ring Size</SummaryLink>}
              </>
            )}
          >
            <SpecRows rows={[["Metal", setting.metal], ["Ring Size", ringSize ?? "Not selected"]]} />
          </LineItem>

          <Rule />

          <LineItem
            eyebrow="Stone"
            title={stone.title}
            price={stone.price}
            actions={!readOnly && <SummaryLink onClick={() => notInTest("Editing the stone")}>Edit Stone</SummaryLink>}
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

          {personalization === "inline" ? (
            <>
              {crown && (
                <>
                  <Rule />
                  <LineItem eyebrow="Crown" title={crown.name} price={crown.price} actions={crownActions}>
                    <SpecRows rows={[["Fit", crown.holds]]} />
                  </LineItem>
                </>
              )}
              {engraving && (
                <>
                  <Rule />
                  <LineItem eyebrow="Engraving" title={`“${engraving.text}”`} price={ENGRAVING.price} actions={engravingActions}>
                    <SpecRows rows={[["Style", engravingStyle?.name], ["Placement", "Inside band"]]} />
                    {finalSale}
                  </LineItem>
                </>
              )}
            </>
          ) : (
            (crown || engraving || (!readOnly && onAddPersonalization)) && (
              <>
                <Rule />
                <div className="flex flex-col gap-4">
                  <span className="type-label-xs text-muted-foreground">Personalization</span>
                  {crown && (
                    <div className="flex flex-col gap-3">
                      <ItemHeading title={`${crown.name} (${crown.holds})`} price={crown.price} />
                      {crownActions && <div className="flex flex-wrap gap-x-4 gap-y-2">{crownActions}</div>}
                    </div>
                  )}
                  {engraving && (
                    <div className="flex flex-col gap-3">
                      <ItemHeading title="Engraving" price={ENGRAVING.price} />
                      {engravingSpecs}
                      {engravingActions && <div className="flex flex-wrap gap-x-4 gap-y-2">{engravingActions}</div>}
                      {finalSale}
                    </div>
                  )}
                  {!crown && !engraving && (
                    <div className="flex flex-col gap-3">
                      <p className="type-caption text-muted-foreground">No crown or engraving added.</p>
                      <SummaryLink onClick={onAddPersonalization}>Add a Crown or Engraving</SummaryLink>
                    </div>
                  )}
                </div>
              </>
            )
          )}

          {band && (
            <>
              <Rule />
              <LineItem
                eyebrow="Wedding Band"
                title={band.name}
                price={band.price}
                actions={!readOnly && (
                  <>
                    <SummaryLink onClick={onEditBand}>Edit Band</SummaryLink>
                    <SummaryLink onClick={() => setBandId(null)}>Remove Band</SummaryLink>
                  </>
                )}
              >
                <SpecRows rows={[["Metal", band.metal], ["Ring Size", ringSize ?? "Not selected"]]} />
              </LineItem>
              {bandEngraving && (
                <div className="flex flex-col gap-3">
                  <ItemHeading title="Wedding Band Engraving" price={ENGRAVING.price} />
                  <SpecRows rows={[["Style", bandEngravingStyle?.name], ["Text", bandEngraving.text]]} />
                  {!readOnly && (
                    <div className="flex flex-wrap gap-x-4 gap-y-2">
                      <SummaryLink onClick={onEditBandEngraving}>Edit Engraving</SummaryLink>
                      <SummaryLink onClick={() => setBandEngraving(null)}>Remove Engraving</SummaryLink>
                    </div>
                  )}
                  {finalSale}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}
