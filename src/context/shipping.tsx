'use client'
import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { CartContext, createCategories, ICartItem } from "./cart";
import { sendGAEvent } from "@next/third-parties/google";
import { getCookies, saveCookies } from "@/lib/helpers/actions";

interface IAddresses {
    different_shipping: boolean,
    deliveryNotes: string,
    billing: {
        isInvoice: boolean,
        email: string,
        firstname: string,
        lastname: string,
        street: string,
        city: string,
        state: string,
        zipCode: string,
        country: string,
        telephone: string,
        mobilePhone: string,
        afm: string,
        doy: string,
        companyName: string,
        businessActivity: string,

    },
    shipping: {
        firstname: string,
        lastname: string,
        street: string,
        city: string,
        state: string,
        zipCode: string,
        country: string,
        telephone: string,
        mobilePhone: string,
    }
}

export interface IShippingMethods {
    shippings: {
        data: {
            id: number
            attributes: {
                name: string
                payments: IPaymentMethods
            }
        }[]
    }
}

export interface IPaymentMethod {
    id: number
    attributes: {
        name: string
        price: number
        range: {
            minimum: number
            maximum: number
        }
        isActive: boolean
        installments: {
            max_installments: number
            free_rate_months: number
            annual_rate: number
        }
    }
}

export interface IPaymentMethods {
    data: IPaymentMethod[]
}

interface IShippingMethod {
    id: number | null,
    shipping: string | null
}

interface IShippingCost {
    cost: number | null
}

interface IPaymentCost {
    cost: number | null
}

interface ITotalCost {
    cost: number | null
}

interface IShippingContext {
    cartItems: ICartItem[],
    addresses: IAddresses,
    shippingMethod: IShippingMethod,
    shippingCost: IShippingCost,
    availablePayments: IPaymentMethods | undefined,
    paymentCost: IPaymentCost,
    paymentMethod: IPaymentMethod | null,
    saveInstallments: (installmets: number) => void
    totalCost: ITotalCost
    gettotalCostWithoutInstallments: () => number,
    getInstallmentsArray: () => { mothlyInstallment: string, installments: number, totalCost: number }[] | null,
    saveTotalCost: (total: number | null) => void,
    saveAvailablePayments: (availablePayments: IPaymentMethods) => void,
    saveAddresses: (address: IAddresses) => void,
    saveShippingMethod: (id: IShippingMethod) => void,
    savePaymentMethod: (payment: IPaymentMethod | null) => void,
    createOrder: () => Promise<{ status: string, message: string, orderId: number | null, amount?: number | null, installments?: number | null }>

}

interface IInstallmentsArray {
    mothlyInstallment: string,
    installments: number,
    totalCost: number
}

export const ShippingContext = createContext<IShippingContext>({
    cartItems: [],
    addresses: {
        different_shipping: false,
        deliveryNotes: '',
        billing: {
            isInvoice: false,
            email: "",
            firstname: "",
            lastname: "",
            street: "",
            city: "",
            state: "",
            zipCode: "",
            country: "Ελλάδα",
            telephone: "",
            mobilePhone: "",
            afm: "",
            doy: "",
            companyName: "",
            businessActivity: "",

        },
        shipping: {
            firstname: "",
            lastname: "",
            street: "",
            city: "",
            state: "",
            zipCode: "",
            country: "Ελλάδα",
            telephone: "",
            mobilePhone: "",
        }
    },
    shippingMethod: { id: null, shipping: null },
    paymentCost: { cost: null },
    availablePayments: undefined,
    paymentMethod: null,
    shippingCost: { cost: null },
    saveInstallments: () => { },
    totalCost: { cost: null },
    saveTotalCost: () => { },
    saveAddresses: () => { },
    gettotalCostWithoutInstallments: () => 0,
    getInstallmentsArray: () => null,
    saveAvailablePayments: () => { },
    saveShippingMethod: () => { },
    savePaymentMethod: () => { },
    createOrder: async () => { return { message: "", status: "", orderId: null, amount: null, installments: 1 } }
})

export const ShippingProvider = ({ children }: any) => {

    const { cartItems, cartTotal } = useContext(CartContext)
    const [addresses, setAddresses] = useState<IAddresses>({
        different_shipping: false,
        deliveryNotes: "",
        billing: {
            isInvoice: false,
            email: "",
            firstname: "",
            lastname: "",
            street: "",
            city: "",
            state: "",
            zipCode: "",
            country: "Ελλάδα",
            telephone: "",
            mobilePhone: "",
            afm: "",
            doy: "",
            companyName: "",
            businessActivity: "",

        },
        shipping: {
            firstname: "",
            lastname: "",
            street: "",
            city: "",
            state: "",
            zipCode: "",
            country: "Ελλάδα",
            telephone: "",
            mobilePhone: "",
        }
    })
    const [shippingMethod, setShippingMethod] = useState<IShippingMethod>({
        id: null,
        shipping: null,
    })
    const [shippingCost, setShippingCost] = useState<IShippingCost>({ cost: null })

    const [availablePayments, setAvailablePayments] = useState<IPaymentMethods>();

    const [paymentCost, setPaymentCost] = useState<IPaymentCost>({ cost: null })

    const [installments, setInstallments] = useState<number>(1)

    const [paymentMethod, setPaymentMethod] = useState<IPaymentMethod | null>(null)

    const [totalCost, setTotalCost] = useState<ITotalCost>({ cost: null })

    function calculateInstallment({ amount, annualRate, months }: { amount: number, annualRate: number, months: number }) {
        let r = (annualRate / 100) / 12; // Μετατροπή ετήσιου επιτοκίου σε μηνιαίο
        let n = months;

        // Υπολογισμός μηνιαίας δόσης με τον τύπο τοκοχρεολυτικής δόσης
        let M = (amount * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);

        return {
            monthlyInstallment: M.toFixed(2),
            totalCost: (M * n)
        };
    }

    const gettotalCostWithoutInstallments: () => number = useMemo(() => {
        const productsCost = cartTotal
        const shippingCosts = shippingCost.cost || 0
        const paymentCosts = paymentCost.cost || 0
        return () => productsCost + shippingCosts + paymentCosts;
    }, [cartTotal, shippingCost, paymentCost]);

    useEffect(() => {
        const getShipPaymentcookies = async () => {
            const methods = await getCookies({ name: '_mmspm' })

            const methodsJson = methods ? JSON.parse(methods?.value) : null

            if (methodsJson && methodsJson.shippingMethod) {
                setShippingMethod({ id: methodsJson.shippingMethodId, shipping: methodsJson.shippingMethod })
                if (methodsJson.paymentMethod) {
                    const myHeaders = new Headers();

                    myHeaders.append('Content-Type', 'application/json')

                    const myInit = {
                        method: "POST",
                        headers: myHeaders,
                        body: JSON.stringify({ paymentMethod: { id: methodsJson.paymentMethodId } })
                        // mode: "cors",
                        // cache: "default",
                    };


                    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/shipping/findPaymentMethod`,
                        myInit,
                    )
                    if (!response.ok) {
                        throw new Error(`Response status: ${response.status}`);
                    }

                    const json = await response.json()

                    setPaymentMethod({
                        id: await json.id,
                        attributes: {
                            name: await json.name,
                            price: await json.price,
                            isActive: await json.isActive,
                            installments: await json.installments,
                            range: await json.range
                        }
                    })
                    setPaymentCost({ cost: await json.price })
                }
                if (methodsJson.installments) {
                    setInstallments(methodsJson.installments)
                }
            }
        }

        getShipPaymentcookies()

        const address = localStorage.getItem("addresses");
        if (address) {
            const parsedAddress = JSON.parse(address)
            setAddresses(parsedAddress)
        }
    }, [])

    useEffect(() => {
        if (paymentMethod && paymentMethod.attributes && paymentMethod.attributes.installments && installments > paymentMethod?.attributes.installments.free_rate_months) {
            const installmentCalc = calculateInstallment({ amount: gettotalCostWithoutInstallments(), annualRate: paymentMethod.attributes.installments.annual_rate, months: installments })
            setTotalCost({ cost: installmentCalc.totalCost })
        }
        else {
            setTotalCost({ cost: gettotalCostWithoutInstallments() })
        }

    }, [availablePayments, installments, cartTotal, shippingCost, paymentCost])

    const getInstallmentsArray: () => IInstallmentsArray[] | null = useMemo(() => {

        if (paymentMethod && paymentMethod.attributes && paymentMethod.attributes.installments) {
            const installmentsArray: { mothlyInstallment: string, installments: number, totalCost: number }[] = []
            for (let i = 1; i < paymentMethod.attributes.installments.max_installments + 1; i++) {
                if (gettotalCostWithoutInstallments()) {
                    if (i <= paymentMethod?.attributes.installments.free_rate_months) {
                        installmentsArray.push({ mothlyInstallment: (gettotalCostWithoutInstallments() / i).toFixed(2), installments: i, totalCost: gettotalCostWithoutInstallments() })
                    }
                    else {
                        const installmentCalc = calculateInstallment({ amount: gettotalCostWithoutInstallments(), annualRate: paymentMethod.attributes.installments.annual_rate, months: i })

                        installmentsArray.push({ mothlyInstallment: installmentCalc.monthlyInstallment, installments: i, totalCost: installmentCalc.totalCost })
                    }
                }
            }

            return () => installmentsArray
        }
        return () => null
    }, [paymentMethod]);

    useEffect(() => {
        const getShippingCost = async () => {
            const myHeaders = new Headers();

            myHeaders.append('Content-Type', 'application/json')

            const myInit = {
                method: "POST",
                headers: myHeaders,
                body: JSON.stringify({ cartItems, addresses, shippingMethod })
                // mode: "cors",
                // cache: "default",
            };

            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/shipping/findShippingCost`,
                myInit,
            )
            if (!response.ok) {
                throw new Error(`Response status: ${response.status}`);
            }

            const json = await response.json()
            setShippingCost(json)
        }

        if ((addresses.different_shipping && addresses.shipping.country && addresses.shipping.state && addresses.shipping.city) ||
            (!addresses.different_shipping && addresses.billing.country && addresses.billing.state && addresses.billing.city) && shippingMethod.id !== null)
            getShippingCost()

    }, [addresses, shippingMethod, cartItems])

    useEffect(() => {

        if (!paymentMethod)
            setPaymentCost({ cost: 0 })
        if (paymentMethod) {

            const getPaymentCost = async () => {
                const myHeaders = new Headers();

                myHeaders.append('Content-Type', 'application/json')

                const myInit = {
                    method: "POST",
                    headers: myHeaders,
                    body: JSON.stringify({ paymentMethod })
                    // mode: "cors",
                    // cache: "default",
                };


                const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/shipping/findPaymentCost`,
                    myInit,
                )
                if (!response.ok) {
                    throw new Error(`Response status: ${response.status}`);
                }

                const json = await response.json()

                setPaymentCost(await json)
            }

            if (paymentMethod.id)
                getPaymentCost()
        }
    }, [paymentMethod])

    const saveAddresses = (address: IAddresses) => {
        setAddresses(address)
        localStorage.setItem("addresses", JSON.stringify(address));
    }

    const saveShippingMethod = (shipMeth: IShippingMethod) => {
        setShippingMethod(shipMeth)
        setPaymentMethod(null)
    }

    const saveAvailablePayments = (availablePayments: IPaymentMethods) => {
        setAvailablePayments(availablePayments)
    }

    const saveInstallments = (shipMeth: number) => {
        setInstallments(shipMeth)
    }

    const savePaymentMethod = (payment: IPaymentMethod | null) => {
        setPaymentMethod(payment)
        // sendPaymentEvent('add_payment_info')
    }

    const saveTotalCost = (total: number | null) => {
        if (total)
            setTotalCost({ cost: total })
    }

    const sendPaymentEvent = (payment: string) => {
        let items: any = []
        cartItems.forEach((item) => {

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
                value: cartTotal,
                payment_type: payment,
                items: items
            }
        }

        sendGAEvent('event', 'add_payment_info', {
            eventValue
        })
    };

    const sendPurchaseEvent = (orderId: number) => {
        let items: any = []
        cartItems.forEach((item) => {

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
                value: cartTotal,
                transaction_id: orderId,
                shipping: shippingCost,
                items: items
            }
        }

        sendGAEvent('event', 'purchase', {
            eventValue
        })
    };

    const createOrder = async () => {
        if (!addresses)
            return { message: "addresses", status: "fail", orderId: null, amount: null }
        if (!cartItems)
            return { message: "cartItems", status: "fail", orderId: null, amount: null }
        if (!shippingMethod)
            return { message: "shippingMethod", status: "fail", orderId: null, amount: null }
        if (!paymentMethod)
            return { message: "Δεν έχετε επιλέξει τρόπο πληρωμής", status: "fail", orderId: null, amount: null }

        // Ελέγχω αν όλα τα προϊόντα είναι διαθέσιμα
        const isAllProductsAvailable = cartItems.every(item => item.isAvailable === true)

        if (isAllProductsAvailable) {
            const myHeaders = new Headers();
            myHeaders.append('Content-Type', 'application/json')
            myHeaders.append("authorization", `Bearer ${process.env.ADMIN_JWT_SECRET}`)

            const myInit = {
                method: "POST",
                headers: myHeaders,
                body: JSON.stringify({ cartItems, addresses, shippingMethod, paymentMethod: { payment: paymentMethod.attributes.name }, shippingCost, paymentCost, cartTotal, installments, totalCost: totalCost.cost?.toFixed(2) })
                // mode: "cors",
                // cache: "default",
            };


            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/order/createOrder`,
                myInit,
            )
            if (!response.ok) {
                throw new Error(`Response status: ${response.status}`);
            }

            const json = await response.json()

            sendPurchaseEvent(json.orderId)

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

    return (
        <ShippingContext.Provider
            value={{
                cartItems,
                addresses,
                shippingCost,
                shippingMethod,
                paymentCost,
                availablePayments,
                paymentMethod,
                gettotalCostWithoutInstallments,
                getInstallmentsArray,
                saveTotalCost,
                saveInstallments,
                totalCost,
                saveAvailablePayments,
                saveAddresses,
                saveShippingMethod,
                savePaymentMethod,
                createOrder
            }}
        >
            {children}
        </ShippingContext.Provider>
    )

}