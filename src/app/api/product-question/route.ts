// (2026-10-23) «Ερωτήσεις & απαντήσεις» της σελίδας προϊόντος → Strapi
// POST /api/product-inquiries/submit (type: general). Η ερώτηση πάει στο admin
// («Αιτήματα πελατών»)· αν ο πελάτης συμφωνήσει (allowPublic), ο διαχειριστής
// μπορεί να τη δημοσιεύσει μαζί με την απάντηση. Όριο αιτημάτων ανά IP στο Strapi.
import { NextRequest, NextResponse } from 'next/server';
import { publicErrorMessage, storefrontFetch, StorefrontApiError } from '@/lib/helpers/storefrontApi';
import { productDocumentIdOf } from '@/lib/helpers/productRef';
import { sessionJwt } from '@/lib/helpers/accountSession';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const productDocumentId = await productDocumentIdOf(body);
        if (!productDocumentId) {
            return NextResponse.json({ error: 'Το προϊόν δεν βρέθηκε' }, { status: 400 });
        }

        const data = await storefrontFetch('/product-inquiries/submit', {
            jwt: await sessionJwt(),
            body: {
                type: 'general',
                productDocumentId,
                name: body.name,
                email: body.email,
                phone: body.phone || undefined,
                message: body.message,
                allowPublic: body.allowPublic === true,
                website: body.website,
                source: 'product_qa',
            },
        });
        return NextResponse.json(data);
    } catch (error) {
        const status = error instanceof StorefrontApiError && error.status < 500 ? error.status : 500;
        return NextResponse.json({ error: publicErrorMessage(error) }, { status });
    }
}
