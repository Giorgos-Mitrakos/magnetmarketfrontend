// (2026-11-25) Επαναφορά καλαθιού από τον σύνδεσμο του email υπενθύμισης
import { NextResponse } from "next/server";
import { storefrontFetch, StorefrontApiError } from "@/lib/helpers/storefrontApi";

export const dynamic = 'force-dynamic'

export async function POST(request: Request) {
    try {
        const body = await request.json()
        const data = await storefrontFetch<{ items: unknown[] }>('/storefront/cart-restore', { body: { token: body?.token } })
        return NextResponse.json({ items: Array.isArray(data?.items) ? data.items : [] })
    } catch (error) {
        const status = error instanceof StorefrontApiError ? error.status : 502
        return NextResponse.json({ items: [] }, { status })
    }
}
