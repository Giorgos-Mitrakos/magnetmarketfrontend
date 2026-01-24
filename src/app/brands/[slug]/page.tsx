// app/brands/[slug]/page.tsx - OPTIMIZED VERSION

import { Metadata, ResolvingMetadata } from "next"
import Breadcrumb from "@/components/molecules/breadcrumb"
import PaginationBar from "@/components/molecules/pagination"
import BrandFilters from "@/components/organisms/brandFilters"
import CategoryPageHeader from "@/components/organisms/categoryPageHeader"
import MobileBrandFilters from "@/components/organisms/mobileBrandFilters"
import ProductCard from "@/components/organisms/productCard"
import { generateBrandProductsStructuredData } from "@/lib/helpers/structuredDataHelpers"
import { IProductCard } from "@/lib/interfaces/product"

export const revalidate = 600 // Revalidate κάθε 10 λεπτά

/* ==================== Types ==================== */

type SearchParamsProps = {
    [key: string]: string | string[] | undefined
}

type MetadataProps = {
    params: Promise<{ slug: string }>
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

type PageProps = {
    params: Promise<{ slug: string }>
    searchParams: Promise<SearchParamsProps>
}

interface BrandProductsResponse {
    products: IProductCard[]
    meta: {
        pagination: {
            total: number
            page: number
            pageSize: number
            pageCount: number
        }
    }
    filters: Array<{
        title: string
        filterBy: string
        filterValues: Array<{
            name: string
            slug: string
            numberOfItems: number
        }>
    }>
    brandInfo?: {
        name: string
        description?: string
        logo?: { url: string; alternativeText?: string }
    }
}

/* ==================== Data Fetching ==================== */

async function getBrandProducts({
    brand,
    searchParams,
}: {
    brand: string
    searchParams: SearchParamsProps
}): Promise<BrandProductsResponse> {
    const { sort, page, pageSize, Κατηγορίες } = searchParams

    // Smart caching strategy
    let cacheTime = 900 // Default 15 λεπτά

    if (!page || page === '1') {
        cacheTime = 600 // 10 λεπτά για πρώτη σελίδα
    }

    if (Κατηγορίες || (sort && sort !== 'price:asc')) {
        cacheTime = 300 // 5 λεπτά για φιλτραρισμένα
    }

    if (page && Number(page) > 1) {
        cacheTime = 600 // 10 λεπτά για επόμενες σελίδες
    }

    const myHeaders = new Headers()
    myHeaders.append('Content-Type', 'application/json')
    myHeaders.append('Authorization', `Bearer ${process.env.ADMIN_JWT_SECRET}`)

    const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/brands/getBrandProducts`,
        {
            method: 'POST',
            headers: myHeaders,
            body: JSON.stringify({
                brand: brand,
                searchParams: { sort, page, pageSize, Κατηγορίες },
            }),
            next: {
                revalidate: cacheTime,
            },
        }
    )

    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
    }

    return await response.json()
}

/* ==================== Page Component ==================== */

export default async function BrandProductsPage({
    params,
    searchParams,
}: PageProps) {
    const resolvedParams = await params
    const resolvedSearchParams = await searchParams

    const response = await getBrandProducts({
        brand: resolvedParams.slug,
        searchParams: resolvedSearchParams,
    })

    const currentPage = Number(resolvedSearchParams.page) || 1
    const brandName = resolvedParams.slug.toUpperCase()

    // Breadcrumbs
    const breadcrumbs = [
        {
            title: 'Home',
            slug: '/',
        },
        {
            title: 'Κατασκευαστές',
            slug: '/brands',
        },
        {
            title: brandName,
            slug: `/brands/${resolvedParams.slug}`,
        },
    ]

    return (
        <div className="min-h-screen">
            <Breadcrumb breadcrumbs={breadcrumbs} />

            {/* Page Header */}
            <header className="w-full mt-8 mb-6 text-center">
                <h1 className="text-3xl md:text-4xl font-bold text-siteColors-purple dark:text-siteColors-pink mb-2">
                    Προϊόντα {brandName}
                </h1>
                <p className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
                    Ανακαλύψτε {response.meta.pagination.total} προϊόντα από {brandName} με εγγύηση ελληνικής αντιπροσωπείας
                </p>
            </header>

            {/* Main Content */}
            <div 
              className="grid pt-4 w-full bg-white dark:bg-slate-800"
              itemScope
              itemType="https://schema.org/CollectionPage"
            >
                <div className="grid lg:grid-cols-4 gap-4">
                    {/* Desktop Filters */}
                    <aside 
                      className="hidden lg:flex lg:flex-col bg-slate-100 dark:bg-slate-700 p-4 rounded"
                      aria-label="Φίλτρα προϊόντων"
                    >
                        <BrandFilters filters={response.filters} />
                    </aside>

                    {/* Products Grid */}
                    <div className="flex flex-col pr-4 col-span-3 w-full">
                        <CategoryPageHeader totalItems={response.meta.pagination.total} />
                        
                        <section 
                          className="grid gap-1 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 place-content-center"
                          aria-label={`Προϊόντα ${brandName}`}
                        >
                            {response.products.length > 0 ? (
                                response.products.map((product) => (
                                    <article key={product.id}>
                                        <ProductCard product={product} />
                                    </article>
                                ))
                            ) : (
                                <div className="col-span-full text-center py-12">
                                    <p className="text-gray-500 dark:text-gray-400 text-lg">
                                        Δεν βρέθηκαν προϊόντα για αυτά τα φίλτρα
                                    </p>
                                </div>
                            )}
                        </section>

                        {/* Mobile Filters */}
                        <MobileBrandFilters filters={response.filters} />

                        {/* Pagination */}
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

            {/* SEO Content */}
            {currentPage === 1 && (
                <aside className="mt-16 prose prose-lg dark:prose-invert max-w-4xl mx-auto px-4">
                    <h2 className="text-2xl font-bold text-siteColors-purple dark:text-siteColors-pink mb-4">
                        Γιατί να επιλέξετε {brandName};
                    </h2>
                    <p className="text-gray-600 dark:text-gray-300">
                        Η {brandName} είναι ένας από τους κορυφαίους κατασκευαστές στον τομέα της τεχνολογίας. 
                      Στο Magnet Market θα βρείτε την πλήρη γκάμα προϊόντων {brandName} με εγγύηση ελληνικής 
                      αντιπροσωπείας, άμεση διαθεσιμότητα και τις καλύτερες τιμές της αγοράς.
                    </p>
                </aside>
            )}
        </div>
    )
}

/* ==================== Metadata ==================== */

export async function generateMetadata(
    { params, searchParams }: MetadataProps,
    parent: ResolvingMetadata
): Promise<Metadata> {
    const resolvedParams = await params
    const resolvedSearchParams = await searchParams

    const response = await getBrandProducts({
        brand: resolvedParams.slug,
        searchParams: resolvedSearchParams,
    })

    const currentPage = Number(resolvedSearchParams.page) || 1
    const brandName = resolvedParams.slug.toUpperCase()
    const baseUrl = process.env.NEXT_URL || 'https://magnetmarket.gr'
    const pageUrl = `${baseUrl}/brands/${resolvedParams.slug}`
    const fullUrl = currentPage > 1 ? `${pageUrl}?page=${currentPage}` : pageUrl

    // Title με pagination
    const title = currentPage > 1
        ? `${brandName} Προϊόντα - Σελίδα ${currentPage} | Magnet Market`
        : `${brandName} Προϊόντα | Magnet Market`

    // Description
    const description = `Ανακαλύψτε ${response.meta.pagination.total} προϊόντα ${brandName} στο Magnet Market. Laptops, υπολογιστές, περιφερειακά και άλλα με εγγύηση ελληνικής αντιπροσωπείας στις καλύτερες τιμές.`

    // Extract available categories για keywords
    const availableCategories = response.filters
        .find((f) => f.filterBy === 'Κατηγορίες')
        ?.filterValues.map((v) => v.name) || []

    // ✅ Check αν η σελίδα έχει φίλτρα
    const hasFilters = resolvedSearchParams.Κατηγορίες !== undefined
    const isFirstPage = currentPage === 1

    /* -------------------- Structured Data -------------------- */
    const structuredData = generateBrandProductsStructuredData({
        brandName,
        brandSlug: resolvedParams.slug,
        products: response.products,
        currentPage,
        totalPages: response.meta.pagination.pageCount,
        baseUrl: fullUrl,
        availableCategories,
    })

    /* -------------------- Metadata Object -------------------- */
    return {
        title,
        description,

        keywords: [
            brandName,
            'προϊόντα',
            'τεχνολογία',
            ...availableCategories.slice(0, 10),
            'laptops',
            'υπολογιστές',
            'περιφερειακά',
            'Χαλκίδα',
            'εγγύηση ελληνικής αντιπροσωπείας',
        ].join(', '),

        robots: {
            // ✅ ΣΗΜΑΝΤΙΚΟ: noindex για φιλτραρισμένες σελίδες
            index: !hasFilters, // Μόνο η κύρια σελίδα indexάρεται
            follow: true, // Πάντα follow για να ανακαλύψει products
            googleBot: {
                index: !hasFilters,
                follow: true,
                'max-image-preview': 'large',
                'max-snippet': -1,
            },
        },

        alternates: {
            // ✅ ΣΩΣΤΟ: Canonical πάντα στο base URL (χωρίς φίλτρα)
            // Μόνο το pagination παραμένει
            canonical: currentPage > 1 ? `${pageUrl}?page=${currentPage}` : pageUrl,
            
            ...(currentPage > 1 && {
                // @ts-ignore
                prev: currentPage === 2 ? pageUrl : `${pageUrl}?page=${currentPage - 1}`,
            }),
            ...(currentPage < response.meta.pagination.pageCount && {
                // @ts-ignore
                next: `${pageUrl}?page=${currentPage + 1}`,
            }),
        },

        openGraph: {
            title,
            description,
            url: fullUrl,
            siteName: 'Magnet Market',
            locale: 'el_GR',
            type: 'website',
            // Uncomment όταν δημιουργήσεις brand-specific OG images
            // images: [
            //   {
            //     url: `${baseUrl}/og-brand-${resolvedParams.slug}.jpg`,
            //     width: 1200,
            //     height: 630,
            //     alt: `${brandName} Προϊόντα - Magnet Market`,
            //   },
            // ],
        },

        twitter: {
            card: 'summary_large_image',
            title,
            description,
            // images: [`${baseUrl}/og-brand-${resolvedParams.slug}.jpg`],
        },

        // Structured Data
        other: {
            'application/ld+json': JSON.stringify(structuredData),
        },
    }
}