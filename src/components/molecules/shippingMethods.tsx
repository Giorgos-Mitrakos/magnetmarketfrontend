// (2026-10-24) Τρόποι αποστολής με το κόστος τους για αυτό το καλάθι / τη διεύθυνση
// (από το Strapi), «Δωρεάν από Χ €», τρόποι που δεν εξυπηρετούν τη διεύθυνση απενεργοποιημένοι,
// όλη η κάρτα πατιέται, αυτόματη επιλογή όταν υπάρχει μόνο ένας τρόπος.
import { useEffect, useMemo } from "react";
import useSWR from "swr";
import { useFormikContext, FormikValues } from "formik";
import { useCheckout } from "@/context/checkout";
import { IPaymentMethods } from "@/lib/interfaces/shipping";
import { buildQuotePayload } from "@/lib/helpers/checkoutPayload";

interface ShippingOption {
    id: string
    name: string
    cost: number | null
    available: boolean
    note: string | null
    freeShippingOver: number | null
    missingForFree: number | null
}

const euro = (v: number) => `${v.toFixed(2).replace(".", ",")} €`

const fetcher = async ([url, body]: [string, string]) => {
    const res = await fetch(url, { method: "POST", headers: { "Content-Type": "application/json" }, body })
    if (!res.ok) throw new Error(`Response status: ${res.status}`)
    return res.json() as Promise<{ options: ShippingOption[] }>
}

const ShippingMethods = () => {
    const { values, setFieldValue, errors, touched } = useFormikContext<FormikValues>();
    const { checkout, dispatch } = useCheckout();

    // Κόστος ανά τρόπο: ίδιο καλάθι / διεύθυνση / κουπόνι, χωρίς επιλεγμένη αποστολή / πληρωμή
    const body = useMemo(() => {
        if (!checkout.cart.length) return null
        const payload = buildQuotePayload({ ...checkout, shippingMethod: null, paymentMethod: null })
        return JSON.stringify(payload)
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [checkout.cart, checkout.addresses, checkout.appliedCoupon, checkout.islandVatDeclared])
    const { data, isLoading } = useSWR(body ? ["/api/storefront/shipping-options", body] : null, fetcher, {
        keepPreviousData: true,
        revalidateOnFocus: false,
    })
    const optionById = new Map((data?.options ?? []).map((o) => [o.id, o]))

    // id = documentId της μεθόδου αποστολής (Strapi v3)
    const handleSelect = (id: string, shipping: string, payments: IPaymentMethods) => {
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

    const methods = checkout.availableShippingMethods?.shippings?.data ?? []

    // Μόνο ένας διαθέσιμος τρόπος → επιλέγεται μόνος του
    const selectable = methods.filter((m) => optionById.get(m.id)?.available !== false)
    useEffect(() => {
        if (!data || values.shippingMethodId || selectable.length !== 1) return
        const m = selectable[0]
        handleSelect(m.id, m.attributes.name, m.attributes.payments)
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [data, selectable.length, values.shippingMethodId])

    if (!methods.length) return null;

    return (
        <fieldset className="space-y-6">
            <legend className="w-full border-b border-gray-200 dark:border-slate-600 pb-4 text-lg font-semibold text-siteColors-purple dark:text-white">
                Τρόπος αποστολής
                {errors.shippingMethod && touched.shippingMethod && (
                    <span className="ml-2 text-sm font-normal text-red-600 dark:text-red-400" role="alert">
                        Επιλέξτε τρόπο αποστολής
                    </span>
                )}
            </legend>

            <div className="space-y-3">
                {methods.map((method) => {
                    const opt = optionById.get(method.id)
                    const disabled = opt?.available === false
                    const checked = values.shippingMethodId === method.id
                    const inputId = `shipping-${method.id}`
                    return (
                        <label
                            key={method.id}
                            htmlFor={inputId}
                            className={`flex items-start gap-3 p-4 rounded-lg border-2 transition-all duration-200 ${
                                disabled
                                    ? "cursor-not-allowed border-gray-200 bg-gray-50 opacity-60 dark:border-slate-700 dark:bg-slate-800"
                                    : checked
                                        ? "cursor-pointer border-siteColors-purple bg-purple-50 dark:bg-slate-700"
                                        : "cursor-pointer border-gray-200 dark:border-slate-600 bg-white dark:bg-slate-800 hover:border-gray-300"
                            }`}
                        >
                            <input
                                type="radio"
                                name="shipping"
                                id={inputId}
                                value={method.id}
                                checked={checked}
                                disabled={disabled}
                                onChange={() => handleSelect(method.id, method.attributes.name, method.attributes.payments)}
                                className="mt-1 h-5 w-5 shrink-0 accent-siteColors-purple"
                            />
                            <span className="flex-1">
                                <span className="flex flex-wrap items-baseline justify-between gap-2">
                                    <span className="font-medium text-gray-900 dark:text-white">{method.attributes.name}</span>
                                    <span className="font-semibold text-siteColors-purple dark:text-slate-100">
                                        {opt?.cost == null
                                            ? isLoading ? "…" : ""
                                            : opt.cost === 0 ? <span className="text-green-600 dark:text-green-400">Δωρεάν</span> : euro(opt.cost)}
                                    </span>
                                </span>
                                {disabled && opt?.note && (
                                    <span className="mt-1 block text-sm text-red-600 dark:text-red-400">{opt.note}</span>
                                )}
                                {!disabled && opt?.missingForFree != null && opt.missingForFree > 0 && opt.freeShippingOver != null && (
                                    <span className="mt-1 block text-sm text-slate-600 dark:text-slate-300">
                                        Δωρεάν από {euro(opt.freeShippingOver)} — λείπουν {euro(opt.missingForFree)}
                                    </span>
                                )}
                            </span>
                        </label>
                    )
                })}
            </div>
        </fieldset>
    );
};

export default ShippingMethods;
