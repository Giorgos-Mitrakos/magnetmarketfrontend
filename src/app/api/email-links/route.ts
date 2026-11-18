// Σύνδεσμοι από emails (διαγραφή, επιβεβαίωση newsletter, ειδοποιήσεις
// διαθεσιμότητας) → Strapi /storefront/email-links/{peek|act}.
// peek: τι θα γίνει (δεν αλλάζει τίποτα) · act: η ενέργεια, μόνο με το κουμπί.
import { NextRequest, NextResponse } from "next/server";
import { publicErrorMessage, storefrontFetch, StorefrontApiError } from "@/lib/helpers/storefrontApi";

export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
    try {
        const body = await req.json()
        const step = body?.step === 'act' ? 'act' : 'peek'
        const data = await storefrontFetch(`/storefront/email-links/${step}`, {
            body: {
                action: body?.action,
                token: body?.token,
                // για την καταγραφή της συγκατάθεσης (επιβεβαίωση newsletter)
                userAgent: req.headers.get('user-agent') ?? undefined,
            },
        })
        return NextResponse.json(data, { headers: { 'Cache-Control': 'no-store' } })
    } catch (error) {
        const status = error instanceof StorefrontApiError && error.status < 500 ? error.status : 500
        return NextResponse.json({ message: publicErrorMessage(error) }, { status })
    }
}
