// src/app/api/auth/forgot-password/route.ts
// (2026-10-26) Ελληνικά μηνύματα· ίδια απάντηση είτε υπάρχει λογαριασμός είτε όχι
// (να μη μπορεί κανείς να ελέγξει ποια email είναι πελάτες μας).
import { NextRequest, NextResponse } from 'next/server';

const fail = (message: string, status = 400) => NextResponse.json({ error: { message } }, { status });

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json().catch(() => ({ email: '' }));
    const clean = String(email ?? '').trim();
    if (!clean) return fail('Συμπληρώστε το email σας.');
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(clean)) return fail('Το email δεν είναι σωστό.');

    const strapiResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/forgot-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: clean }),
    });

    if (strapiResponse.status === 429) return fail('Πολλές προσπάθειες. Δοκιμάστε ξανά σε λίγα λεπτά.', 429);
    if (strapiResponse.status >= 500) return fail('Δεν στάλθηκε το email. Δοκιμάστε ξανά σε λίγο.', 502);
    // 2xx ή 4xx (π.χ. «δεν υπάρχει λογαριασμός»): η ίδια απάντηση
    return NextResponse.json({ ok: true }, { status: 200 });
  } catch (error) {
    console.error('Forgot password error:', error);
    return fail('Σφάλμα σύνδεσης. Δοκιμάστε ξανά.', 500);
  }
}
