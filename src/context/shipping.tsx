'use client'
import { createContext, useContext, useEffect, useState } from "react";
import { CartContext, createCategories, ICartItem } from "./cart";
import { useSession } from "next-auth/react";
import { sendGAEvent } from "@next/third-parties/google";

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

interface IShippingMethod {
    pickup: boolean,
    shipping: string
}

interface IShippingCost {
    cost: number | null
}

interface IPaymentMethod {
    payment: string | undefined,
    installments?: number
}

interface IPaymentCost {
    cost: number | null
}

interface IShippingContext {
    cartItems: ICartItem[],
    addresses: IAddresses,
    shippingMethod: IShippingMethod,
    shippingCost: IShippingCost,
    paymentCost: IPaymentCost,
    paymentMethod: IPaymentMethod,
    saveAddresses: (address: IAddresses) => void,
    saveShippingMethod: (id: IShippingMethod) => void,
    savePaymentMethod: (id: IPaymentMethod) => void,
    createOrder: () => Promise<{ status: string, message: string, orderId: number | null, amount?: number | null, installments?: number | null }>

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
    shippingMethod: {
        pickup: false,
        shipping: ''
    },
    paymentCost: { cost: null },
    paymentMethod: { payment: '', installments: 1 },
    shippingCost: { cost: null },
    saveAddresses: () => { },
    saveShippingMethod: () => { },
    savePaymentMethod: () => { },
    createOrder: async () => { return { message: "", status: "", orderId: null, amount: null, installments: 1 } }
})

export const ShippingProvider = ({ children }: any) => {
    const { data: session, status } = useSession()

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
        pickup: false,
        shipping: '',
    })
    const [shippingCost, setShippingCost] = useState<IShippingCost>({ cost: null })

    const [paymentCost, setPaymentCost] = useState<IPaymentCost>({ cost: null })

    const [paymentMethod, setPaymentMethod] = useState<IPaymentMethod>({ payment: '' })

    useEffect(() => {
        if (!localStorage || typeof window !== 'undefined' )
            return

        const address = localStorage.getItem("addresses");
        if (address) {
            const parsedAddress = JSON.parse(address)
            setAddresses(parsedAddress)
        }
        const shipMeth = localStorage.getItem("shippingMethod")
        if (shipMeth) {
            const parsedShipMeth = JSON.parse(shipMeth)
            setShippingMethod(parsedShipMeth)
        }
        const payMeth = localStorage.getItem("paymentMethod")
        if (payMeth) {
            const parsedPayMeth = JSON.parse(payMeth)
            setPaymentMethod(parsedPayMeth)
        }

    }, [])

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
            (!addresses.different_shipping && addresses.billing.country && addresses.billing.state && addresses.billing.city))
            getShippingCost()

    }, [addresses, shippingMethod, cartItems])

    useEffect(() => {
        if (paymentMethod.payment && paymentMethod.payment !== "") {
            const getPaymentCost = async () => {
                const myHeaders = new Headers();

                myHeaders.append('Content-Type', 'application/json')

                const myInit = {
                    method: "POST",
                    headers: myHeaders,
                    body: JSON.stringify({ paymentMethod, shippingMethod })
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

                setPaymentCost(json)
            }

            if (paymentMethod.payment && paymentMethod.payment !== "")
                getPaymentCost()
        }
    }, [paymentMethod, shippingMethod])

    const saveAddresses = (address: IAddresses) => {
        setAddresses(address)
        localStorage.setItem("addresses", JSON.stringify(address));
    }

    const saveShippingMethod = (shipMeth: IShippingMethod) => {
        setShippingMethod(shipMeth)
        localStorage.setItem("shippingMethod", JSON.stringify(shipMeth));
    }

    const savePaymentMethod = (payment: IPaymentMethod) => {
        setPaymentMethod(payment)
        localStorage.setItem("paymentMethod", JSON.stringify(payment));
        sendPaymentEvent('add_payment_info')
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
            return { message: "paymentMethod", status: "fail", orderId: null, amount: null }

        // Ελέγχω αν όλα τα προϊόντα είναι διαθέσιμα
        const isAllProductsAvailable = cartItems.every(item => item.isAvailable === true)

        if (isAllProductsAvailable) {
            const myHeaders = new Headers();
            myHeaders.append('Content-Type', 'application/json')
            myHeaders.append("authorization", `Bearer ${process.env.ADMIN_JWT_SECRET}`)

            const myInit = {
                method: "POST",
                headers: myHeaders,
                body: JSON.stringify({ cartItems, addresses, shippingMethod, paymentMethod, shippingCost, paymentCost, cartTotal })
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
                paymentMethod,
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