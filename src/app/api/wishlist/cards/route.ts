// Κάρτες προϊόντων για τη λίστα αγαπημένων του επισκέπτη (documentIds από τον browser του).
import { NextRequest, NextResponse } from "next/server";
import { publicErrorMessage, storefrontFetch, StorefrontApiError } from "@/lib/helpers/storefrontApi";

export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
    try {
        const body = await req.json().catch(() => ({}))
        const documentIds = Array.isArray(body?.documentIds) ? body.documentIds.filter((x: unknown) => typeof x === 'string').slice(0, 200) : []
        if (!documentIds.length) return NextResponse.json({ products: [] })
        return NextResponse.json(await storefrontFetch('/storefront/wishlist/cards', { body: { documentIds } }))
    } catch (error) {
        const status = error instanceof StorefrontApiError && error.status < 500 ? error.status : 500
        return NextResponse.json({ message: publicErrorMessage(error) }, { status })
    }
}
