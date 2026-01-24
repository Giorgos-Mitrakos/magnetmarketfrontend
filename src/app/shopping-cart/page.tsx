// app/shopping-cart/page.tsx

import { Metadata } from 'next'
import CartComp from '@/components/organisms/shoping-cartComp'
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
}

// BreadcrumbList
const breadcrumbList: BreadcrumbList = {
  '@type': 'BreadcrumbList',
  '@id': `${BASE_URL}/shopping-cart#breadcrumb`,
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
      name: 'Καλάθι',
      item: `${BASE_URL}/shopping-cart`,
    },
  ],
}

// WebPage (όχι CheckoutPage - το cart δεν είναι checkout ακόμα)
const webPage: WebPage = {
  '@type': 'WebPage',
  '@id': `${BASE_URL}/shopping-cart#webpage`,
  url: `${BASE_URL}/shopping-cart`,
  name: 'Καλάθι Αγορών',
  description: 'Ελέγξτε το καλάθι αγορών σας',
  isPartOf: {
    '@id': `${BASE_URL}/#website`,
  },
  about: {
    '@id': `${BASE_URL}/#organization`,
  },
  breadcrumb: {
    '@id': `${BASE_URL}/shopping-cart#breadcrumb`,
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

export default function Cart() {
  return <CartComp />
}

/* -------------------------------------------------------------------------- */
/*                                Metadata                                     */
/* -------------------------------------------------------------------------- */

export const metadata: Metadata = {
  title: 'Καλάθι Αγορών | Magnet Market',
  description: 'Ελέγξτε τα προϊόντα στο καλάθι σας και προχωρήστε στην ολοκλήρωση της παραγγελίας',
  
  robots: {
    index: false, // ❌ NO indexing - shopping cart pages
    follow: true, // ✅ Follow για navigation
  },
  
  alternates: {
    canonical: `${BASE_URL}/shopping-cart`,
  },

  // NO OpenGraph - καλάθι είναι προσωπικό
  // NO Twitter Cards - δεν κοινοποιείται

  other: {
    'application/ld+json': JSON.stringify(structuredData).replaceAll('&quot;', '"'),
  },
}

/* -------------------------------------------------------------------------- */
/*                            Dynamic Configuration                            */
/* -------------------------------------------------------------------------- */

export const dynamic = 'force-dynamic'
export const revalidate = 0