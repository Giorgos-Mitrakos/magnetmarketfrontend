// src/app/forgot-password/page.tsx

import { Metadata } from 'next';
import { 
  organizationStructuredData, 
  storeStructuredData 
} from '@/lib/helpers/structureData';
import type { 
  BreadcrumbList, 
  WebPage, 
  WebSite 
} from 'schema-dts';
import ForgotPasswordClient from '@/components/organisms/forgoten-password/forgot-password-client';

const BASE_URL = process.env.NEXT_URL || 'https://magnetmarket.gr';

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
};

// BreadcrumbList
const breadcrumbList: BreadcrumbList = {
  '@type': 'BreadcrumbList',
  '@id': `${BASE_URL}/forgot-password#breadcrumb`,
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
      item: `${BASE_URL}/forgot-password`,
    },
  ],
};

// WebPage
const webPage: WebPage = {
  '@type': 'WebPage',
  '@id': `${BASE_URL}/forgot-password#webpage`,
  url: `${BASE_URL}/forgot-password`,
  name: 'Επαναφορά Κωδικού',
  description: 'Επαναφέρετε τον κωδικό πρόσβασής σας',
  isPartOf: {
    '@id': `${BASE_URL}/#website`,
  },
  about: {
    '@id': `${BASE_URL}/#organization`,
  },
  breadcrumb: {
    '@id': `${BASE_URL}/forgot-password#breadcrumb`,
  },
  inLanguage: 'el-GR',
};

// Complete @graph
const structuredData = {
  '@context': 'https://schema.org',
  '@graph': [
    organizationStructuredData,
    storeStructuredData,
    websiteNode,
    breadcrumbList,
    webPage,
  ],
};

/* -------------------------------------------------------------------------- */
/*                                  Page                                       */
/* -------------------------------------------------------------------------- */

export default function ForgotPasswordPage() {
  return <ForgotPasswordClient />;
}

/* -------------------------------------------------------------------------- */
/*                                Metadata                                     */
/* -------------------------------------------------------------------------- */

export const metadata: Metadata = {
  title: 'Επαναφορά Κωδικού | Magnet Market',
  description: 'Ξεχάσατε τον κωδικό σας; Επαναφέρετε τον κωδικό πρόσβασής σας εύκολα και γρήγορα.',
  
  robots: {
    index: false,
    follow: true,
  },
  
  alternates: {
    canonical: `${BASE_URL}/forgot-password`,
  },

  openGraph: {
    title: 'Επαναφορά Κωδικού | Magnet Market',
    description: 'Επαναφέρετε τον κωδικό πρόσβασής σας εύκολα και γρήγορα',
    url: `${BASE_URL}/forgot-password`,
    siteName: 'magnetmarket.gr',
    type: 'website',
    locale: 'el_GR',
  },

  twitter: {
    card: 'summary',
    title: 'Επαναφορά Κωδικού | Magnet Market',
    description: 'Επαναφέρετε τον κωδικό πρόσβασής σας',
  },

  other: {
    'application/ld+json': JSON.stringify(structuredData).replaceAll('&quot;', '"'),
  },
};