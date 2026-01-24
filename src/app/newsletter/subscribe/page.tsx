// app/newsletter/subscribe/page.tsx

import { Metadata } from 'next'
import { 
  organizationStructuredData, 
  storeStructuredData 
} from '@/lib/helpers/structureData'
import type { 
  BreadcrumbList, 
  WebPage, 
  WebSite 
} from 'schema-dts'
import SubscribeClient from '@/components/organisms/newsletter/subscribe-client'

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
}

// BreadcrumbList
const breadcrumbList: BreadcrumbList = {
  '@type': 'BreadcrumbList',
  '@id': `${BASE_URL}/newsletter/subscribe#breadcrumb`,
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
      name: 'Newsletter',
      item: `${BASE_URL}/newsletter/subscribe`,
    },
  ],
}

// WebPage
const webPage: WebPage = {
  '@type': 'WebPage',
  '@id': `${BASE_URL}/newsletter/subscribe#webpage`,
  url: `${BASE_URL}/newsletter/subscribe`,
  name: 'Εγγραφή στο Newsletter',
  description: 'Εγγραφείτε στο newsletter μας για να λαμβάνετε αποκλειστικές προσφορές και νέα',
  isPartOf: {
    '@id': `${BASE_URL}/#website`,
  },
  about: {
    '@id': `${BASE_URL}/#organization`,
  },
  breadcrumb: {
    '@id': `${BASE_URL}/newsletter/subscribe#breadcrumb`,
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

export default function SubscribePage() {
  return <SubscribeClient />
}

/* -------------------------------------------------------------------------- */
/*                                Metadata                                     */
/* -------------------------------------------------------------------------- */

export const metadata: Metadata = {
  title: 'Εγγραφή στο Newsletter | Magnet Market',
  description: 'Εγγραφείτε στο newsletter του Magnet Market και μην χάσετε καμία προσφορά! Λάβετε αποκλειστικές εκπτώσεις και νέα για τεχνολογία.',
  keywords: 'newsletter, εγγραφή newsletter, προσφορές, εκπτώσεις, magnet market newsletter',
  
  robots: {
    index: true, // ✅ Newsletter signup page CAN be indexed
    follow: true,
  },
  
  alternates: {
    canonical: `${BASE_URL}/newsletter/subscribe`,
  },

  openGraph: {
    title: 'Εγγραφή στο Newsletter | Magnet Market',
    description: 'Μην χάσετε καμία προσφορά! Εγγραφείτε στο newsletter μας.',
    url: `${BASE_URL}/newsletter/subscribe`,
    siteName: 'magnetmarket.gr',
    type: 'website',
    locale: 'el_GR',
  },

  twitter: {
    card: 'summary',
    title: 'Εγγραφή στο Newsletter | Magnet Market',
    description: 'Μην χάσετε καμία προσφορά! Εγγραφείτε στο newsletter μας.',
  },

  other: {
    'application/ld+json': JSON.stringify(structuredData).replaceAll('&quot;', '"'),
  },
}