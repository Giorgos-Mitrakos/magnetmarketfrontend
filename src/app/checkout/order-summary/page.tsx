'use client'
import CartSummary from "@/components/atoms/cartSummary"
import CartAside from "@/components/organisms/cartItemsAside"
import { ShippingContext } from "@/context/shipping"
import { useContext, useState } from "react"
import { useRouter } from 'next/navigation'
import { CartContext } from "@/context/cart"
import { toast } from "sonner"
import { saveCookies } from "@/lib/helpers/actions"

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
    const { paymentMethod, shippingMethod, addresses, createOrder } = useContext(ShippingContext)
    const { clearCart } = useContext(CartContext)
    const [processing, setProcessing] = useState(false)
    const router = useRouter()

    const handleConfirmClik = async () => {
        try {
            setProcessing(true)
            const newOrder = await createOrder()

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

            if (newOrder && (paymentMethod?.attributes.name === "Χρεωστική Κάρτα" || paymentMethod?.attributes.name === "Πιστωτική Κάρτα")) {
                if (newOrder.orderId && newOrder.amount) {

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

                    const paymentData = await formdata.json();

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
                }

                setProcessing(false)
            }
            else {

                clearCart()

                setProcessing(false)

                router.push('/checkout/thank-you')
            }

        } catch (error) {
            console.log(error)
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
                        <h2 className='font-medium mb-4 border-b text-siteColors-purple dark:text-slate-200'>Διεύθυνση χρέωσης {!addresses.different_shipping ? '- αποστολής' : ''}</h2>
                        <AddressSummary address={addresses.billing} />
                    </li>
                    {addresses.different_shipping && <li className="p-4 rounded">
                        <h2 className='font-medium  mb-4 border-b text-siteColors-purple dark:text-slate-200'>Διεύθυνση αποστολής</h2>
                        <AddressSummary address={addresses.different_shipping ? addresses.shipping : addresses.billing} />
                    </li>}
                    <li className="p-4 rounded">
                        <h2 className='font-medium  mb-4 border-b text-siteColors-purple dark:text-slate-200'>Τρόπος πληρωμής</h2>
                        <span>{paymentMethod?.attributes?.name}</span>
                    </li>
                    <li className="p-4 rounded">
                        <h2 className='font-medium  mb-4 border-b text-siteColors-purple dark:text-slate-200'>Τρόπος αποστολής</h2>
                        <span>{shippingMethod.shipping}</span>
                    </li>
                    <li className="p-4 rounded">
                        <h2 className='font-medium  mb-4 border-b text-siteColors-purple dark:text-slate-200'>Τύπος παραστατικού</h2>
                        <span>{addresses.billing.isInvoice ? "Τιμολόγιο" : "Απόδειξη"}</span>
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

