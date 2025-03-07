import { requestSSR } from "@/repositories/repository"
import { GET_CATEGORY_CHILDS } from "../queries/categoryQuery"
import { IcategoryChildsProps } from "../interfaces/category"

function findCategoryChilds(categoryData: any, categoriesSlug: { slugs: string[] }) {
    for (let category of categoryData) {
        categoriesSlug.slugs.push(category.attributes.slug)
        if (category.attributes.categories && category.attributes.categories.data.length > 0) {
            findCategoryChilds(category.attributes.categories.data, categoriesSlug)
        }
    }
}

export async function createFiltersForDbQuery({ category, categoryLevel, brands, searchParams }:
    {
        category: string,
        categoryLevel: number,
        brands: string | string[]
        searchParams: Record<string, any>
    }) {

    const data = await requestSSR({
        query: GET_CATEGORY_CHILDS, variables: { slug: category }
    });

    const response = data as IcategoryChildsProps

    const categoriesSlug = { slugs: [] }
    findCategoryChilds(response.categories.data, categoriesSlug)

    let categoryFilterString = []

    for (let slug of categoriesSlug.slugs) {
        categoryFilterString.push({ slug: { eq: `${slug}` } })
    }

    let filterBrandString = []

    if (brands) {
        if (typeof brands !== "string") {
            for (let brand of brands) {
                filterBrandString.push({ name: { eq: `${brand}` } })
            }
        }
        else {
            filterBrandString.push({ name: { eq: `${brands}` } })
        }
    }

    const resultArray = Object.keys(searchParams).map((key) => (
        {
            name: key,
            value: searchParams[key],
        }));

    const filterCharString = []

    for (let searchParam of resultArray) {

        if (searchParam.name === "sort" || searchParam.name === "page" || searchParam.name === "pageSize" || searchParam.name === "brands")
            continue


        const filter = { name: { eq: `${searchParam.name}` } }
        const values = []
        if (typeof searchParam.value === "string") {
            values.push(searchParam.value)
        }
        else {

            for (let search of searchParam.value) {
                values.push(search)
            }
        }

        filterCharString.push({
            prod_chars: {
                and: [filter, { value: { in: values } }]
            }
        })
    }

    let filters: ({ [key: string]: object }) = {}

    filters.and = [{ brand: { or: filterBrandString } }, { category: { or: categoryFilterString } }, { and: filterCharString }]

    return filters
}