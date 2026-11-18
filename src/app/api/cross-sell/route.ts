// Προτάσεις cross-selling («Συχνά αγοράζονται μαζί») για καλάθι / παράθυρο προσθήκης.
import { NextRequest, NextResponse } from "next/server";
import { publicErrorMessage, storefrontFetch, StorefrontApiError } from "@/lib/helpers/storefrontApi";

export const dynamic = 'force-dynamic'

const ids = (v: unknown, max: number) =>
    Array.isArray(v) ? v.filter((x): x is string => typeof x === 'string' && x.length <= 40).slice(0, max) : []

export async function POST(req: NextRequest) {
    try {
        const body = await req.json().catch(() => ({}))
        const documentIds = ids(body?.documentIds, 20)
        if (!documentIds.length) return NextResponse.json({ products: [] })
        const limit = Math.min(Math.max(Number(body?.limit) || 6, 1), 12)
        const data = await storefrontFetch('/storefront/cross-sell', {
            body: { documentIds, exclude: ids(body?.exclude, 100), limit },
        })
        return NextResponse.json(data, { headers: { 'Cache-Control': 'private, max-age=120' } })
    } catch (error) {
        const status = error instanceof StorefrontApiError && error.status < 500 ? error.status : 500
        return NextResponse.json({ message: publicErrorMessage(error), products: [] }, { status })
    }
}
