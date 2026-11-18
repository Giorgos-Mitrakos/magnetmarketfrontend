'use client'
// Μενού λογαριασμού στην κεφαλίδα: εικονίδιο χρήστη → μικρή κάρτα με
// «Ο λογαριασμός μου / Παραγγελίες / Αγαπημένα / Αποσύνδεση» (ή «Σύνδεση /
// Εγγραφή» για επισκέπτες). Ανοίγει με κλικ ή hover, κλείνει με Esc ή κλικ έξω.
import { useEffect, useId, useRef, useState } from 'react'
import Link from 'next/link'
import { signIn, signOut } from 'next-auth/react'
import { AiOutlineUser } from 'react-icons/ai'
import { FaRegHeart, FaBoxOpen, FaRightFromBracket, FaRegCircleUser } from 'react-icons/fa6'

export default function AccountMenu({ user }: { user?: string | null }) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const menuId = useId()
  const closeTimer = useRef<ReturnType<typeof setTimeout>>(undefined)

  useEffect(() => {
    if (!open) return
    const onDoc = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false)
    document.addEventListener('mousedown', onDoc)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onDoc)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  const enter = () => {
    if (closeTimer.current) clearTimeout(closeTimer.current)
    setOpen(true)
  }
  const leave = () => {
    closeTimer.current = setTimeout(() => setOpen(false), 200)
  }

  const item =
    'flex w-full items-center gap-3 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 hover:text-siteColors-purple dark:text-slate-200 dark:hover:bg-slate-700'

  return (
    <div ref={ref} className="relative" onMouseEnter={enter} onMouseLeave={leave}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={menuId}
        aria-label={user ? `Λογαριασμός: ${user}` : 'Λογαριασμός'}
        className="flex items-center justify-center p-3 text-xl text-siteColors-purple xs:text-2xl sm:p-4 md:text-3xl dark:text-slate-200"
      >
        <AiOutlineUser aria-hidden="true" />
      </button>

      {open && (
        <div
          id={menuId}
          role="menu"
          className="absolute right-0 top-full z-50 mt-1 w-64 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xl dark:border-slate-600 dark:bg-slate-800"
        >
          {user ? (
            <>
              <div className="flex items-center gap-3 border-b border-slate-100 px-4 py-3 dark:border-slate-700">
                <FaRegCircleUser className="h-8 w-8 flex-shrink-0 text-siteColors-purple dark:text-slate-300" aria-hidden="true" />
                <div className="min-w-0">
                  <p className="text-xs text-slate-500 dark:text-slate-400">Συνδεδεμένος ως</p>
                  <p className="truncate font-semibold text-slate-800 dark:text-slate-100" title={user}>
                    {user}
                  </p>
                </div>
              </div>
              <Link role="menuitem" href="/account" className={item} onClick={() => setOpen(false)}>
                <FaRegCircleUser aria-hidden="true" /> Ο λογαριασμός μου
              </Link>
              <Link role="menuitem" href="/account?tab=orders" className={item} onClick={() => setOpen(false)}>
                <FaBoxOpen aria-hidden="true" /> Οι παραγγελίες μου
              </Link>
              <Link role="menuitem" href="/account?tab=wishlist" className={item} onClick={() => setOpen(false)}>
                <FaRegHeart aria-hidden="true" /> Αγαπημένα &amp; ειδοποιήσεις
              </Link>
              <button
                role="menuitem"
                type="button"
                className={`${item} border-t border-slate-100 text-red-600 hover:text-red-700 dark:border-slate-700 dark:text-red-400`}
                onClick={() => signOut({ callbackUrl: '/' })}
              >
                <FaRightFromBracket aria-hidden="true" /> Αποσύνδεση
              </button>
            </>
          ) : (
            <div className="p-4">
              <p className="mb-3 text-sm text-slate-600 dark:text-slate-300">
                Συνδεθείτε για τις παραγγελίες, τα αγαπημένα και τις ειδοποιήσεις σας.
              </p>
              <button
                role="menuitem"
                type="button"
                onClick={() => signIn()}
                className="w-full rounded-lg bg-gradient-to-r from-siteColors-purple to-siteColors-pink px-4 py-2 font-semibold text-white hover:opacity-90"
              >
                Σύνδεση
              </button>
              <Link
                role="menuitem"
                href="/register"
                onClick={() => setOpen(false)}
                className="mt-2 block w-full rounded-lg border border-slate-300 px-4 py-2 text-center font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-600 dark:text-slate-200 dark:hover:bg-slate-700"
              >
                Δημιουργία λογαριασμού
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
