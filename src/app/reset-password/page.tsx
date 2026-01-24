// src/app/reset-password/page.tsx

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
import ResetPasswordClient from '@/components/organisms/forgoten-password/reset-password-client'

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
  '@id': `${BASE_URL}/reset-password#breadcrumb`,
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
      name: 'Επαναφορά Κωδικού',
      item: `${BASE_URL}/reset-password`,
    },
  ],
}

// WebPage
const webPage: WebPage = {
  '@type': 'WebPage',
  '@id': `${BASE_URL}/reset-password#webpage`,
  url: `${BASE_URL}/reset-password`,
  name: 'Ορισμός Νέου Κωδικού',
  description: 'Ορίστε νέο κωδικό πρόσβασης για τον λογαριασμό σας',
  isPartOf: {
    '@id': `${BASE_URL}/#website`,
  },
  about: {
    '@id': `${BASE_URL}/#organization`,
  },
  breadcrumb: {
    '@id': `${BASE_URL}/reset-password#breadcrumb`,
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

export default function ResetPasswordPage() {
  return <ResetPasswordClient />
}

/* -------------------------------------------------------------------------- */
/*                                Metadata                                     */
/* -------------------------------------------------------------------------- */

export const metadata: Metadata = {
  title: 'Ορισμός Νέου Κωδικού | Magnet Market',
  description: 'Ορίστε νέο κωδικό πρόσβασης για τον λογαριασμό σας',

  robots: {
    index: false, // ❌ NO indexing - auth pages με tokens
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