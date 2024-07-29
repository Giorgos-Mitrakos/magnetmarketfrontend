"use client"
import * as Yup from 'yup'
import { useFormik } from "formik";
import Radio from '@/components/atoms/radio';
import Addresses from '@/components/molecules/addresses';
import { useState } from 'react';
import CustomInput from '@/components/atoms/input';
import { useApiRequest } from '@/repositories/clientRepository';
import { useSession } from 'next-auth/react';


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
            title: string,
            isInvoice: boolean
        }[],
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
            title: string,
            isInvoice: boolean
        }[]
    }
}

const CustomerInfo = () => {

    const { data: session, status } = useSession()

    const { data, loading, error }: { data: IProfile, loading: boolean, error: any } = useApiRequest({ api: "/api/user-address/getUser", jwt: `${session?.user?.jwt}` })

    console.log("data:", data)

    return (
        <div className='grid md:grid-cols-2'>
            {loading ?
                <div>Loading...</div>
                :
                <div className=' m-4 '>
                    <h2 className='text-lg mb-2 font-medium text-siteColors-purple'>Στοιχεία Πελάτη</h2>
                    <Addresses user={data.user} />
                </div>}
        </div>
    )
}

export default CustomerInfo