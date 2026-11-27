'use client'
import { createContext, useContext, useEffect, useMemo, useRef, useReducer, useState } from "react";
import { sendGAEvent } from "@next/third-parties/google";
import { getCookies, saveCookies } from "@/lib/helpers/actions";
import { CheckoutAction, ICheckoutState, IShippingMethods } from "@/lib/interfaces/shipping";
import { checkoutReducer, initialCheckoutState } from "@/lib/reducers/checkoutReducer";
import { loadCheckoutFromLocalStorage } from "@/lib/helpers/storage-helper";
import { calculateTotals, createCategories, getInstallmentsArray } from "@/lib/helpers/checkout";
import { buildQuotePayload } from "@/lib/helpers/checkoutPayload";
import { toast } from "sonner";
import { ICartItem } from "@/lib/interfaces/cart";
import { ICouponApplianceResponse, ICouponValidationResponse } from "@/lib/interfaces/coupon";
import { flattenJSON } from "@/lib/helpers/helpers";
import { useSession } from "next-auth/react";
import { useCartSnapshot } from "@/lib/helpers/cartSnapshot";

interface IShippingContext {
    checkout: ICheckoutState
    dispatch: React.Dispatch<CheckoutAction>,
    validationError: string | null;
    validateCoupon: (code: string, cart: ICartItem[]) => Promise<ICouponValidationResponse>;
    applyCoupon: (code: string, cart: ICartItem[]) => Promise<ICouponApplianceResponse>;
}



const CheckoutContext = createContext<IShippingContext>({
    checkout: initialCheckoutState,
    dispatch: () => null,
    validationError: null,
    validateCoupon: async () => ({
        valid: false,
        coupon: undefined,
        error: undefined,
    }),
    applyCoupon: async (code: string, cart: ICartItem[]): Promise<ICouponApplianceResponse> => ({
        success: false,
        coupon: undefined,
        usageId: undefined,
        message: undefined
    }),

})

export const CheckoutProvider = ({ children }: any) => {
    const [isClient, setIsClient] = useState(false);
    const [validationError, setValidationError] = useState<string | null>(null)

    const [checkout, dispatch] = useReducer(checkoutReducer, initialCheckoutState);

    // 1. Set client-side flag on mount
    useEffect(() => {

        setIsClient(true);
    }, []);


    // 2. Load savedCheckout from localStorage AFTER hydration
    useEffect(() => {

        const fetchShipping = async () => {

            // Ενεργές μέθοδοι αποστολής + τρόποι πληρωμής (Strapi v3, REST)
            try {
                const response = await fetch('/api/storefront/shipping-methods')
                if (!response.ok) throw new Error(`Response status: ${response.status}`)
                const shippings = await response.json() as IShippingMethods
                dispatch({ type: "SAVE_AVAILABLE_SHIPPINGS", payload: shippings })
            } catch (error) {
                console.error('Shipping methods:', error)
            }

            // return shippings
        };

        if (isClient) {
            const savedCheckout = loadCheckoutFromLocalStorage();
            if (savedCheckout) {
                if (savedCheckout.cart.length > 0) {
                    const flattenedData = flattenJSON(savedCheckout.cart);
                    savedCheckout.cart = flattenedData
                }
                dispatch({ type: 'HYDRATE_CART', payload: { ...savedCheckout, shippingMethod: null, paymentMethod: null, installments: 1 } });
            }


            fetchShipping()
        }
    }, [isClient]);

    // (2026-11-25) Αντίγραφο καλαθιού για τις υπενθυμίσεις «Ξέχασες κάτι στο καλάθι»
    const { data: session } = useSession()
    useCartSnapshot(checkout.cart, checkout.addresses.billing.email, isClient, session?.user?.email)

    // Η τελευταία κατάσταση του ταμείου για το παρακάτω effect: τρέχει μόνο όταν
    // αλλάζει κάτι που επηρεάζει το κόστος, αλλά διαβάζει πάντα την τρέχουσα κατάσταση
    const checkoutRef = useRef(checkout)
    checkoutRef.current = checkout

    useEffect(() => {

        const timer = setTimeout(() => {
            const checkout = checkoutRef.current

            calculateTotals(checkout).then((totals) => {

                dispatch({ type: 'RECALCULATE_TOTALS', payload: totals });

                // Το κουπόνι δεν ισχύει πια (π.χ. άλλαξε το καλάθι ή το email)
                if (checkout.appliedCoupon && totals.couponError) {
                    dispatch({ type: "REMOVE_COUPON" })
                    toast.error(`Το κουπόνι αφαιρέθηκε: ${totals.couponError}`, { position: 'top-right' })
                }

                const installmentsArray = getInstallmentsArray(checkout, totals)

                dispatch({ type: 'SAVE_INSTALLMENTS_ARRAY', payload: installmentsArray });
            });
        }, 200); // 200ms debounce

        return () => clearTimeout(timer);
    }, [checkout.cart, checkout.shippingMethod, checkout.paymentMethod, checkout.appliedCoupon, checkout.installments,
        checkout.addresses.billing.state, checkout.addresses.billing.city, checkout.addresses.billing.zipCode,
        checkout.addresses.billing.isInvoice, checkout.addresses.billing.afm, checkout.islandVatDeclared,
        checkout.article45?.requested, checkout.article45?.afm,
        checkout.addresses.shipping.state, checkout.addresses.shipping.city, checkout.addresses.shipping.zipCode,
        checkout.addresses.different_shipping]);

    // Watch for email changes and remove coupon if needed
    useEffect(() => {
        const getSavedEmail = async () => {
            const savedEmail = await getCookies({ name: '_mm_cue' });
            return savedEmail;
        };

        if (!checkout.appliedCoupon) return;

        const currentEmail = checkout.addresses.billing?.email;

        getSavedEmail().then(savedEmail => {
            const savedEmailString = savedEmail?.value;
            const parsed = savedEmailString ? JSON.parse(savedEmailString) : null;

            if (savedEmail && currentEmail && parsed.email !== currentEmail) {
                dispatch({ type: "REMOVE_COUPON" })
            }
        });

    }, [checkout.addresses.billing.email, checkout.appliedCoupon]);

    const validateCoupon = async (code: string, cart: ICartItem[]): Promise<ICouponValidationResponse> => {
        if (!cart) throw Error("Το καλάθι είναι άδειο")
        try {
            // Ο έλεγχος γίνεται με το quote του Strapi (ίδιοι κανόνες με την παραγγελία)
            const response = await fetch('/api/coupons/validate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(buildQuotePayload({ ...checkout, cart }, code))
            })

            if (!response.ok) {
                const error = await response.json()
                throw new Error(error.message)
            }

            const data = await response.json() as ICouponValidationResponse
            setValidationError(data.valid ? null : (data.message ?? null))
            return data
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Coupon validation failed'
            setValidationError(message)
            throw error
        }
    }

    const applyCoupon = async (code: string, cart: ICartItem[]): Promise<ICouponApplianceResponse> => {
        if (!cart) throw Error("Το καλάθι είναι άδειο")
        try {
            // Καμία «δέσμευση» του κουπονιού εδώ: η χρήση καταγράφεται μόνο
            // μαζί με την παραγγελία. Το κουπόνι ξαναελέγχεται σε κάθε υπολογισμό.
            const applyResponse = await fetch('/api/coupons/apply', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(buildQuotePayload({ ...checkout, cart }, code))
            })

            if (!applyResponse.ok) {
                const error = await applyResponse.json()
                throw new Error(error.message)
            }

            const result = await applyResponse.json() as ICouponApplianceResponse
            if (!result.success || !result.coupon) {
                setValidationError(result.message ?? 'Το κουπόνι δεν είναι έγκυρο')
                return result
            }

            dispatch({ type: "APPLY_COUPON", payload: result.coupon })
            setValidationError(null)
            // Το email με το οποίο εφαρμόστηκε (αλλαγή email → αφαίρεση κουπονιού)
            await saveCookies({
                name: "_mm_cue", value: {
                    email: checkout.addresses.billing.email
                }
            })
            return result
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Failed to apply coupon'
            setValidationError(message)
            throw error
        }
    }

    // useEffect(() => {

    //     if (checkout.cart.length > 0 && checkout.paymentMethod?.attributes.installments) {
    //         const installmentsArray = getInstallmentsArray(checkout)

    //         dispatch({ type: 'SAVE_INSTALLMENTS_ARRAY', payload: installmentsArray });
    //     }
    // }, [checkout.appliedCoupon, checkout.paymentMethod, checkout.cart])

    // const [addresses, setAddresses] = useState<IAddresses>({
    //     different_shipping: false,
    //     deliveryNotes: "",
    //     billing: {
    //         isInvoice: false,
    //         email: "",
    //         firstname: "",
    //         lastname: "",
    //         street: "",
    //         city: "",
    //         state: "",
    //         zipCode: "",
    //         country: "Ελλάδα",
    //         telephone: "",
    //         mobilePhone: "",
    //         afm: "",
    //         doy: "",
    //         companyName: "",
    //         businessActivity: "",

    //     },
    //     shipping: {
    //         firstname: "",
    //         lastname: "",
    //         street: "",
    //         city: "",
    //         state: "",
    //         zipCode: "",
    //         country: "Ελλάδα",
    //         telephone: "",
    //         mobilePhone: "",
    //     }
    // })

    // const [shippingMethod, setShippingMethod] = useState<IShippingMethod>({
    //     id: null,
    //     shipping: null,
    // })

    // const [shippingCost, setShippingCost] = useState<IShippingCost>({ cost: null })

    // const [availablePayments, setAvailablePayments] = useState<IPaymentMethods>();

    // const [paymentCost, setPaymentCost] = useState<IPaymentCost>({ cost: null })

    // const [installments, setInstallments] = useState<number>(1)

    // const [paymentMethod, setPaymentMethod] = useState<IPaymentMethod | null>(null)

    // const [totalCost, setTotalCost] = useState<ITotalCost>({ cost: null })



    // const gettotalCostWithoutInstallments: () => number = useMemo(() => {
    //     const productsCost = checkout?.totals.subtotal || 0
    //     const shippingCosts = shippingCost.cost || 0
    //     const paymentCosts = paymentCost.cost || 0
    //     return () => productsCost + shippingCosts + paymentCosts;
    // }, [checkout?.cart, shippingCost, paymentCost]);

    // useEffect(() => {
    //     const getShipPaymentcookies = async () => {
    //         const methods = await getCookies({ name: '_mmspm' })

    //         const methodsJson = methods ? JSON.parse(methods?.value) : null

    //         if (methodsJson && methodsJson.shippingMethod) {
    //             setShippingMethod({ id: methodsJson.shippingMethodId, shipping: methodsJson.shippingMethod })
    //             if (methodsJson.paymentMethod) {
    //                 const myHeaders = new Headers();

    //                 myHeaders.append('Content-Type', 'application/json')

    //                 const myInit = {
    //                     method: "POST",
    //                     headers: myHeaders,
    //                     body: JSON.stringify({ paymentMethod: { id: methodsJson.paymentMethodId } })
    //                     // mode: "cors",
    //                     // cache: "default",
    //                 };


    //                 const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/shipping/findPaymentMethod`,
    //                     myInit,
    //                 )
    //                 if (!response.ok) {
    //                     throw new Error(`Response status: ${response.status}`);
    //                 }

    //                 const json = await response.json()

    //                 setPaymentMethod({
    //                     id: await json.id,
    //                     attributes: {
    //                         name: await json.name,
    //                         price: await json.price,
    //                         isActive: await json.isActive,
    //                         installments: await json.installments,
    //                         range: await json.range
    //                     }
    //                 })
    //                 setPaymentCost({ cost: await json.price })
    //             }
    //             if (methodsJson.installments) {
    //                 setInstallments(methodsJson.installments)
    //             }
    //         }
    //     }

    //     getShipPaymentcookies()

    //     const address = localStorage.getItem("addresses");
    //     if (address) {
    //         const parsedAddress = JSON.parse(address)
    //         setAddresses(parsedAddress)
    //     }
    // }, [])

    // useEffect(() => {
    //     if (paymentMethod && paymentMethod.attributes && paymentMethod.attributes.installments && installments > paymentMethod?.attributes.installments.free_rate_months) {
    //         const installmentCalc = calculateInstallment({ amount: gettotalCostWithoutInstallments(), annualRate: paymentMethod.attributes.installments.annual_rate, months: installments })
    //         setTotalCost({ cost: installmentCalc.totalCost })
    //     }
    //     else {
    //         setTotalCost({ cost: gettotalCostWithoutInstallments() })
    //     }

    // }, [availablePayments, installments, checkout?.cart, shippingCost, paymentCost])



    // useEffect(() => {
    //     const getShippingCost = async () => {
    //         const myHeaders = new Headers();

    //         myHeaders.append('Content-Type', 'application/json')

    //         const myInit = {
    //             method: "POST",
    //             headers: myHeaders,
    //             body: JSON.stringify({ cartItems: checkout?.cart, addresses, shippingMethod })
    //             // mode: "cors",
    //             // cache: "default",
    //         };

    //         const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/shipping/findShippingCost`,
    //             myInit,
    //         )
    //         if (!response.ok) {
    //             throw new Error(`Response status: ${response.status}`);
    //         }

    //         const json = await response.json()
    //         setShippingCost(json)
    //     }

    //     if ((addresses.different_shipping && addresses.shipping.country && addresses.shipping.state && addresses.shipping.city) ||
    //         (!addresses.different_shipping && addresses.billing.country && addresses.billing.state && addresses.billing.city) && shippingMethod.id !== null)
    //         getShippingCost()

    // }, [addresses, shippingMethod, checkout?.cart])

    // useEffect(() => {

    //     if (!paymentMethod)
    //         setPaymentCost({ cost: 0 })
    //     if (paymentMethod) {

    //         const getPaymentCost = async () => {
    //             const myHeaders = new Headers();

    //             myHeaders.append('Content-Type', 'application/json')

    //             const myInit = {
    //                 method: "POST",
    //                 headers: myHeaders,
    //                 body: JSON.stringify({ paymentMethod })
    //                 // mode: "cors",
    //                 // cache: "default",
    //             };


    //             const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/shipping/findPaymentCost`,
    //                 myInit,
    //             )
    //             if (!response.ok) {
    //                 throw new Error(`Response status: ${response.status}`);
    //             }

    //             const json = await response.json()

    //             setPaymentCost(await json)
    //         }

    //         if (paymentMethod.id)
    //             getPaymentCost()
    //     }
    // }, [paymentMethod])

    // const saveAddresses = (address: IAddresses) => {
    //     setAddresses(address)
    //     localStorage.setItem("addresses", JSON.stringify(address));
    // }

    // const saveShippingMethod = (shipMeth: IShippingMethod) => {
    //     setShippingMethod(shipMeth)
    //     setPaymentMethod(null)
    // }

    // const saveAvailablePayments = (availablePayments: IPaymentMethods) => {
    //     setAvailablePayments(availablePayments)
    // }

    // const saveInstallments = (shipMeth: number) => {
    //     setInstallments(shipMeth)
    // }

    // const savePaymentMethod = (payment: IPaymentMethod | null) => {
    //     setPaymentMethod(payment)
    //     // sendPaymentEvent('add_payment_info')
    // }

    // const saveTotalCost = (total: number | null) => {
    //     if (total)
    //         setTotalCost({ cost: total })
    // }

    const sendPaymentEvent = (payment: string) => {
        let items: any = []
        checkout.cart.forEach((item) => {

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
                payment_type: payment,
                items: items
            }
        }

        sendGAEvent('event', 'add_payment_info', {
            eventValue
        })
    };

    return (
        <CheckoutContext.Provider
            value={{
                checkout, 
                dispatch,
                validationError,
                validateCoupon,
                applyCoupon
            }}
        >
            {children}
        </CheckoutContext.Provider>
    )

}


export const useCheckout = () => useContext(CheckoutContext)