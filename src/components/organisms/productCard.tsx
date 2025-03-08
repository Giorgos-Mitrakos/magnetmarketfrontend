import Link from "next/link"
import Image from 'next/image'
import { getStrapiMedia } from "@/repositories/medias"
import ProductCardPrice from "../atoms/productCardPrice"
import ProductCardHead from "../molecules/productCardHead"
import ProductCardFoot from "../molecules/productCardFoot"
import { FaRegImage } from "react-icons/fa6"
import { IcategoryProductsProps } from "@/lib/interfaces/category"


export type ProductCardProps = {
    product: IcategoryProductsProps
}

const ProductCard = (props: ProductCardProps) => {

    const product = props.product.attributes
    const brand = product.brand
    
    return (
        <div className="relative py-2 px-1 max-w-96 overflow-hidden">
            <div className="grid h-full grid-rows-cardLayout shadow-md hover:shadow-lg dark:shadow-slate-500 dark:hover:shadow-slate-600 bg-white dark:bg-slate-700 rounded-lg m-1 p-4">
                <ProductCardHead brand={brand} id={props.product.id} />
                <Link className="grid w-full place-content-center bg-white relative" href={`/product/${product.slug}`}
                    aria-label={`Σύνδεσμος για την αναλυτική σελίδα του προϊόντος ${product.name}`}>
                    {product.image.data ?
                        product.image.data.attributes.formats.small ?
                            <Image className="object-contain p-2"
                                aria-label={`Φωτογραφία προϊόντος${product.name}`}
                                loading="lazy"
                                // layout='responsive'
                                // width={product.image.data.attributes.width / 4}
                                // height={product.image.data.attributes.height / 4}
                                // fill
                                src={getStrapiMedia(product.image.data.attributes.formats.small.url)}
                                blurDataURL={getStrapiMedia(product.image.data.attributes.formats.small.url)}
                                // src={`${process.env.NEXT_PUBLIC_API_URL}${props.prod.attributes.image.data.attributes.url}`}
                                alt={product.image.data.attributes.alternativeText || ""}
                                quality={75}
                                sizes="300px"
                                width={300}
                                height={216}
                                style={{
                                    width: 'auto',
                                    height: '216px',
                                }}
                            />
                            :
                            <Image className="object-contain p-2"
                                aria-label={`Φωτογραφία προϊόντος${product.name}`}
                                loading="lazy"
                                // layout='responsive'
                                // width={product.image.data.attributes.width / 4}
                                // height={product.image.data.attributes.height / 4}
                                // fill
                                src={getStrapiMedia(product.image.data.attributes.url)}
                                blurDataURL={getStrapiMedia(product.image.data.attributes.url)}
                                // src={`${process.env.NEXT_PUBLIC_API_URL}${props.prod.attributes.image.data.attributes.url}`}
                                alt={product.image.data.attributes.alternativeText || ""}
                                quality={75}
                                sizes="300px"
                                width={300}
                                height={216}
                                style={{
                                    width: 'auto',
                                    height: '216px',
                                }}
                            />
                        :
                        <FaRegImage className='h-40 w-40 text-siteColors-purple dark:text-slate-200' />}

                </Link>
                {/* {props.prod.attributes.sale_price && <Badge product={product} />} */}
                <div className='mt-4 grid grid-rows-5 justify-between border-b pb-2'>
                    <Link href={`/product/${product.slug}`}
                        className="row-span-4"
                        aria-label={`Σύνδεσμος για την αναλυτική σελίδα του προϊόντος ${product.name}`}>
                        <h2 className='w-full font-semibold xs:text-lg text-left break-all line-clamp-3 text-siteColors-purple dark:text-slate-200 dark:hover:text-slate-100 hover:text-siteColors-pink'
                            aria-label="Τίτλος προϊόντος">{product.name}</h2>
                    </Link>
                    <p className="text-xs text-gray-500 dark:text-slate-300">Κωδ:{props.product.id}</p>
                </div>
                <div className="flex items-center justify-center">
                    <p className="text-green-800 dark:text-green-400 text-sm font-semibold"
                        aria-label="Διαθεσιμότητα">Παράδοση σε 1 – 3 ημέρες</p>
                </div>
                <ProductCardPrice id={props.product.id} />
                <ProductCardFoot product={props.product} />
            </div>

        </div>
    )
}

export default ProductCard