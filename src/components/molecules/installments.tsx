// import { FaRegCopyright } from "react-icons/fa6";

import { ShippingContext } from "@/context/shipping";
import { FormikValues, useFormikContext } from "formik";
import { useContext } from "react";

const Installments = () => {
    const { values, setFieldValue, errors, touched } = useFormikContext<FormikValues>();
    const { saveInstallments, getInstallmentsArray } = useContext(ShippingContext)

    const handleSelectChange = (value: string) => {
        const installment = JSON.parse(value)
        setFieldValue("installments", installment.installments);
        setFieldValue("totalCost", installment.totalCost);
        saveInstallments(installment.installments)

    }

    const installmentsArray = getInstallmentsArray()
    return (
        <div className="p-4">
            <select name="installments" id="installments"
                onChange={(e) => handleSelectChange(e.target.value)}
                className="py-2 px-4 text-base">
                {installmentsArray && installmentsArray.length > 0 &&
                    installmentsArray.map(x => (
                        <option key={x.installments} value={JSON.stringify(x)}>
                            {x.installments} Μήνες X {x.mothlyInstallment}€
                        </option>
                    ))}
            </select>
        </div>
    );

}

export default Installments