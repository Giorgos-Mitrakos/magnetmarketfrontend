// «Ειδοποίησέ με όταν πέσει η τιμή» → Strapi v3 POST /api/stock-alerts/subscribe (alertType: price).
// Συνδεδεμένος πελάτης: το email παίρνεται από τον λογαριασμό (όχι από τη φόρμα)
// και η ειδοποίηση δένεται με τον λογαριασμό (JWT).
import { NextRequest, NextResponse } from 'next/server';
import { publicErrorMessage, storefrontFetch, StorefrontApiError } from '@/lib/helpers/storefrontApi';
import { sessionJwt } from '@/lib/helpers/accountSession';
import { getSession } from '@/app/api/auth/[...nextauth]/options';

export const dynamic = 'force-dynamic'

/** Checkbox «Θέλω να λαμβάνω και προσφορές»: ίδια εγγραφή με το footer (double opt-in) */
async function subscribeNewsletter(email: string): Promise<boolean> {
  try {
    await storefrontFetch('/newsletter/subscribe', { body: { email, source: 'product_alert' } });
    return true;
  } catch {
    return false; // η ειδοποίηση έγινε κανονικά — το newsletter δεν πρέπει να τη «χαλάσει»
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const productDocumentId = String(body?.productDocumentId ?? '');
    if (!/^[a-z0-9]{10,40}$/i.test(productDocumentId)) {
      return NextResponse.json({ error: 'Το προϊόν δεν βρέθηκε' }, { status: 400 });
    }
    const jwt = await sessionJwt();
    let email = String(body?.email ?? '').trim();
    if (jwt) {
      const session: any = await getSession().catch(() => null);
      if (session?.user?.email) email = String(session.user.email);
    }

    const data = await storefrontFetch<any>('/stock-alerts/subscribe', {
      jwt,
      body: {
        productDocumentId,
        email,
        alertType: 'price',
        targetPrice: body?.targetPrice,
        website: body?.website,
        source: 'site_price',
      },
    });
    const newsletter = body?.newsletter === true && !body?.website ? await subscribeNewsletter(String(email)) : false;
    return NextResponse.json({
      success: true,
      message: data?.data?.message,
      newsletterMessage: newsletter ? 'Σας στείλαμε και email επιβεβαίωσης για τις προσφορές — πατήστε τον σύνδεσμο που περιέχει.' : undefined,
    });
  } catch (error) {
    const status = error instanceof StorefrontApiError && error.status < 500 ? error.status : 500;
    return NextResponse.json({ error: publicErrorMessage(error) }, { status });
  }
}
