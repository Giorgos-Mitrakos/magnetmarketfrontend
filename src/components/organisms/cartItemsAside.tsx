"use client"

import useProductPrice from "@/hooks/useProductPrice"
import { getStrapiMedia } from "@/repositories/medias"
import { ICartItem } from "@/lib/interfaces/cart"
import Image from "next/image"
import Link from "next/link"
import { useCheckout } from "@/context/checkout"

const CartItem = ({ item }: { item: ICartItem }) => {
    const { profit, discount, isSale, salePrice, isLoading, error, data } = useProductPrice(item.id)
    const redAlert = item.isAvailable

    const imageUrl = item.image?.data?.attributes?.formats?.thumbnail?.url 
        ? getStrapiMedia(item.image.data.attributes.formats.thumbnail.url)
        : null

    return (
        <div className="flex gap-3 mb-4 py-3 border-b border-slate-200 dark:border-slate-700 last:border-b-0">
            {/* Product Image with Quantity Badge - Fixed width */}
            <div className="flex-shrink-0 relative">
                {imageUrl ? (
                    <div className="relative h-14 w-14">
                        <Image
                            src={imageUrl}
                            alt={item.name}
                            fill
                            className="object-contain"
                            quality={75}
                            placeholder="blur"
                            blurDataURL={imageUrl}
                        />
                        <div className="absolute inline-flex items-center justify-center w-5 h-5 text-xs font-bold text-white bg-siteColors-pink border-2 border-white rounded-full -top-2 left-0 dark:border-slate-800">
                            {item.quantity}
                        </div>
                    </div>
                ) : (
                    <div className="relative h-14 w-14 bg-slate-100 dark:bg-slate-700 rounded flex items-center justify-center">
                        <span className="text-xs text-slate-400">No image</span>
                        <div className="absolute inline-flex items-center justify-center w-5 h-5 text-xs font-bold text-white bg-siteColors-pink border-2 border-white rounded-full -top-2 left-0 dark:border-slate-800">
                            {item.quantity}
                        </div>
                    </div>
                )}
            </div>

            {/* Product Info - Takes available space, prevents overflow */}
            <div className="flex-1 min-w-0"> {/* min-w-0 prevents overflow */}
                <Link 
                    href={`/product/${item.slug}`}
                    className="text-sm font-semibold text-siteColors-purple hover:text-siteColors-pink dark:text-slate-300 dark:hover:text-slate-200 line-clamp-2 mb-1 break-words"
                >
                    {item.name}
                </Link>
                <div className="text-xs text-slate-500 dark:text-slate-400 mb-1 truncate">
                    Κωδικός: {item.id}
                </div>
                {!redAlert && (
                    <div className="text-xs font-semibold text-red-500 dark:text-red-400">
                        Το προϊόν δεν είναι διαθέσιμο
                    </div>
                )}
            </div>

            {/* Price Calculation - Fixed width, no wrapping */}
            <div className="flex-shrink-0 flex flex-col items-end justify-start ml-2">
                {/* Unit Price */}
                <div className="text-xs text-slate-500 dark:text-slate-400 mb-1 whitespace-nowrap">
                    {item.quantity} x {data?.product.data.attributes.price.toFixed(2)} €
                </div>

                {/* Sale Price or Regular Price */}
                {isSale && salePrice && profit && discount ? (
                    <div className="text-right">
                        {/* Original Price Strikethrough */}
                        <div className="text-xs line-through text-slate-500 dark:text-slate-500 mb-1 whitespace-nowrap">
                            {data && (item.quantity * data.product.data.attributes.price).toFixed(2)} €
                        </div>
                        
                        {/* Discount Info */}
                        <div className="text-xs text-green-600 dark:text-green-400 mb-1 whitespace-nowrap">
                            {item.quantity * profit < 50 
                                ? `-${discount.toFixed(2)}%` 
                                : `-${(item.quantity * profit).toFixed(2)}€`
                            }
                        </div>
                        
                        {/* Final Price */}
                        <div className="text-sm font-bold text-siteColors-purple dark:text-slate-200 whitespace-nowrap">
                            {(item.quantity * salePrice).toFixed(2)} €
                        </div>
                    </div>
                ) : (
                    <div className="text-sm font-bold text-siteColors-purple dark:text-slate-200 whitespace-nowrap">
                        {data && (item.quantity * data.product.data.attributes.price).toFixed(2)} €
                    </div>
                )}
            </div>
        </div>
    )
}

export default function CartAside() {
    const { checkout } = useCheckout()

    return (
        <div className="bg-white dark:bg-slate-700 rounded-lg border border-slate-200 dark:border-slate-700 p-4 shadow-sm">
            <h2 className="text-lg font-semibold text-siteColors-purple dark:text-slate-200 mb-4 pb-2 border-b border-slate-200 dark:border-slate-700">
                Η παραγγελία μου
            </h2>
            
            <div className="max-h-72 overflow-y-auto">
                {checkout.cart.length > 0 ? (
                    checkout.cart.map(item => (
                        <CartItem key={item.id} item={item} />
                    ))
                ) : (
                    <div className="text-center py-4 text-slate-500 dark:text-slate-400">
                        Το καλάθι είναι άδειο
                    </div>
                )}
            </div>

            
        </div>
    )
}