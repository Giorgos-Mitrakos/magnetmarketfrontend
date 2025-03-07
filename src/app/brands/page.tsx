import LoginComp from '@/components/organisms/loginComp'
import Script from 'next/script'
import { organizationStructuredData } from '@/lib/helpers/structureData'
import { Metadata } from 'next'
import { requestSSR } from '@/repositories/repository';
import { notFound } from 'next/navigation';
import { GET_BRANDS } from '@/lib/queries/brandsQuery';
import NextImage from '@/components/atoms/nextImage';
import Image from 'next/image';
import Link from 'next/link';
import { IBrands } from '@/lib/interfaces/brands';

async function getBrandsData() {
    const data: IBrands | any = await requestSSR({
        query: GET_BRANDS
    });

    if (data.brands.data.length === 0) {
        notFound();
    }

    return data as IBrands
}

export default async function BrandsPage() {

    const brands = await getBrandsData()

    const breadcrumbs = [
        {
            title: "Home",
            slug: "/"
        },
        {
            title: "Κατασκευαστές",
            slug: "/brands"
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
            <section className='my-8'>
                <h1 className='mb-8 text-3xl font-semibold text-siteColors-purple text-center'>Κατασκευαστές - Brands</h1>
                <div className='grid xs:grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-8'>
                    {brands.brands.data.filter(x => x.attributes.logo.data !== null).map(brand =>
                        <div key={brand.id}>
                            <Link href={`brands/${brand.attributes.slug}`}>
                                <div className='relative h-full w-full flex p-4 justify-center items-center border-2 border-siteColors-blue
                    rounded-md'>
                                    <Image
                                        title={`Παρουσίαση των προϊόντων ${brand.attributes.name}`}
                                        // className='opacity-60 grayscale hover:opacity-100 hover:grayscale-0 transition-all duration-500 ease-in-out'
                                        height={140}
                                        width={180}
                                        src={`${process.env.NEXT_PUBLIC_API_URL}${brand.attributes.logo.data.attributes.url}`}
                                        blurDataURL={`${process.env.NEXT_PUBLIC_API_URL}${brand.attributes.logo.data.attributes.url}`}
                                        alt={brand.attributes.logo.data.attributes.alternativeText} />
                                </div>
                            </Link>
                        </div>)}
                </div>
            </section>
        </>
    )
}

export const metadata: Metadata = {
    title: 'Magnet Μarket - Η τεχνολογία στο δικό σου πεδίο! - Brands',
    description: 'Μην το ψάχνεις, εδώ θα βρεις επώνυμα προϊόντα στις καλύτερες τίμες, υπολογιστές, laptop, smartwatch, κάμερες, εκτυπωτές, τηλεοράσεις, κ.α.',
    keywords: "Computers, Laptops, Notebooks, laptop, Computer, Hardware, Notebook, Peripherals, Greece, Technology, Mobile phones, Laptops, PCs, Scanners, Printers, Modems, Monitors, Software, Antivirus, Windows, Intel Chipsets, AMD, HP, LOGITECH, ACER, TOSHIBA, SAMSUNG, Desktop, Servers, Telephones, DVD, CD, DVDR, CDR, DVD-R, CD-R, periferiaka, Systems, MP3, Υπολογιστής, ΥΠΟΛΟΓΙΣΤΗΣ, ΠΕΡΙΦΕΡΕΙΑΚΑ, περιφερειακά, Χαλκίδα, ΧΑΛΚΙΔΑ, Ελλάδα, ΕΛΛΑΔΑ, Τεχνολογία, τεχνολογία, ΤΕΧΝΟΛΟΓΙΑ, κινητό, ΚΙΝΗΤΟ, κινητά, ΚΙΝΗΤΑ, οθόνη, ΟΘΟΝΗ, οθόνες, ΟΘΟΝΕΣ, ΕΚΤΥΠΩΤΕΣ, εκτυπωτές, σαρωτές, ΣΑΡΩΤΕΣ, εκτυπωτής",
    alternates: {
        canonical: `${process.env.NEXT_URL}/login`,
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