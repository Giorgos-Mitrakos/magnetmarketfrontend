// Carousel Component (βελτιωμένο)
'use client'

import { Swiper, SwiperSlide } from 'swiper/react';
import ProductCard from '../organisms/productCard';
import { Autoplay, Navigation, Pagination } from 'swiper/modules';
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa6';

// Import Swiper styles
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

const Carousel = ({ products }) => {
    return (
        <div className="relative pb-10">
            <Swiper
                className="mySwiper h-[630px]"
                spaceBetween={20}
                breakpoints={{
                    0: {
                        slidesPerView: 1,
                        spaceBetween: 15
                    },
                    620: {
                        slidesPerView: 2,
                        spaceBetween: 15
                    },
                    968: {
                        slidesPerView: 3,
                        spaceBetween: 10
                    },
                    1280: {
                        slidesPerView: 4,
                        spaceBetween: 20
                    },
                }}
                autoplay={{
                    delay: 4000,
                    disableOnInteraction: false,
                    pauseOnMouseEnter: true,
                }}
                navigation={{
                    nextEl: '.swiper-button-next',
                    prevEl: '.swiper-button-prev',
                }}
                pagination={{
                    clickable: true,
                    dynamicBullets: true,
                    renderBullet: function (index, className) {
                        return `<span class="${className} bg-white opacity-70 w-2.5 h-2.5 mx-1 inline-block rounded-full transition-all duration-300"></span>`;
                    },
                }}
                modules={[Autoplay, Navigation, Pagination]}
                loop={products.length > 4}
            >
                {products.map((product) => (
                    <SwiperSlide key={product.id}>
                        <ProductCard product={product} />
                    </SwiperSlide>
                ))}

                {/* Custom Navigation */}
                <div className="swiper-button-prev hidden md:flex">
                    <FaChevronLeft className="h-6 w-6 text-white" />
                </div>
                <div className="swiper-button-next hidden md:flex">
                    <FaChevronRight className="h-6 w-6 text-white" />
                </div>

                {/* Custom Pagination */}
                {/* <div className="swiper-pagination absolute bottom-[-30px] left-0 right-0 flex justify-center gap-1"></div> */}
            </Swiper>
        </div>
    );
};

export default Carousel;