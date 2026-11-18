// app/robots.ts
// (2026-10-26) Μία ομάδα κανόνων για όλα τα bots. Οι σελίδες λογαριασμού / checkout
// έχουν ήδη noindex — εδώ απλώς δεν σπαταλάμε crawl σε αυτές.
// Κατηγορίες: σελίδες με ?page= ναι, φίλτρα/ταξινομήσεις (άλλα ?…) όχι
// (η Google κρατά τον πιο συγκεκριμένο κανόνα, άρα το ?page= υπερισχύει).
import { MetadataRoute } from 'next'

const BASE_URL = (process.env.NEXT_URL || 'https://magnetmarket.gr').replace(/\/+$/, '')

export default function robots(): MetadataRoute.Robots {
    // (2026-11-18) Δοκιμαστικό site: τίποτα στις μηχανές αναζήτησης
    if (process.env.SITE_NOINDEX === 'true') {
        return { rules: [{ userAgent: '*', disallow: '/' }] }
    }
    return {
        rules: [
            {
                userAgent: '*',
                allow: ['/', '/category/*?page='],
                disallow: [
                    '/account',
                    '/checkout',
                    '/shopping-cart',
                    '/login',
                    '/register',
                    '/forgot-password',
                    '/reset-password',
                    '/email/',
                    '/review/',
                    '/unsubscribe/',
                    '/compare',
                    '/api/',
                    '/category/*?',
                ],
            },
        ],
        // (2026-10-27) + sitemap εικόνων προϊόντων
        sitemap: [`${BASE_URL}/sitemap.xml`, `${BASE_URL}/sitemap-images.xml`],
    }
}
