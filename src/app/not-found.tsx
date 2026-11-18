// app/not-found.tsx — «Η σελίδα δεν βρέθηκε» (2026-10-26)
// Εμφανίζεται για κάθε notFound() και για διευθύνσεις που δεν υπάρχουν.
// Το Next δίνει μόνο του status 404 και noindex.
import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Η σελίδα δεν βρέθηκε | Magnet Market',
}

export default function NotFound() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4 py-16">
      <div className="max-w-xl w-full text-center">
        <p className="text-6xl font-extrabold text-siteColors-purple/30 dark:text-slate-500">404</p>
        <h1 className="mt-2 text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
          Η σελίδα δεν βρέθηκε
        </h1>
        <p className="mt-3 text-gray-600 dark:text-gray-300">
          Ίσως το προϊόν δεν διατίθεται πια ή ο σύνδεσμος άλλαξε. Δοκιμάστε μια αναζήτηση:
        </p>

        <form action="/search" method="get" role="search" className="mt-6 flex gap-2">
          <label htmlFor="nf-search" className="sr-only">Αναζήτηση προϊόντων</label>
          <input
            id="nf-search"
            name="search"
            type="search"
            required
            placeholder="π.χ. κάμερα wifi, έξυπνη πρίζα…"
            className="flex-1 min-w-0 px-4 py-3 rounded-lg border-2 border-gray-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:outline-none focus:border-siteColors-purple"
          />
          <button type="submit" className="px-5 py-3 rounded-lg bg-siteColors-purple text-white font-semibold hover:bg-siteColors-pink transition-colors">
            Αναζήτηση
          </button>
        </form>

        <div className="mt-8 flex flex-wrap justify-center gap-3 text-sm">
          <Link href="/" className="px-4 py-2 rounded-lg border border-gray-300 dark:border-slate-600 text-gray-700 dark:text-gray-200 hover:border-siteColors-purple">
            Αρχική σελίδα
          </Link>
          <Link href="/offers" className="px-4 py-2 rounded-lg border border-gray-300 dark:border-slate-600 text-gray-700 dark:text-gray-200 hover:border-siteColors-purple">
            Προσφορές
          </Link>
          <Link href="/brands" className="px-4 py-2 rounded-lg border border-gray-300 dark:border-slate-600 text-gray-700 dark:text-gray-200 hover:border-siteColors-purple">
            Κατασκευαστές
          </Link>
        </div>
      </div>
    </div>
  )
}
