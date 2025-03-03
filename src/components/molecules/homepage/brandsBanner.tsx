'use client'
import { Swiper, SwiperSlide } from 'swiper/react';
import { IimageProps } from '@/lib/queries/categoryQuery';
import { getStrapiMedia } from '@/repositories/medias';
import Image from 'next/image';
import Link from 'next/link';
import { Autoplay, Pagination } from 'swiper/modules';

// Import Swiper styles
import 'swiper/css';
import 'swiper/css/pagination';

const BrandsBanner = ({ id, brands }: {
    id: string,
    brands: {
        data: {
            id: string
            attributes: {
                name: string
                slug: string
                logo: {
                    data: {
                        attributes: {
                            url: string
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
    },
}) => {

    return (
        <section key={id} className='w-full '>
            <h2 className="text-center text-siteColors-purple mb-4 dark:text-slate-200 xs:text-2xl md:text-3xl font-bold">Brands</h2>
            <Swiper
                className="mySwiper h-36 p-8 rounded-md bg-slate-100"
                breakpoints={{
                    0: {
                        slidesPerView: 1,
                    },
                    360: {
                        slidesPerView: 2,
                    },
                    540: {
                        slidesPerView: 3,
                    },
                    720: {
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
                    1440: {
                        slidesPerView: 8,
                    },
                    1620: {
                        slidesPerView: 9,
                    },
                    1800: {
                        slidesPerView: 10,
                    },
                }}
                pagination={{
                    clickable: true,
                }}
                autoplay={{
                    delay: 3500,
                    disableOnInteraction: false,
                }}
                modules={[Autoplay, Pagination]}
            >
                {brands.data && brands.data.length > 0 &&
                    brands.data.map(brand => (brand.attributes.logo.data &&
                        <SwiperSlide key={brand.id} className='px-8 place-content-center'>
                            <Link href={`/brands/${brand.attributes.slug}`}
                                aria-label={`Link σε προϊόντα του κατασκευάστή ${brand.attributes.name}`}
                                className='relative h-28 w-28 flex items-center'>
                                {brand.attributes.logo.data.attributes.formats ?
                                    <Image
                                        className='object-contain'
                                        // fill
                                        height={96}
                                        width={112}
                                        src={getStrapiMedia(brand.attributes.logo.data.attributes.formats.thumbnail.url)}
                                        alt={brand.attributes.logo.data.attributes.alternativeText}
                                        quality={75}
                                        aria-label={brand.attributes.logo.data.attributes.alternativeText || ""}
                                        blurDataURL={getStrapiMedia(brand.attributes.logo.data.attributes.formats.thumbnail.url)}
                                        placeholder="blur"
                                    />
                                    :
                                    <Image
                                        className='object-contain'
                                        // fill
                                        height={96}
                                        width={96}
                                        src={getStrapiMedia(brand.attributes.logo.data.attributes.url)}
                                        alt={brand.attributes.logo.data.attributes.alternativeText}
                                        quality={75}
                                        aria-label={brand.attributes.logo.data.attributes.alternativeText || ""}
                                        blurDataURL={getStrapiMedia(brand.attributes.logo.data.attributes.url)}
                                        placeholder="blur"
                                    />
                                    // <NextImage media={brand.attributes.logo.data.attributes} width={240} height={240} />
                                }
                            </Link>
                        </SwiperSlide>
                    ))}

            </Swiper>
        </section >
    )
}

export default BrandsBanner;