// app/checkout/customer-info/page.tsx

import { Metadata } from 'next'
import CustomerInfoClient from '@/components/organisms/checkout/CustomerInfoClient'

const BASE_URL = process.env.NEXT_URL || 'https://magnetmarket.gr'

/* -------------------------------------------------------------------------- */
/*                          Structured Data (Module Level)                     */
/* -------------------------------------------------------------------------- */

const checkoutStructuredData = {
  '@context': 'https://schema.org',
  '@type': 'CheckoutPage',
  name: 'Στοιχεία Παράδοσης',
  description: 'Checkout - Customer Information',
  // NO URL - δεν θέλουμε indexing
}

/* -------------------------------------------------------------------------- */
/*                                  Page                                       */
/* -------------------------------------------------------------------------- */

export default function CustomerInfoPage() {
  return <CustomerInfoClient />
}

/* -------------------------------------------------------------------------- */
/*                                Metadata                                     */
/* -------------------------------------------------------------------------- */

export const metadata: Metadata = {
  title: 'Στοιχεία Παράδοσης | Magnet Market',
  description: 'Συμπληρώστε τα στοιχεία παράδοσης για την ολοκλήρωση της παραγγελίας σας',
  
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