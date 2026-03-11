"use client"
import { FaHeart, FaOpencart, FaRegEye } from "react-icons/fa"
import { ICartItem } from "@/lib/interfaces/cart"
import { useCheckout } from "@/context/checkout"
import { addToCartToast } from "@/lib/toasts/cartToasts"
import Link from "next/link"
import { IProductCard } from "@/lib/interfaces/product"
import { useRouter } from "next/navigation"


const ProductCardFoot = ({ product }: { product: IProductCard }) => {
    const { dispatch } = useCheckout()
    const router = useRouter()

    const isAskForPrice = product.status === 'AskForPrice';
    const isOutOfStock = product.status === 'OutOfStock';
    const isExpacted = product.status === 'IsExpected';

    const item: ICartItem = {
        id: product.id,
        name: product.name,
        slug: product.slug,
        status: product.status,
        image: product.image || null,
        weight: product.weight,
        price: product.price,
        brand: product.brand?.name || null,
        quantity: 1,
        isAvailable: true,
        is_sale: product.is_sale,
        sale_price: product.sale_price,
        category: product.category
    }

    const handleAddProductClick = (product: ICartItem) => {
        if (isAskForPrice || isOutOfStock || isExpacted) return; // Αν είναι AskForPrice, μην κάνεις τίποτα
        dispatch({ type: "ADD_ITEM", payload: product })
        addToCartToast(product)
    }

    // ✅ Handler για quick view
    const handleQuickView = (e: React.MouseEvent) => {
        e.preventDefault()
        e.stopPropagation()
        router.push(`/product/${product.slug}`)
    }

    // ✅ Handler για wishlist (προσθήκη λειτουργίας αν χρειάζεται)
    const handleWishlist = (e: React.MouseEvent) => {
        e.preventDefault()
        e.stopPropagation()
        // Προσθέστε κώδικα για wishlist εδώ
        console.log('Add to wishlist:', product.id)
    }

    return (
        <div className="grid grid-cols-3 gap-2 text-xl text-slate-50 mt-4">
            <button
                className="flex justify-center items-center p-2 text-slate-400 dark:text-slate-400 rounded-lg
                  bg-gray-100 dark:bg-slate-700 hover:bg-siteColors-pink/20 hover:text-siteColors-pink dark:hover:bg-siteColors-pink/20 transition-all duration-200"
                aria-label="Προσθήκη στα αγαπημένα">
                <FaHeart aria-hidden="true" />
            </button>

            <button
                onClick={handleQuickView}
                className="flex justify-center items-center p-2 text-slate-400 dark:text-slate-400 rounded-lg
                  bg-gray-100 dark:bg-slate-700 hover:bg-siteColors-blue/20 hover:text-siteColors-blue dark:hover:bg-siteColors-blue/20 transition-all duration-200"
                aria-label="Επισκόπηση προϊόντος">
                <FaRegEye aria-hidden="true" />
            </button>

            <button
                onClick={(e) => {
                    if (isAskForPrice || isOutOfStock || isExpacted) return;
                    e.preventDefault()
                    e.stopPropagation()
                    handleAddProductClick(item)
                }}
                disabled={isAskForPrice || isOutOfStock || isExpacted}
                className={`flex justify-center items-center p-2 rounded-lg bg-
                ${isAskForPrice || isOutOfStock || isExpacted
                        ? 'bg-gray-300 dark:bg-slate-600 text-gray-500 dark:text-slate-400 cursor-not-allowed'
                        : 'bg-gradient-to-br from-siteColors-lightblue to-siteColors-blue hover:from-siteColors-pink hover:to-siteColors-purple transform hover:scale-105'
                    }
                transition-all duration-300 shadow-md hover:shadow-lg`}
                aria-label={isAskForPrice ? "Ζητήστε τιμή" : "Προσθήκη στο καλάθι"}
                title={isAskForPrice ? "Καλέστε για τιμή" : ""}>

                <FaOpencart aria-hidden="true" />
            </button>
        </div>
    )
}

export default ProductCardFoot