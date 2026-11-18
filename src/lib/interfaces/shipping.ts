import { getInstallmentsArray } from "../helpers/checkout";
import { IAddresses } from "./addresses";
import { ICartItem } from "./cart";
import { ICoupon } from "./coupon"

export type ICheckoutState = {
    cart: ICartItem[];
    addresses: IAddresses;
    shippingMethod: ShippingMethodSelected | null;
    paymentMethod: IPaymentMethod | null;
    appliedCoupon: ICoupon | null;
    availableShippingMethods: { shippings: { data: IShippingMethod[] } };
    availablePaymentMethods: IPaymentMethods;
    installmentsArray: IInstallmentsArray[],
    installments: number;
    totals: Totals;
    /** Δήλωση για τον μειωμένο ΦΠΑ νησιών (προορισμός/εγκατάσταση στο νησί) */
    islandVatDeclared?: boolean;
};

export type Totals = {
    subtotal: number;
    shipping: number | null;
    payment: number;
    discount: number;
    interestCost: number;
    total: number;
    /** Το εφαρμοσμένο κουπόνι δεν ισχύει πια (π.χ. άλλαξε το καλάθι) */
    couponError?: string | null;
    /** Προειδοποιήσεις του Strapi (διαθεσιμότητα, κόστος αποστολής κ.λπ.) */
    warnings?: string[];
    /** Μειωμένος ΦΠΑ νησιών — applied ή μόνο ενημερωτικό μήνυμα */
    islandVat?: IslandVatInfo | null;
    /** (2026-10-23) Μέρος του discount από πακέτα «Αγοράστε τα μαζί» */
    bundleDiscount?: number;
    bundles?: AppliedBundle[];
}

/** (2026-10-23) Πακέτο «Αγοράστε τα μαζί» που εφαρμόστηκε στο καλάθι */
export type AppliedBundle = {
    documentId: string;
    name: string;
    percent: number;
    sets: number;
    amount: number;
}

export type IslandVatInfo = {
    applied: boolean;
    rate: number | null;
    area: string | null;
    check: string | null;
    message: string | null;
    /** Πόσο λιγότερο κοστίζουν τα προϊόντα σε σχέση με τις τιμές του site (24%) */
    productsSaving?: number;
    /** Μπορεί να εφαρμοστεί με τη δήλωση του πελάτη */
    eligible?: boolean;
    needsDeclaration?: boolean;
    /** Το κείμενο της δήλωσης */
    declaration?: string | null;
    /** Θα ζητηθεί βεβαίωση έναρξης / υποκαταστήματος πριν το τιμολόγιο */
    reviewRequired?: boolean;
}


export interface IShippingMethods {
    shippings: {
        data: IShippingMethod[]
    }
}

export interface IShippingMethod {
    /** documentId του Strapi v3 */
    id: string
    attributes: {
        name: string
        is_free_shipping?: boolean
        /** Δωρεάν μεταφορικά από αυτό το ποσό (αξία προϊόντων) — null = χωρίς όριο */
        free_shipping_over?: number | null
        payments: IPaymentMethods
    }
}

export type ShippingMethodSelected = {
    id: string | null,
    shipping: string | null
}

export interface IPaymentMethods {
    data: IPaymentMethod[]
}

export enum PaymentMethodEnum {
    CREDIT_CARD = "credit_card",
    DEBIT_CARD = "debit_card",
    CASH = "cash",
    CASH_ON_DELIVERY = "cash_on_delivery",
    BANK_TRANSFER = "bank_transfer",
    IRIS_PAYMENT = 'iris_payment'
}

export interface IPaymentMethod {
    /** documentId του Strapi v3 */
    id: string
    attributes: {
        name: string
        description: string
        price: number
        method: PaymentMethodEnum
        range: {
            minimum: number
            maximum: number | null
        } | null
        isActive: boolean
        installments: {
            max_installments: number
            free_rate_months: number
            annual_rate: number
        } | null
    }
}

export type InstallmentType = {
    mothlyInstallment: number,
    installments: number,
    totalCost: number
}

export interface IInstallmentsArray {
    monthlyInstallment: string,
    installments: number,
    totalCost: number
}

type CartAction =
    | { type: "ADD_ITEM"; payload: ICartItem }
    | { type: "REMOVE_ITEM"; payload: ICartItem } // itemId
    | { type: "INCREASE_ITEM_QUANTITY"; payload: { item: ICartItem; quantity: number } }
    | { type: "DECREASE_ITEM_QUANTITY"; payload: { item: ICartItem; quantity: number } }
    | { type: 'HYDRATE_CART'; payload: ICheckoutState }
    | { type: "CLEAR_CART" }
    | { type: "RECALCULATE_TOTALS", payload: Totals }

type AddressAction = { type: "SAVE_ADDRESS"; payload: IAddresses }

type ShippingAction = { type: "SAVE_SHIPPING_METHOD"; payload: { shippingMethod: ShippingMethodSelected, availablePayments: IPaymentMethods } }
    | { type: "SAVE_PAYMENT_METHOD"; payload: IPaymentMethod }
    | { type: "SAVE_AVAILABLE_SHIPPINGS"; payload: IShippingMethods }
    | { type: "SAVE_AVAILABLE_PAYMENTS"; payload: IPaymentMethods }

type PaymentAction = { type: "SAVE_INSTALLMENTS"; payload: number }
    | { type: "SAVE_INSTALLMENTS_ARRAY"; payload: IInstallmentsArray[] }

type CouponAction = { type: "APPLY_COUPON"; payload: ICoupon }
    | { type: "REMOVE_COUPON" }
    | { type: "SET_ISLAND_VAT_DECLARED"; payload: boolean }

type LocalStorageAction = { type: "CLEAR_LOCALESTORAGE" }

type PurchaseCompleteAction = {
    type: "PURCHASE_COMPLETE"; payload: {
        transactionId: string;
        shipping: number;
        tax: number;
        items: ICartItem[];
        coupon?: string;
    }
}

// Actions for useReducer
export type CheckoutAction = CartAction | AddressAction | ShippingAction | PaymentAction | CouponAction | LocalStorageAction | PurchaseCompleteAction;