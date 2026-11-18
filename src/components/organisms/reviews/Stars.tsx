/** (2026-10-23) Αστέρια βαθμολογίας (μόνο εμφάνιση) — δεκαδικά με μερικό γέμισμα */
export default function Stars({ value, size = 'md', label }: { value: number; size?: 'sm' | 'md' | 'lg'; label?: string }) {
  const px = size === 'lg' ? 'h-6 w-6' : size === 'sm' ? 'h-3.5 w-3.5' : 'h-4 w-4'
  const pct = Math.max(0, Math.min(100, (value / 5) * 100))
  const row = (cls: string) => (
    <span className={`flex ${cls}`}>
      {[0, 1, 2, 3, 4].map(i => (
        <svg key={i} viewBox="0 0 20 20" className={`${px} shrink-0`} fill="currentColor" aria-hidden>
          <path d="M10 1.5l2.6 5.3 5.9.9-4.3 4.1 1 5.8L10 14.9l-5.2 2.7 1-5.8L1.5 7.7l5.9-.9z" />
        </svg>
      ))}
    </span>
  )
  return (
    <span className="relative inline-flex" role="img" aria-label={label ?? `${value.toLocaleString('el-GR')} από 5 αστέρια`}>
      {row('text-slate-300 dark:text-slate-600')}
      <span className="absolute inset-0 overflow-hidden" style={{ width: `${pct}%` }}>
        {row('text-amber-400')}
      </span>
    </span>
  )
}
