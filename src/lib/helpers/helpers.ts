import { requestSSR } from "@/repositories/repository"
import { GET_CATEGORY_CHILDS, IcategoryChildsProps, IimageProps } from "../queries/categoryQuery"
import { IcategoryProductsProps } from "../queries/productQuery"

interface ProductProps {
    id: number
    attributes: {
        name: string
        slug: string
        prod_chars: {
            name: string
            value: string
        }[]
        brand: {
            data: {
                attributes: {
                    name: string,
                    slug: string,
                    logo: {
                        data: {
                            attributes: {
                                name: string
                                url: string
                                formats: {
                                    thumbnail: IimageProps,
                                    small: IimageProps
                                }
                            }
                        }
                    }
                }
            }
        }
        image: {
            data: {
                attributes: {
                    url: string
                    alternativeText: string
                }
            }
        }
    }
}

function findCategoryChilds(categoryData: any, categoriesSlug: { slugs: string[] }) {
    for (let category of categoryData) {
        categoriesSlug.slugs.push(category.attributes.slug)
        if (category.attributes.categories && category.attributes.categories.data.length > 0) {
            findCategoryChilds(category.attributes.categories.data, categoriesSlug)
        }
    }
}

export async function createFiltersForDbQuery({ category, categoryLevel }:
    {
        category: string,
        categoryLevel: number
    }) {

    const data = await requestSSR({
        query: GET_CATEGORY_CHILDS, variables: { slug: category }
    });

    const response = data as IcategoryChildsProps

    const categoriesSlug = { slugs: [] }
    findCategoryChilds(response.categories.data, categoriesSlug)

    let filterString = []

    for (let slug of categoriesSlug.slugs) {
        filterString.push({ slug: { eq: `${slug}` } })
    }

    let filters: ({ [key: string]: object }) = {}

    filters.category = { or: filterString }

    return filters
}

export function filtersProducts(products: IcategoryProductsProps, searchParams: ({ [key: string]: string | string[] })) {

    const { pageSize, page } = searchParams

    const itemsPerPage: number = pageSize ? Number(pageSize.toString()) : 12

    let currentPage: number = page && Number(page) > 1 ? Number(page) : 1

    let offset: number = (currentPage - 1) * itemsPerPage

    let filteredProducts: ProductProps[] = products.products.data

    for (const [key, value] of Object.entries(searchParams)) {
        if (key !== "sort" && key !== "pageSize" && key !== "page") {
            if (key === "brands") {
                filteredProducts = filteredProducts.filter(product => value.includes(product.attributes.brand.data?.attributes.slug))

            }
            else {
                filteredProducts = filteredProducts.filter(product => product.attributes.prod_chars.some(x =>
                    value.includes(x.value.toLowerCase())
                ))
            }
        }
    }

    const pageProducts = filteredProducts.slice(offset, offset + itemsPerPage)

    return {
        allProducts: products.products.data,
        products: filteredProducts,
        pageProducts,
        totalItems: filteredProducts.length,
        currentPage,
        itemsPerPage
    }
}