// «Ζητήστε τιμή» → Strapi v3 POST /api/product-inquiries/submit (type: price_request).
// Η ερώτηση εμφανίζεται στο admin (Αιτήματα πελατών) και ο πελάτης παίρνει
// email επιβεβαίωσης. Όριο αιτημάτων ανά IP στο Strapi.
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
                type: 'price_request',
                productDocumentId,
                name: body.name,
                email: body.email,
                phone: body.phone,
                message: body.message,
                quantity: body.quantity,
                website: body.website,
                source: 'site',
            },
        });
        return NextResponse.json(data);
    } catch (error) {
        const status = error instanceof StorefrontApiError && error.status < 500 ? error.status : 500;
        return NextResponse.json({ error: publicErrorMessage(error) }, { status });
    }
}
