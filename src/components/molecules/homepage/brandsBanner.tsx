// Server Component - main wrapper
import { Suspense } from 'react'
import { getStrapiMedia } from '@/repositories/medias'
import { IHomeBrandsBanner } from '@/lib/queries/homepage'
import Link from 'next/link'
import BrandsSwiper from './BrandsSwiper'

interface BrandsBannerProps {
    id: string
    brands: IHomeBrandsBanner[]
}

// Server-side data processing
function processBrands(brands: IHomeBrandsBanner[]) {
    return brands
        .filter(brand => brand.logo) // Filter μόνο brands με logo
        .map(brand => ({
            id: brand.id,
            name: brand.name,
            slug: brand.slug,
            logoUrl: brand.logo.formats
                ? getStrapiMedia(brand.logo.formats.thumbnail.url)
                : getStrapiMedia(brand.logo.url),
            logoAlt: brand.logo.alternativeText || brand.name
        }))
}

// Server Component Skeleton - ΙΔΙΑ εμφάνιση
function BrandsBannerSkeleton() {
    return (
        <section className="w-full py-16 px-4 bg-gradient-to-b from-white via-slate-50 to-white dark:from-slate-800 dark:via-slate-900 dark:to-slate-800">
            <div className="mx-auto">
                <div className="h-10 bg-slate-200 dark:bg-slate-600 rounded w-48 mx-auto mb-12 animate-pulse"></div>

                <div className="relative bg-white dark:bg-slate-800 rounded-2xl p-8 shadow-sm border border-slate-100 dark:border-slate-700">
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-6">
                        {Array.from({ length: 8 }, (_, i) => (
                            <div key={i} className="flex items-center justify-center h-28 w-28 mx-auto">
                                <div className="w-20 h-20 bg-slate-200 dark:bg-slate-600 rounded animate-pulse"></div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="text-center mt-12">
                    <div className="inline-block px-8 py-3 bg-slate-200 dark:bg-slate-600 rounded-full animate-pulse w-40 h-12"></div>
                </div>
            </div>
        </section>
    )
}

// Main Server Component - ΙΔΙΑ εμφάνιση
export default function BrandsBanner({ id, brands }: BrandsBannerProps) {
    // Server-side processing
    const processedBrands = processBrands(brands)

    if (!brands || brands.length === 0) {
        return <BrandsBannerSkeleton />
    }

    return (
        <section key={id} className="w-full py-16 px-4 bg-gradient-to-b from-white via-slate-50 to-white dark:from-slate-800 dark:via-slate-900 dark:to-slate-800">
            <div className="mx-auto">
                <h2 className="text-center text-siteColors-purple mb-12 dark:text-slate-200 text-3xl md:text-4xl font-bold">
                    Our Brands
                </h2>

                <div className="relative bg-white dark:bg-slate-800 rounded-2xl p-8 shadow-sm border border-slate-100 dark:border-slate-700">
                    <Suspense fallback={<BrandsBannerSkeleton />}>
                        <BrandsSwiper brands={processedBrands} />
                    </Suspense>
                </div>

                <div className="text-center mt-12">
                    <Link
                        href="/brands"
                        className="inline-block px-8 py-3 bg-siteColors-purple text-white rounded-full hover:bg-opacity-90 transition-colors duration-300 font-medium shadow-md hover:shadow-lg"
                    >
                        View All Brands
                    </Link>
                </div>
            </div>
        </section>
    )
}