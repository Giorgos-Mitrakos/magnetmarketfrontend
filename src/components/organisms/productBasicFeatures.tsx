import { getStrapiMedia } from "@/repositories/medias"
import Image from "next/image"
import ProductPrice from "../molecules/productPrice"
import ProductAddToCart from "../molecules/productAddToCart"
import Link from "next/link"
import { IProduct } from "@/lib/interfaces/product"


const ProductBasicFeatures = ({ product }: {product:IProduct}) => {
  
  return (
    <div className="flex flex-col p-4">
      <div className="flex h-8 relative">
        {product.attributes.brand.data &&
          <div>
            {
              product.attributes.brand.data.attributes.logo.data !== null ?
                <Link className="h-full w-f" href={`/brands/${product.attributes.brand.data.attributes.slug}`}> <Image className="flex object-contain object-left"
                  aria-label={`Λογότυπο της εταιρίας ${product.attributes.brand.data.attributes.name}`}
                  src={getStrapiMedia(product.attributes.brand.data.attributes.logo.data.attributes.formats?
                    product.attributes.brand.data.attributes.logo.data.attributes.formats.thumbnail.url:
                    product.attributes.brand.data.attributes.logo.data.attributes.url)}
                  fill
                  // width={36}
                  // height={36}
                  alt="Test"
                /></Link> :
                <h2 className="text-xl text-slate-500 dark:text-slate-300 font-bold uppercase"
                  aria-label={`Εταιρία: ${product.attributes.brand.data.attributes.name}`}>{product.attributes.brand.data.attributes.name}</h2>
            }</div>}
      </div>
      <h1 className="text-xl sm:text-2xl text-siteColors-purple dark:text-slate-200 font-semibold"
        aria-label={`Τίτλος: ${product.attributes.name}`}>{product.attributes.name}</h1>
      <h5 className="text-sm text-slate-500 dark:text-slate-300"
        aria-label={`Κωδικός Προϊόντος ${product.id}`}>Κωδικός: {product.id}</h5>
      <h5 className="text-sm text-slate-500 dark:text-slate-300"
        aria-label={`Part Number: ${product.attributes.mpn}`}>MPN: {product.attributes.mpn}</h5>
      <h5 className="text-sm text-slate-500 dark:text-slate-300"
        aria-label={`Barcode: ${product.attributes.barcode}`}>EAN: {product.attributes.barcode}</h5>
      <h2 aria-label="Περιγραφή">{product.attributes.short_description}</h2>
      <ProductPrice id={product.id} />
      <ProductAddToCart product={product} />
    </div>
  )

}

export default ProductBasicFeatures;