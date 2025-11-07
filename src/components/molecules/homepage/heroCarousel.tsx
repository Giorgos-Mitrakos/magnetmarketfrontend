'use client';

import { Swiper, SwiperSlide } from 'swiper/react';
import Link from 'next/link';
import Image from 'next/image';
import { getStrapiMedia } from '@/repositories/medias';
import { EffectFade, Autoplay, Pagination, Navigation } from 'swiper/modules';
import { IHeroCarouselBanner } from '@/lib/queries/homepage';
import { HiChevronLeft, HiChevronRight, HiPlay, HiPause } from 'react-icons/hi';
import { useRef, useState, useCallback, useMemo } from 'react';
import type { Swiper as SwiperType } from 'swiper';

import 'swiper/css';
import 'swiper/css/effect-fade';
import 'swiper/css/pagination';
import 'swiper/css/navigation';

interface HeroCarouselProps {
  carousel: IHeroCarouselBanner[];
  autoplayDelay?: number;
  showControls?: boolean;
  className?: string;
}

const HeroCarousel = ({
  carousel,
  autoplayDelay = 5000,
  showControls = true,
  className = ''
}: HeroCarouselProps) => {
  const swiperRef = useRef<SwiperType | null>(null);
  const [isPlaying, setIsPlaying] = useState(true);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  // Memoize processed carousel data
  const processedCarousel = useMemo(() => {
    return carousel?.map((banner, index) => ({
      ...banner,
      imageUrl: getStrapiMedia(banner.image.url),
      thumbnailUrl: getStrapiMedia(banner.image.formats?.thumbnail?.url || banner.image.url),
      alt: banner.image.alternativeText || banner.link_label || `Banner ${index + 1}`,
      priority: index === 0
    })) || [];
  }, [carousel]);

  const handleSlideChange = useCallback((swiper: SwiperType) => {
    setCurrentSlide(swiper.realIndex);
  }, []);

  const handleSwiperInit = useCallback((swiper: SwiperType) => {
    swiperRef.current = swiper;
    setIsLoading(false);
  }, []);

  const toggleAutoplay = useCallback(() => {
    if (swiperRef.current) {
      if (isPlaying) {
        swiperRef.current.autoplay.stop();
      } else {
        swiperRef.current.autoplay.start();
      }
      setIsPlaying(!isPlaying);
    }
  }, [isPlaying]);

  const goToSlide = useCallback((index: number) => {
    swiperRef.current?.slideToLoop(index);
  }, []);

  const goToPrev = useCallback(() => {
    swiperRef.current?.slidePrev();
  }, []);

  const goToNext = useCallback(() => {
    swiperRef.current?.slideNext();
  }, []);

  if (!processedCarousel.length) {
    return (
      <div className={`w-full h-96 border-2 border-dashed border-gray-300 dark:border-gray-600 flex items-center justify-center rounded-xl ${className}`}>
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 border border-gray-300 dark:border-gray-600 rounded-lg flex items-center justify-center">
            <svg className="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 0 0 1.5-1.5V6a1.5 1.5 0 0 0-1.5-1.5H3.75A1.5 1.5 0 0 0 2.25 6v12a1.5 1.5 0 0 0 1.5 1.5Zm10.5-11.25h.008v.008h-.008V8.25Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" />
            </svg>
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400">No banners available</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`relative group overflow-hidden rounded-xl shadow-2xl h-full ${className}`}>
      {/* Loading state */}
      {isLoading && (
        <div className="absolute inset-0 z-20 flex items-center justify-center rounded-xl">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      )}

      <Swiper
        onSwiper={handleSwiperInit}
        onSlideChange={handleSlideChange}
        className="hero-swiper h-full w-full shadow-2xl"
        slidesPerView={1}
        spaceBetween={0}
        autoplay={{
          delay: autoplayDelay,
          disableOnInteraction: false,
          pauseOnMouseEnter: true,
        }}
        pagination={{
          clickable: true,
          dynamicBullets: true,
          bulletActiveClass: 'swiper-pagination-bullet-active',
          renderBullet: (index, className) => {
            return `<button class="${className}" aria-label="Go to slide ${index + 1}" data-slide="${index}"></button>`;
          },
        }}
        navigation={{
          prevEl: '.hero-prev-btn',
          nextEl: '.hero-next-btn',
        }}
        modules={[EffectFade, Autoplay, Pagination, Navigation]}
        effect="fade"
        fadeEffect={{ crossFade: true }}
        loop={processedCarousel.length > 1}
        speed={800}
        watchSlidesProgress={true}
        keyboard={{
          enabled: true,
          onlyInViewport: true,
        }}
        a11y={{
          prevSlideMessage: 'Previous slide',
          nextSlideMessage: 'Next slide',
          firstSlideMessage: 'This is the first slide',
          lastSlideMessage: 'This is the last slide',
        }}
      >
        {processedCarousel.map((banner, index) => (
          <SwiperSlide
            key={banner.id || index}
            className="w-full h-full relative"
          >
            <Link
              href={banner.href}
              aria-label={banner.link_label || `View ${banner.title}`}
              className="block h-full w-full relative group/slide focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded-xl"
            >
              {/* Main Image */}
              <div className="relative h-full w-full">
                <Image
                  className="object-fill transition-transform duration-700 ease-out group-hover/slide:scale-105 rounded-xl"
                  priority={banner.priority}
                  loading={banner.priority ? 'eager' : 'lazy'}
                  src={banner.imageUrl || '/placeholder-image.jpg'}
                  alt={banner.alt}
                  quality={85}
                  fill
                  placeholder={banner.thumbnailUrl ? 'blur' : 'empty'}
                  blurDataURL={banner.thumbnailUrl || undefined}
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 90vw, 80vw"
                  onError={(e) => {
                    console.warn(`Failed to load image: ${banner.imageUrl}`);
                    const target = e.target as HTMLImageElement;
                    target.src = '/placeholder-image.jpg';
                    target.onerror = null; // Prevent infinite loop
                  }}
                />


              </div>
            </Link>
          </SwiperSlide>
        ))}
      </Swiper>

      {/* Enhanced Controls */}
      {showControls && processedCarousel.length > 1 && (
        <>
          {/* Navigation Arrows */}
          <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 ease-in-out">
            <button
              className="hero-prev-btn absolute left-4 top-1/2 -translate-y-1/2 z-10 bg-white/90 hover:bg-white shadow-xl text-gray-800 p-3 rounded-full transition-all duration-200 hover:scale-110 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed backdrop-blur-sm border border-white/20"
              onClick={goToPrev}
              aria-label="Previous slide"
            >
              <HiChevronLeft className="text-xl" />
            </button>
            <button
              className="hero-next-btn absolute right-4 top-1/2 -translate-y-1/2 z-10 bg-white/90 hover:bg-white shadow-xl text-gray-800 p-3 rounded-full transition-all duration-200 hover:scale-110 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed backdrop-blur-sm border border-white/20"
              onClick={goToNext}
              aria-label="Next slide"
            >
              <HiChevronRight className="text-xl" />
            </button>
          </div>

          {/* Play/Pause Button */}
          <button
            className="absolute top-4 right-4 z-10 bg-white/90 hover:bg-white shadow-xl text-gray-800 p-2.5 rounded-full transition-all duration-200 hover:scale-110 focus:outline-none focus:ring-2 focus:ring-blue-500 opacity-0 group-hover:opacity-100 backdrop-blur-sm border border-white/20"
            onClick={toggleAutoplay}
            aria-label={isPlaying ? 'Pause autoplay' : 'Start autoplay'}
          >
            {isPlaying ? (
              <HiPause className="text-lg" />
            ) : (
              <HiPlay className="text-lg ml-0.5" />
            )}
          </button>

          {/* Slide Counter */}
          <div className="absolute top-4 left-4 z-10 bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-full text-sm font-medium text-gray-800 shadow-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 border border-white/20">
            {currentSlide + 1} / {processedCarousel.length}
          </div>

        </>
      )}
    </div>
  );
};

export default HeroCarousel;