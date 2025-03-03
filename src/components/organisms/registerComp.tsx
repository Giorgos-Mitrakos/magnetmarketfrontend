"use client"
import * as Yup from 'yup'
import { ClientSafeProvider, LiteralUnion, getProviders, getCsrfToken, signIn } from "next-auth/react"
import Link from "next/link"
import { useState, useEffect } from "react";
import { useFormik } from "formik";
import { BuiltInProviderType } from 'next-auth/providers'
import CustomInput from '@/components/atoms/input'
import { useSearchParams } from 'next/navigation'


export interface ILoginData {
    email: string;
    password: string;
    confirmPassword: string;
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

export default function RegisterComp() {
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
        confirmPassword: ""
    }
    const formik = useFormik({
        initialValues: initialValues,
        validationSchema: Yup.object({
            email: Yup.string()
                .email('*Το email δεν είναι σωστό!!!')
                .required('*To email είναι υποχρεωτικό πεδίο!'),
            password: Yup.string()
                .min(8, 'Ο κωδικός πρέπει να είναι τουλάχιστον 8 χαρακτήρες')
                .matches(/[0-9]/, 'Ο κωδικός πρέπει να περιλαμβάνει αριθμό')
                .matches(/[a-z]/, 'Ο κωδικός πρέπει να περιλαμβάνει μικρό')
                .matches(/[A-Z]/, 'Ο κωδικός πρέπει να περιλαμβάνει κεφαλαίο')
                .matches(/[^\w]/, 'Ο κωδικός πρέπει να περιλαμβάνει σύμβολο')
                .required("*Συμπληρώστε τον κωδικό σας!"),
            confirmPassword: Yup.string()
                .oneOf([Yup.ref("password")], "Ο κωδικός επιβεβαίωσης δεν ταιριάζει!")
                .required("*Επιβεβαιώστε τον κωδικό σας!"),
        }),
        onSubmit: async (values) => {
            console.log("values:", values)
            const newUser = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/local/register`, {
                method: "POST",
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    username: formik.values.email,
                    email: formik.values.email,
                    password: formik.values.password,
                })
            })

            console.log("newUser:", await newUser.json())
            const csrf = await getCsrfToken()
            signIn('Credentials', { email: values.email, password: values.password, csrf }, { callbackUrl: '/' })
        }
    });

    return (
        <div className='flex justify-center gap-4 mb-8'>
            <div className='w-full max-w-96 '>
                <form className='grid gap-4 p-4 lg:border-2 dark:bg-slate-800 mx-auto rounded-md shadow-sm'
                    onSubmit={formik.handleSubmit}>
                    <h2 className='text-center text-xl font-medium'>Εγγραφείτε</h2>
                    <div className='h-14'>
                        <div className="flex relative rounded-lg border border-1 border-gray-300 appearance-none">
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
                        <div className="flex relative rounded-lg border border-1 border-gray-300 appearance-none">
                            <CustomInput
                                aria_label="Φόρμα εισαγωγής Κωδικού"
                                type={toggle ? "text" : "password"}
                                id='password'
                                name='password'
                                onChange={formik.handleChange}
                                onBlur={formik.handleBlur}
                                value={formik.values.password}
                                label="Κωδικός" />
                        </div>
                        {formik.touched.password && formik.errors.password ?
                            <p className='formError  text-sm text-red-600'>{formik.errors.password}</p>
                            : null}
                    </div>
                    <div className='h-14'>
                        <div className="flex relative rounded-lg border border-1 border-gray-300 appearance-none">
                            <CustomInput
                                aria_label="Φόρμα εισαγωγής Κωδικού"
                                type={toggle ? "text" : "password"}
                                id='confirmPassword'
                                name='confirmPassword'
                                onChange={formik.handleChange}
                                onBlur={formik.handleBlur}
                                value={formik.values.confirmPassword}
                                label="Επιβεβαίωση κωδικού" />
                        </div>
                        {formik.touched.confirmPassword && formik.errors.confirmPassword ?
                            <p className='formError  text-sm text-red-600'>{formik.errors.confirmPassword}</p>
                            : null}
                    </div>
                    <div>
                        <Link href="/login" className=' text-sm text-center'>
                            Είσοδος;
                        </Link>
                    </div>
                    <button
                        type='submit'
                        className='text-white rounded tracking-wide text-lg font-semibold h-12 bg-gradient-to-br from-siteColors-blue via-siteColors-lightblue to-siteColors-purple hover:bg-gradient-to-tl'>
                        Εγγραφή
                    </button>
                </form>
            </div>
            {/* <div className='w-full h-full'>
                    <div className='flex flex-col w-full h-full text-xl sm:text-2xl md:text-3xl px-2 font-semibold'>
                        <h2 className='text-slate-800 dark:text-slate-200 text-center mb-4'>Σύνδεση Μέσω Social</h2>
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
                </div> */}
        </div>
    )
}