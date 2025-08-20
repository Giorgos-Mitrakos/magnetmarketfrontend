'use client'

import { useFormik } from "formik";
import * as Yup from 'yup';
import CustomInput from "../atoms/input";
import { toast } from "sonner";
import { useState } from "react";
import { useRouter } from "next/navigation";

const Newsletter = () => {

    const router = useRouter();
    const [isSubmiting, setIsSubmiting] = useState(false)

    const initialValues = {
        email: "",
    }
    const formik = useFormik({
        initialValues: initialValues,
        validationSchema: Yup.object({
            email: Yup.string()
                .email('*Το email δεν είναι σωστό!!!')
                .trim().required('*Συμπληρώστε το email σας'),
        }),
        onSubmit: async (values, { setErrors }) => {
            try {
                setIsSubmiting(true)

                const response =await fetch('/api/newsletter/subscribe', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        email: values.email
                    }),
                });                

                const data = await response.json()

                switch (data.message) {
                                case "suceess subscribe":
                                    toast.success(
                                        <p className='font-semibold'>Η εγγραφή σας έγινε με επιτυχία!</p>, {
                                        position: 'top-right',
                                    })
                                    // router.push('/newsletter/subscribe/success');
                                    break;
                
                                case "suceess activate":
                                    toast.info(<p className='font-semibold'>Η αποστολή newsletter ενεργοποιήθηκε!</p>, {
                                        position: 'top-right',
                                    })
                                    // router.push('/newsletter/subscribe/success?message=Η εγγραφή στο newsletter ενεργοποιήθηκε ξανά!');
                                    break;
                
                                case "This attribute must be unique":
                                    // toast.info(<p className='font-semibold'>Έχετε κάνει ήδη εγγραφή στο newsletter μας!</p>, {
                                    //     position: 'top-right',
                                    // })
                                    router.push('/newsletter/subscribe/error?message=Έχετε κάνει ήδη εγγραφή στο newsletter μας!');
                                    break;
                
                                default:
                                    break;
                            }
            }
            catch (err: any) {
                const errors: { [key: string]: string } = {}
                err.response.errors?.forEach((element: any) => {
                    if (element.message === "This attribute must be unique") {
                        errors[element.extensions.error.details.errors[0].path[0]] = "* Έχετε κάνει ήδη εγγραφή στο newsletter μας"
                    }
                    else {
                        errors[element.extensions.error.details.errors[0].path[0]] = element.message
                    }
                });
                setErrors(errors)
            }


            values.email = ''
            setIsSubmiting(false)
        }
    });

    return (
        <section className=" border-t-2 py-4 md:py-8">
            <form className="flex flex-col sm:flex-row"
                onSubmit={formik.handleSubmit} method="post">
                <div className="w-full sm:w-1/2">
                    <h3 className=" font-semibold text-2xl md:text-3xl mb-1 text-siteColors-purple dark:text-slate-200"
                        aria-label="Newsletter">Newsletter</h3>
                    <p className="mb-0 md:mb-2 text-base md:text-lg text-siteColors-pink dark:text-slate-300"
                        aria-label="Για να μην χάνεις καμία προσφορά!!!">Για να μην χάνεις καμία προσφορά!!!</p>
                </div>
                <div className="w-full sm:w-1/2">
                    <div className="mt-2 gap-2 grid grid-rows-2 md:grid-rows-1 md:grid-cols-3 md:gap-0">
                        <div className="relative rounded-lg md:rounded-none md:rounded-l-lg border border-1 border-gray-300 appearance-none mt-2  md:col-span-2">
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
                        <button type="submit" disabled={isSubmiting} className="mt-2 text-white text-lg rounded-lg md:rounded-none md:rounded-r-lg bg-siteColors-blue"
                            aria-label="Κουμπί εγγραφής">Εγγραφή</button>
                    </div>
                    {formik.touched.email && formik.errors.email && formik.values.email !== "" ?
                        <p className='text-sm text-red-800'>{formik.errors.email}</p>
                        : <p></p>}
                </div>
            </form>
        </section>
    )
}

export default Newsletter;