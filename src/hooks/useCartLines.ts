// (2026-10-24) Τρέχουσα κατάσταση των γραμμών του καλαθιού από το Strapi:
// τιμή, διαθεσιμότητα, μέγιστη ποσότητα, εκτίμηση παράδοσης (μία κλήση).
import useSWR from 'swr'
import { ICartItem } from '@/lib/interfaces/cart'

export interface ICartLineInfo {
    key: string
    found: boolean
    id?: number
    documentId?: string
    slug?: string
    price?: number | null
    sale_price?: number | null
    is_sale?: boolean
    status?: string
    backorder?: boolean
    /** Μέγιστη ποσότητα που μπορεί να παραγγελθεί (null = χωρίς όριο) */
    maxQty?: number | null
    delivery?: { from: string; to: string; source: 'stock' | 'supplier' } | null
    /** Εμποδίζει την ολοκλήρωση της παραγγελίας */
    problem: string | null
}

export interface ICartLinesResponse {
    lines: ICartLineInfo[]
    delivery: { from: string; to: string } | null
    canCheckout: boolean
}

export const cartLineKey = (item: ICartItem) => String(item.documentId || item.id)

const fetcher = async ([url, body]: [string, string]): Promise<ICartLinesResponse> => {
    const res = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body })
    if (!res.ok) throw new Error(`Response status: ${res.status}`)
    return res.json()
}

export default function useCartLines(cart: ICartItem[]) {
    const items = cart.map((i) => ({ id: cartLineKey(i), quantity: i.quantity, preorder: !!i.preorderToken }))
    const body = JSON.stringify({ items })
    const { data, error, isLoading } = useSWR<ICartLinesResponse>(
        items.length ? ['/api/storefront/cart-lines', body] : null,
        fetcher,
        { keepPreviousData: true, revalidateOnFocus: true }
    )
    const byKey = new Map<string, ICartLineInfo>()
    for (const l of data?.lines ?? []) if (!byKey.has(l.key)) byKey.set(l.key, l)
    return {
        byKey,
        delivery: data?.delivery ?? null,
        // Αν δεν απαντήσει το Strapi, δεν μπλοκάρουμε (ο έλεγχος γίνεται ξανά στην παραγγελία)
        canCheckout: data ? data.canCheckout : true,
        isLoading,
        error,
    }
}
