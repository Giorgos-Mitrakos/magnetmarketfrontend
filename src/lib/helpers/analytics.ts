// lib/helpers/analytics.ts

import { ICartItem } from '@/lib/interfaces/cart';
import { sendGAEvent } from '@next/third-parties/google';
import { getCartTotal } from './checkout';

// ============================================
// DUPLICATE TRACKING PREVENTION
// ============================================

const trackedTransactions = new Set<string>();

export const isTransactionTracked = (transactionId: string): boolean => {
    return trackedTransactions.has(transactionId);
};

export const markTransactionAsTracked = (transactionId: string): void => {
    trackedTransactions.add(transactionId);
};

// ============================================
// CATEGORY MAPPING HELPER
// ============================================

export const createCategories = (item: ICartItem) => {
    if (!item.category) {
        return {
            item_category: 'Uncategorized',
            item_category2: undefined,
            item_category3: undefined,
        };
    }

    // Level 3: Βασική κατηγορία (π.χ. "Laptop")
    const category3 = item.category.name;

    // Level 2: Πρώτο parent (π.χ. "Φορητοί Υπολογιστές")
    const parent1 = item.category.parents?.[0];
    const category2 = parent1?.name;

    // Level 1: Δεύτερο parent (π.χ. "Υπολογιστες")
    const parent2 = parent1?.parents?.[0];
    const category1 = parent2?.name;

    return {
        item_category: category1 || category2 || category3,
        item_category2: category1 ? category2 : undefined,
        item_category3: category1 ? category3 : (category2 ? undefined : undefined),
    };
};

// ============================================
// BASE CART EVENT TRACKER
// ============================================

export const trackCartEvent = (
    event: string,
    items: ICartItem[],
    additionalParams = {}
) => {
    if (!items || items.length === 0) {
        console.warn(`[Analytics] Attempted to track ${event} with empty items`);
        return;
    }

    const totalValue = getCartTotal(items);

    sendGAEvent({
        event: event,
        currency: "EUR",
        value: Number(totalValue.toFixed(2)),
        items: items.map(item => {
            const categories = createCategories(item);
            const price = item.is_sale && item.sale_price ? item.sale_price : item.price;

            return {
                item_id: item.id.toString(),
                item_name: item.name,
                item_brand: item.brand || 'Unknown',
                discount: item.is_sale && item.sale_price
                    ? Number((item.price - item.sale_price).toFixed(2))
                    : 0,
                item_category: categories.item_category,
                item_category2: categories.item_category2,
                item_category3: categories.item_category3,
                price: Number(price.toFixed(2)),
                quantity: item.quantity,
            }
        }),
        ...additionalParams
    });

    console.log(`[Analytics] ✅ Tracked ${event}:`, {
        value: totalValue.toFixed(2),
        items: items.length
    });
};

// ============================================
// SPECIFIC EVENT TRACKERS
// ============================================

export const trackViewCart = (items: ICartItem[]) => {
    trackCartEvent('view_cart', items);
};

export const trackBeginCheckout = (items: ICartItem[], coupon?: string) => {
    trackCartEvent('begin_checkout', items, {
        coupon: coupon || undefined
    });
};

export const trackAddShippingInfo = (items: ICartItem[], shippingTier?: string) => {
    trackCartEvent('add_shipping_info', items, {
        shipping_tier: shippingTier || undefined
    });
};

export const trackAddPaymentInfo = (items: ICartItem[], paymentType: string) => {
    trackCartEvent('add_payment_info', items, {
        payment_type: paymentType
    });
};

/**
 * Track select_item - ✅ Δέχεται οποιοδήποτε product type
 */
export const trackSelectItem = (item: any, listName?: string) => {
    // Extract values με fallbacks
    const brand = typeof item.brand === 'string'
        ? item.brand
        : item.brand?.name || 'Unknown';

    const price = item.is_sale && item.sale_price
        ? item.sale_price
        : item.price;

    // Extract category
    let categoryName = 'Uncategorized';
    let category2 = undefined;
    let category3 = undefined;

    if (item.category) {
        if (typeof item.category === 'string') {
            categoryName = item.category;
        } else if (item.category.name) {
            category3 = item.category.name;
            const parent1 = item.category.parents?.[0];
            category2 = parent1?.name;
            const parent2 = parent1?.parents?.[0];
            categoryName = parent2?.name || category2 || category3;
        }
    }

    sendGAEvent({
        event: 'select_item',
        item_list_name: listName || undefined,
        items: [{
            item_id: item.id.toString(),
            item_name: item.name,
            item_brand: brand,
            item_category: categoryName,
            item_category2: category2,
            item_category3: category3,
            price: Number(price.toFixed(2)),
        }]
    });
};

// ============================================
// PURCHASE EVENT TRACKER (με duplicate protection)
// ============================================

export const trackPurchase = (
    items: ICartItem[],
    transactionId: string,
    shipping: number,
    tax: number,
    coupon?: string
) => {
    // Έλεγχος για duplicate tracking
    if (isTransactionTracked(transactionId)) {
        console.warn(`[Analytics] Purchase ${transactionId} already tracked. Skipping.`);
        return;
    }

    if (!items || items.length === 0) {
        console.error(`[Analytics] Cannot track purchase ${transactionId} with empty items`);
        return;
    }

    // Υπολογισμός value (μόνο προϊόντα, χωρίς shipping/tax)
    const value = items.reduce((total, item) => {
        const price = item.is_sale && item.sale_price ? item.sale_price : item.price;
        return total + (price * item.quantity);
    }, 0);

    sendGAEvent({
        event: 'purchase',
        transaction_id: transactionId,
        value: Number(value.toFixed(2)),
        currency: "EUR",
        shipping: Number(shipping.toFixed(2)),
        tax: Number(tax.toFixed(2)),
        coupon: coupon || undefined,
        items: items.map(item => {
            const categories = createCategories(item);
            const price = item.is_sale && item.sale_price ? item.sale_price : item.price;

            return {
                item_id: item.id.toString(),
                item_name: item.name,
                item_brand: item.brand || 'Unknown',
                discount: item.is_sale && item.sale_price
                    ? Number((item.price - item.sale_price).toFixed(2))
                    : 0,
                item_category: categories.item_category,
                item_category2: categories.item_category2,
                item_category3: categories.item_category3,
                price: Number(price.toFixed(2)),
                quantity: item.quantity,
            }
        })
    });

    // Σημειώνουμε ότι έγινε track
    markTransactionAsTracked(transactionId);

    console.log(`[Analytics] ✅ Tracked purchase ${transactionId}:`, {
        value: value.toFixed(2),
        shipping: shipping.toFixed(2),
        tax: tax.toFixed(2),
        items: items.length
    });
};