"use client"
import * as Yup from 'yup'
import { ClientSafeProvider, LiteralUnion, getProviders, getCsrfToken, signIn } from "next-auth/react"
import { getServerSession } from "next-auth/next"
import Link from "next/link"
import { useState, useEffect } from "react";
import { useFormik } from "formik";
import { BuiltInProviderType } from 'next-auth/providers'
import { AiOutlineEye, AiOutlineEyeInvisible } from "react-icons/ai"
import Credentials from 'next-auth/providers/credentials'
import CustomInput from '@/components/atoms/input'
// import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { useSearchParams } from 'next/navigation'
import { FaBagShopping } from 'react-icons/fa6'


export interface ILoginData {
    email: string;
    password: string;
}

interface LoginProps {
    csrfToken: string,
    providers: ProviderProps[]
}

interface ProviderProps {
    id: string,
    name: string,
    type: string,
    signinUrl: string,
    callbackUrl: string
}

export default function Login() {
    const [csrfToken, setCsrfToken] = useState<string | undefined>();
    const [toggle, setToggle] = useState(false);
    const [providers, setProviders] = useState<Record<LiteralUnion<BuiltInProviderType, string>, ClientSafeProvider> | null>()

    const searchParams = useSearchParams()

    const callbackUrl = searchParams.get('callbackUrl')

    useEffect(() => {

        async function getProv() {
            // You can await here
            const response = await getProviders()
            setProviders(response)
            const csrf = await getCsrfToken()
            setCsrfToken(csrf)
        }
        getProv()
    }, [])



    const initialValues: ILoginData = {
        email: "",
        password: "",
    }
    const formik = useFormik({
        initialValues: initialValues,
        validationSchema: Yup.object({
            email: Yup.string()
                .email('*Το email δεν είναι σωστό!!!')
                .required('*To email είναι υποχρεωτικό πεδίο!'),
            password: Yup.string().required("*Συμπληρώστε τον κωδικό σας!"),
        }),
        onSubmit: (values) => {
            // console.log("values:", values)
            // signIn('Credentials',values)
        }
    });

    return (
        <div className='grid lg:grid-cols-3 gap-4 mt-8 justify-center'>
            <div className='w-full h-full'>
                <div className='flex text-xl sm:text-2xl md:text-3xl px-2 font-semibold justify-around'>
                    <Link href='/login'>
                        <h2>Είσοδος</h2>
                    </Link>
                    <Link href='/register' className=' text-slate-500'>
                        <h2>Εγγραφή</h2>
                    </Link>
                </div>
                <form className='grid gap-6 mt-8 p-4 md:border-2 bg-white dark:bg-slate-700 mx-auto rounded-md shadow-sm'
                    method="post" action="/api/auth/callback/credentials">
                    <h2 className='text-center text-xl font-medium'>Συνδεθείτε</h2>
                    <div className='h-14'>
                        <div className="flex relative h-12 rounded-lg border border-1 border-slate-300 appearance-none">
                            {/* <label htmlFor='email' className='text-sm w-20 content-center'>Email:</label> */}
                            <input name="csrfToken" type="hidden" defaultValue={csrfToken} />
                            <CustomInput
                                aria_label="Φόρμα εισαγωγής Email"
                                type="email"
                                id='email'
                                name='email'
                                onChange={formik.handleChange}
                                onBlur={formik.handleBlur}
                                value={formik.values.email}
                                label="Email" />
                        </div>
                        {formik.touched.email && formik.errors.email ?
                            <p className='formError text-sm text-red-600'>{formik.errors.email}</p>
                            : null}
                    </div>
                    <div className='h-14'>
                        <div className="flex relative h-12 rounded-lg border border-1 border-gray-300 appearance-none">
                            <CustomInput
                                aria_label="Φόρμα εισαγωγής Κωδικού"
                                type={toggle ? "text" : "password"}
                                id='password'
                                name='password'
                                onChange={formik.handleChange}
                                onBlur={formik.handleBlur}
                                value={formik.values.password}
                                label="password" />
                        </div>
                        {formik.touched.password && formik.errors.password ?
                            <p className='formError  text-sm text-red-600'>{formik.errors.password}</p>
                            : null}
                    </div>
                    <div>
                        <input
                            className="checkbox"
                            type="checkbox"
                            id='remember' />
                        <label className='ml-2 text-sm'>Να με θυμάσαι</label>
                    </div>
                    <div>
                        <Link href="#" className=' text-sm text-center'>
                            Ξέχασα τον κωδικό μου
                        </Link>
                    </div>
                    <button
                        type='submit'
                        className='text-white tracking-wide text-lg font-semibold h-12 bg-gradient-to-br from-siteColors-blue via-siteColors-lightblue to-siteColors-purple hover:bg-gradient-to-tl'>
                        Σύνδεση
                    </button>
                </form>
            </div>
            <div className='w-full h-full'>
                <div className='flex flex-col w-full h-full text-xl sm:text-2xl md:text-3xl px-2 font-semibold'>
                    <h2 className='text-slate-800 dark:text-slate-200 text-center mb-8'>Σύνδεση Μέσω Social</h2>
                    <div className='w-full h-full p-4 border border-slate-200 rounded-lg '>
                        {providers && Object.values(providers).map((provider) => (
                            provider.name !== "Credentials" ? <div key={provider.name}>
                                <button className='border rounded-md text-slate-200 bg-siteColors-blue w-full p-2 text-lg font-medium'
                                    onClick={() => signIn(provider.id, {
                                        callbackUrl: callbackUrl ? callbackUrl : "/"
                                    })}>
                                    Λογαριασμό {provider.name}
                                </button>
                            </div> : null
                        ))}
                    </div>
                </div>
            </div>
            <div className='w-full h-full'>
                <div className='flex flex-col w-full h-full text-xl sm:text-2xl md:text-3xl px-2 font-semibold'>
                    <h2 className='text-slate-800 dark:text-slate-200 text-center mb-8'>Γρήγορη Παραγγελία</h2>
                    <Link href='/checkout/customer-informations'
                        className='flex flex-col text-slate-200 items-center justify-center w-full h-full p-4 border border-slate-200 rounded-lg bg-green-500 '>
                        <h3 className='bg-inherit mb-4'><FaBagShopping className='w-16 h-16' /></h3>
                        <p className='text-center px-8'>Ολοκλήρωση της παραγγελίας ως επισκέπτης</p>
                    </Link>
                </div>
            </div>
        </div >
    )
}