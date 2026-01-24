// app/checkout/success/page.tsx

import { Metadata } from 'next'
import { getCookies } from '@/lib/helpers/actions'
import SuccessClient from '@/components/organisms/checkout/SuccessClient'

const BASE_URL = process.env.NEXT_URL || 'https://magnetmarket.gr'

/* -------------------------------------------------------------------------- */
/*                          Structured Data (Module Level)                     */
/* -------------------------------------------------------------------------- */

const orderConfirmationStructuredData = {
  '@context': 'https://schema.org',
  '@type': 'OrderConfirmationPage',
  name: 'Επιβεβαίωση Παραγγελίας',
  description: 'Η παραγγελία σας ολοκληρώθηκε με επιτυχία',
  // NO URL - κάθε παραγγελία είναι unique, δεν θέλουμε indexing
}

/* -------------------------------------------------------------------------- */
/*                                  Page                                       */
/* -------------------------------------------------------------------------- */

export default async function ThankYouPage() {
  // Keep all your existing logic
  const orderCookie = await getCookies({ name: '_mmo' })
  const ApprovalCodeCookie = await getCookies({ name: '_apc' })
  
  return (
    <SuccessClient 
      orderCookie={orderCookie}
      ApprovalCodeCookie={ApprovalCodeCookie}
    />
  )
}

/* -------------------------------------------------------------------------- */
/*                                Metadata                                     */
/* -------------------------------------------------------------------------- */

export const metadata: Metadata = {
  title: 'Ευχαριστούμε για την Παραγγελία | Magnet Market',
  description: 'Η παραγγελία σας ολοκληρώθηκε με επιτυχία. Θα λάβετε email επιβεβαίωσης σύντομα.',
  
  // ⚠️ SPECIAL CASE: Thank you pages
  // Each order = unique URL = potential duplicate content
  robots: {
    index: false, // ❌ NO indexing - prevents duplicate content
    follow: true, // ✅ Allow following for analytics & tracking
    googleBot: {
      index: false,
      follow: true,
    },
  },
  
  // Alternative approach: Canonical to homepage (uncomment if preferred)
  // alternates: {
  //   canonical: `${BASE_URL}/`,
  // },
  
  // NO OpenGraph - we don't want people sharing order confirmations
  // NO Twitter Cards - private transaction page

  other: {
    'application/ld+json': JSON.stringify(orderConfirmationStructuredData).replaceAll('&quot;', '"'),
  },
}

/* -------------------------------------------------------------------------- */
/*                            Dynamic Configuration                            */
/* -------------------------------------------------------------------------- */

// Prevent static generation - success page is always dynamic
export const dynamic = 'force-dynamic'
export const revalidate = 0