'use client'
import Link from 'next/link';
import NextImage from '../../atoms/nextImage';
import { register } from 'swiper/element/bundle';

register();

const HeroCarousel = ({ carousel }) => {
  return (
    <div>
      <swiper-container
        class="mySwiper"
        // ref={swiperElRef}
        // class="flex w-full h-full"
        space-between="4"
        slides-per-view="1"
        watch-slides-progress="true"
        autoplay-delay="3500"
        autoplay-disable-on-interaction="false"
        effect="fade"
      >
        {carousel.map((banner, i) =>
          <swiper-slide key={i} lazy="true">{
            <Link href={banner.href} className={`cursor-pointer flex items-stretch w-full relative`}>
              <NextImage media={banner.image.data.attributes} height={520} width={976} />
            </Link>}
          </swiper-slide>
        )}
      </swiper-container>
    </div>
  );

}

export default HeroCarousel