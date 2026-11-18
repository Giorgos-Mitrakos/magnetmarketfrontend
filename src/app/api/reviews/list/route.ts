// (2026-10-23) Αξιολογήσεις προϊόντος (σελιδοποίηση / φίλτρο αστεριών) → Strapi GET /api/storefront/reviews
import { NextRequest, NextResponse } from 'next/server'
import { publicErrorMessage, storefrontFetch } from '@/lib/helpers/storefrontApi'

export async function GET(request: NextRequest) {
    const p = request.nextUrl.searchParams
    const product = p.get('product') ?? ''
    if (!/^[a-z0-9]{10,40}$/i.test(product)) return NextResponse.json({ error: 'Λείπει το προϊόν' }, { status: 400 })
    const qs = new URLSearchParams({ product })
    for (const k of ['page', 'pageSize', 'sort', 'rating']) {
        const v = p.get(k)
        if (v && /^[a-z0-9]{1,10}$/i.test(v)) qs.set(k, v)
    }
    try {
        const data = await storefrontFetch(`/storefront/reviews?${qs.toString()}`)
        return NextResponse.json(data)
    } catch (error) {
        return NextResponse.json({ error: publicErrorMessage(error) }, { status: 500 })
    }
}
