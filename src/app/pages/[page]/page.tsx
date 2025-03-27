import { organizationStructuredData } from "@/lib/helpers/structureData";
import { GET_PAGE_DATA, IPageDataProps } from "@/lib/queries/pagesQuery";
import { requestSSR } from "@/repositories/repository";
import { Metadata, ResolvingMetadata } from 'next'
import Script from "next/script";

type Props = {
    params: { page: string }
}


async function getPageData(page: string) {
    const data = await requestSSR({
        query: GET_PAGE_DATA, variables: { title: page }
    });

    return data as IPageDataProps
}

export default async function Product({ params }: {
    params: { page: string }
}) {

    const data = await getPageData(params.page)

    const structuredData = []
    structuredData.push(organizationStructuredData)

    return (
        <>
            <Script
                id="structured-data"
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
            />
            <div className="mx-4 py-12 px-4 bg-slate-50 dark:bg-slate-700 rounded">
                <h1 className="font-bold text-xl text-center mb-8">{data.pages.data[0].attributes.title}</h1>
                <div className="lg:mx-20" dangerouslySetInnerHTML={{ __html: data.pages.data[0].attributes.mainText }} />
            </div>
        </>
    )
}

export async function generateMetadata(
    { params }: Props,
    parent: ResolvingMetadata
): Promise<Metadata> {
    // read route params
    const page = params.page
    const data = await getPageData(params.page)

    let metadata: Metadata = {
        title: `Magnet Market-${data.pages.data[0].attributes.title}`,
        alternates: {
            canonical: `${process.env.NEXT_URL}/pages/${page}`,
        },
        openGraph: {
            images: [`${process.env.NEXT_URL}/_next/static/media/MARKET MAGNET-LOGO.79db5357.svg`],
            siteName: "magnetmarket.gr",
            emails: ["info@magnetmarket.gr"],
            phoneNumbers: ['2221121657'],
            countryName: 'Ελλάδα',
        }

    }

    return metadata
}