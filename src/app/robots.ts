import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
    return {
        rules: [
            {
                userAgent: '*',
                allow: '/',
                disallow: '/account/',
            },
            {
                userAgent: '*',
                allow: '/category/*?page=',
                disallow: '/category/*?',
            },
            {
                userAgent: '*',
                allow: '/category/*/*?page=',
                disallow: '/category/*/*?',
            },
            {
                userAgent: '*',
                allow: '/category/*/*/*?page=',
                disallow: '/category/*/*/*?',
            },
        ],
        sitemap: `${process.env.NEXT_URL}/sitemap.xml`,
    }
}
