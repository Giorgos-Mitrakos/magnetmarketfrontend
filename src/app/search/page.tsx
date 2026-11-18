// app/search/page.tsx
// (2026-10-26) Αναζήτηση:
//  - ίδια φίλτρα με τις κατηγορίες (κατασκευαστής, κατηγορία, άμεσα διαθέσιμα, προσφορές,
//    τιμή από / έως), ενεργά φίλτρα με ✕, ίδια κουμπιά στο κινητό
//  - οι σελίδες αναζήτησης ΔΕΝ μπαίνουν στη Google (noindex, follow) — οδηγία της Google
//    για εσωτερικές αναζητήσεις· ο τίτλος της καρτέλας έχει τη λέξη που αναζητήθηκε
//  - πεδίο αναζήτησης μέσα στη σελίδα (και χωρίς JavaScript) όταν δεν υπάρχουν αποτελέσματα,
//    με προτάσεις: προσφορές και οι κύριες κατηγορίες
import { Metadata } from 'next'
import Link from 'next/link'
import PaginationBar from '@/components/molecules/pagination'
import SearchTracker from '@/components/molecules/SearchTracker'
import CategoryPageHeader from '@/components/organisms/categoryPageHeader'
import CategoryFilters from '@/components/organisms/categoryFilters'
import MobileFilters from '@/components/organisms/mobileFilters'
import ProductCard from '@/components/organisms/productCard'
import AvailabilityFilter from '@/components/molecules/AvailabilityFilter'
import ActiveFilters from '@/components/molecules/ActiveFilters'
import EmptyResults from '@/components/molecules/EmptyResults'
import { organizationStructuredData, storeStructuredData } from '@/lib/helpers/structureData'
import { FilterProps } from '@/lib/interfaces/filters'
import { IProductCard } from '@/lib/interfaces/product'
import { getMenu } from '@/lib/queries/categoryQuery'
import type { WebSite, SearchResultsPage } from 'schema-dts'
import { jsonLd } from '@/lib/helpers/jsonLd'

const BASE_URL = process.env.NEXT_URL || 'https://magnetmarket.gr'

type SearchParams = { [key: string]: string | string[] | undefined }
type SearchProps = { searchParams: Promise<SearchParams> }

interface SearchResponse {
    products: IProductCard[]
    meta: { pagination: { total: number; page: number; pageSize: number; pageCount: number } }
    searchFilters: FilterProps[]
    priceRange?: { min: number; max: number } | null
}

const one = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v)

/** Φίλτρα (όχι η ίδια η αναζήτηση / σελίδα / ταξινόμηση) */
const FILTER_KEYS = ['brands', 'Κατασκευαστές', 'Κατηγορίες', 'stock', 'sale', 'price_min', 'price_max']

async function getSearchResults(searchParams: SearchParams): Promise<SearchResponse | null> {
    const search = one(searchParams.search)?.trim()
    if (!search) return null
    try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/product/searchProducts`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ searchParams }),
            // Η αναζήτηση καταγράφεται στο Strapi — χωρίς cache, κάθε αναζήτηση μετράει
            cache: 'no-store',
        })
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`)
        const data = await response.json()
        return data?.products ? (data as SearchResponse) : null
    } catch (error) {
        console.error('Search API Error:', error)
        return null
    }
}

function structuredData(term: string | undefined) {
    const websiteNode: WebSite = {
        '@type': 'WebSite',
        '@id': `${BASE_URL}/#website`,
        url: BASE_URL,
        name: 'Magnet Market',
        publisher: { '@id': `${BASE_URL}/#organization` },
    }
    const page: SearchResultsPage = {
        '@type': 'SearchResultsPage',
        '@id': `${BASE_URL}/search#webpage`,
        url: `${BASE_URL}/search`,
        name: term ? `Αναζήτηση: ${term}` : 'Αναζήτηση προϊόντων',
        isPartOf: { '@id': `${BASE_URL}/#website` },
        inLanguage: 'el-GR',
    }
    return { '@context': 'https://schema.org', '@graph': [organizationStructuredData, storeStructuredData, websiteNode, page] }
}

/** Πεδίο αναζήτησης μέσα στη σελίδα — απλή φόρμα GET, δουλεύει και χωρίς JavaScript */
function SearchBox({ defaultValue = '' }: { defaultValue?: string }) {
    return (
        <form action="/search" method="get" role="search" className="mx-auto flex w-full max-w-lg gap-2">
            <label htmlFor="search-page-input" className="sr-only">Αναζήτηση προϊόντων</label>
            <input
                id="search-page-input"
                name="search"
                type="search"
                defaultValue={defaultValue}
                placeholder="Προϊόν, μάρκα ή κωδικός…"
                autoComplete="off"
                enterKeyHint="search"
                className="min-w-0 flex-1 rounded-lg border border-slate-300 bg-white px-4 py-3 text-slate-900 focus:border-siteColors-blue focus:outline-none focus:ring-2 focus:ring-siteColors-blue/30 dark:border-slate-600 dark:bg-slate-700 dark:text-white"
            />
            <button type="submit" className="rounded-lg bg-siteColors-purple px-5 py-3 font-semibold text-white hover:bg-siteColors-purple/90">
                Αναζήτηση
            </button>
        </form>
    )
}

/** Προτάσεις όταν δεν βρέθηκε τίποτα: προσφορές + κύριες κατηγορίες */
async function Suggestions() {
    const menu = await getMenu()
    const top = menu.filter((c) => c.slug && !c.isSpecial).slice(0, 10)
    const chip = 'rounded-full border border-slate-200 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 hover:border-siteColors-purple hover:text-siteColors-purple dark:border-slate-600 dark:bg-slate-700 dark:text-slate-200'
    return (
        <div className="mt-8">
            <p className="mb-3 text-sm font-semibold text-slate-600 dark:text-slate-300">Ίσως σας ενδιαφέρουν:</p>
            <div className="flex flex-wrap justify-center gap-2">
                <Link href="/offers" className={`${chip} border-red-200 text-red-700 dark:border-red-900 dark:text-red-300`}>🔥 Προσφορές</Link>
                {top.map((c) => (
                    <Link key={c.slug} href={`/category/${c.slug}`} className={chip}>{c.name}</Link>
                ))}
            </div>
        </div>
    )
}

export default async function SearchPage(props: SearchProps) {
    const searchParams = await props.searchParams;
    const term = one(searchParams.search)?.trim() || ''
    const response = term ? await getSearchResults(searchParams) : null
    const total = response?.meta?.pagination?.total ?? 0
    const hasFilters = FILTER_KEYS.some((k) => searchParams[k] != null && searchParams[k] !== '')

    return (
        <>
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(structuredData(term)) }} suppressHydrationWarning />
            <SearchTracker searchTerm={term} resultsCount={total} products={response?.products || []} />

            <div className="mt-8">
                <h1 className="mb-4 text-center text-2xl font-medium text-slate-800 dark:text-slate-100">
                    {term ? (
                        <>
                            Αποτελέσματα για{' '}
                            <span className="font-semibold text-purple-700 dark:text-purple-400">«{term}»</span>
                            {total > 0 && <span className="ml-2 text-base font-normal text-slate-500 dark:text-slate-400">({total})</span>}
                        </>
                    ) : (
                        'Αναζήτηση προϊόντων'
                    )}
                </h1>

                {!term ? (
                    // Χωρίς λέξη αναζήτησης
                    <div className="flex flex-col items-center justify-center rounded-xl border border-slate-100 bg-white px-4 py-16 text-center shadow-sm dark:border-slate-700 dark:bg-slate-800">
                        <h2 className="mb-3 text-2xl font-bold text-slate-800 dark:text-white">Τι ψάχνετε σήμερα;</h2>
                        <p className="mx-auto mb-6 max-w-sm text-slate-500 dark:text-slate-400">
                            Γράψτε το προϊόν, τη μάρκα ή τον κωδικό που σας ενδιαφέρει.
                        </p>
                        <SearchBox />
                        <Suggestions />
                    </div>
                ) : total === 0 && !hasFilters ? (
                    // Δεν βρέθηκε τίποτα (χωρίς φίλτρα)
                    <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-200 bg-slate-50 px-4 py-16 text-center dark:border-slate-700 dark:bg-slate-900">
                        <h2 className="mb-2 text-xl font-bold text-slate-800 dark:text-white">Δεν βρέθηκε κάτι για «{term}»</h2>
                        <p className="mb-6 text-slate-500 dark:text-slate-400">
                            Δοκιμάστε λιγότερες ή πιο γενικές λέξεις, ή μόνο τη μάρκα / τον κωδικό του προϊόντος.
                        </p>
                        <SearchBox defaultValue={term} />
                        <Suggestions />
                    </div>
                ) : (
                    <div className="mb-8 grid w-full pt-4">
                        <div className="grid gap-4 lg:grid-cols-4">
                            <aside className="hidden h-fit rounded-lg border border-gray-100 bg-slate-50 p-5 shadow-sm dark:border-slate-700 dark:bg-slate-800 lg:flex lg:flex-col" aria-label="Φίλτρα αναζήτησης">
                                <CategoryFilters availableFilters={response?.searchFilters ?? []} priceRange={response?.priceRange ?? null} idPrefix="d" />
                            </aside>

                            <div className="col-span-3 flex w-full min-w-0 flex-col px-2 lg:pl-0 lg:pr-4">
                                <CategoryPageHeader totalItems={total} defaultSortLabel="ΣΧΕΤΙΚΟΤΗΤΑ" showNewest />
                                <AvailabilityFilter showSale />
                                <ActiveFilters availableFilters={response?.searchFilters ?? []} />

                                {response && response.products.length > 0 ? (
                                    <section className="grid grid-cols-1 place-content-center gap-1 sm:grid-cols-2 md:grid-cols-3" aria-label={`Αποτελέσματα για ${term}`}>
                                        {response.products.map((product) => (
                                            <article key={product.id}>
                                                <ProductCard product={product} />
                                            </article>
                                        ))}
                                    </section>
                                ) : (
                                    <EmptyResults />
                                )}

                                <MobileFilters availableFilters={response?.searchFilters ?? []} priceRange={response?.priceRange ?? null} totalItems={total} />

                                {response?.meta?.pagination && (
                                    <PaginationBar
                                        totalItems={response.meta.pagination.total}
                                        currentPage={response.meta.pagination.page}
                                        itemsPerPage={response.meta.pagination.pageSize}
                                    />
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </>
    )
}

export async function generateMetadata(props: SearchProps): Promise<Metadata> {
    const searchParams = await props.searchParams;
    const term = one(searchParams.search)?.trim()
    const title = term ? `«${term.slice(0, 60)}» — Αναζήτηση | Magnet Market` : 'Αναζήτηση προϊόντων | Magnet Market'
    return {
        title,
        description: 'Αναζήτηση προϊόντων στο Magnet Market με όνομα, μάρκα ή κωδικό.',
        // Εσωτερική αναζήτηση: όχι στο ευρετήριο της Google, αλλά ακολουθεί τους συνδέσμους προϊόντων
        robots: { index: false, follow: true, googleBot: { index: false, follow: true } },
        alternates: { canonical: `${BASE_URL}/search` },
    }
}
