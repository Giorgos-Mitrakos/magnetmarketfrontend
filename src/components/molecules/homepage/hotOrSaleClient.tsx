// components/molecules/homepage/hotOrSaleClient.tsx
//
// Λίστα προϊόντων με χρωματιστή κεφαλίδα (style «header» στο block του admin).
// Server component (το όνομα του αρχείου έμεινε από την παλιά έκδοση): τα
// προϊόντα έρχονται έτοιμα στο HTML. Το Analytics μετράει τη λίστα όταν φανεί.
import Carousel from '@/components/atoms/carousel'
import ViewListTracker from '@/components/atoms/ViewListTracker'
import { IProductCard } from '@/lib/interfaces/product'
import SaleCountdown from '@/components/atoms/SaleCountdown'

interface HotOrSaleProps {
  id: string
  title: string
  type: string
  initialData: IProductCard[] | null
  /** Αντίστροφη μέτρηση στην κεφαλίδα (προσφορές που λήγουν) */
  endsAt?: string | null
}

const HEADER_COLORS: Record<string, string> = {
  hot: 'bg-[#a9488e] dark:bg-gradient-to-br dark:from-[#5a2349] dark:to-[#8c3a75]',
  new: 'bg-[#246eb5] dark:bg-gradient-to-br dark:from-[#153a61] dark:to-[#1e5a95]',
  sale: 'bg-[#6e276f] dark:bg-gradient-to-br dark:from-[#3d183e] dark:to-[#5a205b]',
  expected: 'bg-[#f97316] dark:bg-gradient-to-br dark:from-[#9a3412] dark:to-[#ea580c]',
  backorder: 'bg-[#dc2626] dark:bg-gradient-to-br dark:from-[#991b1b] dark:to-[#b91c1c]',
  default: 'bg-[#24488f] dark:bg-gradient-to-br dark:from-[#132247] dark:to-[#1d3a72]',
}

export default function HotOrSaleClient({ id, title, type, initialData, endsAt }: HotOrSaleProps) {
  if (!initialData?.length) return null
  const listId = `homepage_${type}_${id}`

  return (
    <section id={id} className="my-8">
      <div className="rounded-xl shadow-lg overflow-hidden border border-gray-200 dark:border-slate-700">
        <div className={`${HEADER_COLORS[type] ?? HEADER_COLORS.default} text-white dark:text-slate-200 py-4 px-6`}>
          <h2 className="text-center text-xl md:text-2xl font-bold">{title}</h2>
          {endsAt && (
            <div className="mt-2 text-center">
              <SaleCountdown endsAt={endsAt} variant="header" label="Η πρώτη λήγει σε" />
            </div>
          )}
        </div>
        <div className="bg-white dark:bg-slate-800 px-2 sm:px-4 py-2">
          <ViewListTracker products={initialData} listName={title} listId={listId}>
            <Carousel products={initialData} listName={title} listId={listId} />
          </ViewListTracker>
        </div>
      </div>
    </section>
  )
}
