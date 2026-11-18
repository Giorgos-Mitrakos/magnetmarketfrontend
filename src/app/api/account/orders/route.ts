// «Οι παραγγελίες μου» — Strapi /storefront/account/orders (μόνο του πελάτη).
import { NextResponse } from "next/server";
import { sessionJwt } from "@/lib/helpers/accountSession";
import { publicErrorMessage, storefrontFetch, StorefrontApiError } from "@/lib/helpers/storefrontApi";

export const dynamic = 'force-dynamic'

export async function GET() {
    const jwt = await sessionJwt()
    if (!jwt) return NextResponse.json({ message: 'Απαιτείται σύνδεση' }, { status: 401 })
    try {
        return NextResponse.json(await storefrontFetch('/storefront/account/orders', { jwt }))
    } catch (error) {
        const status = error instanceof StorefrontApiError && error.status < 500 ? error.status : 500
        return NextResponse.json({ message: publicErrorMessage(error) }, { status })
    }
}
