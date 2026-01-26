// app/category/[category1]/page.tsx

import CategoryPageTemplate from "@/components/templates/categoryPage"
import { getCategoriesMapping, getCategoryMetadata, getCategoryProducts } from "@/lib/queries/categoryQuery"
import { generateCategoryStructuredData, generateSubcategoriesItemList } from "@/lib/helpers/structuredDataHelpers"
import { Metadata, ResolvingMetadata } from 'next'

export const dynamicParams = false

type MetadataProps = {
    params: { category1: string }
    searchParams: { [key: string]: string | string[]  }
}

type PageProps = {
    params: { category1: string }
    searchParams: { [key: string]: string | string[] }
}

export default async function Category1Page({ params, searchParams }: PageProps) {
    const { category1 } = params
    const currentPage = Number(searchParams.page) || 1
    
    const response = await getCategoryProducts(
        category1,
        category1,
        searchParams
    )
    
    const categoryMetadata = await getCategoryMetadata(category1)
    
    const baseUrl = `${process.env.NEXT_URL}/category/${category1}`
    const fullUrl = currentPage > 1 ? `${baseUrl}?page=${currentPage}` : baseUrl
    
    // Description με subcategories
    const description = categoryMetadata.categories?.length > 0
        ? `Ανακάλυψε ${categoryMetadata.name} στο Magnet Market. Διαθέσιμες κατηγορίες: ${categoryMetadata.categories.map(c => c.name).join(', ')}. Εγγύηση ελληνικής αντιπροσωπείας, καλύτερες τιμές.`
        : `Ανακάλυψε ${categoryMetadata.name} στο Magnet Market. Εγγύηση ελληνικής αντιπροσωπείας, καλύτερες τιμές, γρήγορη παράδοση.`
    
    /* ==================== Structured Data ==================== */
    
    // Main structured data με @graph
    const mainStructuredData = generateCategoryStructuredData({
        breadcrumbs: response.breadcrumbs,
        categoryName: categoryMetadata.name,
        categoryDescription: description,
        products: response.products,
        currentPage,
        totalPages: response.meta.pagination.pageCount,
        baseUrl: fullUrl,
    })
    
    // Subcategories ItemList (μόνο αν έχει subcategories)
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
    
    // Combine structured data
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
                category2={null}
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
    return response.map(x => ({ category1: x.slug }))
}

export async function generateMetadata(
    { params, searchParams }: MetadataProps,
    parent: ResolvingMetadata
): Promise<Metadata> {
    const response = await getCategoryMetadata(params.category1)
    const currentPage = Number(searchParams.page) || 1
    
    // Fetch products data για pagination metadata
    const productsData = await getCategoryProducts(
        params.category1,
        params.category1,
        searchParams
    )
    
    const baseUrl = `${process.env.NEXT_URL}/category/${params.category1}`
    const fullUrl = currentPage > 1 ? `${baseUrl}?page=${currentPage}` : baseUrl
    
    // Title με pagination
    const title = currentPage > 1 
        ? `${response.name} - Σελίδα ${currentPage} | Magnet Market`
        : `${response.name} | Magnet Market`
    
    // Description με subcategories
    const description = response.categories?.length > 0
        ? `Ανακάλυψε ${response.name} στο Magnet Market. Διαθέσιμες κατηγορίες: ${response.categories.map(c => c.name).join(', ')}. Εγγύηση ελληνικής αντιπροσωπείας, καλύτερες τιμές.`
        : `Ανακάλυψε ${response.name} στο Magnet Market. Εγγύηση ελληνικής αντιπροσωπείας, καλύτερες τιμές, γρήγορη παράδοση.`
    
    /* ==================== Metadata Object (ΧΩΡΙΣ structured data) ==================== */
    
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
                // @ts-ignore - prev is valid
                prev: currentPage === 2 ? baseUrl : `${baseUrl}?page=${currentPage - 1}`,
            }),
            ...(currentPage < productsData.meta.pagination.pageCount && {
                // @ts-ignore - next is valid
                next: `${baseUrl}?page=${currentPage + 1}`,
            }),
        },
        // ΑΦΑΙΡΕΘΗΚΕ το other: { 'application/ld+json' } - Τώρα πάει στο component
    }
    
    // OpenGraph & Twitter
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