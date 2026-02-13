'use client'
import { useMemo } from 'react'
import ProductImageWidget from './productImageWidget'

export default function ProductImageWidgetWrapper({ productImage, additionalImages }: any) {
  // Memoize το images array - θα έχει το ίδιο reference εκτός αν αλλάξουν τα inputs
  const images = useMemo(() => {
    if (!productImage && !additionalImages?.length) return []
    
    return [
      ...(productImage ? [productImage] : []),
      ...(additionalImages ?? []),
    ]
  }, [productImage?.id, additionalImages?.length]) // Track με IDs, όχι references

  return <ProductImageWidget images={images} />
}