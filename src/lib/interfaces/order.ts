// lib/interfaces/order.ts

import { IImageAttr } from "@/lib/interfaces/image"

export interface IOrderProduct {
    id: number;
    name: string;
    slug: string;
    brand: string | null;
    image: IImageAttr;
    price: number;
    sale_price: number | null;
    is_sale: boolean;
    quantity: number;
    weight: number;
    isAvailable: boolean;
    category: {
        id: number;
        name: string;
        slug?: string;
        parents: Array<{
            id: number;
            name: string;
            slug?: string;
            parents: Array<{
                id: number;
                name: string;
                slug?: string;
            }>;
        }>;
    } | null;
    sku?: string;
    variant?: string;
}

export interface IOrder {
    order: {
        id: number;
        total: number;
        products: IOrderProduct[];
        shipping: {
            name: string;
            cost: number;
        };
        payment: {
            name: string;
        };
        installments: number;
        coupon?: {
            code: string;
        };
    };
    deliverydays: {
        early: string;
        late: string;
    };
}