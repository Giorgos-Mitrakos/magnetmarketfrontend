'use client'
import CartSummary from "@/components/atoms/cartSummary"
import CartAside from "@/components/organisms/cartItemsAside"
import { useCheckout } from "@/context/checkout"
import { useState } from "react"
import { useRouter } from 'next/navigation'
import { toast } from "sonner"
import { saveCookies } from "@/lib/helpers/actions"
import { sendEmail } from "@/lib/helpers/piraeusGateway"
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

const AddressSummary = ({ address, title }: { address: IAddressSummary, title: string }) => {
    return (
        <div className="p-4 bg-white dark:bg-slate-700 rounded-lg border border-slate-200 dark:border-slate-700">
            <h3 className="font-semibold text-siteColors-purple dark:text-slate-200 mb-2 flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                {title}
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

const PaymentMethodDisplay = ({ method, installments }: { method: any, installments: number }) => {
    return (
        <div className="p-4 bg-white dark:bg-slate-700 rounded-lg border border-slate-200 dark:border-slate-700">
            <h3 className="font-semibold text-siteColors-purple dark:text-slate-200 mb-2 flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                </svg>
                Τρόπος πληρωμής
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

const Confirm = () => {
    const { checkout, dispatch } = useCheckout()
    const [processing, setProcessing] = useState(false)
    const router = useRouter()

    const handleConfirmClick = async () => {
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

            if (newOrder.orderId) {
                await saveCookies({
                    name: "_mmo", value: {
                        orderId: newOrder.orderId
                    }
                })
            }

            if (newOrder && (checkout.paymentMethod?.attributes.method === PaymentMethodEnum.CREDIT_CARD || checkout.paymentMethod?.attributes.method === PaymentMethodEnum.DEBIT_CARD)) {
                if (Number(newOrder.orderId) && Number(newOrder.amount)) {
                    try {
                        const myHeaders = new Headers();
                        myHeaders.append('Content-Type', 'application/json')

                        const myInit = {
                            method: "POST",
                            headers: myHeaders,
                            body: JSON.stringify({
                                orderId: newOrder.orderId,
                                amount: newOrder.amount,
                                installments: newOrder.installments
                            })
                        };

                        const formdata = await fetch(`/api/checkout-piraeus-gateway/ticket`, myInit)

                        if (!formdata.ok) {
                            const errorData = await formdata.json();
                            console.error('Piraeus gateway error:', errorData);
                            toast.error('Παρουσιάστηκε πρόβλημα με την πληρωμή. Παρακαλώ προσπαθήστε ξανά.');
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
                dispatch({ type: "CLEAR_CART" })
                setProcessing(false)
                router.push('/checkout/thank-you')
            }
        } catch (error) {
            await sendEmail({ title: 'error', data: JSON.stringify(error) })
            router.push('/checkout/failure')
        }
    }

    return (
        <div className="container mx-auto px-4 py-8 w-full">
            <h2 className="text-2xl font-bold text-center mb-8 text-siteColors-purple dark:text-siteColors-pink">
                Σύνοψη Παραγγελίας
            </h2>

            <div className="grid grid-cols-1 lg:grid-cols-3 md:gap-8">
                {/* Left Column - Cart Items */}
                <div className="lg:col-span-2">
                    <CartAside />
                </div>

                {/* Right Column - Order Summary and Details */}
                <div className="space-y-6">
                    {/* Order Summary */}
                    <CartSummary />

                    {/* Order Details */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-siteColors-purple dark:text-slate-100 flex items-center">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                            </svg>
                            Στοιχεία Παραγγελίας
                        </h3>

                        <div className="space-y-4">
                            <AddressSummary
                                address={checkout.addresses.billing}
                                title={`Διεύθυνση χρέωσης${!checkout.addresses.different_shipping ? ' - αποστολής' : ''}`}
                            />

                            {checkout.addresses.different_shipping && (
                                <AddressSummary
                                    address={checkout.addresses.shipping}
                                    title="Διεύθυνση αποστολής"
                                />
                            )}

                            <PaymentMethodDisplay
                                method={checkout.paymentMethod}
                                installments={checkout.installments}
                            />

                            <ShippingMethodDisplay method={checkout.shippingMethod} />

                            <CouponDisplay coupon={checkout.appliedCoupon} />

                            <InvoiceTypeDisplay isInvoice={checkout.addresses.billing.isInvoice} />
                        </div>
                    </div>

                    <button
                        onClick={handleConfirmClick}
                        disabled={processing}
                        className="w-full py-3 px-4 rounded-lg font-semibold text-white transition-all duration-300
              bg-gradient-to-r from-siteColors-pink to-siteColors-purple
              hover:from-siteColors-purple hover:to-siteColors-pink
              disabled:opacity-70 disabled:cursor-not-allowed
              flex items-center justify-center"
                    >
                        {processing ? (
                            <>
                                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Περιμένετε...
                            </>
                        ) : (
                            <>Ολοκλήρωση Παραγγελίας</>
                        )}
                    </button>

                    {/* Security Badges */}
                    <PaymentSecurityBadges />

                </div>
            </div>
        </div>
    )
}

export default Confirm