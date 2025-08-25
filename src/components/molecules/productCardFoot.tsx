"use client"
// import { useCart } from "@/context/cart"
import { FaHeart, FaOpencart, FaRegEye } from "react-icons/fa"
import { ProductCardProps } from "../organisms/productCard"
import { ICartItem } from "@/lib/interfaces/cart"
import { useCheckout } from "@/context/checkout"
import { addToCartToast } from "@/lib/toasts/cartToasts"
import Link from "next/link"


const ProductCardFoot = ({ product }: ProductCardProps) => {
    const { dispatch } = useCheckout()

    const item: ICartItem = {
        id: product.id,
        name: product.attributes.name,
        slug: product.attributes.slug,
        image: product.attributes.image || null,
        weight: product.attributes.weight,
        price: product.attributes.price,
        brand: product.attributes.brand.data?.attributes.name || null,
        quantity: 1,
        isAvailable: true,
        is_sale: product.attributes.is_sale,
        sale_price: product.attributes.sale_price,
        category: product.attributes.category
    }

    const handleAddProductClick = (product: ICartItem) => {
        dispatch({ type: "ADD_ITEM", payload: product })
        addToCartToast(product)
    }

    return (
        <div className="grid grid-cols-3 gap-2 text-xl text-slate-50 mt-4">
            <button
                className="flex justify-center items-center p-2 text-slate-400 dark:text-slate-400 rounded-lg
                  bg-gray-100 dark:bg-slate-700 hover:bg-siteColors-pink/20 hover:text-siteColors-pink dark:hover:bg-siteColors-pink/20 transition-all duration-200"
                aria-label="Προσθήκη στα αγαπημένα">
                <FaHeart aria-hidden="true" />
            </button>

            <Link
                href={`/product/${product.attributes.slug}`}
                className="flex justify-center items-center p-2 text-slate-400 dark:text-slate-400 rounded-lg
                  bg-gray-100 dark:bg-slate-700 hover:bg-siteColors-blue/20 hover:text-siteColors-blue dark:hover:bg-siteColors-blue/20 transition-all duration-200"
                aria-label="Επισκόπηση προϊόντος">
                <FaRegEye aria-hidden="true" />
            </Link>

            <button
                onClick={() => handleAddProductClick(item)}
                className="flex justify-center items-center p-2 rounded-lg
                  bg-gradient-to-br from-siteColors-lightblue to-siteColors-blue
                  hover:from-siteColors-pink hover:to-siteColors-purple 
                  transition-all duration-300 transform hover:scale-105 shadow-md hover:shadow-lg"
                aria-label="Προσθήκη προϊόντος στο καλάθι σου">
                <FaOpencart aria-hidden="true" />
            </button>
        </div>
    )
}

export default ProductCardFoot