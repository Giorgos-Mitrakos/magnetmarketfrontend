import { FaPercent } from "react-icons/fa";

export default function ApplyCoupon() {
    return (
        <div className="relative w-full bg-sky-400 p-4 rounded">
            <label htmlFor="coupon" className="flex items-center mb-2 font-semibold"
                aria-label="Εκπτωτικός κωδικός">
                <FaPercent className="mr-2 text-red-500" />
                Εκπτωτικός κωδικός
            </label>
            <input type="text" placeholder="Κωδικός" name="coupon" id="coupon"
                className="w-full p-2 rounded-sm"
                aria-label="Πρόσθεσε τον εκπτωτικό κωδικό" />
            <button className="absolute bottom-5 right-5
            bg-teal-300 hover:bg-teal-400 p-1 rounded"
                aria-label="Κουμπί εφαρμογήςεκπτωτικού κωδικού">Εφαρμογή</button>
        </div>
    )
}