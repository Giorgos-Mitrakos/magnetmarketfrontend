'use client'

import { GET_PAYMENT_METHODS } from "@/lib/queries/shippingQuery"
import { useQuery } from "@/repositories/clientRepository"
import Radio from "../atoms/radio"
import { forwardRef, useContext, useEffect, useImperativeHandle, useState } from "react"
import { ShippingContext } from "@/context/shipping"
import { useFormik } from "formik"
import * as Yup from 'yup'

export type PaymentMethodsRef = {
    submitForm: () => void;
    isSubmitting: boolean
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
    const { paymentMethod, savePaymentMethod } = useContext(ShippingContext)
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
        const updatePayment = { ...paymentMethod, payment: formik.values.payment }
        savePaymentMethod(updatePayment)
    }, [formik.values.payment])

    return (
        <form className='space-y-4 w-full p-4 bg-slate-50 rounded-lg'
            onSubmit={formik.handleSubmit}>
            <h3 className='font-medium mb-6 border-b text-siteColors-purple'>Τρόποι πληρωμής</h3>
            <ul className="space-y-4">
                {!loadingPaymentMethods && paymentMethods.payments.data.map(method => (
                    <li key={method.id} className="flex items-center text-sm t space-x-2">
                        <Radio name="payment"
                            id={method.attributes.name}
                            value={method.attributes.name}
                            checked={formik.values.payment === method.attributes.name}
                            onChange={formik.handleChange}
                        ></Radio></li>
                ))}
            </ul>
        </form >
    )
})

PaymentMethods.displayName = 'PaymentMethods'

export default PaymentMethods