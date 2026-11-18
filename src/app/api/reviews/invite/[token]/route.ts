// (2026-10-23) Στοιχεία πρόσκλησης αξιολόγησης → Strapi GET /api/storefront/reviews/invite/:token
import { NextResponse } from 'next/server'
import { publicErrorMessage, storefrontFetch, StorefrontApiError } from '@/lib/helpers/storefrontApi'

export async function GET(_req: Request, props: { params: Promise<{ token: string }> }) {
    const params = await props.params;
    const token = String(params.token ?? '')
    if (!/^[A-Za-z0-9_-]{16,64}$/.test(token)) return NextResponse.json({ error: 'Ο σύνδεσμος δεν είναι έγκυρος.' }, { status: 404 })
    try {
        const data = await storefrontFetch(`/storefront/reviews/invite/${encodeURIComponent(token)}`)
        return NextResponse.json(data)
    } catch (error) {
        const status = error instanceof StorefrontApiError && error.status < 500 ? error.status : 500
        return NextResponse.json({ error: publicErrorMessage(error) }, { status })
    }
}
