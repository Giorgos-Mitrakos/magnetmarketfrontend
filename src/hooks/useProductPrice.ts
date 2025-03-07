import { IProductPriceProps } from "@/lib/interfaces/product"
import { GET_PRODUCT_PRICE } from "@/lib/queries/productQuery"
import { fetcher } from "@/repositories/repository"
import { useEffect, useState } from "react"
import useSWR from "swr"

export default function useProductPrice(id: number) {
    const [profit, setProfit] = useState<number>()
    const [discount, setDiscount] = useState<number>()
    const [isSale, setIsSale] = useState<boolean>(false)
    const [salePrice, setSalePrice] = useState<number>()

    const query = GET_PRODUCT_PRICE
    const variables = { id }
    const { data, isLoading, error } = useSWR<IProductPriceProps, boolean, any>(
        {
            query: query,
            variables: variables
        }, fetcher)

    useEffect(() => {
        if (!isLoading && data && data.product.data.attributes.sale_price > 0 && data.product.data.attributes.price) {
            const price = Number(data.product.data.attributes.price)
            const salePrice = Number(data.product.data.attributes.sale_price)
            const is_sale = data.product.data.attributes.is_sale

            setIsSale(is_sale)
            setProfit(price - salePrice)
            setDiscount((price - salePrice) * 100 / price)
            setSalePrice(salePrice)
        }
    }, [isLoading, data])

    return { profit, discount, isSale, salePrice, isLoading, error, data }
}