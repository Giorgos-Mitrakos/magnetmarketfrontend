import { GET_PAGE_DATA, IPageDataProps } from "@/lib/queries/pagesQuery";
import { requestSSR } from "@/repositories/repository";


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


    return (
        <div className="mx-4 py-12 px-4 bg-slate-50 rounded">
            <h1 className="font-bold text-xl text-center mb-8">{data.pages.data[0].attributes.title}</h1>
            <div className="lg:mx-20" dangerouslySetInnerHTML={{ __html: data.pages.data[0].attributes.mainText }} />
        </div>
    )
}