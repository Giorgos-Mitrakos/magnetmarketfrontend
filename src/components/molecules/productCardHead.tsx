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

const ProductCardHead = (props: ProductCardHeadProps) => {
  const price = props.product.attributes.price
  const is_sale = props.product.attributes.is_sale
  const salePrice = props.product.attributes.sale_price

  const { profit, discount } = getPrices({ price: price, sale_price: salePrice })

  const brandName = props.brand.data?.attributes.name
  const logo = props.brand.data && props.brand.data.attributes.logo.data 
    ? props.brand.data.attributes.logo.data.attributes.formats 
      ? props.brand.data.attributes.logo.data.attributes.formats.thumbnail.url 
      : props.brand.data.attributes.logo.data.attributes.url 
    : null

  return (
    <div className="flex h-full pb-2 items-center">
      <div className="relative w-full h-8">
        {logo && (
          <Link className="h-full w-full block" href={`/brands/${props.brand.data.attributes.slug}`}>
            <Image 
              className="object-contain object-left"
              aria-label={`Λογότυπο της εταιρίας ${brandName}`}
              src={getStrapiMedia(logo)}
              fill
              alt={`Λογότυπο ${props.brand.data.attributes.name}`}
            />
          </Link>
        )}
      </div>
      
      {discount && profit && is_sale && (
        <div className="flex justify-end">
          <div className="relative bg-gradient-to-br from-siteColors-pink to-siteColors-purple text-white text-xs font-bold py-1 px-3 rounded-full shadow-md transform rotate-0">
            {profit < 50 ? `-${discount.toFixed(0)}%` : `Κέρδος ${profit.toFixed(2)}€`}
          </div>
        </div>
      )}
    </div>
  )
}


export default ProductCardHead