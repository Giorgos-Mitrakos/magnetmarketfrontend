// components/checkout/PurchaseTracker.tsx
'use client';

import { useEffect, useRef } from 'react';
import { useCheckout } from '@/context/checkout';
import { ICartItem } from '@/lib/interfaces/cart';
import { IOrderProduct } from '@/lib/interfaces/order';
import { isTransactionTracked } from '@/lib/helpers/analytics';

interface PurchaseTrackerProps {
  // Σύνοψη παραγγελίας από το Strapi v3 (id = αριθμός παραγγελίας)
  orderData: {
    id: number | string;
    /** ΦΠΑ της παραγγελίας (17% στα νησιά) */
    vatTotal?: number;
    total: number;
    shipping: {
      cost: number;
    };
    products: IOrderProduct[];
  };
  appliedCoupon?: string | null;
}

export default function PurchaseTracker({ orderData, appliedCoupon }: PurchaseTrackerProps) {
  const { dispatch } = useCheckout();
  const hasTracked = useRef(false);

  useEffect(() => {
    // Προστασία από multiple renders
    if (hasTracked.current) {
      console.log('[PurchaseTracker] Already tracked in this component');
      return;
    }

    if (!orderData || !orderData.products || orderData.products.length === 0) {
      console.warn('[PurchaseTracker] No order data or products');
      return;
    }

    const transactionId = orderData.id.toString();

    // Έλεγχος αν έχει ήδη καταγραφεί globally
    // (2026-10-25) Ακόμα κι αν έχει ήδη καταγραφεί (π.χ. ανανέωση της σελίδας), το
    // PURCHASE_COMPLETE αδειάζει το καλάθι — το reducer δεν ξαναστέλνει το event

    try {
      // Μετατροπή order products σε ICartItem format
      const cartItems: ICartItem[] = orderData.products.map(product => ({
        id: product.id ?? 0,
        documentId: product.documentId ?? undefined,
        name: product.name,
        brand: product.brand,
        slug: product.slug || '',
        image: product.image as ICartItem['image'],
        price: product.price,
        sale_price: product.sale_price,
        is_sale: product.is_sale,
        quantity: product.quantity,
        weight: product.weight || 0,
        isAvailable: product.isAvailable ?? true,
        category: product.category || null,
        sku: product.sku,
        variant: product.variant,
        status: product.status ?? '',
      }));

      // ΦΠΑ μέσα στο σύνολο (24% → total·24/124), ή ο πραγματικός της παραγγελίας
      const tax = orderData.vatTotal ?? Math.round((orderData.total * 24 / 124) * 100) / 100;
      const shipping = orderData.shipping.cost;

      console.log('[PurchaseTracker] Dispatching PURCHASE_COMPLETE:', {
        transactionId,
        itemsCount: cartItems.length,
        total: orderData.total,
        shipping,
        tax,
        coupon: appliedCoupon,
      });

      // ✅ Dispatch PURCHASE_COMPLETE action
      // Αυτό θα κάνει tracking ΚΑΙ clear το cart
      dispatch({
        type: 'PURCHASE_COMPLETE',
        payload: {
          transactionId,
          shipping,
          tax,
          items: cartItems,
          coupon: appliedCoupon || undefined,
        },
      });

      hasTracked.current = true;
      console.log('[PurchaseTracker] ✅ Dispatched PURCHASE_COMPLETE successfully');
    } catch (error) {
      console.error('[PurchaseTracker] Error dispatching PURCHASE_COMPLETE:', error);
    }
  }, [orderData, appliedCoupon, dispatch]);

  return null;
}