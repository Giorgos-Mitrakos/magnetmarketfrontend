import Menu from "@/components/molecules/menu";
import CategoryPageTemplate from "@/components/templates/categoryPage";
import { createFiltersForDbQuery } from "@/lib/helpers/helpers";
import { GET_CATEGORIES_MAPPING, GET_CATEGORY, GET_CATEGORY_METADATA, IcategoriesMappingProps, IcategoryMetadataProps, IcategoryProps } from "@/lib/queries/categoryQuery";
import { GET_CATEGORY_PRODUCTS, IcategoryProductsProps } from "@/lib/queries/productQuery";
import { requestSSR } from "@/repositories/repository";
import { Metadata, ResolvingMetadata } from 'next'

export const dynamicParams = false

type MetadataProps = {
    params: { category1: string }
    searchParams: { [key: string]: string | string[] | undefined }
}

async function getCategoryProducts(category: string, searchParams: ({ [key: string]: string | string[] })) {

    const { sort } = searchParams

    let sortedBy: string = sort ? sort.toString() : 'price:asc'
    const filters = await createFiltersForDbQuery({ category, categoryLevel: 1 })
    const sorted = [sortedBy]

    // console.log("filters---->", filters)

    const data = await requestSSR({
        query: GET_CATEGORY_PRODUCTS, variables: { filters: filters, sort: sorted }
    });

    const res = data as IcategoryProductsProps

    return res
}

export default async function Category({ params, searchParams }:
    {
        params: { category1: string },
        searchParams: { [key: string]: string | string[] }
    }) {

    const data = await getCategoryProducts(
        params.category1,
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

    return categories.map(x => (
        { category1: x.attributes.slug, name: x.attributes.name }
    ))

}

export async function generateMetadata(
    { params, searchParams }: MetadataProps,
    parent: ResolvingMetadata
): Promise<Metadata> {
    const data = await requestSSR({
        query: GET_CATEGORY_METADATA, variables: { category: params.category1 }
    });

    const response = data as IcategoryMetadataProps

    let metadata: Metadata = {
        title: `MagnetMarket-${response.categories.data[0].attributes.name}`,
    }

    if (response.categories.data[0].attributes.image.data && response.categories.data[0].attributes.image.data.length > 0) {
        metadata.openGraph = { images: [`${process.env.NEXT_PUBLIC_API_URL}/${response.categories.data[0].attributes.image.data?.attributes.url}`] }
    }

    return metadata
}