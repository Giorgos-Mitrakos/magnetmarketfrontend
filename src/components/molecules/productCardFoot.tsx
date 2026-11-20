"use client"
import { FaOpencart, FaRegEye } from "react-icons/fa"
import WishlistButton from "@/components/atoms/WishlistButton"
import { ICartItem } from "@/lib/interfaces/cart"
import { useCheckout } from "@/context/checkout"
import { announceAddedToCart } from "@/lib/helpers/crossSellEvents"
import Link from "next/link"
import { IProductCard } from "@/lib/interfaces/product"
import { useRouter } from "next/navigation"


const ProductCardFoot = ({ product }: { product: IProductCard }) => {
    const { dispatch } = useCheckout()
    const router = useRouter()

    // (2026-11-19) Χωρίς τιμή (brand «Ζητήστε τιμή», σε όποια κατάσταση) = όπως το «Ζητήστε τιμή»
    const isAskForPrice = product.status === 'AskForPrice' || product.price == null;
    const isOutOfStock = product.status === 'OutOfStock';
    const isExpacted = product.status === 'IsExpected';

    const item: ICartItem = {
        id: product.id,
        // documentId του Strapi v3 — με αυτό ταυτοποιείται το προϊόν στην παραγγελία
        documentId: (product as { documentId?: string }).documentId,
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
        announceAddedToCart(product)
    }

    // ✅ Handler για quick view
    const handleQuickView = (e: React.MouseEvent) => {
        e.preventDefault()
        e.stopPropagation()
        router.push(`/product/${product.slug}`)
    }

    return (
        // relative z-10: τα κουμπιά βρίσκονται πάνω από τον σύνδεσμο της κάρτας
        <div className="relative z-10 grid grid-cols-3 gap-2 text-xl text-slate-50 mt-4">
            <WishlistButton documentId={product.documentId} product={product} variant="card" />

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