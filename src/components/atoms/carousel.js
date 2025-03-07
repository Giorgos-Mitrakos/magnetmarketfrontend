'use client'
import { Swiper, SwiperSlide } from 'swiper/react';
import ProductCard from '../organisms/productCard';
import { Autoplay } from 'swiper/modules';

// Import Swiper styles
import 'swiper/css';

const Carousel = ({ products }) => {

    return (
        <div>
            <Swiper init={true}
                className="mySwiper"
                spaceBetween={4}
                breakpoints={{
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
                }}
                autoplay={{
                    delay: 3500,
                    disableOnInteraction: false,
                }}
                modules={[Autoplay]}
            >
                {products.data.map((product, i) =>
                    <SwiperSlide key={i}>
                        <ProductCard product={product} />
                    </SwiperSlide>)
                }
            </Swiper>
        </div >
    );

}

export default Carousel