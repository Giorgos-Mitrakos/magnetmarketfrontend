import Breadcrumb from "@/components/molecules/breadcrumb"
import PaginationBar from "@/components/molecules/pagination"
import BrandFilters from "@/components/organisms/brandFilters"
import CategoryPageHeader from "@/components/organisms/categoryPageHeader"
import MobileBrandFilters from "@/components/organisms/mobileBrandFilters"
import ProductCard from "@/components/organisms/productCard"
import { organizationStructuredData } from "@/lib/helpers/structureData"
import { IProductCard, IProductPage } from "@/lib/interfaces/product"
import { Metadata, ResolvingMetadata } from "next"
import Script from "next/script"

type SearchParamsProps = {
    [key: string]: string | string[] | undefined
}

type MetadataProps = {
    params: Promise<{ slug: string }>
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

async function getOfferProducts({ searchParams }: {
    searchParams: SearchParamsProps
}) {

    const { sort, page, pageSize, Κατηγορίες, Κατασκευαστές } = searchParams

    // Smart caching - διαφορετικό cache time ανάλογα με το context
    let cacheTime = 900; // Default 15 λεπτά

    // Πρώτη σελίδα cache περισσότερο (πιο σημαντική για SEO)
    if (!page || page === '1') {
        cacheTime = 600; // 10 λεπτά για την πρώτη σελίδα
    }

    // Φιλτραρισμένα αποτελέσματα cache λιγότερο (πιο δυναμικά)
    if (Κατηγορίες || (sort && sort !== 'price:asc')) {
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
        body: JSON.stringify({ sort, page, pageSize, Κατηγορίες, Κατασκευαστές }),
        next: {
            revalidate: 10, // Χρήση της μεταβλητής cacheTime
        }
    };

    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/product/getOffers`,
        myInit,
    )

    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();

    return data as {
        products: IProductCard[],
        meta: { pagination: { total: number, page: number, pageSize: number, pageCount: number } },
        filters: {
            title: string,
            filterBy: string,
            filterValues: {
                name: string,
                slug: string,
                numberOfItems: number
            }[]
        }[]
    }
}

export default async function OffersPage({ searchParams }:
    {
        searchParams: Promise<SearchParamsProps>
    }) {

    // Await για τα params και searchParams
    const resolvedSearchParams = await searchParams;

    const response = await getOfferProducts({
        searchParams: resolvedSearchParams
    })

    const breadcrumbs = [
        {
            title: "Home",
            slug: "/"
        },
        {
            title: "Προσφορές",
            slug: "/offers"
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
            <h1 className="w-full mt-8 text-4xl font-semibold text-center text-siteColors-purple dark:text-slate-300">
                Προσφορές
            </h1>
            <div className="grid pt-4 w-full bg-white dark:bg-slate-800">
                <div className="grid lg:grid-cols-4 gap-4">
                    <div className="hidden lg:flex lg:flex-col bg-slate-100 dark:bg-slate-700 p-4 rounded">
                        <BrandFilters filters={response.filters} />
                    </div>
                    <div className="flex flex-col pr-4 col-span-3 w-full">
                        <CategoryPageHeader totalItems={response.meta.pagination.total} />
                        <section className="grid gap-1 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 place-content-center">
                            {response.products.map(product => (
                                <div key={product.id}>
                                    <ProductCard product={product} />
                                </div>
                            ))}
                        </section>
                        <MobileBrandFilters filters={response.filters} />
                        <PaginationBar
                            totalItems={response.meta.pagination.total}
                            currentPage={response.meta.pagination.page}
                            itemsPerPage={response.meta.pagination.pageSize}
                        />
                    </div>
                </div>
            </div>
        </>
    )
}

export const metadata: Metadata = {

    title: `Magnet Μarket - Προσφορές`,
    description: 'Μην το ψάχνεις εδώ θα βρεις τις καλύτερες προσφορές σε υπολογιστές, laptop, smartwatch, κάμερες, εκτυπωτές, οθόνες, τηλεοράσεις, κ.α.',
    keywords: "Computers, Laptops, Notebooks, laptop, Computer, Hardware, Notebook, Peripherals, Greece, Technology, Mobile phones, Laptops, PCs, Scanners, Printers, Modems, Monitors, Software, Antivirus, Windows, Intel Chipsets, AMD, HP, LOGITECH, ACER, TOSHIBA, SAMSUNG, Desktop, Servers, Telephones, DVD, CD, DVDR, CDR, DVD-R, CD-R, periferiaka, Systems, MP3, Υπολογιστής, ΥΠΟΛΟΓΙΣΤΗΣ, ΠΕΡΙΦΕΡΕΙΑΚΑ, περιφερειακά, Χαλκίδα, ΧΑΛΚΙΔΑ, Ελλάδα, ΕΛΛΑΔΑ, Τεχνολογία, τεχνολογία, ΤΕΧΝΟΛΟΓΙΑ, κινητό, ΚΙΝΗΤΟ, κινητά, ΚΙΝΗΤΑ, οθόνη, ΟΘΟΝΗ, οθόνες, ΟΘΟΝΕΣ, ΕΚΤΥΠΩΤΕΣ, εκτυπωτές, σαρωτές, ΣΑΡΩΤΕΣ, εκτυπωτής",
    alternates: {
        canonical: `${process.env.NEXT_URL}/offers`,
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