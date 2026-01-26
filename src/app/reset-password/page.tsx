// src/app/reset-password/page.tsx
import { Metadata } from 'next'
import ResetPasswordClient from '@/components/organisms/forgoten-password/reset-password-client'

const BASE_URL = process.env.NEXT_URL || 'https://magnetmarket.gr'

/* -------------------------------------------------------------------------- */
/*                                  Page                                       */
/* -------------------------------------------------------------------------- */
export default function ResetPasswordPage() {
  // ℹ️ NO structured data needed - auth pages with tokens are noindex
  return <ResetPasswordClient />
}

/* -------------------------------------------------------------------------- */
/*                                Metadata                                     */
/* -------------------------------------------------------------------------- */
export const metadata: Metadata = {
  title: 'Ορισμός Νέου Κωδικού | Magnet Market',
  description: 'Ορίστε νέο κωδικό πρόσβασης για τον λογαριασμό σας',
  
  robots: {
    index: false, // ❌ NO indexing - auth pages με tokens
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