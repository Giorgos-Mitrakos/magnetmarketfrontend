// lib/queries/storeInfo.ts — (2026-10-26) στοιχεία καταστήματος για τα structured data:
// μεταφορικά (από τις μεταφορικές), χρόνοι (Ρυθμίσεις site), ωράριο/επικοινωνία (Footer).
import { contentCache } from '../helpers/contentCache'

export interface ShippingTier {
  basicFee: number
  basicWeightGrams: number
  feePerKgAbove: number
}

export interface StoreInfo {
  shipping: { name: string | null; mainland: ShippingTier | null; islands: ShippingTier | null; freeOver: number | null }
  delivery: { cutoff: string; handlingDays: [number, number]; transitDays: [number, number]; transitDaysIslands: [number, number] }
  contact: { telephone: string | null; email: string | null; address: string | null; city: string | null; postcode: string | null }
  openingHours: { days: string[]; opens: string; closes: string }[] | null
  openingHoursText: string | null
}

export async function getStoreInfo(): Promise<StoreInfo | null> {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/storefront/store-info`, {
      headers: { 'Content-Type': 'application/json' },
      next: contentCache(300, ['store-info', 'footer']),
    })
    if (!res.ok) return null
    return (await res.json()) as StoreInfo
  } catch {
    return null
  }
}
