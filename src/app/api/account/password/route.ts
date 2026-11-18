// (2026-10-26) Αλλαγή κωδικού από τη σελίδα «Ο λογαριασμός μου».
// Strapi users-permissions /api/auth/change-password με το JWT του session (μόνο στον server).
import { NextRequest, NextResponse } from "next/server";
import { sessionJwt } from "@/lib/helpers/accountSession";

export const dynamic = 'force-dynamic'

const fail = (message: string, status = 400) => NextResponse.json({ message }, { status })

function passwordProblem(p: string): string | null {
    if (p.length < 8) return 'Ο νέος κωδικός πρέπει να έχει τουλάχιστον 8 χαρακτήρες.'
    if (!/[0-9]/.test(p)) return 'Ο νέος κωδικός πρέπει να περιλαμβάνει αριθμό.'
    if (!/[a-z]/.test(p)) return 'Ο νέος κωδικός πρέπει να περιλαμβάνει μικρό γράμμα.'
    if (!/[A-Z]/.test(p)) return 'Ο νέος κωδικός πρέπει να περιλαμβάνει κεφαλαίο γράμμα.'
    if (!/[^\w]/.test(p)) return 'Ο νέος κωδικός πρέπει να περιλαμβάνει σύμβολο (π.χ. ! ή @).'
    return null
}

export async function POST(req: NextRequest) {
    const jwt = await sessionJwt()
    if (!jwt) return fail('Απαιτείται σύνδεση', 401)
    try {
        const { currentPassword, password, passwordConfirmation } = await req.json().catch(() => ({}))
        if (!currentPassword) return fail('Συμπληρώστε τον τωρινό κωδικό.')
        if (!password || password !== passwordConfirmation) return fail('Ο νέος κωδικός και η επιβεβαίωση δεν ταιριάζουν.')
        const problem = passwordProblem(String(password))
        if (problem) return fail(problem)
        if (password === currentPassword) return fail('Ο νέος κωδικός πρέπει να είναι διαφορετικός από τον τωρινό.')

        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/change-password`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${jwt}` },
            body: JSON.stringify({ currentPassword, password, passwordConfirmation }),
            cache: 'no-store',
        })
        if (res.ok) return NextResponse.json({ ok: true })

        const data = await res.json().catch(() => null)
        const msg = String(data?.error?.message ?? '').toLowerCase()
        if (msg.includes('current password')) return fail('Ο τωρινός κωδικός δεν είναι σωστός.')
        if (msg.includes('different')) return fail('Ο νέος κωδικός πρέπει να είναι διαφορετικός από τον τωρινό.')
        if (res.status === 401) return fail('Η σύνδεσή σας έληξε. Συνδεθείτε ξανά.', 401)
        if (res.status === 403) return fail('Η αλλαγή κωδικού δεν είναι διαθέσιμη αυτή τη στιγμή.', 403)
        if (res.status === 429) return fail('Πολλές προσπάθειες. Δοκιμάστε ξανά σε λίγα λεπτά.', 429)
        return fail('Ο κωδικός δεν άλλαξε. Δοκιμάστε ξανά.', res.status >= 500 ? 502 : 400)
    } catch (error) {
        console.error('Change password error:', error)
        return fail('Σφάλμα σύνδεσης. Δοκιμάστε ξανά.', 500)
    }
}
