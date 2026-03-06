// app/brands/page.tsx - OPTIMIZED VERSION

import { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { IBrands } from '@/lib/interfaces/brands'
import { generateBrandsStructuredData } from '@/lib/helpers/structuredDataHelpers'

export const revalidate = 3600

async function getBrandsData() {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/api/brands/all`,
    { next: { revalidate: 3600 } }
  )
  if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`)
  const data = await response.json()
  return data as { data: IBrands[]; meta: { total: number } }
}

export default async function BrandsPage() {
  const brands = await getBrandsData()

  const structuredData = generateBrandsStructuredData({
    brands: brands.data.map(brand => ({
      name: brand.name,
      slug: brand.slug,
      logoUrl: brand.logo?.url
        ? `${process.env.NEXT_PUBLIC_API_URL}${brand.logo.url}`
        : null,
    })),
  })

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        suppressHydrationWarning
      />
      <section
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12"
        itemScope
        itemType="https://schema.org/CollectionPage"
      >
        <header className="text-center mb-12">
          <h1
            className="text-4xl font-bold text-siteColors-purple dark:text-siteColors-pink mb-4"
            itemProp="name"
          >
            Κατασκευαστές Προϊόντων Τεχνολογίας
          </h1>
          <p
            className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto"
            itemProp="description"
          >
            Ανακαλύψτε {brands.meta.total} συνεργάτες μας και τα προϊόντα τους που φέρνουν την τεχνολογία στο δικό σας πεδίο
          </p>

          <div className="mt-6 inline-flex items-center gap-2 bg-siteColors-purple/10 dark:bg-siteColors-purple/20 px-4 py-2 rounded-full">
            <svg
              className="w-5 h-5 text-siteColors-purple dark:text-siteColors-pink"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="text-sm font-medium text-siteColors-purple dark:text-siteColors-pink">
              {brands.meta.total} Επαληθευμένοι Κατασκευαστές
            </span>
          </div>
        </header>

        <div
          className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6"
          role="list"
          aria-label="Λίστα κατασκευαστών"
        >
          {brands.data.map((brand) => (
            <article
              key={brand.id}
              className="group"
              itemScope
              itemType="https://schema.org/Brand"
              role="listitem"
            >
              <Link
                href={`/brands/${brand.slug}`}
                className="block focus:outline-none focus:ring-2 focus:ring-siteColors-purple focus:ring-offset-2 rounded-xl"
                aria-label={`Δείτε προϊόντα ${brand.name}`}
              >
                <div className="relative bg-white dark:bg-slate-700 rounded-xl shadow-md hover:shadow-xl transition-all duration-300 ease-in-out transform hover:-translate-y-1 p-6 h-full flex items-center justify-center border border-gray-100 dark:border-slate-600 group-hover:border-siteColors-lightblue/30">
                  <div className="relative w-full h-24 flex items-center justify-center">
                    <Image
                      height={96}
                      width={144}
                      src={`${process.env.NEXT_PUBLIC_API_URL}${brand.logo.url}`}
                      alt={brand.logo.alternativeText || `${brand.name} logo`}
                      title={`Προϊόντα ${brand.name}`}
                      className="object-contain opacity-80 group-hover:opacity-100 transition-opacity duration-300"
                      style={{ filter: 'grayscale(20%) contrast(110%)' }}
                      loading="lazy"
                      itemProp="logo"
                    />
                    <meta itemProp="name" content={brand.name} />
                    <meta itemProp="url" content={`${process.env.NEXT_URL}/brands/${brand.slug}`} />
                  </div>

                  <div
                    className="absolute inset-0 bg-gradient-to-t from-siteColors-purple/90 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl flex items-end justify-center p-3"
                    aria-hidden="true"
                  >
                    <span className="text-white text-sm font-medium text-center mb-2">
                      {brand.name}
                    </span>
                  </div>
                </div>
              </Link>
            </article>
          ))}
        </div>

        {brands.data.length === 0 && (
          <div className="text-center py-12">
            <div className="bg-siteColors-lightblue/10 dark:bg-siteColors-lightblue/20 rounded-full p-4 inline-flex mb-4">
              <svg
                className="w-12 h-12 text-siteColors-purple dark:text-siteColors-pink"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-4m-6 0H5m2 0h4M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Δεν βρέθηκαν κατασκευαστές
            </h2>
            <p className="text-gray-500 dark:text-gray-400">
              Επιστρέψτε αργότερα για να δείτε τους κατασκευαστές μας.
            </p>
          </div>
        )}

        {/* ✅ Αφαιρέθηκαν τα prose classes — απλό στατικό κείμενο με Tailwind */}
        <aside className="mt-16 max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold text-siteColors-purple dark:text-siteColors-pink mb-4">
            Επώνυμα Προϊόντα Τεχνολογίας
          </h2>
          <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
            Στο Magnet Market συνεργαζόμαστε με τους κορυφαίους κατασκευαστές τεχνολογίας για να σας προσφέρουμε
            προϊόντα υψηλής ποιότητας με εγγύηση ελληνικής αντιπροσωπείας. Ανακαλύψτε laptops, υπολογιστές,
            smartphones, tablets, περιφερειακά και πολλά άλλα από τις αγαπημένες σας μάρκες.
          </p>
        </aside>
      </section>
    </>
  )
}

export async function generateMetadata(): Promise<Metadata> {
  const brands = await getBrandsData()

  const title = 'Κατασκευαστές Προϊόντων Τεχνολογίας | Magnet Market'
  const description = `Ανακαλύψτε ${brands.meta.total} επώνυμους κατασκευαστές προϊόντων τεχνολογίας. Laptops, υπολογιστές, smartphones, tablets και περιφερειακά με εγγύηση ελληνικής αντιπροσωπείας στις καλύτερες τιμές.`

  const baseUrl = process.env.NEXT_URL || 'https://magnetmarket.gr'
  const topBrands = brands.data.slice(0, 20).map(b => b.name)

  return {
    title,
    description,
    keywords: [
      'κατασκευαστές', 'brands', 'επώνυμα προϊόντα', 'τεχνολογία',
      ...topBrands,
      'HP', 'Dell', 'Lenovo', 'Asus', 'Acer', 'Samsung',
      'Apple', 'Xiaomi', 'Canon', 'Epson', 'Logitech',
    ].join(', '),
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
      canonical: `${baseUrl}/brands`,
    },
    openGraph: {
      title, description,
      url: `${baseUrl}/brands`,
      siteName: 'Magnet Market',
      locale: 'el_GR',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title, description,
    },
  }
}