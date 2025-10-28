import { FilterProps } from "../interfaces/filters";
import { IImageAttr } from "../interfaces/image";
import { IProductCard } from "../interfaces/product";

export async function getCategoryProducts(mainCategory: string, category: string, searchParams: ({ [key: string]: string | string[] })) {

    const { sort, page, pageSize, Κατασκευαστές, Κατηγορίες, search } = searchParams

    // Smart caching - διαφορετικό cache time ανάλογα με το context
    let cacheTime = 900; // Default 15 λεπτά

    // Πρώτη σελίδα cache περισσότερο (πιο σημαντική για SEO)
    if (!page || page === '1') {
        cacheTime = 600; // 10 λεπτά για την πρώτη σελίδα
    }

    // Φιλτραρισμένα αποτελέσματα cache λιγότερο (πιο δυναμικά)
    if (Κατηγορίες || (sort && sort !== 'price:asc') || pageSize || Κατασκευαστές || search) {
        cacheTime = 300; // 5 λεπτά για φιλτραρισμένα
    }

    // Σελίδες μετά την πρώτη cache λιγότερο
    if (page && Number(page) > 1) {
        cacheTime = 600; // 10 λεπτά για επόμενες σελίδες
    }

    const myHeaders = new Headers();

    myHeaders.append('Content-Type', 'application/json')
    myHeaders.append('Authorization', `Bearer ${process.env.ADMIN_JWT_SECRET}`,)

    const myInit = {
        method: "POST",
        headers: myHeaders,
        body: JSON.stringify({
            searchParams: { mainCategory, slug: category, ...searchParams }
        }),
        next: {
            revalidate: cacheTime, // Χρήση της μεταβλητής cacheTime
        }
    };

    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/category/getCategoryProducts`,
        myInit,
    )

    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();

    return data as {
        products: IProductCard[],
        meta: { pagination: { total: number, page: number, pageSize: number, pageCount: number } },
        availableFilters: FilterProps[]
    }
}

export async function getCategoryMetadata(slug: string) {
    const myHeaders = new Headers();

    myHeaders.append('Content-Type', 'application/json')
    myHeaders.append('Authorization', `Bearer ${process.env.ADMIN_JWT_SECRET}`,)

    const myInit = {
        method: "POST",
        headers: myHeaders,
        body: JSON.stringify({ slug: slug }),
        next: {
            revalidate: 600, // Χρήση της μεταβλητής cacheTime
        }
    };

    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/category/categoryMetadata`,
        myInit,
    )

    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();

    return data as {
        id: number,
        name: string,
        slug: string,
        image: IImageAttr,
        categories: {
            name: string
        }[]
    }
}

export async function getCategoriesMapping() {
    const myHeaders = new Headers();

    myHeaders.append('Content-Type', 'application/json')
    myHeaders.append('Authorization', `Bearer ${process.env.ADMIN_JWT_SECRET}`,)

    const myInit = {
        method: "GET",
        headers: myHeaders,
        next: {
            revalidate:  60 * 60, // Χρήση της μεταβλητής cacheTime
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
    myHeaders.append('Authorization', `Bearer ${process.env.ADMIN_JWT_SECRET}`,)

    const myInit = {
        method: "GET",
        headers: myHeaders,
        next: {
            revalidate:  60 * 60, // Χρήση της μεταβλητής cacheTime
        }
    };

    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/category/menu`,
        myInit,
    )

    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
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
