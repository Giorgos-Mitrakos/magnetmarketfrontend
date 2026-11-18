// (2026-10-24) Κόστος κάθε τρόπου αποστολής για το καλάθι / διεύθυνση / κουπόνι,
// από το Strapi (ίδιος υπολογισμός με την παραγγελία). Ο browser στέλνει μόνο επιλογές.
import { NextRequest, NextResponse } from 'next/server'
import { publicErrorMessage, storefrontFetch, StorefrontApiError } from '@/lib/helpers/storefrontApi'

export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
    try {
        const body = await req.json()
        const data = await storefrontFetch('/storefront/shipping-options', { body })
        return NextResponse.json(data, { headers: { 'Cache-Control': 'no-store' } })
    } catch (error) {
        const status = error instanceof StorefrontApiError && error.status < 500 ? error.status : 500
        return NextResponse.json({ message: publicErrorMessage(error) }, { status })
    }
}
