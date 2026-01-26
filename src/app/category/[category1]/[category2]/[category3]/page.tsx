// app/category/[category1]/[category2]/[category3]/page.tsx

import CategoryPageTemplate from "@/components/templates/categoryPage"
import { getCategoriesMapping, getCategoryMetadata, getCategoryProducts } from "@/lib/queries/categoryQuery"
import { generateCategoryStructuredData } from "@/lib/helpers/structuredDataHelpers"
import { Metadata, ResolvingMetadata } from 'next'

export const dynamicParams = false

type MetadataProps = {
    params: { category1: string, category2: string, category3: string }
    searchParams: { [key: string]: string | string[] }
}

type PageProps = {
    params: { category1: string, category2: string, category3: string }
    searchParams: { [key: string]: string | string[] }
}

export default async function Category3Page({ params, searchParams }: PageProps) {
    const { category1, category2, category3 } = params
    const currentPage = Number(searchParams.page) || 1

    const response = await getCategoryProducts(
        category1,
        category3,
        searchParams
    )

    const categoryMetadata = await getCategoryMetadata(category3)
    
    const baseUrl = `${process.env.NEXT_URL}/category/${category1}/${category2}/${category3}`
    const fullUrl = currentPage > 1 ? `${baseUrl}?page=${currentPage}` : baseUrl
    
    const description = `Ανακάλυψε ${categoryMetadata.name} στο Magnet Market. Εγγύηση ελληνικής αντιπροσωπείας, καλύτερες τιμές, γρήγορη παράδοση.`

    /* ==================== Structured Data ==================== */
    
    // Level 3 δεν έχει συνήθως subcategories, άρα μόνο main structured data
    const mainStructuredData = generateCategoryStructuredData({
        breadcrumbs: response.breadcrumbs,
        categoryName: categoryMetadata.name,
        categoryDescription: description,
        products: response.products,
        currentPage,
        totalPages: response.meta.pagination.pageCount,
        baseUrl: fullUrl,
    })

    const { availableFilters, products, meta, breadcrumbs, sideMenu } = response

    return (
        <>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ 
                    __html: JSON.stringify([mainStructuredData]) 
                }}
                suppressHydrationWarning
            />
            <CategoryPageTemplate
                category1={category1}
                category2={category2}
                category3={category3}
                availableFilters={availableFilters}
                products={products}
                meta={meta}
                sideMenu={sideMenu}
                breadcrumbs={breadcrumbs}
            />
        </>
    )
}

export async function generateStaticParams() {
    const response = await getCategoriesMapping()
    let slug: object[] = []
    response.forEach((x) => {
        x.categories.forEach(b => {
            b.categories.forEach(c => {
                slug.push({ category1: x.slug, category2: b.slug, category3: c.slug })
            })
        })
    })
    return slug
}

export async function generateMetadata(
    { params, searchParams }: MetadataProps,
    parent: ResolvingMetadata
): Promise<Metadata> {
    const response = await getCategoryMetadata(params.category3)
    const currentPage = Number(searchParams.page) || 1

    const productsData = await getCategoryProducts(
        params.category1,
        params.category3,
        searchParams
    )

    const baseUrl = `${process.env.NEXT_URL}/category/${params.category1}/${params.category2}/${params.category3}`
    const fullUrl = currentPage > 1 ? `${baseUrl}?page=${currentPage}` : baseUrl

    const title = currentPage > 1
        ? `${response.name} - Σελίδα ${currentPage} | Magnet Market`
        : `${response.name} | Magnet Market`

    const description = `Ανακάλυψε ${response.name} στο Magnet Market. Εγγύηση ελληνικής αντιπροσωπείας, καλύτερες τιμές, γρήγορη παράδοση.`

    let metadata: Metadata = {
        title,
        description,
        category: response.name,
        robots: {
            index: true,
            follow: true,
            googleBot: {
                index: true,
                follow: true,
                'max-image-preview': 'large',
                'max-snippet': -1,
            },
        },
        alternates: {
            canonical: fullUrl,
            ...(currentPage > 1 && {
                // @ts-ignore
                prev: currentPage === 2 ? baseUrl : `${baseUrl}?page=${currentPage - 1}`,
            }),
            ...(currentPage < productsData.meta.pagination.pageCount && {
                // @ts-ignore
                next: `${baseUrl}?page=${currentPage + 1}`,
            }),
        },
        // ΑΦΑΙΡΕΘΗΚΕ το other: { 'application/ld+json' }
    }

    if (response.image) {
        const imageUrl = `${process.env.NEXT_PUBLIC_API_URL}${response.image.url}`

        metadata.openGraph = {
            url: fullUrl,
            type: 'website',
            title,
            description,
            images: [imageUrl],
            siteName: "Magnet Market",
            locale: 'el_GR',
        }

        metadata.twitter = {
            card: 'summary_large_image',
            title,
            description,
            images: [imageUrl],
        }
    }

    return metadata
}