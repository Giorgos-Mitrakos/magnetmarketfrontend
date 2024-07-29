"use client"

import Link from "next/link"
import { useContext } from "react"
import { CartContext, ICartItem } from "@/context/cart"
import Image from "next/image"
import { getStrapiMedia } from "@/repositories/medias"
import ProductCardPrice from "../atoms/productCardPrice"
import Badge from "../atoms/badge"

export default function Minicart() {
    const { cartItems } = useContext(CartContext)
    return (
        <section className="absolute z-20 w-1/3 bg-slate-50 rounded-lg p-4 top-36 right-4 hidden group-hover:block">
            <h2 className="text-lg space-y-2 font-semibold text-siteColors-purple">Το καλάθι σας</h2>
            <div>
                {cartItems.map(item => (
                    <div key={item.id} className="grid grid-cols-5">
                        {/* <div >{item.quantity}</div> */}
                        <div className="">
                            {item.image ?
                                <div className="relative h-40 w-full ">
                                    <div className="absolute top-0 left-0 w-6 h-6 z-40 inline-flex items-center justify-center text-xs font-bold text-white bg-siteColors-pink border-2 border-white rounded-full dark:border-gray-900">
                                        {item.quantity.toString()}
                                    </div>
                                    <Image
                                        // layout='responsive'
                                        className="object-contain object-center"
                                        // height={100}
                                        // width={100}
                                        fill
                                        src={getStrapiMedia(item.image)}
                                        alt={item.name}
                                        quality={75}
                                    />
                                </div> : <div></div>}
                        </div>
                        <Link href={`/product/${item.slug}`}
                            className="col-span-3 w-full text-sm lg:text-base line-clamp-2 font-semibold text-siteColors-purple hover:text-siteColors-pink">
                            {item.name}
                        </Link>
                        <ProductCardPrice id={item.id} />
                        {/* <div >{item.price}</div> */}
                    </div>)
                )}
            </div>
            <p>Μερικό σύνολο:</p>
            <Link href="/shopping-cart">Δείτε το καλάθι</Link>
        </section>
    )
}