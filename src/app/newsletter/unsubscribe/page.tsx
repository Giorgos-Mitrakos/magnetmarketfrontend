// app/newsletter/unsubscribe/page.tsx

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
import UnsubscribeClient from '@/components/organisms/newsletter/unsubscribe-client'

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
  '@id': `${BASE_URL}/newsletter/unsubscribe#breadcrumb`,
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
      name: 'Διαγραφή από Newsletter',
      item: `${BASE_URL}/newsletter/unsubscribe`,
    },
  ],
}

// WebPage
const webPage: WebPage = {
  '@type': 'WebPage',
  '@id': `${BASE_URL}/newsletter/unsubscribe#webpage`,
  url: `${BASE_URL}/newsletter/unsubscribe`,
  name: 'Διαγραφή από Newsletter',
  description: 'Διαγραφή από τη λίστα παραληπτών του newsletter',
  isPartOf: {
    '@id': `${BASE_URL}/#website`,
  },
  about: {
    '@id': `${BASE_URL}/#organization`,
  },
  breadcrumb: {
    '@id': `${BASE_URL}/newsletter/unsubscribe#breadcrumb`,
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

export default function UnsubscribeConfirmPage() {
  return <UnsubscribeClient />
}

/* -------------------------------------------------------------------------- */
/*                                Metadata                                     */
/* -------------------------------------------------------------------------- */

export const metadata: Metadata = {
  title: 'Διαγραφή από Newsletter | Magnet Market',
  description: 'Διαγραφή από τη λίστα παραληπτών του newsletter',
  
  robots: {
    index: false, // ❌ NO indexing - transactional page με tokens
    follow: false,
  },
  
  // NO canonical - transactional page με query params
  // NO OpenGraph - private action page
  // NO Twitter Cards - private action page

  other: {
    'application/ld+json': JSON.stringify(structuredData).replaceAll('&quot;', '"'),
  },
}

/* -------------------------------------------------------------------------- */
/*                            Dynamic Configuration                            */
/* -------------------------------------------------------------------------- */

export const dynamic = 'force-dynamic'
export const revalidate = 0