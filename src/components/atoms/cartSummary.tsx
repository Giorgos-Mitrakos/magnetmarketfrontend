import { CartContext } from "@/context/cart";
import { useContext } from "react";
import { FaPercent } from "react-icons/fa";

export default function CartSummary() {
    const { cartItems, getCartTotal } = useContext(CartContext)

    const subtotal = getCartTotal()
    return (
        <div className="flex justify-between w-full sm:w-1/2 lg:w-full bg-slate-200 p-4 rounded">
            <label aria-label="Μερικό σύνολο">
                Μερικό σύνολο:
            </label>
            <div className="text-siteColors-purple font-semibold"
                aria-label={`${cartItems && getCartTotal().toFixed(2)} €`}>
                {cartItems && getCartTotal().toFixed(2)} €
            </div>
        </div>
    )
}