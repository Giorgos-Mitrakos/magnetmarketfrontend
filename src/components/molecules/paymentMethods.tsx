'use client'

import { GET_PAYMENT_METHODS } from "@/lib/queries/shippingQuery"
import { useQuery } from "@/repositories/clientRepository"
import Radio from "../atoms/radio"
import { forwardRef, useContext, useEffect, useImperativeHandle } from "react"
import { ShippingContext } from "@/context/shipping"
import { useFormik } from "formik"
import * as Yup from 'yup'
import Banks from "../atoms/banks"
import { CartContext } from "@/context/cart"

export type PaymentMethodsRef = {
    submitForm: () => void;
    isSubmitting: boolean,
};

interface IPaymentMethods {
    payments: {
        data: {
            id: number | string
            attributes: {
                name: string
                price: number
                icon: {
                    data: {
                        attributes: {
                            name: string
                            alternativeText: string
                        }
                    }
                }
                range: {
                    minimum: number
                    maximum: number
                }
            }
        }[]
    }
}

const PaymentMethods = forwardRef<PaymentMethodsRef>((props, ref) => {
    const { paymentMethod, savePaymentMethod, shippingMethod } = useContext(ShippingContext)
    const { cartTotal } = useContext(CartContext)
    const { data: paymentMethodsData, loading: loadingPaymentMethods, error: errorPaymentMethods } = useQuery({ query: GET_PAYMENT_METHODS, jwt: '' })

    const paymentMethods = paymentMethodsData as IPaymentMethods

    const loadInitialValues = () => {
        const savedValues = typeof window !== 'undefined' && localStorage.getItem('paymentMethod');
        return savedValues ? JSON.parse(savedValues) : { payment: '' };
    }

    const formik = useFormik({
        initialValues: loadInitialValues(),
        validationSchema: Yup.object({
            payment: Yup.string().required()
        }),
        onSubmit: values => {
            savePaymentMethod({ payment: formik.values.payment })
        },
    });

    useImperativeHandle(ref, () => ({
        submitForm: () => {
            formik.submitForm()
        },
        resetForm: () => {
            formik.resetForm();
        },
        isSubmitting: formik.isSubmitting

    }));

    // const onRadioPaymentChange = (e: React.ChangeEvent<HTMLInputElement> | undefined) => {
    //     if (e) {
    //         savePaymentMethod({ name: formik.values.payment })
    //     }

    // }

    useEffect(() => {
        if (shippingMethod.pickup && paymentMethod.payment === "Αντικαταβολή") {
            formik.setFieldValue("payment", "")
        }

    }, [shippingMethod.pickup])

    useEffect(() => {
        const updatePayment = { ...paymentMethod, payment: formik.values.payment }
        savePaymentMethod(updatePayment)
    }, [formik.values.payment])

    return (
        <form className='space-y-4 w-full p-4 bg-slate-50 dark:bg-slate-700 rounded-lg'
            onSubmit={formik.handleSubmit}>
            <h3 className='font-medium mb-6 border-b text-siteColors-purple dark:text-slate-200'>Τρόποι πληρωμής</h3>
            <ul className="space-y-4">
                {!loadingPaymentMethods && paymentMethods.payments.data.filter(method => {
                    if (shippingMethod.pickup && method.attributes.name === "Αντικαταβολή") {
                        return false
                    }
                    if (!shippingMethod.pickup && method.attributes.name === "Μετρητά") {
                        return false
                    }
                    if (shippingMethod.shipping==="Μεταφορική" && method.attributes.name === "Αντικαταβολή") {
                        return false
                    }
                    if (method.attributes.range && method.attributes.range.maximum < cartTotal)
                        return false

                    return true
                }).map(method => (
                    <li key={method.id} className="flex items-center text-sm t space-x-2">
                        <div className="flex flex-col">
                            <Radio name="payment"
                                id={method.attributes.name}
                                value={method.attributes.name}
                                checked={formik.values.payment === method.attributes.name}
                                onChange={formik.handleChange}
                            ></Radio>
                            {method.attributes.name === "Τραπεζική κατάθεση" &&
                                formik.values.payment === method.attributes.name &&
                                <Banks />}
                        </div>
                    </li>
                ))}
            </ul>
        </form >
    )
})

PaymentMethods.displayName = 'PaymentMethods'

export default PaymentMethods