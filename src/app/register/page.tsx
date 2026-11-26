// src/app/register/page.tsx

import { Metadata } from 'next'
import { Suspense } from 'react'
import RegisterComp from '@/components/organisms/registerComp'

const BASE_URL = process.env.NEXT_URL || 'https://magnetmarket.gr'

/* -------------------------------------------------------------------------- */
/*                                  Page                                       */
/* -------------------------------------------------------------------------- */

export default function Register() {
  // ℹ️ NO structured data needed - auth pages are noindex
  // (2026-11-26) Η σελίδα φτιάχνεται πλέον στατικά (χωρίς session στο layout) — το RegisterComp διαβάζει
  // το URL (useSearchParams, π.χ. callbackUrl), οπότε χρειάζεται Suspense για να περάσει το build.
  return (
    <Suspense fallback={<div className="min-h-[60vh]" aria-busy="true" />}>
      <RegisterComp />
    </Suspense>
  )
}

/* -------------------------------------------------------------------------- */
/*                                Metadata                                     */
/* -------------------------------------------------------------------------- */

export const metadata: Metadata = {
  title: 'Εγγραφή Νέου Λογαριασμού | Magnet Market',
  description: 'Δημιουργήστε δωρεάν λογαριασμό στο Magnet Market και αγοράστε υπολογιστές, laptops, smartphones και άλλα προϊόντα τεχνολογίας στις καλύτερες τιμές.',
  keywords: 'εγγραφή, δημιουργία λογαριασμού, magnet market, νέος λογαριασμός, register',
  
  robots: {
    index: false, // ❌ NO indexing - auth pages
    follow: true,
  },

  alternates: {
    canonical: `${BASE_URL}/register`,
  },

  openGraph: {
    title: 'Εγγραφή Νέου Λογαριασμού | Magnet Market',
    description: 'Δημιουργήστε δωρεάν λογαριασμό για να απολαμβάνετε τις υπηρεσίες μας',
    url: `${BASE_URL}/register`,
    siteName: 'magnetmarket.gr',
    type: 'website',
    locale: 'el_GR',
    images: [
      {
        url: `${BASE_URL}/MARKET%20MAGNET-LOGO.png`,
        width: 1200,
        height: 630,
        alt: 'Magnet Market Logo',
      },
    ],
  },

  twitter: {
    card: 'summary_large_image',
    title: 'Εγγραφή Νέου Λογαριασμού | Magnet Market',
    description: 'Δημιουργήστε δωρεάν λογαριασμό για να απολαμβάνετε τις υπηρεσίες μας',
    images: [`${BASE_URL}/MARKET%20MAGNET-LOGO.png`],
  },

  // Additional metadata
  other: {
    'contact:email': 'info@magnetmarket.gr',
    'contact:phone_number': '+30 2221121657',
    'contact:country': 'GR',
    // NO structured data - noindex page
  },
}