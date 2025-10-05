import { sendGAEvent } from "@next/third-parties/google"
import { ICartItem } from "../interfaces/cart"
import { ICheckoutState, IInstallmentsArray, Totals } from "../interfaces/shipping"

export async function calculateTotals(checkout: ICheckoutState): Promise<Totals> {
    const subtotal = getCartTotal(checkout.cart)
    let shipping = 0;
    if (hasValidBillingAddress(checkout.addresses.billing)) {
        shipping = await getShippingCost(checkout);
    }
    const payment = await getPaymentCost(checkout)

    let discount = 0

    if (checkout.appliedCoupon) {
        const response = await getDiscount(checkout)
        if (response.discountType === "free_shipping") {
            shipping = 0
        }
        else {
            discount = response.discount
        }

    }


    const baseTotal = subtotal + shipping + payment - discount;

    let total = baseTotal;
    if (checkout.paymentMethod?.attributes?.installments
        && checkout.installments > checkout.paymentMethod.attributes.installments.free_rate_months) {
        const installmentCalc = calculateInstallment({
            amount: baseTotal,
            annualRate: checkout.paymentMethod.attributes.installments.annual_rate,
            months: checkout.installments
        })
        total = installmentCalc.totalCost
    }

    const interestCost = total - baseTotal

    return {
        subtotal: subtotal,
        shipping: shipping,
        payment: payment,
        discount: discount,
        interestCost: interestCost,
        total: total
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

async function getShippingCost(checkout: ICheckoutState): Promise<number> {
    if (!checkout.shippingMethod || !checkout.shippingMethod.id) return 0

    const myHeaders = new Headers();

    myHeaders.append('Content-Type', 'application/json')

    const myInit = {
        method: "POST",
        headers: myHeaders,
        body: JSON.stringify({ cart: checkout.cart, addresses: checkout.addresses, shippingMethod: checkout.shippingMethod })
        // mode: "cors",
        // cache: "default",
    };

    const response = await fetch(`/api/checkout/shipping`,
        myInit,
    )
    if (!response.ok) {
        throw new Error(`Response status: ${response.status}`);
    }

    const json = await response.json()

    return json.cost
}

async function getPaymentCost(checkout: ICheckoutState): Promise<number> {
    if (!checkout.paymentMethod || !checkout.paymentMethod.id) return 0
    const myHeaders = new Headers();

    myHeaders.append('Content-Type', 'application/json')

    const myInit = {
        method: "POST",
        headers: myHeaders,
        body: JSON.stringify({ paymentMethod: checkout.paymentMethod })
        // mode: "cors",
        // cache: "default",
    };

    const response = await fetch(`/api/checkout/payment`,
        myInit,
    )
    if (!response.ok) {
        throw new Error(`Response status: ${response.status}`);
    }

    const json = await response.json()

    return json.cost
}

async function getDiscount(checkout: ICheckoutState): Promise<{ discountType: string, discount: number }> {
    const myHeaders = new Headers();

    myHeaders.append('Content-Type', 'application/json')

    const myInit = {
        method: "POST",
        headers: myHeaders,
        body: JSON.stringify({
            code: checkout.appliedCoupon?.code,
            userEmail: checkout.addresses.billing.email,
            cart: checkout.cart,
            cartTotal: checkout.totals.subtotal
        })
        // mode: "cors",
        // cache: "default",
    };

    const response = await fetch(`/api/checkout/discount`,
        myInit,
    )

    if (!response.ok) {
        throw new Error(`Response status: ${response.status}`);
    }

    const json = await response.json()

    return json
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

function hasValidBillingAddress(address: ICheckoutState["addresses"]["billing"]): boolean {
    return (
        address.street.trim() !== '' &&
        address.city.trim() !== '' &&
        address.state.trim() !== '' &&
        address.zipCode.trim() !== '' &&
        address.country.trim() !== ''
    );
}

export const createCategories = (item: ICartItem) => {
    let categories: {
        item_category?: string,
        item_category2?: string,
        item_category3?: string
    } = {}

    if (item.category.parents[0]?.parents[0]?.name) {
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

export const createOrder = async (checkout: ICheckoutState) => {
    if (!checkout.addresses)
        return { message: "Κάποιο πρόβλημα δημιουργήθηκε με τις διευθύνσεις αποστολής-παράδοσης", status: "fail", orderId: null, amount: null }
    if (checkout.cart.length <= 0)
        return { message: "Το καλάθι είναι άδειο", status: "fail", orderId: null, amount: null }
    if (!checkout.shippingMethod)
        return { message: "Δεν έχετε επιλέξει τρόπο αποστολής", status: "fail", orderId: null, amount: null }
    if (!checkout.paymentMethod)
        return { message: "Δεν έχετε επιλέξει τρόπο πληρωμής", status: "fail", orderId: null, amount: null }

    // Ελέγχω αν όλα τα προϊόντα είναι διαθέσιμα
    const isAllProductsAvailable = checkout.cart.every(item => item.isAvailable === true)

    if (isAllProductsAvailable) {
        const myHeaders = new Headers();
        myHeaders.append('Content-Type', 'application/json')
        myHeaders.append("authorization", `Bearer ${process.env.ADMIN_JWT_SECRET}`)

        const myInit = {
            method: "POST",
            headers: myHeaders,
            body: JSON.stringify({ checkout: checkout })
            // mode: "cors",
            // cache: "default",
        };


        const response = await fetch(`/api/checkout/createOrder`,
            myInit,
        )
        if (!response.ok) {
            throw new Error(`Response status: ${response.status}`);
        }

        const json = await response.json()

        sendPurchaseEvent(json.orderId, checkout)

        return {
            status: json.status,
            message: json.message,
            orderId: json.orderId,
            amount: json.amount,
            installments: json.installments
        }
    }
    else {
        return {
            status: "fail",
            message: "Κάποιο-α προϊόντα δεν είναι πλέον διαθέσιμα",
            orderId: null
        }
    }

}

const sendPurchaseEvent = (orderId: number, checkout: ICheckoutState) => {
    let items: any = []
    checkout?.cart.forEach((item) => {

        let itemPrice = item.is_sale && item.sale_price ? item.sale_price : item.price

        const discount = item.is_sale && item.sale_price ? (item.price - item.sale_price).toFixed(2) : 0

        const categories = createCategories(item)

        items.push({
            item_id: item.id,
            item_name: item.name,
            item_brand: item.brand,
            discount: discount,
            item_category: categories.item_category,
            item_category2: categories.item_category2,
            item_category3: categories.item_category3,
            price: itemPrice,
            quantity: item.quantity
        })
    })
    let eventValue = {
        value: {
            currency: "EUR",
            value: checkout?.totals.subtotal,
            transaction_id: orderId,
            shipping: checkout.totals.shipping,
            items: items
        }
    }

    sendGAEvent('event', 'purchase', {
        eventValue
    })
};

