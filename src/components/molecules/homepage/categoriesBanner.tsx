import { IimageProps } from "@/lib/queries/categoryQuery";
import { getStrapiMedia } from "@/repositories/medias";
import Image from "next/image";
import Link from "next/link";
import { FaRegImage } from "react-icons/fa";

const CategoriesBanner = ({ id,
    categories }: {
        id: string,
        categories: {
            data: {
                id: string
                attributes: {
                    name: string
                    slug: string
                    link: string
                    parents: {
                        data: {
                            attributes: {
                                slug: string
                                parents: {
                                    data: {
                                        attributes: {
                                            slug: string
                                        }
                                    }[]
                                }
                            }
                        }[]
                    }
                    image: {
                        data: {
                            attributes: {
                                url: string,
                                name: string,
                                alternativeText: string
                                formats: {
                                    thumbnail: IimageProps,
                                    small: IimageProps
                                }
                            }
                        }
                    }
                }
            }[]
        }
    }) => {

    const mappedCategories = categories.data.map(cat => {
        let link = ""
        if (cat.attributes.parents.data.length > 0) {
            if (cat.attributes.parents.data[0].attributes.parents.data.length > 0) {
                link = `/category/${cat.attributes.parents.data[0].attributes.parents.data[0].attributes.slug}/${cat.attributes.parents.data[0].attributes.slug}/${cat.attributes.slug}`
            }
            else {
                link = `/category/${cat.attributes.parents.data[0].attributes.slug}/${cat.attributes.slug}`
            }
        }
        else {
            link = `/category/${cat.attributes.slug}`
        }

        cat.attributes.link = link
        return cat
    })

    return (
        <section key={id} className="w-full" >
            <h2 className="text-center mb-8 text-siteColors-purple dark:text-slate-200 xs:text-2xl md:text-3xl font-bold rounded">Κατηγορίες</h2>
            <div className="flex overflow-x-auto scrollbar space-x-4 rounded-md px-4 py-6 dark:bg-siteColors-purple">
                {categories.data && categories.data.length > 0 &&
                    categories.data.map(cat => (
                        <Link key={cat.id} href={cat.attributes.link} className="w-40">
                            <div className="flex flex-col justify-end items-center">
                                <p className="flex rounded-full p-8 w-36 h-36 bg-white border-4 border-siteColors-pink ">
                                    {cat.attributes.image.data ? cat.attributes.image.data.attributes.formats ?
                                        <Image
                                            className='transition delay-75 duration-300 ease-in-out hover:scale-110'
                                            // fill
                                            height={144}
                                            width={144}
                                            src={getStrapiMedia(cat.attributes.image.data.attributes.formats.thumbnail.url)}
                                            alt={cat.attributes.image.data.attributes.alternativeText}
                                            quality={75}
                                            aria-label={cat.attributes.image.data.attributes.alternativeText || ""}
                                            blurDataURL={getStrapiMedia(cat.attributes.image.data.attributes.formats.thumbnail.url)}
                                            placeholder="blur"
                                        /> :
                                        <Image
                                            // className='object-contain'
                                            // fill
                                            height={144}
                                            width={144}
                                            src={getStrapiMedia(cat.attributes.image.data.attributes.url)}
                                            alt={cat.attributes.image.data.attributes.alternativeText}
                                            quality={75}
                                            aria-label={cat.attributes.image.data.attributes.alternativeText || ""}
                                            blurDataURL={getStrapiMedia(cat.attributes.image.data.attributes.url)}
                                            placeholder="blur"
                                        />
                                        // <NextImage media={cat.attributes.image.data.attributes} width={144} height={144} />
                                        : <FaRegImage className="w-16 h-16 self-center" />}
                                </p>
                            </div>
                            <h2 className="break-words mt-4 text-wrap text-center text-sm dark:text-slate-200 ">{cat.attributes.name}</h2>
                        </Link>))}
            </div>
        </section>
    )
}

export default CategoriesBanner;