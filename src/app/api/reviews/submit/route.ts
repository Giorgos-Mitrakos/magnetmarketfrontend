// (2026-10-23) Αξιολόγηση προϊόντος → Strapi POST /api/storefront/reviews/submit
import { NextRequest, NextResponse } from 'next/server'
import { publicErrorMessage, storefrontFetch, StorefrontApiError } from '@/lib/helpers/storefrontApi'

export async function POST(request: NextRequest) {
    try {
        const body = await request.json()
        const data = await storefrontFetch('/storefront/reviews/submit', { body })
        return NextResponse.json(data)
    } catch (error) {
        const status = error instanceof StorefrontApiError && error.status < 500 ? error.status : 500
        return NextResponse.json({ error: publicErrorMessage(error) }, { status })
    }
}
