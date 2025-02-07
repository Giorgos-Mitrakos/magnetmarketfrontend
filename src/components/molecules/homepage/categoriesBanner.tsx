import NextImage from "@/components/atoms/nextImage";
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
                                url: string
                                alternativeText: string
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
        <section key={id} className="w-full pb-16" >
            <h2 className="text-center mb-8 text-siteColors-purple xs:text-2xl md:text-3xl font-bold rounded">Κατηγορίες</h2>
            <div className="flex overflow-x-auto scrollbar space-x-4 rounded-md">
                {categories.data && categories.data.length > 0 &&
                    categories.data.map(cat => (
                        <Link key={cat.id} href={cat.attributes.link} className="w-40 pb-8">
                            <div className="flex flex-col justify-end items-center ">
                                <p className="flex rounded-full p-8 w-36 h-36 bg-white border-4 border-siteColors-pink ">
                                    {cat.attributes.image.data ?
                                        <NextImage media={cat.attributes.image.data.attributes} width={144} height={144} />
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