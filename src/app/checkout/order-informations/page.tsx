"use client"
import CartSummary from "@/components/atoms/cartSummary"
import ApplyCoupon from "@/components/atoms/discountCoupon"
import PaymentMethods, { PaymentMethodsRef } from "@/components/molecules/paymentMethods"
import ShippingMethods, { ShippingMethodsRef } from "@/components/molecules/shippingMethods"
import CartAside from "@/components/organisms/cartItemsAside"
import { useRouter } from "next/navigation"
import { useRef } from "react"

const OrderInfo = () => {
    const router = useRouter()

    const shippingRef = useRef<ShippingMethodsRef | null>(null);
    const paymentRef = useRef<PaymentMethodsRef | null>(null);
    
    const handleConfirmClick = () => {
        shippingRef.current?.submitForm()
        paymentRef.current?.submitForm()
        setTimeout(() => {
            if (shippingRef.current?.isSubmitting && paymentRef.current?.isSubmitting) {
                router.push('/checkout/confirm')
            }
        }, 300);
    }

    return (
        <div className='grid mx-auto max-w-lg space-y-8 md:max-w-none md:grid-cols-2 md:gap-8'>
            <div>
                <div>
                    <h2 className='text-lg mb-2 font-medium text-siteColors-purple'>Στοιχεία Παραγγελίας</h2>
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
            </div>
            <button onClick={handleConfirmClick}
                className="md:row-start-2 md:col-start-2 flex justify-center items-center px-4 py-2 w-full rounded border md:text-slate-100 text-lg font-semibold
                bg-gradient-to-b from-siteColors-pink via-siteColors-purple to-siteColors-pink text-white
                md:bg-gradient-to-br md:from-siteColors-lightblue md:to-siteColors-blue
                hover:bg-gradient-to-b hover:from-siteColors-pink hover:via-siteColors-purple hover:to-siteColors-pink hover:text-white">Επιβεβαίωση</button>
        </div>
    )
}

export default OrderInfo