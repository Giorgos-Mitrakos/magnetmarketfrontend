// app/sitemap-images.xml/route.ts — (2026-10-27) Sitemap εικόνων προϊόντων
// Η Google βρίσκει έτσι τις φωτογραφίες των προϊόντων (Google Εικόνες / Shopping).
// Το Next 14 δεν υποστηρίζει εικόνες στο sitemap.ts, γι' αυτό ξεχωριστό αρχείο,
// δηλωμένο στο robots.ts. Ίδια δεδομένα με το /sitemap.xml (GET /api/storefront/sitemap).
import { getStrapiMedia } from '@/repositories/medias'

export const revalidate = 3600

const SITE = (process.env.NEXT_URL || 'https://magnetmarket.gr').replace(/\/+$/, '')
/** Όριο της Google ανά αρχείο sitemap */
const MAX_URLS = 50000

interface SitemapProduct {
    slug: string
    name?: string
    images?: string[]
}

const xml = (s: string) =>
    s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&apos;')

async function getProducts(): Promise<SitemapProduct[]> {
    try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/storefront/sitemap`, { next: { revalidate: 3600 } })
        if (!res.ok) return []
        const json = await res.json()
        return (json?.products ?? []) as SitemapProduct[]
    } catch {
        return []
    }
}

export async function GET() {
    const products = (await getProducts()).filter(p => p.slug && p.images?.length).slice(0, MAX_URLS)

    const body = products
        .map(p => {
            const images = (p.images ?? [])
                .map(u => getStrapiMedia(u))
                .filter((u): u is string => !!u && /^https?:\/\//.test(u))
                .map(u => `<image:image><image:loc>${xml(u)}</image:loc></image:image>`)
                .join('')
            return images ? `<url><loc>${xml(`${SITE}/product/${p.slug}`)}</loc>${images}</url>` : ''
        })
        .filter(Boolean)
        .join('\n')

    const out = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
${body}
</urlset>`

    return new Response(out, {
        headers: {
            'Content-Type': 'application/xml; charset=utf-8',
            'Cache-Control': 'public, max-age=3600',
        },
    })
}
