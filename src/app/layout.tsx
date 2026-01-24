// app/layout.tsx - OPTIMIZED VERSION

import './globals.css'
import dynamic from "next/dynamic"
import { Inter } from 'next/font/google'
import type { Metadata, Viewport } from 'next'
import Header from '@/components/organisms/header'
import Footer from '@/components/organisms/footer'
import Αnnouncement from '@/components/atoms/announcement'
import MobileTabMenu from '@/components/organisms/mobileTabMenu'
import { CheckoutProvider } from '@/context/checkout'
import { MenuProvider } from '@/context/menu'
import { Toaster } from 'sonner'
import SessionProviders from '@/components/molecules/sessionProvider'
import { getSession } from './api/auth/[...nextauth]/options'
import { GoogleAnalytics } from '@next/third-parties/google'
import Script from 'next/script'
import { Suspense } from 'react'
import BestPriceScript from '@/components/atoms/bestPrice360'
import BestPriceBadge from '@/components/atoms/bestPriceBadge'
import { getMenu } from '@/lib/queries/categoryQuery'
import CookieBannerWrapper from '@/components/molecules/homepage/cookieBannerWrapper'
import { cookies } from 'next/headers'
import ScrollTracker from '@/components/molecules/ScrollTracker'

const PixelTracker = dynamic(() => import("../components/atoms/pixelTracker"), { ssr: false })
const inter = Inter({ subsets: ['greek', 'latin'], display: 'swap' })

/* ==================== Viewport Configuration ==================== */

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#1e293b' }, // slate-800
  ],
}

/* ==================== Root Metadata ==================== */

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_URL || 'https://magnetmarket.gr'),

  // Basic info
  title: {
    default: 'Magnet Market - Η τεχνολογία στο δικό σου πεδίο!',
    template: '%s | Magnet Market',
  },
  description: 'Ηλεκτρονικό κατάστημα τεχνολογίας με τις καλύτερες τιμές σε υπολογιστές, laptops, smartphones και άλλα προϊόντα.',

  // Application
  applicationName: 'Magnet Market',
  authors: [
    {
      name: 'Magnet Market Team',
      url: 'https://magnetmarket.gr',
    },
  ],
  generator: 'Next.js',
  keywords: [
    'ηλεκτρονικό κατάστημα',
    'τεχνολογία',
    'υπολογιστές',
    'laptops',
    'smartphones',
    'Χαλκίδα',
  ],

  // Category
  category: 'technology',

  // Referrer
  referrer: 'origin-when-cross-origin',

  // Manifest for PWA
  manifest: '/manifest.json',

  // Icons
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/web-app-manifest-192x192.png', sizes: '192x192', type: 'image/png' }, // Το εργαλείο το ονόμασε icon0
      { url: '/web-app-manifest-512x512.png', sizes: '512x512', type: 'image/png' }, // Το εργαλείο το ονόμασε icon1
    ],
    apple: [
      { url: '/apple-icon.png', sizes: '180x180', type: 'image/png' },
    ],
    other: [
      {
        rel: 'mask-icon',
        url: '/maskable_icon.png',
        // @ts-ignore
        color: '#6e276f', // purple
      },
    ],
  },

  // Apple Web App
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Magnet Market',
  },

  // Format detection
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },

  // OpenGraph defaults (pages can override)
  openGraph: {
    type: 'website',
    locale: 'el_GR',
    siteName: 'Magnet Market',
    images: [
      {
        url: '/MARKET MAGNET-LOGO.png',
        width: 1200,
        height: 630,
        alt: 'Magnet Market - Ηλεκτρονικό Κατάστημα Τεχνολογίας',
      },
    ],
  },

  // Twitter defaults
  twitter: {
    card: 'summary_large_image',
    site: '@magnetmarket',
    creator: '@magnetmarket',
  },

  // Verification
  verification: {
    // google: 'your-verification-code-here', // Προαιρετικό - έχεις DNS verification
    other: {
      'msvalidate.01': '0316C00C62960A7CD7E176FD68572160',
    },
  },

  // Robots
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-image-preview': 'large',
      'max-snippet': -1,
      'max-video-preview': -1,
    },
  },
}

/* ==================== Root Layout Component ==================== */

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await getSession()
  const menuData = await getMenu()
  const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID as string

  // Check if user has given consent (server-side)
  const cookieStore = cookies()
  const consentCookie = cookieStore.get('cookie_consent')
  const hasConsent = consentCookie?.value === 'true'

  return (
    <html lang="el" suppressHydrationWarning>
      <head>
        {/* Preconnect to external domains */}
        <link rel="preconnect" href={process.env.NEXT_PUBLIC_API_URL} />
        <link rel="dns-prefetch" href={process.env.NEXT_PUBLIC_API_URL} />
        <link rel="preconnect" href="https://www.googletagmanager.com" />
        <link rel="preconnect" href="https://www.google-analytics.com" />
        <link rel="preconnect" href="https://connect.facebook.net" />

        {/* Google Consent Mode v2 - Dynamic based on cookie */}
        <Script id="google-consent-mode" strategy="beforeInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            
            gtag('consent', 'default', {
              'ad_storage': ${hasConsent ? "'granted'" : "'denied'"},
              'analytics_storage': ${hasConsent ? "'granted'" : "'denied'"},
              'ad_personalization': ${hasConsent ? "'granted'" : "'denied'"},
              'ad_user_data': ${hasConsent ? "'granted'" : "'denied'"},
              'wait_for_update': 500
            });
            
            gtag('set', 'ads_data_redaction', true);
            gtag('set', 'url_passthrough', true);
          `}
        </Script>

        {/* Facebook Pixel */}
        <Script
          id="pixel-script"
          strategy='afterInteractive'
          dangerouslySetInnerHTML={{
            __html: `
              !function(f,b,e,v,n,t,s)
              {if(f.fbq)return;n=f.fbq=function(){n.callMethod ?
                n.callMethod.apply(n, arguments) : n.queue.push(arguments)};
              if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
              n.queue=[];t=b.createElement(e);t.async=!0;
              t.src=v;s=b.getElementsByTagName(e)[0];
              s.parentNode.insertBefore(t,s)}(window, document,'script',
              'https://connect.facebook.net/en_US/fbevents.js');
              fbq('init', '${process.env.FACEBOOK_PIXEL}');
              fbq('track', 'PageView');
            `,
          }}
        />

        {/* Noscript fallback for Facebook Pixel */}
        <noscript>
          <img
            height="1"
            width="1"
            style={{ display: 'none' }}
            src={`https://www.facebook.com/tr?id=${process.env.FACEBOOK_PIXEL}&ev=PageView&noscript=1`}
            alt=""
          />
        </noscript>
      </head>

      <body className={`${inter.className} h-full dark:bg-slate-800`}>
        <SessionProviders session={session}>
          <CheckoutProvider>
            <Toaster
              toastOptions={{
                classNames: {
                  error: 'bg-red-400 p-4 rounded-lg',
                  success: 'bg-green-500 p-4 rounded-lg',
                  warning: 'text-yellow-400 p-4 rounded-lg',
                  info: 'bg-blue-300 text-black p-4 rounded-lg',
                },
              }}
            />

            <Suspense fallback={null}>
              <PixelTracker />
            </Suspense>

            <Αnnouncement />

            <MenuProvider>
              <Header user={session?.user?.name?.split('@')[0]} menuData={menuData} />

              <main
                className='mx-2 sm:mx-4 md:mx-8 relative'
                id="main-content"
                role="main"
              >
                <ScrollTracker />
                {children}
              </main>

              <Footer />
              <BestPriceBadge />
              <CookieBannerWrapper />
              <MobileTabMenu menuData={menuData} />
            </MenuProvider>
          </CheckoutProvider>
        </SessionProviders>

        <BestPriceScript />

        {/* GA loads AFTER consent mode */}
        <GoogleAnalytics gaId={GA_MEASUREMENT_ID} />
      </body>
    </html>
  )
}