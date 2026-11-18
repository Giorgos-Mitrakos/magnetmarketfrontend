// Τρέχουσα τιμή/διαθεσιμότητα προϊόντος (καλάθι) από το Strapi, μέσω του
// server του Next.js.
import { NextResponse } from "next/server";
import { storefrontFetch, StorefrontApiError } from "@/lib/helpers/storefrontApi";

export const dynamic = 'force-dynamic'

export async function GET(_req: Request, props: { params: Promise<{ id: string }> }) {
    const params = await props.params;
    const id = String(params.id ?? '')
    if (!/^[A-Za-z0-9]{1,64}$/.test(id)) {
        return NextResponse.json({ message: 'Not found' }, { status: 404 })
    }
    try {
        const data = await storefrontFetch(`/storefront/product-price/${id}`)
        return NextResponse.json(data, { headers: { 'Cache-Control': 'no-store' } })
    } catch (error) {
        const status = error instanceof StorefrontApiError && error.status === 404 ? 404 : 502
        return NextResponse.json({ message: 'Σφάλμα' }, { status })
    }
}
