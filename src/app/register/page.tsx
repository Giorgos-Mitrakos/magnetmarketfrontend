// src/app/register/page.tsx

import { Metadata } from 'next'
import RegisterComp from '@/components/organisms/registerComp'
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

// BreadcrumbList
const breadcrumbList: BreadcrumbList = {
  '@type': 'BreadcrumbList',
  '@id': `${BASE_URL}/register#breadcrumb`,
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
      name: 'Εγγραφή',
      item: `${BASE_URL}/register`,
    },
  ],
}

// WebPage
const webPage: WebPage = {
  '@type': 'WebPage',
  '@id': `${BASE_URL}/register#webpage`,
  url: `${BASE_URL}/register`,
  name: 'Εγγραφή Νέου Λογαριασμού',
  description: 'Δημιουργήστε λογαριασμό για να απολαμβάνετε τις υπηρεσίες μας',
  isPartOf: {
    '@id': `${BASE_URL}/#website`,
  },
  about: {
    '@id': `${BASE_URL}/#organization`,
  },
  breadcrumb: {
    '@id': `${BASE_URL}/register#breadcrumb`,
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
    webPage,
  ],
}

/* -------------------------------------------------------------------------- */
/*                                  Page                                       */
/* -------------------------------------------------------------------------- */

export default function Register() {
  return <RegisterComp />
}

/* -------------------------------------------------------------------------- */
/*                                Metadata                                     */
/* -------------------------------------------------------------------------- */

export const metadata: Metadata = {
  title: 'Εγγραφή Νέου Λογαριασμού | Magnet Market',
  description: 'Δημιουργήστε δωρεάν λογαριασμό στο Magnet Market και αγοράστε υπολογιστές, laptops, smartphones και άλλα προϊόντα τεχνολογίας στις καλύτερες τιμές.',
  keywords: 'εγγραφή, δημιουργία λογαριασμού, magnet market, νέος λογαριασμός, register',
  
  robots: {
    index: false, // ❌ NO indexing - auth pages
    follow: true,
  },

  alternates: {
    canonical: `${BASE_URL}/register`,
  },

  openGraph: {
    title: 'Εγγραφή Νέου Λογαριασμού | Magnet Market',
    description: 'Δημιουργήστε δωρεάν λογαριασμό για να απολαμβάνετε τις υπηρεσίες μας',
    url: `${BASE_URL}/register`,
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
    title: 'Εγγραφή Νέου Λογαριασμού | Magnet Market',
    description: 'Δημιουργήστε δωρεάν λογαριασμό για να απολαμβάνετε τις υπηρεσίες μας',
    images: [`${BASE_URL}/_next/static/media/MARKET MAGNET-LOGO.79db5357.svg`],
  },

  // Additional metadata
  other: {
    'contact:email': 'info@magnetmarket.gr',
    'contact:phone_number': '+30 2221121657',
    'contact:country': 'GR',
    'application/ld+json': JSON.stringify(structuredData).replaceAll('&quot;', '"'),
  },
}