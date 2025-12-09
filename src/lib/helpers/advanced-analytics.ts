// Επιπλέον analytics events για καλύτερη κατανόηση user behavior

import { ICartItem } from '@/lib/interfaces/cart';
import { sendGAEvent } from '@next/third-parties/google';
import { createCategories } from './analytics';

// ============================================
// 1. NAVIGATION & UI INTERACTION EVENTS
// ============================================

/**
 * Track mobile menu interactions
 * Χρήση: Όταν ανοίγει/κλείνει το mobile menu
 */
export const trackMobileMenuToggle = (action: 'open' | 'close', location: 'top-left' | 'bottom-nav') => {
    sendGAEvent({
        event: 'menu_interaction',
        menu_type: 'mobile',
        menu_action: action,
        menu_location: location
    });
    console.log(`[Analytics] Mobile menu ${action} from ${location}`);
};

/**
 * Track cart icon clicks (για να δεις ποιο χρησιμοποιούν περισσότερο)
 */
export const trackCartIconClick = (location: 'header' | 'mobile-top-right' | 'mobile-bottom-nav') => {
    sendGAEvent({
        event: 'cart_icon_click',
        cart_location: location
    });
    console.log(`[Analytics] Cart icon clicked at ${location}`);
};

/**
 * Track search interactions
 */
export const trackSearch = (searchTerm: string, resultsCount: number) => {
    sendGAEvent({
        event: 'search',
        search_term: searchTerm,
        results_count: resultsCount
    });
    console.log(`[Analytics] Search: "${searchTerm}" (${resultsCount} results)`);
};

// ============================================
// 2. PRODUCT DISCOVERY EVENTS
// ============================================

/**
 * Track product list views
 * Χρήση: Όταν εμφανίζεται μια λίστα προϊόντων
 * ✅ Δέχεται οποιοδήποτε product type και κάνει αυτόματο conversion
 */
export const trackViewItemList = (
    items: any[], // ✅ Αλλαγή από ICartItem[] σε any[]
    listName: string,
    listId?: string
) => {
    if (!items || items.length === 0) return;

    // ✅ Auto-convert products to proper format
    const formattedItems = items.slice(0, 10).map((item, index) => {
        // Extract values με fallbacks για διαφορετικά structures
        const brand = typeof item.brand === 'string' 
            ? item.brand 
            : item.brand?.name || 'Unknown';
        
        const price = item.is_sale && item.sale_price 
            ? item.sale_price 
            : item.price;

        // Extract category (handle both nested object and simple string)
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
        
        return {
            item_id: item.id.toString(),
            item_name: item.name,
            item_brand: brand,
            item_category: categoryName,
            item_category2: category2,
            item_category3: category3,
            price: Number(price.toFixed(2)),
            index: index,
        };
    });

    sendGAEvent({
        event: 'view_item_list',
        item_list_id: listId || listName.toLowerCase().replace(/\s+/g, '_'),
        item_list_name: listName,
        items: formattedItems
    });

    console.log(`[Analytics] Viewed item list: ${listName} (${items.length} items)`);
};

/**
 * Track banner clicks
 */
export const trackBannerClick = (
    bannerId: string,
    bannerName: string,
    bannerPosition: string,
    destinationUrl?: string
) => {
    sendGAEvent({
        event: 'select_promotion',
        creative_name: bannerName,
        creative_slot: bannerPosition,
        promotion_id: bannerId,
        promotion_name: bannerName,
        items: [{
            item_id: bannerId,
            item_name: bannerName,
        }]
    });
    console.log(`[Analytics] Banner clicked: ${bannerName} at ${bannerPosition}`);
};

/**
 * Track product impressions (όταν γίνεται visible στο viewport)
 * ✅ Δέχεται οποιοδήποτε product type
 */
export const trackProductImpression = (
    item: any, // ✅ Αλλαγή από ICartItem σε any
    listName: string,
    position: number
) => {
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
        event: 'view_item',
        currency: 'EUR',
        value: Number(price.toFixed(2)),
        items: [{
            item_id: item.id.toString(),
            item_name: item.name,
            item_brand: brand,
            item_category: categoryName,
            item_category2: category2,
            item_category3: category3,
            price: Number(price.toFixed(2)),
            index: position,
            item_list_name: listName,
        }]
    });
};

// ============================================
// 3. PRODUCT DETAIL PAGE EVENTS
// ============================================

/**
 * Track product detail view
 * ✅ Δέχεται οποιοδήποτε product type
 */
export const trackViewItem = (item: any) => {
    // Extract values με fallbacks
    const brand = typeof item.brand === 'string' 
        ? item.brand 
        : item.brand?.name || 'Unknown';
    
    const price = item.is_sale && item.sale_price 
        ? item.sale_price 
        : item.price;

    const discount = item.is_sale && item.sale_price 
        ? Number((item.price - item.sale_price).toFixed(2))
        : 0;

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
        event: 'view_item',
        currency: 'EUR',
        value: Number(price.toFixed(2)),
        items: [{
            item_id: item.id.toString(),
            item_name: item.name,
            item_brand: brand,
            item_category: categoryName,
            item_category2: category2,
            item_category3: category3,
            price: Number(price.toFixed(2)),
            discount: discount,
        }]
    });

    console.log(`[Analytics] Viewed product: ${item.name}`);
};

/**
 * Track image gallery interactions
 */
export const trackImageInteraction = (
    productId: number,
    action: 'zoom' | 'change' | 'fullscreen',
    imageIndex?: number
) => {
    sendGAEvent({
        event: 'image_interaction',
        product_id: productId.toString(),
        interaction_type: action,
        image_index: imageIndex
    });
};

/**
 * Track "Add to Wishlist" (αν έχεις)
 * ✅ Δέχεται οποιοδήποτε product type
 */
export const trackAddToWishlist = (item: any) => {
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
        event: 'add_to_wishlist',
        currency: 'EUR',
        value: Number(price.toFixed(2)),
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
// 4. USER ENGAGEMENT EVENTS
// ============================================

/**
 * Track filter usage
 */
export const trackFilterUsage = (
    filterType: 'category' | 'price' | 'brand' | 'availability',
    filterValue: string
) => {
    sendGAEvent({
        event: 'filter_applied',
        filter_type: filterType,
        filter_value: filterValue
    });
    console.log(`[Analytics] Filter applied: ${filterType} = ${filterValue}`);
};

/**
 * Track sort usage
 */
export const trackSortUsage = (sortOption: string) => {
    sendGAEvent({
        event: 'sort_applied',
        sort_option: sortOption
    });
    console.log(`[Analytics] Sort applied: ${sortOption}`);
};

/**
 * Track scroll depth (για να δεις πόσο κάτω πηγαίνουν)
 */
export const trackScrollDepth = (percentage: 25 | 50 | 75 | 100, pageType: string) => {
    sendGAEvent({
        event: 'scroll',
        scroll_depth: percentage,
        page_type: pageType
    });
};

/**
 * Track video plays (αν έχεις product videos)
 */
export const trackVideoPlay = (videoTitle: string, productId?: number) => {
    sendGAEvent({
        event: 'video_start',
        video_title: videoTitle,
        video_provider: 'youtube', // ή 'vimeo', 'custom'
        product_id: productId?.toString()
    });
};

// ============================================
// 5. CONVERSION OPTIMIZATION EVENTS
// ============================================

/**
 * Track coupon field interaction
 */
export const trackCouponInteraction = (action: 'focus' | 'apply' | 'remove', success?: boolean) => {
    sendGAEvent({
        event: 'coupon_interaction',
        coupon_action: action,
        success: success
    });
};

/**
 * Track stock alerts (αν έχεις "Ειδοποίησέ με όταν υπάρχει")
 */
export const trackStockAlert = (productId: number, productName: string) => {
    sendGAEvent({
        event: 'stock_alert_request',
        product_id: productId.toString(),
        product_name: productName
    });
};

/**
 * Track newsletter signup
 */
export const trackNewsletterSignup = (location: 'footer' | 'popup' | 'checkout') => {
    sendGAEvent({
        event: 'newsletter_signup',
        signup_location: location
    });
};

/**
 * Track contact form submissions
 */
export const trackContactForm = (formType: 'contact' | 'support' | 'quote') => {
    sendGAEvent({
        event: 'form_submit',
        form_type: formType
    });
};

// ============================================
// 6. ERROR & ISSUE TRACKING
// ============================================

/**
 * Track form errors
 */
export const trackFormError = (
    formName: string,
    fieldName: string,
    errorType: string
) => {
    sendGAEvent({
        event: 'form_error',
        form_name: formName,
        field_name: fieldName,
        error_type: errorType
    });
};

/**
 * Track out of stock views
 */
export const trackOutOfStock = (productId: number, productName: string) => {
    sendGAEvent({
        event: 'out_of_stock_view',
        product_id: productId.toString(),
        product_name: productName
    });
};