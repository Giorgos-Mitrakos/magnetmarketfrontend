import { IProductPriceProps } from "@/lib/interfaces/product"
import { useEffect, useState } from "react"
import useSWR from "swr"

// Τρέχουσα τιμή/διαθεσιμότητα από το Strapi v3 (REST), στην παλιά μορφή
// product.data.attributes ώστε τα components του καλαθιού να μην αλλάξουν
const priceFetcher = async (url: string): Promise<IProductPriceProps> => {
    const response = await fetch(url)
    if (!response.ok) throw new Error(`Response status: ${response.status}`)
    return response.json()
}

export default function useProductPrice(id: number | string) {
    const [profit, setProfit] = useState<number>()
    const [discount, setDiscount] = useState<number>()
    const [isSale, setIsSale] = useState<boolean>(false)
    const [salePrice, setSalePrice] = useState<number>()

    const { data, isLoading, error } = useSWR<IProductPriceProps>(
        id ? `/api/storefront/product-price/${encodeURIComponent(String(id))}` : null,
        priceFetcher)

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