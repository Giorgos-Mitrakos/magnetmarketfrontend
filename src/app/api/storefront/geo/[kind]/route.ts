// Νομοί / περιοχές / Τ.Κ. από το Strapi, μέσω του server του Next.js.
import { NextRequest, NextResponse } from "next/server";
import { storefrontFetch } from "@/lib/helpers/storefrontApi";

const KINDS = ['countries', 'states', 'regions', 'postals']

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest, props: { params: Promise<{ kind: string }> }) {
    const params = await props.params;
    if (!KINDS.includes(params.kind)) {
        return NextResponse.json({ message: 'Not found' }, { status: 404 })
    }
    const query = new URLSearchParams()
    for (const key of ['country', 'state', 'region']) {
        const v = req.nextUrl.searchParams.get(key)
        if (v) query.set(key, v)
    }
    try {
        const data = await storefrontFetch(`/storefront/geo/${params.kind}${query.toString() ? `?${query}` : ''}`)
        return NextResponse.json(data, { headers: { 'Cache-Control': 'public, max-age=3600' } })
    } catch (error) {
        console.error('geo:', error)
        return NextResponse.json({ message: 'Σφάλμα' }, { status: 502 })
    }
}
