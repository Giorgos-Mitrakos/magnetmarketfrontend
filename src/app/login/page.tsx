// src/app/login/page.tsx

import { Metadata } from 'next'
import LoginComp from '@/components/organisms/loginComp'

const BASE_URL = process.env.NEXT_URL || 'https://magnetmarket.gr'

/* -------------------------------------------------------------------------- */
/*                                  Page                                       */
/* -------------------------------------------------------------------------- */

export default function Login() {
  // ℹ️ NO structured data needed - login pages are noindex
  return <LoginComp />
}

/* -------------------------------------------------------------------------- */
/*                                Metadata                                     */
/* -------------------------------------------------------------------------- */

export const metadata: Metadata = {
  title: 'Σύνδεση Λογαριασμού | Magnet Market',
  description: 'Συνδεθείτε στον λογαριασμό σας στο Magnet Market και αγοράστε υπολογιστές, laptops, smartphones και άλλα προϊόντα τεχνολογίας στις καλύτερες τιμές.',
  keywords: 'σύνδεση, login, λογαριασμός, magnet market, είσοδος χρήστη',
  
  robots: {
    index: false, // Δεν θέλουμε indexing σε auth pages
    follow: true,
  },

  alternates: {
    canonical: `${BASE_URL}/login`,
  },

  openGraph: {
    title: 'Σύνδεση Λογαριασμού | Magnet Market',
    description: 'Συνδεθείτε στον λογαριασμό σας για να συνεχίσετε τις αγορές σας',
    url: `${BASE_URL}/login`,
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
    title: 'Σύνδεση Λογαριασμού | Magnet Market',
    description: 'Συνδεθείτε στον λογαριασμό σας για να συνεχίσετε τις αγορές σας',
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