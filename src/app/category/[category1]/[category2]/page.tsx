import CategoryPageTemplate from "@/components/templates/categoryPage";
import { getCategoriesMapping, getCategoryMetadata } from "@/lib/queries/categoryQuery";
import { Metadata, ResolvingMetadata } from 'next'

type MetadataProps = {
    params: { category1: string, category2: string }
    searchParams: { [key: string]: string | string[] }
}

export const dynamicParams = false


export default async function Category2({ params, searchParams }:
    {
        params: { category1: string, category2: string },
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

    let slug: object[] = []
    response.map((x) => {
        x.categories.map(b => {
            slug.push({ category1: x.slug, category2: b.slug })
        })
    })
 return slug
}

export async function generateMetadata(
    { params, searchParams }: MetadataProps,
    parent: ResolvingMetadata
): Promise<Metadata> {
    const response = await getCategoryMetadata(params.category2)

    let metadata: Metadata = {
        title: `Magnet Market-${response.name}`,
        category: response.name,
        alternates: {
            canonical: `${process.env.NEXT_URL}/category/${params.category1}/${params.category2}${searchParams.page ? `?page=${searchParams.page}` : ""}`,
        }
    }

    if (response.image) {
        metadata.openGraph = {
            url: `${process.env.NEXT_URL}/category${params.category1}/${params.category2}`,
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