import { useFormikContext, FormikValues } from "formik";
import Radio from "../atoms/radio";
import { useCheckout } from "@/context/checkout";
import React from "react";
import { IPaymentMethods, IShippingMethods } from "@/lib/interfaces/shipping";

const ShippingMethods = () => {
    const { values, setFieldValue, errors, touched } = useFormikContext<FormikValues>();
    const { checkout, dispatch } = useCheckout()

    const handleSelect = async (id: number, shipping: string, payments: IPaymentMethods) => {
        setFieldValue("shippingMethod", shipping);
        setFieldValue("shippingMethodId", id);
        setFieldValue("paymentMethod", ""); // Reset payment method selection
        setFieldValue("paymentMethodId", null); // Reset payment method selection
        setFieldValue("installments", 1); // Reset payment method selection

        dispatch({ type: "SAVE_SHIPPING_METHOD", payload: { shippingMethod: { id: id, shipping: shipping }, availablePayments: payments } })
    };

    return (
        <div className='space-y-4 w-full p-4 bg-slate-50 dark:bg-slate-700 rounded-lg'>
            <h3>Τρόποι αποστολής {errors.shippingMethod && touched.shippingMethod &&
                <span> <small id="feedback" className="text-sm text-red-500">{errors.shippingMethod.toString()}</small></span>}</h3>

            <ul className="space-y-4">
                {checkout.availableShippingMethods && checkout.availableShippingMethods.shippings.data.map((method, index) => (
                    <li
                        key={index}
                        className="flex items-center text-sm t space-x-2">
                        <Radio name="shipping"
                            id={method.attributes.name}
                            value={method.attributes.name}
                            checked={values.shippingMethod === method.attributes.name}
                            onChange={() =>
                                handleSelect(method.id, method.attributes.name, method.attributes.payments)
                            }
                        ></Radio>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default ShippingMethods;