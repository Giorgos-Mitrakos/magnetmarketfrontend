"use client"
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

const OrderInfo = () => {
    const { checkout, dispatch } = useCheckout()
    const router = useRouter()

    const handleConfirmClick = () => {
        formik.submitForm()
    }

    const formik = useFormik({
        initialValues: {
            shippingMethodId: checkout.shippingMethod?.id || null,
            shippingMethod: checkout.shippingMethod?.shipping || null,
            paymentMethodId: checkout.paymentMethod?.id || null,
            paymentMethod: checkout.paymentMethod?.attributes.name || null,
            installments: 1,
        },
        validationSchema: Yup.object({
            shippingMethodId: Yup.number().required('*Yποχρεωτικό πεδίο!'),
            shippingMethod: Yup.string().nonNullable().required('*Yποχρεωτικό πεδίο!'),
            paymentMethodId: Yup.number().required('*Yποχρεωτικό πεδίο!'),
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

    return (
        <div className="w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {/* Header */}
            <CheckoutProgress currentStep={2} />

            <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 mt-8">
                {/* Main Content - Order Information */}
                <div className="lg:col-span-3">
                    <div className="bg-white dark:bg-slate-700 rounded-xl shadow-lg p-6 md:p-8">

                        <FormikProvider value={formik}>
                            <form onSubmit={formik.handleSubmit}>
                                <ShippingMethods />
                                {checkout.shippingMethod?.id && <PaymentMethods />}
                            </form>
                        </FormikProvider>
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

                        {/* Continue Button */}
                        <button
                            onClick={handleConfirmClick}
                            disabled={formik.isSubmitting}
                            className="w-full bg-gradient-to-r from-siteColors-purple to-siteColors-pink hover:from-siteColors-pink hover:to-siteColors-purple 
                                       text-white font-semibold py-4 px-6 rounded-xl shadow-lg transition-all duration-200 
                                       hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {formik.isSubmitting ? (
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
        </div>
    )
}

export default OrderInfo