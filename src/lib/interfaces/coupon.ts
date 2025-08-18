export interface ICoupon {
    id: number;
    code: string;
    discountType: 'percentage' | 'fixed_amount' | 'free_shipping';
    discountValue: number;
    description?: string;
}

export interface ICouponValidationResponse {
    valid: boolean;
    coupon?: ICoupon;
    message?: string;
}

export interface ICouponApplianceResponse {
    success: boolean,
    coupon?: ICoupon;
    usageId?: number
    message?: string;
}
