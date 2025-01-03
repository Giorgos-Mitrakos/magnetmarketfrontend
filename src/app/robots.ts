import ProductCard from '@/components/organisms/productCard'
import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
    return {
        rules: {
            userAgent: '*',
            allow: '/',
            disallow: '/account/',
        },
        sitemap: `${process.env.NEXT_URL}/sitemap.xml`,
    }
}