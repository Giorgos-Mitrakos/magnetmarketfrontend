// src/app/forgot-password/page.tsx
import { Metadata } from 'next';
import ForgotPasswordClient from '@/components/organisms/forgoten-password/forgot-password-client';

const BASE_URL = process.env.NEXT_URL || 'https://magnetmarket.gr';

/* -------------------------------------------------------------------------- */
/*                                  Page                                       */
/* -------------------------------------------------------------------------- */
export default function ForgotPasswordPage() {
  // ℹ️ NO structured data needed - auth pages are noindex
  return <ForgotPasswordClient />;
}

/* -------------------------------------------------------------------------- */
/*                                Metadata                                     */
/* -------------------------------------------------------------------------- */
export const metadata: Metadata = {
  title: 'Επαναφορά Κωδικού | Magnet Market',
  description: 'Ξεχάσατε τον κωδικό σας; Επαναφέρετε τον κωδικό πρόσβασής σας εύκολα και γρήγορα.',
  
  robots: {
    index: false,
    follow: true,
  },
  
  alternates: {
    canonical: `${BASE_URL}/forgot-password`,
  },

  openGraph: {
    title: 'Επαναφορά Κωδικού | Magnet Market',
    description: 'Επαναφέρετε τον κωδικό πρόσβασής σας εύκολα και γρήγορα',
    url: `${BASE_URL}/forgot-password`,
    siteName: 'magnetmarket.gr',
    type: 'website',
    locale: 'el_GR',
  },

  twitter: {
    card: 'summary',
    title: 'Επαναφορά Κωδικού | Magnet Market',
    description: 'Επαναφέρετε τον κωδικό πρόσβασής σας',
  },

  // NO structured data - noindex page
};