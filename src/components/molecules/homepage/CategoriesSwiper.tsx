'use client'
import { memo } from 'react'
import { Swiper, SwiperSlide } from 'swiper/react'
import Image from "next/image"
import Link from "next/link"
import { FaRegImage } from "react-icons/fa"
import { Autoplay, Pagination } from 'swiper/modules'

// Import Swiper styles
import 'swiper/css'
import 'swiper/css/pagination'

interface ProcessedCategory {
  id: string
  name: string
  link: string
  imageUrl: string | null
  imageAlt: string
}

interface CategoriesSwiperProps {
  categories: ProcessedCategory[]
}

const CategorySlide = memo(({ category }: { category: ProcessedCategory }) => (
  <div className="flex flex-col items-center p-4 h-full">
    <Link href={category.link} className="group block w-full h-full" prefetch={false}>
      <div className="flex flex-col items-center justify-center h-full transition-all duration-300 ease-in-out transform group-hover:scale-105">
        <div className="relative flex items-center justify-center w-32 h-32 mb-4 rounded-full bg-white shadow-lg group-hover:shadow-xl transition-all duration-300 ring-2 ring-white/50">
          {category.imageUrl ? (
            <Image
              height={72}
              width={72}
              src={category.imageUrl}
              alt={category.imageAlt}
              quality={80}
              className="transition-transform duration-300 group-hover:scale-110 object-contain p-1"
              placeholder="blur"
              blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R7eR5nN0Y3t7OxdWD+H1D/2Q=="
              loading="lazy"
            />
          ) : (
            <FaRegImage className="w-10 h-10 text-siteColors-blue/70 dark:text-siteColors-purple/70" />
          )}
        </div>
        <h3 className="text-center text-white dark:text-slate-100 font-medium text-sm leading-tight group-hover:text-white transition-colors duration-300 line-clamp-2 min-h-[2.5rem] flex items-center justify-center px-1 w-28">
          {category.name}
        </h3>
      </div>
    </Link>
  </div>
))

CategorySlide.displayName = 'CategorySlide'

const CategoriesSwiper = memo(({ categories }: CategoriesSwiperProps) => {
  if (!categories || categories.length === 0) {
    return null
  }

  return (
    <div className="w-full">
      <Swiper
        slidesPerView={2}
        spaceBetween={16}
        className="w-full pb-10"
        pagination={{
          clickable: true,
          dynamicBullets: true,
          renderBullet: (index, className) => {
            return `<span class="${className} bg-white/70 w-2 h-2 mx-1 inline-block rounded-full transition-all duration-300"></span>`
          }
        }}
        autoplay={{
          delay: 3000,
          disableOnInteraction: false,
        }}
        modules={[Autoplay, Pagination]}
        breakpoints={{
          480: { slidesPerView: 3, spaceBetween: 16 },
          640: { slidesPerView: 4, spaceBetween: 16 },
          768: { slidesPerView: 5, spaceBetween: 20 },
          1024: { slidesPerView: 6, spaceBetween: 20 },
          1280: { slidesPerView: 7, spaceBetween: 24 },
          1536: { slidesPerView: 8, spaceBetween: 24 },
        }}
      >
        {categories.map(category => (
          <SwiperSlide key={category.id} className="!h-auto">
            <CategorySlide category={category} />
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  )
})

CategoriesSwiper.displayName = 'CategoriesSwiper'

export default CategoriesSwiper