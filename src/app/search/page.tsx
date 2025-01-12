
import PaginationBar from "@/components/molecules/pagination"
import CategoryPageHeader from "@/components/organisms/categoryPageHeader"
import MobileSearchFilters from "@/components/organisms/mobileSearchFilters"
import ProductCard from "@/components/organisms/productCard"
import SearchFilters from "@/components/organisms/searchFilters"
import { organizationStructuredData } from "@/lib/helpers/structureData"
import { GET_FILTERED_PRODUCTS, IcategoryProductsProps } from "@/lib/queries/productQuery"
import { requestSSR } from "@/repositories/repository"
import { Metadata } from "next"
import Script from "next/script"

type SearchProps = {
    searchParams: { [key: string]: string | string[] | undefined }
}

async function getFilteredProducts(searchParams: ({ [key: string]: string | string[] | undefined })) {

    const { sort, page, pageSize, Κατασκευαστές, Κατηγορίες, search } = searchParams

    let sortedBy: string = sort ? sort.toString() : 'price:asc'
    const sorted = [sortedBy]

    let filterBrandString = []
    if (Κατασκευαστές) {
        if (typeof Κατασκευαστές !== "string") {
            for (let brand of Κατασκευαστές) {
                filterBrandString.push({ name: { eq: `${brand}` } }, { slug: { eq: `${brand}` } })
            }
        }
        else {
            filterBrandString.push({ name: { eq: `${Κατασκευαστές}` } }, { slug: { eq: `${Κατασκευαστές}` } })
        }
    }

    let filterCategoriesString = []
    if (Κατηγορίες) {
        if (typeof Κατηγορίες !== "string") {
            for (let category of Κατηγορίες) {
                filterCategoriesString.push({ name: { eq: `${category}` } })
            }
        }
        else {
            filterCategoriesString.push({ name: { eq: `${Κατηγορίες}` } })
        }
    }

    let filters: ({ [key: string]: object }) = {}

    const filterAnd = []
    const filterOr = []

    filterOr.push({ name: { containsi: search } })

    if (filterBrandString.length > 0) {
        filterAnd.push({ brand: { or: filterBrandString } })
    }
    else {
        filterOr.push({ brand: { or: filterBrandString } })
    }

    if (filterCategoriesString.length > 0) {
        filterAnd.push({ category: { or: filterCategoriesString } })
    }
    else {
        filterOr.push({ category: { or: filterCategoriesString } })
    }

    if (filterAnd.length > 0) {
        filterAnd.push({ or: filterOr })
        filters.and = filterAnd
    }
    else {
        filters.or = filterOr
    }

    if (search) {
        const data = await requestSSR({
            query: GET_FILTERED_PRODUCTS, variables: { filters: filters, pagination: { page: page ? Number(page) : 1, pageSize: pageSize ? Number(pageSize) : 12 }, sort: sorted },

        });

        const res = data as {
            products: {
                data: IcategoryProductsProps[],
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

    return null
}

export default async function SearchPage({ searchParams }: SearchProps) {

    const response = await getFilteredProducts(searchParams)

    const breadcrumbs = [
        {
            title: "Home",
            slug: "/"
        },
        {
            title: "Αναζήτηση",
            slug: "/search"
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
            <div>
                <h2 className="mb-4 text-center font-medium">ΑΠΟΤΕΛΕΣΜΑΤΑ ΑΝΑΖΗΤΗΣΗΣ ΓΙΑ: <span className="font-semibold text-xl">{searchParams.search}</span></h2>
                <div className="mt-8 grid lg:grid-cols-4 gap-4" >
                    <div className="hidden lg:flex lg:flex-col bg-slate-100 dark:bg-slate-700 p-4 rounded">
                        <SearchFilters searchParams={searchParams} />
                    </div>
                    <div className="flex flex-col pr-4 col-span-3 w-full">
                        <CategoryPageHeader totalItems={response?.products.meta.pagination.total || 0} />
                        {/* {response && JSON.stringify(response)} */}

                        <section className="grid gap-1 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 place-content-center">
                            {response && response.products.data.map(product => (
                                <div key={product.id}>
                                    {/* {JSON.stringify(product)} */}
                                    <ProductCard key={product.id} prod={product} />
                                </div>
                            ))}
                        </section>
                        <MobileSearchFilters searchParams={searchParams} />
                        {response && <PaginationBar totalItems={response.products.meta.pagination.total}
                            currentPage={response.products.meta.pagination.page}
                            itemsPerPage={response.products.meta.pagination.pageSize} />}
                    </div>
                </div >
            </div>
        </>
    )
}

export const metadata: Metadata = {
    title: 'Magnet Μarket - Η τεχνολογία στο δικό σου πεδίο! - Αναζήτηση',
    description: 'Μην το ψάχνεις εδώ αναζήτησε τις καλύτερες τίμες σε υπολογιστές, laptop, smartwatch, κάμερες, εκτυπωτές, οθόνες, τηλεοράσεις, κ.α.',
    keywords: "Computers, Laptops, Notebooks, laptop, Computer, Hardware, Notebook, Peripherals, Greece, Technology, Mobile phones, Laptops, PCs, Scanners, Printers, Modems, Monitors, Software, Antivirus, Windows, Intel Chipsets, AMD, HP, LOGITECH, ACER, TOSHIBA, SAMSUNG, Desktop, Servers, Telephones, DVD, CD, DVDR, CDR, DVD-R, CD-R, periferiaka, Systems, MP3, Υπολογιστής, ΥΠΟΛΟΓΙΣΤΗΣ, ΠΕΡΙΦΕΡΕΙΑΚΑ, περιφερειακά, Χαλκίδα, ΧΑΛΚΙΔΑ, Ελλάδα, ΕΛΛΑΔΑ, Τεχνολογία, τεχνολογία, ΤΕΧΝΟΛΟΓΙΑ, κινητό, ΚΙΝΗΤΟ, κινητά, ΚΙΝΗΤΑ, οθόνη, ΟΘΟΝΗ, οθόνες, ΟΘΟΝΕΣ, ΕΚΤΥΠΩΤΕΣ, εκτυπωτές, σαρωτές, ΣΑΡΩΤΕΣ, εκτυπωτής",
    alternates: {
        canonical: `${process.env.NEXT_URL}/search`,
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