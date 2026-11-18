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

  // Αφαίρεσε console.logs από production
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },

  // (2026-11-18) Δοκιμαστικό site (π.χ. test.magnetmarket.gr): SITE_NOINDEX=true στο .env
  // → καμία σελίδα στο Google (X-Robots-Tag σε όλες τις απαντήσεις + robots.txt «Disallow: /»).
  async headers() {
    if (process.env.SITE_NOINDEX !== 'true') return []
    return [{ source: '/:path*', headers: [{ key: 'X-Robots-Tag', value: 'noindex, nofollow' }] }]
  },
}

module.exports = withBundleAnalyzer(nextConfig)
