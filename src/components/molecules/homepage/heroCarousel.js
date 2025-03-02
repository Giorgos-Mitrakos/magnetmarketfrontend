'use client'
import { Swiper, SwiperSlide } from 'swiper/react';
import Link from 'next/link';
import { register } from 'swiper/element/bundle';
import Image from 'next/image';
import { getStrapiMedia } from '@/repositories/medias';
import { EffectFade } from 'swiper/modules';

import 'swiper/css';
import 'swiper/css/effect-fade';

const HeroCarousel = ({ carousel }) => {
  // const swiperRef = useRef(null);

  // useEffect(() => {
  //   // Register Swiper web component
  //   register();

  //   // Object with parameters
  //   const params = {
  //     // slidesPerView: 1,
  //     breakpoints: {
  //       0: {
  //         slidesPerView: 1,
  //         spaceBetween: 10
  //       },
  //     },
  //   };

  //   // Assign it to swiper element
  //   Object.assign(swiperRef.current, params);

  //   // initialize swiper
  //   swiperRef.current.initialize();
  // }, []);

  return (
    <Swiper
      init={true}
      className="mySwiper h-full"
      slidesPerView={1}
      // watch-slides-progress="true"
      autoplay
      // autoplay-disable-on-interaction="false"
      modules={[EffectFade]}
      effect="fade"
    >
      {carousel.map((banner, i) =>
        <SwiperSlide key={i} className={`w-full h-full bg-white dark:bg-slate-800`}>{
          <Link href={banner.href} aria-label={banner.link_label} className={`cursor-pointer flex h-full w-full relative`}>
            {/* <NextImage media={banner.image.data.attributes} height={480} width={1280} /> */}
            <Image
              // layout='responsive' 
              className={`object-contain px-1`}
              // width={1980}
              // height={600}
              fill
              priority={i === 0 ? true : false}
              loading={i === 0 ? 'eager' : 'lazy'}
              src={getStrapiMedia(banner.image.data.attributes.url)}
              alt={banner.image.data.attributes.alternativeText || ""}
              quality={75}
              aria-label={banner.image.data.attributes.alternativeText || ""}
              blurDataURL={getStrapiMedia(banner.image.data.attributes.url)}
              placeholder="blur"
            ></Image>
          </Link>}
        </SwiperSlide>
      )}
    </Swiper>
  );

}

export default HeroCarousel