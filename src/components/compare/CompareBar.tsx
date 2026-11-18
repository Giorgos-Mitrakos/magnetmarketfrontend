'use client'
/**
 * (2026-10-23) Μπάρα σύγκρισης στο κάτω μέρος, όταν έχουν επιλεγεί προϊόντα.
 * Δεν εμφανίζεται στη σελίδα σύγκρισης και στο ταμείο.
 */
import { useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { FaXmark } from 'react-icons/fa6'
import { getStrapiMedia } from '@/repositories/medias'
import { clearCompare, compareUrl, removeFromCompare, useCompare, COMPARE_MAX } from '@/lib/helpers/compareStore'

export default function CompareBar() {
  const items = useCompare()
  const pathname = usePathname() ?? ''
  const visible = items.length > 0 && !pathname.startsWith('/compare') && !pathname.startsWith('/checkout')

  // (2026-10-24) Τα στρογγυλά κουμπιά «Φίλτρα» (κινητό) ανεβαίνουν πάνω από τη μπάρα:
  // bottom-[calc(6rem+var(--compare-offset,0px))]
  useEffect(() => {
    const root = document.documentElement
    root.style.setProperty('--compare-offset', visible ? '5.5rem' : '0px')
    return () => root.style.setProperty('--compare-offset', '0px')
  }, [visible])

  if (!visible) return null

  return (
    <div className="fixed inset-x-2 bottom-20 z-40 mx-auto max-w-3xl rounded-xl border border-slate-200 bg-white/95 p-3 shadow-lg backdrop-blur dark:border-slate-600 dark:bg-slate-800/95 md:bottom-4" role="region" aria-label="Σύγκριση προϊόντων">
      <div className="flex items-center gap-3">
        <ul className="flex min-w-0 flex-1 gap-2 overflow-x-auto">
          {items.map(it => {
            const img = it.image ? getStrapiMedia(it.image) : null
            return (
              <li key={it.documentId} className="relative shrink-0">
                <span className="relative block h-12 w-12 overflow-hidden rounded-md border border-slate-200 bg-white dark:border-slate-600" title={it.name}>
                  {img && <Image src={img} alt={it.name} fill sizes="48px" className="object-contain" />}
                </span>
                <button
                  type="button"
                  onClick={() => removeFromCompare(it.documentId)}
                  aria-label={`Αφαίρεση: ${it.name}`}
                  className="absolute -right-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-slate-700 text-white hover:bg-red-600"
                >
                  <FaXmark className="h-3 w-3" aria-hidden />
                </button>
              </li>
            )
          })}
          {Array.from({ length: COMPARE_MAX - items.length }).map((_, i) => (
            <li key={`e${i}`} className="hidden h-12 w-12 shrink-0 rounded-md border border-dashed border-slate-300 dark:border-slate-600 sm:block" aria-hidden />
          ))}
        </ul>
        <div className="flex shrink-0 flex-col items-end gap-1 sm:flex-row sm:items-center sm:gap-3">
          <button type="button" onClick={clearCompare} className="text-xs text-slate-500 underline-offset-2 hover:underline dark:text-slate-400">
            Καθαρισμός
          </button>
          {items.length > 1 ? (
            <Link href={compareUrl(items)} className="rounded-lg bg-siteColors-purple px-4 py-2 text-sm font-semibold text-white hover:opacity-90">
              Σύγκριση ({items.length})
            </Link>
          ) : (
            <span className="text-xs text-slate-500 dark:text-slate-400">Προσθέστε άλλο ένα προϊόν</span>
          )}
        </div>
      </div>
    </div>
  )
}
