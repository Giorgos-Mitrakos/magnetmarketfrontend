'use client'
// Προτάσεις Τ.Κ. κάτω από το πεδίο (αντί για το <datalist> του browser, που
// εμφανίζεται διαφορετικά σε κάθε browser και στο Chrome σαν «φούσκα»).
//  - Αν η περιοχή έχει έναν μόνο Τ.Κ. και το πεδίο είναι κενό → συμπληρώνεται μόνος του
//  - Αλλιώς, όταν το πεδίο έχει την εστίαση, λίστα με τους Τ.Κ. που ταιριάζουν
// Ο γονέας του πεδίου πρέπει να έχει «relative».
import { useEffect, useRef, useState } from 'react'

export default function PostalSuggestions({
  inputId,
  codes,
  value,
  onPick,
}: {
  inputId: string
  codes: string[]
  value: string
  onPick: (code: string) => void
}) {
  const [open, setOpen] = useState(false)
  const pickRef = useRef(onPick)
  pickRef.current = onPick

  useEffect(() => {
    const el = document.getElementById(inputId)
    if (!el) return
    const show = () => setOpen(true)
    let t: ReturnType<typeof setTimeout> | undefined
    const hide = () => {
      t = setTimeout(() => setOpen(false), 150)
    }
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false)
    el.addEventListener('focus', show)
    el.addEventListener('input', show)
    el.addEventListener('blur', hide)
    el.addEventListener('keydown', onKey)
    return () => {
      if (t) clearTimeout(t)
      el.removeEventListener('focus', show)
      el.removeEventListener('input', show)
      el.removeEventListener('blur', hide)
      el.removeEventListener('keydown', onKey)
    }
  }, [inputId])

  // Ένας μόνο Τ.Κ. στην περιοχή → αυτόματη συμπλήρωση
  const only = codes.length === 1 ? codes[0] : null
  useEffect(() => {
    if (only && !value) pickRef.current(only)
  }, [only, value])

  const typed = String(value ?? '').replace(/\s+/g, '')
  const list = codes.filter((c) => c.replace(/\s+/g, '').startsWith(typed)).slice(0, 8)
  if (!open || !list.length || (list.length === 1 && list[0].replace(/\s+/g, '') === typed)) return null

  return (
    <ul
      role="listbox"
      aria-label="Ταχυδρομικοί κώδικες της περιοχής"
      className="absolute left-0 right-0 top-full z-30 mt-1 max-h-56 overflow-y-auto rounded-lg border border-gray-200 bg-white py-1 text-sm shadow-lg dark:border-slate-600 dark:bg-slate-700"
      onMouseDown={(e) => e.preventDefault()}
    >
      {list.map((c) => (
        <li key={c} role="option" aria-selected={c === value}>
          <button
            type="button"
            onClick={() => {
              onPick(c)
              setOpen(false)
            }}
            className="w-full px-3 py-2 text-left text-gray-800 hover:bg-slate-100 dark:text-slate-100 dark:hover:bg-slate-600"
          >
            {c}
          </button>
        </li>
      ))}
    </ul>
  )
}
