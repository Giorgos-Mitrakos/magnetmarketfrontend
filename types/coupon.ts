export interface Coupon {
    id: number;
    code: string;
    discountType: 'percentage' | 'fixed_amount' | 'free_shipping';
    discountValue: number;
    description?: string;
}

export interface CouponValidationResponse {
    valid: boolean;
    coupon?: Coupon;
    error?: string;
}

export interface CartItem {
    id: number;
    productId: number;
    quantity: number;
    price: number;
    categories?: { id: number }[];
}

export interface Cart {
    items: CartItem[];
    total: number;
}