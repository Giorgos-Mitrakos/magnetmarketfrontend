// app/checkout/customer-info/CustomerInfoClient.tsx
"use client"
// (2026-10-24) Βήμα 1: η μετάβαση στο βήμα 2 γίνεται μόνο αφού ελεγχθούν ΚΑΙ αποθηκευτούν
// τα στοιχεία (όχι με χρονόμετρο 100ms)· αν δεν φορτώσει το προφίλ, η φόρμα εμφανίζεται
// κανονικά (κενή)· στο κινητό το «Συνέχεια» είναι αμέσως κάτω από τη φόρμα.

import { useEffect, useRef, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Addresses, { FormInputRef } from '@/components/organisms/addresses'
import CartAside from '@/components/organisms/cartItemsAside'
import CartSummary from '@/components/atoms/cartSummary'
import CheckoutProgress from '@/components/molecules/checkoutProgress'
import PaymentSecurityBadges from '@/components/atoms/securePaymentBadge'
import { useAccount } from '@/hooks/useAccount'
import { trackCartEvent } from '@/lib/helpers/analytics'
import { useCheckout } from '@/context/checkout'

/* ==================== Types ==================== */

export interface IProfile {
    user: {
        info: {
            id: number
            email: string
        }
        shipping_address: {
            id: number
            firstname: string
            lastname: string
            telephone: string
            mobilePhone: string
            street: string
            city: string
            state: string
            zipCode: string
            country: string
            afm: string
            doy: string
            companyName: string
            businessActivity: string
            isInvoice: boolean
        }
        billing_address: {
            id: number
            firstname: string
            lastname: string
            telephone: string
            mobilePhone: string
            street: string
            city: string
            state: string
            zipCode: string
            country: string
            afm: string
            doy: string
            companyName: string
            businessActivity: string
            isInvoice: boolean
        }
    }
}

/* ==================== Component ==================== */

export default function CustomerInfoClient() {
    const router = useRouter()
    const { checkout } = useCheckout()
    // Το καλάθι φορτώνει από τον browser μετά το πρώτο render
    const [hydrated, setHydrated] = useState(false)
    useEffect(() => {
        const t = setTimeout(() => setHydrated(true), 500)
        return () => clearTimeout(t)
    }, [])
    const [processing, setProcessing] = useState(false)
    const { data: session, status } = useSession()
    
    const { data, loading, error }: { 
        data: IProfile
        loading: boolean
        error: any 
    } = useAccount<IProfile>('profile') as { data: IProfile, loading: boolean, error: any }

    const formikRef = useRef<FormInputRef | null>(null)

    // Άδειο καλάθι (π.χ. ολοκληρώθηκε η παραγγελία σε άλλη καρτέλα) → πίσω στο καλάθι
    useEffect(() => {
        if (hydrated && !checkout.cart.length) router.replace('/shopping-cart')
    }, [hydrated, checkout.cart.length, router])

    const handleNextOnClick = async () => {
        if (!checkout.cart.length || processing) return
        setProcessing(true)
        try {
            const ok = await formikRef.current?.submitForm()
            if (ok) {
                trackCartEvent('add_shipping_info', checkout.cart)
                router.push('/checkout/order-informations')
                return // το κουμπί μένει σε «Περιμένετε...» μέχρι να αλλάξει η σελίδα
            }
        } catch {
            // τίποτα — τα μηνύματα φαίνονται στη φόρμα
        }
        setProcessing(false)
    }

    const continueButton = (className = '') => (
        <button
            type="button"
            onClick={handleNextOnClick}
            disabled={processing || !checkout.cart.length || loading}
            className={`w-full bg-gradient-to-r from-siteColors-purple to-siteColors-pink 
                     hover:from-siteColors-pink hover:to-siteColors-purple 
                     text-white font-semibold py-4 px-6 rounded-xl shadow-lg 
                     transition-all duration-200 hover:shadow-xl 
                     disabled:opacity-50 disabled:cursor-not-allowed
                     focus:outline-none focus:ring-2 focus:ring-siteColors-purple focus:ring-offset-2 ${className}`}
        >
            {processing ? (
                <span className="flex items-center justify-center">
                    <span className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2" aria-hidden="true"></span>
                    Περιμένετε...
                </span>
            ) : (
                'Συνέχεια στην αποστολή & πληρωμή'
            )}
        </button>
    )

    // Loading state
    if (status === "loading") {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="flex flex-col items-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-siteColors-purple"></div>
                    <p className="mt-4 text-gray-600 dark:text-gray-400">
                        Φόρτωση...
                    </p>
                </div>
            </div>
        )
    }

    return (
        <div className="w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {/* Progress Indicator */}
            <CheckoutProgress currentStep={1} />

            {/* Main Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
                {/* Left Column - Address Form */}
                <section 
                    className="lg:col-span-3"
                    aria-labelledby="shipping-heading"
                >
                    <div className="bg-white dark:bg-slate-700 rounded-xl shadow-lg p-6 md:p-8">
                        {/* Header */}
                        <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-200 dark:border-slate-600">
                            <h1 
                                id="shipping-heading"
                                className="text-xl md:text-2xl font-semibold text-gray-900 dark:text-white"
                            >
                                Στοιχεία Παράδοσης
                            </h1>
                            {session?.user && (
                                <span 
                                    className="px-3 py-1 bg-green-100 text-green-800 text-sm rounded-full dark:bg-green-900 dark:text-green-200"
                                    aria-label="Είστε συνδεδεμένος"
                                >
                                    Συνδεδεμένος
                                </span>
                            )}
                        </div>

                        {/* Content */}
                        {loading ? (
                            <div className="flex items-center justify-center py-12">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-siteColors-purple"></div>
                                <span className="ml-3 text-gray-600 dark:text-gray-400">
                                    Φόρτωση στοιχείων...
                                </span>
                            </div>
                        ) : (
                            <div className="space-y-6">
                                {error && (
                                    <p className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800 dark:border-amber-800 dark:bg-amber-900/20 dark:text-amber-200" role="status">
                                        Δεν φορτώθηκαν τα αποθηκευμένα στοιχεία σας — συμπληρώστε τα παρακάτω.
                                    </p>
                                )}
                                <Addresses user={data?.user} ref={formikRef} />
                            </div>
                        )}
                        {/* Κινητό: η συνέχεια αμέσως μετά τη φόρμα */}
                        <div className="mt-8 lg:hidden">{continueButton()}</div>
                    </div>
                </section>

                {/* Right Column - Cart & Summary */}
                <aside 
                    className="lg:col-span-2"
                    aria-label="Σύνοψη παραγγελίας"
                >
                    <div className="sticky top-8 space-y-6">
                        {/* Cart Summary */}
                        <div className="space-y-3">
                            <CartSummary />
                        </div>

                        {/* Cart Items */}
                        <div className="max-h-96 overflow-y-auto">
                            <CartAside />
                        </div>

                        {/* Continue Button (υπολογιστής) */}
                        {continueButton('hidden lg:block')}

                        {/* Security Badges */}
                        <PaymentSecurityBadges />
                    </div>
                </aside>
            </div>
        </div>
    )
}