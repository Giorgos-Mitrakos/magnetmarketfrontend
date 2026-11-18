// components/templates/brandRoute.tsx
// Σελίδα κατασκευαστή /brands/{brand} και (2026-10-27) σελίδα «κατηγορία + μάρκα»
// /brands/{brand}/{category} (π.χ. «Κάμερες Ezviz»): ίδια λίστα, φίλτρα και σειρά,
// με δικό της τίτλο, περιγραφή, breadcrumbs και canonical.
//
// (2026-10-24) Όνομα / λογότυπο / περιγραφή / SEO από το Strapi (Product Manager →
// Κατασκευαστές), 404 για άγνωστο κατασκευαστή, μία κλήση (React cache) για
// σελίδα + metadata, χωρίς γενικά κείμενα. Σειρά προϊόντων ίδια με τις κατηγορίες.
// + ίδια φίλτρα με τις κατηγορίες (διαθέσιμα / προσφορές / τιμή), κουμπιά κατηγοριών,
//   πλαίσιο «Εγγύηση & service» και προαιρετική εικόνα εξώφυλλου.
//
// Η σελίδα «κατηγορία + μάρκα» μπαίνει στη Google μόνο με ≥ 3 προϊόντα (το αποφασίζει
// το Strapi: landing.indexable) και χωρίς φίλτρα.

import { cache } from 'react'
import Image from 'next/image'
import { Metadata } from 'next'
import { notFound, permanentRedirect } from 'next/navigation'
import Breadcrumb from '@/components/molecules/breadcrumb'
import PaginationBar from '@/components/molecules/pagination'
import Link from 'next/link'
import CategoryFilters from '@/components/organisms/categoryFilters'
import CategoryPageHeader from '@/components/organisms/categoryPageHeader'
import MobileFilters from '@/components/organisms/mobileFilters'
import ProductCard from '@/components/organisms/productCard'
import AvailabilityFilter from '@/components/molecules/AvailabilityFilter'
import ActiveFilters from '@/components/molecules/ActiveFilters'
import EmptyResults from '@/components/molecules/EmptyResults'
import BrandSupport, { type BrandSupportInfo } from '@/components/organisms/brandSupport'
import { generateBrandProductsStructuredData } from '@/lib/helpers/structuredDataHelpers'
import { IProductCard } from '@/lib/interfaces/product'
import { jsonLd } from '@/lib/helpers/jsonLd'
import { getStrapiMedia } from '@/repositories/medias'

export type BrandSearchParams = { [key: string]: string | string[] | undefined }

interface BrandSeo {
  metaTitle?: string | null
  metaDescription?: string | null
  metaRobots?: string | null
  canonicalURL?: string | null
  metaImage?: { url: string } | null
}

/** Η κατηγορία της σελίδας «κατηγορία + μάρκα» */
interface BrandLanding {
  name: string
  slug: string
  /** π.χ. "asfaleia/kameres" → /category/asfaleia/kameres */
  path: string
  chain: { name: string; slug: string }[]
  /** Προϊόντα της μάρκας στην κατηγορία (χωρίς φίλτρα) */
  total: number
  /** ≥ 3 προϊόντα → στη Google */
  indexable: boolean
  /** Όλα σε μία υποκατηγορία → canonical εκεί */
  canonicalCategory: string | null
}

interface BrandProductsResponse {
  products: IProductCard[]
  meta: { pagination: { total: number; page: number; pageSize: number; pageCount: number } }
  priceRange?: { min: number; max: number } | null
  filters: Array<{ title: string; filterBy: string; filterValues: Array<{ name: string; slug: string; numberOfItems: number }> }>
  landing?: BrandLanding | null
  brand: {
    name: string
    slug: string
    description?: string | null
    logo?: { url: string; alternativeText?: string | null; formats?: any } | null
    cover?: { url: string; alternativeText?: string | null; formats?: any } | null
    support?: BrandSupportInfo | null
    seo?: BrandSeo | null
  }
}

const one = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v)
const SITE = (process.env.NEXT_URL || 'https://magnetmarket.gr').replace(/\/+$/, '')
const euro = (n: number) => `${n.toLocaleString('el-GR', { maximumFractionDigits: 0 })} €`

/** Παράμετροι λίστας που στέλνονται στο Strapi */
const LIST_PARAMS = ['sort', 'page', 'pageSize', 'stock', 'sale', 'price_min', 'price_max']

/** Ίδιο αίτημα για σελίδα και metadata → μία κλήση στο Strapi (κλειδί: brand + κατηγορία + query) */
type BrandLoad = BrandProductsResponse | { redirect: string } | null
const isRedirect = (r: BrandLoad): r is { redirect: string } => !!r && 'redirect' in r

const getBrandProducts = cache(async (brand: string, category: string, query: string): Promise<BrandLoad> => {
  const qs = new URLSearchParams(query)
  const searchParams: Record<string, unknown> = {}
  for (const k of LIST_PARAMS) {
    const v = qs.get(k)
    if (v) searchParams[k] = v
  }
  const cats = qs.getAll('Κατηγορίες')
  if (cats.length) searchParams['Κατηγορίες'] = cats
  if (category) searchParams.category = category

  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/brands/getBrandProducts`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ brand, searchParams }),
    next: { revalidate: 600 },
  })
  if (response.status === 404) return null
  if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`)
  const json = await response.json()
  // (2026-10-28) Η μάρκα συγχωνεύτηκε σε άλλη: το Strapi στέλνει { redirect: νέο slug }
  if (json && typeof json.redirect === 'string') return { redirect: json.redirect as string }
  return json as BrandProductsResponse
})

function load(slug: string, category: string | null, sp: BrandSearchParams): Promise<BrandLoad> {
  const qs = new URLSearchParams()
  // Στη σελίδα «κατηγορία + μάρκα» η κατηγορία είναι στη διεύθυνση, όχι στο ?Κατηγορίες=
  for (const k of category ? LIST_PARAMS : [...LIST_PARAMS, 'Κατηγορίες']) {
    const v = sp[k]
    for (const x of Array.isArray(v) ? v : v != null ? [v] : []) qs.append(k, x)
  }
  qs.sort()
  return getBrandProducts(slug, category ?? '', qs.toString())
}

/** Κουμπιά κατηγοριών → σελίδα «κατηγορία + μάρκα» (κρατά τα υπόλοιπα φίλτρα, χωρίς σελίδα) */
function categoryHref(slug: string, sp: BrandSearchParams, category: string | null) {
  const qs = new URLSearchParams()
  for (const [k, v] of Object.entries(sp)) {
    if (k === 'page' || k === 'Κατηγορίες' || v == null) continue
    for (const x of Array.isArray(v) ? v : [v]) qs.append(k, x)
  }
  const q = qs.toString()
  return `/brands/${slug}${category ? `/${category}` : ''}${q ? `?${q}` : ''}`
}

/**
 * (2026-10-28) Λίστα κατηγοριών στα φίλτρα — στη σελίδα της μάρκας ΚΑΙ στη σελίδα
 * «κατηγορία + μάρκα», για αλλαγή κατηγορίας χωρίς επιστροφή. Σύνδεσμοι — όχι checkbox —
 * γιατί κάθε κατηγορία είναι δική της σελίδα (/brands/{μάρκα}/{κατηγορία}).
 * current = null → σελίδα της μάρκας (χωρίς «Όλες οι κατηγορίες» — είμαστε ήδη εκεί).
 */
function BrandCategoryList({ brandSlug, sp, categories, current }: {
  brandSlug: string
  sp: BrandSearchParams
  categories: { name: string; slug: string; numberOfItems: number }[]
  current: string | null
}) {
  const item = 'flex items-center justify-between gap-2 rounded-md px-2 py-2 text-sm transition-colors'
  return (
    <nav className="mt-6" aria-label="Κατηγορίες">
      <h2 className="mb-3 border-b border-gray-200 pb-3 text-lg font-semibold text-gray-900 dark:border-slate-600 dark:text-slate-100">Κατηγορίες</h2>
      <ul className="scrollbar max-h-64 overflow-y-auto rounded-lg border border-gray-200 bg-white p-3 shadow-sm dark:border-slate-700 dark:bg-slate-800">
        {current != null && (
          <li>
            <Link href={categoryHref(brandSlug, sp, null)} className={`${item} text-siteColors-purple hover:bg-gray-50 dark:text-siteColors-pink dark:hover:bg-slate-700/50`}>
              ← Όλες οι κατηγορίες
            </Link>
          </li>
        )}
        {categories.map((c) => {
          const active = current != null && c.slug.toLowerCase() === current.toLowerCase()
          return (
            <li key={c.slug}>
              <Link
                href={categoryHref(brandSlug, sp, c.slug)}
                aria-current={active ? 'page' : undefined}
                className={`${item} ${active
                  ? 'bg-blue-50 font-semibold text-siteColors-purple dark:bg-blue-900/20 dark:text-siteColors-pink'
                  : 'text-gray-700 hover:bg-gray-50 dark:text-slate-200 dark:hover:bg-slate-700/50'}`}
              >
                <span>{c.name}</span>
                <span className="shrink-0 text-xs text-gray-500 dark:text-slate-400">({c.numberOfItems})</span>
              </Link>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}

/** Τίτλος της σελίδας «κατηγορία + μάρκα»: «Κάμερες Ezviz» */
const landingTitle = (landing: BrandLanding, brandName: string) => `${landing.name} ${brandName}`

export async function BrandRoute({ slug, category = null, searchParams: sp }: { slug: string; category?: string | null; searchParams: BrandSearchParams }) {
  // Παλιός σύνδεσμος με ΜΙΑ κατηγορία (?Κατηγορίες=x) → η σελίδα «κατηγορία + μάρκα»
  const rawCat = sp['Κατηγορίες']
  if (!category && typeof rawCat === 'string' && rawCat.trim()) {
    permanentRedirect(categoryHref(slug, sp, rawCat.trim()))
  }
  const loaded = await load(slug, category, sp)
  // (2026-10-28) Παλιά διεύθυνση μάρκας που συγχωνεύτηκε → μόνιμα στη νέα (ίδια κατηγορία / φίλτρα)
  if (isRedirect(loaded)) {
    const qs = new URLSearchParams()
    for (const [k, v] of Object.entries(sp)) {
      for (const x of Array.isArray(v) ? v : v != null ? [v] : []) qs.append(k, x)
    }
    const q = qs.toString()
    permanentRedirect(`/brands/${loaded.redirect}${category ? `/${encodeURIComponent(category)}` : ''}${q ? `?${q}` : ''}`)
  }
  const response = loaded
  if (!response) notFound()
  const landing = category ? response.landing ?? null : null
  if (category && !landing) notFound()

  const { brand } = response
  const brandName = brand.name
  const currentPage = Number(one(sp.page)) || 1
  if (currentPage > 1 && currentPage > response.meta.pagination.pageCount) notFound()
  const pageUrl = `${SITE}/brands/${brand.slug}${landing ? `/${landing.slug}` : ''}`
  const fullUrl = currentPage > 1 ? `${pageUrl}?page=${currentPage}` : pageUrl
  const logoUrl = brand.logo?.url ? getStrapiMedia(brand.logo.formats?.small?.url || brand.logo.url) : null
  const coverUrl = !landing && brand.cover?.url ? getStrapiMedia(brand.cover.formats?.large?.url || brand.cover.url) : null
  const total = response.meta.pagination.total
  const totalLabel = `${total} ${total === 1 ? 'προϊόν' : 'προϊόντα'}`
  const heading = landing ? landingTitle(landing, brandName) : `Προϊόντα ${brandName}`

  // Κουμπιά κατηγοριών: οι 12 με τα περισσότερα προϊόντα (+ η τρέχουσα, αν δεν είναι μέσα)
  const allCategories = response.filters.find((f) => f.filterBy === 'Κατηγορίες')?.filterValues ?? []
  let categoryChips = [...allCategories]
    .filter((c) => c.slug)
    .sort((a, b) => b.numberOfItems - a.numberOfItems)
    .slice(0, 12)
  if (landing && !categoryChips.some((c) => c.slug === landing.slug)) {
    categoryChips = [{ name: landing.name, slug: landing.slug, numberOfItems: landing.total }, ...categoryChips.slice(0, 11)]
  }
  const rawCats = sp['Κατηγορίες']
  const activeCategories = landing
    ? [landing.slug.toLowerCase()]
    : (Array.isArray(rawCats) ? rawCats : rawCats ? [rawCats] : []).map((c) => c.toLowerCase())
  const chipClass = 'shrink-0 whitespace-nowrap rounded-full border px-3 py-1.5 text-sm font-medium transition'
  const chipActive = 'border-siteColors-purple bg-siteColors-purple text-white'
  const chipIdle = 'border-slate-200 bg-white text-slate-700 hover:border-siteColors-purple hover:text-siteColors-purple dark:border-slate-600 dark:bg-slate-700 dark:text-slate-200'

  const structuredData = generateBrandProductsStructuredData({
    brandName,
    brandSlug: brand.slug,
    products: response.products,
    currentPage,
    totalPages: response.meta.pagination.pageCount,
    baseUrl: fullUrl,
    availableCategories: landing ? [] : allCategories.map((v) => v.name),
    description: landing ? null : brand.description,
    logoUrl: brand.logo?.url ? getStrapiMedia(brand.logo.url) : null,
    pageSize: response.meta.pagination.pageSize,
    landing: landing ? { name: landing.name, title: heading, url: pageUrl } : null,
  })

  const breadcrumbs = [
    { title: 'Αρχική', slug: '/' },
    { title: 'Κατασκευαστές', slug: '/brands' },
    { title: brandName, slug: `/brands/${brand.slug}` },
    ...(landing ? [{ title: landing.name, slug: `/brands/${brand.slug}/${landing.slug}` }] : []),
  ]
  // (2026-10-28) Οι κατηγορίες εμφανίζονται ως λίστα συνδέσμων (BrandCategoryList), όχι ως checkbox
  const listFilters = response.filters.filter((f) => f.filterBy !== 'Κατηγορίες')
  const categoryList = allCategories.length > 1 ? (
    <BrandCategoryList
      brandSlug={brand.slug}
      sp={sp}
      current={landing ? landing.slug : null}
      categories={allCategories.filter((c) => c.slug).sort((a, b) => a.name.localeCompare(b.name, 'el'))}
    />
  ) : null

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(structuredData) }} suppressHydrationWarning />
      <div className="min-h-screen">
        <Breadcrumb breadcrumbs={breadcrumbs} />

        {coverUrl ? (
          // Εικόνα εξώφυλλου (μόνο στη σελίδα του κατασκευαστή) — λογότυπο και τίτλος από πάνω
          <header className="relative mb-6 mt-4 overflow-hidden rounded-xl">
            <div className="relative aspect-[16/7] w-full sm:aspect-[4/1]">
              <Image src={coverUrl} alt={brand.cover?.alternativeText || ''} fill priority sizes="(max-width: 1280px) 100vw, 1280px" className="object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" aria-hidden />
            </div>
            <div className="absolute inset-x-0 bottom-0 flex flex-wrap items-end gap-4 p-4 sm:p-6">
              {logoUrl && (
                <span className="relative block h-14 w-28 rounded-lg bg-white/95 p-2 shadow sm:h-16 sm:w-36">
                  <Image src={logoUrl} alt={brand.logo?.alternativeText || `Λογότυπο ${brandName}`} fill sizes="144px" className="object-contain p-1.5" />
                </span>
              )}
              <div className="text-white drop-shadow">
                <h1 className="text-2xl font-bold sm:text-4xl">{heading}</h1>
                <p className="text-sm sm:text-base">{totalLabel}</p>
              </div>
            </div>
          </header>
        ) : (
          <header className="mb-6 mt-6 flex flex-col items-center gap-3 text-center">
            {logoUrl && (
              <span className="relative block h-16 w-40">
                <Image src={logoUrl} alt={brand.logo?.alternativeText || `Λογότυπο ${brandName}`} fill sizes="160px" className="object-contain" priority />
              </span>
            )}
            <h1 className="text-3xl font-bold text-siteColors-purple dark:text-siteColors-pink md:text-4xl">{heading}</h1>
            <p className="text-gray-600 dark:text-gray-300">{totalLabel}</p>
            {landing && (
              // Σύνδεσμοι προς τα «γονικά»: όλη η κατηγορία και όλη η μάρκα
              <p className="text-sm text-slate-600 dark:text-slate-300">
                <Link href={`/category/${landing.path}`} className="text-siteColors-purple underline-offset-2 hover:underline dark:text-siteColors-pink">
                  Όλα τα προϊόντα στην κατηγορία {landing.name}
                </Link>
                <span aria-hidden> · </span>
                <Link href={`/brands/${brand.slug}`} className="text-siteColors-purple underline-offset-2 hover:underline dark:text-siteColors-pink">
                  Όλα τα προϊόντα {brandName}
                </Link>
              </p>
            )}
          </header>
        )}

        {/* Κατηγορίες του κατασκευαστή → σελίδες «κατηγορία + μάρκα» */}
        {categoryChips.length > 1 && (
          <nav aria-label={`Κατηγορίες ${brandName}`} className="mb-4 flex gap-2 overflow-x-auto pb-1 sm:flex-wrap sm:justify-center">
            <Link
              href={categoryHref(brand.slug, sp, null)}
              aria-current={!activeCategories.length ? 'page' : undefined}
              className={`${chipClass} ${!activeCategories.length ? chipActive : chipIdle}`}
            >
              Όλα
            </Link>
            {categoryChips.map((c) => {
              const active = activeCategories.includes(c.slug.toLowerCase())
              return (
                <Link
                  key={c.slug}
                  href={categoryHref(brand.slug, sp, active ? null : c.slug)}
                  aria-current={active ? 'page' : undefined}
                  className={`${chipClass} ${active ? chipActive : chipIdle}`}
                >
                  {c.name} <span className="opacity-70">({c.numberOfItems})</span>
                </Link>
              )
            })}
          </nav>
        )}

        {/* Εγγύηση & service (Product Manager → Κατασκευαστές) — μόνο αν υπάρχει */}
        {brand.support && <BrandSupport brandName={brandName} info={brand.support} />}

        <div className="mb-8 grid w-full bg-white pt-4 dark:bg-slate-800">
          <div className="grid gap-4 lg:grid-cols-4">
            <aside className="hidden rounded-lg border border-gray-100 bg-slate-50 p-5 shadow-sm dark:border-slate-700 dark:bg-slate-800 lg:flex lg:flex-col" aria-label="Φίλτρα προϊόντων">
              {/* Η κατηγορία αλλάζει από τη λίστα (σύνδεσμοι προς τις σελίδες «κατηγορία + μάρκα») */}
              {categoryList}
              <CategoryFilters availableFilters={listFilters} priceRange={response.priceRange ?? null} idPrefix="d" />
            </aside>

            <div className="col-span-3 flex w-full min-w-0 flex-col px-2 lg:pl-0 lg:pr-4">
              <CategoryPageHeader totalItems={response.meta.pagination.total} />
              <AvailabilityFilter showSale />
              <ActiveFilters availableFilters={listFilters} />

              {response.products.length > 0 ? (
                <section className="grid grid-cols-1 place-content-center gap-1 sm:grid-cols-2 md:grid-cols-3" aria-label={heading}>
                  {response.products.map((product) => (
                    <article key={product.id}>
                      <ProductCard product={product} />
                    </article>
                  ))}
                </section>
              ) : (
                <EmptyResults />
              )}

              <MobileFilters availableFilters={listFilters} priceRange={response.priceRange ?? null} totalItems={response.meta.pagination.total} extra={categoryList} />

              {response.meta.pagination.pageCount > 1 && (
                <PaginationBar
                  totalItems={response.meta.pagination.total}
                  currentPage={response.meta.pagination.page}
                  itemsPerPage={response.meta.pagination.pageSize}
                />
              )}
            </div>
          </div>
        </div>

        {/* Περιγραφή του κατασκευαστή (Product Manager → Κατασκευαστές) — μόνο αν υπάρχει */}
        {currentPage === 1 && brand.description?.trim() && (
          <aside className="mx-auto mt-16 max-w-4xl px-4">
            <h2 className="mb-4 text-2xl font-bold text-siteColors-purple dark:text-siteColors-pink">Σχετικά με την {brandName}</h2>
            <p className="whitespace-pre-line leading-relaxed text-gray-600 dark:text-gray-300">{brand.description}</p>
          </aside>
        )}
      </div>
    </>
  )
}

/** Περιγραφή για τη Google χωρίς γενικούς ισχυρισμούς: πλήθος, εύρος τιμών, διαθεσιμότητα */
function landingDescription(landing: BrandLanding, brandName: string, priceRange?: { min: number; max: number } | null) {
  const count = `${landing.total} ${landing.total === 1 ? 'προϊόν' : 'προϊόντα'}`
  const price = priceRange && priceRange.min > 0
    ? priceRange.min === priceRange.max
      ? ` Τιμή ${euro(priceRange.min)}.`
      : ` Τιμές από ${euro(priceRange.min)} έως ${euro(priceRange.max)}.`
    : ''
  return `${landingTitle(landing, brandName)} στο Magnet Market: ${count}.${price} Διαθεσιμότητα και χρόνος παράδοσης σε κάθε προϊόν.`
}

export async function brandRouteMetadata(slug: string, category: string | null, sp: BrandSearchParams): Promise<Metadata> {
  const loaded = await load(slug, category, sp)
  // Ανακατεύθυνση (συγχωνευμένη μάρκα): η σελίδα κάνει 301, εδώ απλώς χωρίς ευρετηρίαση
  if (isRedirect(loaded)) return { robots: { index: false, follow: true } }
  const response = loaded
  const landing = category ? response?.landing ?? null : null
  if (!response || (category && !landing)) {
    return { title: 'Η σελίδα δεν βρέθηκε | Magnet Market', robots: { index: false, follow: true } }
  }

  const { brand } = response
  const seo = landing ? null : brand.seo
  const currentPage = Number(one(sp.page)) || 1
  const pageUrl = `${SITE}/brands/${brand.slug}${landing ? `/${landing.slug}` : ''}`
  const fullUrl = currentPage > 1 ? `${pageUrl}?page=${currentPage}` : pageUrl

  const baseTitle = landing
    ? `${landingTitle(landing, brand.name)} | Magnet Market`
    : seo?.metaTitle?.trim() || `${brand.name} — Προϊόντα | Magnet Market`
  const title = currentPage > 1 ? `${baseTitle} — Σελίδα ${currentPage}` : baseTitle
  const description = landing
    ? landingDescription(landing, brand.name, response.priceRange)
    : seo?.metaDescription?.trim() ||
      (brand.description?.trim()
        ? brand.description.trim().replace(/\s+/g, ' ').slice(0, 155)
        : `${response.meta.pagination.total} προϊόντα ${brand.name} στο Magnet Market.`)

  // Φίλτρα / ταξινόμηση → όχι στη Google (canonical: η καθαρή σελίδα).
  // «Κατηγορία + μάρκα» με λίγα προϊόντα → όχι στη Google.
  const hasFilters = Object.keys(sp).some((k) => k !== 'page')
  const robotsText = (seo?.metaRobots ?? '').toLowerCase()
  const index = !hasFilters && !robotsText.includes('noindex') && (!landing || landing.indexable)
  const canonical = landing?.canonicalCategory
    ? `${SITE}/brands/${brand.slug}/${landing.canonicalCategory}`
    : seo?.canonicalURL?.trim() || fullUrl
  const image = seo?.metaImage?.url
    ? getStrapiMedia(seo.metaImage.url)
    : brand.cover?.url && !landing
      ? getStrapiMedia(brand.cover.url)
      : brand.logo?.url
        ? getStrapiMedia(brand.logo.url)
        : null

  return {
    title,
    description,
    robots: {
      index,
      follow: true,
      googleBot: { index, follow: true, 'max-image-preview': 'large', 'max-snippet': -1 },
    },
    alternates: { canonical },
    openGraph: {
      title,
      description,
      url: fullUrl,
      siteName: 'Magnet Market',
      locale: 'el_GR',
      type: 'website',
      ...(image ? { images: [{ url: image }] } : {}),
    },
    twitter: { card: 'summary_large_image', title, description },
  }
}
