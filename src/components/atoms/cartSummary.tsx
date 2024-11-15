"use client"
import { CartContext } from "@/context/cart";
import { ShippingContext } from "@/context/shipping";
import { useContext} from "react";

export default function CartSummary() {
    const { cartItems, cartTotal } = useContext(CartContext)
    const { shippingCost, paymentMethod, paymentCost } = useContext(ShippingContext)

    const calculateTotalCosts = () => {
        
            const productsCost = cartTotal
            const shippingCosts = shippingCost.cost || 0
            const paymentCosts = paymentCost.cost || 0
            return (productsCost + shippingCosts + paymentCosts).toFixed(2)
    }

    return (
        <ul className="p-4 space-y-4 bg-inherit rounded">
            <li className="flex justify-between w-full">
                <label className="font-semibold " aria-label="Μερικό σύνολο">
                    Μερικό σύνολο:
                </label>
                <div className="text-siteColors-purple font-bold"
                    aria-label={`${cartItems && cartTotal} €`}>
                    {cartItems && cartTotal.toFixed(2)} €
                </div>
            </li>
            <li className="flex justify-between w-full">
                <label className="font-semibold" aria-label="Μεταφορικά">
                    Μεταφορικά:
                </label>
                <div className="text-siteColors-purple font-bold"
                    aria-label="Κόστος μεταφορικών">
                    {shippingCost.cost  ? `${shippingCost.cost.toFixed(2)} €` : "Υπολογίζεται κατά τη διάρκεια αγοράς"}
                </div>
            </li>
            {paymentCost.cost !== null && paymentCost.cost > 0 &&
                <li className="flex justify-between w-full">
                    <label className="font-semibold" aria-label={paymentMethod.payment}>
                        {paymentMethod.payment}:
                    </label>
                    <div className="text-siteColors-purple font-bold"
                        aria-label={paymentMethod.payment}>
                        {paymentCost.cost.toFixed(2)} €
                    </div>
                </li>
            }
            {calculateTotalCosts() &&
                <li className="flex justify-between w-full">
                    <label className="font-semibold" aria-label="Σύνολο">
                        Σύνολο:
                    </label>
                    <div className="text-siteColors-purple font-bold"
                        aria-label="Συνολικό κόστος">
                        {calculateTotalCosts()} €
                    </div>
                </li>}
        </ul>
    )
}