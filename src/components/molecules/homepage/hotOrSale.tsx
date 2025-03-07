// import Carousel from "@/components/atoms/carousel";
import { IProducts } from "@/lib/interfaces/product";
import { GET_HOT_OR_DEALS_PRODUCTS } from "@/lib/queries/productQuery";
import { fetcher } from "@/repositories/repository";
import dynamic from 'next/dynamic'

const Carousel = dynamic(() => import('@/components/atoms/carousel'), { ssr: false })

const HotOrSale = async ({ id, title, type }: {
    id: string,
    title: string,
    type: string
}) => {

    const query = GET_HOT_OR_DEALS_PRODUCTS

    let filters: ({ [key: string]: object }) = {}

    sort:"createdAt:desc"
    let sortedBy: string = ''
    
    switch (type) {
        case 'hot':
            filters = { is_hot: { eq: true } }
            break;
        case 'new':
            filters = {}
            sortedBy = "createdAt:desc"
            break;
        case 'sale':
            filters = { and: [{ is_sale: { eq: true } }, { not: { sale_price: { eq: null } } }] }
            break;

        default:
            break;
    }

    const sorted = [sortedBy]


    const response = await fetcher({ query, variables: { filters, sort: sorted } })
    const data = await response as IProducts

    return (
        <section key={id} className="space-y-4 relative w-full h-[42rem]" >
            <h2 className="p-4 text-center text-white bg-siteColors-lightblue xs:text-2xl md:text-3xl font-bold rounded">{title}</h2>
            <Carousel products={data.products} />
        </section>
    )
}

export default HotOrSale;