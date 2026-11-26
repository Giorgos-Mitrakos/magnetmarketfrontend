// (2026-11-25) Αντίγραφο του καλαθιού προς το Strapi για τις υπενθυμίσεις
// «Ξέχασες κάτι στο καλάθι» — μέσω του server του Next.js (με STOREFRONT_SECRET).
import { NextResponse } from "next/server";
import { storefrontFetch } from "@/lib/helpers/storefrontApi";

export const dynamic = 'force-dynamic'

export async function POST(request: Request) {
    try {
        const body = await request.json()
        const data = await storefrontFetch('/storefront/cart-snapshot', {
            body: {
                cartToken: body?.cartToken,
                email: body?.email,
                items: Array.isArray(body?.items) ? body.items : [],
                cartValue: body?.cartValue,
            },
        })
        return NextResponse.json(data)
    } catch {
        // Δεν επηρεάζει ποτέ τον πελάτη — απλώς δεν κρατήθηκε αντίγραφο
        return NextResponse.json({ ok: false })
    }
}
