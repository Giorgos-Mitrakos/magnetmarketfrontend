// (2026-10-24) Τρόποι πληρωμής: φαίνεται το όνομα (έλειπε — έμενε μόνο η περιγραφή),
// το επιπλέον κόστος (π.χ. αντικαταβολή) και όλη η κάρτα πατιέται.
import { useFormikContext, FormikValues } from "formik";
import { useCheckout } from "@/context/checkout";
import Installments from "./installments";
import { IPaymentMethod } from "@/lib/interfaces/shipping";

const euro = (v: number) => `${v.toFixed(2).replace(".", ",")} €`

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
        <fieldset className="space-y-6 mt-8">
            <legend className="w-full border-b border-gray-200 dark:border-slate-600 pb-4 text-lg font-semibold text-siteColors-purple dark:text-white">
                Τρόπος πληρωμής
                {errors.paymentMethod && touched.paymentMethod && (
                    <span className="ml-2 text-sm font-normal text-red-600 dark:text-red-400" role="alert">
                        Επιλέξτε τρόπο πληρωμής
                    </span>
                )}
            </legend>

            <div className="space-y-3">
                {availableMethods.map((method) => {
                    const checked = values.paymentMethodId === method.id
                    const inputId = `payment-${method.id}`
                    const price = Number(method.attributes.price) || 0
                    return (
                        <div
                            key={method.id}
                            className={`rounded-lg border-2 transition-all duration-200 ${
                                checked
                                    ? "border-siteColors-purple bg-purple-50 dark:bg-slate-700"
                                    : "border-gray-200 dark:border-slate-600 bg-white dark:bg-slate-800 hover:border-gray-300"
                            }`}
                        >
                            <label htmlFor={inputId} className="flex cursor-pointer items-start gap-3 p-4">
                                <input
                                    type="radio"
                                    name="payment"
                                    id={inputId}
                                    value={method.id}
                                    checked={checked}
                                    onChange={() => handleSelect(method)}
                                    className="mt-1 h-5 w-5 shrink-0 accent-siteColors-purple"
                                />
                                <span className="flex-1">
                                    <span className="flex flex-wrap items-baseline justify-between gap-2">
                                        <span className="font-medium text-gray-900 dark:text-white">{method.attributes.name}</span>
                                        {price > 0 && (
                                            <span className="text-sm font-semibold text-siteColors-purple dark:text-slate-100">+{euro(price)}</span>
                                        )}
                                    </span>
                                    {method.attributes.description && (
                                        <span className="mt-1 block text-sm text-gray-600 dark:text-gray-300">
                                            {method.attributes.description}
                                        </span>
                                    )}
                                </span>
                            </label>

                            {method.attributes.installments && checked && (
                                <div className="px-4 pb-4 pl-12">
                                    <Installments />
                                </div>
                            )}
                        </div>
                    )
                })}
            </div>
        </fieldset>
    );
};

export default PaymentMethods;
