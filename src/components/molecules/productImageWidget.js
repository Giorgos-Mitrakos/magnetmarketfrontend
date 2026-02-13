'use client'
import { useState, useRef, useCallback, useEffect, useMemo } from 'react';
import { register } from 'swiper/element/bundle';
import { FaRegImage } from 'react-icons/fa6';
import { getStrapiMedia } from '@/repositories/medias';
import Image from 'next/image';
import { usePathname } from 'next/navigation';

register();

const ProductImageWidget = ({ images }) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [loadedImages, setLoadedImages] = useState(() => {
    // Lazy initialization - τρέχει μόνο στο πρώτο render
    const initial = {};
    images?.forEach((_, index) => {
      initial[index] = false;
    });
    return initial;
  });
  
  const mainSwiperRef = useRef(null);
  const thumbSwiperRef = useRef(null);
  const pathname = usePathname();
  const prevPathnameRef = useRef(pathname);
  const prevImagesLengthRef = useRef(images?.length);

  // Memoize image URLs για να μην ξανά-υπολογίζονται
  const imageUrls = useMemo(() => {
    return images?.map(item => ({
      main: item.formats?.small?.url || item.formats?.thumbnail?.url || item.url,
      thumb: item.formats?.thumbnail?.url || item.formats?.small?.url || item.url,
      alt: item.alternativeText
    })) || [];
  }, [images?.length]); // Μόνο length, όχι ολόκληρο το array

  // Reset ΜΟΝΟ αν άλλαξε το pathname Ή ο αριθμός εικόνων
  useEffect(() => {
    const pathnameChanged = prevPathnameRef.current !== pathname;
    const imagesCountChanged = prevImagesLengthRef.current !== images?.length;
    
    if (pathnameChanged || imagesCountChanged) {
      setActiveIndex(0);
      
      // Reset loaded images
      const initial = {};
      images?.forEach((_, index) => {
        initial[index] = false;
      });
      setLoadedImages(initial);
      
      // Reset swipers
      if (mainSwiperRef.current?.swiper) {
        mainSwiperRef.current.swiper.slideTo(0, 0); // 0 = instant, no animation
      }
      if (thumbSwiperRef.current?.swiper) {
        thumbSwiperRef.current.swiper.slideTo(0, 0);
      }
      
      prevPathnameRef.current = pathname;
      prevImagesLengthRef.current = images?.length;
    }
  }, [pathname, images?.length]);

  const handleThumbClick = useCallback((index) => {
    setActiveIndex(index);
    mainSwiperRef.current?.swiper?.slideTo(index);
  }, []);

  const handleSlideChange = useCallback((swiper) => {
    setActiveIndex(swiper.activeIndex);
    thumbSwiperRef.current?.swiper?.slideTo(swiper.activeIndex);
  }, []);

  const handleImageLoad = useCallback((index) => {
    setLoadedImages(prev => {
      // Αν ήδη loaded, μην κάνεις update
      if (prev[index] === true) return prev;
      return { ...prev, [index]: true };
    });
  }, []);

  const handleImageError = useCallback((index) => {
    console.error(`Failed to load image ${index}`);
    setLoadedImages(prev => {
      if (prev[index] === true) return prev;
      return { ...prev, [index]: true };
    });
  }, []);

  // Initialize swipers - τρέχει μόνο άπαξ
  useEffect(() => {
    if (!mainSwiperRef.current || mainSwiperRef.current.swiper) return;
    
    const imagesCount = images?.length;
    if (!imagesCount) return;

    Object.assign(mainSwiperRef.current, {
      spaceBetween: 0,
      slidesPerView: 1,
      zoom: true,
      effect: 'fade',
      loop: imagesCount > 2,
      on: {
        slideChange: (swiper) => handleSlideChange(swiper)
      }
    });
    mainSwiperRef.current.initialize();
  }, []); // Empty deps - initialize once

  useEffect(() => {
    if (!thumbSwiperRef.current || thumbSwiperRef.current.swiper) return;
    if (!images?.length || images.length <= 1) return;

    Object.assign(thumbSwiperRef.current, {
      spaceBetween: 8,
      slidesPerView: 'auto',
      freeMode: true,
      watchSlidesProgress: true,
    });
    thumbSwiperRef.current.initialize();
  }, []); // Empty deps - initialize once

  if (!images || images.length === 0) {
    return (
      <div className="flex justify-center items-center h-96 text-gray-400 dark:text-gray-600">
        <FaRegImage className="h-24 w-24" />
      </div>
    );
  }

  const allImagesLoaded = Object.values(loadedImages).every(loaded => loaded);

  return (
    <div className="w-full max-w-full overflow-hidden">
      <div className="relative h-64 sm:h-80 md:h-96 mb-4 rounded-lg overflow-hidden bg-white dark:bg-gray-800">
        {!allImagesLoaded && (
          <div className="absolute inset-0 flex items-center justify-center z-10 bg-gray-100 dark:bg-gray-800">
            <div className="animate-pulse flex flex-col items-center">
              <FaRegImage className="h-12 w-12 text-gray-400 dark:text-gray-600 mb-2" />
              <span className="text-gray-500 dark:text-gray-400">Φόρτωση εικόνας...</span>
            </div>
          </div>
        )}
        
        <swiper-container
          ref={mainSwiperRef}
          init={false}
          class="h-full w-full"
        >
          {imageUrls.map((img, index) => (
            <swiper-slide key={`main-${index}`} lazy="true">
              <div className="swiper-zoom-container h-full w-full relative">
                <Image
                  src={getStrapiMedia(img.main)}
                  alt={img.alt || `Product image ${index + 1}`}
                  fill
                  className="object-contain"
                  quality={85}
                  priority={index === 0}
                  sizes="100vw"
                  onLoad={() => handleImageLoad(index)}
                  onError={() => handleImageError(index)}
                  unoptimized={false}
                />
              </div>
            </swiper-slide>
          ))}
        </swiper-container>
        
        {images.length > 1 && (
          <>
            <div className="absolute top-1/2 left-2 transform -translate-y-1/2 z-20">
              <button 
                className="bg-white dark:bg-gray-700 p-2 rounded-full shadow-md hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                onClick={() => mainSwiperRef.current?.swiper?.slidePrev()}
                aria-label="Προηγούμενη εικόνα"
              >
                ←
              </button>
            </div>
            <div className="absolute top-1/2 right-2 transform -translate-y-1/2 z-20">
              <button 
                className="bg-white dark:bg-gray-700 p-2 rounded-full shadow-md hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                onClick={() => mainSwiperRef.current?.swiper?.slideNext()}
                aria-label="Επόμενη εικόνα"
              >
                →
              </button>
            </div>
          </>
        )}
      </div>

      {images.length > 1 && (
        <div className="px-2">
          <swiper-container
            ref={thumbSwiperRef}
            init={false}
            class="thumbnail-swiper"
          >
            {imageUrls.map((img, index) => (
              <swiper-slide key={`thumb-${index}`} style={{ width: '80px', height: '80px' }}>
                <button
                  onClick={() => handleThumbClick(index)}
                  className={`w-full h-full relative rounded-md overflow-hidden border-2 transition-all duration-200 ${
                    activeIndex === index
                      ? 'border-blue-500 dark:border-blue-400 shadow-md'
                      : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                  }`}
                  aria-label={`Εμφάνιση εικόνας ${index + 1}`}
                >
                  <Image
                    src={getStrapiMedia(img.thumb)}
                    alt={img.alt || `Μικρογραφία ${index + 1}`}
                    fill
                    className="object-cover"
                    quality={60}
                    sizes="80px"
                    unoptimized={false}
                  />
                </button>
              </swiper-slide>
            ))}
          </swiper-container>
        </div>
      )}
    </div>
  );
};

export default ProductImageWidget;