'use client'
/**
 * (2026-10-23) Εκτιμώμενη παράδοση στη σελίδα προϊόντος.
 * Τις ημερομηνίες τις υπολογίζει ο Strapi (src/storefront/delivery.ts — εργάσιμες,
 * αργίες, ώρα αποκοπής / ώρα παραγγελίας και χρόνος του προμηθευτή). Εδώ μόνο η αντίστροφη μέτρηση· όταν λήξει, δείχνουμε
 * την εκτίμηση «next» (αποστολή την επόμενη εργάσιμη).
 * Ενεργοποίηση/ρυθμίσεις: Product Manager → Ρυθμίσεις → Λειτουργίες σελίδας προϊόντος.
 */
import { useEffect, useState } from 'react'
import { FaTruckFast } from 'react-icons/fa6'
import type { IDeliveryEstimate, IDeliveryWindow } from '@/lib/interfaces/product'

const DAYS = ['Κυριακή', 'Δευτέρα', 'Τρίτη', 'Τετάρτη', 'Πέμπτη', 'Παρασκευή', 'Σάββατο']

function dayLabel(ymd: string): string {
  const [y, m, d] = ymd.split('-').map(Number)
  const wd = new Date(Date.UTC(y, m - 1, d)).getUTCDay()
  return `${DAYS[wd]} ${d}/${m}`
}

function windowLabel(w: IDeliveryWindow): string {
  return w.from === w.to ? dayLabel(w.from) : `${dayLabel(w.from)} – ${dayLabel(w.to)}`
}

function remaining(ms: number): string {
  const mins = Math.max(1, Math.ceil(ms / 60_000))
  const h = Math.floor(mins / 60)
  const m = mins % 60
  if (h === 0) return `${m} ${m === 1 ? 'λεπτό' : 'λεπτά'}`
  return m ? `${h} ${h === 1 ? 'ώρα' : 'ώρες'} και ${m}′` : `${h} ${h === 1 ? 'ώρα' : 'ώρες'}`
}

export default function DeliveryEstimate({ delivery }: { delivery: IDeliveryEstimate }) {
  // Η ώρα μετριέται μόνο στον browser (αποφυγή hydration mismatch)
  const [now, setNow] = useState<number | null>(null)
  useEffect(() => {
    if (!delivery.cutoffAt) return
    setNow(Date.now())
    const t = setInterval(() => setNow(Date.now()), 30_000)
    return () => clearInterval(t)
  }, [delivery.cutoffAt])

  const cutoff = delivery.cutoffAt ? Date.parse(delivery.cutoffAt) : null
  const expired = cutoff != null && now != null && now >= cutoff
  const w: IDeliveryWindow = expired && delivery.next ? delivery.next : delivery
  const countdown = !expired && cutoff != null && now != null ? remaining(cutoff - now) : null

  return (
    <div className="mt-3 flex items-start gap-2.5 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-900 dark:border-emerald-800 dark:bg-emerald-900/20 dark:text-emerald-100">
      <FaTruckFast className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-300" aria-hidden />
      <div className="min-w-0">
        <p>
          <span className="font-semibold">Παράδοση: {windowLabel(w)}</span>
        </p>
        {countdown ? (
          <p className="text-emerald-800 dark:text-emerald-200">
            Παραγγείλτε μέσα σε <span className="font-semibold">{countdown}</span>{' '}
            {delivery.source === 'stock' ? 'για αποστολή σήμερα' : 'για να ισχύει αυτή η ημερομηνία'}
          </p>
        ) : null}
        <p className="mt-0.5 text-xs text-emerald-700/80 dark:text-emerald-300/80">
          Εκτίμηση για αποστολή με courier· σε νησιά και δυσπρόσιτες περιοχές ίσως 1–2 εργάσιμες ακόμη.
        </p>
      </div>
    </div>
  )
}
