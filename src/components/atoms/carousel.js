'use client'
import { Swiper, SwiperSlide } from 'swiper/react';
import ProductCard from '../organisms/productCard';

// Import Swiper styles
import 'swiper/css';

const Carousel = ({ products }) => {

    return (
        <div>
            <Swiper init={false}
                className="mySwiper"
                
                // ref={swiperRef}
                // class="flex w-full h-full"
                space-between="4"
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
                // slides-per-view="4"
                watch-slides-progress="true"
                autoplay-delay="3500"
            // autoplay-disable-on-interaction="false"
            // navigation
            >
                {products.data.map((product, i) =>
                    <SwiperSlide key={i}>
                        <ProductCard prod={product} />
                    </SwiperSlide>)
                }
            </Swiper>
        </div >
    );

}

export default Carousel