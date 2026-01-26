// app/page.tsx - ΒΕΛΤΙΩΜΕΝΗ ΑΡΧΙΚΗ ΣΕΛΙΔΑ

import BlockManager from '@/components/molecules/homepage/blockManager'
import Newsletter from '@/components/molecules/newsletter'
import { getHomepageData } from '@/lib/queries/homepage'
import { generateHomepageStructuredData } from '@/lib/helpers/structuredDataHelpers'
import { Metadata } from 'next'

export const revalidate = 3600 // Revalidate κάθε 1 ώρα

export default async function Home() {
  const data = await getHomepageData()
  
  /* ==================== Structured Data Generation ==================== */
  
  // Extract categories από το CategoriesBanner block
  const categoriesBlock = data.body?.find(
    (block: any) => block.__component === 'homepage.categories-banner'
  )
  const featuredCategories = categoriesBlock?.categories?.slice(0, 8) || []
  
  // Extract brands από το BrandsBanner block
  const brandsBlock = data.body?.find(
    (block: any) => block.__component === 'homepage.brands-banner'
  )
  const featuredBrands = brandsBlock?.brands?.slice(0, 12) || []
  
  // Extract hero carousel images
  const carouselBlock = data.body?.find(
    (block: any) => block.__component === 'global.carousel'
  )
  const heroImages = carouselBlock?.carousel?.map((item: any) => 
    `${process.env.NEXT_PUBLIC_API_URL}${item.image.url}`
  ) || []
  
  const structuredData = generateHomepageStructuredData({
    featuredCategories: featuredCategories.map((cat: any) => ({
      name: cat.name,
      slug: cat.slug,
      imageUrl: cat.image?.url ? `${process.env.NEXT_PUBLIC_API_URL}${cat.image.url}` : null,
    })),
    featuredBrands: featuredBrands.map((brand: any) => ({
      name: brand.name,
      slug: brand.slug,
      logoUrl: brand.logo?.url ? `${process.env.NEXT_PUBLIC_API_URL}${brand.logo.url}` : null,
    })),
    heroImages,
  })
  
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ 
          __html: JSON.stringify(structuredData) 
        }}
        suppressHydrationWarning
      />
      <main className="w-full space-y-16">
        <BlockManager blocks={data.body} />
        <Newsletter />
      </main>
    </>
  )
}

/* ==================== METADATA ==================== */

export async function generateMetadata(): Promise<Metadata> {
  const title = 'Magnet Market - Η τεχνολογία στο δικό σου πεδίο!'
  const description = 'Ανακάλυψε τις καλύτερες τιμές σε υπολογιστές, laptops, smartphones, smartwatches, κάμερες, εκτυπωτές, οθόνες και τηλεοράσεις. Γρήγορη παράδοση σε όλη την Ελλάδα με εγγύηση ελληνικής αντιπροσωπείας.'
  
  const baseUrl = process.env.NEXT_URL || 'https://magnetmarket.gr'
  
  const metadata: Metadata = {
    title,
    description,
    
    keywords: [
      // Γενικά
      'ηλεκτρονικό κατάστημα',
      'τεχνολογία',
      'Χαλκίδα',
      'Νέα Αρτάκη',
      'Εύβοια',
      'Ελλάδα',
      
      // Προϊόντα
      'υπολογιστές',
      'laptops',
      'smartphones',
      'tablets',
      'smartwatches',
      'κάμερες',
      'εκτυπωτές',
      'οθόνες',
      'τηλεοράσεις',
      'gaming',
      'περιφερειακά',
      
      // Brands
      'HP',
      'Dell',
      'Lenovo',
      'Asus',
      'Acer',
      'Samsung',
      'Apple',
      'Xiaomi',
      'Logitech',
      'Canon',
      'Epson',
      
      // SEO phrases
      'καλύτερες τιμές',
      'προσφορές',
      'γρήγορη παράδοση',
      'εγγύηση ελληνικής αντιπροσωπείας',
    ].join(', '),
    
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-image-preview': 'large',
        'max-snippet': -1,
        'max-video-preview': -1,
      },
    },
    
    alternates: {
      canonical: `${baseUrl}/`,
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
      // Uncomment όταν δημιουργήσεις hero images
      // images: heroImages.length > 0 ? heroImages : [
      //   {
      //     url: `${baseUrl}/og-image.jpg`,
      //     width: 1200,
      //     height: 630,
      //     alt: 'Magnet Market - Ηλεκτρονικό Κατάστημα Τεχνολογίας',
      //   },
      // ],
      emails: ['info@magnetmarket.gr'],
      phoneNumbers: ['+302221121657'],
      countryName: 'Ελλάδα',
    },
    
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      // Uncomment όταν δημιουργήσεις images
      // images: heroImages.length > 0 ? [heroImages[0]] : [`${baseUrl}/og-image.jpg`],
      site: '@magnetmarket', // Αν έχεις Twitter
      creator: '@magnetmarket',
    },
    
    // ΑΦΑΙΡΕΘΗΚΕ το other: { 'application/ld+json' }
  }
  
  return metadata
}