"use client"

import Addresses, { FormInputRef } from '@/components/organisms/addresses'
import { useRef, useState } from 'react';
import { useApiRequest } from '@/repositories/clientRepository';
import { useSession } from 'next-auth/react';
import CartAside from '@/components/organisms/cartItemsAside';
import CartSummary from '@/components/atoms/cartSummary';
import { useRouter } from 'next/navigation';
import { trackCartEvent } from '@/lib/helpers/analytics';
import { useCheckout } from '@/context/checkout';
import CheckoutProgress from '@/components/molecules/checkoutProgress';
import PaymentSecurityBadges from '@/components/atoms/securePaymentBadge';

export interface IProfile {
    user: {
        info: {
            id: number,
            email: string,
        },
        shipping_address: {
            id: number,
            firstname: string,
            lastname: string,
            telephone: string,
            mobilePhone: string,
            street: string,
            city: string,
            state: string,
            zipCode: string,
            country: string,
            afm: string,
            doy: string,
            companyName: string,
            businessActivity: string,
            isInvoice: boolean
        },
        billing_address: {
            id: number,
            firstname: string,
            lastname: string,
            telephone: string,
            mobilePhone: string,
            street: string,
            city: string,
            state: string,
            zipCode: string,
            country: string,
            afm: string,
            doy: string,
            companyName: string,
            businessActivity: string,
            isInvoice: boolean
        }
    }
}

const CustomerInfo = () => {
    const router = useRouter()
    const { checkout, dispatch } = useCheckout()
    const [processing, setProcessing] = useState(false)
    const { data: session, status } = useSession()
    const { data, loading, error }: { data: IProfile, loading: boolean, error: any } = useApiRequest({
        method: "GET",
        api: "/api/user-address/getUser",
        jwt: `${session?.user?.jwt}`
    })

    const formikRef = useRef<FormInputRef | null>(null);

    const handleNextOnClick = async () => {
        if (!checkout.cart) return
        setProcessing(true)
        formikRef.current?.submitForm()
        setTimeout(() => {
            if (formikRef.current?.isSubmitting) {
                router.push('/checkout/order-informations')
                trackCartEvent('add_shipping_info', checkout.cart)
            }
        }, 100);
        setProcessing(false)


    }

    if (status === "loading") {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-siteColors-purple"></div>
            </div>
        )
    }

    return (
        <div className="w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {/* Header */}
            <CheckoutProgress currentStep={1} />

            <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
                {/* Main Content - Address Form */}
                <div className="lg:col-span-3">
                    <div className="bg-white dark:bg-slate-700 rounded-xl shadow-lg p-6 md:p-8">
                        <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-200 dark:border-slate-700">
                            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                                Στοιχεία Παράδοσης
                            </h2>
                            {session?.user && (
                                <span className="px-3 py-1 bg-green-100 text-green-800 text-sm rounded-full dark:bg-green-900 dark:text-green-200">
                                    Συνδεδεμένος
                                </span>
                            )}
                        </div>

                        {loading ? (
                            <div className="flex items-center justify-center py-12">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-siteColors-purple"></div>
                                <span className="ml-3 text-gray-600 dark:text-gray-400">Φόρτωση στοιχείων...</span>
                            </div>
                        ) : error ? (
                            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-6">
                                <p className="text-red-800 dark:text-red-200">
                                    Σφάλμα φόρτωσης στοιχείων. Παρακαλώ δοκιμάστε ξανά.
                                </p>
                            </div>
                        ) : (
                            <div className="space-y-6">
                                <Addresses user={data?.user} ref={formikRef} />
                            </div>
                        )}
                    </div>
                </div>

                {/* Sidebar - Wider for Cart Components */}
                <div className="lg:col-span-2">
                    <div className="sticky top-8 space-y-6">
                        {/* Cart Summary */}
                        {/* <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6">                             */}
                        <div className="space-y-3">
                            <CartSummary />
                        </div>
                        {/* </div> */}

                        {/* Cart Items */}

                        <div className="max-h-96">
                            <CartAside />
                        </div>

                        {/* Continue Button */}
                        <button
                            onClick={handleNextOnClick}
                            disabled={processing || !checkout.cart}
                            className="w-full bg-gradient-to-r from-siteColors-purple to-siteColors-pink hover:from-siteColors-pink hover:to-siteColors-purple 
                                       text-white font-semibold py-4 px-6 rounded-xl shadow-lg transition-all duration-200 
                                       hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {processing ? (
                                <div className="flex items-center justify-center">
                                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                                    Περιμένετε...
                                </div>
                            ) : (
                                'Συνέχεια'
                            )}
                        </button>

                        {/* Security Badges */}
                        <PaymentSecurityBadges />
                    </div>
                </div>
            </div>

            {/* Mobile Bottom Bar */}
            {/* <div className="lg:hidden fixed bottom-14 left-0 right-0 bg-white dark:bg-slate-800 border-t border-gray-200 dark:border-slate-700 p-4 shadow-2xl">
                <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Σύνολο:</span>
                    <span className="text-lg font-semibold text-gray-900 dark:text-white">
                        {checkout.totals?.total?.toFixed(2)}€
                    </span>
                </div>
                <button
                    onClick={handleNextOnClick}
                    disabled={processing || !checkout.cart}
                    className="w-full bg-gradient-to-r from-siteColors-purple to-siteColors-pink text-white font-semibold py-3 px-6 rounded-lg 
                               disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {processing ? 'Περιμένετε...' : 'Συνέχεια στην Πληρωμή'}
                </button>
            </div> */}
        </div>
    )
}

export default CustomerInfo