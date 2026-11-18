import type { Diamond } from "@/data/diamonds"

/*
 * Proportion diagrams from the Diamond PDP gallery (Figma 7375:134713 / 7375:134768), exported
 * as SVG from Figma. Line art is drawn in muted-foreground, labels in primary, and the label
 * values come from the stone, so every diamond shows its own proportions.
 */

const label = "fill-primary font-sans text-xxs font-semibold tracking-[1px] uppercase"

/** Side profile: table %, depth %, girdle and culet. */
export function ProfileDiagram({ diamond, className }: { diamond: Diamond; className?: string }) {
  const s = { stroke: "currentColor", strokeWidth: 1.28, strokeLinecap: "round" as const }
  return (
    <svg viewBox="0 0 401 405" fill="none" className={className} role="img" aria-label={`Diamond profile: table ${diamond.table}%, depth ${diamond.depth}%, girdle ${diamond.girdle}, culet ${diamond.culet}`}>
      <rect width="401" height="405" className="fill-background" />
      <g className="text-muted-foreground">
        <path d="M95.8144 104.56H265.837L329.968 154.268V169.331L180.826 303.393L31.6831 169.331V154.268L95.8144 104.56Z" stroke="currentColor" strokeWidth={1.6} strokeLinejoin="round" />
        {[
          "M31.6831 154.3H329.968", "M31.6831 169.364H329.968", "M95.8462 104.56L31.6831 154.301", "M95.8466 104.56L75.4109 154.301",
          "M148.269 104.56L75.4109 154.301", "M148.269 104.56L180.826 154.301", "M213.382 104.56L180.824 154.301", "M213.383 104.56L286.241 154.301",
          "M265.868 104.56L286.24 154.301", "M265.868 104.56L329.968 154.301", "M95.8467 104.56L122.058 125.456", "M148.269 104.56L122.058 125.456",
          "M122.057 125.456L43.043 154.301", "M148.269 104.56L180.826 125.456", "M213.382 104.56L180.824 125.456", "M213.383 104.56L239.594 125.456",
          "M265.869 104.56L239.594 125.456", "M122.058 125.456L123.708 154.301", "M180.825 125.456L123.706 154.301", "M180.824 125.456L237.943 154.301",
          "M239.596 125.456L237.946 154.301", "M239.594 125.456L318.608 154.301", "M31.6831 169.364L180.826 303.393", "M75.4109 169.364L180.826 303.393",
          "M180.824 169.364V303.393", "M286.239 169.364L180.824 303.393", "M329.967 169.364L180.824 303.393", "M43.043 169.364L143.508 269.869",
          "M43.043 169.364L154.487 269.869", "M123.706 169.364L154.487 269.869", "M123.706 169.364L180.825 269.869", "M237.943 169.364L180.824 269.869",
          "M237.944 169.364L207.164 269.869", "M318.608 169.364L207.164 269.869", "M318.61 169.364L218.145 269.869", "M95.8467 72.5114H265.869",
          "M95.8467 64.8196V80.2031", "M265.868 64.8196V80.2031", "M361.702 104.56V303.393", "M354.083 104.56H369.315", "M354.083 303.392H369.315",
          "M54.531 172.697V251.986", "M46.9163 251.986H62.1478", "M180.824 307.879V332.108", "M173.209 332.108H188.441",
        ].map((d) => (
          <path key={d} d={d} {...s} />
        ))}
        <circle cx="54.53" cy="161.8" r="10.9" stroke="currentColor" strokeWidth={1.28} />
        <circle cx="180.83" cy="296.98" r="10.9" stroke="currentColor" strokeWidth={1.28} />
      </g>
      <text className={label} x="180.8" y="61.9" textAnchor="middle">Table: {diamond.table}%</text>
      <text className={label} x="345" y="300.9" textAnchor="end">Depth: {diamond.depth}%</text>
      <text className={label} x="32" y="268.9">Girdle:</text>
      <text className={label} x="32" y="280.9">{diamond.girdle}</text>
      <text className={label} x="180.8" y="350.4" textAnchor="middle">Culet: {diamond.culet}</text>
    </svg>
  )
}

/** Face-up view with length and width in mm. */
export function TopDiagram({ diamond, className }: { diamond: Diamond; className?: string }) {
  const s = { stroke: "currentColor", strokeWidth: 1.66, strokeLinecap: "round" as const }
  return (
    <svg viewBox="0 0 401 405" fill="none" className={className} role="img" aria-label={`Diamond measurements: ${diamond.lengthMm.toFixed(2)} × ${diamond.widthMm.toFixed(2)} mm`}>
      <rect width="401" height="405" className="fill-background" />
      <g className="text-muted-foreground">
        <circle cx="200.5" cy="202.22" r="152.48" stroke="currentColor" strokeWidth={2.08} />
        <path d="M287.374 238.598L236.52 289.959H164.484L113.63 238.598V165.843L164.484 114.482H236.52L287.374 165.843V238.598Z" stroke="currentColor" strokeWidth={1.66} />
        {[
          "M287.37 165.843L310.283 202.221", "M287.37 238.598L310.283 202.221", "M310.283 202.221L341.356 143.284", "M310.283 202.221L341.356 261.157",
          "M310.283 202.221H352.977", "M287.372 238.598L278.14 280.636", "M236.517 289.959L278.139 280.636", "M278.14 280.636L341.357 261.157",
          "M278.14 280.636L258.854 344.483", "M278.14 280.636L308.306 311.103", "M236.518 289.959L200.5 313.101", "M164.483 289.959L200.501 313.101",
          "M200.5 313.101L258.854 344.483", "M200.501 313.101L142.146 344.483", "M200.5 313.101V356.221", "M164.482 289.959L122.86 280.636",
          "M113.63 238.598L122.861 280.636", "M122.86 280.636L142.146 344.483", "M122.861 280.636L59.6436 261.157", "M122.86 280.636L92.6943 311.103",
          "M113.63 238.598L90.717 202.221", "M113.63 165.843L90.717 202.221", "M90.7163 202.221L59.6436 261.157", "M90.7163 202.221L59.6436 143.284",
          "M90.7151 202.221H48.021", "M113.63 165.843L122.861 123.806", "M164.482 114.482L122.86 123.806", "M122.861 123.806L59.6436 143.285",
          "M122.86 123.806L142.146 59.958", "M122.86 123.806L92.6943 93.3385", "M164.483 114.482L200.501 91.3407", "M236.518 114.482L200.5 91.3407",
          "M200.501 91.3407L142.146 59.958", "M200.5 91.3407L258.854 59.958", "M200.5 91.3407V48.2207", "M236.517 114.482L278.139 123.806",
          "M287.372 165.843L278.14 123.806", "M278.14 123.806L258.854 59.958", "M278.14 123.806L341.357 143.285", "M278.14 123.806L308.306 93.3385",
          "M48.021 202.221H352.979", "M48.021 192.231V212.21", "M352.979 192.231V212.21", "M130.444 48.2207V356.221", "M120.551 48.2207H140.332",
          "M120.551 356.221H140.332",
        ].map((d) => (
          <path key={d} d={d} {...s} />
        ))}
      </g>
      <rect x="144.34" y="188.8" width="116" height="28" className="fill-background" />
      <text className={label} x="202.3" y="206.7" textAnchor="middle">Width: {diamond.widthMm.toFixed(2)}mm</text>
      <rect x="69.27" y="271.9" width="124" height="28" className="fill-background" />
      <text className={label} x="131.3" y="289.8" textAnchor="middle">Length: {diamond.lengthMm.toFixed(2)}mm</text>
    </svg>
  )
}
