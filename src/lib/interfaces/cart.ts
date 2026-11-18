// lib/interfaces/cart.ts

import { IImageAttr } from "@/lib/interfaces/image"

export interface ICartItem {
    id: number,
    /** documentId του Strapi v3 (τα παλιότερα καλάθια έχουν μόνο id) */
    documentId?: string,
    name: string,
    brand: string | null,
    slug: string,
    status: string,
    image: IImageAttr,
    price: number,
    quantity: number,
    weight: number,
    isAvailable: boolean,
    is_sale: boolean,
    sale_price: number | null,
    category: {
        id: number
        name: string
        slug?: string
        parents: {
            id: number
            name: string
            slug?: string
            parents: {
                id: number
                name: string
                slug?: string
            }[]
        }[]
    } | null
    sku?: string
    variant?: string
    /** (2026-10-22) Προπαραγγελία προϊόντος «Αναμένεται» με προσωπικό σύνδεσμο */
    preorderToken?: string
    /** Μέγιστη ποσότητα του συνδέσμου προπαραγγελίας */
    preorderMax?: number
}

export interface ΙCart {
    items: ICartItem[];
    total: number;
}

// Actions for useReducer
export type CartAction =
    | { type: "ADD_ITEM"; payload: ICartItem }
    | { type: "REMOVE_ITEM"; payload: ICartItem }
    | { type: "INCREASE_ITEM_QUANTITY"; payload: { item: ICartItem; quantity: number } }
    | { type: "DECREASE_ITEM_QUANTITY"; payload: { item: ICartItem; quantity: number } }
    | { type: 'HYDRATE_CART'; payload: ΙCart }
    | { type: "CLEAR_CART" };