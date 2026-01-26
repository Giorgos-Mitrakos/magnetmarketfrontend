// app/checkout/failure/page.tsx
import { Metadata } from 'next'
import { getCookies } from '@/lib/helpers/actions'
import FailureClient from '@/components/organisms/checkout/FailureClient'

const BASE_URL = process.env.NEXT_URL || 'https://magnetmarket.gr'

/* -------------------------------------------------------------------------- */
/*                                  Page                                       */
/* -------------------------------------------------------------------------- */
export default async function FailurePage() {
  const orderCookie = await getCookies({ name: '_mmo' })
  const rcfCookie = await getCookies({ name: '_rcf' })
  
  // ℹ️ NO structured data needed - failure pages are noindex
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
    index: false,
    follow: false,
    googleBot: {
      index: false,
      follow: false,
    },
  },
  
  // NO canonical - δεν θέλουμε καθόλου visibility
  // NO OpenGraph - δεν κοινοποιείται
  // NO Twitter Cards - ιδιωτική σελίδα
  // NO structured data - noindex page
}

/* -------------------------------------------------------------------------- */
/*                            Dynamic Configuration                            */
/* -------------------------------------------------------------------------- */
export const dynamic = 'force-dynamic'
export const revalidate = 0