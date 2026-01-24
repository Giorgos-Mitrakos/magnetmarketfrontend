// app/checkout/failure/page.tsx

import { Metadata } from 'next'
import { getCookies } from '@/lib/helpers/actions'
import FailureClient from '@/components/organisms/checkout/FailureClient'

const BASE_URL = process.env.NEXT_URL || 'https://magnetmarket.gr'

/* -------------------------------------------------------------------------- */
/*                          Structured Data (Module Level)                     */
/* -------------------------------------------------------------------------- */

const orderFailureStructuredData = {
  '@context': 'https://schema.org',
  '@type': 'WebPage',
  name: 'Αποτυχία Παραγγελίας',
  description: 'Η παραγγελία δεν ολοκληρώθηκε',
  // NO URL - δεν θέλουμε indexing failure pages
}

/* -------------------------------------------------------------------------- */
/*                                  Page                                       */
/* -------------------------------------------------------------------------- */

export default async function FailurePage() {
  const orderCookie = await getCookies({ name: '_mmo' })
  const rcfCookie = await getCookies({ name: '_rcf' })
  
  return (
    <FailureClient 
      orderCookie={orderCookie}
      rcfCookie={rcfCookie}
    />
  )
}

/* -------------------------------------------------------------------------- */
/*                                Metadata                                     */
/* -------------------------------------------------------------------------- */

export const metadata: Metadata = {
  title: 'Αποτυχία Παραγγελίας | Magnet Market',
  description: 'Η παραγγελία δεν ολοκληρώθηκε. Παρακαλούμε δοκιμάστε ξανά.',
  
  // ❌ Definitely NO indexing for failure pages
  robots: {
    index: false, // ❌ NO indexing
    follow: false, // ❌ Don't even follow links
    googleBot: {
      index: false,
      follow: false,
    },
  },
  
  // NO canonical - δεν θέλουμε καθόλου visibility
  // NO OpenGraph - δεν κοινοποιείται
  // NO Twitter Cards - ιδιωτική σελίδα

  other: {
    'application/ld+json': JSON.stringify(orderFailureStructuredData).replaceAll('&quot;', '"'),
  },
}

/* -------------------------------------------------------------------------- */
/*                            Dynamic Configuration                            */
/* -------------------------------------------------------------------------- */

// Prevent static generation - failure page is always dynamic
export const dynamic = 'force-dynamic'
export const revalidate = 0