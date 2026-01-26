// app/shopping-cart/page.tsx
import { Metadata } from 'next'
import CartComp from '@/components/organisms/shoping-cartComp'

const BASE_URL = process.env.NEXT_URL || 'https://magnetmarket.gr'

/* -------------------------------------------------------------------------- */
/*                                  Page                                       */
/* -------------------------------------------------------------------------- */
export default function Cart() {
  // ℹ️ NO structured data needed - shopping cart pages are noindex
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
  // NO structured data - noindex page
}

/* -------------------------------------------------------------------------- */
/*                            Dynamic Configuration                            */
/* -------------------------------------------------------------------------- */
export const dynamic = 'force-dynamic'
export const revalidate = 0