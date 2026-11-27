// (2026-11-26) Έλεγχος άρθρου 45 (πρώην 39α) πριν την παραγγελία: καθεστώς ΦΠΑ του αγοραστή στην ΑΑΔΕ
// (και, αν δοθούν, επαλήθευση εκπροσώπου) + ποια προϊόντα του καλαθιού υπάγονται. Ενημερωτικό μόνο —
// η απαλλαγή εφαρμόζεται από το Strapi, που ξαναελέγχει στην ΑΑΔΕ κατά τη δημιουργία της παραγγελίας.
import { NextRequest, NextResponse } from "next/server";
import { storefrontFetch, StorefrontApiError, publicErrorMessage } from "@/lib/helpers/storefrontApi";

export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
    try {
        const body = await req.json()
        const afm = String(body?.afm ?? '').replace(/\D/g, '')
        if (!/^\d{9}$/.test(afm)) {
            return NextResponse.json({ ok: false, message: 'Μη έγκυρο Α.Φ.Μ.' }, { status: 400 })
        }
        const reprIdentityType = Number(body?.reprIdentityType) || undefined
        const reprIdentityNo = typeof body?.reprIdentityNo === 'string' ? body.reprIdentityNo.trim().slice(0, 5) : undefined
        const reprMobile = typeof body?.reprMobile === 'string' ? body.reprMobile.replace(/[\s-]/g, '').slice(0, 16) : undefined
        const productDocumentIds = Array.isArray(body?.productDocumentIds)
            ? body.productDocumentIds.filter((id: unknown) => typeof id === 'string').slice(0, 100)
            : []

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { data } = await storefrontFetch<{ data: any }>('/article-45-check', {
            body: {
                afm,
                ...(reprIdentityType && reprIdentityNo ? { reprIdentityType, reprIdentityNo, reprMobile } : {}),
                productDocumentIds,
            },
        })
        return NextResponse.json({ ok: true, ...data })
    } catch (error) {
        const status = error instanceof StorefrontApiError ? error.status : 502
        return NextResponse.json(
            { ok: false, message: publicErrorMessage(error, 'Η ΑΑΔΕ δεν απαντά αυτή τη στιγμή.') },
            { status }
        )
    }
}
