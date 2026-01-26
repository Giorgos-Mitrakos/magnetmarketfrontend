// app/newsletter/unsubscribe/page.tsx
import { Metadata } from 'next'
import UnsubscribeClient from '@/components/organisms/newsletter/unsubscribe-client'

const BASE_URL = process.env.NEXT_URL || 'https://magnetmarket.gr'

/* -------------------------------------------------------------------------- */
/*                                  Page                                       */
/* -------------------------------------------------------------------------- */
export default function UnsubscribeConfirmPage() {
  // ℹ️ NO structured data needed - transactional pages are noindex
  return <UnsubscribeClient />
}

/* -------------------------------------------------------------------------- */
/*                                Metadata                                     */
/* -------------------------------------------------------------------------- */
export const metadata: Metadata = {
  title: 'Διαγραφή από Newsletter | Magnet Market',
  description: 'Διαγραφή από τη λίστα παραληπτών του newsletter',
  
  robots: {
    index: false, // ❌ NO indexing - transactional page με tokens
    follow: false,
  },
  
  // NO canonical - transactional page με query params
  // NO OpenGraph - private action page
  // NO Twitter Cards - private action page
  // NO structured data - noindex page
}

/* -------------------------------------------------------------------------- */
/*                            Dynamic Configuration                            */
/* -------------------------------------------------------------------------- */
export const dynamic = 'force-dynamic'
export const revalidate = 0