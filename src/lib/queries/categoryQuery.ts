import { SideMenuType } from "@/components/templates/categoryPage";
import { FilterProps } from "../interfaces/filters";
import { IImageAttr } from "../interfaces/image";
import { IProductCard } from "../interfaces/product";
import { contentCache } from "../helpers/contentCache";
import process from "process";
import { cache } from "react";

/** Ελάχιστα στοιχεία εικόνας που επιστρέφει το Strapi (media()) */
export interface ICategoryMedia {
    url: string
    name?: string | null
    alternativeText?: string | null
    formats?: Record<string, { url: string; width?: number; height?: number }> | null
}

export interface ICategoryProductsResponse {
    products: IProductCard[],
    meta: { pagination: { total: number, page: number, pageSize: number, pageCount: number } },
    availableFilters: FilterProps[],
    /** Εύρος τελικών τιμών για το φίλτρο «από / έως» (null αν δεν υπάρχουν τιμές) */
    priceRange: { min: number, max: number } | null,
    breadcrumbs: {
        title: string,
        slug: string
    }[],
    sideMenu: SideMenuType | null
}

export interface ICategoryMetadata {
    id: number,
    name: string,
    slug: string,
    description: string | null,
    image: ICategoryMedia | null,
    seo: {
        metaTitle: string | null
        metaDescription: string | null
        metaImage: ICategoryMedia | null
        keywords: string | null
        metaRobots: string | null
        canonicalURL: string | null
    } | null,
    categories: {
        id: string,
        name: string,
        slug: string,
        image?: ICategoryMedia | null
    }[],
    parent: { id: number, name: string, slug: string, parent: { id: number, name: string, slug: string } | null } | null
}

/**
 * Προϊόντα κατηγορίας. (2026-10-18) Με React cache: η σελίδα και το
 * generateMetadata παίρνουν ΤΟ ΙΔΙΟ αποτέλεσμα (πριν γινόταν δύο φορές το
 * ίδιο βαρύ αίτημα), και cache 5′ στον server (tag «menu»: αλλαγή κατηγορίας
 * στο Strapi την ανανεώνει αμέσως). null = η κατηγορία δεν υπάρχει.
 */
export function getCategoryProducts(
    mainCategory: string,
    category: string,
    searchParams: ({ [key: string]: string | string[] })
): Promise<ICategoryProductsResponse | null> {
    // Το cache της React συγκρίνει τα ορίσματα με ===, οπότε κλειδί = κείμενο
    const sorted = Object.keys(searchParams).sort().reduce<Record<string, string | string[]>>((acc, k) => {
        acc[k] = searchParams[k]
        return acc
    }, {})
    return fetchCategoryProducts(JSON.stringify({ mainCategory, slug: category, ...sorted }))
}

const fetchCategoryProducts = cache(async function fetchCategoryProducts(body: string): Promise<ICategoryProductsResponse | null> {
    const myHeaders = new Headers();
    myHeaders.append('Content-Type', 'application/json')

    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/category/getCategoryProducts`, {
        method: "POST",
        headers: myHeaders,
        body: JSON.stringify({ searchParams: JSON.parse(body) }),
        next: contentCache(300, ['menu', 'category-products']),
    })

    if (response.status === 404) return null
    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
    }
    return (await response.json()) as ICategoryProductsResponse
})

/** Στοιχεία κατηγορίας (όνομα, περιγραφή, SEO, υποκατηγορίες, γονικές). null = δεν υπάρχει. */
export const getCategoryMetadata = cache(async function getCategoryMetadata(slug: string): Promise<ICategoryMetadata | null> {
    const myHeaders = new Headers();
    myHeaders.append('Content-Type', 'application/json')

    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/category/categoryMetadata`, {
        method: "POST",
        headers: myHeaders,
        body: JSON.stringify({ slug: slug }),
        next: contentCache(3600, ['menu']),
    })

    if (response.status === 404) return null
    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
    }
    return (await response.json()) as ICategoryMetadata
})

export async function getCategoriesMapping() {
    const myHeaders = new Headers();

    myHeaders.append('Content-Type', 'application/json')

    const myInit = {
        method: "GET",
        headers: myHeaders,
        next: {
            revalidate: 60 * 60, // Χρήση της μεταβλητής cacheTime
        }
    };

    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/category/categoriesMapping`,
        myInit,
    )

    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();

    return data as {
        name: string,
        slug: string,
        categories: {
            name: string
            slug: string,
            categories: {
                name: string
                slug: string,
            }[]
        }[]
    }[]
}

export async function getMenu() {
    const myHeaders = new Headers();

    myHeaders.append('Content-Type', 'application/json')

    const myInit = {
        method: "GET",
        headers: myHeaders,
        next: contentCache(60 * 60, ['menu'])
    };

    // Το μενού φορτώνεται σε ΚΑΘΕ σελίδα (layout): αν αποτύχει, η σελίδα
    // εμφανίζεται χωρίς μενού αντί να ρίχνει σφάλμα 500
    let response: Response
    try {
        response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/category/menu`, myInit)
    } catch (error) {
        console.error('Menu API error:', error)
        return []
    }

    if (!response.ok) {
        console.error('Menu API error:', response.status, response.statusText)
        return []
    }

    const data = await response.json();

    return data as {
        id: number,
        name: string,
        description: string,
        slug: string,
        image: IImageAttr
        isSpecial?: boolean;
        categories: {
            id: number,
            name: string
            description: string,
            slug: string,
            image: IImageAttr
            categories: {
                id: number,
                name: string
                description: string,
                slug: string,
                image: IImageAttr
            }[]
        }[]
    }[]
}
