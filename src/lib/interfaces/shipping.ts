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
};

export type Totals = {
    subtotal: number;
    shipping: number | null;
    payment: number;
    discount: number;
    interestCost: number;
    total: number;
}


export interface IShippingMethods {
    shippings: {
        data: IShippingMethod[]
    }
}

export interface IShippingMethod {
    id: number
    attributes: {
        name: string
        payments: IPaymentMethods
    }
}

export type ShippingMethodSelected = {
    id: number | null,
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
    BANK_TRANSFER = "bank_transfer"
}

export interface IPaymentMethod {
    id: number
    attributes: {
        name: string
        description: string
        price: number
        method: PaymentMethodEnum
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

type LocalStorageAction = { type: "CLEAR_LOCALESTORAGE" }

// Actions for useReducer
export type CheckoutAction = CartAction | AddressAction | ShippingAction | PaymentAction | CouponAction | LocalStorageAction;