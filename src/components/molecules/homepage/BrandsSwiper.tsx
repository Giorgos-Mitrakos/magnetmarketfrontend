'use client'
import { memo } from 'react'
import { Swiper, SwiperSlide } from 'swiper/react'
import Image from 'next/image'
import Link from 'next/link'
import { Autoplay, Navigation } from 'swiper/modules'

// Import Swiper styles
import 'swiper/css'
import 'swiper/css/navigation'

// Processed brand interface (από server)
interface ProcessedBrand {
    id: string
    name: string
    slug: string
    logoUrl: string | null
    logoAlt: string
}

interface BrandsSwiperProps {
    brands: ProcessedBrand[]
}

// Main Client Component - ΙΔΙΑ εμφάνιση
const BrandsSwiper = memo(({ brands }: BrandsSwiperProps) => {
    if (!brands || brands.length === 0) {
        return null
    }

    return (
        <>
            <Swiper
                className="brands-swiper"
                breakpoints={{
                    0: {
                        slidesPerView: 2,
                        spaceBetween: 20,
                    },
                    480: {
                        slidesPerView: 3,
                        spaceBetween: 25,
                    },
                    640: {
                        slidesPerView: 4,
                        spaceBetween: 25,
                    },
                    768: {
                        slidesPerView: 5,
                        spaceBetween: 30,
                    },
                    1024: {
                        slidesPerView: 6,
                        spaceBetween: 30,
                    },
                    1280: {
                        slidesPerView: 7,
                        spaceBetween: 35,
                    },
                    1536: {
                        slidesPerView: 8,
                        spaceBetween: 35,
                    },
                }}
                navigation={{
                    nextEl: '.brands-swiper-next',
                    prevEl: '.brands-swiper-prev',
                }}
                autoplay={{
                    delay: 2000,
                    disableOnInteraction: false,
                    pauseOnMouseEnter: true,
                }}
                loop={false}
                modules={[Autoplay, Navigation]}
                speed={800}
            >
                {brands.map(brand => (
                    <SwiperSlide key={brand.id} className="flex items-center justify-center">
                        <Link
                            href={`/brands/${brand.slug}`}
                            aria-label={`Link σε προϊόντα του κατασκευάστή ${brand.name}`}
                            className="relative h-28 w-28 flex items-center justify-center transition-all duration-300 hover:scale-110 group"
                        >
                            {brand.logoUrl ? (
                                <Image
                                    className="object-contain opacity-90 group-hover:opacity-100 transition-opacity duration-300"
                                    height={112}
                                    width={112}
                                    src={brand.logoUrl}
                                    alt={brand.logoAlt}
                                    quality={80}
                                    blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R7eR5nN0Y3t7OxdWD+H1D/2Q=="
                                    placeholder="blur"
                                    loading="lazy"
                                />
                            ) : (
                                <div className="w-20 h-20 bg-slate-200 dark:bg-slate-600 rounded flex items-center justify-center text-slate-400 dark:text-slate-500 text-xs">
                                    No Logo
                                </div>
                            )}
                        </Link>
                    </SwiperSlide>
                ))}
            </Swiper>

            {/* Custom navigation buttons - ΙΔΙΑ όπως πριν */}
            <button className="brands-swiper-prev absolute left-2 top-1/2 transform -translate-y-1/2 z-10 bg-white dark:bg-slate-700 rounded-full w-10 h-10 flex items-center justify-center shadow-md hover:bg-siteColors-purple hover:text-white transition-colors duration-300 border border-slate-200 dark:border-slate-600">
                &lt;
            </button>
            <button className="brands-swiper-next absolute right-2 top-1/2 transform -translate-y-1/2 z-10 bg-white dark:bg-slate-700 rounded-full w-10 h-10 flex items-center justify-center shadow-md hover:bg-siteColors-purple hover:text-white transition-colors duration-300 border border-slate-200 dark:border-slate-600">
                &gt;
            </button>
        </>
    )
})

BrandsSwiper.displayName = 'BrandsSwiper'

export default BrandsSwiper