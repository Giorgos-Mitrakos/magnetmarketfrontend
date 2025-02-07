import { GET_BRANDS_SITEMAP, GET_CATEGORIES_SITEMAP, GET_PAGES_SITEMAP, GET_PRODUCTS_SITEMAP, IBrandsSitemapProps, IcategoriesSiteMapProps, IPagesSitemapProps, IProductsSitemapProps } from '@/lib/queries/sitemapQueries';
import { requestSSR } from '@/repositories/repository';
import { MetadataRoute } from 'next'

async function getProducts() {
    const data = await requestSSR({
        query: GET_PRODUCTS_SITEMAP
    });

    return data as IProductsSitemapProps
}

async function getCategories() {
    const data = await requestSSR({
        query: GET_CATEGORIES_SITEMAP
    });

    return data as IcategoriesSiteMapProps
}

async function getPages() {
    const data = await requestSSR({
        query: GET_PAGES_SITEMAP
    });

    return data as IPagesSitemapProps
}

async function getBrands() {
    const data = await requestSSR({
        query: GET_BRANDS_SITEMAP
    });

    return data as IBrandsSitemapProps
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {


    const products = await getProducts()
    const categories = await getCategories()
    const pages = await getPages()
    const brands = await getBrands()

    const sitemapArray: MetadataRoute.Sitemap = [{
        url: `${process.env.NEXT_URL}`,
        // lastModified: new Date(),
        changeFrequency: 'weekly',
        priority: 0.8,
    },
    {
        url: `${process.env.NEXT_URL}/account`,
        // lastModified: new Date(),
        changeFrequency: 'yearly',
        priority: 0.1,
    },
    {
        url: `${process.env.NEXT_URL}/checkout/confirm`,
        // lastModified: new Date(),
        changeFrequency: 'yearly',
        priority: 0.1,
    },
    {
        url: `${process.env.NEXT_URL}/checkout/customer-informations`,
        // lastModified: new Date(),
        changeFrequency: 'yearly',
        priority: 0.1,
    },
    {
        url: `${process.env.NEXT_URL}/checkout/order-informations`,
        // lastModified: new Date(),
        changeFrequency: 'yearly',
        priority: 0.1,
    },
    {
        url: `${process.env.NEXT_URL}/login`,
        // lastModified: new Date(),
        changeFrequency: 'yearly',
        priority: 0.1,
    },
    {
        url: `${process.env.NEXT_URL}/register`,
        // lastModified: new Date(),
        changeFrequency: 'yearly',
        priority: 0.1,
    },
    {
        url: `${process.env.NEXT_URL}/shopping-cart`,
        // lastModified: new Date(),
        changeFrequency: 'yearly',
        priority: 0.1,
    }]
    const categoriesSitemap: MetadataRoute.Sitemap = []

    categories.categories.data.forEach(category => {
        categoriesSitemap.push({
            url: `${process.env.NEXT_URL}/category/${category.attributes.slug}`,
            lastModified: category.attributes.updatedAt.toString(),
            changeFrequency: 'daily',
            priority: 0.5,
        })
        if (category.attributes.categories.data.length > 0) {
            category.attributes.categories.data.forEach(cat2 => {
                categoriesSitemap.push({
                    url: `${process.env.NEXT_URL}/category/${category.attributes.slug}/${cat2.attributes.slug}`,
                    lastModified: cat2.attributes.updatedAt.toString(),
                    changeFrequency: 'daily',
                    priority: 0.5,
                })
                if (cat2.attributes.categories.data.length > 0) {
                    cat2.attributes.categories.data.forEach(cat3 => {
                        categoriesSitemap.push({
                            url: `${process.env.NEXT_URL}/category/${category.attributes.slug}/${cat2.attributes.slug}/${cat3.attributes.slug}`,
                            lastModified: cat3.attributes.updatedAt.toString(),
                            changeFrequency: 'daily',
                            priority: 0.5,
                        })
                    })
                }
            })
        }
    })

    const brandsSitemap: MetadataRoute.Sitemap = brands.brands.data.filter(x => x.attributes.products.data.length > 0).map(brand => ({
        url: `${process.env.NEXT_URL}/search?search=${brand.attributes.name}`,
        lastModified: brand.attributes.updatedAt.toString(),
        changeFrequency: "daily",
        priority: 0.6,
    }))

    const pagesSitemap: MetadataRoute.Sitemap = pages.pages.data.map(page => ({
        url: `${process.env.NEXT_URL}/pages/${page.attributes.titleSlug}`,
        lastModified: page.attributes.updatedAt.toString(),
        changeFrequency: "daily",
        priority: 0.6,
    }))

    const productsSitemap: MetadataRoute.Sitemap = products.products.data.map(product => ({
        url: `${process.env.NEXT_URL}/product/${product.attributes.slug}`,
        lastModified: product.attributes.updatedAt.toString(),
        changeFrequency: "daily",
        priority: 1,
    }))

    sitemapArray.push(...brandsSitemap)
    sitemapArray.push(...pagesSitemap)
    sitemapArray.push(...categoriesSitemap)
    sitemapArray.push(...productsSitemap)

    return sitemapArray
}