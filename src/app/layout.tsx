import './globals.css'
import { Inter } from 'next/font/google'
import Header from '@/components/organisms/header'
import Footer from '@/components/organisms/footer'
import Αnnouncement from '@/components/atoms/announcement'
import MobileTabMenu from '@/components/organisms/mobileTabMenu'
import SessionProviders from '@/components/molecules/sessionProvider'
import { getServerSession } from "next-auth/next"
import { options } from './api/auth/[...nextauth]/options'
import { CartProvider } from '@/context/cart'
import { ShippingProvider } from '@/context/shipping'
import { MenuProvider } from '@/context/menu'
import { Suspense } from 'react'
import GoogleAnalytics from '@/components/molecules/homepage/google-analytics'
import CookieBanner from '@/components/molecules/homepage/cookie-banner'
import EpayIcons from '@/components/molecules/epayIcons'
import { Toaster } from 'sonner';

const inter = Inter({ subsets: ['greek'] })

export const metadata = {
  title: 'Magnet Market',
  description: 'Η τεχολογία στο δικό σου πεδίο!',
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await getServerSession(options)

  const GA_MEASUREMENT_ID = process.env.GA_MEASUREMENT_ID as string

  return (
    <html lang="el">
      <Suspense fallback={null}>
        <GoogleAnalytics GA_MEASUREMENT_ID={GA_MEASUREMENT_ID} />
      </Suspense>
      <body className={`${inter.className} h-full dark:bg-slate-800`}>
        <SessionProviders session={session}>
          <CartProvider>
            <ShippingProvider>
              <Toaster
                toastOptions={{
                  unstyled: true,
                  classNames: {
                    error: 'bg-red-400',
                    success: 'bg-green-500 p-4 rounded-lg',
                    warning: 'text-yellow-400',
                    info: 'relative w-96 right-10 w-auto z-20 bg-slate-50 rounded-lg p-4',
                  },
                }} />
              <Αnnouncement />
              <Header user={session?.user?.name?.split('@')[0]} />
              <main className='mx-2 xs:mx-4 sm:mx-6 md:mx-8'>
                {children}
              </main>
              <Footer />
              <EpayIcons />
              <CookieBanner />
              <MenuProvider>
                <MobileTabMenu />
              </MenuProvider>
            </ShippingProvider>
          </CartProvider>
        </SessionProviders>
      </body>
    </html>
  )
}
