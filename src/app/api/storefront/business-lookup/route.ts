// (2026-11-26) Άντληση στοιχείων επιχείρησης από την ΑΑΔΕ (RgWsPublic2) για τη φόρμα τιμολογίου.
// Μέσω του server του Next (storefrontFetch): το Strapi βλέπει την πραγματική IP του πελάτη για το
// όριο ελέγχων ΑΦΜ. Επιστρέφουμε ΜΟΝΟ τα πεδία της φόρμας (όχι την πλήρη απάντηση της ΑΑΔΕ).
import { NextRequest, NextResponse } from "next/server";
import { storefrontFetch, StorefrontApiError, publicErrorMessage } from "@/lib/helpers/storefrontApi";

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
    const afm = String(req.nextUrl.searchParams.get('afm') ?? '').replace(/\D/g, '')
    if (!/^\d{9}$/.test(afm)) {
        return NextResponse.json({ found: false, message: 'Μη έγκυρο Α.Φ.Μ.' }, { status: 400 })
    }
    try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { data } = await storefrontFetch<{ data: any }>(`/business-lookup/${afm}`)
        if (!data?.found) {
            return NextResponse.json({ found: false, message: 'Δεν βρέθηκαν στοιχεία για αυτό το Α.Φ.Μ. στην ΑΑΔΕ.' })
        }
        return NextResponse.json({
            found: true,
            afm: data.afm,
            name: data.name ?? null,
            doy: data.doy ?? null,
            isActive: data.isActive !== false,
            businessActivity: data.businessActivity ?? null,
            street: data.street ?? null,
            city: data.city ?? null,
            zipCode: data.zipCode ?? null,
        })
    } catch (error) {
        const status = error instanceof StorefrontApiError ? error.status : 502
        return NextResponse.json(
            { found: false, message: publicErrorMessage(error, 'Η ΑΑΔΕ δεν απαντά αυτή τη στιγμή. Συμπληρώστε τα στοιχεία χειροκίνητα.') },
            { status }
        )
    }
}
