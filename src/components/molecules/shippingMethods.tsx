'use client'

import { GET_SHIPPING_METHODS } from "@/lib/queries/shippingQuery"
import { useQuery } from "@/repositories/clientRepository"
import Radio from "../atoms/radio"
import { forwardRef, useContext, useEffect, useImperativeHandle, useState } from "react"
import { ShippingContext } from "@/context/shipping"
import { useFormik } from "formik"
import * as Yup from 'yup'

export type ShippingMethodsRef = {
    submitForm: () => void;
    isSubmitting: boolean
};

interface IShippingMethods {
    shippings: {
        data: {
            id: number | string
            attributes: {
                name: string
            }
        }[]
    }
}

const ShippingMethods = forwardRef<ShippingMethodsRef>((props, ref) => {
    const { saveShippingMethod, shippingMethod } = useContext(ShippingContext)
    const { data: shippingMethodsData, loading: loadingShippingMethods, error: errorSippingMethods } = useQuery({ query: GET_SHIPPING_METHODS, jwt: '' })

    const shippingMethods = shippingMethodsData as IShippingMethods

    const loadInitialValues = () => {
        const savedValues = typeof window !== 'undefined' && localStorage.getItem('shippingMethod');
        return savedValues ? JSON.parse(savedValues) : { pickup: false, shipping: '' };
    }

    const formik = useFormik({
        initialValues: loadInitialValues(),
        validationSchema: Yup.object({
            pickup: Yup.boolean(),
            shipping: Yup.string().when("pickup", {
                is: false,
                then: (schema) => schema.required()
            }),
        }),
        onSubmit: values => {
            saveShippingMethod({ shipping: formik.values.shipping, pickup: formik.values.pickup })
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

    useEffect(() => {
        const updateShipping = { ...shippingMethod, pickup: formik.values.pickup }
        saveShippingMethod(updateShipping)
    }, [formik.values.pickup])

    useEffect(() => {
        const updateShipping = { ...shippingMethod, shipping: formik.values.shipping }
        saveShippingMethod(updateShipping)
    }, [formik.values.shipping])

    return (
        <form className='space-y-4 w-full p-4 bg-slate-50 rounded-lg'
            onSubmit={formik.handleSubmit}>
            <h3 className='font-medium mb-6 border-b text-siteColors-purple'>Τρόποι αποστολής</h3>
            <ul className="space-y-4">
                <li className="flex items-center space-x-2">
                    <input type="checkbox" name="pickup" id="pickup" className="bg-siteColors-purple rounded"
                        checked={shippingMethod.pickup} onChange={formik.handleChange} />
                    <label htmlFor="pickup" className="text-sm tracking-wide">Παραλαβή από το κατάστημα</label>
                </li>
                {!loadingShippingMethods && !shippingMethod.pickup && shippingMethods.shippings.data.map(method => (
                    <li key={method.id} className="flex items-center text-sm t space-x-2">
                        <Radio
                            name="shipping"
                            value={method.attributes.name}
                            id={method.attributes.name}
                            checked={formik.values.shipping === method.attributes.name}
                            onChange={formik.handleChange}
                        ></Radio></li>
                ))}
            </ul>
        </form>
    )
})

ShippingMethods.displayName='ShippingMethods'

export default ShippingMethods