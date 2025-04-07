"use client"
import { CartContext } from "@/context/cart";
import { ShippingContext } from "@/context/shipping";
import { useContext } from "react";



export default function CartSummary() {
    const { cartItems, cartTotal } = useContext(CartContext)
    const { shippingCost, paymentMethod, paymentCost, totalCost } = useContext(ShippingContext)

    const findInstallmentCost = () => {
        const productsCost = cartTotal
        const shippingCosts = shippingCost.cost || 0
        const paymentCosts = paymentCost.cost || 0

        if (totalCost.cost && totalCost.cost > productsCost + shippingCosts + paymentCosts)
            return (totalCost.cost - productsCost - shippingCosts - paymentCosts)

        return null
    }

    const installCost = findInstallmentCost()

    return (
        <ul className="p-4 space-y-4 bg-inherit dark:bg-slate-700 rounded">
            <li className="flex justify-between w-full">
                <label className="font-semibold " aria-label="Μερικό σύνολο">
                    Μερικό σύνολο:
                </label>
                <div className="text-siteColors-purple dark:text-slate-200 font-bold"
                    aria-label={`${cartItems && cartTotal} €`}>
                    {cartItems && cartTotal.toFixed(2)} €
                </div>
            </li>
            {shippingCost.cost !== null && shippingCost.cost > 0 &&
                <li className="flex justify-between w-full">
                    <label className="font-semibold" aria-label="Μεταφορικά">
                        Μεταφορικά:
                    </label>
                    <div className="text-siteColors-purple text-right dark:text-slate-200 font-bold"
                        aria-label="Κόστος μεταφορικών">
                        {shippingCost.cost !== null ? `${shippingCost.cost.toFixed(2)} €` : "Υπολογίζεται κατά τη διάρκεια αγοράς"}
                    </div>
                </li>}
            {paymentCost.cost !== null && paymentCost.cost > 0 &&
                <li className="flex justify-between w-full">
                    <label className="font-semibold" aria-label={paymentMethod?.attributes.name}>
                        {paymentMethod?.attributes.name}:
                    </label>
                    <div className="text-siteColors-purple dark:text-slate-200 font-bold"
                        aria-label={paymentMethod?.attributes.name}>
                        {paymentCost.cost.toFixed(2)} €
                    </div>
                </li>
            }
            {installCost &&
                <li className="flex justify-between w-full">
                    <label className="font-semibold" aria-label="Σύνολο">
                        Κόστος Δόσεων:
                    </label>
                    <div className="text-siteColors-purple dark:text-slate-200 font-bold"
                        aria-label="Συνολικό κόστος">
                        {installCost.toFixed(2)} €
                    </div>
                </li>}
            {totalCost.cost &&
                <li className="flex justify-between w-full">
                    <label className="font-semibold" aria-label="Σύνολο">
                        Σύνολο:
                    </label>
                    <div className="text-siteColors-purple dark:text-slate-200 font-bold"
                        aria-label="Συνολικό κόστος">
                        {totalCost.cost?.toFixed(2)} €
                    </div>
                </li>}
        </ul>
    )
}