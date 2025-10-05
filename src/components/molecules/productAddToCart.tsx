"use client"

import { FaOpencart } from "react-icons/fa"
import useProductPrice from "@/hooks/useProductPrice"
import Image from "next/image"
import { getStrapiMedia } from "@/repositories/medias"
import { FaRegImage } from "react-icons/fa6"
import { IProductCard } from "@/lib/interfaces/product"
import { ICartItem } from "@/lib/interfaces/cart"
import { useCheckout } from "@/context/checkout"
import { addToCartToast } from "@/lib/toasts/cartToasts"

function ProductAddToCart({ product }: { product: IProductCard }) {
  const { data } = useProductPrice(product.id)
  const { dispatch } = useCheckout()

  const item: ICartItem = {
    id: product.id,
    name: product.name,
    slug: product.slug,
    image: product.image,
    weight: product.weight,
    price: product.price,
    brand: product.brand?.name || null,
    quantity: 1,
    isAvailable: true,
    is_sale: product.is_sale,
    sale_price: product.sale_price,
    category: product.category
  }

  const handleAddProductClick = () => {
    dispatch({ type: "ADD_ITEM", payload: item })
    addToCartToast(item)
  }

  const displayPrice = product.is_sale && product.sale_price 
    ? product.sale_price 
    : product.price;

  return (
    <>
      {/* Mobile View - Fixed Bottom Bar */}
      <div className="fixed md:hidden bottom-14 left-0 right-0 bg-white dark:bg-slate-800 border-t border-gray-200 dark:border-slate-700 shadow-lg z-40 p-3">
        <div className="flex items-center justify-between">
          {/* Product Image and Price */}
          <div className="flex items-center gap-3">
            <div className="relative w-16 h-16 bg-white rounded-lg border border-gray-200 dark:border-slate-600 flex items-center justify-center">
              {product.image ? (
                <Image
                  src={getStrapiMedia(product.image.url)!}
                  alt={product.image.name || product.name}
                  fill
                  className="object-contain p-2"
                  sizes="64px"
                />
              ) : (
                <FaRegImage className="w-8 h-8 text-gray-400" />
              )}
            </div>
            
            <div className="flex flex-col">
              <span className="text-lg font-bold text-siteColors-purple dark:text-slate-200">
                {displayPrice.toFixed(2)} €
              </span>
              {product.is_sale && (
                <span className="text-sm line-through text-gray-500 dark:text-slate-400">
                  {product.price.toFixed(2)} €
                </span>
              )}
            </div>
          </div>

          {/* Add to Cart Button */}
          <button
            onClick={handleAddProductClick}
            className="flex items-center justify-center px-6 py-3 bg-gradient-to-r from-siteColors-purple to-siteColors-pink text-white rounded-lg font-semibold hover:from-siteColors-pink hover:to-siteColors-purple transition-all duration-200 shadow-md hover:shadow-lg"
          >
            <FaOpencart className="mr-2" />
            <span>Προσθήκη</span>
          </button>
        </div>
      </div>

      {/* Desktop View */}
      <div className="hidden md:block mt-6">
        <button
          onClick={handleAddProductClick}
          className="w-full flex items-center justify-center px-6 py-4 bg-gradient-to-r from-siteColors-blue to-siteColors-lightblue text-white rounded-xl font-semibold text-lg hover:from-siteColors-lightblue hover:to-siteColors-blue transition-all duration-200 shadow-md hover:shadow-lg transform hover:scale-105"
        >
          <FaOpencart className="mr-3 text-xl" />
          <span>Προσθήκη στο Καλάθι</span>
        </button>
      </div>
    </>
  )
}

export default ProductAddToCart