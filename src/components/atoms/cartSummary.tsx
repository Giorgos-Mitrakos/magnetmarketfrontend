"use client"
// import { useCart } from "@/context/cart";
import { useCheckout } from "@/context/checkout";



export default function CartSummary() {
    const { checkout, dispatch } = useCheckout()

    const findInstallmentCost = () => {
        const productsCost = checkout.totals.subtotal
        const shippingCosts = checkout.totals.shipping
        const paymentCosts = checkout.totals.payment

        // if (cart && cart.total && cart.total > productsCost + shippingCosts + paymentCosts)
        //     return (cart.total - productsCost - shippingCosts - paymentCosts)

        return 0
    }

    const installCost = findInstallmentCost()

    return (
        <ul className="p-4 space-y-4 bg-inherit dark:bg-slate-700 rounded">
            <li className="flex justify-between w-full">
                <label className="font-semibold " aria-label="Μερικό σύνολο">
                    Μερικό σύνολο:
                </label>
                <div className="text-siteColors-purple dark:text-slate-200 font-bold"
                    aria-label={`${checkout.totals.subtotal} €`}>
                    {checkout.totals.subtotal.toFixed(2)} €
                </div>
            </li>

            {checkout.totals.shipping !== 0 && <li className="flex justify-between w-full">
                <label className="font-semibold" aria-label="Μεταφορικά">
                    Μεταφορικά:
                </label>
                <div className="text-siteColors-purple text-right dark:text-slate-200 font-bold"
                    aria-label="Κόστος μεταφορικών">
                    {checkout.totals.shipping !== null ? `${checkout.totals.shipping.toFixed(2)} €` : "Υπολογίζεται κατά τη διάρκεια αγοράς"}
                </div>
            </li>}
            {checkout.paymentMethod && checkout.totals.payment > 0 &&
                <li className="flex justify-between w-full">
                    <label className="font-semibold" aria-label={checkout.paymentMethod?.attributes.name}>
                        {checkout.paymentMethod?.attributes.name}:
                    </label>
                    <div className="text-siteColors-purple dark:text-slate-200 font-bold"
                        aria-label={`${checkout.totals.payment.toFixed(2)} €`}>
                        {checkout.totals.payment.toFixed(2)} €
                    </div>
                </li>
            }
            {checkout.totals.interestCost > 0 &&
                <li className="flex justify-between w-full">
                    <label className="font-semibold" aria-label="Επιβαρύνσεις">
                        Επιβαρύνσεις Τόκων:
                    </label>
                    <div className="text-siteColors-purple dark:text-slate-200 font-bold"
                        aria-label={`${checkout.totals.payment.toFixed(2)} €`}>
                        {checkout.totals.interestCost.toFixed(2)} €
                    </div>
                </li>
            }
            {checkout.totals.discount > 0 &&
                <li className="flex justify-between w-full">
                    <label className="font-semibold" aria-label="Έκπτωση">
                        Έκπτωση:
                    </label>
                    <div className="text-siteColors-purple dark:text-slate-200 font-bold"
                        aria-label={`${checkout.totals.payment.toFixed(2)} €`}>
                        - {checkout.totals.discount.toFixed(2)} €
                    </div>
                </li>
            }
            {/* {installCost &&
                <li className="flex justify-between w-full">
                    <label className="font-semibold" aria-label="Σύνολο">
                        Κόστος Δόσεων:
                    </label>
                    <div className="text-siteColors-purple dark:text-slate-200 font-bold"
                        aria-label="Συνολικό κόστος">
                        {installCost.toFixed(2)} €
                    </div>
                </li>} */}
            {/* {checkout.totals.total && */}
            <li className="flex justify-between w-full">
                <label className="font-semibold" aria-label="Σύνολο">
                    Σύνολο:
                </label>
                <div className="text-siteColors-purple dark:text-slate-200 font-bold"
                    aria-label="Συνολικό κόστος">
                    {checkout.totals.total?.toFixed(2)} €
                </div>
            </li>
            {/* } */}
        </ul>
    )
}