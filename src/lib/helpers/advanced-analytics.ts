// lib/helpers/advanced-analytics.ts
import { ICartItem } from '@/lib/interfaces/cart';
import { createCategories } from './analytics';
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

    if (identifier) {
      sendDedupedEvent(eventName, params, identifier);
    } else {
      window.gtag('event', eventName, params);
      if (isDev) console.log(`[Analytics] ✅ Event sent: ${eventName}`, params);
    }
  } catch (error) {
    if (isDev) console.error('[Analytics] Error:', error);
  }
};

// ============================================
// 1. NAVIGATION & UI INTERACTION EVENTS
// ============================================

export const trackMobileMenuToggle = (action: 'open' | 'close', location: 'top-left' | 'bottom-nav') => {
  const identifier = `menu:${action}:${location}`;
  sendEvent('menu_interaction', {
    menu_type: 'mobile',
    menu_action: action,
    menu_location: location
  }, identifier);
};

export const trackCartIconClick = (location: 'header' | 'mobile-top-right' | 'mobile-bottom-nav') => {
  const identifier = `cart_icon:${location}`;
  sendEvent('cart_icon_click', {
    cart_location: location
  }, identifier);
};

export const trackSearch = (searchTerm: string, resultsCount: number) => {
  const identifier = `search:${searchTerm}`;
  sendEvent('search', {
    search_term: searchTerm,
    results_count: resultsCount
  }, identifier);
};

// ============================================
// 2. PRODUCT DISCOVERY EVENTS
// ============================================

export const trackViewItemList = (
  items: any[],
  listName: string,
  listId?: string
) => {
  if (!items || items.length === 0) {
    if (isDev) console.warn('[Analytics] trackViewItemList called with empty items');
    return;
  }

  const formattedItems = items.slice(0, 10).map((item, index) => {
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

  const identifier = listId || listName.toLowerCase().replace(/\s+/g, '_');

  sendEvent('view_item_list', {
    item_list_id: identifier,
    item_list_name: listName,
    items: formattedItems
  }, identifier);
};

export const trackBannerClick = (
  bannerId: string,
  bannerName: string,
  bannerPosition: string,
  destinationUrl?: string
) => {
  const identifier = `banner:${bannerId}`;
  sendEvent('select_promotion', {
    creative_name: bannerName,
    creative_slot: bannerPosition,
    promotion_id: bannerId,
    promotion_name: bannerName,
    items: [{
      item_id: bannerId,
      item_name: bannerName,
    }]
  }, identifier);
};

export const trackProductImpression = (
  item: any,
  listName: string,
  position: number
) => {
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

  const identifier = `impression:${item.id}:${listName}`;

  sendEvent('view_item', {
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
  }, identifier);
};

// ============================================
// 3. PRODUCT DETAIL PAGE EVENTS
// ============================================

export const trackViewItem = (item: any) => {
  const brand = typeof item.brand === 'string'
    ? item.brand
    : item.brand?.name || 'Unknown';

  const price = item.is_sale && item.sale_price
    ? item.sale_price
    : item.price;

  const discount = item.is_sale && item.sale_price
    ? Number((item.price - item.sale_price).toFixed(2))
    : 0;

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

  const identifier = `view_item:${item.id}`;

  sendEvent('view_item', {
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
  }, identifier);
};

export const trackImageInteraction = (
  productId: number,
  action: 'zoom' | 'change' | 'fullscreen',
  imageIndex?: number
) => {
  const identifier = `image:${productId}:${action}:${imageIndex || 0}`;
  sendEvent('image_interaction', {
    product_id: productId.toString(),
    interaction_type: action,
    image_index: imageIndex
  }, identifier);
};

export const trackAddToWishlist = (item: any) => {
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

  const identifier = `wishlist:${item.id}`;

  sendEvent('add_to_wishlist', {
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
  }, identifier);
};

// ============================================
// 4. USER ENGAGEMENT EVENTS
// ============================================

export const trackFilterUsage = (
  filterType: string,
  filterValue: string
) => {
  const identifier = `filter:${filterType}:${filterValue}`;
  sendEvent('filter_applied', {
    filter_type: filterType,
    filter_value: filterValue
  }, identifier);
};

export const trackSortUsage = (sortOption: string) => {
  const identifier = `sort:${sortOption}`;
  sendEvent('sort_applied', {
    sort_option: sortOption
  }, identifier);
};

export const trackScrollDepth = (percentage: 25 | 50 | 75 | 100, pageType: string) => {
  const identifier = `scroll:${pageType}:${percentage}`;
  sendEvent('scroll', {
    scroll_depth: percentage,
    page_type: pageType
  }, identifier);
};

export const trackVideoPlay = (videoTitle: string, productId?: number) => {
  const identifier = `video:${videoTitle}:${productId || 'none'}`;
  sendEvent('video_start', {
    video_title: videoTitle,
    video_provider: 'youtube',
    product_id: productId?.toString()
  }, identifier);
};

// ============================================
// 5. CONVERSION OPTIMIZATION EVENTS
// ============================================

export const trackCouponInteraction = (action: 'focus' | 'apply' | 'remove', success?: boolean, couponCode?: string) => {
  const identifier = `coupon:${action}:${success}`;
  sendEvent('coupon_interaction', {
    coupon_action: action,
    coupon_code: couponCode || 'n/a',
    success: success
  }, identifier);
};

export const trackStockAlert = (productId: number, productName: string) => {
  const identifier = `stock_alert:${productId}`;
  sendEvent('stock_alert_request', {
    product_id: productId.toString(),
    product_name: productName
  }, identifier);
};

export const trackNewsletterSignup = (location: 'footer' | 'popup' | 'checkout' | 'page' | 'account' | 'post-purchase') => {
  const identifier = `newsletter:${location}`;
  sendEvent('newsletter_signup', {
    signup_location: location
  }, identifier);
};

export const trackNewsletterUnsubscribe = (email?: string) => {
  const identifier = `newsletter_unsubscribe:${Date.now()}`;
  sendEvent('newsletter_unsubscribe', {
    // Don't send actual email for privacy
    has_email: !!email
  }, identifier);
};

export const trackContactForm = (formType: 'contact' | 'support' | 'quote') => {
  const identifier = `form:${formType}`;
  sendEvent('form_submit', {
    form_type: formType
  }, identifier);
};

// ============================================
// 6. ERROR & ISSUE TRACKING
// ============================================

export const trackFormError = (
  formName: string,
  fieldName: string,
  errorType: string
) => {
  const identifier = `error:${formName}:${fieldName}:${errorType}`;
  sendEvent('form_error', {
    form_name: formName,
    field_name: fieldName,
    error_type: errorType
  }, identifier);
};

export const trackOutOfStock = (productId: number, productName: string) => {
  const identifier = `out_of_stock:${productId}`;
  sendEvent('out_of_stock_view', {
    product_id: productId.toString(),
    product_name: productName
  }, identifier);
};