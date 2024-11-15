import CategoryPageTemplate from "@/components/templates/categoryPage";
import { createFiltersForDbQuery, filtersProducts } from "@/lib/helpers/helpers";
import { GET_CATEGORIES_MAPPING, GET_CATEGORY_METADATA, IcategoriesMappingProps, IcategoryMetadataProps } from "@/lib/queries/categoryQuery";
import { GET_CATEGORY_PRODUCTS, IcategoryProductsProps } from "@/lib/queries/productQuery";
import { requestSSR } from "@/repositories/repository";
import { Metadata, ResolvingMetadata } from 'next'

type MetadataProps = {
    params: { category1: string, category2: string, category3: string }
    searchParams: { [key: string]: string | string[] }
}

export const dynamicParams = false

async function getCategoryProducts(category: string, searchParams: ({ [key: string]: string | string[] })) {

    const {sort } = searchParams

    let sortedBy: string = sort ? sort.toString() : 'price:asc'
    const filters =await createFiltersForDbQuery({ category, categoryLevel: 3 })
    const sorted = [sortedBy]

    const data = await requestSSR({
        query: GET_CATEGORY_PRODUCTS, variables: { filters: filters, sort: sorted }
    });

    const res = data as IcategoryProductsProps

    return res
}

export default async function Category3({ params, searchParams }:
    {
        params: { category1: string, category2: string, category3: string },
        searchParams: { [key: string]: string | string[] }
    }) {

    const data = await getCategoryProducts(
        params.category3,
        searchParams
    )

    return (
        <CategoryPageTemplate
            params={params}
            searchParams={searchParams}
            products={data} />
    )
}

export async function generateStaticParams() {
    const data = await requestSSR({
        query: GET_CATEGORIES_MAPPING
    });

    const response = data as IcategoriesMappingProps

    const categories = response.categories.data

    let slug: object[] = []
    const test = categories.map((x) => {
        x.attributes.categories.data.map(b => {
            b.attributes.categories.data.map(c => {
                slug.push({ category1: x.attributes.slug, category2: b.attributes.slug, category3: c.attributes.slug })
            })
        })
    })

    return slug
}

export async function generateMetadata(
    { params, searchParams }: MetadataProps,
    parent: ResolvingMetadata
): Promise<Metadata> {
    const data = await requestSSR({
        query: GET_CATEGORY_METADATA, variables: { category: params.category3 }
    });

    const response = data as IcategoryMetadataProps

    console.log(response.categories.data[0].attributes.image.data)

    let metadata: Metadata = {
        title: `MagnetMarket-${response.categories.data[0].attributes.name} `,
    }

    if (response.categories.data[0].attributes.image.data) {
        metadata.openGraph = { images: [`${process.env.NEXT_PUBLIC_API_URL} /${response.categories.data[0].attributes.image.data?.attributes.url}`] }
    }

    return metadata
}