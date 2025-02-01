"use client"

import Addresses, { FormInputRef } from '@/components/organisms/addresses'
import { useRef, useState } from 'react';
import { useApiRequest } from '@/repositories/clientRepository';
import { useSession } from 'next-auth/react';
import CartAside from '@/components/organisms/cartItemsAside';
import ApplyCoupon from '@/components/atoms/discountCoupon';
import CartSummary from '@/components/atoms/cartSummary';
import { useRouter } from 'next/navigation';


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

    const [processing, setProcessing] = useState(false)

    const { data: session, status } = useSession()

    const { data, loading, error }: { data: IProfile, loading: boolean, error: any } = useApiRequest({ method: "GET", api: "/api/user-address/getUser", jwt: `${session?.user?.jwt}` })

    const formikRef = useRef<FormInputRef | null>(null);

    const handleNextOnClik = () => {
        setProcessing(true)
        formikRef.current?.submitForm()
        setTimeout(() => {
            if (formikRef.current?.isSubmitting) {
                router.push('/checkout/order-informations')
            }
        }, 100);
        setProcessing(false)
    }

    return (
        <div className='grid mx-auto max-w-lg space-y-8 md:max-w-none md:grid-cols-2 md:space-y-0 md:gap-8'>
            <div className='mt-8'>
                {loading ?
                    <div>Loading...</div>
                    :
                    <div>
                        <h2 className='text-lg mb-2 font-medium text-siteColors-purple dark:text-slate-200'>Στοιχεία Πελάτη</h2>
                        <Addresses user={data.user} ref={formikRef} />
                    </div>}
            </div>
            <div className='space-y-2 md:col-start-2'>
                <CartAside />
                <div className="bg-slate-200 rounded">
                    <CartSummary />
                </div>
                <button onClick={handleNextOnClik}
                    className="md:row-start-2 md:col-start-2 flex justify-center items-center px-4 py-2 w-full rounded border md:text-slate-100 text-lg font-semibold
                bg-gradient-to-b from-siteColors-pink via-siteColors-purple to-siteColors-pink text-white
                md:bg-gradient-to-br md:from-siteColors-lightblue md:to-siteColors-blue
                hover:bg-gradient-to-b hover:from-siteColors-pink hover:via-siteColors-purple hover:to-siteColors-pink hover:text-white">
                    {processing ? "Περιμένετε..." : 'Επόμενο'}</button>


                {/* <div className='max-w-sm'>
                    <ApplyCoupon />
                </div> */}
            </div>

        </div>
    )
}

export default CustomerInfo