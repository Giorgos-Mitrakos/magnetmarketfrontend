'use client'
import { Swiper, SwiperSlide } from 'swiper/react';
import { IimageProps } from "@/lib/queries/categoryQuery";
import { getStrapiMedia } from "@/repositories/medias";
import Image from "next/image";
import Link from "next/link";
import { FaRegImage } from "react-icons/fa";
import { Autoplay, Pagination } from 'swiper/modules';


// Import Swiper styles
import 'swiper/css';
import 'swiper/css/pagination';

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

    categories.data.map(cat => {
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
        <section key={id} className="w-full pt-8 bg-gradient-to-b from-siteColors-lightblue from-20% via-siteColors-blue via-50% to-siteColors-lightblue to-80% dark:from-siteColors-purple dark:from-10% dark:via-siteColors-pink dark:via-50% dark:to-siteColors-purple dark:to-90% rounded-md" >
            <h2 className="text-center mb-8 text-white dark:text-slate-200 xs:text-2xl md:text-3xl font-bold"
                aria-label="Κατηγορίες">Κατηγορίες</h2>
            <Swiper
                init={false}
                className="mySwiper h-64 p-8 rounded-md"
                breakpoints={{
                    0: {
                        slidesPerView: 1,
                    },
                    360: {
                        slidesPerView: 2,
                    },
                    480: {
                        slidesPerView: 3,
                    },
                    700: {
                        slidesPerView: 4,
                    },
                    900: {
                        slidesPerView: 5,
                    },
                    1080: {
                        slidesPerView: 6,
                    },
                    1260: {
                        slidesPerView: 7,
                    },
                    1460: {
                        slidesPerView: 8,
                    },
                    1680: {
                        slidesPerView: 9,
                    },
                    1900: {
                        slidesPerView: 10,
                    },
                }}
                pagination={{
                    clickable: true,
                }}
                autoplay={{
                    delay: 3000,
                    disableOnInteraction: false,
                }}
                modules={[Autoplay, Pagination]}
            >
                {categories.data && categories.data.length > 0 &&
                    categories.data.map(cat => (
                        <SwiperSlide key={cat.id} className=' place-content-center'>
                            <Link href={cat.attributes.link} className="w-40 h-full grid grid-rows-6">
                                <div className="flex flex-col row-span-4 justify-end items-center">
                                    <p className="flex rounded-full p-8 w-36 h-36 bg-white ">
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
                                <h2 className="break-words mt-4 text-wrap text-center  text-sm text-white dark:text-slate-200 ">{cat.attributes.name}</h2>
                            </Link>
                        </SwiperSlide>))}
            </Swiper>
        </section>
    )
}

export default CategoriesBanner;