'use client'
import Link from 'next/link';
import NextImage from './nextImage';
import { register } from 'swiper/element/bundle';
import ProductCard from '../organisms/productCard';
import { useEffect, useRef } from 'react';

register();

const Carousel = ({ products }) => {

    const swiperRef = useRef(null);

    useEffect(() => {
        // Register Swiper web component
        register();

        // Object with parameters
        const params = {
            // slidesPerView: 1,
            breakpoints: {
                0: {
                    slidesPerView: 1,
                    spaceBetween: 10
                },
                640: {
                    slidesPerView: 2,
                    spaceBetween: 5
                },
                768: {
                    slidesPerView: 3,
                    spaceBetween: 10
                },
                1024: {
                    slidesPerView: 4,
                    spaceBetween: 10
                },
            },
        };

        // Assign it to swiper element
        Object.assign(swiperRef.current, params);

        // initialize swiper
        swiperRef.current.initialize();
    }, []);

    return (
        <div>
            <swiper-container init="false"
                class="grid w-full"
                ref={swiperRef}
                // class="flex w-full h-full"
                space-between="4"
                // slides-per-view="4"
                watch-slides-progress="true"
                autoplay-delay="3500"
            // autoplay-disable-on-interaction="false"
            // navigation
            >
                {products.data.map((product, i) =>
                    <swiper-slide key={i}>
                        <ProductCard prod={product} />
                    </swiper-slide>)
                }
            </swiper-container>
        </div>
    );

}

export default Carousel