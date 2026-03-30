// components/checkout/GoogleCustomerReviews.tsx
'use client';

import { useEffect, useRef } from 'react';
import Script from 'next/script';

interface GoogleCustomerReviewsProps {
  orderId: string;
  email: string;
  deliveryCountry?: string;
  estimatedDeliveryDate: string; // Format: "YYYY-MM-DD"
  products?: Array<{
    gtin?: string; // GTIN/Barcode/MPN του προϊόντος
  }>;
}

// Extend Window interface για TypeScript
declare global {
  interface Window {
    gapi?: any;
    renderOptIn?: () => void;
  }
}

export default function GoogleCustomerReviews({
  orderId,
  email,
  deliveryCountry = 'GR', // Default Greece
  estimatedDeliveryDate,
  products,
}: GoogleCustomerReviewsProps) {
  const hasRendered = useRef(false);

  useEffect(() => {
    // Προστασία από multiple renders
    if (hasRendered.current) return;

    // Validation
    if (!orderId || !email || !estimatedDeliveryDate) {
      console.warn('[GoogleCustomerReviews] Missing required fields:', {
        orderId,
        email,
        estimatedDeliveryDate,
      });
      return;
    }

    // Ορισμός της renderOptIn function
    window.renderOptIn = function() {
      if (!window.gapi) {
        console.error('[GoogleCustomerReviews] Google API (gapi) not loaded');
        return;
      }

      window.gapi.load('surveyoptin', function() {
        const config: any = {
          // REQUIRED FIELDS
          merchant_id: 532239309, // Το Merchant ID σου από το Google Merchant Center
          order_id: orderId,
          email: email,
          delivery_country: deliveryCountry,
          estimated_delivery_date: estimatedDeliveryDate,
        };

        // OPTIONAL FIELDS - Προσθήκη GTINs/MPNs αν υπάρχουν
        if (products && products.length > 0) {
          const validProducts = products.filter(p => p.gtin);
          if (validProducts.length > 0) {
            config.products = validProducts;
            console.log(`[GoogleCustomerReviews] Adding ${validProducts.length} products with identifiers`);
          }
        }

        console.log('[GoogleCustomerReviews] Rendering opt-in with config:', config);

        try {
          window.gapi.surveyoptin.render(config);
          hasRendered.current = true;
          console.log('[GoogleCustomerReviews] ✅ Opt-in rendered successfully');
        } catch (error) {
          console.error('[GoogleCustomerReviews] Error rendering opt-in:', error);
        }
      });
    };

    return () => {
      // Cleanup
      if (window.renderOptIn) {
        delete window.renderOptIn;
      }
    };
  }, [orderId, email, deliveryCountry, estimatedDeliveryDate, products]);

  return (
    <>
      {/* Google API Platform Script */}
      <Script
        src="https://apis.google.com/js/platform.js?onload=renderOptIn"
        strategy="lazyOnload"
        onLoad={() => console.log('[GoogleCustomerReviews] Google API script loaded')}
        onError={() => console.error('[GoogleCustomerReviews] Failed to load Google API script')}
      />
    </>
  );
}