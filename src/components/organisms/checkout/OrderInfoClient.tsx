"use client"
// (2026-10-24) Βήμα 2 — Αποστολή & πληρωμή:
//  - πάνω η διεύθυνση αποστολής με «Αλλαγή» (πίσω στο βήμα 1)
//  - χωρίς στοιχεία παράδοσης (π.χ. άνοιξε απευθείας η σελίδα) → βήμα 1
//  - σε λάθος, μετάβαση στην ενότητα που λείπει
//  - στο κινητό το «Συνέχεια» είναι αμέσως κάτω από τις επιλογές
import { useEffect, useState } from "react"
import Link from "next/link"
import CartSummary from "@/components/atoms/cartSummary"
import PaymentSecurityBadges from "@/components/atoms/securePaymentBadge"
import CheckoutProgress from "@/components/molecules/checkoutProgress"
import CouponForm from "@/components/molecules/CouponForm"
import PaymentMethods from "@/components/molecules/paymentMethods"
import ShippingMethods from "@/components/molecules/shippingMethods"
import CartAside from "@/components/organisms/cartItemsAside"
import { useCheckout } from "@/context/checkout"
import { saveCookies } from "@/lib/helpers/actions"
import { FormikProvider, useFormik } from "formik"
import { useRouter } from "next/navigation"
import * as Yup from 'yup'

const OrderInfoClient = () => {
    const { checkout } = useCheckout()
    const router = useRouter()

    // Το καλάθι / τα στοιχεία φορτώνουν από τον browser μετά το πρώτο render
    const [hydrated, setHydrated] = useState(false)
    useEffect(() => {
        const t = setTimeout(() => setHydrated(true), 500)
        return () => clearTimeout(t)
    }, [])
    useEffect(() => {
        if (!hydrated) return
        if (!checkout.cart.length) router.replace('/shopping-cart')
        else if (!checkout.addresses?.billing?.email) router.replace('/checkout/customer-informations')
    }, [hydrated, checkout.cart.length, checkout.addresses?.billing?.email, router])

    const formik = useFormik({
        initialValues: {
            shippingMethodId: checkout.shippingMethod?.id || null,
            shippingMethod: checkout.shippingMethod?.shipping || null,
            paymentMethodId: checkout.paymentMethod?.id || null,
            paymentMethod: checkout.paymentMethod?.attributes.name || null,
            installments: 1,
        },
        validationSchema: Yup.object({
            // documentId (κείμενο) στο Strapi v3
            shippingMethodId: Yup.string().required('*Yποχρεωτικό πεδίο!'),
            shippingMethod: Yup.string().nonNullable().required('*Yποχρεωτικό πεδίο!'),
            paymentMethodId: Yup.string().required('*Yποχρεωτικό πεδίο!'),
            paymentMethod: Yup.string().nonNullable().required('*Yποχρεωτικό πεδίο!'),
            installments: Yup.number().nonNullable().required('*Yποχρεωτικό πεδίο!'),
        }),

        onSubmit: async (values) => {
            await saveCookies({
                name: "_mmspm", value: values
            })
            router.push('/checkout/order-summary')
        },
    });

    const handleConfirmClick = async () => {
        const errors = await formik.validateForm()
        if (Object.keys(errors).length) {
            formik.setTouched({ shippingMethod: true, shippingMethodId: true, paymentMethod: true, paymentMethodId: true }, false)
            const target = errors.shippingMethodId || errors.shippingMethod ? 'shipping-section' : 'payment-section'
            document.getElementById(target)?.scrollIntoView({ behavior: 'smooth', block: 'center' })
            return
        }
        formik.submitForm()
    }

    const continueButton = (className = '') => (
        <button
            type="button"
            onClick={handleConfirmClick}
            disabled={formik.isSubmitting}
            className={`w-full bg-gradient-to-r from-siteColors-purple to-siteColors-pink hover:from-siteColors-pink hover:to-siteColors-purple 
                       text-white font-semibold py-4 px-6 rounded-xl shadow-lg transition-all duration-200 
                       hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
        >
            {formik.isSubmitting ? (
                <span className="flex items-center justify-center">
                    <span className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2" aria-hidden="true"></span>
                    Περιμένετε...
                </span>
            ) : (
                'Συνέχεια στον έλεγχο της παραγγελίας'
            )}
        </button>
    )

    // Διεύθυνση αποστολής (η άλλη διεύθυνση, αν δόθηκε)
    const a = checkout.addresses
    const ship = a?.different_shipping ? a.shipping : a?.billing
    const shipName = a?.different_shipping
        ? `${a.shipping.firstname ?? ''} ${a.shipping.lastname ?? ''}`.trim()
        : a?.billing?.isInvoice
            ? a.billing.companyName
            : `${a?.billing?.firstname ?? ''} ${a?.billing?.lastname ?? ''}`.trim()

    return (
        <div className="w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <CheckoutProgress currentStep={2} />

            <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 mt-8">
                <div className="lg:col-span-3 space-y-6">
                    {ship?.street && (
                        <div className="flex items-start justify-between gap-4 rounded-xl border border-gray-200 bg-white p-4 text-sm shadow-sm dark:border-slate-600 dark:bg-slate-700">
                            <div className="text-gray-700 dark:text-slate-200">
                                <div className="font-semibold text-gray-900 dark:text-white">Αποστολή σε</div>
                                <div>{shipName}</div>
                                <div>{ship.street}, {ship.zipCode} {ship.city}</div>
                                <div className="text-gray-500 dark:text-slate-400">{ship.mobilePhone}{a?.billing?.email ? ` · ${a.billing.email}` : ''}</div>
                            </div>
                            <Link href="/checkout/customer-informations" className="shrink-0 font-medium text-siteColors-blue hover:text-siteColors-purple underline">
                                Αλλαγή
                            </Link>
                        </div>
                    )}

                    <div className="bg-white dark:bg-slate-700 rounded-xl shadow-lg p-6 md:p-8">
                        <FormikProvider value={formik}>
                            <form onSubmit={(e) => { e.preventDefault(); handleConfirmClick() }}>
                                <div id="shipping-section"><ShippingMethods /></div>
                                <div id="payment-section">{checkout.shippingMethod?.id && <PaymentMethods />}</div>
                            </form>
                        </FormikProvider>

                        {/* Κινητό: η συνέχεια αμέσως μετά τις επιλογές */}
                        <div className="mt-8 lg:hidden">{continueButton()}</div>
                    </div>
                </div>

                {/* Sidebar - Cart Components */}
                <div className="lg:col-span-2">
                    <div className="sticky top-8 space-y-6">

                        {/* Cart Summary */}
                        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6">
                            <CartSummary />
                        </div>

                        {/* Coupon Form */}
                        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6">
                            <CouponForm />
                        </div>

                        {/* Cart Items */}
                        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6">
                            <div className="max-h-96 overflow-y-auto">
                                <CartAside />
                            </div>
                        </div>

                        {/* Continue Button (υπολογιστής) */}
                        {continueButton('hidden lg:block')}

                        {/* Security Badges */}
                        <PaymentSecurityBadges />
                    </div>
                </div>
            </div>
        </div>
    )
}

export default OrderInfoClient
