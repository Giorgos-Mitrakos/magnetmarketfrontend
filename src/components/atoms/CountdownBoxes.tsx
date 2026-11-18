'use client'
// Μεγάλη αντίστροφη μέτρηση σε «κουτάκια» (Μέρες · Ώρες · Λεπτά · Δευτ.)
// για καμπάνιες και την «Προσφορά της ημέρας».
// Στον server αποδίδονται παύλες (χωρίς ώρα), ώστε να μην υπάρχει ασυμφωνία hydration.
import { useEffect, useState } from 'react'

/** Χιλιοστά που απομένουν μέχρι το target (null πριν τρέξει στον browser) */
export function useTimeLeft(target?: string | null, onEnd?: () => void): number | null {
  const end = target ? new Date(target).getTime() : NaN
  const [now, setNow] = useState<number | null>(null)

  useEffect(() => {
    if (!Number.isFinite(end)) return
    setNow(Date.now())
    const t = setInterval(() => {
      const n = Date.now()
      setNow(n)
      if (n >= end) {
        clearInterval(t)
        onEnd?.()
      }
    }, 1000)
    return () => clearInterval(t)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [end])

  if (!Number.isFinite(end) || now == null) return null
  return Math.max(end - now, 0)
}

const pad = (n: number) => String(n).padStart(2, '0')

export default function CountdownBoxes({
  target,
  tone = 'light',
  size = 'lg',
  onEnd,
}: {
  target: string
  /** light: λευκά κουτάκια σε σκούρο φόντο · dark: σκούρα σε ανοιχτό φόντο */
  tone?: 'light' | 'dark'
  size?: 'md' | 'lg'
  onEnd?: () => void
}) {
  const left = useTimeLeft(target, onEnd)
  const s = left == null ? null : Math.floor(left / 1000)
  const parts = [
    { label: 'Μέρες', value: s == null ? '--' : String(Math.floor(s / 86400)) },
    { label: 'Ώρες', value: s == null ? '--' : pad(Math.floor((s % 86400) / 3600)) },
    { label: 'Λεπτά', value: s == null ? '--' : pad(Math.floor((s % 3600) / 60)) },
    { label: 'Δευτ.', value: s == null ? '--' : pad(s % 60) },
  ]

  const box =
    tone === 'light'
      ? 'bg-white/15 text-white ring-1 ring-white/25 backdrop-blur-sm'
      : 'bg-slate-900 text-white dark:bg-slate-700'
  const label = tone === 'light' ? 'text-white/80' : 'text-slate-500 dark:text-slate-400'
  const dims = size === 'lg' ? 'min-w-[3.5rem] px-2 py-2 text-2xl md:min-w-[4.5rem] md:text-4xl' : 'min-w-[3rem] px-2 py-1.5 text-xl'

  return (
    <div className="flex items-start gap-2 md:gap-3" role="timer" aria-live="off">
      {parts.map((p) => (
        <div key={p.label} className="flex flex-col items-center">
          <span className={`rounded-lg text-center font-bold tabular-nums ${box} ${dims}`}>{p.value}</span>
          <span className={`mt-1 text-xs ${label}`}>{p.label}</span>
        </div>
      ))}
    </div>
  )
}
