'use client'
// Import Swiper React components
import { useRef, useEffect, useState } from 'react';
import NextImage from '../atoms/nextImage';
import { register } from 'swiper/element/bundle';

register();


// import Badge from '../shared/badge';

// interface ProductImageProps {
//     images: {
//         attributes: {
//             name: string
//             url: string
//             previewUrl: string
//             alternativeText: string
//             caption: string
//             formats: any
//             width: number
//             height: number
//             hash: string
//             ext: string
//             mime: string
//             size: string
//         }
//     }[],
// }

const ProductImageWidget = ({ images }) => {

    const [thumbsSwiper, setThumbsSwiper] = useState(null);
    const [indexThumb, setIndexThumb] = useState(0);

    const mediaNotFound = {
        url: `${process.env.NEXTAUTH_URL || "http://localhost:3000"}/not-found.jpg`,
        alternativeText: "image not found"
    }

    return (
        <div className='max-w-full md:pr-8 mx-4'>
            <div className=' mb-4'>
                <swiper-container
                    spaceBetween={0}
                    slides-per-view="3"
                    zoom="true"
                    thumbs-swiper=".mySwiper2"
                    effect="fade"
                >
                    {images.length > 0 ?
                        images.map((item, i) => (
                            <swiper-slide key={i} className='w-full overflow-hidden'>
                                <div className="swiper-zoom-container">
                                    <NextImage media={item.attributes} height={320} width={320} />
                                </div>
                            </swiper-slide>
                        )) :
                        <NextImage media={mediaNotFound} height={320} width={320} />}
                </swiper-container>
            </div>
            <div>
                <swiper-container
                    class="mySwiper2"
                    space-between="2"
                    slides-per-view="4"
                    free-mode="true"
                    watch-slides-progress="true"
                    autoplay-delay="2500"
                    autoplay-disable-on-interaction="false"
                // breakpoints={
                //     {
                //     "0": {
                //         "slidesPerView": 1,
                //         "spaceBetween": 2
                //     },
                //     "360": {
                //         "slidesPerView": 1,
                //         "spaceBetween": 2
                //     },
                //     "480": {
                //         "slidesPerView": 2,
                //         "spaceBetween": 2
                //     },
                //     "640": {
                //         "slidesPerView": 3,
                //         "spaceBetween": 2
                //     },
                //     "768": {
                //         "slidesPerView": 4,
                //         "spaceBetween": 2
                //     },
                //     "1024": {
                //         "slidesPerView": 4,
                //         "spaceBetween": 2
                //     },
                //     "1536": {
                //         "slidesPerView": 5,
                //         "spaceBetween": 2
                //     }
                // }}
                >
                    {images.map((item, i) => (
                        <swiper-slide key={i} >
                            {<div className={`${indexThumb === 0} ? 'border-siteColors-blue' : ''} cursor-pointer hover:border-siteColors-blue border-2 w-20 h-20 flex items-center`}>
                                <NextImage media={item?.attributes} height={80} width={80} />
                            </div>}
                        </swiper-slide>
                    ))}
                </swiper-container>
            </div>
        </div>
    )
}

export default ProductImageWidget