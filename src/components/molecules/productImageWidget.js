'use client'
import { useState, useRef, useCallback, useEffect } from 'react';
import { register } from 'swiper/element/bundle';
import { FaRegImage } from 'react-icons/fa6';
import { getStrapiMedia } from '@/repositories/medias';
import Image from 'next/image';
import { usePathname } from 'next/navigation';

register();

const ProductImageWidget = ({ images }) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [loadedImages, setLoadedImages] = useState({});
  const mainSwiperRef = useRef(null);
  const thumbSwiperRef = useRef(null);
  const pathname = usePathname();

  // Reset state when the pathname changes (navigation occurs)
  useEffect(() => {
    // Reset all loading states when navigation occurs
    const initialLoadedState = {};
    images?.forEach((_, index) => {
      initialLoadedState[index] = false;
    });
    setLoadedImages(initialLoadedState);
    setActiveIndex(0);
    
    // Also reset swipers if they exist
    if (mainSwiperRef.current?.swiper) {
      mainSwiperRef.current.swiper.slideTo(0);
    }
    if (thumbSwiperRef.current?.swiper) {
      thumbSwiperRef.current.swiper.slideTo(0);
    }
  }, [pathname, images]);

  const handleThumbClick = useCallback((index) => {
    setActiveIndex(index);
    if (mainSwiperRef.current && mainSwiperRef.current.swiper) {
      mainSwiperRef.current.swiper.slideTo(index);
    }
  }, []);

  const handleSlideChange = useCallback((swiper) => {
    setActiveIndex(swiper.activeIndex);
    if (thumbSwiperRef.current && thumbSwiperRef.current.swiper) {
      thumbSwiperRef.current.swiper.slideTo(swiper.activeIndex);
    }
  }, []);

  const handleImageLoad = useCallback((index) => {
    setLoadedImages(prev => ({ ...prev, [index]: true }));
  }, []);

  const handleImageError = useCallback((index) => {
    setLoadedImages(prev => ({ ...prev, [index]: true }));
    console.error(`Failed to load image ${index}`);
  }, []);

  // Initialize swiper after component mounts
  useEffect(() => {
    if (mainSwiperRef.current && !mainSwiperRef.current.swiper) {
      Object.assign(mainSwiperRef.current, {
        spaceBetween: 0,
        slidesPerView: 1,
        zoom: true,
        effect: 'fade',
        loop: true,
        on: {
          slideChange: (swiper) => handleSlideChange(swiper)
        }
      });
      mainSwiperRef.current.initialize();
    }
  }, [handleSlideChange]);

  useEffect(() => {
    if (thumbSwiperRef.current && !thumbSwiperRef.current.swiper && images?.length > 1) {
      Object.assign(thumbSwiperRef.current, {
        spaceBetween: 8,
        slidesPerView: 'auto',
        freeMode: true,
        watchSlidesProgress: true,
      });
      thumbSwiperRef.current.initialize();
    }
  }, [images?.length]);

  // Initialize loaded images state
  useEffect(() => {
    if (images) {
      const initialLoadedState = {};
      images.forEach((_, index) => {
        initialLoadedState[index] = false;
      });
      setLoadedImages(initialLoadedState);
    }
  }, [images]);

  if (!images || images.length === 0) {
    return (
      <div className="flex justify-center items-center h-96 text-gray-400 dark:text-gray-600">
        <FaRegImage className="h-24 w-24" />
      </div>
    );
  }

  // Helper function to get image URL
  const getImageUrl = (item) => {
    if (!item) return null;
    
    const url = item.formats?.small?.url || 
                item.formats?.thumbnail?.url || 
                item.url;
    
    return getStrapiMedia(url);
  };

  // Helper function to get thumbnail URL
  const getThumbnailUrl = (item) => {
    if (!item) return null;
    
    const url = item.formats?.thumbnail?.url || 
                item.formats?.small?.url || 
                item.url;
    
    return getStrapiMedia(url);
  };

  // Check if all images are loaded
  const allImagesLoaded = Object.values(loadedImages).every(loaded => loaded);

  return (
    <div className="w-full">
      {/* Main Image Slider */}
      <div className="relative h-96 mb-4 rounded-lg overflow-hidden bg-white dark:bg-gray-800">
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
          class="h-full"
        >
          {images.map((item, index) => {
            const imageUrl = getImageUrl(item);
            if (!imageUrl) return null;
            
            return (
              <swiper-slide key={index} lazy="true">
                <div className="swiper-zoom-container h-96 relative">
                  <Image
                    src={imageUrl}
                    alt={item.alternativeText || `Product image ${index + 1}`}
                    fill
                    className="object-contain"
                    quality={85}
                    priority={index === 0}
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 40vw"
                    onLoad={() => handleImageLoad(index)}
                    onError={() => handleImageError(index)}
                  />
                </div>
              </swiper-slide>
            );
          })}
        </swiper-container>
        
        {/* Navigation Arrows */}
        {images.length > 1 && (
          <>
            <div className="absolute top-1/2 left-2 transform -translate-y-1/2 z-20">
              <button 
                className="bg-white dark:bg-gray-700 p-2 rounded-full shadow-md hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                onClick={() => mainSwiperRef.current?.swiper.slidePrev()}
                aria-label="Προηγούμενη εικόνα"
              >
                ←
              </button>
            </div>
            <div className="absolute top-1/2 right-2 transform -translate-y-1/2 z-20">
              <button 
                className="bg-white dark:bg-gray-700 p-2 rounded-full shadow-md hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                onClick={() => mainSwiperRef.current?.swiper.slideNext()}
                aria-label="Επόμενη εικόνα"
              >
                →
              </button>
            </div>
          </>
        )}
      </div>

      {/* Thumbnail Slider */}
      {images.length > 1 && (
        <div className="px-2">
          <swiper-container
            ref={thumbSwiperRef}
            init={false}
            class="thumbnail-swiper"
          >
            {images.map((item, index) => {
              const thumbUrl = getThumbnailUrl(item);
              if (!thumbUrl) return null;
              
              return (
                <swiper-slide key={index} style={{ width: '80px', height: '80px' }}>
                  <button
                    onClick={() => handleThumbClick(index)}
                    className={`w-full h-full relative rounded-md overflow-hidden border-2 transition-all duration-200 ${
                      activeIndex === index
                        ? 'border-blue-500 dark:border-blue-400 shadow-md'
                        : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                    }`}
                    aria-label={`Εμφάνιση εικόνας ${index + 1}`}
                    aria-current={activeIndex === index ? 'true' : 'false'}
                  >
                    <Image
                      src={thumbUrl}
                      alt={item.alternativeText || `Μικρογραφία ${index + 1}`}
                      fill
                      className="object-cover"
                      quality={60}
                      sizes="80px"
                      onLoad={() => handleImageLoad(index)}
                      onError={() => handleImageError(index)}
                    />
                  </button>
                </swiper-slide>
              );
            })}
          </swiper-container>
        </div>
      )}
    </div>
  );
};

export default ProductImageWidget;