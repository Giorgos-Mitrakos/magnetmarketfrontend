// (2026-10-24) Γραμμές καλαθιού (τιμή / διαθεσιμότητα / παράδοση) από το Strapi,
// μέσω του server του Next.js — μία κλήση για όλο το καλάθι.
import { NextResponse } from 'next/server'
import { storefrontFetch, StorefrontApiError } from '@/lib/helpers/storefrontApi'

export const dynamic = 'force-dynamic'

export async function POST(req: Request) {
    let body: any = null
    try {
        body = await req.json()
    } catch {
        return NextResponse.json({ message: 'Μη έγκυρο αίτημα' }, { status: 400 })
    }
    const items = Array.isArray(body?.items) ? body.items.slice(0, 50) : []
    try {
        const data = await storefrontFetch('/storefront/cart-lines', { body: { items } })
        return NextResponse.json(data, { headers: { 'Cache-Control': 'no-store' } })
    } catch (error) {
        const status = error instanceof StorefrontApiError && error.status < 500 ? error.status : 502
        return NextResponse.json({ message: 'Σφάλμα' }, { status })
    }
}
