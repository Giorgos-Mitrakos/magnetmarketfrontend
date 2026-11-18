// app/brands/page.tsx
// (2026-10-24) Λίστα κατασκευαστών: μόνο όσοι έχουν προϊόντα στο site (με το πλήθος),
// και χωρίς λογότυπο (δείχνουμε το όνομα). Αναζήτηση + Α–Ω στο BrandsDirectory.

import { Metadata } from 'next'
import { IBrands } from '@/lib/interfaces/brands'
import { generateBrandsStructuredData } from '@/lib/helpers/structuredDataHelpers'
import { jsonLd } from '@/lib/helpers/jsonLd'
import { getStrapiMedia } from '@/repositories/medias'
import Breadcrumb from '@/components/molecules/breadcrumb'
import BrandsDirectory from '@/components/organisms/brandsDirectory'

export const revalidate = 3600

async function getBrandsData() {
  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/brands/all`, { next: { revalidate: 3600 } })
  if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`)
  return (await response.json()) as { data: IBrands[]; meta: { total: number } }
}

export default async function BrandsPage() {
  const brands = await getBrandsData()

  const structuredData = generateBrandsStructuredData({
    brands: brands.data.map((brand) => ({
      name: brand.name,
      slug: brand.slug,
      logoUrl: brand.logo?.url ? getStrapiMedia(brand.logo.url) : null,
    })),
  })

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(structuredData) }} suppressHydrationWarning />
      <Breadcrumb breadcrumbs={[{ title: 'Αρχική', slug: '/' }, { title: 'Κατασκευαστές', slug: '/brands' }]} />
      <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <header className="mb-8 text-center">
          <h1 className="mb-3 text-3xl font-bold text-siteColors-purple dark:text-siteColors-pink md:text-4xl">Κατασκευαστές</h1>
          <p className="mx-auto max-w-2xl text-gray-600 dark:text-gray-300">
            {brands.meta.total} κατασκευαστές — διαλέξτε έναν για να δείτε όλα τα προϊόντα του.
          </p>
        </header>

        {brands.data.length ? (
          <BrandsDirectory brands={brands.data} />
        ) : (
          <p className="py-12 text-center text-gray-500 dark:text-gray-400">Δεν βρέθηκαν κατασκευαστές.</p>
        )}
      </section>
    </>
  )
}

export async function generateMetadata(): Promise<Metadata> {
  const brands = await getBrandsData()
  const title = 'Κατασκευαστές | Magnet Market'
  const description = `Όλοι οι ${brands.meta.total} κατασκευαστές των προϊόντων του Magnet Market — διαλέξτε μάρκα και δείτε όλη τη γκάμα της.`
  const baseUrl = process.env.NEXT_URL || 'https://magnetmarket.gr'
  return {
    title,
    description,
    robots: { index: true, follow: true, googleBot: { index: true, follow: true, 'max-image-preview': 'large', 'max-snippet': -1 } },
    alternates: { canonical: `${baseUrl}/brands` },
    openGraph: { title, description, url: `${baseUrl}/brands`, siteName: 'Magnet Market', locale: 'el_GR', type: 'website' },
    twitter: { card: 'summary_large_image', title, description },
  }
}
