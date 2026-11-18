// Αλλαγές στα αγαπημένα του συνδεδεμένου πελάτη:
//   POST /api/account/wishlist/add       { productDocumentId }
//   POST /api/account/wishlist/remove    { productDocumentId }
//   POST /api/account/wishlist/merge     { productDocumentIds: [] }  (λίστα του browser μετά τη σύνδεση)
//   POST /api/account/wishlist/settings  { notify }
import { NextRequest, NextResponse } from "next/server";
import { sessionJwt } from "@/lib/helpers/accountSession";
import { publicErrorMessage, storefrontFetch, StorefrontApiError } from "@/lib/helpers/storefrontApi";

export const dynamic = 'force-dynamic'

const ACTIONS = ['add', 'remove', 'merge', 'settings'] as const
type Action = (typeof ACTIONS)[number]

const statusOf = (error: unknown) => error instanceof StorefrontApiError && error.status < 500 ? error.status : 500

export async function POST(req: NextRequest, props: { params: Promise<{ action: string }> }) {
    const params = await props.params;
    const action = params.action as Action
    if (!ACTIONS.includes(action)) return NextResponse.json({ message: 'Not found' }, { status: 404 })
    const jwt = await sessionJwt()
    if (!jwt) return NextResponse.json({ message: 'Απαιτείται σύνδεση' }, { status: 401 })
    try {
        const body = await req.json().catch(() => ({}))
        // Μόνο τα πεδία που χρειάζεται κάθε ενέργεια
        const payload =
            action === 'merge' ? { productDocumentIds: Array.isArray(body?.productDocumentIds) ? body.productDocumentIds.slice(0, 200) : [] }
            : action === 'settings' ? { notify: !!body?.notify }
            : { productDocumentId: String(body?.productDocumentId ?? '') }
        return NextResponse.json(await storefrontFetch(`/storefront/account/wishlist/${action}`, { body: payload, jwt }))
    } catch (error) {
        return NextResponse.json({ message: publicErrorMessage(error) }, { status: statusOf(error) })
    }
}
