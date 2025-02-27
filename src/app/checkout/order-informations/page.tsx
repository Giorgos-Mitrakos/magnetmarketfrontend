"use client"
import CartSummary from "@/components/atoms/cartSummary"
import ApplyCoupon from "@/components/atoms/discountCoupon"
import PaymentMethods, { PaymentMethodsRef } from "@/components/molecules/paymentMethods"
import ShippingMethods, { ShippingMethodsRef } from "@/components/molecules/shippingMethods"
import CartAside from "@/components/organisms/cartItemsAside"
import { useRouter } from "next/navigation"
import { useRef, useState } from "react"
import { toast } from "sonner"

const OrderInfo = () => {
    const router = useRouter()

    const shippingRef = useRef<ShippingMethodsRef | null>(null);
    const paymentRef = useRef<PaymentMethodsRef | null>(null);
        const [processing, setProcessing] = useState(false)

    const handleConfirmClick = () => {
        setProcessing(true)
        shippingRef.current?.submitForm()
        paymentRef.current?.submitForm()
        setTimeout(() => {
            if (shippingRef.current?.isSubmitting && paymentRef.current?.isSubmitting) {
                router.push('/checkout/order-summary')
            }
            else {
                if (!shippingRef.current?.isSubmitting)
                    toast.error("Δεν έχετε επιλέξει τρόπο αποστολής", {
                        position: 'top-right',
                    })

                if (!paymentRef.current?.isSubmitting)
                    toast.error("Δεν έχετε επιλέξει τρόπο πληρωμής", {
                        position: 'top-right',
                    })
            }
        }, 300);

        setProcessing(false)
    }

    return (
        <div className='grid mx-auto mt-8 mb-16 max-w-lg space-y-8 md:max-w-none md:grid-cols-2 md:gap-8'>
            <div>
                <div className="space-y-4">
                    <h2 className='text-lg mb-2 font-medium text-siteColors-purple dark:text-slate-200'>Στοιχεία Παραγγελίας</h2>
                    <ShippingMethods ref={shippingRef} />
                    <PaymentMethods ref={paymentRef} />
                </div>
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
                    {processing?"Περιμένετε...":'Επιβεβαίωση'}</button>
            </div>
            
        </div>
    )
}

export default OrderInfo