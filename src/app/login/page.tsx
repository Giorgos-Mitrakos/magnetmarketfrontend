import LoginComp from '@/components/organisms/loginComp'
import Script from 'next/script'
import { organizationStructuredData } from '@/lib/helpers/structureData'
import { Metadata } from 'next'


export default function Login() {

    const breadcrumbs = [
            {
                title: "Home",
                slug: "/"
            },
            {
                title: "Είσοδος",
                slug: "/login"
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
            <LoginComp />
        </>
    )
}

export const metadata: Metadata = {
    title: 'Magnet Μarket - Η τεχνολογία στο δικό σου πεδίο! - Εγγραφή',
    description: 'Μην το ψάχνεις, συνδέσου με το λογαριασμό σου και αγόρασε στις καλύτερες τίμες, υπολογιστές, laptop, smartwatch, κάμερες, εκτυπωτές, οθόνες, τηλεοράσεις, κ.α.',
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