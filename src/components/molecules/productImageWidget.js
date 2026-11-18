'use client'
import { useState, useRef, useCallback, useEffect, useMemo } from 'react';
import { register } from 'swiper/element/bundle';
import { FaRegImage, FaExpand, FaXmark, FaChevronLeft, FaChevronRight } from 'react-icons/fa6';
import { getStrapiMedia } from '@/repositories/medias';
import Image from 'next/image';
import { usePathname } from 'next/navigation';

register();

const ProductImageWidget = ({ images, productName = '' }) => {
  const [activeIndex, setActiveIndex] = useState(0);
  // (2026-10-22) Μεγέθυνση σε πλήρη οθόνη (null = κλειστό)
  const [lightbox, setLightbox] = useState(null);
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
    // (2026-10-22) Κύρια εικόνα σε μεγάλη ανάλυση (πριν: small ≈500px, θολή και
    // χωρίς νόημα το zoom) — το next/image τη μικραίνει όσο χρειάζεται
    return images?.map((item, index) => ({
      main: item.formats?.large?.url || item.url,
      full: item.url,
      thumb: item.formats?.thumbnail?.url || item.formats?.small?.url || item.url,
      // (2026-10-26) alternativeText που είναι απλώς όνομα αρχείου (π.χ. «12345_1.jpg») → το όνομα του προϊόντος
      alt: (item.alternativeText && !/\.(jpe?g|png|webp|gif|avif)$/i.test(item.alternativeText) ? item.alternativeText : null) || (productName ? `${productName} — εικόνα ${index + 1}` : `Εικόνα προϊόντος ${index + 1}`)
    })) || [];
  }, [images, productName]); // σταθερό reference από το ProductImageWidgetWrapper (useMemo)

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
  }, [pathname, images]);

  // Με loop το activeIndex του swiper δεν είναι η θέση της εικόνας — realIndex / slideToLoop
  const handleThumbClick = useCallback((index) => {
    setActiveIndex(index);
    const sw = mainSwiperRef.current?.swiper;
    if (sw) (sw.params?.loop ? sw.slideToLoop(index) : sw.slideTo(index));
  }, []);

  const handleSlideChange = useCallback((swiper) => {
    const index = swiper.realIndex ?? swiper.activeIndex;
    setActiveIndex(index);
    thumbSwiperRef.current?.swiper?.slideTo(index);
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

  const imagesCount = images?.length ?? 0;

  // Αρχικοποίηση των swipers μία φορά: αν έχουν ήδη αρχικοποιηθεί, το effect
  // δεν κάνει τίποτα (έλεγχος .swiper) — τα deps απλώς το ξανατρέχουν αν οι
  // εικόνες ήρθαν αργότερα
  useEffect(() => {
    if (!mainSwiperRef.current || mainSwiperRef.current.swiper) return;
    if (!imagesCount) return;

    Object.assign(mainSwiperRef.current, {
      spaceBetween: 0,
      slidesPerView: 1,
      zoom: true,
      effect: 'fade',
      // (2026-10-28) Χωρίς crossFade η προηγούμενη εικόνα μένει ορατή από κάτω (διάφανο φόντο)
      fadeEffect: { crossFade: true },
      loop: imagesCount > 2,
      on: {
        slideChange: (swiper) => handleSlideChange(swiper)
      }
    });
    mainSwiperRef.current.initialize();
  }, [imagesCount, handleSlideChange]);

  useEffect(() => {
    if (!thumbSwiperRef.current || thumbSwiperRef.current.swiper) return;
    if (imagesCount <= 1) return;

    Object.assign(thumbSwiperRef.current, {
      spaceBetween: 8,
      slidesPerView: 'auto',
      freeMode: true,
      watchSlidesProgress: true,
    });
    thumbSwiperRef.current.initialize();
  }, [imagesCount]);

  const total = imageUrls.length;
  const lbPrev = useCallback(() => setLightbox(i => (i == null ? i : (i - 1 + total) % total)), [total]);
  const lbNext = useCallback(() => setLightbox(i => (i == null ? i : (i + 1) % total)), [total]);
  const lbClose = useCallback(() => {
    setLightbox(i => {
      // Η κύρια εικόνα μένει στη θέση που έκλεισε η μεγέθυνση
      if (i != null) handleThumbClick(i);
      return null;
    });
  }, [handleThumbClick]);

  // Πλήκτρα (Esc, βελάκια) + κλείδωμα scroll όσο είναι ανοιχτή η μεγέθυνση
  useEffect(() => {
    if (lightbox == null) return;
    const onKey = (e) => {
      if (e.key === 'Escape') lbClose();
      else if (e.key === 'ArrowLeft') lbPrev();
      else if (e.key === 'ArrowRight') lbNext();
    };
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener('keydown', onKey);
    };
  }, [lightbox, lbClose, lbPrev, lbNext]);

  // Swipe στο κινητό
  const touchStartX = useRef(null);
  const onTouchStart = (e) => { touchStartX.current = e.touches?.[0]?.clientX ?? null; };
  const onTouchEnd = (e) => {
    if (touchStartX.current == null) return;
    const dx = (e.changedTouches?.[0]?.clientX ?? touchStartX.current) - touchStartX.current;
    touchStartX.current = null;
    if (Math.abs(dx) > 50) (dx > 0 ? lbPrev() : lbNext());
  };

  if (!images || images.length === 0) {
    return (
      <div className="flex justify-center items-center h-96 text-gray-400 dark:text-gray-600">
        <FaRegImage className="h-24 w-24" />
      </div>
    );
  }

  // (2026-10-22) Μόνο η ΠΡΩΤΗ εικόνα κρύβεται μέχρι να φορτώσει (πριν: όλες,
  // που καθυστερούσε την εμφάνιση της κύριας εικόνας)
  const firstImageLoaded = loadedImages[0] === true;

  return (
    <div className="w-full max-w-full overflow-hidden">
      <div className="relative h-64 sm:h-80 md:h-96 mb-4 rounded-lg overflow-hidden bg-white dark:bg-gray-800">
        {!firstImageLoaded && (
          <div className="absolute inset-0 flex items-center justify-center z-10 bg-gray-100 dark:bg-gray-800">
            <div className="animate-pulse flex flex-col items-center">
              <FaRegImage className="h-12 w-12 text-gray-400 dark:text-gray-600 mb-2" />
              <span className="text-gray-500 dark:text-gray-400">Φόρτωση εικόνας...</span>
            </div>
          </div>
        )}
        
        {/* (2026-10-28) React 19: το init={false} δεν γράφεται πλέον στο HTML του server και
            το swiper ξεκινούσε μόνο του (χωρίς τις ρυθμίσεις μας) → πρέπει να είναι κείμενο "false" */}
        <swiper-container
          ref={mainSwiperRef}
          init="false"
          class="h-full w-full"
        >
          {imageUrls.map((img, index) => (
            <swiper-slide key={`main-${index}`} lazy="true">
              <div
                className="swiper-zoom-container h-full w-full relative cursor-zoom-in"
                onClick={() => setLightbox(index)}
              >
                <Image
                  src={getStrapiMedia(img.main)}
                  alt={img.alt}
                  fill
                  className="object-contain"
                  quality={85}
                  priority={index === 0}
                  sizes="(min-width: 1024px) 38vw, (min-width: 768px) 50vw, 100vw"
                  onLoad={() => handleImageLoad(index)}
                  onError={() => handleImageError(index)}
                  unoptimized={false}
                />
              </div>
            </swiper-slide>
          ))}
        </swiper-container>
        
        <button
          type="button"
          className="absolute top-2 right-2 z-20 bg-white/90 dark:bg-gray-700/90 p-2 rounded-full shadow-md hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
          onClick={() => setLightbox(activeIndex)}
          aria-label="Μεγέθυνση εικόνας σε πλήρη οθόνη"
        >
          <FaExpand className="w-4 h-4 text-gray-700 dark:text-gray-200" />
        </button>

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
            init="false"
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
                    alt={`Μικρογραφία: ${img.alt}`}
                    fill
                    className="object-contain bg-white p-1"
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

      {/* (2026-10-22) Μεγέθυνση σε πλήρη οθόνη */}
      {lightbox != null && imageUrls[lightbox] && (
        <div
          className="fixed inset-0 z-[100] bg-black/90 flex items-center justify-center"
          role="dialog"
          aria-modal="true"
          aria-label="Εικόνες προϊόντος σε πλήρη οθόνη"
          onClick={lbClose}
          onTouchStart={onTouchStart}
          onTouchEnd={onTouchEnd}
        >
          <div className="relative w-full h-full max-w-6xl max-h-[90vh] m-4" onClick={(e) => e.stopPropagation()}>
            <Image
              key={imageUrls[lightbox].full}
              src={getStrapiMedia(imageUrls[lightbox].full)}
              alt={imageUrls[lightbox].alt}
              fill
              className="object-contain"
              sizes="100vw"
              quality={90}
            />
          </div>
          <button
            type="button"
            className="absolute top-4 right-4 p-3 rounded-full bg-white/10 hover:bg-white/20 text-white"
            onClick={lbClose}
            aria-label="Κλείσιμο"
          >
            <FaXmark className="w-6 h-6" />
          </button>
          {total > 1 && (
            <>
              <button
                type="button"
                className="absolute left-2 md:left-6 top-1/2 -translate-y-1/2 p-3 rounded-full bg-white/10 hover:bg-white/20 text-white"
                onClick={(e) => { e.stopPropagation(); lbPrev(); }}
                aria-label="Προηγούμενη εικόνα"
              >
                <FaChevronLeft className="w-6 h-6" />
              </button>
              <button
                type="button"
                className="absolute right-2 md:right-6 top-1/2 -translate-y-1/2 p-3 rounded-full bg-white/10 hover:bg-white/20 text-white"
                onClick={(e) => { e.stopPropagation(); lbNext(); }}
                aria-label="Επόμενη εικόνα"
              >
                <FaChevronRight className="w-6 h-6" />
              </button>
              <span className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white/80 text-sm">
                {lightbox + 1} / {total}
              </span>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default ProductImageWidget;