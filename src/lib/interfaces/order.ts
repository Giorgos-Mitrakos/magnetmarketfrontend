// lib/interfaces/order.ts

import { IImageAttr } from "@/lib/interfaces/image"

export interface IOrderProduct {
    id: number | null;
    documentId?: string | null;
    name: string;
    slug: string | null;
    brand: string | null;
    status?: string;
    image: IImageAttr | null;
    price: number;
    sale_price: number | null;
    is_sale: boolean;
    quantity: number;
    weight?: number;
    isAvailable?: boolean;
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
    mpn?: string;
    barcode?: string;
    variant?: string;
}

export interface IOrder {
    order: {
        /** Αριθμός παραγγελίας (order_number) */
        id: string;
        documentId: string;
        orderNumber: string;
        status: string;
        paymentStatus: string;
        /** Αξία προϊόντων */
        subtotal?: number;
        /** Έκπτωση (κουπόνι + πακέτα) */
        discount?: number;
        total: number;
        /** ΦΠΑ που περιλαμβάνεται στο σύνολο */
        vatTotal?: number;
        /** Μειωμένος ΦΠΑ νησιών (αν εφαρμόστηκε) */
        islandVat?: { rate: number; area: string | null } | null;
        products: IOrderProduct[];
        shipping: {
            name: string;
            cost: number;
        };
        billing_address: {
            email: string
        },
        payment: {
            name: string;
            method: string | null;
            cost: number;
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