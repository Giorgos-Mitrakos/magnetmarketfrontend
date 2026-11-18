// Ιστορικό τιμής στη σελίδα προϊόντος (2026-10-18).
// ΜΟΝΟ πραγματικές τιμές του site (καταγραφή από το Strapi) — εμφανίζεται
// όταν υπάρχουν τουλάχιστον 30 μέρες δεδομένων. Server component: απλό SVG,
// χωρίς JavaScript· κλειστό από προεπιλογή (<details>) για να μη βαραίνει τη σελίδα.
import { IPriceHistory } from '@/lib/interfaces/product'

const W = 640
const H = 180
const PAD = { l: 48, r: 10, t: 10, b: 24 }

const eur = (n: number) => new Intl.NumberFormat('el-GR', { style: 'currency', currency: 'EUR' }).format(n)
const shortDate = (t: number) =>
  new Date(t).toLocaleDateString('el-GR', { day: 'numeric', month: 'short', timeZone: 'Europe/Athens' })

export default function PriceHistory({ history }: { history: IPriceHistory }) {
  const points = history.points ?? []
  if (points.length < 2) return null

  const t0 = new Date(history.since).getTime()
  const now = Date.now()
  const min = history.lowest
  const max = history.highest
  const span = Math.max(max - min, max * 0.05, 1)
  const yMin = Math.max(0, min - span * 0.15)
  const yMax = max + span * 0.15
  const x = (t: number) => PAD.l + ((Math.max(t, t0) - t0) / Math.max(now - t0, 1)) * (W - PAD.l - PAD.r)
  const y = (v: number) => PAD.t + (1 - (v - yMin) / (yMax - yMin)) * (H - PAD.t - PAD.b)

  // «Σκαλωτή» γραμμή: η τιμή ισχύει μέχρι την επόμενη αλλαγή
  let d = ''
  points.forEach((p, i) => {
    const px = x(new Date(p.at).getTime())
    const py = y(p.price)
    d += i === 0 ? `M${px},${py}` : `H${px}V${py}`
  })
  d += `H${x(now)}`
  const area = `${d}V${H - PAD.b}H${x(t0)}Z`

  const current = points[points.length - 1].price
  const yTicks = [yMin + (yMax - yMin) * 0.15, (yMin + yMax) / 2, yMax - (yMax - yMin) * 0.15]
  const xTicks = Array.from({ length: 4 }, (_, i) => t0 + ((now - t0) * i) / 3)

  return (
    <details className="group rounded-xl bg-white p-4 dark:bg-gray-800 md:p-6">
      <summary className="flex cursor-pointer list-none flex-wrap items-center justify-between gap-2">
        <span className="text-lg font-bold text-siteColors-purple dark:text-slate-200">Ιστορικό τιμής</span>
        <span className="text-sm text-gray-600 dark:text-gray-300">
          {history.lowest30 != null && <>Χαμηλότερη τιμή 30 ημερών: <strong>{eur(history.lowest30)}</strong> · </>}
          <span className="text-siteColors-blue group-open:hidden">Προβολή ▾</span>
          <span className="hidden text-siteColors-blue group-open:inline">Απόκρυψη ▴</span>
        </span>
      </summary>

      <div className="mt-4">
        <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full" role="img" aria-label="Γράφημα ιστορικού τιμής">
          {yTicks.map((v) => (
            <g key={v}>
              <line x1={PAD.l} x2={W - PAD.r} y1={y(v)} y2={y(v)} className="stroke-gray-200 dark:stroke-gray-700" />
              <text x={PAD.l - 6} y={y(v) + 4} fontSize="11" textAnchor="end" className="fill-gray-500">
                {Math.round(v)}€
              </text>
            </g>
          ))}
          {xTicks.map((t) => (
            <text key={t} x={x(t)} y={H - 6} fontSize="11" textAnchor="middle" className="fill-gray-500">
              {shortDate(t)}
            </text>
          ))}
          <path d={area} className="fill-siteColors-purple/10" />
          <path d={d} fill="none" strokeWidth={2.5} className="stroke-siteColors-purple dark:stroke-pink-400" />
          <circle cx={x(now)} cy={y(current)} r={4} className="fill-siteColors-purple dark:fill-pink-400" />
        </svg>

        <dl className="mt-3 grid grid-cols-2 gap-3 text-sm sm:grid-cols-4">
          <div>
            <dt className="text-gray-500 dark:text-gray-400">Τώρα</dt>
            <dd className="font-semibold">{eur(current)}</dd>
          </div>
          {history.lowest30 != null && (
            <div>
              <dt className="text-gray-500 dark:text-gray-400">Χαμηλότερη 30 ημερών</dt>
              <dd className="font-semibold">{eur(history.lowest30)}</dd>
            </div>
          )}
          <div>
            <dt className="text-gray-500 dark:text-gray-400">Χαμηλότερη</dt>
            <dd className="font-semibold">{eur(history.lowest)}</dd>
          </div>
          <div>
            <dt className="text-gray-500 dark:text-gray-400">Υψηλότερη</dt>
            <dd className="font-semibold">{eur(history.highest)}</dd>
          </div>
        </dl>
        <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
          Οι τιμές πώλησης του καταστήματος από {shortDate(t0)} {new Date(t0).getFullYear()} έως σήμερα.
        </p>
      </div>
    </details>
  )
}
