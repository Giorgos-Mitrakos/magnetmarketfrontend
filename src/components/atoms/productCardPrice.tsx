// "use client"

import { getPrices } from "@/lib/helpers/priceHelper";
import { IcategoryProductsProps } from "@/lib/interfaces/category";


function ProductCardPrice(props: { product: IcategoryProductsProps }) {
    const price = props.product.attributes.price
    const is_sale = props.product.attributes.is_sale
    const salePrice = props.product.attributes.sale_price

    const { profit, discount } = getPrices({ price: price, sale_price: salePrice})
    

    return (
        <>
            <div className="flex justify-end items-center text-siteColors-purple xs:text-xl font-semibold mt-4">
                {is_sale && salePrice ?
                    <div>
                        <span className="text-sm line-through align-top mr-1 text-gray-500 dark:text-slate-300"
                            aria-label={`${price.toFixed(2)} €`}>{price.toFixed(2)} €</span>
                        <span className="dark:text-slate-200"
                            aria-label={`${salePrice.toFixed(2)} €`}
                        >{salePrice.toFixed(2)} €</span>
                    </div>
                    : <span className="dark:text-slate-200">{price.toFixed(2)} €</span>}
            </div>
        </>
    )
}

export default ProductCardPrice