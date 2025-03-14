"use client"

import { IProductPriceProps } from "@/lib/interfaces/product";
import { GET_PRODUCT_PRICE } from "@/lib/queries/productQuery";
import { fetcher } from "@/repositories/repository";
import useSWR from 'swr'


function ProductCardPrice(props: { id: number }) {

    const query = GET_PRODUCT_PRICE
    const variables = { id: props.id }
    const { data, isLoading, error } = useSWR<IProductPriceProps, boolean, any>(
        {
            query: query,
            variables: variables
        }, fetcher)

    return (
        <>
            {isLoading ?
                <div className="flex justify-end items-center animate-pulse h-7 mt-4">
                    <div className="h-2.5 w-20 bg-slate-200 rounded"></div>
                </div>
                : error ? <div>Error...</div> :
                    <div className="flex justify-end items-center text-siteColors-purple xs:text-xl font-semibold mt-4">
                        {data?.product.data.attributes.is_sale && data?.product.data.attributes.sale_price ?
                            <div>
                                <span className="text-sm line-through align-top mr-1 text-gray-500 dark:text-slate-300"
                                    aria-label={`${data?.product.data.attributes.price.toFixed(2)} €`}>{data?.product.data.attributes.price.toFixed(2)} €</span>
                                <span className="dark:text-slate-200"
                                    aria-label={`${data?.product.data.attributes.sale_price.toFixed(2)} €`}
                                >{data?.product.data.attributes.sale_price.toFixed(2)} €</span>
                            </div>
                            : <span className="dark:text-slate-200">{data?.product.data.attributes.price.toFixed(2)} €</span>}
                    </div>
            }
        </>
    )
}

export default ProductCardPrice