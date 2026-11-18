// Προεπισκόπηση κόστους καλαθιού/ταμείου: όλα τα ποσά από το Strapi
// (POST /api/orders/quote). Ο browser στέλνει μόνο επιλογές, όχι τιμές.
import { NextRequest, NextResponse } from "next/server";
import { publicErrorMessage, storefrontFetch, StorefrontApiError } from "@/lib/helpers/storefrontApi";

export async function POST(req: NextRequest) {
    try {
        const body = await req.json()
        const data = await storefrontFetch('/orders/quote', { body })
        return NextResponse.json(data)
    } catch (error) {
        const status = error instanceof StorefrontApiError && error.status < 500 ? error.status : 500
        return NextResponse.json({ message: publicErrorMessage(error) }, { status })
    }
}
