// app/offers/page.tsx

import { Metadata } from 'next'
import Breadcrumb from '@/components/molecules/breadcrumb'
import PaginationBar from '@/components/molecules/pagination'
import BrandFilters from '@/components/organisms/brandFilters'
import CategoryPageHeader from '@/components/organisms/categoryPageHeader'
import MobileBrandFilters from '@/components/organisms/mobileBrandFilters'
import ProductCard from '@/components/organisms/productCard'
import { 
  organizationStructuredData, 
  storeStructuredData 
} from '@/lib/helpers/structureData'
import { IProductCard } from '@/lib/interfaces/product'
import type { 
  BreadcrumbList, 
  WebPage, 
  WebSite,
  CollectionPage,
  ItemList,
  Product as SchemaProduct,
  Offer as SchemaOffer
} from 'schema-dts'

const BASE_URL = process.env.NEXT_URL || 'https://magnetmarket.gr'

type SearchParamsProps = {
  [key: string]: string | string[] | undefined
}

/* -------------------------------------------------------------------------- */
/*                              Data Fetching                                  */
/* -------------------------------------------------------------------------- */

async function getOfferProducts({ searchParams }: {
  searchParams: SearchParamsProps
}) {
  const { sort, page, pageSize, Κατηγορίες, Κατασκευαστές } = searchParams

  // Smart caching - διαφορετικό cache time ανάλογα με το context
  let cacheTime = 900 // Default 15 λεπτά

  // Πρώτη σελίδα cache περισσότερο (πιο σημαντική για SEO)
  if (!page || page === '1') {
    cacheTime = 600 // 10 λεπτά για την πρώτη σελίδα
  }

  // Φιλτραρισμένα αποτελέσματα cache λιγότερο (πιο δυναμικά)
  if (Κατηγορίες || (sort && sort !== 'price:asc')) {
    cacheTime = 300 // 5 λεπτά για φιλτραρισμένα
  }

  // Σελίδες μετά την πρώτη cache λιγότερο
  if (page && Number(page) > 1) {
    cacheTime = 600 // 10 λεπτά για επόμενες σελίδες
  }

  const myHeaders = new Headers()
  myHeaders.append('Content-Type', 'application/json')
  myHeaders.append('Authorization', `Bearer ${process.env.ADMIN_JWT_SECRET}`)

  const myInit = {
    method: 'POST',
    headers: myHeaders,
    body: JSON.stringify({ sort, page, pageSize, Κατηγορίες, Κατασκευαστές }),
    next: {
      revalidate: 10,
    },
  }

  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/api/product/getOffers`,
    myInit
  )

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`)
  }

  const data = await response.json()

  return data as {
    products: IProductCard[]
    meta: {
      pagination: {
        total: number
        page: number
        pageSize: number
        pageCount: number
      }
    }
    filters: {
      title: string
      filterBy: string
      filterValues: {
        name: string
        slug: string
        numberOfItems: number
      }[]
    }[]
  }
}

/* -------------------------------------------------------------------------- */
/*                          Structured Data Helper                             */
/* -------------------------------------------------------------------------- */

function generateOffersStructuredData(
  products: IProductCard[], 
  currentPage: number,
  totalPages: number
) {
  const baseUrl = `${BASE_URL}/offers`
  const fullUrl = currentPage > 1 ? `${baseUrl}?page=${currentPage}` : baseUrl

  // WebSite
  const websiteNode: WebSite = {
    '@type': 'WebSite',
    '@id': `${BASE_URL}/#website`,
    url: BASE_URL,
    name: 'Magnet Market',
    publisher: {
      '@id': `${BASE_URL}/#organization`,
    },
  }

  // BreadcrumbList
  const breadcrumbList: BreadcrumbList = {
    '@type': 'BreadcrumbList',
    '@id': `${fullUrl}#breadcrumb`,
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: BASE_URL,
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'Προσφορές',
        item: baseUrl,
      },
    ],
  }

  // CollectionPage
  const collectionPage: CollectionPage = {
    '@type': 'CollectionPage',
    '@id': `${fullUrl}#webpage`,
    url: fullUrl,
    name: currentPage > 1 ? `Προσφορές - Σελίδα ${currentPage}` : 'Προσφορές',
    description: 'Ανακαλύψτε τις καλύτερες προσφορές σε προϊόντα τεχνολογίας',
    isPartOf: {
      '@id': `${BASE_URL}/#website`,
    },
    breadcrumb: {
      '@id': `${fullUrl}#breadcrumb`,
    },
    inLanguage: 'el-GR',
    
    // Pagination links
    ...(currentPage > 1 && {
      // @ts-ignore - relatedLink is valid
      relatedLink: currentPage === 2 ? baseUrl : `${baseUrl}?page=${currentPage - 1}`,
      // @ts-ignore - previousItem is valid
      previousItem: currentPage === 2 ? baseUrl : `${baseUrl}?page=${currentPage - 1}`,
    }),
    ...(currentPage < totalPages && {
      // @ts-ignore - relatedLink is valid
      relatedLink: `${baseUrl}?page=${currentPage + 1}`,
      // @ts-ignore - nextItem is valid  
      nextItem: `${baseUrl}?page=${currentPage + 1}`,
    }),
  }

  // ✨ NEW: ItemList with Offer Products
  const offersItemList: ItemList = {
    '@type': 'ItemList',
    '@id': `${fullUrl}#itemlist`,
    url: fullUrl,
    name: `Προσφορές - Σελίδα ${currentPage} από ${totalPages}`,
    description: 'Λίστα προϊόντων σε προσφορά',
    numberOfItems: products.length,
    itemListElement: products.map((product, index) => {
      // Calculate global position (για pagination)
      const globalPosition = ((currentPage - 1) * products.length) + index + 1

      // Product image
      const productImage = product.image 
        ? `${process.env.NEXT_PUBLIC_API_URL}${product.image.url}`
        : undefined

      // Brand if available
      const brandNode = product.brand ? {
        '@type': 'Brand' as const,
        name: product.brand.name,
      } : undefined

      // Offer node
      const offerNode: SchemaOffer = {
        '@type': 'Offer',
        price: product.sale_price || product.price,
        priceCurrency: 'EUR',
        availability: product.inventory > 0 
          ? 'https://schema.org/InStock' 
          : 'https://schema.org/OutOfStock',
        priceValidUntil: new Date(Date.now() + 30*24*60*60*1000).toISOString().split('T')[0],
        url: `${BASE_URL}/product/${product.slug}`,
        seller: {
          '@type': 'Organization',
          name: 'Magnet Market',
        },
        itemCondition: 'https://schema.org/NewCondition',
      }

      // Product node
      const productNode: SchemaProduct = {
        '@type': 'Product',
        '@id': `${BASE_URL}/product/${product.slug}`,
        name: product.name,
        url: `${BASE_URL}/product/${product.slug}`,
        ...(productImage && { image: productImage }),
        ...(brandNode && { brand: brandNode }),
        ...(product.mpn && { mpn: product.mpn }),
        ...(product.barcode && { gtin13: product.barcode }),
        offers: offerNode,
      }

      return {
        '@type': 'ListItem' as const,
        position: globalPosition,
        item: productNode,
      }
    }),
  }

  return {
    '@context': 'https://schema.org',
    '@graph': [
      organizationStructuredData,
      storeStructuredData,
      websiteNode,
      breadcrumbList,
      collectionPage,
      offersItemList, // ✨ Enhanced offer products list
    ],
  }
}

/* -------------------------------------------------------------------------- */
/*                                  Page                                       */
/* -------------------------------------------------------------------------- */

export default async function OffersPage({
  searchParams,
}: {
  searchParams: Promise<SearchParamsProps>
}) {
  const resolvedSearchParams = await searchParams
  const currentPage = Number(resolvedSearchParams.page) || 1

  const response = await getOfferProducts({
    searchParams: resolvedSearchParams,
  })

  // Generate enhanced structured data with products
  const structuredData = generateOffersStructuredData(
    response.products,
    currentPage,
    response.meta.pagination.pageCount
  )

  const breadcrumbs = [
    {
      title: 'Home',
      slug: '/',
    },
    {
      title: 'Προσφορές',
      slug: '/offers',
    },
  ]

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ 
          __html: JSON.stringify(structuredData)
        }}
        suppressHydrationWarning
      />
      <Breadcrumb breadcrumbs={breadcrumbs} />
      
      {/* Page Header */}
      <header className="w-full mt-8 mb-6 text-center">
        <h1 className="text-4xl font-bold text-siteColors-purple dark:text-siteColors-pink mb-2">
          🔥 Προσφορές
        </h1>
        <p className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
          Ανακάλυψε {response.meta.pagination.total} προϊόντα σε εκπληκτικές τιμές
        </p>
      </header>
      
      <div className="grid pt-4 w-full bg-white dark:bg-slate-800">
        <div className="grid lg:grid-cols-4 gap-4">
          {/* Desktop Filters */}
          <aside 
            className="hidden lg:flex lg:flex-col bg-slate-100 dark:bg-slate-700 p-4 rounded h-fit sticky top-4"
            aria-label="Φίλτρα προϊόντων"
          >
            <BrandFilters filters={response.filters} />
          </aside>
          
          {/* Products Grid */}
          <div className="flex flex-col pr-4 col-span-3 w-full">
            <CategoryPageHeader totalItems={response.meta.pagination.total} />
            
            <section 
              className="grid gap-1 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 place-content-center"
              aria-label="Προϊόντα σε προσφορά"
            >
              {response.products.length > 0 ? (
                response.products.map((product) => (
                  <article key={product.id}>
                    <ProductCard product={product} />
                  </article>
                ))
              ) : (
                <div className="col-span-full text-center py-12">
                  <p className="text-gray-500 dark:text-gray-400 text-lg">
                    Δεν βρέθηκαν προϊόντα σε προσφορά αυτή τη στιγμή
                  </p>
                </div>
              )}
            </section>
            
            {/* Mobile Filters */}
            <MobileBrandFilters filters={response.filters} />
            
            {/* Pagination */}
            {response.meta.pagination.pageCount > 1 && (
              <PaginationBar
                totalItems={response.meta.pagination.total}
                currentPage={response.meta.pagination.page}
                itemsPerPage={response.meta.pagination.pageSize}
              />
            )}
          </div>
        </div>
      </div>

      {/* SEO Content Section - Only on first page */}
      {currentPage === 1 && (
        <aside className="mt-16 prose prose-lg dark:prose-invert max-w-4xl mx-auto px-4">
          <h2 className="text-2xl font-bold text-siteColors-purple dark:text-siteColors-pink mb-4">
            Οι Καλύτερες Προσφορές σε Προϊόντα Τεχνολογίας
          </h2>
          <p className="text-gray-600 dark:text-gray-300">
            Στο Magnet Market θα βρείτε καθημερινά ενημερωμένες προσφορές σε υπολογιστές, 
            laptops, smartphones, tablets, περιφερειακά και πολλά άλλα προϊόντα τεχνολογίας. 
            Όλα τα προϊόντα μας συνοδεύονται από εγγύηση ελληνικής αντιπροσωπείας και 
            παρέχουμε γρήγορη παράδοση σε όλη την Ελλάδα.
          </p>
          <p className="text-gray-600 dark:text-gray-300 mt-4">
            Μην χάσετε τις περιορισμένες προσφορές μας - ανανεώνουμε συνεχώς τη λίστα με 
            νέα προϊόντα σε ασυναγώνιστες τιμές!
          </p>
        </aside>
      )}
    </>
  )
}

/* -------------------------------------------------------------------------- */
/*                                Metadata                                     */
/* -------------------------------------------------------------------------- */

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<SearchParamsProps>
}): Promise<Metadata> {
  const resolvedSearchParams = await searchParams
  const currentPage = Number(resolvedSearchParams.page) || 1
  
  const baseUrl = `${BASE_URL}/offers`
  const fullUrl = currentPage > 1 ? `${baseUrl}?page=${currentPage}` : baseUrl
  
  const title = currentPage > 1
    ? `Προσφορές σε Προϊόντα Τεχνολογίας - Σελίδα ${currentPage} | Magnet Market`
    : 'Προσφορές σε Προϊόντα Τεχνολογίας | Magnet Market'
  
  const description = 'Ανακαλύψτε τις καλύτερες προσφορές σε υπολογιστές, laptops, smartphones, tablets, κάμερες, εκτυπωτές, οθόνες και άλλα προϊόντα τεχνολογίας με εγγύηση.'

  return {
    title,
    description,
    keywords: 'προσφορές, εκπτώσεις, laptop προσφορές, υπολογιστές προσφορές, smartphones προσφορές, τεχνολογία προσφορές',
    
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
      canonical: fullUrl,
      ...(currentPage > 1 && {
        // @ts-ignore
        prev: currentPage === 2 ? baseUrl : `${baseUrl}?page=${currentPage - 1}`,
      }),
      // Note: We can't add next without knowing total pages here
    },

    openGraph: {
      title,
      description,
      url: fullUrl,
      siteName: 'magnetmarket.gr',
      type: 'website',
      locale: 'el_GR',
      images: [
        {
          url: `${BASE_URL}/_next/static/media/MARKET MAGNET-LOGO.79db5357.svg`,
          width: 1200,
          height: 630,
          alt: 'Magnet Market Logo',
        },
      ],
    },

    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [`${BASE_URL}/_next/static/media/MARKET MAGNET-LOGO.79db5357.svg`],
    },
  }
}