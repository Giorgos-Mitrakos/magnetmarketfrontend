import { useFormikContext, FormikValues } from "formik";
import Radio from "../atoms/radio";
import { useCheckout } from "@/context/checkout";
import { IPaymentMethods } from "@/lib/interfaces/shipping";

const ShippingMethods = () => {
    const { values, setFieldValue, errors, touched } = useFormikContext<FormikValues>();
    const { checkout, dispatch } = useCheckout();

    const handleSelect = async (id: number, shipping: string, payments: IPaymentMethods) => {
        setFieldValue("shippingMethod", shipping);
        setFieldValue("shippingMethodId", id);
        setFieldValue("paymentMethod", "");
        setFieldValue("paymentMethodId", null);
        setFieldValue("installments", 1);

        dispatch({ 
            type: "SAVE_SHIPPING_METHOD", 
            payload: { 
                shippingMethod: { id, shipping }, 
                availablePayments: payments 
            } 
        });
    };

    if (!checkout.availableShippingMethods) return null;

    return (
        <div className="space-y-6">
            <div className="border-b border-gray-200 dark:border-slate-600 pb-4">
                <h3 className="text-lg font-semibold text-siteColors-purple dark:text-white">
                    Τρόποι αποστολής
                    {errors.shippingMethod && touched.shippingMethod && (
                        <span className="ml-2 text-sm font-normal text-red-600 dark:text-red-400">
                            {errors.shippingMethod.toString()}
                        </span>
                    )}
                </h3>
            </div>

            <div className="space-y-4">
                {checkout.availableShippingMethods.shippings.data.map((method, index) => (
                    <div
                        key={index}
                        className={`p-4 rounded-lg border-2 transition-all duration-200 ${
                            values.shippingMethod === method.attributes.name
                                ? "border-siteColors-purple bg-purple-50 dark:bg-slate-700"
                                : "border-gray-200 dark:border-slate-600 bg-white dark:bg-slate-800 hover:border-gray-300"
                        }`}
                    >
                        <Radio
                            name="shipping"
                            id={`shipping-${method.id}`}
                            value={method.attributes.name}
                            checked={values.shippingMethod === method.attributes.name}
                            onChange={() => handleSelect(method.id, method.attributes.name, method.attributes.payments)}
                            label={method.attributes.name}
                            className="w-full"
                        />
                    </div>
                ))}
            </div>
        </div>
    );
};

export default ShippingMethods;