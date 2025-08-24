import { useFormikContext, FormikValues } from "formik";
import Radio from "../atoms/radio";
import { useCheckout } from "@/context/checkout";
import Installments from "./installments";
import { IPaymentMethod } from "@/lib/interfaces/shipping";

const PaymentMethods = () => {
    const { values, setFieldValue, errors, touched } = useFormikContext<FormikValues>();
    const { checkout, dispatch } = useCheckout();

    const handleSelect = (method: IPaymentMethod) => {
        setFieldValue("paymentMethod", method.attributes.name);
        setFieldValue("paymentMethodId", method.id);
        setFieldValue("installments", 1);
        dispatch({ type: "SAVE_PAYMENT_METHOD", payload: method });
    };

    const availableMethods = checkout.availablePaymentMethods?.data.filter(method => {
        if (!method.attributes.range) return true;
        
        const minPrice = method.attributes.range.minimum !== null ? method.attributes.range.minimum : 0;
        const maxPrice = method.attributes.range.maximum !== null ? method.attributes.range.maximum : Infinity;
        
        return checkout.totals.subtotal >= minPrice && checkout.totals.subtotal <= maxPrice;
    });

    if (!availableMethods || availableMethods.length === 0) return null;

    return (
        <div className="space-y-6 mt-6">
            <div className="border-b border-gray-200 dark:border-slate-600 pb-4">
                <h3 className="text-lg font-semibold text-siteColors-purple dark:text-white">
                    Τρόποι πληρωμής
                    {errors.paymentMethod && touched.paymentMethod && (
                        <span className="ml-2 text-sm font-normal text-red-600 dark:text-red-400">
                            {errors.paymentMethod.toString()}
                        </span>
                    )}
                </h3>
            </div>
            
            <div className="space-y-4">
                {availableMethods.map((method, index) => (
                    <div
                        key={index}
                        className={`p-4 rounded-lg border-2 transition-all duration-200 ${
                            values.paymentMethod === method.attributes.name
                                ? "border-siteColors-purple bg-purple-50 dark:bg-slate-700"
                                : "border-gray-200 dark:border-slate-600 bg-white dark:bg-slate-800 hover:border-gray-300"
                        }`}
                    >
                        <Radio
                            name="payment"
                            id={`payment-${method.id}`}
                            value={method.attributes.name}
                            checked={values.paymentMethod === method.attributes.name}
                            onChange={() => handleSelect(method)}
                            label={method.attributes.name}
                            className="w-full"
                        />
                        
                        {method.attributes.description && (
                            <p className="mt-2 ml-8 text-sm text-gray-600 dark:text-gray-300">
                                {method.attributes.description}
                            </p>
                        )}

                        {method.attributes.installments && values.paymentMethod === method.attributes.name && (
                            <div className="mt-4 ml-8">
                                <Installments />
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default PaymentMethods;