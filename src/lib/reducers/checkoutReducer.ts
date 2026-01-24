// lib/reducers/checkoutReducer.ts (ή όπου έχετε τον reducer)

import { trackAddPaymentInfo, trackAddShippingInfo, trackCartEvent, trackPurchase, trackViewCart, isTransactionTracked, trackAddToCart, trackRemoveFromCart } from "../helpers/analytics";
import { saveCheckoutToLocalStorage } from "../helpers/storage-helper";
import { CheckoutAction, ICheckoutState } from "../interfaces/shipping";

export const initialCheckoutState = {
    cart: [],
    addresses: {
        different_shipping: false,
        deliveryNotes: '',
        billing: {
            isInvoice: false,
            email: '',
            firstname: '',
            lastname: '',
            street: '',
            city: '',
            state: '',
            zipCode: '',
            country: '',
            telephone: '',
            mobilePhone: '',
            afm: '',
            doy: '',
            companyName: '',
            businessActivity: '',
        },
        shipping: {
            firstname: '',
            lastname: '',
            street: '',
            city: '',
            state: '',
            zipCode: '',
            country: '',
            telephone: '',
            mobilePhone: '',
        }
    },
    shippingMethod: {
        id: null,
        shipping: null
    },
    paymentMethod: null,
    availableShippingMethods: { shippings: { data: [] } },
    availablePaymentMethods: { data: [] },
    appliedCoupon: null,
    installmentsArray: [],
    installments: 1,
    totals: {
        subtotal: 0,
        shipping: null,
        payment: 0,
        discount: 0,
        interestCost: 0,
        total: 0,
    }
};

export const checkoutReducer = (state: ICheckoutState, action: CheckoutAction): ICheckoutState => {
    let newState: ICheckoutState;

    if (!state) return initialCheckoutState;

    switch (action.type) {
        case "ADD_ITEM": {
            const newItem = action.payload;
            if (newItem.status === "OutOfStock" || newItem.status === "Discontinued") {
                newState = state
                break;
            }

            const existingItemIndex = state.cart.findIndex(
                item => item.id === newItem.id
            );

            if (existingItemIndex >= 0) {
                const updatedItems = [...state.cart];
                updatedItems[existingItemIndex] = {
                    ...updatedItems[existingItemIndex],
                    quantity: updatedItems[existingItemIndex].quantity + newItem.quantity,
                };

                newState = {
                    ...state,
                    cart: updatedItems,
                };
            } else {
                const updatedItems = [...state.cart, newItem];
                newState = { ...state, cart: updatedItems };
            }

            trackAddToCart(newItem);
            break;
        }

        case "REMOVE_ITEM": {
            if (!state) return initialCheckoutState;

            const filteredItems = state.cart.filter((item) => item.id !== action.payload.id);
            if (filteredItems.length === 0) {
                newState = { ...state, cart: [] };
            }
            else {
                newState = { ...state, cart: filteredItems };
                trackRemoveFromCart(action.payload);
            }
            break;
        }

        case "INCREASE_ITEM_QUANTITY": {
            if (!state) return initialCheckoutState;
            const updatedItems = state.cart.map((item) =>
                item.id === action.payload.item.id
                    ? { ...item, quantity: item.quantity + 1 }
                    : item
            );

            newState = { ...state, cart: updatedItems };
            trackAddToCart(action.payload.item);
            break;
        }

        case "DECREASE_ITEM_QUANTITY": {
            if (!state) return initialCheckoutState;
            const updatedItems = state.cart.map((item) =>
                item.id === action.payload.item.id && item.quantity > 1
                    ? { ...item, quantity: item.quantity - 1 }
                    : item
            );

            newState = { ...state, cart: updatedItems };
            trackRemoveFromCart(action.payload.item);
            break;
        }

        case "CLEAR_CART": {
            newState = { ...state, cart: [] };
            break;
        }

        case "CLEAR_LOCALESTORAGE": {
            newState = initialCheckoutState;
            break;
        }

        case 'HYDRATE_CART': {
            // if (action.payload.cart.length > 0) {
            //     trackViewCart(action.payload.cart);
            // }
            return action.payload;
        }

        case 'SAVE_ADDRESS': {
            newState = { ...state, addresses: action.payload }
            break;
        }

        case 'SAVE_INSTALLMENTS': {
            newState = { ...state, installments: action.payload }
            break;
        }

        case 'SAVE_AVAILABLE_SHIPPINGS': {
            newState = { ...state, availableShippingMethods: action.payload }
            break;
        }

        case 'SAVE_AVAILABLE_PAYMENTS': {
            newState = { ...state, availablePaymentMethods: action.payload }
            break;
        }

        case 'SAVE_SHIPPING_METHOD': {
            newState = {
                ...state,
                shippingMethod: action.payload.shippingMethod,
                availablePaymentMethods: action.payload.availablePayments,
                paymentMethod: null,
                installments: 1
            }

            // Track shipping με όνομα μεθόδου
            // payload.shippingMethod = { id: number, shipping: string }
            if (state.cart.length > 0 && action.payload.shippingMethod?.shipping) {
                trackAddShippingInfo(
                    state.cart,
                    action.payload.shippingMethod.shipping // ✅ Είναι ήδη string
                );
            }
            break;
        }

        case 'SAVE_PAYMENT_METHOD': {
            newState = { ...state, paymentMethod: action.payload, installments: 1 }

            // Track payment με όνομα μεθόδου
            // payload = IPaymentMethod (με attributes.name)
            if (state.cart.length > 0 && action.payload) {
                trackAddPaymentInfo(
                    state.cart,
                    action.payload.attributes?.name || 'card'
                );
            }
            break;
        }

        case 'SAVE_INSTALLMENTS_ARRAY': {
            newState = { ...state, installmentsArray: action.payload }
            break;
        }

        case 'RECALCULATE_TOTALS': {
            newState = {
                ...state,
                totals: action.payload,
            };
            break;
        }

        case 'APPLY_COUPON': {
            newState = { ...state, appliedCoupon: action.payload }
            break;
        }

        case 'REMOVE_COUPON': {
            newState = { ...state, appliedCoupon: null }
            break;
        }

        case 'PURCHASE_COMPLETE': {
            const { transactionId, shipping, tax, items, coupon } = action.payload;

            // ✅ Έλεγχος για duplicate tracking
            if (!isTransactionTracked(transactionId)) {
                trackPurchase(
                    items,
                    transactionId,
                    shipping,
                    tax,
                    coupon
                );
                console.log('[Reducer] ✅ Purchase tracked via PURCHASE_COMPLETE');
            } else {
                console.log('[Reducer] ⚠️ Transaction already tracked, skipping');
            }

            // Clear cart μετά το tracking
            newState = {
                ...state,
                cart: []
            };
            break;
        }

        default: {
            newState = state;
            break;
        }
    }

    saveCheckoutToLocalStorage(newState);
    return newState;
}