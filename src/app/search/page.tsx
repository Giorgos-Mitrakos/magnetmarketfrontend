import PaginationBar from "@/components/molecules/pagination"
import CategoryPageHeader from "@/components/organisms/categoryPageHeader"
import MobileSearchFilters from "@/components/organisms/mobileSearchFilters"
import ProductCard from "@/components/organisms/productCard"
import SearchFilters from "@/components/organisms/searchFilters"
import { organizationStructuredData } from "@/lib/helpers/structureData"
import { FilterProps } from "@/lib/interfaces/filters"
import { IProductCard } from "@/lib/interfaces/product"
import { Metadata } from "next"
import Script from "next/script"

type SearchProps = {
    searchParams: { [key: string]: string | string[] | undefined }
}

async function getFilteredProducts(searchParams: ({ [key: string]: string | string[] | undefined })) {

    const { sort, page, pageSize, Κατασκευαστές, Κατηγορίες, search } = searchParams

    // Smart caching - διαφορετικό cache time ανάλογα με το context
    let cacheTime = 900; // Default 15 λεπτά

    // Πρώτη σελίδα cache περισσότερο (πιο σημαντική για SEO)
    if (!page || page === '1') {
        cacheTime = 600; // 10 λεπτά για την πρώτη σελίδα
    }

    // Φιλτραρισμένα αποτελέσματα cache λιγότερο (πιο δυναμικά)
    if (Κατηγορίες || (sort && sort !== 'price:asc') || pageSize || Κατασκευαστές || search) {
        cacheTime = 300; // 5 λεπτά για φιλτραρισμένα
    }

    // Σελίδες μετά την πρώτη cache λιγότερο
    if (page && Number(page) > 1) {
        cacheTime = 600; // 10 λεπτά για επόμενες σελίδες
    }

    const myHeaders = new Headers();

    myHeaders.append('Content-Type', 'application/json')
    myHeaders.append('Authorization', `Bearer ${process.env.ADMIN_JWT_SECRET}`,)

    const myInit = {
        method: "POST",
        headers: myHeaders,
        body: JSON.stringify({
            searchParams: searchParams
        }),
        next: {
            revalidate: cacheTime, // Χρήση της μεταβλητής cacheTime
        }
    };

    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/product/searchProducts`,
        myInit,
    )

    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();

    return data as {
        products: IProductCard[],
        meta: { pagination: { total: number, page: number, pageSize: number, pageCount: number } },
        searchFilters: FilterProps[]
    }
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
            <div className="mt-8">
                <h2 className="mb-4 text-center font-medium">ΑΠΟΤΕΛΕΣΜΑΤΑ ΑΝΑΖΗΤΗΣΗΣ ΓΙΑ: <span className="font-semibold text-xl">{searchParams.search}</span></h2>
                <div className="mt-8 grid lg:grid-cols-4 gap-4" >
                    <div className="hidden lg:flex lg:flex-col bg-slate-100 dark:bg-slate-700 p-4 rounded">
                        <SearchFilters searchFilters={response?.searchFilters} />
                    </div>
                    <div className="flex flex-col pr-4 col-span-3 w-full">
                        <CategoryPageHeader totalItems={response?.meta.pagination.total || 0} />
                        {/* {response && JSON.stringify(response)} */}

                        <section className="grid gap-1 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 place-content-center">
                            {response && response.products.map(product => (
                                <div key={product.id}>
                                    {/* {JSON.stringify(product)} */}
                                    <ProductCard key={product.id} product={product} />
                                </div>
                            ))}
                        </section>
                        <MobileSearchFilters searchFilters={response?.searchFilters} />
                        {response && <PaginationBar totalItems={response.meta.pagination.total}
                            currentPage={response.meta.pagination.page}
                            itemsPerPage={response.meta.pagination.pageSize} />}
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