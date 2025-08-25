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
                className="mySwiper"
                spaceBetween={20}
                breakpoints={{
                    0: {
                        slidesPerView: 1,
                        spaceBetween: 15
                    },
                    540: {
                        slidesPerView: 2,
                        spaceBetween: 15
                    },
                    768: {
                        slidesPerView: 3,
                        spaceBetween: 20
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
                    el: '.swiper-pagination',
                }}
                modules={[Autoplay, Navigation, Pagination]}
                loop={products.data.length > 4}
            >
                {products.data.map((product) => (
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
                <div className="swiper-pagination absolute bottom-0 left-0 right-0 flex justify-center gap-2"></div>
            </Swiper>
        </div>
    );
};

export default Carousel;