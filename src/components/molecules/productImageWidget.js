'use client'
// Import Swiper React components
import {  useState } from 'react';
import { register } from 'swiper/element/bundle';
import { FaRegImage } from 'react-icons/fa6';
import { getStrapiMedia } from '@/repositories/medias';
import Image from 'next/image';

register();

const ProductImageWidget = ({ images }) => {

    const [thumbsSwiper, setThumbsSwiper] = useState(null);
    const [indexThumb, setIndexThumb] = useState(0);

    return (
        <div className='max-w-full md:pr-8 mx-4'>
            <div className='w-full max-h-96 mb-4 bg-white'>
                <swiper-container
                    className='max-h-96'
                    spaceBetween={0}
                    slides-per-view="1"
                    zoom="true"
                    thumbs-swiper=".mySwiper2"
                    effect="fade"
                >
                    {images.length > 0 &&
                        images.map((item, i) => (
                            <swiper-slide key={i} className='w-full overflow-hidden' lazy="true">
                                <div className="swiper-zoom-container h-96">
                                    {item.attributes ?
                                        // <NextImage media={item.attributes.formats.small.formats.small} height={360} width={360} />
                                        item.attributes.formats?
                                        <Image
                                            // layout='responsive'
                                            className="object-contain"
                                            //   width={width}
                                            //   height={height}
                                            fill
                                            src={getStrapiMedia(item.attributes.formats.small.url)}
                                            alt={item.attributes.alternativeText || ""}
                                            quality={75}
                                            aria-label={item.attributes.alternativeText || ""}
                                            blurDataURL={getStrapiMedia(item.attributes.formats.small.url)}
                                            placeholder="blur"
                                        />
                                        :
                                        <Image
                                            // layout='responsive'
                                            className="object-contain"
                                            //   width={width}
                                            //   height={height}
                                            fill
                                            src={getStrapiMedia(item.attributes.url)}
                                            alt={item.attributes.alternativeText || ""}
                                            quality={75}
                                            aria-label={item.attributes.alternativeText || ""}
                                            blurDataURL={getStrapiMedia(item.attributes.url)}
                                            placeholder="blur"
                                        />
                                        : <FaRegImage className='h-60 w-60' />}
                                </div>
                            </swiper-slide>
                        ))}
                </swiper-container>
            </div>
            <div className='dark:bg-slate-800'>
                <swiper-container
                    class="mySwiper2 dark:bg-slate-800"
                    space-between="2"
                    slides-per-view="4"
                    free-mode="true"
                    watch-slides-progress="true"
                    autoplay-delay="2500"
                    autoplay-disable-on-interaction="false"
                >
                    {images.map((item, i) => (
                        <swiper-slide key={i} >
                            {<div className={`${indexThumb === 0} ? 'border-siteColors-blue' : ''} cursor-pointer dark:border-black bg-white hover:border-siteColors-blue border-2 w-20 h-20 flex items-center relative`}>
                                {/* <NextImage media={item?.attributes.formats.thumbnail} height={76} width={76} /> */}
                                <Image
                                    // layout='responsive'
                                    className="object-contain"
                                    //   width={width}
                                    //   height={height}
                                    fill
                                    src={getStrapiMedia(item.attributes.url)}
                                    alt={item.attributes.alternativeText || ""}
                                    quality={75}
                                    aria-label={item.attributes.alternativeText || ""}
                                    blurDataURL={getStrapiMedia(item.attributes.url)}
                                    placeholder="blur"
                                />
                            </div>}
                        </swiper-slide>
                    ))}
                </swiper-container>
            </div>
        </div>
    )
}

export default ProductImageWidget