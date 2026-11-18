// src/app/api/auth/reset-password/route.ts
// (2026-10-26) Ελληνικά μηνύματα και ίδιοι κανόνες κωδικού με την εγγραφή.
import { NextRequest, NextResponse } from 'next/server';

const fail = (message: string, status = 400) => NextResponse.json({ error: { message } }, { status });

/** Ίδιοι κανόνες με τη σελίδα εγγραφής */
function passwordProblem(p: string): string | null {
  if (p.length < 8) return 'Ο κωδικός πρέπει να έχει τουλάχιστον 8 χαρακτήρες.';
  if (!/[0-9]/.test(p)) return 'Ο κωδικός πρέπει να περιλαμβάνει αριθμό.';
  if (!/[a-z]/.test(p)) return 'Ο κωδικός πρέπει να περιλαμβάνει μικρό γράμμα.';
  if (!/[A-Z]/.test(p)) return 'Ο κωδικός πρέπει να περιλαμβάνει κεφαλαίο γράμμα.';
  if (!/[^\w]/.test(p)) return 'Ο κωδικός πρέπει να περιλαμβάνει σύμβολο (π.χ. ! ή @).';
  return null;
}

export async function POST(request: NextRequest) {
  try {
    const { code, password, passwordConfirmation } = await request.json().catch(() => ({}));
    if (!code) return fail('Ο σύνδεσμος επαναφοράς δεν είναι πλήρης. Ανοίξτε τον ξανά από το email.');
    if (!password || !passwordConfirmation) return fail('Συμπληρώστε τον νέο κωδικό και την επιβεβαίωσή του.');
    if (password !== passwordConfirmation) return fail('Οι κωδικοί δεν ταιριάζουν.');
    const problem = passwordProblem(String(password));
    if (problem) return fail(problem);

    const strapiResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/reset-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code, password, passwordConfirmation }),
    });

    if (strapiResponse.ok) return NextResponse.json({ ok: true }, { status: 200 });

    const data = await strapiResponse.json().catch(() => null);
    const msg = String(data?.error?.message ?? '').toLowerCase();
    if (msg.includes('code')) {
      return fail('Ο σύνδεσμος επαναφοράς δεν ισχύει πια (έληξε ή χρησιμοποιήθηκε ήδη). Ζητήστε νέο από τη σελίδα «Ξέχασα τον κωδικό».');
    }
    if (strapiResponse.status === 429) return fail('Πολλές προσπάθειες. Δοκιμάστε ξανά σε λίγα λεπτά.', 429);
    return fail('Ο κωδικός δεν άλλαξε. Δοκιμάστε ξανά.', strapiResponse.status >= 500 ? 502 : 400);
  } catch (error) {
    console.error('Reset password error:', error);
    return fail('Σφάλμα σύνδεσης. Δοκιμάστε ξανά.', 500);
  }
}
