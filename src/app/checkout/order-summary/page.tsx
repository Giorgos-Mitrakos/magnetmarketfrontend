// app/checkout/confirm/page.tsx

import { Metadata } from 'next'
import ConfirmClient from '@/components/organisms/checkout/ConfirmClient'

const BASE_URL = process.env.NEXT_URL || 'https://magnetmarket.gr'

/* -------------------------------------------------------------------------- */
/*                          Structured Data (Module Level)                     */
/* -------------------------------------------------------------------------- */

const checkoutStructuredData = {
  '@context': 'https://schema.org',
  '@type': 'CheckoutPage',
  name: 'Σύνοψη Παραγγελίας',
  description: 'Επιβεβαίωση και ολοκλήρωση παραγγελίας',
  // NO URL - δεν θέλουμε indexing
}

/* -------------------------------------------------------------------------- */
/*                                  Page                                       */
/* -------------------------------------------------------------------------- */

export default function OrderSummaryPage() {
  return <ConfirmClient />
}

/* -------------------------------------------------------------------------- */
/*                                Metadata                                     */
/* -------------------------------------------------------------------------- */

export const metadata: Metadata = {
  title: 'Σύνοψη Παραγγελίας | Magnet Market',
  description: 'Επιβεβαιώστε την παραγγελία σας πριν την ολοκλήρωση',
  
  // 🚨 ΚΡΙΣΙΜΟ: Checkout pages ΔΕΝ πρέπει να indexάρονται!
  robots: {
    index: false, // ❌ NO indexing
    follow: false, // ❌ NO following links
    googleBot: {
      index: false,
      follow: false,
    },
  },
  
  // NO canonical - δεν θέλουμε να indexαριστεί καθόλου
  // NO OpenGraph - δεν κοινοποιείται
  // NO Twitter Cards - ιδιωτική σελίδα

  other: {
    'application/ld+json': JSON.stringify(checkoutStructuredData).replaceAll('&quot;', '"'),
  },
}

/* -------------------------------------------------------------------------- */
/*                            Dynamic Configuration                            */
/* -------------------------------------------------------------------------- */

// Prevent static generation - checkout is always dynamic
export const dynamic = 'force-dynamic'
export const revalidate = 0