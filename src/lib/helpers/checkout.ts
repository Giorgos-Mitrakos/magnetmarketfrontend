import { ICartItem } from "../interfaces/cart"
import { ICheckoutState, IInstallmentsArray, Totals } from "../interfaces/shipping"
import { buildQuotePayload, IQuoteResponse } from "./checkoutPayload"

/**
 * Σύνολα καλαθιού/ταμείου από το Strapi (POST /api/checkout/quote →
 * /api/orders/quote): υποσύνολο, έκπτωση κουπονιού, μεταφορικά, κόστος
 * πληρωμής και τόκος δόσεων υπολογίζονται ΜΟΝΟ στον server — ίδιος κώδικας
 * με τη δημιουργία της παραγγελίας, άρα ό,τι βλέπει ο πελάτης = ό,τι χρεώνεται.
 */
export async function calculateTotals(checkout: ICheckoutState): Promise<Totals> {
    const localSubtotal = getCartTotal(checkout.cart)
    if (!checkout.cart.length) {
        return { subtotal: 0, shipping: 0, payment: 0, discount: 0, interestCost: 0, total: 0, couponError: null, warnings: [] }
    }

    try {
        const response = await fetch('/api/checkout/quote', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(buildQuotePayload(checkout)),
        })
        const json = await response.json()
        if (!response.ok) throw new Error(json?.message || `Response status: ${response.status}`)
        const quote = json as IQuoteResponse

        // Το paymentCost του Strapi περιέχει και τον τόκο των δόσεων — εδώ τα
        // χωρίζουμε για την εμφάνιση («Κόστος πληρωμής» / «Τόκοι δόσεων»)
        const basePayment = checkout.paymentMethod ? Number(checkout.paymentMethod.attributes?.price ?? 0) : 0
        const payment = Math.min(basePayment, quote.paymentCost)
        const interestCost = Math.max(0, Math.round((quote.paymentCost - payment) * 100) / 100)

        return {
            subtotal: quote.subtotal,
            shipping: quote.shippingCost,
            payment,
            discount: quote.discount,
            interestCost,
            total: quote.total,
            couponError: checkout.appliedCoupon ? quote.couponError : null,
            warnings: quote.warnings ?? [],
            islandVat: quote.islandVat ?? null,
            bundleDiscount: quote.bundleDiscount ?? 0,
            bundles: quote.bundles ?? [],
            lines: quote.lines ?? [],
        }
    } catch (error) {
        // Π.χ. ο τρόπος πληρωμής δεν επιτρέπεται για αυτό το ποσό: δείχνουμε
        // τουλάχιστον την αξία των προϊόντων — το ακριβές μήνυμα θα το δει ο
        // πελάτης στην ολοκλήρωση της παραγγελίας
        return {
            subtotal: localSubtotal,
            shipping: 0,
            payment: 0,
            discount: 0,
            interestCost: 0,
            total: localSubtotal,
            couponError: null,
            warnings: [error instanceof Error ? error.message : 'Δεν υπολογίστηκαν τα σύνολα'],
        }
    }
};

export const getInstallmentsArray = (checkout: ICheckoutState, totals: Totals): IInstallmentsArray[] => {
    const installments = checkout.paymentMethod?.attributes?.installments;

    if (!installments) return [];

    const {
        max_installments,
        free_rate_months,
        annual_rate
    } = installments;

    const shippingCost = totals.shipping ?? 0;
    const totalWithoutInstallments =
        totals.subtotal +
        shippingCost +
        totals.payment -
        totals.discount;

    if (totalWithoutInstallments <= 0) return [];

    const installmentsArray: IInstallmentsArray[] = [];

    for (let i = 1; i <= max_installments; i++) {
        let monthlyInstallment: string;
        let totalCost: number;

        if (i <= free_rate_months) {
            monthlyInstallment = (totalWithoutInstallments / i).toFixed(2);
            totalCost = totalWithoutInstallments;
        } else {
            const { monthlyInstallment: calcMonthly, totalCost: calcTotal } = calculateInstallment({
                amount: totalWithoutInstallments,
                annualRate: annual_rate,
                months: i
            });
            monthlyInstallment = calcMonthly;
            totalCost = calcTotal;
        }

        installmentsArray.push({
            monthlyInstallment,
            installments: i,
            totalCost
        });
    }

    return installmentsArray;
};

export function getCartTotal(items: ICartItem[]) {
    const total = items.reduce((sum, item) => {
        let itemPrice = item.is_sale && item.sale_price ? item.sale_price : item.price
        return sum + itemPrice * item.quantity
    }, 0)

    return total
}

export function calculateInstallment({ amount, annualRate, months }: { amount: number, annualRate: number, months: number }) {

    let r = (annualRate / 100) / 12; // Μετατροπή ετήσιου επιτοκίου σε μηνιαίο
    let n = months;

    // Υπολογισμός μηνιαίας δόσης με τον τύπο τοκοχρεολυτικής δόσης
    let M = (amount * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);

    return {
        monthlyInstallment: M.toFixed(2),
        totalCost: (M * n)
    };
}

export const createCategories = (item: ICartItem) => {
    let categories: {
        item_category?: string,
        item_category2?: string,
        item_category3?: string
    } = {}

    if (item.category?.parents[0]?.parents[0]?.name) {
        categories.item_category = item.category?.parents[0]?.parents[0]?.name
        categories.item_category2 = item.category?.parents[0]?.name
        categories.item_category3 = item.category?.name
    }
    else if (item.category?.parents[0]?.name) {
        categories.item_category = item.category?.parents[0]?.name
        categories.item_category2 = item.category?.name
    }
    else if (item.category?.name) {
        categories.item_category = item.category?.name
    }

    return categories
}

export const createOrder = async (checkout: ICheckoutState): Promise<{
    status: string, message: string, orderId: string | null, orderNumber?: string, amount?: number | null, installments?: number, reused?: boolean
}> => {
    if (!checkout.addresses)
        return { message: "Κάποιο πρόβλημα δημιουργήθηκε με τις διευθύνσεις αποστολής-παράδοσης", status: "fail", orderId: null, amount: null }
    if (checkout.cart.length <= 0)
        return { message: "Το καλάθι είναι άδειο", status: "fail", orderId: null, amount: null }
    if (!checkout.shippingMethod?.id)
        return { message: "Δεν έχετε επιλέξει τρόπο αποστολής", status: "fail", orderId: null, amount: null }
    if (!checkout.paymentMethod)
        return { message: "Δεν έχετε επιλέξει τρόπο πληρωμής", status: "fail", orderId: null, amount: null }

    // Η διαθεσιμότητα/ποσότητες ελέγχονται ξανά στο Strapi (με κλείδωμα
    // αποθέματος) — εδώ μόνο ο γρήγορος έλεγχος του καλαθιού
    const isAllProductsAvailable = checkout.cart.every(item => item.isAvailable !== false)
    if (!isAllProductsAvailable) {
        return { status: "fail", message: "Κάποιο-α προϊόντα δεν είναι πλέον διαθέσιμα", orderId: null }
    }

    const response = await fetch(`/api/checkout/createOrder`, {
        method: "POST",
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ checkout }),
    })
    if (!response.ok) {
        throw new Error(`Response status: ${response.status}`);
    }

    const json = await response.json()

    // Νέα προσπάθεια πληρωμής για την ίδια παραγγελία → όχι δεύτερο event
    // (2026-10-25) Η αγορά στέλνεται στο Analytics ΜΟΝΟ από τη σελίδα «Ευχαριστούμε»
    // (PurchaseTracker, με τα στοιχεία της παραγγελίας) — εδώ έφευγε δεύτερη φορά,
    // και για πληρωμές με κάρτα ακόμα κι όταν η πληρωμή δεν ολοκληρωνόταν

    return {
        status: json.status,
        message: json.message,
        orderId: json.orderId ?? null,
        orderNumber: json.orderNumber,
        amount: json.amount ?? null,
        installments: json.installments,
        reused: !!json.reused
    }
}

