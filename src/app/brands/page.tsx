import Script from 'next/script'
import { organizationStructuredData } from '@/lib/helpers/structureData'
import { Metadata } from 'next'
import Image from 'next/image';
import Link from 'next/link';
import { IBrands } from '@/lib/interfaces/brands';

async function getBrandsData() {
  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/brands/all`)

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  const data = await response.json();
  return data as { data: IBrands[], meta: { total: number } }
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
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-siteColors-purple mb-4">
            Κατασκευαστές
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Ανακαλύψτε τους συνεργάτες μας και τα προϊόντα τους που φέρνουν την τεχνολογία στο δικό σας πεδίο
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
          {brands.data.map(brand => (
            <div key={brand.id} className="group">
              <Link href={`brands/${brand.slug}`} className="block">
                <div className="relative bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 ease-in-out transform hover:-translate-y-1 p-6 h-full flex items-center justify-center border border-gray-100 group-hover:border-siteColors-lightblue/30">
                  <div className="relative w-full h-24 flex items-center justify-center">
                    <Image
                      title={`Παρουσίαση των προϊόντων ${brand.name}`}
                      height={96}
                      width={144}
                      src={`${process.env.NEXT_PUBLIC_API_URL}${brand.logo.url}`}
                      blurDataURL={`${process.env.NEXT_PUBLIC_API_URL}${brand.logo.url}`}
                      alt={brand.logo.alternativeText}
                      className="object-contain opacity-80 group-hover:opacity-100 transition-opacity duration-300"
                      style={{
                        filter: 'grayscale(20%) contrast(110%)'
                      }}
                    />
                  </div>
                  
                  {/* Hover overlay with brand name */}
                  <div className="absolute inset-0 bg-gradient-to-t from-siteColors-purple/90 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl flex items-end justify-center p-3">
                    <span className="text-white text-sm font-medium text-center mb-2">
                      {brand.name}
                    </span>
                  </div>
                </div>
              </Link>
            </div>
          ))}
        </div>

        {/* Empty state if no brands */}
        {brands.data.length === 0 && (
          <div className="text-center py-12">
            <div className="bg-siteColors-lightblue/10 rounded-full p-4 inline-flex mb-4">
              <svg className="w-12 h-12 text-siteColors-purple" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-4m-6 0H5m2 0h4M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-700 mb-2">Δεν βρέθηκαν κατασκευαστές</h3>
            <p className="text-gray-500">Επιστρέψτε αργότερα για να δείτε τους κατασκευαστές μας.</p>
          </div>
        )}
      </section>
    </>
  )
}

export const metadata: Metadata = {
  title: 'Magnet Market - Η τεχνολογία στο δικό σου πεδίο! - Brands',
  description: 'Μην το ψάχνεις, εδώ θα βρεις επώνυμα προϊόντα στις καλύτερες τίμες, υπολογιστές, laptop, smartwatch, κάμερες, εκτυπωτές, τηλεοράσεις, κ.α.',
  keywords: "Computers, Laptops, Notebooks, laptop, Computer, Hardware, Notebook, Peripherals, Greece, Technology, Mobile phones, Laptops, PCs, Scanners, Printers, Modems, Monitors, Software, Antivirus, Windows, Intel Chipsets, AMD, HP, LOGITECH, ACER, TOSHIBA, SAMSUNG, Desktop, Servers, Telephones, DVD, CD, DVDR, CDR, DVD-R, CD-R, periferiaka, Systems, MP3, Υπολογιστής, ΥΠΟΛΟΓΙΣΤΗΣ, ΠΕΡΙΦΕΡΕΙΑΚΑ, περιφερειακά, Χαλκίδα, ΧΑΛΚΙΔΑ, Ελλάδα, ΕΛΛΑΔΑ, Τεχνολογία, τεχνολογία, ΤΕΧΝΟΛΟΓΙΑ, κινητό, ΚΙΝΗΤΟ, κινητά, ΚΙΝΗΤΑ, οθόνη, ΟΘΟΝΗ, οθόνες, ΟΘΟΝΕΣ, ΕΚΤΥΠΩΤΕΣ, εκτυπωτές, σαρωτές, ΣΑΡΩΤΕΣ, εκτυπωτής",
  alternates: {
    canonical: `${process.env.NEXT_URL}/brands`,
  },
  openGraph: {
    url: 'www.magnetmarket.gr/brands',
    type: 'website',
    images: [`${process.env.NEXT_URL}/_next/static/media/MARKET MAGNET-LOGO.79db5357.svg`],
    siteName: "www.magnetmarket.gr",
    emails: ["info@magnetmarket.gr"],
    phoneNumbers: ['2221121657'],
    countryName: 'Ελλάδα',
  }
}