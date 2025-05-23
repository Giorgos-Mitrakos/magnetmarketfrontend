
import Breadcrumb from "@/components/molecules/breadcrumb"
import PaginationBar from "@/components/molecules/pagination"
import BrandFilters from "@/components/organisms/brandFilters"
import CategoryPageHeader from "@/components/organisms/categoryPageHeader"
import MobileBrandFilters from "@/components/organisms/mobileBrandFilters"
import ProductCard from "@/components/organisms/productCard"
import { organizationStructuredData } from "@/lib/helpers/structureData"
import { IProduct } from "@/lib/interfaces/product"
import { GET_BRAND_PRODUCTS } from "@/lib/queries/brandsQuery"
import { requestSSR } from "@/repositories/repository"
import { Metadata, ResolvingMetadata } from "next"
import Script from "next/script"

type SearchParamsProps = {
    [key: string]: string | string[] | undefined
}

type MetadataProps = {
    params: { slug: string }
    searchParams: { [key: string]: string | string[] | undefined }
}

async function getBrandProducts({ brand, searchParams }: {
    brand: string,
    searchParams: SearchParamsProps
}) {

    const { sort, page, pageSize, Κατηγορίες } = searchParams

    let sortedBy: string = sort ? sort.toString() : 'price:asc'

    let filters: ({ [key: string]: object }) = {}
    if (Κατηγορίες) {
        if (typeof Κατηγορίες !== "string") {
            filters = {
                and: [
                    { brand: { name: { eq: brand } } },
                    { category: { slug: { in: Κατηγορίες } } }
                ]
            }
        }
        else {
            filters = {
                and: [
                    { brand: { name: { eq: brand } } },
                    { category: { slug: { eq: `${Κατηγορίες}` } } }
                ]
            }
        }
    }
    else { filters = { brand: { name: { eq: brand } } } }

    const data = await requestSSR({
        query: GET_BRAND_PRODUCTS, variables: { filters: filters, pagination: { page: page ? Number(page) : 1, pageSize: pageSize ? Number(pageSize) : 12 }, sort: sortedBy }
    });

    const res = data as {
        products: {
            data: IProduct[],
            meta: {
                pagination: {
                    total: number,
                    page: number,
                    pageSize: number,
                    pageCount: number,
                }
            }
        }
    }

    return res
}

export default async function SearchPage({ params, searchParams }:
    {
        params: { slug: string },
        searchParams: SearchParamsProps
    }) {

    const response = await getBrandProducts({ brand: params.slug, searchParams })

    const breadcrumbs = [
        {
            title: "Home",
            slug: "/"
        },
        {
            title: "Brands",
            slug: "/brands"
        },
        {
            title: params.slug.toUpperCase(),
            slug: `/brands/${params.slug}`
        }
    ]

    const BreadcrumbList = breadcrumbs.map((breabcrumb, i) => ({
        "@type": "ListItem",
        "position": i + 1,
        "name": breabcrumb.title,
        "item": `${process.env.NEXT_URL}${breabcrumb.slug}`
    }))

    const BreadcrumbStructuredData = {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        "itemListElement": BreadcrumbList
    }

    const structuredData = []
    structuredData.push(BreadcrumbStructuredData)
    structuredData.push(organizationStructuredData)

    return (
        <>
            <Script
                id="structured-data"
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
            />
            <Breadcrumb breadcrumbs={breadcrumbs} />
            <h1 className="w-full mt-8 text-2xl font-semibold text-center text-siteColors-purple dark:text-slate-300">{breadcrumbs[breadcrumbs.length - 1].title}</h1>
            <div className="grid pt-4 w-full bg-white dark:bg-slate-800">
                <div className="grid lg:grid-cols-4 gap-4">
                    <div className="hidden lg:flex lg:flex-col bg-slate-100 dark:bg-slate-700 p-4 rounded">
                        <BrandFilters searchParams={searchParams} brand={params.slug} />
                    </div>
                    <div className="flex flex-col pr-4 col-span-3 w-full">
                        <CategoryPageHeader totalItems={response.products.meta.pagination.total} />
                        <section className="grid gap-1 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 place-content-center">
                            {response.products.data.map(product => (
                                <div key={product.id}>
                                    <ProductCard key={product.id} product={product} />
                                </div>
                            ))}
                        </section>
                        <MobileBrandFilters searchParams={searchParams} brand={params.slug} />
                        <PaginationBar totalItems={response.products.meta.pagination.total}
                            currentPage={response.products.meta.pagination.page}
                            itemsPerPage={response.products.meta.pagination.pageSize} />
                    </div>
                </div>
            </div>
        </>
    )
}

export async function generateMetadata(
    { params, searchParams }: MetadataProps,
    parent: ResolvingMetadata
): Promise<Metadata> {

    let metadata: Metadata = {
        title: `Magnet Μarket - Προϊόντα ${params.slug.toUpperCase()}`,
        description: 'Μην το ψάχνεις εδώ θα βρεις τις καλύτερες τίμες σε υπολογιστές, laptop, smartwatch, κάμερες, εκτυπωτές, οθόνες, τηλεοράσεις, κ.α.',
        keywords: "Computers, Laptops, Notebooks, laptop, Computer, Hardware, Notebook, Peripherals, Greece, Technology, Mobile phones, Laptops, PCs, Scanners, Printers, Modems, Monitors, Software, Antivirus, Windows, Intel Chipsets, AMD, HP, LOGITECH, ACER, TOSHIBA, SAMSUNG, Desktop, Servers, Telephones, DVD, CD, DVDR, CDR, DVD-R, CD-R, periferiaka, Systems, MP3, Υπολογιστής, ΥΠΟΛΟΓΙΣΤΗΣ, ΠΕΡΙΦΕΡΕΙΑΚΑ, περιφερειακά, Χαλκίδα, ΧΑΛΚΙΔΑ, Ελλάδα, ΕΛΛΑΔΑ, Τεχνολογία, τεχνολογία, ΤΕΧΝΟΛΟΓΙΑ, κινητό, ΚΙΝΗΤΟ, κινητά, ΚΙΝΗΤΑ, οθόνη, ΟΘΟΝΗ, οθόνες, ΟΘΟΝΕΣ, ΕΚΤΥΠΩΤΕΣ, εκτυπωτές, σαρωτές, ΣΑΡΩΤΕΣ, εκτυπωτής",
        alternates: {
            canonical: `${process.env.NEXT_URL}/brands/${params.slug}`,
        },
        openGraph: {
            url: 'www.magnetmarket.gr',
            type: 'website',
            images: [`${process.env.NEXT_URL}/_next/static/media/MARKET MAGNET-LOGO.79db5357.svg`],
            siteName: "www.magnetmarket.gr",
            emails: ["info@magnetmarket.gr"],
            phoneNumbers: ['2221121657'],
            countryName: 'Ελλάδα',
        }
    }

    return metadata

}