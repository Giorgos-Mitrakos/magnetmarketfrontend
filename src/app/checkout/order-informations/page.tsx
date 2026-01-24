// app/checkout/order-info/page.tsx

import { Metadata } from 'next'
import OrderInfoClient from '@/components/organisms/checkout/OrderInfoClient'

const BASE_URL = process.env.NEXT_URL || 'https://magnetmarket.gr'

/* -------------------------------------------------------------------------- */
/*                          Structured Data (Module Level)                     */
/* -------------------------------------------------------------------------- */

const checkoutStructuredData = {
  '@context': 'https://schema.org',
  '@type': 'CheckoutPage',
  name: 'Πληροφορίες Παραγγελίας',
  description: 'Επιλογή τρόπου αποστολής και πληρωμής',
  // NO URL - δεν θέλουμε indexing
}

/* -------------------------------------------------------------------------- */
/*                                  Page                                       */
/* -------------------------------------------------------------------------- */

export default function OrderInformationsPage() {
  return <OrderInfoClient />
}

/* -------------------------------------------------------------------------- */
/*                                Metadata                                     */
/* -------------------------------------------------------------------------- */

export const metadata: Metadata = {
  title: 'Πληροφορίες Παραγγελίας | Magnet Market',
  description: 'Επιλέξτε τρόπο αποστολής και πληρωμής για την ολοκλήρωση της παραγγελίας σας',
  
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