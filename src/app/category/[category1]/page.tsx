import CategoryPageTemplate from "@/components/templates/categoryPage";
import { getCategoriesMapping, getCategoryMetadata } from "@/lib/queries/categoryQuery";
import { Metadata, ResolvingMetadata } from 'next'

export const dynamicParams = false

type MetadataProps = {
    params: { category1: string }
    searchParams: { [key: string]: string | string[] | undefined }
}

export default async function Category({ params, searchParams }:
    {
        params: { category1: string },
        searchParams: { [key: string]: string | string[] }
    }) {


    return (
        <CategoryPageTemplate
            params={params}
            searchParams={searchParams} />
    )
}

export async function generateStaticParams() {
    const response = await getCategoriesMapping()


    return response.map(x => (
        { category1: x.slug }
    ))

}

export async function generateMetadata(
    { params, searchParams }: MetadataProps,
    parent: ResolvingMetadata
): Promise<Metadata> {
    const response = await getCategoryMetadata(params.category1)

    let metadata: Metadata = {
        title: `Magnet Market-${response.name}`,
        category: response.name,
        alternates: {
            canonical: `${process.env.NEXT_URL}/category${params.category1}${searchParams.page ? `?page=${searchParams.page}` : ""}`,
        },


    }

    if (response.image) {
        metadata.openGraph = {
            url: `${process.env.NEXT_URL}/category${params.category1}`,
            type: 'website',
            images: [`${process.env.NEXT_PUBLIC_API_URL}${response.image.url}`],
            siteName: "www.magnetmarket.gr",
            phoneNumbers: ["2221121657"],
            emails: ["info@magnetmarket.gr"],
            countryName: 'Ελλάδα',
        }
    }

    if (response.categories.length > 0) {
        const subCatTitles = response.categories.map(cat => cat.name)
        metadata.description = `Μην το ψάχνεις! Εδώ θα βρείς ${response.name} ${subCatTitles.join(',')}`
    }

    return metadata
}