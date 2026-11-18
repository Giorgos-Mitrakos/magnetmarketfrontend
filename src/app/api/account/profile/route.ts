// Προφίλ πελάτη (στοιχεία + διευθύνσεις) — Strapi /storefront/account/profile.
// Το JWT του πελάτη το παίρνει ο server από το session· ο browser δεν το στέλνει.
import { NextRequest, NextResponse } from "next/server";
import { sessionJwt } from "@/lib/helpers/accountSession";
import { publicErrorMessage, storefrontFetch, StorefrontApiError } from "@/lib/helpers/storefrontApi";

export const dynamic = 'force-dynamic'

const statusOf = (error: unknown) => error instanceof StorefrontApiError && error.status < 500 ? error.status : 500

export async function GET() {
    const jwt = await sessionJwt()
    if (!jwt) return NextResponse.json({ message: 'Απαιτείται σύνδεση' }, { status: 401 })
    try {
        return NextResponse.json(await storefrontFetch('/storefront/account/profile', { jwt }))
    } catch (error) {
        return NextResponse.json({ message: publicErrorMessage(error) }, { status: statusOf(error) })
    }
}

export async function POST(req: NextRequest) {
    const jwt = await sessionJwt()
    if (!jwt) return NextResponse.json({ message: 'Απαιτείται σύνδεση' }, { status: 401 })
    try {
        const body = await req.json()
        return NextResponse.json(await storefrontFetch('/storefront/account/profile', { body, jwt }))
    } catch (error) {
        return NextResponse.json({ message: publicErrorMessage(error) }, { status: statusOf(error) })
    }
}
