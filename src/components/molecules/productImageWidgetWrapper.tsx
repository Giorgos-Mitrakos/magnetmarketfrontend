'use client'
import { useMemo } from 'react'
import ProductImageWidget from './productImageWidget'

export default function ProductImageWidgetWrapper({ productImage, additionalImages, productName }: any) {
  // Memoize το images array - θα έχει το ίδιο reference εκτός αν αλλάξουν τα inputs
  const images = useMemo(() => {
    if (!productImage && !additionalImages?.length) return []
    
    return [
      ...(productImage ? [productImage] : []),
      ...(additionalImages ?? []),
    ]
  }, [productImage, additionalImages]) // props από server component — σταθερά references

  return <ProductImageWidget images={images} productName={productName} />
}