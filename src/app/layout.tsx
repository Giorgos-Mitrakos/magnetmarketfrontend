import './globals.css'
import dynamic from "next/dynamic";
import { Inter } from 'next/font/google'
import Header from '@/components/organisms/header'
import Footer from '@/components/organisms/footer'
import Αnnouncement from '@/components/atoms/announcement'
import MobileTabMenu from '@/components/organisms/mobileTabMenu'
import { CheckoutProvider } from '@/context/checkout'
import { MenuProvider } from '@/context/menu'
import { Toaster } from 'sonner';
import SessionProviders from '@/components/molecules/sessionProvider'
import { getSession } from './api/auth/[...nextauth]/options'
import { GoogleAnalytics } from '@next/third-parties/google'
import Script from 'next/script';
import { Suspense } from 'react';
import BestPriceScript from '@/components/atoms/bestPrice360';
import BestPriceBadge from '@/components/atoms/bestPriceBadge';
import { getMenu } from '@/lib/queries/categoryQuery';
import CookieBannerWrapper from '@/components/molecules/homepage/cookieBannerWrapper';
// import CookieBannerWrapper from '@/components/molecules/homepage/cookieBannerWrapper';
// import { getMenu } from '@/lib/helpers/categories';

const PixelTracker = dynamic(() => import("../components/atoms/pixelTracker"), { ssr: false });

const inter = Inter({ subsets: ['greek'] })

export const metadata = {
  title: 'Magnet Market',
  description: 'Η τεχνολογία στο δικό σου πεδίο!',
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await getSession()
  const menuData = await getMenu();

  const GA_MEASUREMENT_ID = process.env.GA_MEASUREMENT_ID as string

  return (
    <html lang="el">
      <head>
        <Script id="pixel-script" strategy='afterInteractive' dangerouslySetInnerHTML={{
          __html: `
          !function(f,b,e,v,n,t,s)
          {if(f.fbq)return;n=f.fbq=function(){n.callMethod ?
            n.callMethod.apply(n, arguments) : n.queue.push(arguments)};
          if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
          n.queue=[];t=b.createElement(e);t.async=!0;
          t.src=v;s=b.getElementsByTagName(e)[0];
s.parentNode.insertBefore(t,s)}(window, document,'script',
          'https://connect.facebook.net/en_US/fbevents.js');
          fbq('init', ${process.env.FACEBOOK_PIXEL});
          fbq('track', 'PageView');
        `,
        }}
        />
        <noscript><img src="https://www.facebook.com/tr?id=1151339979478836&ev=PageView&noscript=1" alt='facebook' height="1" width="1" className="display:none" />
          {/* <img height="1" width="1" className="display:none"/> */}
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
                  info: ' bg-blue-300 text-black p-4 rounded-lg',
                },
              }} />
            <Suspense fallback={null}>
              <PixelTracker />
            </Suspense>
            <Αnnouncement />
            <MenuProvider>
              <Header user={session?.user?.name?.split('@')[0]} menuData={menuData} />
              <main className='mx-2 sm:mx-4 md:mx-8'>
                {children}
              </main>
              <Footer />
              {/* <EpayIcons /> */}
              <BestPriceBadge />
              {/* <Copyright /> */}
              <CookieBannerWrapper />
              <MobileTabMenu menuData={menuData}  />
            </MenuProvider>
          </CheckoutProvider>
        </SessionProviders>
        <BestPriceScript />
      </body>
      <GoogleAnalytics gaId={GA_MEASUREMENT_ID} />
    </html>
  )
}
