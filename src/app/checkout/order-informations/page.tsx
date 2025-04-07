"use client"
import CartSummary from "@/components/atoms/cartSummary"
import ApplyCoupon from "@/components/atoms/discountCoupon"
import PaymentMethods from "@/components/molecules/paymentMethods"
import ShippingMethods from "@/components/molecules/shippingMethods"
import CartAside from "@/components/organisms/cartItemsAside"
import { IPaymentMethods, IShippingMethods, ShippingContext } from "@/context/shipping"
import { saveCookies } from "@/lib/helpers/actions"
import { GET_SHIPPING_METHODS } from "@/lib/queries/shippingQuery"
import { useQuery } from "@/repositories/clientRepository"
import { FormikProvider, useFormik } from "formik"
import { useRouter } from "next/navigation"
import { useContext} from "react"
import { toast } from "sonner"
import * as Yup from 'yup'

const OrderInfo = () => {
    const { data: shippingMethodsData, loading: loadingShippingMethods, error: errorShippingMethods } = useQuery({ query: GET_SHIPPING_METHODS, jwt: '' })

    const shippingMethods = shippingMethodsData as IShippingMethods

    const { gettotalCostWithoutInstallments, saveInstallments, savePaymentMethod, availablePayments, saveAvailablePayments } = useContext(ShippingContext)


    const router = useRouter()

    const handleConfirmClick = () => {   
        formik.submitForm()
    }

    const handleShippingChange = (payments: IPaymentMethods) => {
        saveAvailablePayments(payments); // Update payment options dynamically
        formik.setFieldValue("paymentMethod", ""); // Reset payment method selection
        formik.setFieldValue("paymentMethodId", null); // Reset payment method selection
        formik.setFieldValue("installments", 1); // Reset payment method selection
        formik.setFieldValue("totalCost", { cost: gettotalCostWithoutInstallments() }); // Reset payment method selection
        savePaymentMethod(null)
        saveInstallments(1)
    };

    const formik = useFormik({
        initialValues: {
            shippingMethodId: null,
            shippingMethod: null,
            paymentMethodId: null,
            paymentMethod: null,
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
        <div className='grid mx-auto mt-8 mb-16 max-w-lg space-y-8 md:max-w-none md:grid-cols-2 md:gap-8'>
            <div>
                <FormikProvider value={formik}>
                    <form onSubmit={formik.handleSubmit}>
                        <h2 className='text-lg mb-2 font-medium text-siteColors-purple dark:text-slate-200'>Στοιχεία Παραγγελίας</h2>
                        {!loadingShippingMethods && <ShippingMethods methods={shippingMethods} onShippingChange={handleShippingChange} />}
                        {availablePayments && <PaymentMethods payments={availablePayments} />}
                        {/* <button type="submit">Submit</button> */}
                    </form>
                </FormikProvider>
            </div>
            <div className='space-y-2 md:col-start-2'>
                <CartAside />
                <div className="bg-slate-200 rounded">
                    <CartSummary />
                </div>

                {/* <div className='max-w-sm'>
                    <ApplyCoupon />
                </div> */}
                <button onClick={handleConfirmClick}
                    className="md:row-start-2 md:col-start-2 flex justify-center items-center px-4 py-2 w-full rounded border md:text-slate-100 text-lg font-semibold
                bg-gradient-to-b from-siteColors-pink via-siteColors-purple to-siteColors-pink text-white
                md:bg-gradient-to-br md:from-siteColors-lightblue md:to-siteColors-blue
                hover:bg-gradient-to-b hover:from-siteColors-pink hover:via-siteColors-purple hover:to-siteColors-pink hover:text-white">
                    {formik.isSubmitting ? "Περιμένετε..." : 'Επιβεβαίωση'}</button>
            </div>

        </div>
    )
}

export default OrderInfo