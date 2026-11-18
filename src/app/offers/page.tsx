// app/offers/page.tsx
// (2026-10-24) Νέα σελίδα προσφορών, ίδια λογική με κατηγορίες / κατασκευαστές:
//  - φίλτρα: κατασκευαστές, κατηγορίες, «Άμεσα διαθέσιμα», τιμή από / έως, «Λήγουν σύντομα»
//  - σειρά: προτεινόμενα (διαθέσιμα πρώτα, μετά η μεγαλύτερη έκπτωση), μεγαλύτερη έκπτωση,
//    λήγουν σύντομα, τιμή, όνομα
//  - μία κλήση στο Strapi για σελίδα + metadata (React cache), noindex στα φιλτραρισμένα
//  - χωρίς γενικά κείμενα που δεν ισχύουν (24/7, 100% κ.λπ.)

import { cache } from 'react'
import Link from 'next/link'
import { Metadata } from 'next'
import Breadcrumb from '@/components/molecules/breadcrumb'
import PaginationBar from '@/components/molecules/pagination'
import CategoryFilters from '@/components/organisms/categoryFilters'
import CategoryPageHeader from '@/components/organisms/categoryPageHeader'
import MobileFilters from '@/components/organisms/mobileFilters'
import ProductCard from '@/components/organisms/productCard'
import AvailabilityFilter from '@/components/molecules/AvailabilityFilter'
import ActiveFilters from '@/components/molecules/ActiveFilters'
import EmptyResults from '@/components/molecules/EmptyResults'
import { organizationStructuredData, storeStructuredData } from '@/lib/helpers/structureData'
import { IProductCard } from '@/lib/interfaces/product'
import { jsonLd } from '@/lib/helpers/jsonLd'
import { getStrapiMedia } from '@/repositories/medias'
import type { BreadcrumbList, CollectionPage, ItemList, Offer as SchemaOffer, Product as SchemaProduct } from 'schema-dts'

export const revalidate = 300

const BASE_URL = process.env.NEXT_URL || 'https://magnetmarket.gr'
const PAGE_URL = `${BASE_URL}/offers`

type SearchParamsProps = { [key: string]: string | string[] | undefined }
type PageProps = { searchParams: Promise<SearchParamsProps> }
type FilterGroup = { title: string; filterBy: string; filterValues: Array<{ name: string; slug: string; numberOfItems: number }> }

interface OffersResponse {
  products: IProductCard[]
  meta: { pagination: { total: number; page: number; pageSize: number; pageCount: number } }
  priceRange?: { min: number; max: number } | null
  filters: FilterGroup[]
  stats?: { maxDiscount: number; endingSoon: number }
}

const one = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v)

/** Παράμετροι λίστας που στέλνονται στο Strapi (μονές τιμές) */
const LIST_PARAMS = ['sort', 'page', 'pageSize', 'stock', 'price_min', 'price_max', 'ending']
/** Φίλτρα με πολλές τιμές (filterBy των ομάδων φίλτρων) */
const MULTI_PARAMS = ['brands', 'Κατηγορίες', 'Κατασκευαστές'] // «Κατασκευαστές»: παλιοί σύνδεσμοι

/** Ίδιο αίτημα για σελίδα και metadata → μία κλήση στο Strapi */
const getOffers = cache(async (query: string): Promise<OffersResponse> => {
  const qs = new URLSearchParams(query)
  const body: Record<string, unknown> = {}
  for (const k of LIST_PARAMS) {
    const v = qs.get(k)
    if (v) body[k] = v
  }
  for (const k of MULTI_PARAMS) {
    const v = qs.getAll(k)
    if (v.length) body[k] = v
  }
  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/product/getOffers`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
    next: { revalidate: 300 },
  })
  if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`)
  return (await response.json()) as OffersResponse
})

function load(sp: SearchParamsProps) {
  const qs = new URLSearchParams()
  for (const k of [...LIST_PARAMS, ...MULTI_PARAMS]) {
    const v = sp[k]
    for (const x of Array.isArray(v) ? v : v != null ? [v] : []) qs.append(k, x)
  }
  qs.sort()
  return getOffers(qs.toString())
}

/** Διεύθυνση με αλλαγμένη μία παράμετρο (χωρίς σελίδα) — για τα κουμπιά πάνω από τη λίστα */
function hrefWith(sp: SearchParamsProps, key: string, value: string | null) {
  const qs = new URLSearchParams()
  for (const [k, v] of Object.entries(sp)) {
    if (k === 'page' || k === key || v == null) continue
    for (const x of Array.isArray(v) ? v : [v]) qs.append(k, x)
  }
  if (value) qs.set(key, value)
  const q = qs.toString()
  return `/offers${q ? `?${q}` : ''}`
}

function schemaAvailability(status: string) {
  if (status === 'InStock' || status === 'MediumStock' || status === 'LowStock') return 'https://schema.org/InStock'
  if (status === 'Backorder' || status === 'IsExpected') return 'https://schema.org/BackOrder'
  return 'https://schema.org/OutOfStock'
}

function structuredData(products: IProductCard[], currentPage: number, pageSize: number) {
  const fullUrl = currentPage > 1 ? `${PAGE_URL}?page=${currentPage}` : PAGE_URL

  const breadcrumbList: BreadcrumbList = {
    '@type': 'BreadcrumbList',
    '@id': `${fullUrl}#breadcrumb`,
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Αρχική', item: BASE_URL },
      { '@type': 'ListItem', position: 2, name: 'Προσφορές', item: PAGE_URL },
    ],
  }

  const collectionPage: CollectionPage = {
    '@type': 'CollectionPage',
    '@id': `${fullUrl}#webpage`,
    url: fullUrl,
    name: currentPage > 1 ? `Προσφορές — Σελίδα ${currentPage}` : 'Προσφορές',
    isPartOf: { '@id': `${BASE_URL}/#website` },
    breadcrumb: { '@id': `${fullUrl}#breadcrumb` },
    inLanguage: 'el-GR',
  }

  const itemList: ItemList = {
    '@type': 'ItemList',
    '@id': `${fullUrl}#itemlist`,
    numberOfItems: products.length,
    itemListElement: products.map((product, index) => {
      const url = `${BASE_URL}/product/${product.slug}`
      const offer: SchemaOffer = {
        '@type': 'Offer',
        price: product.sale_price || product.price,
        priceCurrency: 'EUR',
        availability: schemaAvailability(product.status),
        // Μόνο όταν η προσφορά έχει πραγματική ημερομηνία λήξης
        ...(product.sale_ends_at ? { priceValidUntil: product.sale_ends_at.slice(0, 10) } : {}),
        url,
        itemCondition: 'https://schema.org/NewCondition',
      }
      const node: SchemaProduct = {
        '@type': 'Product',
        name: product.name,
        url,
        ...(product.image?.url ? { image: getStrapiMedia(product.image.url) ?? undefined } : {}),
        ...(product.brand ? { brand: { '@type': 'Brand', name: product.brand.name } } : {}),
        ...(product.mpn ? { mpn: product.mpn } : {}),
        ...(product.barcode ? { gtin13: product.barcode } : {}),
        offers: offer,
      }
      return { '@type': 'ListItem' as const, position: (currentPage - 1) * pageSize + index + 1, item: node }
    }),
  }

  return {
    '@context': 'https://schema.org',
    '@graph': [organizationStructuredData, storeStructuredData, breadcrumbList, collectionPage, itemList],
  }
}

export default async function OffersPage({ searchParams }: PageProps) {
  const sp = await searchParams
  const response = await load(sp)
  const currentPage = Number(one(sp.page)) || 1
  const { total, pageSize, pageCount, page } = response.meta.pagination
  const stats = response.stats ?? { maxDiscount: 0, endingSoon: 0 }
  const endingActive = one(sp.ending) === 'true'

  // Κουμπιά κατηγοριών: οι 12 με τις περισσότερες προσφορές
  const categoryChips = [...(response.filters.find((f) => f.filterBy === 'Κατηγορίες')?.filterValues ?? [])]
    .filter((c) => c.slug)
    .sort((a, b) => b.numberOfItems - a.numberOfItems)
    .slice(0, 12)
  const rawCats = sp['Κατηγορίες']
  const activeCategories = (Array.isArray(rawCats) ? rawCats : rawCats ? [rawCats] : []).map((c) => c.toLowerCase())
  const chipClass = 'shrink-0 whitespace-nowrap rounded-full border px-3 py-1.5 text-sm font-medium transition'
  const chipActive = 'border-siteColors-purple bg-siteColors-purple text-white'
  const chipIdle =
    'border-slate-200 bg-white text-slate-700 hover:border-siteColors-purple hover:text-siteColors-purple dark:border-slate-600 dark:bg-slate-700 dark:text-slate-200'

  const breadcrumbs = [
    { title: 'Αρχική', slug: '/' },
    { title: 'Προσφορές', slug: '/offers' },
  ]

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLd(structuredData(response.products, currentPage, pageSize)) }}
        suppressHydrationWarning
      />
      <div className="min-h-screen">
        <Breadcrumb breadcrumbs={breadcrumbs} />

        <header className="mb-6 mt-6 flex flex-col items-center gap-2 text-center">
          <h1 className="text-3xl font-bold text-siteColors-purple dark:text-siteColors-pink md:text-4xl">Προσφορές</h1>
          <p className="text-gray-600 dark:text-gray-300">
            {total} {total === 1 ? 'προϊόν' : 'προϊόντα'} σε προσφορά
            {stats.maxDiscount >= 5 && (
              <>
                {' '}· έκπτωση έως <strong className="text-red-600 dark:text-red-400">-{stats.maxDiscount}%</strong>
              </>
            )}
          </p>
        </header>

        {/* Γρήγορες επιλογές: λήγουν σύντομα + κατηγορίες */}
        {(stats.endingSoon > 0 || endingActive || categoryChips.length > 1) && (
          <nav aria-label="Γρήγορα φίλτρα προσφορών" className="mb-4 flex gap-2 overflow-x-auto pb-1 sm:flex-wrap sm:justify-center">
            {(stats.endingSoon > 0 || endingActive) && (
              <Link
                href={hrefWith(sp, 'ending', endingActive ? null : 'true')}
                scroll={false}
                aria-current={endingActive ? 'page' : undefined}
                className={`${chipClass} ${
                  endingActive
                    ? 'border-red-600 bg-red-600 text-white'
                    : 'border-red-200 bg-red-50 text-red-700 hover:border-red-500 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300'
                }`}
              >
                ⏳ Λήγουν σύντομα <span className="opacity-70">({stats.endingSoon})</span>
              </Link>
            )}
            {categoryChips.length > 1 && (
              <>
                <Link
                  href={hrefWith(sp, 'Κατηγορίες', null)}
                  scroll={false}
                  aria-current={!activeCategories.length ? 'page' : undefined}
                  className={`${chipClass} ${!activeCategories.length ? chipActive : chipIdle}`}
                >
                  Όλες οι κατηγορίες
                </Link>
                {categoryChips.map((c) => {
                  const active = activeCategories.includes(c.slug.toLowerCase())
                  return (
                    <Link
                      key={c.slug}
                      href={hrefWith(sp, 'Κατηγορίες', active ? null : c.slug)}
                      scroll={false}
                      aria-current={active ? 'page' : undefined}
                      className={`${chipClass} ${active ? chipActive : chipIdle}`}
                    >
                      {c.name} <span className="opacity-70">({c.numberOfItems})</span>
                    </Link>
                  )
                })}
              </>
            )}
          </nav>
        )}

        <div className="mb-8 grid w-full bg-white pt-4 dark:bg-slate-800">
          <div className="grid gap-4 lg:grid-cols-4">
            <aside
              className="hidden rounded-lg border border-gray-100 bg-slate-50 p-5 shadow-sm dark:border-slate-700 dark:bg-slate-800 lg:flex lg:flex-col"
              aria-label="Φίλτρα προϊόντων"
            >
              <CategoryFilters availableFilters={response.filters} priceRange={response.priceRange ?? null} idPrefix="d" />
            </aside>

            <div className="col-span-3 flex w-full min-w-0 flex-col px-2 lg:pl-0 lg:pr-4">
              <CategoryPageHeader
                totalItems={total}
                extraSorts={[
                  { title: 'ΜΕΓΑΛΥΤΕΡΗ ΕΚΠΤΩΣΗ', route: 'discount:desc' },
                  { title: 'ΛΗΓΟΥΝ ΣΥΝΤΟΜΑ', route: 'ends:asc' },
                ]}
              />
              <AvailabilityFilter />
              <ActiveFilters availableFilters={response.filters} />

              {response.products.length > 0 ? (
                <section className="grid grid-cols-1 place-content-center gap-1 sm:grid-cols-2 md:grid-cols-3" aria-label="Προϊόντα σε προσφορά">
                  {response.products.map((product) => (
                    <article key={product.id}>
                      <ProductCard product={product} />
                    </article>
                  ))}
                </section>
              ) : (
                <EmptyResults />
              )}

              <MobileFilters availableFilters={response.filters} priceRange={response.priceRange ?? null} totalItems={total} />

              {pageCount > 1 && <PaginationBar totalItems={total} currentPage={page} itemsPerPage={pageSize} />}
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export async function generateMetadata({ searchParams }: PageProps): Promise<Metadata> {
  const sp = await searchParams
  const response = await load(sp)
  const currentPage = Number(one(sp.page)) || 1
  const fullUrl = currentPage > 1 ? `${PAGE_URL}?page=${currentPage}` : PAGE_URL
  const total = response.meta.pagination.total
  const maxDiscount = response.stats?.maxDiscount ?? 0

  const baseTitle = 'Προσφορές | Magnet Market'
  const title = currentPage > 1 ? `Προσφορές — Σελίδα ${currentPage} | Magnet Market` : baseTitle
  const description =
    `${total} προϊόντα σε προσφορά στο Magnet Market` +
    (maxDiscount >= 5 ? `, με έκπτωση έως ${maxDiscount}%.` : '.') +
    ' Δείτε διαθεσιμότητα και χρόνο παράδοσης σε κάθε προϊόν.'

  // Φίλτρα / ταξινόμηση → όχι στη Google (canonical: η καθαρή σελίδα)
  const hasFilters = Object.keys(sp).some((k) => k !== 'page')
  const index = !hasFilters

  return {
    title,
    description,
    robots: {
      index,
      follow: true,
      googleBot: { index, follow: true, 'max-image-preview': 'large', 'max-snippet': -1 },
    },
    alternates: { canonical: fullUrl },
    openGraph: { title, description, url: fullUrl, siteName: 'Magnet Market', locale: 'el_GR', type: 'website' },
    twitter: { card: 'summary_large_image', title, description },
  }
}
