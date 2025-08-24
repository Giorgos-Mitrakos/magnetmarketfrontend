import { useCheckout } from "@/context/checkout";
import { FormikValues, useFormikContext } from "formik";

const Installments = () => {
    const { values, setFieldValue } = useFormikContext<FormikValues>();
    const { checkout, dispatch } = useCheckout();

    const handleSelectChange = (value: string) => {
        const installment = JSON.parse(value);
        setFieldValue("installments", installment.installments);
        setFieldValue("totalCost", installment.totalCost);
        dispatch({ type: "SAVE_INSTALLMENTS", payload: installment.installments });
    };

    if (!checkout.installmentsArray || checkout.installmentsArray.length === 0) {
        return null;
    }

    // Βοηθητική συνάρτηση για μετατροπή string σε number
    const parseNumber = (value: string | number): number => {
        if (typeof value === 'number') return value;
        return parseFloat(value) || 0;
    };

    const selectedInstallment = checkout.installmentsArray.find(x =>
        x.installments === values.installments
    );

    return (
        <div className="mt-4">
            <label htmlFor="installments" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Επιλογή Δόσεων
            </label>

            <div className="relative inline-block">
                <select
                    name="installments"
                    id="installments"
                    value={JSON.stringify(checkout.installmentsArray.find(x =>
                        x.installments === values.installments
                    ))}
                    onChange={(e) => handleSelectChange(e.target.value)}
                    className="w-full py-2.5 px-3 pr-8 border border-gray-300 dark:border-slate-600 rounded-md 
                             bg-white dark:bg-slate-800 text-gray-900 dark:text-white text-sm
                             focus:outline-none focus:ring-2 focus:ring-siteColors-purple focus:border-transparent
                             appearance-none cursor-pointer transition-colors duration-200"
                >
                    {checkout.installmentsArray.map(x => (
                        <option key={x.installments} value={JSON.stringify(x)}>
                            {x.installments === 1 ? 'Αμεση πληρωμή' : `${x.installments} Δόσεις x ${parseNumber(x.monthlyInstallment).toFixed(2)}€`}
                        </option>
                    ))}
                </select>

                {/* Custom dropdown arrow - Σταθερή θέση */}
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700 dark:text-gray-300">
                    <svg className="h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                </div>
            </div>

            {values.installments > 1 && selectedInstallment && (
                <div className="ml-2 p-2 bg-blue-50 dark:bg-blue-900/20 rounded-md inline-block align-middle">
                    <p className="text-xs text-blue-800 dark:text-blue-200">
                        <strong>Σύνολο:</strong> {parseNumber(selectedInstallment.totalCost).toFixed(2)}€
                    </p>
                    <p className="text-xs text-blue-600 dark:text-blue-300 mt-0.5">
                        {values.installments} δόσεις x {parseNumber(selectedInstallment.monthlyInstallment).toFixed(2)}€
                    </p>
                </div>
            )}
        </div>
    );
};

export default Installments;