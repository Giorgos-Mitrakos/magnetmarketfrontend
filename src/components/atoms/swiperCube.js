'use client'

import { useRef, useEffect } from 'react';
import { register } from 'swiper/element/bundle';

register();

export const SwiperCube = ({ image }) => {
  const swiperElRef = useRef(null);

  useEffect(() => {
    // listen for Swiper events using addEventListener
    swiperElRef.current.addEventListener('progress', (e) => {
      const [swiper, progress] = e.detail;
    });

    swiperElRef.current.addEventListener('slidechange', (e) => {
      // console.log('slide changed');
    });
  }, []);

  return (
    <div className='container'>
      <swiper-container
        class="mySwiper w-56 h-56 my-8 justify-self-center"
        ref={swiperElRef}
        effect="cube"
        pagination="true"
        grab-cursor="true" cube-effect-shadow="false"
        cube-effect-slide-shadows="true"
      >
        <swiper-slide class='bg-center bg-cover'>{image}</swiper-slide>
        <swiper-slide class='bg-center bg-cover'>{image}</swiper-slide>
        <swiper-slide class='bg-center bg-cover'>{image}</swiper-slide>
      </swiper-container>
    </div>
  );
};