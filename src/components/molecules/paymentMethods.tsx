import React, { useContext } from "react";
import { useFormikContext, FormikValues } from "formik";
import Radio from "../atoms/radio";
import { IPaymentMethod, IPaymentMethods, ShippingContext } from "@/context/shipping";
import Installments from "./installments";

const PaymentMethods = ({ payments }: { payments: IPaymentMethods }) => {
    const { values, setFieldValue, errors, touched } = useFormikContext<FormikValues>();
    const { saveInstallments, savePaymentMethod, gettotalCostWithoutInstallments } = useContext(ShippingContext)

    const handleSelect = (method: IPaymentMethod) => {
        setFieldValue("paymentMethod", method.attributes.name);
        setFieldValue("paymentMethodId", method.id);
        setFieldValue("installments", 1);
        saveInstallments(1)
        savePaymentMethod(method)
    };



    return (
        <div className='space-y-4 mt-4 w-full p-4 bg-slate-50 dark:bg-slate-700 rounded-lg'>
            <h3>Τρόποι πληρωμής {errors.paymentMethod && touched.paymentMethod &&
                <span> <small id="feedback" className="text-sm text-red-500">{errors.paymentMethod.toString()}</small></span>}</h3>
            <ul className="space-y-4">
                {payments.data.filter(x => {
                    if (!x.attributes.range) { return true }
                    if (x.attributes.range) {
                        const minPrice = x.attributes.range.minimum !== null ? x.attributes.range.minimum : 0
                        const maxPrice = x.attributes.range.maximum !== null ? x.attributes.range.maximum : Infinity

                        return gettotalCostWithoutInstallments() >= minPrice && gettotalCostWithoutInstallments() <= maxPrice;
                    }
                }).map((method, index) =>
                    <li
                        key={index}
                        className="flex flex-col items-start text-sm t space-x-2">
                        <Radio name="payment"
                            id={method.attributes.name}
                            value={method.attributes.name}
                            checked={values.paymentMethod === method.attributes.name}
                            onChange={() => handleSelect(method)}
                        ></Radio>
                        {method.attributes.installments && values.paymentMethod === method.attributes.name &&
                            <Installments />}
                    </li>
                )}
            </ul>
        </div>
    );
};

export default PaymentMethods;