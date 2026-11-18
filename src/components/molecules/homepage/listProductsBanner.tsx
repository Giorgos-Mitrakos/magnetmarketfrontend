// components/molecules/homepage/listProductsBanner.tsx
//
// Λίστα προϊόντων σε φόντο gradient (style «gradient» στο block του admin).
// Server component: τα προϊόντα έρχονται έτοιμα στο HTML.
import Carousel from '@/components/atoms/carousel'
import ViewListTracker from '@/components/atoms/ViewListTracker'
import { IProductCard } from '@/lib/interfaces/product'
import SaleCountdown from '@/components/atoms/SaleCountdown'

interface ListProductsBannerProps {
  id: string
  title: string
  subtitle?: string
  products: IProductCard[] | null
  /** Αντίστροφη μέτρηση στην κεφαλίδα (προσφορές που λήγουν) */
  endsAt?: string | null
}

export default function ListProductsBanner({ id, title, subtitle, products, endsAt }: ListProductsBannerProps) {
  if (!products?.length) return null
  const listId = `homepage_list_${id}`

  return (
    <section
      id={id}
      className="my-8 rounded-xl bg-gradient-to-br from-siteColors-purple via-siteColors-pink dark:via-siteColors-blue to-siteColors-lightblue dark:to-siteColors-purple px-3 sm:px-6 py-8 shadow-lg"
    >
      <div className="text-center mb-6">
        <h2 className="py-2 text-white text-2xl md:text-4xl font-bold tracking-tight drop-shadow-md">{title}</h2>
        {subtitle && <p className="text-white/90 text-lg max-w-2xl mx-auto">{subtitle}</p>}
        {endsAt && (
          <div className="mt-3">
            <SaleCountdown endsAt={endsAt} variant="header" label="Η πρώτη λήγει σε" />
          </div>
        )}
      </div>

      <ViewListTracker products={products} listName={title} listId={listId}>
        <Carousel products={products} listName={title} listId={listId} arrows="light" />
      </ViewListTracker>
    </section>
  )
}
