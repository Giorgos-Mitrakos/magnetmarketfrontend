// «Ειδοποίησέ με όταν είναι διαθέσιμο» → Strapi v3 POST /api/stock-alerts/subscribe.
// Το Strapi απαντά πάντα το ίδιο μήνυμα (δεν φαίνεται ποιος είναι ήδη γραμμένος).
import { NextRequest, NextResponse } from 'next/server';
import { publicErrorMessage, storefrontFetch, StorefrontApiError } from '@/lib/helpers/storefrontApi';
import { productDocumentIdOf } from '@/lib/helpers/productRef';
import { sessionJwt } from '@/lib/helpers/accountSession';
import { getSession } from '@/app/api/auth/[...nextauth]/options';

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
    const body = await request.json();
    const productDocumentId = await productDocumentIdOf(body);
    if (!productDocumentId) {
      return NextResponse.json({ error: 'Το προϊόν δεν βρέθηκε' }, { status: 400 });
    }

    // Συνδεδεμένος πελάτης: το email του λογαριασμού (όχι από τη φόρμα)
    const jwt = await sessionJwt();
    let email = String(body?.email ?? '').trim();
    if (jwt) {
      const session: any = await getSession().catch(() => null);
      if (session?.user?.email) email = String(session.user.email);
    }

    const data = await storefrontFetch<any>('/stock-alerts/subscribe', {
      jwt,
      body: { productDocumentId, email, website: body.website, source: 'site' },
    });
    const newsletter = body?.newsletter === true && !body?.website ? await subscribeNewsletter(email) : false;
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
