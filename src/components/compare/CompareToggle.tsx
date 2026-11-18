'use client'
/** (2026-10-23) «Σύγκριση» στη σελίδα προϊόντος (διακόπτης στον Product Manager) */
import Link from 'next/link'
import { toast } from 'sonner'
import { FaCodeCompare } from 'react-icons/fa6'
import { COMPARE_MAX, compareUrl, toggleCompare, useCompare, type CompareItem } from '@/lib/helpers/compareStore'

export default function CompareToggle({ item }: { item: CompareItem }) {
  const items = useCompare()
  const active = items.some(x => x.documentId === item.documentId)

  const onClick = () => {
    const res = toggleCompare(item)
    if (res === 'full') {
      toast.error(`Μπορείτε να συγκρίνετε έως ${COMPARE_MAX} προϊόντα — αφαιρέστε ένα πρώτα.`)
    } else if (res === 'added') {
      const others = items.filter(x => x.category && item.category && x.category !== item.category)
      if (others.length) toast.warning('Η σύγκριση βγάζει νόημα κυρίως για προϊόντα της ίδιας κατηγορίας.')
    }
  }

  return (
    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm">
      <button
        type="button"
        onClick={onClick}
        aria-pressed={active}
        className={`inline-flex items-center gap-2 rounded-lg border px-3 py-1.5 font-medium transition ${active ? 'border-siteColors-purple bg-siteColors-purple text-white' : 'border-slate-300 text-slate-700 hover:border-siteColors-purple hover:text-siteColors-purple dark:border-slate-600 dark:text-slate-200'}`}
      >
        <FaCodeCompare aria-hidden />
        {active ? 'Στη σύγκριση ✓' : 'Σύγκριση'}
      </button>
      {active && items.length > 1 && (
        <Link href={compareUrl(items)} className="font-medium text-siteColors-purple underline-offset-2 hover:underline dark:text-slate-200">
          Σύγκριση {items.length} προϊόντων →
        </Link>
      )}
    </div>
  )
}
