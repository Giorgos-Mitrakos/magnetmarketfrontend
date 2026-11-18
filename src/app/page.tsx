// app/page.tsx - ΒΕΛΤΙΩΜΕΝΗ ΑΡΧΙΚΗ ΣΕΛΙΔΑ

import BlockManager from '@/components/molecules/homepage/blockManager'
import Newsletter from '@/components/molecules/newsletter'
import RecentlyViewed from '@/components/molecules/RecentlyViewed'
import { getHomepageData, ICategoriesRowBlock, IBrandsRowBlock, IHeroCarouselBlock } from '@/lib/queries/homepage'
import { getStrapiMedia } from '@/repositories/medias'
import { generateHomepageStructuredData } from '@/lib/helpers/structuredDataHelpers'
import { storeWithInfo } from '@/lib/helpers/structureData'
import { getStoreInfo } from '@/lib/queries/storeInfo'
import { Metadata } from 'next'
import { jsonLd } from '@/lib/helpers/jsonLd'

export const revalidate = 300 // 5′ (blocks με «Από/Έως»)· οι αλλαγές του admin έρχονται αμέσως μέσω /api/revalidate

export default async function Home() {
  const [data, storeInfo] = await Promise.all([getHomepageData(), getStoreInfo()])
  
  /* ==================== Structured Data Generation ==================== */
  
  const blocks = data.body ?? []

  // Κατηγορίες / brands / εικόνες carousel για τα structured data
  const categoriesBlock = blocks.find((b): b is ICategoriesRowBlock => b.__component === 'blocks.categories-row')
  const featuredCategories = categoriesBlock?.categories?.slice(0, 8) || []

  const brandsBlock = blocks.find((b): b is IBrandsRowBlock => b.__component === 'blocks.brands-row')
  const featuredBrands = brandsBlock?.brands?.slice(0, 12) || []

  const carouselBlock = blocks.find((b): b is IHeroCarouselBlock => b.__component === 'blocks.hero-carousel')
  const heroImages = carouselBlock?.slides?.map(slide => getStrapiMedia(slide.image.url)!) || []

  const structuredData = generateHomepageStructuredData({
    featuredCategories: featuredCategories.map(cat => ({
      name: cat.name,
      slug: cat.slug,
      imageUrl: cat.image?.url ? getStrapiMedia(cat.image.url) : null,
    })),
    featuredBrands: featuredBrands.map(brand => ({
      name: brand.name,
      slug: brand.slug,
      logoUrl: brand.logo?.url ? getStrapiMedia(brand.logo.url) : null,
    })),
    heroImages,
    // (2026-10-26) Ωράριο / τηλέφωνο του καταστήματος από τις ρυθμίσεις
    store: storeWithInfo(storeInfo),
  })
  
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ 
          __html: jsonLd(structuredData)}}
        suppressHydrationWarning
      />
      <div className="w-full space-y-16">
        {/* (2026-10-26) Ο τίτλος της σελίδας για Google / αναγνώστες οθόνης (τα blocks έχουν μόνο h2) */}
        <h1 className="sr-only">{data.seo?.metaTitle?.trim() || DEFAULT_TITLE}</h1>
        <BlockManager blocks={data.body} />
        {/* Μόνο σε όποιον έχει δει προϊόντα (ιστορικό στον browser) */}
        <RecentlyViewed />
        <Newsletter />
      </div>
    </>
  )
}

/* ==================== METADATA ==================== */
// (2026-10-26) Τίτλος / περιγραφή / εικόνα από το Strapi (Αρχική → SEO), αλλιώς τα παρακάτω.
// Χωρίς meta keywords (η Google δεν τα διαβάζει) και χωρίς λογαριασμούς Twitter που δεν υπάρχουν.

const DEFAULT_TITLE = 'Magnet Market - Η τεχνολογία στο δικό σου πεδίο!'
const DEFAULT_DESCRIPTION = 'Ανακάλυψε τις καλύτερες τιμές σε υπολογιστές, laptops, smartphones, smartwatches, κάμερες, εκτυπωτές, οθόνες και τηλεοράσεις. Γρήγορη παράδοση σε όλη την Ελλάδα με εγγύηση ελληνικής αντιπροσωπείας.'

export async function generateMetadata(): Promise<Metadata> {
  const data = await getHomepageData()
  const seo = data.seo
  const title = seo?.metaTitle?.trim() || DEFAULT_TITLE
  const description = seo?.metaDescription?.trim() || DEFAULT_DESCRIPTION
  const baseUrl = process.env.NEXT_URL || 'https://magnetmarket.gr'

  // Εικόνα κοινοποίησης: του SEO, αλλιώς το πρώτο banner του carousel
  const carousel = (data.body ?? []).find((b): b is IHeroCarouselBlock => b.__component === 'blocks.hero-carousel')
  const imageUrl = seo?.metaImage?.url
    ? getStrapiMedia(seo.metaImage.url)
    : carousel?.slides?.[0]?.image?.url
      ? getStrapiMedia(carousel.slides[0].image.url)
      : null
  const robotsText = (seo?.metaRobots ?? '').toLowerCase()
  const index = !robotsText.includes('noindex')

  return {
    title,
    description,
    robots: {
      index,
      follow: true,
      googleBot: {
        index,
        follow: true,
        'max-image-preview': 'large',
        'max-snippet': -1,
        'max-video-preview': -1,
      },
    },
    alternates: {
      canonical: seo?.canonicalURL?.trim() || `${baseUrl}/`,
    },
    verification: {
      other: {
        'msvalidate.01': '0316C00C62960A7CD7E176FD68572160',
      },
    },
    openGraph: {
      title,
      description,
      url: baseUrl,
      siteName: 'Magnet Market',
      locale: 'el_GR',
      type: 'website',
      ...(imageUrl ? { images: [{ url: imageUrl }] } : {}),
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      ...(imageUrl ? { images: [imageUrl] } : {}),
    },
  }
}
