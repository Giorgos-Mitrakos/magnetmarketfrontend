'use client'
// (2026-10-25) Βήμα 3 — Σύνοψη:
//  - μετά από ανανέωση της σελίδας χάνονται αποστολή / πληρωμή → πίσω στο βήμα 2
//    (χωρίς στοιχεία → βήμα 1, άδειο καλάθι → καλάθι)
//  - «Αλλαγή» σε κάθε ενότητα, email και σχόλια στη σύνοψη, εκτιμώμενη παράδοση
//  - έλεγχος των προϊόντων πριν την παραγγελία (εξαντλήθηκε κ.λπ.)
//  - κουμπί με «υποχρέωση πληρωμής» και το ποσό (οδηγία 2011/83/ΕΕ) + όροι / απόρρητο
//  - στο κινητό πρώτα η σύνοψη και το κουμπί, μετά τα προϊόντα
import Link from "next/link"
import CheckoutProgress from "@/components/molecules/checkoutProgress"
import useCartLines from "@/hooks/useCartLines"
import CartSummary from "@/components/atoms/cartSummary"
import CartAside from "@/components/organisms/cartItemsAside"
import { useCheckout } from "@/context/checkout"
import { useEffect, useState } from "react"
import { useRouter } from 'next/navigation'
import { toast } from "sonner"
import { reportCheckoutError } from "@/lib/helpers/notifyActions"
import { PaymentMethodEnum } from "@/lib/interfaces/shipping"
import { createOrder } from "@/lib/helpers/checkout"
import PaymentSecurityBadges from "@/components/atoms/securePaymentBadge"

interface IAddressSummary {
    firstname: string,
    lastname: string,
    telephone: string,
    mobilePhone: string,
    street: string,
    city: string,
    state: string,
    zipCode: string,
    country: string,
    afm?: string,
    doy?: string,
    companyName?: string,
    businessActivity?: string,
    isInvoice?: boolean
}

const AddressSummary = ({ address, title, email, editHref }: { address: IAddressSummary, title: string, email?: string, editHref?: string }) => {
    return (
        <div className="p-4 bg-white dark:bg-slate-700 rounded-lg border border-slate-200 dark:border-slate-700">
            <h3 className="font-semibold text-siteColors-purple dark:text-slate-200 mb-2 flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                {title}
                {editHref && <EditLink href={editHref} />}
            </h3>
            <div className="text-sm text-slate-700 dark:text-slate-300">
                {address.isInvoice ? (
                    <>
                        <div className="mb-1">{address.companyName}</div>
                        <div className="mb-1">{address.businessActivity}</div>
                        <div className="flex flex-wrap gap-2 mb-1">
                            <span className="bg-slate-100 dark:bg-slate-700 px-2 py-1 rounded">ΑΦΜ: {address.afm}</span>
                            <span className="bg-slate-100 dark:bg-slate-700 px-2 py-1 rounded">ΔΟΥ: {address.doy}</span>
                        </div>
                    </>
                ) : (
                    <div className="mb-1">{address.firstname} {address.lastname}</div>
                )}
                <div>{address.street}</div>
                <div>{address.zipCode}, {address.city}</div>
                <div>{address.state}, {address.country}</div>
                {email && <div className="mt-1 break-all">{email}</div>}
                <div className="mt-2 flex flex-wrap gap-2">
                    {address.telephone && (
                        <span className="flex items-center">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                            </svg>
                            {address.telephone}
                        </span>
                    )}
                    {address.mobilePhone && (
                        <span className="flex items-center">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                            </svg>
                            {address.mobilePhone}
                        </span>
                    )}
                </div>
            </div>
        </div>
    )
}

const EditLink = ({ href }: { href: string }) => (
    <Link href={href} className="ml-auto text-sm font-medium text-siteColors-blue hover:text-siteColors-purple underline">
        Αλλαγή
    </Link>
)

const PaymentMethodDisplay = ({ method, installments }: { method: any, installments: number }) => {
    return (
        <div className="p-4 bg-white dark:bg-slate-700 rounded-lg border border-slate-200 dark:border-slate-700">
            <h3 className="font-semibold text-siteColors-purple dark:text-slate-200 mb-2 flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                </svg>
                Τρόπος πληρωμής
                <EditLink href="/checkout/order-informations" />
            </h3>
            <div className="text-sm text-slate-700 dark:text-slate-300">
                <div>{method?.attributes?.name}</div>
                {method?.attributes.installments && installments > 1 && (
                    <div className="mt-1 bg-slate-100 dark:bg-slate-700 inline-block px-2 py-1 rounded">
                        {installments} {method?.attributes.installments.free_rate_months >= installments ? "Άτοκες" : "Έντοκες"} δόσεις
                    </div>
                )}
            </div>
        </div>
    )
}

const ShippingMethodDisplay = ({ method }: { method: any }) => {
    return (
        <div className="p-4 bg-white dark:bg-slate-700 rounded-lg border border-slate-200 dark:border-slate-700">
            <h3 className="font-semibold text-siteColors-purple dark:text-slate-200 mb-2 flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Τρόπος αποστολής
                <EditLink href="/checkout/order-informations" />
            </h3>
            <div className="text-sm text-slate-700 dark:text-slate-300">
                {method?.shipping}
            </div>
        </div>
    )
}

const InvoiceTypeDisplay = ({ isInvoice }: { isInvoice?: boolean }) => {
    return (
        <div className="p-4 bg-white dark:bg-slate-700 rounded-lg border border-slate-200 dark:border-slate-700">
            <h3 className="font-semibold text-siteColors-purple dark:text-slate-200 mb-2 flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Τύπος παραστατικού
            </h3>
            <div className="text-sm text-slate-700 dark:text-slate-300">
                {isInvoice ? "Τιμολόγιο" : "Απόδειξη"}
            </div>
        </div>
    )
}

const CouponDisplay = ({ coupon }: { coupon: any }) => {
    if (!coupon) return null;

    return (
        <div className="p-4 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
            <h3 className="font-semibold text-siteColors-purple dark:text-siteColors-pink mb-2 flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
                </svg>
                Εκπτωτικό κουπόνι
            </h3>
            <div className="text-sm text-slate-700 dark:text-slate-300">
                {coupon.discountType === "free_shipping"
                    ? "Δωρεάν μεταφορικά"
                    : coupon.discountType === "percentage"
                        ? `${coupon.discountValue}% έκπτωση`
                        : `${coupon.discountValue}€ έκπτωση`}
            </div>
        </div>
    )
}

const TERMS_URL = "/pages/oroi-kai-proypotheseis"
const PRIVACY_URL = "/pages/politiki-aporritoy"

const euro = (v: number) => `${v.toFixed(2).replace(".", ",")} €`
const fmtDay = (ymd: string) =>
    new Intl.DateTimeFormat("el-GR", { weekday: "short", day: "numeric", month: "short", timeZone: "Europe/Athens" })
        .format(new Date(`${ymd}T12:00:00+03:00`))

const ConfirmClient = () => {
    const { checkout } = useCheckout()
    const [processing, setProcessing] = useState(false)
    const router = useRouter()
    const { delivery, canCheckout } = useCartLines(checkout.cart)

    // Το ταμείο φορτώνει από τον browser μετά το πρώτο render· αποστολή / πληρωμή
    // δεν κρατιούνται μετά από ανανέωση → πίσω στο βήμα που λείπει
    const [hydrated, setHydrated] = useState(false)
    useEffect(() => {
        const t = setTimeout(() => setHydrated(true), 500)
        return () => clearTimeout(t)
    }, [])
    useEffect(() => {
        if (!hydrated || processing) return
        if (!checkout.cart.length) router.replace('/shopping-cart')
        else if (!checkout.addresses?.billing?.email) router.replace('/checkout/customer-informations')
        else if (!checkout.shippingMethod?.id || !checkout.paymentMethod) router.replace('/checkout/order-informations')
    }, [hydrated, processing, checkout.cart.length, checkout.addresses?.billing?.email, checkout.shippingMethod?.id, checkout.paymentMethod, router])

    const method = checkout.paymentMethod?.attributes.method
    const isCardPayment =
        method === PaymentMethodEnum.CREDIT_CARD || method === PaymentMethodEnum.DEBIT_CARD || method === PaymentMethodEnum.IRIS_PAYMENT
    const isPickup = /παραλαβ/i.test(String(checkout.shippingMethod?.shipping ?? ''))
    const total = Number(checkout.totals.total) || 0

    const handleConfirmClick = async () => {
        if (processing || !canCheckout) return
        try {
            setProcessing(true)
            const newOrder = await createOrder(checkout)

            if (newOrder && newOrder.status === "fail") {
                toast.error(newOrder.message, {
                    position: 'top-right',
                })
                setProcessing(false)
                return
            }

            // Το cookie _mmo (για τις σελίδες «Ευχαριστούμε» / «Αποτυχία») το
            // γράφει ο server στη δημιουργία της παραγγελίας

            if (newOrder &&
                (checkout.paymentMethod?.attributes.method === PaymentMethodEnum.CREDIT_CARD ||
                    checkout.paymentMethod?.attributes.method === PaymentMethodEnum.DEBIT_CARD ||
                    checkout.paymentMethod?.attributes.method === PaymentMethodEnum.IRIS_PAYMENT)) {
                if (newOrder.orderId) {
                    try {
                        const myHeaders = new Headers();
                        myHeaders.append('Content-Type', 'application/json')

                        const myInit = {
                            method: "POST",
                            headers: myHeaders,
                            // Ποσό και δόσεις τα παίρνει ο server από την παραγγελία
                            body: JSON.stringify({ orderId: newOrder.orderId })
                        };

                        const formdata = await fetch(`/api/checkout-piraeus-gateway/ticket`, myInit)

                        if (!formdata.ok) {
                            const errorData = await formdata.json().catch(() => ({}));
                            console.error('Piraeus gateway error:', errorData);
                            toast.error(errorData?.error || 'Παρουσιάστηκε πρόβλημα με την πληρωμή. Παρακαλώ προσπαθήστε ξανά.');
                            setProcessing(false)
                            return;
                        }

                        const paymentData = await formdata.json();

                        const requiredFields = ['AcquirerId', 'MerchantId', 'PosId', 'User', 'MerchantReference'];
                        for (const field of requiredFields) {
                            if (!paymentData[field]) {
                                console.error(`Missing field: ${field}`);
                                toast.error('Δεν είναι δυνατή η πληρωμή. Λείπουν στοιχεία.');
                                setProcessing(false)
                                return;
                            }
                        }

                        // Create and submit form for redirection
                        const form = document.createElement('form');
                        form.method = 'POST';
                        form.action = 'https://paycenter.piraeusbank.gr/redirection/pay.aspx';

                        // Add parameters as hidden inputs
                        for (const key in paymentData) {
                            const input = document.createElement('input');
                            input.type = 'hidden';
                            input.name = key;
                            input.value = paymentData[key];
                            form.appendChild(input);
                        }

                        document.body.appendChild(form);
                        form.submit();
                    } catch (error) {
                        console.error('Unexpected error during payment:', error);
                        toast.error('Απρόβλεπτο σφάλμα. Παρακαλώ δοκιμάστε ξανά.');
                        setProcessing(false)
                    }
                }
            } else {
                // dispatch({ type: "CLEAR_CART" })
                setProcessing(false)
                router.push('/checkout/thank-you')
            }
        } catch (error) {
            await reportCheckoutError({ title: 'Σφάλμα στην ολοκλήρωση παραγγελίας', data: error instanceof Error ? error.message : JSON.stringify(error) }).catch(() => undefined)
            router.push('/checkout/failure')
        }
    }

    return (
        <div className="container mx-auto px-4 py-8 w-full">
            <CheckoutProgress currentStep={3} />

            <h1 className="text-2xl font-bold text-center my-8 text-siteColors-purple dark:text-siteColors-pink">
                Έλεγχος &amp; ολοκλήρωση παραγγελίας
            </h1>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
                {/* Προϊόντα (στο κινητό μετά τη σύνοψη) */}
                <div className="order-2 lg:order-1 lg:col-span-2">
                    <div className="flex items-center justify-between mb-2">
                        <h2 className="text-lg font-semibold text-siteColors-purple dark:text-slate-100">Προϊόντα</h2>
                        <Link href="/shopping-cart" className="text-sm font-medium text-siteColors-blue hover:text-siteColors-purple underline">
                            Αλλαγή καλαθιού
                        </Link>
                    </div>
                    <CartAside />
                </div>

                {/* Σύνοψη / στοιχεία / ολοκλήρωση */}
                <div className="order-1 lg:order-2 space-y-6">
                    <CartSummary />

                    {delivery && !isPickup && canCheckout && (
                        <div className="rounded-lg bg-green-50 dark:bg-green-900/20 p-3 text-sm text-green-800 dark:text-green-200">
                            🚚 Εκτιμώμενη παράδοση: <strong>{delivery.from === delivery.to ? fmtDay(delivery.from) : `${fmtDay(delivery.from)} – ${fmtDay(delivery.to)}`}</strong>
                        </div>
                    )}

                    <div className="space-y-4">
                        <h2 className="text-lg font-semibold text-siteColors-purple dark:text-slate-100 flex items-center">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                            </svg>
                            Στοιχεία Παραγγελίας
                        </h2>

                        <div className="space-y-4">
                            <AddressSummary
                                address={checkout.addresses.billing}
                                title={`Διεύθυνση χρέωσης${!checkout.addresses.different_shipping ? ' - αποστολής' : ''}`}
                                email={checkout.addresses.billing.email}
                                editHref="/checkout/customer-informations"
                            />

                            {checkout.addresses.different_shipping && (
                                <AddressSummary
                                    address={checkout.addresses.shipping}
                                    title="Διεύθυνση αποστολής"
                                    editHref="/checkout/customer-informations"
                                />
                            )}

                            <ShippingMethodDisplay method={checkout.shippingMethod} />

                            <PaymentMethodDisplay
                                method={checkout.paymentMethod}
                                installments={checkout.installments}
                            />

                            <CouponDisplay coupon={checkout.appliedCoupon} />

                            <InvoiceTypeDisplay isInvoice={checkout.addresses.billing.isInvoice} />

                            {checkout.addresses.deliveryNotes?.trim() && (
                                <div className="p-4 bg-white dark:bg-slate-700 rounded-lg border border-slate-200 dark:border-slate-700 text-sm">
                                    <h3 className="font-semibold text-siteColors-purple dark:text-slate-200 mb-1 flex items-center">
                                        Σχόλια
                                        <EditLink href="/checkout/customer-informations" />
                                    </h3>
                                    <p className="whitespace-pre-line text-slate-700 dark:text-slate-300">{checkout.addresses.deliveryNotes}</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {!canCheckout && (
                        <p role="alert" className="rounded-lg bg-red-50 p-3 text-sm text-red-700 dark:bg-red-900/20 dark:text-red-300">
                            Κάποια προϊόντα δεν μπορούν να παραγγελθούν (π.χ. εξαντλήθηκαν).{' '}
                            <Link href="/shopping-cart" className="font-semibold underline">Δείτε το καλάθι</Link>
                        </p>
                    )}

                    <button
                        onClick={handleConfirmClick}
                        disabled={processing || !canCheckout}
                        className="w-full py-4 px-4 rounded-lg font-semibold text-white transition-all duration-300
              bg-gradient-to-r from-siteColors-pink to-siteColors-purple
              hover:from-siteColors-purple hover:to-siteColors-pink
              disabled:opacity-70 disabled:cursor-not-allowed
              flex flex-col items-center justify-center"
                    >
                        {processing ? (
                            <span className="flex items-center">
                                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" aria-hidden>
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                {isCardPayment ? 'Μεταφορά στην τράπεζα...' : 'Περιμένετε...'}
                            </span>
                        ) : isCardPayment ? (
                            <>
                                <span className="text-lg">Πληρωμή {total > 0 ? euro(total) : ''}</span>
                                <span className="text-xs font-normal opacity-90">με υποχρέωση πληρωμής</span>
                            </>
                        ) : (
                            <>
                                <span className="text-lg">Ολοκλήρωση παραγγελίας</span>
                                <span className="text-xs font-normal opacity-90">με υποχρέωση πληρωμής{total > 0 ? ` · ${euro(total)}` : ''}</span>
                            </>
                        )}
                    </button>

                    {isCardPayment && (
                        <p className="text-center text-xs text-slate-600 dark:text-slate-400">
                            Θα μεταφερθείτε στο ασφαλές περιβάλλον πληρωμής της Τράπεζας Πειραιώς.
                        </p>
                    )}
                    <p className="text-center text-xs text-slate-600 dark:text-slate-400">
                        Με την ολοκλήρωση της παραγγελίας αποδέχεστε τους{' '}
                        <Link href={TERMS_URL} target="_blank" className="underline hover:text-siteColors-purple">Όρους χρήσης</Link>{' '}
                        και την{' '}
                        <Link href={PRIVACY_URL} target="_blank" className="underline hover:text-siteColors-purple">Πολιτική απορρήτου</Link>.
                    </p>

                    {/* Security Badges */}
                    <PaymentSecurityBadges />

                </div>
            </div>
        </div>
    )
}

export default ConfirmClient
