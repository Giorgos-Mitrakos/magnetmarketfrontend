'use client'

import { useEffect } from 'react'
import { trackSearch, trackViewItemList } from '@/lib/helpers/advanced-analytics'
import { IProductCard } from '@/lib/interfaces/product'

interface SearchTrackerProps {
  searchTerm?: string
  resultsCount: number
  products?: IProductCard[]
}

export default function SearchTracker({ 
  searchTerm, 
  resultsCount,
  products 
}: SearchTrackerProps) {
  
  useEffect(() => {
    // Track search event
    if (searchTerm) {
      trackSearch(searchTerm, resultsCount)
    }

    // Track view_item_list for search results
    if (products && products.length > 0 && searchTerm) {
      trackViewItemList(
        products, 
        `Search Results: ${searchTerm}`,
        `search_${searchTerm.toLowerCase().replace(/\s+/g, '_')}`
      )
    }
  }, [searchTerm, resultsCount, products])

  // This component doesn't render anything
  return null
}