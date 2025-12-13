import { ICartItem } from '@/lib/interfaces/cart';

// Extend Window interface
declare global {
    interface Window {
        fbq?: (...args: any[]) => void;
    }
}

// ============================================
// DEV MODE CHECK
// ============================================
const isDev = process.env.NODE_ENV === 'development';

// Helper για να ελέγξουμε αν το fbq είναι διαθέσιμο
const isFBPixelLoaded = (): boolean => {
    return typeof window !== 'undefined' && typeof window.fbq !== 'undefined';
};

// ============================================
// FACEBOOK PIXEL EVENTS
// ============================================

/**
 * Track Page View
 * Καλείται αυτόματα όταν φορτώνει η σελίδα
 */
export const fbTrackPageView = () => {
    if (!isFBPixelLoaded()) return;
    window.fbq!('track', 'PageView');
    if (isDev) console.log('[FB Pixel] PageView tracked');
};

/**
 * Track View Content (Product Page)
 */
export const fbTrackViewContent = (
    item: ICartItem,
    contentType: 'product' | 'product_group' = 'product'
) => {
    if (!isFBPixelLoaded()) return;

    const price = item.is_sale && item.sale_price ? item.sale_price : item.price;

    window.fbq!('track', 'ViewContent', {
        content_ids: [item.id.toString()],
        content_type: contentType,
        content_name: item.name,
        content_category: item.category?.name || 'Uncategorized',
        value: price,
        currency: 'EUR'
    });

    if (isDev) console.log('[FB Pixel] ViewContent:', item.name);
};

/**
 * Track Search
 */
export const fbTrackSearch = (searchTerm: string) => {
    if (!isFBPixelLoaded()) return;

    window.fbq!('track', 'Search', {
        search_string: searchTerm
    });

    if (isDev) console.log('[FB Pixel] Search:', searchTerm);
};

/**
 * Track Add to Cart
 */
export const fbTrackAddToCart = (item: ICartItem) => {
    if (!isFBPixelLoaded()) return;

    const price = item.is_sale && item.sale_price ? item.sale_price : item.price;

    window.fbq!('track', 'AddToCart', {
        content_ids: [item.id.toString()],
        content_type: 'product',
        content_name: item.name,
        content_category: item.category?.name || 'Uncategorized',
        value: price * item.quantity,
        currency: 'EUR'
    });

    if (isDev) console.log('[FB Pixel] AddToCart:', item.name);
};

/**
 * Track Add to Wishlist
 */
export const fbTrackAddToWishlist = (item: ICartItem) => {
    if (!isFBPixelLoaded()) return;

    const price = item.is_sale && item.sale_price ? item.sale_price : item.price;

    window.fbq!('track', 'AddToWishlist', {
        content_ids: [item.id.toString()],
        content_type: 'product',
        content_name: item.name,
        value: price,
        currency: 'EUR'
    });

    if (isDev) console.log('[FB Pixel] AddToWishlist:', item.name);
};

/**
 * Track Initiate Checkout
 */
export const fbTrackInitiateCheckout = (items: ICartItem[]) => {
    if (!isFBPixelLoaded()) return;

    const totalValue = items.reduce((sum, item) => {
        const price = item.is_sale && item.sale_price ? item.sale_price : item.price;
        return sum + (price * item.quantity);
    }, 0);

    const contentIds = items.map(item => item.id.toString());

    window.fbq!('track', 'InitiateCheckout', {
        content_ids: contentIds,
        content_type: 'product',
        num_items: items.length,
        value: totalValue,
        currency: 'EUR'
    });

    if (isDev) console.log('[FB Pixel] InitiateCheckout:', {
        items: items.length,
        value: totalValue
    });
};

/**
 * Track Add Payment Info
 */
export const fbTrackAddPaymentInfo = (items: ICartItem[]) => {
    if (!isFBPixelLoaded()) return;

    const totalValue = items.reduce((sum, item) => {
        const price = item.is_sale && item.sale_price ? item.sale_price : item.price;
        return sum + (price * item.quantity);
    }, 0);

    window.fbq!('track', 'AddPaymentInfo', {
        content_ids: items.map(item => item.id.toString()),
        content_type: 'product',
        value: totalValue,
        currency: 'EUR'
    });

    if (isDev) console.log('[FB Pixel] AddPaymentInfo');
};

/**
 * Track Purchase (Conversion Event)
 */
export const fbTrackPurchase = (
    items: ICartItem[],
    transactionId: string,
    totalValue: number
) => {
    if (!isFBPixelLoaded()) return;

    const contentIds = items.map(item => item.id.toString());
    const contents = items.map(item => {
        const price = item.is_sale && item.sale_price ? item.sale_price : item.price;
        return {
            id: item.id.toString(),
            quantity: item.quantity,
            item_price: price
        };
    });

    window.fbq!('track', 'Purchase', {
        content_ids: contentIds,
        content_type: 'product',
        contents: contents,
        num_items: items.length,
        value: totalValue,
        currency: 'EUR'
    });

    if (isDev) console.log('[FB Pixel] Purchase:', {
        transaction_id: transactionId,
        value: totalValue,
        items: items.length
    });
};

/**
 * Track Contact (Form submission)
 */
export const fbTrackContact = () => {
    if (!isFBPixelLoaded()) return;

    window.fbq!('track', 'Contact');
    if (isDev) console.log('[FB Pixel] Contact form submitted');
};

/**
 * Track Lead (Newsletter signup)
 */
export const fbTrackLead = () => {
    if (!isFBPixelLoaded()) return;

    window.fbq!('track', 'Lead');
    if (isDev) console.log('[FB Pixel] Lead captured');
};

/**
 * Custom Event - για custom tracking
 */
export const fbTrackCustomEvent = (eventName: string, parameters?: any) => {
    if (!isFBPixelLoaded()) return;

    window.fbq!('trackCustom', eventName, parameters);
    if (isDev) console.log('[FB Pixel] Custom event:', eventName, parameters);
};