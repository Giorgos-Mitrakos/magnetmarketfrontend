// Εγγραφή στο newsletter → Strapi v3 POST /api/newsletter/subscribe (double opt-in:
// ο πελάτης παίρνει email επιβεβαίωσης). source: footer | popup | checkout | account
import { NextRequest, NextResponse } from "next/server";
import { publicErrorMessage, storefrontFetch, StorefrontApiError } from "@/lib/helpers/storefrontApi";

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const data = await storefrontFetch<any>('/newsletter/subscribe', {
            body: { email: body.email, source: body.source },
        });
        return NextResponse.json({ ...data, message: data?.data?.message });
    } catch (error) {
        const status = error instanceof StorefrontApiError && error.status < 500 ? error.status : 500;
        return NextResponse.json({ message: publicErrorMessage(error) }, { status });
    }
}
