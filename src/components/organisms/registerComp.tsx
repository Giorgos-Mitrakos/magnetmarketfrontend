"use client"
import * as Yup from 'yup'
import { ClientSafeProvider, LiteralUnion, getProviders, getCsrfToken, signIn } from "next-auth/react"
import Link from "next/link"
import { useState, useEffect } from "react";
import { useFormik } from "formik";
import { BuiltInProviderType } from 'next-auth/providers'
import CustomInput from '@/components/atoms/input'
import { useSearchParams } from 'next/navigation'
import { FaEye, FaEyeSlash, FaArrowRight, FaCheck, FaInfoCircle } from 'react-icons/fa'
import { FiUser, FiMail, FiLock, FiTruck, FiHeart, FiClock, FiPercent } from 'react-icons/fi'
import { FaBagShopping } from 'react-icons/fa6';

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
    const [toggleConfirm, setToggleConfirm] = useState(false);
    const [providers, setProviders] = useState<Record<LiteralUnion<BuiltInProviderType, string>, ClientSafeProvider> | null>()
    const [isLoading, setIsLoading] = useState(false);
    const [passwordStrength, setPasswordStrength] = useState(0);

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
                .matches(/[a-z]/, 'Ο κωδικός πρέπει να περιλαμβάνει μικρό γράμμα')
                .matches(/[A-Z]/, 'Ο κωδικός πρέπει να περιλαμβάνει κεφαλαίο γράμμα')
                .matches(/[^\w]/, 'Ο κωδικός πρέπει να περιλαμβάνει ειδικό χαρακτήρα')
                .required("*Συμπληρώστε τον κωδικό σας!"),
            confirmPassword: Yup.string()
                .oneOf([Yup.ref("password")], "Ο κωδικός επιβεβαίωσης δεν ταιριάζει!")
                .required("*Επιβεβαιώστε τον κωδικό σας!"),
        }),
        onSubmit: async (values) => {
            setIsLoading(true);
            try {
                const newUser = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/local/register`, {
                    method: "POST",
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        username: values.email,
                        email: values.email,
                        password: values.password,
                    })
                });

                const result = await newUser.json();

                if (newUser.ok) {
                    // Κάντε signIn με τα credentials μετά την επιτυχή εγγραφή
                    const signInResult = await signIn('credentials', {
                        redirect: false, // Απενεργοποιήστε το auto-redirect
                        email: values.email,
                        password: values.password,
                        callbackUrl: callbackUrl || '/'
                    });

                    if (signInResult?.ok) {
                        // Redirect με hand-written code για να σιγουρευτούμε ότι λειτουργεί
                        window.location.href = callbackUrl || '/';
                    } else {
                        console.error('Auto login failed:', signInResult?.error);
                        // Fallback: redirect to login with success message
                        window.location.href = `/login?registered=true${callbackUrl ? `&callbackUrl=${encodeURIComponent(callbackUrl)}` : ''}`;
                    }
                } else {
                    console.error('Registration failed:', result.error);
                    formik.setFieldError('email', result.error?.message || 'Registration failed');
                    setIsLoading(false);
                }
            } catch (error) {
                console.error('Registration error:', error);
                formik.setFieldError('email', 'An unexpected error occurred');
                setIsLoading(false);
            }
        }
    });


    useEffect(() => {
        // Calculate password strength
        if (formik.values.password) {
            let strength = 0;
            if (formik.values.password.length >= 8) strength += 20;
            if (/[0-9]/.test(formik.values.password)) strength += 20;
            if (/[a-z]/.test(formik.values.password)) strength += 20;
            if (/[A-Z]/.test(formik.values.password)) strength += 20;
            if (/[^\w]/.test(formik.values.password)) strength += 20;
            setPasswordStrength(strength);
        } else {
            setPasswordStrength(0);
        }
    }, [formik.values.password]);

    const getPasswordStrengthColor = () => {
        if (passwordStrength <= 20) return 'bg-red-500';
        if (passwordStrength <= 40) return 'bg-orange-500';
        if (passwordStrength <= 60) return 'bg-yellow-500';
        if (passwordStrength <= 80) return 'bg-blue-500';
        return 'bg-green-500';
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 py-8 px-4">
            <div className="max-w-6xl mx-auto flex flex-col lg:flex-row rounded-2xl overflow-hidden shadow-xl bg-white">
                {/* Left Panel - Branding & Features */}
                <div className="w-full lg:w-2/5 bg-gradient-to-b from-siteColors-blue to-siteColors-purple text-white p-8 lg:p-12 flex flex-col justify-between">
                    <div>
                        <div className="flex items-center mb-12">
                            <FaBagShopping className="h-8 w-8 mr-2" />
                            <span className="text-2xl font-bold">MagnetMarket</span>
                        </div>
                        <h1 className="text-3xl lg:text-4xl font-bold mb-6">Δημιουργήστε λογαριασμό</h1>
                        <p className="text-blue-100 mb-10">
                            Γίνετε μέλος της οικογένειας μας και αποκτήστε πρόσβαση σε εξατομικευμένες προσφορές και προνόμια.
                        </p>

                        <div className="space-y-5">
                            <div className="flex items-start">
                                <div className="bg-siteColors-lightblue p-2 rounded-full mr-4 mt-1">
                                    <FiTruck className="w-5 h-5" />
                                </div>
                                <div>
                                    <h3 className="font-semibold">Γρήγορη Ολοκλήρωση Αγορών</h3>
                                    <p className="text-blue-200 text-sm">Αποθηκεύστε τα στοιχεία σας για γρηγορότερες αγορές</p>
                                </div>
                            </div>

                            <div className="flex items-start">
                                <div className="bg-siteColors-lightblue p-2 rounded-full mr-4 mt-1">
                                    <FiPercent className="w-5 h-5" />
                                </div>
                                <div>
                                    <h3 className="font-semibold">Εξατομικευμένες Προσφορές</h3>
                                    <p className="text-blue-200 text-sm">Λάβετε προσφορές βασισμένες στις προτιμήσεις σας</p>
                                </div>
                            </div>

                            <div className="flex items-start">
                                <div className="bg-siteColors-lightblue p-2 rounded-full mr-4 mt-1">
                                    <FiClock className="w-5 h-5" />
                                </div>
                                <div>
                                    <h3 className="font-semibold">Ιστορικό Παραγγελιών</h3>
                                    <p className="text-blue-200 text-sm">Πρόσβαση στο πλήρες ιστορικό αγορών σας</p>
                                </div>
                            </div>

                            {/* Το κρατάω για το μέλλον όπου θα φτιάξω αγαπημένα
                            <div className="flex items-start">
                                <div className="bg-siteColors-lightblue p-2 rounded-full mr-4 mt-1">
                                    <FiHeart className="w-5 h-5" />
                                </div>
                                <div>
                                    <h3 className="font-semibold">Λίστα Αγαπημένων</h3>
                                    <p className="text-blue-200 text-sm">Αποθηκεύστε τα αγαπημένα σας προϊόντα</p>
                                </div>
                            </div> */}
                        </div>
                    </div>

                    <div className="mt-8 text-blue-200 text-sm">
                        <p>© 2025 MagnetMarket. All rights reserved.</p>
                    </div>
                </div>

                {/* Right Panel - Registration Form */}
                <div className="w-full lg:w-3/5 p-8 lg:p-12">
                    <div className="max-w-md mx-auto">
                        <div className="text-center mb-10">
                            <h2 className="text-3xl font-bold text-gray-800">Εγγραφή</h2>
                            <p className="text-gray-600 mt-2">Δημιουργήστε νέο λογαριασμό</p>
                        </div>

                        <form onSubmit={formik.handleSubmit} className="space-y-6">
                            <input name="csrfToken" type="hidden" defaultValue={csrfToken} />

                            <div>
                                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                                    Διεύθυνση Email
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <FiMail className="h-5 w-5 text-gray-400" />
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
                                        <FiLock className="h-5 w-5 text-gray-400" />
                                    </div>
                                    <input
                                        id="password"
                                        name="password"
                                        type={toggle ? "text" : "password"}
                                        autoComplete="new-password"
                                        required
                                        onChange={formik.handleChange}
                                        onBlur={formik.handleBlur}
                                        value={formik.values.password}
                                        className="block w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-siteColors-blue focus:border-siteColors-blue"
                                        placeholder="Δημιουργήστε έναν κωδικό"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setToggle(!toggle)}
                                        className="absolute inset-y-0 right-0 pr-3 flex items-center"
                                    >
                                        {toggle ? <FaEyeSlash className="h-5 w-5 text-gray-400" /> : <FaEye className="h-5 w-5 text-gray-400" />}
                                    </button>
                                </div>

                                {/* Password Strength Meter */}
                                {formik.values.password && (
                                    <div className="mt-2">
                                        <div className="flex justify-between items-center mb-1">
                                            <span className="text-xs text-gray-500">Ισχύς κωδικού:</span>
                                            <span className="text-xs font-medium">
                                                {passwordStrength <= 20 ? 'Αδύναμος' :
                                                    passwordStrength <= 40 ? 'Ασθενής' :
                                                        passwordStrength <= 60 ? 'Μέτριος' :
                                                            passwordStrength <= 80 ? 'Δυνατός' : 'Πολύ δυνατός'}
                                            </span>
                                        </div>
                                        <div className="w-full bg-gray-200 rounded-full h-1.5">
                                            <div
                                                className={`h-1.5 rounded-full ${getPasswordStrengthColor()}`}
                                                style={{ width: `${passwordStrength}%` }}
                                            ></div>
                                        </div>
                                    </div>
                                )}

                                {/* Password Requirements */}
                                <div className="mt-3 space-y-1">
                                    <p className="text-xs text-gray-600 flex items-center">
                                        <FaInfoCircle className="mr-1" /> Ο κωδικός πρέπει να περιέχει:
                                    </p>
                                    <div className="text-xs text-gray-600 grid grid-cols-2 gap-1">
                                        <div className={`flex items-center ${formik.values.password.length >= 8 ? 'text-green-600' : ''}`}>
                                            {formik.values.password.length >= 8 ? <FaCheck className="mr-1" /> : '• '}
                                            τουλάχιστον 8 χαρακτήρες
                                        </div>
                                        <div className={`flex items-center ${/[0-9]/.test(formik.values.password) ? 'text-green-600' : ''}`}>
                                            {/[0-9]/.test(formik.values.password) ? <FaCheck className="mr-1" /> : '• '}
                                            έναν αριθμό
                                        </div>
                                        <div className={`flex items-center ${/[a-z]/.test(formik.values.password) ? 'text-green-600' : ''}`}>
                                            {/[a-z]/.test(formik.values.password) ? <FaCheck className="mr-1" /> : '• '}
                                            ένα μικρό γράμμα
                                        </div>
                                        <div className={`flex items-center ${/[A-Z]/.test(formik.values.password) ? 'text-green-600' : ''}`}>
                                            {/[A-Z]/.test(formik.values.password) ? <FaCheck className="mr-1" /> : '• '}
                                            ένα κεφαλαίο γράμμα
                                        </div>
                                        <div className={`flex items-center ${/[^\w]/.test(formik.values.password) ? 'text-green-600' : ''}`}>
                                            {/[^\w]/.test(formik.values.password) ? <FaCheck className="mr-1" /> : '• '}
                                            ένα ειδικό σύμβολο
                                        </div>
                                    </div>
                                </div>

                                {formik.touched.password && formik.errors.password ?
                                    <p className='formError text-sm text-red-600 mt-1'>{formik.errors.password}</p>
                                    : null}
                            </div>

                            <div>
                                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                                    Επιβεβαίωση Κωδικού
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <FiLock className="h-5 w-5 text-gray-400" />
                                    </div>
                                    <input
                                        id="confirmPassword"
                                        name="confirmPassword"
                                        type={toggleConfirm ? "text" : "password"}
                                        autoComplete="new-password"
                                        required
                                        onChange={formik.handleChange}
                                        onBlur={formik.handleBlur}
                                        value={formik.values.confirmPassword}
                                        className="block w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-siteColors-blue focus:border-siteColors-blue"
                                        placeholder="Επιβεβαιώστε τον κωδικό σας"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setToggleConfirm(!toggleConfirm)}
                                        className="absolute inset-y-0 right-0 pr-3 flex items-center"
                                    >
                                        {toggleConfirm ? <FaEyeSlash className="h-5 w-5 text-gray-400" /> : <FaEye className="h-5 w-5 text-gray-400" />}
                                    </button>
                                </div>
                                {formik.touched.confirmPassword && formik.errors.confirmPassword ?
                                    <p className='formError text-sm text-red-600 mt-1'>{formik.errors.confirmPassword}</p>
                                    : null}
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
                                            Εγγραφή...
                                        </>
                                    ) : (
                                        <>
                                            Εγγραφή <FaArrowRight className="ml-2" />
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>

                        <div className="mt-8 text-center">
                            <p className="text-gray-600">
                                Έχετε ήδη λογαριασμό;{' '}
                                <Link href={`/login${callbackUrl ? `?callbackUrl=${encodeURIComponent(callbackUrl)}` : ''}`} className="font-medium text-siteColors-blue hover:text-siteColors-purple">
                                    Συνδεθείτε εδώ
                                </Link>
                            </p>
                        </div>

                        {/* Social Login Options */}
                        {providers && Object.values(providers).filter(provider => provider.name !== "Credentials").length > 0 && (
                            <div className="mt-10 pt-10 border-t border-gray-200">
                                <div className="text-center">
                                    <p className="text-sm text-gray-500 mb-4">Ή εγγραφείτε με</p>
                                    <div className="flex justify-center space-x-4">
                                        {providers && Object.values(providers).map((provider) => (
                                            provider.name !== "Credentials" &&
                                            <button
                                                key={provider.name}
                                                onClick={() => signIn(provider.id, { callbackUrl: callbackUrl || "/" })}
                                                disabled={isLoading}
                                                className="p-3 rounded-full bg-white border border-gray-300 hover:bg-gray-50 transition-colors disabled:opacity-50"
                                                aria-label={`Εγγραφή μέσω ${provider.name}`}
                                            >
                                                {provider.name === "Google" && (
                                                    <svg className="w-5 h-5" viewBox="0 0 24 24" width="24" height="24">
                                                        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                                                        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                                                        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                                                        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                                                    </svg>
                                                )}
                                                {provider.name === "Facebook" && (
                                                    <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 24 24" width="24" height="24">
                                                        <path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.879V14.89h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.989C18.343 21.129 22 16.99 22 12z" />
                                                    </svg>
                                                )}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}