import React, { useContext } from "react";
import { useFormikContext, FormikValues } from "formik";
import Radio from "../atoms/radio";
import { IPaymentMethods, IShippingMethods, ShippingContext } from "@/context/shipping";

interface ShippingMethodsProps {
    methods: IShippingMethods
    onShippingChange: (payments: IPaymentMethods) => void;
}

const ShippingMethods: React.FC<ShippingMethodsProps> = ({ methods, onShippingChange }) => {
    const { values, setFieldValue, errors, touched } = useFormikContext<FormikValues>();
    const { shippingCost, paymentMethod, saveShippingMethod } = useContext(ShippingContext)

    const handleSelect = (id: number, shipping: string, payments: IPaymentMethods) => {
        setFieldValue("shippingMethod", shipping);
        setFieldValue("shippingMethodId", id);
        saveShippingMethod({ id: id, shipping: shipping })
        onShippingChange(payments); // Update payment methods dynamically
    };

    return (
        <div className='space-y-4 w-full p-4 bg-slate-50 dark:bg-slate-700 rounded-lg'>
            <h3>Τρόποι αποστολής {errors.shippingMethod && touched.shippingMethod &&
                <span> <small id="feedback" className="text-sm text-red-500">{errors.shippingMethod.toString()}</small></span>}</h3>

            <ul className="space-y-4">
                {methods.shippings.data.map((method, index) => (
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