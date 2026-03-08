'use client'

import Link from "next/link"
import Image from 'next/image'
import { getStrapiMedia } from "@/repositories/medias"
import { FaRegImage } from "react-icons/fa"
import ProductCardHead from "../molecules/productCardHead"
import ProductCardPrice from "../atoms/productCardPrice"
import ProductCardFoot from "../molecules/productCardFoot"
import { IProductCard } from "@/lib/interfaces/product"
import { trackSelectItem } from "@/lib/helpers/analytics"
import { fbTrackViewContent } from "@/lib/helpers/facebook-pixel"
import { useCallback } from "react"
import ProductAvailability from "../atoms/productAvailability"

// Main Product Card Component
export type ProductCardProps = {
    product: IProductCard
    listName?: string      // ✅ Νέο prop για tracking
    listId?: string        // ✅ Νέο prop για tracking
    position?: number      // ✅ Νέο prop για tracking
}

const ProductCard = ({
    product,
    listName = 'Products',
    listId,
    position
}: ProductCardProps) => {

    const isAskForPrice = product.status === 'AskForPrice';

    // ✅ Handler για product click tracking
    const handleProductClick = useCallback(() => {
        // GA4 - select_item tracking
        // Το trackSelectItem κάνει αυτόματα conversion από IProductCard
        trackSelectItem(product, listName)

        // Facebook Pixel - ViewContent
        // Χρειάζεται ICartItem format - κάνουμε inline conversion
        const cartItem = {
            ...product,
            brand: typeof product.brand === 'string' ? product.brand : product.brand?.name || null,
            quantity: 1,
            weight: product.weight || 0,
            isAvailable: product.inventory > 0,
            sale_price: product.sale_price || null,
            is_sale: product.is_sale || false,
        }
        fbTrackViewContent(cartItem as any)

    }, [product, listName, position])

    return (
        <Link
            href={`/product/${product.slug}`}
            className="group relative h-full pt-2 pb-12 px-1 max-w-96 overflow-hidden transition-all duration-300 hover:scale-[1.02] block"
            aria-label={`Σύνδεσμος για την αναλυτική σελίδα του προϊόντος ${product.name}`}
            onClick={handleProductClick} // ✅ Tracking - μόνο ΕΔΩ στο κύριο Link
        >
            <div className="grid h-full grid-rows-cardLayout shadow-md hover:shadow-xl dark:shadow-slate-700 dark:hover:shadow-slate-600 bg-white dark:bg-slate-800 rounded-xl m-1 p-4 transition-all duration-300">
                <ProductCardHead product={product} />

                <div className="grid w-full place-content-center bg-white relative min-h-[216px] rounded-lg overflow-hidden">
                    {product.image ? (
                        <Image
                            className="object-contain p-2 transition-transform duration-300 group-hover:scale-105"
                            aria-label={`Φωτογραφία προϊόντος ${product.name}`}
                            loading="lazy"
                            src={getStrapiMedia(
                                product.image.formats?.small?.url ||
                                product.image.url
                            )!}
                            alt={product.image.alternativeText || product.name}
                            quality={80}
                            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 25vw, 20vw"
                            fill
                        />
                    ) : (
                        <div className="h-40 w-full flex items-center justify-center">
                            <FaRegImage className='h-20 w-20 text-siteColors-purple/40 dark:text-slate-500' />
                        </div>
                    )}
                </div>

                <div className='mt-4 grid grid-rows-5 justify-between border-b border-gray-100 dark:border-slate-700 pb-3'>
                    <div className="row-span-4">
                        <h2 className='w-full font-semibold text-base md:text-lg text-left break-words line-clamp-3 text-siteColors-purple dark:text-slate-200 dark:group-hover:text-slate-100 group-hover:text-siteColors-pink transition-colors duration-200'
                            aria-label="Τίτλος προϊόντος">
                            {product.name}
                        </h2>
                    </div>
                    <p className="text-xs text-gray-500 dark:text-slate-400 mt-1">Κωδ: {product.id}</p>
                </div>

                {/* ✅ Χρήση του νέου ProductAvailability component */}
                {!isAskForPrice &&
                <div className="flex items-center justify-center mt-2">
                    <ProductAvailability
                        status={product.status}
                        inventory={product.inventory}
                        isInHouse={product.is_in_house}
                        variant="badge"
                    />
                </div>}

                <ProductCardPrice product={product} />
                <ProductCardFoot product={product} />
            </div>
        </Link>
    )
}

const ProductCardSkeleton = () => {
    return (
        <div className="group relative py-2 px-1 max-w-96 overflow-hidden">
            <div className="grid h-full grid-rows-cardLayout shadow-md dark:shadow-slate-700 bg-white dark:bg-slate-800 rounded-xl m-1 p-4">
                {/* Product Card Head Skeleton */}
                <div className="grid grid-cols-2 h-8 pb-2 items-center">
                    <div className="relative w-full">
                        <div className="h-6 w-24 bg-gray-200 dark:bg-slate-600 rounded-md animate-pulse"></div>
                    </div>
                    <div className="flex justify-end">
                        <div className="h-8 w-8 bg-gray-200 dark:bg-slate-600 rounded-full animate-pulse"></div>
                    </div>
                </div>

                {/* Product Image Skeleton */}
                <div className="grid w-full place-content-center bg-gray-200 dark:bg-slate-600 relative min-h-[216px] rounded-lg overflow-hidden animate-pulse">
                    <div className="h-full w-full flex items-center justify-center">
                        <div className="h-20 w-20 rounded-full bg-gray-300 dark:bg-slate-500"></div>
                    </div>
                </div>

                {/* Product Title & Code Skeleton */}
                <div className='mt-4 grid justify-between border-b border-gray-100 dark:border-slate-700 pb-3 space-y-2'>
                    <div className="space-y-2">
                        <div className="h-5 bg-gray-200 dark:bg-slate-600 rounded animate-pulse"></div>
                        <div className="h-5 bg-gray-200 dark:bg-slate-600 rounded animate-pulse w-4/5"></div>
                        <div className="h-5 bg-gray-200 dark:bg-slate-600 rounded animate-pulse w-3/5"></div>
                    </div>
                    <div className="h-3 bg-gray-200 dark:bg-slate-600 rounded animate-pulse w-20 mt-2"></div>
                </div>

                {/* Availability Skeleton */}
                <div className="flex items-center justify-center my-2">
                    <div className="h-6 w-40 bg-gray-200 dark:bg-slate-600 rounded-full animate-pulse"></div>
                </div>

                {/* Product Price Skeleton */}
                <div className="flex justify-end items-center my-3">
                    <div className="h-7 w-24 bg-gray-200 dark:bg-slate-600 rounded-md animate-pulse"></div>
                </div>

                {/* Product Card Footer Skeleton */}
                <div className="grid grid-cols-3 gap-2 text-xl mt-4">
                    <div className="h-9 bg-gray-200 dark:bg-slate-600 rounded-lg animate-pulse"></div>
                    <div className="h-9 bg-gray-200 dark:bg-slate-600 rounded-lg animate-pulse"></div>
                    <div className="h-9 bg-gray-200 dark:bg-slate-600 rounded-lg animate-pulse"></div>
                </div>
            </div>
        </div>
    )
}

export { ProductCardSkeleton }

export default ProductCard