// components/checkout/PurchaseTracker.tsx
'use client';

import { useEffect, useRef } from 'react';
import { useCheckout } from '@/context/checkout';
import { ICartItem } from '@/lib/interfaces/cart';
import { isTransactionTracked } from '@/lib/helpers/analytics';

interface PurchaseTrackerProps {
  orderData: {
    id: number;
    total: number;
    shipping: {
      cost: number;
    };
    products: Array<{
      id: number;
      name: string;
      brand: string | null;
      slug: string;
      image: any;
      price: number;
      status: string;
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
    }>;
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
    if (isTransactionTracked(transactionId)) {
      console.log(`[PurchaseTracker] Transaction ${transactionId} already tracked globally`);
      hasTracked.current = true;
      return;
    }

    try {
      // Μετατροπή order products σε ICartItem format
      const cartItems: ICartItem[] = orderData.products.map(product => ({
        id: product.id,
        name: product.name,
        brand: product.brand,
        slug: product.slug || '',
        image: product.image,
        price: product.price,
        sale_price: product.sale_price,
        is_sale: product.is_sale,
        quantity: product.quantity,
        weight: product.weight || 0,
        isAvailable: product.isAvailable ?? true,
        category: product.category || null,
        sku: product.sku,
        variant: product.variant,
        status: product.status, // ✅ Πρόσθεσα το status field που έλειπε
      }));

      // Υπολογισμός tax (24% VAT)
      const tax = orderData.total * 0.24;
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