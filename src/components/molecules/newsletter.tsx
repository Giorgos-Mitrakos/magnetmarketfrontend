'use client'

import { useFormik } from "formik";
import * as Yup from 'yup';
import { toast } from "sonner";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { FiMail, FiSend, FiCheck, FiArrowRight } from 'react-icons/fi';

const Newsletter = () => {
    const router = useRouter();
    const [isSubmiting, setIsSubmiting] = useState(false);

    const initialValues = {
        email: "",
    };

    const formik = useFormik({
        initialValues: initialValues,
        validationSchema: Yup.object({
            email: Yup.string()
                .email('*Το email δεν είναι σωστό!!!')
                .trim().required('*Συμπληρώστε το email σας'),
        }),
        onSubmit: async (values, { setErrors, resetForm }) => {
            try {
                setIsSubmiting(true);

                const response = await fetch('/api/newsletter/subscribe', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        email: values.email
                    }),
                });                

                const data = await response.json();

                switch (data.message) {
                    case "suceess subscribe":
                        toast.success(
                            <p className='font-semibold'>Η εγγραφή σας έγινε με επιτυχία!</p>, {
                            position: 'top-right',
                        });
                        router.push('/newsletter/subscribe/success');
                        break;
    
                    case "suceess activate":
                        toast.info(<p className='font-semibold'>Η αποστολή newsletter ενεργοποιήθηκε!</p>, {
                            position: 'top-right',
                        });
                        router.push('/newsletter/subscribe/success?message=Η εγγραφή στο newsletter ενεργοποιήθηκε ξανά!');
                        break;
    
                    case "This attribute must be unique":
                        router.push('/newsletter/subscribe/error?message=Έχετε κάνει ήδη εγγραφή στο newsletter μας!');
                        break;
    
                    default:
                        break;
                }
            }
            catch (err: any) {
                const errors: { [key: string]: string } = {};
                err.response.errors?.forEach((element: any) => {
                    if (element.message === "This attribute must be unique") {
                        errors[element.extensions.error.details.errors[0].path[0]] = "* Έχετε κάνει ήδη εγγραφή στο newsletter μας";
                    }
                    else {
                        errors[element.extensions.error.details.errors[0].path[0]] = element.message;
                    }
                });
                setErrors(errors);
            }

            resetForm();
            setIsSubmiting(false);
        }
    });

    return (
        <section className="w-full pb-8 md:py-16 bg-white">
            <div className="w-full max-w-7xl mx-auto px-4 md:px-6">
                <div className="w-full bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-8 md:p-10 flex flex-col lg:flex-row items-center justify-between shadow-lg border border-gray-100">
                    {/* Text Content - Left Side */}
                    <div className="w-full lg:w-2/5 mb-8 lg:mb-0">
                        <div className="flex items-center mb-4">
                            <div className="bg-gradient-to-r from-siteColors-blue to-siteColors-purple p-3 rounded-xl mr-4 shadow-md">
                                <FiMail className="h-7 w-7 text-white" />
                            </div>
                            <h3 className="font-bold text-2xl md:text-3xl text-gray-800">
                                Newsletter
                            </h3>
                        </div>
                        <p className="text-lg text-gray-700 mb-2">
                            Μην χάνεις <span className="font-semibold text-siteColors-pink">καμία προσφορά</span>
                        </p>
                        <p className="text-gray-600">
                            Εγγραφείτε για αποκλειστικές προσφορές, εκπτώσεις και νέα προϊόντα.
                        </p>
                    </div>
                    
                    {/* Form - Right Side */}
                    <div className="w-full lg:w-3/5">
                        <form onSubmit={formik.handleSubmit} className="w-full">
                            <div className="flex flex-col sm:flex-row gap-3 w-full">
                                <div className="relative flex-grow">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                        <FiMail className="h-5 w-5 text-gray-400" />
                                    </div>
                                    <input
                                        id="email"
                                        name="email"
                                        type="email"
                                        onChange={formik.handleChange}
                                        onBlur={formik.handleBlur}
                                        value={formik.values.email}
                                        className="w-full pl-12 pr-4 py-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-siteColors-blue focus:border-siteColors-blue transition-colors shadow-sm"
                                        placeholder="Διεύθυνση email"
                                        aria-label="Διεύθυνση email για εγγραφή στο newsletter"
                                    />
                                </div>
                                <button 
                                    type="submit" 
                                    disabled={isSubmiting}
                                    className="flex-shrink-0 flex items-center justify-center px-6 py-4 bg-gradient-to-r from-siteColors-blue to-siteColors-purple text-white font-semibold rounded-xl hover:from-siteColors-lightblue hover:to-siteColors-pink transition-all duration-300 disabled:opacity-70 disabled:cursor-not-allowed shadow-md hover:shadow-lg min-w-[140px]"
                                    aria-label="Κουμπί εγγραφής στο newsletter"
                                >
                                    {isSubmiting ? (
                                        <>
                                            <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                            </svg>
                                            Αποστολή...
                                        </>
                                    ) : (
                                        <>
                                            Εγγραφή
                                            <FiArrowRight className="ml-2" />
                                        </>
                                    )}
                                </button>
                            </div>
                            
                            {formik.touched.email && formik.errors.email ? (
                                <div className="mt-3 flex items-start">
                                    <FiCheck className="h-4 w-4 text-red-500 mr-2 mt-0.5 flex-shrink-0" />
                                    <p className='text-sm text-red-600'>{formik.errors.email}</p>
                                </div>
                            ) : (
                                <p className="text-xs text-gray-500 mt-3">
                                    Με την εγγραφή σας αποδέχεστε τους Όρους Χρήσης και την Πολιτική Απορρήτου
                                </p>
                            )}
                        </form>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default Newsletter;