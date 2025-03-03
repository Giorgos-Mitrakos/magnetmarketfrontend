'use client'
import { Swiper, SwiperSlide } from 'swiper/react';
import Link from 'next/link';
import Image from 'next/image';
import { getStrapiMedia } from '@/repositories/medias';
import { EffectFade, Autoplay, Pagination } from 'swiper/modules';

import 'swiper/css';
import 'swiper/css/effect-fade';
import 'swiper/css/pagination';
import Head from 'next/head';

const HeroCarousel = ({ carousel }) => {

  return (
    <>
      <Head>
        <Link rel='preload' href={carousel[0].image.data.attributes.url} />
      </Head>
      <Swiper
        init={true}
        className="mySwiper h-full"
        slidesPerView={1}
        autoplay={{
          delay: 4000,
          disableOnInteraction: false,
        }}
        pagination={{
          clickable: true,
        }}
        modules={[EffectFade, Autoplay, Pagination]}
        effect="fade"
      >
        {carousel.map((banner, i) =>
          <SwiperSlide key={i} className={`w-full h-full bg-white dark:bg-slate-800`}>{
            <Link href={banner.href} aria-label={banner.link_label} className={`cursor-pointer flex h-full w-full relative`}>
              <Image
                // layout='responsive' 
                className={`object-contain px-1`}
                width={1600}
                height={600}
                // fill
                priority={i === 0 ? true : false}
                loading={i === 0 ? 'eager' : 'lazy'}
                src={getStrapiMedia(banner.image.data.attributes.url)}
                alt={banner.image.data.attributes.alternativeText || ""}
                quality={75}
                aria-label={banner.image.data.attributes.alternativeText || ""}
                blurDataURL={getStrapiMedia(banner.image.data.attributes.url)}
                placeholder="blur"
                sizes="(max-width: 980px) 50vw,(max-width: 1400px) 25vw, 50vw"
              ></Image>
            </Link>}
          </SwiperSlide>
        )}
      </Swiper>
    </>
  );

}

export default HeroCarousel