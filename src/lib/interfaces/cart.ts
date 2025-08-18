import { IImageAttr } from "@/lib/interfaces/image"

export interface ICartItem {
    id: number,
    name: string,
    brand: string | null,
    slug: string,
    image: { data: IImageAttr },
    price: number,
    quantity: number,
    weight: number,
    isAvailable: boolean,
    is_sale: boolean
    sale_price: number
    category: {
        data: {
            id: number
            attributes: {
                name: string
                parents: {
                    data: {
                        id: number
                        attributes: {
                            name: string
                            parents: {
                                data: {
                                    id: number
                                    attributes: {
                                        name: string
                                    }
                                }[]
                            }
                        }
                    }[]
                }
            }
        }
    }
}

export interface ΙCart {
    items: ICartItem[];
    total: number;
}

// Actions for useReducer
export type CartAction =
    | { type: "ADD_ITEM"; payload: ICartItem }
    | { type: "REMOVE_ITEM"; payload: ICartItem } // itemId
    | { type: "INCREASE_ITEM_QUANTITY"; payload: { item: ICartItem; quantity: number } }
    | { type: "DECREASE_ITEM_QUANTITY"; payload: { item: ICartItem; quantity: number } }
    | { type: 'HYDRATE_CART'; payload: ΙCart }
    | { type: "CLEAR_CART" };