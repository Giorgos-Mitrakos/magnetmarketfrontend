import { getStrapiMedia } from "@/repositories/medias"
import Image from "next/image"
import ProductPrice from "../molecules/productPrice"
import ProductAddToCart from "../molecules/productAddToCart"
import Link from "next/link"
import { IProductPage } from "@/lib/interfaces/product"
import BestPriceProductBadge from "../atoms/bestPriceProductBadge"

const ProductBasicFeatures = ({ product }: { product: IProductPage }) => {
  return (
    <div className="flex flex-col p-4 space-y-4">
      {/* Brand Section */}
      {product.brand && (
        <div className="flex h-10 items-center">
          {product.brand.logo ? (
            <Link
              href={`/brands/${product.brand.slug}`}
              className="relative h-full w-32"
              aria-label={`Μετάβαση στη σελίδα της εταιρίας ${product.brand.name}`}
            >
              <Image
                className="object-contain object-left"
                src={getStrapiMedia(
                  product.brand.logo.formats?.thumbnail?.url ||
                  product.brand.logo.url
                )!}
                alt={`Λογότυπο ${product.brand.name}`}
                fill
                sizes="128px"
              />
            </Link>
          ) : (
            <h2 className="text-xl text-slate-500 dark:text-slate-300 font-bold uppercase">
              {product.brand.name}
            </h2>
          )}
        </div>
      )}

      {/* Product Title */}
      <h1 className="text-2xl md:text-3xl text-siteColors-purple dark:text-slate-200 font-bold leading-tight">
        {product.name}
      </h1>

      {/* Product Codes */}
      <div className="flex flex-col text-sm text-slate-500 dark:text-slate-300">
        <div>
          <span className="font-medium">Κωδικός: </span>
          {product.id}
        </div>
        {product.mpn && (
          <div>
            <span className="font-medium">MPN: </span>
            {product.mpn}
          </div>
        )}
        {product.barcode && (
          <div>
            <span className="font-medium">EAN: </span>
            {product.barcode}
          </div>
        )}
      </div>

      {/* Short Description */}
      {product.short_description && (
        <div
          className="text-slate-700 dark:text-slate-300 leading-relaxed"
          dangerouslySetInnerHTML={{ __html: product.short_description }}
        />
      )}

      {/* Best Price Badge */}
      <BestPriceProductBadge productId={product.id} />

      {/* Price Component */}
      <ProductPrice product={product} />

      {/* Add to Cart Component */}
      <ProductAddToCart product={product} />
    </div>
  )
}

export default ProductBasicFeatures