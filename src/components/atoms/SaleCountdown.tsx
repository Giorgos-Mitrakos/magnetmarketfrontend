'use client'
// Αντίστροφη μέτρηση μέχρι τη λήξη μιας προσφοράς (sale_ends_at).
// Ελαφρύ: ένα interval ανά μετρητή· στον server αποδίδεται μόνο το περίγραμμα
// (χωρίς ώρα), ώστε να μην υπάρχει ασυμφωνία hydration.
import { useEffect, useState } from 'react'
import { FaRegClock } from 'react-icons/fa6'

type Variant = 'card' | 'banner' | 'header'

function parts(ms: number) {
  const s = Math.max(0, Math.floor(ms / 1000))
  return {
    days: Math.floor(s / 86400),
    hours: Math.floor((s % 86400) / 3600),
    minutes: Math.floor((s % 3600) / 60),
    seconds: s % 60,
  }
}

const pad = (n: number) => String(n).padStart(2, '0')

export function formatCountdown(ms: number): string {
  const { days, hours, minutes, seconds } = parts(ms)
  const time = `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`
  return days > 0 ? `${days}${days === 1 ? ' μέρα' : ' μέρες'} ${time}` : time
}

export default function SaleCountdown({
  endsAt,
  variant = 'card',
  label = 'Λήγει σε',
}: {
  endsAt?: string | null
  variant?: Variant
  label?: string
}) {
  const end = endsAt ? new Date(endsAt).getTime() : NaN
  const [now, setNow] = useState<number | null>(null)

  useEffect(() => {
    if (!Number.isFinite(end)) return
    setNow(Date.now())
    const t = setInterval(() => {
      const n = Date.now()
      setNow(n)
      if (n >= end) clearInterval(t)
    }, 1000)
    return () => clearInterval(t)
  }, [end])

  if (!Number.isFinite(end)) return null
  const left = now == null ? null : end - now
  const expired = left != null && left <= 0
  const text = left == null ? '--:--:--' : expired ? 'Η προσφορά έληξε' : formatCountdown(left)

  if (variant === 'header') {
    return (
      <div
        className="inline-flex items-center gap-2 rounded-full bg-white/15 px-4 py-1.5 text-white font-semibold tabular-nums"
        role="timer"
        aria-live="off"
      >
        <FaRegClock aria-hidden="true" />
        {!expired && <span className="font-normal">{label}</span>}
        <span>{text}</span>
      </div>
    )
  }

  if (variant === 'banner') {
    return (
      <div
        className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold tabular-nums ${
          expired ? 'bg-gray-100 text-gray-500' : 'bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-300'
        }`}
        role="timer"
        aria-live="off"
      >
        <FaRegClock aria-hidden="true" />
        {!expired && <span className="font-normal">Η προσφορά λήγει σε</span>}
        <span>{text}</span>
      </div>
    )
  }

  return (
    <div
      className={`mt-2 flex items-center justify-center gap-1.5 text-xs font-semibold tabular-nums ${
        expired ? 'text-gray-400' : 'text-red-600 dark:text-red-400'
      }`}
      role="timer"
      aria-live="off"
    >
      <FaRegClock aria-hidden="true" />
      {!expired && <span className="font-normal">{label}</span>}
      <span>{text}</span>
    </div>
  )
}
