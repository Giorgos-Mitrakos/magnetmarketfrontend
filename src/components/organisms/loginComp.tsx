"use client"
import * as Yup from 'yup'
import { ClientSafeProvider, LiteralUnion, getProviders, getCsrfToken, signIn } from "next-auth/react"
import Link from "next/link"
import { useState, useEffect } from "react";
import { useFormik } from "formik";
import { BuiltInProviderType } from 'next-auth/providers'
import CustomInput from '@/components/atoms/input'
import { useSearchParams } from 'next/navigation'
import { FaEye, FaEyeSlash, FaGoogle, FaFacebook, FaArrowRight } from 'react-icons/fa'
import { FiTruck, FiHeart, FiClock, FiPercent } from 'react-icons/fi'
import { FaBagShopping } from 'react-icons/fa6';

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

export default function LoginComp() {
    const [csrfToken, setCsrfToken] = useState<string | undefined>();
    const [toggle, setToggle] = useState(false);
    const [providers, setProviders] = useState<Record<LiteralUnion<BuiltInProviderType, string>, ClientSafeProvider> | null>()
    const [isLoading, setIsLoading] = useState(false);

    const searchParams = useSearchParams()
    const callbackUrl = searchParams.get('callbackUrl')

    useEffect(() => {
        async function getProv() {
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
            setIsLoading(true);
            signIn('credentials', {
                ...values,
                callbackUrl: callbackUrl ? callbackUrl : "/"
            });
        }
    });

    const handleSocialLogin = (providerId: string) => {
        setIsLoading(true);
        signIn(providerId, {
            callbackUrl: callbackUrl ? callbackUrl : "/"
        });
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-800 py-8 px-4">
            <div className="max-w-6xl mx-auto flex flex-col lg:flex-row rounded-2xl overflow-hidden shadow-xl bg-white ">
                {/* Left Panel - Branding & Features */}
                <div className="w-full lg:w-2/5 bg-gradient-to-b from-siteColors-blue to-siteColors-purple text-white p-8 lg:p-12 flex flex-col justify-between">
                    <div>
                        <div className="flex items-center mb-12">
                            <FaBagShopping className="h-8 w-8 mr-2" />
                            <span className="text-2xl font-bold">MagnetMarket</span>
                        </div>
                        <h1 className="text-3xl lg:text-4xl font-bold mb-6">Καλώς ήρθατε!</h1>
                        <p className="text-blue-100 mb-10">
                            Συνδεθείτε για να συνεχίσετε με τις αγορές σας και να απολαύσετε μια βελτιωμένη εμπειρία shopping.
                        </p>

                        <div className="space-y-5">
                            <div className="flex items-start">
                                <div className="bg-siteColors-lightblue p-2 rounded-full mr-4 mt-1">
                                    <FiTruck className="w-5 h-5" />
                                </div>
                                <div>
                                    <h3 className="font-semibold">Γρήγορες Αγορές</h3>
                                    <p className="text-blue-200 text-sm">Ολοκληρώστε γρήγορα τις αγορές σας</p>
                                </div>
                            </div>

                            <div className="flex items-start">
                                <div className="bg-siteColors-lightblue p-2 rounded-full mr-4 mt-1">
                                    <FiPercent className="w-5 h-5" />
                                </div>
                                <div>
                                    <h3 className="font-semibold">Προσωποποιημένες Προσφορές</h3>
                                    <p className="text-blue-200 text-sm">Εξατομικευμένες εκπτώσεις για εσάς</p>
                                </div>
                            </div>

                            <div className="flex items-start">
                                <div className="bg-siteColors-lightblue p-2 rounded-full mr-4 mt-1">
                                    <FiClock className="w-5 h-5" />
                                </div>
                                <div>
                                    <h3 className="font-semibold">Ιστορικό Παραγγελιών</h3>
                                    <p className="text-blue-200 text-sm">Πρόσβαση στο ιστορικό αγορών σας</p>
                                </div>
                            </div>

                            {/* Το κρατάω για το μέλλον όπου θα φτιάξω αγαπημένα */}
                            {/* <div className="flex items-start">
                                <div className="bg-siteColors-lightblue p-2 rounded-full mr-4 mt-1">
                                    <FiHeart className="w-5 h-5" />
                                </div>
                                <div>
                                    <h3 className="font-semibold">Αγαπημένα Προϊόντα</h3>
                                    <p className="text-blue-200 text-sm">Αποθηκεύστε τα αγαπημένα σας προϊόντα</p>
                                </div>
                            </div> */}
                        </div>
                    </div>

                    <div className="mt-8 text-blue-200 text-sm">
                        <p>© 2025 MagnetMarket. All rights reserved.</p>
                    </div>
                </div>

                {/* Right Panel - Login Form */}
                <div className="w-full lg:w-3/5 p-8 lg:p-12">
                    <div className="max-w-md mx-auto">
                        <div className="text-center mb-10">
                            <h2 className="text-3xl font-bold text-gray-800">Σύνδεση</h2>
                            <p className="text-gray-600 mt-2">Συμπληρώστε τα στοιχεία σας για να συνεχίσετε</p>
                        </div>

                        {/* Social Login Buttons */}
                        {providers && Object.values(providers).filter(provider => provider.name !== "Credentials").length > 0 && (
                            <>
                                <div className="grid grid-cols-2 gap-4 mb-8">
                                    {providers && Object.values(providers).map((provider) => (
                                        provider.name !== "Credentials" &&
                                        <button
                                            key={provider.name}
                                            onClick={() => handleSocialLogin(provider.id)}
                                            disabled={isLoading}
                                            className="flex items-center justify-center py-3 px-4 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
                                        >
                                            {provider.name === "Google" && <FaGoogle className="w-5 h-5 mr-2 text-red-600" />}
                                            {provider.name === "Facebook" && <FaFacebook className="w-5 h-5 mr-2 text-blue-600" />}
                                            {provider.name}
                                        </button>
                                    ))}
                                </div>

                                <div className="flex items-center my-8">
                                    <div className="flex-grow border-t border-gray-300"></div>
                                    <span className="mx-4 text-gray-500">ή</span>
                                    <div className="flex-grow border-t border-gray-300"></div>
                                </div>
                            </>
                        )}

                        {/* Login Form */}
                        <form onSubmit={formik.handleSubmit} className="space-y-6">
                            <input name="csrfToken" type="hidden" defaultValue={csrfToken} />

                            <div>
                                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                                    Διεύθυνση Email
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                            <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                                            <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                                        </svg>
                                    </div>
                                    <input
                                        id="email"
                                        name="email"
                                        type="email"
                                        autoComplete="email"
                                        required
                                        onChange={formik.handleChange}
                                        onBlur={formik.handleBlur}
                                        value={formik.values.email}
                                        className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-siteColors-blue focus:border-siteColors-blue"
                                        placeholder="Εισάγετε το email σας"
                                    />
                                </div>
                                {formik.touched.email && formik.errors.email ?
                                    <p className='formError text-sm text-red-600 mt-1'>{formik.errors.email}</p>
                                    : null}
                            </div>

                            <div>
                                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                                    Κωδικός Πρόσβασης
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                            <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                                        </svg>
                                    </div>
                                    <input
                                        id="password"
                                        name="password"
                                        type={toggle ? "text" : "password"}
                                        autoComplete="current-password"
                                        required
                                        onChange={formik.handleChange}
                                        onBlur={formik.handleBlur}
                                        value={formik.values.password}
                                        className="block w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-siteColors-blue focus:border-siteColors-blue"
                                        placeholder="Εισάγετε τον κωδικό σας"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setToggle(!toggle)}
                                        className="absolute inset-y-0 right-0 pr-3 flex items-center"
                                    >
                                        {toggle ? <FaEyeSlash className="h-5 w-5 text-gray-400" /> : <FaEye className="h-5 w-5 text-gray-400" />}
                                    </button>
                                </div>
                                {formik.touched.password && formik.errors.password ?
                                    <p className='formError text-sm text-red-600 mt-1'>{formik.errors.password}</p>
                                    : null}

                                <div className="flex justify-between mt-2">
                                    <Link href="/forgot-password" className="text-sm text-siteColors-blue hover:text-siteColors-purple">
                                        Ξεχάσατε τον κωδικό σας;
                                    </Link>
                                </div>
                            </div>

                            <div>
                                <button
                                    type="submit"
                                    disabled={isLoading}
                                    className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-gradient-to-r from-siteColors-blue to-siteColors-purple hover:from-siteColors-lightblue hover:to-siteColors-pink focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-siteColors-blue disabled:opacity-70 transition-colors"
                                >
                                    {isLoading ? (
                                        <>
                                            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                            </svg>
                                            Σύνδεση...
                                        </>
                                    ) : (
                                        <>
                                            Σύνδεση <FaArrowRight className="ml-2" />
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>

                        <div className="mt-8 text-center">
                            <p className="text-gray-600">
                                Δεν έχετε λογαριασμό;{' '}
                                <Link href={`/register${callbackUrl ? `?callbackUrl=${encodeURIComponent(callbackUrl)}` : ''}`} className="font-medium text-siteColors-blue hover:text-siteColors-purple">
                                Δημιουργία λογαριασμού
                            </Link>
                        </p>
                    </div>

                    {callbackUrl && callbackUrl === "/checkout/customer-informations" && (
                        <div className="mt-10 pt-10 border-t border-gray-200">
                            <div className="text-center">
                                <h3 className="text-lg font-medium text-gray-800 mb-4">Γρήγορη Παραγγελία</h3>
                                <Link
                                    href='/checkout/customer-informations'
                                    className="inline-flex items-center justify-center w-full py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors"
                                >
                                    <FaBagShopping className="mr-2" />
                                    Ολοκλήρωση ως επισκέπτης
                                </Link>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
        </div >
    )
}