// 'use client'

import Image from "next/image"
import { getStrapiMedia } from "@/repositories/medias"
import Link from "next/link"
import { IProductCard } from "@/lib/interfaces/product"
import { getPrices } from "@/lib/helpers/priceHelper"

const ProductCardHead = ({ product }: { product: IProductCard }) => {
  const price = product.price
  const is_sale = product.is_sale
  const salePrice = product.sale_price

  const { profit, discount } = getPrices({ price: price, sale_price: salePrice })

  const brandName = product.brand?.name
  const logo = product.brand && product.brand.logo
    ? product.brand.logo.formats
      ? product.brand.logo.formats.thumbnail.url
      : product.brand.logo.url
    : null

  return (
    <div className="grid grid-cols-2 h-full pb-2 items-center">
      <div className="relative w-full h-8">
        {logo && (
          <Link className="h-full w-full block" href={`/brands/${product.brand?.slug}`}>
            <Image
              className="object-contain object-left"
              aria-label={`Λογότυπο της εταιρίας ${brandName}`}
              src={getStrapiMedia(logo)!}
              fill
              alt={`Λογότυπο ${product.brand?.name}`}
            />
          </Link>
        )}
      </div>

      {discount && profit && is_sale && (
        <div className="flex justify-end">
          <div className="bg-gradient-to-br from-siteColors-pink to-siteColors-purple text-center text-white text-xs font-bold py-1 px-2 rounded-full shadow-md">
            {profit < 50 ? `${discount.toFixed(0)}%` : `Κέρδος ${profit.toFixed(2)}€`}
          </div>
        </div>
      )}
    </div>
  )
}


export default ProductCardHead