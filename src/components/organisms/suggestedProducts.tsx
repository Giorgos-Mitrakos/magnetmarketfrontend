import { requestSSR } from "@/repositories/repository";
import ProductCardHead from "../molecules/productCardHead";
import Image from "next/image";
import Link from "next/link";
import { getStrapiMedia } from "@/repositories/medias";
import ProductCardPrice from "../atoms/productCardPrice";
import { GET_SUGGESTED_PRODUCTS } from "@/lib/queries/productQuery";
import { FaRegImage } from "react-icons/fa6";
import { IProduct, IProducts } from "@/lib/interfaces/product";


const SuggestedProducts = async ({ product }: { product: IProduct }) => {

    const categoryFilters = product.attributes.category.data.attributes.filters.map(x => x.name)
    const attributesFilter = product.attributes.prod_chars.filter(x => categoryFilters.includes(x.name))
    let minSupplierPrice = product.attributes.supplierInfo?.reduce((prev, current) => {
        return (prev.wholesale < current.wholesale || !current.in_stock) ? prev : current
    })

    const productFilters = {
        attributes: attributesFilter,
        category: product.attributes.category.data.attributes.slug,
        price: product.attributes.price,
        salePrice: product.attributes.sale_price,
        wholesale: minSupplierPrice.wholesale,
        brand: product.attributes.brand.data?.attributes.name
    }

    const productChars = productFilters.attributes.map(att => {
        return { and: [{ name: { eq: att.name } }, { value: { eq: att.value } }] }
    })

    const createPriceFilter = () => {
        if (product.attributes.sale_price > 0 && product.attributes.is_sale) {
            return [
                { price: { between: [product.attributes.sale_price * 0.8, product.attributes.sale_price * 1.2] } },
                {
                    and: [
                        { is_sale: { eq: true } },
                        { sale_price: { between: [product.attributes.sale_price * 0.8, product.attributes.sale_price * 1.2] } },
                    ]
                }
            ]
        }
        else {
            return [
                { price: { between: [product.attributes.price * 0.8, product.attributes.price * 1.2] } },
                {
                    and: [
                        { is_sale: { eq: true } },
                        { sale_price: { between: [product.attributes.price * 0.8, product.attributes.price * 1.2] } },
                    ]
                }
            ]
        }
    }

    const priceFilter = createPriceFilter()

    let filters: ({ [key: string]: object }) = {
        category: { slug: { eq: productFilters.category } },
        or: priceFilter,
        prod_chars: {
            or: productChars
        }
    }

    const data = await requestSSR({
        query: GET_SUGGESTED_PRODUCTS, variables: { filters: filters }
    });


    const sProducts = data as IProducts
    const suggestedProducts = sProducts.products.data.filter(x => x.id !== product.id).sort((a, b) => {
        return (b.attributes.price / 1.24 - b.attributes.supplierInfo.reduce((prev, current) => {
            return (prev.wholesale < current.wholesale) ? prev : current
        }).wholesale) - (a.attributes.price / 1.24 - a.attributes.supplierInfo.reduce((prev, current) => {
            return (prev.wholesale < current.wholesale) ? prev : current
        }).wholesale)
    }).slice(0, 3)

    return (
        <>
            {suggestedProducts.length > 0 && <section className="flex flex-col border  dark:border-slate-600">
                <h2 className="bg-siteColors-lightblue py-3 text-center text-white text-lg md:text-xl font-semibold">Παρόμοια Προϊόντα</h2>
                <ul className="grid grid-cols-1 sm:grid-cols-3 lg:flex lg:flex-col">
                    {suggestedProducts.map((prod, i) => (
                        <div key={i} className="overflow-hidden ">
                            <div className="flex flex-col relative shadow-md hover:shadow-lg dark:shadow-slate-500 dark:hover:shadow-slate-600 bg-white dark:bg-slate-700 rounded-lg m-1 p-4">
                                <ProductCardHead brand={prod.attributes.brand} product={prod} />
                                <Link className="grid h-48 w-full place-content-center bg-white relative" href={`/product/${prod.attributes.slug}`}
                                    aria-label={`Σύνδεσμος για την αναλυτική σελίδα του προϊόντος ${prod.attributes.name}`}>
                                    {prod.attributes.image.data ?
                                        prod.attributes.image.data.attributes.formats ?
                                            <Image className="object-contain p-2"
                                                aria-label={`Φωτογραφία προϊόντος${prod.attributes.name}`}
                                                // layout='responsive'
                                                // width={200}
                                                // height={200}
                                                fill
                                                src={getStrapiMedia(prod.attributes.image.data.attributes.formats.small.url)}
                                                blurDataURL={getStrapiMedia(prod.attributes.image.data.attributes.formats.small.url)}
                                                // src={`${process.env.NEXT_PUBLIC_API_URL}${props.prod.attributes.image.data.attributes.url}`}
                                                alt={prod.attributes.image.data.attributes.alternativeText || ""}
                                                quality={75}
                                                sizes="(max-width: 640px) 33vw, (max-width: 1024px) 17vw"
                                            /> :
                                            <Image className="object-contain p-2"
                                                // aria-label={`Φωτογραφία προϊόντος${prod.attributes.name}`}
                                                // // layout='responsive'
                                                // width={200}
                                                // height={200}
                                                fill
                                                src={getStrapiMedia(prod.attributes.image.data.attributes.url)}
                                                blurDataURL={getStrapiMedia(prod.attributes.image.data.attributes.url)}
                                                // src={`${process.env.NEXT_PUBLIC_API_URL}${props.prod.attributes.image.data.attributes.url}`}
                                                alt={prod.attributes.image.data.attributes.alternativeText || ""}
                                                quality={75}
                                                sizes="(max-width: 640px) 33vw, (max-width: 1024px) 17vw"
                                            />
                                        :
                                        <FaRegImage className='h-40 w-40 text-siteColors-purple dark:text-slate-200' />}
                                </Link>
                                <div className='mt-1 h-28 flex flex-col justify-between border-b pb-2 dark:bg-slate-700'>
                                    <Link href={`/product/${prod.attributes.slug}`}
                                        aria-label={`Σύνδεσμος για την αναλυτική σελίδα του προϊόντος ${prod.attributes.name}`}>
                                        <h2 className='w-full text-siteColors-purple dark:text-slate-200 font-semibold xs:text-lg text-left line-clamp-3'
                                            aria-label="Τίτλος προϊόντος">{prod.attributes.name}</h2>
                                    </Link>
                                    <p className="text-xs text-slate-500 dark:text-slate-300">Κωδ:{prod.id}</p>
                                </div>
                                <div className="flex items-center justify-center">
                                    <p className="text-green-700 dark:text-green-400 text-sm font-semibold"
                                        aria-label="Διαθεσιμότητα">Διαθέσιμο</p>
                                </div>
                                <ProductCardPrice product={prod} />
                            </div>
                        </div>)
                    )}
                </ul>
            </section>}
        </>
    )
}

export default SuggestedProducts;