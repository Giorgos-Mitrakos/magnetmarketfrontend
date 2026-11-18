import { getStrapiMedia } from "@/repositories/medias"
import Image from "next/image"
import ProductPrice from "../molecules/productPrice"
import ProductAddToCart from "../molecules/productAddToCart"
import SaleCountdown from "../atoms/SaleCountdown"
import Link from "next/link"
import { IProductPage } from "@/lib/interfaces/product"
import BestPriceProductBadge from "../atoms/bestPriceProductBadge"
import { PreorderPassView } from "@/lib/interfaces/preorder"
import type { IDeliveryEstimate } from "@/lib/interfaces/product"
import Stars from "@/components/organisms/reviews/Stars"
import CompareToggle from "@/components/compare/CompareToggle"

/** (2026-10-22) Δόσεις / δωρεάν μεταφορικά για την τιμή του προϊόντος (από τη σελίδα) */
export type ProductPerks = {
  freeInstallments: number
  maxInstallments: number
  freeShipping: { over: number, name: string } | null
}

const ProductBasicFeatures = ({ product, preorder = null, shortDescriptionHtml = '', perks = null, delivery = null, rating = null, compare = false }: {
  product: IProductPage
  /** (2026-10-23) Εκτιμώμενη παράδοση — null όταν είναι απενεργοποιημένη */
  delivery?: IDeliveryEstimate | null
  /** (2026-10-23) Μέση βαθμολογία (μόνο όταν υπάρχουν εγκεκριμένες αξιολογήσεις) */
  rating?: { average: number; count: number } | null
  /** (2026-10-23) Κουμπί «Σύγκριση» (διακόπτης στον Product Manager) */
  compare?: boolean
  preorder?: PreorderPassView | null
  /** Ήδη καθαρισμένο στον server (lib/helpers/sanitizeHtml.ts) */
  shortDescriptionHtml?: string
  perks?: ProductPerks | null
}) => {
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

      {/* (2026-10-23) Βαθμολογία → ενότητα αξιολογήσεων */}
      {rating && rating.count > 0 && (
        <a href="#reviews" className="-mt-2 inline-flex w-fit items-center gap-2 text-sm text-slate-600 hover:underline dark:text-slate-300">
          <Stars value={rating.average} size="sm" />
          <span className="font-semibold">{rating.average.toLocaleString('el-GR', { minimumFractionDigits: 1, maximumFractionDigits: 1 })}</span>
          <span>({rating.count} {rating.count === 1 ? 'αξιολόγηση' : 'αξιολογήσεις'})</span>
        </a>
      )}

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
      {shortDescriptionHtml && (
        <div
          className="text-slate-700 dark:text-slate-300 leading-relaxed"
          dangerouslySetInnerHTML={{ __html: shortDescriptionHtml }}
        />
      )}

      {/* Best Price Badge */}
      <BestPriceProductBadge productId={product.id} />

      {/* Προσφορά με λήξη: αντίστροφη μέτρηση */}
      {product.is_sale && product.sale_ends_at && <SaleCountdown endsAt={product.sale_ends_at} variant="banner" />}

      {/* Price Component */}
      <ProductPrice product={product} preorder={preorder} perks={perks} delivery={delivery} />

      {/* Add to Cart Component */}
      <ProductAddToCart product={product} preorder={preorder?.valid ? preorder : null} />

      {/* (2026-10-23) Σύγκριση προϊόντων */}
      {compare && product.documentId && (
        <CompareToggle
          item={{
            documentId: product.documentId,
            slug: product.slug,
            name: product.name,
            image: product.image?.formats?.thumbnail?.url || product.image?.url || null,
            category: product.category?.name ?? null,
          }}
        />
      )}
    </div>
  )
}

export default ProductBasicFeatures