import Link from "next/link"
import Image from 'next/image'
import { getStrapiMedia } from "@/repositories/medias"
import ProductCardPrice from "../atoms/productCardPrice"
import ProductCardHead from "../molecules/productCardHead"
import { IimageProps } from "@/lib/queries/categoryQuery"
import ProductCardFoot from "../molecules/productCardFoot"


export interface ProductCardProps {
    prod: {
        id: number
        attributes: {
            name: string
            slug: string
            brand: {
                data: {
                    attributes: {
                        name: string
                        logo: {
                            data: {
                                attributes: {
                                    name: string
                                    url: string
                                    formats: {
                                        thumbnail: IimageProps,
                                        small: IimageProps
                                    }
                                }
                            }
                        }
                    }
                }
            }
            image: {
                data: {
                    attributes: {
                        url: string
                        alternativeText: string
                    }
                }
            }
        }
    }
}

const ProductCard = (props: ProductCardProps) => {

    const product = props.prod.attributes
    const brand = product.brand

    return (
        <div className="relative py-2 px-1 overflow-hidden">
            <div className="grid h-full grid-rows-cardLayout shadow-md hover:shadow-lg bg-white rounded-lg m-1 p-4">
                <ProductCardHead brand={brand} id={props.prod.id} />
                <Link className="grid w-full place-content-center relative" href={`/product/${product.slug}`}
                    aria-label={`Σύνδεσμος για την αναλυτική σελίδα του προϊόντος ${product.name}`}>
                    {product.image.data &&
                        <Image className="object-contain p-2"
                            aria-label={`Φωτογραφία προϊόντος${product.name}`}
                            // layout='responsive'
                            // width={product.image.data.attributes.width / 4}
                            // height={product.image.data.attributes.height / 4}
                            fill
                            src={getStrapiMedia(product.image.data.attributes.url)}
                            // src={`${process.env.NEXT_PUBLIC_API_URL}${props.prod.attributes.image.data.attributes.url}`}
                            alt={product.image.data.attributes.alternativeText || ""}
                            quality={75}
                            sizes="(max-width: 640px) 33vw, (max-width: 1024px) 17vw"
                        />}
                    {/* :
                            <Image media={mediaNotFound} height={160} width={160} />} */}

                </Link>
                {/* {props.prod.attributes.sale_price && <Badge product={product} />} */}
                <div className='mt-4 grid grid-rows-5 justify-between border-b pb-2'>
                    <Link href={`/product/${product.slug}`}
                        className="row-span-4"
                        aria-label={`Σύνδεσμος για την αναλυτική σελίδα του προϊόντος ${product.name}`}>
                        <h2 className='w-full font-semibold xs:text-lg text-left line-clamp-3 text-siteColors-purple hover:text-siteColors-pink'
                            aria-label="Τίτλος προϊόντος">{product.name}</h2>
                    </Link>
                    <p className="text-xs text-gray-500">Κωδ:{props.prod.id}</p>
                </div>
                <div className="flex items-center justify-center">
                    <p className="text-green-700 text-sm font-semibold"
                        aria-label="Διαθεσιμότητα">Διαθέσιμο</p>
                </div>
                <ProductCardPrice id={props.prod.id} />
                <ProductCardFoot product={props.prod} />

            </div>

        </div>
    )
}

export default ProductCard