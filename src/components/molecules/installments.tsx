// import { FaRegCopyright } from "react-icons/fa6";

import { useCheckout } from "@/context/checkout";
import { FormikValues, useFormikContext } from "formik";

const Installments = () => {
    const { values, setFieldValue, errors, touched } = useFormikContext<FormikValues>();
    const { checkout, dispatch } = useCheckout()

    const handleSelectChange = (value: string) => {
        const installment = JSON.parse(value)
        setFieldValue("installments", installment.installments);
        setFieldValue("totalCost", installment.totalCost);
        dispatch({ type: "SAVE_INSTALLMENTS", payload: installment.installments })
    }

    // const installmentsArray = getInstallmentsArray()
    return (
        <div className="mt-4 px-4">
            <select name="installments" id="installments"
                onChange={(e) => handleSelectChange(e.target.value)}
                className="py-2 px-4 text-base text-slate-800">
                {checkout.installmentsArray && checkout.installmentsArray.length > 0 &&
                    checkout.installmentsArray.map(x => (
                        <option className="dark:bg-slate-200 dark:text-slate-800" key={x.installments} value={JSON.stringify(x)}>
                            {x.installments} Μήνες X {x.monthlyInstallment}€
                        </option>
                    ))}
            </select>
        </div>
    );

}

export default Installments