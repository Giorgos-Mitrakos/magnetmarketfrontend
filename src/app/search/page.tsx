// app/search/page.tsx

import { Metadata } from 'next'
import PaginationBar from '@/components/molecules/pagination'
import SearchTracker from '@/components/molecules/SearchTracker'
import CategoryPageHeader from '@/components/organisms/categoryPageHeader'
import MobileSearchFilters from '@/components/organisms/mobileSearchFilters'
import ProductCard from '@/components/organisms/productCard'
import SearchFilters from '@/components/organisms/searchFilters'
import AvailabilityFilter from "@/components/molecules/AvailabilityFilter";
import {
    organizationStructuredData,
    storeStructuredData
} from '@/lib/helpers/structureData'
import { FilterProps } from '@/lib/interfaces/filters'
import { IProductCard } from '@/lib/interfaces/product'
import type {
    BreadcrumbList,
    WebPage,
    WebSite,
    SearchResultsPage
} from 'schema-dts'

const BASE_URL = process.env.NEXT_URL || 'https://magnetmarket.gr'

type SearchProps = {
    searchParams: { [key: string]: string | string[] | undefined }
}

/* -------------------------------------------------------------------------- */
/*                              Data Fetching                                  */
/* -------------------------------------------------------------------------- */

async function getFilteredProducts(searchParams: {
    [key: string]: string | string[] | undefined
}) {
    // Αν θέλεις να μην χτυπάει το API χωρίς παραμέτρους:
    if (!searchParams || Object.keys(searchParams).length === 0) return null

    try {
        const { sort, page, pageSize, Κατασκευαστές, Κατηγορίες, search } = searchParams

        // Smart caching - διαφορετικό cache time ανάλογα με το context
        let cacheTime = 900 // Default 15 λεπτά

        // Πρώτη σελίδα cache περισσότερο (πιο σημαντική για SEO)
        if (!page || page === '1') {
            cacheTime = 600 // 10 λεπτά για την πρώτη σελίδα
        }

        // Φιλτραρισμένα αποτελέσματα cache λιγότερο (πιο δυναμικά)
        if (Κατηγορίες || (sort && sort !== 'price:asc') || pageSize || Κατασκευαστές || search) {
            cacheTime = 300 // 5 λεπτά για φιλτραρισμένα
        }

        // Σελίδες μετά την πρώτη cache λιγότερο
        if (page && Number(page) > 1) {
            cacheTime = 600 // 10 λεπτά για επόμενες σελίδες
        }

        const myHeaders = new Headers()

        myHeaders.append('Content-Type', 'application/json')
        myHeaders.append('Authorization', `Bearer ${process.env.ADMIN_JWT_SECRET}`)

        const myInit = {
            method: 'POST',
            headers: myHeaders,
            body: JSON.stringify({
                searchParams: searchParams,
            }),
            next: {
                revalidate: 1,
            },
        }

        const response = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL}/api/product/searchProducts`,
            myInit
        )

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`)
        }

        const data = await response.json()

        return data as {
            products: IProductCard[]
            meta: {
                pagination: {
                    total: number
                    page: number
                    pageSize: number
                    pageCount: number
                }
            }
            searchFilters: FilterProps[]
        }
    } catch (error) {
        console.error('Search API Error:', error)
        return null
    }
}

/* -------------------------------------------------------------------------- */
/*                          Structured Data (Module Level)                     */
/* -------------------------------------------------------------------------- */

// WebSite με SearchAction
const websiteNode: WebSite = {
    '@type': 'WebSite',
    '@id': `${BASE_URL}/#website`,
    url: BASE_URL,
    name: 'Magnet Market',
    publisher: {
        '@id': `${BASE_URL}/#organization`,
    },
    potentialAction: {
        '@type': 'SearchAction',
        target: {
            '@type': 'EntryPoint',
            urlTemplate: `${BASE_URL}/search?search={search_term_string}`,
        },
        // @ts-ignore - query-input is valid but not in types
        'query-input': 'required name=search_term_string',
    },
}

// BreadcrumbList
const breadcrumbList: BreadcrumbList = {
    '@type': 'BreadcrumbList',
    '@id': `${BASE_URL}/search#breadcrumb`,
    itemListElement: [
        {
            '@type': 'ListItem',
            position: 1,
            name: 'Home',
            item: BASE_URL,
        },
        {
            '@type': 'ListItem',
            position: 2,
            name: 'Αναζήτηση',
            item: `${BASE_URL}/search`,
        },
    ],
}

// SearchResultsPage
const searchResultsPage: SearchResultsPage = {
    '@type': 'SearchResultsPage',
    '@id': `${BASE_URL}/search#webpage`,
    url: `${BASE_URL}/search`,
    name: 'Αναζήτηση Προϊόντων',
    description: 'Αναζητήστε προϊόντα τεχνολογίας στο Magnet Market',
    isPartOf: {
        '@id': `${BASE_URL}/#website`,
    },
    about: {
        '@id': `${BASE_URL}/#organization`,
    },
    breadcrumb: {
        '@id': `${BASE_URL}/search#breadcrumb`,
    },
    inLanguage: 'el-GR',
}

const structuredData = {
    '@context': 'https://schema.org',
    '@graph': [
        organizationStructuredData,
        storeStructuredData,
        websiteNode,
        breadcrumbList,
        searchResultsPage,
    ],
}

/* -------------------------------------------------------------------------- */
/*                                  Page                                       */
/* -------------------------------------------------------------------------- */

export default async function SearchPage({ searchParams }: SearchProps) {
    const response = await getFilteredProducts(searchParams)

    const isInitialState = !searchParams.search // Ελέγχουμε αν ο χρήστης έχει γράψει κάτι

    return (
        <>
            <SearchTracker
                searchTerm={(searchParams.search as string) || ''}
                resultsCount={response?.meta?.pagination?.total ?? 0}
                products={response?.products || []}
            />

            <div className="mt-8">
                {/* Δυναμικός Τίτλος */}
                <h1 className="mb-4 text-center font-medium uppercase text-2xl">
                    {isInitialState ? (
                        'Αναζήτηση Προϊόντων'
                    ) : (
                        <>
                            ΑΠΟΤΕΛΕΣΜΑΤΑ ΑΝΑΖΗΤΗΣΗΣ ΓΙΑ:{' '}
                            <span className="font-semibold text-xl text-purple-700 dark:text-purple-400">
                                {searchParams.search}
                            </span>
                        </>
                    )}
                </h1>

                <div className="mt-8 grid lg:grid-cols-4 gap-4">
                    {/* Φίλτρα - Εμφανίζονται μόνο αν έχουμε αποτελέσματα */}
                    {!isInitialState && response?.products && response.products.length > 0 && (
                        <div className="hidden lg:flex lg:flex-col bg-slate-100 dark:bg-slate-700 p-4 rounded h-fit">
                            <SearchFilters searchFilters={response?.searchFilters || []} />
                        </div>
                    )}

                    <div
                        className={`flex flex-col pr-4 w-full ${!isInitialState && response?.products?.length ? 'col-span-3' : 'col-span-4'
                            }`}
                    >
                        {isInitialState ? (
                            /* CASE 1: INITIAL STATE (Πριν την αναζήτηση) */
                            <div className="flex flex-col items-center justify-center py-20 text-center bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700">
                                <div className="text-6xl mb-6">⚡</div>
                                <h2 className="text-2xl font-bold mb-3 text-slate-800 dark:text-white">
                                    Τι ψάχνετε σήμερα;
                                </h2>
                                <p className="text-slate-500 dark:text-slate-400 max-w-sm mx-auto mb-8">
                                    Πληκτρολογήστε το προϊόν, τη μάρκα ή την κατηγορία που σας ενδιαφέρει για να
                                    βρείτε τις καλύτερες τιμές.
                                </p>
                            </div>
                        ) : response && response.products.length > 0 ? (
                            /* CASE 2: ΕΧΟΥΜΕ ΑΠΟΤΕΛΕΣΜΑΤΑ */
                            <>
                                <CategoryPageHeader totalItems={response?.meta?.pagination?.total ?? 0} />
                                <AvailabilityFilter />
                                <section className="grid gap-1 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 place-content-center">
                                    {response.products.map((product) => (
                                        <div key={product.id}>
                                            <ProductCard product={product} />
                                        </div>
                                    ))}
                                </section>
                                <MobileSearchFilters searchFilters={response?.searchFilters || []} />
                                {response?.meta?.pagination && (
                                    <PaginationBar
                                        totalItems={response.meta.pagination.total}
                                        currentPage={response.meta.pagination.page}
                                        itemsPerPage={response.meta.pagination.pageSize}
                                    />
                                )}
                            </>
                        ) : (
                            /* CASE 3: ΜΗΔΕΝΙΚΑ ΑΠΟΤΕΛΕΣΜΑΤΑ */
                            <div className="flex flex-col items-center justify-center py-20 text-center bg-slate-50 dark:bg-slate-900 rounded-xl border-2 border-dashed border-slate-200 dark:border-slate-700">
                                <div className="text-6xl mb-4">🔎</div>
                                <h2 className="text-xl font-bold mb-2 text-slate-800 dark:text-white">
                                    Δεν βρέθηκε τίποτα
                                </h2>
                                <p className="text-slate-500 dark:text-slate-400">
                                    Δοκιμάστε μια διαφορετική λέξη-κλειδί.
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </>
    )
}

/* -------------------------------------------------------------------------- */
/*                                Metadata                                     */
/* -------------------------------------------------------------------------- */

export const metadata: Metadata = {
    title: 'Αναζήτηση Προϊόντων Τεχνολογίας | Magnet Market',
    description: 'Αναζητήστε και βρείτε τα καλύτερα προϊόντα τεχνολογίας: υπολογιστές, laptops, smartphones, tablets, κάμερες, εκτυπωτές και πολλά άλλα.',
    keywords: 'αναζήτηση, search, laptop, υπολογιστές, smartphones, τεχνολογία, προϊόντα',

    robots: {
        index: true, // ✅ Search pages CAN be indexed
        follow: true,
    },

    alternates: {
        canonical: `${BASE_URL}/search`,
    },

    openGraph: {
        title: 'Αναζήτηση Προϊόντων | Magnet Market',
        description: 'Βρείτε τα καλύτερα προϊόντα τεχνολογίας στις καλύτερες τιμές',
        url: `${BASE_URL}/search`,
        siteName: 'magnetmarket.gr',
        type: 'website',
        locale: 'el_GR',
        images: [
            {
                url: `${BASE_URL}/_next/static/media/MARKET MAGNET-LOGO.79db5357.svg`,
                width: 1200,
                height: 630,
                alt: 'Magnet Market Logo',
            },
        ],
    },

    twitter: {
        card: 'summary_large_image',
        title: 'Αναζήτηση Προϊόντων | Magnet Market',
        description: 'Βρείτε τα καλύτερα προϊόντα τεχνολογίας',
        images: [`${BASE_URL}/_next/static/media/MARKET MAGNET-LOGO.79db5357.svg`],
    },

    other: {
        'application/ld+json': JSON.stringify(structuredData).replaceAll('&quot;', '"'),
    },
}