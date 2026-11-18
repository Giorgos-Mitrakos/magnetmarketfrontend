'use client'
// Καταγράφει το προϊόν στο «Είδατε πρόσφατα» (μόνο στον browser).
import { useEffect } from 'react'
import { addRecentlyViewed } from '@/lib/helpers/recentlyViewed'

export default function TrackRecentlyViewed({ documentId }: { documentId?: string | null }) {
  useEffect(() => {
    addRecentlyViewed(documentId)
  }, [documentId])
  return null
}
