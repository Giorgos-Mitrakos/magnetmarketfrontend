'use client';

import { useEffect } from 'react';

const BestPriceOrderTracking = ({ orderDetails, products }) => {
  useEffect(() => {
    // Add the order data to BestPrice
    if (typeof bp === 'function') {
      // Add the order itself
      bp('addOrder', {
        orderId: orderDetails.orderId,
        revenue: orderDetails.revenue,
        shipping: orderDetails.shipping,
        tax: orderDetails.tax,
        // method,
        currency: orderDetails.currency,
      });

      // Add each product
      if (products && products.length > 0) {
        products.forEach((product) => {
          bp('addProduct', {
            orderId: orderDetails.orderId,
            productId: product.productId,
            title: product.title,
            price: product.price,
            quantity: product.quantity,
          });
        });
      }
    }
  }, [orderDetails, products]);

  return null; // This component is purely for logic, so no visible output
};

export default BestPriceOrderTracking;
