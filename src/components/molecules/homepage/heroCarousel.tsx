// components/molecules/homepage/heroCarousel.tsx
'use client';

import { Swiper, SwiperSlide } from 'swiper/react';
import ResponsiveImage from './responsiveImage';
import { EffectFade, Autoplay, Pagination, Navigation } from 'swiper/modules';
import { IHeroSlide } from '@/lib/queries/homepage';
import { HiChevronLeft, HiChevronRight, HiPlay, HiPause } from 'react-icons/hi';
import { useRef, useState, useCallback, useMemo, useEffect } from 'react';
import type { Swiper as SwiperType } from 'swiper';
import { TrackableLink } from '@/components/atoms/TrackableLink'; 

import 'swiper/css';
import 'swiper/css/effect-fade';
import 'swiper/css/pagination';
import 'swiper/css/navigation';

interface HeroCarouselProps {
  carousel: IHeroSlide[];
  autoplayDelay?: number;
  showControls?: boolean;
  className?: string;
  trackingLocation?: string;
  /** Το πρώτο banner φορτώνει αμέσως (όταν το carousel είναι το πρώτο block της σελίδας) */
  priority?: boolean;
}

const HeroCarousel = ({
  carousel,
  autoplayDelay = 5000,
  showControls = true,
  className = '',
  trackingLocation = 'homepage_hero',
  priority = true
}: HeroCarouselProps) => {
  const swiperRef = useRef<SwiperType | null>(null);
  const [isPlaying, setIsPlaying] = useState(true);
  const [currentSlide, setCurrentSlide] = useState(0);

  // Memoize processed carousel data
  const processedCarousel = useMemo(() => {
    return carousel?.map((banner, index) => ({
      ...banner,
      alt: banner.image.alternativeText || banner.title || banner.link_label || `Banner ${index + 1}`,
      priority: priority && index === 0
    })) || [];
  }, [carousel]);

  // (2026-11-24) Το πρώτο banner εμφανίζεται ΑΜΕΣΩΣ ως απλή εικόνα (από το HTML) και το Swiper
  // ενεργοποιείται από πάνω του όταν ο browser ελευθερωθεί. Πριν το Swiper, με το «στήσιμο» του
  // loop και το fade-in, ξανα-ζωγράφιζε την εικόνα ~1,8″ αργότερα (PageSpeed: «Element render delay»).
  // Με ένα μόνο banner δεν φορτώνει καθόλου Swiper.
  const [swiperReady, setSwiperReady] = useState(false);
  useEffect(() => {
    if (processedCarousel.length < 2) return;
    const w = window as Window & {
      requestIdleCallback?: (cb: () => void, opts?: { timeout: number }) => number
      cancelIdleCallback?: (id: number) => void
    };
    if (w.requestIdleCallback) {
      const id = w.requestIdleCallback(() => setSwiperReady(true), { timeout: 3000 });
      return () => w.cancelIdleCallback?.(id);
    }
    const t = setTimeout(() => setSwiperReady(true), 1500);
    return () => clearTimeout(t);
  }, [processedCarousel.length]);

  const handleSlideChange = useCallback((swiper: SwiperType) => {
    setCurrentSlide(swiper.realIndex);
  }, []);

  const handleSwiperInit = useCallback((swiper: SwiperType) => {
    swiperRef.current = swiper;
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
      {/* (2026-10-26) Χωρίς spinner πάνω από το πρώτο banner: η εικόνα είναι ήδη στο HTML */}

      {/* (2026-11-24) Σταθερό πρώτο banner — μένει από κάτω και όταν ανοίξει το Swiper (ίδια εικόνα, χωρίς «αναβόσβημα») */}
      <div className="absolute inset-0" aria-hidden={swiperReady || undefined}>
        <ResponsiveImage
          image={processedCarousel[0].image}
          mobileImage={processedCarousel[0].mobile_image}
          alt={processedCarousel[0].alt}
          fill
          priority={processedCarousel[0].priority}
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 90vw, 80vw"
          className="object-cover rounded-xl"
        />
        {!swiperReady && processedCarousel[0].href && (
          <TrackableLink
            href={processedCarousel[0].href}
            target={processedCarousel[0].open_in_new_tab ? '_blank' : undefined}
            className="absolute inset-0 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            bannerId={`banner_${processedCarousel[0].id || 0}`}
            bannerName={processedCarousel[0].title || processedCarousel[0].link_label || 'Banner 1'}
            bannerPosition={`${trackingLocation}_slide_0`}
            bannerType="hero"
          >
            <span className="sr-only">{processedCarousel[0].alt}</span>
          </TrackableLink>
        )}
      </div>

      {swiperReady && (
      <div className="absolute inset-0">
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
            {(() => {
              const img = (
                <div className="relative h-full w-full">
                  <ResponsiveImage
                    image={banner.image}
                    mobileImage={banner.mobile_image}
                    alt={banner.alt}
                    fill
                    priority={false}
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 90vw, 80vw"
                    // (2026-11-24) object-cover: εικόνα με άλλη αναλογία κόβεται λίγο στις άκρες αντί να παραμορφώνεται
                    className="object-cover transition-transform duration-700 ease-out group-hover/slide:scale-105 rounded-xl"
                  />
                </div>
              )
              if (!banner.href) return <div className="block h-full w-full relative">{img}</div>
              return (
                <TrackableLink
                  href={banner.href}
                  target={banner.open_in_new_tab ? '_blank' : undefined}
                  className="block h-full w-full relative group/slide focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded-xl"
                  bannerId={`banner_${banner.id || index}`}
                  bannerName={banner.title || banner.link_label || `Banner ${index + 1}`}
                  bannerPosition={`${trackingLocation}_slide_${index}`}
                  bannerType="hero"
                >
                  {img}
                </TrackableLink>
              )
            })()}
          </SwiperSlide>
        ))}
      </Swiper>
      </div>
      )}

      {/* Controls */}
      {showControls && swiperReady && processedCarousel.length > 1 && (
        <>
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

          <div className="absolute top-4 left-4 z-10 bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-full text-sm font-medium text-gray-800 shadow-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 border border-white/20">
            {currentSlide + 1} / {processedCarousel.length}
          </div>
        </>
      )}
    </div>
  );
};

export default HeroCarousel;