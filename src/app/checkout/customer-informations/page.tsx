// app/checkout/customer-info/page.tsx
import CustomerInfoClient from '@/components/organisms/checkout/CustomerInfoClient'
import { Metadata } from 'next'

const BASE_URL = process.env.NEXT_URL || 'https://magnetmarket.gr'

/* -------------------------------------------------------------------------- */
/*                                  Page                                       */
/* -------------------------------------------------------------------------- */
export default function CustomerInfoPage() {
  // ℹ️ NO structured data needed - checkout pages are noindex
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
  
  // ΑΦΑΙΡΕΘΗΚΕ το other: { 'application/ld+json' }
}

/* -------------------------------------------------------------------------- */
/*                            Dynamic Configuration                            */
/* -------------------------------------------------------------------------- */
// Prevent static generation - checkout is always dynamic
export const dynamic = 'force-dynamic'
export const revalidate = 0