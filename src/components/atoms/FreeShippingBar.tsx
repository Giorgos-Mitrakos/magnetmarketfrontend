'use client'
// Μπάρα «Σου λείπουν Χ€ για δωρεάν μεταφορικά» (καλάθι, mini-cart, ταμείο).
// Το όριο ορίζεται ανά τρόπο αποστολής στο Strapi (Shipping → «Δωρεάν
// μεταφορικά από»). Αν ο πελάτης έχει διαλέξει τρόπο αποστολής ισχύει το δικό
// του όριο, αλλιώς το μικρότερο από όσους έχουν. Χωρίς όριο → δεν εμφανίζεται.
// Ποσό: αξία προϊόντων (με ΦΠΑ, πριν το κουπόνι) — ίδιο με τον υπολογισμό του Strapi.
import { useCheckout } from '@/context/checkout'
import { FaTruckFast } from 'react-icons/fa6'

const money = (n: number) => n.toLocaleString('el-GR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + '€'

export default function FreeShippingBar({ className = '' }: { className?: string }) {
  const { checkout } = useCheckout()
  const methods = checkout.availableShippingMethods?.shippings?.data ?? []
  if (!checkout.cart?.length || !methods.length) return null

  const thresholdOf = (m: (typeof methods)[number]) => {
    const n = Number(m.attributes?.free_shipping_over ?? 0)
    return Number.isFinite(n) && n > 0 ? n : null
  }
  const selected = methods.find((m) => String(m.id) === String(checkout.shippingMethod?.id ?? ''))
  // Μέθοδος που είναι πάντα δωρεάν (π.χ. παραλαβή από το κατάστημα) → δεν χρειάζεται μπάρα
  if (selected?.attributes?.is_free_shipping) return null

  const threshold = selected
    ? thresholdOf(selected)
    : methods.map(thresholdOf).filter((x): x is number => x != null).sort((a, b) => a - b)[0] ?? null
  if (!threshold) return null

  // Σύνολο από το Strapi (quote)· μέχρι να έρθει, από τις τιμές του καλαθιού
  const fallback = checkout.cart.reduce(
    (sum, i) => sum + (i.is_sale && i.sale_price ? i.sale_price : i.price) * i.quantity,
    0
  )
  const amount = checkout.totals?.subtotal > 0 ? checkout.totals.subtotal : fallback
  const remaining = Math.max(0, Math.round((threshold - amount) * 100) / 100)
  const pct = Math.min(100, Math.round((amount / threshold) * 100))
  const done = remaining <= 0

  return (
    <div className={`rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-3 ${className}`}>
      <p className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-200">
        <FaTruckFast className={done ? 'text-green-600' : 'text-siteColors-blue'} aria-hidden="true" />
        {done ? (
          <span className="font-semibold text-green-700 dark:text-green-400">Έχεις δωρεάν μεταφορικά!</span>
        ) : (
          <span>
            Σου λείπουν <strong>{money(remaining)}</strong> για <strong>δωρεάν μεταφορικά</strong>
          </span>
        )}
      </p>
      <div
        className="mt-2 h-2 w-full overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700"
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={pct}
        aria-label="Πρόοδος για δωρεάν μεταφορικά"
      >
        <div
          className={`h-full rounded-full transition-[width] duration-500 ${done ? 'bg-green-500' : 'bg-gradient-to-r from-siteColors-lightblue to-siteColors-blue'}`}
          style={{ width: `${pct}%` }}
        />
      </div>
      {!selected && (
        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Για παραγγελίες από {money(threshold)}</p>
      )}
    </div>
  )
}
