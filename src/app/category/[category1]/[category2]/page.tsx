// app/category/[category1]/[category2]/page.tsx

import CategoryPageTemplate from "@/components/templates/categoryPage"
import { getCategoriesMapping, getCategoryMetadata, getCategoryProducts } from "@/lib/queries/categoryQuery"
import { generateCategoryStructuredData, generateSubcategoriesItemList } from "@/lib/helpers/structuredDataHelpers"
import { Metadata, ResolvingMetadata } from 'next'

export const dynamicParams = false

type MetadataProps = {
    params: { category1: string, category2: string }
    searchParams: { [key: string]: string | string[] }
}

type PageProps = {
    params: { category1: string, category2: string }
    searchParams: { [key: string]: string | string[] }
}

export default async function Category2Page({ params, searchParams }: PageProps) {
    const { category1, category2 } = params
    const currentPage = Number(searchParams.page) || 1
    
    const response = await getCategoryProducts(
        category1,
        category2,
        searchParams
    )
    
    const categoryMetadata = await getCategoryMetadata(category2)
    
    const baseUrl = `${process.env.NEXT_URL}/category/${category1}/${category2}`
    const fullUrl = currentPage > 1 ? `${baseUrl}?page=${currentPage}` : baseUrl
    
    const description = categoryMetadata.categories?.length > 0
        ? `Ανακάλυψε ${categoryMetadata.name} στο Magnet Market. Διαθέσιμες κατηγορίες: ${categoryMetadata.categories.map(c => c.name).join(', ')}. Εγγύηση ελληνικής αντιπροσωπείας, καλύτερες τιμές.`
        : `Ανακάλυψε ${categoryMetadata.name} στο Magnet Market. Εγγύηση ελληνικής αντιπροσωπείας, καλύτερες τιμές, γρήγορη παράδοση.`
    
    /* ==================== Structured Data ==================== */
    
    const mainStructuredData = generateCategoryStructuredData({
        breadcrumbs: response.breadcrumbs,
        categoryName: categoryMetadata.name,
        categoryDescription: description,
        products: response.products,
        currentPage,
        totalPages: response.meta.pagination.pageCount,
        baseUrl: fullUrl,
    })
    
    const subcategoriesStructuredData = categoryMetadata.categories?.length > 0
        ? {
            '@context': 'https://schema.org',
            ...generateSubcategoriesItemList({
                categoryName: categoryMetadata.name,
                categories: categoryMetadata.categories,
                baseUrl,
            })
          }
        : null
    
    const allStructuredData = subcategoriesStructuredData
        ? [mainStructuredData, subcategoriesStructuredData]
        : [mainStructuredData]
    
    const { availableFilters, products, meta, breadcrumbs, sideMenu } = response

    return (
        <>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ 
                    __html: JSON.stringify(allStructuredData) 
                }}
                suppressHydrationWarning
            />
            <CategoryPageTemplate
                category1={category1}
                category2={category2}
                category3={null}
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
            slug.push({ category1: x.slug, category2: b.slug })
        })
    })
    return slug
}

export async function generateMetadata(
    { params, searchParams }: MetadataProps,
    parent: ResolvingMetadata
): Promise<Metadata> {
    const response = await getCategoryMetadata(params.category2)
    const currentPage = Number(searchParams.page) || 1
    
    const productsData = await getCategoryProducts(
        params.category1,
        params.category2,
        searchParams
    )
    
    const baseUrl = `${process.env.NEXT_URL}/category/${params.category1}/${params.category2}`
    const fullUrl = currentPage > 1 ? `${baseUrl}?page=${currentPage}` : baseUrl
    
    const title = currentPage > 1 
        ? `${response.name} - Σελίδα ${currentPage} | Magnet Market`
        : `${response.name} | Magnet Market`
    
    const description = response.categories?.length > 0
        ? `Ανακάλυψε ${response.name} στο Magnet Market. Διαθέσιμες κατηγορίες: ${response.categories.map(c => c.name).join(', ')}. Εγγύηση ελληνικής αντιπροσωπείας, καλύτερες τιμές.`
        : `Ανακάλυψε ${response.name} στο Magnet Market. Εγγύηση ελληνικής αντιπροσωπείας, καλύτερες τιμές, γρήγορη παράδοση.`
    
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