// Προτάσεις αναζήτησης όσο πληκτρολογεί ο πελάτης (προϊόντα + κατηγορίες).
import { NextRequest, NextResponse } from "next/server";
import { storefrontFetch } from "@/lib/helpers/storefrontApi";

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
    const q = (req.nextUrl.searchParams.get('q') ?? '').trim().slice(0, 100)
    if (q.length < 2) return NextResponse.json({ products: [], categories: [] })
    try {
        const data = await storefrontFetch(`/storefront/search/suggest?q=${encodeURIComponent(q)}`)
        return NextResponse.json(data, { headers: { 'Cache-Control': 'public, max-age=60' } })
    } catch {
        return NextResponse.json({ products: [], categories: [] })
    }
}
