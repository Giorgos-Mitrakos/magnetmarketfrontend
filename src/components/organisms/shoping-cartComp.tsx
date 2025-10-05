"use client"

import { useEffect, useRef } from "react"
import Image from "next/image"
import Link from "next/link"
import { useSession } from "next-auth/react"
import { FaRegTrashCan } from "react-icons/fa6"

// Components
import CartSummary from "@/components/atoms/cartSummary"
import Breadcrumb from "@/components/molecules/breadcrumb"
import SiteFeatures from "@/components/organisms/siteFeatures"

// Hooks & Utilities
import useProductPrice from "@/hooks/useProductPrice"
import { getStrapiMedia } from "@/repositories/medias"
import { ICartItem } from "@/lib/interfaces/cart"
import { trackCartEvent } from "@/lib/helpers/analytics"
import { useCheckout } from "@/context/checkout"
import { addToCartToast, removeItemToast } from "@/lib/toasts/cartToasts"

export default function CartComp() {
    const hasPageBeenRendered = useRef(false)
    const { checkout } = useCheckout()
    const { data: session, status } = useSession()

    const breadcrumbs = [
        { title: "Home", slug: "/" },
        { title: "Καλάθι", slug: `/shopping-cart` }
    ]

    useEffect(() => {
        if (!checkout.cart || hasPageBeenRendered.current) return

        if (checkout.cart.length > 0 && checkout.totals.subtotal > 0) {
            trackCartEvent('view_cart', checkout.cart)
            hasPageBeenRendered.current = true
        }
    }, [checkout.cart, checkout.totals.subtotal])

    return (
        <div className="mb-16">
            <SiteFeatures />
            <Breadcrumb breadcrumbs={breadcrumbs} />

            <h1 className="text-xl sm:text-3xl my-4 lg:my-8 text-center font-bold text-siteColors-purple dark:text-slate-200">
                Καλάθι αγορών
            </h1>

            <div className="grid lg:grid-cols-4 gap-4">
                <div className="lg:col-span-3">
                    {checkout.cart.length > 0 ? (
                        checkout.cart.map(item => (
                            <CartItemTemplate key={item.id} item={item} />
                        ))
                    ) : (
                        <div className="text-center py-12 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
                            <h2 className="text-lg font-semibold mb-4">Το καλάθι είναι άδειο!</h2>
                            <Link
                                href="/products"
                                className="inline-block px-6 py-2 bg-gradient-to-r from-siteColors-purple to-siteColors-pink text-white rounded-lg hover:opacity-90 transition-opacity"
                            >
                                Προς Προϊόντα
                            </Link>
                        </div>
                    )}
                </div>

                <div className="lg:col-span-1">
                    <div className="flex flex-col space-y-2 border rounded-lg p-4 bg-white dark:bg-slate-800 shadow-sm">
                        <CartSummary />
                        {checkout.cart.length > 0 && (
                            <Link
                                onClick={() => trackCartEvent('begin_checkout', checkout.cart)}
                                href={status === "authenticated"
                                    ? "/checkout/customer-informations"
                                    : "/login?callbackUrl=/checkout/customer-informations"
                                }
                                className="flex justify-center items-center px-4 py-2 w-full rounded border md:text-slate-100 text-lg font-semibold
                  bg-gradient-to-b from-siteColors-pink via-siteColors-purple to-siteColors-pink text-white
                  md:bg-gradient-to-br md:from-siteColors-lightblue md:to-siteColors-blue
                  hover:bg-gradient-to-b hover:from-siteColors-pink hover:via-siteColors-purple hover:to-siteColors-pink hover:text-white"
                            >
                                Επόμενο
                            </Link>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}

const CartItemTemplate = ({ item }: { item: ICartItem }) => {
    const { dispatch } = useCheckout()
    const { data, isLoading, error } = useProductPrice(item.id)

    const productData = data?.product.data.attributes
    const isOnSale = productData?.is_sale
    const price = isOnSale ? productData?.sale_price : productData?.price
    const totalPrice = price ? (item.quantity * price).toFixed(2) : "0.00"

    const handleRemoveItem = () => {
        dispatch({ type: "REMOVE_ITEM", payload: item })
        removeItemToast(item)
    }

    const handleIncreaseQuantity = () => {
        dispatch({ type: "INCREASE_ITEM_QUANTITY", payload: { item, quantity: 1 } })
        addToCartToast(item)
    }

    const handleDecreaseQuantity = () => {
        dispatch({ type: "DECREASE_ITEM_QUANTITY", payload: { item, quantity: 1 } })
        removeItemToast(item)
    }

    console.log("image", item.image)

    const imageUrl = item.image ?
        getStrapiMedia(
            item.image.formats?.thumbnail?.url ||
            item.image.url
        ) : null

    return (
        <div className="grid gap-y-4 gap-x-2 grid-cols-2 xs:grid-cols-9 lg:grid-cols-12 mb-4 p-4 border rounded-lg bg-white dark:bg-slate-800 shadow-sm">
            {/* Product Image - Column 1 */}
            <div className="col-span-2 lg:col-span-1">
                {imageUrl ? (
                    <div className="relative h-20 w-full">
                        <Image
                            className="object-contain object-center"
                            fill
                            src={imageUrl}
                            alt={item.name}
                            quality={75}
                        />
                    </div>
                ) : (
                    <div className="h-20 w-full bg-slate-100 dark:bg-slate-700 rounded flex items-center justify-center">
                        <span className="text-slate-400 text-xs">No image</span>
                    </div>
                )}
            </div>

            {/* Product Info - Column 2 */}
            <div className="col-span-2 xs:col-span-5 lg:col-span-4 flex flex-col justify-between">
                <Link
                    href={`/product/${item.slug}`}
                    className="text-sm lg:text-base line-clamp-2 xs:line-clamp-3 font-semibold text-siteColors-purple hover:text-siteColors-pink dark:text-slate-300 dark:hover:text-slate-200"
                >
                    {item.name}
                </Link>
                <div className="text-sm text-slate-500 dark:text-slate-300 mt-1">
                    Κωδικός: {item.id}
                </div>
                {!item.isAvailable && (
                    <div className="font-semibold text-red-500 dark:text-red-400 text-sm mt-1">
                        Το προϊόν δεν είναι διαθέσιμο
                    </div>
                )}
            </div>

            {/* Remove Button - Column 3 */}
            <div className="flex row-start-5 xs:row-start-1 xs:col-start-9 lg:col-start-12 col-span-2 lg:col-span-1 xs:col-span-1 items-start lg:items-center justify-end">
                <button
                    onClick={handleRemoveItem}
                    className="p-2 border border-red-500 dark:border-red-400 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                    aria-label="Αφαίρεση προϊόντος"
                >
                    <FaRegTrashCan className="text-xl text-red-500 dark:text-red-400" />
                </button>
            </div>

            {/* Price - Column 4 */}
            {isOnSale ? (
                <div className="flex flex-col xs:col-span-3 lg:col-span-2 items-center justify-center text-gray-500 font-semibold">
                    <span className="text-sm line-through text-slate-500 dark:text-slate-400">
                        {productData?.price?.toFixed(2)} €
                    </span>
                    <span className="text-lg font-bold text-siteColors-purple dark:text-slate-200">
                        {productData?.sale_price?.toFixed(2)} €
                    </span>
                </div>
            ) : (
                <div className="flex flex-col xs:col-span-3 lg:col-span-2 items-center justify-center text-slate-500 dark:text-slate-200 font-semibold">
                    <span className="text-lg font-bold">
                        {productData?.price?.toFixed(2)} €
                    </span>
                </div>
            )}

            {/* Quantity Controls - Column 5 */}
            <div className="xs:col-span-3 lg:col-span-2 flex items-center justify-center xs:justify-end">
                <div className="flex items-center border border-slate-200 dark:border-slate-700 rounded-lg">
                    <button
                        onClick={handleDecreaseQuantity}
                        disabled={item.quantity <= 1}
                        className="p-2 h-9 w-9 flex items-center justify-center bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed rounded-l-lg transition-colors"
                        aria-label="Μείωση ποσότητας"
                    >
                        <svg className="w-3 h-3 text-slate-900 dark:text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 12H4" />
                        </svg>
                    </button>

                    <span className="h-9 w-10 flex items-center justify-center bg-white dark:bg-slate-800 font-medium text-sm text-slate-900 dark:text-white">
                        {item.quantity}
                    </span>

                    <button
                        onClick={handleIncreaseQuantity}
                        className="p-2 h-9 w-9 flex items-center justify-center bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 rounded-r-lg transition-colors"
                        aria-label="Αύξηση ποσότητας"
                    >
                        <svg className="w-3 h-3 text-slate-900 dark:text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                        </svg>
                    </button>
                </div>
            </div>

            {/* Total Price - Column 6 */}
            <div className="col-span-2 xs:col-span-3 lg:col-span-2 flex items-center justify-end text-siteColors-purple dark:text-slate-200 text-lg font-semibold">
                {totalPrice} €
            </div>
        </div>
    )
}