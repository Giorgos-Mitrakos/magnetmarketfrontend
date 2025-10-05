// "use client"

import { getPrices } from "@/lib/helpers/priceHelper";
import { ISimilarProductPage } from "@/lib/interfaces/product";


// Product Card Price Component
const ProductCardPrice = ({product}: { product: ISimilarProductPage }) => {
  const price = product.price
  const is_sale = product.is_sale
  const salePrice = product.sale_price

  const { profit, discount } = getPrices({ price: price, sale_price: salePrice })

  return (
    <div className="flex justify-end items-center mt-3">
      {is_sale && salePrice ? (
        <div className="flex flex-col items-end">
          <span className="text-sm line-through text-gray-500 dark:text-slate-400 mb-1"
            aria-label={`Παλιά τιμή: ${price.toFixed(2)} €`}>
            {price.toFixed(2)} €
          </span>
          <div className="flex items-center gap-2">
            <span className="text-xl font-bold text-siteColors-purple dark:text-white"
              aria-label={`Νέα τιμή: ${salePrice.toFixed(2)} €`}>
              {salePrice.toFixed(2)} €
            </span>
          </div>
        </div>
      ) : (
        <span className="text-xl font-bold text-siteColors-purple dark:text-white">
          {price.toFixed(2)} €
        </span>
      )}
    </div>
  )
}

export default ProductCardPrice