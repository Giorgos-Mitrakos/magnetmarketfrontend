// (2026-10-26) Επιστροφή μετά τη σύνδεση / εγγραφή (?callbackUrl=…) ΜΟΝΟ σε σελίδα του site.
// Χωρίς αυτό, ένας σύνδεσμος «magnetmarket.gr/login?callbackUrl=https://άλλο-site» θα έστελνε
// τον πελάτη, μετά τη σύνδεση, σε ξένη σελίδα που μοιάζει με τη δική μας (phishing).
export function safeRedirect(url: string | null | undefined, fallback = '/'): string {
    const u = String(url ?? '').trim()
    if (!u.startsWith('/') || u.startsWith('//') || u.startsWith('/\\') || /[\u0000-\u001f]/.test(u)) return fallback
    return u
}
