// Server Component - main wrapper
import { getStrapiMedia } from '@/repositories/medias'
import { IHomeBrand } from '@/lib/queries/homepage'
import Link from 'next/link'
import BrandsSwiper from './BrandsSwiper'

interface BrandsBannerProps {
    id: string
    title?: string
    showAllLink?: boolean
    brands: IHomeBrand[]
}

// Server-side data processing
function processBrands(brands: IHomeBrand[]) {
    return brands
        .filter(brand => brand.logo) // Filter μόνο brands με logo
        .map(brand => ({
            id: String(brand.id),
            name: brand.name,
            slug: brand.slug,
            logoUrl: getStrapiMedia(brand.logo.formats?.thumbnail?.url || brand.logo.url),
            logoAlt: brand.logo.alternativeText || brand.name
        }))
}

// Main Server Component - ΙΔΙΑ εμφάνιση
export default function BrandsBanner({ id, title = 'Τα brands μας', showAllLink = true, brands }: BrandsBannerProps) {
    if (!brands || brands.length === 0) {
        return null
    }

    const processedBrands = processBrands(brands)

    return (
        <section id={id} className="w-full py-10 md:py-16 px-4 bg-gradient-to-b from-white via-slate-50 to-white dark:from-slate-800 dark:via-slate-900 dark:to-slate-800">
            <div className="mx-auto">
                <h2 className="text-center text-siteColors-purple mb-8 md:mb-12 dark:text-slate-200 text-3xl md:text-4xl font-bold">
                    {title}
                </h2>

                <div className="relative bg-white dark:bg-slate-800 rounded-2xl px-4 py-6 sm:p-8 shadow-sm border border-slate-100 dark:border-slate-700">
                    <BrandsSwiper brands={processedBrands} label={title} />
                </div>

                {showAllLink && <div className="text-center mt-8 md:mt-12">
                    <Link
                        href="/brands"
                        className="inline-block px-8 py-3 bg-siteColors-purple text-white rounded-full hover:bg-opacity-90 transition-colors duration-300 font-medium shadow-md hover:shadow-lg"
                    >
                        Όλα τα brands
                    </Link>
                </div>}
            </div>
        </section>
    )
}