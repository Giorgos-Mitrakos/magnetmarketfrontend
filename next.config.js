const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
})

// Οι διευθύνσεις έρχονται ΜΟΝΟ από το .env (.env.local στην ανάπτυξη,
// .env.production / μεταβλητές του server στην παραγωγή):
//   NEXT_PUBLIC_API_URL, NEXT_URL, NEXTAUTH_URL
// Προσοχή: οι NEXT_PUBLIC_* «ψήνονται» στο build — αλλαγή τους θέλει νέο build.
const apiUrl = (() => {
  try {
    return new URL(process.env.NEXT_PUBLIC_API_URL || 'http://localhost:1337')
  } catch {
    return new URL('http://localhost:1337')
  }
})()

// Strapi σε τοπική διεύθυνση (localhost / 127.0.0.1 / ιδιωτικό δίκτυο) — συνήθως στην ανάπτυξη
const isLocalApi = /^(localhost|127\.|10\.|192\.168\.|172\.(1[6-9]|2\d|3[01])\.|\[?::1\]?$)/.test(apiUrl.hostname)

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    // (2026-10-28) Next.js 16: επιτρέπονται μόνο οι ποιότητες που δηλώνονται εδώ
    // (όσες χρησιμοποιούμε σε quality={…}). Άλλη τιμή → στρογγυλεύει στην πλησιέστερη.
    qualities: [60, 75, 80, 85, 90],
    // (2026-11-25) Οι βελτιστοποιημένες εικόνες μένουν 30 ημέρες στην cache του browser (ήταν λίγες ώρες —
    // WebPageTest «Cache Static Content: D»). Τα αρχεία του Strapi έχουν μοναδικό όνομα, άρα μια νέα εικόνα
    // παίρνει νέο URL και δεν κινδυνεύουμε να βλέπει ο επισκέπτης την παλιά.
    minimumCacheTTL: 2592000,
    // (2026-10-28) Next.js 16: μπλοκάρει εικόνες από τοπικές IP. Τις επιτρέπουμε μόνο
    // όταν το Strapi είναι τοπικό (ανάπτυξη) — στην παραγωγή μένει κλειστό.
    dangerouslyAllowLocalIP: isLocalApi,
    // Εικόνες από το Strapi (ό,τι ορίζει το NEXT_PUBLIC_API_URL)
    remotePatterns: [
      {
        protocol: apiUrl.protocol.replace(':', ''),
        hostname: apiUrl.hostname,
        ...(apiUrl.port ? { port: apiUrl.port } : {}),
        pathname: '/uploads/**',
      },
    ],
  },

  // Αφαίρεσε console.logs από production — (2026-11-23) ΚΡΑΤΑ τα console.error/warn,
  // αλλιώς στην παραγωγή δεν γράφεται κανένα σφάλμα στο log (π.χ. αποτυχίες πληρωμών)
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production' ? { exclude: ['error', 'warn'] } : false,
  },

  // (2026-11-18) Δοκιμαστικό site (π.χ. test.magnetmarket.gr): SITE_NOINDEX=true στο .env
  // → καμία σελίδα στο Google (X-Robots-Tag σε όλες τις απαντήσεις + robots.txt «Disallow: /»).
  async headers() {
    // (2026-11-25) Headers ασφαλείας σε όλες τις σελίδες (securityheaders.com).
    // - X-Frame-Options: το site δεν ανοίγει μέσα σε <iframe> άλλου site (clickjacking)
    // - X-Content-Type-Options: ο browser δεν «μαντεύει» τύπο αρχείου
    // - Referrer-Policy: σε άλλα sites πηγαίνει μόνο το https://magnetmarket.gr, όχι ολόκληρη η διεύθυνση
    // - Permissions-Policy: κλειστά κάμερα / μικρόφωνο / τοποθεσία (δεν τα χρησιμοποιεί το site)
    // Το Content-Security-Policy ΔΕΝ μπαίνει εδώ: θέλει λίστα με όλα τα scripts τρίτων
    // (Google, Facebook, BestPrice, τράπεζα) και, αν λείπει ένα, σπάει λειτουργία.
    const security = [
      { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
      { key: 'X-Content-Type-Options', value: 'nosniff' },
      { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
      { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=(), browsing-topics=()' },
    ]
    const noindex = process.env.SITE_NOINDEX === 'true'
      ? [{ key: 'X-Robots-Tag', value: 'noindex, nofollow' }]
      : []
    return [{ source: '/:path*', headers: [...security, ...noindex] }]
  },
}

module.exports = withBundleAnalyzer(nextConfig)
