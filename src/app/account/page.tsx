'use client'
// «Ο λογαριασμός μου» (2026-10-26)
// - Κάθε καρτέλα φορτώνει μόνο τα δικά της δεδομένα (οι παραγγελίες δεν περιμένουν το προφίλ).
// - Στο κινητό οι καρτέλες είναι μια οριζόντια σειρά πάνω από το περιεχόμενο.
// - Η σύνδεση ελέγχεται και από το middleware (→ /login?callbackUrl=/account).

import UserOrders from "@/components/molecules/userOrders";
import ProfileAddresses from "@/components/organisms/profileAddresses";
import ChangePassword from "@/components/molecules/ChangePassword";
import { useAccount } from "@/hooks/useAccount";
import { signOut, useSession } from "next-auth/react";
import Link from "next/link";
import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import WishlistClient from "@/components/organisms/wishlist/WishlistClient";
import {
  AiOutlineAppstore,
  AiOutlineHeart,
  AiOutlineUser,
  AiOutlineLogout,
  AiOutlineLoading3Quarters,
} from "react-icons/ai";

type TabKey = 'profile' | 'orders' | 'wishlist'

const TABS: { key: TabKey; title: string; short: string; icon: React.ReactNode }[] = [
  { key: 'profile', title: 'Το προφίλ μου', short: 'Προφίλ', icon: <AiOutlineUser className="text-lg" /> },
  { key: 'orders', title: 'Οι παραγγελίες μου', short: 'Παραγγελίες', icon: <AiOutlineAppstore className="text-lg" /> },
  { key: 'wishlist', title: 'Αγαπημένα & ειδοποιήσεις', short: 'Αγαπημένα', icon: <AiOutlineHeart className="text-lg" /> },
]

const isTab = (v: string | null): v is TabKey => v === 'profile' || v === 'orders' || v === 'wishlist'

const LoadingSpinner = ({ text = 'Φόρτωση...' }: { text?: string }) => (
  <div className="flex justify-center items-center py-12" role="status">
    <AiOutlineLoading3Quarters className="animate-spin text-2xl text-siteColors-purple" />
    <span className="ml-2 text-gray-600 dark:text-gray-300">{text}</span>
  </div>
)

function ProfileTab({ jwt }: { jwt: string }) {
  const { data, loading, error, mutate } = useAccount<any>('profile')

  if (loading) return <LoadingSpinner text="Φόρτωση στοιχείων..." />
  if (error || !data?.user) {
    return (
      <div className="text-center py-8 px-4 text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 rounded-lg">
        <p>Δεν φορτώθηκαν τα στοιχεία σας.</p>
        <button type="button" onClick={() => mutate()} className="mt-3 underline font-semibold">Δοκιμάστε ξανά</button>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <ProfileAddresses
        key={data.user.info?.id}
        userInfo={data.user.info}
        billingAddress={data.user.billing_address}
        shippingAddress={data.user.shipping_address}
        jwt={jwt}
        onSaved={() => mutate()}
      />
      <ChangePassword />
    </div>
  )
}

function TabFromUrl({ onTab }: { onTab: (key: TabKey) => void }) {
  const tab = useSearchParams().get('tab')
  useEffect(() => {
    onTab(isTab(tab) ? tab : 'profile')
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab])
  return null
}

export default function Account() {
  const { data: session, status } = useSession()
  const [active, setActive] = useState<TabKey>('profile')
  const router = useRouter()

  const handleTabClick = (key: TabKey) => {
    setActive(key)
    // Το URL μένει συγχρονισμένο, ώστε τα links του μενού και το «πίσω» να δουλεύουν
    router.replace(key === 'profile' ? '/account' : `/account?tab=${key}`, { scroll: false })
    // (2026-10-28) Νέα καρτέλα → επιστροφή στην κορυφή, για να διαβάζεται από την αρχή
    // (πριν έμενε στο ίδιο σημείο όπου είχε σκρολάρει η προηγούμενη)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  // Καρτέλα από το URL (π.χ. από το μενού λογαριασμού της κεφαλίδας)
  const tabSync = (
    <Suspense fallback={null}>
      <TabFromUrl onTab={setActive} />
    </Suspense>
  )

  if (status === "loading") {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <LoadingSpinner />
      </div>
    )
  }

  if (!session) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center px-4">
        <div className="text-center">
          <AiOutlineUser className="text-6xl text-gray-400 mx-auto mb-4" />
          <h1 className="text-xl font-semibold text-gray-700 dark:text-gray-200">
            Συνδεθείτε για να δείτε τον λογαριασμό σας
          </h1>
          <div className="mt-6 flex justify-center gap-3">
            <Link href="/login?callbackUrl=/account" className="px-5 py-2.5 rounded-lg bg-siteColors-purple text-white font-semibold">
              Σύνδεση
            </Link>
            <Link href="/register?callbackUrl=/account" className="px-5 py-2.5 rounded-lg border-2 border-siteColors-purple text-siteColors-purple font-semibold">
              Δημιουργία λογαριασμού
            </Link>
          </div>
        </div>
      </div>
    )
  }

  const jwt = (session.user as any)?.jwt as string
  const email = session.user?.email

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-6 sm:py-8">
      {tabSync}
      <div className="mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">Ο λογαριασμός μου</h1>
          {email && <p className="text-gray-600 dark:text-gray-400 mt-1 break-all">{email}</p>}
        </div>

        <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
          {/* Κινητό: οριζόντιες καρτέλες */}
          <nav aria-label="Ενότητες λογαριασμού" className="lg:hidden -mx-4 px-4 overflow-x-auto">
            <div className="flex gap-2 min-w-max" role="tablist">
              {TABS.map((tab) => (
                <button
                  key={tab.key}
                  type="button"
                  role="tab"
                  aria-selected={active === tab.key}
                  onClick={() => handleTabClick(tab.key)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold whitespace-nowrap transition-colors ${
                    active === tab.key
                      ? 'bg-siteColors-purple text-white'
                      : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 border border-gray-200 dark:border-gray-700'
                  }`}
                >
                  {tab.icon}
                  {tab.short}
                </button>
              ))}
              <button
                type="button"
                onClick={() => signOut({ callbackUrl: '/' })}
                className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold whitespace-nowrap text-red-600 dark:text-red-400 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700"
              >
                <AiOutlineLogout className="text-lg" />
                Αποσύνδεση
              </button>
            </div>
          </nav>

          {/* Desktop: πλαϊνό μενού */}
          <aside className="hidden lg:block lg:w-72 shrink-0">
            <nav aria-label="Ενότητες λογαριασμού" className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4 sticky top-8">
              <div className="space-y-1" role="tablist" aria-orientation="vertical">
                {TABS.map((tab) => (
                  <button
                    key={tab.key}
                    type="button"
                    role="tab"
                    aria-selected={active === tab.key}
                    className={`w-full flex items-center p-3 rounded-lg transition-colors ${
                      active === tab.key
                        ? 'bg-siteColors-purple text-white shadow-md'
                        : 'text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700'
                    }`}
                    onClick={() => handleTabClick(tab.key)}
                  >
                    <span className="flex-shrink-0">{tab.icon}</span>
                    <span className="ml-3 font-medium text-left">{tab.title}</span>
                  </button>
                ))}
                <div className="pt-3 mt-3 border-t border-gray-200 dark:border-gray-600">
                  <button
                    type="button"
                    className="w-full flex items-center p-3 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                    onClick={() => signOut({ callbackUrl: '/' })}
                  >
                    <AiOutlineLogout className="text-lg flex-shrink-0" />
                    <span className="ml-3 font-medium">Αποσύνδεση</span>
                  </button>
                </div>
              </div>
            </nav>
          </aside>

          <section className="flex-1 min-w-0">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4 sm:p-6">
              {active === 'profile' && <ProfileTab jwt={jwt} />}
              {active === 'orders' && <UserOrders jwt={jwt} />}
              {active === 'wishlist' && (
                <>
                  <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-4">Αγαπημένα & ειδοποιήσεις</h2>
                  <WishlistClient />
                </>
              )}
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}
