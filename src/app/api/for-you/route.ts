// «Προτάσεις για εσάς» (αρχική) — με βάση τα προϊόντα που είδε ο επισκέπτης.
import { NextRequest, NextResponse } from "next/server";
import { publicErrorMessage, storefrontFetch, StorefrontApiError } from "@/lib/helpers/storefrontApi";

export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
    try {
        const body = await req.json().catch(() => ({}))
        const viewed = Array.isArray(body?.viewed)
            ? body.viewed.filter((x: unknown): x is string => typeof x === 'string' && /^[a-z0-9]{10,40}$/i.test(x)).slice(0, 12)
            : []
        if (!viewed.length) return NextResponse.json({ products: [] })
        const limit = Math.min(Math.max(Number(body?.limit) || 8, 4), 12)
        const data = await storefrontFetch('/storefront/for-you', { body: { viewed, limit } })
        return NextResponse.json(data, { headers: { 'Cache-Control': 'private, max-age=300' } })
    } catch (error) {
        const status = error instanceof StorefrontApiError && error.status < 500 ? error.status : 500
        return NextResponse.json({ message: publicErrorMessage(error), products: [] }, { status })
    }
}
