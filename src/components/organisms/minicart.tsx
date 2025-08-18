"use client"

import Link from "next/link"
// import { useCart } from "@/context/cart"
import Image from "next/image"
import { getStrapiMedia } from "@/repositories/medias"
import ProductCardPrice from "../atoms/productCardPrice"
import { FaRegImage } from "react-icons/fa6"
import { useCheckout } from "@/context/checkout"

export default function Minicart() {
    const { checkout } = useCheckout()
    return (
        <section className="w-96 z-20 bg-slate-50 rounded-lg p-4">
            <button type="button" data-drawer-hide="drawer-right-example" aria-controls="drawer-right-example"
                className="text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm w-8 h-8 absolute top-2.5 end-2.5 inline-flex items-center justify-center dark:hover:bg-gray-600 dark:hover:text-white" >
                <svg className="w-3 h-3" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 14 14">
                    <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6" />
                </svg>
                <span className="sr-only">Close menu</span>
            </button>
            <h2 className="text-lg space-y-2 font-semibold text-siteColors-purple">Το καλάθι σας</h2>
            <div>
                {checkout.cart?.map(item => (
                    <div key={item.id} className="grid grid-cols-6 gap-2">
                        {/* <div >{item.quantity}</div> */}
                        <div className="">
                            {item.image ?
                                <div className="relative h-32 w-full ">
                                    <div className="absolute top-0 left-0 w-6 h-6 z-40 inline-flex items-center justify-center text-xs font-bold text-white bg-siteColors-pink border-2 border-white rounded-full dark:border-gray-900">
                                        {item.quantity.toString()}
                                    </div>
                                    {item.image ? <Image
                                        // layout='responsive'
                                        className="object-contain object-center"
                                        height={100}
                                        width={100}
                                        src={getStrapiMedia(item.image.data.attributes.formats.thumbnail.url)}
                                        alt={item.name}
                                        quality={75}
                                    /> :
                                        <FaRegImage className='h-40 w-40 text-siteColors-purple dark:text-slate-200' />}
                                </div> : <div></div>}
                        </div>
                        <Link href={`/product/${item.slug}`}
                            className="col-span-3 w-full text-sm lg:text-base line-clamp-2 font-semibold text-siteColors-purple hover:text-siteColors-pink">
                            {item.name}
                        </Link>
                        <div className="col-span-2">
                            {/* <ProductCardPrice product={item} /> */}
                        </div>
                        {/* <div >{item.price}</div> */}
                    </div>)
                )}
            </div>
            <p>Μερικό σύνολο:</p>
            <Link href="/shopping-cart">Δείτε το καλάθι</Link>
        </section>
    )
}