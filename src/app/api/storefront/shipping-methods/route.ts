// Τρόποι αποστολής/πληρωμής από το Strapi, μέσω του server του Next.js
// (ίδιο origin για τον browser — χωρίς CORS / blockers προς το Strapi).
import { NextResponse } from "next/server";
import { storefrontFetch } from "@/lib/helpers/storefrontApi";

export const dynamic = 'force-dynamic'

export async function GET() {
    try {
        const data = await storefrontFetch('/storefront/shipping-methods')
        return NextResponse.json(data, { headers: { 'Cache-Control': 'private, max-age=60' } })
    } catch (error) {
        console.error('shipping-methods:', error)
        return NextResponse.json({ shippings: { data: [] } }, { status: 502 })
    }
}
