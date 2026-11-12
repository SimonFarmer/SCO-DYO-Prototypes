import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { formatPrice } from "@/lib/format"

/** Two-up preview under an upsell overlay's header (ring + chosen option) with a caption. */
export function OptionPreview({ images, caption }: { images: { src: string; alt: string }[]; caption: string }) {
  return (
    <div className="flex flex-col gap-3 border-b border-muted px-10 py-6 max-lg:px-margin">
      <div className="grid grid-cols-2 gap-2">
        {images.map((img, i) => (
          <img
            key={i}
            src={img.src}
            alt={img.alt}
            className="aspect-square w-full bg-secondary object-contain mix-blend-multiply"
          />
        ))}
      </div>
      <p className="type-label-xs text-primary" aria-live="polite">{caption}</p>
    </div>
  )
}

export interface ListOption {
  id: string
  name: string
  /** 0 shows "No Cost". */
  price: number
  image: string
}

/** Single-choice list of options with thumbnails (Figma crown / wedding band overlays). */
export function OptionList({
  label,
  value,
  onChange,
  options,
}: {
  label: string
  value: string
  onChange: (id: string) => void
  options: ListOption[]
}) {
  return (
    <RadioGroup value={value} onValueChange={(v) => onChange(v as string)} className="gap-0" aria-label={label}>
      {options.map((o) => (
        <label
          key={o.id}
          className="flex cursor-pointer items-center gap-3 border-b border-muted px-3 py-3 hover:bg-bg-input-50"
        >
          <span className="flex size-16 shrink-0 items-center justify-center bg-secondary">
            <img src={o.image} alt="" className="size-14 object-contain mix-blend-multiply" />
          </span>
          <span className="flex-1 text-sm leading-5 font-semibold text-primary">{o.name}</span>
          <span className="text-sm leading-5 font-medium text-primary">{o.price ? formatPrice(o.price) : "No Cost"}</span>
          <RadioGroupItem value={o.id} />
        </label>
      ))}
    </RadioGroup>
  )
}
