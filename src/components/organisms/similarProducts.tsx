import Image from "next/image";
import Link from "next/link";
import { getStrapiMedia } from "@/repositories/medias";
import ProductCardPrice from "../atoms/productCardPrice";
import { FaRegImage } from "react-icons/fa6";
import { ISimilarProductPage } from "@/lib/interfaces/product";
import { IImageFormats } from "@/lib/interfaces/image";

// Server-side data processing
function processCategories(categories: {
    id: number
    name: string
    slug: string
    image: {
        name: string
        alternativeText: string
        caption: string
        width: string
        height: string
        hash: string
        ext: string
        mime: string
        size: string
        url: string
        formats: IImageFormats
    }
    parents: {
        id: number
        name: string
        slug: string
        parents: {
            id: number
            name: string
            slug: string
        }[]
    }[]
}[]) {

    if (!categories) return []

    return categories.map(cat => {
        let link = ""

        if (cat.parents.length > 0) {
            if (cat.parents[0].parents.length > 0) {
                link = `/category/${cat.parents[0].parents[0].slug}/${cat.parents[0].slug}/${cat.slug}`
            } else {
                link = `/category/${cat.parents[0].slug}/${cat.slug}`
            }
        } else {
            link = `/category/${cat.slug}`
        }

        // Process image URLs server-side για καλύτερη performance
        const imageUrl = cat.image
            ? getStrapiMedia(cat.image.formats?.thumbnail?.url || cat.image.url)
            : null

        return {
            id: cat.id,
            name: cat.name,
            link,
            imageUrl,
            imageAlt: cat.image?.alternativeText || cat.name
        }
    })
}

const SimilarProducts = async ({ similarProducts, crossCategories }: {
    similarProducts: ISimilarProductPage[],
    crossCategories: {
        id: number
        name: string
        slug: string
        image: {
            name: string
            alternativeText: string
            caption: string
            width: string
            height: string
            hash: string
            ext: string
            mime: string
            size: string
            url: string
            formats: IImageFormats
        }
        parents: {
            id: number
            name: string
            slug: string
            parents: {
                id: number
                name: string
                slug: string
            }[]
        }[]
    }[]
}) => {

    const processedCategories = processCategories(crossCategories)

    return (
        <div className="lg:sticky lg:top-24">
            <h2 className="bg-gradient-to-r from-siteColors-lightblue to-siteColors-blue py-3 text-center text-white text-lg font-bold rounded-t-lg mb-4">
                Παρόμοια Προϊόντα
            </h2>

            <div className="space-y-4">
                {similarProducts.map((prod) => (
                    <div key={prod.id} className="bg-white dark:bg-slate-700 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 border border-gray-200 dark:border-slate-600">
                        {/* Product Image and Basic Info */}
                        <Link
                            href={`/product/${prod.slug}`}
                            className="flex p-3 group"
                        >
                            {/* Image */}
                            <div className="relative w-20 h-20 flex-shrink-0 bg-white dark:bg-slate-600 rounded border border-gray-200 dark:border-slate-500">
                                {prod.image ? (
                                    <Image
                                        src={getStrapiMedia(
                                            prod.image.formats?.thumbnail?.url ||
                                            prod.image.formats?.small?.url ||
                                            prod.image.url
                                        )!}
                                        alt={prod.image.alternativeText || prod.name}
                                        fill
                                        className="object-contain p-1"
                                        sizes="80px"
                                        quality={75}
                                    />
                                ) : (
                                    <div className="flex items-center justify-center h-full">
                                        <FaRegImage className="h-8 w-8 text-gray-300 dark:text-slate-400" />
                                    </div>
                                )}
                            </div>

                            {/* Product Info */}
                            <div className="ml-3 flex-1 min-w-0">
                                <h3 className="font-semibold text-sm text-gray-800 dark:text-slate-200 line-clamp-2 group-hover:text-siteColors-purple dark:group-hover:text-siteColors-lightblue transition-colors">
                                    {prod.name}
                                </h3>

                                <div className="mt-1">
                                    <ProductCardPrice product={prod} />
                                </div>

                                <div className="flex items-center mt-1">
                                    <div className={`w-2 h-2 rounded-full mr-2 ${prod.inventory > 0 && prod.is_in_house
                                        ? 'bg-green-600 dark:bg-green-400'
                                        : 'bg-blue-600 dark:bg-blue-400'
                                        }`}></div>
                                    <span className={`text-sm mt-1 ${prod.inventory > 0 && prod.is_in_house
                                        ? 'text-green-600 dark:text-green-400'
                                        : 'text-blue-600 dark:text-blue-400'
                                        }`}>
                                        {prod.inventory > 0 && prod.is_in_house
                                            ? 'Άμεσα διαθέσιμο'
                                            : 'Παράδοση σε 1–3 ημέρες'}
                                    </span>
                                </div>
                            </div>
                        </Link>
                    </div>
                ))}
            </div>

            {/* Additional suggested content area */}
            {processedCategories.length > 0 &&
                <div className="mt-6 p-4 bg-white dark:bg-slate-800 rounded-lg">
                    <h3 className="font-semibold text-gray-800 dark:text-slate-200 mb-3">
                        Μπορεί να σας ενδιαφέρει
                    </h3>
                    <div className="space-y-2 text-sm text-gray-600 dark:text-slate-300">
                        {processedCategories.map(cross => (
                            <div key={cross.id} className="flex items-center p-2 hover:bg-slate-50 dark:hover:bg-slate-700 rounded cursor-pointer">
                                {cross.imageUrl ? (
                                    <Image
                                        height={40}
                                        width={40}
                                        src={cross.imageUrl}
                                        alt={cross.imageAlt}
                                        quality={80}
                                        className="transition-transform bg-white duration-300 group-hover:scale-110 object-contain p-1"
                                        placeholder="blur"
                                        blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R7eR5nN0Y3t7OxdWD+H1D/2Q=="
                                        loading="lazy"
                                    />
                                ) : (
                                    <FaRegImage className="w-10 h-10 text-siteColors-blue/70 dark:text-siteColors-purple/70" />
                                )}
                                <Link className="px-4" href={`${process.env.NEXT_URL}/${cross.link}`}>{cross.name}</Link>
                            </div>
                        ))
                        }
                        {/* <div className="flex items-center p-2 hover:bg-white dark:hover:bg-slate-700 rounded cursor-pointer">
                            <span> Σετ συναρμολόγησης</span>
                        </div>
                        <div className="flex items-center p-2 hover:bg-white dark:hover:bg-slate-700 rounded cursor-pointer">
                            <span> Συσκευές ίδιας σειράς</span>
                        </div> */}
                    </div>
                </div>}
        </div>
    );
};

export default SimilarProducts;