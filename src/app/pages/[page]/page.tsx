// app/pages/[page]/page.tsx

import { Metadata } from 'next'
import { 
  organizationStructuredData, 
  storeStructuredData 
} from '@/lib/helpers/structureData'
import { GET_PAGE_DATA, IPageDataProps } from '@/lib/queries/pagesQuery'
import { requestSSR } from '@/repositories/repository'
import type { 
  BreadcrumbList, 
  WebPage, 
  WebSite 
} from 'schema-dts'
import Image from 'next/image'

const BASE_URL = process.env.NEXT_URL || 'https://magnetmarket.gr'

type Props = {
  params: { page: string }
}

/* -------------------------------------------------------------------------- */
/*                              Data Fetching                                  */
/* -------------------------------------------------------------------------- */

async function getPageData(page: string) {
  const data = await requestSSR({
    query: GET_PAGE_DATA,
    variables: { title: page },
  })
  return data as IPageDataProps
}

/* -------------------------------------------------------------------------- */
/*                          Structured Data Helper                             */
/* -------------------------------------------------------------------------- */

function generatePageStructuredData(title: string, slug: string) {
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
    '@id': `${BASE_URL}/pages/${slug}#breadcrumb`,
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
        name: title,
        item: `${BASE_URL}/pages/${slug}`,
      },
    ],
  }

  // WebPage
  const webPage: WebPage = {
    '@type': 'WebPage',
    '@id': `${BASE_URL}/pages/${slug}#webpage`,
    url: `${BASE_URL}/pages/${slug}`,
    name: title,
    isPartOf: {
      '@id': `${BASE_URL}/#website`,
    },
    about: {
      '@id': `${BASE_URL}/#organization`,
    },
    breadcrumb: {
      '@id': `${BASE_URL}/pages/${slug}#breadcrumb`,
    },
    inLanguage: 'el-GR',
  }

  return {
    '@context': 'https://schema.org',
    '@graph': [
      organizationStructuredData,
      storeStructuredData,
      websiteNode,
      breadcrumbList,
      webPage,
    ],
  }
}

/* -------------------------------------------------------------------------- */
/*                                  Page                                       */
/* -------------------------------------------------------------------------- */

export default async function CustomPage({ params }: { params: { page: string } }) {
  const data = await getPageData(params.page)
  const pageData = data.pages.data[0].attributes

  // Generate structured data
  const structuredData = generatePageStructuredData(pageData.title, params.page)

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ 
          __html: JSON.stringify(structuredData).replaceAll('&quot;', '"')
        }}
        suppressHydrationWarning
      />
      <div className="mx-4 py-12 px-4 bg-slate-50 dark:bg-slate-700 rounded">
        <h1 className="font-bold text-xl text-center mb-8">
          {pageData.title}
        </h1>
        <div
          className="lg:mx-20 prose dark:prose-invert max-w-none"
          dangerouslySetInnerHTML={{ __html: pageData.mainText }}
        />
      </div>
    </>
  )
}

/* -------------------------------------------------------------------------- */
/*                                Metadata                                     */
/* -------------------------------------------------------------------------- */

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const data = await getPageData(params.page)
  const pageData = data.pages.data[0].attributes

  // Determine if page should be indexed based on type
  const noindexPages = ['terms', 'privacy', 'returns', 'payment-methods']
  const shouldIndex = !noindexPages.includes(params.page)

  const description = (pageData.mainText || pageData.title)
    .substring(0, 160)
    .trim()

  return {
    title: `${pageData.title} | Magnet Market`,
    description,

    robots: shouldIndex
      ? {
          index: true,
          follow: true,
        }
      : {
          index: false, // Legal pages often noindex
          follow: true,
        },

    alternates: {
      canonical: `${BASE_URL}/pages/${params.page}`,
    },

    openGraph: {
      title: `${pageData.title} | Magnet Market`,
      description,
      url: `${BASE_URL}/pages/${params.page}`,
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
      card: 'summary',
      title: `${pageData.title} | Magnet Market`,
      description,
    },

    // ΑΦΑΙΡΕΘΗΚΕ το other: { 'application/ld+json' }
  }
}