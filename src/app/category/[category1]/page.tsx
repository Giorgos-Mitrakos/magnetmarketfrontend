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

    const { sort, page, pageSize, brands } = searchParams

    let sortedBy: string = sort ? sort.toString() : 'price:asc'
    const filters = await createFiltersForDbQuery({ category, categoryLevel: 1, brands, searchParams })
    const sorted = [sortedBy]

    const data = await requestSSR({
        query: GET_CATEGORY_PRODUCTS, variables: { filters: filters, pagination: { page: page ? Number(page) : 1, pageSize: pageSize ? Number(pageSize) : 12 }, sort: sorted }
    });

    const res = data as {
        products: {
            data: IcategoryProductsProps[],
            meta: {
                pagination: {
                    total: number,
                    page: number,
                    pageSize: number,
                    pageCount: number,
                }
            }
        }
    }

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
        category: response.categories.data[0].attributes.name,
        alternates: {
            canonical: `${process.env.NEXT_URL}/category${params.category1}`,
        }
    }

    if (response.categories.data[0].attributes.image.data) {
        metadata.openGraph = {
            url: `${process.env.NEXT_URL}/category${params.category1}`,
            type: 'website',
            images: [`${process.env.NEXT_PUBLIC_API_URL}${response.categories.data[0].attributes.image.data?.attributes.url}`],
            siteName: "www.magnetmarket.gr",
            phoneNumbers: ["2221121657"],
            emails: ["info@magnetmarket.gr"],
            countryName: 'Ελλάδα',
        }
    }

    if (response.categories.data[0].attributes.categories.data.length > 0) {
        const subCatTitles = response.categories.data[0].attributes.categories.data.map(cat => cat.attributes.name)
        metadata.description = `Η κατηγορία ${response.categories.data[0].attributes.name} περιέχει προϊόντα από τις υποκατηγορίες ${subCatTitles.join(',')}`
    }

    return metadata
}