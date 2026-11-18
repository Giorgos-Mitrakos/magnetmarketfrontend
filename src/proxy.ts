import { withAuth } from "next-auth/middleware"

// (2026-10-28) Next.js 16: το παλιό middleware.ts λέγεται πλέον proxy.ts (ίδια λειτουργία,
// τρέχει σε Node.js). Το middleware.ts πρέπει να διαγραφεί — αν υπάρχουν και τα δύο, το build σταματά.
//
// (2026-10-26) Μόνο οι σελίδες του λογαριασμού χρειάζονται σύνδεση. Χωρίς σύνδεση →
// η δική μας σελίδα /login?callbackUrl=… (όχι η αγγλική σελίδα του next-auth),
// και μετά τη σύνδεση επιστροφή εκεί που πήγαινε ο πελάτης.
export const proxy = withAuth({
  pages: { signIn: '/login' },
  callbacks: {
    authorized: ({ token }) => !!token,
  },
})

export default proxy

// Το proxy τρέχει ΜΟΝΟ εδώ (όχι σε κάθε σελίδα του site)
export const config = { matcher: ['/account', '/account/:path*'] }
