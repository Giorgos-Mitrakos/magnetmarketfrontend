import { getPagesList } from '@/lib/queries/pagesQuery';
import { MetadataRoute } from 'next'

// Revalidate sitemap κάθε 1 ώρα (3600 seconds)
export const revalidate = 3600;

interface ISitemapData {
    products: { slug: string; updatedAt: string }[]
    /** π.χ. "smart-home/lampes" → /category/smart-home/lampes */
    categories: { path: string; updatedAt: string }[]
    brands: { slug: string; updatedAt: string }[]
    /** (2026-10-27) Σελίδες «κατηγορία + μάρκα» → /brands/{brand}/{category} */
    brandCategories?: { brand: string; category: string; updatedAt: string }[]
}

// Προϊόντα, κατηγορίες και brands σε μία κλήση (GET /api/storefront/sitemap)
async function getSitemapData(): Promise<ISitemapData> {
    try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/storefront/sitemap`, {
            next: { revalidate: 3600 },
        })
        if (!response.ok) return { products: [], categories: [], brands: [] }
        return (await response.json()) as ISitemapData
    } catch {
        return { products: [], categories: [], brands: [] }
    }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {


    const [{ products, categories, brands, brandCategories = [] }, pages] = await Promise.all([
        getSitemapData(),
        getPagesList(),
    ]);

    const sitemapArray: MetadataRoute.Sitemap = [{
        url: `${process.env.NEXT_URL}`,
        lastModified: new Date(),
        changeFrequency: 'daily',
        priority: 0.8,
    },
    {
        url: `${process.env.NEXT_URL}/brands`,
        lastModified: new Date(),
        changeFrequency: 'weekly',
        priority: 0.1,
    },
    {
        url: `${process.env.NEXT_URL}/offers`,
        lastModified: new Date(),
        changeFrequency: 'daily',
        priority: 0.7,
    },
        // {
        //     url: `${process.env.NEXT_URL}/checkout/confirm`,
        //     // lastModified: new Date(),
        //     changeFrequency: 'yearly',
        //     priority: 0.1,
        // },
        // {
        //     url: `${process.env.NEXT_URL}/checkout/customer-informations`,
        //     // lastModified: new Date(),
        //     changeFrequency: 'yearly',
        //     priority: 0.1,
        // },
        // {
        //     url: `${process.env.NEXT_URL}/checkout/order-informations`,
        //     // lastModified: new Date(),
        //     changeFrequency: 'yearly',
        //     priority: 0.1,
        // },
        // {
        //     url: `${process.env.NEXT_URL}/login`,
        //     // lastModified: new Date(),
        //     changeFrequency: 'yearly',
        //     priority: 0.1,
        // },
        // {
        //     url: `${process.env.NEXT_URL}/register`,
        //     // lastModified: new Date(),
        //     changeFrequency: 'yearly',
        //     priority: 0.1,
        // },
        // {
        //     url: `${process.env.NEXT_URL}/shopping-cart`,
        //     // lastModified: new Date(),
        //     changeFrequency: 'yearly',
        //     priority: 0.1,
        // }
    ]
    const categoriesSitemap: MetadataRoute.Sitemap = categories.map(category => ({
        url: `${process.env.NEXT_URL}/category/${category.path}`,
        lastModified: new Date(category.updatedAt),
        changeFrequency: 'daily',
        priority: 0.5,
    }))

    const brandsSitemap: MetadataRoute.Sitemap = brands.map(brand => ({
        url: `${process.env.NEXT_URL}/brands/${brand.slug}`,
        lastModified: new Date(brand.updatedAt),
        changeFrequency: "daily",
        priority: 0.6,
    }))

    const pagesSitemap: MetadataRoute.Sitemap = pages.filter(page => !page.noindex).map(page => ({
        url: `${process.env.NEXT_URL}/pages/${page.slug}`,
        lastModified: new Date(page.updatedAt),
        changeFrequency: "daily",
        priority: 0.6,
    }))

    const productsSitemap: MetadataRoute.Sitemap = products.map(product => ({
        url: `${process.env.NEXT_URL}/product/${product.slug}`,
        lastModified: new Date(product.updatedAt),
        changeFrequency: "daily",
        priority: 1,
    }))

    const brandCategoriesSitemap: MetadataRoute.Sitemap = brandCategories.map(bc => ({
        url: `${process.env.NEXT_URL}/brands/${bc.brand}/${bc.category}`,
        lastModified: new Date(bc.updatedAt),
        changeFrequency: "weekly",
        priority: 0.6,
    }))

    sitemapArray.push(...brandsSitemap)
    sitemapArray.push(...brandCategoriesSitemap)
    sitemapArray.push(...pagesSitemap)
    sitemapArray.push(...categoriesSitemap)
    sitemapArray.push(...productsSitemap)

    return sitemapArray
}