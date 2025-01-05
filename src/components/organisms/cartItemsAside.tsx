"use client"

import { CartContext, ICartItem } from "@/context/cart"
import useProductPrice from "@/hooks/useProductPrice"
import { getStrapiMedia } from "@/repositories/medias"
import { useSession } from "next-auth/react"
import Image from "next/image"
import Link from "next/link"
import { useContext } from "react"

const CartItem = ({ item }: { item: ICartItem }) => {
    const { profit, discount, isSale, salePrice, isLoading, error, data } = useProductPrice(item.id)
    
    const redAlert = item.isAvailable
    return (
        <div className="grid gap-y-4 space-x-4 grid-cols-6 mb-4 py-2 border-t last:border-b">
            <div className="relative col-span-1">
                {item.image ?
                    <div className="relative h-20 w-full">
                        <Image
                            // layout='responsive'
                            // className="object-center"
                            height={100}
                            width={100}
                            // fill
                            src={getStrapiMedia(item.image)}
                            alt={item.name}
                            quality={75}
                        />
                    </div> : <div></div>}
                <div className="absolute inline-flex items-center justify-center w-6 h-6 text-xs font-bold text-white bg-siteColors-pink border-2 border-white 
                rounded-full -top-1 -left-1 dark:border-gray-900">
                    {item.quantity}
                </div>
            </div>
            <div className="col-span-5 flex flex-col justify-between">
                <Link href={`/product/${item.slug}`}
                    className="text-sm lg:text-base line-clamp-2 xs:line-clamp-3 font-semibold text-siteColors-purple dark:text-slate-300 dark:hover:text-slate-200 hover:text-siteColors-pink">{item.name}</Link>
                <div className="text-sm text-slate-500 dark:text-slate-300">Κωδικός : {item.id}</div>
                {
                    !redAlert && <div className="font-semibold text-red-500 dark:text-red-400">Το προϊόν δεν είναι διαθέσιμο</div>
                }
            </div>
            <div className="col-span-2 flex items-center justify-start text-slate-500 dark:text-slate-200 text-sm font-semibold">{item.quantity} x {data?.product.data.attributes.price} €</div>
            <div className="col-span-4 flex flex-col items-end justify-end text-siteColors-purple font-semibold">
                {isSale && salePrice && profit && discount ?
                    <div className="grid items-end">
                        <h3 className="flex text-sm line-through justify-end align-top text-slate-500 dark:text-slate-300"
                            aria-label={`${data?.product.data.attributes.price.toFixed(2)} €`}>{data && (item.quantity * data.product.data.attributes.price).toFixed(2)} €</h3>

                        <div className="grid grid-cols-2 items-end">
                            <label className="font-semibol  dark:text-slate-300"
                                aria-label={item.quantity * profit < 50 ? 'Έκπτωση:' : 'Κέρδος:'}>{item.quantity * profit < 50 ? 'Έκπτωση:' : 'Κέρδος:'}</label>
                            <h3 className="flex justify-end font-bold text-sm dark:text-slate-200"
                                aria-label={`${item.quantity * profit < 50 ? `${discount.toFixed(2)} %` : `${(item.quantity * profit).toFixed(2)} €`}`}>
                                {item.quantity * profit < 50 ? `-${discount.toFixed(2)} %` : `-${(item.quantity * profit).toFixed(2)} €`}
                            </h3>
                        </div>
                        <div className="grid grid-cols-2 items-end font-bold ">
                            <label className=" dark:text-slate-300">Κόστος:</label>
                            <h3 className=" dark:text-slate-200">{(item.quantity * salePrice).toFixed(2)} €</h3>
                        </div>

                    </div>
                    : <div className="grid grid-cols-2 items-end font-bold">
                        <label className=" dark:text-slate-300">Κόστος:</label>
                        <h3 className=" dark:text-slate-200" aria-label={`${data?.product.data.attributes.price.toFixed(2)} €`}>
                            {data && (item.quantity * data.product.data.attributes.price).toFixed(2)} €
                        </h3>
                    </div>}
            </div>
        </div>
    )
}

export default function CartAside() {
    const { cartItems } = useContext(CartContext)
    const { data: session, status } = useSession()

    return (
        <div>
            <h2 className="text-lg mb-2 font-medium text-siteColors-purple  dark:text-slate-200">Η παραγγελία μου</h2>
            {cartItems.map(item => (
                <CartItem key={item.id} item={item} />)
            )}
        </div>
    )

}

