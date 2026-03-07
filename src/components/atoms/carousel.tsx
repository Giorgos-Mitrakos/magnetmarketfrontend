// components/atoms/carousel.tsx
'use client'

import { useRef } from 'react'
import { Swiper, SwiperSlide } from 'swiper/react'
import { Navigation } from 'swiper/modules'
import type { Swiper as SwiperType } from 'swiper'
import ProductCard from '@/components/organisms/productCard'
import { IProductCard } from '@/lib/interfaces/product'
import { HiChevronLeft, HiChevronRight } from 'react-icons/hi'

import 'swiper/css'
import 'swiper/css/navigation'

interface CarouselProps {
  products: IProductCard[]
  listName?: string  // ✅ Νέο prop για tracking
  listId?: string    // ✅ Νέο prop για tracking
}

const Carousel = ({ 
  products, 
  listName = 'Products', 
  listId 
}: CarouselProps) => {
  const swiperRef = useRef<SwiperType | null>(null)

  if (!products || products.length === 0) {
    return (
      <div className="flex items-center justify-center h-[600px]">
        <p className="text-gray-500">No products available</p>
      </div>
    )
  }

  return (
    <div className="relative group">
      <Swiper
        onSwiper={(swiper) => (swiperRef.current = swiper)}
        modules={[Navigation]}
        spaceBetween={16}
        slidesPerView={1}
        breakpoints={{
          640: { slidesPerView: 2 },
          768: { slidesPerView: 3 },
          1024: { slidesPerView: 4 },
        }}
        navigation={{
          prevEl: '.carousel-prev-btn',
          nextEl: '.carousel-next-btn',
        }}
        className="!pb-4"
      >
        {products.map((product, index) => (
          <SwiperSlide key={product.id}>
            <ProductCard 
              product={product}
              listName={listName}   // ✅ Pass to ProductCard
              listId={listId}       // ✅ Pass to ProductCard  
              position={index}      // ✅ Pass position για tracking
            />
          </SwiperSlide>
        ))}
      </Swiper>

      {/* Navigation Buttons */}
      {products.length > 4 && (
        <>
          <button
            className="carousel-prev-btn absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white/90 hover:bg-white shadow-xl text-gray-800 p-3 rounded-full transition-all duration-200 hover:scale-110 opacity-0 group-hover:opacity-100 disabled:opacity-0"
            aria-label="Previous slide"
          >
            <HiChevronLeft className="text-xl" />
          </button>
          <button
            className="carousel-next-btn absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white/90 hover:bg-white shadow-xl text-gray-800 p-3 rounded-full transition-all duration-200 hover:scale-110 opacity-0 group-hover:opacity-100 disabled:opacity-0"
            aria-label="Next slide"
          >
            <HiChevronRight className="text-xl" />
          </button>
        </>
      )}
    </div>
  )
}

export default Carousel