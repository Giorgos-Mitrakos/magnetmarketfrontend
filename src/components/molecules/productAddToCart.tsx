"use client"

import { useContext } from "react"
import {  FaOpencart, } from "react-icons/fa"
import useProductPrice from "@/hooks/useProductPrice"
import Image from "next/image"
import { getStrapiMedia } from "@/repositories/medias"
import { CartContext, ICartItem } from "@/context/cart"
import { FaRegImage } from "react-icons/fa6"
import { IProduct } from "@/lib/interfaces/product"


function ProductAddToCart({ product }: {product:IProduct}) {
    const { profit, discount, isSale, isLoading, error, data } = useProductPrice(product.id)
    const { cartItems, addToCart } = useContext(CartContext)

    const item: ICartItem = {
        id: product.id,
        name: product.attributes.name,
        slug: product.attributes.slug,
        image: product.attributes.image.data?.attributes.url,
        weight: product.attributes.weight,
        price: product.attributes.price,
        brand: product.attributes.brand.data?.attributes.name || null,
        quantity: 1,
        isAvailable: true,
        category: product.attributes.category
    }

    const handleAddProductClick = (product: ICartItem) => {
        addToCart(product)
    }

    return (
        <div className="fixed md:static pb-4 shadow-topShadow md:shadow-none bottom-14 left-0 justify-center w-full bg-white dark:bg-slate-800 z-10">

            <div className="flex md:hidden h-14 my-1 justify-between p-4 items-center">
                {data?.product.data.attributes.is_sale ?
                    <div className="flex flex-col">
                        <h2 className="text-xl font-bold text-siteColors-purple dark:text-slate-200"
                            aria-label={`${data?.product.data.attributes.sale_price} €`}>{data?.product.data.attributes.sale_price} €</h2>
                        <h3 className="text-sm line-through align-top mr-1 text-gray-500 dark:text-slate-300"
                            aria-label={`${data?.product.data.attributes.price} €`}>{data?.product.data.attributes.price} €</h3>
                    </div>
                    : <span className="text-xl font-bold"
                        aria-label={`${data?.product.data.attributes.price} €`}>{data?.product.data.attributes.price} €</span>}
                <h4 className="hidden xs:inline-block text-base text-lime-700 dark:text-lime-400"
                    aria-label={`${data?.product.data.attributes.status} €`}>{data?.product.data.attributes.status}</h4>
                {product.attributes.image.data ? <Image className="object-contain p-2"
                    height={72}
                    width={72}
                    src={getStrapiMedia(product.attributes.image.data.attributes.url)}
                    alt={product.attributes.image.data.attributes.name || "Φωτογραφία Προϊόντος"}
                    aria-label={product.attributes.image.data.attributes.name || "Φωτογραφία Προϊόντος"}
                    quality={75} /> :
                    <FaRegImage className='h-16 w-16' />}
            </div>
            <div className="w-full rounded-lg px-2 flex">
                <button
                    onClick={() => handleAddProductClick(item)}
                    className="flex justify-center items-center px-4 py-2 w-full rounded border dark:border-slate-300 md:text-slate-100 text-lg font-semibold
                bg-gradient-to-b from-siteColors-pink via-siteColors-purple to-siteColors-pink text-white
            md:bg-gradient-to-br md:from-siteColors-lightblue md:to-siteColors-blue
            hover:bg-gradient-to-b hover:from-siteColors-pink hover:via-siteColors-purple hover:to-siteColors-pink hover:text-white">
                    <FaOpencart
                        className="text-xl mr-4"
                        aria-label="Προσθήκη στο καλάθι" />
                    <span className="hidden xs:inline-block">Προσθήκη στο Καλάθι</span>
                    <span className="xs:hidden">Καλάθι</span>
                </button>
                {/* <button className=" w-14 border flex justify-center items-center text-xl text-slate-400 rounded-md
            hover:bg-gradient-to-br hover:from-siteColors-pink hover:to-siteColors-purple hover:text-white">
                    <FaHeart
                        aria-label="Καρδιά"
                        aria-description="Προσθήκη στα αγαπημένα" />
                </button> */}
            </div>
        </div>
    )
}

export default ProductAddToCart