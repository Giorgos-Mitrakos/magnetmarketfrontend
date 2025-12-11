// lib/helpers/analytics.ts

import { ICartItem } from '@/lib/interfaces/cart';
import { getCartTotal } from './checkout';
import { sendDedupedEvent } from './event-deduplication';

// ============================================
// DEV MODE CHECK
// ============================================
const isDev = process.env.NODE_ENV === 'development';

// ============================================
// NATIVE GTAG EVENT SENDER (with deduplication)
// ============================================

const sendEvent = (eventName: string, params: any, identifier?: string) => {
  try {
    if (typeof window === 'undefined') {
      if (isDev) console.warn('[Analytics] Attempted to track in SSR');
      return;
    }

    if (typeof window.gtag === 'undefined') {
      if (isDev) console.error('[Analytics] gtag not available');
      return;
    }

    // ✅ Use deduplication if identifier provided
    if (identifier) {
      sendDedupedEvent(eventName, params, identifier);
    } else {
      // No deduplication
      window.gtag('event', eventName, params);
      if (isDev) console.log(`[Analytics] ✅ Event sent: ${eventName}`, params);
    }
  } catch (error) {
    if (isDev) console.error('[Analytics] Error:', error);
  }
};

// ============================================
// DUPLICATE TRACKING PREVENTION (for purchases)
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

    const category3 = item.category.name;
    const parent1 = item.category.parents?.[0];
    const category2 = parent1?.name;
    const parent2 = parent1?.parents?.[0];
    const category1 = parent2?.name;

    return {
        item_category: category1 || category2 || category3,
        item_category2: category1 ? category2 : undefined,
        item_category3: category1 ? category3 : (category2 ? undefined : undefined),
    };
};

// ============================================
// CART HASH GENERATOR (for deduplication)
// ============================================

const generateCartHash = (items: ICartItem[]): string => {
  return items
    .map(item => `${item.id}:${item.quantity}`)
    .sort()
    .join('|');
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
        if (isDev) console.warn(`[Analytics] Attempted to track ${event} with empty items`);
        return;
    }

    const totalValue = getCartTotal(items);
    const cartHash = generateCartHash(items);

    const params = {
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
    };

    sendEvent(event, params, cartHash);
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

export const trackAddToCart = (item: ICartItem, quantity: number = 1) => {
    const categories = createCategories(item);
    const price = item.is_sale && item.sale_price ? item.sale_price : item.price;
    
    const params = {
        currency: "EUR",
        value: Number((price * quantity).toFixed(2)),
        items: [{
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
            quantity: quantity,
        }]
    };

    const identifier = `${item.id}:${quantity}`;
    sendEvent('add_to_cart', params, identifier);
};

export const trackRemoveFromCart = (item: ICartItem) => {
    const categories = createCategories(item);
    const price = item.is_sale && item.sale_price ? item.sale_price : item.price;
    
    const params = {
        currency: "EUR",
        value: Number((price * item.quantity).toFixed(2)),
        items: [{
            item_id: item.id.toString(),
            item_name: item.name,
            item_brand: item.brand || 'Unknown',
            item_category: categories.item_category,
            item_category2: categories.item_category2,
            item_category3: categories.item_category3,
            price: Number(price.toFixed(2)),
            quantity: item.quantity,
        }]
    };

    const identifier = item.id.toString();
    sendEvent('remove_from_cart', params, identifier);
};

export const trackSelectItem = (item: any, listName?: string) => {
    const brand = typeof item.brand === 'string'
        ? item.brand
        : item.brand?.name || 'Unknown';

    const price = item.is_sale && item.sale_price
        ? item.sale_price
        : item.price;

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

    const params = {
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
    };

    const identifier = `${item.id}:${listName || 'unknown'}`;
    sendEvent('select_item', params, identifier);
};

// ============================================
// PURCHASE EVENT TRACKER
// ============================================

export const trackPurchase = (
    items: ICartItem[],
    transactionId: string,
    shipping: number,
    tax: number,
    coupon?: string
) => {
    if (isTransactionTracked(transactionId)) {
        if (isDev) console.warn(`[Analytics] Purchase ${transactionId} already tracked. Skipping.`);
        return;
    }

    if (!items || items.length === 0) {
        if (isDev) console.error(`[Analytics] Cannot track purchase ${transactionId} with empty items`);
        return;
    }

    const value = items.reduce((total, item) => {
        const price = item.is_sale && item.sale_price ? item.sale_price : item.price;
        return total + (price * item.quantity);
    }, 0);

    const params = {
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
    };

    sendEvent('purchase', params, transactionId);
    markTransactionAsTracked(transactionId);
};