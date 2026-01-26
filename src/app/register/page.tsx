// src/app/register/page.tsx

import { Metadata } from 'next'
import RegisterComp from '@/components/organisms/registerComp'

const BASE_URL = process.env.NEXT_URL || 'https://magnetmarket.gr'

/* -------------------------------------------------------------------------- */
/*                                  Page                                       */
/* -------------------------------------------------------------------------- */

export default function Register() {
  // ℹ️ NO structured data needed - auth pages are noindex
  return <RegisterComp />
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
        url: `${BASE_URL}/_next/static/media/MARKET MAGNET-LOGO.79db5357.svg`,
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
    images: [`${BASE_URL}/_next/static/media/MARKET MAGNET-LOGO.79db5357.svg`],
  },

  // Additional metadata
  other: {
    'contact:email': 'info@magnetmarket.gr',
    'contact:phone_number': '+30 2221121657',
    'contact:country': 'GR',
    // NO structured data - noindex page
  },
}