"use client"

import CartSummary from "@/components/atoms/cartSummary"
import ApplyCoupon from "@/components/atoms/discountCoupon"
import Breadcrumb from "@/components/molecules/breadcrumb"
import SiteFeatures from "@/components/organisms/siteFeatures"
import { CartContext, createCategories, ICartItem } from "@/context/cart"
import useProductPrice from "@/hooks/useProductPrice"
import { getStrapiMedia } from "@/repositories/medias"
import Image from "next/image"
import Link from "next/link"
import { useContext, useEffect, useRef, useState } from "react"
import { FaRegTrashCan } from "react-icons/fa6";
import { useSession } from "next-auth/react"

export default function CartComp() {
    const hasPageBeenRendered = useRef(false)
    const { cartItems, cartTotal, sendEvent } = useContext(CartContext)
    const { data: session, status } = useSession()
    const breadcrumbs = [
        {
            title: "Home",
            slug: "/"
        },
        {
            title: "Καλάθι",
            slug: `/shopping-cart`
        }
    ]

    useEffect(() => {
        if (cartItems.length > 0 && cartTotal > 0 && !hasPageBeenRendered.current) {
            sendEvent('add_to_cart')
            hasPageBeenRendered.current=(true)
        }
    }, [])

    return (
        <div className='mb-16'>
            <SiteFeatures />
            <Breadcrumb breadcrumbs={breadcrumbs} />
            <h1 className="text-xl sm:text-3xl my-4 lg:my-8 text-center font-bold text-slate-700 dark:text-slate-200">Καλάθι αγορών</h1>
            <div className="grid lg:grid-cols-4 gap-4">
                <div className="lg:col-span-3">
                    {cartItems.map(item => (
                        <CartItemTemplate key={item.id} item={item} />)
                    )}
                </div>
                <div>
                    <div className="flex flex-col space-y-2 border rounded">
                        {/* <ApplyCoupon /> */}
                        <CartSummary />
                        <Link onClick={()=>sendEvent('begin_checkout')} href={`${status === "authenticated" ? "/checkout/customer-informations" : "/login?callbackUrl=/checkout/customer-informations"}`}
                            className="flex justify-center items-center px-4 py-2 w-full rounded border md:text-slate-100 text-lg font-semibold
                        bg-gradient-to-b from-siteColors-pink via-siteColors-purple to-siteColors-pink text-white
                        md:bg-gradient-to-br md:from-siteColors-lightblue md:to-siteColors-blue
                        hover:bg-gradient-to-b hover:from-siteColors-pink hover:via-siteColors-purple hover:to-siteColors-pink hover:text-white">Επόμενο</Link>
                    </div>
                </div>
            </div>
        </div>
    )
}

const CartItemTemplate = ({ item }: { item: ICartItem }) => {
    const { increaseQuantity, decreaseQuantity, removeFromCart } = useContext(CartContext)
    const { profit, discount, isSale, isLoading, error, data } = useProductPrice(item.id)

    const redAlert = item.isAvailable
    return (
        <div className="grid gap-y-4 gap-x-2 grid-cols-2 xs:grid-cols-9 lg:grid-cols-12 mb-4 p-2 border rounded">
            <div className="col-span-2 lg:col-span-1">
                {item.image ?
                    <div className="relative h-20 w-full ">
                        <Image
                            // layout='responsive'
                            className="object-contain object-center"
                            // height={100}
                            // width={100}
                            fill
                            src={getStrapiMedia(item.image.data.attributes.formats.thumbnail.url)}
                            alt={item.name}
                            quality={75}
                        />
                    </div> : <div></div>}
            </div>
            <div className="col-span-2 xs:col-span-5 lg:col-span-4 flex flex-col justify-between">
                <Link href={`/product/${item.slug}`}
                    className="text-sm lg:text-base line-clamp-2 xs:line-clamp-3 font-semibold text-siteColors-purple hover:text-siteColors-pink dark:text-slate-300 dark:hover:text-slate-200">{item.name}</Link>
                <div className="text-sm text-slate-500 dark:text-slate-300">Κωδικός : {item.id}</div>
                {
                    !redAlert && <div className="font-semibold text-red-500 dark:text-red-400">Το προϊόν δεν είναι διαθέσιμο</div>
                }
            </div>
            <button
                onClick={() => removeFromCart(item)}
                className="flex row-start-5 xs:row-start-1 xs:col-start-9 lg:col-start-12 col-span-2 lg:col-span-1 xs:col-span-1 border xs:border-none p-2 border-red-500 items-start lg:items-center justify-center">
                <FaRegTrashCan className="text-3xl text-red-500 dark:text-red-400" />
            </button>
            {data?.product.data.attributes.is_sale ?
                <div className="flex flex-col  xs:col-span-3 lg:col-span-2 items-center justify-center text-gray-500 font-semibold">
                    <h3 className="text-sm line-through align-top mr-1 text-slate-500 dark:text-slate-300"
                        aria-label={`${data?.product.data.attributes.price.toFixed(2)} €`}>{data?.product.data.attributes.price.toFixed(2)} €</h3>
                    <h2 className="text-lg font-bold dark:text-slate-200"
                        aria-label={`${data?.product.data.attributes.sale_price.toFixed(2)} €`}>{data?.product.data.attributes.sale_price.toFixed(2)} €</h2>
                </div>
                : <div className="flex flex-col  xs:col-span-3 lg:col-span-2 items-center justify-center text-slate-500 dark:text-slate-200 font-semibold">
                    <span className="text-lg font-bold"
                        aria-label={`${data?.product.data.attributes.price.toFixed(2)} €`}>
                        {data?.product.data.attributes.price.toFixed(2)} €</span>
                </div>}
            {/* <div className=" xs:col-span-3 lg:col-span-2 flex items-center justify-center text-gray-500 font-semibold">{data?.product.data.attributes.price} €</div> */}
            <div className=" xs:col-span-3 lg:col-span-2  flex items-center justify-center xs:justify-end">
                <button type="button" id="decrement-button"
                    onClick={() => decreaseQuantity(item)}
                    className="bg-gray-100 dark:bg-gray-700 dark:hover:bg-gray-600 dark:border-gray-600 hover:bg-gray-200 border border-gray-300 rounded-s-lg p-3 h-11 focus:ring-gray-100 dark:focus:ring-gray-700 focus:ring-2 focus:outline-none">
                    <svg className="w-3 h-3 text-gray-900 dark:text-white" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 18 2">
                        <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M1 1h16" />
                    </svg>
                </button>
                <input type="text" id="items-input" aria-describedby="items count"
                    className="bg-gray-50 border-x-0 border-gray-300 h-11 font-medium text-center text-gray-900 text-sm focus:ring-blue-500 focus:border-blue-500 block w-10 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" value={item.quantity} required disabled></input>
                <button type="button" id="increment-button"
                    onClick={() => increaseQuantity(item)}
                    className="bg-gray-100 dark:bg-gray-700 dark:hover:bg-gray-600 dark:border-gray-600 hover:bg-gray-200 border border-gray-300 rounded-e-lg p-3 h-11 focus:ring-gray-100 dark:focus:ring-gray-700 focus:ring-2 focus:outline-none">
                    <svg className="w-3 h-3 text-gray-900 dark:text-white" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 18 18">
                        <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 1v16M1 9h16" />
                    </svg>
                </button>
            </div>
            <div className="col-span-2 xs:col-span-3 lg:col-span-2 flex items-center justify-end text-siteColors-purple dark:text-slate-200 text-lg font-semibold">{
                data?.product.data.attributes.is_sale ?
                    data?.product.data.attributes.sale_price && (item.quantity * data?.product.data.attributes.sale_price).toFixed(2) :
                    data?.product.data.attributes.price && (item.quantity * data?.product.data.attributes.price).toFixed(2)} €</div>

        </div>
    )
}