// src/app/login/page.tsx

import { Metadata } from 'next'
import LoginComp from '@/components/organisms/loginComp'
import { 
  organizationStructuredData, 
  storeStructuredData 
} from '@/lib/helpers/structureData'
import type { 
  BreadcrumbList, 
  WebPage, 
  WebSite 
} from 'schema-dts'

const BASE_URL = process.env.NEXT_URL || 'https://magnetmarket.gr'

/* -------------------------------------------------------------------------- */
/*                            Structured Data                                  */
/* -------------------------------------------------------------------------- */

function getStructuredData() {
  // BreadcrumbList
  const breadcrumbList: BreadcrumbList = {
    '@type': 'BreadcrumbList',
    '@id': `${BASE_URL}/login#breadcrumb`,
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
        name: 'Είσοδος',
        item: `${BASE_URL}/login`,
      },
    ],
  }

  // WebSite (για SearchAction)
  const websiteNode: WebSite = {
    '@type': 'WebSite',
    '@id': `${BASE_URL}/#website`,
    url: BASE_URL,
    name: 'Magnet Market',
    publisher: {
      '@id': `${BASE_URL}/#organization`,
    },
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${BASE_URL}/search?q={search_term_string}`,
      },
      // @ts-ignore - query-input is valid but not in types
      'query-input': 'required name=search_term_string',
    },
  }

  // WebPage
  const webPage: WebPage = {
    '@type': 'WebPage',
    '@id': `${BASE_URL}/login#webpage`,
    url: `${BASE_URL}/login`,
    name: 'Σύνδεση Λογαριασμού',
    description: 'Συνδεθείτε στον λογαριασμό σας για να συνεχίσετε τις αγορές σας',
    isPartOf: {
      '@id': `${BASE_URL}/#website`,
    },
    about: {
      '@id': `${BASE_URL}/#organization`,
    },
    breadcrumb: {
      '@id': `${BASE_URL}/login#breadcrumb`,
    },
    inLanguage: 'el-GR',
  }

  // @graph Assembly
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

export default function Login() {
  return <LoginComp />
}

/* -------------------------------------------------------------------------- */
/*                                Metadata                                     */
/* -------------------------------------------------------------------------- */

export const metadata: Metadata = {
  title: 'Σύνδεση Λογαριασμού | Magnet Market',
  description: 'Συνδεθείτε στον λογαριασμό σας στο Magnet Market και αγοράστε υπολογιστές, laptops, smartphones και άλλα προϊόντα τεχνολογίας στις καλύτερες τιμές.',
  keywords: 'σύνδεση, login, λογαριασμός, magnet market, είσοδος χρήστη',
  
  robots: {
    index: false, // Δεν θέλουμε indexing σε auth pages
    follow: true,
  },

  alternates: {
    canonical: `${BASE_URL}/login`,
  },

  openGraph: {
    title: 'Σύνδεση Λογαριασμού | Magnet Market',
    description: 'Συνδεθείτε στον λογαριασμό σας για να συνεχίσετε τις αγορές σας',
    url: `${BASE_URL}/login`,
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
    title: 'Σύνδεση Λογαριασμού | Magnet Market',
    description: 'Συνδεθείτε στον λογαριασμό σας για να συνεχίσετε τις αγορές σας',
    images: [`${BASE_URL}/_next/static/media/MARKET MAGNET-LOGO.79db5357.svg`],
  },

  // Additional metadata
  other: {
    'contact:email': 'info@magnetmarket.gr',
    'contact:phone_number': '+30 2221121657',
    'contact:country': 'GR',
    'application/ld+json': JSON.stringify(getStructuredData()).replaceAll('&quot;', '"'),
  },
}