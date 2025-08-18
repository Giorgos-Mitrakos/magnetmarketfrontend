// import { ICartItem } from "@/context/cart";
import { ΙCart, ICartItem, CartAction } from "../interfaces/cart";
import { trackCartEvent } from "../helpers/analytics";
// import { saveCartToLocalStorage } from "../helpers/storage-helper";

// const checkIfItemIsInCart = (item: ΙCartItem) => {
//     const isItemInCart = cartItems.find((cartItem) => cartItem.id === item.id);
//     let itemPrice = item.is_sale && item.sale_price ? item.sale_price : item.price
//     const discount = item.is_sale && item.sale_price ? (item.price - item.sale_price).toFixed(2) : 0

//     return { isItemInCart, itemPrice, discount }
// }

// export function getTotal(items: ICartItem[]) {
//     const total = items.reduce((sum, item) => {
//         let itemPrice = item.is_sale && item.sale_price ? item.sale_price : item.price
//         return sum + itemPrice * item.quantity
//     }, 0)

//     return total
// }

// export const createCategories = (item: ICartItem) => {
//     let categories: {
//         item_category?: string,
//         item_category2?: string,
//         item_category3?: string
//     } = {}

//     if (item.category.data?.attributes.parents.data[0]?.attributes.parents.data[0]?.attributes.name) {
//         categories.item_category = item.category.data?.attributes.parents.data[0]?.attributes.parents.data[0]?.attributes.name
//         categories.item_category2 = item.category.data?.attributes.parents.data[0]?.attributes.name
//         categories.item_category3 = item.category.data?.attributes.name
//     }
//     else if (item.category.data?.attributes.parents.data[0]?.attributes.name) {
//         categories.item_category = item.category.data?.attributes.parents.data[0]?.attributes.name
//         categories.item_category2 = item.category.data?.attributes.name
//     }
//     else if (item.category.data?.attributes.name) {
//         categories.item_category = item.category.data?.attributes.name
//     }

//     return categories
// }

// export const cartReducer = (state: ΙCart | null, action: CartAction): ΙCart | null => {
//     let newState: ΙCart | null = null;

//     switch (action.type) {
//         case "ADD_ITEM": {
//             const newItem = action.payload;

//             if (!state) {
//                 newState = {
//                     items: [newItem],
//                     total: getTotal([newItem]),
//                 };
//             }
//             else {
//                 const existingItemIndex = state.items.findIndex(
//                     item => item.id === newItem.id
//                 );

//                 if (existingItemIndex >= 0) {
//                     // If item exists, update its quantity
//                     const updatedItems = [...state.items];
//                     updatedItems[existingItemIndex] = {
//                         ...updatedItems[existingItemIndex],
//                         quantity: updatedItems[existingItemIndex].quantity + newItem.quantity,
//                     };

//                     newState = {
//                         items: updatedItems,
//                         total: getTotal(updatedItems),
//                     };
//                 } else {
//                     // If item doesn't exist, add it to cart
//                     const updatedItems = [...state.items, newItem];
//                     const updatedTotal = getTotal(updatedItems)

//                     newState = { items: updatedItems, total: updatedTotal };
//                 }
//             }

//             trackCartEvent('add_to_cart', [newItem]);
//             break;
//         }

//         case "REMOVE_ITEM": {
//             if (!state) return null;

//             const filteredItems = state.items.filter((item) => item.id !== action.payload.id);
//             if (filteredItems.length === 0) {
//                 newState = null // Clear cart if empty
//             }
//             else {
//                 const updatedTotal = getTotal(filteredItems)

//                 newState = { items: filteredItems, total: updatedTotal };

//                 trackCartEvent("remove_from_cart", [action.payload]);
//             }
//             break;
//         }

//         case "INCREASE_ITEM_QUANTITY": {
//             if (!state) return null;
//             const updatedItems = state.items.map((item) =>
//                 item.id === action.payload.item.id
//                     ? { ...item, quantity: item.quantity + 1 }
//                     : item
//             );
//             const updatedTotal = getTotal(updatedItems)

//             newState = { items: updatedItems, total: updatedTotal };

//             trackCartEvent("add_to_cart", [action.payload.item]);
//             break;
//         }

//         case "DECREASE_ITEM_QUANTITY": {
//             if (!state) return null;
//             const updatedItems = state.items.map((item) =>
//                 item.id === action.payload.item.id && item.quantity > 1
//                     ? { ...item, quantity: item.quantity - 1 }
//                     : item
//             );
//             const updatedTotal = getTotal(updatedItems)

//             newState = { items: updatedItems, total: updatedTotal };

//             trackCartEvent("remove_from_cart", [action.payload.item]);
//             break;
//         }

//         case "CLEAR_CART":
//             newState = null;

//             break;

//         case 'HYDRATE_CART':
//             return action.payload;

//         default:
//             newState = state;
//             break;
//     }
//     saveCartToLocalStorage(newState); // Persist to localStorage
//     return newState;
// };