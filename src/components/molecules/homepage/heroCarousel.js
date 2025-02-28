'use client'
import Link from 'next/link';
import NextImage from '../../atoms/nextImage';
import { register } from 'swiper/element/bundle';
import Image from 'next/image';
import { getStrapiMedia } from '@/repositories/medias';
import { useEffect, useRef } from 'react';

// register();

const HeroCarousel = ({ carousel }) => {
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
      },
    };

    // Assign it to swiper element
    Object.assign(swiperRef.current, params);

    // initialize swiper
    swiperRef.current.initialize();
  }, []);

  return (
    <swiper-container
      init="false"
      class="mySwiper flex w-full h-[12rem] sm:h-[18rem] md:h-[25rem] lg:h-[30rem]"
      ref={swiperRef}
      // class="flex w-full h-full"
      // space-between="4"
      slides-per-view="1"
      // watch-slides-progress="true"
      autoplay-delay="3500"
      autoplay-disable-on-interaction="false"
      effect="fade"
    >
      {carousel.map((banner, i) =>
        <swiper-slide key={i} lazy={i === 0 ? false : true} class={`w-full h-full bg-white dark:bg-slate-800`}>{
          <Link href={banner.href} aria-label={banner.link_label} className={`cursor-pointer flex h-full w-full relative`}>
            {/* <NextImage media={banner.image.data.attributes} height={480} width={1280} /> */}
            <Image
              // layout='responsive' 
              className={`object-contain px-1`}
              // width={1980}
              // height={600}
              fill
              priority={i === 1 ? true : false}
              src={getStrapiMedia(banner.image.data.attributes.url)}
              alt={banner.image.data.attributes.alternativeText || ""}
              quality={75}
              aria-label={banner.image.data.attributes.alternativeText || ""}
              blurDataURL={getStrapiMedia(banner.image.data.attributes.url)}
              placeholder="blur"
            ></Image>
          </Link>}
        </swiper-slide>
      )}
    </swiper-container>
  );

}

export default HeroCarousel