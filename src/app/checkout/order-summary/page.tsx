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
// import { useCart } from "@/context/cart"

interface IAddressSumary {
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

const AddressSummary = ({ address }: { address: IAddressSumary }) => {
    return (
        <div className="flex flex-wrap text-sm text-slate-900  dark:text-slate-200">
            {address.isInvoice ?
                <>
                    <span className="mr-2">{address.companyName}</span>
                    <span className="mr-2">{address.businessActivity}</span>
                    <span className="mr-2">{address.afm}</span>
                    <span className="mr-2">{address.doy}</span>
                </> :
                <>
                    <span className="mr-2">{address.firstname}</span>
                    <span className="mr-2">{address.lastname},</span>
                </>}
            <span className="mr-2">{address.street},</span>
            <span className="mr-2">{address.zipCode},</span>
            <span className="mr-2">{address.city}</span>
            <span className="mr-2">{address.state},</span>
            <span className="mr-2">{address.country},</span>
            <span className="mr-2">{address.mobilePhone}</span>
            <span>{address.telephone}</span>
        </div>
    )
}

const Confirm = () => {
    // const { paymentMethod, shippingMethod, addresses, createOrder } = useCheckout()
    const { checkout, dispatch } = useCheckout()
    const [processing, setProcessing] = useState(false)
    const router = useRouter()

    const handleConfirmClik = async () => {
        try {
            setProcessing(true)
            const newOrder = await createOrder(checkout)

            if (newOrder && newOrder.status === "fail") {
                toast.error(newOrder.message, {
                    position: 'top-right',
                })

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
                        // myHeaders.append('Access-Control-Allow-Origin', 'https://www.magnetmarket.gr/api/checkout-piraeus-gateway')

                        const myInit = {
                            method: "POST",
                            headers: myHeaders,
                            body: JSON.stringify({
                                orderId: newOrder.orderId,
                                amount: newOrder.amount,
                                installments: newOrder.installments
                            })
                            // mode: "cors",
                            // cache: "default",
                        };

                        const formdata = await fetch(`/api/checkout-piraeus-gateway/ticket`,
                            myInit,
                        )

                        if (!formdata.ok) {
                            const errorData = await formdata.json();
                            console.error('Piraeus gateway error:', errorData);
                            alert('Παρουσιάστηκε πρόβλημα με την πληρωμή. Παρακαλώ προσπαθήστε ξανά.');
                            setProcessing(false)
                            return;
                        }

                        const paymentData = await formdata.json();

                        const requiredFields = ['AcquirerId', 'MerchantId', 'PosId', 'User', 'MerchantReference'];
                        for (const field of requiredFields) {
                            if (!paymentData[field]) {
                                console.error(`Missing field: ${field}`);
                                alert('Δεν είναι δυνατή η πληρωμή. Λείπουν στοιχεία.');
                                return;
                            }
                        }

                        // Δημιουργία και υποβολή φόρμας για το redirection
                        const form = document.createElement('form');
                        form.method = 'POST';
                        form.action = 'https://paycenter.piraeusbank.gr/redirection/pay.aspx'; // URL πληρωμής

                        // Προσθήκη των παραμέτρων ως hidden inputs
                        for (const key in paymentData) {
                            const input = document.createElement('input');
                            input.type = 'hidden';
                            input.name = key;
                            input.value = paymentData[key];
                            form.appendChild(input);
                        }

                        document.body.appendChild(form);
                        form.submit(); // Υποβολή της φόρμας
                    } catch (error) {
                        console.error('Unexpected error during payment:', error);
                        alert('Απρόβλεπτο σφάλμα. Παρακαλώ δοκιμάστε ξανά.');
                        setProcessing(false)
                    }
                }

                setProcessing(false)
            }
            else {

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
        <div className="mt-8 mb-16">
            <h2 className='font-medium text-xl text-center mb-6 text-siteColors-purple dark:text-slate-200'>Σύνοψη Παραγγελίας</h2>
            <div className='grid mx-auto max-w-lg space-y-8 md:max-w-none md:grid-cols-4 md:space-y-0 md:gap-8'>
                <div className="md:col-span-3">
                    <CartAside />
                </div>
                <ul className="flex flex-col bg-slate-100 dark:bg-slate-700 rounded">
                    <li className="p-4 rounded">
                        <h2 className='font-medium mb-4 border-b text-siteColors-purple dark:text-slate-200'>Διεύθυνση χρέωσης {!checkout.addresses.different_shipping ? '- αποστολής' : ''}</h2>
                        <AddressSummary address={checkout.addresses.billing} />
                    </li>
                    {checkout.addresses.different_shipping && <li className="p-4 rounded">
                        <h2 className='font-medium  mb-4 border-b text-siteColors-purple dark:text-slate-200'>Διεύθυνση αποστολής</h2>
                        <AddressSummary address={checkout.addresses.different_shipping ? checkout.addresses.shipping : checkout.addresses.billing} />
                    </li>}
                    <li className="p-4 rounded">
                        <h2 className='font-medium  mb-4 border-b text-siteColors-purple dark:text-slate-200'>Τρόπος πληρωμής</h2>
                        <p>{checkout.paymentMethod?.attributes?.name}</p>
                        {checkout.paymentMethod?.attributes.installments && checkout.installments>1 &&
                            <p>{checkout.installments} {checkout.paymentMethod?.attributes.installments.free_rate_months >= checkout.installments ?
                                "Άτοκες" : "Έντοκες"
                            } δόσεις</p>}
                    </li>
                    {checkout.appliedCoupon &&
                        <li className="p-4 rounded">
                            <h2 className='font-medium  mb-4 border-b text-siteColors-purple dark:text-slate-200'>Εκπτωτικό κουπόνι</h2>
                            <p>{checkout.appliedCoupon.discountType === "free_shipping" ? "Δωρεάν μεταφορικά" :
                                checkout.appliedCoupon.discountType === "percentage" ?
                                    `${checkout.appliedCoupon.discountValue}  % έκπτωση` :
                                    `${checkout.appliedCoupon.discountValue}  € έκπτωση`}</p>
                        </li>}
                    <li className="p-4 rounded">
                        <h2 className='font-medium  mb-4 border-b text-siteColors-purple dark:text-slate-200'>Τρόπος αποστολής</h2>
                        <span>{checkout.shippingMethod?.shipping}</span>
                    </li>
                    <li className="p-4 rounded">
                        <h2 className='font-medium  mb-4 border-b text-siteColors-purple dark:text-slate-200'>Τύπος παραστατικού</h2>
                        <span>{checkout.addresses.billing.isInvoice ? "Τιμολόγιο" : "Απόδειξη"}</span>
                    </li>
                    <li>
                        <div className="rounded">
                            <CartSummary />
                        </div>
                    </li>
                    <button onClick={handleConfirmClik} disabled={processing}
                        className="md:row-start-2 md:col-start-2 flex justify-center items-center px-4 py-2 w-full rounded border md:text-slate-100 text-lg font-semibold
                bg-gradient-to-b from-siteColors-pink via-siteColors-purple to-siteColors-pink text-white
                md:bg-gradient-to-br md:from-siteColors-lightblue md:to-siteColors-blue
                hover:bg-gradient-to-b hover:from-siteColors-pink hover:via-siteColors-purple hover:to-siteColors-pink hover:text-white
                disabled:bg-slate-400">{processing ? "Περιμένετε..." : 'Ολοκλήρωση'}</button>
                </ul>
            </div>
        </div>
    )
}

export default Confirm

