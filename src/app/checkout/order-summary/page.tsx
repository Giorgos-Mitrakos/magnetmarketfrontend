// app/checkout/confirm/page.tsx
import { Metadata } from 'next'
import ConfirmClient from '@/components/organisms/checkout/ConfirmClient'

const BASE_URL = process.env.NEXT_URL || 'https://magnetmarket.gr'

/* -------------------------------------------------------------------------- */
/*                                  Page                                       */
/* -------------------------------------------------------------------------- */
export default function OrderSummaryPage() {
  // ℹ️ NO structured data needed - checkout pages are noindex
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
    index: false,
    follow: false,
    googleBot: {
      index: false,
      follow: false,
    },
  },
  
  // NO canonical - δεν θέλουμε να indexαριστεί καθόλου
  // NO OpenGraph - δεν κοινοποιείται
  // NO Twitter Cards - ιδιωτική σελίδα
  // NO structured data - noindex page
}

/* -------------------------------------------------------------------------- */
/*                            Dynamic Configuration                            */
/* -------------------------------------------------------------------------- */
export const dynamic = 'force-dynamic'
export const revalidate = 0