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
  ItemList 
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
/*                          Structured Data (Module Level)                     */
/* -------------------------------------------------------------------------- */

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
  '@id': `${BASE_URL}/offers#breadcrumb`,
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
      item: `${BASE_URL}/offers`,
    },
  ],
}

// CollectionPage
const collectionPage: CollectionPage = {
  '@type': 'CollectionPage',
  '@id': `${BASE_URL}/offers#webpage`,
  url: `${BASE_URL}/offers`,
  name: 'Προσφορές',
  description: 'Ανακαλύψτε τις καλύτερες προσφορές σε προϊόντα τεχνολογίας',
  isPartOf: {
    '@id': `${BASE_URL}/#website`,
  },
  breadcrumb: {
    '@id': `${BASE_URL}/offers#breadcrumb`,
  },
  inLanguage: 'el-GR',
}

const structuredData = {
  '@context': 'https://schema.org',
  '@graph': [
    organizationStructuredData,
    storeStructuredData,
    websiteNode,
    breadcrumbList,
    collectionPage,
  ],
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

  const response = await getOfferProducts({
    searchParams: resolvedSearchParams,
  })

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
              {response.products.map((product) => (
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

/* -------------------------------------------------------------------------- */
/*                                Metadata                                     */
/* -------------------------------------------------------------------------- */

export const metadata: Metadata = {
  title: 'Προσφορές σε Προϊόντα Τεχνολογίας | Magnet Market',
  description: 'Ανακαλύψτε τις καλύτερες προσφορές σε υπολογιστές, laptops, smartphones, tablets, κάμερες, εκτυπωτές, οθόνες και άλλα προϊόντα τεχνολογίας με εγγύηση.',
  keywords: 'προσφορές, εκπτώσεις, laptop προσφορές, υπολογιστές προσφορές, smartphones προσφορές, τεχνολογία προσφορές',
  
  alternates: {
    canonical: `${BASE_URL}/offers`,
  },

  openGraph: {
    title: 'Προσφορές σε Προϊόντα Τεχνολογίας | Magnet Market',
    description: 'Μην χάσετε τις καλύτερες προσφορές σε προϊόντα τεχνολογίας',
    url: `${BASE_URL}/offers`,
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
    title: 'Προσφορές σε Προϊόντα Τεχνολογίας | Magnet Market',
    description: 'Μην χάσετε τις καλύτερες προσφορές σε προϊόντα τεχνολογίας',
    images: [`${BASE_URL}/_next/static/media/MARKET MAGNET-LOGO.79db5357.svg`],
  },

  other: {
    'application/ld+json': JSON.stringify(structuredData).replaceAll('&quot;', '"'),
  },
}