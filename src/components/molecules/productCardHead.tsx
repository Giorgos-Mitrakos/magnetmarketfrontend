// 'use client'

import Image from "next/image"
import { getStrapiMedia } from "@/repositories/medias"
import Link from "next/link"
import {  IProductBrand } from "@/lib/interfaces/product"
import { IcategoryProductsProps } from "@/lib/interfaces/category"
import { getPrices } from "@/lib/helpers/priceHelper"

export interface ProductCardHeadProps extends IProductBrand {
    product: IcategoryProductsProps
}

function ProductCardHead(props: ProductCardHeadProps) {

    const price = props.product.attributes.price
    const is_sale = props.product.attributes.is_sale
    const salePrice = props.product.attributes.sale_price

    const { profit, discount } = getPrices({ price: price, sale_price: salePrice })

    const brandName = props.brand.data?.attributes.name
    const logo = props.brand.data && props.brand.data.attributes.logo.data ? props.brand.data.attributes.logo.data.attributes.formats ? props.brand.data.attributes.logo.data.attributes.formats.thumbnail.url : props.brand.data.attributes.logo.data.attributes.url : null

    return (
        <div className="grid grid-cols-2 h-full pb-2">
            <div className="relative w-full h-full">
                {logo &&
                    <Link className="h-full w-f" href={`/brands/${props.brand.data.attributes.slug}`}>
                        <Image className="flex object-contain object-left"
                            aria-label={`Λογότυπο της εταιρίας ${brandName}`}
                            src={getStrapiMedia(logo)}
                            fill
                            // width={36}
                            // height={36}
                            alt={`Λογότυπο ${props.brand.data.attributes.name}`}
                        /></Link>}
            </div>
            {discount && profit && is_sale &&
                <div className="absolute -top-4 -right-9 z-50 w-44 h-44">
                    <span className="relative left-8 origin-top-left text-center text-white font-bold rotate-45 block leading-7 bg-gradient-to-b from-siteColors-pink via-siteColors-pink to-siteColors-purple shadow-2xl
                    before:content-[''] before:absolute before:left-0 before:top-full before:border-4 before:border-l-siteColors-purple before:border-t-siteColors-purple before:border-b-transparent before:border-r-transparent 
                    after:content-[''] after:absolute after:right-0 after:top-full after:border-4 after:border-r-siteColors-purple after:border-t-siteColors-purple after:border-b-transparent after:border-l-transparent"
                        aria-label={`${profit < 50 ? `-${discount.toFixed(2)} %` : `Κέρδος ${profit.toFixed(2)} €`}`}>
                        {profit < 50 ? `-${discount.toFixed(2)} %` : `Κέρδος ${profit.toFixed(2)} €`}
                    </span>
                </div>}
        </div>
    )
}

export default ProductCardHead