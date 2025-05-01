import { IProduct } from "../interfaces/product"

export function getPrices({ price, sale_price }: { price: number, sale_price: number }) {
    
    const salePrice = Number(sale_price)
    
    const profit =Number(price) - Number(salePrice)
    const discount = (price - salePrice) * 100 / price

    return { price, salePrice, profit, discount }
}