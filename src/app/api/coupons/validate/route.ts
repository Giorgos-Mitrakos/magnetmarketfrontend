// Έλεγχος κουπονιού: γίνεται με το quote του Strapi (ίδιοι κανόνες με την
// παραγγελία — εξαιρούμενα προϊόντα, ελάχιστο ποσό, χρήσεις ανά email).
// Καμία «δέσμευση» εδώ: η χρήση καταγράφεται μόνο μαζί με την παραγγελία.
// Όριο διαφορετικών κωδικών ανά IP στο Strapi (COUPON_VALIDATE_RATE_LIMIT).
import { NextRequest, NextResponse } from "next/server";
import { publicErrorMessage, storefrontFetch } from "@/lib/helpers/storefrontApi";
import { IQuoteResponse } from "@/lib/helpers/checkoutPayload";

export async function POST(req: NextRequest) {
    try {
        const body = await req.json()
        const code = String(body?.couponCode ?? '').trim()
        if (!code) return NextResponse.json({ valid: false, message: 'Συμπληρώστε τον κωδικό κουπονιού' })
        if (!body?.billing_address?.email_address) {
            return NextResponse.json({ valid: false, message: 'Συμπληρώστε πρώτα το email σας' })
        }
        const quote = await storefrontFetch<IQuoteResponse>('/orders/quote', { body })
        if (!quote.coupon) {
            return NextResponse.json({ valid: false, message: quote.couponError || 'Το κουπόνι δεν είναι έγκυρο' })
        }
        const coupon = {
            id: quote.coupon.code,
            code: quote.coupon.code,
            discountType: quote.coupon.discountType,
            discountValue: quote.coupon.discountValue,
        }
        return NextResponse.json({ valid: true, coupon, discount: Math.round((quote.discount - (quote.bundleDiscount ?? 0)) * 100) / 100 })
    } catch (error) {
        return NextResponse.json({ valid: false, message: publicErrorMessage(error) })
    }
}
